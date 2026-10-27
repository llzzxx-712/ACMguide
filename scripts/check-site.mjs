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
  const joined = file.startsWith(path.resolve('src/content/after-joining') + path.sep);
  const relative = joined ? ['after-joining', 'learn', slug] : ['learn', slug];
  const entry = published.find(item => item.url === `${base}/${relative.join('/')}/`);
  const rendered = html.get(path.join(root, ...relative, 'index.html'));
  if (!entry?.text.trim() || !rendered?.includes('<h2') || rendered.includes('这节课还在准备中')) errors.push(`Missing published lesson content: ${slug}`);
  if (joined) {
    const body = rendered?.split('<div class="article-content">')[1]?.split('<div class="completion">')[0] || '';
    if (!body.includes('AI 伴学提示词') || !body.includes('例题精讲') || !body.includes('推荐必做') || !body.includes('选做巩固') || !body.includes('本节验收')) errors.push(`Missing learning structure: ${slug}`);
    if (!rendered?.includes(`data-lesson="after-joining/${slug}"`)) errors.push(`Missing separate progress identity: ${slug}`);
    // Calendar days inside problem explanations (e.g. borrowing classrooms) are not study schedules.
    const scheduleLabels = [...body.matchAll(/<(?:h[1-6]|span)[^>]*>([^<]*)</g)].map(match=>match[1]).join(' ');
    if (/第\s*\d+\s*[—~～-]?\s*\d*\s*天|推荐天数|建议用时/.test(scheduleLabels) || body.includes('class="day-number"')) errors.push(`Second-block lesson must not schedule study days: ${slug}`);
  }
}
if (!html.get(path.join(root, 'index.html'))?.includes('写给刚入学的你')) errors.push('Missing home content');
const summary=html.get(path.join(root,'summary','index.html'));
if(!summary?.includes('恭喜你，完成了 31 天的学习') || !summary.includes('选择想巩固的部分')) errors.push('Missing graduation summary and practice guidance');
if(!search.some(item=>item.url===`${base}/summary/`)) errors.push('Summary page is missing from search');
// Every day must occur once, including both backpack days and the shifted game lesson.
const roadmap = html.get(path.join(root, 'roadmap', 'index.html')) || '';
const scheduled = [...roadmap.matchAll(/class="day-row">\s*<span class="day">DAY (\d+)<\/span>\s*<a href="([^"]+)"/g)];
if (scheduled.length !== 31 || scheduled.some((row,i)=>Number(row[1])!==i+1)) errors.push('Roadmap must cover days 1 through 31 exactly once');
for (const [day,slug] of [[29,'knapsack'],[30,'knapsack'],[31,'games']]) {
  if (!scheduled.some(row=>Number(row[1])===day && row[2]===`${base}/learn/${slug}/`)) errors.push(`Incorrect lesson on day ${day}`);
}
if (search.some(item=>item.planned && item.url.includes('/learn/'))) errors.push('All nine introductory chapters should be published');
const outline = html.get(path.join(root, 'after-joining', 'index.html')) || '';
const outlineChapters = [...outline.matchAll(/data-outline-chapter="([^"]+)"/g)];
if (!outline.includes('<h1>入队后—寒假前</h1>') || outlineChapters.length !== 25) errors.push('Missing second-block chapter outline');
const outlineBody = outline.split('<div class="article-content">')[1]?.split('<footer class="article-footer">')[0] || '';
const outlinePages = [outlineBody];
let plannedSections = 0;
for (const chapter of outlineChapters) {
  const url = `${base}/after-joining/chapter/${chapter[1]}/`;
  const source = html.get(path.join(root,'after-joining','chapter',chapter[1],'index.html')) || '';
  const body = source.split('<div class="article-content">')[1]?.split('<footer class="article-footer">')[0] || '';
  outlinePages.push(body);
  plannedSections += [...body.matchAll(/data-outline-section/g)].length;
  if (!source || !body.includes('章节与小节') || !body.includes('对应题单')) errors.push(`Missing chapter overview: ${chapter[1]}`);
  const publishedChapter = ['binary-trees','sets-and-dsu','graph-basics','prefix-difference-compression','linear-optimizations','divide-and-doubling','string-algorithms','advanced-search','heap-and-fenwick','advanced-greedy','segment-trees'].includes(chapter[1]);
  if (!search.some(item=>item.planned===!publishedChapter && item.url===url)) errors.push(`Incorrect chapter publication status in search: ${chapter[1]}`);
  if (!source.includes(`data-after-joining-chapter="${chapter[1]}" open`)) errors.push(`Current chapter must open in sidebar: ${chapter[1]}`);
  if (source.includes('id="complete-lesson"')) errors.push(`Planned chapter must not have completion control: ${chapter[1]}`);
}
const combinedOutline = outlinePages.join('');
if (/第\s*\d+\s*[—~～-]?\s*\d*\s*天|Day\s*\d|推荐天数|建议用时|class="day-number"/.test(combinedOutline)) errors.push('Second-block outline must not schedule study days');
if (combinedOutline.includes('高精度') || search.some(item=>item.url.includes('/after-joining/') && /高精度|high-precision/.test(JSON.stringify(item)))) errors.push('High precision must not appear in the second block');
if (plannedSections !== 103) errors.push('Expected 103 sections after adding advanced greedy');
const searchChapter=html.get(path.join(root,'after-joining','chapter','advanced-search','index.html')) || '';
const searchChapterBody=searchChapter.split('<div class="article-content">')[1]?.split('<footer class="article-footer">')[0] || '';
if ([...searchChapterBody.matchAll(/data-outline-section/g)].length !== 2 || /迭代加深|IDA\*|A\*|搜索状态设计与综合应用/.test(searchChapterBody)) errors.push('Chapter 8 must contain only sections 8.1 and 8.2');
// Cover the three foundation groups and all 22 advanced groups retained in this block.
for (const id of [114,115,116,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,221,225]) {
  if (!combinedOutline.includes(`https://www.luogu.com.cn/training/${id}"`)) errors.push(`Missing second-block training group ${id}`);
}
const home = html.get(path.join(root,'index.html')) || '';
const prompt = '我在学习教程https://llzzxx-712.github.io/ACMguide/ ，教我如何下载deepseekharness或workbuddy以及如何使用它们搭配网站教程成为我的伴学';
if (!home.includes(prompt) || !home.includes('data-copy-prompt="ai-companion-prompt"') || !home.includes('两大板块，学到哪里')) errors.push('Missing updated two-block preface or companion prompt');
const joinedPublished = published.filter(item=>item.url.includes('/after-joining/learn/'));
if (joinedPublished.length !== 42 || published.length !== 67 || !outline.includes('0 / 67 节')) errors.push('Progress must include 25 original and 42 second-block lessons, but no outline placeholders');
if (!summary?.includes(`${base}/after-joining/`) || !html.get(path.join(root,'index.html'))?.includes('第二板块 · 入队后—寒假前')) errors.push('Missing entry from first block to second block');
for (const [file,source] of html) {
  if (/30\s*天(?:学习路线|路线|安排)/.test(source)) errors.push(`Stale 30-day route label: ${file}`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Site checks passed: ${htmlFiles.length} pages, ${links} internal links/anchors/assets, ${published.length} published lessons, ${search.length} search entries.`);
