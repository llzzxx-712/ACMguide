---
title: 字符串哈希与子串比较
description: 把字符串按进制累积成数字指纹，再用前缀哈希去掉前段，快速取得任意子串的指纹。
---

## 这一节学什么

第二章把哈希理解为“给数据算一个方便查找的编号”。现在进一步学习怎样给字符串计算数字指纹，并用前缀信息快速比较子串。先推导一组哈希的公式，再在代码里同时计算两组。

> **AI 伴学提示词**
>
> 为我讲解字符串哈希，用小进制手算 abc 的前缀与 bc 的子串哈希，解释幂次、取模和冲突，再对照代码引导我提问。

## 把字符当成一个数位

先令 a 对应 1、b 对应 2、c 对应 3。像十进制写 123 一样，可以把 abc 看成 1×B²+2×B+3，其中 B 是选择的基数。

每读入一个字符，将旧值乘 B，再加入新字符的编号：

```text
h[i] = (h[i-1] * B + value[i]) % MOD;
```

取模控制数字范围，不让长字符串的进制数无限增长。实际代码使用 B=131，并选择较大的模数。

例如为了手算方便，暂取 B=10、`MOD = 101`：a 的哈希为 1，ab 为 12，abc 为 123 mod 101=22。取模前后表示方式不同，但递推规则相同。

## 前缀哈希怎样得到子串

定义 `h[i]` 为前 i 个字符的哈希，`power[len]` 为 B^len mod MOD。前 r 个字符可以分成前 l−1 个字符和目标子串 `[l, r]`：

```text
前缀 r 的进制数
= 前缀 l-1 的进制数 * B^(r-l+1) + 子串的进制数
```

所以子串哈希为：

```text
(h[r] - h[l-1] * power[r-l+1] % MOD + MOD) % MOD
```

乘以幂次，是把要删除的旧前缀移到它原本所在的高位。不能只写 `h[r] - h[l - 1]`：它们的字符位权不同。

对上面 abc 中的 bc，算 22−1×100，取模得到 23，正好对应 2×10+3。代码额外加 MOD，让减法结果先回到非负范围。

> **哈希保存的是指纹。**
>
> 不同字符串可能得到相同指纹，这叫哈希冲突；指纹不同可以确定字符串不同，相同指纹则可能来自冲突。本节同时比较长度与两组模数下的哈希，减少碰撞。后面的 KMP 与 Trie 会直接利用字符关系完成匹配和查询。

## 例题精讲：[P10468 兔子与兔子](https://www.luogu.com.cn/problem/P10468)

**题意简述：** 输入一个非空小写字符串和 q 次询问，每次给出 l1、r1、l2、r2，判断两个闭区间子串是否相同，输出 Yes 或 No。原题长度、q≤10⁶，下标从 1 开始。第一行输入字符串，第二行输入 q，后面每行四个端点。使用两组前缀哈希进行比较。

自编输入：

```text
abcabc
3
1 3 4 6
1 2 2 3
1 3 1 2
```

输出：

```text
Yes
No
No
```

第一问两个 abc 的位置不同，但去掉旧前缀后，子串内部的相对位权相同，因此得到相同指纹。第二问 ab 与 bc 不同，第三问长度不同，直接判为不同。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 1000000 + 5;
const long long BASE = 131;
const long long MOD1 = 1000000007, MOD2 = 1000000009;
long long h1[N], h2[N], power1[N], power2[N];

long long getHash(long long h[], long long power[], int l, int r, long long mod) {
    return (h[r] - h[l-1] * power[r-l+1] % mod + mod) % mod;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string s;
    int q;
    cin >> s >> q;
    int n = s.size();
    s = " " + s;
    power1[0] = power2[0] = 1;
    for (int i = 1; i <= n; i++) {
        int value = s[i] - 'a' + 1;
        h1[i] = (h1[i-1] * BASE + value) % MOD1;
        h2[i] = (h2[i-1] * BASE + value) % MOD2;
        power1[i] = power1[i-1] * BASE % MOD1;
        power2[i] = power2[i-1] * BASE % MOD2;
    }
    while (q--) {
        int l1, r1, l2, r2;
        cin >> l1 >> r1 >> l2 >> r2;
        bool same = r1 - l1 == r2 - l2;
        if (same) same = getHash(h1, power1, l1, r1, MOD1) == getHash(h1, power1, l2, r2, MOD1);
        if (same) same = getHash(h2, power2, l1, r1, MOD2) == getHash(h2, power2, l2, r2, MOD2);
        cout << (same ? "Yes" : "No") << '\n';
    }
    return 0;
}
```

字符串前面加一个空格，是让有效字符从 1 开始，与询问下标一致。`h[0] = 0` 表示空前缀，`power[0] = 1` 表示 B^0。两个哈希值相乘最大约 10^18，在 `long long` 范围内，不能用 `int` 保存这些乘法的中间结果。

建表 $\mathcal{O}(n)$，每次取得一个子串指纹 $\mathcal{O}(1)$，全部比较 $\mathcal{O}(n+q)$，空间 $\mathcal{O}(n)$。我们省掉的是“每次都从头逐字符重比”的重复工作。

## 练习：先写清数字代表哪个字符串

先**独立重做子串比较例题**，检查同位置、不同位置同内容、不同长度、单个字符与整串比较。

### 推荐必做

1. [P3370 · 字符串哈希](https://www.luogu.com.cn/problem/P3370)：统计不同字符串数量。回看第二章保存完整字符串的做法，再练习用长度和两组数字指纹组织去重；输入含大小写字母与数字，需要为这些字符设置不同编号。
2. [P3375 · KMP](https://www.luogu.com.cn/problem/P3375)：输出模式串在文本中的所有位置及模式串各前缀的最长 border。用子串哈希检查等长窗口，再结合前一节的前缀函数完成题目要求。

### 选做巩固

- [CF126B · Password](https://www.luogu.com.cn/problem/CF126B)：找同时是前缀、后缀且在中间出现的最长子串。练习用子串哈希比较候选，再思考怎样利用前缀关系控制检查次数。
- [CF1200E · Compress Words](https://www.luogu.com.cn/problem/CF1200E)：依次合并单词，每次重叠已有结果的后缀和新词的最长相同前缀。维护指纹比较候选重叠，关注单词总长度与整体复杂度。

## 本节验收

能推导去掉旧前缀时的幂次；能处理 `h[0]`、`power[0]` 与负模；能区分字符串本身和数字指纹，并解释预处理怎样减少重复比较。
