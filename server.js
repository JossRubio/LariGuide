import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

// Resolve .env path relative to this file, not the CWD
const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

const app = express();
const PORT = 3001;

// Verify key loaded correctly at startup
const apiKey = process.env.VITE_ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('ERROR: VITE_ANTHROPIC_API_KEY not found in .env');
  process.exit(1);
}
console.log(`✦ API key loaded: ${apiKey.slice(0, 16)}...${apiKey.slice(-4)}`);

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const client = new Anthropic({ apiKey });

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
  // Fast path: valid JSON
  try {
    return JSON.parse(raw);
  } catch (_) {
    // Fall through to repair
  }

  // Find the last complete day object: ends with the alojamiento_sugerido closing brace
  // Pattern: look for the last occurrence of a closing "}" that ends a day entry
  // Strategy: walk backwards through "}" positions and try slicing + closing there
  const closings = [];
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '}') closings.push(i);
  }

  for (let i = closings.length - 1; i >= 0; i--) {
    const slice = raw.slice(0, closings[i] + 1);

    // Count open/close brackets and braces to determine what needs closing
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

    // Build closing suffix
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

app.post('/api/itinerary', async (req, res) => {
  const { origin, destination, startDate, endDate, budget, budgetEnabled } = req.body;

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
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    if (message.stop_reason === 'max_tokens') {
      console.warn('Warning: response hit max_tokens limit, attempting JSON repair');
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: 'La IA no devolvió JSON válido', raw: text });
    }

    const itinerary = parseOrRepairJSON(jsonMatch[0]);
    res.json(itinerary);
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`✦ LariGuide server running at http://localhost:${PORT}`);
});
