---
title: 生成树、割与贪心选择
description: 分清全图连通总代价与单源最短路，用割上的替换论证理解哪些边可以安全加入。
---

## 这一节学什么

修建道路让所有城市连通，目标是所选道路的总代价最小。这里不要求每个城市到某个起点的路线最短，而是要用一组边把所有点连接起来。先明确生成树的条件，再推导选择最便宜边的理由。

> **AI 伴学提示词**
>
> 为我讲解生成树、最小生成树与割性质，用小图手动加边和替换环上的边，区分最小总代价与最短路，并引导我提问。

## 生成树到底是什么

n 个点全部保留，所选边连通且无环，就得到一棵生成树，边数恰好是 n−1。原图不连通时没有生成树；连通时通常有许多不同生成树。

最小生成树 MST 是边权总和最小的一棵。可以有多个边集不同、总权相同的 MST，不必为了唯一性人为规定一条题目没有要求的树。

例如三角形中 1—2、1—3 权均为 2，2—3 权为 1。以 1 为源的最短路树会选择两条权 2 的边，总权 4；MST 选择一条权 2、一条权 1，总权 3。

## 例题精讲：自编 · 检查给出的边是不是生成树

**题意简述：** 输入无向带权图 n、m，随后 m 行 u、v、w；再输入 k 与 k 个边编号，检查所选边是否构成生成树。若是，输出 YES 与总权，否则输出 NO。n,m≤10⁵，|w|≤10⁹，边编号合法，允许重边、自环及重复选择。

输入：

```text
4 5
1 2 1
2 3 2
3 4 3
1 4 10
1 3 4
3
1 2 3
```

输出 `YES 6`。若改选 1、2、5，三个点形成环，第 4 点没连上，即使边数是 n−1 也不能通过。

### 用并查集检查每条边能否合并两个块

一开始每个点独立；若边两端已在同一集合，加入会成环。否则合并。最后检查边数与连通性。这个例题检查的是“是否为生成树”，最小性的选择规则在后面推导。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> parent, size;
    DSU(int n) : parent(n + 1), size(n + 1, 1) { iota(parent.begin(), parent.end(), 0); }
    int find(int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    }
    bool merge(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;
        if (size[x] < size[y]) swap(x, y);
        parent[y] = x; size[x] += size[y];
        return true;
    }
};

struct Edge { int u, v; long long weight; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, k;
    cin >> n >> m;
    vector<Edge> edges(m + 1);
    for (int i = 1; i <= m; i++) cin >> edges[i].u >> edges[i].v >> edges[i].weight;
    cin >> k;
    DSU dsu(n);
    bool valid = (k == n - 1);
    long long total = 0;
    while (k--) {
        int id;
        cin >> id;
        const Edge &e = edges[id];
        if (!dsu.merge(e.u, e.v)) valid = false;
        total += e.weight;
    }
    for (int u = 1; u <= n; u++) if (dsu.find(u) != dsu.find(1)) valid = false;
    if (valid) cout << "YES " << total << '\n';
    else cout << "NO\n";
    return 0;
}
```

图保存在 vector 边表中，因为我们按边编号检查，而不是逐点访问邻居。读图 O(n+m)，检查所选边与连通性约 O((n+k)α(n))，存储 O(n+m)。α(n) 是并查集的反阿克曼复杂度，在这些规模下可看作很小的常数。

## 割：把所有点分成两边

将顶点分成非空集合 S 与其余点，连接两边的边称为跨割边。任何生成树必须有跨割边，否则两侧不能连通。

假设已经选了一片森林，并且存在一棵 MST 包含它；再选一个不切开任何已选边的割。取跨割最小边 e：若该 MST 已包含 e，直接保留；否则把 e 加入会成一个环，环上还有另一条跨割边 f。删掉 f 后仍是生成树，而且 w(e)≤w(f)，总代价不增加；割没有切开已选边，因此删掉 f 也不会破坏之前的选择。

这说明可以把当前选择扩展成一棵包含 e 的 MST。贪心每一步都需要这样的“不损失最优解”的理由，而不是因为边比较便宜就随意加入。

下一节的两种算法选割的方式不同：Kruskal 看当前连通块之间的最便宜边；Prim 看已加入点集与其余点之间的最便宜边。并查集、堆分别实现这些选择。

## 练习：同时检查连通与无环

先**独立重做本例**，测试重复选边、自环、只连上部分点、n=1 且不选边。

### 推荐必做

1. **自编 · 枚举小图的 MST：** n≤7、m≤12，枚举 n−1 条边的子集，调用生成树检查，再取最小总权，为下一节写一个独立对拍答案。
2. **自编 · 列出一个割：** 输入 S 中的顶点，输出跨割最小边，手动验证任意生成树至少跨过一次这个割。

### 选做巩固

- **自编 · MST 与最短路树不同：** 构造四点图，分别手算总权最小的树与某源点的最短路树。
- **自编 · 相同权值：** 给所有边相同权值，说明为什么任意生成树的总权相同，但含环或不连通的边集仍然不合格。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[最小生成树 #209](https://www.luogu.com.cn/training/209)。

## 本节验收

能准确给出生成树的条件；能区分 MST 与最短路；能用加边成环、删跨割边的替换过程说明安全选择。
