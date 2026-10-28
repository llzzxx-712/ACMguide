---
title: 排序贪心：交换论证与排序规则
description: 固定其他位置，只计算交换两个元素后的变化，再把局部不劣关系转化为排序规则。
---

## 这一节学什么

题目要求重新排列一群对象时，不要只猜“按大的排”还是“按小的排”。可以先固定其他位置，交换相邻两个元素，计算答案受到什么影响。若逆序的一对换过来总不会更差，就能逐步把一个最优方案变成按该规则排序的方案。

> **AI 伴学提示词**
>
> 为我讲解排序贪心的交换论证，推导国王游戏为什么按左右手乘积升序排序，区分局部比较与全局证明，并引导我提问。

## 先从排队等待找直觉

两个任务耗时为 $x$、$y$，共用同一台机器。在它们之前已有 $S$ 时间：

```text
x 在前：两人的完成时间和 = (S+x) + (S+x+y)
y 在前：两人的完成时间和 = (S+y) + (S+y+x)
前者 - 后者 = x-y
```

两项之前的人没变，之后的人也只看这两项总耗时 $x+y$，因此都不受交换影响。若 $x\le y$，让 $x$ 在前不会更差。遇到一对“大耗时在前”的相邻逆序就交换，直到整体升序，总完成时间只会减少或不变。

这比“短任务先做应该更好”多了两个关键步骤：**明确哪些贡献变了；解释局部交换为什么能一直做到整体有序。**

## 例题精讲：P1080 · 国王游戏

