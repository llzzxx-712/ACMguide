---
title: 权值线段树与动态开点
description: 将叶子从数组位置改成数值，按频次维护排名，再只为实际出现的值创建路径。
---

## 这一节学什么

普通线段树常按“第几个元素”分区间；权值线段树按“数值是多少”分区间。叶子 v 存值 v 出现几次，内部结点存这一段值域里共有多少个元素。有了频次，就能在树上找第 k 小。

> **AI 伴学提示词**
>
> 为我对比按下标建树与按值域建树，用重复数手算排名和第 k 小，再解释动态开点的编号与空结点，并引导我提问。

## 从桶计数走到一棵树

集合 {2,2,5,8} 的桶中，2 的频次为 2，5、8 各为 1。要找第 3 小，先看较小半边有几个元素：若已有至少 3 个，就继续向左；否则跳过它们，到右边找剩余排名。

沿途维护 k 的含义：“在当前区间里找第 k 小”。向右时减去左边全部数量，向左时 k 不变。重复值按出现次数计入，因此两个 2 占据前两名。

## 值域很大，不必先建全部结点

值域为 [−10⁷,10⁷]，但只插入一个数时，只会用到根到该叶子的一条路径。动态开点用一个结点池存左右孩子编号和数量，编号 0 表示尚未建立的空树，数量自然为 0。

这和普通数组 a[i] 的含义不同：`tree[p]` 的 p 是**结点编号**，这一结点管理的值域由函数参数 l、r 表示；孩子编号也不等于值本身。

## 例题精讲：[P3369 普通平衡树](https://www.luogu.com.cn/problem/P3369)

**题意简述：** 维护可重集合，支持插入一个数、删除一个数、查询排名、第 k 小、严格前驱与严格后继。操作≤10⁵，数值绝对值≤10⁷，题目保证第 k 小及前驱、后继查询的答案存在。

自编输入：

```text
8
1 2
1 2
1 5
3 5
4 2
5 5
6 2
2 2
```

输出 `3`、`2`、`2`、`5`，各占一行。排名定义为“小于 x 的数量+1”，查询值本身可以不存在。

记 count(x) 为≤x 的数量，那么：排名=count(x−1)+1；前驱是第 count(x−1) 小；后继是第 count(x)+1 小。严格与非严格的区别直接体现在 x−1 和 x 中。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Node { int left = 0, right = 0, count = 0; };
vector<Node> tree(1);
const int LOW = -10000000, HIGH = 10000000;

int change(int p, int l, int r, int value, int delta) {
    if (p == 0) { p = tree.size(); tree.push_back(Node()); }
    tree[p].count += delta;
    if (l == r) return p;
    int mid = l + (r - l) / 2;
    if (value <= mid) {
        int child = change(tree[p].left, l, mid, value, delta);
        tree[p].left = child;
    } else {
        int child = change(tree[p].right, mid + 1, r, value, delta);
        tree[p].right = child;
    }
    return p;
}

int prefix(int p, int l, int r, int value) {
    if (p == 0 || value < l) return 0;
    if (r <= value) return tree[p].count;
    int mid = l + (r - l) / 2;
    if (value <= mid) return prefix(tree[p].left, l, mid, value);
    return tree[tree[p].left].count + prefix(tree[p].right, mid + 1, r, value);
}

int kth(int p, int l, int r, int k) {
    if (l == r) return l;
    int mid = l + (r - l) / 2;
    int leftCount = tree[tree[p].left].count;
    if (k <= leftCount) return kth(tree[p].left, l, mid, k);
    return kth(tree[p].right, mid + 1, r, k - leftCount);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, root = 0;
    cin >> n;
    tree.reserve(n * 26 + 1);
    while (n--) {
        int op, x;
        cin >> op >> x;
        if (op == 1) root = change(root, LOW, HIGH, x, 1);
        else if (op == 2) {
            if (prefix(root, LOW, HIGH, x) > prefix(root, LOW, HIGH, x - 1)) root = change(root, LOW, HIGH, x, -1);
        } else if (op == 3) cout << prefix(root, LOW, HIGH, x - 1) + 1 << '\n';
        else if (op == 4) cout << kth(root, LOW, HIGH, x) << '\n';
        else if (op == 5) cout << kth(root, LOW, HIGH, prefix(root, LOW, HIGH, x - 1)) << '\n';
        else cout << kth(root, LOW, HIGH, prefix(root, LOW, HIGH, x) + 1) << '\n';
    }
    return 0;
}
```

单次 O(log V)，V 为值域长度；最多 O(n log V) 个结点。这里每条路径不超过 26 个结点，每个结点三个 int，约 12 字节。删除只减少数量，不回收路径，也不会把不存在的数减成负数。

> **结点池的下标与容量**
>
> vector 扩容可能让旧引用失效。因此递归前不要长期保存 `Node&` 或把 `tree[p].left` 作为引用参数传进去；本例先取得返回的孩子编号，再按编号赋值。编号 0 必须保留为空树，不能拿来存实际根。

## 练习：先画一条第 k 小的路径

先**独立重做例题**，为 {2,2,5,8} 逐层写下左侧数量和剩余 k，再实现查询。

### 推荐必做

1. [P1168 中位数](https://www.luogu.com.cn/problem/P1168)：依次输出序列每个奇数长度前缀的中位数。练习动态插入并按左子树频次寻找第 k 小。
2. [P1801 黑匣子](https://www.luogu.com.cn/problem/P1801)：依次加入整数，第 i 次查询输出当前集合的第 i 小。练习按原题输入安排插入和查询，并处理重复值。

### 选做巩固

- [P1486 郁闷的出纳员](https://www.luogu.com.cn/problem/P1486)：支持工资整体加减、低于下界的员工离开及第 k 高工资查询。练习用整体偏移量与值域计数处理这些操作。
- [P5494 线段树分裂](https://www.luogu.com.cn/problem/P5494)：对多个可重集支持值域分裂、合并、计数和第 k 小查询。练习将单棵频次树推广到多个根。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线段树的进阶用法 #221](https://www.luogu.com.cn/training/221)。

## 本节验收

能区分位置与值域；能解释向右时为什么减左侧数量；能用空结点和孩子编号实现只建实际访问的路径。
