---
title: 松弛操作与 BFS 最短路的衔接
description: 先理解距离估计怎样被一条边改进，再根据边权安排候选的处理顺序。
---

## 这一节学什么

无权图的 BFS 按边数分层，第一次到达某点就得到最短距离。边带上不同代价后，“先入队”不再等于“代价小”。最短路算法共同的核心是松弛：尝试用已经找到的路线改善另一点的距离。

> **AI 伴学提示词**
>
> 为我讲解距离估计与松弛，从无权 BFS 过渡到 $0/1$ BFS，手算队列顺序为什么要随边权变化，并引导我提问。

## 一条边提供一个新的到达方案

设 `dist[u]` 是目前找到的起点到 $u$ 的最小代价，存在边 $u\to v$，权值为 $w$，那么先到 $u$ 再走这条边的代价是 $\mathrm{dist}[u]+w$。若更小，就更新 `dist[v]`。

```text
if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
```

$\mathrm{dist}$ 是“当前最好方案”，更新之前不一定等于最终最短路。起点设为 0，其他点设为足够大的 $\mathrm{INF}$，表示还没有找到路线。$\mathrm{INF}$ 要能覆盖最大合法答案，做加法前也要保证起点可达、运算不溢出。

例如边 $1\to2$ 权 10，$1\to3$ 权 1，$3\to2$ 权 1。先看到直达路线会得到 `dist[2] = 10`，经过 3 后还能改成 2。普通 BFS 的“第一次访问后永不改动”在这里会出错。

## 权值全为 1：普通队列已经保持合适顺序

距离 $d$ 的点，只会生成距离 $d+1$ 的候选。BFS 把它们放队尾，恰好按距离不减处理。这就是无权 BFS 能求最短路的原因，而不是“图上用了队列就自动最短”。

如果权值只有 `0 1`，从距离 $d$ 出发：走 0 边仍是 $d$，应优先处理；走 1 边变成 $d+1$，放在后面。用双端队列 `deque`，0 边 `push_front`、1 边 `push_back`，即 $0/1$ BFS。

## 例题精讲：[P1346 电车](https://www.luogu.com.cn/problem/P1346)

**题意简述：** 每个路口的开关默认指向名单中的第一条轨道，走其他轨道需要切换一次。求从 $A$ 到 $B$ 的最少切换数，不可达输出 −1。输入 $N$、$A$、$B$，再输入 $N$ 行，每行先给轨道数 Ki，再按顺序给出目标编号。$N\le 100$。

自编输入：

```text
3 1 3
2 2 3
1 1
0
```

输出：

```text
1
```

### 先把思路讲清楚

路口 1 默认去 2，费用 0；改去 3 的费用 1。虽然 1→2→1 可以免费走，但要到 3 仍需切换一次。

将每份名单的第一个目标记成权 0，其余记成权 1，问题就变为 $0/1$ 最短路。边有向，只在输入起点的名单追加。$\mathrm{dist}[v]>\mathrm{dist}[u]+w$ 表示发现更便宜的方案，更新叫松弛。

费用不增加的候选放双端队列前面，增加 1 的放后面，就能按距离层次处理。不能像普通 BFS 那样第一次看见就永久标记：某点先通过收费路线发现，后来还可能有更便宜的路线。代码只在距离严格变小时入队，也不会被零环无限重复更新。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;
struct Edge {
    int to, weight;
};

int main() {
    int n, start, target;
    cin >> n >> start >> target;
    vector<vector<Edge>> g(n + 1);
    for (int u = 1; u <= n; u++) {
        int count;
        cin >> count;
        for (int i = 0; i < count; i++) {
            int v;
            cin >> v;
            g[u].push_back({v, i == 0 ? 0 : 1});
        }
    }
    const int INF = 1000000000;
    vector<int> dist(n + 1, INF);
    deque<int> q;
    dist[start] = 0;
    q.push_front(start);
    while (!q.empty()) {
        int u = q.front();
        q.pop_front();
        for (Edge e : g[u]) {
            if (dist[e.to] > dist[u] + e.weight) {
                dist[e.to] = dist[u] + e.weight;
                if (e.weight == 0) q.push_front(e.to);
                else q.push_back(e.to);
            }
        }
    }
    cout << (dist[target] == INF ? -1 : dist[target]) << '\n';
    return 0;
}
```

设 $M$ 为名单总长度，$0/1$ BFS 时间、空间 $\mathcal{O}(N+M)$。起点等于终点时答案为 0，空名单不需补边。

## 练习：把处理顺序与边权连起来

先**独立重做本例**，手算双端队列每次的内容，标出每次松弛的旧距离、新距离与入队端，检查免费环不会反复产生相同距离更新。

### 推荐必做

1. [P4554 小明的游戏](https://www.luogu.com.cn/problem/P4554)：在两类字符组成的网格中行走，同类移动费用 0、异类费用 1，求指定起终点的最小费用。练习把格子展开为结点，并对多组数据运行 $0/1$ BFS。

### 选做巩固

- [P4667 · Switch the Lamp On](https://www.luogu.com.cn/problem/P4667)：旋转最少电路元件，使电源和灯连通。以网格交点为状态，判断沿对角线移动是否需要旋转。
- [P1144 · 最短路计数](https://www.luogu.com.cn/problem/P1144)：在无权图中统计从 1 出发到各点的最短路径数。用普通 BFS 按层处理，比较与 $0/1$ 边权的队列安排。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[最短路 #208](https://www.luogu.com.cn/training/208)。

## 本节验收

能解释 dist 的当前估计含义；能写出松弛条件；能说明普通队列和双端队列各自适用的边权，并正确处理不可达与零权环。
