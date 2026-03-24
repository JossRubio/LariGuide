import type { ItineraryData, WikimediaImage } from '../types/itinerary';

// Prefijos genéricos en español que dificultan la búsqueda en Wikipedia en inglés
const SPANISH_PREFIXES = [
  'Templo ', 'Castillo ', 'Parque ', 'Museo ', 'Mercado ',
  'Monte ', 'Lago ', 'Río ', 'Rio ', 'Bahía ', 'Playa ',
  'Ciudad ', 'Barrio ', 'Plaza ', 'Palacio ', 'Jardín ',
  'Santuario ', 'Catedral ', 'Iglesia ', 'Basílica ',
  'Ruinas ', 'Fortaleza ', 'Torre ', 'Puente ', 'Valle ',
];

const PEOPLE_TERMS = [
  'portrait', 'person', 'people', 'headshot', 'biography',
  'politician', 'president', 'minister', 'official', 'senator',
];

function stripSpanishPrefix(name: string): string {
  for (const prefix of SPANISH_PREFIXES) {
    if (name.startsWith(prefix)) return name.slice(prefix.length).trim();
  }
  return name.trim();
}

function isPeopleCentered(filename: string, isEvent: boolean): boolean {
  if (isEvent) return false;
  const f = filename.toLowerCase();
  return PEOPLE_TERMS.some(t => f.includes(t));
}

function extractAttractions(
  itinerary: ItineraryData
): Array<{ name: string; description: string; isEvent: boolean }> {
  const seen = new Set<string>();
  const list: Array<{ name: string; description: string; isEvent: boolean }> = [];

  for (const dia of itinerary.dias) {
    for (const act of dia.actividades) {
      if (act.tipo !== 'atraccion' && act.tipo !== 'naturaleza') continue;
      const key = act.nombre.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);
      const lower = (act.nombre + ' ' + act.descripcion).toLowerCase();
      const isEvent = /festival|evento|celebraci|feria|concierto|espect/.test(lower);
      list.push({ name: act.nombre, description: act.descripcion, isEvent });
    }
  }

  return list.slice(0, Math.min(9, Math.max(3, list.length)));
}

