import { put, list } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { defaultData } from './defaultData';

const LOCAL_DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DATA_FILE = path.join(LOCAL_DATA_DIR, 'remess-data.json');
const BLOB_CONFIG_FILENAME = 'remess-config.json';

// Check if Vercel Blob is configured with an environment token
export function isBlobConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

// Get the latest configuration
export async function getConfig() {
  if (isBlobConfigured()) {
    try {
      const { blobs } = await list({ prefix: BLOB_CONFIG_FILENAME });
      // Sort by uploadedAt descending to always pick the newest blob
      const sortedBlobs = (blobs || []).sort(
        (a, b) => new Date(b.uploadedAt || 0).getTime() - new Date(a.uploadedAt || 0).getTime()
      );
      const targetBlob = sortedBlobs.find(b => b.pathname === BLOB_CONFIG_FILENAME) || sortedBlobs[0];
      
      if (targetBlob && targetBlob.url) {
        // Fetch JSON from Vercel Blob public URL with timestamp cache buster
        const cacheBusterUrl = `${targetBlob.url}${targetBlob.url.includes('?') ? '&' : '?'}v=${Date.now()}`;
        const res = await fetch(cacheBusterUrl, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        if (res.ok) {
          const cloudData = await res.json();
          return {
            ...defaultData,
            ...cloudData,
            general: { ...defaultData.general, ...(cloudData.general || {}) },
            links: { ...defaultData.links, ...(cloudData.links || {}) },
            _source: 'vercel-blob',
            _blobUrl: targetBlob.url,
          };
        }
      }
    } catch (err) {
      console.warn('[Vercel Blob] Could not read blob, falling back to local/default:', err.message);
    }
  }

  // Local fallback (development or without blob token)
  try {
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const raw = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      const localData = JSON.parse(raw);
      return {
        ...defaultData,
        ...localData,
        general: { ...defaultData.general, ...(localData.general || {}) },
        links: { ...defaultData.links, ...(localData.links || {}) },
        _source: 'local-file',
      };
    }
  } catch (err) {
    console.warn('[Storage] Local read error:', err.message);
  }

  return {
    ...defaultData,
    _source: 'default',
  };
}

// Save configuration data
export async function saveConfig(newData) {
  const merged = {
    general: { ...defaultData.general, ...(newData.general || {}) },
    links: { ...defaultData.links, ...(newData.links || {}) },
    updatedAt: new Date().toISOString(),
  };

  let savedSource = 'local-file';
  let blobUrl = null;

  if (isBlobConfigured()) {
    try {
      const blob = await put(BLOB_CONFIG_FILENAME, JSON.stringify(merged, null, 2), {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true, // Crucial: allows overwriting existing blob on Vercel Blob
        contentType: 'application/json',
      });
      savedSource = 'vercel-blob';
      blobUrl = blob.url;
      console.log('[Vercel Blob] Config saved successfully to Blob:', blob.url);
    } catch (err) {
      console.error('[Vercel Blob] Error saving to Blob:', err.message);
      throw new Error(`Erreur Vercel Blob: ${err.message}`);
    }
  }

  // Also write to local storage as fallback/cache if running in standard Node environment
  try {
    if (!fs.existsSync(LOCAL_DATA_DIR)) {
      fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    // In serverless read-only filesystem on Vercel, this may fail, which is expected
    console.log('[Storage] Local disk write skipped or read-only (expected on serverless):', err.message);
  }

  return {
    success: true,
    source: savedSource,
    blobUrl,
    data: merged,
  };
}

// Upload file (like logo) to Vercel Blob or local uploads
export async function uploadMedia(fileBuffer, originalName, mimeType) {
  const cleanName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `uploads/${Date.now()}-${cleanName}`;

  if (isBlobConfigured()) {
    try {
      const blob = await put(filename, fileBuffer, {
        access: 'public',
        contentType: mimeType || 'image/png',
      });
      console.log('[Vercel Blob] Media uploaded to Blob:', blob.url);
      return {
        url: blob.url,
        pathname: blob.pathname,
        source: 'vercel-blob',
      };
    } catch (err) {
      console.error('[Vercel Blob] Error uploading to Blob:', err.message);
      throw err;
    }
  }

  // Local fallback
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const localFilePath = path.join(uploadsDir, `${Date.now()}-${cleanName}`);
  fs.writeFileSync(localFilePath, fileBuffer);

  const localUrl = `/uploads/${path.basename(localFilePath)}`;
  return {
    url: localUrl,
    pathname: localUrl,
    source: 'local-file',
  };
}
