import { Controller, Route } from 'deco-express';
import { Request, Response } from 'express';
import { countBooks, searchBooks } from './books.service';
import { SearchBooksOrder } from './books.types';

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
      console.error('Error searching books:', error);
      return res
        .status(500)
        .json({ error: 'An error occurred while searching for books.' });
    }
  }
}
