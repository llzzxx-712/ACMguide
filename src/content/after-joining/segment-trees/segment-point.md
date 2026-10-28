---
title: 单点修改与区间查询
description: 沿根到叶子的路径修改一个位置，再沿返回路径重新合并受影响的区间。
---

## 这一节学什么

修改原数组第 $\mathrm{pos}$ 项时，并不是整棵树都要重建。只有包含 $\mathrm{pos}$ 的结点受到影响，它们恰好形成从根到叶子的一条路径。到叶子修改，再在返回时逐层合并，就能恢复全部相关区间的信息。

> **AI 伴学提示词**
>
> 为我讲解线段树单点修改与区间查询，手算修改第 3 项后哪些结点变化，解释递归返回时为什么重新合并，并引导我提问。

## 先在纸上找出受影响的结点

长度 5 的数组中，第 3 项属于 $[1, 5]$、$[1, 3]$、$[3, 3]$。只沿这三个区间走，其他区间的元素没变，保存的信息也不用更新。

函数 `add(p, l, r, pos, delta)` 的思路：若 $l=r$，就给这个叶子加 $\mathrm{delta}$；否则看 $\mathrm{pos}\le \mathrm{mid}$ 还是 $\mathrm{pos}>\mathrm{mid}$，进入对应的一边；返回后 `pushUp`。

```text
下去：确定被修改的位置属于哪一侧
叶子：完成真正的数值修改
回来：重新合并沿途每个区间
```

修改一个位置只走一边，因此这里用 `if/else`。上一节区间查询可能跨过中点，要分别判断两边，两个函数的分支来自不同的任务。

## 例题精讲：P3374 · 用线段树再做单点修改区间和

**原题：** [P3374 · 树状数组 1](https://www.luogu.com.cn/problem/P3374)。

**题意简述：** 长度 $n$ 的数组，操作 `1 x k` 把第 $x$ 项加 $k$，操作 `2 l r` 查询 $[l, r]$ 的和。$n$ 和操作数均不超过 $5\times 10^{5}$。

这就是上一章树状数组解决的问题。现在目标和输入不变，换成区间树来实现，便于看清两种结构维护信息的区别。

自拟输入：

```text
5 4
1 2 3 4 5
2 2 4
1 3 10
2 1 3
2 3 3
```

输出依次为 `9、16、13`，每项一行。第 3 项从 3 变为 13，叶子 $[3, 3]$、父区间 $[1, 3]$、根区间 $[1, 5]$ 的和分别增加 10。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 500000 + 5;
long long a[N], sum[N * 4];

void pushUp(int p) { sum[p] = sum[p * 2] + sum[p * 2 + 1]; }

void build(int p, int l, int r) {
    if (l == r) { sum[p] = a[l]; return; }
    int mid = (l + r) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
    pushUp(p);
}

void add(int p, int l, int r, int pos, long long value) {
    if (l == r) { sum[p] += value; return; }
    int mid = (l + r) / 2;
    if (pos <= mid) add(p * 2, l, mid, pos, value);
    else add(p * 2 + 1, mid + 1, r, pos, value);
    pushUp(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return sum[p];
    int mid = (l + r) / 2;
    long long answer = 0;
    if (ql <= mid) answer += query(p * 2, l, mid, ql, qr);
    if (qr > mid) answer += query(p * 2 + 1, mid + 1, r, ql, qr);
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (q--) {
        int op, x;
        long long value;
        cin >> op >> x;
        if (op == 1) {
            cin >> value;
            add(1, 1, n, x, value);
        } else {
            int r;
            cin >> r;
            cout << query(1, 1, n, x, r) << '\n';
        }
    }
    return 0;
}
```

修改函数的 `pushUp` 必须在孩子修改完成后执行，否则会用旧孩子信息算出旧答案。这与分治中“先解决子问题，再合并”的顺序相同。

### “加上 $\mathrm{value}$”和“变成 $\mathrm{value}$”要分清

本题是增量操作，叶子用 `sum[p] += value`。若题目改为单点赋值，只需在叶子写 `sum[p] = value`，其他区间结构和合并步骤不变。

维护区间最值时也一样，修改叶子后逐层取最小值或最大值。普通树状数组通过前缀和相减回答区间和；最值不能照搬“右前缀减左前缀”，线段树则可以直接合并查询得到的几个区间。

建树 $\mathcal{O}(n)$，每次修改与查询 $\mathcal{O}(\log  n)$，存储 $\mathcal{O}(n)$。数组长度为 $5\times 10^{5}$ 时，4n 个 `long long` 结点约 16 MB，加上原数组约 4 MB，先按题目内存限制估算容量。

## 练习：让函数名准确反映操作

先**独立重做 P3374 的线段树版本**，与上一章的树状数组版对拍。特别检查修改第 1、$n$ 项，以及同一位置连续增加负数。

### 推荐必做

1. [P2068 · 统计和](https://www.luogu.com.cn/problem/P2068)：初始全零，单点增加并查询区间和。练习从叶子回溯更新祖先，正确处理字符操作。
2. [P1198 · 最大数](https://www.luogu.com.cn/problem/P1198)：在序列末尾加入数并查询末尾若干项的最大值。把加入转换为单点赋值，注意新值与最近一次查询答案有关。

### 选做巩固

- [P2880 · Balanced Lineup](https://www.luogu.com.cn/problem/P2880)：查询区间最高和最低身高之差。结点维护最大值与最小值，对照区间和的合并。
- [P4513 · 小白逛公园](https://www.luogu.com.cn/problem/P4513)：支持单点赋值和区间非空最大子段和查询。思考区间合并需要哪些信息，再与本章后续的四字段讲解对照。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线段树 #206](https://www.luogu.com.cn/training/206)。

## 本节验收

能解释单点修改只走一条路径；能在返回时更新父结点；能区分增加与赋值；能把求和结构改成最值或带计数的信息维护。
