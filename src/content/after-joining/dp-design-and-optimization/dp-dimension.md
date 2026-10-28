---
title: 状态维度、转移瓶颈与复杂度分析
description: 先写正确的朴素状态，再依据数据规模寻找状态等价、维度交换和存储压缩的机会。
---

## 这一节学什么

优化 DP 先要有一个含义明确的正确版本。把复杂度写成“状态数×每个状态的候选数”，代入最大规模，才能知道该减少哪一部分，而不是看到多重循环就盲目换数据结构。

> **AI 伴学提示词**
>
> 为我讲解 DP 的状态数与转移数，用大容量小价值背包说明怎样交换状态维度，解释为什么新状态仍保留原目标，并引导我提问。

## 例题精讲：[AT_dp_e Knapsack 2](https://www.luogu.com.cn/problem/AT_dp_e)

**题意简述：** n≤100 件物品，每件最多一次，重量≤10⁹、正价值≤1000，总容量 W≤10⁹，求最大价值。输入 n、W，再输入各件重量与价值。

自编输入：

```text
3 8
6 5
4 3
4 3
```

输出 `6`，选后两件。按容量开到 10⁹ 的数组不合适，但价值总和最多 10⁵。

## 把“多少容量下价值最大”反过来

令 `f[v]` 为恰好获得价值 v 的最小总重量。对同一个 v，更重的方案不会让后续更容易装下，可以只保留最轻的一份。

`f[0] = 0`，其余不可达。每件物品倒序更新 `f[v] = min(f[v], f[v - value] + weight)`。最后从所有 `f[v]`≤W 中取最大的 v。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    long long capacity;
    cin >> n >> capacity;
    vector<long long> weight(n);
    vector<int> value(n);
    int totalValue = 0;
    for (int i = 0; i < n; i++) { cin >> weight[i] >> value[i]; totalValue += value[i]; }
    const long long INF = (1LL << 62);
    vector<long long> f(totalValue + 1, INF);
    f[0] = 0;
    int reached = 0;
    for (int i = 0; i < n; i++) {
        reached += value[i];
        for (int v = reached; v >= value[i]; v--) if (f[v-value[i]] != INF) {
            f[v] = min(f[v], f[v-value[i]] + weight[i]);
        }
    }
    int answer = 0;
    for (int v = 0; v <= totalValue; v++) if (f[v] <= capacity) answer = v;
    cout << answer << '\n';
    return 0;
}
```

总重量可到 10¹¹，用 `long long`；f 表示恰好价值，因此除 0 外必须是 INF。复杂度 O(n·Σvalue)，本题约一千万次候选，空间 O(Σvalue)。

## 三类优化不要混为一谈

1. **状态压缩或维度交换：** 改变要保存的信息，先证明同一状态可以舍弃哪些历史。
2. **转移优化：** 状态不变，用前缀和、队列、树或几何关系更快找最佳候选。
3. **滚动数组：** 只减少存储，不自动降低计算量；还可能影响恢复方案与同层使用关系。

估算时同时考虑常数和内存。例如二维表 n×m 个 `long long` 需要约 8nm 字节；时间勉强能接受，不代表内存也够。每秒约 10⁸ 次简单操作只是常用估算，容器、浮点和输入输出还会增加开销。

## 练习：先给朴素版本算一次账

先**独立重做本例**，对小 n 枚举子集；再把两种容量定义写在纸上，说明为什么新表能回答旧目标。

### 推荐必做

1. [P1048 采药](https://www.luogu.com.cn/problem/P1048)：在时间限制内选择草药，使价值总和最大。练习分别用时间和价值定义状态，并比较状态规模。
2. [P1507 NASA的食物计划](https://www.luogu.com.cn/problem/P1507)：每种食物只能选一次，体积和质量都有限制，求最大热量。练习决定必须保留哪些状态维度，并按倒序处理选择。

### 选做巩固

- [P1156 垃圾陷阱](https://www.luogu.com.cn/problem/P1156)：每件垃圾可以吃或堆放，求最早逃出的时间；无法逃出时求最长生存时间。练习以高度为状态保存最晚存活时刻。
- [P1776 宝物筛选](https://www.luogu.com.cn/problem/P1776)：每种宝物数量有限，在重量限制下求最大价值。练习压缩物品数量维，并比较不同的转移方式。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[动态规划的设计与优化 #225](https://www.luogu.com.cn/training/225)。

## 本节验收

能计算状态数与候选数；能根据范围选择容量或价值维；能区分时间优化与存储压缩，并保持状态与初值的准确性。
