---
title: 树的直径与重心
description: 分别寻找树上最远的两点，以及删去后最大连通块最小的点，理解两种不同的整体结构。
---

## 这一节学什么

树的直径关注“哪两点之间最远”，重心关注“在哪个点分开后，各部分尽量均衡”。先分清优化目标，再决定要统计距离还是子树大小。

> **AI 伴学提示词**
>
> 为我讲解树的直径与重心，用链和星形树手算两种答案，解释两次遍历与最大连通块的计算，并引导我提问。

## 直径：所有简单路径中最长的一条

树上两点之间只有一条简单路径。边权非负时，任选 s，找离 s 最远的点 A；再从 A 找最远点 B，A—B 就是一条直径。无权树可以把每条边看成权值 1。

为什么从任意点出发也能找到端点？把 s 接到一条直径上，比较从接入处走向两端的距离，较远方向已经给出了一个很长的候选。若最远点 A 在别的分支，利用它“不比走向两端短”的条件替换相应端点，可以得到一条经过 A 的直径。再从 A 取最远点，就得到直径长度。

这依赖非负边权。含负边时，第一次最远点可能把必要的负边挡在外面，不能直接套两次遍历，应按树上路径的状态重新分析。

## 例题精讲一：自编 · 非负边权树的直径

**题意简述：** 输入 n，再给 n−1 条无向边 u、v、w，求树的直径长度。1≤n≤2×10⁵，0≤w≤10⁹。只有一个点时答案为 0。

输入 `5`，四条边为 `(1,2,2)、(2,3,3)、(2,4,1)、(4,5,4)`，输出 `8`，路径是 3→2→4→5。

### 有权树也不需要最短路堆

从一个点出发，每个点的唯一简单路径已经确定，沿树边累加即可。这里用 vector 保存遍历顺序，每个孩子的距离等于父亲距离加边权；这与普通带环图上按 BFS 层数求带权最短路是不同的计算任务。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int to; long long weight; };

pair<int, long long> farthest(const vector<vector<Edge>> &g, int start) {
    int n = g.size() - 1;
    vector<int> parent(n + 1), order(1, start);
    vector<long long> distance(n + 1);
    int best = start;
    for (int i = 0; i < n; i++) {
        int u = order[i];
        if (distance[u] > distance[best]) best = u;
        for (const Edge &e : g[u]) if (e.to != parent[u]) {
            parent[e.to] = u;
            distance[e.to] = distance[u] + e.weight;
            order.push_back(e.to);
        }
    }
    return {best, distance[best]};
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<Edge>> g(n + 1);
    for (int i = 1, u, v; i < n; i++) {
        long long w;
        cin >> u >> v >> w;
        g[u].push_back({v, w});
        g[v].push_back({u, w});
    }
    int a = farthest(g, 1).first;
    cout << farthest(g, a).second << '\n';
    return 0;
}
```

两次遍历各 O(n)，距离使用 long long。若还需要具体直径，把第二次遍历的 parent 留下来，从 B 沿父亲走回 A 即可。

## 重心：删去这个点后，最大的一块有多大

以 1 为根，删去 u 后，每个孩子 v 的子树各成为一块，大小为 size[v]；父亲方向的那一块大小为 n−size[u]。因此：

```text
largest[u] = max(n-size[u], 所有孩子的 size[v])
```

使 largest 最小的点是重心，也可以用“所有分块都不超过 n/2”判断。树有一个或两个重心，两个时相邻。不要漏掉父亲方向，也不要把 u 自己算进任何剩余块。

## 例题精讲二：P1395 · 会议

**原题：** [P1395 · 会议](https://www.luogu.com.cn/problem/P1395)。

**题意简述：** 无权树上选一个点，使所有点到它的距离和最小；若多个点满足，选编号最小的，输出点号与距离和。n≤50000。

自拟输入为链 `1—2—3—4—5`，输出 `3 6`，五个距离为 2、1、0、1、2。

### 从“走向人数多的一侧”推到重心

把会场从 u 移到相邻点 v，v 那一侧有 s 人：这 s 人各少走 1，其余 n−s 人各多走 1，总距离变化为 n−2s。若 s>n/2，往这一侧移动会更好。

到了所有侧面都不超过一半的点，继续向任意方向走都不能降低距离和；沿同一个方向越走，前方人数还会减少，不会在更远处突然变得更优。因此重心正好是本题的最优会场。

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> g(n + 1);
    for (int i = 1, u, v; i < n; i++) {
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> parent(n + 1), size(n + 1, 1), order(1, 1);
    for (int i = 0; i < n; i++) {
        int u = order[i];
        for (int v : g[u]) if (v != parent[u]) {
            parent[v] = u;
            order.push_back(v);
        }
    }
    for (int i = n - 1; i > 0; i--) size[parent[order[i]]] += size[order[i]];
    int center = 1, best = n;
    for (int u = 1; u <= n; u++) {
        int largest = n - size[u];
        for (int v : g[u]) if (parent[v] == u) largest = max(largest, size[v]);
        if (largest < best) { best = largest; center = u; }
    }
    vector<int> distance(n + 1, -1);
    queue<int> q;
    q.push(center);
    distance[center] = 0;
    long long total = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        total += distance[u];
        for (int v : g[u]) if (distance[v] == -1) {
            distance[v] = distance[u] + 1;
            q.push(v);
        }
    }
    cout << center << ' ' << total << '\n';
    return 0;
}
```

按编号升序扫描、只在 largest 严格更小时更新，就保留了并列时编号较小的点。总时间与空间都是 O(n)。

重心与“到最远点的距离最小”的树中心不是同一个概念：前者看分块人数，后者看距离。无权树的中心在直径中间，重心不一定在那里。

## 练习：先写出要最小化或最大化的量

先**独立重做两道例题**，在链、星形树和只有一个点的树上核对结果。

### 推荐必做

1. **自编 · 输出直径路径：** 沿用第一题，输出一种最长路径的点号序列，练习恢复 parent。
2. **自编 · 输出全部重心：** 沿用第二题的树，升序输出所有 largest≤n/2 的点，测试偶数长度链上的两个重心。

### 选做巩固

- **自编 · 每点的最远距离：** 已得直径端点 A、B，分别计算所有点到它们的距离，推导每点最远距离为两者的 max，并用全源遍历检查小树。
- **自编 · 会场向邻居移动：** 枚举每条树边，验证距离和的变化恰为 n−2s，为后面的换根 DP 建立直觉。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树 #207](https://www.luogu.com.cn/training/207)。

## 本节验收

能区分直径、重心与中心；能解释两次遍历的用途；能计算删点后的每一块，并从人数变化推导会议的最优位置。
