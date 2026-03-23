import { Request, Response } from 'express';
import { Controller, Route } from 'deco-express';

@Controller('/health')
export class HealthController {
  @Route('get', '/')
  check(_req: Request, res: Response) {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }
}
