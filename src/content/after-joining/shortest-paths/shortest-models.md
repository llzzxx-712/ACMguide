---
title: 最短路计数、分层图与差分约束
description: 在最短距离之外统计方案，把额外资源加入状态，并将不等式转化为有向边。
---

## 这一节学什么

算法负责处理状态与转移，题目要求我们决定状态究竟是什么。这一节分别给距离增加计数、给城市增加用券次数，再把变量之间的不等式解释成松弛关系。

> **AI 伴学提示词**
>
> 为我讲解最短路计数、分层图与差分约束，先确定每题的状态和边，再对应到代码，解释初始化与合法转移，并引导我提问。

## 例题精讲一：P1144 · 最短路计数

**原题：** [P1144 · 最短路计数](https://www.luogu.com.cn/problem/P1144)。

**题意简述：** 无向无权图，从 1 到每个点有多少条最短路，答案对 100003 取模，不可达为 0。允许重边和自环，$n\le 10^{6}$、$m\le 2\times 10^{6}$。

自拟输入为 `4 4`，边依次是 `1 2`、`1 3`、`2 4`、`3 4`，输出四行 `1 1 1 2`。起点到自己有一条空路线；到 4 的两条最短路分别经过 `2 3`。

### 距离决定哪些贡献可以相加

令 `ways[u]` 为最短路线数。沿边 $u$—$v$：第一次到达 $v$ 时，设 `dist[v] = dist[u] + 1`；只要 $\mathrm{dist}[v]=\mathrm{dist}[u]+1$，就把 `ways[u]` 加到 `ways[v]`。这两个判断要分开，第一次发现也要计数。

BFS 会处理完前一层，才处理下一层，所以某点出队时，所有最短前驱的贡献已经到齐。重边代表不同的边选择，应分别贡献；自环不会把距离增加 1 后仍保持最短，不会被统计。

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<vector<int>> g(n + 1);
    for (int i = 0, u, v; i < m; i++) {
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    const int MOD = 100003;
    vector<int> dist(n + 1, -1), ways(n + 1);
    queue<int> q;
    dist[1] = 0;
    ways[1] = 1;
    q.push(1);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int v : g[u]) {
            if (dist[v] == -1) { dist[v] = dist[u] + 1; q.push(v); }
            if (dist[v] == dist[u] + 1) ways[v] = (ways[v] + ways[u]) % MOD;
        }
    }
    for (int u = 1; u <= n; u++) cout << ways[u] << '\n';
    return 0;
}
```

时间与空间 $\mathcal{O}(n+m)$。百万级输入关闭流同步；邻接表要保存无向边的两个方向，估算内存时按 $2m$ 个邻居计算。

这种顺层累加依赖所有边权为 1。带零权边时，同距离的点可能互相依赖，不能简单在 Dijkstra 中加一个 ways 就照搬；先分析最短路边组成的结构。

## 例题精讲二：P4568 · 飞行路线

**原题：** [P4568 · 飞行路线](https://www.luogu.com.cn/problem/P4568)。

**题意简述：** 无向非负费用航线，可以最多免费乘坐 $k$ 次，求 $s$ 到 $t$ 的最少花费。城市编号为 $0,\ldots,n-1$，$n\le 10^{4}$、$m\le 5\times 10^{4}$、$k\le 10$。

自拟输入：

```text
3 3 1
0 2
0 1 5
1 2 5
0 2 20
```

输出 `0`，直接将 0→2 的航线免费使用。优惠作用于一段航线，不是给整个中转行程免费。

### 同一个城市，不同剩余资源，是不同状态

`dist[u][used]` 表示到达城市 $u$、恰好已经使用 $\mathrm{used}$ 次免费机会的最低费用。每条边 $u$—$v$ 有两种转移：付费到 ($v$,$\mathrm{used}$)，或者在 $\mathrm{used}<k$ 时免费到 ($v$,$\mathrm{used}+1$)。

两条到达 $u$ 的路线，即使当前费用相同，已用券数不同，后续能力也不同，不能只保存一个 `dist[u]`。终点允许用 0…$k$ 次券，所以对所有 `dist[t][used]` 取 min。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int to, cost; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, k, s, t;
    cin >> n >> m >> k >> s >> t;
    vector<vector<Edge>> g(n);
    for (int i = 0, u, v, w; i < m; i++) {
        cin >> u >> v >> w;
        g[u].push_back({v, w});
        g[v].push_back({u, w});
    }
    const long long INF = (1LL << 62);
    vector<vector<long long>> dist(n, vector<long long>(k + 1, INF));
    using State = tuple<long long, int, int>;
    priority_queue<State, vector<State>, greater<State>> heap;
    dist[s][0] = 0;
    heap.push(make_tuple(0, s, 0));
    while (!heap.empty()) {
        State current = heap.top();
        heap.pop();
        long long d = get<0>(current);
        int u = get<1>(current), used = get<2>(current);
        if (d != dist[u][used]) continue;
        for (const Edge &e : g[u]) {
            if (d + e.cost < dist[e.to][used]) {
                dist[e.to][used] = d + e.cost;
                heap.push(make_tuple(dist[e.to][used], e.to, used));
            }
            if (used < k && d < dist[e.to][used+1]) {
                dist[e.to][used+1] = d;
                heap.push(make_tuple(d, e.to, used + 1));
            }
        }
    }
    long long answer = *min_element(dist[t].begin(), dist[t].end());
    cout << (answer == INF ? -1 : answer) << '\n';
    return 0;
}
```

