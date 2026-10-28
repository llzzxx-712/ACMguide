---
title: 换根 DP 与二次扫描
description: 用洛谷 STA-Station 推导距离和换根，再通过洛谷与 Codeforces 的五道实战题练习不同方向的贡献。
---

## 这一节学什么

换根 DP 是树形 DP 中非常常用的一类题型。当每个点都要当一次根，或者每个点都要回答一个关于整棵树的问题时，逐点重新遍历会变成 $\mathcal{O}(n^{2})$。换根 DP 先算一个根，再利用相邻根之间的关系，把答案沿树传给所有点。

这一节用可直接提交的洛谷题完成推导，再安排 2 道必做、3 道选做。练习时先问“根移动一条边，哪些贡献发生变化”，再用代码实现这个过程。

> **AI 伴学提示词**
>
> 为我用洛谷 P3478 讲解换根 DP，画出根移动时两侧的点，手算距离和变化，再引导我比较练习题的状态与转移并提问。

## 例题精讲：[P3478 STA-Station](https://www.luogu.com.cn/problem/P3478)

**题意简述：** 给一棵 $n$ 个点的无权树，选一个结点作为根，使所有结点的深度之和最大。深度是到根的路径边数。$n\le 10^{6}$，输入 $n$，再输入 $n-1$ 条无向边 $u$、$v$，输出一个最优根的编号；并列时任意一个均可。

选根 $r$ 后，所有深度之和就是 $\sum_x\operatorname{dist}(r,x)$。因此我们先求每个点的距离和 `answer[r]`，最后从中找最大值，并按原题要求输出**结点编号**。

自编输入：

```text
5
1 2
1 3
3 4
3 5
```

输出：

```text
2
```

画出以 1 为根时的树：

```text
    1
   / \
  2   3
     / \
    4   5
```

从点 2 到 `1 2 3 4 5` 的距离分别为 `1 0 2 3 3`，距离和为 9。其他点的距离和会在下面通过换根求出。

## 第一次：计算根 1 的总距离和与子树大小

暂时固定 1 为根，求 `depth[u]` 与子树大小 `size[u]`。这棵树中深度为 `[0, 1, 1, 2, 2]`，所以 `answer[1] = 6`；`size[2] = 1`、`size[3] = 3`、`size[4] = size[5] = 1`。

代码先沿父亲到孩子的顺序建立 $\mathrm{order}$，同时累加深度；再倒序扫描 $\mathrm{order}$，把每个孩子的 $\mathrm{size}$ 加给父亲。这样孩子先算完，父亲才能拿到完整的子树大小。

## 第二次：把根从 $u$ 移到孩子 $v$

把边 $u$—$v$ 切开，整棵树恰好分成两边。$v$ 是第一次以 1 为根时 $u$ 的孩子。现在让根从 $u$ 移到 $v$：

- $v$ 原子树中的 `size[v]` 个点，每个到新根的距离都减少 1。
- 另一边的 `n - size[v]` 个点，每个到新根的距离都增加 1。

两边内部的边没有变化，只需要把这两份总变化加到旧答案上：

$$
\begin{aligned}
\operatorname{answer}_v&=\operatorname{answer}_u-\operatorname{size}_v+(n-\operatorname{size}_v)\\
&=\operatorname{answer}_u+n-2\operatorname{size}_v.
\end{aligned}
$$

公式中的 $\operatorname{answer}_v$、$\operatorname{size}_v$，分别对应代码的 `answer[v]`、`size[v]`。

$\mathrm{size}$ 始终是第一次以 1 为根时的大小，不需要随每次换根重建。第二次仍按父亲在前的 $\mathrm{order}$ 扫描，让 `answer[u]` 已知后再求 `answer[v]`。

对例题逐边计算：

| 根的移动 | 靠近的一侧有几个点 | 新答案 |
| --- | --- | --- |
| 1→2 | `size[2] = 1` | $6+5-2\times 1=9$ |
| 1→3 | `size[3] = 3` | $6+5-2\times 3=5$ |
| 3→4 | `size[4] = 1` | $5+5-2\times 1=8$ |
| 3→5 | `size[5] = 1` | $5+5-2\times 1=8$ |

