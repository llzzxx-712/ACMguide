---
title: 前序、中序、后序遍历与层序遍历
description: 观察输出发生在递归的哪个位置，再用显式栈还原调用与返回，处理大规模二叉树遍历。
---

## 这一节学什么

遍历，就是按一定顺序访问树中的全部结点。我们会把四种遍历放在同一棵树上比较，重点理解：递归什么时候进入子树、什么时候返回，输出又发生在哪一步。

> **AI 伴学提示词**
>
> 为我讲解二叉树的四种遍历，逐步展示递归调用与返回，再对照显式栈解释执行顺序，并引导我对不理解的地方提问。

## 同一棵树，四种访问顺序

```text
             a
           /   \
          b     c
         / \     \
        d   e     f
```

前三种遍历都先处理左子树，再处理右子树。区别是**在什么时候访问当前根结点**：

| 遍历 | 当前子树的处理顺序 | 上图的结果 |
| --- | --- | --- |
| 前序 | 根 → 左子树 → 右子树 | abdecf |
| 中序 | 左子树 → 根 → 右子树 | dbeacf |
| 后序 | 左子树 → 右子树 → 根 | debfca |
| 层序 | 从上到下，同层从左到右 | abcdef |

这里的“根”指当前子树的根。处理 b 的子树时，b 也是一个根。**同一条规则不断作用于更小的子树**，就是递归能够实现遍历的原因。

## 代码的位置，对应访问的时机

假设 lc、rc 已经保存左右孩子，0 表示空结点。前序遍历的步骤直接写成：

```text
void preorder(int u) {
    if (u == 0) return;
    cout << u << ' ';   // 先访问根
    preorder(lc[u]);   // 完整处理左子树，等待它返回
    preorder(rc[u]);   // 再完整处理右子树
}
```

如果把输出移到两次递归之间，就得到中序；移到两次递归之后，就得到后序。改变的不是孩子的连接关系，而是访问当前结点的时机。

### 不要把递归调用看成一条立即完成的语句

以上图的前序为例：

```text
进入 a：输出 a，调用 b，a 暂停等待
    进入 b：输出 b，调用 d，b 暂停等待
        进入 d：输出 d，两个空孩子立即返回，d 返回
    b 从调用 d 的下一步继续，调用 e
        进入 e：输出 e，两个空孩子立即返回，e 返回
    b 的两个孩子均已处理，b 返回
a 从调用 b 的下一步继续，调用 c
    进入 c：输出 c，左孩子为空，再处理右孩子 f
        进入 f：输出 f，处理完后返回
    c 返回
a 返回，整棵树遍历结束
```

中序同样会先进入 a，但暂时不输出 a；要等 b 的整个子树处理结束，才输出 a。**进入函数和输出结点，是两件不同的事。**

## 例题精讲：P1305 · 新二叉树

