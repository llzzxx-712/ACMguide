---
title: 容斥原理与补集计数
description: 先决定直接数还是数反面，再通过重复计数的次数理解容斥的正负号。
---

## 这一节学什么

“至少一个条件成立”常常有重叠。例如 1…10 中被 2 整除的有 5 个，被 3 整除的有 3 个，直接相加却把 6 数了两次。容斥就是有规律地纠正这些重复。

> **AI 伴学提示词**
>
> 为我用画集合和枚举小数的方式讲解容斥，再解释为什么三集合交集要加回来，并引导我对正负号和补集计数提问。

## 为什么是加、减、加

两个集合的并集大小为 |A|+|B|−|A∩B|。三个集合还要减去三对交集，再加回三者交集。

看一个属于 t 个条件的元素：它在所有单集合中被加 t 次，在两两交集中被减 C(t,2) 次……总系数为 Σ(k=1…t)(−1)^(k+1)C(t,k)=1，恰好只留下它一次。这解释了所有非空条件子集都要参与，而不只是单个条件与两两交集。

另一条思路是**数反面**：至少一个相邻位置相同的序列，可以用所有序列减去所有相邻位置都不同的序列。先比较两边哪一边容易数，再决定是否需要容斥。

## 例题精讲：自编 · 至少被一个数整除

**题意简述：** 输入 N≤10¹²、k≤15，再输入 k 个 2…10⁹ 的整数 d，统计 1…N 中至少被一个 d 整除的整数个数。d 不保证互质，也可能重复。

输入 `10 2`，下一行 `2 3`，输出 `7`：5+3−1。某个子集的交集表示“同时被这些数整除”，应取它们的**最小公倍数**，不能直接相乘；例如 4、6 的共同倍数以 12 为周期。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

long long gcdValue(long long a, long long b) {
    while (b != 0) { long long r = a % b; a = b; b = r; }
    return a;
}

int main() {
    long long n;
    int k;
    cin >> n >> k;
    vector<long long> d(k);
    for (auto &x : d) cin >> x;
    long long answer = 0;
    for (int mask = 1; mask < (1 << k); mask++) {
        long long multiple = 1;
        int count = 0;
        bool tooLarge = false;
        for (int i = 0; i < k; i++) if (mask & (1 << i)) {
            count++;
            long long factor = d[i] / gcdValue(multiple, d[i]);
            if (multiple > n / factor) { tooLarge = true; break; }
            multiple *= factor;
        }
        if (tooLarge) continue;
        if (count % 2 == 1) answer += n / multiple;
        else answer -= n / multiple;
    }
    cout << answer << '\n';
    return 0;
}
```

“先除 gcd 再乘”仍可能溢出，所以在乘法前比较 `multiple>n/factor`。一旦最小公倍数超过 N，这个交集为空，后续再取 lcm 也不会变小，可以直接跳过。

共 2ᵏ−1 个子集，每个最多处理 k 个数，含 gcd 的时间上界 O(k·2ᵏ·log N)，空间 O(k)。即使中间带符号累计量比最终答案大，本例也不超过约 2¹⁵N，long long 足够。

## 练习：先数直接枚举能验证的小范围

先**独立重做例题**，加入 4、6、重复的 2，检查取 lcm 后是否仍与逐个枚举一致。

### 推荐必做

1. [P3197 越狱](https://www.luogu.com.cn/problem/P3197)：统计至少一对相邻房间信仰相同的状态；练习用总数减去每对相邻都不同的状态。
2. **自编 · 没被任何数整除：** 把本例改为统计一个条件也不满足的数，说明为什么用 N 减去并集大小即可。

### 选做巩固

- **自编 · 至少一个盒子为空：** 小 n 个不同球放入 k 个不同盒子，用容斥统计全部非空的方案。
- **自编 · 集合次数表：** 对三个集合的八种归属情况列出容斥系数，验证每个并集内元素最终系数为 1。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[组合数学与计数 #217](https://www.luogu.com.cn/training/217)。

## 本节验收

能先选择直接计数或补集；能解释容斥的正负号；能把共同整除转成 lcm，并在乘法前检查范围。
