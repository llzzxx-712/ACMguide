---
title: 势能线段树与稳定区间剪枝
description: 遇到难以直接维护 lazy 的修改，先寻找每个位置有限的有效变化次数，再跳过已经稳定的整段区间。
---

## 这一节学什么

区间加、区间赋值可以用 lazy 标记把整段修改推迟。但如果修改是“每个数开平方并下取整”，我们不能仅凭区间和就直接算出修改后的和。此时可以换一个角度：**允许一次修改向下访问很多位置，但让每个位置在全部操作中只真正变化很少几次。**

> **AI 伴学提示词**
>
> 为我用花神游历各国讲解势能线段树，手算开方后的变化与稳定区间，解释为什么总变化次数少，再对照代码引导我提问。

## 为什么区间加的 lazy 写法搬不过来

区间长为 len、和为 sum，每个数加 d 后，和直接变成 sum+d·len；两次加法的标记也能合并成一个加数。

开方则不同。`[1, 9]` 与 `[2, 8]` 都有两个数、区间和都是 10，但逐项开方取整后，前者和为 1+3=4，后者却是 1+2=3。**长度和总和相同，并不能确定开方后的总和。**

所以给结点挂一个“以后开方一次”的标记，仍然没有解决当前区间和怎样更新的问题。本节不采用区间加那种“整段更新汇总值，再留下一个 lazy”的路线，而是向下找到确实还会变化的位置。

## 数值一直变小，最后会停在哪里

对正整数 x，x=1 时开方后仍为 1；x>1 时一定变小。原题最大值为 10¹²，它的变化过程是：

```text
1000000000000 → 1000000 → 1000 → 31 → 5 → 2 → 1
                  一共六次有效变化，之后再开方仍为 1
```

开方函数单调，因此从任何不超过 10¹² 的正整数出发，都不会比这条上界链需要更多次。n 个位置总共最多发生 6n 次有效变化。

这就是本节的“势能”：可以把每个位置距离稳定状态还剩的变化次数，看成它剩余的工作量。初始总工作量有限，每次真正修改一个不稳定叶子，就消耗其中一份。

## 例题精讲：[P4145 花神游历各国](https://www.luogu.com.cn/problem/P4145)

**题意简述：** 给 n≤10⁵ 个正整数，初值≤10¹²，进行 m≤10⁵ 次操作：`0 l r` 将区间内每个数开平方下取整；`1 l r` 查询区间和。若 l>r，先交换端点。每个求和答案单独输出一行。

自编输入：

```text
5
16 1 10 81 2
7
1 1 5
0 1 5
1 1 5
0 5 1
1 1 5
0 1 5
1 1 5
```

输出：

```text
110
18
8
5
```

手算三轮全区间修改：

| 状态 | 第 1 个 | 第 2 个 | 第 3 个 | 第 4 个 | 第 5 个 | 区间和 |
| --- | --- | --- | --- | --- | --- | --- |
| 初始 | 16 | 1 | 10 | 81 | 2 | 110 |
| 第一轮 | 4 | 1 | 3 | 9 | 1 | 18 |
| 第二轮 | 2 | 1 | 1 | 3 | 1 | 8 |
| 第三轮 | 1 | 1 | 1 | 1 | 1 | 5 |

第 2 个位置从开始就不用再改，第 5 个位置第一轮后也稳定。第三轮结束后，整段稳定，后面即使还有九万次全区间开方，也可以在根结点直接返回。

## 用一个标记记录整段是否稳定

每个结点维护两份信息：

- `sum`：这个区间的总和，用于回答查询。
- `stable`：这个区间是否所有位置都已到达不动点，用于跳过修改。

叶子的 stable 取决于数值是否≤1；父亲的 stable 等于左右孩子 stable 的逻辑与。原题只有正整数，不动点就是 1；写成≤1，也能自然处理非负整数扩展中的 0。

修改时，先检查 stable：已经稳定就返回。否则若是叶子，计算整数平方根；若不是叶子，只递归进入与修改范围相交的孩子，回来后重新合并 sum 与 stable。**即使当前结点完全被修改区间覆盖，也不能只对 sum 开方，仍需继续向下。**

比如只修改 `[2, 4]`，就在树上按下标范围找到相交部分；其中稳定的小区间直接跳过，不稳定的部分继续拆。这里每个判断、递归与返回，都对应前面手算中“这段还用不用改”的决定。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Node {
    long long sum = 0;
    bool stable = false;
};

vector<Node> tree;
vector<long long> a;

void pull(int p) {
    tree[p].sum = tree[p * 2].sum + tree[p * 2 + 1].sum;
    tree[p].stable = tree[p * 2].stable && tree[p * 2 + 1].stable;
}

