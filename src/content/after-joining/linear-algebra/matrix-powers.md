---
title: 矩阵快速幂与递推加速
description: 先选足够表达下一步的状态向量，再把同一个转移重复执行改成矩阵快速幂。
---

## 这一节学什么

如果每一步都用同一套线性规则更新一组状态，执行很多步就相当于同一个矩阵乘很多次。快速幂只依赖乘法结合律，因此把普通乘法换成矩阵乘法，仍可以按二进制拆指数。

> **AI 伴学提示词**
>
> 为我先从递推式选择状态向量，再逐行填写转移矩阵，解释幂次和初始向量的对应，并引导我提问。

## 例题精讲：[P1939 矩阵加速（数列）](https://www.luogu.com.cn/problem/P1939)

**题意简述：** a₁=a₂=a₃=1，x≥4 时 aₓ=aₓ₋₁+aₓ₋₃。最多 100 次询问，每次 n≤2×10⁹，求 aₙ mod 10⁹+7。

自编输入：

```text
4
1
3
4
6
```

输出 `1`、`1`、`2`、`4`，各占一行。逐项递推要走到二十亿，应该先估算规模，再寻找重复的转移。

## 状态不是只留当前答案

只保留 aᵢ 无法算 aᵢ₊₁，因为还需要 aᵢ₋₂。于是保存连续三项 Vᵢ=[aᵢ,aᵢ₋₁,aᵢ₋₂]ᵀ。下一步：

```text
a[i+1] = a[i] + a[i-2]
a[i]   = a[i]
a[i-1] = a[i-1]

V[i+1]   [1 0 1] V[i]
       = [1 0 0]
         [0 1 0]
```

第一行实现递推，后两行把旧值向下搬一格。起点是 V₃=[1,1,1]ᵀ，所以 Vₙ=A^(n−3)V₃；不是 Aⁿ，也不是 A^(n−1)。n≤3 直接返回初值。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;
const long long MOD = 1000000007;

struct Matrix {
    long long a[3][3] = {};
};

Matrix multiply(const Matrix &x, const Matrix &y) {
    Matrix z;
    for (int i = 0; i < 3; i++) {
        for (int k = 0; k < 3; k++) {
            for (int j = 0; j < 3; j++) z.a[i][j] = (z.a[i][j] + x.a[i][k] * y.a[k][j]) % MOD;
        }
    }
    return z;
}

Matrix power(Matrix base, long long exponent) {
    Matrix answer;
    for (int i = 0; i < 3; i++) answer.a[i][i] = 1;
    while (exponent > 0) {
        if (exponent & 1) answer = multiply(answer, base);
        base = multiply(base, base);
        exponent >>= 1;
    }
    return answer;
}

int main() {
    int queries;
    cin >> queries;
    Matrix transition;
    transition.a[0][0] = transition.a[0][2] = 1;
    transition.a[1][0] = transition.a[2][1] = 1;
    while (queries--) {
        long long n;
        cin >> n;
        if (n <= 3) { cout << 1 << '\n'; continue; }
        Matrix result = power(transition, n - 3);
        long long answer = 0;
        for (int j = 0; j < 3; j++) answer = (answer + result.a[0][j]) % MOD;
        cout << answer << '\n';
    }
    return 0;
}
```

结构体成员的 `{}` 把所有项初始化为 0；快速幂答案先放单位矩阵，表示执行零步。最后求第一行与 [1,1,1] 的内积，所以是这一行的和。单次时间 O(3³ log n)，矩阵空间 O(3²)。

## 常数项和前缀和也能放进状态

若 aᵢ₊₁=2aᵢ+3，可以加入永远为 1 的状态，写成 [aᵢ₊₁,1]ᵀ=[[2,3],[0,1]]·[aᵢ,1]ᵀ。若还要求前缀和 Sᵢ，则把 Sᵢ 也加进去，用 Sᵢ₊₁=Sᵢ+aᵢ₊₁ 填一行。先确定每个新状态依赖哪些旧状态，再填系数，矩阵就不会变成需要死记的表格。

## 练习：先验证执行一步

先**独立重做例题**，手算 V₃ 到 V₄、V₅，用逐项递推核对前 100 项。

### 推荐必做

1. **自编 · 斐波那契：** 保存 [Fᵢ,Fᵢ₋₁]，自己填写 2×2 转移矩阵；检查 n=0、1 的初值与幂次。
2. **自编 · 带常数递推：** a₀=0、aᵢ₊₁=2aᵢ+3，加入常量状态计算第 n 项，n≤10¹⁸，答案取模。

### 选做巩固

- **自编 · 数列前缀和：** 在本例矩阵中增加一个状态，计算 Σaᵢ，不再逐项累加到 n。
- **自编 · 固定步数走法：** 用邻接矩阵快速幂统计恰好 k 条边的走法，允许重复经过结点，注意它与最短路的目标不同。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[基础线性代数 #219](https://www.luogu.com.cn/training/219)。

## 本节验收

能自己选状态、填系数、确定起点与指数；能用执行一步的检查发现矩阵顺序或幂次错误。
