---
title: 容斥原理与补集计数
description: 先决定直接数还是数反面，再通过重复计数的次数理解容斥的正负号。
---

## 这一节学什么

“至少一个条件成立”常常有重叠。例如 1…10 中被 2 整除的有 5 个，被 3 整除的有 3 个，直接相加却把 6 数了两次。容斥就是有规律地纠正这些重复。

> **AI 伴学提示词**
>
> 为我用画集合和枚举小数的方式讲解容斥，再解释为什么三集合交集要加回来，并引导我对正负号和补集计数提问。

## 为什么是加、减、加

两个集合的并集大小为 $|A\cup B|=|A|+|B|-|A\cap B|$。三个集合还要减去三对交集，再加回三者交集。

看一个属于 t 个条件的元素：它在所有单集合中被加 t 次，在两两交集中被减 $\binom t2$ 次……总系数为 $\sum_{k=1}^{t}(-1)^{k+1}\binom tk=1$，恰好只留下它一次。这解释了所有非空条件子集都要参与，而不只是单个条件与两两交集。

另一条思路是**数反面**：至少一个相邻位置相同的序列，可以用所有序列减去所有相邻位置都不同的序列。先比较两边哪一边容易数，再决定是否需要容斥。

## 例题精讲：[P1450 硬币购物](https://www.luogu.com.cn/problem/P1450)

**题意简述：** 有四种硬币，面值固定。每次购物给四类可用数量 `d[i]` 和目标金额 s，求付款方案数。输入四个面值与查询数，之后每行四个数量和金额；面值、数量、s≤10⁵，查询数≤1000。输出每次方案数。

自编输入：

```text
1 2 3 4 1
1 1 1 1 5
```

输出：

```text
2
```

### 先把思路讲清楚

样例只能用每种至多一枚，金额 5 的方案为 1+4、2+3。若逐次做有界背包，会重复处理相同面值。我们先忽略数量限制，完全背包预处理 `ways[s]`，再用容斥扣掉超量方案。

设坏事件 $E_i$ 为第 $i$ 类用了至少 $d_i+1$ 枚。指定一组坏事件 $T$ 同时发生时，先强制拿走这些类别各自的 $d_i+1$ 枚，剩余硬币数量都变成任意非负数，因此交集大小为：

$
\operatorname{ways}\left(s-\sum_{i\in T}(d_i+1)c_i\right).
$

这里的 $d_i$、$c_i$ 对应题意中的 `d[i]`、`c[i]`；先算括号内剩余金额，再用它作为 `ways` 的下标。若剩余金额为负，就没有这样的方案。

从全部无限制方案开始，减去单个坏事件，加回两事件交集，再减三事件交集、加四事件交集。mask 的 16 个取值正好枚举事件子集，偶数个事件加、奇数个减；空子集就是最初的全部方案。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int coin[4], queries;
    for (int &x : coin) cin >> x;
    cin >> queries;
    const int LIMIT = 100000;
    vector<long long> ways(LIMIT + 1);
    ways[0] = 1;
    for (int c : coin) {
        for (int s = c; s <= LIMIT; s++) ways[s] += ways[s - c];
    }
    while (queries--) {
        long long count[4];
        for (long long &x : count) cin >> x;
        int target;
        cin >> target;
        long long answer = 0;
        for (int mask = 0; mask < 16; mask++) {
            long long remain = target;
            int selected = 0;
            for (int i = 0; i < 4; i++) if ((mask >> i) & 1) {
                remain -= (count[i] + 1) * coin[i];
                selected++;
            }
            if (remain < 0) continue;
            if (selected % 2 == 0) answer += ways[remain];
            else answer -= ways[remain];
        }
        cout << answer << '\n';
    }
    return 0;
}
```

预处理 $\mathcal{O}(4S)$，每次查询 $\mathcal{O}(4\cdot 2^{4})$，空间 $\mathcal{O}(S)$，S=10⁵。计数和强制取走的金额都用 `long long`，避免 `(d[i] + 1) * c[i]` 溢出 `int`。

## 练习：先数直接枚举能验证的小范围

先**独立重做例题**，直接枚举小金额时四类硬币的使用数量，检查恰好触及上限、金额不可达，以及多个超量事件重叠。

### 推荐必做

1. [P3197 越狱](https://www.luogu.com.cn/problem/P3197)：统计至少一对相邻房间信仰相同的状态；练习用总数减去每对相邻都不同的状态。
2. [P5505 分特产](https://www.luogu.com.cn/problem/P5505)：将多种特产分给同学，每个人至少分得一件。练习枚举未分得特产的同学集合，用容斥去掉空盒。

### 选做巩固

- [CF451E Devu and Flowers](https://codeforces.com/problemset/problem/451/E)：从 n 种花中恰选 s 朵，每种有数量上限，统计方案数。n≤20，金额维度很大，练习对超量事件容斥，再用隔板法计算剩余方案。组合数的下标可能很大，但需要相乘的项数仅为 n−1。
- [P2567 幸运数字](https://www.luogu.com.cn/problem/P2567)：统计区间内至少是一个只含 6、8 的数的倍数的整数。练习去掉冗余条件，并以最小公倍数处理交集。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[组合数学与计数 #217](https://www.luogu.com.cn/training/217)。

## 本节验收

能先选择直接计数或补集；能解释容斥的正负号；能把超量条件转成预先取走的硬币，并在乘法前检查范围。
