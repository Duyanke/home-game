# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

家务神兽养成游戏 - 家庭 Web 应用，通过家务任务与神兽养成激励家庭成员。使用 npm workspaces 管理前后端。

## 开发命令

```bash
# 安装依赖（根目录）
npm install

# 启动开发服务器
npm run dev:client   # 前端开发服务器 (Vite)
npm run dev:server   # 后端开发服务器 (tsx watch)

# 生产构建和部署
npm run build        # 构建前端
npm run start        # 启动生产服务器
```

前端开发服务器默认 `http://localhost:5173`，后端 `http://localhost:3000`。

## 架构

### 目录结构

```
housework_beast/
├── client/          # Vue 3 前端 (workspace)
│   └── src/
│       ├── pages/       # 路由页面组件
│       ├── components/  # UI组件 (common/, beast/, task/, duel/, effects/)
│       ├── stores/      # Pinia 状态管理 (family, beast, task, toast)
│       ├── services/    # Socket.IO 连接管理
│       ├── constants/   # 神兽数据、技能、成长阶段配置
│       ├── router/      # Vue Router 配置
│       └── assets/      # SCSS 样式 (variables, mixins, global)
├── server/          # Node.js 后端 (workspace)
│   └── src/
│       ├── routes/      # REST API 路由 (family, member, beast, task, duel)
│       ├── models/      # 数据库操作
│       ├── socket/      # Socket.IO 事件处理器和类型定义
│       ├── game/        # 游戏逻辑 (battle-engine, growth, constants)
│       ├── db/          # SQLite (sql.js) 数据库初始化
│       └── index.ts     # 服务器入口
└── package.json     # 根 workspace 配置
```

### 前端架构

- **路由页面**: HomePage, BeastPage, BeastSelectPage, TaskPage, DuelPage, BattlePage
- **状态管理**: Pinia stores 管理家庭成员、神兽、任务、Toast 消息
- **Socket 通信**: 通过 `services/socket.ts` 单例管理 Socket.IO 连接，使用 `sendMessage()` 发送事件
- **样式**: SCSS 模块化，variables.scss 定义神兽元素配色和主题色

### 后端架构

- **数据库**: sql.js (SQLite in-memory with file persistence)，schema.sql 定义表结构
- **Socket.IO**: 实时通信核心，事件处理器在 `socket/handlers.ts`
- **游戏模块**:
  - `battle-engine.ts`: 战斗初始化、伤害计算、技能执行、回合管理
  - `growth.ts`: 成长阶段计算、积分触发升级、技能解锁
  - `constants.ts`: 神兽基础属性、元素克制、技能定义

### Socket 事件类型

主要事件: `HELLO`/`HELLO_ACK` (加入家庭), `SYNC_REQUEST`/`SYNC_DATA` (数据同步), `SELECT_BEAST`, `TASK_CREATE`/`TASK_CLAIM`/`TASK_COMPLETE`/`CONFIRM_TASK`, `DUEL_INVITE`/`DUEL_ACCEPT`/`DUEL_ACTION`, `BROADCAST` (家庭房间广播)

### 神兽系统

五种神兽: 青龙(木-速度型), 朱雀(火-攻击型), 白虎(金-平衡型), 玄武(水-防御型), 麒麟(光-辅助型)
元素克制: 木→水→火→金→木 (麒麟无克制)
成长阶段: 幼年期 → 成年期(500分) → 进化期(1500分) → 神圣期(3000分)

## 数据库 Schema

核心表: families, members, beasts, tasks, duels
数据库文件: `server/data/housework.db` (SQLite 文件)

## 前端样式约定

使用 SCSS 变量: `$color-gold`, `$color-red`, `$color-green`, `$color-dark` 及扩展色阶
神兽元素色: `$color-element-{wood,fire,metal,water,light}`
导入方式: `@use '@/assets/styles/variables' as *;`