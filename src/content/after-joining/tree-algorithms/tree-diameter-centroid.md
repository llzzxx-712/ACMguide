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

## 例题精讲一：[SP1437 PT07Z — Longest path in a tree](https://www.luogu.com.cn/problem/SP1437)

**题意简述：** 给一棵 n 点无权无向树，输出最长简单路径的边数。第一行 n，接着 n−1 行无向边。1≤n≤10⁴。

自编输入：

```text
5
1 2
2 3
2 4
4 5
```

输出：

```text
3
```

### 先把思路讲清楚

从 1 出发最远的是 5，距离 3；再从 5 出发，最远的 1 或 3 距离都是 3，所以直径长度为 3。这里数的是边数。

先从任意点找到最远点 A，再从 A 找到最远点 B。无权树中，第一次的最远点可作为某条直径的端点。画一条最长路，再对照起点到这条路的分叉位置：沿最长路走向更远端，不会比停在内部更近；这使两次搜索能找到端点。

farthest 每次独立建距离数组。无权边距离逐层加 1，用 BFS；函数返回“最远点、距离”这一对数，第一次取编号，第二次取长度。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<int>> g(n + 1);
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    auto farthest = [&](int start) {
        vector<int> dist(n + 1, -1);
        queue<int> q;
        q.push(start);
        dist[start] = 0;
        int best = start;
        while (!q.empty()) {
            int u = q.front();
            q.pop();
            if (dist[u] > dist[best]) best = u;
            for (int v : g[u]) if (dist[v] == -1) {
                dist[v] = dist[u] + 1;
                q.push(v);
            }
        }
        return make_pair(best, dist[best]);
    };
    int a = farthest(1).first;
    cout << farthest(a).second << '\n';
    return 0;
}
```

两次 BFS 各 $\mathcal{O}(n)$，总时间、空间 $\mathcal{O}(n)$。非负带权树也可沿唯一简单路径累加边权，使用 `long long`；本题输入没有边权，只读两个端点。

## 重心：删去这个点后，最大的一块有多大

以 1 为根，删去 u 后，每个孩子 v 的子树各成为一块，大小为 `size[v]`；父亲方向的那一块大小为 `n - size[u]`。因此：

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

按编号升序扫描、只在 largest 严格更小时更新，就保留了并列时编号较小的点。总时间与空间都是 $\mathcal{O}(n)$。

重心与“到最远点的距离最小”的树中心不是同一个概念：前者看分块人数，后者看距离。无权树的中心在直径中间，重心不一定在那里。

## 练习：先写出要最小化或最大化的量

先**独立重做两道例题**，在链、星形树和只有一个点的树上核对结果。

### 推荐必做

1. [P2986 · Great Cow Gathering](https://www.luogu.com.cn/problem/P2986)：每个农场有不同人数，边有长度，求集合地点的最小总路程。比较位置沿边移动时两侧人数对距离和的影响。

### 选做巩固

- [P3304 · 直径](https://www.luogu.com.cn/problem/P3304)：求带正边权树的直径长度和所有直径共同经过的边数。先恢复一条直径，再分析不同直径的重合部分。
- [P1099 · 树网的核](https://www.luogu.com.cn/problem/P1099)：在直径上选一段长度不超过 s 的路径，使所有点到该路径的最大距离最小。先找直径，再枚举或维护其上的候选路径。
- [P1364 · 医院设置](https://www.luogu.com.cn/problem/P1364)：给定树上各点人口，选择医院位置使居民路程总和最小。比较相邻位置的距离和变化，将人数纳入分析。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树 #207](https://www.luogu.com.cn/training/207)。

## 本节验收

能区分直径、重心与中心；能解释两次遍历的用途；能计算删点后的每一块，并从人数变化推导会议的最优位置。
