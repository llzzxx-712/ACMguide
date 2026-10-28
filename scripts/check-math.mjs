import assert from 'node:assert/strict';
import path from 'node:path';
import {readdir,readFile,stat} from 'node:fs/promises';
import config from '../astro.config.mjs';

// Exercise the same processor used by the site, including code that contains dollars.
const renderer=await config.markdown.processor.createRenderer(config.markdown);
const probe=await renderer.render([
    '行内公式 $a^2+b^2=c^2$，代码 `$x$` 保持原样。',
    '$$',
    String.raw`\begin{aligned}f_i&=\min_{j<i}(f_j+w_{j,i})\\p&=\frac12\end{aligned}`,
    '$$',
    '$$',
    String.raw`\begin{bmatrix}1&2\\3&4\end{bmatrix}`,
    '$$',
    '```cpp',
    'const char* text = "$x$";',
    '```'
].join('\n\n'));
assert.ok(probe.code.includes('class="katex"'));
assert.ok(probe.code.includes('class="katex-display"'));
assert.ok(probe.code.includes('<math'));
assert.ok(probe.code.includes('<code>$x$</code>'));
assert.ok(!probe.code.includes('katex-error'));

async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const root=path.resolve('dist'), files=await walk(root);
let mathPages=0, formulas=0;
for(const file of files.filter(p=>p.endsWith('.html'))){
    const source=await readFile(file,'utf8');
    assert.ok(!source.includes('class="katex-error"'),`Invalid formula: ${file}`);
    const count=[...source.matchAll(/class="katex"/g)].length;
    if(count){mathPages++;formulas+=count;assert.ok(source.includes('<math'),`Missing accessible MathML: ${file}`);}
}
assert.ok(mathPages>=100,'Math typography must be available across the tutorials');
const reconstruction=await readFile(path.join(root,'after-joining/learn/tree-reconstruction/index.html'),'utf8');
assert.ok(reconstruction.includes('<code>solve(inLe, inRi, postLe, postRi)</code>'));
assert.ok(reconstruction.includes('<code>[postLe, postLe + leftSize - 1]</code>'));
const dsu=await readFile(path.join(root,'after-joining/learn/dsu/index.html'),'utf8');
assert.ok(dsu.includes('<code>fx = find(x)</code>')&&dsu.includes('<code>f[fx] = fy</code>'));
let fonts=0;
for(const file of files.filter(p=>p.endsWith('.css'))){
 const css=await readFile(file,'utf8');
 for(const match of css.matchAll(/url\(([^)]+)\)/g)){
    const url=match[1].replace(/^['"]|['"]$/g,'');
    if(!url.includes('KaTeX_'))continue;
    assert.ok(!/^https?:/.test(url),'Formula fonts must be hosted with the website');
    const target=url.startsWith('/ACMguide/')?path.join(root,url.slice('/ACMguide/'.length)):path.resolve(path.dirname(file),url);
    assert.ok(target.startsWith(root+path.sep));
    await stat(target);fonts++;
 }
}
assert.ok(fonts>=20,'Missing bundled KaTeX fonts');
console.log(`Math and typography checks passed: ${mathPages} pages, ${formulas} formulas, ${fonts} local font references, accessible MathML and literal code preserved.`);