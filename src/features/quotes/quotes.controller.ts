import { Controller, Route } from 'deco-express';
import { Request, Response } from 'express';
import { getAllQuotesForUser } from './quotes.service';

@Controller('/quotes')
export class QuotesController {
  @Route('get', '/')
  async getAllQuotes(req: Request, res: Response) {
    //TODO: get owner from auth
    const owner = 0;
    const { page = '1', limit = '20' } = req.query;
    res
      .status(200)
      .json(
        await getAllQuotesForUser(
          owner,
          parseInt(page.toString()),
          parseInt(limit.toString()),
        ),
      );
  }
}
