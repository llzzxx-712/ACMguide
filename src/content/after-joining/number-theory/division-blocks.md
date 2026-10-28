---
title: 整除分块与数论综合应用
description: 把商相同的一段下标一起计算，用数学性质减少真正需要枚举的次数。
---

## 这一节学什么

有些求和式写着 n 项，真正不同的值却只有约 √n 种。整除分块利用 floor(n/i) 在连续区间里保持不变，把逐项加法换成整段贡献。

> **AI 伴学提示词**
>
> 为我列出 floor(n/i) 的变化，推导相同商的右端点，再说明整除分块怎样与前缀和配合，并引导我提问。

## 商不变的一段有多长

固定左端点 l，令 q=floor(n/l)。当 floor(n/i)=q 时，有 i≤floor(n/q)。所以这一段最远到 r=floor(n/q)，下一个尚未处理的位置直接是 r+1。

n=10 时：

| 下标区间 | 商 | 这段贡献 |
| --- | --- | --- |
| [1,1] | 10 | 10 |
| [2,2] | 5 | 5 |
| [3,3] | 3 | 3 |
| [4,5] | 2 | 4 |
| [6,10] | 1 | 5 |

这里只计算五段，合计 27。代码里的 l、r、q 正是表格中的三列，不需要逐个访问 6、7、8、9、10。

## 例题精讲：[P3935 Calculating](https://www.luogu.com.cn/problem/P3935)

**题意简述：** 设 x 的质因数分解为 ∏pᵢ^kᵢ，f(x)=∏(kᵢ+1)，输入 l、r，求 Σ(x=l…r)f(x)，对 998244353 取模。端点用 long long 保存。

自编输入：

```text
1 5
```

输出：

```text
10
```

### 先把思路讲清楚

f(x) 就是约数个数：对每个质因子独立选指数 0…kᵢ，乘起来得到所有约数。因此本题求区间约数个数总和。

设 F(n)=Σ(x=1…n)f(x)。换一个枚举方向：固定约数 d，它会贡献给 d、2d、3d…，共有 floor(n/d) 次，故 F(n)=Σ(d=1…n)floor(n/d)。答案就是 F(r)−F(l−1)。

样例 1…5 的约数个数为 1、2、2、3、2，合计 10。prefix 按上面的表格跳过商不变的整段，每段一次加入 q×段长。计算过程中就取模，最后处理减法的负余数。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;
const long long MOD = 998244353;

long long prefix(long long n) {
    long long answer = 0;
    for (long long l = 1, r; l <= n; l = r + 1) {
        long long q = n / l;
        r = n / q;
        answer = (answer + (q % MOD) * ((r - l + 1) % MOD)) % MOD;
    }
    return answer;
}

int main() {
    long long l, r;
    cin >> l >> r;
    cout << (prefix(r) - prefix(l - 1) + MOD) % MOD << '\n';
    return 0;
}
```

每个端点 O(√n) 个分块，额外空间 O(1)。q 与段长各自先取模，两个余数相乘小于约 10¹⁸，可用 long long；prefix(0)=0，循环不会发生除以 0。

## 与前缀和组合

如果求 Σw[i]·floor(n/i)，同一段的商仍然不变。提前计算权值前缀和 S，就能把贡献写成 q·(S[r]−S[l−1])。下一步不再是死记新公式，而是问：我能否快速求这一段的权值总和？

若同时出现 floor(n/i) 与 floor(m/i)，这两个商必须都不变，右端点取 min(n/(n/l),m/(m/l))，循环到 min(n,m) 即可，超出后乘积为 0。结合上一节的 φ 前缀和，还能处理带互质计数的分块式子。

## 练习：先画出分段

先**独立重做例题**，手列 F(20) 的每段左端、右端和商，确认没有漏项或重叠；再枚举小区间每个数的约数，核对区间答案。

### 推荐必做

1. [P2261 余数求和](https://www.luogu.com.cn/problem/P2261)：求 Σ(k mod i)，1≤i≤n。练习将余数写成 k−i·floor(k/i)，对商相同的连续区间求和。

### 选做巩固

- [P2398 GCD SUM](https://www.luogu.com.cn/problem/P2398)：求所有 1≤i,j≤n 的 gcd 之和。练习先推导按 φ 加权的求和式，再比较逐项求和和分块求和。
- [P2568 GCD](https://www.luogu.com.cn/problem/P2568)：统计最大公约数为质数的有序数对。练习将整除商与 φ 前缀和结合，核对有序数对的计数。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[数论 #216](https://www.luogu.com.cn/training/216)。

## 本节验收

能从“商保持不变”推导右端点；能说明 √n 级段数的来源；能把权值求和交给前缀和，继续减少枚举。
