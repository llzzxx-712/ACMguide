---
title: 树形 DP：子树状态与父子转移
description: 用当前点的选择概括它与外部的关系，在孩子都算完后合并各棵子树。
---

## 这一节学什么

树的不同孩子子树之间没有直接边。若把当前点对外部的选择固定下来，孩子们往往就能各自解决，再把结果合并。状态的职责是保留父子边上真正会影响选择的信息。

> **AI 伴学提示词**
>
> 为我讲解树形 DP 的子树边界，用舞会选或不选的状态解释父子约束，手算返回时的合并，并引导我提问。

## 例题精讲：P1352 · 没有上司的舞会

**原题：** [P1352 · 没有上司的舞会](https://www.luogu.com.cn/problem/P1352)。

**题意简述：** 上下级关系是一棵树，每人有可正可负的快乐值，直接上司与下属不能同时参加，求最大总快乐值。$n\le 6000$。输入每人的权值后，$n-1$ 行 subordinate boss 表示直接关系。

输入：

```text
3
5
4
4
2 1
3 1
```

输出 `8`，邀请 `2、3`，不邀请 1；并不是逐点挑当前快乐值最大的人。

## 选与不选，决定孩子能做什么

`f[u][1]` 表示 $u$ 子树内、必须选 $u$ 的最大值；`f[u][0]` 表示必须不选 $u$ 的最大值。

```text
选 u：value[u] + Σ f[v][0]
不选 u：Σ max(f[v][0], f[v][1])
```

第一种孩子不能选，第二种孩子自由选择。各孩子子树互不冲突，因此最优值可以直接相加。叶子选时为自身权值，不选为 0；负权叶子会自然被舍弃。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> value(n + 1);
    for (int u = 1; u <= n; u++) cin >> value[u];
    vector<vector<int>> children(n + 1);
    vector<int> parent(n + 1);
    for (int i = 1, u, p; i < n; i++) {
        cin >> u >> p;
        parent[u] = p;
        children[p].push_back(u);
    }
    int root = 1;
    while (parent[root]) root = parent[root];
    vector<int> order(1, root);
    for (int i = 0; i < n; i++) for (int v : children[order[i]]) order.push_back(v);
    vector<array<long long, 2>> f(n + 1);
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        f[u][1] = value[u];
        for (int v : children[u]) {
            f[u][1] += f[v][0];
            f[u][0] += max(f[v][0], f[v][1]);
        }
    }
    cout << max(f[root][0], f[root][1]) << '\n';
    return 0;
}
```

先记录父亲在孩子之前的 $\mathrm{order}$，倒序时孩子都已经完成，正好实现“递归返回后合并”。根不一定为 1，要沿 $\mathrm{parent}$ 找到实际树根。总时间、空间 $\mathcal{O}(n)$。

题目只禁止直接父子同时选，祖孙之间可以一起选。不要把约束误扩展成“所有祖先都不能出现”。

## 从选择状态理解其他模型

若要用尽量少的点覆盖每条边，选 $u$ 时孩子可选可不选，不选 $u$ 时每个孩子必须选，合并方式改为 min。若要求每点被选或有相邻点被选，还要区分“已被孩子覆盖”与“等待父亲覆盖”，仅选/不选两种状态就不够。

## 练习：说明子树与外部通过什么发生联系

先**独立重做 P1352**，对 $n\le 18$ 枚举所有邀请子集，检查每条父子边，核对最大快乐值。

### 推荐必做

1. [P2016 战略游戏](https://www.luogu.com.cn/problem/P2016)：在树的结点上放最少士兵，使每条边至少有一端放置士兵。练习推导父亲选或不选时孩子的状态，并注意原题结点从 0 编号。
2. [P1122 最大子树和](https://www.luogu.com.cn/problem/P1122)：保留一块非空连通子树，使点权和最大。练习判断每个孩子的贡献是否值得加入，注意点权可以为负。

### 选做巩固

- [P2279 消防局的设立](https://www.luogu.com.cn/problem/P2279)：在树上设置最少消防局，覆盖距离不超过 2 的所有结点；练习设计比选与不选更细的状态。
- [P2015 二叉苹果树](https://www.luogu.com.cn/problem/P2015)：保留与根连通的指定数量树枝，最大化苹果数；练习将子树状态扩展为选择数量。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树与图上的动态规划 #214](https://www.luogu.com.cn/training/214)。

## 本节验收

能确定子树状态与外界的接口；能从父子约束推导孩子的合法状态；能按依赖顺序合并，并正确处理负权与未知根。
