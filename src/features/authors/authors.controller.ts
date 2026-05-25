import { Controller, Route } from 'deco-express';
import { Request, Response } from 'express';
import { getAuthorById, listAuthors } from './authors.service';

@Controller('/authors')
export class AuthorsController {
  @Route('get', '/')
  async list(req: Request, res: Response) {
    const query = req.query.query?.toString() ?? '';

    try {
      const data = await listAuthors(query);
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while fetching authors.' });
    }
  }

  @Route('get', '/:id')
  async getById(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid author ID.' });
    }

    try {
      const author = await getAuthorById(id);
      if (!author) {
        return res.status(404).json({ error: 'Author not found.' });
      }

      return res.status(200).json(author);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while fetching the author.' });
    }
  }
}
