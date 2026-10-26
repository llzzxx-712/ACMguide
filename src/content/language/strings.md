---
title: 字符串
---

## 今天要完成什么

学会存储和处理文字：用 `char` 表示一个字符，用 `string` 表示一串字符。能读取一个单词或一整行，并逐个处理里面的字符。

## 字符与字符串

- `'A'` 是一个字符，使用**单引号**，类型通常是 `char`。
- `"ACM"` 是字符串字面量，使用**双引号**，可以用来初始化 `string`。
- `string s = "ACM";` 让 `s` 存下这三个字符。

使用 `string` 时引入头文件 `<string>`。`s.size()` 返回长度，`s[i]` 访问下标为 `i` 的字符。合法字符下标为 `0` 到 `s.size() - 1`；空字符串没有可读写的字符位置。

和数组一样，**字符串也要检查边界**。`s.size()` 返回的是无符号类型，初学阶段需要倒序循环时，可先把长度转成 `int`，在本章的小规模字符串范围内使用。

## 读取一个单词

输入一个不带空格的单词，把它倒序输出：

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    cin >> s;
    int n = static_cast<int>(s.size());
    for (int i = n - 1; i >= 0; i--) {
        cout << s[i];
    }
    cout << '\n';
    return 0;
}
```

输入 `ACM`，输出 `MCA`。`cin >> s` 会跳过前面的空白，再读到下一个空白为止，所以它不能一次读入带空格的完整句子。

## 读取一整行

`getline(cin, s)` 会读取一行，可以保留其中的空格，遇到行尾时结束，并取走换行符。

下面读入一行文字，统计里面有多少个英文字母。例题只考虑普通英文和 ASCII 字符。

```cpp
#include <iostream>
#include <string>
using namespace std;

int main() {
    string s;
    getline(cin, s);
    int letters = 0;
    for (char c : s) {
        if ((c >= 'a' && c <= 'z') ||
            (c >= 'A' && c <= 'Z')) {
            letters++;
        }
    }
    cout << letters << '\n';
    return 0;
}
```

输入 `I love ACM 2026!`，输出 `8`。这里的 `for (char c : s)` 是范围循环：依次把每个字符取出来，放进本轮的 `c` 中。

这里按字节处理英文字符，不能把它直接当作逐个处理汉字的通用方法。

## cin 和 getline 混用

先用 `cin >> n` 读整数时，行末的换行通常还留在输入中。紧接着调用 `getline`，它就可能读到一个空行。

如果题目规定“第一行是一个整数，第二行是完整文本”，可以在读整数后使用 `cin.ignore(numeric_limits<streamsize>::max(), '\n');` 丢弃当前行的剩余内容，再 `getline`。使用这句时需要引入 `<limits>`。

另一种常见写法是 `getline(cin >> ws, s)`，但 `ws` 会跳过所有前导空白，因此**不适合需要保留行首空格或空行的题目**。按照题目输入格式选择，不要机械套用。

## 常用操作先学这些

| 操作 | 含义 |
| --- | --- |
| `s.size()` | 字符串长度 |
| `s.empty()` | 是否为空 |
| `s + t` | 连接两个字符串 |
| `s += c` | 在末尾追加字符或字符串 |
| `s.substr(pos, len)` | 从 `pos` 开始取一段；注意起点合法 |
| `s == t` | 内容是否相同 |

字符 `'0'` 和整数 `0` 不是同一个东西。如果已经确认 `c` 是数字字符，可以用 `c - '0'` 得到对应的整数数字。

普通字符数组也能存放文本，但 C 风格字符串还要为结尾的 `\0` 留位置。本阶段主要用 `string`；读到字符数组写法时，记住结尾标记和容量要求。

## 分层练习

**基础：** [P5733 · 自动修正](https://www.luogu.com.cn/problem/P5733)、[P5015 · 标题统计](https://www.luogu.com.cn/problem/P5015)。后者要按题意判断哪些字符计入长度。

**巩固：** [P1914 · 小书童——凯撒密码](https://www.luogu.com.cn/problem/P1914)，处理超过 `'z'` 后的循环回绕。

对应完整题单：[字符串 #104](https://www.luogu.com.cn/training/104)。

## 今日验收

- 能解释 `'A'` 和 `"A"` 的区别。
- 能根据题目选择 `cin >> s` 或 `getline`。
- 能遍历字符串，完成计数、倒序或简单替换。
- 知道 `cin` 后接 `getline` 可能读到空行，并能按输入格式处理。
