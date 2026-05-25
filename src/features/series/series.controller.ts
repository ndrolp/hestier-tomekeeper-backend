import { Controller, Route } from 'deco-express';
import { Request, Response } from 'express';
import { getSeriesById, listSeries } from './series.service';

@Controller('/series')
export class SeriesController {
  @Route('get', '/')
  async list(req: Request, res: Response) {
    const query = req.query.query?.toString() ?? '';

    try {
      const data = await listSeries(query);
      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while fetching series.' });
    }
  }

  @Route('get', '/:id')
  async getById(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid series ID.' });
    }

    try {
      const item = await getSeriesById(id);
      if (!item) {
        return res.status(404).json({ error: 'Series not found.' });
      }

      return res.status(200).json(item);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while fetching the series.' });
    }
  }
}
