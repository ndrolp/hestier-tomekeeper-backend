import EPub from 'epub2';
import { EpubMetadata } from './epub.types';

export function getCoverBase64(epub: EPub, coverId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    epub.getImage(coverId, (err, data, mimeType) => {
      if (err) return reject(err);
      // Convert buffer to Base64
      if (!data) return resolve('');
      const base64 = `data:${mimeType};base64,${data.toString('base64')}`;
      resolve(base64);
    });
  });
}

export async function getEpubMetadata(path: string) {
  const metadata: EpubMetadata = await new Promise((resolve, reject) => {
    const epub = new EPub(path);

    epub.on('end', async () => {
      resolve({
        title: epub.metadata.title,
        author: epub.metadata.creator,
        language: epub.metadata.language,
        publisher: epub.metadata.publisher,
        description: epub.metadata.description,
        isbn: epub.metadata.ISBN,
        date: epub.metadata.date,
        cover: await getCoverBase64(epub, epub.metadata.cover),
      });
    });

    epub.on('error', reject);
    epub.parse();
  });

  return metadata;
}
