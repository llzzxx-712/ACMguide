---
title: Trie 字典树与 01 Trie
description: 把单词按字符逐步存成树，共用相同前缀；再把整数按二进制位存储，按高位优先寻找最大异或值。
---

## 这一节学什么

Trie 把“读一个字符，就进入下一层”的过程存成树。相同前缀共用一段路径，完整单词在路径终点作标记。若每层只读二进制的 0 或 1，就得到 01 Trie，可以用来按位选择最优异或对象。

> **AI 伴学提示词**
>
> 为我讲解 Trie，用 a、ab、ac 画出共用前缀与单词终点，再用几个小整数的二进制模拟最大异或查询，并引导我对结点、字符边和贪心选择提问。

## 一棵树怎样保存单词

先建立一个根结点，表示还没有读任何字符。插入 ab，就沿 a、b 走两条边；不存在对应边时创建新结点。再插入 ac，第一条 a 的边已经存在，只需在它后面新建 c。

```text
根 0
└─ a → 结点 1（若 a 也是单词，在这里标记）
   ├─ b → 结点 2（ab 的终点）
   └─ c → 结点 3（ac 的终点）
```

结点表示一个前缀，边上的字符决定下一层读什么。路径存在，只说明这个前缀出现过；是否是完整单词，还要看终点标记。例如只插入 ab 后，路径 a 虽然存在，却不是已登记的完整姓名。

### 用代码记录字符边

每个结点有 26 个可能的下一站，next[c] 保存沿字符 c 走到的结点编号。小写字母用 c=ch−'a'，编号 0 到 25。

```text
struct Node {
    int next[26] = {};
    bool word = false;
    bool called = false;
};
vector<Node> trie(1); // 开始只有根结点，编号 0
```

边的值为 0 表示没有这条边，新结点从编号 1 开始。根结点虽然也是 0，但没有字符边需要指回根，因此两种用途不会混淆。

## 例题精讲一：P2580 · 于是他错误的点名开始了

**原题：** [P2580 · 于是他错误的点名开始了](https://www.luogu.com.cn/problem/P2580)。

**题意简述：** 先登记互不相同的小写姓名，再逐次点名。姓名不存在输出 WRONG，第一次正确点到输出 OK，正确姓名被再次点到输出 REPEAT。姓名长度≤50，人数≤10^4，点名次数≤10^5。

自拟输入：

```text
2
ab
ac
5
ab
a
ab
ac
ad
```

输出：

```text
OK
WRONG
REPEAT
OK
WRONG
```

插入时创建路径、设置 word；查询时只沿已有路径走，不创建结点。到了路径末尾，先看 word，再看 called，最后才修改正确姓名的 called 标记。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Node {
    int next[26] = {};
    bool word = false;
    bool called = false;
};
vector<Node> trie(1);

void insertWord(const string &s) {
    int u = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (trie[u].next[c] == 0) {
            int id = trie.size();
            trie[u].next[c] = id;
            trie.push_back(Node());
        }
        u = trie[u].next[c];
    }
    trie[u].word = true;
}

string query(const string &s) {
    int u = 0;
    for (char ch : s) {
        int c = ch - 'a';
        if (trie[u].next[c] == 0) return "WRONG";
        u = trie[u].next[c];
    }
    if (!trie[u].word) return "WRONG";
    if (trie[u].called) return "REPEAT";
    trie[u].called = true;
    return "OK";
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n;
    for (int i = 0; i < n; i++) {
        string s;
        cin >> s;
        insertWord(s);
    }
    cin >> m;
    while (m--) {
        string s;
        cin >> s;
        cout << query(s) << '\n';
    }
    return 0;
}
```

Node() 创建一个各条边均为 0、标记为 false 的新结点。创建前先记住它将得到的编号 id，加入 vector 后继续通过下标访问。一个结点最多新增一个字符前缀，所以结点数最多为登记姓名总字符数 L 加 1，而不是姓名人数加 1。

建树与查询时间分别与各自总字符数成正比；每个结点准备 26 条边，空间 O(26L)。本题姓名总长最多 50 万，选择容器和结点字段时要按这个规模估算空间。

## 01 Trie：每层改成读取一个二进制位

十进制数 5 的二进制为 101，2 为 010，7 为 111。补齐相同位数后，从最高位向最低位走，每层只有 0、1 两条可能的边。

异或运算写成 `^`：同一位相同得到 0，不同得到 1。

```text
  101   （5）
