---
title: 树状数组、lowbit 与单点修改区间查询
description: 每个位置保存一段长度为 lowbit 的区间，用少量区间拼成前缀，并让单点修改沿包含它的区间更新。
---

## 这一节学什么

前缀和建好后，查询区间很快，但一个元素变化可能影响后面许多前缀。树状数组把前缀拆成少量区间来保存，使单点修改和前缀查询都只访问 $\mathcal{O}(\log  n)$ 个位置。

> **AI 伴学提示词**
>
> 为我讲解 lowbit 和树状数组，画出长度 8 的各个存储区间，手算修改第 5 位与查询前 7 位，解释每次加减 lowbit，并引导我提问。

## lowbit：取出最低的那一个 1

对正整数 $x$，`lowbit(x) = x & (-x)`，得到它二进制中最低一个 1 对应的数值：

| $x$ | 二进制 | `lowbit(x)` |
| --- | --- | --- |
| 5 | 0101 | 1 |
| 6 | 0110 | 2 |
| 8 | 1000 | 8 |
| 12 | 1100 | 4 |

正数变为其负数时，补码可以理解为按位取反再加一；最低那个 1 以下的零仍为零，更高位正好与原数相反，所以按位与只留下这个最低的 1。

本节下标最多几十万，使用 `int` 即可；lowbit 的输入是正下标，不会遇到 `int` 最小值取负的情况。先理解它表示的长度，随后看数组怎样组织区间。

## $\mathrm{bit}$[$i$] 保存的是哪一段

定义 `bit[i]` 为闭区间 $[i-\operatorname{lowbit}(i)+1,i]$ 的总和。长度 $n=8$ 时：

```text
bit[1]：[1,1]
bit[2]：[1,2]
bit[3]：[3,3]
bit[4]：[1,4]
bit[5]：[5,5]
bit[6]：[5,6]
bit[7]：[7,7]
bit[8]：[1,8]
```

它与普通前缀和数组不同。`bit[6]` 只保存第 `5 6` 项，并不是前 6 项的和；我们要用几段 $\mathrm{bit}$ 区间拼成完整前缀。

## 查询前缀：每次去掉已经统计的末段

查询前 7 项：先取 `bit[7]`，得到 $[7, 7]$；令 `x = 7 - lowbit(7) = 6`，接着取 `bit[6]` 的 $[5, 6]$；再令 `x = 6 - 2 = 4`，取 `bit[4]` 的 $[1, 4]$。

```text
前 7 项 = [1,4] + [5,6] + [7,7]
访问下标：7 → 6 → 4 → 0
```

这些区间互不重叠，连起来恰好覆盖 $[1, 7]$。$x$ 每次减去 `lowbit(x)`，等于去掉二进制最低的 1，因此最多走 $\mathcal{O}(\log  n)$ 步。

## 修改一个位置：更新所有包含它的存储区间

第 5 项增加 $\mathrm{delta}$ 时，长度为 8 的树状数组中，`bit[5]`、`bit[6]`、`bit[8]` 的区间都包含它，分别也要增加 $\mathrm{delta}$：

```text
5 → 5+lowbit(5)=6 → 6+lowbit(6)=8 → 超过 n
```

加 lowbit 会到达更大的、仍包含原位置的区间。其他 $\mathrm{bit}$ 区间没有包含第 5 项，不用修改。这是代码里“查询向前减、修改向后加”的来源，不是两种需要死记的方向。

## 动图：每个下标对应哪一段

先选择“查询前 7 项”，逐步观察 7→6→4：对应 $[7, 7]$、$[5, 6]$、$[1, 4]$，绿色部分拼起来正好是前 7 项，$\mathrm{answer}$ 最终为 28。

<iframe class="lesson-animation-frame fenwick-animation-frame" src="/ACMguide/animations/fenwick/index.html" title="树状数组动图：前缀区间拼接与单点修改"></iframe>

