import { Readable } from 'stream';
import type { Response as ExpressResponse } from 'express';
import { env } from '../../config/env';

type VaultAssetKind = 'covers' | 'files';

interface VaultFolder {
  id: string;
  name: string;
}

interface VaultFile {
  id: string;
  original_name: string;
}

export class VaultHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'VaultHttpError';
    this.status = status;
  }
}

function createVaultUrl(pathname: string) {
  return new URL(pathname, `${env.VAULT_API_BASE_URL}/`);
}

async function parseVaultError(response: Response) {
  const payload = (await response.json().catch(() => null)) as {
    detail?: string;
    error?: string;
    message?: string;
  } | null;

  return (
    payload?.detail ??
    payload?.error ??
    payload?.message ??
    'Vault request failed.'
  );
}

async function fetchVault(
  pathname: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(createVaultUrl(pathname), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new VaultHttpError(response.status, await parseVaultError(response));
  }

  return response;
}

function getFolderName(kind: VaultAssetKind) {
  return kind === 'covers'
    ? env.VAULT_COVERS_FOLDER_NAME
    : env.VAULT_FILES_FOLDER_NAME;
}

async function ensureFolder(token: string, name: string) {
  const listResponse = await fetchVault('/folders', token);
  const folders = (await listResponse.json()) as VaultFolder[];
  const existingFolder = folders.find((folder) => folder.name === name);

  if (existingFolder) {
    return existingFolder.id;
  }

  const createResponse = await fetchVault('/folders', token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  const folder = (await createResponse.json()) as VaultFolder;
  return folder.id;
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value);
}

export function createVaultAssetUrl(
  serverBaseUrl: string,
  kind: VaultAssetKind,
  fileId: string,
  filename: string,
) {
  return `${serverBaseUrl}${env.API_PREFIX}/assets/${kind}/${encodePathSegment(fileId)}/${encodePathSegment(filename)}`;
}

export function extractVaultFileId(assetUrl: string) {
  const matcher = /\/assets\/(?:covers|files)\/([^/]+)/.exec(assetUrl);
  return matcher?.[1] ? decodeURIComponent(matcher[1]) : null;
}

export async function uploadVaultAsset(
  token: string,
  serverBaseUrl: string,
  kind: VaultAssetKind,
  file: {
    buffer: Buffer;
    originalName: string;
    contentType?: string;
  },
) {
  const folderId = await ensureFolder(token, getFolderName(kind));
  const formData = new FormData();
  const fileBytes = new Uint8Array(file.buffer);

  formData.append(
    'file',
    new Blob([fileBytes], {
      type: file.contentType ?? 'application/octet-stream',
    }),
    file.originalName,
  );
  formData.append('parentId', folderId);

  const response = await fetchVault('/files', token, {
    method: 'POST',
    body: formData,
  });
  const uploadedFile = (await response.json()) as VaultFile;

  return createVaultAssetUrl(
    serverBaseUrl,
    kind,
    uploadedFile.id,
    uploadedFile.original_name || file.originalName,
  );
}

export async function pipeVaultFileToResponse(
  token: string,
  fileId: string,
  res: ExpressResponse,
  options?: {
    download?: boolean;
    range?: string;
  },
) {
  const pathname = options?.download
    ? `/files/${encodeURIComponent(fileId)}/download`
    : `/files/${encodeURIComponent(fileId)}/stream`;

  const requestHeaders = new Headers();
  if (options?.range) {
    requestHeaders.set('Range', options.range);
  }

  const response = await fetchVault(pathname, token, {
    headers: requestHeaders,
  });

  if (!response.body) {
    throw new VaultHttpError(502, 'Vault response did not include a body.');
  }

  for (const headerName of [
    'accept-ranges',
    'content-disposition',
    'content-length',
    'content-range',
    'content-type',
  ]) {
    const value = response.headers.get(headerName);
    if (value) {
      res.setHeader(headerName, value);
    }
  }

  res.status(response.status);
  await new Promise<void>((resolve, reject) => {
    Readable.fromWeb(response.body as globalThis.ReadableStream).pipe(res);
    res.on('finish', () => resolve());
    res.on('error', reject);
  });
}