全部答案为 `[6, 9, 5, 8, 8]`，因此输出结点 2。我们只完整遍历几次，便得到了所有根的结果。

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
    for (int i = 1, u, v; i < n; i++) {
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> parent(n + 1), size(n + 1, 1), order(1, 1);
    vector<int> depth(n + 1);
    vector<long long> answer(n + 1);
    for (int i = 0; i < n; i++) {
        int u = order[i];
        answer[1] += depth[u];
        for (int v : g[u]) {
            if (v == parent[u]) continue;
            parent[v] = u;
            depth[v] = depth[u] + 1;
            order.push_back(v);
        }
    }
    for (int i = n - 1; i > 0; i--) {
        int u = order[i];
        size[parent[u]] += size[u];
    }
    for (int i = 1; i < n; i++) {
        int v = order[i], u = parent[v];
        answer[v] = answer[u] + n - 2 * size[v];
    }
    int best = 1;
    for (int u = 2; u <= n; u++) {
        if (answer[u] > answer[best]) best = u;
    }
    cout << best << '\n';
    return 0;
}
```

程序按原题输入无权边，输出一个最优编号，可以直接提交到 P3478。代码只在严格更优时替换 $\mathrm{best}$，因此并列时会保留较小的编号，同样符合原题要求。

$n=10^{6}$ 的链，从端点出发的距离和为 $\frac{n(n-1)}{2}$，约 $5\times 10^{11}$，超过 `int`，$\mathrm{answer}$ 必须用 `long long`。$\mathrm{parent}$、$\mathrm{depth}$、$\mathrm{size}$ 和结点编号仍在 `int` 范围内。代码用显式 $\mathrm{order}$，避免链形树产生百万层递归；输入前关闭流同步。总时间、空间 $\mathcal{O}(n)$。

## 把两侧的“点数”换成“贡献量”

若点 $x$ 有 `people[x]` 份权重，目标为 $\sum_x\mathrm{people}_x\operatorname{dist}(r,x)$，就将 `size[v]` 换成 $v$ 子树的总权重 `sub[v]`，$n$ 换成全树总权重 $\mathrm{total}$。若 $u$—$v$ 的边长又为 $w$，变化便是：

$$
\begin{aligned}
\operatorname{answer}_v&=\operatorname{answer}_u-\operatorname{sub}_v\,w+(\operatorname{total}-\operatorname{sub}_v)w\\
&=\operatorname{answer}_u+(\operatorname{total}-2\operatorname{sub}_v)w.
\end{aligned}
$$

公式仍来自“哪一侧更近、哪一侧更远”。先重新定义 $\mathrm{sub}$ 和 $\mathrm{answer}$，再写转移；权重和及乘积也需要重新估算范围。下面的 P2986 与 CF1092F 会分别练习这个方向。

## 其他换根任务怎样想

不一定都能写成一个加减公式。若维护最远距离，需要合并来自孩子与父亲方向的候选；给某个孩子传信息时，必须排除这个孩子自己的贡献。可以保存最大、次大来源，或者用前缀、后缀合并快速得到“除它以外”的结果。

两次扫描分别是向上收集、向下分发。先定义每条方向消息代表什么，再考虑怎样排除来源，不能让孩子收到一份包含自己的重复贡献。

## 练习：先独立提交例题，再完成 2 道必做

先**独立重做并提交 [P3478 STA-Station](https://www.luogu.com.cn/problem/P3478)**。遮住代码，自己画两侧点集、推导转移；再对小树从每个点分别遍历，用暴力距离和核对。例题重做之外，完成下面两道必做，随后按需要选择三道选做。

### 推荐必做

1. **[洛谷 P2986 · Great Cow Gathering G](https://www.luogu.com.cn/problem/P2986)｜带点权、边权的距离和。** 每个农场有若干奶牛，道路有长度，选择集会点，让所有奶牛走过的总路程最小。$n\le 10^{5}$，奶牛数和边长均可为 0，且不超过 1000。**练习重点：** 将点数改成奶牛总数，推导根移动时两侧路程的增减；输出最小总路程。子树奶牛数和距离乘积使用 `long long`。
2. **[Codeforces 219D · Choosing Capital for Treeland](https://codeforces.com/problemset/problem/219/D)｜沿边换根只改变一条边的代价。** 道路忽略方向后形成树，选一个首都并反转尽量少的道路，使首都能沿有向边到达所有点。$n\le 2\times 10^{5}$。**练习重点：** 先固定根算反转数，再判断根沿一条边移动时，答案为什么只增加或减少 1。原题要求输出最少反转数，以及按编号升序排列的全部最优首都。

### 选做巩固

1. **[Codeforces 1092F · Tree with Maximum Cost](https://codeforces.com/problemset/problem/1092/F)｜带点权距离和的最大值。** 每个点有权值 `a[x]`，边长都为 1，选择根 $r$ 最大化 $\sum_x a_x\operatorname{dist}(r,x)$。$n\le 2\times 10^{5}$，$a[x]\le 2\times 10^{5}$。**练习重点：** 复用两侧总权重的分析，正确处理“求最大值”这个目标；总权重、答案与中间运算都用 `long long`。
2. **[Codeforces 1324F · Maximum White Subtree](https://codeforces.com/problemset/problem/1324/F)｜传递父亲方向的最优贡献。** 每个点为白色或黑色，对每个点 $v$，求包含 $v$ 的连通子图中“白点数−黑点数”的最大值。$n\le 2\times 10^{5}$；这里的子树指任意连通子图。**练习重点：** 把白、黑映射为 `+1、-1`，决定每个相邻方向的贡献是否值得接入；给孩子传消息时，先排除这个孩子自己的贡献。
3. **[洛谷 P3047 · Nearby Cows G](https://www.luogu.com.cn/problem/P3047)｜换根状态再加一维距离。** 每点有奶牛，求对每个点而言，距离不超过 $k$ 条边的点上共有多少奶牛。$n\le 10^{5}$、$k\le 20$。**练习重点：** 在状态中加入距离，先收集子树内的信息，再传入父亲方向的信息；跨边后距离增加 1，排除回到自己子树的重复统计。目标复杂度为 $\mathcal{O}(nk)$。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树与图上的动态规划 #214](https://www.luogu.com.cn/training/214)。

## 本节验收

能按两侧点数推导相邻根关系；能区分第一次的子树大小与第二次的答案；能解释更一般换根中排除自身贡献的必要性。
