import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Controller, Route, Validate } from 'deco-express';
import { Request, Response } from 'express';
import {
  createEdition,
  deleteEdition,
  getEditionById,
  getEditionsForBook,
  setEditionFilePath,
  updateEdition,
} from './editions.service';
import { CreateEditionInput, UpdateEditionInput } from './editions.types';
import {
  CreateEditionValidator,
  UpdateEditionValidator,
} from './editions.validators';

const EBOOKS_DIR = path.join(process.cwd(), 'public', 'ebooks');

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, EBOOKS_DIR),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.epub', '.pdf', '.mobi', '.cbz', '.cbr'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});

@Controller('/editions')
export class EditionsController {
  @Route('get', '/book/:bookId')
  async listEditions(req: Request<{ bookId: string }>, res: Response) {
    const bookId = parseInt(req.params.bookId);
    if (isNaN(bookId))
      return res.status(400).json({ error: 'Invalid book ID.' });
    try {
      const data = await getEditionsForBook(bookId);
      return res.status(200).json(data);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to list editions.' });
    }
  }

  @Route('post', '/')
  @Validate(CreateEditionValidator)
  async createEdition(
    req: Request<object, object, CreateEditionInput>,
    res: Response,
  ) {
    try {
      const edition = await createEdition(req.body);
      return res.status(201).json(edition);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to create edition.' });
    }
  }

  @Route('patch', '/:id')
  @Validate(UpdateEditionValidator)
  async updateEdition(
    req: Request<{ id: string }, object, UpdateEditionInput>,
    res: Response,
  ) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });
    try {
      const edition = await updateEdition(id, req.body);
      if (!edition)
        return res.status(404).json({ error: 'Edition not found.' });
      return res.status(200).json(edition);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to update edition.' });
    }
  }

  @Route('delete', '/:id')
  async deleteEdition(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });
    try {
      const deleted = await deleteEdition(id);
      if (!deleted)
        return res.status(404).json({ error: 'Edition not found.' });
      return res.status(204).send();
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to delete edition.' });
    }
  }

  @Route('post', '/:id/upload', upload.single('file'))
  async uploadFile(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    try {
      const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
      const relPath = `/ebooks/${req.file.filename}`;
      const fileUrl = `${serverBaseUrl}${relPath}`;
      const edition = await setEditionFilePath(id, fileUrl);
      if (!edition) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Edition not found.' });
      }
      return res.status(200).json(edition);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to store file.' });
    }
  }

  @Route('get', '/:id/download')
  async downloadFile(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });

    try {
      const edition = await getEditionById(id);
      if (!edition)
        return res.status(404).json({ error: 'Edition not found.' });
      if (!edition.filePath)
        return res.status(404).json({ error: 'No file for this edition.' });

      // filePath is stored as full URL — extract just the filename
      const filename = path.basename(new URL(edition.filePath).pathname);
      const fileDisk = path.join(EBOOKS_DIR, filename);
      if (!fs.existsSync(fileDisk))
        return res.status(404).json({ error: 'File not found on disk.' });

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`,
      );
      return res.sendFile(fileDisk);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to download file.' });
    }
  }
}
