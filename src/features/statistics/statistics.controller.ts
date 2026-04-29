import { Controller, Route } from 'deco-express';
import { Request, Response } from 'express';
import { getStatisticsSnapshot } from './statistics.service';

@Controller('/statistics')
export class StatisticsController {
  @Route('get', '/')
  async getStatistics(_req: Request, res: Response) {
    try {
      const snapshot = await getStatisticsSnapshot();
      return res.status(200).json(snapshot);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: 'An error occurred while fetching statistics.' });
    }
  }
}
