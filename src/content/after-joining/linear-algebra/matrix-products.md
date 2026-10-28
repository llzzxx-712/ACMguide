---
title: 向量、矩阵与矩阵乘法
description: 把一组状态放进向量，用矩阵的一行描述一个新状态，理解乘法对应规则的组合。
---

## 这一节学什么

向量可以先理解成有顺序的一组数；矩阵则把“新的一组数怎样由旧的一组数组合出来”写成表格。我们先看每个格子代表什么，再实现乘法。

> **AI 伴学提示词**
>
> 为我从二维向量和线性组合讲解矩阵，用行与列的配对手算乘法，并引导我理解维度、乘法顺序后提问。

## 一行就是一个新状态的计算规则

设旧状态为列向量，想得到 $x'=2x+y$、$y'=x-y$，可以把两条规则写在一起：

$$
\begin{bmatrix}x'\\y'\end{bmatrix}
=
\begin{bmatrix}2&1\\1&-1\end{bmatrix}
\begin{bmatrix}x\\y\end{bmatrix}.
$$

矩阵第一行给 $x'$ 的系数，第二行给 $y'$ 的系数。几何上，这表示把向量变成另一个向量；列向量 $[2,1]^{\mathsf T}$、$[1,-1]^{\mathsf T}$ 分别说明两个坐标轴单位向量变到哪里，任意向量的变化就是它们的线性组合。

本章统一采用**列向量放在右边**。因此先做 $B$，再做 $A$，整体写成 $A\cdot B\cdot x$。交换 $A$、$B$ 往往得到不同结果，不能按普通数乘法随意交换。

## 行和列怎样配对

$A$ 为 $r\times s$，$B$ 为 $s\times t$，乘积 $C$ 为 $r\times t$：$C_{ij}=\sum_{k=0}^{s-1}A_{ik}B_{kj}$。中间维度必须相同，因为 $A$ 的一行要与 $B$ 的一列逐项配对。

例如下面的一行乘一列，得到一个数：

$$
\begin{bmatrix}1&2\end{bmatrix}
\begin{bmatrix}5\\7\end{bmatrix}
=1\times5+2\times7=19.
$$

公式中的 $C_{ij}$，在代码里就保存为 `c[i][j]`。先确定答案的哪一格，再枚举组成这一格的各项贡献。

单位矩阵主对角线为 1，其余为 0，相当于每个状态原样保留，是矩阵乘法中的“1”。

## 例题精讲：[B2105 矩阵乘法](https://www.luogu.com.cn/problem/B2105)

**题意简述：** 输入 $r$、$s$、$t$，均为 1…100；再输入 $r\times s$ 的 $A$ 和 $s\times t$ 的 $B$，每个元素绝对值不超过 1000，输出 $A\cdot B$，不取模。

自编输入：

```text
2 2 2
1 2
3 4
5 6
7 8
```

输出：

```text
19 22
43 50
```

请先手算左上角和右下角，再把每一步找到代码里的 $i$、$j$、$k$。三层循环不是需要背的固定顺序，而是在枚举“答案哪一格”和“这格的哪一项贡献”。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int r, s, t;
    cin >> r >> s >> t;
    vector<vector<long long>> a(r, vector<long long>(s));
    vector<vector<long long>> b(s, vector<long long>(t));
    vector<vector<long long>> c(r, vector<long long>(t));
    for (auto &row : a) for (auto &x : row) cin >> x;
    for (auto &row : b) for (auto &x : row) cin >> x;
    for (int i = 0; i < r; i++) {
        for (int k = 0; k < s; k++) {
            for (int j = 0; j < t; j++) c[i][j] += a[i][k] * b[k][j];
        }
    }
    for (auto row : c) {
        for (int j = 0; j < t; j++) cout << row[j] << (j + 1 == t ? '\n' : ' ');
    }
    return 0;
}
```

循环按 $i$、$k$、$j$ 排列，方便一段连续地访问 $B$ 的第 $k$ 行；含义与按 $i$、$j$、$k$ 一样。本题每项由至多 100 个乘积相加，绝对值至多 $10^{8}$；代码使用 `long long` 保存乘积与总和。时间 $\mathcal{O}(rst)$，空间 $\mathcal{O}(rs+st+rt)$。

## 练习：先检查维度

先**独立重做例题**，给每个矩阵标出行数和列数，再核对每一格的行列乘积。

### 推荐必做

1. [P1962 斐波那契数列](https://www.luogu.com.cn/problem/P1962)：求大下标的斐波那契数，对 $10^{9}+7$ 取模。练习先写出一步的状态向量和 $2\times 2$ 矩阵，再结合快速幂。

### 选做巩固

- [P3390 矩阵快速幂](https://www.luogu.com.cn/problem/P3390)：输入方阵和指数，输出矩阵的指定次幂。练习矩阵乘法、单位矩阵和快速幂的组合。
- [P1939 矩阵加速（数列）](https://www.luogu.com.cn/problem/P1939)：求满足 $a_n=a_{n-1}+a_{n-3}$ 的数列指定项。练习构造三维状态并检查矩阵乘一次的结果。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[基础线性代数 #219](https://www.luogu.com.cn/training/219)。

## 本节验收

能把状态更新写成系数表；能检查中间维度；能解释矩阵乘法与规则组合，并保持列向量约定一致。
