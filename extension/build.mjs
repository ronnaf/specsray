// Keeps extension/overlay.js in sync with the root overlay.js (source of truth).
// The root build.mjs also runs this copy as part of its own build; this file
// exists so `node extension/build.mjs` works standalone too.
//
// It also packages two store-ready zips from the single extension/manifest.json:
// Firefox doesn't support MV3 `background.service_worker` (it's silently
// ignored, which web-ext lint flags), and Chrome doesn't read
// `browser_specific_settings`. extension/manifest.json stays the one manifest
// used for plain Load-unpacked, and is left untouched; the per-browser
// variants only exist inside the generated zips.
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';

const dir = dirname(fileURLToPath(import.meta.url));
const rootOverlayPath = join(dir, '..', 'overlay.js');
const extensionOverlayPath = join(dir, 'overlay.js');

writeFileSync(extensionOverlayPath, readFileSync(rootOverlayPath, 'utf8'));
console.log('extension/overlay.js: synced from ../overlay.js');

const baseManifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));

// Files that make up the shipped extension (excludes design scratch, screenshots,
// build tooling, and OS cruft).
const PACKAGE_FILES = [
  'background.js',
  'overlay.js',
  'manifest.json',
  'icons/icon-16.png',
  'icons/icon-32.png',
  'icons/icon-48.png',
  'icons/icon-128.png',
  'icons/icon.svg',
];

function buildVariant({ name, transformManifest }) {
  const stageDir = mkdtempSync(join(tmpdir(), `specsray-${name}-`));
  for (const file of PACKAGE_FILES) {
    if (file === 'manifest.json') continue;
    const dest = join(stageDir, file);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(join(dir, file), dest);
  }
  const variantManifest = transformManifest(structuredClone(baseManifest));
  writeFileSync(join(stageDir, 'manifest.json'), `${JSON.stringify(variantManifest, null, 2)}\n`);

  const outDir = join(dir, 'web-ext-artifacts');
  mkdirSync(outDir, { recursive: true });
  const zipPath = join(outDir, `specsray-${name}-${baseManifest.version}.zip`);
  rmSync(zipPath, { force: true });
  execFileSync('zip', ['-r', '-X', zipPath, '.'], { cwd: stageDir, stdio: 'inherit' });
  rmSync(stageDir, { recursive: true, force: true });
  return zipPath;
}

const firefoxZip = buildVariant({
  name: 'firefox',
  transformManifest: (manifest) => {
    manifest.background = { scripts: manifest.background.scripts };
    return manifest;
  },
});

const chromeZip = buildVariant({
  name: 'chrome',
  transformManifest: (manifest) => {
    manifest.background = { service_worker: manifest.background.service_worker };
    delete manifest.browser_specific_settings;
    return manifest;
  },
});

console.log(`packaged: ${firefoxZip}`);
console.log(`packaged: ${chromeZip}`);
