---
title: 函数与结构体
---

## 今天要完成什么

把一个程序拆成几个职责清楚的小部分，用函数封装计算，再用结构体保存同一个对象的多项信息。今天先掌握基础写法，递归会在后续章节单独学习。

> **AI 伴学提示词**
>
> 为我讲解 C++ 函数、参数传递和结构体，并引导我对可能不理解的内容进行提问。

## 函数：给一段操作起名字

一个函数通常包含返回类型、名字、参数和函数体。参数把需要的数据送进去，`return` 把结果交回来。

下面定义 `square` 函数计算平方。例题约定输入整数的绝对值不超过 10⁹。

```cpp
#include <iostream>
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

输入 `12`，输出 `144`。本例把函数定义放在 `main` 之前，让编译器在看到调用时已经认识它。

返回类型为 `void` 的函数不返回一个值，适合执行输出等操作。不是所有函数都要写成 `int`。

## 参数与作用域

`square` 中的 `x` 是局部变量，只在该函数内部使用。`main` 里的 `n` 与它不是同一个名字，也不需要起成同名。

普通的值参数会得到一份副本。修改副本，不会自动修改调用者的原变量。需要修改原变量时，可以使用引用参数；下面的 `&` 表示引用：

```cpp
#include <iostream>
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

下面读入 `n` 位学生，输出分数最高者的姓名和分数；同分时保留最先输入的学生。例题约定 `1 <= n <= 100`，姓名不含空格。

```cpp
#include <iostream>
#include <string>
using namespace std;

struct Student {
    string name;
    int score;
};

int main() {
    int n;
    cin >> n;
    Student students[100];
    for (int i = 0; i < n; i++) {
        cin >> students[i].name >> students[i].score;
    }
    int best = 0;
    for (int i = 1; i < n; i++) {
        if (students[i].score > students[best].score) {
            best = i;
        }
    }
    cout << students[best].name << ' '
         << students[best].score << '\n';
    return 0;
}
```

输入：

```text
3
Alice 90
Bob 95
Carol 95
```

输出：

```text
Bob 95
```

`students[i].score` 中的点号表示访问某位学生的一个成员。结构体定义最后的 **`;` 不能省略**。

同分时保留最早者，是因为只有严格大于 `>` 才更新；如果改成 `>=`，同分时会保留最后一位。这属于题目规则，不能随意替换。

## 怎样拆函数才合适

先用自然语言描述每个部分：“读入数据”“判断一个数是否满足条件”“计算距离”“输出结果”。如果某段操作会重复使用，或者抽出来能让主流程更清楚，就适合写成函数。

函数名尽量说明用途，参数尽量清楚，不要为了把代码拆开而拆成许多难以理解的小函数。也不要依赖大量共享的全局变量，导致函数的输入输出看不出来。

## 分层练习

**基础：** [P5735 · 距离函数](https://www.luogu.com.cn/problem/P5735)、[P5737 · 闰年展示](https://www.luogu.com.cn/problem/P5737)。可以把前面学过的计算和判断封装成函数。

**巩固：** [P5740 · 最厉害的学生](https://www.luogu.com.cn/problem/P5740)。注意它的成绩字段和比较规则与本页示例不同，要按原题修改。

对应题单：[函数与结构体 #105](https://www.luogu.com.cn/training/105)。其中需要递归、数论或其他后续知识的题，不必今天全部完成。

## 今日验收

- 能写出带参数、有返回值的函数，并在 `main` 中调用。
- 能说清值参数和引用参数在修改原变量方面的区别。
- 能用结构体和结构体数组组织多项数据。
- 能解释最值更新中 `>` 和 `>=` 对同分情况的影响。
