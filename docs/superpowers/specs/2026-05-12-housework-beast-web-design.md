# 家务神兽养成游戏 - Web 应用设计文档

## 项目概述

### 产品定位
一款面向家庭的 Web 应用游戏，通过将家务任务与神兽养成结合，激励家庭成员积极参与家务劳动。家庭成员做家务越多，自己养的神兽成长越快，神兽之间可以进行策略性决斗。

### 核心特性
- 全员平等：所有家庭成员可创建任务、养神兽、参与决斗
- 局域网同步：电脑作为家庭服务器，其他设备通过浏览器访问
- 中国神话风格：五种传统神兽可选（青龙、朱雀、白虎、玄武、麒麟）
- 策略决斗：回合制战斗，玩家选择技能，有克制关系

### 技术选型
- 前端框架：Vue 3 + Vite + Pinia + Vue Router
- 后端框架：Node.js + Express + Socket.IO
- 数据存储：SQLite（better-sqlite3）
- 样式方案：纯 SCSS + CSS 动画 + SVG 神兽图形
- 语言：TypeScript

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                      家庭局域网                               │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │ 手机浏览器│  │ 平板浏览器│  │ 电脑浏览器│  │ 电脑浏览器│        │
│  │  Vue SPA │  │  Vue SPA │  │  Vue SPA │  │  Vue SPA │        │
│  └─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘        │
│        │            │            │            │              │
│        └────────────┼────────────┼────────────┘              │
│                     │ WebSocket │                            │
│              ┌──────▼──────────────────────┐                 │
│              │     家庭服务器（电脑）         │                 │
│              │                             │                 │
│              │  ┌─────────────────────┐    │                 │
│              │  │   Express Server    │    │                 │
│              │  │   + Socket.IO       │    │                 │
│              │  └─────────────────────┘    │                 │
│              │  ┌─────────────────────┐    │                 │
│              │  │   SQLite Database   │    │                 │
│              │  │   (better-sqlite3)  │    │                 │
│              │  └─────────────────────┘    │                 │
│              │  ┌─────────────────────┐    │                 │
│              │  │   Static Vue SPA    │    │                 │
│              │  │   (Vite build)      │    │                 │
│              │  └─────────────────────┘    │                 │
│              └─────────────────────────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 设备角色

家庭服务器运行在电脑上（Windows/Mac），监听端口 3000。局域网内其他设备的浏览器访问服务器 IP 地址（如 `http://192.168.1.100:3000`）。

### 家庭码机制
- 格式：6位数字+字母组合（如：A3K9B7）
- 生成时机：创建家庭时自动生成
- 用途：其他成员输入家庭码加入家庭
- 有效期：永久有效，除非重新创建家庭

---

## 项目目录结构

```
housework-beast/
├── client/                      # 前端 Vue 3 应用
│   ├── src/
│   │   ├── main.ts              # Vue 入口
│   │   ├── App.vue              # 根组件
│   │   ├── router/              # Vue Router 路由
│   │   │   └── index.ts
│   │   ├── stores/              # Pinia 状态管理
│   │   │   ├── family.ts        # 家庭成员状态
│   │   │   ├── beast.ts         # 神兽状态
│   │   │   ├── task.ts          # 任务状态
│   │   │   ├── duel.ts          # 决斗状态
│   │   │   └── socket.ts        # Socket.IO 连接
│   │   ├── views/               # 页面组件
│   │   │   ├── Home.vue         # 家庭首页
│   │   │   ├── Beast.vue        # 神兽主页
│   │   │   ├── Tasks.vue        # 任务中心
│   │   │   ├── BeastSelect.vue  # 神兽选择
│   │   │   ├── Duel.vue         # 决斗大厅
│   │   │   └── Battle.vue       # 战斗界面
│   │   ├── components/          # 可复用组件
│   │   │   ├── BeastCard.vue    # 神兽卡片
│   │   │   ├── TaskItem.vue     # 任务项
│   │   │   ├── MemberAvatar.vue # 成员头像
│   │   │   └── BattleLog.vue    # 战斗日志
│   │   ├── assets/              # 静态资源
│   │   │   ├── beasts/          # SVG 神兽图形
│   │   │   │   ├── qinglong.svg
│   │   │   │   ├── zhuque.svg
│   │   │   │   ├── baihu.svg
│   │   │   │   ├── xuanwu.svg
│   │   │   │   └── qilin.svg
│   │   │   └── styles/          # SCSS 样式
│   │   │       ├── variables.scss
│   │   │       ├── base.scss
│   │   │       └── beasts.scss
│   │   ├── utils/               # 工具函数
│   │   │   └── socket.ts        # Socket.IO 封装
│   │   └── constants/           # 常量定义
│   │       └── beast-data.ts    # 神兽属性配置
│   ├── vite.config.ts           # Vite 配置
│   ├── tsconfig.json            # TypeScript 配置
│   └── package.json
│
├── server/                      # 后端 Express 应用
│   ├── src/
│   │   ├── index.ts             # Express + Socket.IO 入口
│   │   ├── db/                  # 数据库
│   │   │   ├── database.ts      # SQLite 初始化
│   │   │   └── schema.sql       # 表结构定义
│   │   ├── routes/              # RESTful API 路由
│   │   │   ├── family.ts
│   │   │   ├── member.ts
│   │   │   ├── beast.ts
│   │   │   ├── task.ts
│   │   │   └ duel.ts
│   │   ├── socket/              # Socket.IO 事件处理
│   │   │   ├── handlers.ts      # 事件处理器
│   │   │   └── events.ts        # 事件类型定义
│   │   └── utils/               # 工具函数
│   │       ├── family-code.ts   # 家庭码生成
│   │       └── battle.ts        # 战斗计算逻辑
│   ├── tsconfig.json
│   └── package.json
│
├── package.json                 # 根项目 workspace 管理
└── README.md
```

