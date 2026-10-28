---
title: map、unordered_map 与键值映射
description: 把姓名与成绩、数值与次数建立对应关系，区分查询和插入，完成动态学籍管理。
---

## 这一节学什么

`set` 能回答“这个姓名在不在”，但不能直接回答“这个姓名对应多少分”。本节学习键值映射：用一个键找到对应的值，再把读题得到的操作逐项实现。

> **AI 伴学提示词**
>
> 为我讲解 `map`、`unordered_map` 的键与值，模拟学籍管理中的增删改查，解释查询和插入的区别，并引导我对不理解的内容提问。

## 从数组下标到“用姓名查成绩”

有连续学号时，可以用 `score[id]` 保存成绩。如果输入只给姓名，就希望写出这样的对应关系：

```text
Alice → 90
Bob   → 85
```

`map<string, int> score;` 表示键为 `string`、值为 `int` 的映射。**键用来定位，值保存对应信息。** 相同的键只保存一份值，重新赋值会覆盖旧值。

```text
map<string, int> score;
score["Alice"] = 90;
score["Bob"] = 85;
score["Alice"] = 95;  // 修改 Alice，不增加人数
int n = score.size(); // n=2
```

键也可以是整数。数值很大、实际出现的种类很少时，`map<int, int> frequency;` 可以只为出现过的值保存计数，而不是申请一个覆盖全部数值的巨大数组。

## 查询时，先判断有没有这个键

```text
auto it = score.find(name);
if (it == score.end()) {
    cout << "Not found\n";
} else {
    cout << it->second << '\n';
}
```

一个映射成员同时包含键和值：`it->first` 是键，`it->second` 是值。可以把 `->` 理解为“读取这个迭代器所指成员的某一部分”。

| 操作 | 含义 |
| --- | --- |
| `score.find(name)` | 查找姓名，不存在时返回 `end()` |
| `score.count(name)` | 姓名存在返回 1，否则返回 0 |
| `score[name] = value` | 插入或修改这个键对应的值 |
| `score.erase(name)` | 删除这个键，返回删去的成员个数 |
| `score.size()` | 已保存的键值对数量 |

> **`[]` 可能会插入新成员。**
>
> 对 `map<string, int>` 执行 `score["Carol"]` 时，如果 Carol 原本不存在，就会插入一个值为 0 的成员。因此只想查询是否存在时，用 find 或 count；不要查询一次就意外增加了人数。需要累计计数时，`frequency[x]++` 自动从 0 开始反而很方便。

## map 与 unordered_map 怎么选

`map` 按键的大小维护顺序。键是字符串时，遍历会按字典序输出。插入、查找和删除需要 $\mathcal{O}(\log  n)$ 次键比较。

`unordered_map` 通过哈希表查找，不按键排序。对整数等固定大小的键，插入、查找和删除的平均复杂度为 $\mathcal{O}(1)$，最坏一次可能达到 $\mathcal{O}(n)$。字符串还需要读取字符计算哈希，代价与字符串长度有关。

```text
unordered_map<string, int> score;
score["Alice"] = 90;
auto it = score.find("Alice");
```

两者常用的插入、查询、删除写法很接近。需要按键升序遍历、寻找前驱后继时用 `map`；只按键查询和计数时，可以使用 `unordered_map`。下一节会用具体桶和冲突解释哈希表的工作过程。

## 例题精讲：P5266 · 学籍管理

**原题：** [P5266 · 学籍管理](https://www.luogu.com.cn/problem/P5266)。

**题意简述：** 开始时没有学生，处理至多 $10^5$ 次操作：

| 操作 | 要做的事 | 输出 |
| --- | --- | --- |
| 1 NAME SCORE | 插入学生，已有同名学生则修改成绩 | OK |
| 2 NAME | 查询成绩 | 成绩，或 Not found |
| 3 NAME | 删除学生 | Deleted successfully，或 Not found |
| 4 | 查询人数 | 当前学生数 |

姓名区分大小写，长度不超过 20；成绩满足 $0<\mathrm{SCORE}<2^{31}$，可以用 `int` 保存。

自拟输入：

```text
9
4
1 Alice 90
1 Alice 95
2 Alice
2 Bob
4
3 Alice
3 Alice
4
```

输出：

```text
0
OK
OK
95
Not found
1
Deleted successfully
Not found
0
```

### 先跟踪映射怎样变化

两次插入 Alice 后，只有一名学生，成绩为 95。查询不存在的 Bob 后，映射仍只有 Alice；如果此处误用 `score["Bob"]`，下一次人数就会错误地变成 2。

思路与程序的对应很直接：`map` 保存当前学籍，$\mathrm{op}$ 决定执行哪种操作，每个分支只做题意规定的读入、更新和输出。遇到 $\mathrm{op}=4$ 时没有姓名，不能额外读入 $\mathrm{name}$。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int q;
    cin >> q;
    map<string, int> score;
    while (q--) {
        int op;
        cin >> op;
        if (op == 4) {
            cout << score.size() << '\n';
            continue;
        }
        string name;
        cin >> name;
        if (op == 1) {
            int value;
            cin >> value;
            score[name] = value;
            cout << "OK\n";
        } else if (op == 2) {
            auto it = score.find(name);
            if (it == score.end()) cout << "Not found\n";
            else cout << it->second << '\n';
        } else {
            if (score.erase(name) != 0) {
                cout << "Deleted successfully\n";
            } else {
                cout << "Not found\n";
            }
        }
    }
    return 0;
}
```

每次操作至多维护一个键，姓名最多 20 个字符，整体时间 $\mathcal{O}(q \log  q)$，保存学籍的空间 $\mathcal{O}(q)$。

## 另一种常见用途：把数值映射为次数

例如 `1 1 2 3` 对应 1 出现 2 次、2 出现 1 次、3 出现 1 次。读取每个 $x$ 时执行 `frequency[x]++`，就完成统计。

若要找满足 $A-B=C$ 的数对，先固定 $A=x$，再查询 $B=x-C$ 出现过多少次。这里同一个数值可以出现在多个位置，必须保存次数，不能只保存“存在”。

数对总数可能超过 `int` 最大值 2147483647，因此答案使用 `long long`。先写出“固定谁、查询谁、累加什么”，再决定代码里的循环与 `map` 查询。

## 练习：先确定键和值分别是什么

先**独立重做 P5266**，在查询不存在姓名、修改同名学生、重复删除后检查人数。

### 推荐必做

1. [P1918 · 保龄球](https://www.luogu.com.cn/problem/P1918)：用瓶子数量查找对应发球位置，不存在输出 0。练习建立“数量→位置”的映射。
2. [P1102 · A-B 数对](https://www.luogu.com.cn/problem/P1102)：统计给定差值的数对，位置不同分别计数。练习“数值→次数”和 `long long` 累加。

### 选做巩固

- [P3405 · Cities and States](https://www.luogu.com.cn/problem/P3405)：统计城市前缀与州名互相对应的城市对。练习把两个信息组合成一个键，并排除同州情况。
- [P3879 · 阅读理解](https://www.luogu.com.cn/problem/P3879)：查询一个单词在哪些文章出现过，文章编号不能重复。练习把 `map` 与 `set` 或 `vector` 组合，先想清楚值该保存什么。

## 本节验收

- 能用一句话说明题目中“键是什么，值是什么”。
- 知道修改同一个键不会增加成员数量。
- 会区分只查询与用 `[]` 插入默认值。
- 能根据顺序需求和复杂度选择 `map` 或 `unordered_map`。
