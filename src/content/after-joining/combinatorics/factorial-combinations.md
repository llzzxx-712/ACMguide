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

记 fac[i]=i! mod p，ifac[i]=(i!) 的逆元。先用费马小定理算 ifac[N]=fac[N]^(p−2) mod p。因为 i!=i·(i−1)!，两边取逆可得 ifac[i−1]=ifac[i]·i mod p。

于是先顺序算阶乘，再倒序算逆阶乘。查询 C(n,k) 时返回 fac[n]·ifac[k]·ifac[n−k] mod p。每次乘法后取模，避免把三个接近 p 的数直接相乘。

例如模 7 求 C(5,2)，5!余 1，2!逆元为 4，3!逆元为 6，因此答案余 1×4×6≡3，与 10 mod 7 一致。

> **先检查分母是否可逆**
>
> 本节要求 N<p，因此 1…N 都不是 p 的倍数，阶乘才有逆元。若 n≥p，fac[n] 可能为 0，不能继续套这个式子；应根据范围选择杨辉三角、Lucas 定理等方法。

## 例题精讲：自编 · 批量组合数查询

**题意简述：** 输入 q≤10⁵ 次查询，每次给 n、k，0≤n≤10⁶，k 可以在 −1…n+1 中。求 C(n,k) mod 10⁹+7，非法 k 返回 0。

输入：

```text
3
5 2
0 0
4 5
```

输出 `10`、`1`、`0`，各占一行。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;
const long long MOD = 1000000007;

long long power(long long a, long long b) {
    long long answer = 1;
    while (b > 0) {
        if (b & 1) answer = answer * a % MOD;
        a = a * a % MOD;
        b >>= 1;
    }
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int q, limit = 0;
    cin >> q;
    vector<pair<int, int>> queries(q);
    for (auto &query : queries) {
        cin >> query.first >> query.second;
        limit = max(limit, query.first);
    }
    vector<long long> fac(limit + 1, 1), ifac(limit + 1, 1);
    for (int i = 1; i <= limit; i++) fac[i] = fac[i - 1] * i % MOD;
    ifac[limit] = power(fac[limit], MOD - 2);
    for (int i = limit; i >= 1; i--) ifac[i - 1] = ifac[i] * i % MOD;
    for (auto query : queries) {
        int n = query.first, k = query.second;
        if (k < 0 || k > n) cout << 0 << '\n';
        else cout << fac[n] * ifac[k] % MOD * ifac[n - k] % MOD << '\n';
    }
    return 0;
}
```

0!=1，因此全是 n=0 的查询也能正确预处理。总时间 O(N+log p+q)，空间 O(N+q)。long long 的单次乘积小于 p²，约 10¹⁸，仍在范围内。

## 练习：同一个公式换一个问题外壳

先**独立重做例题**，对 n≤30 与杨辉三角的结果逐项比较，检查 k=0、k=n 和非法 k。

### 推荐必做

1. **自编 · 网格路径查询：** 多次给 r、c，r+c≤10⁶，求只向右、向下的路径数；先推导 C(r+c,r)，再调用查询函数。
2. **自编 · 不相邻选择：** 从 n 个位置选 k 个且互不相邻，推导 C(n−k+1,k)；练习先压缩必需的间隔。

### 选做巩固

- **自编 · 固定若干人：** n 人中已指定 t 人必须入选，总共选 k 人，求方案数；把固定选择从自由选择中剥离。
- **自编 · 一个障碍格：** 求经过或不经过指定格子的路径数，用两段路径相乘与补集计数。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[组合数学与计数 #217](https://www.luogu.com.cn/training/217)。

## 本节验收

能说明倒序求逆阶乘的来源；能在调用前判断分母是否可逆；能先把题意转成组合数，再选择计算方法。
