import { db } from '../../config/database';
import { quotes } from '../../db/quotes.schema';

export interface createQuoteData {
  text: string;
  storedBy?: number;
  isPublic?: boolean;
}
export async function createQuoteForBook(
  bookId: number,
  quoteData: createQuoteData,
) {
  const data = await db
    .insert(quotes)
    .values({
      text: quoteData.text,
      storedBy: quoteData.storedBy || 0,
      public: quoteData.isPublic || true,
      bookId,
    })
    .returning();
  if (data.length === 0) throw new Error('Failed to create book');
  return data[0];
}

export async function getQuotesForBook(bookId: number, owner: number = 0) {
  const data = await db.query.quotes.findMany({
    where: {
      bookId,
      OR: [{ storedBy: owner }, { public: true }, { storedBy: 0 }],
    },
  });

  return data;
}

export async function getAllQuotesForUser(
  owner: number = 0,
  page: number = 1,
  pageSize: number = 20,
) {
  const offset = (page - 1) * pageSize;
  const data = await db.query.quotes.findMany({
    where: {
      OR: [{ storedBy: owner }, { public: true }, { storedBy: 0 }],
    },
    with: {
      books: {
        columns: {
          id: true,
          title: true,
        },
      },
    },
    limit: pageSize,
    offset: offset,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return data;
}
