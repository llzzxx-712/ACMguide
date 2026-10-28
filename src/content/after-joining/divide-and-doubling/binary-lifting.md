---
title: 倍增：预处理跳跃与二进制拆分
description: 预先计算一步、两步、四步的去向，把很长的重复操作拆成少量二的幂次跳跃。
---

## 这一节学什么

若每个位置都规定了唯一的下一站，直接走 k 步需要重复 k 次。倍增把同样的操作预先组合起来：走 2 步等于走两次 1 步，走 4 步等于走两次 2 步，之后再用二进制把任意 k 拆开。

> **AI 伴学提示词**
>
> 为我讲解二进制、位移与倍增，用五站传送装置手算 1、2、4、8 步的去向，再把 13 步拆开，对照代码并引导我提问。

## 二进制：用 1、2、4、8 表示次数

十进制按 1、10、100 的位权写数；二进制按 1、2、4、8、16 的位权写数，每位只能是 0 或 1。

```text
13 = 8 + 4 + 1
二进制：1101
位权：  8 4 2 1
该位：  1 1 0 1
```

对于非负整数 k，`k >> j` 表示向右移 j 位，也就是除以 2^j 后向下取整。`&` 是按位与，和 1 做按位与就只保留最后一位，所以 `(k >> j) & 1` 能判断原数第 j 位是否为 1。位编号从 0 开始，第 0 位对应 1，第 3 位对应 8。

```text
int bit = (k >> j) & 1; // k 为非负整数，读取第 j 位
long long step = 1LL << j; // 得到 2^j，本节 j 不超过 59
```

1LL 表示 long long 类型的 1，先让运算在 64 位整数中进行；不能拿普通 int 的 1 去左移 40 位。后面读取二进制能力标记、使用 01 Trie 时，也会用到相同写法。

## 例题精讲：[CF702E Analysis of Pathes in Functional Graph](https://codeforces.com/problemset/problem/702/E)

**题意简述：** 每个点恰有一条出边 u→f[u]，边权为 w[u]。对每个起点输出恰走 k 条边的权值和、最小边权，允许重复经过点和边。编号为 0…n−1，n≤10⁵、1≤k≤10¹⁰、0≤w≤10⁸。输入 n、k，再给 n 个后继及 n 个边权。

自编输入：

```text
3 3
1 2 1
5 2 4
```

输出：

```text
11 2
8 2
10 2
```

### 先把思路讲清楚

先只想一个问题：从 u 连续走 2ʲ 步，最后在哪里？把这段拆成两段 2ʲ⁻¹ 步，先到 mid=to[j−1][u]，再到 to[j−1][mid]。于是 to[j][u] 由两份较小的跳跃组合出来。环不会影响它，重复经过同一条边仍算一次新的行走。

### 同时记录这段路的信息

题目还问总和与最小值，就给每段跳跃再存 sum[j][u]、minimum[j][u]。合并两半时，总和相加，最小值取 min。第一层是一条边：目的地 f[u]、权值和 w[u]、最小值 w[u]。

样例从 0 走三步的边权为 5、2、4，得到 11 和 2。从 1 出发则是 2、4、2，得到 8 和 2。手画箭头再数边，注意包含起点的出边，而非先走到下一个点才取权。

### 按 k 的二进制拼接

k=13=1+4+8，按当前 u 先取 1 步，再取 4 步、8 步。每取一段，先合并该段的和与最小值，再把 u 更新为段末位置。代码中的三个表和三个更新，逐一对应“走到哪、累计多少、途中最小多少”。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    long long k;
    cin >> n >> k;
    const int LOG = 34;
    vector<vector<int>> to(LOG, vector<int>(n));
    vector<vector<long long>> sum(LOG, vector<long long>(n));
    vector<vector<int>> minimum(LOG, vector<int>(n));
    for (int i = 0; i < n; i++) cin >> to[0][i];
    for (int i = 0; i < n; i++) {
        cin >> minimum[0][i];
        sum[0][i] = minimum[0][i];
    }
    for (int j = 1; j < LOG; j++) {
        for (int u = 0; u < n; u++) {
            int mid = to[j - 1][u];
            to[j][u] = to[j - 1][mid];
            sum[j][u] = sum[j - 1][u] + sum[j - 1][mid];
            minimum[j][u] = min(minimum[j - 1][u], minimum[j - 1][mid]);
        }
    }
    for (int start = 0; start < n; start++) {
        int u = start, smallest = 1000000000;
        long long total = 0;
        for (int j = 0; j < LOG; j++) if ((k >> j) & 1LL) {
            total += sum[j][u];
            smallest = min(smallest, minimum[j][u]);
            u = to[j][u];
        }
        cout << total << ' ' << smallest << '\n';
    }
    return 0;
}
```

k<2³⁴，所以存 j=0…33。预处理、全部起点查询均为 O(n log k)，空间 O(n log k)。单个回答的和最多 10¹⁸，sum 使用 long long；k≥1，最小值总会被至少一段真实路径更新。

## 练习：先确定要组合的信息

先**独立重做 CF702E**，手算从各个点走 k 条边的和与最小值，测试 k=1、自环、绕环多圈，以及超过 int 范围的 k。

### 推荐必做

1. [P1226 · 快速幂](https://www.luogu.com.cn/problem/P1226)：计算 a^b mod p。每次乘法后取模，乘法在 long long 中完成，保留原 a、b、p 用于输出；按题目格式用 printf 输出 `a^b mod p=s`。练习二进制拆分与操作组合。
2. [AT_abc167_d · Teleporter](https://www.luogu.com.cn/problem/AT_abc167_d)：从 1 号城镇出发，经过 K 次传送后输出所在城镇。根据 K≤10^18 准备足够的倍增层数，练习按二进制组合跳转。

### 选做巩固

- [AT_abc241_e · Putting Candies](https://www.luogu.com.cn/problem/AT_abc241_e)：每次按当前糖数对 N 的余数决定加入的糖数，求 K 次后的总数。把余数当状态，倍增维护终点与累计数量。
- [AT_abc179_e · Sequence Sum](https://www.luogu.com.cn/problem/AT_abc179_e)：数列下一项是当前值平方对 M 取模，求前 N 项的和。将数值视为状态，记录跳转及经过项之和，注意 64 位范围。

## 本节验收

能读出一个非负整数的二进制位；能解释两次半程组成整程的下标；能根据最大步数决定跳表层数，并把终点、费用等信息按题意组合。
