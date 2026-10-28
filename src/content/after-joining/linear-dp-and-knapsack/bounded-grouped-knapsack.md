---
title: 多重背包、分组背包与混合背包
description: 先根据每类物品的可选数量组织决策，再把有限件数拆成能够一次选取的组合。
---

## 这一节学什么

0/1 背包每件最多一次，完全背包允许重复，多重背包每类有给定上限，分组背包每组最多选一种。不要先决定循环方向，再猜它对应哪个模型；先写出“这一轮能选哪些组合”。

> **AI 伴学提示词**
>
> 为我讲解多重背包的二进制拆分、分组背包与混合背包，手算可选数量与循环顺序，并引导我提问。

## 多重背包的直接枚举

某类物品重量 $w$、价值 $v$、上限 $\mathrm{count}$，二维转移为：

$$
f_{i,c}=\max_{0\le k\le\min(\mathrm{count},\lfloor c/w\rfloor)}\left(f_{i-1,c-kw}+kv\right).
$$

其中 $f_{i,c}$ 对应 `f[i][c]`。枚举的 $k$ 表示取几件，最多取 `min(count, c / w)` 件。这个式子直接反映选几件，但大上限会让枚举太多。

将 $\mathrm{count}$ 拆成 `1 2 4 …` 和最后的剩余块。例如 13 拆成 `1 2 4 6`，这些块的子集可以组成 0 到 13 的任意件数。把每块视为一个 0/1 物品，重量和价值都乘块大小，再倒序更新。

这里用于求最大值，不是统计选法。拆分后的不同块选择可能对应同样件数，不能直接用它计算原题方案数。

## 例题精讲：P1776 · 宝物筛选

**原题：** [P1776 · 宝物筛选](https://www.luogu.com.cn/problem/P1776)。

**题意简述：** $n$ 类宝物，给价值 $v$、重量 $w$、件数 $\mathrm{count}$，在容量 $W$ 内最大化总价值。$n\le 100$、$W\le 40000$，总件数不超过 $10^{5}$，价值不超过 1000。

输入：

```text
2 7
3 2 3
5 3 2
```

输出 `11`，选三件第一类需要重量 6、价值 9；改成两件第一类加一件第二类，重量 7、价值 11。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, capacity;
    cin >> n >> capacity;
    vector<long long> f(capacity + 1);
    for (int i = 0; i < n; i++) {
        int value, weight, count;
        cin >> value >> weight >> count;
        count = min(count, capacity / weight);
        for (int block = 1; count > 0; block *= 2) {
            int take = min(block, count);
            count -= take;
            int cost = take * weight;
            long long gain = 1LL * take * value;
            for (int c = capacity; c >= cost; c--) f[c] = max(f[c], f[c-cost] + gain);
        }
    }
    cout << f[capacity] << '\n';
    return 0;
}
```

先按容量截断件数，超过 $\mathrm{capacity}/\mathrm{weight}$ 的部分永远装不下，也让块重量不超过 $\mathrm{capacity}$。每个块倒序更新，确保最多取一次。时间 $\mathcal{O}(W\sum\log(\mathrm{count}+1))$、空间 $\mathcal{O}(W)$。

## 分组背包：所有选项必须来自上一组的结果

一组内最多选择一个，写成“旧表产生新表”最直观：

```text
next = previous                    // 整组不选
对这一组的每个选项 (w,v)：
    对所有能装下的容量 c：
        next[c] = max(next[c], previous[c-w]+v)
previous = next
```

不能把同组第一个选项更新后的表，当作第二个选项的来源，否则可能把同组两件一起装入。这个问题的核心是来源层，不只是循环方向。

## 混合背包：逐类采用相应的合法更新

同一题若混有单件、无限件、有限件，仍定义同一个容量状态：单件倒序；无限件在正重量前提下正序；有限件先二进制拆分再倒序。组内互斥则额外保持整组的旧表。

“恰好装满”时，除容量 0 外初始化不可达；“不超过容量且最大价值”时，可以全 0。更新前确认来源可达，不能把负无穷再随意加收益。

## 练习：说明每一次使用的物品还剩几件

先**独立重做 P1776**，对小容量逐类枚举取件数，核对拆分优化。测试 $W=0$、全部太重、某类有 13 件。

### 推荐必做

1. [P1757 · 通天之分组背包](https://www.luogu.com.cn/problem/P1757)：每件物品给出重量、价值和组号，每组最多选一件，求容量内的最大价值。按 previous→next 实现，测试同组两件合起来很划算的反例。
2. [P1833 · 樱花](https://www.luogu.com.cn/problem/P1833)：不同樱花的观赏次数有限或无限，求时间内最大美学值。分别处理次数为 1、有限及无限的物品。

### 选做巩固

- [P1077 · 摆花](https://www.luogu.com.cn/problem/P1077)：每种花数量有上限，按种类顺序恰好摆 $m$ 盆，求方案数。枚举每种花的数量，注意不能把优化价值的拆分直接用于方案计数。
- [P1164 · 小 A 点菜](https://www.luogu.com.cn/problem/P1164)：每道菜只有一份，求恰好花完预算的选菜方案数。区分不可达状态与空集的一种方案。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[动态规划的引入 #211](https://www.luogu.com.cn/training/211)。

## 本节验收

能把数量限制写成可选组合；能解释二进制拆分为什么覆盖全部件数；能区分同组旧层、恰好装满与至多容量，避免把最优化拆分直接用于计数。
