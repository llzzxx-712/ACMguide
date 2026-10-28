---
title: 加法、乘法、赋值与多种信息维护
description: 将区间操作看成函数，按先旧后新的顺序合成标记，并根据查询需求设计结点信息。
---

## 这一节学什么

上一节只有加法，先加 2 再加 3 可以合成加 5。操作变成“加、乘、赋值”后，先后顺序会影响结果。我们要把标记表示的变换写成式子，而不是凭印象决定下传顺序。

> **AI 伴学提示词**
>
> 为我讲解线段树多种懒标记的合成，用先加后乘、先乘后加和赋为 0 的例子推导公式，再讲结点维护多个字段的合并，并引导我提问。

## 把操作写成 $x\to x\times\mathrm{mul}+\mathrm{add}$

区间中的每个元素都接受同一种变换：

| 操作 | $\mathrm{mul}$ | $\mathrm{add}$ |
| --- | --- | --- |
| 不改变 | 1 | 0 |
| 加 $v$ | 1 | $v$ |
| 乘 $v$ | $v$ | 0 |
| 赋为 $v$ | 0 | $v$ |

原区间和是 $\mathrm{sum}$，长度为 $\mathrm{len}$，变换后就变成 $\mathrm{sum}\times\mathrm{mul}+\mathrm{len}\times\mathrm{add}$。赋值也能放进这个表达式，因为旧值乘 0 后全部消失。

注意：只有区间和等信息可以这样直接更新。不能看到区间操作就默认任意统计量都能放入同一套标记。

## 合成时，新的操作作用在旧结果上

孩子已有标记 $x\to xM+A$，现在父亲下传一个更新的操作 $x\to xm+a$。真正顺序是：

```text
先旧操作：xM+A
再新操作：(xM+A)m+a = x(Mm)+(Am+a)

新的 mul = 旧 mul × m
新的 add = 旧 add × m + a
```

例如先加 2 再乘 3，结果为 $3x+6$，标记是 $(3,6)$；先乘 3 再加 2，结果是 $3x+2$，标记是 $(3,2)$。这两种顺序不能混淆。

为什么父亲下传的是较新的操作？若此前需要走到孩子，就已先把父亲的旧标记传下去了。之后又整段修改父亲而暂不下传，这个留在父亲上的操作就发生在孩子现有标记之后。

## 例题精讲：P3373 · 线段树 2

