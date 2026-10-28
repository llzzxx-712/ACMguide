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

## 例题精讲：[CF1006E Military Problem](https://codeforces.com/problemset/problem/1006/E)

**题意简述：** 军队是一棵以 1 为根的树，输入 2…n 各点的直属父亲。命令从 u 出发，按孩子编号升序进行 DFS，u 自己是第一个接令者；询问第 k 个接令者，人数不足输出 −1。n、q≤2×10⁵。第一行 n、q，第二行 n−1 个父亲，之后 q 行 u、k。

自编输入：

```text
5 4
1 1 2 2
2 1
2 3
2 4
1 5
```

输出：

```text
2
5
-1
3
```

### 先把思路讲清楚

树为 1 的孩子 2、3，2 的孩子 4、5。从 1 进行 DFS 得 [1,2,4,5,3]，从 2 开始的 [2,4,5] 正是其中一段。

先记录 order 和每点 tin、size。若 k≤size[u]，答案就是 order[tin[u]+k−1]。本段代码的 tin 从 0 开始，因此子树为 [tin[u],tin[u]+size[u]−1]，与上面从 1 编号的推导只差整体平移。

输入按 v=2…n 追加孩子，名单天然升序。栈后进先出，要把孩子逆序入栈，才能先处理最小编号。倒序 order 合并 size 时，孩子先算完，父亲再累加。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<vector<int>> child(n + 1);
    for (int v = 2; v <= n; v++) {
        int p;
        cin >> p;
        child[p].push_back(v);
    }
    vector<int> tin(n + 1), size(n + 1, 1), order;
    stack<int> pending;
    pending.push(1);
    while (!pending.empty()) {
        int u = pending.top();
        pending.pop();
        tin[u] = order.size();
        order.push_back(u);
        int count = child[u].size();
        for (int i = count - 1; i >= 0; i--) pending.push(child[u][i]);
    }
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        for (int v : child[u]) size[u] += size[v];
    }
    while (q--) {
        int u, k;
        cin >> u >> k;
        if (k > size[u]) cout << -1 << '\n';
        else cout << order[tin[u] + k - 1] << '\n';
    }
    return 0;
}
```

预处理 O(n)，每次询问 O(1)，空间 O(n)。显式栈能处理长链。如果以后需要修改点权、查询子树和，只需把 value[u] 放到 DFS 序位置，再用树状数组处理这个连续区间。

## 练习：在原编号和序列编号之间转换

先**独立重做本例**，在纸上记录每个点的 tin、size、子树区间，再从询问的 u 单独做一次按编号升序的 DFS，与第 k 个结点的回答对照。

### 推荐必做

1. [P3605 · Promotion Counting](https://www.luogu.com.cn/problem/P3605)：对每个结点，统计其子树中能力值比它大的下属数量。用 DFS 序表示子树区间，按能力值排序并用树状数组计数。

### 选做巩固

- [P3178 · 树上操作](https://www.luogu.com.cn/problem/P3178)：支持单点加、子树加及节点到根的路径和。先将子树加转换为 DFS 序区间，再思考根路径和如何维护。
- [CF 383C · Propagating tree](https://codeforces.com/problemset/problem/383/C)：给一个点加值后，增量沿子树逐层变号，查询单点当前值。用 DFS 序处理子树范围，按深度奇偶区分符号。
- [CF 620E · New Year Tree](https://codeforces.com/problemset/problem/620/E)：给整棵子树重新染色，查询子树内不同颜色数。用 DFS 序映射区间，并在线段树中用位集合合并颜色。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[树 #207](https://www.luogu.com.cn/training/207)。

## 本节验收

能解释根如何决定父子关系；能从遍历顺序推导 size 的计算顺序；能说明子树连续性的来源，并把子树操作准确转换为闭区间。
