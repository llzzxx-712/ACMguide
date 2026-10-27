---
title: 可行性剪枝、最优性剪枝与搜索顺序
description: 搜索仍是枚举，用不可能完成和不可能更优的理由提前结束分支，再消除等价的重复尝试。
---

## 这一节学什么

搜索是用代码实现暴力枚举。现在不改变要寻找的答案，而是判断哪些分支已经不用走到底：有些不能成为合法方案，有些不可能超过现有答案，还有些只是在重复尝试相同的安排。

> **AI 伴学提示词**
>
> 为我讲解可行性剪枝、最优性剪枝与搜索顺序，用预算选任务和小木棍手动展开几层搜索，解释每次 return 排除了哪些方案，并引导我提问。

## 剪掉一个分支，必须有一个理由

可行性剪枝回答“还能完成吗”：费用已经超预算，并且后续只会继续加费用，就不能继续选。选数时，还需要选 4 个，但剩下只有 3 个，也不可能完成。

最优性剪枝回答“就算往最好方向想，还能超过当前答案吗”：假设剩余任务的全部收益都能拿到，总收益仍不比 best 大，那么这个分支无论怎样选都不必继续。

注意两者的区别：前者不能得到合法解；后者可能合法，但已经不可能带来更好答案。代码中的判断，要对应到其中一个明确的理由。

## 例题精讲一：自编 · 预算内最大收益

**题意简述：** n 项任务，每项给出费用 cost、收益 value，每项最多选一次，在总费用不超过 budget 时最大化收益，可以一项都不选。1≤n≤22，费用和收益都是 1 到 10^6 的整数，budget≤10^9。

输入：

```text
4 7
4 6
3 5
5 8
2 2
```

输出为 `11`，选择费用 4、3 的两项任务。

### 先写出每层的两个选择

dfs(pos,cost,gain) 表示：前 pos 项已经决定是否选取，当前费用和收益分别为 cost、gain，现在决定第 pos 项。

1. 费用允许，就尝试选当前任务。
2. 尝试不选，继续处理下一项。
3. 到末尾时得到一个完整方案。

先按收益从大到小排序，优先尝试“选”，有机会较早找到较大的 best。排序只改变遍历方案的先后，不能独自证明某个分支不必搜索。

预处理 suffix[pos] 为剩余所有任务的收益和。即使忽略预算限制，之后最多也只能增加这些收益，所以 gain+suffix[pos] 是一个乐观上界。上界都不大于 best 时，整棵子树可以剪掉。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Task { long long cost, value; };
int n;
long long budget, best = 0;
vector<Task> tasks;
vector<long long> suffix;

