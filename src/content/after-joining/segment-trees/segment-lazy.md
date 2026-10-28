---
title: 区间修改与懒标记
description: 完整覆盖一个结点时，先更新区间答案并记下未传给孩子的操作，只有继续向下时才下传。
---

## 这一节学什么

把 [l,r] 中的每个数加 k，若逐个修改叶子，就可能要做 O(n log n) 次工作。线段树已经保存了整个区间的和，整段加 k 时只需“元素个数×k”就能算出新和。问题变成：孩子还没改，下一次查到孩子时怎么办？

> **AI 伴学提示词**
>
> 为我讲解线段树的区间加法和懒标记，手算整段加 10 后再查询一个位置，区分当前区间已更新的信息与尚未传给孩子的操作，并引导我提问。

## 懒的是下传，当前结点的答案必须马上更新

当前结点负责 [l,r]，每项都增加 k，则区间和增加 k×(r−l+1)。先修改 sum[p]，再记 lazy[p]+=k，含义是：**这段加法已经算入 sum[p]，但还没有传给它的孩子。**

lazy 不是“这个结点还没执行的加法”，更不是需要查询时再加到 sum 上的另一份答案。若整段查询直接返回 sum[p] 即可，不能再加一次 lazy×长度。

把“改变当前答案，并登记给孩子的任务”封装为 apply；将父亲登记的任务交给两个孩子，称为 pushDown；孩子变化后重新合并父亲，仍是 pushUp。

## 例题精讲：P3372 · 线段树 1

**原题：** [P3372 · 线段树 1](https://www.luogu.com.cn/problem/P3372)。

**题意简述：** 操作 1 l r k 给闭区间每项加 k；操作 2 l r 查询区间和。n、操作数≤10⁵，初始值和 k 为正数，任意时刻总和≤2×10¹⁸，使用 long long。

自拟输入：

```text
4 5
1 2 3 4
1 1 4 10
2 2 2
1 2 3 5
2 1 4
2 3 4
```

输出：

```text
12
60
32
```

### 手动追踪第一次修改与查询

初始根 sum=10。整段 [1,4] 加 10，只把根改成 sum=50、lazy=10；孩子仍保存原值。

接着查询第 2 项，必须走向孩子，于是根把加 10 传下去：左区间 [1,2] 的和由 3 变 23，右区间 [3,4] 的和由 7 变 27，两个孩子各登记 lazy=10，根的 lazy 清为 0。继续进入左孩子时再下传，叶子 [2,2] 得到 12。

这里孩子不是“算错了”，它们只是在等待父结点登记的操作传来。因此下去之前要先 pushDown。

### 修改与查询的顺序

```text
区间修改：整段覆盖 → apply 后返回
          部分覆盖 → pushDown → 递归有关孩子 → pushUp

区间查询：整段覆盖 → 返回 sum
          部分覆盖 → pushDown → 递归有关孩子 → 合并查询结果
```

查询不改变原数组；pushDown 只是改变同一份信息在树上的保存位置，不改变父区间总和，因此查询下传后不用重新 pushUp。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 100000 + 5;
long long a[N], sum[N * 4], lazy[N * 4];

void pushUp(int p) { sum[p] = sum[p * 2] + sum[p * 2 + 1]; }

void apply(int p, int l, int r, long long value) {
    sum[p] += value * (r - l + 1);
    lazy[p] += value;
}

void pushDown(int p, int l, int r) {
    if (lazy[p] == 0) return;
    int mid = (l + r) / 2;
    apply(p * 2, l, mid, lazy[p]);
    apply(p * 2 + 1, mid + 1, r, lazy[p]);
    lazy[p] = 0;
}

void build(int p, int l, int r) {
    if (l == r) { sum[p] = a[l]; return; }
    int mid = (l + r) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
    pushUp(p);
}

void add(int p, int l, int r, int ql, int qr, long long value) {
    if (ql <= l && r <= qr) { apply(p, l, r, value); return; }
    pushDown(p, l, r);
    int mid = (l + r) / 2;
    if (ql <= mid) add(p * 2, l, mid, ql, qr, value);
    if (qr > mid) add(p * 2 + 1, mid + 1, r, ql, qr, value);
    pushUp(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return sum[p];
    pushDown(p, l, r);
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
        int op, l, r;
        cin >> op >> l >> r;
        if (op == 1) {
            long long value;
            cin >> value;
            add(1, 1, n, l, r, value);
        } else cout << query(1, 1, n, l, r) << '\n';
    }
    return 0;
}
```

> **下传后清空父标记，部分修改后重新合并。**
>
> 不清空 lazy，之后会把同一操作传两次；不在部分修改后 pushUp，父结点还会保留旧和。完整覆盖分支应直接返回，不必再往叶子走。

只有部分覆盖才会执行 pushDown；一个单点叶子只要与合法目标相交就已被完整覆盖，因此不会再被拆成两个孩子。

一次区间加或查询都只沿区间边界拆分，O(log n)，建树 O(n)，空间 O(n)。懒标记把大量逐点操作合并成少量整段操作，它需要能用“当前信息和操作”直接求出新信息。

## 练习：纸上同时记录 sum 与 lazy

先**独立重做 P3372**，在长度 4 的树上依次模拟整段加、子段加、单点查询，检查父子标记在哪一步转移。

### 推荐必做

1. [P3870 · 开关](https://www.luogu.com.cn/problem/P3870)：区间翻转开关并查询亮灯数量。区间长度为 len、亮灯数为 count 时，翻转后是 len−count，标记用异或合成，两次翻转抵消。
2. [P2357 · 守墓人](https://www.luogu.com.cn/problem/P2357)：支持区间加、第一项增减及区间和查询。把第一项增减当作单点区间修改，用懒标记维护其余操作。

### 选做巩固

- [P1438 · 无聊的数列](https://www.luogu.com.cn/problem/P1438)：给区间依次加上等差数列，并查询单点值。用差分转化修改，练习将操作拆成区间与端点变化。
- [P1471 · 方差](https://www.luogu.com.cn/problem/P1471)：对实数区间加值，查询平均数与方差。推导平方和在整段加值后的变化，并用 printf 按题意输出四位小数。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线段树 #206](https://www.luogu.com.cn/training/206)。

## 本节验收

能准确说明 lazy 的含义；能区分 apply、pushDown、pushUp；能手算父结点已更新而孩子待更新的状态；能根据查询信息推导整段操作怎样改变答案。
