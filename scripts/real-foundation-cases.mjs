import assert from 'node:assert/strict';

// Deterministic inputs make failures reproducible across runs.
let seed = 20261028;
function randomInt(limit) {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed % limit;
}

function sortCase(values) {
  return [values.length + '\n' + values.join(' ') + '\n',
    [...values].sort((a, b) => a - b).join(' ') + '\n'];
}

// Reconstruct each row by asking whether the unordered edge list contains a pair.
function graphCase(n, edges) {
  const hasEdge = (u, v) => edges.some(([a, b]) => (a === u && b === v) || (a === v && b === u));
  const rows = [];
  for (let u = 1; u <= n; u++) {
    rows.push(Array.from({ length: n }, (_, i) => hasEdge(u, i + 1) ? 1 : 0).join(' '));
  }
  for (let u = 1; u <= n; u++) {
    const neighbors = Array.from({ length: n }, (_, i) => i + 1).filter(v => hasEdge(u, v));
    rows.push([neighbors.length, ...neighbors].join(' '));
  }
  return [`${n} ${edges.length}\n` + edges.map(e => e.join(' ')).join('\n') + '\n', rows.join('\n') + '\n'];
}

// Small graphs use direct containment above; the large star has a closed-form result.
function starCase(n) {
  const edges = Array.from({ length: n - 1 }, (_, i) => [1, n - i]);
  const rows = [];
  for (let u = 1; u <= n; u++) {
    rows.push(Array.from({ length: n }, (_, j) => (u === 1 ? j > 0 : j === 0) ? 1 : 0).join(' '));
  }
  rows.push([n - 1, ...Array.from({ length: n - 1 }, (_, i) => i + 2)].join(' '));
  for (let u = 2; u <= n; u++) rows.push('1 1');
  return [`${n} ${edges.length}\n` + edges.map(e => e.join(' ')).join('\n') + '\n', rows.join('\n') + '\n'];
}

// Follow edges individually rather than building binary-lifting tables.
function pathCase(next, weights, k) {
  const output = next.map((_, start) => {
    let u = start, total = 0n, minimum = Infinity;
    for (let step = 0; step < k; step++) {
      total += BigInt(weights[u]);
      minimum = Math.min(minimum, weights[u]);
      u = next[u];
    }
    return `${total} ${minimum}`;
  });
  return [`${next.length} ${k}\n${next.join(' ')}\n${weights.join(' ')}\n`, output.join('\n') + '\n'];
}
function repeatedLoopCase(n, k, weight) {
  return [`${n} ${k}\n${Array.from({ length: n }, (_, i) => i).join(' ')}\n${Array(n).fill(weight).join(' ')}\n`,
    `${BigInt(k) * BigInt(weight)} ${weight}\n`.repeat(n)];
}

// Exhaustively inspect every nonempty substring on small inputs.
function goodCount(s) {
  let answer = 0;
  for (let left = 0; left < s.length; left++) {
    let sum = 0;
    for (let right = left; right < s.length; right++) {
      sum += Number(s[right]);
      if (sum === right - left + 1) answer++;
    }
  }
  return answer;
}
function digitsCase(strings) {
  return [strings.length + '\n' + strings.map(s => `${s.length}\n${s}`).join('\n') + '\n',
    strings.map(goodCount).join('\n') + '\n'];
}

// Enumerate all subsets, independently of the tutorial search and pruning.
function packCase(capacity, items) {
  let best = 0;
  for (let mask = 0; mask < 2 ** items.length; mask++) {
    let sum = 0;
    for (let i = 0; i < items.length; i++) if ((mask >>> i) & 1) sum += items[i];
    if (sum <= capacity && sum > best) best = sum;
  }
  return [`${capacity}\n${items.length}\n${items.join('\n')}\n`, `${capacity - best}\n`];
}
// A separate attainable-sums table supplies the full-size nontrivial case.
function packScaleCase(capacity, items) {
  const possible = new Uint8Array(capacity + 1);
  possible[0] = 1;
  for (const item of items) {
    for (let sum = capacity; sum >= item; sum--) possible[sum] |= possible[sum - item];
  }
  let best = capacity;
  while (!possible[best]) best--;
  return [`${capacity}\n${items.length}\n${items.join('\n')}\n`, `${capacity - best}\n`];
}

