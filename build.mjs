import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const overlayPath = join(dir, 'overlay.js');
const minPath = join(dir, 'overlay.min.js');
const bookmarkletPath = join(dir, 'bookmarklet.txt');
const installPath = join(dir, 'install.html');
const extensionOverlayPath = join(dir, 'extension', 'overlay.js');

const minified = execSync(`npx --no-install terser ${overlayPath} --compress --mangle`, {
  encoding: 'utf8',
}).trim();
writeFileSync(minPath, `${minified}\n`);

const bookmarklet = `javascript:${encodeURIComponent(minified)}`;
writeFileSync(bookmarkletPath, bookmarklet);

const installHtml = readFileSync(installPath, 'utf8');
const withHref = installHtml.replace(/href="javascript:[^"]*"/, `href="${bookmarklet}"`);
const withTextarea = withHref.replace(
  /(<textarea id="code" readonly>)javascript:[\s\S]*?(<\/textarea>)/,
  `$1${bookmarklet}$2`
);
writeFileSync(installPath, withTextarea);

writeFileSync(extensionOverlayPath, readFileSync(overlayPath, 'utf8'));

console.log(`overlay.min.js: ${minified.length} bytes`);
console.log(`bookmarklet.txt: ${bookmarklet.length} bytes`);
console.log(`extension/overlay.js: synced from overlay.js`);
