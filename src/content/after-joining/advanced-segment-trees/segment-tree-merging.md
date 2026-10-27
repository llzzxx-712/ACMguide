---
title: 线段树合并与树状数组套线段树
description: 先把子树频次树直接合并，再将多个值域计数树放进树状数组，维护带修改的区间第 k 小。
---

## 这一节学什么

当两棵权值线段树使用相同值域划分时，对应叶子表示同一个值。于是可以将频次逐点相加，也可以在查询时对若干棵树的频次做加减。这一节分别利用这两种能力。

> **AI 伴学提示词**
>
> 为我用颜色频次解释线段树合并，再画出树状数组每格管理的下标范围，讲解多棵值域树怎样共同查找第 k 小，并引导我提问。

## 合并时，一个空分支可以直接接过来

合并两棵同值域的树：一棵为空，直接返回另一棵；都到叶子，频次相加；否则分别合并左右孩子，再汇总当前答案。相比将另一棵树的全部元素重新单点插入，这个过程会跳过许多空分支。

本节用**破坏式合并**：允许修改已有结点，旧的两棵树不再作为独立版本使用。它与上一节只复制、不破坏旧版本的可持久化有不同用途。

## 例题精讲一：自编 · 每棵子树的最多颜色

**题意简述：** 输入 n≤10⁵ 的树，每点有 1…10⁹ 的颜色，根为 1。对每个点输出子树内出现最多的颜色及次数；并列取颜色较小者。输入 n、n 个颜色，再输入 n−1 条无向边。

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
1 3
1 3
2 1
1 1
1 1
```

每点先只有自身颜色的计数树。按孩子先于父亲的顺序，逐个合并孩子；父亲的树就代表完整子树。每个结点维护最大频次与对应最小颜色，合并后按左右答案比较即可，左边颜色更小，所以同频优先左边。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Node { int left = 0, right = 0, maximum = 0, best = 0; };
vector<Node> tree(1);

void pull(int p) {
    int a = tree[p].left, b = tree[p].right;
    int chosen = tree[a].maximum >= tree[b].maximum ? a : b;
    tree[p].maximum = tree[chosen].maximum;
    tree[p].best = tree[chosen].best;
}

int insert(int p, int l, int r, int value) {
    if (p == 0) { p = tree.size(); tree.push_back(Node()); }
    if (l == r) { tree[p].maximum++; tree[p].best = l; return p; }
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
    vector<int> color(n + 1), values;
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
    vector<pair<int, int>> answer(n + 1);
    for (int i = n - 1; i >= 0; i--) {
        int u = order[i];
        for (int v : graph[u]) if (parent[v] == u) root[u] = mergeTrees(root[u], root[v], 1, size);
        answer[u] = {values[tree[root[u]].best - 1], tree[root[u]].maximum};
    }
    for (int u = 1; u <= n; u++) cout << answer[u].first << ' ' << answer[u].second << '\n';
    return 0;
}
```

答案在子树合并完时立刻存成普通数值。之后父亲继续合并可能修改共享过来的结点，不能再拿旧的 root[u] 查询“当时的子树”。树的遍历用显式 order，链形树不会产生十万层 DFS 调用；值域递归只有 O(log σ) 层。

初始建点 O(n log σ)。每次两个非空结点相遇后，其中一份被消耗、不再作为独立树参与，全部合并的总工作量与初始结点数同阶，合计 O(n log σ)，空间 O(n log σ)；排序另需 O(n log n)。

## 从两个前缀版本转向多个计数树

上一节 root[i] 是不变数组的前缀频次。若 a[x] 修改，直接维护每个前缀会影响 x…n 的全部根。

树状数组把这些前缀信息拆成 O(log n) 段：第 i 格管理下标 [i−lowbit(i)+1,i]，现在其中存的不是一个总和，而是**这一段所有元素的值域频次树**。修改位置 x 时，沿树状数组更新若干根；查询前缀 r 时，收集若干根。请始终区分外层的下标区间与内层的值域区间。

## 例题精讲二：[P2617 Dynamic Rankings](https://www.luogu.com.cn/problem/P2617)

**题意简述：** n,m≤10⁵，数组值为 0…10⁹，支持 `C x y` 将 a[x] 改为 y，`Q l r k` 查询当前 [l,r] 第 k 小。先读完操作，将初值与所有修改后的值一起离散化，再按原顺序执行。

自编输入：

```text
5 3
5 1 4 2 3
Q 2 5 2
C 2 6
Q 1 3 2
```

输出 `2`、`5`。修改时先给旧值减 1，再给新值加 1；只改 a[x] 而不撤销旧频次会使总数越来越大。

查询收集前缀 r 的正号根、前缀 l−1 的负号根。将所有正号根的左孩子数量相加，再减去所有负号根的左孩子数量，就得到区间落在左半值域的数量。之后与上一节完全一样：决定左或右，所有根一起往同侧移动。

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

这里的循环是在树的两个子区间中选一个，`ri=mid` 保留整个左孩子，最终到达叶子；它不是第四章在数轴上试探候选答案的二分查找。

单次修改或查询 O(log n·log σ)，动态结点数的上界 O((n+m)log n·log σ)。空间需要单独估算，不能只按 n 个普通线段树结点计算。每个结点三个 int 约 12 字节；本例用 deque 分块增长，避免巨大 vector 扩容时临时同时保留新旧两份存储。删掉一个值时保留空路径，重新出现可复用；离散化必须包含未来修改值。

## 练习：先分清哪一维在移动

先**独立重做两道例题**，画出一次子树合并与一次 `Q 2 5 2` 收集的正负根列表，再逐层算 leftCount。

### 推荐必做

1. **自编 · 子树不同颜色数：** 将例题一的汇总信息改为非零叶子数量，合并时同色只算一次。
2. **自编 · 带修改区间值计数：** 在例题二支持 [l,r] 中≤x 的数量，练习树状数组前缀差与值域前缀的组合。

### 选做巩固

- **自编 · 最小反例：** 对长度≤10 随机修改，查询时复制区间并 sort，与树套树结果核对。
- **自编 · 三种根：** 比较“当前集合根”“前缀历史版本根”“树状数组区间根”分别代表什么，说明哪些可以破坏式修改。
- **自编 · 内存账本：** 输出结点池实际大小到调试日志，比较全相同值与不断出现新值时的差别，提交前移除日志。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线段树的进阶用法 #221](https://www.luogu.com.cn/training/221)。

## 本节验收

能按相同值域合并频次；能说明破坏式合并的旧根为何不能继续查询；能把下标前缀拆成多棵值域树，用正负根共同完成区间排名。
