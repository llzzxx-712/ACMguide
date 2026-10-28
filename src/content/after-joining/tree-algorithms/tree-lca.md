---
title: 倍增与最近公共祖先 LCA
description: 先补齐深度差，再同步向上跳，找到两条祖先链第一次汇合的位置。
---

## 这一节学什么

两点之间的树上路径会先向上走到一个公共祖先，再向下走。离它们最近的公共祖先称为 LCA。上一章倍增把多步跳跃拆成二的幂，这里把“下一站”换成父亲。

> **AI 伴学提示词**
>
> 为我讲解 LCA 的深度补齐与同步倍增，手算两点怎样在公共祖先下方停住，并引导我提问。

## 从一次走一步，改为一次跳 2ᵏ 步

定义 up[u][k] 为 u 向上 2ᵏ 条边到达的祖先，up[u][0]=parent[u]。先跳前一半，再跳后一半：

```text
up[u][k] = up[ up[u][k-1] ][k-1]
```

根的父亲设为 0，0 的所有祖先仍为 0。它只作为“树外”的哨兵，不代表真实结点。

先让深点补齐与浅点的深度差；如果此时两点相同，浅点本来就是祖先，直接返回。否则从大 k 到小 k：若 up[u][k] 与 up[v][k] 不同，说明这两次跳跃仍没有汇合，可以一起跳；若相同，这次会跳到公共部分，先不跳，尝试更短的跳跃。结束时两点的父亲相同，返回它。

## 例题精讲：P3379 · 最近公共祖先

**原题：** [P3379 · 最近公共祖先](https://www.luogu.com.cn/problem/P3379)。

**题意简述：** 输入 n、查询数 q、根 root，给 n−1 条树边，逐次查询两点的 LCA。n、q≤5×10⁵，查询两点可以相同。

自拟输入：

```text
5 3 1
1 2
1 3
2 4
2 5
4 5
4 3
2 4
```

输出依次为 `2、1、2`，每项一行。4 与 5 已经等深且父亲相同；4 与 3 先把 4 提到 2，再从 2、3 找共同父亲 1。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q, root;
    cin >> n >> q >> root;
    const int LOG = 20;
    vector<vector<int>> g(n + 1);
    for (int i = 1, u, v; i < n; i++) {
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<array<int, LOG>> up(n + 1);
    vector<int> depth(n + 1), order(1, root);
    for (int i = 0; i < n; i++) {
        int u = order[i];
        for (int v : g[u]) if (v != up[u][0]) {
            up[v][0] = u;
            depth[v] = depth[u] + 1;
            for (int k = 1; k < LOG; k++) up[v][k] = up[up[v][k-1]][k-1];
            order.push_back(v);
        }
    }
    auto lca = [&](int u, int v) {
        if (depth[u] < depth[v]) swap(u, v);
        int difference = depth[u] - depth[v];
        for (int k = LOG - 1; k >= 0; k--) {
            if ((difference >> k) & 1) u = up[u][k];
        }
        if (u == v) return u;
        for (int k = LOG - 1; k >= 0; k--) {
            if (up[u][k] != up[v][k]) {
                u = up[u][k];
                v = up[v][k];
            }
        }
        return up[u][0];
    };
    while (q--) {
        int u, v;
        cin >> u >> v;
        cout << lca(u, v) << '\n';
    }
    return 0;
}
```

LOG=20 保存 k=0…19，能组合出小于 2²⁰ 的深度差，覆盖本题 5×10⁵ 个点。规模变化时应重新确定层数。

两个循环虽然都从大到小，但条件不同：补齐深度时看深度差的二进制位；同步跳时看祖先是否不同。它们分别实现“走一样高”和“停在汇合点下方”。

预处理 O(n log n)，每次查询 O(log n)，存储 O(n log n)。采用遍历序列建立祖先表，避免链形树上的深递归。

## 距离也跟着得到

无权树上：`distance(u,v)=depth[u]+depth[v]-2*depth[lca(u,v)]`。两条根路径在公共祖先上方重复，减去两遍即可。

若边有权，另存根到各点的距离 dist，换成 `dist[u]+dist[v]-2*dist[lca]`，dist 用 long long；depth 仍用于判断祖先层数，不要把加权距离当成深度。

## 练习：画出哪一段被重复计算

先**独立重做 P3379**，测试两点相同、一点为另一个祖先、根不为 1、长链与星形树。

### 推荐必做

1. [P2912 · Pasture Walking](https://www.luogu.com.cn/problem/P2912)：多次询问带权树上两点间路径长度。记录各点到根的距离，用 LCA 去掉重复计算的公共部分。
2. [P4281 · 紧急集合](https://www.luogu.com.cn/problem/P4281)：三人从树上不同位置出发，求使总路程最小的集合点与费用。计算三对 LCA，结合距离公式确定交会点。

### 选做巩固

- [P3398 · 仓鼠找 sugar](https://www.luogu.com.cn/problem/P3398)：多次判断树上两条路径是否有公共点。借助 LCA 和距离关系判断候选点是否落在路径上。
- [P1967 · 货车运输](https://www.luogu.com.cn/problem/P1967)：求多对城市之间可运输的最大载重。先构造最大生成森林，再在倍增跳跃时维护路径最小边权，处理不连通。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树 #207](https://www.luogu.com.cn/training/207)。

## 本节验收

能说明 up 的状态和转移；能解释补齐深度后的相等判断；能逐步推导同步跳跃条件，并区分深度与加权距离。
