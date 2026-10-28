import assert from 'node:assert/strict';

// Every call starts with the same seed, so failures can be reproduced.
let seed;
function rnd(n) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return Math.floor(seed / 0x100000000 * n);
}
const asOutput = values => values.join('\n') + '\n';

// Independently traverse each queried subtree in increasing child order.
function eulerCase(parents, queries) {
  const n = parents.length + 1;
  const children = Array.from({ length: n + 1 }, () => []);
  parents.forEach((p, i) => children[p].push(i + 2));
  const answers = queries.map(([root, k]) => {
    const list = [];
    function visit(u) { list.push(u); for (const v of children[u]) visit(v); }
    visit(root);
    return list[k - 1] ?? -1;
  });
  return [`${n} ${queries.length}\n${parents.join(' ')}\n${queries.map(q => q.join(' ')).join('\n')}\n`, asOutput(answers)];
}
function longChainCase(n) {
  return [`${n} 5\n${Array.from({ length: n - 1 }, (_, i) => i + 1).join(' ')}\n1 ${n}\n1 1\n${n} 1\n${n} 2\n2 ${n - 1}\n`, `${n}\n1\n${n}\n-1\n${n}\n`];
}

// Enumerate distances from all vertices on small trees, rather than using two BFS passes.
function diameterCase(n, edges) {
  const g = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { g[u - 1].push(v - 1); g[v - 1].push(u - 1); }
  let best = 0;
  for (let start = 0; start < n; start++) {
    const distances = Array(n).fill(-1), q = [start];
    distances[start] = 0;
    for (let i = 0; i < q.length; i++) for (const v of g[q[i]]) {
      if (distances[v] === -1) { distances[v] = distances[q[i]] + 1; q.push(v); }
    }
    best = Math.max(best, ...distances);
  }
  return [`${n}\n${edges.map(e => e.join(' ')).join('\n')}\n`, `${best}\n`];
}

// Floyd's algorithm is independent of the tutorial's 0-1 deque.
function tramCase(rows, start, target) {
  const n = rows.length, d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j ? 0 : 1000000));
  rows.forEach((row, u) => row.forEach((v, i) => { d[u][v - 1] = Math.min(d[u][v - 1], i === 0 ? 0 : 1); }));
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);
  const ans = d[start - 1][target - 1];
  return [`${n} ${start} ${target}\n${rows.map(row => [row.length, ...row].join(' ')).join('\n')}\n`, `${ans >= 1000000 ? -1 : ans}\n`];
}

// Enumerate edge subsets and check connectivity directly on tiny graphs.
function mstCase(n, edges) {
  let best = Infinity;
  for (let mask = 0; mask < 2 ** edges.length; mask++) {
    let count = 0, sum = 0;
    const g = Array.from({ length: n }, () => []);
    edges.forEach(([u, v, w], i) => { if ((mask >>> i) & 1) { count++; sum += w; g[u - 1].push(v - 1); g[v - 1].push(u - 1); } });
    if (count !== n - 1) continue;
    const seen = new Set([0]), q = [0];
    for (let i = 0; i < q.length; i++) for (const v of g[q[i]]) if (!seen.has(v)) { seen.add(v); q.push(v); }
    if (seen.size === n) best = Math.min(best, sum);
  }
  return [`${n} ${edges.length}\n${edges.map(e => e.join(' ')).join('\n')}\n`, `${Number.isFinite(best) ? best : 'orz'}\n`];
}

// Enumerate actual sequences of steps on small n; large case uses a sliding sum.
function stairCount(n, k) {
  function visit(remaining) {
    if (remaining === 0) return 1;
    let total = 0;
    for (let step = 1; step <= Math.min(k, remaining); step++) total += visit(remaining - step);
    return total;
  }
  return visit(n) % 100003;
}
function stairScale(n, k) {
  const f = [1]; let window = 1;
  for (let i = 1; i <= n; i++) {
    f[i] = window;
    window = (window + f[i] - (i >= k ? f[i - k] : 0) + 100003) % 100003;
  }
  return [`${n} ${k}\n`, `${f[n]}\n`];
}

// Compare complete subsets by value and then by lexicographic index sequence.
function compareLists(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) return a[i] - b[i];
  return a.length - b.length;
}
function packCase(wLimit, rLimit, items) {
  let best = -1, selected = [];
  for (let mask = 0; mask < 2 ** items.length; mask++) {
    let w = 0, r = 0, val = 0; const indexes = [];
    items.forEach(([iw, ir, iv], i) => { if ((mask >>> i) & 1) { w += iw; r += ir; val += iv; indexes.push(i + 1); } });
    if (w <= wLimit && r <= rLimit && (val > best || (val === best && compareLists(indexes, selected) < 0))) { best = val; selected = indexes; }
  }
  const input = `${wLimit} ${rLimit} ${items.length}\n${items.map(x => x.join(' ')).join('\n')}\n`;
  const expected = `${best}\n${selected.join(' ')}\n`;
  return [input, expected, out => {
    const tokens = out.trim().split(/\s+/);
    return tokens.length === selected.length + 1 && tokens.every((x, i) => /^\d+$/.test(x) && Number(x) === (i === 0 ? best : selected[i - 1]));
  }];
}

