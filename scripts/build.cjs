'use strict';
const fs = require('fs').promises;
const path = require('path');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const extensions = new Set(['.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.mp3', '.ics', '.woff2']);

async function copy(source, destination) {
  const info = await fs.lstat(source);
  // Publish only site assets, never symlinks, source prompts, or local configuration.
  if (info.isSymbolicLink()) throw new Error('Symbolic links are not publishable: ' + source);
  if (info.isDirectory()) {
    await fs.mkdir(destination, { recursive: true });
    for (const entry of await fs.readdir(source)) await copy(path.join(source, entry), path.join(destination, entry));
  } else if (extensions.has(path.extname(source))) {
    await fs.copyFile(source, destination);
  }
}

(async () => {
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });
  for (const entry of ['index.html', 'css', 'js', 'assets']) await copy(path.join(root, entry), path.join(dist, entry));
  if (process.env.SITE_URL) {
    const site = new URL(process.env.SITE_URL.replace(/\/$/, '') + '/');
    if (site.protocol !== 'https:') throw new Error('SITE_URL must use HTTPS.');
    const html = await fs.readFile(path.join(dist, 'index.html'), 'utf8');
    const published = html.replace(/content="(assets\/og-image\.png(?:\?[^\"]*)?)"/g, (_, imagePath) => {
      const image = new URL(imagePath, site).href.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
      return 'content="' + image + '"';
    });
    await fs.writeFile(path.join(dist, 'index.html'), published);
  }
  await fs.writeFile(path.join(dist, '.nojekyll'), '');
  console.log('Built dist/ — ready for GitHub Pages.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
