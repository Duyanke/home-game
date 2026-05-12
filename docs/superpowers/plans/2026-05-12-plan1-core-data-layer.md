# 计划1：项目初始化 + 核心数据层 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建前后端项目骨架，建立 SQLite 数据库和核心数据层，为后续功能模块提供数据基础。

**Architecture:** 前端 client/ 目录使用 Vue 3 + Vite，后端 server/ 目录使用 Express + TypeScript。数据库使用 better-sqlite3 同步 API。

**Tech Stack:** Node.js, Vue 3, Vite, Express, TypeScript, better-sqlite3, uuid

---

## 文件结构

```
housework-beast/
├── client/
│   ├── src/
│   │   ├── main.ts
│   │   ├── App.vue
│   │   └── constants/
│   │       └── beast-data.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── package.json
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── db/
│   │   │   ├── database.ts
│   │   │   └── schema.sql
│   │   ├── models/
│   │   │   ├── family.ts
│   │   │   ├── member.ts
│   │   │   ├── beast.ts
│   │   │   ├── task.ts
│   │   │   └── duel.ts
│   │   └── utils/
│   │       └── family-code.ts
│   ├── tsconfig.json
│   └── package.json
├── package.json
└── README.md
```

---

### Task 1: 创建根项目和 workspace 配置

**Files:**
- Create: `D:\Development\game\housework_beast/package.json`
- Create: `D:\Development\game\housework_beast/README.md`

- [ ] **Step 1: 创建项目根目录**

```bash
cd D:/Development/game
mkdir -p housework_beast
```

- [ ] **Step 2: 创建根 package.json（workspace 配置）**

创建 `housework_beast/package.json`：

```json
{
  "name": "housework-beast",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "client",
    "server"
  ],
  "scripts": {
    "dev:client": "npm run dev --workspace=client",
    "dev:server": "npm run dev --workspace=server",
    "build": "npm run build --workspace=client",
    "start": "npm run start --workspace=server",
    "install:all": "npm install"
  }
}
```

- [ ] **Step 3: 创建 README.md**

创建 `housework_beast/README.md`：

```markdown
# 家务神兽养成游戏

一款面向家庭的 Web 应用游戏，通过家务任务与神兽养成结合激励家庭成员。

## 技术栈

- 前端：Vue 3 + Vite + Pinia + Socket.IO Client
- 后端：Node.js + Express + Socket.IO + SQLite

## 快速开始

```bash
npm install
npm run dev:client  # 启动前端开发服务器
npm run dev:server  # 启动后端开发服务器
```

## 生产部署

```bash
npm run build
npm run start
```

访问 http://localhost:3000
```

- [ ] **Step 4: 提交根项目配置**

```bash
cd D:/Development/game/housework_beast
git add package.json README.md
git commit -m "init: create project root with workspace config"
```

---

### Task 2: 创建前端 Vue 3 项目

**Files:**
- Create: `housework_beast/client/` 目录

- [ ] **Step 1: 使用 Vite 创建 Vue 3 + TypeScript 项目**

```bash
cd D:/Development/game/housework_beast
npm create vite@latest client -- --template vue-ts
```

预期输出：
```
Scaffolding a new Vite + Vue + TypeScript project in client...
Done. Now run: cd client && npm install
```

- [ ] **Step 2: 安装前端依赖**

```bash
cd D:/Development/game/housework_beast/client
npm install
npm install pinia vue-router socket.io-client
npm install -D sass
```

- [ ] **Step 3: 更新 client/package.json 添加 scripts**

修改 `client/package.json`，确保 scripts 包含：

```json
{
  "name": "client",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 4: 验证前端项目可启动**

```bash
cd D:/Development/game/housework_beast/client
npm run dev
```

预期：Vite 启动成功，显示 `http://localhost:5173`

- [ ] **Step 5: 提交前端项目初始化**

```bash
cd D:/Development/game/housework_beast
git add client/
git commit -m "init: create Vue 3 frontend project with Vite"
```

---

### Task 3: 创建后端 Express 项目

**Files:**
- Create: `housework_beast/server/` 目录

- [ ] **Step 1: 创建 server 目录结构**

