---
title: 重链剖分与树上路径维护
description: 优先访问最大子树，把一条树上路径拆成少量连续区间，再交给线段树维护。
---

## 这一节学什么

DFS 序已经让子树变成一个区间，但任意两点间的路径通常不连续。重链剖分进一步安排访问顺序，让路径能拆成 $\mathcal{O}(\log  n)$ 段区间。实际的区间加法与求和仍由上一章的线段树完成。

> **AI 伴学提示词**
>
> 为我讲解重儿子、链顶与路径分段，手画一条跨链路径怎样转成线段树区间，解释每次跳到链顶父亲，并引导我提问。

## 让最大的子树接在当前点后面

对每个点，子树大小最大的孩子称为重儿子，其余为轻儿子，大小相同任选一个。与重儿子的边连成重链，`top[u]` 保存 $u$ 所在链的最高点。

第一次遍历求 $\mathrm{parent}$、$\mathrm{depth}$、$\mathrm{size}$、$\mathrm{heavy}$。第二次按“先重儿子，再轻儿子”的 DFS 顺序编号 $\mathrm{dfn}$：每条重链连续，每棵子树也连续。

为什么只会跨少量轻边？向下走到一个轻儿子时，它的子树不超过原子树的一半，否则它就应当是最大的那个孩子。从 $n$ 反复减半到 1 只有 $\mathcal{O}(\log  n)$ 次，所以一条根路径跨的链数是 $\mathcal{O}(\log  n)$。

## 两个端点不在同一条链时，先处理较深的链顶

设 `top[u]` 比 `top[v]` 深，$u$ 到 `top[u]` 这一段必在目标路径上，处理区间 `[dfn[top[u]],dfn[u]]`，再令 `u = parent[top[u]]`。跳的是**链顶的父亲**，不是只让 $u$ 向上一步。

两端进入同一条链后，把浅点放前，处理它们之间的最后一段。点权路径包含 LCA；如果维护边权并存到孩子上，最后一段应排除较浅点对应的父边。

## 例题精讲：P3384 · 重链剖分

