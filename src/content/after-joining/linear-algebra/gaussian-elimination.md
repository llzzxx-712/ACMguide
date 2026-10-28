---
title: 高斯消元与线性方程组
description: 把初中消元法推广成逐列确定主元的过程，区分无解、唯一解和自由变量。
---

## 这一节学什么

高斯消元就是不断用一个方程消去其他方程中的同一个未知数。把每条方程的系数和右侧常数排成增广矩阵，就可以用统一的行操作完成这个过程。

> **AI 伴学提示词**
>
> 为我从二元一次方程组手算高斯消元，解释选主元、换行、消元与解的分类，再对照代码引导我提问。

## 三种不改变解集的行操作

交换两个方程；把方程乘非零常数；把一个方程的倍数加到另一个方程上。这些操作都可逆，所以原方程组与变换后的方程组有相同解。

例如 $x+y=3$、$2x-y=0$。第二行减去第一行的两倍，得到 $-3y=-6$，故 $y=2$、$x=1$。程序只是把“找一个能消掉当前未知数的方程”推广到 $n$ 个未知数。

## 逐列找主元，行数和列数分开走

从第 0 列开始，在还没使用的行中选这一列绝对值最大的系数作主元，换到当前行，除以它使主元变 1，再将其他行该列消成 0。本节采用消去上下所有行的 Gauss-Jordan 写法，最后直接读出结果。

若一列剩余系数全接近 0，就跳过这一列，不增加已确定的主元行数。最终：

- 出现 $0x_1+\cdots+0x_n=b$ 且 $b\ne 0$：矛盾，无解。
- 没矛盾，但主元数小于未知数个数：存在自由变量，无穷多解。
- 每个未知数都有主元：唯一解。

选绝对值较大的主元可以减少除以极小数带来的误差。浮点实现用 $\mathrm{EPS}$ 判“足够接近 0”，它适用于本题这样的数值计算；异或或模质数方程会用精确的不同运算，下一节再区分。

## 例题精讲：[P3389 高斯消元法](https://www.luogu.com.cn/problem/P3389)

**题意简述：** 输入 $n\le 100$ 个未知数的 $n$ 条方程，每行给 $n$ 个系数和右侧常数。若有唯一解，每行输出一个未知数，保留两位小数；否则按原题统一输出 `No Solution`。

自编输入：

```text
2
1 1 3
2 -1 0
```

输出：

```text
1.00
2.00
```

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<double>> a(n, vector<double>(n + 1));
    for (auto &row : a) for (auto &x : row) cin >> x;
    const double EPS = 1e-8;
    int rank = 0;
    for (int col = 0; col < n; col++) {
        int pivot = rank;
        for (int i = rank; i < n; i++) if (fabs(a[i][col]) > fabs(a[pivot][col])) pivot = i;
        if (fabs(a[pivot][col]) < EPS) continue;
        swap(a[pivot], a[rank]);
        double divisor = a[rank][col];
        for (int j = col; j <= n; j++) a[rank][j] /= divisor;
        for (int i = 0; i < n; i++) if (i != rank) {
            double factor = a[i][col];
            for (int j = col; j <= n; j++) a[i][j] -= factor * a[rank][j];
        }
        rank++;
    }
    if (rank < n) { cout << "No Solution\n"; return 0; }
    for (int i = 0; i < n; i++) {
        double answer = a[i][n];
        if (fabs(answer) < 0.0005) answer = 0;
        printf("%.2f\n", answer);
    }
    return 0;
}
```

当处理某列时 $\mathrm{rank}\le\mathrm{col}<n$，所以选主元时下标始终合法。满秩时每列都有主元，主元行顺序与未知数顺序一致。原题将无解和非唯一解合并成同一个输出，因此这里主元不足即可返回；若要分三类，还需检查剩余行的常数是否为 0。

消元约有 $n^3$ 次基本运算，时间 $\mathcal{O}(n^{3})$，空间 $\mathcal{O}(n^{2})$。原题系数与常数绝对值不超过 $10^{4}$，使用 `double`，并按要求 `printf("%.2f", answer)` 输出。

## 练习：先保留每一步行变换

先**独立重做例题**，写出每次换行、倍乘、相减后的矩阵，确认每步都保持同一个解集。

### 推荐必做

1. [P2455 线性方程组](https://www.luogu.com.cn/problem/P2455)：求解实数线性方程组，分别输出唯一解、无解或无穷多解。练习通过矛盾行和主元数区分三种情况。

### 选做巩固

- [P2447 外星千足虫](https://www.luogu.com.cn/problem/P2447)：根据多次集合足数奇偶信息尽早确定每只虫子的身份。练习把系数和结果看成 0/1，使用异或消元。
- [P4783 矩阵求逆](https://www.luogu.com.cn/problem/P4783)：在模 $10^{9}+7$ 下求矩阵逆，无解时按题意输出。练习把单位矩阵接在系数矩阵右侧，并使用模逆元完成行变换。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[基础线性代数 #219](https://www.luogu.com.cn/training/219)。

## 本节验收

能解释三种行操作为何合法；能区分列与主元行；能根据矛盾行、自由变量判断解的类型，并用代回验证结果。
