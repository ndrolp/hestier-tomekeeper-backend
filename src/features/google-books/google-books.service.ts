import https from 'https';
import {
  GoogleBooksApiResponse,
  GoogleBooksLanguage,
  GoogleBooksSearchResult,
} from './google-books.types';

const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1/volumes';

function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk: string) => (data += chunk));
        res.on('end', () => resolve(data));
        res.on('error', reject);
      })
      .on('error', reject);
  });
}

export async function searchGoogleBooks(
  q: string,
  lang: GoogleBooksLanguage = 'all',
  maxResults = 20,
): Promise<GoogleBooksSearchResult[]> {
  const params = new URLSearchParams({
    q,
    maxResults: String(Math.min(maxResults, 40)),
    printType: 'books',
    orderBy: 'relevance',
  });
  if (lang !== 'all') params.set('langRestrict', lang);

  const raw = await httpsGet(`${GOOGLE_BOOKS_BASE}?${params}`);
  const data: GoogleBooksApiResponse = JSON.parse(raw);

  return (data.items ?? []).map((vol) => {
    const info = vol.volumeInfo;

    const isbn = info.industryIdentifiers?.find(
      (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10',
    )?.identifier;

    // Google Books returns HTTP thumbnails — upgrade to HTTPS and remove curl zoom
    const rawThumb =
      info.imageLinks?.thumbnail ?? info.imageLinks?.smallThumbnail;
    const coverUrl = rawThumb
      ? rawThumb
          .replace('http://', 'https://')
          .replace('&edge=curl', '')
          .replace('zoom=1', 'zoom=2')
      : undefined;

    return {
      googleId: vol.id,
      title: info.title,
      authors: info.authors ?? [],
      description: info.description,
      publisher: info.publisher,
      publishedDate: info.publishedDate,
      language: info.language,
      coverUrl,
      isbn,
      categories: info.categories,
      seriesTitle: vol.seriesInfo?.shortSeriesBookTitle,
      seriesBookNumber: vol.seriesInfo?.bookDisplayNumber,
    };
  });
}