`tuple` 是保存三项数据的组合，这里依次为费用、城市、已用券数；`get<0>`、`get<1>`、`get<2>` 分别取这三项。小根堆仍先比较费用。

不必真的复制 $k+1$ 张邻接表，枚举原边时现场生成两种状态转移即可。状态 $\mathcal{O}(n(k+1))$，转移 $\mathcal{O}(m(k+1))$，堆版本时间约为 $\mathcal{O}((n+m)(k+1)\log((m+1)(k+1)))$。

## 例题精讲三：P5960 · 差分约束

**原题：** [P5960 · 差分约束](https://www.luogu.com.cn/problem/P5960)。

**题意简述：** 给若干不等式 $x[c]-x[c']\le y$，求任意一组可行整数解，无解输出 NO。$n,m\le 5000$，$|y|\le 10000$。

输入 `3 3`，三条约束为 `1 2 3`、`2 3 -2`、`1 3 1`，代码可输出 `0 -2 0`。逐条代入：$2\le 3$、$-2\le -2$、$0\le 1$，都成立。解可以整体平移，并不唯一。

### 从式子里读出一条边

把约束改写为 $x[c]\le x[c']+y$，它与松弛后的条件 $\mathrm{dist}[v]\le\mathrm{dist}[u]+w$ 相同，因此加入边 $c'\to c$，权 $y$。要满足所有连通部分，令全部 dist 初始为 0，等价于从新增源点用零边到达所有变量。

若存在负环，把环上约束相加会得到 $x\le x+\text{负数}$，矛盾，无解；若无负环，最终距离满足每条边的不等式，就是一组解。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int from, to, weight; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<Edge> edges;
    for (int i = 0, c, previous, y; i < m; i++) {
        cin >> c >> previous >> y;
        edges.push_back({previous, c, y});
    }
    vector<long long> dist(n + 1, 0);
    for (int round = 1; round <= n; round++) {
        bool changed = false;
        for (const Edge &e : edges) if (dist[e.from] + e.weight < dist[e.to]) {
            dist[e.to] = dist[e.from] + e.weight;
            changed = true;
        }
        if (!changed) break;
        if (round == n) { cout << "NO\n"; return 0; }
    }
    for (int u = 1; u <= n; u++) cout << dist[u] << (u == n ? '\n' : ' ');
    return 0;
}
```

Bellman–Ford 时间 $\mathcal{O}(nm)$，这里最大约 2500 万次边扫描。内部用 `long long`；无负环时，一条简单路线至多 $n-1$ 条边，本题输出值在 `int` 范围内。

边方向由不等式决定：$x[a]-x[b]\le c$ 是 $b\to a$；遇到大于等于先移项、变号，等式要拆成两个方向的小于等于。先在纸上写清，再建边。

## 练习：写代码前列出状态与转移

先**独立重做 P1144、P4568、P5960**。计数题核对层次，分层题检查“最多”而非“恰好”，约束题把输出逐条代回原式。

### 推荐必做

1. [P1462 · 通往奥格瑞玛的道路](https://www.luogu.com.cn/problem/P1462)：在血量允许的路径中，最小化经过城市的最大收费。二分收费上限，用最短路检查受限图中能否到达终点。
2. [P1993 · 小 K 的农场](https://www.luogu.com.cn/problem/P1993)：判断多条作物数量差的上界、下界和相等关系能否同时满足。逐条写不等式，再确定边方向和权值。

### 选做巩固

- [P4878 · Layout](https://www.luogu.com.cn/problem/P4878)：处理奶牛之间的距离上界和下界，并求首尾最大距离。补充编号顺序约束，区分无解和无上界。
- [P3275 · 糖果](https://www.luogu.com.cn/problem/P3275)：在满足小朋友之间的数量关系时求最少糖果总数。把严格大小关系改写为整数差分约束，并检查矛盾。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[最短路 #208](https://www.luogu.com.cn/training/208)。

## 本节验收

能区分最短距离和最短路线数；能把资源用量加入状态；能从不等式准确推导边方向，并解释全图初始化与负环的关系。