export function applyRealFoundationCases(cases) {
  for (const [slug, minimum] of [['graph-concepts', 2], ['graph-vector', 1],
    ['binary-lifting', 1], ['counting-precomputation', 2], ['search-pruning', 2]]) {
    assert.ok(Array.isArray(cases[slug]) && cases[slug].length >= minimum, `Missing existing case blocks for ${slug}`);
  }

  const sorts = [sortCase([4, 1, 4, 7, 1]), sortCase([1]), sortCase([1000000000, 1, 1000000000]),
    ...Array.from({ length: 30 }, () => sortCase(Array.from({ length: 1 + randomInt(40) }, () => 1 + randomInt(100))))];
  sorts.push(sortCase(Array.from({ length: 100000 }, (_, i) => 1000000000 - i)));

  const graphs = [graphCase(2, [[1, 2]]), graphCase(5, [[1, 3], [1, 2], [3, 4], [2, 4]]),
    graphCase(6, [[3, 5], [1, 6], [2, 5]])];
  for (let t = 0; t < 30; t++) {
    const n = 2 + randomInt(14), edges = [];
    for (let u = 1; u <= n; u++) for (let v = u + 1; v <= n; v++) {
      if (randomInt(4) === 0) edges.push(randomInt(2) ? [u, v] : [v, u]);
    }
    if (!edges.length) edges.push([1, n]);
    edges.reverse();
    graphs.push(graphCase(n, edges));
  }
  graphs.push(starCase(1000));

  const paths = [pathCase([0], [0], 1), pathCase([1, 0], [3, 7], 5),
    pathCase([1, 2, 2], [5, 2, 9], 1)];
  for (let t = 0; t < 30; t++) {
    const n = 1 + randomInt(9);
    paths.push(pathCase(Array.from({ length: n }, () => randomInt(n)),
      Array.from({ length: n }, () => randomInt(101)), 1 + randomInt(30)));
  }
  paths.push(repeatedLoopCase(1, 10000000000, 100000000),
    repeatedLoopCase(10000, 10000000000, 100000000),
    ['2 10000000000\n1 0\n0 100000000\n', '500000000000000000 0\n500000000000000000 0\n']);

  const digitStrings = ['1', '0', '9', '1111', '12012', '010101',
    ...Array.from({ length: 30 }, () => Array.from({ length: 1 + randomInt(25) }, () => randomInt(10)).join(''))];
  const digitCases = [digitsCase(digitStrings), ...digitStrings.slice(6).map(s => digitsCase([s])),
    ['1\n100000\n' + '1'.repeat(100000) + '\n', '5000050000\n'],
    ['2\n50000\n' + '0'.repeat(50000) + '\n50000\n' + '9'.repeat(50000) + '\n', '0\n0\n']];

  const packs = [packCase(24, [8, 3, 12, 7, 9, 7]), packCase(1, [2]),
    packCase(20, [10, 10, 10]), packCase(9, [1, 2, 3, 4]),
    ...Array.from({ length: 30 }, () => {
      const capacity = 1 + randomInt(60), n = 1 + randomInt(12);
      return packCase(capacity, Array.from({ length: n }, () => 1 + randomInt(80)));
    })];
  packs.push(packScaleCase(20000, Array.from({ length: 30 }, (_, i) => 503 + 37 * i)),
    packScaleCase(20000, Array(30).fill(499)), packScaleCase(19999, Array(30).fill(20000)));

  cases['graph-concepts'][0] = sorts;
  cases['graph-concepts'][1] = graphs;
  cases['graph-vector'][0] = graphs;
  cases['binary-lifting'][0] = paths;
  cases['counting-precomputation'][1] = digitCases;
  cases['search-pruning'][0] = packs;
}
