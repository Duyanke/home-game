# 家务神兽养成游戏 - 前端UI组件设计文档

## 项目概述

### 目标
为家务神兽养成游戏开发完整的前端UI组件系统，包括6个主要页面和配套的公共组件、状态管理、Socket通信层。

### 技术栈
- Vue 3 + Vite + TypeScript
- Pinia（状态管理）
- Vue Router（路由）
- Socket.IO Client（实时通信）
- Sass（样式预处理）
- SVG + CSS动画（神兽形象和特效）

### 现有基础
- 后端Socket API和REST API已完成
- 战斗引擎已集成到Socket handlers
- 前端已有神兽数据常量 `beast-data.ts`
- 前端目前只有默认的 HelloWorld.vue，需从头开发

---

## 设计决策摘要

| 决策项 | 选择 | 原因 |
|--------|------|------|
| 开发起点 | 家庭首页 | 建立整体框架和导航，便于后续集成 |
| 导航模式 | 混合模式 | 底部导航栏用于主要页面，子页面用返回按钮 |
| 配色方案 | B+C结合 | UI基础色扩展色阶 + 神兽元素专属配色 |
| 状态管理 | 混合模式 | 核心数据用Pinia Store，战斗状态直接监听Socket |
| 神兽形象 | SVG + CSS动画 | 简洁高效，无需额外库，可请设计师优化 |

---

## 项目架构

### 目录结构

```
client/src/
├── main.ts                     # 入口，创建Vue app + Pinia + Router + Socket
├── App.vue                     # 根组件，包含底部导航栏
├── assets/
│   └── styles/
│       ├── variables.scss      # 颜色变量、扩展色阶
│       ├── mixins.scss         # 常用样式混入
│       └── global.scss         # 全局样式
├── components/
│   ├── common/
│   │   ├── BottomNav.vue       # 底部导航栏
│   │   ├── BackHeader.vue      # 返回按钮顶部栏
│   │   ├── BeastAvatar.vue     # 神兽形象（SVG+动画）
│   │   ├── BeastCard.vue       # 神兽卡片（选择页用）
│   │   ├── MemberRank.vue      # 成员排行项
│   │   ├── TaskItem.vue        # 任务列表项
│   │   ├── Loading.vue         # 加载状态
│   │   └── ConnectionStatus.vue # 连接状态提示
│   ├── home/
│   │   ├── FamilyCodeCard.vue  # 家庭码展示卡片
│   │   ├── RankList.vue        # 积分排行列表
│   │   ├── NavCards.vue        # 功能入口卡片组
│   ├── beast/
│   │   ├── BeastStats.vue      # 属性面板
│   │   ├── GrowthProgress.vue  # 成长进度条
│   │   ├── SkillList.vue       # 技能列表
│   ├── task/
│   │   ├── TaskFilter.vue      # 任务状态筛选
│   │   ├── TaskCreateModal.vue # 创建任务弹窗
│   ├── duel/
│   │   ├── OpponentCard.vue    # 对手卡片
│   │   ├── BattleLog.vue       # 战斗日志
│   │   ├── SkillButtons.vue    # 技能操作按钮
│   │   ├── BattleArena.vue     # 战斗场地组件
├── pages/
│   ├── HomePage.vue            # 家庭首页
│   ├── BeastPage.vue           # 神兽主页
│   ├── BeastSelectPage.vue     # 神兽选择页
│   ├── TaskPage.vue            # 任务中心
│   ├── DuelPage.vue            # 决斗大厅
│   ├── BattlePage.vue          # 战斗界面
├── stores/
│   ├── family.ts               # 家庭/成员数据
│   ├── beast.ts                # 神兽数据
│   ├── task.ts                 # 任务数据
├── services/
│   └── socket.ts               # Socket.IO 连接管理
├── router/
│   └ index.ts                  # 路由配置
├── constants/
│   ├── beast-data.ts           # 已有神兽数据常量
│   └── colors.ts               # 颜色常量（新增）
```

---

## 路由和导航

### 路由配置

```typescript
// router/index.ts
const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/beast', name: 'beast', component: BeastPage },
  { path: '/beast/select', name: 'beast-select', component: BeastSelectPage },
  { path: '/task', name: 'task', component: TaskPage },
  { path: '/duel', name: 'duel', component: DuelPage },
  { path: '/battle/:duelId', name: 'battle', component: BattlePage },
]
```

### 导航结构

