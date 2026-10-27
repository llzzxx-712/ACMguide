---
title: 2-SAT 与布尔条件建图
description: 将二选一条件转成蕴含边，用强连通分量判断真假是否冲突，再按分量顺序构造一组解。
---

## 这一节学什么

有许多真假变量，每条要求只涉及“某个取值或另一个取值”。逐个枚举全部变量需要 2ⁿ 种方案，但条件之间的强制关系可以建成图；如果选择某个取值后必须同时选择它的相反值，就会产生冲突。

> **AI 伴学提示词**
>
> 为我讲解 2-SAT 的文字结点、蕴含边和 SCC 冲突条件，用两三个变量手算约束并构造解，解释分量编号与赋值规则，并引导我提问。

## 一个变量，需要两个结点

“xᵢ=0”和“xᵢ=1”各是一个文字结点，两个结点互为否定。它们表示选择这种取值，不是两个独立变量。

若条件是 A 或 B，它只禁止两者同时为假，等价于：非 A 成立就必须 B 成立；非 B 成立就必须 A 成立。因此加边 ¬A→B、¬B→A。

| 原条件 | 转换 |
| --- | --- |
| A 或 B | ¬A→B，¬B→A |
| A 成立必须 B | A→B，¬B→¬A |
| A、B 不能同时成立 | A→¬B，B→¬A |
| 强制 A 成立 | 把 A 或 A 当作一条条件 |

不要只加“看起来明显”的一个方向。两条边共同保留了条件与其逆否关系，后面的 SCC 判断和构造依赖这种结构。

## 为什么同一变量的两个取值不能在一个 SCC

若 A 与 ¬A 互相可达，选 A 会推出 ¬A，选 ¬A 又会推出 A，两种选择都矛盾，因此无解。

反过来，若每个变量的两个取值属于不同 SCC，就可以在缩图上按汇点方向依次确定分量，将选定分量设为真、它的相反分量设为假，构造一组满足所有蕴含边的解。

本节 Tarjan 按弹栈顺序编号，后继分量编号更小，所以选“编号较小的那个文字”为真。若更换 SCC 的编号方式，必须重新确认拓扑方向，不能只背一个比较符号。

## 例题精讲：P4782 · 2-SAT

**原题：** [P4782 · 2-SAT](https://www.luogu.com.cn/problem/P4782)。

**题意简述：** 输入 n 个变量、m 条条件，每条 i a j b 表示 xᵢ=a 或 xⱼ=b。无解输出 IMPOSSIBLE，有解输出 POSSIBLE 和任意一组 0/1 赋值。n、m≤10⁶。

自拟输入：

```text
2 3
1 1 1 1
1 0 2 1
2 1 2 1
```

一组输出是：

```text
POSSIBLE
1 1
```

第一条强制 x₁=1，第二条要求 x₁=0 或 x₂=1，因此 x₂=1；第三条也强制 x₂=1，全部成立。

### 完整代码

定义 id(i,value)=2×(i−1)+value+1，使所有文字编号落在 1…2n，继续使用上一节的 SCC。相反文字调用 id(i,1−value)，不必猜编号该怎样异或。

```cpp
#include<bits/stdc++.h>
using namespace std;

struct SCC {
    int n, timer = 0, count = 0;
    vector<vector<int>> g;
    vector<int> dfn, low, parent, next, component, active, calls;
    vector<bool> inStack;
    SCC(int size) : n(size), g(size + 1), dfn(size + 1), low(size + 1),
        parent(size + 1), next(size + 1), component(size + 1), inStack(size + 1) {}
    void enter(int u) {
        dfn[u] = low[u] = ++timer;
        active.push_back(u);
        calls.push_back(u);
        inStack[u] = true;
    }
    void run() {
        for (int root = 1; root <= n; root++) if (!dfn[root]) {
            enter(root);
            while (!calls.empty()) {
                int u = calls.back(), degree = g[u].size();
                if (next[u] < degree) {
                    int v = g[u][next[u]++];
                    if (!dfn[v]) { parent[v] = u; enter(v); }
                    else if (inStack[v]) low[u] = min(low[u], dfn[v]);
                } else {
                    calls.pop_back();
                    if (low[u] == dfn[u]) {
                        count++;
                        while (true) {
                            int v = active.back();
                            active.pop_back();
                            inStack[v] = false;
                            component[v] = count;
                            if (v == u) break;
                        }
                    }
                    if (parent[u]) low[parent[u]] = min(low[parent[u]], low[u]);
                }
            }
        }
    }
};

int id(int variable, int value) { return (variable - 1) * 2 + value + 1; }

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n, m;
    cin >> n >> m;
    SCC graph(n * 2);
    for (int k = 0, i, a, j, b; k < m; k++) {
        cin >> i >> a >> j >> b;
        graph.g[id(i, 1-a)].push_back(id(j, b));
        graph.g[id(j, 1-b)].push_back(id(i, a));
    }
    graph.run();
    for (int i = 1; i <= n; i++) if (graph.component[id(i, 0)] == graph.component[id(i, 1)]) {
        cout << "IMPOSSIBLE\n";
        return 0;
    }
    cout << "POSSIBLE\n";
    for (int i = 1; i <= n; i++) {
        int value = graph.component[id(i, 1)] < graph.component[id(i, 0)] ? 1 : 0;
        cout << value << (i == n ? '\n' : ' ');
    }
    return 0;
}
```

赋值规则也可以从蕴含边验证：跨分量边 A→B 有编号 A>B，逆否边 ¬B→¬A 有编号 ¬B>¬A。如果规则选中了 A，却没选 B，就会同时推出 A 的编号大于 ¬A，与“选较小编号的文字”矛盾；同分量情况用相等替代，结论仍成立。

建图有 2n 个点、2m 条边，Tarjan 与输出总时间 O(n+m)、空间 O(n+m)。百万级规模关闭同步，使用显式调用栈；估算内存时要把两倍结点的邻接表、dfn、low、父亲、循环位置、分量号和两个栈都计算进去。

## 练习：把输出逐条代回原条件

先**独立重做 P4782**。对 n≤15 的数据枚举全部 0/1 赋值，判断有解性；有解时检查输出是否满足每条条件，不要要求程序输出与你手算完全相同的一组解。

### 推荐必做

1. **自编 · 活动冲突：** 每个活动有早、晚两种时间，某些选项不能同时选择，转成“非 A 或非 B”，用 2-SAT 求可行安排。
2. **自编 · 相同与不同：** 条件要求两变量相等或不等，分别拆成两条二元或条件；添加强制取值，检查何时无解。

### 选做巩固

- **自编 · 单变量边界：** 分别输入强制真、强制假、同时强制真假，验证判定与构造。
- **自编 · 同变量出现在两端：** 检查 x=0 或 x=1 的恒真条件，以及 x=0 或 x=0 的强制条件，确保没有把重复变量当成两个独立选择。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[连通性问题 #210](https://www.luogu.com.cn/training/210)。

## 本节验收

能从二元或条件写出两条蕴含边；能说明 SCC 冲突的含义；能根据编号方向构造解，并用原条件独立验证结果。
