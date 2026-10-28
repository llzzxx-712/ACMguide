---
title: 合并、调度与动态中位数
description: 让堆保存当前可选项，在合并时取最小两项，在调度时比较优先级，用两堆维护序列的中间位置。
---

## 这一节学什么

会用 push、top、pop 后，要进一步问：堆里应该存谁，取出的元素为什么就是当前需要处理的对象？本节把贪心合并、任务调度和动态中位数分别转成维护堆顶的问题。

> **AI 伴学提示词**
>
> 为我讲解堆在合并、任务调度与动态中位数中的用途，手动模拟每次取出、放回和两堆平衡，并引导我对不理解的地方提问。

## 例题精讲一：P1090 · 合并果子

**原题：** [P1090 · 合并果子](https://www.luogu.com.cn/problem/P1090)。

**题意简述：** 每次合并两堆果子，代价等于两堆重量之和，新堆还能继续合并，求最终合成一堆的最小总代价。n≤10^4，每堆重量≤2×10^4。

自拟输入：

```text
4
1 2 3 4
```

输出为 `19`：先 1+2=3，再 3+3=6，最后 4+6=10，总计 3+6+10。

### 贪心决定选谁，堆负责快速找出来

一堆越早合并，它的重量越可能在后续代价中被重复计算，所以让较小的堆承担较多次合并更有利。

把合并过程画成二叉树，每个原始重量对总代价的贡献等于“重量×它被合并的次数”。最深处总有一对兄弟叶子；把两个最小重量交换到那里，不会增加总代价，因此可以先合并这两个最小值，再把新堆当作一个整体继续处理。

每次新重量加入后，当前最小两堆可能改变，小根堆正好维护这些候选：取两次堆顶、累加代价、把新堆放回。

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    priority_queue<long long, vector<long long>, greater<long long>> heap;
    for (int i = 0; i < n; i++) {
        long long x;
        cin >> x;
        heap.push(x);
    }
    long long answer = 0;
    while (heap.size() > 1) {
        long long x = heap.top(); heap.pop();
        long long y = heap.top(); heap.pop();
        long long merged = x + y;
        answer += merged;
        heap.push(merged);
    }
    cout << answer << '\n';
    return 0;
}
```

n=1 时已经是一堆，代价为 0。合并共 n−1 次，每次堆操作 $\mathcal{O}(\log  n)$，总时间 $\mathcal{O}(n \log  n)$，空间 $\mathcal{O}(n)$。重量会合成更大的新值，累计代价也要用 `long long`。

## 调度：把“先处理谁”写成优先级

若任务按最早截止时间处理，同截止时间按编号处理，可以把两个字段打包成 pair：

```text
priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> jobs;
jobs.push({deadline, id});
auto task = jobs.top();
jobs.pop();
cout << task.first << ' ' << task.second;
```

pair 像 `map` 的一个成员一样有 first、second。这里 first 保存截止时间，second 保存编号；比较 pair 时先比较 first，相同再比较 second，因此小根堆就实现了所需顺序。

例如任务 (3,2)、(1,5)、(3,1)，取出顺序为 (1,5)、(3,1)、(3,2)。堆负责按给定优先级取出，至于“最早截止优先”是否符合具体题目的最优策略，仍要由题目条件推导。

## 例题精讲二：P1168 · 中位数

**原题：** [P1168 · 中位数](https://www.luogu.com.cn/problem/P1168)。

**题意简述：** 数字依次加入，输出每个奇数长度前缀的中位数，n≤10^5，数值在 0 到 10^9 之间。

自拟输入：

```text
5
5 1 4 2 3
```

输出：

```text
5
4
3
```

### 将有序序列分成较小一半和较大一半

用大根堆 lower 保存较小一半，小根堆 upper 保存较大一半，保持：

1. lower 中每个值都不大于 upper 中每个值。
2. lower 的个数等于 upper，或只多一个。

那么奇数长度时，lower 比 upper 多一个，它的最大值正好是整个序列的中位数。

新数不大于 lower.top 就放入 lower，否则放入 upper。随后若两边个数不合适，就把较大一半的最小值或较小一半的最大值移到另一边，修复数量关系。

| 加入 | lower 中的值（按大小展示） | upper 中的值 | 此时输出 |
| --- | --- | --- | --- |
| 5 | 5 | 空 | 5 |
| 1 | 1 | 5 | 偶数不输出 |
| 4 | 1,4 | 5 | 4 |
| 2 | 1,2 | 4,5 | 偶数不输出 |
| 3 | 1,2,3 | 4,5 | 3 |

表格只是方便看内容，堆内部仍按父子关系存储，并不是排好的一整行。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n;
    priority_queue<int> lower;
    priority_queue<int, vector<int>, greater<int>> upper;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        if (lower.empty() || x <= lower.top()) lower.push(x);
        else upper.push(x);
        while (lower.size() > upper.size() + 1) {
            upper.push(lower.top());
            lower.pop();
        }
        while (lower.size() < upper.size()) {
            lower.push(upper.top());
            upper.pop();
        }
        if (i % 2 == 1) cout << lower.top() << '\n';
    }
    return 0;
}
```

移动的是边界处的最大值或最小值，因此不会破坏两组之间的大小关系。每次加入后至多需要常数次搬移，总时间 $\mathcal{O}(n \log  n)$，空间 $\mathcal{O}(n)$。重复值可以正常分布在两边，不要去重。

## 练习：先定义堆顶代表什么

先**独立重做 P1090、P1168**。对合并题记录每次代价；对中位数题每次插入后检查两个不变量。

### 推荐必做

1. [P1801 · 黑匣子](https://www.luogu.com.cn/problem/P1801)：第 i 次查询要当前数据中的第 i 小值。把 lower 的目标大小从“较小一半”改成 i，按题目给出的加入时机维护两堆。
2. [P1631 · 序列合并](https://www.luogu.com.cn/problem/P1631)：两个有序序列的 n² 个两两和中取最小 n 个。固定 `A[i]` 后，`A[i] + B[1..n]` 是一条有序链，堆里只存每条链当前最小的未取候选。

### 选做巩固

- [P2085 · 最小函数值](https://www.luogu.com.cn/problem/P2085)：每个函数在正整数自变量上形成递增序列，取走当前最小值后，只推进它来自的那个函数。用 `long long` 计算函数值。
- [P2168 · 荷马史诗](https://www.luogu.com.cn/problem/P2168)：将二叉合并推广到 k 叉合并，先用零权补齐叶子数量，再处理相同权重下的高度比较。练习给堆元素添加除权重外的决策信息。

## 本节验收

能把贪心决策与维护工具分开说明；能定义任务优先级；能通过两个不变量推导动态中位数，而不是把两堆搬移写成固定口诀。
