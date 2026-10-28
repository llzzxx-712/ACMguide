---
title: 棋盘、行状态与相容性
description: 将一行压成一个集合，先筛掉行内冲突，再通过相邻行的相容关系连接整张棋盘。
---

## 这一节学什么

棋盘宽度很小时，一整行可以用一个 mask 表示。先列出一行内部合法的摆法，再考虑它与上一行能否相接，就把逐格枚举变成逐行状态转移。

> **AI 伴学提示词**
>
> 为我讲解行状压，用国王摆放手算水平、竖直和对角线冲突，解释状态中的行数、数量与当前 mask，并引导我提问。

## 例题精讲：P1896 · 互不侵犯

**原题：** [P1896 · 互不侵犯](https://www.luogu.com.cn/problem/P1896)。

**题意简述：** 在 n×n 棋盘放 k 个国王，任意两个不能在八邻域相邻，求方案数。n≤9，0≤k≤n²。

输入 `2 1`，输出 `4`；输入 `2 2`，输出 `0`，因为 2×2 任意两格都相互攻击。

## 三类位判断分别排除一种冲突

当前行 mask=a，上一行=b：

- 行内：a&(a<<1) 必须为 0，排除水平相邻。
- 相邻行：a&b 必须为 0，排除同列。
- 两个对角方向：(a<<1)&b、(a>>1)&b 都为 0。

每行只需要与相邻一行比较，因为国王不会隔两行攻击。若题目棋子攻击更远，状态也要保存更多历史行。

## 记录已经放了多少个

f[row][used][a] 表示处理完 row 行、已放 used 个、最后一行摆法为 a 的方案数。初始是处理 0 行、放 0 个、空行状态，方案数为 1。每加入一行，从相容的上一行转移，并将 used 增加这一行的 1 的数量。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n >> k;
    vector<int> masks, count;
    for (int mask = 0; mask < (1 << n); mask++) if ((mask & (mask << 1)) == 0) {
        masks.push_back(mask);
        count.push_back(__builtin_popcount(mask));
    }
    int states = masks.size();
    vector<vector<int>> compatible(states);
    for (int a = 0; a < states; a++) for (int b = 0; b < states; b++) {
        if ((masks[a] & masks[b]) == 0 && ((masks[a] << 1) & masks[b]) == 0
            && ((masks[a] >> 1) & masks[b]) == 0) compatible[a].push_back(b);
    }
    vector<vector<long long>> previous(states, vector<long long>(k + 1));
    previous[0][0] = 1;
    for (int row = 1; row <= n; row++) {
        vector<vector<long long>> current(states, vector<long long>(k + 1));
        for (int a = 0; a < states; a++) for (int b : compatible[a]) {
            for (int used = 0; used + count[a] <= k; used++) {
                current[a][used+count[a]] += previous[b][used];
            }
        }
        previous = current;
    }
    long long answer = 0;
    for (int a = 0; a < states; a++) answer += previous[a][k];
    cout << answer << '\n';
    return 0;
}
```

按从 0 开始的升序筛 mask，masks[0] 就是空行。__builtin_popcount 是 GCC 提供的统计 int 中 1 的数量的函数，也可以自己逐位累加。

设合法行状态数为 S，预处理 O(S²)，转移上界 O(nkS²)，滚动空间 O(kS)。用 long long 保存本题方案数，k=0 时应有一种全空方案。

## 练习：先把相容关系画成图

先**独立重做 P1896**，对 n≤4 枚举棋盘所有 k 格子集合，按八方向检查冲突，核对 DP。

### 推荐必做

1. [P1879 Corn Fields](https://www.luogu.com.cn/problem/P1879)：在可耕种格子里选择互不共边的格子，统计方案数，对 10⁸ 取模。练习把可用格子与行状态相交，并检查相邻行。

### 选做巩固

- [P2704 炮兵阵地](https://www.luogu.com.cn/problem/P2704)：在平原部署炮兵，同一行或列上相距不超过两格的炮兵不能同时放置，求最多数量。练习保存前两行状态并检查山地。
- [P2051 中国象棋](https://www.luogu.com.cn/problem/P2051)：统计棋盘上互不攻击的炮的摆放方案，答案对 9999973 取模。练习观察每行、每列最多放两个炮，设计按列中已有炮数分类的状态。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[状态压缩动态规划 #215](https://www.luogu.com.cn/training/215)。

## 本节验收

能把每个按位条件对应到具体攻击方向；能确定需要保留几行；能准确维护总数量、空行初始化与行状态复杂度。
