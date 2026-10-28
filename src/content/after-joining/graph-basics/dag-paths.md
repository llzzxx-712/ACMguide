---
title: 有向无环图上的路径与计数、欧拉路径初步
description: 在拓扑顺序中传递路径数和最长距离，再从词链认识每条边恰好使用一次的欧拉路径。
---

## 这一节学什么

知道了依赖顺序，就可以在处理 u 时把它的答案传给后续结点：统计方案时相加，追求最长距离时取最大值。最后再看一种不同的目标——把每条边恰好用一次，认识欧拉路径。

> **AI 伴学提示词**
>
> 为我讲解 DAG 上的路径计数与最长路，逐步模拟拓扑转移；再用 ab、ac、ca 演示词链如何在递归返回时收集边，并引导我对不理解的地方提问。

## 例题精讲一：P4017 · 最大食物链计数

**原题：** [P4017 · 最大食物链计数](https://www.luogu.com.cn/problem/P4017)。

**题意简述：** 给出无环食物网，输入 A、B 表示 A 被 B 吃，即边 A→B。统计从入度为 0 的生产者，到出度为 0 的顶端消费者的完整食物链条数，答案对 80112002 取模。n≤5000、m≤5×10^5。

这里“最大”是指从生产者走到顶端消费者的完整链，不是只数边数最多的那些链。

自拟输入：

```text
4 4
1 2
1 3
2 4
3 4
```

输出为 `2`，两条链是 1→2→4、1→3→4。

### 为什么是加法

令 `ways[v]` 表示从任意生产者走到 v 的路径数。源点本身有一条起始方案，设为 1。对于 u→v，每条到 u 的路径都能在末尾接上这条边，成为一条到 v 的路径，所以 `ways[v] += ways[u]`。

走不同的最后一条边形成不同路径，可以相加。拓扑顺序保证 u 出队时，所有通向 u 的前驱贡献都已收到。最后把所有出度为 0 的点的 ways 相加。

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 5000 + 5;
const int MOD = 80112002;
vector<int> g[N];
int indegree[N], ways[N];

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= m; i++) {
        int u, v;
        cin >> u >> v;
        g[u].push_back(v);
        indegree[v]++;
    }
    queue<int> q;
    for (int u = 1; u <= n; u++) {
        if (indegree[u] == 0) {
            ways[u] = 1;
            q.push(u);
        }
    }
    int answer = 0;
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        if (g[u].empty()) answer = (answer + ways[u]) % MOD;
        for (int v : g[u]) {
            ways[v] = (ways[v] + ways[u]) % MOD;
            indegree[v]--;
            if (indegree[v] == 0) q.push(v);
        }
    }
    cout << answer << '\n';
    return 0;
}
```

每次加法前两个数都小于 MOD，相加仍在 `int` 范围内。时间、空间均为 $\mathcal{O}(n+m)$。

## 例题精讲二：P1807 · 最长路

**原题：** [P1807 · 最长路](https://www.luogu.com.cn/problem/P1807)。

**题意简述：** 带权 DAG，求从 1 到 n 的最长路径长度；不能到达输出 −1。n≤1500、m≤5×10^4，权值可以为负。

自拟输入：

```text
4 4
1 2 3
1 3 2
2 4 -1
3 4 5
```

输出为 `7`：1→3→4 的总权值为 2+5。

### 同样的处理顺序，不同的状态含义

令 `dist[v]` 为从 1 到 v 的最长距离。沿 u→v、权值 w 前进，就用 `dist[u]+w` 更新 `dist[v]` 的最大值。

起点 `dist[1] = 0`；其他点还没有被到达，用很小的 NEG 表示。不能全部初始化为 0：一条权值 −5 的可达路径是真实答案，而 0 会虚构出更好的路径。也不能让不可达点参与转移，否则 NEG+w 可能变成看似有效的距离。

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 1500 + 5;
const long long NEG = -(1LL << 60);
struct Edge { int to, weight; };
vector<Edge> g[N];
int indegree[N];
long long dist[N];

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    for (int i = 1; i <= m; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        g[u].push_back({v, w});
        indegree[v]++;
    }
    fill(dist, dist + n + 1, NEG);
    dist[1] = 0;
    queue<int> q;
    for (int u = 1; u <= n; u++) if (indegree[u] == 0) q.push(u);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (Edge e : g[u]) {
            int v = e.to;
            if (dist[u] != NEG) dist[v] = max(dist[v], dist[u] + e.weight);
            indegree[v]--;
            if (indegree[v] == 0) q.push(v);
        }
    }
    if (dist[n] == NEG) cout << -1 << '\n';
    else cout << dist[n] << '\n';
    return 0;
}
```

所有零入度点都要进队，即使它们暂时不能从 1 到达，也要去掉它们对后续点的依赖限制。**“是否参与拓扑处理”和“是否能提供距离”是两件事。**时间和空间均为 $\mathcal{O}(n+m)$。

## 例题精讲三：P1127 · 词链（进阶）

