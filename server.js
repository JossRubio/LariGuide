import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';

// Resolve .env path relative to this file, not the CWD
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

const groqKey = process.env.GROQ_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;

if (!groqKey && !anthropicKey) {
  console.error('ERROR: No API keys found. Set GROQ_API_KEY and/or ANTHROPIC_API_KEY in .env');
  process.exit(1);
}
if (groqKey) console.log(`✦ Groq key loaded:      ${groqKey.slice(0, 8)}...${groqKey.slice(-4)}`);
if (anthropicKey) console.log(`✦ Anthropic key loaded: ${anthropicKey.slice(0, 8)}...${anthropicKey.slice(-4)}`);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

const SYSTEM_PROMPT = `Eres un experto planificador de viajes de lujo. Genera un itinerario detallado en español para el viaje especificado. Responde ÚNICAMENTE en JSON válido con esta estructura exacta (sin texto adicional, sin markdown, sin bloques de código):
{
  "resumen": {
    "presupuestoTotal": { "usd": number, "monedaLocal": string, "valorMonedaLocal": number, "nombreMoneda": string, "simbolo": string },
    "temporada": "baja" | "media" | "alta",
    "recomendaciones_generales": string[],
    "como_llegar": { "descripcion": string, "costo_estimado_usd": number }
  },
  "dias": [
    {
      "numero": number,
      "fecha": "YYYY-MM-DD",
      "titulo": string,
      "descripcion_del_dia": string,
      "actividades": [
        {
          "hora": "HH:MM",
          "nombre": string,
          "descripcion": string,
          "tipo": "atraccion" | "comida" | "transporte" | "alojamiento" | "compras" | "naturaleza",
          "duracion_horas": number,
          "costo_usd": number,
          "costo_moneda_local": number,
          "requiere_reservacion": boolean,
          "url_reservacion": string | null,
          "nombre_sitio_oficial": string | null,
          "nivel_concurrencia": "bajo" | "medio" | "alto",
          "mejor_hora_visita": string,
          "coordenadas": { "lat": number, "lng": number },
          "tips": string[]
        }
      ],
      "costo_total_dia_usd": number,
      "alojamiento_sugerido": { "nombre": string, "tipo": string, "costo_noche_usd": number, "descripcion": string }
    }
  ]
}`;

/**
 * Tries JSON.parse first. If that fails (truncated response), finds the last
 * complete "dia" object, slices there, and closes all open brackets/braces.
 */
function parseOrRepairJSON(raw) {
  try {
    return JSON.parse(raw);
  } catch (_) {
    // Fall through to repair
  }

  const closings = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '}') closings.push(i);
  }

  for (let i = closings.length - 1; i >= 0; i--) {
    const slice = raw.slice(0, closings[i] + 1);

    let braces = 0;
    let brackets = 0;
    let inString = false;
    let escaped = false;

    for (const ch of slice) {
      if (escaped) { escaped = false; continue; }
      if (ch === '\\' && inString) { escaped = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') braces++;
      else if (ch === '}') braces--;
      else if (ch === '[') brackets++;
      else if (ch === ']') brackets--;
    }

    const suffix = ']'.repeat(Math.max(0, brackets)) + '}'.repeat(Math.max(0, braces));
    const candidate = slice + suffix;

    try {
      const parsed = JSON.parse(candidate);
      console.log(`JSON repaired: sliced at position ${closings[i]}, closed ${brackets} brackets and ${braces} braces`);
      return parsed;
    } catch (_) {
      // Try next position
    }
  }

  throw new Error('No se pudo reparar el JSON truncado');
}