| 页面 | 导航方式 | 说明 |
|------|----------|------|
| 家庭首页 `/` | 底部导航（首页图标高亮） | 主入口 |
| 神兽主页 `/beast` | 底部导航（神兽图标高亮） | 已有神兽时进入 |
| 神兽选择 `/beast/select` | 从神兽主页进入，返回按钮退出 | 新用户首次选择 |
| 任务中心 `/task` | 底部导航（任务图标高亮） | 任务管理 |
| 决斗大厅 `/duel` | 底部导航（决斗图标高亮） | 发起决斗 |
| 战斗界面 `/battle/:duelId` | 从决斗大厅进入，返回按钮退出 | 实时战斗 |

### 底部导航栏图标

```
[🏠 首页] [🐉 神兽] [📋 任务] [⚔️ 决斗]
```

---

## 配色系统

### 规格主色
- 金色: `#D4AF37`
- 红色: `#C41E3A`
- 青色: `#2E8B57`
- 玄黑: `#1A1A2E`

### 扩展色阶

```scss
// 金色系
$color-gold-light: #F5E6B8;
$color-gold-base: #D4AF37;
$color-gold-dark: #A68A2A;

// 红色系
$color-red-light: #E85A6B;
$color-red-base: #C41E3A;
$color-red-dark: #8B1428;

// 青色系
$color-green-light: #4CAF7A;
$color-green-base: #2E8B57;
$color-green-dark: #1E5A3A;

// 玄黑系
$color-dark-light: #2D2D4A;
$color-dark-base: #1A1A2E;
$color-dark-deep: #0D0D1A;
```

### 神兽元素配色

| 神兽 | 元素 | 颜色 |
|------|------|------|
| 青龙 | 木 | `#4CAF50` |
| 朱雀 | 火 | `#FF5722` |
| 白虎 | 金 | `#9E9E9E` |
| 玄武 | 水 | `#2196F3` |
| 麒麟 | 光 | `#FFC107` |

### 文字色
- 主要文字: `#FFFFFF`
- 次级文字: `#888888`
- 标题/强调: `#D4AF37`（金色）

### 配色使用规则
- 页面背景：`$color-dark-base`
- 功能入口卡片：绿色(神兽)、红色(任务)、金色(决斗)
- 神兽相关组件：使用对应元素色渐变

---

## Socket服务层

### 连接管理

```typescript
// services/socket.ts
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function connectSocket(serverUrl: string): Socket {
  if (!socket) {
    socket = io(serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })
  }
  return socket
}

export function getSocket(): Socket | null {
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function sendMessage<T>(type: string, payload: T): void {
  if (socket) {
    socket.emit(type, {
      type,
      payload,
      timestamp: Date.now()
    })
  }
}

export function setupSocketErrorHandlers(
  socket: Socket,
  onError: (message: string) => void,
  onDisconnect: () => void
): void {
  socket.on('connect_error', () => onError('连接服务器失败'))
  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      onError('服务器已断开连接')
    } else {
      onDisconnect()
    }
  })
  socket.on('ERROR', (msg) => onError(msg.payload.message))
}
```

### Pinia Store结构

**family.ts - 家庭和成员**
```typescript
export const useFamilyStore = defineStore('family', {
  state: () => ({
    familyId: '',
    familyCode: '',
    memberId: '',
    memberName: '',
    members: [] as Member[],
    membersOnline: [] as string[],
  }),
  actions: {
    joinFamily(familyCode, memberName),
    syncMembers(members),
    updateMemberStatus(memberId, status),
    updateMemberPoints(memberId, points),
  }
})
```

**beast.ts - 神兽**
```typescript
export const useBeastStore = defineStore('beast', {
  state: () => ({
    myBeast: null as Beast | null,
    allBeasts: [] as Beast[],
  }),
  actions: {
    selectBeast(beastType),
    syncBeasts(beasts),
    updateBeastStage(memberId, newStage),
  }
})
```

**task.ts - 任务**
```typescript
export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    filter: 'all' as 'all' | 'pending' | 'in_progress' | 'completed',
  }),
  actions: {
    createTask(name, points, isCustom),
    claimTask(taskId),
    completeTask(taskId),
    confirmTask(taskId),
    syncTasks(tasks),
  },
  getters: {
    filteredTasks: (state) => /* 根据filter筛选 */
  }
})
```

---

## 页面设计

### 家庭首页

