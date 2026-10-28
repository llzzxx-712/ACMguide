---
title: 线段树合并与树状数组套线段树
description: 先把子树频次树直接合并，再将多个值域计数树放进树状数组，维护带修改的区间第 k 小。
---

## 这一节学什么

当两棵权值线段树使用相同值域划分时，对应叶子表示同一个值。于是可以将频次逐点相加，也可以在查询时对若干棵树的频次做加减。这一节分别利用这两种能力。

> **AI 伴学提示词**
>
> 为我用颜色频次解释线段树合并，再画出树状数组每格管理的下标范围，讲解多棵值域树怎样共同查找第 $k$ 小，并引导我提问。

## 合并时，一个空分支可以直接接过来

合并两棵同值域的树：一棵为空，直接返回另一棵；都到叶子，频次相加；否则分别合并左右孩子，再汇总当前答案。相比将另一棵树的全部元素重新单点插入，这个过程会跳过许多空分支。

本节用**破坏式合并**：允许修改已有结点，旧的两棵树不再作为独立版本使用。它与上一节只复制、不破坏旧版本的可持久化有不同用途。

## 例题精讲一：[CF600E Lomsat gelral](https://codeforces.com/problemset/problem/600/E)

**题意简述：** 给以 1 为根的 $n$ 点树，每点颜色 `c[i]`，$1\le c[i]\le n$、$n\le 10^{5}$。对每个结点，求子树中所有最高频颜色的编号之和。输入 $n$、$n$ 个颜色及 $n-1$ 条边；按结点顺序输出 $n$ 个答案。

自编输入：

```text
5
2 1 2 1 1
1 2
1 3
2 4
2 5
```

输出：

```text
1 1 2 1 1
```

### 先把思路讲清楚

根的子树中颜色 1 出现三次，是唯一众数，所以答案为 1；结点 3 只有自身颜色 2，答案为 2。若某子树颜色 `2、5` 同样出现最多次，答案应为 $2+5=7$，不能只取更小颜色，也不能输出频次。

每点先建立只含自身颜色的频次树，再按孩子先于父亲的 $\mathrm{order}$ 合并。叶子记录该颜色次数与真实颜色值；内部结点维护 $\mathrm{maximum}$（最大次数）、$\mathrm{sum}$（达到最大次数的颜色之和）。左右 $\mathrm{maximum}$ 不同，只取较大一侧的 $\mathrm{sum}$；相同就把两侧 $\mathrm{sum}$ 相加。

本代码先离散化颜色，叶子位置 $l$ 代表 `values[l - 1]`，加到 $\mathrm{sum}$ 的必须是真实颜色值。合并同色叶子时次数相加，颜色值仍只计一次。每棵子树合并结束就把答案复制到普通数组，父亲随后会破坏式修改共享的树，不能事后再拿旧 $\mathrm{root}$ 查询。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Node { int left = 0, right = 0, maximum = 0; long long sum = 0; };
vector<Node> tree(1);
vector<int> values;

void pull(int p) {
    int a = tree[p].left, b = tree[p].right;
    tree[p].maximum = max(tree[a].maximum, tree[b].maximum);
    tree[p].sum = 0;
    if (tree[a].maximum == tree[p].maximum) tree[p].sum += tree[a].sum;
    if (tree[b].maximum == tree[p].maximum) tree[p].sum += tree[b].sum;
}

int insert(int p, int l, int r, int value) {
    if (p == 0) { p = tree.size(); tree.push_back(Node()); }
    if (l == r) { tree[p].maximum++; tree[p].sum = values[l - 1]; return p; }
    int mid = l + (r - l) / 2;
    if (value <= mid) { int child = insert(tree[p].left, l, mid, value); tree[p].left = child; }
    else { int child = insert(tree[p].right, mid + 1, r, value); tree[p].right = child; }
    pull(p);
    return p;
}