// Busca en Wikipedia en español → obtiene el enlace a la versión inglesa → obtiene su pageimage.
// Esto evita ambigüedades (p.ej. "Japón" devolviendo "Japón (film)" en Wikipedia en inglés).
async function fetchViaSpanishWikipedia(
  spanishName: string,
  name: string,
  description: string
): Promise<WikimediaImage | null> {
  try {
    // Paso 1: buscar en es.wikipedia y obtener los langlinks a inglés en la misma llamada
    const searchUrl =
      `https://es.wikipedia.org/w/api.php?action=query` +
      `&generator=search&gsrsearch=${encodeURIComponent(spanishName)}&gsrlimit=5` +
      `&prop=langlinks&lllang=en&lllimit=1` +
      `&format=json&origin=*`;

    const res = await fetch(searchUrl);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    // Ordenar por relevancia (index del generador) y encontrar el primero con langlink a inglés
    const sorted = Object.values(pages as Record<string, any>)
      .sort((a: any, b: any) => (a.index ?? 99) - (b.index ?? 99));

    let enTitle: string | null = null;
    for (const page of sorted) {
      const ll = (page.langlinks as any[])?.[0]?.['*'];
      if (ll) { enTitle = ll; break; }
    }

    if (!enTitle) return null;

    // Paso 2: obtener la pageimage del artículo inglés por título exacto
    const imgUrl =
      `https://en.wikipedia.org/w/api.php?action=query` +
      `&titles=${encodeURIComponent(enTitle)}` +
      `&prop=pageimages&pithumbsize=800&piprop=thumbnail` +
      `&format=json&origin=*`;

    const imgRes = await fetch(imgUrl);
    const imgData = await imgRes.json();
    const imgPages = imgData.query?.pages;
    if (!imgPages) return null;

    const imgPage = Object.values(imgPages)[0] as any;
    if (imgPage.thumbnail?.source) {
      return {
        title: name,
        url: imgPage.thumbnail.source,
        thumbUrl: imgPage.thumbnail.source,
        author: 'Wikipedia',
        description,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Fallback: busca directamente en Wikipedia en inglés con generator=search + pageimages
async function fetchViaEnglishWikipedia(
  searchQuery: string,
  name: string,
  description: string
): Promise<WikimediaImage | null> {
  try {
    const url =
      `https://en.wikipedia.org/w/api.php?action=query` +
      `&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}` +
      `&prop=pageimages&pithumbsize=800&piprop=thumbnail` +
      `&format=json&origin=*&gsrlimit=5`;

    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    for (const page of Object.values(pages) as any[]) {
      if (page.thumbnail?.source) {
        return {
          title: name,
          url: page.thumbnail.source,
          thumbUrl: page.thumbnail.source,
          author: 'Wikipedia',
          description,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

// Fallback final: busca directamente en Wikimedia Commons
async function fetchViaCommons(
  searchQuery: string,
  name: string,
  description: string,
  isEvent: boolean
): Promise<WikimediaImage | null> {
  try {
    const url =
      `https://commons.wikimedia.org/w/api.php?action=query` +
      `&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}` +
      `&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata` +
      `&iiurlwidth=800&format=json&origin=*&gsrlimit=15`;

    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    if (!pages) return null;

    for (const page of Object.values(pages) as any[]) {
      const title = (page.title || '').toLowerCase();
      if (!title.endsWith('.jpg') && !title.endsWith('.jpeg') && !title.endsWith('.png')) continue;
      if (
        title.includes('flag') || title.includes('icon') || title.includes('logo') ||
        title.includes('map') || title.includes('coat') || title.includes('emblem') ||
        title.includes('seal') || title.includes('signature') ||
        isPeopleCentered(title, isEvent)
      ) continue;

      const info = (page.imageinfo as any[])?.[0];
      if (!info?.url) continue;

      return {
        title: name,
        url: info.url,
        thumbUrl: info.thumburl || info.url,
        author: info.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, '') || 'Wikimedia Commons',
        description,
      };
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchAttractionImage(
  name: string,
  description: string,
  isEvent: boolean,
): Promise<WikimediaImage | null> {
  const cleanName = stripSpanishPrefix(name);

  // 1. Wikipedia en español → langlink inglés → pageimage del artículo correcto
  const img = await fetchViaSpanishWikipedia(cleanName, name, description);
  if (img) return img;

  // 2. Wikipedia en inglés con búsqueda directa (por si el nombre ya es en inglés)
  const img2 = await fetchViaEnglishWikipedia(cleanName, name, description);
  if (img2) return img2;

  // 3. Wikimedia Commons
  return fetchViaCommons(cleanName, name, description, isEvent);
}

// ── Fallback: búsqueda genérica por destino (comportamiento original) ──────────
async function searchByDestination(destBase: string, count = 9): Promise<WikimediaImage[]> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(destBase)}&format=json&origin=*`;
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    if (!searchData.query?.search?.length) return [];

    const pageTitle = searchData.query.search[0].title;
    const imagesUrl =
      `https://en.wikipedia.org/w/api.php?action=query` +
      `&titles=${encodeURIComponent(pageTitle)}&prop=images` +
      `&format=json&origin=*&imlimit=20`;
    const imagesResponse = await fetch(imagesUrl);
    const imagesData = await imagesResponse.json();
    const pages = imagesData.query?.pages;
    if (!pages) return [];

    const page = Object.values(pages)[0] as any;
    const imageFiles = ((page.images as any[]) || [])
      .filter((img: any) => {
        const t = img.title.toLowerCase();
        return (
          !t.includes('flag') && !t.includes('icon') && !t.includes('logo') && !t.includes('map') &&
          (t.endsWith('.jpg') || t.endsWith('.jpeg') || t.endsWith('.png'))
        );
      })
      .slice(0, count);

    const imageDetails = await Promise.all(
      imageFiles.map(async (img: any) => {
        try {
          const infoUrl =
            `https://en.wikipedia.org/w/api.php?action=query` +
            `&titles=${encodeURIComponent(img.title)}&prop=imageinfo` +
            `&iiprop=url|extmetadata&format=json&origin=*&iiurlwidth=800`;
          const infoResponse = await fetch(infoUrl);
          const infoData = await infoResponse.json();
          const infoPages = infoData.query?.pages;
          if (!infoPages) return null;
          const infoPage = Object.values(infoPages)[0] as any;
          const imageInfo = infoPage.imageinfo?.[0];
          if (!imageInfo?.url) return null;

          return {
            title: img.title.replace('File:', '').replace(/\.[^.]+$/, ''),
            url: imageInfo.url,
            thumbUrl: imageInfo.thumburl || imageInfo.url,
            author: imageInfo.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, '') || 'Wikimedia Commons',
            description: imageInfo.extmetadata?.ImageDescription?.value?.replace(/<[^>]*>/g, '') || '',
          };
        } catch {
          return null;
        }
      })
    );

    return imageDetails.filter(Boolean) as WikimediaImage[];
  } catch {
    return [];
  }
}

// ── Punto de entrada ──────────────────────────────────────────────────────────
export async function searchImages(
  destination: string,
  itinerary?: ItineraryData
): Promise<WikimediaImage[]> {
  const destBase = destination.split(',')[0].trim();

  if (itinerary) {
    const attractions = extractAttractions(itinerary);
    const results = await Promise.allSettled(
      attractions.map(a => fetchAttractionImage(a.name, a.description, a.isEvent))
    );
    const images = results
      .map(r => r.status === 'fulfilled' ? r.value : null)
      .filter((img): img is WikimediaImage => img !== null);
    if (images.length >= 3) return images;
  }

  return searchByDestination(destBase);
}
