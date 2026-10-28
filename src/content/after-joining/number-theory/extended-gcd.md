---
title: 裴蜀定理、扩展欧几里得与线性同余方程
description: 从整数配比问题出发，沿欧几里得算法反向找出系数，再判断方程何时有整数解。
---

## 这一节学什么

最大公约数只能告诉我们两个数共同包含多大的单位；扩展欧几里得还会找出“怎样把它们凑成这个单位”。这让我们能解 $ax+by=c$，也能把模方程转成整数方程。

> **AI 伴学提示词**
>
> 为我用手算讲解裴蜀定理和扩展欧几里得，解释递归返回时系数怎样变化，并引导我对不理解的步骤提问。

## 从 30 和 18 开始倒推

欧几里得算法依次得到 $30=1\times 18+12$、$18=1\times 12+6$。倒过来代入：

```text
6 = 18 - 12
  = 18 - (30 - 18)
  = -1 × 30 + 2 × 18
```

于是 $30x+18y=6$ 有解 $x=-1$、$y=2$。右边换成 12，两边乘 2 即可；换成 7 就不可能，因为左边一定是 6 的倍数。

裴蜀定理说明：设 `g = gcd(a, b)`，$ax+by=c$ 有整数解当且仅当 $g$ 整除 $c$。若 $x_0$、$y_0$ 是一组解，全部解为 $x=x_0+tb/g$、$y=y_0-ta/g$，其中 $t$ 为任意整数。请代回原式，观察新增的两项怎样抵消。

## 递归代码对应哪一步

递归先求 $bu+(a\bmod b)v=g$，再用 $a\bmod b=a-\lfloor a/b\rfloor b$ 展开，得到 $av+b(u-\lfloor a/b\rfloor v)=g$。因此本层的 $x=v$、$y=u-\lfloor a/b\rfloor v$。到 $b=0$ 时，$a\times 1+0\times 0=a$ 就是起点。

## 例题精讲：[P1082 同余方程](https://www.luogu.com.cn/problem/P1082)

**题意简述：** 给 $a$、$b$，求 $ax\equiv1\pmod b$ 的最小正整数解，保证有解。$2\le a,b\le 2\times 10^{9}$；输入 $a$、$b$，输出 $x$。

自编输入：

```text
3 10
```

输出：

```text
7
```

### 先把思路讲清楚

同余式表示 $ax-1$ 是 $b$ 的倍数，等价于 `ax + by = 1`。保证有解说明 `gcd(a, b) = 1`，扩展欧几里得就能找到一组整数系数。

对 `3、10`，$3\times(-3)+10\times1=1$，所以一个 $x$ 是 −3；所有解每隔 $b=10$ 出现一次，规范到 $[0,b-1]$ 得 7，验证 $3\times7\bmod10=1$。因为 $b\ge 2$，这个余数不可能为 0，也就是最小正整数解。

递归先求 $bu+(a\bmod b)v=g$，再用 $a\bmod b=a-\lfloor a/b\rfloor b$ 展开，得到 $x=v$、$y=u-\lfloor a/b\rfloor v$。代码的回代来自这条等式。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) {
        x = 1;
        y = 0;
        return a;
    }
    long long u, v;
    long long g = exgcd(b, a % b, u, v);
    x = v;
    y = u - (a / b) * v;
    return g;
}

int main() {
    long long a, b, x, y;
    cin >> a >> b;
    exgcd(a, b, x, y);
    cout << (x % b + b) % b << '\n';
    return 0;
}
```

时间、递归空间 $\mathcal{O}(\log\min(a,b))$。输入能放进 `int`，但回代和乘法使用 `long long`。C++ 的负数余数可能为负，所以最后用 `(x % b + b) % b`。

## 练习：先把等式代回去

先**独立重做例题**，手算 $7x\equiv1\pmod5$ 与 $3x\equiv1\pmod{10}$，将输出代回验证，并检查它是否已规范为最小正解。

### 推荐必做

1. [P4549 裴蜀定理](https://www.luogu.com.cn/problem/P4549)：给定整数序列，求整数线性组合能得到的最小正值。练习把两个数的结论推广到多个数，并处理负数。

### 选做巩固

- [P3951 小凯的疑惑](https://www.luogu.com.cn/problem/P3951)：给两种互质的正整数面值，求不能恰好支付的最大金额。练习研究非负整数配比和同余关系。
- [P1495 曹冲养猪](https://www.luogu.com.cn/problem/P1495)：合并互质模数的同余条件，求最小自然数解。练习用扩展欧几里得求合并时的逆元。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[数论 #216](https://www.luogu.com.cn/training/216)。

## 本节验收

能说明整除条件从哪里来；能手推系数变换；能从一组解写出全部整数解，并把同余方程转成这一模型。
