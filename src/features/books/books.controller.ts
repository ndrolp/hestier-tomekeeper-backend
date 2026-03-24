import { Controller, Route, Validate } from 'deco-express';
import { Request, Response } from 'express';
import { countBooks, createBook, searchBooks } from './books.service';
import { CreateBookInput, SearchBooksOrder } from './books.types';
import { CreateBookValidator } from './books.validators';

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
}