void build(int p, int l, int r) {
    if (l == r) {
        tree[p].sum = a[l];
        tree[p].stable = (a[l] <= 1);
        return;
    }
    int mid = l + (r - l) / 2;
    build(p * 2, l, mid);
    build(p * 2 + 1, mid + 1, r);
    pull(p);
}

long long integerSqrt(long long x) {
    if (x <= 1) return x;
    long long result = sqrtl(x);
    while (result + 1 <= x / (result + 1)) result++;
    while (result > x / result) result--;
    return result;
}

void change(int p, int l, int r, int ql, int qr) {
    if (tree[p].stable) return;
    if (l == r) {
        tree[p].sum = integerSqrt(tree[p].sum);
        tree[p].stable = (tree[p].sum <= 1);
        return;
    }
    int mid = l + (r - l) / 2;
    if (ql <= mid) change(p * 2, l, mid, ql, qr);
    if (qr > mid) change(p * 2 + 1, mid + 1, r, ql, qr);
    pull(p);
}

long long query(int p, int l, int r, int ql, int qr) {
    if (ql <= l && r <= qr) return tree[p].sum;
    int mid = l + (r - l) / 2;
    long long answer = 0;
    if (ql <= mid) answer += query(p * 2, l, mid, ql, qr);
    if (qr > mid) answer += query(p * 2 + 1, mid + 1, r, ql, qr);
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    a.resize(n + 1);
    tree.resize(4 * n + 5);
    for (int i = 1; i <= n; i++) cin >> a[i];
    build(1, 1, n);
    int m;
    cin >> m;
    while (m--) {
        int type, l, r;
        cin >> type >> l >> r;
        if (l > r) swap(l, r);
        if (type == 0) change(1, 1, n, l, r);
        else cout << query(1, 1, n, l, r) << '\n';
    }
    return 0;
}
```

`integerSqrt` 先用 sqrtl 得到估计，再校正到满足 result²≤x<(result+1)² 的整数。比较改写成除法，避免平方乘法溢出；x≤1 提前返回，也避开除以 0。辅助函数处理数值细节，线段树部分只负责范围与稳定状态。

单个数可能达到 10¹²，区间和最大约 10¹⁷，都应使用 `long long`。求和即使读到稳定区间，也仍要按查询范围处理，不能像修改那样直接返回 0；稳定只表示“值不会变”，并不表示“值没有贡献”。

## 为什么总复杂度能通过

第一次给全数组开方，可能访问几乎整棵树，单次最坏是 $\mathcal{O}(n)$。我们分析的是**全部操作累计的工作量**。

令 K 为每个位置最多有效变化的次数，本题 K≤6。真正变化的叶子一共最多 nK 次，每次涉及一条 $\mathcal{O}(\log  n)$ 的祖先路径；访问到的稳定分支可以立即返回。另加每次操作的区间边界路径与查询，合计时间可界为 O(n+(m+nK)log n)，空间 $\mathcal{O}(n)$。

也可以维护区间最大值，发现 maximum≤1 时跳过，作用与本例的 stable 相同。对其他修改，先找对应的不动点或可跳过条件，再证明有效变化次数的预算。本例只有开方操作，因此稳定后永久稳定；若增加赋值操作，新值可能恢复变化次数，需要重新维护标记，并把新增工作量计入分析。

## 练习：先找不动点，再决定怎样跳过

先**独立重做 P4145**，手算上面的数组，再与小数组逐项开方核对。测试全是 1、只剩一个位置未稳定、单点区间、反向端点以及完全平方数附近的数值。

### 推荐必做

1. [CF920F SUM and REPLACE](https://www.luogu.com.cn/problem/CF920F)：把每个数替换成其正约数个数，并查询区间和。先预处理约数个数，再找出 1、2 这两个不动点，计算给定值域内最多需要多少轮，沿用稳定区间剪枝。
2. [Codeforces 1791F Range Update Point Query](https://codeforces.com/problemset/problem/1791/F)：对区间每个数替换成其十进制各位数字之和，并查询单点值。练习找出一位数的不动点，跳过已稳定的位置。

### 选做巩固

- [CF438D The Child and Sequence](https://www.luogu.com.cn/problem/CF438D)：支持区间取模、区间和与单点赋值。维护最大值，最大值小于本次模数时跳过；证明每次真正取模会使该数降到原来的一半以下，并把单点赋值增加的势能计入分析。
- [P6242 线段树 3](https://www.luogu.com.cn/problem/P6242)：支持区间加、区间取最小值，以及区间和、最大值和历史最大值查询。练习研究最大值、严格次大值等信息如何支持整段更新。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线段树的进阶用法 #221](https://www.luogu.com.cn/training/221)。

## 本节验收

能解释为什么不能直接对区间和开方；能维护并合并稳定标记；能将复杂度记在有限的有效变化次数上，并区分单次最坏与总操作复杂度。
