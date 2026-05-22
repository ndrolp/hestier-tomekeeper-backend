import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Controller, Route, Validate } from 'deco-express';
import { Request, Response } from 'express';
import {
  createEdition,
  deleteEdition,
  getEditionById,
  getEditionReadingProgress,
  getEditionsForBook,
  setEditionFilePath,
  upsertEditionReadingProgress,
  updateEdition,
} from './editions.service';
import { CreateEditionInput, UpdateEditionInput } from './editions.types';
import type { AuthenticatedRequest } from '../../types/auth';
import {
  CreateEditionValidator,
  UpdateEditionValidator,
} from './editions.validators';

const EBOOKS_DIR = path.join(process.cwd(), 'public', 'ebooks');
const ALLOWED_EBOOK_EXTENSIONS = [
  '.epub',
  '.pdf',
  '.mobi',
  '.azw3',
  '.cbz',
  '.cbr',
];

fs.mkdirSync(EBOOKS_DIR, { recursive: true });

function resolveEditionFile(filePath: string) {
  const filename = path.basename(new URL(filePath).pathname);
  return path.join(EBOOKS_DIR, filename);
}

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
    cb(
      null,
      ALLOWED_EBOOK_EXTENSIONS.includes(
        path.extname(file.originalname).toLowerCase(),
      ),
    );
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
    if (!req.file)
      return res.status(400).json({
        error: `No file uploaded. Supported formats: ${ALLOWED_EBOOK_EXTENSIONS.join(', ')}`,
      });

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

      const filename = path.basename(new URL(edition.filePath).pathname);
      const fileDisk = resolveEditionFile(edition.filePath);
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

  @Route('get', '/:id/file')
  async readFile(req: Request<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });

    try {
      const edition = await getEditionById(id);
      if (!edition)
        return res.status(404).json({ error: 'Edition not found.' });
      if (!edition.filePath)
        return res.status(404).json({ error: 'No file for this edition.' });

      const fileDisk = resolveEditionFile(edition.filePath);
      if (!fs.existsSync(fileDisk))
        return res.status(404).json({ error: 'File not found on disk.' });

      const filename = path.basename(fileDisk);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.sendFile(fileDisk);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ error: 'Failed to read file.' });
    }
  }

  @Route('get', '/:id/progress')
  async getReadingProgress(
    req: AuthenticatedRequest<{ id: string }>,
    res: Response,
  ) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });

    try {
      const edition = await getEditionById(id);
      if (!edition)
        return res.status(404).json({ error: 'Edition not found.' });

      const progress = await getEditionReadingProgress(id, req.auth.userId);
      return res.status(200).json(progress);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .json({ error: 'Failed to load reading progress.' });
    }
  }

  @Route('put', '/:id/progress')
  async updateReadingProgress(
    req: AuthenticatedRequest<
      { id: string },
      object,
      { locator?: string; progressPercentage?: number | null }
    >,
    res: Response,
  ) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });

    const locator =
      typeof req.body?.locator === 'string' ? req.body.locator.trim() : '';
    const progressPercentage = req.body?.progressPercentage;

    if (!locator) {
      return res.status(400).json({ error: 'Reading locator is required.' });
    }

    if (
      progressPercentage !== undefined &&
      progressPercentage !== null &&
      (!Number.isInteger(progressPercentage) ||
        progressPercentage < 0 ||
        progressPercentage > 100)
    ) {
      return res.status(400).json({
        error: 'Reading progress percentage must be between 0 and 100.',
      });
    }

    try {
      const edition = await getEditionById(id);
      if (!edition)
        return res.status(404).json({ error: 'Edition not found.' });

      const progress = await upsertEditionReadingProgress(id, req.auth.userId, {
        locator,
        progressPercentage,
      });
      return res.status(200).json(progress);
    } catch (e) {
      console.error(e);
      return res
        .status(500)
        .json({ error: 'Failed to save reading progress.' });
    }
  }
}
