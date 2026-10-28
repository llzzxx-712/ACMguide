---
title: 树上差分与路径统计
description: 在路径端点与公共祖先附近登记增减，最后由子树向父亲汇总，一次统计所有路径贡献。
---

## 这一节学什么

数组差分只在区间边界登记修改，再统一还原。树上的一条路径没有简单的左右端点编号，但它可以在 LCA 处分成两条向上的路径。我们同样可以只做少量登记，最后统一累加。

> **AI 伴学提示词**
>
> 为我讲解树上点差分与边差分，手算路径端点、LCA 及父亲的增减，解释自底向上汇总如何留下目标路径，并引导我提问。

## 点差分：公共祖先要保留一次

设路径端点为 u、v，公共祖先为 w。一条路径对每个经过的点加 1，先登记：

```text
delta[u]++，delta[v]++
delta[w]--，delta[parent[w]]--
```

然后把每个点的 delta 加到父亲。u、v 各向上传 1，在 w 汇合成 2；w 自己减去 1，正好留下 1；再往上之前，由 `parent[w]` 的 −1 抵消，祖先不再收到贡献。

若 `u = v = w`，登记的净效果也是只让这个点加 1。若 w 是根，`parent[w] = 0`，写进哨兵位置的减法不参与真实点的答案。

## 例题精讲：P3128 · Max Flow

**原题：** [P3128 · Max Flow](https://www.luogu.com.cn/problem/P3128)。

**题意简述：** 树上给 k 条路径，每条路径对经过的每个点贡献 1，包括两个端点。求所有点中的最大经过次数。n≤50000，k≤10⁵。

自拟输入：

```text
5 2
1 2
1 3
2 4
2 5
4 3
5 3
```

输出 `2`。两条路径都经过 2、1、3，4 和 5 各经过一次。

### 把登记与还原分开

每条路径只做一次 LCA 和四次修改。全部读完后，倒序处理父亲先于孩子的 order：先合并深层子树，再把当前点交给父亲。此时 `delta[u]` 已经是 u 的最终经过次数。

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, k;
    cin >> n >> k;
    const int LOG = 17;
    vector<vector<int>> g(n + 1);
    for (int i = 1, u, v; i < n; i++) {
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<array<int, LOG>> up(n + 1);
    vector<int> depth(n + 1), order(1, 1);
    for (int i = 0; i < n; i++) {
        int u = order[i];
        for (int v : g[u]) if (v != up[u][0]) {
            up[v][0] = u;
            depth[v] = depth[u] + 1;
            for (int j = 1; j < LOG; j++) up[v][j] = up[up[v][j-1]][j-1];
            order.push_back(v);
        }
    }
    auto lca = [&](int u, int v) {
        if (depth[u] < depth[v]) swap(u, v);
        int difference = depth[u] - depth[v];
        for (int j = LOG - 1; j >= 0; j--) if ((difference >> j) & 1) u = up[u][j];
        if (u == v) return u;
        for (int j = LOG - 1; j >= 0; j--) if (up[u][j] != up[v][j]) {
            u = up[u][j];
            v = up[v][j];
        }
        return up[u][0];
    };
    vector<long long> delta(n + 1);
    while (k--) {
        int u, v;
        cin >> u >> v;
        int w = lca(u, v);
        delta[u]++;
        delta[v]++;
        delta[w]--;
        delta[up[w][0]]--;
    }
    long long answer = 0;
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        answer = max(answer, delta[u]);
        if (up[u][0]) delta[up[u][0]] += delta[u];
    }
    cout << answer << '\n';
    return 0;
}
```

这是一种离线处理：读完全部登记再汇总。如果题目要求每次修改后立即查询，还不能直接把尚未还原的 delta 当答案；下一节用重链剖分处理动态路径。

预处理 $\mathcal{O}(n \log  n)$，路径登记 $\mathcal{O}(k \log  n)$，最后汇总 $\mathcal{O}(n)$，空间 $\mathcal{O}(n \log  n)$。

## 边差分：LCA 上方那条边不经过

把每条父子边的信息存到较深的孩子上。路径 u—v 的边贡献登记为：

```text
delta[u]++，delta[v]++，delta[w]-=2
```

自底向上汇总后，`delta[x]` 表示边 `parent[x]`—x 的经过次数。两路贡献在 w 完全抵消，不会继续通过 w 的父边。因此点差分与边差分的减法位置不同，不能混用。

例如上图路径 4—3 的边为 4—2、2—1、1—3；根 1 本身没有对应的父边，它的 delta 不作为边答案。

## 练习：先决定统计对象是点还是边

先**独立重做 P3128**，用逐条展开路径的暴力程序检查小树，尤其测试根作为端点、端点相同、多条完全重合路径。

### 推荐必做

1. [P3258 · 松鼠的新家](https://www.luogu.com.cn/problem/P3258)：按给定顺序经过树上的房间，求各房间所需糖果数。用点差分统计路径，再按题意处理每段终点，核对汇总方向。
2. [CF 191C · Fools and Roads](https://codeforces.com/problemset/problem/191/C)：给出若干树上路径，按输入顺序输出每条边被经过的次数。用边差分登记，再将子树累加值对应到输入边。

### 选做巩固

- [P2680 · 运输计划](https://www.luogu.com.cn/problem/P2680)：允许将一条航道耗时改为零，最小化所有运输计划完成的最晚时间。二分答案后，用边差分检查超时路径是否共用可改造的边。
- [P4556 · 雨天的尾巴](https://www.luogu.com.cn/problem/P4556)：多次向路径上的每个点发放某种物资，求每点收到最多的物资种类。思考如何将点差分与按种类统计结合，再学习线段树合并。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树 #207](https://www.luogu.com.cn/training/207)。

## 本节验收

能从贡献如何向上传递推导两种公式；能区分点与父边的存储位置；能解释离线汇总的计算顺序与使用时机。
