export {};
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector);
const theme = $('#theme-toggle');
theme?.addEventListener('click', () => {
  const dark = document.documentElement.classList.toggle('dark');
  try { localStorage.setItem('acmguide-theme', dark ? 'dark' : 'light'); } catch {}
});
const menu = $('#menu-toggle');
const sidebar = $('#sidebar');
const mobileQuery = matchMedia('(max-width: 859px)');
function syncSidebar() { if (sidebar) sidebar.inert = mobileQuery.matches && !document.body.classList.contains('menu-open'); }
function closeMenu() { document.body.classList.remove('menu-open'); menu?.setAttribute('aria-expanded', 'false'); syncSidebar(); }
menu?.addEventListener('click', () => {
  const open = document.body.classList.toggle('menu-open');
  menu.setAttribute('aria-expanded', String(open));
  syncSidebar();
});
mobileQuery.addEventListener('change', () => { closeMenu(); });
syncSidebar();
$('.sidebar-overlay')?.addEventListener('click', closeMenu);
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

const validLessons = ['setup','hello-world','io','conditions','loops','arrays','strings','functions','checkpoint'];
let done: string[] = [];
try {
  const stored: unknown = JSON.parse(localStorage.getItem('acmguide-completed') || '[]');
  if (Array.isArray(stored)) done = [...new Set(stored.filter((id): id is string => typeof id === 'string' && validLessons.includes(id)))];
} catch {}
const complete = $<HTMLButtonElement>('#complete-lesson');
function updateProgress() {
  const progress = $<HTMLProgressElement>('#course-progress');
  if (progress) progress.value = done.length;
  const text = $('#progress-text');
  if (text) text.textContent = `${done.length} / 9 节`;
  document.querySelectorAll<HTMLElement>('[data-lesson-dot]').forEach(dot => dot.classList.toggle('done', done.includes(dot.dataset.lessonDot || '')));
  if (complete) {
    const checked = done.includes(complete.dataset.lesson || '');
    complete.setAttribute('aria-pressed', String(checked));
    complete.textContent = checked ? '已完成 · 点击撤销 ✓' : '标记为已完成 ✓';
  }
}
updateProgress();
complete?.addEventListener('click', () => {
  const id = complete.dataset.lesson!;
  const next = done.includes(id) ? done.filter(item => item !== id) : [...done, id];
  try { localStorage.setItem('acmguide-completed', JSON.stringify(next)); }
  catch { const status = $('#storage-status'); if (status) status.textContent = '当前浏览器无法保存记录，请检查浏览器的存储设置。'; return; }
  done = next; updateProgress();
});

document.querySelectorAll<HTMLPreElement>('pre').forEach(pre => {
  const button = document.createElement('button');
  button.className = 'copy-code'; button.textContent = '复制代码';
  button.setAttribute('aria-label', '复制这段代码');
  button.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || ''); button.textContent = '已复制 ✓'; }
    catch { button.textContent = '请选中代码复制'; }
    window.setTimeout(() => { button.textContent = '复制代码'; }, 2000);
  });
  pre.appendChild(button);
});

const dialog = $<HTMLDialogElement>('#search-dialog');
const input = $<HTMLInputElement>('#search-input');
const results = $('#search-results');
const status = $('#search-status');
type SearchItem = { title: string; url: string; description: string; text: string; planned: boolean };
let index: SearchItem[] | null = null;
let loading: Promise<void> | null = null;
async function loadIndex() {
  if (index) return;
  if (!loading) loading = (async () => {
    try {
      if (status) status.textContent = '正在加载搜索索引…';
      const response = await fetch(`${document.body.dataset.base}search.json`);
      if (!response.ok) throw new Error('Search unavailable');
      index = await response.json();
      search();
    } catch { if (status) status.textContent = '搜索暂时不可用，请通过左侧章节目录继续阅读。'; }
    finally { loading = null; }
  })();
  await loading;
}
function search() {
  if (!results || !input || !index || !status) return;
  results.replaceChildren();
  const words = input.value.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  if (!words.length) { status.textContent = '输入关键词，查找章节和教程。'; return; }
  const score = (item: SearchItem) => words.reduce((total,word) => total + (item.title.toLocaleLowerCase().includes(word) ? 10 : item.description.toLocaleLowerCase().includes(word) ? 3 : 1),0);
  const matches = index.filter(item => words.every(word => `${item.title} ${item.description} ${item.text}`.toLocaleLowerCase().includes(word))).sort((a,b)=>score(b)-score(a)).slice(0, 20);
  status.textContent = matches.length ? `找到 ${matches.length} 个结果` : '没有找到相关内容，试试更短的关键词。';
  for (const item of matches) {
    const link = document.createElement('a'); link.href = item.url; link.textContent = `${item.title}${item.planned ? ' · 规划中' : ''}`;
    const description = document.createElement('small'); description.textContent = item.description;
    link.appendChild(description); results.appendChild(link);
  }
}
async function openSearch() { closeMenu(); if (!dialog?.open) dialog?.showModal(); input?.focus(); await loadIndex(); }
$('#search-open')?.addEventListener('click', openSearch);
$('#search-close')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
input?.addEventListener('input', search);
document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); void openSearch(); } });

function selectTrack(button: HTMLButtonElement) {
  document.querySelectorAll<HTMLElement>('[data-track]').forEach(tab => { tab.setAttribute('aria-selected', String(tab === button)); tab.tabIndex = tab === button ? 0 : -1; });
  document.querySelectorAll<HTMLElement>('[data-track-panel]').forEach(panel => { panel.hidden = panel.dataset.trackPanel !== button.dataset.track; });
}
document.querySelectorAll<HTMLButtonElement>('[data-track]').forEach(button => {
  button.addEventListener('click', () => selectTrack(button));
  button.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const tabs=[...document.querySelectorAll<HTMLButtonElement>('[data-track]')];
    const current=tabs.indexOf(button);
    const target=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    selectTrack(tabs[target]); tabs[target].focus();
  });
});

const headings = document.querySelectorAll<HTMLElement>('.article-content h2[id],.article-content h3[id]');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries.find(entry => entry.isIntersecting);
    if (!visible) return;
    document.querySelectorAll<HTMLAnchorElement>('.toc a').forEach(link => link.classList.toggle('active', decodeURIComponent(link.hash.slice(1)) === visible.target.id));
  }, { rootMargin: '-100px 0px -65% 0px' });
  headings.forEach(heading => observer.observe(heading));
}