再切换“第 5 项增加 10”，看 5→6→8：只更新包含第 5 项的三个区间，$\mathrm{bit}$ 值分别变成 `15 21 46`。原数组变化后，动图先保留尚未更新的 $\mathrm{bit}$，再随循环逐项修正；点击“上一步”可回看一次加减 lowbit 前后的区别。

图中循环把更新下标的语句放在循环体末尾，便于单步高亮；它与下面完整代码中放在 for 第三部分的执行顺序相同。

## 例题精讲：P3374 · 树状数组 1

**原题：** [P3374 · 树状数组 1](https://www.luogu.com.cn/problem/P3374)。

**题意简述：** 给初始数组，操作 `1 x k` 将第 $x$ 项加 $k$，操作 `2 l r` 查询闭区间 $[l, r]$ 的和，$n$ 和操作数均不超过 $5\times 10^{5}$。

自拟输入：

```text
5 4
1 2 3 4 5
2 2 4
1 3 10
2 1 3
2 3 3
```

输出：

```text
9
16
13
```

区间和仍是 `prefix(r) - prefix(l - 1)`。变化的只是 prefix 怎么维护：它不再是一张修改后过期的前缀表，而是每次从树状数组中拼出来。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 500000 + 5;
int n;
long long bit[N];

int lowbit(int x) { return x & (-x); }

void add(int pos, long long value) {
    for (int i = pos; i <= n; i += lowbit(i)) bit[i] += value;
}

long long prefix(int pos) {
    long long answer = 0;
    for (int i = pos; i > 0; i -= lowbit(i)) answer += bit[i];
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int m;
    cin >> n >> m;
    for (int i = 1; i <= n; i++) {
        long long value;
        cin >> value;
        add(i, value);
    }
    while (m--) {
        int op;
        cin >> op;
        if (op == 1) {
            int x;
            long long value;
            cin >> x >> value;
            add(x, value);
        } else {
            int l, r;
            cin >> l >> r;
            cout << prefix(r) - prefix(l-1) << '\n';
        }
    }
    return 0;
}
```

> **修改下标从 1 开始，`prefix(0)` 则合法。**
>
> `lowbit(0) = 0`，如果调用 `add(0, value)`，下标永远不会增长，会陷入死循环。`prefix(0)` 的循环一次也不执行，返回 0，正好表示空前缀。累计和与修改量使用 `long long`，避免大量增量累计后超出 `int`。

逐个 add 建树 $\mathcal{O}(n \log  n)$，每次修改、查询 $\mathcal{O}(\log  n)$，空间 $\mathcal{O}(n)$。另一种 $\mathcal{O}(n)$ 建树方式也可以由区间合并推导；先把每次访问的区间含义理解清楚，再进一步优化初始化。

## 练习：画出访问的区间，而不是只列下标

先**独立重做 P3374**，对 $n=8$ 手写 `prefix(7)` 和 `add(5, delta)` 分别访问哪些位置，再核对这些 $\mathrm{bit}$ 区间是否恰好符合查询或修改需求。

### 推荐必做

1. [P2068 · 统计和](https://www.luogu.com.cn/problem/P2068)：初始全零，支持单点增加和区间求和。练习解析字符操作、更新位置及两次前缀和相减，结果用 `long long`。
2. [P1908 · 逆序对](https://www.luogu.com.cn/problem/P1908)：求序列中前面的数严格大于后面的数的数对数量。离散化后让树状数组记录出现次数，练习让下标代表数值。

### 选做巩固

- [P3368 · 树状数组 2](https://www.luogu.com.cn/problem/P3368)：支持区间加法和单点查询。先将区间加法转化为差分数组的两次单点修改，再用前缀和还原该位置的值。
- [P2184 · 贪婪大陆](https://www.luogu.com.cn/problem/P2184)：每次在区间铺设一种新地雷，询问区间包含多少种地雷。分别统计左端点和右端点，练习将相交条件变为前缀计数。

## 本节验收

能解释 `bit[i]` 的覆盖区间；能从区间拼接和包含关系推导两个循环；能处理 1、$n$ 与空前缀，并知道赋值操作应怎样转换为增量。
