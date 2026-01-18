import fs from 'fs';
import path from 'path';

function ensureDataDir() {
  const dataDir = path.resolve(process.cwd(), 'public', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return dataDir;
}

function regenerateManifest() {
  const dataDir = ensureDataDir();
  const manifestPath = path.resolve(dataDir, 'manifest.json');
  const entries = fs.readdirSync(dataDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => !name.startsWith('.') && name !== 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2) + '\n', 'utf8');
  return files;
}

function readManifest(): string[] {
  const dataDir = ensureDataDir();
  const manifestPath = path.resolve(dataDir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    return regenerateManifest();
  }
  try {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default {
  'GET /local-api/notebooks': (req: any, res: any) => {
    const files = readManifest();
    res.json({
      success: true,
      data: { files },
      errorCode: 0,
    });
  },
  'POST /local-api/notebooks': (req: any, res: any) => {
    const dataDir = ensureDataDir();
    const title = (req.body?.title || '').toString().trim();
    const safeBase = title
      ? title.replace(/[^a-zA-Z0-9-_\u4e00-\u9fa5]+/g, '-').replace(/-+/g, '-')
      : `Untitled-${Date.now()}`;
    const file = safeBase.endsWith('.ipynb') ? safeBase : `${safeBase}.ipynb`;
    const targetPath = path.resolve(dataDir, file);

    if (fs.existsSync(targetPath)) {
      res.status(409).json({
        success: false,
        errorCode: 409,
        message: 'File already exists',
      });
      return;
    }

    const notebook = {
      cells: [],
      metadata: {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3',
        },
        language_info: {
          name: 'python',
          version: '3.13.5',
        },
      },
      nbformat: 4,
      nbformat_minor: 5,
    };
    fs.writeFileSync(
      targetPath,
      JSON.stringify(notebook, null, 2) + '\n',
      'utf8',
    );

    const files = regenerateManifest();
    res.json({
      success: true,
      data: { file, files },
      errorCode: 0,
    });
  },
};
