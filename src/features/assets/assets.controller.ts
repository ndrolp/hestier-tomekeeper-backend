import { Controller, Route } from 'deco-express';
import { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/auth';
import {
  pipeVaultFileToResponse,
  VaultHttpError,
} from '../vault/vault.service';

@Controller('/assets')
export class AssetsController {
  @Route('get', '/covers/:fileId/:filename')
  async streamCover(
    req: AuthenticatedRequest<{ fileId: string; filename: string }>,
    res: Response,
  ) {
    try {
      await pipeVaultFileToResponse(req.auth.token, req.params.fileId, res);
    } catch (error) {
      if (error instanceof VaultHttpError) {
        return res.status(error.status).json({ error: error.message });
      }

      console.error(error);
      return res.status(500).json({ error: 'Failed to read cover image.' });
    }
  }

  @Route('get', '/files/:fileId/:filename')
  async streamFile(
    req: AuthenticatedRequest<{ fileId: string; filename: string }>,
    res: Response,
  ) {
    try {
      await pipeVaultFileToResponse(req.auth.token, req.params.fileId, res, {
        range: req.get('range') ?? undefined,
      });
    } catch (error) {
      if (error instanceof VaultHttpError) {
        return res.status(error.status).json({ error: error.message });
      }

      console.error(error);
      return res.status(500).json({ error: 'Failed to read file.' });
    }
  }
}
