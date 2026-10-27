import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve('dist');
const base = '/ACMguide';
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
}
const all = await walk(root);
const htmlFiles = all.filter(file => file.endsWith('.html'));
const html = new Map(await Promise.all(htmlFiles.map(async file => [file, await readFile(file, 'utf8')])));
const errors = [];
let links = 0;
for (const [file, source] of html) {
  if (!source.includes('lang="zh-CN"') || !source.includes('<h1>')) errors.push(`Missing page identity: ${file}`);
  for (const match of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (/^(?:https?:|mailto:|data:|javascript:)/.test(value)) continue;
    const [pathname, hash] = value.split('#');
    let target = file;
    if (pathname) {
      if (pathname.startsWith('/')) {
        if (!pathname.startsWith(`${base}/`)) { errors.push(`Missing GitHub Pages base: ${value} in ${file}`); continue; }
        const relative = decodeURIComponent(pathname.slice(base.length)).replace(/^\//, '');
        target = path.resolve(root, relative);
      } else {
        target = path.resolve(path.dirname(file), decodeURIComponent(pathname));
      }
      if (!(target === root || target.startsWith(root + path.sep))) { errors.push(`Unsafe internal path: ${value}`); continue; }
      try { if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html'); await stat(target); }
      catch { errors.push(`Broken internal link: ${value} in ${file}`); continue; }
    }
    if (hash && html.has(target)) {
      const id = decodeURIComponent(hash);
      if (!html.get(target).includes(`id="${id}"`)) errors.push(`Broken anchor: ${value} in ${file}`);
    }
    links++;
  }
}
const search = JSON.parse(await readFile(path.join(root, 'search.json'), 'utf8'));
const sources = (await walk(path.resolve('src/content'))).filter(file => file.endsWith('.md'));
const published = search.filter(item => !item.planned && item.url.includes('/learn/'));
if (published.length !== sources.length) errors.push('Published lesson count differs from Markdown sources');
for (const file of sources) {
  const slug = path.basename(file, '.md');
  const entry = published.find(item => item.url === `${base}/learn/${slug}/`);
  const rendered = html.get(path.join(root, 'learn', slug, 'index.html'));
  if (!entry?.text.trim() || !rendered?.includes('<h2') || rendered.includes('这节课还在准备中')) errors.push(`Missing published lesson content: ${slug}`);
}
if (!html.get(path.join(root, 'index.html'))?.includes('写给刚入学的你')) errors.push('Missing home content');
// Every day must occur once, including both backpack days and the shifted game lesson.
const roadmap = html.get(path.join(root, 'roadmap', 'index.html')) || '';
const scheduled = [...roadmap.matchAll(/class="day-row">\s*<span class="day">DAY (\d+)<\/span>\s*<a href="([^"]+)"/g)];
if (scheduled.length !== 31 || scheduled.some((row,i)=>Number(row[1])!==i+1)) errors.push('Roadmap must cover days 1 through 31 exactly once');
for (const [day,slug] of [[29,'knapsack'],[30,'knapsack'],[31,'games']]) {
  if (!scheduled.some(row=>Number(row[1])===day && row[2]===`${base}/learn/${slug}/`)) errors.push(`Incorrect lesson on day ${day}`);
}
if (search.some(item=>item.planned)) errors.push('All nine chapters should now be published');
for (const [file,source] of html) {
  if (/30\s*天(?:学习路线|路线|安排)/.test(source)) errors.push(`Stale 30-day route label: ${file}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Site checks passed: ${htmlFiles.length} pages, ${links} internal links/anchors/assets, ${published.length} published lessons, ${search.length} search entries.`);
