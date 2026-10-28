---
title: 条件概率、全概率与贝叶斯公式
description: 用一张人数表理解已知条件后的样本空间变化，再从正向概率计算反向概率。
---

## 这一节学什么

“异常任务会触发告警的概率”与“触发告警的任务属于异常的概率”是两个方向。把它们分清，就能理解条件概率、全概率和贝叶斯公式。

> **AI 伴学提示词**
>
> 为我用任务告警的人数表讲解条件概率、全概率和贝叶斯公式，解释两个条件方向为什么不同，并引导我提问。

## 条件改变了分母

P(A|B)=P(A 且 B)/P(B)，要求 P(B)>0。已知 B 发生后，只在 B 的范围里比较 A 占了多少；分母不再是全部结果。

独立意味着 P(A|B)=P(A)，也等价于 P(A 且 B)=P(A)P(B)。没有独立条件时，联合概率仍可写成 P(A)P(B|A)，但不能把条件概率直接去掉。

## 全概率先把来源分开

如果 A 与非 A 覆盖全部情况，那么 P(B)=P(A)P(B|A)+P(非 A)P(B|非 A)。每一项是一条“先选来源，再发生 B”的路径。贝叶斯公式就是把其中来自 A 的部分除以全部 B：

```text
P(A|B) = P(A)P(B|A) / [P(A)P(B|A) + P(非A)P(B|非A)]
```

## 例题精讲：[P8804 故障](https://www.luogu.com.cn/problem/P8804)

**题意简述：** 同一时刻只有一种故障原因。输入 N 个原因的先验概率、N×M 的条件概率表和当前出现的 K 个现象，求各原因的后验概率。N≤40、M≤20，所有输入概率都是整数百分比。同一原因下各现象独立。输出按后验概率降序的“原因编号 百分比”，两位小数，同概率编号小者在前。

自编输入：

```text
2 2
50 50
80 20
20 80
1
1
```

输出：

```text
1 94.12
2 5.88
```

### 先把思路讲清楚

设观测事件 B 为“现象 1 出现、现象 2 不出现”。原因 1 产生这份观测的概率为 0.8×(1−0.2)=0.64，与先验相乘得 0.32；原因 2 的对应联合概率为 0.5×0.2×(1−0.8)=0.02。

全部观测的概率为 0.34，故原因 1 的后验概率是 0.32/0.34≈94.12%，原因 2 为 5.88%。这里只看“80% 会产生现象 1”会漏掉现象 2 没有出现这条信息。原题给的是当前出现的完整现象列表，未列出的也要乘对应的不出现概率。

### 把贝叶斯公式落到两层循环

对原因 i，先取先验 prior[i]，按每个现象是否出现乘 p 或 1−p，得到 joint[i]=P(原因 i 且 B)。所有 joint 的和就是全概率 P(B)，每项再除以总和，即 P(原因 i|B)。所有后验有同一分母，排序时直接比较 joint，最后才转换为百分比输出。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n >> m;
    vector<long double> prior(n), joint(n);
    for (auto &x : prior) {
        cin >> x;
        x /= 100;
    }
    vector<vector<long double>> probability(n, vector<long double>(m));
    for (auto &row : probability) for (auto &x : row) {
        cin >> x;
        x /= 100;
    }
    int k;
    cin >> k;
    vector<bool> observed(m, false);
    while (k--) {
        int x;
        cin >> x;
        observed[x - 1] = true;
    }
    long double total = 0;
    for (int i = 0; i < n; i++) {
        joint[i] = prior[i];
        for (int j = 0; j < m; j++) {
            joint[i] *= observed[j] ? probability[i][j] : 1 - probability[i][j];
        }
        total += joint[i];
    }
    vector<int> order(n);
    iota(order.begin(), order.end(), 0);
    sort(order.begin(), order.end(), [&](int a, int b) {
        if (joint[a] != joint[b]) return joint[a] > joint[b];
        return a < b;
    });
    for (int i : order) printf("%d %.2Lf\n", i + 1, 100 * joint[i] / total);
    return 0;
}
```

时间 O(NM+N log N)，空间 O(NM)。数组里统一存 0…1 概率，输入除以 100，输出乘以 100，避免混用比例和百分数。使用 long double 保留多次相乘的精度，printf 的 %.2Lf 与参数类型对应。

## 练习：先写条件方向

先**独立重做例题**，分别写出 P(观测|原因 i)、P(原因 i|观测)，核对出现与未出现现象的乘积，以及所有后验概率之和为 1。

### 推荐必做

1. [P2111 考场奇遇](https://www.luogu.com.cn/problem/P2111)：已知判断题的对答案结果和一人的正确率，求另一人至少答对指定题数的概率。练习在已知答案相同或不同时，分别确定正确的概率。

### 选做巩固

- [Codeforces 312B Archer](https://codeforces.com/problemset/problem/312/B)：两人轮流射击，首次命中者获胜，求先手获胜的概率。练习按前一轮是否全部未命中分类，建立概率方程。
- [Codeforces 442B Andrey and Problem](https://codeforces.com/problemset/problem/442/B)：选择若干朋友征题，使恰有一人提供题目的概率最大。练习按哪位朋友成功划分互斥事件。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[概率与统计 #218](https://www.luogu.com.cn/training/218)。

## 本节验收

能区分两个条件方向；能把全概率写成来源路径之和；能在事件概率为 0 时识别条件概率未定义。