**原题：** [P1305 · 新二叉树](https://www.luogu.com.cn/problem/P1305)。

**题意简述：** n 不超过 26。每行用三个字母描述一个结点及其左右孩子，`*` 表示空孩子，第一行描述的结点是根。输出前序遍历。

用上图构造一组输入：

```text
6
abc
bde
c*f
d**
e**
f**
```

输出：

```text
abdecf
```

### 从字母到数组下标

字符有 ASCII 编码。读到字符 c 后，直接写 `int u = c;`，即可把它的编码作为数组下标。左右孩子也保存对应编码，空孩子转换为 0。输出时写 `char c = u;`，再输出 c，就会输出原来的字母。

数组开 128 个位置，足够保存本题英文字母的 ASCII 编码。这里每行三个字符都没有空格，用 `cin >> current >> left >> right` 可以直接读入。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int lc[128], rc[128];

void preorder(int u) {
    if (u == 0) return;
    char c = u;
    cout << c;
    preorder(lc[u]);
    preorder(rc[u]);
}

int main() {
    int n, root = 0;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        char current, left, right;
        cin >> current >> left >> right;
        int u = current;
        if (i == 1) root = u;
        lc[u] = left == '*' ? 0 : left;
        rc[u] = right == '*' ? 0 : right;
    }
    preorder(root);
    cout << '\n';
    return 0;
}
```

每个结点访问一次，时间 $\mathcal{O}(n)$。递归同时保留的调用数量取决于树高 h，额外调用栈空间 $\mathcal{O}(h)$。本题只有至多 26 个结点，可以直接用递归追踪执行过程。

## 层序遍历：用队列安排下一层

上一节求深度时，我们已经写过层序遍历。把“更新最大深度”换成“输出当前结点”，就得到层序输出。

```text
queue<int> q;
q.push(root);
while (!q.empty()) {
    int u = q.front();
    q.pop();
    cout << u << ' ';
    if (lc[u] != 0) q.push(lc[u]);
    if (rc[u] != 0) q.push(rc[u]);
}
```

先放左孩子，再放右孩子，保证同层从左到右。队列与递归负责安排不同的访问顺序，二者都在沿着同一组 lc、rc 关系移动。

## 进阶例题：B3642 · 用显式栈处理大树

**原题：** [B3642 · 二叉树的遍历](https://www.luogu.com.cn/problem/B3642)。

**题意简述：** 根为 1，输入格式与 P4913 相同，n 最大为 10^6。依次输出前序、中序、后序，每种一行。

对上一节的 6 结点输入：

```text
6
2 3
4 5
0 6
0 0
0 0
0 0
```

应输出：

```text
1 2 4 5 3 6
4 2 5 1 3 6
4 5 2 6 3 1
```

### 把递归“暂停在哪里”也保存下来

百万结点的长链可能使深递归耗尽调用栈。我们用第一板块学过的 `stack`，显式保存待继续执行的任务。每个任务记录两个量：结点 u，以及处理阶段 step。

| step | 这次轮到该结点时做什么 | 对应遍历 |
| --- | --- | --- |
| 0 | 刚进入，记录前序；安排左子树，之后回到阶段 1 | 前序访问根 |
| 1 | 左子树已完成，记录中序；安排右子树，之后回到阶段 2 | 中序访问根 |
| 2 | 两个子树均完成，记录后序 | 后序访问根 |

栈后进先出。因此在阶段 0，先放入“稍后继续处理 u 的阶段 1”，再放入“马上处理左孩子的阶段 0”；下一次取出的就是左孩子。它与递归里的“暂停、调用、返回”逐项对应。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

const int N = 1000000 + 5;
int lc[N], rc[N];
struct Frame {
    int u, step;
};

void print(const vector<int>& order) {
    int n = order.size();
    for (int i = 0; i < n; i++) {
        cout << order[i] << (i + 1 == n ? '\n' : ' ');
    }
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    for (int i = 1; i <= n; i++) {
        cin >> lc[i] >> rc[i];
    }
    vector<int> pre, in, post;
    stack<Frame> st;
    st.push({1, 0});
    while (!st.empty()) {
        Frame now = st.top();
        st.pop();
        int u = now.u;
        if (u == 0) continue;
        if (now.step == 0) {
            pre.push_back(u);
            st.push({u, 1});
            st.push({lc[u], 0});
        } else if (now.step == 1) {
            in.push_back(u);
            st.push({u, 2});
            st.push({rc[u], 0});
        } else {
            post.push_back(u);
        }
    }
    print(pre);
    print(in);
    print(post);
    return 0;
}
```

`const vector<int>&` 表示函数读取原来的 `vector`，不额外复制整份结果；本节只需把 print 理解成“按顺序输出这份结果”。

每个真实结点处理三个阶段，仍是 $\mathcal{O}(n)$ 时间。左右孩子数组与三份输出合计约 20 MB，显式栈还需要 $\mathcal{O}(h)$ 空间；整体空间 $\mathcal{O}(n)$。这些任务存入容器，避免了百万层函数调用。

## 练习：先确定访问时机，再实现

先**独立重做 P1305 和 B3642**，对同一棵树比较递归与显式栈的执行过程。

### 推荐必做

1. [UVA122 · 树的层次遍历](https://www.luogu.com.cn/problem/UVA122)：每个结点由数值与从根出发的左右路径给出，输出层序；如果缺少必要结点或同一路径重复给值，则输出 `not complete`。每组以 `()` 结束，练习建树、检查与队列遍历。

### 选做巩固

- [P3884 · 二叉树问题](https://www.luogu.com.cn/problem/P3884)：求二叉树的深度、宽度，以及题目定义的两个结点间距离。逐层统计结点数，并记录父亲以追踪两点向上的路径。
- [P5018 · 对称二叉树](https://www.luogu.com.cn/problem/P5018)：寻找结点数最多的对称二叉子树。比较左右子树对应结点的值和结构，练习让两次遍历按镜像顺序配对；注意最大规模为 10^6。

## 本节验收

- 不靠死记结果，能按“根、左、右”的访问时机推导三种遍历。
- 能指出递归在哪一行暂停、从哪里继续。
- 能用队列完成层序，用显式栈表示待继续执行的任务。
- 会根据数据规模与树高，选择合适的实现方式。
