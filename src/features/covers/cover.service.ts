import crypto from 'crypto';
import fs from 'fs';
import http from 'http';
import https from 'https';
import path from 'path';

const COVERS_DIR = path.join(process.cwd(), 'public', 'covers');

if (!fs.existsSync(COVERS_DIR)) {
  fs.mkdirSync(COVERS_DIR, { recursive: true });
}

function downloadToBuffer(url: string, redirects = 5): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    if (redirects === 0) return reject(new Error('Too many redirects'));

    const protocol = url.startsWith('https') ? https : http;
    const chunks: Buffer[] = [];

    const req = protocol.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const location = res.headers.location;
        if (!location)
          return reject(new Error('Redirect without Location header'));
        res.resume();
        return downloadToBuffer(location, redirects - 1)
          .then(resolve)
          .catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });

    req.on('error', reject);
  });
}

/**
 * Download a remote cover image, save it to public/covers/, and return its local URL.
 * If the file already exists (same URL hash) the download is skipped.
 */
export async function downloadCover(
  remoteUrl: string,
  serverBaseUrl: string,
): Promise<string> {
  const hash = crypto.createHash('md5').update(remoteUrl).digest('hex');
  const ext = /\.png(\?|$)/i.test(remoteUrl) ? 'png' : 'jpg';
  const filename = `${hash}.${ext}`;
  const filePath = path.join(COVERS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    const buffer = await downloadToBuffer(remoteUrl);
    fs.writeFileSync(filePath, buffer);
  }

  return `${serverBaseUrl}/covers/${filename}`;
}
