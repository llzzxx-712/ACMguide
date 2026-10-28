---
title: 缩点、DAG 与连通性应用
description: 将强连通分量压成一个点，把有环图上的重复访问转成 DAG 上按依赖顺序计算。
---

## 这一节学什么

一组点内部互相可达，往往可以作为整体处理。求出 SCC 后，把每组压成一个新点，跨组边保留，得到的缩点图一定没有有向环，可以使用前面学过的拓扑排序与 DAG 动态规划。

> **AI 伴学提示词**
>
> 为我讲解 SCC 缩点与 DAG 上的最大权路线，解释为什么压缩后无环、原题何时能把分量权值直接相加，并引导我提问。

## 为什么缩点后一定是 DAG

若不同分量 A→B→C→A 构成有向环，沿环就能在这三组之间互相到达，它们本来就应属于同一个 SCC，与分成不同组矛盾。

缩点不是随意忽略内部结构：需要先证明题目在分量内部的目标可以统一计算。例如要走一条不重复顶点的简单路径，就不能只凭“互相可达”认为必能一次经过全部点；下面例题允许重复经过，才具备这样的合并条件。

## 例题精讲：P3387 · 缩点

**原题：** [P3387 · 缩点](https://www.luogu.com.cn/problem/P3387)。

**题意简述：** 有向图中每点有非负权，可以任意选择起点，沿边走，允许重复经过点或边，但每点权只收集一次，求最大可收集点权和。n≤10000、m≤10⁵。

自拟输入：

```text
4 5
1 2 4 8
1 2
2 1
2 3
3 4
2 4
```

输出 `15`。{1,2} 缩成权 3 的点，接着走到权 4、8 的两点，得到 3+4+8。

### 在一组内部，可以先收集，再前往任意出口

SCC 内任意两点互相可达，允许重复走，就可以依次访问所有点，再走到所需出口。点权非负，收集全部不会更差，所以新点权取原组内权值和。

对每条原边 u→v，若 component[u]≠component[v]，加入对应分量之间的边。组内边不再保存。重边可以保留，但计算入度与之后减入度必须使用同一份边表。

令 dp[c] 为走到分量 c 时可收集的最大权值。初始 dp[c]=weight[c]，允许从任何分量开始。按拓扑顺序沿 c→v 转移：`dp[v]=max(dp[v],dp[c]+weight[v])`。

### 完整代码

SCC 部分沿用上一节，后半部分只做权值合并、建 DAG 与拓扑转移。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct SCC {
    int n, timer = 0, count = 0;
    vector<vector<int>> g;
    vector<int> dfn, low, parent, next, component, active, calls;
    vector<bool> inStack;
    SCC(int size) : n(size), g(size + 1), dfn(size + 1), low(size + 1),
        parent(size + 1), next(size + 1), component(size + 1), inStack(size + 1) {}
    void enter(int u) {
        dfn[u] = low[u] = ++timer;
        active.push_back(u);
        calls.push_back(u);
        inStack[u] = true;
    }
    void run() {
        for (int root = 1; root <= n; root++) if (!dfn[root]) {
            enter(root);
            while (!calls.empty()) {
                int u = calls.back(), degree = g[u].size();
                if (next[u] < degree) {
                    int v = g[u][next[u]++];
                    if (!dfn[v]) { parent[v] = u; enter(v); }
                    else if (inStack[v]) low[u] = min(low[u], dfn[v]);
                } else {
                    calls.pop_back();
                    if (low[u] == dfn[u]) {
                        count++;
                        while (true) {
                            int v = active.back();
                            active.pop_back();
                            inStack[v] = false;
                            component[v] = count;
                            if (v == u) break;
                        }
                    }
                    if (parent[u]) low[parent[u]] = min(low[parent[u]], low[u]);
                }
            }
        }
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<int> value(n + 1);
    for (int u = 1; u <= n; u++) cin >> value[u];
    SCC graph(n);
    for (int i = 0, u, v; i < m; i++) { cin >> u >> v; graph.g[u].push_back(v); }
    graph.run();
    int count = graph.count;
    vector<long long> weight(count + 1), dp(count + 1);
    vector<vector<int>> dag(count + 1);
    vector<int> indegree(count + 1);
    for (int u = 1; u <= n; u++) {
        int from = graph.component[u];
        weight[from] += value[u];
        for (int v : graph.g[u]) {
            int to = graph.component[v];
            if (from != to) { dag[from].push_back(to); indegree[to]++; }
        }
    }
    queue<int> q;
    for (int c = 1; c <= count; c++) {
        dp[c] = weight[c];
        if (!indegree[c]) q.push(c);
    }
    long long answer = 0;
    while (!q.empty()) {
        int c = q.front();
        q.pop();
        answer = max(answer, dp[c]);
        for (int v : dag[c]) {
            dp[v] = max(dp[v], dp[c] + weight[v]);
            if (--indegree[v] == 0) q.push(v);
        }
    }
    cout << answer << '\n';
    return 0;
}
```

同一条分量边出现多次，只会重复尝试同一个 max，不会把分量权多加进同一条候选路线。若目标改成“数不同路线”，重边是否代表不同选择就要按题意重新处理。

Tarjan、建图和拓扑转移都为 O(n+m)，空间同样为 O(n+m)。答案与分量合计使用 long long，便于继续用于更大的点权范围。

## 不同应用，看缩图上的不同性质

- 想从任意点最终到同一组，关注缩图的汇点：出度为 0 的分量。
- 想从若干起点覆盖所有点，关注入度为 0 的分量，每个这样的源分量都必须有入口。
- 想在指定起终点之间最大化收集，初始化只开放起点分量，答案只在允许的终点中取值。

最后一种情况下不可达状态要保持不可达，不能像本例允许任意起点一样，将每个 dp 都初始化为自己的权值。

## 练习：先说明一组内部能否完成你的任务

先**独立重做 P3387**，手画 SCC、缩图、入度和每个 dp，再用小图枚举“当前位置与已收集点集合”检查最大权值。

### 推荐必做

1. [P2341 · 受欢迎的牛](https://www.luogu.com.cn/problem/P2341)：喜欢关系可以传递，求被所有牛喜欢的牛的数量。缩点后检查是否恰有一个出度为 0 的分量，并证明答案与该分量的关系。
2. [P3627 · 抢掠计划](https://www.luogu.com.cn/problem/P3627)：从指定起点出发，收集沿途每个路口的钱，最终抵达某个指定酒吧，求最大金额。缩点后只从起点所在分量初始化，并在可达酒吧分量中取答案。

### 选做巩固

- [P2746 · 校园网](https://www.luogu.com.cn/problem/P2746)：求覆盖所有学校的最少初始下发数，以及使任意单一起点都能覆盖全图所需的最少新增边数。练习统计缩点后的源和汇，并单独处理已经强连通的情况。
- [P1262 · 间谍网络](https://www.luogu.com.cn/problem/P1262)：收买部分间谍后可沿揭发关系控制其他间谍，求是否能控制全部以及最小花费。缩点后分析源分量是否有可收买的入口。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[连通性问题 #210](https://www.luogu.com.cn/training/210)。

## 本节验收

能证明缩图无环；能判断组内权值合并是否符合原题；能在 DAG 上处理任意起点与指定起点两种初始化，并正确使用源、汇分量。
