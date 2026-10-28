---
title: 函数与结构体
---

## 今天要完成什么

前面已经能写出完整的小程序。今天学习给一段计算起名字，方便反复调用；再把同一个学生的姓名和成绩放在一起保存。学完后，用这些方法解决“找出总分最高的学生”。

> **AI 伴学提示词**
>
> 为我讲解 C++ 函数、参数传递和结构体，并引导我对可能不理解的内容进行提问。

## 函数：给一段操作起名字

一个函数通常包含返回类型、名字、参数和函数体。参数把需要的数据送进去，`return` 把结果交回来。

先做一个本地演示：定义 `square` 函数计算平方。输入整数的绝对值不超过 10⁹，平方最多为 10¹⁸，因此返回值使用 `long long`。

```cpp
#include<bits/stdc++.h>
using namespace std;

long long square(long long x) {
    return x * x;
}

int main() {
    long long n;
    cin >> n;
    cout << square(n) << '\n';
    return 0;
}
```

输入 `12`，输出 `144`。程序执行到 `square(n)` 时，把 n 的值交给参数 x，进入 square 计算 x * x；return 把结果交回调用处，再由 `cout` 输出。函数定义放在 main 之前，让编译器在看到调用时已经认识它。

返回类型为 `void` 的函数不返回一个值，适合执行输出等操作。不是所有函数都要写成 `int`。

## 参数与作用域

`square` 中的 `x` 是局部变量，只在该函数内部使用。`main` 里的 `n` 与它不是同一个名字，也不需要起成同名。

普通的值参数会得到一份副本。修改副本，不会自动修改调用者的原变量。需要修改原变量时，可以使用引用参数；下面的 `&` 表示引用：

```cpp
#include<bits/stdc++.h>
using namespace std;

void addOne(int& x) {
    x++;
}

int main() {
    int n;
    cin >> n;
    addOne(n);
    cout << n << '\n';
    return 0;
}
```

输入 `7`，输出 `8`。如果去掉参数中的 `&`，函数只会修改自己的副本，最终输出仍是 `7`。本例输入约定在 -10⁹ 到 10⁹ 之间，避免加一溢出。

现在先记住“值参数传副本，引用参数可修改原值”即可。数组参数有不同的规则，不要把“修改函数里的数组不会影响外面”当成一般结论。

## 结构体：把相关数据放在一起

一个学生同时有名字和分数。与其用两个不相干的变量来回找对应关系，不如定义一个 `Student`。

结构体把多个成员放在一个类型里，例如：

```text
struct Student {
    string name;
    int chinese, math, english;
};
```

这段定义创造了 Student 类型。之后可以用 `Student s;` 准备一个学生，用 `s.name` 访问姓名，用 `s.math` 访问数学成绩。点号表示“取出这个对象的某个成员”，定义末尾的分号不能省略。

如果要保存多名学生，可以定义 `Student students[1000];`。`students[i].math` 就是第 i 名学生的数学成绩。

## 怎样拆函数才合适

先用自然语言描述每个部分：“读入数据”“判断一个数是否满足条件”“计算距离”“输出结果”。如果某段操作会重复使用，或者抽出来能让主流程更清楚，就适合写成函数。

函数名尽量说明用途，参数尽量清楚，不要为了把代码拆开而拆成许多难以理解的小函数。也不要依赖大量共享的全局变量，导致函数的输入输出看不出来。

## 例题精讲：P5740 · 最厉害的学生

**原题：** [P5740 · 最厉害的学生](https://www.luogu.com.cn/problem/P5740)。

**题意简述：** 输入不超过 1000 名学生的姓名、语文、数学、英语成绩，每科不超过 150 分。找出总分最高者，输出其姓名和**三科原始成绩**；总分相同，保留输入靠前的那位。

### 先确定存什么、比较什么、输出什么

一位学生有四项信息，适合用 Student 保存。比较时需要反复求总分，因此写一个 `total(Student s)` 函数，返回三科成绩之和。

再用 best 记录“目前最好的学生下标”。先让第一位学生暂时成为最好者，从第二位开始逐个比较：

- 当前学生总分更高，更新 best。
- 总分相同，不更新，这样就保留了先输入者。
- 最后用 best 找到获选学生，输出姓名与各科成绩。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Student {
    string name;
    int chinese, math, english;
};

int total(Student s) {
    return s.chinese + s.math + s.english;
}

int main() {
    int n;
    cin >> n;
    Student students[1000];
    for (int i = 0; i < n; i++) {
        cin >> students[i].name
            >> students[i].chinese
            >> students[i].math
            >> students[i].english;
    }
    int best = 0;
    for (int i = 1; i < n; i++) {
        if (total(students[i]) > total(students[best])) {
            best = i;
        }
    }
    printf("%s %d %d %d\n", students[best].name.c_str(),
           students[best].chinese, students[best].math,
           students[best].english);
    return 0;
}
```

输入：

```text
3
alice 100 90 80
bob 90 100 80
carol 100 95 90
```

输出：

```text
carol 100 95 90
```

alice 和 bob 都是 270 分，读到 bob 时不更新；carol 是 285 分，才更新 best。注意题目要输出三科成绩，不能只输出总分。

`printf` 中 `%s` 表示字符串，`name.c_str()` 把 `string` 提供为它需要的字符序列形式；后面三个 `%d` 依次对应三科整数成绩。

再把 carol 的三科改成 90、90、90。此时三人都是 270 分，应该输出最先输入的 alice。这能检验严格大于号 `>` 是否写对；若写成 `>=`，就会错误地留下最后一位。

## 练习：先重做，再封装计算过程

先关闭代码，独立通过 [P5740 · 最厉害的学生](https://www.luogu.com.cn/problem/P5740)，说清 total 的输入和返回值，以及 best 保存的是什么。

### 推荐必做

1. [P5735 · 距离函数](https://www.luogu.com.cn/problem/P5735)：输入三个点坐标，输出三角形周长，保留两位小数。把两点距离写成函数，调用三次；平方根用 `sqrt(x)`，输出用 `printf`。
2. [P5737 · 闰年展示](https://www.luogu.com.cn/problem/P5737)：输出指定区间内的闰年个数与全部年份。把闰年判断封装成返回 `bool` 的函数，再在循环中调用。

### 选做：需要继续巩固时练习

1. [P5739 · 计算阶乘](https://www.luogu.com.cn/problem/P5739)：计算 n!，n 不超过 12。先写一个内部使用循环的阶乘函数，明确参数与返回值；原题“不使用循环”的挑战可以在学到递归后再尝试。
2. [P5741 · 旗鼓相当的对手 - 加强版](https://www.luogu.com.cn/problem/P5741)：找出每科分差与总分分差都满足要求的学生组合，输出姓名。练习结构体数组、两层循环和判断函数；整数分差可用 `abs(a - b)` 求绝对值。输入姓名已有字典序，按原顺序枚举组合。

对应题单：[函数与结构体 #105](https://www.luogu.com.cn/training/105)。

## 今日验收

- 能解释一次函数调用如何传入参数、交回结果。
- 能说清值参数与引用参数修改原变量时的区别。
- 会用结构体和结构体数组组织多项数据。
- 能按题目规则处理同分，输出题目要求的字段。
