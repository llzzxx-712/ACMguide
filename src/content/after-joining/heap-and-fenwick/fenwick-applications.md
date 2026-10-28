---
title: 差分树状数组与逆序对统计
description: 对差分维护动态前缀，完成区间加与单点查询；对值域维护频数，把逆序对转成比当前值小的数量。
---

## 这一节学什么

树状数组只知道“给一个位置加值”和“求一个前缀”。我们可以改变下标和值的含义：把位置换成差分端点，或者把下标换成数值排名，让相同的维护过程处理不同问题。

> **AI 伴学提示词**
>
> 为我讲解差分树状数组与值域计数，用一次区间加和含重复值的逆序对例子，说明每次 prefix 到底统计什么，并引导我提问。

## 例题精讲一：P3368 · 树状数组 2

**原题：** [P3368 · 树状数组 2](https://www.luogu.com.cn/problem/P3368)。

**题意简述：** 操作 1 l r k 将闭区间 [l,r] 每项加 k，操作 2 x 查询第 x 项，n、操作数均≤5×10^5。

自拟输入：

```text
5 4
1 2 3 4 5
1 2 4 10
2 1
2 3
2 5
```

输出：

```text
1
13
5
```

### 把区间修改改写成两个差分位置的修改

定义 d[i]=a[i]−a[i−1]，a[0]=0。区间加 k 对应 d[l]+=k、d[r+1]−=k；第 x 项的值就是 d[1..x] 的前缀和。

第四章是把所有差分操作结束后再统一恢复。现在操作与询问交替出现，我们把 d 放进树状数组，每次查询都能立即取得当前前缀，不用恢复整张数组。

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
    long long previous = 0;
    for (int i = 1; i <= n; i++) {
        long long value;
        cin >> value;
        add(i, value - previous);
        previous = value;
    }
    while (m--) {
        int op;
        cin >> op;
        if (op == 1) {
            int l, r;
            long long value;
            cin >> l >> r >> value;
            add(l, value);
            add(r + 1, -value);
        } else {
            int x;
            cin >> x;
            cout << prefix(x) << '\n';
        }
    }
    return 0;
}
```

r=n 时，add(n+1,−value) 的循环不执行，因为原数组没有 n 之后需要查询的位置。读初始数组时保存上一项，就能构造差分，不必另存完整 d。建树 O(n log n)，每次操作 O(log n)，空间 O(n)。

## 再推一步：区间加、区间和能否一起维护

原数组前 x 项的和中，差分 d[j] 会被累计 x−j+1 次，因此：

```text
a[1]+...+a[x]
= Σ (x-j+1) * d[j]
= x * Σ d[j] - Σ (j-1) * d[j]     （1≤j≤x）
```

分别用两份树状数组维护 d[j] 与 (j−1)×d[j]。一次差分位置 p 加 value，就向第一份 add(p,value)，向第二份 add(p,(p−1)×value)。原数组前缀和为 x×query1(x)−query2(x)，再作两次前缀相减，就得到区间和。

注意这里 query1、query2 查询的是**差分的两种加权统计**，不是直接查原数组。乘法与累计结果都用 long long。

## 例题精讲二：P1908 · 逆序对（树状数组解法）

**原题：** [P1908 · 逆序对](https://www.luogu.com.cn/problem/P1908)。

**题意简述：** 统计 i<j 且 a[i]>a[j] 的数对，n≤5×10^5，数值≤10^9。第六章已经用归并统计，这次按值域计数。

自拟输入：

```text
4
4 2 2 1
```

输出仍为 `5`。

### 从右往左，记录右侧已经出现了哪些值

处理 a[i] 时，右边所有 j 已经加入计数结构。只要知道右侧有多少值严格小于 a[i]，就知道以 i 为左端点的逆序对数。

值可能达到 10^9，先离散化成从 1 开始的排名。树状数组的下标表示**排名**，保存的值是这个排名出现的**次数**；它现在不再表示原数组位置。

| 从右到左读到的值 | 查询严格更小的右侧数 | 增加逆序对数 |
| --- | --- | --- |
| 1 | 右侧为空 | 0 |
| 第二个 2 | 有一个 1 | 1 |
| 第一个 2 | 仍只有一个 1，相等的 2 不计 | 1 |
| 4 | 右侧的 2、2、1 | 3 |

当前排名为 rank，查询 prefix(rank−1)，再 add(rank,1)。顺序对应“先统计右侧，再把当前位置交给之后的左侧元素使用”。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 500000 + 5;
int bit[N], limit;
int lowbit(int x) { return x & (-x); }

void add(int pos) {
    for (int i = pos; i <= limit; i += lowbit(i)) bit[i]++;
}

int prefix(int pos) {
    int answer = 0;
    for (int i = pos; i > 0; i -= lowbit(i)) answer += bit[i];
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    vector<int> a(n), values;
    for (int i = 0; i < n; i++) cin >> a[i];
    values = a;
    sort(values.begin(), values.end());
    values.erase(unique(values.begin(), values.end()), values.end());
    limit = values.size();
    long long answer = 0;
    for (int i = n - 1; i >= 0; i--) {
        int rank = lower_bound(values.begin(), values.end(), a[i]) - values.begin() + 1;
        answer += prefix(rank - 1);
        add(rank);
    }
    cout << answer << '\n';
    return 0;
}
```

> **离散化排名从 1 开始，相等的值必须同排名。**
>
> +1 是为了避开树状数组下标 0。严格小于用 rank−1；查询到 rank 会把相等值也计进去。单次频数最多 n，bit 可用 int，但全部逆序对数可达 n(n−1)/2，answer 必须用 long long。

离散化 O(n log n)，每个元素一次查询、一次加入，总时间 O(n log n)，空间 O(n)。与归并解法得到相同答案，但维护信息的方式不同：前者在排序合并时批量计数，这里按时间顺序积累值域频数。

## 练习：改变下标含义，保持操作含义

先**独立重做 P3368 和树状数组版 P1908**，分别画出差分端点变化与值域桶次数。用含重复值的随机小数组，与归并逆序对结果交叉核对。

### 推荐必做

1. [P3372 · 线段树 1](https://www.luogu.com.cn/problem/P3372)：维护区间加法和区间和查询。用两份差分树状数组实现加权公式，测试 r=n 与 l=1，注意答案使用 long long。
2. [P1966 · 火柴排队](https://www.luogu.com.cn/problem/P1966)：将排名配对后的相邻交换次数，用本节的值域计数求出，再与第六章归并解法对照。

### 选做巩固

- [P2357 · 守墓人](https://www.luogu.com.cn/problem/P2357)：支持区间加、第一项增减、区间和及第一项查询。把第一项操作转化为单点区间，再用两份差分树状数组处理。
- [P1972 · HH 的项链](https://www.luogu.com.cn/problem/P1972)：多次询问区间内不同贝壳种类数。按右端点离线处理，只在每种贝壳最后出现的位置计 1；注意原题输入规模并使用快速输入。

## 本节验收

能说明 prefix 返回原数组值、原数组和或频数中的哪一种；能从差分推导两棵树的公式；能处理严格大小关系、重复值和 1 起点排名。
