---
title: 分治优化与综合状态设计
description: 在决策位置单调时，先求中点最优决策，再缩小左右状态的候选范围。
---

## 这一节学什么

有些分层 DP 的最佳分割点会随着终点向右移动而不向左退。这种“决策单调性”可以让分治帮我们少枚举候选。它必须由代价性质证明，不能仅靠随机数据上看起来单调。

> **AI 伴学提示词**
>
> 为我讲解分层 DP 的分治优化，手算中点最优决策如何限制两边，解释本例四边形不等式与并列规则，并引导我提问。

## 例题精讲：自编 · 恰好分成 k 组

**题意简述：** n 个非负整数分成恰好 k 个非空连续组，每组费用为组内总和的平方，求最小总费用。n≤10⁵、k≤min(n,30)，所有数之和≤10⁶。输入 n、k，再输入序列。

输入 `3 2` 和 `1 2 3`，输出 `18`，分为 [1,2]、[3]，费用 3²+3²；另一种切法为 1²+5²=26。

## 固定分组层，先看朴素转移

令 previous[j] 为前 j 项分成 g−1 组的最小值，当前组为 j+1…i：

```text
current[i] = min previous[j] + (prefix[i]-prefix[j])²
g-1 ≤ j < i
```

直接枚举所有 i、j 是 O(kn²)。如果最优切点 opt[i] 不减，已知中点 mid 的 best 后，左半最优切点不超过 best，右半不小于 best。

## 为什么本例有决策单调性

对 j₁≤j₂≤i₁≤i₂，令 C(j,i)=(S[i]−S[j])²，可以展开得到：

```text
C(j1,i2)+C(j2,i1)-C(j1,i1)-C(j2,i2)
= 2*(S[j2]-S[j1])*(S[i2]-S[i1]) >= 0
```

非负元素使前缀和不减。这个不等式使交叉的较差选择可以交换成不劣的有序选择，因此每个 i 都取最左侧最优切点时，opt 随 i 不减。previous[j] 只按候选 j 加一个固定项，不改变上述比较。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, groups;
    cin >> n >> groups;
    vector<long long> prefix(n + 1);
    for (int i = 1; i <= n; i++) { long long x; cin >> x; prefix[i] = prefix[i-1] + x; }
    const long long INF = (1LL << 62);
    vector<long long> previous(n + 1, INF), current(n + 1);
    previous[0] = 0;
    for (int g = 1; g <= groups; g++) {
        fill(current.begin(), current.end(), INF);
        function<void(int, int, int, int)> solve = [&](int l, int r, int optL, int optR) {
            if (l > r) return;
            int mid = (l + r) / 2, best = -1;
            for (int j = optL; j <= min(optR, mid - 1); j++) if (previous[j] != INF) {
                long long sum = prefix[mid] - prefix[j];
                long long candidate = previous[j] + sum * sum;
                if (candidate < current[mid]) { current[mid] = candidate; best = j; }
            }
            solve(l, mid - 1, optL, best);
            solve(mid + 1, r, best, optR);
        };
        solve(g, n, g - 1, n - 1);
        previous.swap(current);
    }
    cout << previous[n] << '\n';
    return 0;
}
```

候选 j 升序，只在严格更小时更新，保留最左最优切点。当前层只计算 i≥g，保证能分成 g 个非空组；previous 只有上一层的合法状态参与。

每层分治在每个深度扫描的候选总量为 O(n)，深度 O(log n)，总时间 O(kn log n)，滚动空间 O(n)，函数递归深度 O(log n)。前缀和平方≤10¹²，用 long long。

## 优化之前与之后都保留同一个状态解释

分治没有改 f[g][i] 的含义，只缩小寻找最优前驱的范围。若代价函数改成别的形式，必须重新证明单调性；若数组允许负数，上面的前缀差乘积也未必非负，不能继续使用同一结论。

## 练习：先用朴素表打印 opt

先**独立重做本例**，对 n≤80 写 O(kn²) 版本，比较每层值与最左 opt，再测试全零、k=1、k=n。

### 推荐必做

1. **自编 · 输出组边界：** 保存每层 opt，恢复恰好 k 个非空段，核算总费用。
2. **自编 · 比较三种计算：** 小范围枚举所有 k−1 个切口、中范围朴素 DP、大范围分治优化，验证同一状态在不同实现下答案一致。

### 选做巩固

- **自编 · 负数反例：** 寻找允许负元素后 opt 不单调的数据，说明优化条件失效的位置。
- **自编 · 并列最优：** 用全零数组检查统一取最左决策的规则，避免左右候选区间互相冲突。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[动态规划的设计与优化 #225](https://www.luogu.com.cn/training/225)。

## 本节验收

能区分状态单调与决策单调；能用中点决策限制左右范围；能检查代价性质、并列规则与可达边界，再选择优化实现。
