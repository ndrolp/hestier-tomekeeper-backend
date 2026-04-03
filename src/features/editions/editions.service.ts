import { eq } from 'drizzle-orm';
import { db } from '../../config/database';
import { editions } from '../../db/edition.schema';
import {
  CreateEditionInput,
  Edition,
  UpdateEditionInput,
} from './editions.types';

export async function getEditionsForBook(bookId: number): Promise<Edition[]> {
  return db.select().from(editions).where(eq(editions.bookId, bookId));
}

export async function getEditionById(id: number): Promise<Edition | null> {
  const rows = await db
    .select()
    .from(editions)
    .where(eq(editions.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function createEdition(
  input: CreateEditionInput,
): Promise<Edition> {
  const rows = await db
    .insert(editions)
    .values({
      bookId: input.bookId,
      name: input.name,
      publisher: input.publisher || null,
      publicationDate: input.publicationDate || null,
      isbn: input.isbn || null,
      format: input.format ?? null,
      language: input.language || null,
      filePath: null,
    })
    .returning();

  if (rows.length === 0) throw new Error('Failed to create edition');
  return rows[0] as Edition;
}

export async function updateEdition(
  id: number,
  input: UpdateEditionInput,
): Promise<Edition | null> {
  const updates: Partial<typeof editions.$inferInsert> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.publisher !== undefined)
    updates.publisher = input.publisher || null;
  if (input.publicationDate !== undefined)
    updates.publicationDate = input.publicationDate || null;
  if (input.isbn !== undefined) updates.isbn = input.isbn || null;
  if (input.format !== undefined) updates.format = input.format ?? null;
  if (input.language !== undefined) updates.language = input.language || null;

  const rows = await db
    .update(editions)
    .set(updates)
    .where(eq(editions.id, id))
    .returning();
  return (rows[0] as Edition) ?? null;
}

export async function setEditionFilePath(
  id: number,
  filePath: string,
): Promise<Edition | null> {
  const rows = await db
    .update(editions)
    .set({ filePath })
    .where(eq(editions.id, id))
    .returning();
  return (rows[0] as Edition) ?? null;
}

export async function deleteEdition(id: number): Promise<boolean> {
  const rows = await db
    .delete(editions)
    .where(eq(editions.id, id))
    .returning({ id: editions.id });
  return rows.length > 0;
}