---

## 数据库设计

### SQLite 表结构

```sql
-- 家庭信息表
CREATE TABLE families (
    family_id TEXT PRIMARY KEY,
    family_code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 家庭成员表
CREATE TABLE members (
    member_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    beast_id TEXT,
    total_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'offline',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(family_id)
);

-- 神兽表
CREATE TABLE beasts (
    beast_id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL,
    beast_type TEXT NOT NULL,
    stage INTEGER DEFAULT 1,
    hp INTEGER NOT NULL,
    atk INTEGER NOT NULL,
    def INTEGER NOT NULL,
    spd INTEGER NOT NULL,
    ep INTEGER DEFAULT 100,
    unlocked_skills TEXT,
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- 任务表
CREATE TABLE tasks (
    task_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    points INTEGER NOT NULL,
    creator_id TEXT NOT NULL,
    executor_id TEXT,
    status TEXT DEFAULT 'pending',
    is_custom INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    confirmed_by TEXT,
    FOREIGN KEY (family_id) REFERENCES families(family_id)
);

-- 决斗记录表
CREATE TABLE duels (
    duel_id TEXT PRIMARY KEY,
    challenger_id TEXT NOT NULL,
    defender_id TEXT NOT NULL,
    winner_id TEXT,
    result TEXT DEFAULT 'ongoing',
    rounds INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME,
    FOREIGN KEY (challenger_id) REFERENCES members(member_id),
    FOREIGN KEY (defender_id) REFERENCES members(member_id)
);
```

---

## API 与通信设计

### RESTful API

| 路由 | 方法 | 说明 | 请求体/参数 |
|------|------|------|-------------|
| `/api/family` | POST | 创建家庭 | `{ name: string }` |
| `/api/family/:code` | GET | 通过家庭码获取家庭 | - |
| `/api/family/join` | POST | 加入家庭 | `{ code: string, name: string }` |
| `/api/members` | GET | 获取家庭成员列表 | `?family_id=xxx` |
| `/api/members/:id` | GET | 获取单个成员 | - |
| `/api/beasts/:memberId` | GET | 获取成员的神兽 | - |
| `/api/beasts` | POST | 创建神兽 | `{ member_id, beast_type }` |
| `/api/tasks` | GET | 获取任务列表 | `?family_id=xxx&status=pending` |
| `/api/tasks` | POST | 创建任务 | `{ family_id, name, points, is_custom }` |
| `/api/tasks/:id/status` | PUT | 更新任务状态 | `{ status, executor_id?, confirmed_by? }` |
| `/api/duels` | GET | 获取决斗记录 | `?member_id=xxx` |
| `/api/duels/:id` | GET | 获取单个决斗详情 | - |

### Socket.IO 实时事件

