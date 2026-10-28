---
title: 可持久化线段树与静态区间第 k 小
description: 每次只复制修改路径，保留所有前缀版本，再用两个版本的数量差回答区间排名。
---

## 这一节学什么

可持久化表示修改后仍能访问旧版本。在线段树的一次单点更新中，只有根到叶子的一条路径改变，其余子树完全相同；所以我们只复制这条路径，其他地方继续共享旧结点。

> **AI 伴学提示词**
>
> 为我画出前缀版本之间复制和共享的结点，解释两棵树相减怎样得到区间计数，再对照第 k 小的代码引导我提问。

## 从前缀和迁移到“前缀频次树”

前缀和用 `S[r] - S[l - 1]` 得到区间和。现在把单个总和换成整个值域的频次分布：`root[i]` 表示前 i 个数各出现几次。

于是 `root[r]` 与 `root[l - 1]` 在同一值域结点上的数量之差，就是 `a[l…r]` 中落在这段值域的数量。树不用真的逐结点相减，只在查询走到的路径上计算差。

## 例题精讲：[P3834 静态区间第 k 小](https://www.luogu.com.cn/problem/P3834)

**题意简述：** 给 n≤2×10⁵ 的数组，最多 2×10⁵ 次询问 `[l, r]` 内第 k 小，数组不修改。数值 0…10⁹，保证 k 合法。

自编输入：

```text
5 2
5 1 4 2 3
2 5 2
1 3 3
```

输出 `2`、`5`，各占一行。

先离散化，保留大小关系和值的还原表。以 `[2, 5]` 第 2 小为例，比较版本 5 和版本 1：它们在较小值一半的数量差，恰好等于区间内落在这一半的元素数。若不少于 k，两个根一起走左孩子；否则一起走右孩子，并减去这部分数量。

## 新版本只能改新结点

建立 `root[i]` 时，从 `root[i - 1]` 复制当前结点、数量加 1，再只替换包含 `a[i]` 的那个孩子。另一孩子编号保持不变，所以共享旧子树。绝不能直接修改旧根对应的数量，否则前缀版本就被破坏了。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Node { int left = 0, right = 0, count = 0; };
vector<Node> tree(1);

int insert(int old, int l, int r, int value) {
    Node copy = tree[old];
    int now = tree.size();
    tree.push_back(copy);
    tree[now].count++;
    if (l == r) return now;
    int mid = l + (r - l) / 2;
    if (value <= mid) {
        int child = insert(tree[old].left, l, mid, value);
        tree[now].left = child;
    } else {
        int child = insert(tree[old].right, mid + 1, r, value);
        tree[now].right = child;
    }
    return now;
}

int kth(int before, int after, int l, int r, int k) {
    if (l == r) return l;
    int mid = l + (r - l) / 2;
    int count = tree[tree[after].left].count - tree[tree[before].left].count;
    if (k <= count) return kth(tree[before].left, tree[after].left, l, mid, k);
    return kth(tree[before].right, tree[after].right, mid + 1, r, k - count);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    vector<int> a(n + 1), values;
    for (int i = 1; i <= n; i++) { cin >> a[i]; values.push_back(a[i]); }
    sort(values.begin(), values.end());
    values.erase(unique(values.begin(), values.end()), values.end());
    int size = values.size();
    vector<int> root(n + 1);
    tree.reserve(n * 21 + 1);
    for (int i = 1; i <= n; i++) {
        int rank = lower_bound(values.begin(), values.end(), a[i]) - values.begin() + 1;
        root[i] = insert(root[i - 1], 1, size, rank);
    }
    while (q--) {
        int l, r, k;
        cin >> l >> r >> k;
        int rank = kth(root[l - 1], root[r], 1, size, k);
        cout << values[rank - 1] << '\n';
    }
    return 0;
}
```

`root[0] = 0` 表示空前缀，不必先建立完整空树。值的排名从 1 开始，values 的下标从 0 开始，所以输出用 rank−1。重复数走向同一叶子，每次增加一次频次。

建树时间 $\mathcal{O}(n \log  \sigma)$，查询 $\mathcal{O}(\log  \sigma)$，空间 $\mathcal{O}(n \log  \sigma)$，σ 为不同值数量。n=2×10⁵ 时单条复制路径不超过 19 个结点，约 380 万个三 `int` 结点；离散化排序另需 $\mathcal{O}(n \log  n)$。

## 练习：先检查旧版本有没有改变

先**独立重做例题**，每插入一个数后，检查旧 root 的总数仍等于它原来的前缀长度。

### 推荐必做

1. [P3919 可持久化数组](https://www.luogu.com.cn/problem/P3919)：在历史版本上修改或查询数组位置，每次操作生成版本。练习复制修改路径并保留旧版本。
2. [P2617 Dynamic Rankings](https://www.luogu.com.cn/problem/P2617)：支持单点修改和区间第 k 小查询。练习比较静态前缀版本与带修改的多棵频次树。

### 选做巩固

- [P3835 可持久化平衡树](https://www.luogu.com.cn/problem/P3835)：从历史版本维护可重集，支持插删、排名、第 k 小、前驱和后继。练习理解版本分叉与值域统计。
- [P4592 异或](https://www.luogu.com.cn/problem/P4592)：查询树上子树或路径中的权值与给定数的最大异或值。练习将持久化思想用于二进制字典树，并区分路径和子树对应的版本。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线段树的进阶用法 #221](https://www.luogu.com.cn/training/221)。

## 本节验收

能解释复制路径与共享子树；能保证旧结点不被修改；能用两个前缀版本的频次差完成同一条第 k 小查找路径。
