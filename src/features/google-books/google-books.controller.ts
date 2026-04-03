import { Controller, Route } from 'deco-express';
import { Request, Response } from 'express';

import { GoogleBooksLanguage } from './google-books.types';
import { searchGoogleBooks } from './google-books.service';

@Controller('/google-books')
export class GoogleBooksController {
  @Route('get', '/search')
  async search(req: Request, res: Response) {
    const { q = '', lang = 'all', limit = '20' } = req.query;

    const query = q.toString().trim();
    if (!query) {
      return res
        .status(400)
        .json({ error: 'Query parameter "q" is required.' });
    }

    try {
      const results = await searchGoogleBooks(
        query,
        lang.toString() as GoogleBooksLanguage,
        parseInt(limit.toString()),
      );
      return res.status(200).json(results);
    } catch (error) {
      console.error('Google Books search error:', error);
      return res.status(500).json({ error: 'Failed to search Google Books.' });
    }
  }
}