```bash
cd D:/Development/game/housework_beast
mkdir -p server/src/db server/src/models server/src/utils server/src/routes server/src/socket
```

- [ ] **Step 2: 创建 server/package.json**

创建 `server/package.json`：

```json
{
  "name": "server",
  "version": "1.0.0",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "better-sqlite3": "^9.4.3",
    "uuid": "^9.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/better-sqlite3": "^7.6.9",
    "@types/uuid": "^9.0.0",
    "@types/cors": "^2.8.17",
    "typescript": "^5.3.3",
    "tsx": "^4.7.0"
  }
}
```

- [ ] **Step 3: 创建 server/tsconfig.json**

创建 `server/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: 安装后端依赖**

```bash
cd D:/Development/game/housework_beast/server
npm install
```

- [ ] **Step 5: 创建 Express 入口文件**

创建 `server/src/index.ts`：

```typescript
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initDatabase } from './db/database';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 初始化数据库
initDatabase();

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件（生产环境托管前端构建结果）
app.use(express.static('../client/dist'));

// 基础路由
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO 连接处理
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
});

export { app, io };
```

- [ ] **Step 6: 验证后端项目可启动**

```bash
cd D:/Development/game/housework_beast/server
npm run dev
```

预期：Express 启动成功，显示 `Server running on port 3000`

- [ ] **Step 7: 提交后端项目初始化**

```bash
cd D:/Development/game/housework_beast
git add server/
git commit -m "init: create Express backend project with TypeScript"
```

---

### Task 4: 创建数据库初始化脚本

**Files:**
- Create: `server/src/db/schema.sql`
- Create: `server/src/db/database.ts`

- [ ] **Step 1: 创建数据库 schema 文件**

创建 `server/src/db/schema.sql`：

```sql
-- 家庭信息表
CREATE TABLE IF NOT EXISTS families (
    family_id TEXT PRIMARY KEY,
    family_code TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 家庭成员表
CREATE TABLE IF NOT EXISTS members (
    member_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    beast_id TEXT,
    total_points INTEGER DEFAULT 0,
    status TEXT DEFAULT 'offline',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_id) REFERENCES families(family_id)
);

