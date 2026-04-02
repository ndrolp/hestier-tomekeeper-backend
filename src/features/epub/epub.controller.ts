import { Request, Response } from 'express';
import { Controller, Route } from 'deco-express';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { getEpubMetadata } from './epub.service';
import { EpubMetadata } from './epub.types';

const memoryStorage = multer({ storage: multer.memoryStorage() });

@Controller('/epub')
export class EpubController {
  @Route('post', '/info', memoryStorage.single('file'))
  async getEpubInfo(req: Request, res: Response) {
    const file = req.file;
    if (!file) throw new Error('No file uploaded');

    let data: EpubMetadata = {};

    const tmpPath = path.join(os.tmpdir(), `epub-${crypto.randomUUID()}.epub`);

    await fs.writeFile(tmpPath, file.buffer);
    try {
      data = await getEpubMetadata(tmpPath);
    } finally {
      await fs.unlink(tmpPath).catch(() => {});
    }

    return res.status(200).json(data);
  }
}
