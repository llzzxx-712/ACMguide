---
title: 斜率优化与凸壳维护
description: 展开二次转移，将前驱变成平面点，再用单调查询维护可能成为最优的凸壳候选。
---

## 这一节学什么

有些候选的优劣随当前 i 改变，不能仅按一个固定的 f[j] 排队。把公式展开后，若能写成“只与 i 有关的常数，加上关于 j 的直线取最值”，就可以用凸壳维护这些候选。

> **AI 伴学提示词**
>
> 为我讲解二次 DP 怎样展开为点与直线，手算候选交替和三点淘汰，解释单调性与整数乘法范围，并引导我提问。

## 例题精讲：[P3195 玩具装箱](https://www.luogu.com.cn/problem/P3195)

**题意简述：** 将按顺序排列的 n 件玩具分成连续段，每段内相邻玩具间增加 1 单位填充，若这一段实际长度为 len，费用为 (len−L)²，求总费用最小值。输入 n、L，再给 n 个长度 C[i]。n≤5×10⁴，L、C[i]≤10⁷，长度均为正。

自编输入：

```text
3 3
1
1
1
```

输出：

```text
4
```

### 先把思路讲清楚

三件分成 [1,1] 与 [1] 时，第一箱长度 1+1+1=3，费用 0；第二箱长度 1，费用 4，总费用 4。不能漏掉箱内的填充，也不能在最后一件后多算一格。

### 先得到正确的平方费用 DP

定义 A[i]=Σ(t=1…i)(C[t]+1)，B=L+1。上一段结束在 j，最后一段的实际长度是 A[i]−A[j]−1，因此 f[i]=min(f[j]+(A[i]−A[j]−B)²)，0≤j<i。朴素枚举 j 为 O(n²)。

展开平方，把只与 i 有关的项拿出来：

```text
f[i] = (A[i]−B)² + min{Y[j] − t·X[j]}
X[j] = A[j]
Y[j] = f[j]+A[j]²
t = 2(A[i]−B)
```

### 把找最佳前驱变成找凸壳上的点

每个 j 对应点 (X[j],Y[j])，查询要最小化 Y−tX。X 严格递增，查询斜率 t 也递增，所以最佳点只会向前移动。队首第二点若不比第一点差，就可以弹掉第一点；队尾三点的相邻斜率若不再递增，中间点不可能成为下凸壳的最优候选，可以删除。

比较斜率时用交叉乘法，避免除法与浮点误差。代码 value 对应查询式，redundant 对应删掉无用中间点；先查询算出 f[i]，再把 i 这个新候选加入，不能让当前状态使用自己。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;
using Wide = __int128;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long L;
    cin >> n >> L;
    long long B = L + 1;
    vector<long long> x(n + 1);
    vector<Wide> f(n + 1), y(n + 1);
    for (int i = 1; i <= n; i++) {
        long long length;
        cin >> length;
        x[i] = x[i - 1] + length + 1;
    }
    auto value = [&](int j, long long slope) {
        Wide t = slope;
        return y[j] - t * x[j];
    };
    auto redundant = [&](int a, int b, int c) {
        return (y[b] - y[a]) * (x[c] - x[b])
            >= (y[c] - y[b]) * (x[b] - x[a]);
    };
    deque<int> hull;
    hull.push_back(0);
    for (int i = 1; i <= n; i++) {
        long long slope = 2 * (x[i] - B);
        while (hull.size() >= 2 && value(hull[0], slope) >= value(hull[1], slope)) hull.pop_front();
        Wide delta = x[i] - B;
        f[i] = delta * delta + value(hull.front(), slope);
        Wide xi = x[i];
        y[i] = f[i] + xi * xi;
        while (hull.size() >= 2 && redundant(hull[hull.size() - 2], hull.back(), i)) hull.pop_back();
        hull.push_back(i);
    }
    long long answer = f[n];
    cout << answer << '\n';
    return 0;
}
```

每个候选最多入队、出队一次，总时间、空间 O(n)。A 可能达到约 5×10¹¹，平方与交叉乘积会超过 long long，所以 Wide 使用 GCC 的 __int128 保存中间值。最终答案不超过“每件单独一箱”的总费用，最多约 5×10¹⁸，可以转存 long long 输出。

## 练习：让每个几何量回到原 DP 变量

先**独立重做本例**，写 O(n²) 版本对拍，覆盖单件、L 大于总长、所有长度为 1，特别检查相邻玩具间的填充长度。

### 推荐必做

1. [P2900 Land Acquisition](https://www.luogu.com.cn/problem/P2900)：把矩形土地分组购买，每组费用是最大长乘最大宽，求最小费用。练习先删除被包含的土地，再推导斜率优化转移。
2. [P5785 任务安排](https://www.luogu.com.cn/problem/P5785)：将连续任务分批处理，最小化完成时间与费用系数的加权和。练习从朴素转移中整理直线与查询变量。

### 选做巩固

- [P3628 特别行动队](https://www.luogu.com.cn/problem/P3628)：将士兵划分为连续小组，最大化各组二次函数收益之和。练习展开平方并确认最大值方向的凸壳条件。
- [P3648 序列分割](https://www.luogu.com.cn/problem/P3648)：将非负序列分成 k+1 段，最大化分割得分并输出切分位置。练习分层 DP、优化转移和保存前驱。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[动态规划的设计与优化 #225](https://www.luogu.com.cn/training/225)。

## 本节验收

能从原式推导 X、Y 与查询斜率；能区分队首淘汰与队尾凸性维护；能检查单调条件、同坐标情况与中间乘积范围。