**原题：** [P3373 · 线段树 2](https://www.luogu.com.cn/problem/P3373)。

**题意简述：** 输入 $n$、$q$、模数 $\mathrm{mod}$；操作 `1 l r k` 将区间乘 $k$，操作 `2 l r k` 将区间加 $k$，操作 `3 l r` 查询区间和对 $\mathrm{mod}$ 的余数。$n,q\le 10^{5}$，初值与 $k\le 10^{4}$；原题除样例外 `mod = 571373`。

自拟输入：

```text
3 5 100
1 2 3
2 1 3 2
1 1 3 3
3 2 2
2 2 3 1
3 1 3
```

输出：

```text
12
38
```

前三项先加 2 再乘 3，得到 `9 12 15`。根的标记合成为 $(3,6)$；查询第 2 项时才传给孩子，得到 12。最后两项各加 1，整个数组变成 `9 13 16`，和为 38。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 100000 + 5;
long long a[N], sum[N * 4], mul[N * 4], inc[N * 4], mod;

void pushUp(int p) { sum[p] = (sum[p * 2] + sum[p * 2 + 1]) % mod; }

void apply(int p, int l, int r, long long m, long long value) {
    sum[p] = (sum[p] * m + value * (r - l + 1)) % mod;
    mul[p] = mul[p] * m % mod;
    inc[p] = (inc[p] * m + value) % mod;
}

void pushDown(int p, int l, int r) {
    if (mul[p] == 1 && inc[p] == 0) return;
    int mid = (l + r) / 2;
    apply(p * 2, l, mid, mul[p], inc[p]);
    apply(p * 2 + 1, mid + 1, r, mul[p], inc[p]);
    mul[p] = 1;
    inc[p] = 0;
}

void build(int p, int l, int r) {
    mul[p] = 1;
    if (l == r) { sum[p] = a[l] % mod; return; }
    int mid = (l + r) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
    pushUp(p);
}

void update(int p, int l, int r, int ql, int qr, long long m, long long value) {
    if (ql <= l && r <= qr) { apply(p, l, r, m, value); return; }
    pushDown(p, l, r);
    int mid = (l + r) / 2;
    if (ql <= mid) update(p * 2, l, mid, ql, qr, m, value);
    if (qr > mid) update(p * 2 + 1, mid + 1, r, ql, qr, m, value);
    pushUp(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return sum[p];
    pushDown(p, l, r);
    int mid = (l + r) / 2;
    long long answer = 0;
    if (ql <= mid) answer += query(p * 2, l, mid, ql, qr);
    if (qr > mid) answer += query(p * 2 + 1, mid + 1, r, ql, qr);
    return answer % mod;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, q;
    cin >> n >> q >> mod;
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    while (q--) {
        int op, l, r;
        cin >> op >> l >> r;
        if (op == 3) cout << query(1, 1, n, l, r) << '\n';
        else {
            long long value;
            cin >> value;
            value %= mod;
            if (op == 1) update(1, 1, n, l, r, value, 0);
            else update(1, 1, n, l, r, 1, value);
        }
    }
    return 0;
}
```

$\mathrm{mul}$ 的初值和清空值必须为 1，$\mathrm{inc}$ 为 0。直接将整个标记数组初始化为 0，会把“没有操作”变成“乘 0”。每次 apply 同时改变当前 $\mathrm{sum}$ 与要传给孩子的变换。

本题模数下，两个模内值的乘积可以放在 `long long` 中；取模之前的乘法也必须使用足够宽的类型，不能认为“最终取模就不会溢出”。建树 $\mathcal{O}(n)$，单次操作 $\mathcal{O}(\log  n)$，空间 $\mathcal{O}(n)$。

## 赋值：旧历史全部被覆盖

在上面的区间和结构里，给 $[l, r]$ 赋为 $v$，可调用 `update(1, 1, n, l, r, 0, v % mod)`，因为 $x\times 0+v=v$。原题 P3373 没有这条输入操作，扩展练习时再增加对应分支。

例如旧标记是 $(3,6)$，随后赋为 0，合成结果是 $(0,0)$，不是没有标记的 $(1,0)$。再加 5，结果是 $(0,5)$，再乘 2，得到 $(0,10)$，正确表示这段元素最终都变成 10。

若改为同时维护区间最大值，如 [P1253 · 扶苏的问题](https://www.luogu.com.cn/problem/P1253) 的“区间赋值、区间加法、区间最大值”，也可直接设计 `set`、$\mathrm{add}$ 两类标记：

- `applySet(v)`：最大值变成 $v$，登记 `set = v`、`hasSet = true`，并清掉旧 $\mathrm{add}$。
- `applyAdd(v)`：最大值增加 $v$，$\mathrm{add}$ 累加 $v$。
- 下传时先把 `set` 传给孩子，再传 $\mathrm{add}$，最后清空父亲的 $\mathrm{hasSet}$ 与 $\mathrm{add}$。

这里 $\mathrm{hasSet}$ 区分“没有赋值”和“赋为 0”。赋值覆盖旧历史，加法作用在赋值后的结果上；按这个含义写代码，比记忆“哪个标记先传”更可靠。

## 一个结点可以同时保存多个字段

若查询区间内**非空最大子段和**，只保存区间和不够。单点修改后，希望用两个孩子合并出答案，就要保存：

| 字段 | 含义 |
| --- | --- |
| $\mathrm{sum}$ | 整段和 |
| pref | 从左端开始的非空最大前缀和 |
| suff | 到右端结束的非空最大后缀和 |
| best | 任意非空连续子段的最大和 |

左、右孩子记为 $L$、$R$，则：

```text
sum  = L.sum + R.sum
pref = max(L.pref, L.sum + R.pref)
suff = max(R.suff, R.sum + L.suff)
best = max(L.best, R.best, L.suff + R.pref)
```

best 对应三种情况：完全在左边、完全在右边、横跨中点。叶子四项都等于原值，因此全负数组仍选其中最大的一项，不会错误选择空区间 0。

这种合并有顺序：左右颠倒会改变前后缀。查询分到两边时，也要按原数组的左右顺序合并。以上四项足以支持单点赋值后的区间查询；它们不能直接套上本节的区间加法懒标记，因为加法对最优子段的影响还与子段长度有关。

## 练习：先写标记的函数，再推合成

先**独立重做 P3373**，重点测试整段先加后乘、先乘后加，以及有整段标记时马上修改单点的情况。

### 推荐必做

1. [P1253 · 扶苏的问题](https://www.luogu.com.cn/problem/P1253)：区间赋值、加法、最大值查询。照上面的含义设计两个标记与 $\mathrm{hasSet}$，测试赋为 0、赋为负数、赋值后继续加；原题 $n$、$q$ 可达 $10^{6}$，提前估算数组内存并关闭 `cin` 同步。
2. [P4513 · 小白逛公园](https://www.luogu.com.cn/problem/P4513)：单点赋值、区间非空最大子段和。实现四字段合并，查询端点可能倒置时先交换，练习按需求设计结点信息。

### 选做巩固

- [P2572 · 序列操作](https://www.luogu.com.cn/problem/P2572)：支持 01 序列区间赋值、翻转，查询 1 的数量及最长连续 1 的长度。设计覆盖与翻转的标记合成，并维护前缀、后缀与区间最优长度。
- [P1471 · 方差](https://www.luogu.com.cn/problem/P1471)：区间加值，查询平均数与方差。结点维护和与平方和，推导加法作用后两个字段的更新顺序。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线段树 #206](https://www.luogu.com.cn/training/206)。

## 本节验收

能从“先旧后新”推导 $\mathrm{mul}$、$\mathrm{add}$ 合成；能解释赋为 0 与无操作的区别；能根据维护信息决定整段操作是否可直接计算；能用分类讨论设计多字段合并。
