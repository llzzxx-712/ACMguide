---
title: 双向搜索与折半搜索
description: 从两端各搜索一部分路径，或把选择集合分成两半枚举，再通过相遇状态或数值条件拼接答案。
---

## 这一节学什么

剪枝是在一棵搜索树里少走一些分支。这一节换一种组织方式：双向搜索从起点、终点两侧寻找相遇状态；折半搜索把一组选择分成两半，分别枚举，再配对。两者都在减少一次需要深入枚举的规模，但拼接答案的方法不同。

> **AI 伴学提示词**
>
> 为我讲解双向 BFS 与折半搜索，用八数码和门票方案对照状态如何相遇、两半结果如何配对，并引导我对不理解的内容提问。

## 双向搜索：从起点和终点同时出发

普通 BFS 从起点按层枚举，第一次到达终点时得到最少步数。若中间状态很多、目标状态明确，并且能从终点反向走，就可以从两端各做 BFS。

分别记录 distS[state]、distT[state]，含义为起点、终点到这个状态的最少步数。若同一个状态被两侧找到，把两段长度相加，就得到一条完整路线。

```text
起点 → 第一层 → 第二层 → 相遇状态 ← 第二层 ← 第一层 ← 终点
```

实现时，每次选择当前待扩展状态较少的一侧，**完整扩展一层**。层内收集所有相遇候选，取距离和最小值。两侧都按 BFS 层次前进，在第一次相遇的这一层之前，更短路径对应的两侧搜索层也已被覆盖。

有向图反搜要沿反向边走；操作不能简单撤销时，也要先推导逆操作。下面的数码移动可以交换回来，因此两边使用同样的邻居生成规则。

## 例题精讲一：P1379 · 八数码难题

