import { Controller, Route } from 'deco-express';
import { Response } from 'express';
import { getAllQuotesForUser } from './quotes.service';
import type { AuthenticatedRequest } from '../../types/auth';

@Controller('/quotes')
export class QuotesController {
  @Route('get', '/')
  async getAllQuotes(
    req: AuthenticatedRequest<
      object,
      object,
      object,
      { page?: string; limit?: string }
    >,
    res: Response,
  ) {
    const owner = req.auth.userId;
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
