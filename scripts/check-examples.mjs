import { readFile, readdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

// Each array corresponds to one complete cpp block in the named tutorial.
// Cases include boundaries that reveal integer division, off-by-one and tie bugs.
// Independent closed-form oracle for P2615, rather than repeating its four branches.
function magicSquareOutput(n) {
  return Array.from({ length: n }, (_, row) =>
    Array.from({ length: n }, (_, col) =>
      n * ((row + col + (n + 1) / 2) % n) + (row + 2 * col + 1) % n + 1
    ).join(' ')
  ).join('\n') + '\n';
}
// Count grid rectangles using line choices and sums of powers, independently of the tutorial loops.
function gridCounts(n, m) {
  const rows = BigInt(n), cols = BigInt(m), k = BigInt(Math.min(n, m));
  const squares = k * (rows + 1n) * (cols + 1n)
    - (rows + cols + 2n) * k * (k + 1n) / 2n
    + k * (k + 1n) * (2n * k + 1n) / 6n;
  const all = rows * (rows + 1n) / 2n * (cols * (cols + 1n) / 2n);
  return `${squares} ${all - squares}\n`;
}
// A different recurrence provides the oracle for the tutorial's sum over all next terms.
function sequenceCount(n) {
  const f = Array(n + 1).fill(1n);
  for (let i = 2; i <= n; i++) {
    f[i] = f[i - 1] + (i % 2 === 0 ? f[i / 2] : 0n);
  }
  return f[n].toString() + '\n';
}
const sequenceCases = [1,2,3,4,5,6,7,8,9,10,17,31,32,99,100,127,256,499,500,999,1000]
  .map(n => [String(n) + '\n', sequenceCount(n)]);
// Exhaustively try subsets for small interval instances; do not use the greedy strategy as oracle.
function intervalCase(matches) {
  let best = 0;
  for (let mask = 0; mask < 2 ** matches.length; mask++) {
    const selected = matches.filter((_, i) => mask & (1 << i)).sort((a,b) => a[0] - b[0]);
    if (selected.every((item,i) => i === 0 || selected[i-1][1] <= item[0])) {
      best = Math.max(best, selected.length);
    }
  }
  return [matches.length + '\n' + matches.map(item=>item.join(' ')).join('\n') + '\n', best + '\n'];
}
function lookupCase(values, queries) {
  const expected = queries.map(x => {
    const index = values.indexOf(x);
    return index === -1 ? -1 : index + 1;
  });
  return [values.length + ' ' + queries.length + '\n' + values.join(' ') + '\n' + queries.join(' ') + '\n', expected.join(' ') + '\n'];
}
// Enumerate every cut height on small cases, independently of the binary search.
function treeCase(heights, need) {
  let best = 0;
  for (let cut = 0; cut <= Math.max(...heights); cut++) {
    if (heights.reduce((sum, h) => sum + Math.max(0, h - cut), 0) >= need) best = cut;
  }
  return [heights.length + ' ' + need + '\n' + heights.join(' ') + '\n', best + '\n'];
}
let randomState = 20261026;
function randomInt(limit) {
  randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
  return randomState % limit;
}
const randomIntervals = Array.from({length:24}, () => intervalCase(
  Array.from({length:8}, () => {
    const start = randomInt(9);
    return [start, start + 1 + randomInt(5)];
  })
));
const randomLookups = Array.from({length:20}, () => {
  const values = Array.from({length:30}, () => randomInt(16)).sort((a,b)=>a-b);
  return lookupCase(values, Array.from({length:20}, () => randomInt(20)));
});
const randomTrees = Array.from({length:24}, () => {
  const heights = Array.from({length:8}, () => 1 + randomInt(20));
  return treeCase(heights, 1 + randomInt(heights.reduce((a,b)=>a+b,0) - 1));
});
const wTable = Array.from({length:21}, () => Array.from({length:21}, () => Array(21).fill(1n)));
for (let a = 1; a <= 20; a++) {
  for (let b = 1; b <= 20; b++) {
    for (let c = 1; c <= 20; c++) {
      wTable[a][b][c] = a < b && b < c
        ? wTable[a][b][c-1] + wTable[a][b-1][c-1] - wTable[a][b-1][c]
        : wTable[a-1][b][c] + wTable[a-1][b-1][c] + wTable[a-1][b][c-1] - wTable[a-1][b-1][c-1];
    }
  }
}
function wCase(queries) {
  return [queries.map(q=>q.join(' ')).join('\n') + '\n-1 -1 -1\n', queries.map(q=>{
    const [a,b,c] = q.map(BigInt);
    const ans = a <= 0n || b <= 0n || c <= 0n ? 1n
      : a > 20n || b > 20n || c > 20n ? wTable[20][20][20]
      : wTable[Number(a)][Number(b)][Number(c)];
    return `w(${q.join(', ')}) = ${ans}\n`;
  }).join('')];
}
function prefixCase(values, ranges) {
  return [values.length + '\n' + values.join(' ') + '\n' + ranges.length + '\n' + ranges.map(q=>q.join(' ')).join('\n') + '\n',
    ranges.map(([l,r])=>values.slice(l-1,r).reduce((a,b)=>a+BigInt(b),0n) + '\n').join('')];
}
const allWQueries = Array.from({length:8000}, (_,i)=>[Math.floor(i/400)+1, Math.floor(i/20)%20+1, i%20+1]);
// Parenthesis oracle removes matched pairs, instead of simulating the tutorial stack.
function bracketsCase(expression) {
  let rest = expression.split('@')[0].replace(/[^()]/g, '');
  while (rest.includes('()')) rest = rest.replaceAll('()', '');
  return [expression + '\n', (rest === '' ? 'YES' : 'NO') + '\n'];
}
// Keep a plain list and search it, independently of the queue plus membership-array solution.
function translationCase(capacity, words) {
  const memory = [];
  let misses = 0;
  for (const word of words) {
    if (memory.includes(word)) continue;
    misses++;
    if (memory.length === capacity) memory.splice(0,1);
    memory.push(word);
  }
  return [capacity + ' ' + words.length + '\n' + words.join(' ') + '\n', misses + '\n'];
}
function selectionCase(values, k) {
  const upper = values.reduce((a,b)=>a+b,0);
  const prime = Array(upper + 1).fill(true);
  prime[0] = prime[1] = false;
  for (let p=2;p*p<=upper;p++) if (prime[p]) {
    for (let multiple=p*p;multiple<=upper;multiple+=p) prime[multiple]=false;
  }
  let answer=0;
  for (let mask=0;mask<2**values.length;mask++) {
    let count=0,sum=0;
    for (let i=0;i<values.length;i++) if (mask & (1<<i)) {
      count++; sum+=values[i];
    }
    if (count===k && prime[sum]) answer++;
  }
  return [values.length + ' ' + k + '\n' + values.join(' ') + '\n', answer + '\n'];
}
// Shifted bit masks provide an independent diagonal representation for n-queens.
function queensCase(n) {
  const mask=(1<<n)-1, first=[], positions=[];
  let total=0;
  function visit(columns,left,right) {
    if (columns===mask) {
      total++;
      if (first.length<3) first.push(positions.join(' '));
      return;
    }
    let free=mask & ~(columns|left|right);
    while (free) {
      const bit=free & -free;
      free-=bit;
      positions.push(1 + Math.log2(bit));
      visit(columns|bit,((left|bit)<<1)&mask,(right|bit)>>>1);
      positions.pop();
    }
  }
  visit(0,0,0);
  assert.equal(total, {6:4,7:40,8:92,9:352,10:724,11:2680,12:14200,13:73712}[n]);
  return [n + '\n', first.join('\n') + '\n' + total + '\n'];
}
// Small boards use all-pairs Floyd-Warshall, rather than another queue implementation.
function knightCase(rows,cols,sx,sy) {
  const count=rows*cols;
  const distance=Array.from({length:count},(_,u)=>Array.from({length:count},(_,v)=>{
    if(u===v) return 0;
    const dx=Math.abs(Math.floor(u/cols)-Math.floor(v/cols));
    const dy=Math.abs(u%cols-v%cols);
    return dx*dy===2 ? 1 : Infinity;
  }));
  for(let k=0;k<count;k++) for(let i=0;i<count;i++) for(let j=0;j<count;j++) {
    distance[i][j]=Math.min(distance[i][j],distance[i][k]+distance[k][j]);
  }
  const start=(sx-1)*cols+sy-1;
  const output=Array.from({length:rows},(_,r)=>Array.from({length:cols},(_,c)=>{
    const value=distance[start][r*cols+c];
    return Number.isFinite(value) ? value : -1;
  }).join(' ')).join('\n')+'\n';
  return [rows+' '+cols+' '+sx+' '+sy+'\n',output];
}
// Union-find counts connected water components, independently of flood-fill traversal.
function lakeCase(grid) {
  const rows=grid.length,cols=grid[0].length;
  const parent=Array.from({length:rows*cols},(_,i)=>i);
  function find(x) { while(parent[x]!==x) { parent[x]=parent[parent[x]];x=parent[x]; } return x; }
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(grid[r][c]==='W') {
    for(let rr=Math.max(0,r-1);rr<=Math.min(rows-1,r+1);rr++) {
      for(let cc=Math.max(0,c-1);cc<=Math.min(cols-1,c+1);cc++) if(grid[rr][cc]==='W') {
        parent[find(r*cols+c)]=find(rr*cols+cc);
      }
    }
  }
  const roots=new Set();
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++) if(grid[r][c]==='W') roots.add(find(r*cols+c));
  return [rows+' '+cols+'\n'+grid.join('\n')+'\n',roots.size+'\n'];
}
const randomBracketCases=Array.from({length:30},()=>bracketsCase(
  Array.from({length:32},()=>['(',')','a','+'][randomInt(997)%4]).join('')+'@'
));
const randomTranslationCases=Array.from({length:25},()=>translationCase(
  1+randomInt(8),Array.from({length:50},()=>randomInt(12))
));
const randomSelectionCases=Array.from({length:20},()=>{
  const n=2+randomInt(9);
  return selectionCase(Array.from({length:n},()=>1+randomInt(35)),1+randomInt(n-1));
});
const randomLakeCases=Array.from({length:25},()=>lakeCase(
  Array.from({length:1+randomInt(6)},()=>Array.from({length:6},()=>randomInt(3)===0 ? 'W' : '.').join(''))
));
const cases = {
  linear: [
    ['@','a+b@','(a+(b*c))@',')(@','((a)@','a)@','()()@','('.repeat(19)+')'.repeat(19)+'@'].map(bracketsCase).concat(randomBracketCases),
    [translationCase(3,[1,2,1,5,4,4,1]),translationCase(1,[0,0,1000,0,1000]),translationCase(100,Array(1000).fill(0)),
      translationCase(100,Array.from({length:1000},(_,i)=>i%101)),...randomTranslationCases]
  ],
  dfs: [
    [[1,1],[2,2],[3,2],[4,1],[1,4],[4,4]].map(([rows,cols])=>{
      const answers=Array.from({length:cols**rows},(_,value)=>
        Array.from({length:rows},(_,index)=>Math.floor(value/cols**(rows-1-index))%cols+1).join(' '));
      return [rows+' '+cols+'\n',answers.join('\n')+'\n'];
    }),
    [selectionCase([3,7,12,19],3),selectionCase([1,1,1],2),selectionCase([1,1,1],1),selectionCase([2,2],1),
      selectionCase(Array(20).fill(1),19),selectionCase(Array(20).fill(2),10),
      ['20 19\n'+'5000000 '.repeat(19)+'5000000\n','0\n'],...randomSelectionCases],
    [6,7,8,9,10,11,12,13].map(queensCase)
  ],
  bfs: [
    [[1,1,1,1],[1,6,1,3],[6,1,4,1],[2,3,1,1],[3,3,1,1],[4,4,2,2],[5,6,5,6],
      ...Array.from({length:16},()=>{const r=1+randomInt(6),c=1+randomInt(6);return [r,c,1+randomInt(r),1+randomInt(c)];})].map(args=>knightCase(...args))
      .concat([['400 1 400 1\n',Array(399).fill('-1\n').join('')+'0\n']]),
    [lakeCase(['W']),lakeCase(['.']),lakeCase(['W.','.W']),lakeCase(['W...W','.W..W','.....','W....']),
      lakeCase(Array(100).fill('W'.repeat(100))),lakeCase(Array(100).fill('.'.repeat(100))),
      lakeCase(Array.from({length:100},(_,r)=>Array.from({length:100},(_,c)=>(r+c)%2 ? '.' : 'W').join(''))),
      ...randomLakeCases]
  ],
  recurrence: [
    [['0\n','1\n'],['1\n','1\n'],['2\n','2\n'],['3\n','3\n'],['5\n','8\n'],['40\n','165580141\n']],
    sequenceCases,
    [prefixCase([2,4,1,5,3],[[2,4],[1,5],[3,3]]),prefixCase([1],[[1,1],[1,1]]),prefixCase([10000,10000,10000],[[1,3],[1,1],[3,3],[2,3]]),
      ['100000\n' + '10000 '.repeat(99999) + '10000\n3\n1 100000\n100000 100000\n1 1\n','1000000000\n10000\n10000\n']]
  ],
  recursion: [
    [['0\n','1\n'],['1\n','1\n'],['3\n','6\n'],['4\n','24\n'],['12\n','479001600\n'],['20\n','2432902008176640000\n']],
    [wCase([[1,1,1],[2,2,2],[30,-1,0],[21,21,21]]),
      wCase([['9223372036854775807','9223372036854775807','9223372036854775807'],['-9223372036854775808',21,21],[30,-1,0],[0,0,0],[-1,1,1],[1,2,3],[20,20,20],[20,1,20]]),
      wCase(allWQueries),wCase(Array.from({length:100000},()=>[1,1,1]))]
  ],
  greedy: [[
    intervalCase([[1,3],[2,4],[3,5],[0,6],[5,7],[7,8]]),
    intervalCase([[0,10],[1,2],[2,3],[3,4]]),
    intervalCase([[0,3],[3,6],[6,9],[2,4]]),
    intervalCase([[0,1]]),
    intervalCase([[5,9],[0,9],[3,9],[8,9]]),
    intervalCase([[2,3],[0,1],[1,2],[4,5],[3,4]]),
    ...randomIntervals,
    ['1000000\n' + '0 1\n'.repeat(1000000), '1\n']
  ]],
  'binary-search': [
    Array.from({length:13},(_,i)=>{const x=i-1,index=[1,2,2,2,5,7,9].indexOf(x);return [x+'\n',(index<0?-1:index+1)+'\n'];}),
    [
    lookupCase([1,2,2,2,5],[2,4,1,6,5]),
    lookupCase([0],[0,1,1000000000]),
    lookupCase([1000000000],[0,999999999,1000000000]),
    lookupCase([7,7,7,7],[6,7,8]),
    lookupCase([0,2,4,6],[0,1,2,3,4,5,6,7]),
    ...randomLookups,
    ['1000000 100000\n' + '7 '.repeat(999999) + '7\n' + Array.from({length:100000},(_,i)=>[0,7,8][i%3]).join(' ') + '\n',
      Array.from({length:100000},(_,i)=>[-1,1,-1][i%3]).join(' ') + '\n']
  ]],
  'binary-answer': [[
    treeCase([20,15,10,17],7),
    treeCase([1,1],1),
    treeCase([10],9),
    treeCase([10],1),
    treeCase([5,5,5],14),
    treeCase([0,0,10,0],5),
    ...randomTrees,
    ['1000000 2000000000\n' + '400000 '.repeat(999999) + '400000\n','398000\n']
  ]],
  simulation: [[['6\n20 21 22 19 20 21\n','3\n'],['1\n0\n','1\n'],['3\n5 5 5\n','1\n'],['5\n5 4 3 2 1\n','1\n'],['6\n3 2 1 2 3 4\n','4\n'],['9\n1 2 3 0 1 2 3 2 1\n','4\n'],['1000000\n'+'0 '.repeat(999999)+'0\n','1\n'],['2\n999999999 1000000000\n','2\n']]],
  sorting: [[['4\n4 1 4 2\n','1 2 4 4\n4 4 2 1\n'],['1\n-7\n','-7\n-7\n'],['5\n-3 0 -3 2 1\n','-3 -3 0 1 2\n2 1 0 -3 -3\n'],['1000\n'+'1 '.repeat(999)+'1\n',('1 '.repeat(999)+'1\n').repeat(2)]], [['6\n90 90 90\n95 85 90\n90 95 85\n100 90 90\n80 80 80\n85 95 95\n','4 280\n6 275\n2 270\n1 270\n3 270\n'],['5\n'+'0 0 0\n'.repeat(5),'1 0\n2 0\n3 0\n4 0\n5 0\n'],['6\n100 0 0\n99 100 100\n100 100 100\n100 99 99\n100 100 99\n100 100 99\n','3 300\n5 299\n6 299\n2 299\n4 298\n'],['300\n'+'100 100 100\n'.repeat(300),'1 300\n2 300\n3 300\n4 300\n5 300\n']]],
  enumeration: [[['5 14\n','3 2\n'],['0 0\n','0 0\n'],['5 11\n','-1\n'],['1 5\n','-1\n'],['1000 4000\n','0 1000\n'],['1000 2000\n','1000 0\n'],['5 100\n','-1\n']], [[1,1],[1,5],[2,3],[3,3],[5000,5000],[2,5000],[5000,1]].map(([n,m])=>[`${n} ${m}\n`,gridCounts(n,m)])],
  setup: [[['','Hello,World!\n']]],
  'hello-world': [[['','Hello,World!\n']], [['','Hello,World!\nI love ACM!\n']]],
  io: [[['3 4\n','3.50\n'],['-3 2\n','-0.50\n'],['1000000000 1000000000\n','1000000000.00\n']], [['3 5\n','15\n'],['3 8\n','24\n'],['2 10\n','20\n'],['1 1\n','1\n'],['1000000000 2\n','2000000000\n']]],
  conditions: [[['6\n','even\n'],['7\n','odd\n'],['-3\n','odd\n'],['0\n','even\n']], [['59\n','C\n'],['60\n','B\n'],['89\n','B\n'],['90\n','A\n']], [['2000\n','1\n'],['1900\n','0\n'],['2024\n','1\n'],['2023\n','0\n']]],
  loops: [[['3\n','1\n2\n3\n'],['1\n','1\n'],['1000\n',Array.from({length:1000},(_,i)=>i+1).join('\n')+'\n']], [['3\n','1\n2\n3\n'],['1\n','1\n'],['1000\n',Array.from({length:1000},(_,i)=>i+1).join('\n')+'\n']], [['2030\n','4\n'],['0\n','1\n'],['9\n','1\n']], [['3\n','*\n**\n***\n'],['1\n','*\n']], [['5\n','15\n'],['1\n','1\n'],['100\n','5050\n']]],
  arrays: [[['2 3\n1 2 3\n4 5 6\n','6\n15\n'],['1 1\n-10\n','-10\n'],['1 3\n1000000000 1000000000 1000000000\n','3000000000\n']], [['2 4 6 8 10 0\n','10 8 6 4 2\n'],['7 0\n','7\n'],['0\n','\n'],[Array.from({length:99},(_,i)=>i+1).join(' ')+' 0\n',Array.from({length:99},(_,i)=>99-i).join(' ')+'\n']], Array.from({length:20},(_,i)=>{const n=2*i+1;return [`${n}\n`,magicSquareOutput(n)];})],
  strings: [[['b\n','B\n'],['a\n','A\n'],['z\n','Z\n'],['M\n','M\n'],['3\n','3\n']], [['ACM\n','MCA\n'],['a\n','a\n']], [['I love ACM 2026!\n','8\n'],['\n','0\n'],['123 ?!\n','0\n']], [['aCm123\n','ACM123\n'],['AZ09\n','AZ09\n'],['az\n','AZ\n'],['a'.repeat(100)+'\n','A'.repeat(100)+'\n']]],
  functions: [[['12\n','144\n'],['-1000000000\n','1000000000000000000\n']], [['7\n','8\n'],['-1\n','0\n']], [['3\nalice 100 90 80\nbob 90 100 80\ncarol 100 95 90\n','carol 100 95 90\n'],['1\nalice 0 0 0\n','alice 0 0 0\n'],['3\nalice 100 90 80\nbob 90 100 80\ncarol 90 90 90\n','alice 100 90 80\n'],['1000\nfirst 150 150 150\n'+'other 150 150 150\n'.repeat(999),'first 150 150 150\n']]],
  checkpoint: [[['3\n100 100 100\n104 103 102\n105 105 105\n','2\n'],['2\n100 100 100\n106 100 100\n','0\n'],['2\n100 100 100\n104 104 104\n','0\n'],['2\n100 100 100\n105 105 100\n','1\n'],['1000\n'+'150 150 150\n'.repeat(1000),'499500\n']]]
};
const compiler = process.env.CXX || 'g++';
const standard = process.env.CXX_STANDARD || 'c++17';
const dir = await mkdtemp(path.join(os.tmpdir(), 'acmguide-examples-'));
if (path.dirname(path.resolve(dir)) !== path.resolve(os.tmpdir()) || !path.basename(dir).startsWith('acmguide-examples-')) throw new Error('Unexpected temporary example directory');
let programs = 0, checks = 0;
async function markdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? markdownFiles(path.join(dir, entry.name))
    : entry.name.endsWith('.md') ? [path.join(dir, entry.name)] : []))).flat();
}
try {
  const files = await markdownFiles(path.resolve('src/content'));
  for (const file of files) {
    const slug = path.basename(file, '.md');
    const source = await readFile(file, 'utf8');
    const blocks = [...source.matchAll(/```cpp\r?\n([\s\S]*?)\r?\n```/g)];
    if (!blocks.length) continue;
    if (!cases[slug] || cases[slug].length !== blocks.length) throw new Error(`Case count differs from actual tutorial: ${slug}`);
    for (let i = 0; i < blocks.length; i++) {
      const cpp = path.join(dir, `${slug}-${i}.cpp`);
      const exe = path.join(dir, `${slug}-${i}${process.platform === 'win32' ? '.exe' : ''}`);
      await writeFile(cpp, blocks[i][1]);
      const compile = spawnSync(compiler, [`-std=${standard}`, '-Wall', '-Wextra', cpp, '-o', exe], { encoding: 'utf8', timeout: 30000 });
      if (compile.error || compile.status !== 0) throw new Error(`${slug} block ${i+1}: ${compile.error || compile.stderr}`);
      if (compile.stderr.trim()) throw new Error(`Compiler warning in ${slug} block ${i+1}: ${compile.stderr}`);
      for (const [input, expected] of cases[slug][i]) {
        const run = spawnSync(exe, [], { input, encoding: 'utf8', timeout: 3000, maxBuffer: 16 * 1024 * 1024 });
        const preview = value => JSON.stringify(value.length <= 200 ? value : value.slice(0,200) + '... [' + value.length + ' characters]');
        if (run.error || run.status !== 0 || run.stdout.replaceAll('\r\n','\n') !== expected) throw new Error(`${slug} block ${i+1}: input=${preview(input)}, expected=${preview(expected)}, actual=${preview(run.stdout)}, error=${run.error || run.stderr}`);
        checks++;
      }
      programs++;
    }
  }
  console.log(`C++ examples passed: ${programs} complete programs, ${checks} cases, standard=${standard}.`);
} finally { await rm(dir, { recursive: true, force: true }); }
