export const values = [1, 2, 2, 2, 5, 7, 9];

// One source of truth for the closed-interval algorithm and its animated states.
export function buildTrace(target) {
    let le = 1, r = values.length, ans = -1;
    const frames = [{le, r, ans, mid:null, line:'loop', phase:'准备',
        note:'先把整个 [1,7] 放入待查范围，ans=-1 表示还没找到。'}];
    let round = 0;
    while (le <= r) {
        const mid = le + Math.floor((r - le) / 2);
        const value = values[mid - 1];
        round++;
        frames.push({le, r, ans, mid, line:'mid', phase:'第 ' + round + ' 轮 · 比较',
            note:'mid=' + mid + '，a[mid]=' + value + '。把它与目标 ' + target + ' 比较。'});
        let line, note;
        if (value === target) {
            ans = mid;
            r = mid - 1;
            line = 'found';
            note = '找到 ' + target + '，先保存 ans=' + ans + '，再令 r=' + r + '，向左找更早的位置。';
        } else if (value < target) {
            le = mid + 1;
            line = 'right';
            note = value + '<' + target + '，mid 和左边都太小。令 le=' + le + '，ans 保持 ' + ans + '。';
        } else {
            r = mid - 1;
            line = 'left';
            note = value + '>' + target + '，mid 和右边都太大。令 r=' + r + '，ans 保持 ' + ans + '。';
        }
        frames.push({le, r, ans, mid:null, line, phase:'第 ' + round + ' 轮 · 更新', note});
    }
    frames.push({le, r, ans, mid:null, line:'return', phase:'结束',
        note:'le=' + le + '>r=' + r + '，范围已经空了。直接返回 ans=' + ans
            + (ans === -1 ? '，表示没有找到。' : '，即第 ' + ans + ' 个位置。')});
    return frames;
}
