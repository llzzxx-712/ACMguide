export const seconds = 1.6;
export const initial = [0, 1, 2, 3, 4, 5, 6, 7, 8];
export const lowbit = x => x & -x;

export function buildFenwickTrace(mode = 'query', options = {}) {
    const a = (options.values || initial).slice();
    const n = a.length - 1, pos = options.pos ?? (mode === 'update' ? 5 : 7);
    const delta = options.delta ?? 10;
    if (!['query', 'update'].includes(mode) || pos < (mode === 'query' ? 0 : 1) || pos > n) throw Error('Invalid Fenwick trace');
    const bit = Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) for (let j = i - lowbit(i) + 1; j <= i; j++) bit[i] += a[j];
    const frames = [], visited = [], covered = [];
    let x = pos, result = 0;
    const push = (event, line, note, active = 0) => frames.push(JSON.parse(JSON.stringify({
        mode, event, line, note, x, result, active, a, bit, visited, covered, pos, delta
    })));
    push('init', 'init', mode === 'query'
        ? `查询前 ${pos} 项，先令 answer=0、x=${pos}。每个 bit[i] 的横条就是它负责的闭区间。`
        : `给第 ${pos} 项加 ${delta}。原数组先从 ${a[pos]} 变成 ${a[pos] + delta}，接下来更新所有包含它的 bit 区间。`);
    if (mode === 'update') { a[pos] += delta; push('array', 'init', `a[${pos}] 已变化；bit 还没有更新，下面沿循环逐个修正包含它的区间。`); }
    while (x > 0 && x <= n) {
        const l = x - lowbit(x) + 1;
        push('visit', 'loop', `x=${x}，lowbit=${lowbit(x)}，bit[${x}] 负责 [${l},${x}]。`, x);
        visited.push(x);
        if (mode === 'query') {
            result += bit[x];
            for (let j = l; j <= x; j++) covered.push(j);
            push('collect', 'change', `取出 bit[${x}]=${bit[x]}，answer 变为 ${result}。绿色区间已统计，彼此不重叠。`, x);
        } else {
            const old = bit[x]; bit[x] += delta;
            push('change', 'change', `bit[${x}] 包含第 ${pos} 项，所以从 ${old} 增加到 ${bit[x]}。紫色是本次更新，绿色是已经更新的区间。`, x);
        }
        const previous = x;
        x += mode === 'query' ? -lowbit(x) : lowbit(x);
        push('move', 'move', mode === 'query'
            ? `x=${previous}−${lowbit(previous)}=${x}，移向尚未统计的前缀。`
            : `x=${previous}+${lowbit(previous)}=${x}，移向更大的包含区间。`);
    }
    push('done', 'done', mode === 'query'
        ? `x=0，结束。前 ${pos} 项由 ${visited.map(i => `[${i-lowbit(i)+1},${i}]`).join('、') || '空区间'} 拼成，答案 ${result}。`
        : `x=${x} 超过 n=${n}，结束。只更新 ${visited.join('、')}；其他区间不包含第 ${pos} 项，保持原值。`);
    return { mode, n, pos, delta, frames, changeStep: frames.findIndex(f => ['collect','change'].includes(f.event)), lastStep: frames.length - 1 };
}