| 事件 | 方向 | 说明 | 数据 |
|------|------|------|------|
| `join-family` | 客→服 | 加入家庭房间 | `{ family_id, member_id }` |
| `family-sync` | 服→客 | 全量数据同步 | `{ members, tasks, beasts }` |
| `member-online` | 服→所有 | 成员上线通知 | `{ member_id, name }` |
| `member-offline` | 服→所有 | 成员离线通知 | `{ member_id }` |
| `task-created` | 服→所有 | 新任务广播 | `{ task }` |
| `task-updated` | 服→所有 | 任务状态更新 | `{ task }` |
| `duel-invite` | 客→服 | 发起决斗邀请 | `{ challenger_id, defender_id }` |
| `duel-invited` | 服→目标 | 收到决斗邀请 | `{ duel_id, challenger }` |
| `duel-accept` | 客→服 | 接受决斗 | `{ duel_id }` |
| `duel-reject` | 客→服 | 拒绝决斗 | `{ duel_id }` |
| `duel-action` | 客→服 | 战斗回合操作 | `{ duel_id, action, skill_id? }` |
| `duel-round` | 服→双方 | 回合结果 | `{ round, attacker, defender, damage, hp }` |
| `duel-ended` | 服→双方 | 战斗结束 | `{ duel_id, winner, result }` |

---

## 神兽系统设计

### 五种神兽初始属性

| 神兽 | 元素 | HP | ATK | DEF | SPD | 特点 |
|------|------|-----|-----|-----|-----|------|
| 青龙 | 木 | 120 | 75 | 55 | 110 | 速度型，先手优势 |
| 朱雀 | 火 | 100 | 95 | 50 | 80 | 攻击型，爆发伤害 |
| 白虎 | 金 | 130 | 85 | 70 | 90 | 平衡型 |
| 玄武 | 水 | 150 | 60 | 85 | 70 | 防御型，持久战 |
| 麒麟 | 光 | 110 | 65 | 65 | 85 | 辅助型，对元素伤害减半 |

### 技能配置

```typescript
const beastSkills = {
  qinglong: {
    basic: { name: '风刃斩', epCost: 25, damageMultiplier: 1.2 },
    advanced1: { name: '龙啸天地', epCost: 50, damageMultiplier: 1.5, type: 'aoe' },
    advanced2: { name: '御风护盾', epCost: 30, effect: 'defenseBoost', value: 0.4 }
  },
  zhuque: {
    basic: { name: '烈焰冲击', epCost: 30, damageMultiplier: 1.3 },
    advanced1: { name: '焚天烈焰', epCost: 45, damageMultiplier: 2.0 },
    advanced2: { name: '涅槃重生', epCost: 60, effect: 'revive', reviveHpPercent: 0.5 }
  },
  baihu: {
    basic: { name: '霜牙咬', epCost: 20, damageMultiplier: 1.1 },
    advanced1: { name: '虎啸雷霆', epCost: 40, damageMultiplier: 1.5, effect: 'stunChance' },
    advanced2: { name: '金刚护体', epCost: 25, effect: 'defenseDouble' }
  },
  xuanwu: {
    basic: { name: '坚岩壁垒', epCost: 15, effect: 'damageReduce', value: 0.3 },
    advanced1: { name: '冰封护盾', epCost: 35, effect: 'immuneDamage' },
    advanced2: { name: '玄武之力', epCost: 45, effect: 'counterDamage', value: 0.5 }
  },
  qilin: {
    basic: { name: '祥瑞之光', epCost: 35, effect: 'heal', value: 0.3 },
    advanced1: { name: '圣光治愈', epCost: 40, effect: 'heal', value: 0.3 },
    advanced2: { name: '祥瑞赐福', epCost: 55, effect: 'allStatsBoost', value: 0.2, duration: 3 }
  }
};
```

### 元素克制关系

```
木(青龙) → 克制 → 水(玄武)
水(玄武) → 克制 → 火(朱雀)
火(朱雀) → 克制 → 金(白虎)
金(白虎) → 克制 → 木(青龙)
光(麒麟) → 不参与克制循环，对所有元素伤害减半
```

克制时伤害 +50%。

### 成长阶段

| 阶段 | 名称 | 累计积分门槛 | 技能解锁 |
|------|------|--------------|----------|
| 1 | 幼年期 | 0 | 基础技能 |
| 2 | 成年期 | 500 | 基础 + 1个进阶技能 |
| 3 | 进化期 | 1500 | 全技能解锁 |
| 4 | 神圣期 | 3000 | 技能威力 +30% |