int mergeTrees(int a, int b, int l, int r) {
    if (a == 0 || b == 0) return a + b;
    if (l == r) { tree[a].maximum += tree[b].maximum; return a; }
    int mid = l + (r - l) / 2;
    tree[a].left = mergeTrees(tree[a].left, tree[b].left, l, mid);
    tree[a].right = mergeTrees(tree[a].right, tree[b].right, mid + 1, r);
    pull(a);
    return a;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> color(n + 1);
    for (int i = 1; i <= n; i++) { cin >> color[i]; values.push_back(color[i]); }
    sort(values.begin(), values.end());
    values.erase(unique(values.begin(), values.end()), values.end());
    int size = values.size();
    vector<vector<int>> graph(n + 1);
    for (int i = 1; i < n; i++) {
        int u, v;
        cin >> u >> v;
        graph[u].push_back(v); graph[v].push_back(u);
    }
    vector<int> parent(n + 1), order(1, 1), root(n + 1);
    for (int i = 0; i < n; i++) {
        int u = order[i];
        for (int v : graph[u]) if (v != parent[u]) { parent[v] = u; order.push_back(v); }
    }
    tree.reserve(n * 21 + 1);
    for (int u = 1; u <= n; u++) {
        int rank = lower_bound(values.begin(), values.end(), color[u]) - values.begin() + 1;
        root[u] = insert(0, 1, size, rank);
    }
    vector<long long> answer(n + 1);
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        for (int v : graph[u]) if (parent[v] == u) root[u] = mergeTrees(root[u], root[v], 1, size);
        answer[u] = tree[root[u]].sum;
    }
    for (int u = 1; u <= n; u++) cout << answer[u] << (u == n ? '\n' : ' ');
    return 0;
}
```

建点及全部合并总计 $\mathcal{O}(n \log  \sigma)$，空间 $\mathcal{O}(n \log  \sigma)$，排序 $\mathcal{O}(n \log  n)$。每次两个非空结点合并会消耗一份不再独立使用的结点，因此总合并工作量可按初始结点数累计。颜色和可能超过 `int`，使用 `long long`；树遍历用显式 $\mathrm{order}$，值域递归深度只有 $\mathcal{O}(\log  \sigma)$。

## 从两个前缀版本转向多个计数树

上一节 `root[i]` 是不变数组的前缀频次。若 `a[x]` 修改，直接维护每个前缀会影响 $x\ldots n$ 的全部根。

树状数组把这些前缀信息拆成 $\mathcal{O}(\log  n)$ 段：第 $i$ 格管理下标 $[i-\operatorname{lowbit}(i)+1,i]$，现在其中存的不是一个总和，而是**这一段所有元素的值域频次树**。修改位置 $x$ 时，沿树状数组更新若干根；查询前缀 $r$ 时，收集若干根。请始终区分外层的下标区间与内层的值域区间。

## 例题精讲二：[P2617 Dynamic Rankings](https://www.luogu.com.cn/problem/P2617)

**题意简述：** $n,m\le 10^{5}$，数组值为 $0\ldots10^9$，支持 `C x y` 将 `a[x]` 改为 $y$，`Q l r k` 查询当前 $[l,r]$ 第 $k$ 小。先读完操作，将初值与所有修改后的值一起离散化，再按原顺序执行。

自编输入：

```text
5 3
5 1 4 2 3
Q 2 5 2
C 2 6
Q 1 3 2
```

输出 `2`、`5`。修改时先给旧值减 1，再给新值加 1；只改 `a[x]` 而不撤销旧频次会使总数越来越大。

查询收集前缀 $r$ 的正号根、前缀 $l-1$ 的负号根。将所有正号根的左孩子数量相加，再减去所有负号根的左孩子数量，就得到区间落在左半值域的数量。之后与上一节完全一样：决定左或右，所有根一起往同侧移动。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Node { int left = 0, right = 0, count = 0; };
struct Operation { char type; int x, y, k; };
// deque 分块存储，增加结点时不复制整个结点池，仍可用编号随机访问。
deque<Node> tree(1);
vector<int> root;
int n, sizeValue;

int change(int p, int l, int r, int value, int delta) {
    if (p == 0) { p = tree.size(); tree.push_back(Node()); }
    tree[p].count += delta;
    if (l == r) return p;
    int mid = l + (r - l) / 2;
    if (value <= mid) { int child = change(tree[p].left, l, mid, value, delta); tree[p].left = child; }
    else { int child = change(tree[p].right, mid + 1, r, value, delta); tree[p].right = child; }
    return p;
}

void add(int position, int value, int delta) {
    for (int i = position; i <= n; i += i & -i) root[i] = change(root[i], 1, sizeValue, value, delta);
}

int query(int l, int r, int k) {
    vector<int> plus, minus;
    for (int i = r; i > 0; i -= i & -i) plus.push_back(root[i]);
    for (int i = l - 1; i > 0; i -= i & -i) minus.push_back(root[i]);
    int le = 1, ri = sizeValue;
    while (le < ri) {
        int mid = le + (ri - le) / 2;
        int leftCount = 0;
        for (int p : plus) leftCount += tree[tree[p].left].count;
        for (int p : minus) leftCount -= tree[tree[p].left].count;
        bool goLeft = k <= leftCount;
        if (goLeft) ri = mid;
        else { le = mid + 1; k -= leftCount; }
        for (int &p : plus) p = goLeft ? tree[p].left : tree[p].right;
        for (int &p : minus) p = goLeft ? tree[p].left : tree[p].right;
    }
    return le;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    cin >> n >> m;
    vector<int> a(n + 1), values;
    for (int i = 1; i <= n; i++) { cin >> a[i]; values.push_back(a[i]); }
    vector<Operation> operations;
    for (int i = 0; i < m; i++) {
        char type;
        int x, y, k = 0;
        cin >> type >> x >> y;
        if (type == 'Q') cin >> k;
        else values.push_back(y);
        operations.push_back({type, x, y, k});
    }
    sort(values.begin(), values.end());
    values.erase(unique(values.begin(), values.end()), values.end());
    sizeValue = values.size();
    auto rankOf = [&](int value) { return lower_bound(values.begin(), values.end(), value) - values.begin() + 1; };
    root.resize(n + 1);
    for (int i = 1; i <= n; i++) { a[i] = rankOf(a[i]); add(i, a[i], 1); }
    for (auto op : operations) {
        if (op.type == 'C') {
            add(op.x, a[op.x], -1);
            a[op.x] = rankOf(op.y);
            add(op.x, a[op.x], 1);
        } else cout << values[query(op.x, op.y, op.k) - 1] << '\n';
    }
    return 0;
}
```

