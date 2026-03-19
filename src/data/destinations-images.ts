/**
 * Base de datos de imágenes de Wikimedia Commons para destinos turísticos.
 * Clave: nombre del destino tal como lo devuelve Groq (en español).
 * Valor: array de 3 URLs de imágenes verificadas desde la API de Wikipedia (960px).
 *
 * Todas las URLs fueron obtenidas y verificadas mediante la API de pageimages
 * de Wikipedia (prop=pageimages&piprop=thumbnail&pithumbsize=800).
 */

export const destinationImages: Record<string, string[]> = {

  // ── ASIA ────────────────────────────────────────────────────────────────────

  "Japón": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg/960px-Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/960px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg/960px-Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg",
  ],

  "Tailandia": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Ao_Nang_beach_panorama_1.jpg/960px-Ao_Nang_beach_panorama_1.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Wat_Phra_Kaew_by_Ninara_TSP_edit_crop.jpg/960px-Wat_Phra_Kaew_by_Ninara_TSP_edit_crop.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Railay_Beach_5.jpg/960px-Railay_Beach_5.jpg",
  ],

  "India": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/960px-Taj_Mahal_%28Edited%29.jpeg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/960px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/20191219_Fort_Amber%2C_Amer%2C_Jaipur_0955_9481.jpg/960px-20191219_Fort_Amber%2C_Amer%2C_Jaipur_0955_9481.jpg",
  ],

  "Turquía": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hagia_Sophia_%28228968325%29.jpeg/960px-Hagia_Sophia_%28228968325%29.jpeg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Cappadocia_balloon_trip%2C_Ortahisar_Castle_%2811893715185%29.jpg/960px-Cappadocia_balloon_trip%2C_Ortahisar_Castle_%2811893715185%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pamukkale_30.jpg/960px-Pamukkale_30.jpg",
  ],

  // ── EUROPA ──────────────────────────────────────────────────────────────────

  "Italia": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Trevi_Fountain_-_Roma.jpg/960px-Trevi_Fountain_-_Roma.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Italy_-_Pisa_-_Leaning_Tower.jpg/960px-Italy_-_Pisa_-_Leaning_Tower.jpg",
  ],

  "Francia": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/960px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Versailles-Chateau-Jardins02.jpg/960px-Versailles-Chateau-Jardins02.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Mont-Saint-Michel_vu_du_ciel.jpg/960px-Mont-Saint-Michel_vu_du_ciel.jpg",
  ],

  "España": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/%CE%A3%CE%B1%CE%B3%CF%81%CE%AC%CE%B4%CE%B1_%CE%A6%CE%B1%CE%BC%CE%AF%CE%BB%CE%B9%CE%B1_2941.jpg/960px-%CE%A3%CE%B1%CE%B3%CF%81%CE%AC%CE%B4%CE%B1_%CE%A6%CE%B1%CE%BC%CE%AF%CE%BB%CE%B9%CE%B1_2941.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg/960px-Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Palacio_Real_%28Madrid%29_21.jpg/960px-Palacio_Real_%28Madrid%29_21.jpg",
  ],

  "Portugal": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Torre_Bel%C3%A9m_April_2009-4a.jpg/960px-Torre_Bel%C3%A9m_April_2009-4a.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Sintra_Portugal_Pal%C3%A1cio_da_Pena-01.jpg/960px-Sintra_Portugal_Pal%C3%A1cio_da_Pena-01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Rio_Douro_-_Portugal_%2832615481975%29_%28cropped%29.jpg/960px-Rio_Douro_-_Portugal_%2832615481975%29_%28cropped%29.jpg",
  ],

  "Grecia": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/960px-The_Parthenon_in_Athens.jpg",
    "https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Houses_on_the_caldera%2C_Santorini.jpg/960px-Houses_on_the_caldera%2C_Santorini.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Meteora%27s_monastery_2.jpg/960px-Meteora%27s_monastery_2.jpg",
  ],

  "Islandia": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/J%C3%B6kuls%C3%A1rl%C3%B3n_lagoon_in_southeastern_Iceland.jpg/960px-J%C3%B6kuls%C3%A1rl%C3%B3n_lagoon_in_southeastern_Iceland.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Strokkur_Geysir_%2814135319580%29_%28cropped%29.jpg/960px-Strokkur_Geysir_%2814135319580%29_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2008-05-24_35_Sk%C3%B3gafoss.jpg/960px-2008-05-24_35_Sk%C3%B3gafoss.jpg",
  ],

  "Croacia": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg/960px-The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/View_in_Plitvice_Lakes_National_Park.jpg/960px-View_in_Plitvice_Lakes_National_Park.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Croatia-01239_-_The_Peristil_%289551533404%29.jpg/960px-Croatia-01239_-_The_Peristil_%289551533404%29.jpg",
  ],

  // ── ÁFRICA ──────────────────────────────────────────────────────────────────

  "Marruecos": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Pavillon_Menarag%C3%A4rten.jpg/960px-Pavillon_Menarag%C3%A4rten.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Sahara_real_color.jpg/960px-Sahara_real_color.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chefchaouen_%2852189357475%29.jpg/960px-Chefchaouen_%2852189357475%29.jpg",
  ],

  "Egipto": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg/960px-Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Ramsis%2C_Aswan_Governorate%2C_Egypt_-_panoramio.jpg/960px-Ramsis%2C_Aswan_Governorate%2C_Egypt_-_panoramio.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Temple_de_Louxor_68.jpg/960px-Temple_de_Louxor_68.jpg",
  ],

  // ── AMÉRICAS ────────────────────────────────────────────────────────────────

  "Perú": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/960px-Machu_Picchu%2C_2023_%28012%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Monta%C3%B1aarcoirisperuabanto.jpg/960px-Monta%C3%B1aarcoirisperuabanto.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lake_Titicaca_ESA22522896.jpeg/960px-Lake_Titicaca_ESA22522896.jpeg",
  ],

  "México": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/960px-Chichen_Itza_3.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Teotihuac%C3%A1n-5973.JPG/960px-Teotihuac%C3%A1n-5973.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Cenote_2.jpg/960px-Cenote_2.jpg",
  ],

  "Argentina": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Iguazu_Cataratas2.jpg/960px-Iguazu_Cataratas2.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Perito_Moreno_Glacier_2023.jpg/960px-Perito_Moreno_Glacier_2023.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Torres_del_Paine_y_cuernos_del_Paine%2C_montaje.jpg/960px-Torres_del_Paine_y_cuernos_del_Paine%2C_montaje.jpg",
  ],

  "Colombia": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Museo_Naval_del_Caribe.JPG/960px-Museo_Naval_del_Caribe.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ca%C3%B1o_Cristales_01.jpg/960px-Ca%C3%B1o_Cristales_01.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/View_of_Salento%2C_Colombia_01.jpg/960px-View_of_Salento%2C_Colombia_01.jpg",
  ],

  "Costa Rica": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Arenal_volcano_%2870785p%29_%28cropped%29.jpg/960px-Arenal_volcano_%2870785p%29_%28cropped%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Monteverde_bosque.jpg/960px-Monteverde_bosque.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Manuel_antonio_06_april_2005.jpeg/960px-Manuel_antonio_06_april_2005.jpeg",
  ],

  // ── OCEANÍA ─────────────────────────────────────────────────────────────────

  "Australia": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/960px-Sydney_Australia._%2821339175489%29.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/ULURU.jpg/960px-ULURU.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/ISS-45_StoryOfWater%2C_Great_Barrier_Reef%2C_Australia.jpg/960px-ISS-45_StoryOfWater%2C_Great_Barrier_Reef%2C_Australia.jpg",
  ],

  "Nueva Zelanda": [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Milford_Sound_%28New_Zealand%29.JPG/960px-Milford_Sound_%28New_Zealand%29.JPG",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Mt_Cook_LC0247.jpg/960px-Mt_Cook_LC0247.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/c/cc/Tongariro_Mahuia_River_n.jpg",
  ],

};

/**
 * Devuelve el array de imágenes para un destino dado.
 * Acepta nombre exacto o normalizado (sin tildes, en minúsculas).
 */
export function getDestinationImages(name: string): string[] | undefined {
  if (destinationImages[name]) return destinationImages[name];

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const normalizedQuery = normalize(name);
  const match = Object.keys(destinationImages).find(
    (key) => normalize(key) === normalizedQuery
  );
  return match ? destinationImages[match] : undefined;
}
