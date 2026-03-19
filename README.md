# ✦ LariGuide — Tu guía de viaje

> **En desarrollo activo** — La aplicación es funcional de extremo a extremo. Ver sección [Estado del desarrollo](#estado-del-desarrollo) para el detalle de lo implementado y lo pendiente.

Aplicación web de planificación de viajes con inteligencia artificial. Genera itinerarios personalizados día a día, muestra mapas interactivos, clima en tiempo real, galería de imágenes del destino, y una sección de inspiración con destinos de temporada generados por IA.

---

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Estilos / animaciones | Tailwind CSS 4, Framer Motion 12 |
| Backend | Node.js, Express 5 |
| IA — generación de itinerario | Groq (`llama-3.3-70b-versatile`) + Anthropic Claude (seleccionable) |
| IA — destinos de temporada | Groq (`llama-3.3-70b-versatile`) |
| Mapas | Leaflet 1.9 + React-Leaflet 5 (sin API key) |
| Clima | Open-Meteo API (sin API key) |
| Geocodificación | Nominatim / OpenStreetMap (sin API key) |
| Imágenes | Wikipedia `pageimages` API + base de datos local de Wikimedia Commons |
| PDF | html2canvas + jsPDF |

---

## Arquitectura

```
localhost:5173  →  Vite dev server  (React SPA)
localhost:3001  →  Express server   (server.js)
                     ├─ POST /api/itinerary                  — genera el itinerario
                     └─ GET  /api/seasonal-recommendations   — destinos de temporada
```

Las llamadas a Groq y Anthropic se realizan desde el servidor para proteger las API keys.

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar las claves:
# GROQ_API_KEY=gsk_...
# ANTHROPIC_API_KEY=sk-ant-...   (opcional si se usa solo Groq)

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

---

## Funcionalidades implementadas

### Pantalla principal

**Hero + formulario de búsqueda**
- Origen: selector de ciudades chilenas con aeropuerto (lista estática, filtrable)
- Destino: búsqueda dinámica vía Nominatim con autocompletado jerárquico (país → región → ciudad)
- Selector de fechas de viaje
- Número de viajeros
- Presupuesto con slider y categorías (Mochilero / Explorador / Viajero / Lujo)
- Selector de proveedor de IA: Groq o Anthropic Claude

**Sección de inspiración — Destinos de temporada**
- 9 destinos de países generados por Groq según el mes actual, distribuidos entre Europa, Asia, África, Oceanía y América
- Carrusel con 3 cards simultáneas en desktop y 1 en móvil
- Auto-avance cada 10 segundos (se pausa al hacer hover)
- Flechas de navegación doradas con fondo semitransparente; se ocultan en los extremos
- Indicadores de paginación: 3 puntos, el activo en dorado
- Transición suave de 500 ms con `cubic-bezier`
- Al hacer clic en una card, precarga el país en el formulario
- Imágenes: base de datos local (`src/data/destinations-images.ts`) con 20 destinos × 3 URLs verificadas mediante la Wikipedia API; si el destino no está en la base de datos, cae al buscador dinámico de Wikimedia Commons

### Vista de resultados

- **Resumen del viaje** — temporada, presupuesto total en USD y moneda local, recomendaciones generales, cómo llegar desde Chile
- **Galería de imágenes** — fotos del destino obtenidas desde Wikimedia Commons
- **Mapa interactivo** — Leaflet con marcadores en las coordenadas de cada actividad del itinerario
- **Itinerario día a día** — cards por día con actividades horarias: nombre, descripción, tipo, costo, nivel de concurrencia, mejor hora de visita, tips y link de reservación cuando aplica
- **Resumen de costos** — desglose por categoría, total estimado, exportación a PDF
- **Regenerar** — repite la consulta a la IA con los mismos parámetros
- **Nueva búsqueda** — vuelve a la pantalla principal limpiando el estado

---

## Estado del desarrollo

### Completado ✓

- Flujo completo de generación de itinerario (búsqueda → loading animado → resultados)
- Formulario de búsqueda con origen chileno, destino global y presupuesto
- Selector de modelo de IA (Groq / Claude) con soporte dual en el servidor
- Pantalla de carga con mensajes rotativos y animación
- Mapa interactivo Leaflet con marcadores de actividades
- Galería de imágenes desde Wikimedia Commons
- Exportación del itinerario a PDF (html2canvas + jsPDF)
- Carrusel de destinos de temporada (9 destinos, paginado, auto-avance, responsive)
- Base de datos local de imágenes con 20 destinos, 3 URLs cada uno, verificadas vía Wikipedia API
- Lógica de imágenes: base de datos local como fuente primaria, Wikimedia como fallback
- Búsqueda flexible de imágenes que ignora tildes y mayúsculas
- Prompt del servidor corregido para devolver nombres de países (no ciudades)
- Lógica de reintento en el endpoint de recomendaciones (hasta 3 intentos si se reciben menos de 9 destinos)
- Reparación automática de JSON truncado en respuestas de IA

### Pendiente

**Correcciones derivadas del itinerario generado**
- Aplicar correcciones al resultado de la IA a partir de los datos del propio itinerario: validación de horarios inconsistentes, costos fuera de rango, actividades duplicadas, links de reservación no verificables, y totales de presupuesto que no cuadran entre días y resumen

**Imágenes**
- Ampliar la base de datos local de imágenes de 20 a 70 destinos
- Filtrado de imágenes de Wikimedia para excluir resultados que no representan atracciones turísticas (personas, logos, infografías)

**Formulario**
- El selector de destino en cascada (país → región → ciudad) puede ser inconsistente para algunos países según la cobertura de Nominatim
- Se evalúa reemplazar el date picker por un componente de rango de fechas inline
- Manejo de errores visible al usuario (destino no encontrado, timeout de API, sin conexión)

**Itinerario**
- El timeline de actividades dentro de cada día necesita ajustes de scroll en móvil
- Los popups del mapa con imagen del lugar están pendientes
- La exportación PDF no replica fielmente el estilo visual de la interfaz

**General**
- Soporte offline / caché de itinerarios generados
- Persistencia del historial de búsquedas (localStorage)
- Tests automatizados
- Deploy (Vercel + Railway o Render)

---

## Estructura del proyecto

```
LariGuide/
├── server.js                        # API Express (Groq + Anthropic + recomendaciones)
├── src/
│   ├── App.tsx                      # Componente raíz, estado global de la aplicación
│   ├── components/
│   │   ├── Hero/                    # Encabezado animado + formulario de búsqueda
│   │   ├── InspirationSection/      # Carrusel de destinos de temporada
│   │   ├── Itinerary/               # Vista día a día (DayCard, ActivityCard)
│   │   ├── TripSummary/             # Tarjeta resumen del viaje (clima, temporada)
│   │   ├── CostSummary/             # Desglose de costos + exportar PDF
│   │   ├── MapView/                 # Mapa Leaflet con marcadores de actividades
│   │   ├── ImageGallery/            # Galería de fotos del destino
│   │   ├── SearchForm/              # Formulario completo de búsqueda
│   │   └── UI/                      # Componentes base (Button, Badge, Skeleton)
│   ├── data/
│   │   ├── destinations-images.ts   # Base de datos local de imágenes (20 destinos)
│   │   ├── countries.ts             # Lista de países con coordenadas
│   │   └── chileAirports.ts         # Ciudades chilenas con aeropuerto (IATA)
│   ├── hooks/
│   │   ├── useItinerary.ts          # Lógica de generación y regeneración
│   │   ├── useWeather.ts            # Consulta clima Open-Meteo
│   │   └── useWikimedia.ts          # Imágenes del destino principal
│   ├── services/
│   │   ├── wikimedia.ts             # Búsqueda dinámica de imágenes (Wikipedia API)
│   │   ├── nominatim.ts             # Geocodificación OpenStreetMap
│   │   └── weather.ts               # Cliente Open-Meteo
│   └── types/
│       └── itinerary.ts             # Tipos TypeScript del dominio
└── package.json
```