**原题：** [P1379 · 八数码难题](https://www.luogu.com.cn/problem/P1379)。

**题意简述：** 3×3 棋盘放 1 到 8 和一个空格 0，每次将空格与上下左右相邻数字交换，求到目标 `123804765` 的最少步数。题目保证能到达。

自拟输入为 `123084765`，输出为 `1`：把空格与右侧的 8 交换即可。

### 状态、邻居与距离分别怎样保存

用长度为 9 的 string 按行保存棋盘，前导 0 也能保留。0 位于下标 pos 时，它的行列为 pos/3、pos%3；枚举四个方向，合法就交换字符，得到一个邻居状态。

这是一张由操作隐式描述的图，不必提前把所有边存下来。两侧各用 queue 保存当前层及其后续层，用 unordered_map<string,int> 保存已经找到的最短距离。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

int expandLayer(queue<string> &q, unordered_map<string, int> &own,
                const unordered_map<string, int> &other) {
    int count = q.size(), answer = -1;
    const int dx[4] = {-1, 1, 0, 0};
    const int dy[4] = {0, 0, -1, 1};
    while (count--) {
        string current = q.front();
        q.pop();
        int distance = own[current];
        int pos = current.find('0'), x = pos / 3, y = pos % 3;
        for (int direction = 0; direction < 4; direction++) {
            int nx = x + dx[direction], ny = y + dy[direction];
            if (nx < 0 || nx >= 3 || ny < 0 || ny >= 3) continue;
            string next = current;
            swap(next[pos], next[nx * 3 + ny]);
            if (own.count(next)) continue;
            own[next] = distance + 1;
            auto it = other.find(next);
            if (it != other.end()) {
                int candidate = distance + 1 + it->second;
                if (answer == -1 || candidate < answer) answer = candidate;
            }
            q.push(next);
        }
    }
    return answer;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    string start, goal = "123804765";
    cin >> start;
    if (start == goal) { cout << 0 << '\n'; return 0; }
    queue<string> fromStart, fromGoal;
    unordered_map<string, int> distS, distT;
    fromStart.push(start);
    fromGoal.push(goal);
    distS[start] = distT[goal] = 0;
    while (!fromStart.empty() && !fromGoal.empty()) {
        int answer;
        if (fromStart.size() <= fromGoal.size()) answer = expandLayer(fromStart, distS, distT);
        else answer = expandLayer(fromGoal, distT, distS);
        if (answer != -1) { cout << answer << '\n'; return 0; }
    }
    cout << -1 << '\n';
    return 0;
}
```

count 在函数开头固定为当前队列长度，确保这一轮只扩展原有的一整层，新加入的下一层留待之后处理。某个状态第一次在 own 中出现时就记录距离、入队，避免同侧重复访问。

若每层大约扩展 b 倍、答案深度为 d，单向枚举约 b^d，理想的两侧均衡展开约 b^(d/2)。实际还取决于图的结构与重复状态；一般图上两侧各自仍至多访问所有状态与边。八数码总排列数不超过 9!，用状态去重控制保存量。

## 折半搜索：不一定有终点，也能把选择拆开

若有 40 个物品，每个选或不选，完整枚举有 2^40 种；分成两组各 20 个，每半只有 2^20 种。关键是两半独立算完以后，怎样找到可以搭配的结果。

不是对两份列表再做两层循环，否则又回到 2^40 次配对。应根据题意选择排序、二分、双指针或 map，让配对也足够快。

## 例题精讲二：P4799 · 世界冰球锦标赛

**原题：** [P4799 · 世界冰球锦标赛](https://www.luogu.com.cn/problem/P4799)。

**题意简述：** n 场比赛，每场门票只能买一次，预算为 m，求总票价不超过预算的选择方案数，包括一场都不看。n≤40，预算≤10^18，票价为不超过 10^16 的正整数。相同票价的不同比赛仍是不同选择。

自拟输入：

```text
4 6
1 2 3 4
```

输出为 `11`。空方案 1 种，单场 4 种，两场 5 种，三场只有 1+2+3，共 11 种。

### 分半、枚举、配对

左半 {1,2} 的子集和为 {0,1,2,3}，右半 {3,4} 的子集和为 {0,3,4,7}。右半排序后，枚举左和 x，只需数出右和≤m−x 的个数。

| 左和 x | 右和上限 | 可配对右和个数 |
| --- | --- | --- |
| 0 | 6 | 3 |
| 1 | 5 | 3 |
| 2 | 4 | 3 |
| 3 | 3 | 2 |

合计 11。upper_bound 返回第一个大于上限的位置，减去 begin 就是前面满足条件的元素数量。

### 完整代码

```cpp
#include<bits/stdc++.h>
using namespace std;

vector<long long> price;
long long budget;

void generate(int pos, int end, long long sum, vector<long long> &result) {
    if (sum > budget) return;
    if (pos > end) { result.push_back(sum); return; }
    generate(pos + 1, end, sum, result);
    generate(pos + 1, end, sum + price[pos], result);
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    int n;
    cin >> n >> budget;
    price.resize(n);
    for (int i = 0; i < n; i++) cin >> price[i];
    vector<long long> left, right;
    int mid = n / 2;
    generate(0, mid - 1, 0, left);
    generate(mid, n - 1, 0, right);
    sort(right.begin(), right.end());
    long long answer = 0;
    for (long long x : left) {
        long long count = upper_bound(right.begin(), right.end(), budget - x) - right.begin();
        answer += count;
    }
    cout << answer << '\n';
    return 0;
}
```

票价为正，所以 sum 已超预算时继续选择也无法变回合法，可以提前返回。每半的空子集都会产生一个 0；同一个子集和出现多次时不能 unique，因为它们来自不同比赛选择。

令 half=⌈n/2⌉，枚举 O(2^half)，排序与逐个二分 O(half×2^half)，空间 O(2^half)。每半最多约 100 万个和，两份 long long 列表约 16 MB。方案数最多 2^40，预算和累计票价也可能很大，全部使用 long long。

## 练习：拆开之后，先设计怎样接回来

先**独立重做 P1379、P4799**。前者区分两侧距离表，后者检查空方案、重复票价，以及一张票都买不起的情况。

### 推荐必做

1. **自编 · 恰好用完预算：** 沿用门票题的范围，求票价和恰好等于预算的方案数。排序后使用 lower_bound 与 upper_bound 的位置差，保留重复的和。
2. **自编 · 双向路线还原：** 沿用八数码输入，除最少步数外，输出一种空格移动方向序列。两侧分别保存父状态与移动方向，在相遇点连接；终点一侧的动作要取逆方向。

### 选做巩固

- **自编 · 最接近目标的子集和：** 输入 n≤40 个正整数和目标 t，求某个子集和与 t 的最小绝对差。枚举左和，二分右和，检查插入位置与前一位置两个候选。
- **自编 · 统计指定选取数量：** 沿用门票题，再给 k，求恰好选择 k 场且总价不超预算的方案数。每半按已选个数分组保存子集和，再只配对人数合适的两组。

## 本节验收

能说明双向 BFS 为什么按整层扩展；能从状态两侧拼接距离；能估算折半后的枚举量，并避免在两份结果之间再次暴力枚举所有组合。