这里的循环是在树的两个子区间中选一个，`ri = mid` 保留整个左孩子，最终到达叶子；它不是第四章在数轴上试探候选答案的二分查找。

单次修改或查询 $\mathcal{O}(\log  n\cdot \log  \sigma)$，动态结点数的上界 $\mathcal{O}((n+m)\log n\cdot\log\sigma)$。空间需要单独估算，不能只按 $n$ 个普通线段树结点计算。每个结点三个 `int` 约 12 字节；本例用 `deque` 分块增长，避免巨大 `vector` 扩容时临时同时保留新旧两份存储。删掉一个值时保留空路径，重新出现可复用；离散化必须包含未来修改值。

## 练习：先分清哪一维在移动

先**独立重做两道例题**，画出一次子树合并与一次 `Q 2 5 2` 收集的正负根列表，再逐层算 $\mathrm{leftCount}$。

### 推荐必做

1. [P3224 永无乡](https://www.luogu.com.cn/problem/P3224)：动态连接岛屿，查询某连通块内按重要度排列的第 $k$ 个岛。练习合并连通块对应的权值线段树。
2. [P3605 Promotion Counting](https://www.luogu.com.cn/problem/P3605)：对每个结点统计能力值大于自己的下属数。练习按子树合并权值树，并查询值域后缀。

### 选做巩固

- [P4556 雨天的尾巴](https://www.luogu.com.cn/problem/P4556)：多次沿树上路径发放物资，求每个点收到最多的物资种类。练习树上差分与线段树合并，同数目时按原题规则处理。
- [P3380 树套树](https://www.luogu.com.cn/problem/P3380)：支持区间排名、第 $k$ 小、前驱、后继和单点修改。练习组合位置区间与值域统计，注意原题的无前驱或后继输出。
- [P5494 线段树分裂](https://www.luogu.com.cn/problem/P5494)：对多个可重集执行值域分裂、合并与查询。练习分清哪些根会被清空，哪些结点需要新建。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线段树的进阶用法 #221](https://www.luogu.com.cn/training/221)。

## 本节验收

能按相同值域合并频次；能说明破坏式合并的旧根为何不能继续查询；能把下标前缀拆成多棵值域树，用正负根共同完成区间排名。
