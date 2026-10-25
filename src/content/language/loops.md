---
title: 循环结构
---

## 两天怎么安排

- **第 6 天：** 学 `for`、`while`，完成求和、计数、最值练习。
- **第 7 天：** 学多重循环、`break`、`continue`，用手工追踪检查边界。

循环适合处理“重复做同一类事情”。与其把十条类似语句写十遍，不如写清楚起点、继续条件和每次的变化。

## for：次数或范围比较明确

求 1 到 `n` 的和，例题约定 `1 <= n <= 1000000`：

```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    long long sum = 0;
    for (int i = 1; i <= n; i++) {
        sum += i;
    }
    cout << sum << '\n';
    return 0;
}
```

输入 `5`，输出 `15`。`sum += i` 相当于 `sum = sum + i`。

`for (初始化; 继续条件; 每轮后的更新)` 的执行顺序是：

1. 初始化，只执行一次。
2. 判断继续条件；为假时退出。
3. 执行循环体。
4. 更新变量，再回到第 2 步。

用 `n = 3` 手工列出每一轮的 `i` 和 `sum`。最后一轮结束后，`i` 变成 4，条件不再满足，所以不会把 4 加进去。

## while：满足条件就继续

读入一个非负整数 `n`，不断去掉末位，计算它有几位：

```cpp
#include <iostream>
using namespace std;

int main() {
    long long n;
    cin >> n;
    int digits = 0;
    if (n == 0) {
        digits = 1;
    }
    while (n > 0) {
        digits++;
        n /= 10;
    }
    cout << digits << '\n';
    return 0;
}
```

输入 `2030`，输出 `4`；输入 `0`，输出 `1`。特判 0 是因为它有一位，但不会进入 `while (n > 0)`。

检查循环时，始终问：**这一轮结束以后，是否朝终止条件靠近了？** 如果忘记 `n /= 10`，正数输入会让循环一直继续。

`do ... while` 会先执行一次再判断，了解它与 `while` 的区别即可，本阶段不必专门使用。

## 多重循环：一层负责行，一层负责列

输出 `n` 行星号，第 `i` 行有 `i` 个星号，例题约定 `1 <= n <= 20`：

```cpp
#include <iostream>
using namespace std;

int main() {
    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= i; j++) {
            cout << '*';
        }
        cout << '\n';
    }
    return 0;
}
```

输入 `3`，输出：

```text
*
**
***
```

换行在内层循环结束后，所以一整行星号打印完才换行。

## break 和 continue

- `break`：结束当前最内层循环，继续执行循环后面的代码。
- `continue`：跳过当前轮剩下的语句，进入下一轮；在 `for` 中仍会执行更新部分。

注意：在 `while` 中，如果更新变量的语句被 `continue` 跳过，就可能造成死循环。

## 循环里的三个常见任务

**计数：** 先让 `count = 0`，每遇到一个满足条件的对象就加 1。

**累加：** 先让 `sum = 0`，每轮加入一个值。数据总和较大时使用 `long long`。

**最值：** 用第一个真实数据初始化最小值或最大值，再与后面的数据比较。不要随手把最小值初始化为 0——如果输入全是正数，结果就可能一直错误地停在 0。

## 分层练习

**第 6 天基础：** [P5722 · 数列求和](https://www.luogu.com.cn/problem/P5722)、[P5718 · 找最小值](https://www.luogu.com.cn/problem/P5718)、[P5719 · 分类平均](https://www.luogu.com.cn/problem/P5719)。

**第 7 天巩固：** [P5721 · 数字直角三角形](https://www.luogu.com.cn/problem/P5721)、[P1307 · 数字反转](https://www.luogu.com.cn/problem/P1307)。注意格式、0 和负数等题目允许的边界。

**提高组选做：** [P1980 · 计数问题](https://www.luogu.com.cn/problem/P1980)、[P1089 · 津津的储蓄计划](https://www.luogu.com.cn/problem/P1089)。

对应题单：[循环结构 #102](https://www.luogu.com.cn/training/102)。其中 **P1009“阶乘之和”涉及高精度，本轮跳过**。

## 两天验收

- 能手工列出一个循环的每轮变量值，准确说出循环执行多少次。
- 能独立写出求和、计数和求最值程序。
- 能说明每个循环为什么会结束。
- 能区分循环边界 `i < n` 与 `i <= n`，并测试 `n = 1`。
