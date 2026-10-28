---
title: 遍历序列还原与二叉搜索树入门
description: 用中序定位左右子树，把还原过程写成递归；再利用有序关系实现二叉搜索树的插入和查找。
---

## 这一节学什么

上一节从树得到遍历序列。这一节反过来：给出序列，怎样找出根和左右子树？随后认识二叉搜索树，看看在结点之间加入大小关系，能怎样帮助查找。

> **AI 伴学提示词**
>
> 为我讲解如何从中序和后序还原二叉树，逐步划分子树区间，再讲解二叉搜索树的插入与查找，并引导我对不理解的细节提问。

## 从序列里找出根与分界

前序的第一个结点是根，后序的最后一个结点是根。中序则把一棵子树排成“左子树、根、右子树”。

因此，若结点标记互不重复，已知中序和后序，就可以：

1. 用后序末尾确定当前根。
2. 在中序找到根，左边全部属于左子树，右边全部属于右子树。
3. 根据左右子树的结点数量，切分后序中对应的两段。
4. 对两棵更小的子树重复相同过程。

不需要先背递归的四个参数。先把纸上的区间切对，再用参数记录每段的起止位置。

## 例题精讲：P1030 · 求先序排列

**原题：** [P1030 · 求先序排列](https://www.luogu.com.cn/problem/P1030)。

**题意简述：** 给出中序与后序，结点用互不相同的大写字母表示，总数不超过 8。输出前序序列。

本节自拟输入：

```text
DBEACF
DEBFCA
```

输出：

```text
ABDECF
```

### 先手动切分一次

后序末尾为 `A`，根就是 `A`。在中序找到 `A`：

```text
中序：  D B E | A | C F
         左3个       右2个

后序：  D E B | F C | A
         左3个   右2个  根
```

于是左子树的问题变成“中序 `DBE`、后序 `DEB`”，右子树的问题变成“中序 `CF`、后序 `FC`”。先输出 `A`，再递归输出左子树的前序 `BDE`，再输出右子树的前序 `CF`，合在一起就是 `ABDECF`。

### 把切分写成闭区间参数

把四个边界写成一次函数调用：

`solve(inLe, inRi, postLe, postRi)`

它处理两段闭区间：中序的 $[\mathrm{inLe},\mathrm{inRi}]$ 与后序的 $[\mathrm{postLe},\mathrm{postRi}]$，字符串下标从 0 开始。

1. **取出根。** 后序最后一个字符是 `post[postRi]`。
2. **找到分界。** 在中序找到根的位置 $k$。
3. **数出左子树大小。** 计算 `leftSize = k - inLe`，再用这个数量切分后序。

| 递归任务 | 中序区间 | 后序区间 |
| --- | --- | --- |
| 左子树 | $[\mathrm{inLe},k-1]$ | $[\mathrm{postLe},\mathrm{postLe}+\mathrm{leftSize}-1]$ |
| 右子树 | $[k+1,\mathrm{inRi}]$ | $[\mathrm{postLe}+\mathrm{leftSize},\mathrm{postRi}-1]$ |

左子树后序从 $\mathrm{postLe}$ 开始，一共取 $\mathrm{leftSize}$ 个字符，所以末尾是 $\mathrm{postLe}+\mathrm{leftSize}-1$。

右子树后序的末尾是 $\mathrm{postRi}-1$，因为最后的根已经取出。若一段区间的左端点大于右端点，说明子树为空，直接返回。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

string in, post;

void solve(int inLe, int inRi, int postLe, int postRi) {
    if (inLe > inRi) return;
    char root = post[postRi];
    int k = inLe;
    while (in[k] != root) {
        k++;
    }
    int leftSize = k - inLe;
    cout << root;
    solve(inLe, k - 1, postLe, postLe + leftSize - 1);
    solve(k + 1, inRi, postLe + leftSize, postRi - 1);
}

int main() {
    cin >> in >> post;
    int n = in.size();
    solve(0, n - 1, 0, n - 1);
    cout << '\n';
    return 0;
}
```

本题保证两串来自同一棵合法二叉树且标记互异，所以根会在当前中序区间内找到。最多 $n$ 个递归任务，每次查根最多扫描 $n$ 个位置，时间上界 $\mathcal{O}(n^{2})$，递归空间 $\mathcal{O}(n)$；本题 $n\le 8$，规模很小。

## 哪两种遍历能够唯一还原

在结点标记互异时，中序搭配前序，或中序搭配后序，都可以确定左右分界。

只有前序和后序时，未必能确定。例如一棵树只有 `A`、`B` 两个结点：`B` 是 `A` 的左孩子、右孩子，两种树的前序都是 `AB`，后序都是 `BA`。没有中序，就无法区分它们。

理解这个反例，才能判断输入信息是否足够，而不是看到“两串序列”就套同一份代码。

## 二叉搜索树：让大小关系决定往哪边走

普通二叉树只规定孩子数量与左右位置。**二叉搜索树**进一步要求：一个结点的左子树中所有值都比它小，右子树中所有值都比它大。本节遇到相同值时不重复插入。

<iframe class="lesson-animation-frame graph-process-frame" src="/ACMguide/animations/graph-process/bst.html" title="二叉搜索树动图：查找成功、查找不存在的值与插入后接回子树" loading="lazy"></iframe>

[单独打开动图](/ACMguide/animations/graph-process/bst.html)。先单步查找 7，再切换到“查找 6”和“插入 6”：观察同一条比较路径，为什么在空位置分别对应“查找失败”和“创建新结点”。

动图中的圆圈显示**保存的数值**，表格同时列出**结点编号**和左右孩子编号。例如根的编号是 1，保存的数值是 5。插入时请留意最后的返回过程：新结点返回编号，父亲用这个编号接回子树，才真正建立连线。

### 二叉搜索树的插入与查找

下面用一段小程序演示插入与查找的执行过程：输入 $n$ 个整数建树，再输入 $q$ 个整数，逐个回答是否存在。约定 $n,q\le 1000$，数值的绝对值不超过 $10^9$，重复数只保存一份。

输入：

```text
6 3
5 2 8 3 7 9
7 6 2
```

输出：

```text
Yes
No
Yes
```

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 1000 + 5;
int value[N], lc[N], rc[N], total = 0;

int insertNode(int u, int x) {
    if (u == 0) {
        total++;
        value[total] = x;
        return total;
    }
    if (x < value[u]) {
        lc[u] = insertNode(lc[u], x);
    } else if (x > value[u]) {
        rc[u] = insertNode(rc[u], x);
    }
    return u;
}

bool contains(int u, int x) {
    while (u != 0) {
        if (x == value[u]) return true;
        if (x < value[u]) u = lc[u];
        else u = rc[u];
    }
    return false;
}

int main() {
    int n, q, root = 0;
    cin >> n >> q;
    for (int i = 1; i <= n; i++) {
        int x;
        cin >> x;
        root = insertNode(root, x);
    }
    for (int i = 1; i <= q; i++) {
        int x;
        cin >> x;
        cout << (contains(root, x) ? "Yes" : "No") << '\n';
    }
    return 0;
}
```

`insertNode` 返回“插入后这棵子树的根编号”。因此向左插入后，要用 `lc[u] = ...` 接回左子树；整棵树一开始也可能为空，所以主函数用 `root = ...` 接回根。

> **查找代价取决于树高。**
>
> 一次查找或插入沿一条路径移动，耗时 $\mathcal{O}(h)$。依次插入 `1 2 3 4 5`，会形成全右链，$h$ 可以达到 $n$，不能直接把普通二叉搜索树的操作都算作 $\mathcal{O}(\log n)$。下一章的 `set` 会由标准库维护有序结构。

## 练习：先确定分界与比较规则

先**独立重做 P1030**，手画中序和后序的区间切分，再实现前序输出。

### 推荐必做

1. [P1827 · 美国血统](https://www.luogu.com.cn/problem/P1827)：已知中序和前序，输出后序。练习改变根的来源、调整区间并把输出移到子树处理之后。
2. [P1229 · 遍历问题](https://www.luogu.com.cn/problem/P1229)：已知前序和后序，统计可能的中序数量。练习找出“只有一个孩子时，左右位置不能确定”的选择，先画小树再计数。

### 选做巩固

- [P5076 · 普通二叉树（简化版）](https://www.luogu.com.cn/problem/P5076)：维护插入、排名、第 $k$ 小、前驱与后继。练习给结点增加子树大小，用“左子树有多少个数”指导查找方向。
- [UVA122 · 树的层次遍历](https://www.luogu.com.cn/problem/UVA122)：按结点路径建立二叉树并输出层序，缺失必要结点或路径重复时输出 `not complete`。练习从路径重建关系并检查输入。
- [P5018 · 对称二叉树](https://www.luogu.com.cn/problem/P5018)：找结点数最多的对称子树。沿两棵子树的镜像方向比较结构和结点值，练习从树的定义拆解递归判断。

## 本节验收

- 能手动切分中序与后序的左右子树区间。
- 能解释四个参数和空区间出口，而不是背参数写法。
- 能用反例说明前序与后序为什么不一定唯一确定树。
- 能实现二叉搜索树的插入、查找，并用树高估算代价。
