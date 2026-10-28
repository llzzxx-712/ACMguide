---
title: 石子合并、回文与区间决策
description: 根据最后一次合并或最终根的位置拆分区间，比较不同运算所需要的边界。
---

## 这一节学什么

上一节在区间两端作决定，这一节把决定放到区间中间：最后一次合并发生在哪里，或者最终二叉树的根是谁。每个候选都把完整问题拆成已经定义好的子问题。

> **AI 伴学提示词**
>
> 为我讲解区间分割和选根，用石子合并与加分二叉树比较转移、空区间和方案恢复，并引导我提问。

## 线性石子合并：枚举最后一次的左右两堆

只能合并相邻石子，区间 $[l,r]$ 最后一定由 $[l,k]$ 与 $[k+1,r]$ 两堆合成。若本次费用是整段石子总数，令 `sum(l, r)` 由前缀和查询：

```text
f[l][r] = min over k∈[l,r-1]：f[l][k]+f[k+1][r]+sum(l,r)
f[i][i] = 0
```

单堆不需要合并，所以边界是 0。它与本节例题的“选一个根、左右得分相乘”具有不同含义，不要因为都枚举 $k$ 就把式子混在一起。

## 例题精讲：P1040 · 加分二叉树

**原题：** [P1040 · 加分二叉树](https://www.luogu.com.cn/problem/P1040)。

**题意简述：** 中序遍历固定为 $1\ldots n$，每点有正分数。非叶子得分为左子树得分×右子树得分+根分数，空子树得分为 1；叶子直接取自己的分数。求最大得分并输出一种对应的前序遍历。$n<30$，答案不超过 $4\times 10^{9}$。

输入 `3`，点分数为 `1 2 3`，一组输出是最大得分 `6`、前序 `1 2 3`。以 1 为根，右区间可得 5，整体 $1\times 5+1=6$；其他根也可能产生同样的最优值。

### 中序顺序把子树固定成两个区间

选 $k$ 为根后，左边只能是 $[l,k-1]$，右边只能是 $[k+1,r]$。令 `f[l][r]` 为这段能得到的最大分数，枚举根 $k$，候选为两侧最优分数相乘后加 `a[k]`。

空区间必须为 1，才是乘法的单位元。叶子必须单独初始化成 `a[i]`，不能套出 $1\times1+a[i]$。用 `chosen[l][r]` 记录取得最大值的根，输出时按根、左、右访问。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(n + 1);
    for (int i = 1; i <= n; i++) cin >> a[i];
    vector<vector<long long>> f(n + 2, vector<long long>(n + 2, 1));
    vector<vector<int>> chosen(n + 2, vector<int>(n + 2));
    for (int i = 1; i <= n; i++) { f[i][i] = a[i]; chosen[i][i] = i; }
    for (int length = 2; length <= n; length++) {
        for (int l = 1; l + length - 1 <= n; l++) {
            int r = l + length - 1;
            f[l][r] = -1;
            for (int k = l; k <= r; k++) {
                long long value = f[l][k-1] * f[k+1][r] + a[k];
                if (value > f[l][r]) { f[l][r] = value; chosen[l][r] = k; }
            }
        }
    }
    cout << f[1][n] << '\n';
    stack<pair<int, int>> pending;
    pending.push({1, n});
    bool first = true;
    while (!pending.empty()) {
        int l = pending.top().first, r = pending.top().second;
        pending.pop();
        if (l > r) continue;
        int k = chosen[l][r];
        if (!first) cout << ' ';
        first = false;
        cout << k;
        pending.push({k + 1, r});
        pending.push({l, k - 1});
    }
    cout << '\n';
    return 0;
}
```

栈先压右区间再压左区间，弹出时就是前序。候选相等时保留先枚举的较小根，是一种确定的并列规则；题目允许任意最优树。

时间 $\mathcal{O}(n^{3})$、空间 $\mathcal{O}(n^{2})$。答案可能超过 `int` 的约 21 亿，表格与乘法都使用 `long long`。

## 练习：先解释 $k$ 代表什么

先**独立重做 P1040**，对 $n\le 6$ 枚举所有中序顺序合法的二叉树，检查最大值及输出前序所对应的树。

### 推荐必做

1. [P1880 · 石子合并](https://www.luogu.com.cn/problem/P1880)：环上相邻石子堆不断合并，求最小和最大得分。先写线性区间的最后一次合并，再复制序列枚举切口。
2. [P4170 · 涂色](https://www.luogu.com.cn/problem/P4170)：每次给连续木板涂一种颜色，求达到目标颜色的最少次数。枚举区间分割并考虑两端颜色相同的合并。

### 选做巩固

- [P2734 · 游戏](https://www.luogu.com.cn/problem/P2734)：两人轮流从序列两端取数，双方都采用最优策略，求最终得分。以剩余区间为状态，分析当前选择与对手接下来的选择。
- [P1220 · 关路灯](https://www.luogu.com.cn/problem/P1220)：从一盏路灯出发逐个关灯，使总耗电最少。状态除已关闭的区间外，还需记录当前在左端还是右端。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树与图上的动态规划 #214](https://www.luogu.com.cn/training/214)。

## 本节验收

能区分分割点与根的位置；能为加法、乘法选择正确空区间边界；能根据记录的决策恢复对应结构，并解释复杂度。
