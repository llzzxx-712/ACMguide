---
title: 异或方程组与行列式初步
description: 保留消元思路，分别更换为二元域的异或运算和任意正模数下的行列式计算。
---

## 这一节学什么

消元的核心是用已有方程消去一个变量。换到异或方程时，加减都变成 XOR；计算行列式时，行操作仍可用，但要额外记录它们怎样改变数值。

> **AI 伴学提示词**
>
> 为我比较实数消元与异或消元，再讲解行列式在换行和消元时怎样变化，结合小矩阵手算并引导我提问。

## 异或就是模 2 加法

变量只取 0、1 时，0+0=0，0+1=1，1+1=0，这与异或相同。在 GF(2) 中唯一非零元素是 1，不需要除主元，也不需要 EPS。两条方程异或相加，可以把共同出现的变量抵消。

## 例题精讲一：[P2447 外星千足虫](https://www.luogu.com.cn/problem/P2447)

**题意简述：** N 个虫子的足数奇偶未知，每次给一个 N 位 01 串表示参与检测的虫子，再给总足数 mod 2。按时间输入 M 条检测，保证不矛盾。求最早何时能唯一判断所有虫子；不能则输出 Cannot Determine。唯一时先输出最早检测编号，再对每只输出奇数 ?y7M#、偶数 Earth。N≤1000，M≤2000。

自编输入：

```text
2 3
10 1
10 1
01 0
```

输出：

```text
3
?y7M#
Earth
```

### 先把思路讲清楚

用 x[i]=0/1 表示偶/奇，每次检测就是若干变量的异或和。前两次都只是 x[1]=1，第二次没有增加信息；第三次给出 x[2]=0，才首次唯一确定全部变量，所以输出 3。

### 按输入顺序加入独立信息

为每个主元列保存一行 basis[col]。新方程从左往右：该列为 1 且已有主元，就整行异或消去；若该列还没有主元，就将这一行作为新的独立方程，rank 加 1。最后只剩零行说明信息重复。

保证有解时，rank=n 当且仅当没有自由变量，解唯一。按时间加入，所以首次达到 n 的 step 就是最早时刻；不能只对所有方程统一消元后输出 M。主元行的左侧已清零，从最右列往左回代，便能得到每只虫子的身份。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    vector<bitset<1001>> basis(n);
    int rank = 0, earliest = -1;
    for (int step = 1; step <= m; step++) {
        string s;
        int result;
        cin >> s >> result;
        bitset<1001> row;
        for (int i = 0; i < n; i++) row[i] = s[i] == '1';
        row[n] = result;
        for (int col = 0; col < n; col++) if (row[col]) {
            if (basis[col][col]) row ^= basis[col];
            else {
                basis[col] = row;
                rank++;
                break;
            }
        }
        if (rank == n) {
            earliest = step;
            break;
        }
    }
    if (earliest == -1) {
        cout << "Cannot Determine\n";
        return 0;
    }
    vector<int> answer(n);
    for (int col = n - 1; col >= 0; col--) {
        answer[col] = basis[col][n];
        for (int j = col + 1; j < n; j++) answer[col] ^= basis[col][j] & answer[j];
    }
    cout << earliest << '\n';
    for (int x : answer) cout << (x ? "?y7M#" : "Earth") << '\n';
    return 0;
}
```

bitset 将整行异或并行执行，宽度 1001 足够保存 1000 个变量和右侧常数。消元约 O(MN·⌈N/字长⌉)，回代 O(N²)，空间 O(N²) 位。本题只需判断唯一性；一般无矛盾系统若 rank<n，有 2^(n−rank) 组解。

## 行列式怎样理解

二维方阵 [[a,b],[c,d]] 的行列式为 ad−bc，绝对值对应两个列向量张成的平行四边形面积，符号记录方向。更高维也有相应的有向体积意义。在线性方程中，方阵行列式非零，等价于没有自由方向、对任意右侧都有唯一解。

三条计算规则：交换两行使行列式变号；给一行乘 t，使行列式乘 t；把某行的倍数加到另一行，不改变行列式。上三角矩阵的行列式等于对角线乘积。

因此可以向下消元，不将主元行除成 1，只记录换行的负号和各主元的乘积。

## 例题精讲二：[P7112 行列式求值](https://www.luogu.com.cn/problem/P7112)

**题意简述：** 输入 n 阶方阵与模数 p，求行列式 mod p 的非负结果。n≤600，p≤10⁹+7，p 不保证质数；元素为小于 10⁹+7 的正整数。输入 n、p，再给矩阵，输出一个整数。

自编输入：

```text
2 6
1 2
3 4
```

输出：

```text
4
```

### 先把思路讲清楚

2×2 行列式为 1×4−2×3=−2，对 6 取模得到 4。模数 6 下非零元素不一定有逆元，例如 2 没有逆元，所以不能把所有非零主元直接做费马逆元。

### 用欧几里得式行变换，避开除以主元

设当前列两行的数为 a、b，b≠0。取整数商 q=a/b，让第一行减去 q 倍第二行，再交换两行；这一列就从 (a,b) 变成 (b,a mod b)，与欧几里得算法一致。重复后下方变成 0，期间只用“加减整数倍”和“换行”两条合法规则。

行减去另一行整数倍不改变行列式，换行则变号。列处理完后乘入主元，最终得到上三角对角线乘积。所有元素每次取模，保持非负；整个过程中没有计算模逆元，因而质数和合数模数都能处理。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long mod;
    cin >> n >> mod;
    vector<vector<long long>> a(n, vector<long long>(n));
    for (auto &row : a) for (auto &x : row) {
        cin >> x;
        x %= mod;
    }
    long long answer = 1 % mod;
    for (int col = 0; col < n; col++) {
        for (int i = col + 1; i < n; i++) {
            while (a[i][col] != 0) {
                long long q = a[col][col] / a[i][col];
                for (int j = col; j < n; j++) {
                    a[col][j] = (a[col][j] - q * a[i][j] % mod + mod) % mod;
                }
                swap(a[col], a[i]);
                answer = (mod - answer) % mod;
            }
        }
        if (a[col][col] == 0) {
            cout << 0 << '\n';
            return 0;
        }
        answer = answer * a[col][col] % mod;
    }
    cout << answer << '\n';
    return 0;
}
```

时间上界 O(n³ log p)，空间 O(n²)。q 与元素都不超过约 10⁹，乘积使用 long long。p=1 时所有余数为 0，输出 0。

## 练习：同样的消元，不同的运算规则

先**独立重做两道例题**，异或方程枚举全部小规模变量核对；行列式用 2×2 的 ad−bc 核对。

### 推荐必做

1. [P4783 矩阵求逆](https://www.luogu.com.cn/problem/P4783)：在模 10⁹+7 下求矩阵逆，无逆时输出指定信息。练习模质数下的行变换和逆元。

### 选做巩固

- [P2962 Lights](https://www.luogu.com.cn/problem/P2962)：每次切换一盏灯及所有相邻灯，求点亮所有灯的最少切换次数。练习建立异或方程，并进一步处理最少操作数。
- [P2455 线性方程组](https://www.luogu.com.cn/problem/P2455)：判断实数方程组无解、唯一解或无穷多解。练习比较实数运算与异或、模运算下的消元。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[基础线性代数 #219](https://www.luogu.com.cn/training/219)。

## 本节验收

能保留消元思路并正确更换运算；能用主元数计算异或解数；能跟踪行列式的换行符号，并检查逆元适用条件。