---

## 任务系统设计

### 预设任务

| 任务名称 | 积分 |
|----------|------|
| 扫地/拖地 | 10 |
| 洗碗 | 15 |
| 整理房间 | 20 |
| 洗衣服 | 15 |
| 倒垃圾 | 5 |
| 擦窗户 | 15 |
| 照顾宠物 | 20 |
| 准备早餐 | 25 |
| 清洁卫生间 | 30 |

### 任务流程

```
pending → in_progress → pending_confirmation → completed
                                                    │
                                                    ▼
                                            执行者获得积分
                                            神兽自动成长
```

### 任务确认机制
任意其他成员（非执行者）点击确认即可让执行者获得积分。

---

## 决斗系统设计

### 战斗选项

| 选项 | 效果 |
|------|------|
| 普通攻击 | 100% ATK 伤害，无 EP 消耗 |
| 技能攻击 | 技能倍率伤害，消耗 EP |
| 防御姿态 | 本回合受到伤害减半 |
| 等待 | 恢复 10 EP，不行动 |

### 回合流程

1. **速度判定**：SPD 高者先行动，相同则随机
2. **先手方选择**：选择操作（攻击/技能/防御/等待）
3. **计算伤害**：
   - 基础伤害 = ATK × 技能倍率
   - 实际伤害 = 基础伤害 - DEF（最低为 1）
   - 克制加成：克制时 +50%
   - 防御减伤：防御姿态时伤害减半
4. **后手方选择**：同上
5. **回合结束判定**：任一方 HP ≤ 0 → 战斗结束
6. **EP 恢复**：每回合双方各恢复 10 EP（上限 200）

### 决斗奖励

| 战斗结果 | 获胜方 | 失败方 |
|----------|--------|--------|
| 胜利 | 50积分 | 0积分 |
| 平局 | 25积分 | 25积分 |
| 投降 | 20积分 | 0积分 |

连胜 3 场以上，额外获得 10 积分/场。

---

## 界面设计

### 主要页面

| 页面 | 路由 | 功能 |
|------|------|------|
| 家庭首页 | `/` | 成员积分排行、功能入口 |
| 神兽主页 | `/beast` | 神兽形象、属性面板、成长进度 |
| 任务中心 | `/tasks` | 任务列表、状态筛选、创建任务 |
| 神兽选择 | `/beast-select` | 五种神兽卡片、属性预览（首次加入时） |
| 决斗大厅 | `/duel` | 对手列表、发起决斗 |
| 战斗界面 | `/battle/:duelId` | 双方神兽、战斗日志、操作按钮 |

### 视觉风格

**配色方案：**
- 金色：`#D4AF37` - 主色调、按钮、强调
- 红色：`#C41E3A` - 朱雀、战斗、警告
- 青色：`#2E8B57` - 青龙、自然、成功
- 玄黑色：`#1A1A2E` - 背景、玄武、文字

**神兽形象：**
- SVG 几何图形为基础
- CSS 渐变填充实现水墨效果
- CSS 动画实现呼吸/攻击动效

**UI 元素：**
- 古风边框（圆角 + 微阴影）
- 云纹装饰（SVG 背景图案）
- 标题使用思源宋体或类似毛笔字体

---

## 部署与运行

### 启动方式

```bash
# 安装依赖
npm install

# 开发模式（前后端分别启动）
npm run dev:client   # Vite 开发服务器
npm run dev:server   # Express + nodemon

# 生产模式
npm run build        # 构建前端
npm run start        # 启动服务器（托管静态文件）
```

### 访问方式

服务器启动后：
- 本机访问：`http://localhost:3000`
- 局域网访问：`http://<服务器IP>:3000`

### 首次使用流程

1. 用户打开网页，检测是否有现有家庭
2. 未发现家庭 → 创建新家庭，输入昵称，生成家庭码
3. 发现家庭 → 输入家庭码和昵称加入
4. 加入后选择神兽类型，开始游戏

---

## 成功标准

1. 家庭成员可通过家庭码加入同一家庭组
2. 所有成员可创建、领取、完成家务任务并获得积分
3. 神兽根据累计积分自动成长，解锁新技能
4. 神兽之间可进行策略性决斗，结果正确计算并记录
5. 局域网内多设备数据实时同步
6. 服务器重启后数据正确恢复（SQLite 持久化）