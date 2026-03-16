import type { WikimediaImage } from '../types/itinerary';

export async function searchImages(destination: string, count = 9): Promise<WikimediaImage[]> {
  const query = destination.split(',')[0].trim();

  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`;
  const searchResponse = await fetch(searchUrl);
  const searchData = await searchResponse.json();

  if (!searchData.query?.search?.length) return [];

  const pageTitle = searchData.query.search[0].title;

  const imagesUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=images&format=json&origin=*&imlimit=20`;
  const imagesResponse = await fetch(imagesUrl);
  const imagesData = await imagesResponse.json();

  const pages = imagesData.query?.pages;
  if (!pages) return [];

  const page = Object.values(pages)[0] as any;
  const imageFiles = (page.images || [])
    .filter((img: any) => {
      const title = img.title.toLowerCase();
      return (
        !title.includes('flag') &&
        !title.includes('icon') &&
        !title.includes('logo') &&
        !title.includes('map') &&
        (title.endsWith('.jpg') || title.endsWith('.jpeg') || title.endsWith('.png'))
      );
    })
    .slice(0, count);

  const imageDetails = await Promise.all(
    imageFiles.map(async (img: any) => {
      try {
        const infoUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(img.title)}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*&iiurlwidth=800`;
        const infoResponse = await fetch(infoUrl);
        const infoData = await infoResponse.json();
        const infoPages = infoData.query?.pages;
        if (!infoPages) return null;
        const infoPage = Object.values(infoPages)[0] as any;
        const imageInfo = infoPage.imageinfo?.[0];
        if (!imageInfo?.url) return null;

        const author =
          imageInfo.extmetadata?.Artist?.value?.replace(/<[^>]*>/g, '') || 'Wikimedia Commons';
        const thumbUrl = imageInfo.thumburl || imageInfo.url;

        return {
          title: img.title.replace('File:', '').replace(/\.[^.]+$/, ''),
          url: imageInfo.url,
          thumbUrl,
          author,
          description:
            imageInfo.extmetadata?.ImageDescription?.value?.replace(/<[^>]*>/g, '') || '',
        };
      } catch {
        return null;
      }
    })
  );

  return imageDetails.filter(Boolean) as WikimediaImage[];
}
