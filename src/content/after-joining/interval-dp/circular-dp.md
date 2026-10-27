---
title: 环形问题与断环成链
description: 将环复制成两倍长度，只处理恰好覆盖原环的一段窗口，避免把复制的元素重复当作新资源。
---

## 这一节学什么

环上没有固定的左端点。若一次最终合并可以在某处切开成线性序列，就复制数组，把每种切法变成长度为 n 的连续窗口，再使用区间 DP。

> **AI 伴学提示词**
>
> 为我讲解断环成链，用四堆石子画出不同切口和双倍数组，解释为什么只取长度 n 的窗口，并引导我提问。

## 例题精讲：P1880 · 石子合并

**原题：** [P1880 · 石子合并](https://www.luogu.com.cn/problem/P1880)。

**题意简述：** n 堆石子排成环，每次合并相邻两堆并支付它们的总石子数，求合成一堆的最小、最大总费用。n≤100，石子数在 0 到 20 之间。

输入 `3` 和 `1 2 3`，输出最小费用 `9`、最大费用 `11`，各一行。先合 1、2，费用 3+6=9；先合 2、3，费用 5+6=11。

## 每一种切口都变成一个窗口

原数组 1、2、3 复制成 1、2、3、1、2、3。起点 1、2、3 分别取 [1,3]、[2,4]、[3,5]，代表环上所有线性切法。区间长度不能超过 n，否则就真的重复使用某堆石子了。

环上最后一次合并会把整个环分成两个相邻部分，选择它们之间的一条边作为切口，这次合并及之前的操作就能在线性窗口中表达。枚举所有切口不会漏解；反过来，窗口中的相邻合并也都是合法环操作。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<long long> a(2 * n + 1), prefix(2 * n + 1);
    for (int i = 1; i <= n; i++) { cin >> a[i]; a[i+n] = a[i]; }
    for (int i = 1; i <= 2 * n; i++) prefix[i] = prefix[i-1] + a[i];
    const long long INF = (1LL << 62);
    vector<vector<long long>> small(2*n+2, vector<long long>(2*n+2));
    vector<vector<long long>> large = small;
    for (int length = 2; length <= n; length++) {
        for (int l = 1; l + length - 1 <= 2 * n; l++) {
            int r = l + length - 1;
            small[l][r] = INF;
            long long sum = prefix[r] - prefix[l-1];
            for (int k = l; k < r; k++) {
                small[l][r] = min(small[l][r], small[l][k] + small[k+1][r] + sum);
                large[l][r] = max(large[l][r], large[l][k] + large[k+1][r] + sum);
            }
        }
    }
    long long answerMin = INF, answerMax = 0;
    for (int start = 1; start <= n; start++) {
        answerMin = min(answerMin, small[start][start+n-1]);
        answerMax = max(answerMax, large[start][start+n-1]);
    }
    cout << answerMin << '\n' << answerMax << '\n';
    return 0;
}
```

单堆费用为 0，n=1 时不执行合并循环，两个答案都是 0。石子非负，所以最大费用表可初始化为 0；若问题允许负收益，应重新检查最大化的不可达初值。

时间 O(n³)、空间 O(n²)。虽然复制成两倍，长度仍只计算到 n，复杂度的量级没有变化。

## 环不一定都能无条件复制后取窗口

先说明切口怎样与合法方案对应。有些环形选择需要额外限制首尾相容，有些状态还要保存第一个元素的选择；复制数组只是表达方式，不能替代这些约束。

## 练习：把每个窗口对应的原环顺序写出来

先**独立重做 P1880**，对 n≤7 枚举每次可合并的相邻堆，检查最大与最小费用。

### 推荐必做

1. **自编 · 线性与环形比较：** 对同一组石子分别输出线性和环形答案，构造必须跨原数组首尾合并才更优的数据。
2. **自编 · 指定切口：** 只允许在给定位置切开，求该窗口的合并费用，区分“单个窗口”和“枚举全环”。

### 选做巩固

- **自编 · 恢复环形合并：** 记录最优起点和分割点，将复制数组编号映射回 1…n，输出原堆编号。
- **自编 · 全部为零：** 观察最小、最大与并列切口，确认初始化不会把没有发生的合并计入费用。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[区间与环形动态规划 #213](https://www.luogu.com.cn/training/213)。

## 本节验收

能建立切口与窗口的对应；能解释长度不超过 n 的原因；能将线性转移用于环形，并正确处理单堆和并列答案。