void dfs(int pos, long long cost, long long gain) {
    best = max(best, gain);
    if (pos == n || gain + suffix[pos] <= best) return;
    if (cost + tasks[pos].cost <= budget) {
        dfs(pos + 1, cost + tasks[pos].cost, gain + tasks[pos].value);
    }
    dfs(pos + 1, cost, gain);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n >> budget;
    tasks.resize(n);
    for (int i = 0; i < n; i++) cin >> tasks[i].cost >> tasks[i].value;
    sort(tasks.begin(), tasks.end(), [](const Task &a, const Task &b) {
        return a.value > b.value;
    });
    suffix.resize(n + 1);
    for (int i = n - 1; i >= 0; i--) suffix[i] = suffix[i+1] + tasks[i].value;
    dfs(0, 0, 0);
    cout << best << '\n';
    return 0;
}
```

当前已选任务本身就是一个合法方案，剩余任务可以全部不选，因此每层都能用 gain 更新 best。只在费用合法时进入选取分支，就不会把超预算收益记进答案。

> **最优性剪枝要使用正确方向的界。**
>
> 求最大收益时，需要一个不小于真实可达收益的上界。把“剩下可能拿到的收益”估小，会剪掉正确答案。本例把剩余收益全部加入，虽然可能根本装不下，却始终足够乐观，所以能用于判断“不可能更好”。

不计剪枝时有 2^n 种选择，时间上界 O(2^n)，递归与辅助数组空间 O(n)。剪枝减少的是实际访问的结点；先通过数据范围估算基础枚举规模，再分析哪里可以少走。

## 例题精讲二：P1120 · 小木棍

**原题：** [P1120 · 小木棍](https://www.luogu.com.cn/problem/P1120)。

**题意简述：** n 段木棍原本来自若干根同长木棍，把所有段重新拼成相同长度的若干组，求最小可能原长。n≤65，每段长度在 1 到 50 之间。

自拟输入：

```text
9
5 2 1 5 2 1 5 2 1
```

输出为 `6`，每根可由 5+1 或 2+2+2 拼成。

### 先减少原长候选，再搜索分组

总长度为 total，候选原长 target 至少等于最长段，而且必须整除 total。按 target 从小到大试，第一个能完整分组的长度就是答案。

搜索状态记录：已完成几根、当前这一根已拼多长、接下来从哪个段下标尝试。段按长度降序排列，当前根中只按下标递增选段，避免同一组的各种排列重复出现。

进一步减少重复：

- 当前根放不下某段，不选择它。
- 同一层中，一段长度尝试失败后，同长度的另一段与它等价，跳过。
- 开始一根新木棍时，固定使用最长的未用段。各根没有名字，任何完整方案中包含这段的那一根都可以被叫作“下一根”，因此不用再换其他开头。
- 若某段刚好填满当前根，但剩余段无解，就不用换其他填法。假设另一批段也能填同样的缺口，它们总长等于这一个段；在完整方案中把两者整批交换，仍会得到“用这一段填满”的方案，因此失败后可以排除其他填法。
- 剩下最后一根时，未用段总长恰好等于 target，直接成功。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int n, target, groups;
vector<int> a;
vector<bool> used;

bool dfs(int finished, int current, int start) {
    if (finished == groups - 1) return true;
    if (current == target) return dfs(finished + 1, 0, 0);
    int failedLength = -1;
    for (int i = start; i < n; i++) {
        if (used[i] || a[i] == failedLength || current + a[i] > target) continue;
        used[i] = true;
        if (dfs(finished, current + a[i], i + 1)) return true;
        used[i] = false;
        failedLength = a[i];
        if (current == 0 || current + a[i] == target) return false;
    }
    return false;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    cin >> n;
    a.resize(n);
    used.resize(n);
    int total = 0;
    for (int i = 0; i < n; i++) {
        cin >> a[i];
        total += a[i];
    }
    sort(a.begin(), a.end(), greater<int>());
    for (target = a[0]; target <= total; target++) {
        if (total % target != 0) continue;
        groups = total / target;
        fill(used.begin(), used.end(), false);
        if (dfs(0, 0, 0)) {
            cout << target << '\n';
            break;
        }
    }
    return 0;
}
```

used 的恢复对应“撤销刚才这一段”，failedLength 只对当前这层后续候选生效。每次换一根木棍才从 0 重新尝试下标，同一根内部则从 i+1 继续。

分组搜索仍有大量组合选择；这里通过总长约束、组内顺序和等价安排减少搜索结点，递归最多使用 n 段，辅助空间 O(n)。比较自己加上每条剪枝前后的访问次数，比只看运行时间更能说明哪部分枚举被省掉了。

## 练习：给每条剪枝写一句依据

先**独立重做两个例题**，分别标出可行性、最优性和重复安排剪枝，并在本地用小数据比较“有剪枝”和“完整枚举”的答案。

### 推荐必做

1. [P1036 · 选数](https://www.luogu.com.cn/problem/P1036)：选出指定数量的数，使和为质数。只按下标递增选择；当“已选个数+剩余个数”不足时剪枝，练习不影响正确性的可行性判断。
2. **自编 · 记录一种最优任务方案：** 沿用预算收益例题，除最大收益外输出任意一种达到最大收益的原始任务编号。排序前保存编号，搜索时维护选择路径，更新 best 时保存当前路径。

### 选做巩固

- [P1433 · 吃奶酪](https://www.luogu.com.cn/problem/P1433)：从原点出发访问所有点，最小化路程。先预处理两点距离，思考已走距离与剩余路径下界怎样帮助剪枝，再结合“访问集合、当前位置”复用重复状态。
- **自编 · 统计最优方案个数：** 沿用任务例题，同时统计达到最大收益的不同选择方案数。若要保留同样最优的方案，乐观上界等于 best 时还能不能直接剪掉？重新设计终点计数，避免把同一个完整选择按多个中间状态重复统计。

## 本节验收

能区分不能完成、不能更优和等价重复；能解释改变搜索顺序与剪枝的区别；能将每个提前返回对应到一个不会漏解的理由。