布局：
```
┌────────────────────────────────┐
│  家庭码卡片（金色渐变背景）      │
│  显示家庭码 + 点击邀请按钮       │
├────────────────────────────────┤
│  积分排行标题                    │
│  MemberRank列表项               │
├────────────────────────────────┤
│  功能入口导航卡片                │
│  [神兽] [任务] [决斗]           │
│  (绿)   (红)   (金)             │
├────────────────────────────────┤
│  [底部导航栏]                   │
└────────────────────────────────┘
```

子组件：
- FamilyCodeCard.vue - 家庭码展示
- RankList.vue - 排行列表（使用MemberRank.vue）
- NavCards.vue - 三个功能入口卡片

### 神兽主页

布局：
```
┌────────────────────────────────┐
│  [返回] 神兽名称                 │
├────────────────────────────────┤
│  BeastAvatar (SVG + 呼吸动画)   │
│  成长阶段标签                    │
├────────────────────────────────┤
│  成长进度条                     │
│  当前积分 / 下一阶段门槛         │
├────────────────────────────────┤
│  BeastStats 属性面板            │
│  HP/ATK/DEF/SPD 进度条          │
├────────────────────────────────┤
│  SkillList 技能列表             │
│  已解锁/未解锁状态               │
├────────────────────────────────┤
│  [底部导航栏]                   │
└────────────────────────────────┘
```

子组件：
- BeastAvatar.vue - 神兽形象
- GrowthProgress.vue - 成长进度
- BeastStats.vue - 属性面板
- SkillList.vue - 技能列表

### 神兽选择页

布局：
```
┌────────────────────────────────┐
│  [返回] 选择你的神兽             │
├────────────────────────────────┤
│  提示文字                       │
├────────────────────────────────┤
│  五种神兽卡片（横向滚动/网格）    │
│  龙/雀/虎/武/麟                 │
│  点击查看属性预览                │
├────────────────────────────────┤
│  属性预览面板（选中后显示）       │
├────────────────────────────────┤
│  [确认选择] 按钮                 │
└────────────────────────────────┘
```

### 任务中心

布局：
```
┌────────────────────────────────┐
│  [返回] 任务中心                 │
├────────────────────────────────┤
│  TaskFilter 状态筛选            │
│  [全部][待领取][进行中][待确认]  │
├────────────────────────────────┤
│  TaskItem 列表                  │
│  - 任务名/积分/状态             │
│  - 操作按钮                     │
├────────────────────────────────┤
│  [+ 创建任务] 按钮               │
│  点击弹出TaskCreateModal        │
├────────────────────────────────┤
│  [底部导航栏]                   │
└────────────────────────────────┘
```

### 决斗大厅

布局：
```
┌────────────────────────────────┐
│  [返回] 决斗大厅                 │
├────────────────────────────────┤
│  OpponentCard 对手列表          │
│  - 成员名/神兽/在线状态         │
│  - 积分/战绩                    │
│  - [发起决斗] 按钮              │
├────────────────────────────────┤
│  我的战绩                        │
│  胜/负/连胜                     │
├────────────────────────────────┤
│  [底部导航栏]                   │
└────────────────────────────────┘
```

### 战斗界面

布局：
```
┌────────────────────────────────┐
│  [返回] 决斗进行中 回合: N       │
├────────────────────────────────┤
│  对手神兽                        │
│  BeastAvatar + HP/EP条         │
├────────────────────────────────┤
│  BattleLog 战斗日志              │
│  每回合操作记录                  │
├────────────────────────────────┤
│  我的神兽                        │
│  BeastAvatar + HP/EP条         │
├────────────────────────────────┤
│  SkillButtons 操作按钮          │
│  [攻击][技能][防御][投降]       │
│  技能选择弹窗                    │
└────────────────────────────────┘
```

战斗页面直接监听Socket事件：
- `DUEL_STARTED` - 战斗开始
- `DUEL_ACTION_RESULT` - 行动结果
- `ROUND_ENDED` - 回合结束
- `DUEL_ENDED` - 战斗结束

---

## 神兽SVG设计

### BeastAvatar组件结构

```vue
<template>
  <div class="beast-avatar" :class="`beast-${beastType}`">
    <svg viewBox="0 0 200 200" class="beast-svg">
      <defs>
        <!-- 元素渐变定义 -->
        <linearGradient id="gradient-wood" ...>
        <linearGradient id="gradient-fire" ...>
        <linearGradient id="gradient-metal" ...>
        <linearGradient id="gradient-water" ...>
        <linearGradient id="gradient-light" ...>
      </defs>
      <!-- 神兽轮廓路径 -->
      <path :d="beastPath" class="beast-body" />
      <!-- 成长阶段特效 -->
      <g v-if="stage >= 3" class="element-glow">...</g>
    </svg>
    <!-- 技能特效层 -->
    <div v-if="activeSkill" class="skill-effect" :class="`effect-${activeSkill}`">
      <div class="effect-particles"></div>
      <div class="effect-flash"></div>
    </div>
  </div>
</template>
```

