---
title: 异或方程组与行列式初步
description: 保留消元思路，分别更换为二元域的异或运算和质数模数下的行列式计算。
---

## 这一节学什么

消元的核心是用已有方程消去一个变量。换到异或方程时，加减都变成 XOR；计算行列式时，行操作仍可用，但要额外记录它们怎样改变数值。

> **AI 伴学提示词**
>
> 为我比较实数消元与异或消元，再讲解行列式在换行和消元时怎样变化，结合小矩阵手算并引导我提问。

## 异或就是模 2 加法

变量只取 0、1 时，0+0=0，0+1=1，1+1=0，这与异或相同。在 GF(2) 中唯一非零元素是 1，不需要除主元，也不需要 EPS。两条方程异或相加，可以把共同出现的变量抵消。

## 例题精讲一：自编 · 0/1 开关方程

**题意简述：** 输入 m 条方程、n 个变量，1≤m,n≤200。每行给 n 个 0/1 系数和右侧 0/1。求解数 mod 10⁹+7，并输出任意一组解；无解输出 `NO SOLUTION`。

输入：

```text
1 2
1 1 1
```

输出可为：

```text
2
1 0
```

这表示 x₁ xor x₂=1，有 (1,0)、(0,1) 两组。rank 个主元以外的 n−rank 个变量可以自由取值，因此无矛盾时有 2^(n−rank) 组解。要构造一组，让所有自由变量为 0，主元变量就等于该行右侧常数。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> a(m, vector<int>(n + 1));
    for (auto &row : a) for (auto &x : row) cin >> x;
    vector<int> pivotColumn;
    int rank = 0;
    for (int col = 0; col < n && rank < m; col++) {
        int pivot = rank;
        while (pivot < m && a[pivot][col] == 0) pivot++;
        if (pivot == m) continue;
        swap(a[pivot], a[rank]);
        for (int i = 0; i < m; i++) if (i != rank && a[i][col]) {
            for (int j = col; j <= n; j++) a[i][j] ^= a[rank][j];
        }
        pivotColumn.push_back(col);
        rank++;
    }
    for (int i = rank; i < m; i++) if (a[i][n]) {
        cout << "NO SOLUTION\n";
        return 0;
    }
    long long ways = 1;
    for (int i = 0; i < n - rank; i++) ways = ways * 2 % 1000000007;
    vector<int> answer(n);
    for (int i = 0; i < rank; i++) answer[pivotColumn[i]] = a[i][n];
    cout << ways << '\n';
    for (int i = 0; i < n; i++) cout << answer[i] << (i + 1 == n ? '\n' : ' ');
    return 0;
}
```

消元结束后，剩余行左侧全为 0，右侧若为 1 就是矛盾。时间 O(mn·min(m,n))，空间 O(mn)；更大规模可以用 bitset 并行异或整行。

## 行列式怎样理解

二维方阵 [[a,b],[c,d]] 的行列式为 ad−bc，绝对值对应两个列向量张成的平行四边形面积，符号记录方向。更高维也有相应的有向体积意义。在线性方程中，方阵行列式非零，等价于没有自由方向、对任意右侧都有唯一解。

三条计算规则：交换两行使行列式变号；给一行乘 t，使行列式乘 t；把某行的倍数加到另一行，不改变行列式。上三角矩阵的行列式等于对角线乘积。

因此可以向下消元，不将主元行除成 1，只记录换行的负号和各主元的乘积。

## 例题精讲二：自编 · 质数模数下的行列式

**题意简述：** 输入 n≤200 的方阵，元素绝对值≤10⁹，输出行列式 mod 10⁹+7。输入 n=2、两行为 `1 2`、`3 4`，行列式为 −2，输出 `1000000005`。

这次使用模质数运算，非零主元有逆元，因此可以用它求消元倍数。只在模意义下找非零主元，不使用浮点 EPS。

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
    int n;
    cin >> n;
    vector<vector<long long>> a(n, vector<long long>(n));
    for (auto &row : a) for (auto &x : row) { cin >> x; x = (x % MOD + MOD) % MOD; }
    long long answer = 1;
    for (int col = 0; col < n; col++) {
        int pivot = col;
        while (pivot < n && a[pivot][col] == 0) pivot++;
        if (pivot == n) { cout << 0 << '\n'; return 0; }
        if (pivot != col) { swap(a[pivot], a[col]); answer = (MOD - answer) % MOD; }
        answer = answer * a[col][col] % MOD;
        long long inverse = power(a[col][col], MOD - 2);
        for (int i = col + 1; i < n; i++) {
            long long factor = a[i][col] * inverse % MOD;
            for (int j = col; j < n; j++) a[i][j] = (a[i][j] - factor * a[col][j] % MOD + MOD) % MOD;
        }
    }
    cout << answer << '\n';
    return 0;
}
```

消元只加减另一行的倍数，不改变行列式；每次换行单独变号。时间 O(n³+n log MOD)，空间 O(n²)。若模数为合数，非零元素也可能没有逆元，不能把这个版本直接用于一般合数模数的行列式。

## 练习：同样的消元，不同的运算规则

先**独立重做两道例题**，异或方程枚举全部小规模变量核对；行列式用 2×2 的 ad−bc 核对。

### 推荐必做

1. **自编 · 异或唯一解：** 在例题一输出是否唯一，说明“有解且 rank=n”对应什么。
2. **自编 · 三角矩阵行列式：** 随机生成上三角矩阵，再交换若干行，按对角线乘积与换行次数独立验证。

### 选做巩固

- **自编 · bitset 消元：** 将异或方程的一行放入 bitset，整行 XOR，保持主元和解数逻辑一致。
- **自编 · 相关的行：** 令一行是另外两行之和，检查行列式为 0，并解释它与秩不足的关系。
- **自编 · 模质数方程组：** 将本节逆元消元用于 Ax=b，区分无解、唯一解、多个解，比较实数与模质数两种环境。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[基础线性代数 #219](https://www.luogu.com.cn/training/219)。

## 本节验收

能保留消元思路并正确更换运算；能用主元数计算异或解数；能跟踪行列式的换行符号，并检查逆元适用条件。
