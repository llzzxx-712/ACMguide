---
title: 位运算、集合表示与子集枚举
description: 给小集合中的元素分配二进制位，用整数作为状态编号，再枚举指定集合的全部子集。
---

## 这一节学什么

第一板块已经学过逐位操作。现在让第 i 位表示第 i 个元素是否在集合中，整个整数就成了一种集合状态的编号。集合不关心加入顺序，恰好可以把大量不同顺序合并到同一个 mask。

> **AI 伴学提示词**
>
> 为我讲解二进制集合、交并差和子集枚举，手算 s=(s-1)&mask 的过程，解释空集与结束条件，并引导我提问。

## 数字与集合怎样对应

元素编号为 0…n−1，mask 的第 i 位为 1 就选了它。比如 0101 表示 {0,2}，1111 表示四个元素全选。

| 集合操作 | 位运算 |
| --- | --- |
| 检查 i 是否在集合中 | `(mask >> i) & 1` |
| 加入 i | `mask | (1 << i)` |
| 已知 i 存在时删除 i | `mask ^ (1 << i)` |
| 交集、并集 | `a & b`、`a | b` |
| 从 a 中去掉 b 的元素 | `a & ~b` |

本章 n 很小，所有 mask 在非负 `int` 范围内；涉及更高位时应像 1.9 一样选择足够宽的类型。补集若只限于 n 个元素，应写 full^mask，full=(1<<n)−1，不能直接把整数全部高位也取反。

## 例题精讲：[CF550B Preparing Olympiad](https://codeforces.com/problemset/problem/550/B)

**题意简述：** 从 n 道题中选至少两道，总难度在 `[L, R]`，最高与最低难度之差至少 X，求选题方案数。n≤15，每题难度≤10⁶。输入 n、L、R、X，接着 n 个难度，输出方案数。

自编输入：

```text
3 5 6 1
1 2 3
```

输出：

```text
2
```

### 先把思路讲清楚

每道题只有选与不选，直接把选择集合写成 mask。枚举 0…2ⁿ−1，对每个为 1 的位累计数量、和、最小值、最大值，再检查三个条件。样例中 {2,3} 与 {1,2,3} 合法，所以答案为 2；相同难度的不同题目仍是不同位置，不能去重。

第 i 位对应 `a[i]`，`(mask>>i)&1` 就是在问“这一道题选没选”。n=15 时仅有 32768 个集合，每个最多检查 15 个位置，暴力足够。先用它理解集合与位的对应，后面再学习只枚举某个指定集合的子集。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, L, R, difference;
    cin >> n >> L >> R >> difference;
    vector<int> a(n);
    for (int &x : a) cin >> x;
    int answer = 0;
    for (int mask = 0; mask < (1 << n); mask++) {
        int count = 0, sum = 0, smallest = INT_MAX, largest = INT_MIN;
        for (int i = 0; i < n; i++) if ((mask >> i) & 1) {
            count++;
            sum += a[i];
            smallest = min(smallest, a[i]);
            largest = max(largest, a[i]);
        }
        if (count >= 2 && L <= sum && sum <= R && largest - smallest >= difference) answer++;
    }
    cout << answer << '\n';
    return 0;
}
```

时间 $\mathcal{O}(n2^{n})$，空间 $\mathcal{O}(n)$。先检查 count≥2，才把最大最小差作为合法候选条件；空集和单元素都不能算入。

## 只枚举指定集合的子集

当题目只允许使用 mask 中的元素，可以从 s=mask 开始，反复令 s=(s−1)&mask。减一清除最低的 1，并把右边置 1；再与 mask，筛掉不允许的位。例如 `mask = 101` 时依次得到 101→100→001→000。

```text
for (int s = mask; ; s = (s - 1) & mask) {
    // 处理子集 s
    if (s == 0) break;
}
```

先处理 0 再退出，空集也恰好枚举一次；不退出会重新回到 mask。若 mask 有 k 个元素，共有 2ᵏ 个子集。如果对所有 mask 又枚举全部子集，总数为 3ⁿ，因为每个元素有“不在 mask”“在 mask 但不在 s”“在 s”三种归属。

## 练习：先画集合，再看整数

先**独立重做本例**，用普通“选/不选”递归核对，检查不足两道、总难度恰好在边界、难度差恰好等于 X。

### 推荐必做

1. [P1441 砝码称重](https://www.luogu.com.cn/problem/P1441)：去掉指定数量的砝码后，使剩余砝码能称出的不同正重量最多。练习枚举去掉的集合，并用背包统计可达重量。
2. [P5911 PRZ](https://www.luogu.com.cn/problem/P5911)：按承重限制分批过桥，每批时间由最慢的人决定，求最少总时间。练习预处理子集重量和耗时，再枚举可行子集。

### 选做巩固

- [P3052 Cows in a Skyscraper](https://www.luogu.com.cn/problem/P3052)：把奶牛分批装入限重电梯，使运行次数最少。练习用集合记录已经运送的奶牛，并判断一批的重量。
- [P2831 愤怒的小鸟](https://www.luogu.com.cn/problem/P2831)：选择最少抛物线轨迹消灭所有小猪。练习用位集合表示一次覆盖的小猪，以及已经消灭的集合。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[状态压缩动态规划 #215](https://www.luogu.com.cn/training/215)。

## 本节验收

能把小集合映射为整数；能正确处理交并差与有限全集补集；能解释子集枚举和空集停止条件，并估算 2ⁿ 与 3ⁿ。
