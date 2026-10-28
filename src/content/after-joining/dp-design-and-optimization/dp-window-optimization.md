---
title: 前缀和、单调队列与数据结构优化
description: 识别转移中的区间求和或滑动区间最值，将反复枚举候选换成维护候选集合。
---

## 这一节学什么

若每个 DP 状态都要枚举一个连续候选区间，可以先看它是在求和、求最值，还是对候选作了额外变换。前面的前缀和、单调队列和线段树，现在都可以成为计算转移的工具。

> **AI 伴学提示词**
>
> 为我讲解滑动区间上的 DP 优化，用范围跳跃手算候选进入、过期和淘汰，解释队列保存的是下标而非单独数值，并引导我提问。

## 例题精讲：[P1725 琪露诺](https://www.luogu.com.cn/problem/P1725)

**题意简述：** 从格子 0 出发，每次向右跳 L…R 格，落在 i≤N 时获得 `A[i]` 分，跳到编号大于 N 时结束，求最高得分。N≤2×10⁵，`A[0] = 0`，其余分数可为负；输入 N、L、R 及 `A[0…N]`。

自编输入：

```text
5 2 3
0 1 -2 4 10 -1
```

输出：

```text
8
```

### 先把思路讲清楚

可以走 0→2→4→6，得到 −2+10=8；6 已在河外，不再取分。注意终点是跳出 N，而非必须停在 N。

设 `f[i]` 为落在 i 的最大分数，则 $f_i=A_i+\max_{i-R\le j\le i-L}f_j$，其中 i−R≤j≤i−L。朴素地为每个 i 扫一次窗口需 O(N(R−L+1))。窗口只向右移动，按下标递增维护 f 单调递减的队列，就能把重复找最大值的工作省掉。

计算 i 时，刚允许使用的前驱是 i−L，把它入队；小于 i−R 的旧下标从队首移出。若新候选更靠右且分数不小，旧候选永远不会更优，可以从队尾删除。不可达状态不入队。最后能一步跳出河的落点满足 i+R>N，答案从这些 `f[i]` 取最大。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, L, R;
    cin >> n >> L >> R;
    vector<int> a(n + 1);
    for (int i = 0; i <= n; i++) cin >> a[i];
    const long long NEG = -(1LL << 60);
    vector<long long> f(n + 1, NEG);
    f[0] = 0;
    deque<int> q;
    for (int i = 1; i <= n; i++) {
        int enter = i - L;
        if (enter >= 0 && f[enter] != NEG) {
            while (!q.empty() && f[q.back()] <= f[enter]) q.pop_back();
            q.push_back(enter);
        }
        while (!q.empty() && q.front() < i - R) q.pop_front();
        if (!q.empty()) f[i] = f[q.front()] + a[i];
    }
    long long answer = NEG;
    for (int i = max(0, n - R + 1); i <= n; i++) answer = max(answer, f[i]);
    cout << answer << '\n';
    return 0;
}
```

每个下标最多入队、出队一次，时间 $\mathcal{O}(N)$、空间 $\mathcal{O}(N)$。负分合法，不能把所有 f 初始为 0；只有 `f[0] = 0`，其余为不可达。

## 练习：将队列每次变化对应回一个前驱

先**独立重做本例**，和逐个枚举 j 的 $\mathcal{O}(nR)$ 版本对拍，测试 L=R、负得分、部分格子不可达，并确认答案从能跳出河岸的落点中选取。

### 推荐必做

1. [P2034 选择数字](https://www.luogu.com.cn/problem/P2034)：选择若干非负数，使连续选择的数量不超过 k，并让总和最大。练习把转移化为滑动窗口最值。
2. [P2513 逆序对数列](https://www.luogu.com.cn/problem/P2513)：统计 1…n 的排列中恰好有 k 个逆序对的方案数，对 10000 取模。练习将一段连续状态的求和转化为前缀和。

### 选做巩固

- [P3800 Power 收集](https://www.luogu.com.cn/problem/P3800)：逐行向下移动，每次横向移动距离有限，最大化收集价值。练习对每行转移使用窗口最大值。
- [P3572 Little Bird](https://www.luogu.com.cn/problem/P3572)：每只鸟有最大飞行距离，飞往不低于当前树的树时增加劳累值，求最小劳累值。练习在窗口中维护状态及高度的比较规则。
- [P3957 跳房子](https://www.luogu.com.cn/problem/P3957)：改变机器人可跳距离的范围，求达到目标分数所需的最少金币。练习二分答案，并用单调队列加速每次判定。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[动态规划的设计与优化 #225](https://www.luogu.com.cn/training/225)。

## 本节验收

能识别转移中的区间运算；能推导候选进入与过期时机；能解释支配淘汰条件，并在队列不适用时换用正确结构。
