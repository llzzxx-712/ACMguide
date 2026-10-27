---
title: 换根 DP 与二次扫描
description: 先计算一个根下的答案，再分析根沿一条边移动时哪些贡献增加、哪些减少。
---

## 这一节学什么

每个点都要当一次根时，逐点重新遍历会变成 O(n²)。换根 DP 先算一个根，再利用相邻根之间的关系，把答案沿树传给所有点。

> **AI 伴学提示词**
>
> 为我讲解换根 DP，画出根沿边移动时前后两侧的点，推导距离和变化，并引导我提问。

## 例题精讲：自编 · 所有点的树上距离和

**题意简述：** 给 n 个点的非负边权树，输出每个点到所有点的距离之和。n≤2×10⁵，边权≤10⁶。输入 n，再输入 n−1 条 u v w。

输入 3，边为 `(1,2,2)、(2,3,3)`，输出 `7 5 8`。从 1 出发距离为 0、2、5；从 2 为 2、0、3；从 3 为 5、3、0。

## 第一次：计算根 1 的总距离和与子树大小

沿树求 dist[u] 为根 1 到 u 的距离，ans[1]=Σdist[u]。再倒序 order 汇总 size[u]，这些都是第十二章已经实现过的过程。

## 第二次：把根从 u 移到孩子 v

设边长 w。v 原子树内 size[v] 个点都近了 w，其余 n−size[v] 个点都远了 w，因此：

```text
ans[v] = ans[u] - size[v]*w + (n-size[v])*w
       = ans[u] + (n-2*size[v])*w
```

size 始终是第一次以 1 为根时的大小，不会真的修改树结构。第二次按父亲在前的 order 扫描，让 ans[u] 已知后再求 ans[v]。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Edge { int to; long long weight; };

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<vector<Edge>> g(n + 1);
    for (int i = 1, u, v; i < n; i++) {
        long long w;
        cin >> u >> v >> w;
        g[u].push_back({v, w}); g[v].push_back({u, w});
    }
    vector<int> parent(n + 1), size(n + 1, 1), order(1, 1);
    vector<long long> distance(n + 1), answer(n + 1), parentWeight(n + 1);
    for (int i = 0; i < n; i++) {
        int u = order[i];
        answer[1] += distance[u];
        for (const Edge &e : g[u]) if (e.to != parent[u]) {
            parent[e.to] = u;
            parentWeight[e.to] = e.weight;
            distance[e.to] = distance[u] + e.weight;
            order.push_back(e.to);
        }
    }
    for (int i = n - 1; i > 0; i--) size[parent[order[i]]] += size[order[i]];
    for (int i = 1; i < n; i++) {
        int v = order[i], u = parent[v];
        answer[v] = answer[u] + 1LL * (n - 2 * size[v]) * parentWeight[v];
    }
    for (int u = 1; u <= n; u++) cout << answer[u] << (u == n ? '\n' : ' ');
    return 0;
}
```

乘法从 long long 开始，避免 int 中间值溢出。在本题 n 与边权范围下，距离和可达约 2×10¹⁶，仍在 long long 范围。总时间、空间 O(n)。

## 其他换根任务怎样想

不一定都能写成一个加减公式。若维护最远距离，需要合并来自孩子与父亲方向的候选；给某个孩子传信息时，必须排除这个孩子自己的贡献。可以保存最大、次大来源，或者用前缀、后缀合并快速得到“除它以外”的结果。

两次扫描分别是向上收集、向下分发。先定义每条方向消息代表什么，再考虑怎样排除来源，不能让孩子收到一份包含自己的重复贡献。

## 练习：先手算移动一次根的变化

先**独立重做本例**，对小树从每个点单独遍历求距离和，检查换根公式。

### 推荐必做

1. **自编 · 每点人数不同：** 点 u 有 people[u] 人，目标为带人数的距离和，将 size 换成子树总人数，n 换成全树总人数，并重新估算范围。
2. **自编 · 最佳会场：** 从全部 answer 中找最小值及编号，与第十二章无权树的重心结论比较。

### 选做巩固

- **自编 · 每点最远距离：** 分别维护孩子方向和父亲方向的最长路径，给孩子传递时排除它的来源。
- **自编 · 链与星形树：** 写出两种结构的距离和闭式，检查端点与中心的答案。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树与图上的动态规划 #214](https://www.luogu.com.cn/training/214)。

## 本节验收

能按两侧点数推导相邻根关系；能区分第一次的子树大小与第二次的答案；能解释更一般换根中排除自身贡献的必要性。
