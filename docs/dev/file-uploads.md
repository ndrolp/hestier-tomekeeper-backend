# File Uploads

File uploads are handled by **Multer**. Two configurations are in use across the codebase.

## Disk storage — ebook uploads

Used in `src/features/editions/editions.controller.ts`. Files are saved to `public/ebooks/` with a unique timestamped name.

```typescript
const ebookStorage = multer.diskStorage({
  destination: 'public/ebooks/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const uploadEbook = multer({
  storage: ebookStorage,
  limits: { fileSize: 100 * 1024 * 1024 },  // 100 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.epub', '.pdf', '.mobi', '.azw3', '.cbz', '.cbr'];
    cb(null, allowed.includes(path.extname(file.originalname).toLowerCase()));
  },
});
```

Applied to the route:

```typescript
@Route('post', '/:id/upload', [uploadEbook.single('file')])
async upload(req: AuthenticatedRequest, res: Response) { ... }
```

After a successful upload, the service stores the full URL (`http://<host>/ebooks/<filename>`) in the edition's `filePath` column.

## Memory storage — EPUB metadata

Used in `src/features/epub/epub.controller.ts`. The file is held in memory, written to a temporary path, parsed, then deleted regardless of success or failure.

```typescript
const uploadMemory = multer({ storage: multer.memoryStorage() });
```

```typescript
// In epub.service.ts
const tmpPath = path.join(os.tmpdir(), `${uuid()}.epub`);
try {
  fs.writeFileSync(tmpPath, buffer);
  const metadata = await parseEpub(tmpPath);
  return metadata;
} finally {
  fs.unlinkSync(tmpPath);  // always cleaned up
}
```

## Static file serving

Uploaded files are served without authentication:

| Path prefix | Directory | Content |
|-------------|-----------|---------|
| `/covers/` | `public/covers/` | Cover images (downloaded via import) |
| `/ebooks/` | `public/ebooks/` | Uploaded ebook files |

Both are registered in `main.ts` via `express.static`.
