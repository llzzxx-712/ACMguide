---
title: 松弛操作与 BFS 最短路的衔接
description: 先理解距离估计怎样被一条边改进，再根据边权安排候选的处理顺序。
---

## 这一节学什么

无权图的 BFS 按边数分层，第一次到达某点就得到最短距离。边带上不同代价后，“先入队”不再等于“代价小”。最短路算法共同的核心是松弛：尝试用已经找到的路线改善另一点的距离。

> **AI 伴学提示词**
>
> 为我讲解距离估计与松弛，从无权 BFS 过渡到 0/1 BFS，手算队列顺序为什么要随边权变化，并引导我提问。

## 一条边提供一个新的到达方案

设 dist[u] 是目前找到的起点到 u 的最小代价，存在边 u→v，权值为 w，那么先到 u 再走这条边的代价是 dist[u]+w。若更小，就更新 dist[v]。

```text
if (dist[u] + w < dist[v]) dist[v] = dist[u] + w;
```

dist 是“当前最好方案”，更新之前不一定等于最终最短路。起点设为 0，其他点设为足够大的 INF，表示还没有找到路线。INF 要能覆盖最大合法答案，做加法前也要保证起点可达、运算不溢出。

例如边 1→2 权 10，1→3 权 1，3→2 权 1。先看到直达路线会得到 dist[2]=10，经过 3 后还能改成 2。普通 BFS 的“第一次访问后永不改动”在这里会出错。

## 权值全为 1：普通队列已经保持合适顺序

距离 d 的点，只会生成距离 d+1 的候选。BFS 把它们放队尾，恰好按距离不减处理。这就是无权 BFS 能求最短路的原因，而不是“图上用了队列就自动最短”。

如果权值只有 0、1，从距离 d 出发：走 0 边仍是 d，应优先处理；走 1 边变成 d+1，放在后面。用双端队列 deque，0 边 push_front、1 边 push_back，即 0/1 BFS。

## 例题精讲：自编 · 免费与收费通道

**题意简述：** n 个点、m 条有向边，每边费用为 0 或 1，求从 1 到 n 的最低费用，不可达输出 −1。n≤2×10⁵，m≤4×10⁵。输入 n、m 后，每行给 u、v、w。

输入：

```text
4 4
1 2 1
1 3 0
3 2 0
2 4 1
```

输出 `1`。1→3→2→4 的费用是 0+0+1；先看到 1→2 时得到的费用 1，可以被免费绕行改成 0。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int to, weight; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<Edge>> g(n + 1);
    for (int i = 0, u, v, w; i < m; i++) {
        cin >> u >> v >> w;
        g[u].push_back({v, w});
    }
    const int INF = 1000000000;
    vector<int> dist(n + 1, INF);
    deque<pair<int, int>> q;
    dist[1] = 0;
    q.push_front({0, 1});
    while (!q.empty()) {
        int distance = q.front().first, u = q.front().second;
        q.pop_front();
        if (distance != dist[u]) continue;
        for (const Edge &e : g[u]) {
            int candidate = distance + e.weight;
            if (candidate < dist[e.to]) {
                dist[e.to] = candidate;
                if (e.weight == 0) q.push_front({candidate, e.to});
                else q.push_back({candidate, e.to});
            }
        }
    }
    cout << (dist[n] == INF ? -1 : dist[n]) << '\n';
    return 0;
}
```

队列保存“当时的距离、结点”，若后来出现更优路线，旧记录弹出时直接跳过。只在严格变小时加入新记录，零权环不会造成反复加入相同距离。

双端队列中候选距离保持不减，最小候选出队时已经确定，边被用于松弛的总次数为 O(m)，总时间 O(n+m)，存储 O(n+m)。这个顺序依赖边权只能是 0 或 1，不能把权 7 也简单当成“放后面”。

## 练习：把处理顺序与边权连起来

先**独立重做本例**，手算双端队列每次的内容，观察旧的结点 2 记录怎样被跳过。

### 推荐必做

1. **自编 · 全部边权为 1：** 用普通 BFS 和本节代码各求一次所有点距离，比较结果，说明为什么此时不需要队首插入。
2. **自编 · 网格改向：** 每格给一个箭头，顺箭头走到相邻格费用 0，改方向费用 1，求左上角到右下角的最少改向次数。把格子作为点，现场生成四个邻居。

### 选做巩固

- **自编 · 恢复最低费用路线：** 更新 dist[v] 时同时记 parent[v]=u，从终点回溯；无解时不回溯。
- **自编 · 先访问不等于最优：** 构造一个带权图，让按边数最少的路线比多走几条免费边更贵，分别输出两种目标的答案。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[最短路 #208](https://www.luogu.com.cn/training/208)。

## 本节验收

能解释 dist 的当前估计含义；能写出松弛条件；能说明普通队列和双端队列各自适用的边权，并正确处理不可达与零权环。
