---
title: 子集 DP 与路径状态
description: 用已访问集合和最后位置概括路径历史，把不同访问顺序合并成同一个后续任务。
---

## 这一节学什么

旅行中下一步能去哪里，取决于已经去过哪些点；费用还取决于当前在哪里。只记集合不够，只记最后一个点也不够，两个信息组合起来就是常见的子集路径状态。

> **AI 伴学提示词**
>
> 为我讲解集合加终点的 DP，用吃奶酪对照全排列枚举，解释为什么相同集合和终点只保留最小费用，并引导我提问。

## 例题精讲：P1433 · 吃奶酪

**原题：** [P1433 · 吃奶酪](https://www.luogu.com.cn/problem/P1433)。

**题意简述：** 从原点出发，访问平面上全部奶酪，求最短行走距离，不要求回到原点。n≤15，输出保留两位小数。

输入 `2`，坐标为 `(1,0)、(3,0)`，输出 `3.00`。从 0 先到 1 再到 3；不能最后自动加回原点的距离，因为题目没有返回要求。

## 从全排列搜索中合并重复子问题

两条历史若访问集合 mask 相同、最后停在同一点 u，接下来可去的点与边长完全一样。历史中花费更大的那条不会变得更优，因此只保留最小值。

f[mask][u] 表示从原点出发，恰好访问 mask，最后停在 u 的最短距离。起步状态为 f[1<<u][u]=原点到 u 的距离；转移枚举不在 mask 中的 v，把它加入集合。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<double> x(n), y(n);
    for (int i = 0; i < n; i++) cin >> x[i] >> y[i];
    vector<vector<double>> distance(n, vector<double>(n));
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) {
        double dx = x[i] - x[j], dy = y[i] - y[j];
        distance[i][j] = sqrt(dx * dx + dy * dy);
    }
    const double INF = 1e100;
    int states = 1 << n;
    vector<vector<double>> f(states, vector<double>(n, INF));
    for (int u = 0; u < n; u++) f[1<<u][u] = sqrt(x[u]*x[u] + y[u]*y[u]);
    for (int mask = 1; mask < states; mask++) {
        for (int u = 0; u < n; u++) if ((mask >> u) & 1) {
            if (f[mask][u] == INF) continue;
            for (int v = 0; v < n; v++) if (!((mask >> v) & 1)) {
                int next = mask | (1 << v);
                f[next][v] = min(f[next][v], f[mask][u] + distance[u][v]);
            }
        }
    }
    double answer = *min_element(f.back().begin(), f.back().end());
    printf("%.2f\n", answer);
    return 0;
}
```

加入新元素后 mask 的数值一定变大，所以按 mask 升序就符合依赖。f.back() 对应全部点已访问，终点不限，再对最后位置取最小值。

时间 O(2ⁿn²)、空间 O(2ⁿn)，n=15 时有 32768 个集合，远少于 15! 个全排列。格式化输出统一用 printf，double 用 %.2f。

## 不同路径任务，改哪里

若要回起点，最终候选再加终点到起点距离；若图上有禁行边，只有存在的边才能转移；若数哈密顿路径，把 min 改成方案数相加，并明确固定起点与终点。

状态里 mask 必须真的包含 u，否则这条“已经访问的历史”本身不合法。通过初始化与只向新集合转移，自然维持这个条件。

## 练习：让每个状态对应一类真实路径

先**独立重做 P1433**，对 n≤8 枚举所有访问顺序核对，测试共线点、重合坐标和某点就在原点。

### 推荐必做

1. **自编 · 回到起点：** 将例题改成旅行环，修改最终答案，比较同一数据的两种目标。
2. **自编 · 哈密顿路径计数：** n≤18，给有向无权图，从固定起点访问每点一次，统计到指定终点的方案数，对 10⁹+7 取模。

### 选做巩固

- **自编 · 恢复访问顺序：** 更新 f 时保存前一个终点，回溯时同时删除当前点对应的位。
- **自编 · 固定部分先后：** 访问 v 前要求某个先修集合已包含于 mask，检查条件后再转移。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[状态压缩动态规划 #215](https://www.luogu.com.cn/training/215)。

## 本节验收

能解释集合与终点为什么都需要；能把全排列搜索合并为 DP；能准确处理初始化、终点条件与是否返回起点。