-- 神兽表
CREATE TABLE IF NOT EXISTS beasts (
    beast_id TEXT PRIMARY KEY,
    member_id TEXT NOT NULL UNIQUE,
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
CREATE TABLE IF NOT EXISTS tasks (
    task_id TEXT PRIMARY KEY,
    family_id TEXT NOT NULL,
    name TEXT NOT NULL,
    points INTEGER NOT NULL,
    creator_id TEXT NOT NULL,
    executor_id TEXT,
    status TEXT DEFAULT 'pending',
    is_custom INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    confirmed_by TEXT,
    FOREIGN KEY (family_id) REFERENCES families(family_id)
);

-- 决斗记录表
CREATE TABLE IF NOT EXISTS duels (
    duel_id TEXT PRIMARY KEY,
    challenger_id TEXT NOT NULL,
    defender_id TEXT NOT NULL,
    winner_id TEXT,
    result TEXT DEFAULT 'ongoing',
    rounds INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    ended_at TEXT,
    FOREIGN KEY (challenger_id) REFERENCES members(member_id),
    FOREIGN KEY (defender_id) REFERENCES members(member_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_members_family ON members(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_family ON tasks(family_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_duels_challenger ON duels(challenger_id);
CREATE INDEX IF NOT EXISTS idx_duels_defender ON duels(defender_id);
```

- [ ] **Step 2: 创建数据库初始化模块**

创建 `server/src/db/database.ts`：

```typescript
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const DB_PATH = join(__dirname, '../../data/housework.db');

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function initDatabase(): void {
  const database = getDatabase();
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  
  // 执行 schema 创建表
  database.exec(schema);
  
  console.log('Database initialized successfully');
}

export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

// 清空所有数据（用于测试）
export function clearAllTables(): void {
  const database = getDatabase();
  database.exec('DELETE FROM duels');
  database.exec('DELETE FROM tasks');
  database.exec('DELETE FROM beasts');
  database.exec('DELETE FROM members');
  database.exec('DELETE FROM families');
}
```

- [ ] **Step 3: 创建 data 目录**

```bash
cd D:/Development/game/housework_beast/server
mkdir -p data
```

- [ ] **Step 4: 验证数据库初始化**

重启 server 并检查数据库文件是否创建：

```bash
cd D:/Development/game/housework_beast/server
npm run dev
```

预期：日志显示 `Database initialized successfully`

- [ ] **Step 5: 提交数据库模块**

```bash
cd D:/Development/game/housework_beast
git add server/src/db/
git commit -m "feat: add SQLite database initialization with schema"
```

---

### Task 5: 创建数据模型（Family, Member）

**Files:**
- Create: `server/src/models/family.ts`
- Create: `server/src/models/member.ts`

- [ ] **Step 1: 创建 Family 模型**

创建 `server/src/models/family.ts`：

```typescript
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';

export interface Family {
  family_id: string;
  family_code: string;
  created_at: string;
}

export function createFamily(): Family {
  const db = getDatabase();
  const familyId = uuidv4();
  const familyCode = generateFamilyCode();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO families (family_id, family_code, created_at)
    VALUES (?, ?, ?)
  `);

  stmt.run(familyId, familyCode, createdAt);

  return {
    family_id: familyId,
    family_code: familyCode,
    created_at: createdAt
  };
}

export function getFamilyById(familyId: string): Family | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM families WHERE family_id = ?');
  return stmt.get(familyId) as Family | null;
}

export function getFamilyByCode(familyCode: string): Family | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM families WHERE family_code = ?');
  return stmt.get(familyCode) as Family | null;
}

export function getAllFamilies(): Family[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM families');
  return stmt.all() as Family[];
}

function generateFamilyCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

- [ ] **Step 2: 创建 Member 模型**

创建 `server/src/models/member.ts`：

```typescript
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';

export interface Member {
  member_id: string;
  family_id: string;
  name: string;
  beast_id: string | null;
  total_points: number;
  status: 'online' | 'offline';
  created_at: string;
}

export function createMember(familyId: string, name: string): Member {
  const db = getDatabase();
  const memberId = uuidv4();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO members (member_id, family_id, name, beast_id, total_points, status, created_at)
    VALUES (?, ?, ?, NULL, 0, 'offline', ?)
  `);

  stmt.run(memberId, familyId, name, createdAt);

  return {
    member_id: memberId,
    family_id: familyId,
    name: name,
    beast_id: null,
    total_points: 0,
    status: 'offline',
    created_at: createdAt
  };
}

export function getMemberById(memberId: string): Member | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM members WHERE member_id = ?');
  return stmt.get(memberId) as Member | null;
}

export function getMembersByFamily(familyId: string): Member[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM members WHERE family_id = ?');
  return stmt.all(familyId) as Member[];
}

export function updateMemberStatus(memberId: string, status: 'online' | 'offline'): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE members SET status = ? WHERE member_id = ?');
  stmt.run(status, memberId);
}

export function updateMemberPoints(memberId: string, points: number): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE members SET total_points = ? WHERE member_id = ?');
  stmt.run(points, memberId);
}

export function updateMemberBeast(memberId: string, beastId: string): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE members SET beast_id = ? WHERE member_id = ?');
  stmt.run(beastId, memberId);
}

export function deleteMember(memberId: string): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM members WHERE member_id = ?');
  stmt.run(memberId);
}
```

- [ ] **Step 3: 提交 Family 和 Member 模型**

```bash
cd D:/Development/game/housework_beast
git add server/src/models/family.ts server/src/models/member.ts
git commit -m "feat: add Family and Member data models"
```

---

### Task 6: 创建神兽数据模型和常量

**Files:**
- Create: `server/src/models/beast.ts`
- Create: `client/src/constants/beast-data.ts`

- [ ] **Step 1: 创建后端 Beast 模型**

创建 `server/src/models/beast.ts`：

```typescript
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';

export type BeastType = 'qinglong' | 'zhuque' | 'baihu' | 'xuanwu' | 'qilin';

export interface Beast {
  beast_id: string;
  member_id: string;
  beast_type: BeastType;
  stage: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  ep: number;
  unlocked_skills: string[];
}

// 神兽初始属性配置
export const BEAST_BASE_STATS: Record<BeastType, { hp: number; atk: number; def: number; spd: number }> = {
  qinglong: { hp: 120, atk: 75, def: 55, spd: 110 },
  zhuque: { hp: 100, atk: 95, def: 50, spd: 80 },
  baihu: { hp: 130, atk: 85, def: 70, spd: 90 },
  xuanwu: { hp: 150, atk: 60, def: 85, spd: 70 },
  qilin: { hp: 110, atk: 65, def: 65, spd: 85 }
};

export function createBeast(memberId: string, beastType: BeastType): Beast {
  const db = getDatabase();
  const beastId = uuidv4();
  const baseStats = BEAST_BASE_STATS[beastType];

  const stmt = db.prepare(`
    INSERT INTO beasts (beast_id, member_id, beast_type, stage, hp, atk, def, spd, ep, unlocked_skills)
    VALUES (?, ?, ?, 1, ?, ?, ?, ?, 100, '')
  `);

  stmt.run(beastId, memberId, beastType, baseStats.hp, baseStats.atk, baseStats.def, baseStats.spd);

  return {
    beast_id: beastId,
    member_id: memberId,
    beast_type: beastType,
    stage: 1,
    hp: baseStats.hp,
    atk: baseStats.atk,
    def: baseStats.def,
    spd: baseStats.spd,
    ep: 100,
    unlocked_skills: []
  };
}

export function getBeastById(beastId: string): Beast | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM beasts WHERE beast_id = ?');
  const row = stmt.get(beastId) as any;
  if (!row) return null;
  
  return {
    ...row,
    unlocked_skills: row.unlocked_skills ? row.unlocked_skills.split(',') : []
  };
}

export function getBeastByMember(memberId: string): Beast | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM beasts WHERE member_id = ?');
  const row = stmt.get(memberId) as any;
  if (!row) return null;
  
  return {
    ...row,
    unlocked_skills: row.unlocked_skills ? row.unlocked_skills.split(',') : []
  };
}

export function updateBeastStage(beastId: string, stage: number): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE beasts SET stage = ? WHERE beast_id = ?');
  stmt.run(stage, beastId);
}

export function updateBeastSkills(beastId: string, skills: string[]): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE beasts SET unlocked_skills = ? WHERE beast_id = ?');
  stmt.run(skills.join(','), beastId);
}

export function updateBeastEp(beastId: string, ep: number): void {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE beasts SET ep = ? WHERE beast_id = ?');
  stmt.run(ep, beastId);
}

// 根据累计积分计算成长阶段
export function calculateStage(totalPoints: number): number {
  if (totalPoints >= 3000) return 4;
  if (totalPoints >= 1500) return 3;
  if (totalPoints >= 500) return 2;
  return 1;
}

// 获取阶段对应解锁的技能数量
export function getUnlockedSkillsCount(stage: number): number {
  if (stage >= 3) return 4;
  if (stage >= 2) return 2;
  return 1;
}
```

- [ ] **Step 2: 创建前端神兽常量文件**

创建 `client/src/constants/beast-data.ts`：

```typescript
export type BeastType = 'qinglong' | 'zhuque' | 'baihu' | 'xuanwu' | 'qilin';

export interface BeastStats {
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface BeastInfo {
  type: BeastType;
  name: string;
  element: string;
  elementName: string;
  description: string;
  baseStats: BeastStats;
}

export const BEAST_DATA: Record<BeastType, BeastInfo> = {
  qinglong: {
    type: 'qinglong',
    name: '青龙',
    element: 'wood',
    elementName: '木',
    description: '速度型神兽，先手优势，风属性攻击',
    baseStats: { hp: 120, atk: 75, def: 55, spd: 110 }
  },
  zhuque: {
    type: 'zhuque',
    name: '朱雀',
    element: 'fire',
    elementName: '火',
    description: '攻击型神兽，爆发伤害，火属性攻击',
    baseStats: { hp: 100, atk: 95, def: 50, spd: 80 }
  },
  baihu: {
    type: 'baihu',
    name: '白虎',
    element: 'metal',
    elementName: '金',
    description: '平衡型神兽，均衡发展，雷属性攻击',
    baseStats: { hp: 130, atk: 85, def: 70, spd: 90 }
  },
  xuanwu: {
    type: 'xuanwu',
    name: '玄武',
    element: 'water',
    elementName: '水',
    description: '防御型神兽，持久作战，水属性防御',
    baseStats: { hp: 150, atk: 60, def: 85, spd: 70 }
  },
  qilin: {
    type: 'qilin',
    name: '麒麟',
    element: 'light',
    elementName: '光',
    description: '辅助型神兽，团队增益，对所有元素伤害减半',
    baseStats: { hp: 110, atk: 65, def: 65, spd: 85 }
  }
};

// 元素克制关系
export const ELEMENT_COUNTER: Record<string, string> = {
  wood: 'water',   // 木克水
  water: 'fire',   // 水克火
  fire: 'metal',   // 火克金
  metal: 'wood',   // 金克木
};

// 检查是否克制
export function isCounter(attackerElement: string, defenderElement: string): boolean {
  if (attackerElement === 'light' || defenderElement === 'light') return false;
  return ELEMENT_COUNTER[attackerElement] === defenderElement;
}

// 成长阶段配置
export interface GrowthStage {
  name: string;
  threshold: number;
  skillsCount: number;
  powerBonus: number;
}

export const GROWTH_STAGES: GrowthStage[] = [
  { name: '幼年期', threshold: 0, skillsCount: 1, powerBonus: 0 },
  { name: '成年期', threshold: 500, skillsCount: 2, powerBonus: 0 },
  { name: '进化期', threshold: 1500, skillsCount: 4, powerBonus: 0 },
  { name: '神圣期', threshold: 3000, skillsCount: 4, powerBonus: 0.3 }
];

// 技能配置
export interface Skill {
  id: string;
  name: string;
  epCost: number;
  damageMultiplier?: number;
  effect?: string;
  value?: number;
}

export const BEAST_SKILLS: Record<BeastType, Skill[]> = {
  qinglong: [
    { id: 'wind_slash', name: '风刃斩', epCost: 25, damageMultiplier: 1.2 },
    { id: 'dragon_roar', name: '龙啸天地', epCost: 50, damageMultiplier: 1.5 },
    { id: 'wind_shield', name: '御风护盾', epCost: 30, effect: 'defenseBoost', value: 0.4 }
  ],
  zhuque: [
    { id: 'flame_strike', name: '烈焰冲击', epCost: 30, damageMultiplier: 1.3 },
    { id: 'sky_flame', name: '焚天烈焰', epCost: 45, damageMultiplier: 2.0 },
    { id: 'rebirth', name: '涅槃重生', epCost: 60, effect: 'revive', value: 0.5 }
  ],
  baihu: [
    { id: 'frost_bite', name: '霜牙咬', epCost: 20, damageMultiplier: 1.1 },
    { id: 'tiger_roar', name: '虎啸雷霆', epCost: 40, damageMultiplier: 1.5 },
    { id: 'iron_body', name: '金刚护体', epCost: 25, effect: 'defenseDouble', value: 1 }
  ],
  xuanwu: [
    { id: 'rock_wall', name: '坚岩壁垒', epCost: 15, effect: 'damageReduce', value: 0.3 },
    { id: 'ice_shield', name: '冰封护盾', epCost: 35, effect: 'immuneDamage', value: 1 },
    { id: 'xuanwu_power', name: '玄武之力', epCost: 45, effect: 'counterDamage', value: 0.5 }
  ],
  qilin: [
    { id: 'bless_light', name: '祥瑞之光', epCost: 35, effect: 'heal', value: 0.3 },
    { id: 'holy_heal', name: '圣光治愈', epCost: 40, effect: 'heal', value: 0.3 },
    { id: 'blessing', name: '祥瑞赐福', epCost: 55, effect: 'allStatsBoost', value: 0.2 }
  ]
};

// 预设任务
export const PRESET_TASKS = [
  { name: '扫地/拖地', points: 10 },
  { name: '洗碗', points: 15 },
  { name: '整理房间', points: 20 },
  { name: '洗衣服', points: 15 },
  { name: '倒垃圾', points: 5 },
  { name: '擦窗户', points: 15 },
  { name: '照顾宠物', points: 20 },
  { name: '准备早餐', points: 25 },
  { name: '清洁卫生间', points: 30 }
];

// 决斗奖励
export const DUEL_REWARDS = {
  win: 50,
  draw: 25,
  surrender: 20,
  streakBonus: 10,
  streakThreshold: 3
};
```

- [ ] **Step 3: 提交神兽模型和常量**

```bash
cd D:/Development/game/housework_beast
git add server/src/models/beast.ts client/src/constants/beast-data.ts
git commit -m "feat: add Beast model and shared beast constants"
```

---

### Task 7: 创建 Task 和 Duel 数据模型

**Files:**
- Create: `server/src/models/task.ts`
- Create: `server/src/models/duel.ts`

- [ ] **Step 1: 创建 Task 模型**

创建 `server/src/models/task.ts`：

```typescript
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';

export type TaskStatus = 'pending' | 'in_progress' | 'pending_confirmation' | 'completed';

export interface Task {
  task_id: string;
  family_id: string;
  name: string;
  points: number;
  creator_id: string;
  executor_id: string | null;
  status: TaskStatus;
  is_custom: boolean;
  created_at: string;
  completed_at: string | null;
  confirmed_by: string | null;
}

export function createTask(
  familyId: string,
  name: string,
  points: number,
  creatorId: string,
  isCustom: boolean = false
): Task {
  const db = getDatabase();
  const taskId = uuidv4();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO tasks (task_id, family_id, name, points, creator_id, executor_id, status, is_custom, created_at)
    VALUES (?, ?, ?, ?, ?, NULL, 'pending', ?, ?)
  `);

  stmt.run(taskId, familyId, name, points, creatorId, isCustom ? 1 : 0, createdAt);

  return {
    task_id: taskId,
    family_id: familyId,
    name: name,
    points: points,
    creator_id: creatorId,
    executor_id: null,
    status: 'pending',
    is_custom: isCustom,
    created_at: createdAt,
    completed_at: null,
    confirmed_by: null
  };
}

export function getTaskById(taskId: string): Task | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tasks WHERE task_id = ?');
  const row = stmt.get(taskId) as any;
  if (!row) return null;
  
  return {
    ...row,
    is_custom: row.is_custom === 1
  };
}

export function getTasksByFamily(familyId: string): Task[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tasks WHERE family_id = ? ORDER BY created_at DESC');
  const rows = stmt.all(familyId) as any[];
  
  return rows.map(row => ({
    ...row,
    is_custom: row.is_custom === 1
  }));
}

export function getTasksByStatus(familyId: string, status: TaskStatus): Task[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM tasks WHERE family_id = ? AND status = ? ORDER BY created_at DESC');
  const rows = stmt.all(familyId, status) as any[];
  
  return rows.map(row => ({
    ...row,
    is_custom: row.is_custom === 1
  }));
}

export function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  executorId?: string,
  confirmedBy?: string
): void {
  const db = getDatabase();
  
  if (status === 'completed') {
    const stmt = db.prepare(`
      UPDATE tasks SET status = ?, completed_at = ?, confirmed_by = ? WHERE task_id = ?
    `);
    stmt.run(status, new Date().toISOString(), confirmedBy || null, taskId);
  } else if (executorId) {
    const stmt = db.prepare(`
      UPDATE tasks SET status = ?, executor_id = ? WHERE task_id = ?
    `);
    stmt.run(status, executorId, taskId);
  } else {
    const stmt = db.prepare('UPDATE tasks SET status = ? WHERE task_id = ?');
    stmt.run(status, taskId);
  }
}

export function deleteTask(taskId: string): void {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM tasks WHERE task_id = ?');
  stmt.run(taskId);
}
```

- [ ] **Step 2: 创建 Duel 模型**

创建 `server/src/models/duel.ts`：

```typescript
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../db/database';

export type DuelResult = 'ongoing' | 'challenger_win' | 'defender_win' | 'draw';

export interface Duel {
  duel_id: string;
  challenger_id: string;
  defender_id: string;
  winner_id: string | null;
  result: DuelResult;
  rounds: number;
  created_at: string;
  ended_at: string | null;
}

export function createDuel(challengerId: string, defenderId: string): Duel {
  const db = getDatabase();
  const duelId = uuidv4();
  const createdAt = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO duels (duel_id, challenger_id, defender_id, winner_id, result, rounds, created_at)
    VALUES (?, ?, ?, NULL, 'ongoing', 0, ?)
  `);

  stmt.run(duelId, challengerId, defenderId, createdAt);

  return {
    duel_id: duelId,
    challenger_id: challengerId,
    defender_id: defenderId,
    winner_id: null,
    result: 'ongoing',
    rounds: 0,
    created_at: createdAt,
    ended_at: null
  };
}

export function getDuelById(duelId: string): Duel | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM duels WHERE duel_id = ?');
  return stmt.get(duelId) as Duel | null;
}

export function getDuelsByMember(memberId: string): Duel[] {
  const db = getDatabase();
  const stmt = db.prepare(`
    SELECT * FROM duels WHERE challenger_id = ? OR defender_id = ? ORDER BY created_at DESC
  `);
  return stmt.all(memberId, memberId) as Duel[];
}

export function getOngoingDuels(): Duel[] {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM duels WHERE result = \'ongoing\'');
  return stmt.all() as Duel[];
}

export function updateDuelResult(
  duelId: string,
  result: DuelResult,
  winnerId?: string,
  rounds?: number
): void {
  const db = getDatabase();
  const stmt = db.prepare(`
    UPDATE duels SET result = ?, winner_id = ?, rounds = ?, ended_at = ? WHERE duel_id = ?
  `);
  stmt.run(result, winnerId || null, rounds || 0, new Date().toISOString(), duelId);
}

export function incrementDuelRounds(duelId: string): number {
  const db = getDatabase();
  const duel = getDuelById(duelId);
  if (!duel) return 0;
  
  const newRounds = duel.rounds + 1;
  const stmt = db.prepare('UPDATE duels SET rounds = ? WHERE duel_id = ?');
  stmt.run(newRounds, duelId);
  
  return newRounds;
}
```

- [ ] **Step 3: 提交 Task 和 Duel 模型**

```bash
cd D:/Development/game/housework_beast
git add server/src/models/task.ts server/src/models/duel.ts
git commit -m "feat: add Task and Duel data models"
```

---

### Task 8: 运行完整项目验证

- [ ] **Step 1: 在根目录安装所有依赖**

```bash
cd D:/Development/game/housework_beast
npm install
```

预期：client 和 server 依赖都安装成功。

- [ ] **Step 2: 启动后端服务**

```bash
cd D:/Development/game/housework_beast/server
npm run dev
```

预期：Express 启动，数据库初始化成功。

- [ ] **Step 3: 启动前端开发服务器**

```bash
cd D:/Development/game/housework_beast/client
npm run dev
```

预期：Vite 启动，可访问 http://localhost:5173

- [ ] **Step 4: 验证 API health check**

访问 `http://localhost:3000/api/health`

预期：返回 `{ "status": "ok", "timestamp": "..." }`

- [ ] **Step 5: 最终提交**

```bash
cd D:/Development/game/housework_beast
git status
git log --oneline -10
```

确认所有文件已提交。

---

## Self-Review 检查清单

**1. Spec 覆盖检查：**
- ✅ 项目结构创建 - Task 1-3
- ✅ SQLite 数据库 - Task 4
- ✅ Family 模型 - Task 5
- ✅ Member 模型 - Task 5
- ✅ Beast 模型 - Task 6
- ✅ Task 模型 - Task 7
- ✅ Duel 模型 - Task 7
- ✅ 神兽常量（前后端共享）- Task 6

**2. Placeholder 检查：**
- 无 TBD、TODO 或模糊描述
- 所有代码步骤包含完整实现

**3. 类型一致性检查：**
- BeastType 前后端定义一致
- TaskStatus 枚举定义完整
- DuelResult 枚举定义完整
- 接口定义与数据库字段对应

---

## 完成标准

本计划完成后应满足：
1. 前端 Vue 3 项目可独立启动（npm run dev:client）
2. 后端 Express 项目可独立启动（npm run dev:server）
3. SQLite 数据库初始化成功，表结构完整
4. 所有数据模型（Family, Member, Beast, Task, Duel）定义完成
5. 后端 health check API 返回正常