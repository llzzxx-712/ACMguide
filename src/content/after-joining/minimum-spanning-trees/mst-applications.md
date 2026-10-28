---
title: 瓶颈路径、次小生成树与综合应用
description: 从最小跨割选择继续推导路径最大边的最优性，并通过环上替换求严格次小生成树。
---

## 这一节学什么

MST 不仅给出一棵总权最小的树。它的割与环结构，还能回答“路径最坏的一条边能多好”“比最优大一点的树怎样得到”。先确定新目标，再分析原来的选择与替换还能提供什么信息。

> **AI 伴学提示词**
>
> 为我讲解瓶颈路径和严格次小生成树，手算一条非树边加入后形成的环，解释为什么需要路径上最大的两个不同权值，并引导我提问。

## 例题精讲一：P1396 · 营救

**原题：** [P1396 · 营救](https://www.luogu.com.cn/problem/P1396)。

**题意简述：** 无向图中从 s 到 t，最小化路线上最大边权，原题保证可达。n≤10⁴、m≤2×10⁴，可有重边。

自拟输入：

```text
3 3 1 3
1 2 4
2 3 5
1 3 8
```

输出 `5`。目标比较的是 max(4,5)=5 与 8，而不是路线总和 9 与 8。

### 按阈值逐渐放开边

只允许使用权≤X 的边时，s 与 t 是否连通？把边升序加入并查集，第一次连通的边权就是最小可行阈值。比它小还没连通，达到它已经有路线，因此答案成立。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int u, v, weight; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, s, t;
    cin >> n >> m >> s >> t;
    vector<Edge> edges(m);
    for (Edge &e : edges) cin >> e.u >> e.v >> e.weight;
    if (s == t) { cout << 0 << '\n'; return 0; }
    sort(edges.begin(), edges.end(), [](const Edge &a, const Edge &b) { return a.weight < b.weight; });
    vector<int> parent(n + 1), size(n + 1, 1);
    iota(parent.begin(), parent.end(), 0);
    auto find = [&](int x) {
        while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
        return x;
    };
    for (const Edge &e : edges) {
        int u = find(e.u), v = find(e.v);
        if (u != v) {
            if (size[u] < size[v]) swap(u, v);
            parent[v] = u;
            size[u] += size[v];
        }
        if (find(s) == find(t)) { cout << e.weight << '\n'; return 0; }
    }
    cout << -1 << '\n';
    return 0;
}
```

时间 O(m log m+n)，空间 O(n+m)。若只有一个查询，不必先建完整 MST；若很多点对查询，可先建 MST，再用倍增查询树路径最大边。

为什么 MST 上的路径也最优？取这条路径中最大边 e，删去 e 把树分成两块。任何 s—t 路线都必须跨这个割；如果存在权更小的跨割边，就能替换 e 得到更小的生成树，矛盾。因此其他路线的最大边也不会小于它。

## 例题精讲二：P4180 · 严格次小生成树

**原题：** [P4180 · 严格次小生成树](https://www.luogu.com.cn/problem/P4180)。

**题意简述：** 求总权严格大于 MST 的所有生成树中最小的总权。n≤10⁵、m≤3×10⁵，权值在 0 到 10⁹，可有重边、自环，保证存在严格次小生成树。

自拟输入：

```text
3 3
1 2 1
2 3 2
1 3 2
```

输出 `4`。MST 总权为 3，把另一条权 2 边加入形成环；删除权 2 只得到另一棵总权 3 的 MST，删除权 1 才得到严格更大的 4。

### 加一条非树边，再在环上删一条

固定一棵 MST，加入非树边 (u,v,w)，形成的环由这条边和树上 u—v 路径组成。删去路径上一条权 t 的边，得到新生成树，总权增加 w−t。

要严格更大且尽量接近，t 应取路径上**小于 w 的最大边权**：

- w 大于路径最大值 first，删 first。
- w 等于 first，删最大的不同权值 second；删另一条同为 first 的边不会增加总权。
- 没有可删的较小值，这次替换不能产生严格更大的候选。

MST 的环性质保证非树边 w 不小于路径最大值。通过生成树的交换性质，最小的正增量可以在这样一次加边删边中取得，所以枚举全部非树边即可。

### 用倍增同时维护最大的两个不同值

沿用 LCA 的 up 表，每段向上跳跃再保存 first、second。合并两段时，只需从它们各自的两个候选里取最大的两个不同非负值，缺省为 −1。这里第二大指第二种权值，不是出现次数第二名。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct DSU {
    vector<int> p, size;
    DSU(int n) : p(n + 1), size(n + 1, 1) { iota(p.begin(), p.end(), 0); }
    int find(int x) {
        while (p[x] != x) { p[x] = p[p[x]]; x = p[x]; }
        return x;
    }
    bool merge(int x, int y) {
        x = find(x); y = find(y);
        if (x == y) return false;
        if (size[x] < size[y]) swap(x, y);
        p[y] = x; size[x] += size[y];
        return true;
    }
};
struct Edge { int u, v, weight; bool used = false; };
struct Info { int first = -1, second = -1; };

Info combine(Info a, Info b) {
    Info answer;
    for (int x : {a.first, a.second, b.first, b.second}) {
        if (x < 0 || x == answer.first || x == answer.second) continue;
        if (x > answer.first) { answer.second = answer.first; answer.first = x; }
        else if (x > answer.second) answer.second = x;
    }
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<Edge> edges(m);
    for (Edge &e : edges) cin >> e.u >> e.v >> e.weight;
    sort(edges.begin(), edges.end(), [](const Edge &a, const Edge &b) { return a.weight < b.weight; });
    DSU dsu(n);
    vector<vector<pair<int, int>>> g(n + 1);
    long long total = 0;
    int chosen = 0;
    for (Edge &e : edges) if (dsu.merge(e.u, e.v)) {
        e.used = true; total += e.weight; chosen++;
        g[e.u].push_back({e.v, e.weight});
        g[e.v].push_back({e.u, e.weight});
    }
    if (chosen != n - 1) { cout << -1 << '\n'; return 0; }
    const int LOG = 20;
    vector<array<int, LOG>> up(n + 1);
    vector<array<Info, LOG>> best(n + 1);
    vector<int> depth(n + 1), order(1, 1);
    for (int i = 0; i < n; i++) {
        int u = order[i];
        for (const auto &e : g[u]) if (e.first != up[u][0]) {
            int v = e.first;
            up[v][0] = u;
            best[v][0].first = e.second;
            depth[v] = depth[u] + 1;
            order.push_back(v);
        }
    }
    for (int k = 1; k < LOG; k++) for (int u = 1; u <= n; u++) {
        int middle = up[u][k-1];
        up[u][k] = up[middle][k-1];
        best[u][k] = combine(best[u][k-1], best[middle][k-1]);
    }
    auto pathInfo = [&](int u, int v) {
        Info answer;
        if (depth[u] < depth[v]) swap(u, v);
        int difference = depth[u] - depth[v];
        for (int k = LOG - 1; k >= 0; k--) if ((difference >> k) & 1) {
            answer = combine(answer, best[u][k]); u = up[u][k];
        }
        if (u == v) return answer;
        for (int k = LOG - 1; k >= 0; k--) if (up[u][k] != up[v][k]) {
            answer = combine(answer, combine(best[u][k], best[v][k]));
            u = up[u][k]; v = up[v][k];
        }
        return combine(answer, combine(best[u][0], best[v][0]));
    };
    const long long INF = (1LL << 62);
    long long answer = INF;
    for (const Edge &e : edges) if (!e.used && e.u != e.v) {
        Info path = pathInfo(e.u, e.v);
        int removed = e.weight > path.first ? path.first : path.second;
        if (removed >= 0) answer = min(answer, total + e.weight - removed);
    }
    cout << (answer == INF ? -1 : answer) << '\n';
    return 0;
}
```

