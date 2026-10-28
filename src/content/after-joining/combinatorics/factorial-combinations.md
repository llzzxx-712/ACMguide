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

记 $\operatorname{fac}_i=i!\bmod p$，$\operatorname{ifac}_i=(i!)^{-1}\bmod p$，分别对应代码中的 `fac[i]` 与 `ifac[i]`。先用费马小定理计算最后一项，再由 $i!=i(i-1)!$ 倒着递推：

$
\begin{aligned}
\operatorname{ifac}_N&=\operatorname{fac}_N^{\,p-2}\bmod p,\\
\operatorname{ifac}_{i-1}&=\operatorname{ifac}_i\cdot i\bmod p.
\end{aligned}
$

于是先顺序算阶乘，再倒序算逆阶乘。查询 $\binom nk$ 时，计算 $\operatorname{fac}_n\operatorname{ifac}_k\operatorname{ifac}_{n-k}\bmod p$。每次乘法后取模，避免把三个接近 p 的数直接相乘。

例如模 7 求 $\binom52$，5!余 1，2!逆元为 4，3!逆元为 6，因此答案余 1×4×6≡3，与 10 mod 7 一致。

> **先检查分母是否可逆**
>
> 本节要求 N<p，因此 1…N 都不是 p 的倍数，阶乘才有逆元。若 n≥p，`fac[n]` 可能为 0，不能继续套这个式子；应根据范围选择杨辉三角、Lucas 定理等方法。

## 例题精讲：[P1313 计算系数](https://www.luogu.com.cn/problem/P1313)

**题意简述：** 求 (ax+by)ᵏ 展开后 xⁿyᵐ 的系数，对 10007 取模。输入 a、b、k、n、m，`n + m = k`，0≤k≤1000，a、b≤10⁶。输出系数。

自编输入：

```text
2 3 3 2 1
```

输出：

```text
36
```

### 先把思路讲清楚

k 个括号中选 n 个提供 ax，剩下 m 个提供 by，选择位置有 $\binom{k}{n}$ 种，每种贡献 aⁿbᵐ，因此答案是 $\binom kn a^n b^m$。样例为 3×4×3=36。

先预处理 `fact[i] = i`!，再用一次快速幂求 `fact[k]` 的逆元，倒着得到全部逆阶乘。于是 $\binom kn=k!\,(n!)^{-1}(m!)^{-1}$。10007 是质数，且 k≤1000<10007，阶乘不会变成模意义下的 0，逆元存在。

公式落实成代码时，先计算组合数，再乘两个快速幂，每步取模。k=0 时空乘积为 1，两个幂的指数也为 0，同一代码可直接处理。

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

先**独立重做例题**，用杨辉三角核对 $\binom{k}{n}$，再乘 aⁿbᵐ，检查 k=0、n=0、m=0。

### 推荐必做

1. [CF300C Beautiful Numbers](https://codeforces.com/problemset/problem/300/C)：长度 n 的数只由 a、b 两个非零数字组成，且数位和也只能含 a、b，统计方案数。枚举 a 出现的个数，检查数位和，再累计 $\binom nk$；n≤10⁶，练习阶乘与逆阶乘预处理。

### 选做巩固

- [P4071 排列计数](https://www.luogu.com.cn/problem/P4071)：多次询问恰有 m 个位置不变的排列数，对 10⁹+7 取模。练习组合数预处理，并结合后面将讲的错排递推计算剩余排列。
- [P5505 分特产](https://www.luogu.com.cn/problem/P5505)：多种特产分给同学，每人至少得到一件，统计方案数并取模。练习隔板法与容斥中的组合数计算。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[组合数学与计数 #217](https://www.luogu.com.cn/training/217)。

## 本节验收

能说明倒序求逆阶乘的来源；能在调用前判断分母是否可逆；能先把题意转成组合数，再选择计算方法。
