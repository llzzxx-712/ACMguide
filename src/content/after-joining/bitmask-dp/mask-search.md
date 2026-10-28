---
title: 状压与搜索、最短路的结合
description: 将已获得资源放进搜索状态，区分同一位置下不同能力，按边代价选择 BFS 或 Dijkstra。
---

## 这一节学什么

到达同一个格子时，手里有没有钥匙会改变下一步能否过门，所以位置相同不代表状态相同。把资源集合压成 mask，搜索的 visited 或 distance 也要按“位置、mask”保存。

> **AI 伴学提示词**
>
> 为我讲解带钥匙状态的迷宫 BFS，手算同一格子的不同 mask，解释拿钥匙、过门和访问标记的顺序，并引导我提问。

## 例题精讲：[P4011 孤岛营救问题](https://www.luogu.com.cn/problem/P4011)

**题意简述：** 在 N×M 网格从 (1,1) 到 (N,M)，走四邻格耗时 1。门和墙位于两格之间；0 表示墙，1…P 表示需要对应钥匙的门，未列出的相邻格可直通。N、M、P≤10。输入 N、M、P，再给 K 条门墙记录 x1 y1 x2 y2 G，再给 S 条钥匙位置 x y Q。求最短时间，不可达输出 −1。

自编输入：

```text
1 3 1
1
1 2 1 3 1
1
1 2 1
```

输出：

```text
2
```

### 先把思路讲清楚

必须先到 (1,2) 取得钥匙，再通过它与 (1,3) 之间的门，共走两步。这里门是边上的限制，不是把某个格子改成门字符。

### 状态必须包含手上的钥匙

状态为 (格子 u,mask)，mask 的第 t−1 位表示已有第 t 类钥匙。同一格子第一次到达可能没有钥匙，之后拿钥匙返回时有了新能力，不能仅用 `visited[u]` 剪掉它。

先把每格多把钥匙按位或到 `keys[u]`。拿取无耗时、钥匙永久保留，且不会带来负面作用，所以一到格子就全部拿走。过门先检查旧 mask，再将目标格钥匙并入 `nextMask`，最后检查新状态是否访问过。起点钥匙也要在入队前拿到。

### 把地图变成 vector 邻接表

坐标编号为 (x−1)·M+y−1。gate 初值 −1 表示普通通道，0 表示墙，正数表示门的类型；只对真正相邻的格子建边。BFS 的所有移动耗时均为 1，第一次到达任意终点 mask 就给出最短时间。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;
struct Edge {
    int to, gate;
};

int main() {
    int n, m, p, k;
    cin >> n >> m >> p >> k;
    int cells = n * m, states = 1 << p;
    auto id = [&](int x, int y) { return (x - 1) * m + y - 1; };
    vector<vector<int>> gate(cells, vector<int>(cells, -1));
    while (k--) {
        int x1, y1, x2, y2, type;
        cin >> x1 >> y1 >> x2 >> y2 >> type;
        int a = id(x1, y1), b = id(x2, y2);
        gate[a][b] = gate[b][a] = type;
    }
    vector<int> keys(cells);
    int s;
    cin >> s;
    while (s--) {
        int x, y, type;
        cin >> x >> y >> type;
        keys[id(x, y)] |= 1 << (type - 1);
    }
    vector<vector<Edge>> g(cells);
    const int dx[4] = {-1, 1, 0, 0}, dy[4] = {0, 0, -1, 1};
    for (int x = 1; x <= n; x++) for (int y = 1; y <= m; y++) {
        int u = id(x, y);
        for (int d = 0; d < 4; d++) {
            int nx = x + dx[d], ny = y + dy[d];
            if (nx < 1 || nx > n || ny < 1 || ny > m) continue;
            int v = id(nx, ny);
            if (gate[u][v] != 0) g[u].push_back({v, gate[u][v]});
        }
    }
    vector<vector<int>> dist(cells, vector<int>(states, -1));
    queue<pair<int, int>> q;
    dist[0][keys[0]] = 0;
    q.push({0, keys[0]});
    while (!q.empty()) {
        int u = q.front().first, mask = q.front().second;
        q.pop();
        if (u == cells - 1) {
            cout << dist[u][mask] << '\n';
            return 0;
        }
        for (Edge e : g[u]) {
            if (e.gate > 0 && !(mask & (1 << (e.gate - 1)))) continue;
            int nextMask = mask | keys[e.to];
            if (dist[e.to][nextMask] != -1) continue;
            dist[e.to][nextMask] = dist[u][mask] + 1;
            q.push({e.to, nextMask});
        }
    }
    cout << -1 << '\n';
    return 0;
}
```

总状态 NM·2ᴾ，每个最多四条转移。BFS 时间、空间 $\mathcal{O}(NM2^{P})$；门墙表另用 O((NM)²) 空间，NM≤100，只有一万格。

## 练习：让同一位置保留不同的后续能力

先**独立重做本例**，构造必须拿钥匙后原路返回才能开门的数据，观察 visited 只记格子会怎样出错。

### 推荐必做

1. [P2622 关灯问题 II](https://www.luogu.com.cn/problem/P2622)：每个按钮分别将指定灯打开、关闭或保持不变，求全部关灯的最少按键次数。练习把灯的开关集合当作 BFS 状态。

### 选做巩固

- [P1126 机器人搬重物](https://www.luogu.com.cn/problem/P1126)：机器人有朝向，前进和转向都要花时间，求到终点的最短时间。练习同时记录位置和朝向，并检查机器人占用的空间。
- [P3956 棋盘](https://www.luogu.com.cn/problem/P3956)：移动时颜色变化需要费用，魔法可以给无色格暂时着色但不能连续使用，求最小花费。练习记录当前位置的颜色和魔法状态，并在带权状态图上求最短路。

对应题单：[自编入门题单](https://www.luogu.com.cn/training/1126196)、[状态压缩动态规划 #215](https://www.luogu.com.cn/training/215)。

## 本节验收

能说明同一位置为何有多个状态；能正确安排门检查与钥匙获取；能按边费用选择搜索算法，并从维数估算状态规模。