**原题：** [P1080 · 国王游戏](https://www.luogu.com.cn/problem/P1080)。

**题意简述：** 国王固定在最前方，其后 $n$ 位大臣可以重排。每人左右手为正整数 $a$、$b$，一位大臣的奖赏为“前面所有人的 $a$ 的乘积除以自己的 $b$，向下取整”。使所有大臣奖赏的最大值尽可能小。$n\le 1000$，所有 $a$、$b$ 都小于 10000。

自拟输入：

```text
2
2 1
3 2
2 5
```

输出 `1`。国王左手为 2，两种顺序的奖赏分别为：

| 顺序 | 第一位奖赏 | 第二位奖赏 | 最大值 |
| --- | --- | --- | --- |
| $(3,2)\to(2,5)$ | $\lfloor 2/2\rfloor=1$ | $\lfloor 6/5\rfloor=1$ | 1 |
| $(2,5)\to(3,2)$ | $\lfloor 2/5\rfloor=0$ | $\lfloor 4/2\rfloor=2$ | 2 |

因此排序应让 $(3,2)$ 在前。接下来把这个判断推广到任意两个相邻大臣。

### 固定其他人，只交换相邻两位

设到达这两位之前，左手乘积为 $S$。两位大臣分别为 $x=(a_x,b_x)$、$y=(a_y,b_y)$。

```text
x 在前：局部最大值 = max(⌊S/bₓ⌋, ⌊S·aₓ/bᵧ⌋)
y 在前：局部最大值 = max(⌊S/bᵧ⌋, ⌊S·aᵧ/bₓ⌋)
```

交换不影响前面的人。后面的人看到的乘积始终是 $Sa_xa_y$，也不变，所以只需比较上面两项。

先看没有向下取整的式子，把分母统一为 $b_xb_y$：

```text
x 在前：S/(bₓbᵧ) · max(bᵧ, aₓbₓ)
y 在前：S/(bₓbᵧ) · max(bₓ, aᵧbᵧ)
```

若 $a_xb_x\le a_yb_y$，因为 $a_y\ge 1$，所以 $b_y\le a_yb_y$。因此前式 max 中的两项都$\le a_yb_y$，而后式至少是 $a_yb_y$，前式不会更大。

向下取整不会破坏这个大小关系，并且 `max(⌊u⌋,⌊v⌋)=⌊max(u,v)⌋`，因此原题的整数奖赏也满足“乘积小的放前面不劣”。

### 从这一对，走到整个排列

如果一个最优排列里有相邻的乘积逆序，就交换它们，最大奖赏不会增加。不断交换，就像冒泡排序一样，最后按 $a\times b$ 升序排列，仍是最优方案。乘积相等时，两种顺序都不劣，任意排列即可。

有些题比较的对象可能隔着几个元素，也可以研究交换；但必须把中间元素受到的影响一起算上。局部交换还需要能导向一种整体顺序，比较关系应当满足传递性，才能交给 `sort`；不能把“某几组测试换了更好”当作证明。

### 排序后按原规则计算

维护 product，初始为国王的左手数。依次处理大臣：

1. `reward = product / b`，先计算此人的奖赏，因为前面的乘积不包含自己。
2. 更新最大奖赏。
3. `product *= a`，让这个人的左手数加入后面人的前缀乘积。

乘积可能有几千位十进制数字，超出 `long long`。下面将大整数封装成四个辅助操作：乘一个小整数、除一个小整数、比较大小、输出。贪心主体仍是上面的三步，可以先读 main，再回来看辅助函数如何保存数字。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

// 十进制从低位到高位保存，例如 123 保存为 {3,2,1}。
using Big = vector<int>;

void multiply(Big &a, int value) {
    int carry = 0;
    for (int &digit : a) {
        int current = digit * value + carry;
        digit = current % 10;
        carry = current / 10;
    }
    while (carry) {
        a.push_back(carry % 10);
        carry /= 10;
    }
}

Big divide(const Big &a, int value) {
    Big result(a.size());
    int remainder = 0, n = a.size();
    for (int i = n - 1; i >= 0; i--) {
        int current = remainder * 10 + a[i];
        result[i] = current / value;
        remainder = current % value;
    }
    while (result.size() > 1 && result.back() == 0) result.pop_back();
    return result;
}

bool smaller(const Big &a, const Big &b) {
    if (a.size() != b.size()) return a.size() < b.size();
    int n = a.size();
    for (int i = n - 1; i >= 0; i--) {
        if (a[i] != b[i]) return a[i] < b[i];
    }
    return false;
}

void print(const Big &a) {
    int n = a.size();
    for (int i = n - 1; i >= 0; i--) cout << a[i];
    cout << '\n';
}

struct Minister { int a, b; };

int main() {
    int n, kingA, kingB;
    cin >> n >> kingA >> kingB;
    vector<Minister> ministers(n);
    for (Minister &person : ministers) cin >> person.a >> person.b;
    sort(ministers.begin(), ministers.end(), [](const Minister &x, const Minister &y) {
        return 1LL * x.a * x.b < 1LL * y.a * y.b;
    });
    Big product(1, 1), answer(1, 0);
    multiply(product, kingA);
    for (const Minister &person : ministers) {
        Big reward = divide(product, person.b);
        if (smaller(answer, reward)) answer = reward;
        multiply(product, person.a);
    }
    print(answer);
    return 0;
}
```

国王的右手数不参与任何大臣的除法，但输入中仍要读入。`sort` 只排列大臣，不能把国王混进去。比较函数使用严格小于，不能写小于等于。

辅助函数中的 $\mathrm{carry}$ 表示进位，$\mathrm{remainder}$ 表示余数；每次除法都从高位向低位，得到的 $\mathrm{result}$ 是整数商。末尾删除的是存储向量中对应的高位零，至少留下一个 0。这些函数只处理本题需要的非负整数与正的小整数除法。

排序 $\mathcal{O}(n \log  n)$。若最大数字位数为 $L$，扫描时的大整数运算为 $\mathcal{O}(nL)$，空间 $\mathcal{O}(n+L)$。本题 $L$ 不超过约 4000，不能将含逐位运算的总时间只写成 $\mathcal{O}(n \log  n)$。

## 练习：先写出交换影响，再写比较函数

先**独立重做 P1080**。对 $n\le 7$ 的数据枚举全排列，用真实奖赏公式找最优答案，再检查排序结果。

### 推荐必做

1. [P1223 · 排队接水](https://www.luogu.com.cn/problem/P1223)：安排接水顺序使平均等待时间最小。推导交换两人后总等待时间的变化，按耗时升序、耗时相同按原编号升序排序；使用 `printf` 将平均等待时间保留两位小数。
2. [P6243 · The Milk Queue](https://www.luogu.com.cn/problem/P6243)：每头奶牛依次经过两道工序，求完成所有奶牛的最短时间。比较相邻两头牛交换前后的完工时间，推导排序规则。

### 选做巩固

- [P2123 · 皇后游戏](https://www.luogu.com.cn/problem/P2123)：奖赏改成递推式，重新列出相邻交换前后的局部表达式，分析哪些部分控制后续最大值，练习从式子推排序规则。
- [P1417 · 烹调方案](https://www.luogu.com.cn/problem/P1417)：在时限内选择并安排食材，完成时间会影响美味指数。先用相邻交换确定选择后的处理顺序，再结合背包状态决定选哪些食材。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)。

## 本节验收

能写出交换两项前后的答案；能说明其他位置为什么不变；能用消除相邻逆序连接局部结论和全局最优；能解释国王游戏的排序关键字、取整以及计算顺序。
