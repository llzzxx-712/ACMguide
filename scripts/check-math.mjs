import assert from 'node:assert/strict';
import path from 'node:path';
import {readdir,readFile} from 'node:fs/promises';
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
assert.ok(probe.code.includes('jax="SVG"'));
assert.ok(probe.code.includes('display="true"'));
assert.ok(probe.code.includes('role="math"'));
assert.ok(probe.code.includes('aria-label="a^2+b^2=c^2"'));
assert.ok(probe.code.includes('<code>$x$</code>'));
assert.ok(!probe.code.includes('data-mjx-error'));
const invalidProbe=await renderer.render(String.raw`$\invalidMathCommand$`);
assert.ok(invalidProbe.code.includes('data-mjx-error='),'Invalid TeX must remain detectable by the build check');

async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const root=path.resolve('dist'), files=await walk(root);
let mathPages=0, formulas=0, displayFormulas=0;
for(const file of files.filter(p=>p.endsWith('.html'))){
    const source=await readFile(file,'utf8');
    assert.ok(!source.includes('data-mjx-error=')&&!/<g\b[^>]*data-mml-node="merror"/.test(source)&&!/<[^>]+class="mathjax-error"/.test(source),`Invalid formula: ${file}`);
    assert.ok(!source.includes('class="katex"'),`Stale renderer output: ${file}`);
    const containers=[...source.matchAll(/<mjx-container\b(?:"[^"]*"|'[^']*'|[^'">])*>/g)];
    const count=containers.length;
    for(const [tag] of containers){
        assert.ok(tag.includes('jax="SVG"'),`Formula must contain its own vector glyphs: ${file}`);
        assert.ok(tag.includes('role="math"')&&tag.includes('aria-label=')&&tag.includes('data-math-source='),`Missing formula label or source: ${file}`);
        if(tag.includes('display="true"'))displayFormulas++;
    }
    for(const [formula] of source.matchAll(/<mjx-container\b[\s\S]*?<\/mjx-container>/g)){
        assert.ok(formula.includes('<svg')&&formula.includes('<path'),`Missing vector formula: ${file}`);
        assert.ok(!/<(?:use|image)\b[^>]*(?:href|src)="(?:https?:|\/\/)/.test(formula),`Formula must render without remote assets: ${file}`);
    }
    if(count){mathPages++;formulas+=count;}
}
assert.ok(mathPages>=100,'Math typography must be available across the tutorials');
assert.ok(displayFormulas>=10,'Long derivations must retain display-math layout');
const factorial=await readFile(path.join(root,'after-joining/learn/factorial-combinations/index.html'),'utf8');
assert.ok(factorial.includes('display="true"'),'Factorial derivation must use display-math layout');
assert.ok(factorial.includes('data-math-source="\\dbinom{n}{k}"'),'Inline binomial coefficients must retain readable full height');
for(const file of(await walk('src/content')).filter(p=>p.endsWith('.md')&&!p.endsWith(path.join('language','arrays.md')))){
    const source=(await readFile(file,'utf8')).replace(/```[\s\S]*?```/g,'');
    assert.ok(!/^\s*\$\s*$/m.test(source),`Standalone formulas need paired double-dollar delimiters: ${file}`);
}
const reconstruction=await readFile(path.join(root,'after-joining/learn/tree-reconstruction/index.html'),'utf8');
assert.ok(reconstruction.includes('<code>solve(inLe, inRi, postLe, postRi)</code>'));
assert.ok(reconstruction.includes('<code>[postLe, postLe + leftSize - 1]</code>'));
const dsu=await readFile(path.join(root,'after-joining/learn/dsu/index.html'),'utf8');
assert.ok(dsu.includes('<code>fx = find(x)</code>')&&dsu.includes('<code>f[fx] = fy</code>'));
const styles=await readFile('src/styles/global.css','utf8');
assert.ok(!/(?:^|})\s*svg\s*\{/.test(styles),'Icon sizing must not shrink formula SVGs');
console.log(`MathJax typography checks passed: ${mathPages} pages, ${formulas} vector formulas (${displayFormulas} display), accessible labels, local glyphs and literal code preserved.`);
