---
title: 模意义下的逆元与除法
description: 区分普通除法和模除法，分别用扩展欧几里得、快速幂和线性递推求逆元。
---

## 这一节学什么

模运算可以直接做加、减、乘，但不能直接把整数除法搬过来。例如 6/2=3，先模 5 再做整数除法却得到 1/2=0。逆元让“除以 a”变成“乘以一个能抵消 a 的数”。

> **AI 伴学提示词**
>
> 为我讲解逆元为什么能代替模意义下的除法，用小模数验证它的存在条件，再引导我推导线性求逆元公式并提问。

## 什么时候能抵消一个数

如果 $ax\equiv1\pmod m$，就称 x 为 a 的逆元。因为 $abx\equiv b\pmod m$，乘上 x 等于撤销乘 a。上一节已经证明，这样的 x 存在当且仅当 $\gcd(a,m)=1$。

模 7 下，$3\times5\equiv1\pmod7$，所以除以 3 可以乘 5。模 6 下，2 的倍数永远不会余 1，所以 2 没有逆元；不能只因为写出了分数就默认它可计算。

三种常用方式：

| 情况 | 计算方法 | 条件 |
| --- | --- | --- |
| 单个逆元，模数一般 | 扩展欧几里得解 `ax + my = 1` | $\gcd(a,m)=1$ |
| 单个逆元，模数为质数 p | 快速幂 a^(p−2) mod p | a 不被 p 整除 |
| 求 1 到 n 的所有逆元 | 线性递推 | p 为质数，n<p |

第二种来自费马小定理 $a^{p-1}\equiv1\pmod p$。它的指数不能随意用于合数模数。

## 线性公式怎样得到

令 $p=qi+r$。模 p 下 $qi+r\equiv0\pmod p$，两边乘 i 和 r 的逆元，得到 $\operatorname{inv}_i\equiv-q\operatorname{inv}_r\pmod p$。当 1<i<p 且 p 为质数时，0<r<i，所需的 `inv[r]` 已算好。

以 p=7、i=3 为例，q=2、r=1，$\operatorname{inv}_3\equiv-2\times1\equiv5\pmod7$。代码把负号写成 p−q，再取模。

## 例题精讲：[P3811 模意义下的乘法逆元](https://www.luogu.com.cn/problem/P3811)

**题意简述：** 输入 n、质数 p，求 1…n 在模 p 下的逆元，每行一个。原题 n≤3×10⁶，n<p<20000528。

输入：

```text
3 7
```

输出：

```text
1
4
5
```

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, p;
    cin >> n >> p;
    vector<int> inv(n + 1);
    inv[1] = 1;
    for (int i = 2; i <= n; i++) {
        inv[i] = 1LL * (p - p / i) * inv[p % i] % p;
    }
    for (int i = 1; i <= n; i++) cout << inv[i] << '\n';
    return 0;
}
```

每项只依赖更小的下标，复杂度 $\mathcal{O}(n)$，空间 $\mathcal{O}(n)$。乘积可能超出 `int`，`1LL` 让乘法先按 `long long` 进行；只在最后赋值时缩回已取模的范围。大量输出用 `\n`，避免 `endl` 逐行刷新。

## 练习：先验证“乘回去等于 1”

先**独立重做例题**，把每个 i×`inv[i]` 对 p 取模，与 1 比较。

### 推荐必做

1. [P1082 同余方程](https://www.luogu.com.cn/problem/P1082)：求 ax≡1 (mod b) 的最小正整数解。练习用扩展欧几里得求逆元。
2. [P2613 有理数取余](https://www.luogu.com.cn/problem/P2613)：求有理数 a/b 在模 19260817 下的值，无解时按题目要求输出。练习逐位读入并取模，再判断分母是否可逆。

### 选做巩固

- [P5431 模意义下的乘法逆元 2](https://www.luogu.com.cn/problem/P5431)：给定一批非零数，求逆元加权和。练习前后缀乘积与一次求逆，注意大输入的读入效率。
- [P1313 计算系数](https://www.luogu.com.cn/problem/P1313)：求二项式展开中特定项的系数并对 10007 取模。练习组合数与快速幂结合；也可用杨辉三角计算组合数。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[数论 #216](https://www.luogu.com.cn/training/216)。

## 本节验收

能解释模意义下为什么不能直接做整数除法；能先判断逆元是否存在，再根据模数和查询数量选择算法。
