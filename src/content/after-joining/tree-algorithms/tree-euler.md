---
title: 树的遍历、子树大小与 DFS 序
description: 给树选定根，用父亲与遍历顺序组织计算，再把一棵子树变成连续的数组区间。
---

## 这一节学什么

前面学过二叉树，现在一位父亲可以有任意多个孩子。树仍然是连通、无环的图，n 个点恰有 n−1 条边。选定根后，沿唯一的路径就能确定每个点的父亲、深度和子树。

> **AI 伴学提示词**
>
> 为我讲解有根树、子树大小与 DFS 序，手画一次进入和返回，解释子树为什么对应连续区间，并引导我提问。

## 父子关系来自根，不来自结点编号

输入通常只给无向边，用 `vector<vector<int>> g` 保存两侧邻居。以 1 为根时，边 1—3 可以表示 1 是 3 的父亲；换一个根，关系可能反过来。编号较小并不代表深度较小。

深度 dep[u] 是根到 u 的边数，本节根深度为 0。size[u] 包括 u 自己，等于 1 加上所有孩子的子树大小。

```text
      1
    /   \
   2     3
  / \
 4   5

size[4]=size[5]=1，size[2]=3，size[3]=1，size[1]=5
```

孩子的 size 必须先算好，再交给父亲。可以在递归返回时相加，也可以先记录“父亲先于孩子”的 order，再倒着遍历 order 完成合并。

## 第一次进入结点时编号

按深度优先的顺序第一次进入 u 时，记 tin[u]=++timer。上图先访问 2 的分支，可得到：

| 原结点 | 1 | 2 | 4 | 5 | 3 |
| --- | --- | --- | --- | --- | --- |
| DFS 序编号 | 1 | 2 | 3 | 4 | 5 |

DFS 进入一棵子树后，必须把这棵子树全部走完，才会访问外面的点，所以 u 的子树恰好占闭区间 `[tin[u], tin[u]+size[u]-1]`。它不是按原编号截出的区间。

这使树上的问题能转成数组问题：把原点权 value[u] 放到数组 a[tin[u]]，子树求和就变成区间求和。

## 例题精讲：自编 · 修改点权与查询子树和

**题意简述：** 给 n 个点的树，根固定为 1，每点有一个整数权值。操作 `1 u delta` 将 u 的点权增加 delta，操作 `2 u` 查询 u 的整棵子树权值和。n、q≤2×10⁵，初值及增量绝对值≤10⁹。输入先给 n、q、n 个点权，再给 n−1 条边与 q 次操作。

输入：

```text
5 3
1 2 3 4 5
1 2
1 3
2 4
2 5
2 2
1 4 10
2 1
```

输出 `11`、`25`，每项一行。第一次取结点 2、4、5 的权值，随后第 4 点由 4 变成 14，整棵树总和变为 25。

### 先排成序列，再用已有的数据结构

单点增加与区间求和交给上一章的树状数组。新增的工作只有：确定 parent、tin、size，并把原编号转换成 DFS 序编号。

完整代码用显式栈实现 DFS：弹出一个点时编号，把它的孩子压入栈。后压入的先访问，具体兄弟顺序不重要，深度优先形成的连续性才重要。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<long long> value(n + 1), bit(n + 1);
    for (int i = 1; i <= n; i++) cin >> value[i];
    vector<vector<int>> g(n + 1);
    for (int i = 1, u, v; i < n; i++) {
        cin >> u >> v;
        g[u].push_back(v);
        g[v].push_back(u);
    }
    vector<int> parent(n + 1), tin(n + 1), size(n + 1, 1), order;
    stack<int> pending;
    pending.push(1);
    while (!pending.empty()) {
        int u = pending.top();
        pending.pop();
        order.push_back(u);
        tin[u] = order.size();
        for (int v : g[u]) if (v != parent[u]) {
            parent[v] = u;
            pending.push(v);
        }
    }
    for (int i = n - 1; i > 0; i--) {
        int u = order[i];
        size[parent[u]] += size[u];
    }
    auto add = [&](int pos, long long delta) {
        for (int x = pos; x <= n; x += x & -x) bit[x] += delta;
    };
    auto prefix = [&](int pos) {
        long long answer = 0;
        for (int x = pos; x > 0; x -= x & -x) answer += bit[x];
        return answer;
    };
    for (int u = 1; u <= n; u++) add(tin[u], value[u]);
    while (q--) {
        int op, u;
        cin >> op >> u;
        if (op == 1) {
            long long delta;
            cin >> delta;
            add(tin[u], delta);
        } else {
            cout << prefix(tin[u] + size[u] - 1) - prefix(tin[u] - 1) << '\n';
        }
    }
    return 0;
}
```

树上每个点只有一条从根出发的简单路径，跳过父亲就足以避免返回；普通有环图还要使用访问标记，不能照搬这个条件。

这里的 `auto add = [&](...) { ... };` 把函数直接写在 main 内，`[&]` 使它能使用外面的 n、bit；调用仍写 add(pos,delta)。prefix 同理。它们分别实现之前已经学过的修改和前缀查询。

显式栈把待处理的点存到容器中，链形树也不会消耗 n 层函数调用栈。这里的栈是控制遍历的工具，倒序 order 则负责“孩子先算，父亲后算”的依赖。

建 DFS 序 O(n)，树状数组逐点初始化 O(n log n)，每次操作 O(log n)，总存储 O(n)。累计和用 long long。

## 练习：在原编号和序列编号之间转换

先**独立重做本例**，在纸上记录每个点的 tin、size、子树区间，再用普通遍历对子树求和对拍。

### 推荐必做

1. **自编 · 第 k 个子树结点：** 在本例树上，询问 u 的子树中按 DFS 序的第 k 个点。用反向数组 vertex[tin[u]]=u；若 k>size[u] 输出 −1，否则取 vertex[tin[u]+k−1]。
2. **自编 · 判断祖先：** 询问 u 是否为 v 的祖先，允许 u=v。判断 tin[v] 是否落在 u 的子树区间，练习将关系转成区间包含。

### 选做巩固

- **自编 · 子树赋值后求最大值：** 沿用 DFS 序，将子树范围交给线段树维护，操作规模仍为 2×10⁵。
- **自编 · 换根后重建：** 分别以 1、n 为根，输出同一个点的父亲与子树大小，解释为什么原树没变，有根关系却变了。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树 #207](https://www.luogu.com.cn/training/207)。

## 本节验收

能解释根如何决定父子关系；能从遍历顺序推导 size 的计算顺序；能说明子树连续性的来源，并把子树操作准确转换为闭区间。
