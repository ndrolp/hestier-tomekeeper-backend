import { Controller, Route, Validate } from 'deco-express';
import { Request, Response } from 'express';
import {
  countBooks,
  createBook,
  deleteBook,
  getBookById,
  importBook,
  searchBooks,
  updateBook,
} from './books.service';
import {
  CreateBookInput,
  ImportBookInput,
  SearchBooksOrder,
  UpdateBookInput,
} from './books.types';
import {
  CreateBookValidator,
  ImportBookValidator,
  UpdateBookValidator,
} from './books.validators';
import { downloadCover } from '../covers/cover.service';
import { createQuoteForBook, getQuotesForBook } from '../quotes/quotes.service';

@Controller('/books')
export class BooksController {
  @Route('get', '/')
  async searchBooks(req: Request, res: Response) {
    const {
      query = '',
      page = '1',
      limit = '10',
      orderBy = 'title',
    } = req.query;

    try {
      const books = await searchBooks(
        query.toString(),
        parseInt(page.toString()),
        parseInt(limit.toString()),
        orderBy as SearchBooksOrder,
      );
      const total = await countBooks(query.toString());
      return res.status(200).json({
        data: books,
        total,
        page: parseInt(page.toString()),
        limit: parseInt(limit.toString()),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Error searching books:', msg);
      return res.status(500).json({ error: `Failed to load books: ${msg}` });
    }
  }

  @Route('post', '/')
  @Validate(CreateBookValidator)
  async createBook(
    req: Request<object, object, CreateBookInput>,
    res: Response,
  ) {
    try {
      const input = req.body;
      const newBook = await createBook(input);
      return res.status(201).json(newBook);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while creating the book.' });
    }
  }

  @Route('post', '/import')
  @Validate(ImportBookValidator)
  async importBook(
    req: Request<object, object, ImportBookInput>,
    res: Response,
  ) {
    try {
      const { coverUrl, ...rest } = req.body;
      const serverBaseUrl = `${req.protocol}://${req.get('host')}`;

      let localCoverUrl: string | undefined;
      if (coverUrl) {
        try {
          localCoverUrl = await downloadCover(coverUrl, serverBaseUrl);
        } catch (err) {
          console.warn('Cover download failed, continuing without cover:', err);
        }
      }

      const newBook = await importBook({ ...rest, coverUrl: localCoverUrl });
      return res.status(201).json(newBook);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while importing the book.' });
    }
  }

  @Route('get', '/:id')
  async getBook(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }
    try {
      const book = await getBookById(id);
      if (!book) return res.status(404).json({ error: 'Book not found.' });
      return res.status(200).json(book);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while fetching the book.' });
    }
  }

  @Route('patch', '/:id')
  @Validate(UpdateBookValidator)
  async updateBook(
    req: Request<{ id: string }, object, UpdateBookInput>,
    res: Response,
  ) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid book ID.' });
    try {
      const book = await updateBook(id, req.body);
      if (!book) return res.status(404).json({ error: 'Book not found.' });
      return res.status(200).json(book);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update book.' });
    }
  }

  @Route('delete', '/:id')
  async deleteBook(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid book ID.' });
    try {
      const deleted = await deleteBook(id);
      if (!deleted) return res.status(404).json({ error: 'Book not found.' });
      return res.status(204).send();
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to delete book.' });
    }
  }

  @Route('post', '/:id/quotes')
  async addQuote(req: Request<{ id: string }>, res: Response) {
    const bookId = parseInt(req.params.id);
    const { text, public: isPublic } = req.body;
    const storedBy = 0; //TODO: get user id from auth middleware

    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Quote text is required.' });
    }

    try {
      const quote = await createQuoteForBook(bookId, {
        text: text.trim(),
        storedBy: storedBy || 0,
        isPublic: isPublic || true,
      });
      return res.status(201).json(quote);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while adding the quote.' });
    }
  }

  @Route('get', '/:id/quotes')
  async getQuotes(req: Request<{ id: string }>, res: Response) {
    const bookId = parseInt(req.params.id);
    //TODO: get user id from auth middleware
    const owner = 0;

    if (isNaN(bookId)) {
      return res.status(400).json({ error: 'Invalid book ID.' });
    }

    try {
      const quotes = await getQuotesForBook(bookId, owner);
      return res.status(200).json(quotes);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while fetching quotes.' });
    }
  }
}