// ─── Itinerary endpoint ────────────────────────────────────────────────────────
app.post('/api/itinerary', async (req, res) => {
  const { origin, destination, startDate, endDate, budget, budgetEnabled, provider = 'groq' } = req.body;

  if (!destination || !startDate || !endDate) {
    return res.status(400).json({ error: 'Faltan campos requeridos: destination, startDate, endDate' });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  const userMessage = `
Origen: ${origin || 'No especificado'}
Destino: ${destination}
Fecha de inicio: ${start.toISOString().split('T')[0]}
Fecha de fin: ${end.toISOString().split('T')[0]}
Duración: ${days} días
${budgetEnabled && budget ? `Presupuesto: $${budget} USD` : 'Sin presupuesto definido'}

Genera el itinerario completo con coordenadas GPS reales, costos actualizados y URLs de reservación oficiales.
  `.trim();

  try {
    let text = '';

    if (provider === 'anthropic') {
      if (!anthropic) return res.status(400).json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor' });
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMessage }],
      });
      text = message.content[0].type === 'text' ? message.content[0].text : '';
      if (message.stop_reason === 'max_tokens') {
        console.warn('Warning: Anthropic response hit max_tokens, attempting JSON repair');
      }
    } else {
      if (!groq) return res.status(400).json({ error: 'GROQ_API_KEY no configurada en el servidor' });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 16000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      });
      text = completion.choices[0]?.message?.content || '';
      if (completion.choices[0]?.finish_reason === 'length') {
        console.warn('Warning: Groq response hit max_tokens, attempting JSON repair');
      }
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'La IA no devolvió JSON válido', raw: text });
    }

    const itinerary = parseOrRepairJSON(jsonMatch[0]);
    res.json(itinerary);
  } catch (error) {
    console.error(`Error calling ${provider} API:`, error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// ─── Seasonal recommendations endpoint ────────────────────────────────────────
app.get('/api/seasonal-recommendations', async (_req, res) => {
  const monthNames = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const currentMonth = monthNames[new Date().getMonth()];

  const buildPrompt = (seed) => `Estamos en ${currentMonth}. Genera un array JSON con EXACTAMENTE 9 destinos turísticos internacionales para visitar este mes desde Santiago de Chile (semilla: ${seed}). REGLA CRÍTICA: el array debe tener exactamente 9 elementos. Distribuye así:
1. Europa occidental (ej: Francia, Italia, España, Portugal)
2. Europa oriental o nórdica (ej: Hungría, Polonia, Grecia, Noruega)
3. Asia oriental (ej: Japón, Tailandia, Vietnam, Corea)
4. Asia del sur o Medio Oriente (ej: India, Emiratos, Jordania)
5. Oceanía o África (ej: Australia, Marruecos, Sudáfrica, Nueva Zelanda)
6. Norteamérica (ej: México, Canadá, Estados Unidos)
7. Caribe (ej: Cuba, República Dominicana, Jamaica)
8. Latinoamérica 1 (ej: Colombia, Perú, Argentina)
9. Latinoamérica 2 (ej: Brasil, Uruguay, Bolivia)
Responde ÚNICAMENTE con el array JSON, sin texto ni bloques de código:
[{"name":"...","country":"...","reason":"una oración por qué ${currentMonth} es ideal","estimatedPrice":1200,"season":"clima breve en ${currentMonth}","iconicAttraction":"atractivo más icónico (ej: Torre Eiffel, Machu Picchu)"}]`;

  const callGroq = async (seed) => {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'Eres un experto en turismo. Responde ÚNICAMENTE con un array JSON válido de exactamente 9 elementos. Sin texto adicional, sin bloques de código, sin explicaciones.' },
        { role: 'user', content: buildPrompt(seed) },
      ],
    });
    const text = completion.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) throw new Error('Response is not an array');
    return parsed;
  };

  try {
    let recommendations = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      const seed = Math.floor(Math.random() * 1000);
      try {
        const result = await callGroq(seed);
        if (result.length >= 9) {
          recommendations = result.slice(0, 9);
          break;
        }
        console.warn(`Attempt ${attempt + 1}: got ${result.length} items, retrying...`);
        recommendations = result; // keep best so far
      } catch (err) {
        console.warn(`Attempt ${attempt + 1} failed:`, err.message);
      }
    }

    if (recommendations.length === 0) {
      return res.status(500).json({ error: 'No se pudo generar recomendaciones' });
    }
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting seasonal recommendations:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✦ LariGuide server running at http://localhost:${PORT}`);
});
