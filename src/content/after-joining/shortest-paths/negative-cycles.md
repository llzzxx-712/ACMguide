---
title: Bellman–Ford、SPFA 与负环
description: 通过反复松弛处理负边，区分负边与负环，并准确判断负环是否能从指定起点到达。
---

## 这一节学什么

负边表示走一步后代价可能下降，Dijkstra 的确定顺序不再成立。但松弛操作本身仍然有效：可以反复检查所有边，直到没有距离能改善。若一个可达环的总权值为负，反复绕圈就能无限降低代价，这才是负环。

> **AI 伴学提示词**
>
> 为我讲解 Bellman–Ford、SPFA 与可达负环，用小图追踪每轮距离变化，解释第 n 轮仍可改善的含义，并引导我提问。

## Bellman–Ford：给所有边再次发挥作用的机会

先设 dist[s]=0，其余 INF。每轮扫描全部边，若 u 可达且 dist[u]+w 更小，就更新 v。第一轮至少能覆盖所有只用一条边的路线，第二轮至少覆盖两条边，依此类推。

没有可达负环时，最短路线可以删掉非负的重复环，保留一条至多 n−1 条边的简单路径。因此做 n−1 轮足够。如果第 n 轮仍有改善，就存在可达负环；某轮完全不变可以提前结束。

同一轮中使用刚更新的值，可能更快传过多条边，不影响“至少覆盖这么多边”的结论。

## 例题精讲：P3385 · 负环

**原题：** [P3385 · 负环](https://www.luogu.com.cn/problem/P3385)。

**题意简述：** 多组数据，判断是否存在从 1 能到达的负环。输入边权 w≥0 时要加入两个方向；w<0 时只加入给定方向。n≤2000，输入记录数 m≤3000。

自拟输入：

```text
2
3 3
1 2 1
2 3 -3
3 2 1
3 1
2 3 -1
```

输出 `YES`、`NO`，每项一行。第一组从 1 可到环 2→3→2，总权为 −2；第二组只存在一条不可从 1 到达的负边。

### 完整代码

本算法要逐轮扫描全部边，所以用 vector 保存边表；这与遍历某个点的邻居时使用的 vector 邻接表分别服务于不同的访问方式。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int from, to, weight; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int tests;
    cin >> tests;
    while (tests--) {
        int n, m;
        cin >> n >> m;
        vector<Edge> edges;
        for (int i = 0, u, v, w; i < m; i++) {
            cin >> u >> v >> w;
            edges.push_back({u, v, w});
            if (w >= 0) edges.push_back({v, u, w});
        }
        const long long INF = (1LL << 62);
        vector<long long> dist(n + 1, INF);
        dist[1] = 0;
        bool negative = false;
        for (int round = 1; round <= n; round++) {
            bool changed = false;
            for (const Edge &e : edges) {
                if (dist[e.from] != INF && dist[e.from] + e.weight < dist[e.to]) {
                    dist[e.to] = dist[e.from] + e.weight;
                    changed = true;
                }
            }
            if (!changed) break;
            if (round == n) negative = true;
        }
        cout << (negative ? "YES" : "NO") << '\n';
    }
    return 0;
}
```

如果将所有 dist 初始为 0，就等于允许从每个点出发，会把其他连通部分的负环也算进来，与本题“从 1 可达”的要求不同。不要把这两种初始化混在一起。

输入 m 条记录不代表最终只有 m 条有向边，非负记录会加入两条。设实际边数为 E，时间 O(nE)，空间 O(n+E)。

## SPFA：只安排距离刚变化的点

完整扫描会重复检查许多没变化的点。SPFA 用队列保存需要再次检查出边的点：只有 dist[u] 变小了，才有必要从 u 继续传播。

```text
源点入队，并标记 inQueue[source]=true
反复取出 u，清掉 inQueue[u]
    枚举 u 的每条出边 u→v
    若成功松弛：
        更新 dist[v]
        pathEdges[v] = pathEdges[u] + 1
        若 pathEdges[v] >= n，发现可达负环
        若 v 当前不在队列中，将 v 入队
```

pathEdges 表示当前改善路线继承的边数，不是把“这个点被松弛过几次”直接累加。入队标记只用于避免同一时刻重复排队，出队后必须清除，点以后还可能需要再次入队。

SPFA 仍是反复松弛，最坏时间仍为 O(nE)，不能当作所有带权图的线性算法。非负边的大规模最短路优先使用堆优化 Dijkstra；有负边时再结合规模选择处理方式。

## 练习：先确定负环检查的起点范围

先**独立重做 P3385**，测试零权环、负边但无环、其他连通部分中的负环，以及第一条路就能进入的负环。

### 推荐必做

1. **自编 · 检查任意位置负环：** 沿用有向边输入，每条只加一个方向，判断整张图有没有负环。将全部 dist 初始为 0，解释它等价于新增源点用零边连接所有点。
2. **自编 · 无负环的单源距离：** 保证没有可达负环，输出源点到各点的最短距离，不可达输出 −1。保留 n−1 轮与提前结束，比较 BF 和 SPFA 的结果。

### 选做巩固

- **自编 · 负环总权检查：** 手工给出一条环，计算权值总和，分别修改成正、零、负，观察松弛是否会无限改善。
- **自编 · 队列状态跟踪：** 为 SPFA 打印入队、出队、距离改变，检查 inQueue 和永久访问标记的区别。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[最短路 #208](https://www.luogu.com.cn/training/208)。

## 本节验收

能区分负边与负环；能解释 n−1 轮和第 n 轮的含义；能准确区分指定源点与全图检查；知道 SPFA 改变的是工作安排而不是最坏复杂度。