自环不能加入生成树，也不能形成一次有效的两端点路径替换，要排除。最大边可能为 0，所以缺省值用 −1；累计树权用 long long。原题保证有解，代码中的 −1 用于覆盖扩展输入中的无解情况。

排序与 Kruskal O(m log m)，倍增及查询 O((n+m) log n)，空间 O(n log n+m)。代码比上一节长，是因为它把边选择、树存储与路径信息三件已学的事组合起来，并没有改变“先说明要查询什么，再安排数据”的方法。

## 练习：检查一次替换到底改变了多少

先**独立重做 P1396、P4180**，用小图枚举所有生成树，分别求最小权与严格大于它的最小权，对比程序结果。

### 推荐必做

1. [P1967 · 货车运输](https://www.luogu.com.cn/problem/P1967)：多次询问两城之间可以运输的最大载重，不连通时输出 −1。构造最大生成森林，用倍增查询树路径上的最小边，比较它与本节最小化最大边的方向。
2. [CF 609E · Minimum spanning tree for each edge](https://codeforces.com/problemset/problem/609/E)：对每条边，求必须包含它的生成树最小总权。先求 MST，再查询这条边两端在树路径上的最大边，计算替换代价。

### 选做巩固

- [P1991 · 无线通讯网](https://www.luogu.com.cn/problem/P1991)：部分哨所可用卫星电话互连，其余连接依赖相同距离上限的无线电，求最小通信距离。将生成树分成若干连通块，分析需要保留的最大边。
- [P2872 · Building Roads](https://www.luogu.com.cn/problem/P2872)：部分道路已经建好，求使所有点连通所需增加道路的最小长度。先在并查集中合并已有道路，再处理候选边。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[最小生成树 #209](https://www.luogu.com.cn/training/209)。

## 本节验收

能区分路径和与瓶颈值；能解释 MST 路径的瓶颈最优性；能从加边成环推导替换候选，并正确处理同权、零权、自环和严格次小。
