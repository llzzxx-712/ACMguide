---
title: 状压与搜索、最短路的结合
description: 将已获得资源放进搜索状态，区分同一位置下不同能力，按边代价选择 BFS 或 Dijkstra。
---

## 这一节学什么

到达同一个格子时，手里有没有钥匙会改变下一步能否过门，所以位置相同不代表状态相同。把资源集合压成 mask，搜索的 visited 或 distance 也要按“位置、mask”保存。

> **AI 伴学提示词**
>
> 为我讲解带钥匙状态的迷宫 BFS，手算同一格子的不同 mask，解释拿钥匙、过门和访问标记的顺序，并引导我提问。

## 例题精讲：自编 · 钥匙与门

**题意简述：** n×m 网格，S 为起点、T 为终点、# 为墙、. 为空地。小写 a…h 是钥匙，大写 A…H 是对应门，拿到钥匙后永久保留。每步走四邻格，求最少步数，不可达输出 −1。n,m≤30，钥匙种数 k≤8，仅使用前 k 种字母，S、T 各一个。

输入：

```text
1 4 1
SaAT
```

输出 `3`。先拿 a，再通过 A，到达 T。

## 状态与转移逐项对应规则

状态是 (x,y,mask)。尝试邻格：先检查边界和墙，再检查若是门，旧 mask 是否已有钥匙；若是钥匙，把对应位加入新 mask；最后检查这个新状态是否已到达。

普通 visited[x][y] 会把“还没有钥匙时走过”和“拿到钥匙后再次经过”混在一起，可能提前剪掉真正的路线。BFS 对整个状态图按步数分层，最早到达任意终点 mask 就是答案。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int main() {
    int n, m, k;
    cin >> n >> m >> k;
    vector<string> grid(n);
    int start = -1;
    for (int i = 0; i < n; i++) {
        cin >> grid[i];
        for (int j = 0; j < m; j++) if (grid[i][j] == 'S') start = i * m + j;
    }
    int states = 1 << k;
    vector<int> distance(n * m * states, -1);
    queue<int> q;
    q.push(start * states);
    distance[start * states] = 0;
    const int dx[4] = {-1, 1, 0, 0}, dy[4] = {0, 0, -1, 1};
    while (!q.empty()) {
        int id = q.front(); q.pop();
        int mask = id % states, cell = id / states;
        int x = cell / m, y = cell % m;
        if (grid[x][y] == 'T') { cout << distance[id] << '\n'; return 0; }
        for (int dir = 0; dir < 4; dir++) {
            int nx = x + dx[dir], ny = y + dy[dir];
            if (nx < 0 || nx >= n || ny < 0 || ny >= m || grid[nx][ny] == '#') continue;
            char c = grid[nx][ny];
            int nextMask = mask;
            if (c >= 'A' && c <= 'H' && !((mask >> (c - 'A')) & 1)) continue;
            if (c >= 'a' && c <= 'h') nextMask |= 1 << (c - 'a');
            int next = (nx * m + ny) * states + nextMask;
            if (distance[next] == -1) {
                distance[next] = distance[id] + 1;
                q.push(next);
            }
        }
    }
    cout << -1 << '\n';
    return 0;
}
```

编号 `(x*m+y)*states+mask` 只是把三维表展开成一维。除以 states 得格子编号，取余得 mask，随后再分出行列；每种状态都有独立距离。

总状态 O(nm2ᵏ)，每状态最多四次尝试，时间与空间都为 O(nm2ᵏ)。如果移动费用不全为 1，应按费用用 0/1 BFS 或 Dijkstra，状态定义保持不变。

## 练习：让同一位置保留不同的后续能力

先**独立重做本例**，构造必须拿钥匙后原路返回才能开门的数据，观察 visited 只记格子会怎样出错。

### 推荐必做

1. **自编 · 集齐钥匙：** 不指定终点，要求拿到全部 k 类钥匙，首次 mask=full 时返回步数。
2. **自编 · 收费格：** 进入部分格子的费用为 0，其余为 1，用双端队列在相同状态图求最小费用。

### 选做巩固

- **自编 · 一次性工具：** 某种工具使用后消失，转移中需要删除位，不能再假设 mask 只会增加。
- **自编 · 恢复路线：** 保存前驱状态与方向，恢复包含重复经过同一格子的完整走法。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[状态压缩动态规划 #215](https://www.luogu.com.cn/training/215)。

## 本节验收

能说明同一位置为何有多个状态；能正确安排门检查与钥匙获取；能按边费用选择搜索算法，并从维数估算状态规模。
