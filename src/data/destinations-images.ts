/**
 * Base de datos de imágenes de Wikimedia Commons para destinos turísticos.
 * Clave: nombre del destino tal como lo devuelve Groq (en español).
 * Valor: array de 3 objetos { url, landmark } verificados mediante la API de Wikipedia.
 */

export interface DestinationImage {
  url: string;
  landmark: string;
}

export const destinationImages: Record<string, DestinationImage[]> = {

  // ── ASIA ────────────────────────────────────────────────────────────────────

  "Japón": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg/960px-Golden_Pavilion_Kinkaku-ji_water_mirror_2024.jpg", landmark: "Pabellón Dorado, Kioto" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg/960px-View_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg", landmark: "Monte Fuji" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg/960px-Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg", landmark: "Santuario Fushimi Inari, Kioto" },
  ],

  "Tailandia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Ao_Nang_beach_panorama_1.jpg/960px-Ao_Nang_beach_panorama_1.jpg", landmark: "Playa de Ao Nang, Krabi" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Wat_Phra_Kaew_by_Ninara_TSP_edit_crop.jpg/960px-Wat_Phra_Kaew_by_Ninara_TSP_edit_crop.jpg", landmark: "Templo del Buda Esmeralda, Bangkok" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Railay_Beach_5.jpg/960px-Railay_Beach_5.jpg", landmark: "Playa Railay, Krabi" },
  ],

  "India": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Taj_Mahal_%28Edited%29.jpeg/960px-Taj_Mahal_%28Edited%29.jpeg", landmark: "Taj Mahal, Agra" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg/960px-East_facade_Hawa_Mahal_Jaipur_from_ground_level_%28July_2022%29_-_img_01.jpg", landmark: "Hawa Mahal, Jaipur" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/20191219_Fort_Amber%2C_Amer%2C_Jaipur_0955_9481.jpg/960px-20191219_Fort_Amber%2C_Amer%2C_Jaipur_0955_9481.jpg", landmark: "Fuerte Amber, Jaipur" },
  ],

  "Sri Lanka": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sigiriya_Rock_Fortress_View_from_Pidurangala_Rock.jpg/960px-Sigiriya_Rock_Fortress_View_from_Pidurangala_Rock.jpg", landmark: "Roca de Sigiriya" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/SL_Kandy_asv2020-01_img34_Sacred_Tooth_Temple.jpg/960px-SL_Kandy_asv2020-01_img34_Sacred_Tooth_Temple.jpg", landmark: "Templo del Diente de Buda, Kandy" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Ella_Nine_Arch_Bridge_Sri_Lanka.jpg/960px-Ella_Nine_Arch_Bridge_Sri_Lanka.jpg", landmark: "Puente de los Nueve Arcos, Ella" },
  ],

  "Turquía": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Hagia_Sophia_%28228968325%29.jpeg/960px-Hagia_Sophia_%28228968325%29.jpeg", landmark: "Santa Sofía, Estambul" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Cappadocia_balloon_trip%2C_Ortahisar_Castle_%2811893715185%29.jpg/960px-Cappadocia_balloon_trip%2C_Ortahisar_Castle_%2811893715185%29.jpg", landmark: "Capadocia en globo" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Pamukkale_30.jpg/960px-Pamukkale_30.jpg", landmark: "Pamukkale" },
  ],

  // ── EUROPA ──────────────────────────────────────────────────────────────────

  "Hungría": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Budapest_Orsz%C3%A1gh%C3%A1z_%2831355012995%29.jpg/960px-Budapest_Orsz%C3%A1gh%C3%A1z_%2831355012995%29.jpg", landmark: "Parlamento de Budapest" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Sz%C3%A9chenyi_Chain_Bridge_in_Budapest_at_night.jpg/960px-Sz%C3%A9chenyi_Chain_Bridge_in_Budapest_at_night.jpg", landmark: "Puente de las Cadenas, Budapest" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Hal%C3%A1szb%C3%A1stya_2017.jpg/960px-Hal%C3%A1szb%C3%A1stya_2017.jpg", landmark: "Bastión de los Pescadores, Budapest" },
  ],

  "Polonia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/20200516_Sukiennice_w_Krakowie_0909_9963.jpg/960px-20200516_Sukiennice_w_Krakowie_0909_9963.jpg", landmark: "Salón de los Paños, Cracovia" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Wawel_%284%29.jpg/960px-Wawel_%284%29.jpg", landmark: "Castillo de Wawel, Cracovia" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Royal_Castle_in_Warsaw%2C_Poland%2C_2022%2C_03.jpg/960px-Royal_Castle_in_Warsaw%2C_Poland%2C_2022%2C_03.jpg", landmark: "Castillo Real de Varsovia" },
  ],

  "Alemania": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Schloss_Neuschwanstein_2013.jpg/960px-Schloss_Neuschwanstein_2013.jpg", landmark: "Castillo de Neuschwanstein" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Brandenburger_Tor_abends.jpg/960px-Brandenburger_Tor_abends.jpg", landmark: "Puerta de Brandeburgo, Berlín" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/K%C3%B6lner_Dom_-_Westfassade_2022_ohne_Ger%C3%BCst-0968_b.jpg/960px-K%C3%B6lner_Dom_-_Westfassade_2022_ohne_Ger%C3%BCst-0968_b.jpg", landmark: "Catedral de Colonia" },
  ],

  "Italia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg", landmark: "Coliseo, Roma" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Trevi_Fountain_-_Roma.jpg/960px-Trevi_Fountain_-_Roma.jpg", landmark: "Fontana di Trevi, Roma" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Italy_-_Pisa_-_Leaning_Tower.jpg/960px-Italy_-_Pisa_-_Leaning_Tower.jpg", landmark: "Torre de Pisa" },
  ],

  "Francia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/960px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg", landmark: "Torre Eiffel, París" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Versailles-Chateau-Jardins02.jpg/960px-Versailles-Chateau-Jardins02.jpg", landmark: "Palacio de Versalles" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Mont-Saint-Michel_vu_du_ciel.jpg/960px-Mont-Saint-Michel_vu_du_ciel.jpg", landmark: "Mont-Saint-Michel" },
  ],

  "España": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/%CE%A3%CE%B1%CE%B3%CF%81%CE%AC%CE%B4%CE%B1_%CE%A6%CE%B1%CE%BC%CE%AF%CE%BB%CE%B9%CE%B1_2941.jpg/960px-%CE%A3%CE%B1%CE%B3%CF%81%CE%AC%CE%B4%CE%B1_%CE%A6%CE%B1%CE%BC%CE%AF%CE%BB%CE%B9%CE%B1_2941.jpg", landmark: "Sagrada Família, Barcelona" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg/960px-Dawn_Charles_V_Palace_Alhambra_Granada_Andalusia_Spain.jpg", landmark: "La Alhambra, Granada" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Palacio_Real_%28Madrid%29_21.jpg/960px-Palacio_Real_%28Madrid%29_21.jpg", landmark: "Palacio Real, Madrid" },
  ],

  "Portugal": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Torre_Bel%C3%A9m_April_2009-4a.jpg/960px-Torre_Bel%C3%A9m_April_2009-4a.jpg", landmark: "Torre de Belém, Lisboa" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Sintra_Portugal_Pal%C3%A1cio_da_Pena-01.jpg/960px-Sintra_Portugal_Pal%C3%A1cio_da_Pena-01.jpg", landmark: "Palacio da Pena, Sintra" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Rio_Douro_-_Portugal_%2832615481975%29_%28cropped%29.jpg/960px-Rio_Douro_-_Portugal_%2832615481975%29_%28cropped%29.jpg", landmark: "Valle del Duero, Oporto" },
  ],

  "Grecia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/The_Parthenon_in_Athens.jpg/960px-The_Parthenon_in_Athens.jpg", landmark: "Partenón, Atenas" },
    { url: "https://upload.wikimedia.org/wikipedia/en/thumb/c/c8/Houses_on_the_caldera%2C_Santorini.jpg/960px-Houses_on_the_caldera%2C_Santorini.jpg", landmark: "Caldera de Santorini" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Meteora%27s_monastery_2.jpg/960px-Meteora%27s_monastery_2.jpg", landmark: "Monasterios de Meteora" },
  ],

  "Islandia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/J%C3%B6kuls%C3%A1rl%C3%B3n_lagoon_in_southeastern_Iceland.jpg/960px-J%C3%B6kuls%C3%A1rl%C3%B3n_lagoon_in_southeastern_Iceland.jpg", landmark: "Laguna Glaciar Jökulsárlón" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Strokkur_Geysir_%2814135319580%29_%28cropped%29.jpg/960px-Strokkur_Geysir_%2814135319580%29_%28cropped%29.jpg", landmark: "Géiser Strokkur" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/2008-05-24_35_Sk%C3%B3gafoss.jpg/960px-2008-05-24_35_Sk%C3%B3gafoss.jpg", landmark: "Cascada Skógafoss" },
  ],

  "Croacia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg/960px-The_walls_of_the_fortress_and_View_of_the_old_city._panorama.jpg", landmark: "Ciudad amurallada de Dubrovnik" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/View_in_Plitvice_Lakes_National_Park.jpg/960px-View_in_Plitvice_Lakes_National_Park.jpg", landmark: "Parque Nacional Lagos de Plitvice" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Croatia-01239_-_The_Peristil_%289551533404%29.jpg/960px-Croatia-01239_-_The_Peristil_%289551533404%29.jpg", landmark: "Palacio de Diocleciano, Split" },
  ],

  // ── ÁFRICA ──────────────────────────────────────────────────────────────────

  "Marruecos": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Pavillon_Menarag%C3%A4rten.jpg/960px-Pavillon_Menarag%C3%A4rten.jpg", landmark: "Jardines de la Menara, Marrakech" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Merzouga_Dunes_2011.jpg/960px-Merzouga_Dunes_2011.jpg", landmark: "Dunas de Erg Chebbi, Merzuga" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Chefchaouen_%2852189357475%29.jpg/960px-Chefchaouen_%2852189357475%29.jpg", landmark: "Ciudad Azul de Chefchauen" },
  ],

  "Egipto": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg/960px-Great_Pyramid_of_Giza_-_Pyramid_of_Khufu.jpg", landmark: "Gran Pirámide de Giza" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Ramsis%2C_Aswan_Governorate%2C_Egypt_-_panoramio.jpg/960px-Ramsis%2C_Aswan_Governorate%2C_Egypt_-_panoramio.jpg", landmark: "Templo de Abu Simbel, Asuán" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Temple_de_Louxor_68.jpg/960px-Temple_de_Louxor_68.jpg", landmark: "Templo de Luxor" },
  ],

  // ── AMÉRICAS ────────────────────────────────────────────────────────────────

  "Perú": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Machu_Picchu%2C_2023_%28012%29.jpg/960px-Machu_Picchu%2C_2023_%28012%29.jpg", landmark: "Machu Picchu" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Monta%C3%B1aarcoirisperuabanto.jpg/960px-Monta%C3%B1aarcoirisperuabanto.jpg", landmark: "Montaña de los Siete Colores" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Lake_Titicaca_ESA22522896.jpeg/960px-Lake_Titicaca_ESA22522896.jpeg", landmark: "Lago Titicaca" },
  ],

  "México": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/960px-Chichen_Itza_3.jpg", landmark: "Chichén Itzá" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Teotihuac%C3%A1n-5973.JPG/960px-Teotihuac%C3%A1n-5973.JPG", landmark: "Pirámides de Teotihuacán" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Cenote_2.jpg/960px-Cenote_2.jpg", landmark: "Cenotes de Yucatán" },
  ],

  "Argentina": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Iguazu_Cataratas2.jpg/960px-Iguazu_Cataratas2.jpg", landmark: "Cataratas del Iguazú" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Perito_Moreno_Glacier_2023.jpg/960px-Perito_Moreno_Glacier_2023.jpg", landmark: "Glaciar Perito Moreno" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Torres_del_Paine_y_cuernos_del_Paine%2C_montaje.jpg/960px-Torres_del_Paine_y_cuernos_del_Paine%2C_montaje.jpg", landmark: "Torres del Paine, Patagonia" },
  ],

  "Colombia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Museo_Naval_del_Caribe.JPG/960px-Museo_Naval_del_Caribe.JPG", landmark: "Ciudad Amurallada de Cartagena" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Ca%C3%B1o_Cristales_01.jpg/960px-Ca%C3%B1o_Cristales_01.jpg", landmark: "Caño Cristales" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/View_of_Salento%2C_Colombia_01.jpg/960px-View_of_Salento%2C_Colombia_01.jpg", landmark: "Valle del Cocora, Salento" },
  ],

  "Costa Rica": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Arenal_volcano_%2870785p%29_%28cropped%29.jpg/960px-Arenal_volcano_%2870785p%29_%28cropped%29.jpg", landmark: "Volcán Arenal" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Monteverde_bosque.jpg/960px-Monteverde_bosque.jpg", landmark: "Bosque Nuboso de Monteverde" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Manuel_antonio_06_april_2005.jpeg/960px-Manuel_antonio_06_april_2005.jpeg", landmark: "Parque Nacional Manuel Antonio" },
  ],

  "Cuba": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Havana_malecon_%28cropped%29.jpg/960px-Havana_malecon_%28cropped%29.jpg", landmark: "Malecón de La Habana" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/El_Capitolio_Havana_Cuba.jpg/960px-El_Capitolio_Havana_Cuba.jpg", landmark: "Capitolio Nacional de La Habana" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Trinidad_in_Kuba.jpg/960px-Trinidad_in_Kuba.jpg", landmark: "Calles coloniales de Trinidad" },
  ],

  "Brasil": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Christ_the_Redeemer_-_Cristo_Redentor.jpg/960px-Christ_the_Redeemer_-_Cristo_Redentor.jpg", landmark: "Cristo Redentor, Río de Janeiro" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Iguazu_Cataratas2.jpg/960px-Iguazu_Cataratas2.jpg", landmark: "Cataratas del Iguazú" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/P%C3%A3o_de_A%C3%A7ucar_-_Sugarloaf_Mountain_-_Zuckerhut_-_2022.jpg/960px-P%C3%A3o_de_A%C3%A7ucar_-_Sugarloaf_Mountain_-_Zuckerhut_-_2022.jpg", landmark: "Pan de Azúcar, Río de Janeiro" },
  ],

  // ── NORTEAMÉRICA ─────────────────────────────────────────────────────────────

  "Estados Unidos": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Canyon_River_Tree_%28165872763%29.jpeg/960px-Canyon_River_Tree_%28165872763%29.jpeg", landmark: "Gran Cañón, Arizona" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Front_view_of_Statue_of_Liberty_%28cropped%29.jpg/960px-Front_view_of_Statue_of_Liberty_%28cropped%29.jpg", landmark: "Estatua de la Libertad, Nueva York" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/7/73/Grand_Canyon_of_yellowstone.jpg", landmark: "Cañón del Yellowstone" },
  ],

  // ── CARIBE ──────────────────────────────────────────────────────────────────

  "República Dominicana": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Cap_Cana_Marina_Dominican_Republic.jpg/960px-Cap_Cana_Marina_Dominican_Republic.jpg", landmark: "Marina de Punta Cana" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/SantoDomingoedit.JPG/960px-SantoDomingoedit.JPG", landmark: "Ciudad Colonial de Santo Domingo" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Los_Haitises_Park.jpeg/960px-Los_Haitises_Park.jpeg", landmark: "Parque Nacional Los Haitises" },
  ],

  // ── SUDAMÉRICA ───────────────────────────────────────────────────────────────

  "Uruguay": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Basilica_del_Sanct%C3%ADsimo_Sacramento.jpg/960px-Basilica_del_Sanct%C3%ADsimo_Sacramento.jpg", landmark: "Colonia del Sacramento" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/4/47/%D0%9F%D1%83%D0%BD%D1%82%D0%B0-%D0%B4%D0%B5%D0%BB%D1%8C-%D0%AD%D1%81%D1%82%D0%B5.jpg", landmark: "Punta del Este" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/PALACIO_LEGISLATIVO_01.JPG/960px-PALACIO_LEGISLATIVO_01.JPG", landmark: "Palacio Legislativo, Montevideo" },
  ],

  // ── ASIA SUDORIENTAL ─────────────────────────────────────────────────────────

  "Vietnam": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Ha_Long_Bay_in_2019.jpg/960px-Ha_Long_Bay_in_2019.jpg", landmark: "Bahía de Ha Long" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/10549-Hoi-An_%2837621348460%29.jpg/960px-10549-Hoi-An_%2837621348460%29.jpg", landmark: "Casco antiguo de Hội An" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Phongnhakebang6.jpg/960px-Phongnhakebang6.jpg", landmark: "Parque Nacional Phong Nha" },
  ],

  "Indonesia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pradaksina.jpg/960px-Pradaksina.jpg", landmark: "Templo de Borobudur, Java" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/TanahLot_2014.JPG/960px-TanahLot_2014.JPG", landmark: "Templo de Tanah Lot, Bali" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Bromo-Semeru-Batok-Widodaren.jpg/960px-Bromo-Semeru-Batok-Widodaren.jpg", landmark: "Volcán Bromo, Java" },
  ],

  // ── ASIA ORIENTAL ────────────────────────────────────────────────────────────

  "Corea del Sur": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg/960px-%EA%B4%91%ED%99%94%EB%AC%B8_%EC%9B%94%EB%8C%80.jpg", landmark: "Palacio Gyeongbokgung, Seúl" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Jeju_Island.jpg/960px-Jeju_Island.jpg", landmark: "Isla de Jeju" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Bukchon_Hanok_Village_01.jpg/960px-Bukchon_Hanok_Village_01.jpg", landmark: "Aldea Bukchon Hanok, Seúl" },
  ],

  // ── MEDIO ORIENTE ────────────────────────────────────────────────────────────

  "Jordania": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Al_Deir_Petra.JPG/960px-Al_Deir_Petra.JPG", landmark: "El Deir, Petra" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Mountain_in_Wadi_Rum%2C_Jordan.jpg/960px-Mountain_in_Wadi_Rum%2C_Jordan.jpg", landmark: "Desierto de Wadi Rum" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Dead_Sea_beach_00.JPG/960px-Dead_Sea_beach_00.JPG", landmark: "Mar Muerto" },
  ],

  "Emiratos Árabes Unidos": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Burj_Khalifa_%2816260269606%29.jpg/960px-Burj_Khalifa_%2816260269606%29.jpg", landmark: "Burj Khalifa, Dubái" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Burj_Al-Arab_%2813996844503%29.jpg/960px-Burj_Al-Arab_%2813996844503%29.jpg", landmark: "Burj Al Arab, Dubái" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Sheikh_Zayed_Grand_Mosque_in_Abu_Dhabi_-_panoramio.jpg/960px-Sheikh_Zayed_Grand_Mosque_in_Abu_Dhabi_-_panoramio.jpg", landmark: "Gran Mezquita Sheikh Zayed, Abu Dabi" },
  ],

  // ── ÁFRICA ───────────────────────────────────────────────────────────────────

  "Sudáfrica": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Table_Mountain_DanieVDM.jpg/960px-Table_Mountain_DanieVDM.jpg", landmark: "Montaña de la Mesa, Ciudad del Cabo" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Kruger_Zebra.JPG/960px-Kruger_Zebra.JPG", landmark: "Parque Nacional Kruger" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Playa_Dias%2C_Cape_Point%2C_Sud%C3%A1frica%2C_2018-07-23%2C_DD_103.jpg/960px-Playa_Dias%2C_Cape_Point%2C_Sud%C3%A1frica%2C_2018-07-23%2C_DD_103.jpg", landmark: "Cabo de Buena Esperanza" },
  ],

  // ── EUROPA NÓRDICA ───────────────────────────────────────────────────────────

  "Noruega": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Geirangerfjord_.jpg/960px-Geirangerfjord_.jpg", landmark: "Fiordo de Geiranger" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Aurora_borealis_over_Eielson_Air_Force_Base%2C_Alaska.jpg/960px-Aurora_borealis_over_Eielson_Air_Force_Base%2C_Alaska.jpg", landmark: "Aurora Boreal" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Lyse_Fjord_et_Preikestolen.jpg/960px-Lyse_Fjord_et_Preikestolen.jpg", landmark: "Preikestolen (Púlpito de Roca)" },
  ],

  // ── NORTEAMÉRICA ─────────────────────────────────────────────────────────────

  "Canadá": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/3Falls_Niagara.jpg/960px-3Falls_Niagara.jpg", landmark: "Cataratas del Niágara" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Moraine_Lake_17092005.jpg/960px-Moraine_Lake_17092005.jpg", landmark: "Lago Moraine, Parque Nacional Banff" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Toronto_Skyline_viewed_from_Algonquin_Island_%2816-9_crop%29.jpg/960px-Toronto_Skyline_viewed_from_Algonquin_Island_%2816-9_crop%29.jpg", landmark: "Skyline de Toronto" },
  ],

  // ── OCEANÍA ─────────────────────────────────────────────────────────────────

  "Australia": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Sydney_Australia._%2821339175489%29.jpg/960px-Sydney_Australia._%2821339175489%29.jpg", landmark: "Ópera de Sídney" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/ULURU.jpg/960px-ULURU.jpg", landmark: "Uluru (Ayers Rock)" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Coral_Outcrop_Flynn_Reef.jpg/960px-Coral_Outcrop_Flynn_Reef.jpg", landmark: "Gran Barrera de Coral" },
  ],

  "Nueva Zelanda": [
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Milford_Sound_%28New_Zealand%29.JPG/960px-Milford_Sound_%28New_Zealand%29.JPG", landmark: "Fiordos de Milford Sound" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Mt_Cook_LC0247.jpg/960px-Mt_Cook_LC0247.jpg", landmark: "Monte Cook" },
    { url: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Tongariro_Mahuia_River_n.jpg", landmark: "Parque Nacional Tongariro" },
  ],

};

/**
 * Devuelve el array de imágenes para un destino dado.
 * Acepta nombre exacto o normalizado (sin tildes, en minúsculas).
 */
export function getDestinationImages(name: string): DestinationImage[] | undefined {
  if (destinationImages[name]) return destinationImages[name];

  const normalize = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const normalizedQuery = normalize(name);
  const match = Object.keys(destinationImages).find(
    (key) => normalize(key) === normalizedQuery
  );
  return match ? destinationImages[match] : undefined;
}