### 神兽轮廓特征

| 神兽 | 形态 | SVG要点 |
|------|------|---------|
| 青龙 | 长蛇形、龙角 | 曲线为主，尾部蜿蜒 |
| 朱雀 | 鸟形、展翅 | 展翅形态，尖角边缘 |
| 白虎 | 虎形、强壮 | 圆润肌肉线条 |
| 玄武 | 龟蛇合体 | 圆形龟壳 + 蛇头 |
| 麒麟 | 鹿形、独角 | 优雅站立，角+鬃毛 |

### 成长阶段视觉

| 阶段 | 效果 |
|------|------|
| 1 幼年期 | 小型简化轮廓 |
| 2 成年期 | 轮廓增大20%，基础渐变 |
| 3 进化期 | 元素光环动画 |
| 4 神圣期 | SVG glow滤镜 |

### 呼吸动画

```scss
.beast-svg {
  animation: breathe 2s ease-in-out infinite;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

---

## 技能特效设计

### 特效类型

| 类型 | 实现 | 适用技能 |
|------|------|----------|
| 伤害类 | 径向扩散 + 颜色闪光 | 风刃斩、烈焰冲击等 |
| 防御类 | 半透明屏障层 | 御风护盾、坚岩壁垒 |
| 治愈类 | 上浮粒子 + 柔光 | 祥瑞之光、圣光治愈 |
| 增益类 | 发光边框 | 祥瑞赐福、玄武之力 |

### 受击反馈动画

```scss
@keyframes hit-shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}

.hp-bar-decrease {
  transition: width 0.3s ease-out;
}
```

---

## 错误处理和边界情况

### Socket错误处理

- 连接失败：显示"连接服务器失败"提示
- 断线：显示重连状态，尝试自动重连
- 服务器错误消息：显示ERROR事件的payload.message

### 业务边界

| 场景 | 处理 |
|------|------|
| 新用户无神兽 | 跳转到神兽选择页 |
| 家庭不存在 | 提示创建新家庭 |
| 对手离线 | 决斗按钮灰显 |
| EP不足 | 技能按钮禁用 |
| 自己确认自己任务 | 禁止操作 |
| 战斗中对方断线 | 等待30秒后自动判定 |
| 切换神兽 | 弹窗警告重置进度 |

### 加载状态

全局Loading组件，在数据同步时显示。

---

## 开发顺序

### Phase 1: 基础设施
1. 样式系统 (variables.scss, mixins.scss, global.scss)
2. Socket服务层 (socket.ts)
3. 路由配置 (router/index.ts)
4. Pinia Stores (family.ts, beast.ts, task.ts)

### Phase 2: 公共组件
1. BottomNav.vue
2. BackHeader.vue
3. Loading.vue
4. ConnectionStatus.vue

### Phase 3: 核心展示组件
1. BeastAvatar.vue
2. BeastCard.vue
3. MemberRank.vue
4. TaskItem.vue

### Phase 4: 首页
1. FamilyCodeCard.vue
2. RankList.vue
3. NavCards.vue
4. HomePage.vue

### Phase 5: 神兽页面
1. BeastStats.vue
2. GrowthProgress.vue
3. SkillList.vue
4. BeastPage.vue
5. BeastSelectPage.vue

### Phase 6: 任务页面
1. TaskFilter.vue
2. TaskCreateModal.vue
3. TaskPage.vue

### Phase 7: 决斗和战斗
1. OpponentCard.vue
2. DuelPage.vue
3. BattleLog.vue
4. SkillButtons.vue
5. BattleArena.vue
6. BattlePage.vue

---

## 成功标准

1. 家庭首页显示家庭码、成员排行、功能入口
2. 神兽主页展示神兽形象、属性、成长进度、技能列表
3. 神兽选择页可浏览并选择五种神兽
4. 任务中心可筛选、创建、领取、完成任务
5. 决斗大厅可查看在线对手并发起决斗
6. 战斗界面实时显示战斗状态、支持技能操作
7. Socket连接稳定，断线可自动重连
8. 所有动画流畅，无明显性能问题
9. 深色主题配色统一，神兽元素配色准确