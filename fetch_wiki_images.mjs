import https from 'https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'User-Agent': 'LariGuide/1.0 (research project)' }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch(e) { reject(new Error('JSON parse error: ' + data.substring(0,200))); }
      });
    }).on('error', reject);
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const BAD_PATTERNS = [
  'flag','map','icon','logo','coat','seal','emblem','locator','.svg',
  'commons','wikimedia','president','prime_minister','king','queen',
  'pope','politician','official','minister','chancellor','parliament',
  'nadar','portrait','de_gaulle','macron','election',
  'declaration','infantry','empire','nuclear','inauguration',
  'partisan','motorway','autobahn','diaspora','adoration',
  'guernica','referendum','bundesrat','bundestag','reichstag',
  'house_of_commons','downing','colonial','_logo','_icon','_sign',
  '_stamp','award','medal','coin','banknote','treaty','constitution',
  'battle','war','army','military','soldier','massacre','genocide',
  'occupation','propaganda','cartoon'
];

function isGoodFilename(t) {
  const lower = t.toLowerCase();
  if (!(/\.(jpg|jpeg|png)$/i.test(t))) return false;
  if (BAD_PATTERNS.some(x => lower.includes(x))) return false;
  return true;
}

async function getImagesFromPage(title) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(title) + '&prop=images&imlimit=50&format=json&origin=*';
  const data = await fetchUrl(url);
  const pages = data.query && data.query.pages ? data.query.pages : {};
  const images = [];
  for (const pid in pages) {
    const pageImages = pages[pid].images || [];
    for (const img of pageImages) {
      const t = img.title.replace('File:', '');
      if (isGoodFilename(t)) images.push(t);
    }
  }
  return images;
}

async function resolveImageUrl(filename) {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&titles=File:' + encodeURIComponent(filename) + '&prop=imageinfo&iiprop=url&iiurlwidth=800&format=json&origin=*';
  const data = await fetchUrl(url);
  const pages = data.query && data.query.pages ? data.query.pages : {};
  for (const pid in pages) {
    const info = pages[pid].imageinfo;
    if (info && info[0] && info[0].thumburl) return info[0].thumburl;
  }
  return null;
}

