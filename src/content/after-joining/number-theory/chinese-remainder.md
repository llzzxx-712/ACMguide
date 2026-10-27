---
title: 中国剩余定理 CRT
description: 把多个余数要求逐个合并，理解互质 CRT 与不互质时的相容条件。
---

## 这一节学什么

“除以 3 余 2，除以 5 余 3”描述的是同一个整数受到多个周期约束。我们不必从 0 开始试数，可以把两个约束合成一个新的余数和周期，再继续合并。

> **AI 伴学提示词**
>
> 为我从列举余数序列开始讲解 CRT，再用扩展欧几里得推导两个同余式的合并过程，并引导我提问。

## 把已有答案写成一个等差数列

已知 x≡R (mod M)，就有 x=R+M·t。再要求 x≡r (mod m)，代入后得到 M·t≡r−R (mod m)。这正是上一节的线性同余方程。

设 g=gcd(M,m)：

1. 如果 g 不整除 r−R，两组周期不相容，无解。
2. 否则求 M·u+m·v=g，把 u 乘 (r−R)/g，可得 t 的一个解；把它规范到模 m/g 的范围。
3. 新周期是 lcm(M,m)=M·(m/g)，新余数是 (R+M·t) 对新周期取模。

当模数两两互质时，g 总是 1，这就是常见的 CRT。扩展合并则允许不互质，也会正确识别矛盾。

## 例题精讲：自编 · 逐条合并日程

**题意简述：** 输入 n≤30 条同余条件，每条为 m、r，表示 x mod m=r。1≤m≤10⁹，0≤r<m，保证所有模数的最小公倍数≤10¹⁸。输出最小非负解；无解输出 `NO`。

输入：

```text
2
3 2
5 3
```

输出 `8`。已有 x=2+3t，代入模 5 的要求得 3t≡1；3 的逆元为 2，所以 t=2，x=8，后续解每隔 15 出现一次。

再看模 4 余 1、模 6 余 2：差为 1，而 gcd(4,6)=2，无解。这一步应发生在除以 g 之前。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

long long exgcd(long long a, long long b, long long &x, long long &y) {
    if (b == 0) { x = 1; y = 0; return a; }
    long long u, v;
    long long g = exgcd(b, a % b, u, v);
    x = v;
    y = u - a / b * v;
    return g;
}

long long normalize(long long x, long long mod) {
    return (x % mod + mod) % mod;
}

int main() {
    int n;
    cin >> n;
    long long R = 0, M = 1;
    for (int i = 0; i < n; i++) {
        long long m, r, u, v;
        cin >> m >> r;
        long long g = exgcd(M, m, u, v);
        long long difference = r - R;
        if (difference % g != 0) { cout << "NO\n"; return 0; }
        long long q = m / g;
        long long t = normalize(difference / g, q) * normalize(u, q) % q;
        long long nextM = M * q;
        R = (R + M * t) % nextM;
        M = nextM;
    }
    cout << R << '\n';
    return 0;
}
```

从 R=0、M=1 开始，表示最初所有整数都允许。q=1 时两个规范化因子都为 0，合并仍然有效。

本例单个 m≤10⁹，因此两个先取模的因子乘积<10¹⁸；又因为 t<q，R+M·t<2·nextM≤2×10¹⁸，均在 long long 约 9.22×10¹⁸ 的范围内。**不要把乘法移到取模之前，也不要删掉题目对周期的上界。** 每次合并用一次欧几里得算法，总时间 O(n log B)，B 为合并过程中最大的整数，额外空间 O(log B)。

## 练习：先列出两个周期

先**独立重做例题**，列出 0…29 中满足每个条件的数，检查合并后的余数和周期。

### 推荐必做

1. **自编 · 不互质但相容：** 合并模 4 余 1、模 6 余 3，求最小解与新周期；练习先除以 gcd 再求 t。
2. **自编 · 矛盾与重复：** 测试重复条件、相同模数不同余数、模数为 1，说明每种情况对应哪一步判断。

### 选做巩固

- **自编 · 三个时钟：** 随机选一个 x，再构造三个余数，检查结果是否与 x 相差新周期的整数倍。
- **自编 · 指定区间内的解：** 合并后统计 [L,U] 中有多少个解，把问题转回等差数列计数。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[数论 #216](https://www.luogu.com.cn/training/216)。

## 本节验收

能从 x=R+Mt 推导合并式；能判断不互质条件是否相容；能同时跟踪余数、周期和中间乘法的范围。
