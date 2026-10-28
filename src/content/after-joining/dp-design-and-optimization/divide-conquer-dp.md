---
title: 分治优化与综合状态设计
description: 在决策位置单调时，先求中点最优决策，再缩小左右状态的候选范围。
---

## 这一节学什么

有些分层 DP 的最佳分割点会随着终点向右移动而不向左退。这种“决策单调性”可以让分治帮我们少枚举候选。它必须由代价性质证明，不能仅靠随机数据上看起来单调。

> **AI 伴学提示词**
>
> 为我讲解分层 DP 的分治优化，手算中点最优决策如何限制两边，解释本例四边形不等式与并列规则，并引导我提问。

## 例题精讲：[P4767 邮局 加强版](https://www.luogu.com.cn/problem/P4767)

**题意简述：** 数轴上有 V 个村庄，选 P 个村庄建邮局，让每个村庄到最近邮局的距离和最小。输入 V、P 和村庄坐标，P≤300、P≤V≤3000，坐标≤10000。输出最小距离和。

自编输入：

```text
5 2
1 2 3 10 11
```

输出：

```text
3
```

### 先把思路讲清楚

先按坐标排序。一个邮局负责的村庄可以取连续区间；交叉分配时，让每个村庄改用更近的邮局，费用不会增加。对于一段 [l,r]，邮局建在中位数位置最优：往左或右移动时，多数一侧的距离增加，会抵消少数一侧的减少。

令 cost(l,r) 为这段到中位数的距离和，用前缀坐标和 O(1) 计算。例子分成 [1,2,3] 与 [10,11]，费用为 2+1=3。定义 f[t][i] 为前 i 个村庄用 t 个邮局的最小费用，转移为 min(f[t−1][k]+cost(k+1,i))，t−1≤k<i。

### 为什么能缩小候选分割点

中位数距离费用满足四边形不等式：a≤b≤c≤d 时，cost(a,c)+cost(b,d)≤cost(a,d)+cost(b,c)。可以把左右区间分别画在数轴上，将每个村庄到中位数的距离拆成跨过的相邻间隙；外侧扩张不会让“交叉分组”更便宜。由此得到同一层最优分割点 opt[i] 不递减（并列取最小 k）。这是这里使用分治的依据，不能只因为转移中有 min 就套用。

先算 mid 的最优 k。左半部分的最优点不会超过 k，右半不会小于 k，于是分别带着缩小后的候选区间递归。代码中 l、r 表示待计算的终点范围，optL、optR 表示允许枚举的分割点范围，两组边界含义不同。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, groups;
    cin >> n >> groups;
    vector<long long> a(n + 1), sum(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    sort(a.begin() + 1, a.end());
    for (int i = 1; i <= n; i++) sum[i] = sum[i - 1] + a[i];
    auto cost = [&](int l, int r) {
        int mid = (l + r) / 2;
        return a[mid] * (mid - l + 1) - (sum[mid] - sum[l - 1])
            + (sum[r] - sum[mid]) - a[mid] * (r - mid);
    };
    const long long INF = (1LL << 60);
    vector<long long> previous(n + 1, INF), current(n + 1, INF);
    previous[0] = 0;
    for (int count = 1; count <= groups; count++) {
        fill(current.begin(), current.end(), INF);
        function<void(int, int, int, int)> solve = [&](int l, int r, int optL, int optR) {
            if (l > r) return;
            int mid = (l + r) / 2, best = -1;
            for (int k = max(optL, count - 1); k <= min(optR, mid - 1); k++) {
                long long value = previous[k] + cost(k + 1, mid);
                if (value < current[mid]) {
                    current[mid] = value;
                    best = k;
                }
            }
            solve(l, mid - 1, optL, best);
            solve(mid + 1, r, best, optR);
        };
        solve(count, n, count - 1, n - 1);
        previous.swap(current);
    }
    cout << previous[n] << '\n';
    return 0;
}
```

每层分治各层候选总量为 O(V)，递归深度 O(log V)，总时间 O(PV log V)，空间 O(V)。previous 与 current 分开保存，保证读取的是前一层；恰好 t 个非空区间，所以本层从 i=t 开始。

## 练习：先用朴素表打印 opt

先**独立重做本例**，对 n≤80 写 O(kn²) 版本，比较每层值与最左 opt，再测试全部坐标相同、一个邮局、每村一个邮局。

### 推荐必做

1. [Codeforces 321E Ciel and Gondolas](https://codeforces.com/problemset/problem/321/E)：将排队的人分成 k 个连续非空组，每组代价是组内两两之间的不熟悉程度之和，求最小总代价。练习用二维前缀和求组费用，再用决策单调性优化分组 DP。

### 选做巩固

- [Codeforces 868F Yet Another Minimization Problem](https://codeforces.com/problemset/problem/868/F)：将序列分为 k 个连续非空段，最小化每段内相同元素的下标对数之和。练习在分治时移动区间端点维护费用。
- [Codeforces 1527E Partition Game](https://codeforces.com/problemset/problem/1527/E)：将序列分组，每组费用为每种数首次与末次出现位置之差的总和，求最小总费用。练习重新推导分组费用的单调性与高效维护。
- [P3648 序列分割](https://www.luogu.com.cn/problem/P3648)：将非负序列分为 k+1 段，最大化分割得分并输出切分位置。练习按层记录决策，恢复一种最优分组。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[动态规划的设计与优化 #225](https://www.luogu.com.cn/training/225)。

## 本节验收

能区分状态单调与决策单调；能用中点决策限制左右范围；能检查代价性质、并列规则与可达边界，再选择优化实现。
