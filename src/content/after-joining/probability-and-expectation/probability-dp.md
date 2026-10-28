---
title: 概率 DP、期望 DP 与随机过程
description: 区分随机结果与提前决定的策略，用换教室把最短路、期望与动态规划连接起来。
---

## 这一节学什么

概率 DP 常把“到达状态的概率”向后分配；期望 DP 常从当前状态考虑下一步，累计“这一步代价+后续期望”。当题目还允许做决策时，必须先确定决策发生在随机结果之前还是之后。

> **AI 伴学提示词**
>
> 为我区分概率 DP、期望 DP 与策略选择，用换教室逐项展开两次申请的四种结果，并对照状态和代码引导我提问。

## 先看最简单的状态转移

若状态 u 以概率 pᵢ 转到 vᵢ，花费 wᵢ，那么剩余花费期望 E[u]=Σpᵢ(wᵢ+E[vᵢ])，终点 E=0。DAG 可以按逆拓扑序算；有环时，依赖可能互相套住，需要列方程或分析自返关系，不能随意套一次 DFS。

例如成功率 p>0、每次花 1、失败后回原地，有 E=1+(1−p)E，解得 1/p；若 p=0，则无法到达终点，不能做除以 0 的计算。

## 例题精讲：[P1850 换教室](https://www.luogu.com.cn/problem/P1850)

**题意简述：** n 节课原定教室 cᵢ，可为至多 m 节课申请改到 dᵢ，申请独立地以概率 pᵢ 成功。所有申请必须在学期开始前决定。教室之间为带权无向图，求依次上课的最小总路程期望，保留两位小数。n,m≤2000，教室数 V≤300，保证连通。

自编输入：

```text
2 1 2 1
1 2
2 1
0.5 0.5
1 2 10
```

输出 `5.00`。不申请要走 10；申请任意一节，成功时路程 0、失败时路程 10，期望为 5。

## 把决策与成功分开

先用 Floyd 求任意教室间最短路 dist。令 f[i][j][s] 为前 i 节课恰好提交 j 次申请、第 i 节是否提交申请为 s 时的最小期望。

**s 表示申请与否，不表示是否成功。** 一个提前确定的申请方案仍有随机结果；我们不能看到成功与否后，再反过来更改之前的决策。

设上节申请与否为 a、本节为 b。未申请的教室分布只有 c，概率为 1；申请则以 1−p 在 c、以 p 在 d。两边都申请时，相邻路程的期望为：

```text
(1-p前)(1-p今) dist(c前,c今)
+ (1-p前)p今  dist(c前,d今)
+ p前(1-p今)  dist(d前,c今)
+ p前p今     dist(d前,d今)
```

四项概率相乘使用了题目给出的独立性。将这段期望加到前 i−1 节的最优值上，枚举上节是否申请即可。当前若申请，前一层申请数必须为 j−1。

相邻路程之间可能共用某节课的随机结果，但总期望仍能按线性性质相加；前缀方案最后一节是否申请相同，就有同样的最后教室分布，足以支撑这个状态。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m, V, edges;
    cin >> n >> m >> V >> edges;
    m = min(m, n);
    vector<int> c(n + 1), d(n + 1);
    vector<double> p(n + 1);
    for (int i = 1; i <= n; i++) cin >> c[i];
    for (int i = 1; i <= n; i++) cin >> d[i];
    for (int i = 1; i <= n; i++) cin >> p[i];
    const int INF_DISTANCE = 1000000000;
    vector<vector<int>> dist(V + 1, vector<int>(V + 1, INF_DISTANCE));
    for (int i = 1; i <= V; i++) dist[i][i] = 0;
    for (int i = 0; i < edges; i++) {
        int u, v, w;
        cin >> u >> v >> w;
        dist[u][v] = dist[v][u] = min(dist[u][v], w);
    }
    for (int k = 1; k <= V; k++) {
        for (int u = 1; u <= V; u++) {
            for (int v = 1; v <= V; v++) dist[u][v] = min(dist[u][v], dist[u][k] + dist[k][v]);
        }
    }
    const double INF = 1e100;
    vector<array<double, 2>> f(m + 1, {INF, INF});
    f[0][0] = 0;
    if (m >= 1) f[1][1] = 0;
    for (int i = 2; i <= n; i++) {
        double cost[2][2];
        for (int a = 0; a <= 1; a++) for (int b = 0; b <= 1; b++) {
            double previous = a ? p[i - 1] : 0;
            double current = b ? p[i] : 0;
            cost[a][b] = (1 - previous) * (1 - current) * dist[c[i - 1]][c[i]]
                       + (1 - previous) * current * dist[c[i - 1]][d[i]]
                       + previous * (1 - current) * dist[d[i - 1]][c[i]]
                       + previous * current * dist[d[i - 1]][d[i]];
        }
        vector<array<double, 2>> next(m + 1, {INF, INF});
        for (int j = 0; j <= min(m, i); j++) {
            for (int a = 0; a <= 1; a++) {
                next[j][0] = min(next[j][0], f[j][a] + cost[a][0]);
                if (j >= 1) next[j][1] = min(next[j][1], f[j - 1][a] + cost[a][1]);
            }
        }
        f.swap(next);
    }
    double answer = INF;
    for (int j = 0; j <= m; j++) answer = min(answer, min(f[j][0], f[j][1]));
    printf("%.2f\n", answer);
    return 0;
}
```

第一节没有上一节路程，所以无申请与一次申请的初值都为 0。答案取所有 j≤m，不能强迫用满机会。重边取最小权，自环不会覆盖对角线 0。Floyd 为 O(V³)，DP 为 O(nm)，空间 O(V²+m)。关闭同步后只用 cin 输入、printf 输出，没有在同一方向混用两套方式。

## 练习：先给状态写一句准确的中文

先**独立重做例题**，手算两节课都申请时的四项概率，再检查 p=0、p=1、m=0、n=1。

### 推荐必做

1. [P4316 绿豆蛙的归宿](https://www.luogu.com.cn/problem/P4316)：在 DAG 每条出边等概率选择，求总路径长度期望；练习逆拓扑序计算剩余期望。
2. [P2111 考场奇遇](https://www.luogu.com.cn/problem/P2111)：已知两人的判断题答案是否一致和一人的正确率，求另一人至少答对指定题数的概率。练习设计前 i 题答对 j 题的概率状态。

### 选做巩固

- [Codeforces 518D Ilya and Escalator](https://codeforces.com/problemset/problem/518/D)：每秒队首以给定概率进入电梯，求指定时间后电梯上的人数期望。练习先求人数分布，再计算期望。
- [Codeforces 540D Bad Luck Island](https://codeforces.com/problemset/problem/540/D)：石头、剪刀、布随机相遇并按规则淘汰，求最终每种物种独存的概率。练习按三类剩余数量设计概率状态。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[概率与统计 #218](https://www.luogu.com.cn/training/218)。

## 本节验收

能区分状态中的决策与随机结果；能逐项写出期望贡献；能检查初值、终止条件和依赖顺序，再让代码实现同一个过程。
