---
title: 线性筛、欧拉函数与欧拉定理
description: 用最小质因子安排唯一一次筛除，并顺着同一过程递推出欧拉函数。
---

## 这一节学什么

欧拉函数 $\varphi(n)$ 表示 $1\ldots n$ 中与 $n$ 互质的整数个数，例如 $\varphi(6)=2$，因为只有 `1 5` 符合要求。我们会把逐个求 gcd 的计数，变成一次线性筛中的递推。

> **AI 伴学提示词**
>
> 为我讲解线性筛为什么每个合数只处理一次，再推导欧拉函数的两种转移，说明欧拉定理的互质条件并引导我提问。

## 先理解 φ 的公式

若 $n$ 的不同质因子是 $p_1$、$p_2$……，与 $n$ 不互质的数恰好是这些质因子的倍数。排除它们得到 $\varphi(n)=n\prod_{p\mid n}\left(1-\frac1p\right)$。例如 12 的质因子是 `2 3`，所以 $\varphi(12)=12\times\frac12\times\frac23=4$，对应 `1 5 7 11`。特别规定 $\varphi(1)=1$。

## 线性筛为什么要 break

按 $i$ 从小到大，维护已经找到的质数 $p$。用 $i\times p$ 标记合数，只允许 $p$ 不大于 $i$ 的最小质因子；当 $i\bmod p=0$ 时，处理完就停止。

例如 12 会由 $6\times 2$ 处理。到 4 时先处理 $4\times 2$ 就停止，不再由 $4\times 3$ 重复处理 12。每个合数恰好由“除去一个最小质因子的剩余部分”与这个最小质因子生成一次。

顺便计算 φ：

- $p$ 整除 $i$：质因子种类不变，$\varphi(ip)=p\varphi(i)$。
- $p$ 不整除 $i$：新添一个质因子 $p$，$\varphi(ip)=\varphi(i)(p-1)$。

素数本身 $\varphi(p)=p-1$。这三个判断就是公式在代码中的实现。

## 例题精讲：[P2158 仪仗队](https://www.luogu.com.cn/problem/P2158)

**题意简述：** 从 $N\times N$ 方阵的左后角观察学生，同一射线只看见最近的一人，求看见的人数。输入 $N$，$1\le N\le 40000$；输出整数。把观察点设为 $(0,0)$，考察 $0\ldots N-1$ 的整点，原点不计。

自编输入：

```text
3
```

输出：

```text
5
```

### 先把思路讲清楚

若 $x$、$y$ 都为正，$\gcd(x,y)>1$ 时，$(x/g,y/g)$ 位于同一射线且更近，会挡住 ($x$,$y$)；互质时中间没有别的整点。两条坐标轴各只有最近一点可见。

按较大坐标 $i$ 分类，在 $1\le j<i$ 的三角形里有 $\varphi(i)$ 个与 $i$ 互质的 $j$，对称后乘 2；还要单独计入 $(1,1)$ 和两条轴。于是 $N>1$ 时答案为 $2\sum_{i=1}^{N-1}\varphi(i)+1$，$N=1$ 时为 0。

$N=3$ 时能看见 $(1,0)$、$(0,1)$、$(1,1)$、$(1,2)$、$(2,1)$，共 5 人。先用上面线性筛求 φ，再累计贡献，这使筛出的数字真正回答了一道几何计数题。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    if (n == 1) {
        cout << 0 << '\n';
        return 0;
    }
    vector<int> primes, phi(n);
    vector<bool> composite(n, false);
    phi[1] = 1;
    for (int i = 2; i < n; i++) {
        if (!composite[i]) {
            primes.push_back(i);
            phi[i] = i - 1;
        }
        for (int p : primes) {
            if (p > (n - 1) / i) break;
            composite[i * p] = true;
            if (i % p == 0) {
                phi[i * p] = phi[i] * p;
                break;
            }
            phi[i * p] = phi[i] * (p - 1);
        }
    }
    long long answer = 1;
    for (int i = 1; i < n; i++) answer += 2LL * phi[i];
    cout << answer << '\n';
    return 0;
}
```

时间 $\mathcal{O}(N)$，空间 $\mathcal{O}(N)$。乘法前用 $p>(N-1)/i$ 检查上界；累计答案用 `long long`。

## 欧拉定理怎样用于幂

当 $\gcd(a,m)=1$ 时，$a^{\varphi(m)}\equiv1\pmod m$。直觉是：把所有与 $m$ 互质的余数乘 $a$ 后取模，会得到同一组余数的重新排列；比较两边乘积并约去它们就得到结论。因此互质时指数可以对 φ($m$) 取模。

不互质时不能直接这样做。例如 $a=2$、$m=4$，φ(4)=2，$2^2\bmod4=0$，而把指数 2 改为 0 得到 1。这也说明约去乘积需要逆元存在。

## 练习：先用 gcd 检验

先**独立重做例题**，先对 $x\le 100$ 用 gcd 计数核对 φ，再枚举小方阵的互质坐标，核对可见点数量。

### 推荐必做

1. [P3912 素数个数](https://www.luogu.com.cn/problem/P3912)：求 $1\ldots N$ 中素数的数量。练习线性筛，并按原题大范围安排数组和输入输出。
2. [P2568 GCD](https://www.luogu.com.cn/problem/P2568)：统计 $1\le x$,$y\le n$ 且 `gcd(x, y)` 为质数的有序数对。练习枚举质数并用 φ 前缀和统计缩小后的互质数对。

### 选做巩固

- [P2398 GCD SUM](https://www.luogu.com.cn/problem/P2398)：求 $1\le i$,$j\le n$ 的 `gcd(i, j)` 总和。练习推导 gcd 的 φ 求和关系，按贡献统计。
- [P3601 签到题](https://www.luogu.com.cn/problem/P3601)：求区间中每个数的不互质数个数之和并取模。练习由 $x-\varphi(x)$ 转化，并对大端点、短区间用区间筛处理。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[数论 #216](https://www.luogu.com.cn/training/216)。

## 本节验收

能解释 break 的去重作用；能区分 φ(ip) 的两种情况；使用欧拉定理前能主动检查互质。
