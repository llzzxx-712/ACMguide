---
title: 阶乘、逆元预处理与组合数取模
description: 把组合数的除法改写为乘逆元，用一次快速幂预处理全部阶乘逆元。
---

## 这一节学什么

杨辉三角适合规模较小或模数一般的情况。如果模数为大质数、n 很大、查询很多，我们可以预处理阶乘与阶乘逆元，让每次组合数只做几次乘法。

> **AI 伴学提示词**
>
> 为我讲解阶乘组合数怎样改成乘逆元，手推逆阶乘的倒序递推，并提醒我检查 n 与模数的关系，引导我提问。

## 为什么只需要一次快速幂

我们用两个数组，分别保存阶乘与阶乘的逆元。为了让公式更容易读，先约定两个记号：

- **阶乘**：$F_i=i!\bmod p$，对应代码中的 `fact[i]`。
- **逆阶乘**：$G_i=(i!)^{-1}\bmod p$，对应代码中的 `inverseFact[i]`。

先顺序算出全部阶乘，再用费马小定理求最后一项的逆元。因为 $i!=i\cdot(i-1)!$，还可以从这一项倒着求出前面的逆阶乘：

$$
\begin{aligned}
G_N&\equiv F_N^{\,p-2}\pmod p,\\[0.5em]
G_{i-1}&\equiv i\cdot G_i\pmod p.
\end{aligned}
$$

这样，只有求 $G_N$ 时需要一次快速幂，其余逆阶乘都只做一次乘法。

查询组合数 $\dbinom{n}{k}$ 时，把除以阶乘改成乘逆阶乘：

$$
\binom{n}{k}\equiv F_n\cdot G_k\cdot G_{n-k}\pmod p.
$$

每次乘法后取模，避免把三个接近 $p$ 的数直接相乘。

例如模 $7$ 求 $\dbinom{5}{2}$，先得到：

- $5!\bmod 7=1$；
- $(2!)^{-1}\bmod 7=4$；
- $(3!)^{-1}\bmod 7=6$。

代入后，答案为：

$$
\binom{5}{2}\equiv 1\cdot4\cdot6\equiv3\pmod7.
$$

这与直接计算 $10\bmod7=3$ 一致。

> **先检查分母是否可逆**
>
> 本节要求 $N<p$，因此 $1$ 到 $N$ 都不是 $p$ 的倍数，阶乘才有逆元。若 $n\ge p$，`fact[n]` 可能为 $0$，不能继续套这个式子；应根据范围选择杨辉三角、Lucas 定理等方法。

## 例题精讲：[P1313 计算系数](https://www.luogu.com.cn/problem/P1313)

**题意简述：** 求 $(ax+by)^k$ 展开后 $x^ny^m$ 的系数，对 $10007$ 取模。

输入 $a,b,k,n,m$，其中 $n+m=k$，$0\le k\le1000$，$a,b\le10^6$。输出对应系数。

自编输入：

```text
2 3 3 2 1
```

输出：

```text
36
```

### 先把思路讲清楚

$k$ 个括号中选 $n$ 个提供 $ax$，剩下 $m$ 个提供 $by$。选择位置有 $\dbinom{k}{n}$ 种，每种选法贡献 $a^nb^m$，所以我们要求的系数为：

$$
\binom{k}{n}\,a^nb^m.
$$

样例中有 $\dbinom{3}{2}=3$ 种选法，每种贡献 $2^2\cdot3=12$，所以答案为 $36$。

先顺序计算 `fact`，再用一次快速幂求 `fact[k]` 的逆元，倒着得到全部 `inverseFact`。由于 $m=k-n$，这道题中的组合数就是：

$$
\binom{k}{n}\equiv F_k\cdot G_n\cdot G_m\pmod{10007}.
$$

$10007$ 是质数，且 $k\le1000<10007$，因此这些阶乘的逆元存在。

公式落实成代码时，先计算组合数，再乘两个快速幂，每步取模。$k=0$ 时空乘积为 $1$，两个幂的指数也为 $0$，同一代码可直接处理。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;
const long long MOD = 10007;

long long power(long long a, int b) {
    a %= MOD;
    long long result = 1;
    while (b > 0) {
        if (b & 1) result = result * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return result;
}

int main() {
    long long a, b;
    int k, n, m;
    cin >> a >> b >> k >> n >> m;
    vector<long long> fact(k + 1, 1), inverseFact(k + 1, 1);
    for (int i = 1; i <= k; i++) fact[i] = fact[i - 1] * i % MOD;
    inverseFact[k] = power(fact[k], MOD - 2);
    for (int i = k; i >= 1; i--) inverseFact[i - 1] = inverseFact[i] * i % MOD;
    long long choose = fact[k] * inverseFact[n] % MOD * inverseFact[m] % MOD;
    cout << choose * power(a, n) % MOD * power(b, m) % MOD << '\n';
    return 0;
}
```

预处理 $\mathcal{O}(k)$，快速幂 $\mathcal{O}(\log  \mathrm{MOD}+\log  k)$，空间 $\mathcal{O}(k)$。组合数公式的条件要与原题的模数、范围一起核对。

## 练习：同一个公式换一个问题外壳

先**独立重做例题**，用杨辉三角核对 $\dbinom{k}{n}$，再乘 $a^nb^m$，检查 $k=0$、$n=0$、$m=0$。

### 推荐必做

1. [CF300C Beautiful Numbers](https://codeforces.com/problemset/problem/300/C)：长度 $n$ 的数只由 $a,b$ 两个非零数字组成，且数位和也只能含 $a,b$，统计方案数。枚举 $a$ 出现的个数，检查数位和，再累计 $\dbinom{n}{k}$；$n\le10^6$，练习阶乘与逆阶乘预处理。

### 选做巩固

- [P4071 排列计数](https://www.luogu.com.cn/problem/P4071)：多次询问恰有 $m$ 个位置不变的排列数，对 $10^9+7$ 取模。练习组合数预处理，并结合后面将讲的错排递推计算剩余排列。
- [P5505 分特产](https://www.luogu.com.cn/problem/P5505)：多种特产分给同学，每人至少得到一件，统计方案数并取模。练习隔板法与容斥中的组合数计算。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[组合数学与计数 #217](https://www.luogu.com.cn/training/217)。

## 本节验收

能说明倒序求逆阶乘的来源；能在调用前判断分母是否可逆；能先把题意转成组合数，再选择计算方法。
