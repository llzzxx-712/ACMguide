// Every frame is a complete, independent snapshot; moving backwards restores it.
export const seconds = 1.2;
export function buildDsuTrace(mode = 'full') {
    if (!['full', 'compression'].includes(mode)) throw new Error('Unknown DSU mode');
    const f = mode === 'full' ? [0,1,2,3,4,5] : [0,2,3,5,5,5];
    const frames = [];
    let context = '', vars = {}, path = [];
    function emit(event, line, note, changed = 0) {
        frames.push(JSON.parse(JSON.stringify({event,line,note,changed,context,vars,path,parents:f})));
    }
    function find(start, label) {
        context = label; path = [start]; vars = {x:start,root:start,next:null};
        emit('begin', 'init', `从 ${start} 出发，先用 root 沿父指针找代表。`);
        while (f[vars.root] !== vars.root) {
            const previous = vars.root;
            vars.root = f[vars.root]; path.push(vars.root);
            emit('walk', 'walk', `root 从 ${previous} 走到 f[${previous}] = ${vars.root}；x 仍留在起点 ${start}。`);
        }
        const root = vars.root;
        emit('root', 'walk', `f[${root}] = ${root}，找到整组代表 ${root}。现在让 x 沿旧路径再走一趟。`);
        while (vars.x !== root) {
            const x = vars.x;
            vars.next = f[x];
            emit('save', 'save', `先保存 next = f[${x}] = ${vars.next}，记住旧路径的下一站。`);
            f[x] = root;
            emit('redirect', 'redirect', `把 f[${x}] 改成 ${root}。next 仍是 ${vars.next}，旧路径没有丢失。`, x);
            vars.x = vars.next;
            emit('advance', 'advance', `x = next，继续到 ${vars.x}。这里用事先保存的 next，而不是已经改过的 f[x]。`);
        }
        emit('return', 'return', `返回代表 ${root}。只改父指针，成员仍属于原来的组。`);
        return root;
    }
    function merge(a, b) {
        const fx = find(a, `合并 ${a}、${b}：先查找 ${a}`);
        const fy = find(b, `合并 ${a}、${b}：再查找 ${b}`);
        context = `合并 ${a}、${b}`; vars = {fx,fy}; path = [];
        if (fx !== fy) {
            f[fx] = fy;
            emit('merge', 'merge', `fx = ${fx}、fy = ${fy}，连接两个根：f[${fx}] = ${fy}。整组成员随之连到一起。`, fx);
        } else emit('same', 'merge', '两个代表相同，原本就在同组，不需要改变父指针。');
    }
    context = mode === 'full' ? '开始一人一组' : '合并完成后的父指针';
    emit('initial', '', mode === 'full' ? '开始一人一组，f[i] = i。箭头指向直接上级，绿色圆环表示根。' : '从已经合并好的状态开始：1 → 2 → 3 → 5，4 → 5。');
    if (mode === 'full') {
        for (const [a,b] of [[1,2],[2,3],[4,5],[3,5]]) merge(a,b);
    }
    const firstFind = frames.length;
    find(1, '第一次查找 find(1)');
    const repeatFind = frames.length;
    find(1, '再次查找 find(1)');
    context = '对照两次查找'; vars = {}; path = [];
    emit('done', '', '第一次找根走 1 → 2 → 3 → 5；压缩后再查只走 1 → 5。合并维护分组，路径压缩减少重复走的路。');
    const keyStep = frames.findIndex((frame,i) => i >= firstFind && frame.event === 'redirect' && frame.changed === 1);
    return {frames,firstFind,repeatFind,keyStep};
}