export function applyRealTreeDpCases(cases) {
  for (const [slug, count] of [['tree-euler', 1], ['tree-diameter-centroid', 2], ['shortest-relaxation', 1], ['spanning-cut', 1], ['dp-state-review', 1], ['recover-decisions', 1]]) {
    assert.ok(Array.isArray(cases[slug]) && cases[slug].length >= count, `Missing case blocks: ${slug}`);
  }
  seed = 20261028;
  const euler = [eulerCase([1], [[1, 1], [1, 2], [2, 2]])];
  const diam = [diameterCase(1, []), diameterCase(5, [[1, 2], [2, 3], [3, 4], [4, 5]])];
  const tram = [tramCase([[], []], 1, 2), tramCase([[1, 2], [], []], 1, 2), tramCase([[], []], 2, 2)];
  const mst = [mstCase(1, [[1, 1, 10000]]), mstCase(3, [[1, 2, 1], [1, 2, 3]]), mstCase(3, [[1, 2, 2], [2, 3, 3], [1, 3, 9]])];
  const stairs = [[`1 1\n`, `1\n`], [`2 100\n`, `2\n`]];
  const packs = [packCase(5, 5, [[2, 2, 5], [3, 3, 5], [5, 5, 10]]), packCase(1, 1, [[1, 1, 1], [1, 1, 1]]), packCase(2, 2, [[1, 1, 0], [1, 1, 5]])];
  for (let t = 0; t < 30; t++) {
    const n = 2 + rnd(10), parents = Array.from({ length: n - 1 }, (_, i) => 1 + rnd(i + 1));
    euler.push(eulerCase(parents, Array.from({ length: 12 }, () => [1 + rnd(n), 1 + rnd(n)])));
    diam.push(diameterCase(n, parents.map((p, i) => [p, i + 2])));
    const tn = 2 + rnd(7), rows = Array.from({ length: tn }, () => {
      const order = Array.from({ length: tn }, (_, i) => i + 1);
      for (let i = order.length - 1; i > 0; i--) { const j = rnd(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
      return order.slice(0, rnd(tn));
    });
    tram.push(tramCase(rows, 1 + rnd(tn), 1 + rnd(tn)));
    const gn = 2 + rnd(5), edges = Array.from({ length: 1 + rnd(9) }, () => [1 + rnd(gn), 1 + rnd(gn), 1 + rnd(10000)]);
    mst.push(mstCase(gn, edges));
    const ns = 1 + rnd(12), ks = 1 + rnd(10);
    stairs.push([`${ns} ${ks}\n`, `${stairCount(ns, ks)}\n`]);
    const pn = 1 + rnd(10), items = Array.from({ length: pn }, () => [1 + rnd(6), 1 + rnd(6), 1 + rnd(8)]);
    const weightLimit = 1 + rnd(12), resistanceLimit = 1 + rnd(12);
    items[0][0] = Math.min(items[0][0], weightLimit);
    items[0][1] = Math.min(items[0][1], resistanceLimit);
    packs.push(packCase(weightLimit, resistanceLimit, items));
  }
  euler.push(longChainCase(200000));
  const dN = 10000;
  diam.push([`${dN}\n${Array.from({ length: dN - 1 }, (_, i) => `${i + 1} ${i + 2}`).join('\n')}\n`, `${dN - 1}\n`]);
  const mN = 501;
  mst.push([`${mN} ${mN - 1}\n${Array.from({ length: mN - 1 }, (_, i) => `${i + 1} ${i + 2} 10000`).join('\n')}\n`, `${(mN - 1) * 10000}\n`]);
  stairs.push(stairScale(100000, 100), stairScale(100000, 1));
  packs.push(packCase(2, 2, [[1, 1, 1000000], [1, 1, 1000000], [2, 2, 2000000]]));
  packs.push([`200 200 100\n${'1 1 1000000\n'.repeat(100)}`, `100000000\n${Array.from({ length: 100 }, (_, i) => i + 1).join(' ')}\n`]);
  cases['tree-euler'][0] = euler;
  cases['tree-diameter-centroid'][0] = diam;
  cases['shortest-relaxation'][0] = tram;
  cases['spanning-cut'][0] = mst;
  cases['dp-state-review'][0] = stairs;
  cases['recover-decisions'][0] = packs;
}
