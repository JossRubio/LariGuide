# ✦ LariGuide — Tu guía de viaje

> **En desarrollo activo** — La aplicación es funcional de extremo a extremo. Ver sección [Estado del desarrollo](#estado-del-desarrollo) para el detalle de lo implementado y lo pendiente.

Aplicación web de planificación de viajes con inteligencia artificial. Genera itinerarios personalizados día a día, muestra mapas interactivos, clima en tiempo real, galería de imágenes del destino, y una sección de inspiración con destinos de temporada generados por IA.

> **Nota de diseño:** el layout de la vista de itinerario generado requiere ajustes. Las tarjetas de actividades, la distribución del timeline por día y la responsividad en móvil están pendientes de revisión visual antes de considerarse estables.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Estilos / animaciones | Tailwind CSS 4, Framer Motion 12 |
| Backend | Node.js, Express 5 |
| IA — generación de itinerario | Groq (`llama-3.3-70b-versatile`) · Anthropic (`claude-sonnet-4-6`) · Google (`gemini-2.5-flash`) |
| IA — destinos de temporada | Groq (`llama-3.3-70b-versatile`) |
| Mapas | Leaflet 1.9 + React-Leaflet 5 (sin API key) |
| Clima | Open-Meteo API (sin API key) |
| Geocodificación | Nominatim / OpenStreetMap (sin API key) |
| Tipos de cambio | open.er-api.com (sin API key, tasas en tiempo real) |
| Imágenes | Wikipedia `pageimages` API + Wikimedia Commons |
| PDF | html2canvas + jsPDF |

---

## Arquitectura

```
localhost:5173  →  Vite dev server  (React SPA)
localhost:3001  →  Express server   (server.js)
                     ├─ POST /api/itinerary                  — genera el itinerario
                     └─ GET  /api/seasonal-recommendations   — destinos de temporada
```

Las llamadas a los proveedores de IA se realizan desde el servidor para proteger las API keys.

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar las claves necesarias

# 3. Iniciar el servidor backend (puerto 3001)
npm run start:server

# 4. En otra terminal, iniciar el frontend (puerto 5173)
npm run dev
```

Abrir `http://localhost:5173`.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Frontend en modo desarrollo |
| `npm run start:server` | Servidor Express (requerido para la IA) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |

## Variables de entorno

| Variable | Descripción |
|---|---|
| `GROQ_API_KEY` | API key de Groq (gratuita en console.groq.com). Requerida para itinerario y destinos de temporada. |
| `ANTHROPIC_API_KEY` | API key de Anthropic. Opcional; necesaria solo si se selecciona Claude como proveedor. |
| `GEMINI_API_KEY` | API key de Google AI Studio. Opcional; necesaria solo si se selecciona Gemini 2.5 como proveedor. |

---

## Funcionalidades implementadas

### Pantalla principal

**Hero + formulario de búsqueda**
- Origen: selector de ciudades chilenas con aeropuerto (lista estática, filtrable)
- Destino: búsqueda dinámica vía Nominatim con autocompletado jerárquico (país → región → ciudad)
- Selector de fechas de viaje
- Número de viajeros
- Presupuesto con slider y categorías (Mochilero / Explorador / Viajero / Lujo); si no se especifica presupuesto, el sistema asume un perfil económico por defecto
- Selector de proveedor de IA: Groq (Llama 3.3), Anthropic Claude y Google Gemini 2.5

**Sección de inspiración — Destinos de temporada**
- 18 destinos de países generados por Groq según el mes actual, distribuidos entre Europa, Asia, África, Oceanía y América
- Carrusel con 3 cards simultáneas en desktop y 1 en móvil
- Auto-avance cada 10 segundos (se pausa al hacer hover)
- Flechas de navegación doradas con fondo semitransparente; se ocultan en los extremos
- Indicadores de paginación: 3 puntos, el activo en dorado
- Transición suave de 500 ms con `cubic-bezier`
- Al hacer clic en una card, precarga el país en el formulario
- Imágenes: base de datos local (`src/data/destinations-images.ts`) con 20 destinos × 3 URLs verificadas; si el destino no está en la base de datos, cae al buscador dinámico de Wikimedia Commons

### Vista de resultados

- **Resumen del viaje** — temporada, presupuesto total en USD y moneda local con tasa de cambio en tiempo real (open.er-api.com), recomendaciones generales, cómo llegar desde Chile
- **Galería de imágenes** — extrae las principales atracciones del itinerario generado y busca una imagen representativa por cada una vía Wikipedia `pageimages` API + Wikimedia Commons como fallback; cada imagen incluye nombre de la atracción y descripción visible
- **Mapa interactivo** — Leaflet con marcadores en las coordenadas de cada actividad del itinerario
- **Itinerario día a día** — cards por día con actividades horarias: nombre, descripción, tipo, costo, nivel de concurrencia, mejor hora de visita, tips y link de reservación cuando aplica
- **Resumen de costos** — desglose por categoría, total estimado, exportación a PDF
- **Regenerar** — repite la consulta a la IA con los mismos parámetros
- **Nueva búsqueda** — vuelve a la pantalla principal limpiando el estado

---

## Estado del desarrollo

### Completado ✓

- Flujo completo de generación de itinerario (búsqueda → loading animado → resultados)
- Formulario de búsqueda con origen chileno, destino global y presupuesto adaptativo (perfil económico si no se especifica)
- Tres proveedores de IA seleccionables: Groq (Llama 3.3), Anthropic (Claude Sonnet 4.6), Google (Gemini 2.5 Flash); mismo prompt y estructura JSON para todos
- Instrucción explícita en el prompt del número exacto de días a generar para evitar itinerarios incompletos
- Corrección de tasas de cambio en tiempo real vía open.er-api.com; la IA ya no genera los valores de conversión, el servidor los sobreescribe
- Exportación a PDF corregida para Tailwind CSS 4 (conversión de `oklch`/`oklab`/`color-mix` a RGB antes de html2canvas)
- Pantalla de carga con mensajes rotativos y animación
- Mapa interactivo Leaflet con marcadores de actividades
- Galería de imágenes por atracción con descripción siempre visible
- Carrusel de destinos de temporada (9 destinos, paginado, auto-avance, responsive)
- Reparación automática de JSON truncado en respuestas de IA
- Lógica de reintento en el endpoint de recomendaciones (hasta 3 intentos si se reciben menos de 9 destinos)
- Footer informativo en pantalla inicial y en vista de resultados

### Pendiente

**Imágenes del itinerario**
- La búsqueda de imágenes por atracción retorna resultados irrelevantes en varios casos (imágenes de películas, logos, artículos no relacionados). Se debe revisar la estrategia de búsqueda en Wikipedia/Wikimedia Commons: mejorar el mapeo de nombres en español a artículos en inglés, y considerar otras fuentes o un ranking de relevancia más estricto

**Generación de itinerario con Gemini 2.5 Flash**
- En algunos casos el itinerario generado con Gemini 2.5 Flash resulta muy incompleto en relación a los parámetros ingresados (días planificados, actividades por día, detalle de costos). Se debe analizar si el problema es el límite de tokens de salida del modelo, la adherencia al formato JSON requerido, o el comportamiento del modelo ante viajes de larga duración

**Layout del itinerario generado**
- El layout general de la vista de resultados requiere revisión: distribución de columnas, espaciado entre secciones y jerarquía visual entre el resumen del viaje, el mapa y las tarjetas de días
- Las tarjetas de actividades (ActivityCard) necesitan ajustes de densidad de información: algunos campos (tips, nivel de concurrencia, mejor hora) compiten visualmente sin una jerarquía clara
- El timeline de actividades dentro de cada día necesita ajustes de scroll en móvil
- Los popups del mapa con imagen del lugar están pendientes

**Formulario**
- El selector de destino en cascada puede ser inconsistente para algunos países según la cobertura de Nominatim
- Manejo de errores visible al usuario (destino no encontrado, timeout de API, sin conexión)

**General**
- Soporte offline / caché de itinerarios generados
- Persistencia del historial de búsquedas (localStorage)
- Tests automatizados
- Deploy (Vercel + Railway o Render)