**原题：** [P1127 · 词链](https://www.luogu.com.cn/problem/P1127)。

**题意简述：** 给 n 个小写单词，若前词末字母等于后词首字母，就能用英文句号连接。每个输入单词恰好用一次，求字典序最小的完整词链；不存在输出 `***`。相同单词输入多次就要使用多次，n≤1000。

### 把单词变成边

用 26 个字母作为点，单词 ab 是 a→b 的一条边，ac 是 a→c，ca 是 c→a。边还要保存原单词，输出时才能还原。这里仍是 `vector` 邻接表，只是下标改为 0 到 25。

目标变成：**每条边恰好走一次，点可以反复经过。**这种路线叫欧拉路径；首尾相同则叫欧拉回路。

经过中间点时，进来几次就要出去几次，因此它的入度等于出度。非闭合路线的起点多一条出边，终点多一条入边。于是合法的度数情况有两种：

- 一个点出度−入度=1，一个点入度−出度=1，其他点相等；从前者出发。
- 所有点出入度相等；从有边的最小字母出发，争取字典序最小。

度数合适以后，还必须能把所有边走完。最后检查收集的单词数是否等于 n，就能发现彼此分开的几圈词链。

### 不急着把第一次走的边当成答案开头

对 ab、ac、ca，若按字典序先走 ab，会在 b 走不动，但完整答案其实是：

```text
ac.ca.ab
```

我们沿未用边深入，**走完一条边后，先处理它后面还能走的所有边，返回时才把这条边记入结果**。每次取走一条边，就从名单中 `pop_back`，保证只使用一次。

| 递归过程 | 返回时加入结果 |
| --- | --- |
| 从 a 先走 ab，到 b，无出边 | ab |
| 回到 a，再走 ac，到 c | 先处理 c 的后续 |
| c 走 ca 回到 a，已无出边 | ca |
| 回到 c，再回到 a | ac |

收集顺序为 ab、ca、ac，反转得到 ac、ca、ab。这是在把走不动的片段放到路线末端，再让剩下的边接在它前面。将每个点的出边按单词从大到小排序，`pop_back` 总取最小者，这样得到字典序最小的欧拉词链。

自拟输入：

```text
3
ab
ac
ca
```

输出为 `ac.ca.ab`。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge {
    int to;
    string word;
};
vector<Edge> g[26];
int indegree[26], outdegree[26];
vector<string> answer;

void dfs(int u) {
    while (!g[u].empty()) {
        Edge e = g[u].back();
        g[u].pop_back();
        dfs(e.to);
        answer.push_back(e.word);
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        int u = s[0] - 'a', v = s.back() - 'a';
        g[u].push_back({v, s});
        outdegree[u]++;
        indegree[v]++;
    }
    int start = -1, plus = 0, minus = 0;
    bool valid = true;
    for (int u = 0; u < 26; u++) {
        int delta = outdegree[u] - indegree[u];
        if (delta == 1) { plus++; start = u; }
        else if (delta == -1) minus++;
        else if (delta != 0) valid = false;
        sort(g[u].begin(), g[u].end(), [](const Edge &a, const Edge &b) {
            return a.word > b.word;
        });
    }
    if (!((plus == 1 && minus == 1) || (plus == 0 && minus == 0))) valid = false;
    if (!valid) { cout << "***\n"; return 0; }
    if (start == -1) {
        for (int u = 0; u < 26; u++) {
            if (outdegree[u] > 0) { start = u; break; }
        }
    }
    dfs(start);
    int used = answer.size();
    if (used != n) { cout << "***\n"; return 0; }
    reverse(answer.begin(), answer.end());
    for (int i = 0; i < n; i++) {
        if (i > 0) cout << '.';
        cout << answer[i];
    }
    cout << '\n';
    return 0;
}
```

这里 `vis[u]` 不能表示“这个点不许再来”：欧拉路径允许重复经过点。我们删除已经使用的**边**，用边是否还在名单里控制枚举。最多使用 n 条边，递归深度不超过 n+1；排序时间 $\mathcal{O}(n \log  n)$，遍历 $\mathcal{O}(n)$，额外空间 $\mathcal{O}(n)$，单词长度至多 20。

## 练习：先说清到底在统计什么

先**独立重做三个例题**。对每个例题先写一句状态含义或路线目标，再编写代码。特别手动重现 ab、ac、ca 的返回顺序。

### 推荐必做

1. [AT_ndpc2026_b · DAG](https://www.luogu.com.cn/problem/AT_ndpc2026_b)：给定有向无环图，统计从 1 到 n 的路径数，对 998244353 取模。只让起点的方案数为 1，按拓扑序沿边累加；注意多组数据要重新初始化。
2. [AT_dp_g · Longest Path](https://www.luogu.com.cn/problem/AT_dp_g)：求有向无环图中最长路径的边数，起点和终点均不固定。练习让每个点都能作为起点，再沿拓扑序更新最长长度。

### 选做巩固

- [P3183 · 食物链](https://www.luogu.com.cn/problem/P3183)：根据能量流动关系统计食物链，单独的孤立生物不算一条。与 P4017 比较源点、终点和孤立点的处理，答案按题意直接输出。
- [P1137 · 旅行计划](https://www.luogu.com.cn/problem/P1137)：道路由西向东，求以每个城市为终点最多经过的城市数。练习输出每个结点的最长路径状态，注意这里统计的是城市数。

## 本节验收

能解释计数为什么相加、最长距离为什么取 max；能正确初始化不可达状态；能区分“每点处理一次”和“每边使用一次”，并跟踪欧拉路径递归返回时的结果。
