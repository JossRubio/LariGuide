import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Resolve .env path relative to this file, not the CWD
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

const groqKey = process.env.GROQ_API_KEY;
const anthropicKey = process.env.ANTHROPIC_API_KEY;
const geminiKey = process.env.GEMINI_API_KEY;

if (!groqKey && !anthropicKey && !geminiKey) {
  console.error('ERROR: No API keys found. Set GROQ_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY in .env');
  process.exit(1);
}
if (groqKey)     console.log(`✦ Groq key loaded:      ${groqKey.slice(0, 8)}...${groqKey.slice(-4)}`);
if (anthropicKey) console.log(`✦ Anthropic key loaded: ${anthropicKey.slice(0, 8)}...${anthropicKey.slice(-4)}`);
if (geminiKey)   console.log(`✦ Gemini key loaded:    ${geminiKey.slice(0, 8)}...${geminiKey.slice(-4)}`);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const groq = groqKey ? new Groq({ apiKey: groqKey }) : null;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;
const gemini = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

const buildSystemPrompt = (budget, budgetEnabled, days) => {
  let budgetContext;
  if (budgetEnabled && budget) {
    budgetContext = `Eres un experto planificador de viajes. El viajero dispone de un presupuesto de $${budget} USD en total. Adapta todas las recomendaciones (alojamiento, actividades, transporte y comida) a ese presupuesto, priorizando opciones que se ajusten a él sin superarlo.`;
  } else {
    budgetContext = `Eres un experto planificador de viajes económicos. El viajero no ha especificado un presupuesto, por lo que debes asumir un perfil económico: prioriza opciones asequibles, hostales o alojamientos de bajo costo, transporte público, comida local y actividades gratuitas o de bajo costo.`;
  }

  const daysInstruction = days ? ` CRÍTICO: el array "dias" DEBE contener EXACTAMENTE ${days} objetos, uno por cada día del viaje, sin excepción.` : '';

  return `${budgetContext}${daysInstruction} Genera un itinerario detallado en español para el viaje especificado. Responde ÚNICAMENTE en JSON válido con esta estructura exacta (sin texto adicional, sin markdown, sin bloques de código):
{
  "resumen": {
    "presupuestoTotal": { "usd": number, "monedaLocal": "código ISO 4217 de 3 letras, ej: PEN, EUR, JPY, ARS", "valorMonedaLocal": number, "nombreMoneda": "nombre completo de la moneda en español, ej: Sol peruano, Euro, Yen japonés", "simbolo": string },
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
};

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

async function fetchExchangeRate(currencyCode) {
  if (!currencyCode || currencyCode === 'USD') return null;
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!res.ok) return null;
    const data = await res.json();
    const rate = data.rates?.[currencyCode] ?? null;
    console.log(`[ExchangeRate] USD→${currencyCode}: ${rate} (source: open.er-api.com)`);
    return rate;
  } catch (err) {
    console.warn(`[ExchangeRate] Error fetching rate for ${currencyCode}:`, err.message);
    return null;
  }
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

  const systemPrompt = buildSystemPrompt(budget, budgetEnabled, days);
  const MAX_TOKENS = 16000;

  try {
    let text = '';

    if (provider === 'anthropic') {
      if (!anthropic) return res.status(400).json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor' });
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      });
      text = message.content[0].type === 'text' ? message.content[0].text : '';
      if (message.stop_reason === 'max_tokens') {
        console.warn('Warning: Anthropic response hit max_tokens, attempting JSON repair');
      }
    } else if (provider === 'gemini') {
      if (!gemini) return res.status(400).json({ error: 'GEMINI_API_KEY no configurada en el servidor' });
      const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(`${systemPrompt}\n\n${userMessage}`);
      text = result.response.text();
    } else {
      if (!groq) return res.status(400).json({ error: 'GROQ_API_KEY no configurada en el servidor' });
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
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

    // Corregir tasa de cambio con datos en tiempo real
    // Intenta monedaLocal primero (debe ser el código ISO), luego nombreMoneda como fallback
    const pt = itinerary.resumen?.presupuestoTotal;
    const candidateA = pt?.monedaLocal?.trim();
    const candidateB = pt?.nombreMoneda?.trim();
    const isIsoCode = (s) => s && /^[A-Z]{3}$/.test(s);

    let currencyCode = isIsoCode(candidateA) ? candidateA : isIsoCode(candidateB) ? candidateB : null;
    const realRate = await fetchExchangeRate(currencyCode);
    console.log(`Currency: candidateA="${candidateA}" candidateB="${candidateB}" → using "${currencyCode}" → rate=${realRate}`);
    if (realRate) {
      itinerary.resumen.presupuestoTotal.valorMonedaLocal = Math.round(realRate * 100) / 100;
      for (const dia of itinerary.dias || []) {
        for (const actividad of dia.actividades || []) {
          if (actividad.costo_usd != null) {
            actividad.costo_moneda_local = Math.round(actividad.costo_usd * realRate * 100) / 100;
          }
        }
      }
    }

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

  const buildPrompt = (seed, exclude = []) => {
    const excludeClause = exclude.length > 0
      ? `\nPAÍSES PROHIBIDOS (no repetir ninguno de estos): ${exclude.join(', ')}.\n`
      : '';
    return `Estamos en ${currentMonth}. Genera un array JSON con EXACTAMENTE 9 destinos turísticos internacionales para visitar este mes desde Santiago de Chile (semilla: ${seed}).
${excludeClause}
REGLAS CRÍTICAS:
1. El array debe tener exactamente 9 elementos.
2. El campo "name" y el campo "country" deben contener SIEMPRE el nombre del PAÍS completo en español — NUNCA una ciudad, región ni zona geográfica. Ejemplos correctos: "Japón", "Italia", "Colombia". Ejemplos INCORRECTOS: "Tokio", "Roma", "Medellín", "Patagonia", "Bali".
3. Cada país debe ser DIFERENTE a los demás del array.
4. Evita recomendar países que tengan: conflictos armados activos, inestabilidad política grave, crisis humanitarias, restricciones severas de viaje para turistas extranjeros, o situaciones de seguridad que desaconsejen el turismo. Prioriza destinos reconocidamente seguros y amigables para el turismo internacional.

Distribuye los 9 países así:
1. Europa occidental (ej: Francia, Italia, España, Portugal)
2. Europa oriental o nórdica (ej: Hungría, Polonia, Grecia, Noruega, Alemania)
3. Asia oriental (ej: Japón, Corea del Sur)
4. Asia sudoriental (ej: Tailandia, Vietnam, Indonesia)
5. Asia del sur o Medio Oriente (ej: India, Jordania, Emiratos Árabes Unidos, Turquía)
6. África (ej: Marruecos, Egipto, Sudáfrica)
7. Oceanía (ej: Australia, Nueva Zelanda)
8. Norteamérica (ej: Estados Unidos, Canadá, México)
9. Caribe (ej: Cuba, República Dominicana, Jamaica)

Responde ÚNICAMENTE con el array JSON, sin texto ni bloques de código:
[{"name":"nombre del país en español","country":"mismo nombre del país en español","reason":"una oración por qué ${currentMonth} es ideal para visitar este país","estimatedPrice":1200,"season":"clima breve en ${currentMonth}","iconicAttraction":"atractivo turístico más icónico del país (ej: Torre Eiffel, Machu Picchu, Monte Fuji)"}]`;
  };

  const buildPromptB = (seed, exclude = []) => {
    const excludeClause = exclude.length > 0
      ? `\nPAÍSES PROHIBIDOS (no incluir ninguno): ${exclude.join(', ')}.\n`
      : '';
    return `Estamos en ${currentMonth}. Genera un array JSON con EXACTAMENTE 9 destinos turísticos internacionales para visitar este mes desde Santiago de Chile (semilla: ${seed}).
${excludeClause}
REGLAS CRÍTICAS:
1. El array debe tener exactamente 9 elementos.
2. El campo "name" y el campo "country" deben contener SIEMPRE el nombre del PAÍS completo en español — NUNCA una ciudad, región ni zona geográfica.
3. Cada país debe ser DIFERENTE a los países prohibidos y diferente entre sí.
4. Evita recomendar países que tengan: conflictos armados activos, inestabilidad política grave, crisis humanitarias, restricciones severas de viaje para turistas extranjeros, o situaciones de seguridad que desaconsejen el turismo. Prioriza destinos reconocidamente seguros y amigables para el turismo internacional.

Distribuye los 9 países así:
1. Islandia, Croacia, Austria o un país europeo no mencionado en los prohibidos
2. Sudamérica norte (ej: Colombia, Venezuela, Ecuador)
3. Sudamérica centro (ej: Perú, Bolivia)
4. Sudamérica sur (ej: Argentina, Uruguay, Chile)
5. Sudamérica oriental (ej: Brasil, Paraguay)
6. Centroamérica (ej: Costa Rica, Guatemala, Panamá)
7. Medio Oriente no mencionado (ej: Jordania, Omán, Catar, Israel)
8. África subsahariana (ej: Sudáfrica, Kenia, Tanzania, Etiopía)
9. Asia central o del sur no mencionada (ej: India, Sri Lanka, Nepal, Uzbekistán)

Responde ÚNICAMENTE con el array JSON, sin texto ni bloques de código:
[{"name":"nombre del país en español","country":"mismo nombre del país en español","reason":"una oración por qué ${currentMonth} es ideal para visitar este país","estimatedPrice":1200,"season":"clima breve en ${currentMonth}","iconicAttraction":"atractivo turístico más icónico del país (ej: Torre Eiffel, Machu Picchu, Monte Fuji)"}]`;
  };

  const callGroq = async (prompt) => {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        { role: 'system', content: 'Eres un experto en turismo. Responde ÚNICAMENTE con un array JSON válido de exactamente 9 elementos. Sin texto adicional, sin bloques de código, sin explicaciones.' },
        { role: 'user', content: prompt },
      ],
    });
    const text = completion.choices[0]?.message?.content || '';
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found');
    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed)) throw new Error('Response is not an array');
    return parsed;
  };

  const callWithRetry = async (promptFn, label) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const seed = Math.floor(Math.random() * 1000);
      try {
        const result = await callGroq(promptFn(seed));
        if (result.length >= 9) return result.slice(0, 9);
        console.warn(`${label} attempt ${attempt + 1}: got ${result.length} items, retrying...`);
      } catch (err) {
        // Rate limit errors: no point retrying, propagate immediately
        if (err.status === 429) throw err;
        console.warn(`${label} attempt ${attempt + 1} failed:`, err.message);
      }
    }
    return [];
  };

  try {
    // Group A: first 9 destinations
    const groupA = await callWithRetry((seed) => buildPrompt(seed), 'GroupA');

    // Group B: 9 more destinations, explicitly excluding countries from group A
    const excludedCountries = groupA.map(r => r.country).filter(Boolean);
    const groupB = await callWithRetry((seed) => buildPromptB(seed, excludedCountries), 'GroupB');

    // Final dedup safety net
    const seen = new Set();
    const recommendations = [...groupA, ...groupB].filter(({ country }) => {
      const key = country?.toLowerCase().trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Returning ${recommendations.length} recommendations (${groupA.length} + ${groupB.length} before dedup)`);

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
