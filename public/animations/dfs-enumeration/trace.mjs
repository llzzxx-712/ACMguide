export const presets = {
    two: {name:'两层纯枚举', rows:2, cols:2, queens:false},
    three: {name:'三层纯枚举', rows:3, cols:2, queens:false},
    queens: {name:'四皇后', rows:4, cols:4, queens:true}
};

// Every visible value comes from this deterministic execution trace.
export function buildTrace(mode = 'two') {
    const config = presets[mode];
    if (!config) throw new Error('Unknown DFS demonstration mode');
    const {rows, cols, queens} = config;
    const path = Array(rows + 1).fill(0);
    const stack = [], outputs = [], seen = new Set(['']);
    const frames = [];
    let attempts = 0, pruned = 0;
    function emit(event, line, fixed, note, candidate = null) {
        frames.push({
            event, line, fixed, note, candidate,
            prefix:path.slice(1, fixed + 1),
            stack:stack.map(frame => ({...frame})),
            outputs:outputs.map(answer => [...answer]),
            seen:[...seen], attempts, pruned
        });
    }
    function conflict(row, col) {
        for (let previous = 1; previous < row; previous++) {
            if (path[previous] === col) return '与第 ' + previous + ' 行同列';
            if (Math.abs(row - previous) === Math.abs(col - path[previous])) {
                return '与第 ' + previous + ' 行同斜线';
            }
        }
        return '';
    }
    function visit(row) {
        const frame = {row, col:null, status:'进入本层'};
        stack.push(frame);
        emit('enter','enter',row - 1,
            '进入 dfs(' + row + ')：' + (row > rows
                ? '前 ' + rows + ' 行已经选好，准备处理完整摆法。'
                : '前 ' + (row - 1) + ' 行已固定；这一层只负责第 ' + row + ' 行。'));
        if (row === rows + 1) {
            outputs.push(path.slice(1));
            frame.status = '输出后返回';
            emit('output','output',rows,
                '得到第 ' + outputs.length + ' 个完整' + (queens ? '合法' : '') + '摆法：'
                + path.slice(1).join(' ') + '。输出后返回上一层。');
            stack.pop();
            return;
        }
        for (let col = 1; col <= cols; col++) {
            frame.col = col;
            frame.status = '尝试本层这一列';
            attempts++;
            const reason = queens ? conflict(row,col) : '';
            if (reason) pruned++;
            emit(reason ? 'reject' : 'try', queens ? 'check' : 'loop',row - 1,
                '第 ' + row + ' 行尝试第 ' + col + ' 列：' + (reason
                    ? reason + '，continue。后面各行不用再试，直接换本行下一列。'
                    : '可以选。记录这个选择，再枚举后面各行。'),
                {row,col,ok:!reason,reason});
            if (reason) continue;

            path[row] = col;
            seen.add(path.slice(1,row+1).join(''));
            frame.status = queens ? '放好并记录占用' : '记录本行选择';
            emit('place','place',row,
                'path[' + row + ']=' + col + '，当前选择为 ' + path.slice(1,row+1).join(' → ')
                + (queens ? '；同时标记这一列和两条斜线。' : '。'));

            frame.status = '暂停，等待下一层';
            emit('call','call',row,
                '调用 dfs(' + (row+1) + ')。dfs(' + row + ') 暂停在这里，自己的 c=' + col
                + ' 不变；新调用有自己的 row 和 c。');
            visit(row + 1);

            frame.status = '返回本层，准备继续';
            emit('back',queens ? 'unmark' : 'after',row - 1,
                'dfs(' + (row+1) + ') 已返回，回到 dfs(' + row + ')，本层 c 仍是 ' + col + '。'
                + (queens ? '撤销本次占用标记，再继续本层 for。' : '接着执行本层 for 的 c++，再尝试下一列。')
                + ' 更深的旧 path 值不属于当前固定前缀。');
        }
        frame.col = cols + 1;
        frame.status = '循环结束，即将返回';
        emit('exhausted','close',row - 1,
            '第 ' + row + ' 行的列已经全部试完，c=' + (cols+1) + '，超过上界 '
            + cols + '。本层结束，返回调用它的上一层。');
        stack.pop();
    }
    visit(1);
    emit('done','finish',0,
        '全部枚举完成：尝试 ' + attempts + ' 个候选，'
        + (queens ? '提前排除 ' + pruned + ' 个冲突分支，得到 ' + outputs.length + ' 个合法摆法。'
            : '得到全部 ' + cols + '^' + rows + '=' + outputs.length + ' 个摆法。')
        + ' 递归把各层 for 组织起来，返回后总是继续对应那一层的枚举。');
    return {config, frames};
}
