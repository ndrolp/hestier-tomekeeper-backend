import path from 'path';
import fs from 'fs';
import os from 'os';
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
import {
  extractVaultFileId,
  pipeVaultFileToResponse,
  uploadVaultAsset,
  VaultHttpError,
} from '../vault/vault.service';
import { getBookById, updateBook } from '../books/books.service';
import { getEpubMetadata } from '../epub/epub.service';

const LOCAL_EBOOKS_DIR = path.join(process.cwd(), 'public', 'ebooks');
const UPLOAD_STAGING_DIR = path.join(os.tmpdir(), 'tomekeeper-uploads');
const ALLOWED_EBOOK_EXTENSIONS = [
  '.epub',
  '.pdf',
  '.mobi',
  '.azw3',
  '.cbz',
  '.cbr',
];
const ALLOWED_EPUB_EXTENSIONS = ['.epub'];

fs.mkdirSync(LOCAL_EBOOKS_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_STAGING_DIR, { recursive: true });

function resolveEditionFile(filePath: string) {
  const filename = path.basename(new URL(filePath).pathname);
  return path.join(LOCAL_EBOOKS_DIR, filename);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_STAGING_DIR),
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

const epubUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_STAGING_DIR),
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${unique}${ext}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(
      null,
      ALLOWED_EPUB_EXTENSIONS.includes(
        path.extname(file.originalname).toLowerCase(),
      ),
    );
  },
});

function normalizeOptionalString(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function getEditionNameFromFile(filename: string) {
  const parsedName = path.parse(filename).name.trim();
  return parsedName || 'Imported EPUB';
}

function parseDataUrlAsset(dataUrl: string) {
  const match = /^data:(?<mimeType>[^;]+);base64,(?<payload>.+)$/.exec(dataUrl);
  if (!match?.groups?.mimeType || !match.groups.payload) {
    return null;
  }

  const extension = match.groups.mimeType.split('/')[1] ?? 'bin';

  return {
    buffer: Buffer.from(match.groups.payload, 'base64'),
    contentType: match.groups.mimeType,
    originalName: `cover.${extension}`,
  };
}

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

  @Route('post', '/book/:bookId/import-epub', epubUpload.single('file'))
  async importEpub(
    req: AuthenticatedRequest<{ bookId: string }>,
    res: Response,
  ) {
    const bookId = parseInt(req.params.bookId);
    if (isNaN(bookId))
      return res.status(400).json({ error: 'Invalid book ID.' });
    if (!req.file) {
      return res.status(400).json({
        error: 'No EPUB uploaded. Supported format: .epub',
      });
    }

    try {
      const existingBook = await getBookById(bookId);
      if (!existingBook) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Book not found.' });
      }

      const metadata = await getEpubMetadata(req.file.path);
      const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
      const createdEdition = await createEdition({
        bookId,
        name:
          normalizeOptionalString(metadata.title) ??
          getEditionNameFromFile(req.file.originalname),
        publisher: normalizeOptionalString(metadata.publisher),
        publicationDate: normalizeOptionalString(metadata.date),
        isbn: normalizeOptionalString(metadata.isbn),
        format: 'Digital',
        language: normalizeOptionalString(metadata.language),
      });

      try {
        const fileUrl = await uploadVaultAsset(
          req.auth.token,
          serverBaseUrl,
          'files',
          {
            buffer: fs.readFileSync(req.file.path),
            contentType: req.file.mimetype,
            originalName: req.file.originalname,
          },
        );
        const edition = await setEditionFilePath(createdEdition.id, fileUrl);
        if (!edition) throw new Error('Failed to update edition file path.');

        let book = existingBook;
        const coverAsset = metadata.cover
          ? parseDataUrlAsset(metadata.cover)
          : null;

        if (coverAsset) {
          const coverUrl = await uploadVaultAsset(
            req.auth.token,
            serverBaseUrl,
            'covers',
            coverAsset,
          );
          const updatedBook = await updateBook(bookId, { coverUrl });
          if (updatedBook) {
            book = updatedBook;
          }
        }

        fs.unlinkSync(req.file.path);
        return res.status(201).json({ edition, book });
      } catch (error) {
        await deleteEdition(createdEdition.id);
        throw error;
      }
    } catch (e) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      if (e instanceof VaultHttpError) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error(e);
      return res.status(500).json({ error: 'Failed to import EPUB.' });
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
  async uploadFile(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });
    if (!req.file)
      return res.status(400).json({
        error: `No file uploaded. Supported formats: ${ALLOWED_EBOOK_EXTENSIONS.join(', ')}`,
      });

    try {
      const existingEdition = await getEditionById(id);
      if (!existingEdition) {
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ error: 'Edition not found.' });
      }

      const serverBaseUrl = `${req.protocol}://${req.get('host')}`;
      const fileUrl = await uploadVaultAsset(
        req.auth.token,
        serverBaseUrl,
        'files',
        {
          buffer: fs.readFileSync(req.file.path),
          contentType: req.file.mimetype,
          originalName: req.file.originalname,
        },
      );
      const edition = await setEditionFilePath(id, fileUrl);
      if (!edition) throw new Error('Failed to update edition file path.');

      fs.unlinkSync(req.file.path);
      return res.status(200).json(edition);
    } catch (e) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      console.error(e);
      return res.status(500).json({ error: 'Failed to store file.' });
    }
  }

  @Route('get', '/:id/download')
  async downloadFile(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });

    try {
      const edition = await getEditionById(id);
      if (!edition)
        return res.status(404).json({ error: 'Edition not found.' });
      if (!edition.filePath)
        return res.status(404).json({ error: 'No file for this edition.' });

      const vaultFileId = extractVaultFileId(edition.filePath);
      if (vaultFileId) {
        await pipeVaultFileToResponse(req.auth.token, vaultFileId, res, {
          download: true,
        });
        return;
      }

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
      if (e instanceof VaultHttpError) {
        return res.status(e.status).json({ error: e.message });
      }
      console.error(e);
      return res.status(500).json({ error: 'Failed to download file.' });
    }
  }

  @Route('get', '/:id/file')
  async readFile(req: AuthenticatedRequest<{ id: string }>, res: Response) {
    const id = parseInt(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ error: 'Invalid edition ID.' });

    try {
      const edition = await getEditionById(id);
      if (!edition)
        return res.status(404).json({ error: 'Edition not found.' });
      if (!edition.filePath)
        return res.status(404).json({ error: 'No file for this edition.' });

      const vaultFileId = extractVaultFileId(edition.filePath);
      if (vaultFileId) {
        await pipeVaultFileToResponse(req.auth.token, vaultFileId, res, {
          range: req.get('range') ?? undefined,
        });
        return;
      }

      const fileDisk = resolveEditionFile(edition.filePath);
      if (!fs.existsSync(fileDisk))
        return res.status(404).json({ error: 'File not found on disk.' });

      const filename = path.basename(fileDisk);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.sendFile(fileDisk);
    } catch (e) {
      if (e instanceof VaultHttpError) {
        return res.status(e.status).json({ error: e.message });
      }
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
