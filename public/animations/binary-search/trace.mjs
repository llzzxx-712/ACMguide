export const values = [1, 2, 2, 2, 5, 7, 9];

// One source of truth for the closed-interval algorithm and its animated states.
export function buildTrace(target) {
    let le = 1, r = values.length, ans = -1;
    const frames = [{le, r, ans, mid:null, line:'loop', phase:'准备',
        note:'先检查整个 [1,7]。ans=-1 表示还没有找到大于等于目标的候选位置。'}];
    let round = 0;
    while (le <= r) {
        const mid = le + Math.floor((r - le) / 2);
        const value = values[mid - 1];
        round++;
        frames.push({le, r, ans, mid, line:'mid', phase:'第 ' + round + ' 轮 · 比较',
            note:'mid=' + mid + '，a[mid]=' + value + '。把它与目标 ' + target + ' 比较。'});
        let line, note;
        if (value >= target) {
            ans = mid;
            r = mid - 1;
            line = 'found';
            note = value + '≥' + target + '，满足条件。先记 ans=' + ans + '，再令 r=' + r + '，向左找更优位置。';
        } else if (value < target) {
            le = mid + 1;
            line = 'right';
            note = value + '<' + target + '，mid 和左边都太小。令 le=' + le + '，ans 保持 ' + ans + '。';
        }
        frames.push({le, r, ans, mid:null, line, phase:'第 ' + round + ' 轮 · 更新', note});
    }
    const result = ans !== -1 && values[ans - 1] === target ? ans : -1;
    frames.push({le, r, ans, result, mid:null, line:'return', phase:'结束 · 验证候选',
        note:'le=' + le + '>r=' + r + '，循环结束。' + (ans === -1
            ? '没有大于等于目标的候选，返回 -1。'
            : '候选 ans=' + ans + '，a[ans]=' + values[ans - 1] + '，'
                + (result === -1 ? '不等于目标 ' + target + '，最终返回 -1。' : '等于目标，返回 ' + result + '。'))});
    return frames;
}
