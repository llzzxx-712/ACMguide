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

## 例题精讲一：[P1049 装箱问题](https://www.luogu.com.cn/problem/P1049)

**题意简述：** 箱子容量 V≤20000，最多 30 件物品，各有正体积，每件最多选一次。选择总量不超过 V，使剩余空间最小。输入先给 V，再给 n，再给 n 个体积；输出最小剩余空间。

自编输入：

```text
10
4
8
6
4
3
```

输出：

```text
0
```

### 先把思路讲清楚

把“剩余最少”改成“已装总体积最大”。每层决定当前物品取或不取，这就是所有子集的暴力枚举。样例选 6 和 4 正好装满，剩余为 0。

### 每个剪枝都回答：为什么后面不可能更好

- 可行性：放入后超过容量的分支不用进入。
- 最优性：就算把剩余物品全部放入，used+suffix[pos] 仍不超过 best，也不可能刷新答案。这里故意忽略容量限制，是一个乐观上界。
- 等价状态：相同 pos、used 的后续选择完全相同，seen 使它只展开一次。这把最坏展开量限制为 O(nV)，避免只靠剪枝运气。
- 搜索顺序：体积从大到小，先尝试装入，通常更早得到较好的 best。找到 best=V 后，没有更好的目标值，后续直接返回。

排序不改变可选的子集，只改变枚举顺序。代码仍是思路的实现：先写“取/不取”两条递归，再逐项加入有依据的剪枝。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int capacity, n;
    cin >> capacity >> n;
    vector<int> a(n);
    for (int &x : a) cin >> x;
    sort(a.rbegin(), a.rend());
    vector<long long> suffix(n + 1);
    for (int i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + a[i];
    vector<vector<char>> seen(n + 1, vector<char>(capacity + 1));
    int best = 0;
    function<void(int, int)> dfs = [&](int pos, int used) {
        best = max(best, used);
        if (best == capacity || pos == n) return;
        if (used + suffix[pos] <= best) return;
        if (seen[pos][used]) return;
        seen[pos][used] = true;
        if (a[pos] <= capacity - used) dfs(pos + 1, used + a[pos]);
        dfs(pos + 1, used);
    };
    dfs(0, 0);
    cout << capacity - best << '\n';
    return 0;
}
```

时间最坏 O(nV)，空间 O(nV)，递归深度 O(n)。与背包 DP 的状态含义相通：这里用搜索组织到达状态的顺序，seen 负责合并重复历史。

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
2. [P1123 · 取数游戏](https://www.luogu.com.cn/problem/P1123)：在矩阵中选择互不相邻的数，最大化总和。逐格决定选或不选，检查八个方向的限制，并思考剩余值总和能否作为乐观上界。

### 选做巩固

- [P1433 · 吃奶酪](https://www.luogu.com.cn/problem/P1433)：从原点出发访问所有点，最小化路程。先预处理两点距离，思考已走距离与剩余路径下界怎样帮助剪枝，再结合“访问集合、当前位置”复用重复状态。
- [P10488 · Booksort](https://www.luogu.com.cn/problem/P10488)：每次移动一段书，求将排列排好序的最少次数，至少五次按题意输出。观察一次移动最多改变多少相邻关系，用它估计尚需操作次数并剪枝。

## 本节验收

能区分不能完成、不能更优和等价重复；能解释改变搜索顺序与剪枝的区别；能将每个提前返回对应到一个不会漏解的理由。