const destinations = [
  { spanish: "Francia", pages: ["Eiffel Tower", "Palace of Versailles", "Mont Saint-Michel"] },
  { spanish: "Italia", pages: ["Colosseum", "Amalfi Coast", "Florence Cathedral"] },
  { spanish: "Espana", pages: ["Sagrada Familia", "Alhambra", "Park Guell"] },
  { spanish: "Portugal", pages: ["Lisbon", "Sintra National Palace", "Algarve"] },
  { spanish: "Grecia", pages: ["Acropolis of Athens", "Santorini", "Meteora"] },
  { spanish: "Reino Unido", pages: ["Stonehenge", "Tower of London", "Scottish Highlands"] },
  { spanish: "Alemania", pages: ["Neuschwanstein Castle", "Brandenburg Gate", "Cologne Cathedral"] },
  { spanish: "Paises Bajos", pages: ["Keukenhof", "Kinderdijk", "Amsterdam"] },
  { spanish: "Suiza", pages: ["Matterhorn", "Jungfrau", "Lake Lucerne"] },
  { spanish: "Austria", pages: ["Hallstatt", "Schonbrunn Palace", "Grossglockner"] },
  { spanish: "Noruega", pages: ["Geirangerfjord", "Lofoten Islands", "Preikestolen"] },
  { spanish: "Suecia", pages: ["Stockholm", "Abisko National Park", "Gotland"] },
  { spanish: "Islandia", pages: ["Geysir", "Skogafoss", "Jokulsarlon"] },
  { spanish: "Croacia", pages: ["Plitvice Lakes National Park", "Dubrovnik", "Krka National Park"] },
  { spanish: "Republica Checa", pages: ["Prague", "Charles Bridge", "Cesky Krumlov"] },
  { spanish: "Hungria", pages: ["Hungarian Parliament Building", "Fisherman's Bastion", "Lake Balaton"] },
  { spanish: "Turquia", pages: ["Hagia Sophia", "Cappadocia", "Pamukkale"] },
  { spanish: "Escocia", pages: ["Edinburgh Castle", "Ben Nevis", "Eilean Donan"] },
  { spanish: "Irlanda", pages: ["Cliffs of Moher", "Rock of Cashel", "Giant's Causeway"] },
  { spanish: "Belgica", pages: ["Grand Place", "Bruges", "Ghent"] },
  { spanish: "Japon", pages: ["Mount Fuji", "Fushimi Inari-taisha", "Arashiyama"] },
  { spanish: "Tailandia", pages: ["Wat Phra Kaew", "Phi Phi Islands", "Wat Arun"] },
  { spanish: "Vietnam", pages: ["Ha Long Bay", "Hoi An", "Phong Nha-Ke Bang National Park"] },
  { spanish: "Indonesia", pages: ["Borobudur", "Bali", "Komodo National Park"] },
  { spanish: "India", pages: ["Taj Mahal", "Amber Fort", "Kerala backwaters"] },
  { spanish: "China", pages: ["Great Wall of China", "Forbidden City", "Zhangjiajie National Forest Park"] },
  { spanish: "Camboya", pages: ["Angkor Wat", "Bayon", "Ta Prohm"] },
  { spanish: "Emiratos", pages: ["Burj Khalifa", "Sheikh Zayed Grand Mosque", "Palm Jumeirah"] },
  { spanish: "Jordania", pages: ["Petra Jordan", "Wadi Rum", "Dead Sea"] },
  { spanish: "Nepal", pages: ["Boudhanath", "Pashupatinath Temple", "Annapurna Conservation Area"] },
  { spanish: "Sri Lanka", pages: ["Sigiriya", "Temple of the Tooth", "Yala National Park"] },
  { spanish: "Corea del Sur", pages: ["Gyeongbokgung", "Jeju Island", "Bukchon Hanok Village"] },
  { spanish: "Singapur", pages: ["Marina Bay Sands", "Gardens by the Bay", "Merlion"] },
  { spanish: "Filipinas", pages: ["Chocolate Hills", "Mayon Volcano", "Tubbataha Reef"] },
  { spanish: "Myanmar", pages: ["Bagan", "Shwedagon Pagoda", "Inle Lake"] },
  { spanish: "Malasia", pages: ["Petronas Towers", "Gunung Mulu National Park", "Langkawi"] },
  { spanish: "Mexico", pages: ["Chichen Itza", "Teotihuacan", "Palenque"] },
  { spanish: "Cuba", pages: ["Havana", "Vinales Valley", "Trinidad Cuba"] },
  { spanish: "Peru", pages: ["Machu Picchu", "Colca Canyon", "Lake Titicaca"] },
  { spanish: "Argentina", pages: ["Perito Moreno Glacier", "Iguazu Falls", "Aconcagua"] },
  { spanish: "Brasil", pages: ["Christ the Redeemer", "Amazon rainforest", "Iguazu Falls"] },
  { spanish: "Colombia", pages: ["Cartagena Colombia", "Ciudad Perdida", "Cocora Valley"] },
  { spanish: "Chile", pages: ["Torres del Paine National Park", "Easter Island", "Atacama Desert"] },
  { spanish: "Ecuador", pages: ["Galapagos Islands", "Cotopaxi", "Quilotoa"] },
  { spanish: "Bolivia", pages: ["Salar de Uyuni", "Tiwanaku", "Madidi National Park"] },
  { spanish: "Uruguay", pages: ["Colonia del Sacramento", "Punta del Este", "Montevideo"] },
  { spanish: "Costa Rica", pages: ["Arenal Volcano", "Monteverde Cloud Forest Reserve", "Manuel Antonio National Park"] },
  { spanish: "Guatemala", pages: ["Tikal", "Antigua Guatemala", "Lake Atitlan"] },
  { spanish: "Rep Dominicana", pages: ["Punta Cana", "Los Haitises National Park", "Saona Island"] },
  { spanish: "Jamaica", pages: ["Dunn's River Falls", "Blue Mountains Jamaica", "Negril"] },
  { spanish: "Canada", pages: ["Banff National Park", "Niagara Falls", "Canadian Rockies"] },
  { spanish: "Estados Unidos", pages: ["Grand Canyon", "Yellowstone National Park", "Yosemite National Park"] },
  { spanish: "Marruecos", pages: ["Marrakesh", "Hassan II Mosque", "Ait Benhaddou"] },
  { spanish: "Egipto", pages: ["Great Pyramid of Giza", "Luxor Temple", "Abu Simbel temples"] },
  { spanish: "Sudafrica", pages: ["Table Mountain", "Kruger National Park", "Cape of Good Hope"] },
  { spanish: "Tanzania", pages: ["Serengeti National Park", "Mount Kilimanjaro", "Zanzibar"] },
  { spanish: "Kenia", pages: ["Masai Mara", "Mount Kenya", "Amboseli National Park"] },
  { spanish: "Etiopia", pages: ["Lalibela", "Simien Mountains National Park", "Danakil Depression"] },
  { spanish: "Namibia", pages: ["Sossusvlei", "Etosha National Park", "Fish River Canyon"] },
  { spanish: "Ghana", pages: ["Cape Coast Castle", "Mole National Park", "Kakum National Park"] },
  { spanish: "Madagascar", pages: ["Avenue of the Baobabs", "Tsingy de Bemaraha Strict Nature Reserve", "Isalo National Park"] },
  { spanish: "Australia", pages: ["Sydney Opera House", "Uluru", "Great Barrier Reef"] },
  { spanish: "Nueva Zelanda", pages: ["Milford Sound", "Aoraki Mount Cook", "Tongariro Alpine Crossing"] },
  { spanish: "Fiyi", pages: ["Yasawa Islands", "Mamanuca Islands", "Taveuni"] }
];

async function getThreeUrlsForDest(dest) {
  const urls = [];
  const seen = new Set();

  for (const page of dest.pages) {
    if (urls.length >= 3) break;
    await sleep(200);
    try {
      const images = await getImagesFromPage(page);
      for (const img of images) {
        if (urls.length >= 3) break;
        if (seen.has(img)) continue;
        seen.add(img);
        await sleep(150);
        try {
          const url = await resolveImageUrl(img);
          if (url) {
            urls.push(url);
            process.stderr.write('  [' + dest.spanish + '] ' + img.substring(0,60) + '\n');
          }
        } catch(e) {
          // skip
        }
      }
    } catch(e) {
      process.stderr.write('  [' + dest.spanish + '] Error on page "' + page + '": ' + e.message + '\n');
    }
  }
  return urls;
}

async function main() {
  const results = {};
  for (const dest of destinations) {
    process.stderr.write('\n=== ' + dest.spanish + ' ===\n');
    results[dest.spanish] = await getThreeUrlsForDest(dest);
  }
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
