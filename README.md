# LariGuide — Tu guía de viaje

> ⚠️ **En desarrollo activo** — La aplicación es funcional pero se están realizando ajustes continuos. Ver sección [Estado del desarrollo](#estado-del-desarrollo) para más detalles.

Aplicación web de planificación de viajes con inteligencia artificial. Genera itinerarios personalizados día a día, muestra mapas interactivos, clima en tiempo real y galería de imágenes del destino.

## Stack

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS v4 + Framer Motion
- **Mapas**: Leaflet.js + react-leaflet (sin API key)
- **IA**: Anthropic API — `claude-sonnet-4-20250514`
- **Imágenes**: Wikimedia Commons API (sin key)
- **Clima**: Open-Meteo API (sin key)
- **Geocoding**: Nominatim / OpenStreetMap (sin key)

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env y agregar tu Anthropic API key

# 3. Iniciar el servidor backend (puerto 3001)
npm run start:server

# 4. Iniciar el frontend (puerto 5173)
npm run dev
```

Abrir `http://localhost:5173` en el navegador.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Frontend en modo desarrollo |
| `npm run start:server` | Servidor proxy Express (requerido para la IA) |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |

## Estado del desarrollo

El sistema es funcional de extremo a extremo, pero se encuentra en una etapa de refinamiento. Las áreas con trabajo pendiente son:

### Formulario de búsqueda

- **Ajustes visuales**: el layout del formulario en pantallas intermedias (tablets) necesita revisión de espaciados y proporciones entre columnas.
- **Campo de origen**: actualmente limitado a ciudades de Chile; se evalúa habilitarlo para cualquier ciudad del mundo.
- **Selector de destino en cascada**: el nivel de Región/Provincia depende de la calidad de los datos de Nominatim, que puede ser irregular para algunos países.
- **Selector de fechas**: se planea reemplazar el date picker por un componente de rango de fechas en un solo calendario inline.
- **Presupuesto**: se evalúa agregar conversión automática a moneda local del destino seleccionado en tiempo real.

### Secciones del itinerario generado

- **Resumen del viaje**: la visualización del clima y la temporada puede quedar desalineada en mobile cuando el texto es largo.
- **Mapa interactivo**: los marcadores personalizados pueden no renderizarse correctamente en la primera carga; los popups con imagen del lugar están en desarrollo.
- **Galería de imágenes**: la calidad y relevancia de las imágenes de Wikimedia Commons varía según el destino; ademas de que tambien estan saliendo imagenes que no representan precisamente atracciones a visitar, se debe aplicar un filtrado para ajustar las imagenes presentadas.
- **Itinerario día a día**: el timeline horizontal de actividades dentro de cada día necesita ajustes de scroll en mobile. Los links de reservación dependen de URLs que la IA genera y no siempre son verificables.
- **Resumen de costos**: la tabla de desglose por categoría (transporte, alojamiento, comidas, actividades) está implementada pero puede mostrar totales inconsistentes si la IA devuelve datos parciales.
- **Exportar PDF**: el diseño del PDF exportado no replica fielmente el estilo visual de la interfaz; está pendiente una mejora de maquetado.

### General

- Manejo de errores de red y timeouts de la API de Anthropic aún en ajuste.
- Soporte offline / caché de itinerarios generados no implementado.
- Tests automatizados pendientes.

---

## Nota sobre la carpeta del proyecto

El nombre de la aplicación fue nombrada **LariGuide** internamente en todos los archivos fuente. Si deseas renombrar la carpeta:

```bash
# Windows (PowerShell)
Rename-Item "Wayra" "LariGuide"
```

Recuerda actualizar cualquier script o acceso directo que apunte a la ruta anterior.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_ANTHROPIC_API_KEY` | API key de Anthropic (requerida). El servidor la lee — nunca se expone al navegador. |
