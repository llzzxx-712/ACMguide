import { readFile, readdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

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
const cases = {
  setup: [[['','Hello,World!\n']]],
  'hello-world': [[['','Hello,World!\n']], [['','Hello,World!\nI love ACM!\n']]],
  io: [[['3 4\n','3.50\n'],['-3 2\n','-0.50\n'],['1000000000 1000000000\n','1000000000.00\n']], [['3 5\n','15\n'],['3 8\n','24\n'],['2 10\n','20\n'],['1 1\n','1\n'],['1000000000 2\n','2000000000\n']]],
  conditions: [[['6\n','even\n'],['7\n','odd\n'],['-3\n','odd\n'],['0\n','even\n']], [['59\n','C\n'],['60\n','B\n'],['89\n','B\n'],['90\n','A\n']], [['2000\n','1\n'],['1900\n','0\n'],['2024\n','1\n'],['2023\n','0\n']]],
  loops: [[['3\n','1\n2\n3\n'],['1\n','1\n'],['1000\n',Array.from({length:1000},(_,i)=>i+1).join('\n')+'\n']], [['3\n','1\n2\n3\n'],['1\n','1\n'],['1000\n',Array.from({length:1000},(_,i)=>i+1).join('\n')+'\n']], [['2030\n','4\n'],['0\n','1\n'],['9\n','1\n']], [['3\n','*\n**\n***\n'],['1\n','*\n']], [['5\n','15\n'],['1\n','1\n'],['100\n','5050\n']]],
  arrays: [[['2 3\n1 2 3\n4 5 6\n','6\n15\n'],['1 1\n-10\n','-10\n'],['1 3\n1000000000 1000000000 1000000000\n','3000000000\n']], [['2 4 6 8 10 0\n','10 8 6 4 2\n'],['7 0\n','7\n'],['0\n','\n'],[Array.from({length:99},(_,i)=>i+1).join(' ')+' 0\n',Array.from({length:99},(_,i)=>99-i).join(' ')+'\n']], Array.from({length:20},(_,i)=>{const n=2*i+1;return [`${n}\n`,magicSquareOutput(n)];})],
  strings: [[['ACM\n','MCA\n'],['a\n','a\n']], [['I love ACM 2026!\n','8\n'],['\n','0\n'],['123 ?!\n','0\n']], [['aCm123\n','ACM123\n'],['AZ09\n','AZ09\n'],['az\n','AZ\n'],['a'.repeat(100)+'\n','A'.repeat(100)+'\n']]],
  functions: [[['12\n','144\n'],['-1000000000\n','1000000000000000000\n']], [['7\n','8\n'],['-1\n','0\n']], [['3\nalice 100 90 80\nbob 90 100 80\ncarol 100 95 90\n','carol 100 95 90\n'],['1\nalice 0 0 0\n','alice 0 0 0\n'],['3\nalice 100 90 80\nbob 90 100 80\ncarol 90 90 90\n','alice 100 90 80\n'],['1000\nfirst 150 150 150\n'+'other 150 150 150\n'.repeat(999),'first 150 150 150\n']]],
  checkpoint: [[['3\n100 100 100\n104 103 102\n105 105 105\n','2\n'],['2\n100 100 100\n106 100 100\n','0\n'],['2\n100 100 100\n104 104 104\n','0\n'],['2\n100 100 100\n105 105 100\n','1\n'],['1000\n'+'150 150 150\n'.repeat(1000),'499500\n']]]
};
const compiler = process.env.CXX || 'g++';
const standard = process.env.CXX_STANDARD || 'c++17';
const dir = await mkdtemp(path.join(os.tmpdir(), 'acmguide-examples-'));
if (path.dirname(path.resolve(dir)) !== path.resolve(os.tmpdir()) || !path.basename(dir).startsWith('acmguide-examples-')) throw new Error('Unexpected temporary example directory');
let programs = 0, checks = 0;
try {
  const contentDir = path.resolve('src/content/language');
  for (const name of (await readdir(contentDir)).filter(name => name.endsWith('.md'))) {
    const slug = name.slice(0, -3);
    const source = await readFile(path.join(contentDir, name), 'utf8');
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
        const run = spawnSync(exe, [], { input, encoding: 'utf8', timeout: 3000 });
        if (run.error || run.status !== 0 || run.stdout.replaceAll('\r\n','\n') !== expected) throw new Error(`${slug} block ${i+1}: input=${JSON.stringify(input)}, expected=${JSON.stringify(expected)}, actual=${JSON.stringify(run.stdout)}, error=${run.error || run.stderr}`);
        checks++;
      }
      programs++;
    }
  }
  console.log(`C++ examples passed: ${programs} complete programs, ${checks} cases, standard=${standard}.`);
} finally { await rm(dir, { recursive: true, force: true }); }
