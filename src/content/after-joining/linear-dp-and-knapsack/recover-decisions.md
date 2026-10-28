---
title: 记录决策与还原方案
description: 将最优值的来源保存或重新找出，沿合法前驱逆向还原一份真实方案。
---

## 这一节学什么

DP 表不只是一组最终数值，每次更新都来自一个具体选择。题目要求输出路线、物品编号或编辑过程时，沿这些前驱回走，就能把值变成方案。

> **AI 伴学提示词**
>
> 为我讲解 DP 方案恢复，用 0/1 背包追踪每件物品选或不选，解释为什么恢复过程不能被后续更新覆盖，并引导我提问。

## 例题精讲：[P1759 通天之潜水](https://www.luogu.com.cn/problem/P1759)

**题意简述：** 每件潜水工具有重量 a、阻力 b、可支持时间 c，重量总和不超过 m，阻力总和不超过 v，求最长时间并输出所选编号。第一行 m、v、n，后面 n 行 a、b、c。m、v≤200，n≤100。有多个最优方案时，编号序列要尽量靠前，按字典序最小输出。

自编输入：

```text
5 5 3
3 3 5
2 2 5
5 5 10
```

输出：

```text
10
1 2
```

### 先把思路讲清楚

选 {1,2} 与 {3} 都有时间 10，但 [1,2] 的字典序更小。题目要求的不仅是一个最优值，还要求按规则选出对应的决策。

### 用后缀状态，方便优先尝试小编号

令 f[i][w][r] 表示仅用 i…n 号工具，在剩余重量 w、阻力 r 内能得到的最大时间。第 i 件不取，读 f[i+1][w][r]；能取则读 c[i]+f[i+1][w−a[i]][r−b[i]]。从 i=n 往前算，全部依赖都在下一层。

### 从小编号开始恢复

从 i=1、完整容量出发。如果“取第 i 件”仍能达到当前最优值，就先取它，并扣减两种容量；否则跳过。两种选择同样最优时，取当前较小编号能使第一个不同位置尽量小。如果剩余最优值已经为 0，则结束，避免在方案末尾额外追加无收益工具。

这比在已滚动覆盖的一维表里随意跟随 parent 更清楚：每次决定都能查到物品层没有被改写的下一层状态。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int weightLimit, resistanceLimit, n;
    cin >> weightLimit >> resistanceLimit >> n;
    vector<int> weight(n + 1), resistance(n + 1);
    vector<long long> value(n + 1);
    for (int i = 1; i <= n; i++) cin >> weight[i] >> resistance[i] >> value[i];
    vector<vector<vector<long long>>> f(n + 2,
        vector<vector<long long>>(weightLimit + 1, vector<long long>(resistanceLimit + 1)));
    for (int i = n; i >= 1; i--) {
        for (int w = 0; w <= weightLimit; w++) {
            for (int r = 0; r <= resistanceLimit; r++) {
                f[i][w][r] = f[i + 1][w][r];
                if (weight[i] <= w && resistance[i] <= r) {
                    f[i][w][r] = max(f[i][w][r], value[i]
                        + f[i + 1][w - weight[i]][r - resistance[i]]);
                }
            }
        }
    }
    int w = weightLimit, r = resistanceLimit;
    cout << f[1][w][r] << '\n';
    vector<int> answer;
    for (int i = 1; i <= n && f[i][w][r] > 0; i++) {
        if (weight[i] <= w && resistance[i] <= r
            && f[i][w][r] == value[i] + f[i + 1][w - weight[i]][r - resistance[i]]) {
            answer.push_back(i);
            w -= weight[i];
            r -= resistance[i];
        }
    }
    int count = answer.size();
    for (int i = 0; i < count; i++) cout << answer[i] << (i + 1 == count ? '\n' : ' ');
    if (answer.empty()) cout << '\n';
    return 0;
}
```

时间 O(nmv)，保存完整表的空间 O(nmv)，最大约四百万个 long long，约 32 MB。恢复只扫 n 件。独立检查输出编号不重复、两种约束都满足、总时间等于最优值，并检查同值时的字典序。

## 一维优化为什么可能弄丢前驱

一维容量表把旧物品层覆盖了。如果只记“容量 c 来自 c−w”，以后 c−w 的前驱又被改写，最终回溯可能拼接不同物品层，甚至重复选某件。恢复需要保存层号、独立的决策表或不可变的前驱记录，不能只留下会被覆盖的容量下标。

LCS 可以从右下角看相等字符与上下候选；编辑距离可以记录插入、删除或替换；网格 DP 可以记录来自上方还是左方。共同点都是：沿一个确实达到当前最优值的合法来源，走向更小子问题。

## 练习：不仅验证最优值，还要验证输出方案

先**独立重做本例**。检查编号互异、总重量和总阻力均不超限制、总时间等于输出值；小数据再用子集枚举检查这个值是否最优。

### 推荐必做

1. [CF 4D · Mysterious Present](https://codeforces.com/problemset/problem/4/D)：选择最多个长宽均严格递增且能装下卡片的信封，并输出编号。记录每个状态的前驱，回溯后按从小到大输出。

### 选做巩固

- [P1040 · 加分二叉树](https://www.luogu.com.cn/problem/P1040)：给定中序顺序和节点分数，求最高加分及对应的前序遍历。记录各区间选择的根，再递归恢复树。
- [CF 20C · Dijkstra?](https://codeforces.com/problemset/problem/20/C)：在无向带权图中输出从 1 到 n 的一条最短路径，不可达输出 −1。每次改善距离时记录前驱，比较图上路径与 DP 方案的恢复方式。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线性状态动态规划 #212](https://www.luogu.com.cn/training/212)。

## 本节验收

能从最优值找到对应选择；能处理相等候选；能解释一维覆盖对恢复的影响，并独立检查输出方案的合法性与最优性。