^ 010   （2）
-----
  111   （7）
```

注意 C++ 中 `^` 是按位异或，不是数学中的乘方。查询最大 x^y 时，希望从高位开始尽量得到 1：当前 x 的位为 b，就先找另一条 b^1 的分支；存在就选择它，不存在才走同位分支。

为什么可以优先决定高位？第 j 位的 1 贡献 2^j，超过所有更低位贡献之和 2^j−1；高位能得到 1，就不需要为了低位而放弃它。

## 例题精讲二：[P10471 最大异或对](https://www.luogu.com.cn/problem/P10471)

**题意简述：** 输入 n 个非负整数，选择两个不同位置，使两数异或最大。2≤n≤10^5，0≤a[i]<2^31。

输入：

```text
3
5 2 7
```

输出为 `7`，来自 5^2。

先插入第一个数。之后每读入 x，先在已有数中查最大异或，再插入 x，保证配对来自两个不同位置。0 到 2^31−1 共需第 30 到 0 位，左侧不足的位自动视为 0。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

struct Node {
    int next[2] = {};
};
vector<Node> trie(1);

void insertNumber(int x) {
    int u = 0;
    for (int bit = 30; bit >= 0; bit--) {
        int b = (x >> bit) & 1;
        if (trie[u].next[b] == 0) {
            int id = trie.size();
            trie[u].next[b] = id;
            trie.push_back(Node());
        }
        u = trie[u].next[b];
    }
}

int query(int x) {
    int u = 0, answer = 0;
    for (int bit = 30; bit >= 0; bit--) {
        int b = (x >> bit) & 1;
        int wanted = b ^ 1;
        if (trie[u].next[wanted] != 0) {
            answer |= 1 << bit;
            u = trie[u].next[wanted];
        } else {
            u = trie[u].next[b];
        }
    }
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, x;
    cin >> n >> x;
    insertNumber(x);
    int answer = 0;
    for (int i = 1; i < n; i++) {
        cin >> x;
        answer = max(answer, query(x));
        insertNumber(x);
    }
    cout << answer << '\n';
    return 0;
}
```

`answer |= 1 << bit` 表示用按位或把该位设为 1。最高处理第 30 位，所有数与结果均在非负 int 范围内。查询前至少插入过一个数，每层必定存在一条能继续的分支。

每个数插入与查询都只走 31 层，时间 O(31n)，空间最多 O(31n) 个结点。和字符串 Trie 相比，变化的是“每层读一个字符”还是“每层读一个位”，共用前缀与沿边查询的思路相同。

## 练习：让树上的信息服务于问题

先**独立重做 P2580 和最大异或对例题**，检查姓名前缀却不是完整姓名、重复点名、相同数值位于不同位置，以及数值 0 与 2^31−1。

### 推荐必做

1. [P1481 · 魔族密码](https://www.luogu.com.cn/problem/P1481)：选择最长的单词前缀链。插入时沿路径查看已经结束的单词，将最长链长度保存在终点，练习把标记扩展成 DP 信息。
2. [P4551 · 最长异或路径](https://www.luogu.com.cn/problem/P4551)：先用 vector 邻接表遍历树，求根到每点的异或值 d[u]。两点路径值等于 d[u]^d[v]，公共根路径的边异或两次会抵消，再转化为 01 Trie 最大异或对；单点树的答案为 0。

### 选做巩固

- [P2922 · Secret Message G](https://www.luogu.com.cn/problem/P2922)：统计两段二进制信息在较短长度内前缀相同的条数。分别累计查询路径上已结束的信息数，以及查询结束处的子树信息数，注意完整相等的消息只统计一次。
- [P3879 · 阅读理解](https://www.luogu.com.cn/problem/P3879)：查询单词出现在哪些文章。终点保存文章编号，按文章顺序插入时，同一文章重复出现同一单词只加入一次编号，练习终点附加信息与去重。

## 本节验收

能画出前缀共用的路径；能区分路径存在和完整单词存在；能按总字符数估算结点数量，并用高位贡献解释 01 Trie 的贪心查询。
