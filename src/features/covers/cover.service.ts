import http from 'http';
import https from 'https';
import crypto from 'crypto';
import { uploadVaultAsset } from '../vault/vault.service';

function getCoverFilename(url: string) {
  const hash = crypto.createHash('md5').update(url).digest('hex');
  const ext = /\.png(\?|$)/i.test(url) ? 'png' : 'jpg';
  return `${hash}.${ext}`;
}

function downloadToBuffer(
  url: string,
  redirects = 5,
): Promise<{ buffer: Buffer; contentType?: string; finalUrl: string }> {
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
      res.on('end', () =>
        resolve({
          buffer: Buffer.concat(chunks),
          contentType:
            typeof res.headers['content-type'] === 'string'
              ? res.headers['content-type']
              : undefined,
          finalUrl: url,
        }),
      );
      res.on('error', reject);
    });

    req.on('error', reject);
  });
}

export async function downloadCover(
  remoteUrl: string,
  serverBaseUrl: string,
  token: string,
): Promise<string> {
  const { buffer, contentType, finalUrl } = await downloadToBuffer(remoteUrl);

  return uploadVaultAsset(token, serverBaseUrl, 'covers', {
    buffer,
    contentType,
    originalName: getCoverFilename(finalUrl),
  });
}
