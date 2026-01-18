import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isHidden(name) {
  return name.startsWith('.') || name === 'manifest.json';
}

export function generateManifest() {
  const projectRoot = path.resolve(__dirname, '..');
  const dataDir = path.resolve(projectRoot, 'public', 'data');
  const manifestPath = path.resolve(dataDir, 'manifest.json');

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const entries = fs.readdirSync(dataDir, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => !isHidden(name));

  fs.writeFileSync(manifestPath, JSON.stringify(files, null, 2) + '\n', 'utf8');
  return files;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const files = generateManifest();
  // eslint-disable-next-line no-console
  console.log(
    `[manifest] public/data/manifest.json generated, files: ${files.length}`,
  );
}
