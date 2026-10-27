---
title: set、multiset 与有序集合的操作
description: 先明确要维护的成员与顺序，再用有序集合完成去重、查找、删除和最近值查询。
---

## 这一节学什么

已经读完的一组数据，可以排序后处理；如果数据不断插入、删除，又要随时查询顺序关系，就需要能维护这些变化的工具。本节学习 set、multiset，再用木材仓库实现动态查找最近值。

> **AI 伴学提示词**
>
> 为我讲解 set、multiset 和迭代器，用木材仓库模拟插入、最近值查询和删除，强调边界，并引导我对不理解的细节提问。

## 集合关心“有哪些成员”

把 `4 1 4 7 1` 放进 set<int>，集合中会留下 `1 4 7`：重复成员只留一份，遍历时按从小到大的顺序出现。

如果需要保留重复的数，使用 multiset<int>，上面的数据会留下 `1 1 4 4 7`。

| 工具 | 重复值 | 遍历顺序 | 适合的问题 |
| --- | --- | --- | --- |
| set | 同一个值只保留一份 | 从小到大 | 去重、动态成员、前驱后继 |
| multiset | 保留重复值 | 从小到大 | 动态维护可以重复的数 |

## 常用操作与迭代器

```text
set<int> s;
s.insert(4);
s.insert(1);
s.insert(4);       // 4 已存在，集合不增加
int n = s.size();  // n=2
bool found = s.count(4) != 0;
s.erase(1);        // 按值删除；不存在时不删除任何成员
s.clear();         // 清空集合
```

要指向集合中的某个位置，使用**迭代器**。可以先把它理解为“当前读到的成员位置”：

```text
auto it = s.find(x);       // 查找值 x；auto 让编译器推断迭代器类型
if (it != s.end()) {
    cout << *it;          // *it 读取这个位置保存的值
}

auto first = s.begin();    // 第一个成员的位置
auto finish = s.end();     // 最后一个成员之后的位置
```

`end()` 不保存一个真实成员。查找失败会返回 end()，此时不能读取 `*it`。向后移动用 `++it`，向前移动用 `--it`，不使用数组的 `it+1`。

按顺序输出全部成员也可以用已学过的范围 for：`for (int x : s) cout << x << ' ';`。set 不能用 `s[i]` 按排名读取第 i 个成员。

### 查找第一个不小于 x 的成员

```text
auto it = s.lower_bound(x);
```

它与第一板块的二分目标一致：寻找第一个 ≥x 的位置。如果不存在，返回 end()。`s.upper_bound(x)` 寻找第一个 >x 的位置。

这里使用集合自己的成员函数。set 会维护内部的有序结构，插入、查找、lower_bound 等操作需要 O(log n) 时间；完整遍历需要 O(n) 时间。

### multiset 删除一份，还是全部删除

```text
multiset<int> bag;
bag.insert(4);
bag.insert(4);
bag.insert(7);
auto it = bag.find(4);
if (it != bag.end()) bag.erase(it); // 删除这一份 4，还剩一个 4
bag.erase(4);                      // 删除所有剩余的 4
```

multiset.count(x) 会统计全部相等成员；如果有 k 份相同值，计数或按值删除的复杂度包含这 k 个成员，不能一律当成常数操作。

> **迭代器边界**
>
> 空集合的 begin() 等于 end()。不要读取 end()，不要对 begin() 做 `--`，空集合也不能对 end() 做 `--`。erase(it) 后，it 指向的成员已经被删去，不能再读取它。

## 例题精讲：P5250 · 木材仓库

**原题：** [P5250 · 木材仓库](https://www.luogu.com.cn/problem/P5250)。

**题意简述：** 仓库不允许存在两根同样长度的木材。操作 1 插入长度 x，若已存在输出 `Already Exist`；操作 2 取出与 x 最接近的一根，距离相同取较短者，并输出实际长度；仓库为空则输出 `Empty`。操作最多 10^5 次，长度不超过 10^9。

本节自拟输入：

```text
9
2 7
1 4
1 10
1 4
2 7
2 7
2 7
1 7
2 7
```

输出：

```text
Empty
Already Exist
4
10
Empty
7
```

### 思路：只比较 x 两边的邻居

仓库中有 `1 4 10 20`，要取与 7 最近的木材。lower_bound(7) 指向 10，前一个成员是 4。左边更小的 1 不可能比 4 更靠近 7，右边更大的 20 也不可能比 10 更靠近 7，因此只需比较 4 和 10。

两边的距离都是 3，按题意取较短的 4。用 `左边距离 <= 右边距离`，就把相等时取左边的规则写进了比较条件。

先列清所有位置情况：

| lower_bound 的位置 | 表示什么 | 取哪边 |
| --- | --- | --- |
| end() | 所有木材都比 x 小 | 最后一个成员 |
| begin() | 没有更小的成员 | 当前成员 |
| 其他真实位置 | 左右都有候选 | 比较当前成员与前一个成员 |

仓库为空的情况要在上表之前处理。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int m;
    cin >> m;
    set<long long> wood;
    while (m--) {
        int op;
        long long x;
        cin >> op >> x;
        if (op == 1) {
            if (wood.count(x) != 0) cout << "Already Exist\n";
            else wood.insert(x);
        } else {
            if (wood.empty()) {
                cout << "Empty\n";
                continue;
            }
            auto it = wood.lower_bound(x);
            if (it == wood.end()) {
                --it;
            } else if (it != wood.begin()) {
                auto left = it;
                --left;
                if (x - *left <= *it - x) it = left;
            }
            cout << *it << '\n';
            wood.erase(it);
        }
    }
    return 0;
}
```

set 保存现有木材，lower_bound 定位右侧候选，left 定位左侧候选。选择完成后，输出和删除使用同一个 it，保证取出的正是刚刚比较得到的木材。

每次操作只做常数次有序集合操作，总时间 O(m log m)，最多保存 m 根木材，空间 O(m)。

## 练习：选对容器，再处理边界

先**独立重做 P5250**，覆盖空仓库、重复插入、恰好找到、比所有成员小、比所有成员大和两边距离相等。

### 推荐必做

1. [P1059 · 明明的随机数](https://www.luogu.com.cn/problem/P1059)：对一组数去重并升序输出。用 set 实现，再与第一板块的排序去重比较。

### 选做巩固

- [P2234 · 营业额统计](https://www.luogu.com.cn/problem/P2234)：查询当天数值与过去数值的最小差，再插入当天数值。练习最近邻查询与操作顺序，注意营业额可以为负。
- [P2286 · 宠物收养场](https://www.luogu.com.cn/problem/P2286)：宠物与领养者按特点值匹配，选择最近者并移除。练习动态集合、重复值与相等距离时的选择。
- **自编：仓库允许重复长度。** 把例题规则改成相同长度可以入库多根，每次只取一根。用 multiset 完成，测试连续插入三根 4 后取出一次，还剩几根。

## 本节验收

- 能根据是否保留重复值选择 set 或 multiset。
- 能解释 begin、end、find、lower_bound 与 `*it`。
- 能说明最近值为什么只需比较左右两个候选。
- 会在移动、读取、删除迭代器之前检查对应边界。