**原题：** [P3384 · 重链剖分](https://www.luogu.com.cn/problem/P3384)。

**题意简述：** 给 $n$ 个点、根 $\mathrm{root}$、模数 $\mathrm{mod}$。操作 `1 x y z` 给点路径加 $z$，`2 x y` 查询点路径和；`3 x z` 给 $x$ 子树加 $z$，`4 x` 查询子树和。所有输出取模。$n,q\le 10^{5}$，$\mathrm{mod}\le 2^{30}$。

自拟输入：

```text
3 5 1 100
1 2 3
1 2
1 3
2 2 3
1 2 3 5
4 1
3 2 7
2 2 3
```

输出 `6 21 28`，每项一行。路径 2—3 经过 `2 1 3`；整条路径加 5 后总和为 21，再给结点 2 的子树加 7，路径和为 28。

### 完整代码

代码分为三个任务：建立重链编号；维护普通线段树；把树上操作翻译成区间操作。先分别理解，再合起来读。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct SegmentTree {
    int n;
    long long mod;
    vector<long long> sum, lazy;
    SegmentTree(int size, long long p) : n(size), mod(p), sum(size * 4 + 4), lazy(size * 4 + 4) {}
    void apply(int p, int l, int r, long long value) {
        sum[p] = (sum[p] + value * (r - l + 1)) % mod;
        lazy[p] = (lazy[p] + value) % mod;
    }
    void down(int p, int l, int r) {
        if (!lazy[p]) return;
        int mid = (l + r) / 2;
        apply(p * 2, l, mid, lazy[p]);
        apply(p * 2 + 1, mid + 1, r, lazy[p]);
        lazy[p] = 0;
    }
    void add(int p, int l, int r, int ql, int qr, long long value) {
        if (ql <= l && r <= qr) { apply(p, l, r, value); return; }
        down(p, l, r);
        int mid = (l + r) / 2;
        if (ql <= mid) add(p * 2, l, mid, ql, qr, value);
        if (qr > mid) add(p * 2 + 1, mid + 1, r, ql, qr, value);
        sum[p] = (sum[p * 2] + sum[p * 2 + 1]) % mod;
    }
    long long query(int p, int l, int r, int ql, int qr) {
        if (ql <= l && r <= qr) return sum[p];
        down(p, l, r);
        int mid = (l + r) / 2;
        long long answer = 0;
        if (ql <= mid) answer += query(p * 2, l, mid, ql, qr);
        if (qr > mid) answer += query(p * 2 + 1, mid + 1, r, ql, qr);
        return answer % mod;
    }
};

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q, root;
    long long mod;
    cin >> n >> q >> root >> mod;
    vector<long long> value(n + 1);
    for (int u = 1; u <= n; u++) cin >> value[u];
    vector<vector<int>> g(n + 1);
    for (int i = 1, u, v; i < n; i++) {
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> parent(n + 1), depth(n + 1), size(n + 1, 1), heavy(n + 1), order(1, root);
    size[0] = 0;
    for (int i = 0; i < n; i++) {
        int u = order[i];
        for (int v : g[u]) if (v != parent[u]) {
            parent[v] = u;
            depth[v] = depth[u] + 1;
            order.push_back(v);
        }
    }
    for (int i = n - 1; i > 0; i--) {
        int u = order[i], p = parent[u];
        size[p] += size[u];
        if (size[u] > size[heavy[p]]) heavy[p] = u;
    }
    vector<int> top(n + 1), dfn(n + 1);
    stack<pair<int, int>> pending;
    pending.push({root, root});
    int timer = 0;
    while (!pending.empty()) {
        int start = pending.top().first, head = pending.top().second;
        pending.pop();
        for (int u = start; u; u = heavy[u]) {
            top[u] = head;
            dfn[u] = ++timer;
            for (int v : g[u]) if (parent[v] == u && v != heavy[u]) pending.push({v, v});
        }
    }
    SegmentTree tree(n, mod);
    for (int u = 1; u <= n; u++) tree.add(1, 1, n, dfn[u], dfn[u], value[u] % mod);
    while (q--) {
        int op, x, y;
        cin >> op >> x;
        if (op == 1 || op == 2) {
            cin >> y;
            long long z = 0, answer = 0;
            if (op == 1) { cin >> z; z %= mod; }
            while (top[x] != top[y]) {
                if (depth[top[x]] < depth[top[y]]) swap(x, y);
                if (op == 1) tree.add(1, 1, n, dfn[top[x]], dfn[x], z);
                else answer = (answer + tree.query(1, 1, n, dfn[top[x]], dfn[x])) % mod;
                x = parent[top[x]];
            }
            if (depth[x] > depth[y]) swap(x, y);
            if (op == 1) tree.add(1, 1, n, dfn[x], dfn[y], z);
            else cout << (answer + tree.query(1, 1, n, dfn[x], dfn[y])) % mod << '\n';
        } else if (op == 3) {
            long long z;
            cin >> z;
            tree.add(1, 1, n, dfn[x], dfn[x] + size[x] - 1, z % mod);
        } else cout << tree.query(1, 1, n, dfn[x], dfn[x] + size[x] - 1) << '\n';
    }
    return 0;
}
```

`size[0] = 0` 表示“还没有选重儿子”。这样第一次遇到大小为 1 的叶子孩子时，也能把它选为当前最大的孩子。

沿 $\mathrm{heavy}$ 连续编号，同时把轻子树压栈，较深位置压入的轻子树先处理，因此保持了重儿子优先的 DFS 顺序。树遍历使用显式容器，线段树的递归深度则只有 $\mathcal{O}(\log  n)$。

这份实现逐点初始化 $\mathcal{O}(n \log  n)$，一次路径操作拆成 $\mathcal{O}(\log  n)$ 段、每段 $\mathcal{O}(\log  n)$，总 $\mathcal{O}(\log ^{2}n)$；子树操作 $\mathcal{O}(\log  n)$，空间 $\mathcal{O}(n)$。模内值与区间长度相乘用 `long long`。

## 练习：先列出被拆出的闭区间

先**独立重做 P3384**，打印每次路径拆分得到的区间，用原树逐点展开路径对拍，检查有没有漏掉或重复包含 LCA。

### 推荐必做

1. [P2590 · 树的统计](https://www.luogu.com.cn/problem/P2590)：单点赋值，并查询两点路径上的最大值与权值和。在线段树结点同时维护 $\mathrm{max}$ 和 $\mathrm{sum}$，测试全负点权。
2. [P3178 · 树上操作](https://www.luogu.com.cn/problem/P3178)：支持单点加、子树加和节点到根的路径和。分别把子树变成连续区间、把路径拆成重链区间。

### 选做巩固

- [P3379 · 最近公共祖先](https://www.luogu.com.cn/problem/P3379)：给定有根树，多次查询两点的最近公共祖先。用重链剖分不断跳较深链顶的父亲，同链后取较浅的点。
- [P1505 · 旅游](https://www.luogu.com.cn/problem/P1505)：修改单条边、将路径上的边权取反，并查询路径边权和、最大值与最小值。将边权存到较深端点，处理同链区间端点和取反标记。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树 #207](https://www.luogu.com.cn/training/207)。

## 本节验收

能解释轻边数量为什么是对数级；能把路径拆成不重叠区间；能区分点权与边权的端点处理；能看出线段树只是执行已经翻译好的区间任务。
