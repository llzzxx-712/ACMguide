---
title: 离线处理、偏序与动态排名
description: 用排序、CDQ 分治与树状数组分担三个维度，并处理相同点、等号与贡献清空。
---

## 这一节学什么

离线处理允许先读完询问，再按有利的顺序计算。核心是利用“已经处理的信息”减少维度，同时保持题目原本的限制；带修改的问题还要保留时间先后，不能随意把未来更新提前生效。

> **AI 伴学提示词**
>
> 为我先讲二维扫描，再用 CDQ 解释三维偏序怎样分工，手算相同点和跨区间贡献，并引导我对等号与回滚提问。

## 从二维开始，排序消掉一个条件

若要数 aⱼ≤aᵢ、bⱼ≤bᵢ，可以先按 a 排序。扫描到当前点时，较小 a 的点已出现，只需维护 b 的前缀数量。若同 a 的点之间也应计数，就要设计分组或稳定的同值处理，不能只说“排完序就都满足”。

三维再多一个 c，单纯用一个一维树状数组不够。CDQ 把点按第一维顺序分成左右两半：递归负责左右内部；合并时只算左半给右半的贡献，按 b 扫描，用树状数组统计 c≤当前 c 的数量。

## 例题精讲：[P3810 三维偏序 / 陌上花开](https://www.luogu.com.cn/problem/P3810)

**题意简述：** n≤10⁵ 个三元组 (a,b,c)，每维在 1…K，K≤2×10⁵。对每个点 i，f(i) 为其他点中三维都≤它的数量，最后输出 f=0、1…n−1 各有多少点。

自编输入：

```text
4 2
1 1 1
1 1 1
2 2 2
1 2 1
```

输出：

```text
0
2
1
1
```

两个 (1,1,1) 各自还会计入另一个相同点，所以 f=1；(1,2,1) 有两个更小点；(2,2,2) 有三个。

## 排序、分治、扫描各管什么

先按 (a,b,c) 字典序排序，并把完全相同的点合成一个组，记录 count。不同的点若能支配另一个点，一定在字典序较前的位置；相同组内部另外 count−1 个贡献，最后单独加上。

对一个分治区间：

1. 递归解决左右内部，并让两半各自按 b 排好。
2. 扫描右半的每个点，把左半 b≤它的组加入树状数组，增加该组的 count。
3. 查询 c 的前缀和，累加到当前右点的 answer。
4. 撤销刚加入的全部左组，再按 b 合并两半，供上一层扫描。

这里即使 a 相同，字典序仍确保可能形成贡献的不同点方向正确；完全相同的情况已合组。b 和 c 的条件都带等号，分别对应 `<=` 与前缀包含当前下标。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Point { int a, b, c, count, answer; };
vector<Point> points, temporary;
vector<int> bit;
int K;

void add(int x, int value) {
    for (; x <= K; x += x & -x) bit[x] += value;
}

int prefix(int x) {
    int answer = 0;
    for (; x > 0; x -= x & -x) answer += bit[x];
    return answer;
}

void cdq(int l, int r) {
    if (l == r) return;
    int mid = l + (r - l) / 2;
    cdq(l, mid);
    cdq(mid + 1, r);
    int inserted = l;
    for (int j = mid + 1; j <= r; j++) {
        while (inserted <= mid && points[inserted].b <= points[j].b) {
            add(points[inserted].c, points[inserted].count);
            inserted++;
        }
        points[j].answer += prefix(points[j].c);
    }
    for (int i = l; i < inserted; i++) add(points[i].c, -points[i].count);
    int i = l, j = mid + 1, position = l;
    while (i <= mid && j <= r) {
        if (points[i].b <= points[j].b) temporary[position++] = points[i++];
        else temporary[position++] = points[j++];
    }
    while (i <= mid) temporary[position++] = points[i++];
    while (j <= r) temporary[position++] = points[j++];
    for (int p = l; p <= r; p++) points[p] = temporary[p];
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n >> K;
    vector<Point> input(n);
    for (auto &p : input) { cin >> p.a >> p.b >> p.c; p.count = 1; p.answer = 0; }
    sort(input.begin(), input.end(), [](const Point &x, const Point &y) {
        return tie(x.a, x.b, x.c) < tie(y.a, y.b, y.c);
    });
    for (auto p : input) {
        if (!points.empty() && tie(points.back().a, points.back().b, points.back().c) == tie(p.a, p.b, p.c)) points.back().count++;
        else points.push_back(p);
    }
    int groups = points.size();
    temporary.resize(groups);
    bit.resize(K + 1);
    cdq(0, groups - 1);
    vector<int> frequency(n);
    for (auto p : points) frequency[p.answer + p.count - 1] += p.count;
    for (int answer : frequency) cout << answer << '\n';
    return 0;
}
```

递归后两半的内部顺序按 b 改变，但每半仍只包含最初分配给它的那些点，所以第一维分工不变。撤销必须在复制 temporary 之前做，且只撤销实际加入的组；否则别的分治区间会读到残留贡献。

每层 O(n log K)，共有 O(log n) 层，时间 O(n log n log K)，空间 O(n+K)，递归深度 O(log n)。c≥1 才能用于树状数组，若原数据包含 0 或负数，应先离散化到从 1 开始的下标。

## 把方法与上一节联系起来

动态排名用数据结构同时维护下标和数值；离线算法则可将时间、下标、数值变成多个维度，用排序或分治安排贡献。二者都在问“哪些点应被计入当前答案”，只是安排计算的方式不同。

代码是思路的实现：排序建立哪些点能影响哪些点，CDQ 只统计跨半区的一类贡献，树状数组回答剩下的一维前缀。每段代码都有明确分工，就不需要把三层工具当成一个不可理解的大模板。

## 练习：先用三重条件直接判断

先**独立重做例题**，n≤30 时对每个 i 枚举所有 j≠i，用三次比较求 f，再与完整输出分布核对。

### 推荐必做

1. **自编 · 二维版本：** 去掉 c 条件，用排序加树状数组解决，并正确处理相同点。
2. **自编 · 等号边界：** 构造第一维全相同、第二维全相同、完全重复三类数据，逐个验证贡献方向和 count−1。

### 选做巩固

- **自编 · 严格偏序：** 将三个条件都改为严格小于，重新设计同值分组与扫描顺序，不只改一个符号。
- **自编 · 带权贡献：** 每点带非负权，统计满足三维条件的其他点权值和，使用 long long，并重写相同组内部贡献。
- **自编 · 回看动态排名：** 将一次修改拆成删除旧点与加入新点，标出时间、位置、数值三维，思考怎样保持操作顺序。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[线段树的进阶用法 #221](https://www.luogu.com.cn/training/221)。

## 本节验收

能说明每一维由谁处理；能正确处理相同点与等号；能在合并前撤销贡献，并用直接枚举验证整份分布。
