---
title: Dijkstra 与堆优化
description: 在非负边权图中，每次确定当前距离最小的未处理点，用小根堆安排候选路线。
---

## 这一节学什么

$0/1$ BFS 靠双端队列安排距离顺序，任意非负边权则交给小根堆：每次取当前距离最小的候选，再沿它的出边松弛。这就是堆优化 Dijkstra。

> **AI 伴学提示词**
>
> 为我讲解 Dijkstra 为什么能确定当前最近点，手算小根堆中的旧记录，解释非负边权的作用，并引导我提问。

## 为什么当前最小候选可以确定

假设 $u$ 的候选距离最小。如果还有一条更短路线尚未发现，从已确定区域沿那条路线走出去，遇到的第一个未确定点 $x$，早已由前面的边产生候选。因为剩余边权非负，$x$ 的候选不会比这条到 $u$ 的完整路线更大，因此应先于 $u$ 被取出，矛盾。

负边会破坏“后面再走不会变便宜”这个依据。例如先到某点费用 10，后面还可以走一条 −20 的边，当前远不代表最终远。

## 例题精讲：P4779 · 单源最短路径

**原题：** [P4779 · 单源最短路径（标准版）](https://www.luogu.com.cn/problem/P4779)。

**题意简述：** 给非负边权有向图，输出源点 $s$ 到每个点的最短距离，原题保证所有点可达。$n\le 10^{5}$，$m\le 2\times 10^{5}$。

自拟输入：

```text
4 5 1
1 2 10
1 3 1
3 2 2
2 4 1
3 4 8
```

输出 `0 3 1 4`。堆中最初有 $(10,2)$、$(1,3)$；弹出 3 后，将 2 改为 `3、4` 改为 9；弹出 2 后，将 4 改为 4。旧的 $(10,2)$、$(9,4)$ 仍在堆中，但已没有作用。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int to; long long weight; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, s;
    cin >> n >> m >> s;
    vector<vector<Edge>> g(n + 1);
    for (int i = 0, u, v; i < m; i++) {
        long long w;
        cin >> u >> v >> w;
        g[u].push_back({v, w});
    }
    const long long INF = (1LL << 62);
    vector<long long> dist(n + 1, INF);
    priority_queue<pair<long long, int>, vector<pair<long long, int>>, greater<pair<long long, int>>> heap;
    dist[s] = 0;
    heap.push({0, s});
    while (!heap.empty()) {
        long long distance = heap.top().first;
        int u = heap.top().second;
        heap.pop();
        if (distance != dist[u]) continue;
        for (const Edge &e : g[u]) {
            if (distance + e.weight < dist[e.to]) {
                dist[e.to] = distance + e.weight;
                heap.push({dist[e.to], e.to});
            }
        }
    }
    for (int u = 1; u <= n; u++) {
        if (u > 1) cout << ' ';
        cout << (dist[u] == INF ? -1 : dist[u]);
    }
    cout << '\n';
    return 0;
}
```

pair 的第一项是距离，小根堆先比较它；第二项只是点号。不能把两项颠倒，否则会变成优先处理编号较小的点。

上面的实现还把不可达位置输出为 −1，便于用于一般输入；本题的可达保证使这一分支不会触发。距离用 `long long`，$\mathrm{INF}$ 留出加边权的空间，避免用 `INT_MAX` 再相加溢出。

每次成功松弛产生一条候选，旧候选在弹出后跳过，时间 $\mathcal{O}((n+m)\log(m+1))$，存储 $\mathcal{O}(n+m)$。简单图中常写为 $\mathcal{O}((n+m)\log n)$。

## 同一个算法，用于不同的状态

图上的结点不一定是城市，也可以是“城市、已用券数”“格子、当前方向”。只要状态转移代价非负，就可以对这样的状态图应用同一过程。先建模，再写松弛，不要只看题面有没有画出一张图。

## 练习：堆里保存的是候选，不是一份不可更改的答案

先**独立重做 P4779**，测试重边、零权边、连续多次改善同一点以及起点本身。

### 推荐必做

1. [CF 20C · Dijkstra?](https://codeforces.com/problemset/problem/20/C)：求无向带权图从 1 到 $n$ 的一条最短路径，不可达输出 −1。严格改善时记录前驱并从终点回溯。
2. [P1629 · 邮递员送信](https://www.luogu.com.cn/problem/P1629)：每次从邮局送一件物品并返回，求全部往返的最短总时间。在原图与反图各运行一次最短路。

### 选做巩固

- [P1339 · Heat Wave](https://www.luogu.com.cn/problem/P1339)：求无向带权图指定两点间的最短距离。用堆维护候选距离，检查双向建边和重边。
- [P1828 · 香甜的黄油](https://www.luogu.com.cn/problem/P1828)：选择一个牧场放黄油，使所有奶牛走到该处的距离和最小。枚举候选点运行最短路，再按奶牛所在位置累加。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[最短路 #208](https://www.luogu.com.cn/training/208)。

## 本节验收

能说明非负边权为什么关键；能解释堆中的旧记录；能从状态、转移与代价三个方面把实际问题写成最短路。
