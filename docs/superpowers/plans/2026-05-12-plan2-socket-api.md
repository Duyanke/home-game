# Socket.IO 实时通信层 + REST API 路由 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的 REST API 路由和 Socket.IO 实时通信层，使前后端可以进行数据交互和实时同步。

**Architecture:** 采用 Express Router 分离各模型 API，Socket.IO 实现设计文档定义的消息类型处理。路由层调用现有 Model 函数，Socket 事件广播变更通知。

**Tech Stack:** Express Router, Socket.IO, TypeScript

---

## 文件结构

```
server/src/
├── routes/
│   ├── index.ts       # 聚合导出所有路由
│   ├── family.ts      # 家庭 API: 创建、查询、通过码加入
│   ├── member.ts      # 成员 API: 创建、查询、更新状态/积分/神兽
│   ├── beast.ts       # 神兽 API: 创建、查询、更新阶段/技能/EP
│   ├── task.ts        # 任务 API: CRUD、状态更新
│   └── duel.ts        # 决斗 API: 创建、查询、更新结果
├── socket/
│   ├── handlers.ts    # Socket.IO 事件处理器
│   └── types.ts       # 事件类型和 payload 接口定义
└── index.ts           # 修改: 注册路由和 Socket handlers
```

---

### Task 1: 创建 Socket 事件类型定义

**Files:**
- Create: `server/src/socket/types.ts`

- [ ] **Step 1: 创建 socket/types.ts 定义所有事件类型**

```typescript
// Socket 事件类型定义
export type SocketEventType =
  | 'HELLO'           // 客户端加入家庭
  | 'HELLO_ACK'       // 服务器确认加入
  | 'SYNC_REQUEST'    // 请求数据同步
  | 'SYNC_DATA'       // 返回数据快照
  | 'TASK_CREATE'     // 创建任务
  | 'TASK_UPDATE'     // 任务状态变更
  | 'BROADCAST'       // 广播变更通知
  | 'DUEL_INVITE'     // 发起决斗邀请
  | 'DUEL_ACCEPT'     // 接受决斗
  | 'DUEL_REJECT'     // 拒绝决斗
  | 'DUEL_ACTION'     // 决斗回合操作
  | 'MEMBER_UPDATE'   // 成员状态更新
  | 'HEARTBEAT'       // 心跳保持连接
  | 'ERROR';          // 错误消息

// 各事件的 payload 接口
export interface HelloPayload {
  familyCode: string;
  memberName: string;
}

export interface HelloAckPayload {
  success: boolean;
  familyId?: string;
  memberId?: string;
  message?: string;
}

export interface SyncRequestPayload {
  familyId: string;
  memberId: string;
}

export interface SyncDataPayload {
  family: any;
  members: any[];
  beasts: any[];
  tasks: any[];
  duels: any[];
}

export interface TaskCreatePayload {
  familyId: string;
  name: string;
  points: number;
  creatorId: string;
  isCustom: boolean;
}

export interface TaskUpdatePayload {
  taskId: string;
  status: string;
  executorId?: string;
  confirmedBy?: string;
}

export interface BroadcastPayload {
  event: string;
  data: any;
}

export interface DuelInvitePayload {
  challengerId: string;
  defenderId: string;
}

export interface DuelActionPayload {
  duelId: string;
  memberId: string;
  action: 'attack' | 'skill' | 'defend' | 'surrender';
  skillId?: string;
}

export interface MemberUpdatePayload {
  memberId: string;
  status: 'online' | 'offline';
}

// Socket 消息格式
export interface SocketMessage<T = any> {
  type: SocketEventType;
  payload: T;
  timestamp: number;
}
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/socket/types.ts
git commit -m "feat: add Socket event types and payload interfaces"
```

---

### Task 2: 创建 Socket 事件处理器

**Files:**
- Create: `server/src/socket/handlers.ts`
- Modify: `server/src/index.ts` (注册 Socket handlers)

- [ ] **Step 1: 创建 socket/handlers.ts 实现所有事件处理**

```typescript
import { Server, Socket } from 'socket.io';
import {
  SocketEventType,
  SocketMessage,
  HelloPayload,
  HelloAckPayload,
  SyncRequestPayload,
  SyncDataPayload,
  TaskCreatePayload,
  TaskUpdatePayload,
  DuelInvitePayload,
  DuelActionPayload,
  MemberUpdatePayload,
  BroadcastPayload
} from './types';
import {
  getFamilyByCode,
  createFamily,
  getFamilyById
} from '../models/family';
import {
  createMember,
  getMemberById,
  getMembersByFamily,
  updateMemberStatus,
  updateMemberPoints
} from '../models/member';
import {
  createBeast,
  getBeastByMember,
  getBeastById
} from '../models/beast';
import {
  createTask,
  getTaskById,
  getTasksByFamily,
  updateTaskStatus
} from '../models/task';
import {
  createDuel,
  getDuelById,
  getDuelsByMember,
  updateDuelResult
} from '../models/duel';

// 存储成员与 Socket 的映射
const memberSocketMap: Map<string, Socket> = new Map();
const socketMemberMap: Map<string, string> = new Map();

export function registerSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    // HELLO: 客户端加入家庭
    socket.on('HELLO', (msg: SocketMessage<HelloPayload>) => {
      handleHello(io, socket, msg);
    });

    // SYNC_REQUEST: 请求数据同步
    socket.on('SYNC_REQUEST', (msg: SocketMessage<SyncRequestPayload>) => {
      handleSyncRequest(socket, msg);
    });

    // TASK_CREATE: 创建任务
    socket.on('TASK_CREATE', (msg: SocketMessage<TaskCreatePayload>) => {
      handleTaskCreate(io, socket, msg);
    });

    // TASK_UPDATE: 更新任务状态
    socket.on('TASK_UPDATE', (msg: SocketMessage<TaskUpdatePayload>) => {
      handleTaskUpdate(io, socket, msg);
    });

    // DUEL_INVITE: 发起决斗邀请
    socket.on('DUEL_INVITE', (msg: SocketMessage<DuelInvitePayload>) => {
      handleDuelInvite(io, socket, msg);
    });

    // DUEL_ACCEPT: 接受决斗
    socket.on('DUEL_ACCEPT', (msg: SocketMessage<{ duelId: string; defenderId: string }>) => {
      handleDuelAccept(io, socket, msg);
    });

    // DUEL_REJECT: 拒绝决斗
    socket.on('DUEL_REJECT', (msg: SocketMessage<{ duelId: string; defenderId: string }>) => {
      handleDuelReject(io, socket, msg);
    });

    // DUEL_ACTION: 决斗操作（留待计划3实现完整战斗逻辑）
    socket.on('DUEL_ACTION', (msg: SocketMessage<DuelActionPayload>) => {
      handleDuelAction(io, socket, msg);
    });

    // MEMBER_UPDATE: 更新成员状态
    socket.on('MEMBER_UPDATE', (msg: SocketMessage<MemberUpdatePayload>) => {
      handleMemberUpdate(io, socket, msg);
    });

    // HEARTBEAT: 心跳响应
    socket.on('HEARTBEAT', (msg: SocketMessage) => {
      socket.emit('HEARTBEAT_ACK', { type: 'HEARTBEAT_ACK', payload: {}, timestamp: Date.now() });
    });

    // 断线处理
    socket.on('disconnect', () => {
      handleDisconnect(io, socket);
    });
  });
}

// HELLO 处理：加入家庭
function handleHello(io: Server, socket: Socket, msg: SocketMessage<HelloPayload>): void {
  const { familyCode, memberName } = msg.payload;

  // 尝试查找现有家庭
  let family = getFamilyByCode(familyCode);

  // 如果家庭不存在，创建新家庭
  if (!family) {
    family = createFamily();
  }

  // 创建成员
  const member = createMember(family.family_id, memberName);
  updateMemberStatus(member.member_id, 'online');

  // 存储映射关系
  memberSocketMap.set(member.member_id, socket);
  socketMemberMap.set(socket.id, member.member_id);

  // 加入家庭房间
  socket.join(`family:${family.family_id}`);

  // 发送确认
  const ackPayload: HelloAckPayload = {
    success: true,
    familyId: family.family_id,
    memberId: member.member_id
  };

  socket.emit('HELLO_ACK', {
    type: 'HELLO_ACK',
    payload: ackPayload,
    timestamp: Date.now()
  });

  // 广播新成员加入
  broadcastToFamily(io, family.family_id, 'MEMBER_JOINED', {
    memberId: member.member_id,
    memberName: member.name
  });
}

// SYNC_REQUEST 处理：同步数据
function handleSyncRequest(socket: Socket, msg: SocketMessage<SyncRequestPayload>): void {
  const { familyId } = msg.payload;

  const family = getFamilyById(familyId);
  const members = getMembersByFamily(familyId);
  const beasts = members.map(m => getBeastByMember(m.member_id)).filter(b => b !== null);
  const tasks = getTasksByFamily(familyId);
  const duels = members.flatMap(m => getDuelsByMember(m.member_id));

  const syncPayload: SyncDataPayload = {
    family,
    members,
    beasts,
    tasks,
    duels
  };

  socket.emit('SYNC_DATA', {
    type: 'SYNC_DATA',
    payload: syncPayload,
    timestamp: Date.now()
  });
}

// TASK_CREATE 处理：创建任务
function handleTaskCreate(io: Server, socket: Socket, msg: SocketMessage<TaskCreatePayload>): void {
  const { familyId, name, points, creatorId, isCustom } = msg.payload;

  const task = createTask(familyId, name, points, creatorId, isCustom);

  broadcastToFamily(io, familyId, 'TASK_CREATED', task);
}

// TASK_UPDATE 处理：更新任务状态
function handleTaskUpdate(io: Server, socket: Socket, msg: SocketMessage<TaskUpdatePayload>): void {
  const { taskId, status, executorId, confirmedBy } = msg.payload;

  updateTaskStatus(taskId, status as any, executorId, confirmedBy);
  const task = getTaskById(taskId);

  if (task) {
    // 如果任务完成，给执行者加积分
    if (status === 'completed' && task.executor_id) {
      const member = getMemberById(task.executor_id);
      if (member) {
        const newPoints = member.total_points + task.points;
        updateMemberPoints(task.executor_id, newPoints);

        // 广播积分更新
        broadcastToFamily(io, member.family_id, 'MEMBER_POINTS_UPDATED', {
          memberId: task.executor_id,
          newPoints
        });
      }
    }

    broadcastToFamily(io, task.family_id, 'TASK_UPDATED', task);
  }
}

// DUEL_INVITE 处理：发起决斗邀请
function handleDuelInvite(io: Server, socket: Socket, msg: SocketMessage<DuelInvitePayload>): void {
  const { challengerId, defenderId } = msg.payload;

  const duel = createDuel(challengerId, defenderId);

  // 找到防守方的 socket
  const defenderSocket = memberSocketMap.get(defenderId);
  if (defenderSocket) {
    defenderSocket.emit('DUEL_INVITE_RECEIVED', {
      type: 'DUEL_INVITE_RECEIVED',
      payload: {
        duelId: duel.duel_id,
        challengerId,
        challengerName: getMemberById(challengerId)?.name
      },
      timestamp: Date.now()
    });
  }
}

// DUEL_ACCEPT 处理：接受决斗
function handleDuelAccept(io: Server, socket: Socket, msg: SocketMessage<{ duelId: string; defenderId: string }>): void {
  const { duelId } = msg.payload;

  const duel = getDuelById(duelId);
  if (duel) {
    // 广播决斗开始
    broadcastToDuelists(io, duel, 'DUEL_STARTED', {
      duelId,
      challengerId: duel.challenger_id,
      defenderId: duel.defender_id
    });
  }
}

// DUEL_REJECT 处理：拒绝决斗
function handleDuelReject(io: Server, socket: Socket, msg: SocketMessage<{ duelId: string; defenderId: string }>): void {
  const { duelId } = msg.payload;

  updateDuelResult(duelId, 'draw');
  const duel = getDuelById(duelId);

  if (duel) {
    // 通知挑战方
    const challengerSocket = memberSocketMap.get(duel.challenger_id);
    if (challengerSocket) {
      challengerSocket.emit('DUEL_REJECTED', {
        type: 'DUEL_REJECTED',
        payload: { duelId },
        timestamp: Date.now()
      });
    }
  }
}

// DUEL_ACTION 处理：决斗操作（简化版，完整战斗逻辑在计划3）
function handleDuelAction(io: Server, socket: Socket, msg: SocketMessage<DuelActionPayload>): void {
  const { duelId, memberId, action, skillId } = msg.payload;

  // 广播操作给双方
  const duel = getDuelById(duelId);
  if (duel) {
    broadcastToDuelists(io, duel, 'DUEL_ACTION_RECEIVED', {
      duelId,
      memberId,
      action,
      skillId
    });
  }
}

// MEMBER_UPDATE 处理：更新成员状态
function handleMemberUpdate(io: Server, socket: Socket, msg: SocketMessage<MemberUpdatePayload>): void {
  const { memberId, status } = msg.payload;

  updateMemberStatus(memberId, status);
  const member = getMemberById(memberId);

  if (member) {
    broadcastToFamily(io, member.family_id, 'MEMBER_STATUS_UPDATED', {
      memberId,
      status
    });
  }
}

// 断线处理
function handleDisconnect(io: Server, socket: Socket): void {
  const memberId = socketMemberMap.get(socket.id);

  if (memberId) {
    const member = getMemberById(memberId);
    if (member) {
      updateMemberStatus(memberId, 'offline');
      broadcastToFamily(io, member.family_id, 'MEMBER_STATUS_UPDATED', {
        memberId,
        status: 'offline'
      });
    }

    memberSocketMap.delete(memberId);
    socketMemberMap.delete(socket.id);
  }

  console.log('Client disconnected:', socket.id);
}

// 辅助函数：广播到家庭房间
function broadcastToFamily(io: Server, familyId: string, event: string, data: any): void {
  const payload: BroadcastPayload = { event, data };
  io.to(`family:${familyId}`).emit('BROADCAST', {
    type: 'BROADCAST',
    payload,
    timestamp: Date.now()
  });
}

// 辅助函数：广播到决斗双方
function broadcastToDuelists(io: Server, duel: any, event: string, data: any): void {
  const challengerSocket = memberSocketMap.get(duel.challenger_id);
  const defenderSocket = memberSocketMap.get(duel.defender_id);

  const message = { type: event, payload: data, timestamp: Date.now() };

  if (challengerSocket) challengerSocket.emit(event, message);
  if (defenderSocket) defenderSocket.emit(event, message);
}
```

- [ ] **Step 2: 修改 server/src/index.ts 注册 Socket handlers**

```typescript
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { join } from 'path';
import { initSqlJsEngine, initDatabase } from './db/database';
import { registerSocketHandlers } from './socket/handlers';
import routes from './routes';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// 中间件
app.use(cors());
app.use(express.json());

// 静态文件（生产环境托管前端构建结果）
const clientDistPath = join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// 注册 REST API 路由
app.use('/api', routes);

// 基础健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 注册 Socket.IO 事件处理器
registerSocketHandlers(io);

const PORT = process.env.PORT || 3000;

// 异步启动服务器
async function startServer() {
  try {
    await initSqlJsEngine();
    initDatabase();
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Local: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };
```

- [ ] **Step 3: 提交文件**

```bash
git add server/src/socket/handlers.ts server/src/index.ts
git commit -m "feat: add Socket.IO event handlers for real-time communication"
```

---

### Task 3: 创建 REST API 路由聚合文件

**Files:**
- Create: `server/src/routes/index.ts`

- [ ] **Step 1: 创建 routes/index.ts 聚合导出所有路由**

```typescript
import { Router } from 'express';
import familyRouter from './family';
import memberRouter from './member';
import beastRouter from './beast';
import taskRouter from './task';
import duelRouter from './duel';

const router = Router();

// 注册各模块路由
router.use('/family', familyRouter);
router.use('/member', memberRouter);
router.use('/beast', beastRouter);
router.use('/task', taskRouter);
router.use('/duel', duelRouter);

export default router;
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/routes/index.ts
git commit -m "feat: add REST API routes aggregator"
```

---

### Task 4: 创建家庭 API 路由

**Files:**
- Create: `server/src/routes/family.ts`

- [ ] **Step 1: 创建 routes/family.ts**

```typescript
import { Router } from 'express';
import { createFamily, getFamilyById, getFamilyByCode, getAllFamilies } from '../models/family';

const router = Router();

// 创建新家庭
router.post('/', (req, res) => {
  try {
    const family = createFamily();
    res.json({ success: true, data: family });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create family' });
  }
});

// 获取家庭信息
router.get('/:familyId', (req, res) => {
  try {
    const family = getFamilyById(req.params.familyId);
    if (family) {
      res.json({ success: true, data: family });
    } else {
      res.status(404).json({ success: false, message: 'Family not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get family' });
  }
});

// 通过家庭码查询
router.get('/code/:familyCode', (req, res) => {
  try {
    const family = getFamilyByCode(req.params.familyCode);
    if (family) {
      res.json({ success: true, data: family });
    } else {
      res.status(404).json({ success: false, message: 'Family code not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get family by code' });
  }
});

// 获取所有家庭（调试用）
router.get('/', (req, res) => {
  try {
    const families = getAllFamilies();
    res.json({ success: true, data: families });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get families' });
  }
});

export default router;
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/routes/family.ts
git commit -m "feat: add family REST API routes"
```

---

### Task 5: 创建成员 API 路由

**Files:**
- Create: `server/src/routes/member.ts`

- [ ] **Step 1: 创建 routes/member.ts**

```typescript
import { Router } from 'express';
import {
  createMember,
  getMemberById,
  getMembersByFamily,
  updateMemberStatus,
  updateMemberPoints,
  updateMemberBeast,
  deleteMember
} from '../models/member';

const router = Router();

// 创建成员
router.post('/', (req, res) => {
  try {
    const { familyId, name } = req.body;
    if (!familyId || !name) {
      return res.status(400).json({ success: false, message: 'Missing familyId or name' });
    }
    const member = createMember(familyId, name);
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create member' });
  }
});

// 获取成员信息
router.get('/:memberId', (req, res) => {
  try {
    const member = getMemberById(req.params.memberId);
    if (member) {
      res.json({ success: true, data: member });
    } else {
      res.status(404).json({ success: false, message: 'Member not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get member' });
  }
});

// 获取家庭所有成员
router.get('/family/:familyId', (req, res) => {
  try {
    const members = getMembersByFamily(req.params.familyId);
    res.json({ success: true, data: members });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get members' });
  }
});

// 更新成员状态
router.patch('/:memberId/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }
    updateMemberStatus(req.params.memberId, status);
    const member = getMemberById(req.params.memberId);
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// 更新成员积分
router.patch('/:memberId/points', (req, res) => {
  try {
    const { points } = req.body;
    if (points === undefined) {
      return res.status(400).json({ success: false, message: 'Missing points' });
    }
    updateMemberPoints(req.params.memberId, points);
    const member = getMemberById(req.params.memberId);
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update points' });
  }
});

// 更新成员神兽
router.patch('/:memberId/beast', (req, res) => {
  try {
    const { beastId } = req.body;
    if (!beastId) {
      return res.status(400).json({ success: false, message: 'Missing beastId' });
    }
    updateMemberBeast(req.params.memberId, beastId);
    const member = getMemberById(req.params.memberId);
    res.json({ success: true, data: member });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update beast' });
  }
});

// 删除成员
router.delete('/:memberId', (req, res) => {
  try {
    deleteMember(req.params.memberId);
    res.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete member' });
  }
});

export default router;
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/routes/member.ts
git commit -m "feat: add member REST API routes"
```

---

### Task 6: 创建神兽 API 路由

**Files:**
- Create: `server/src/routes/beast.ts`

- [ ] **Step 1: 创建 routes/beast.ts**

```typescript
import { Router } from 'express';
import {
  createBeast,
  getBeastById,
  getBeastByMember,
  updateBeastStage,
  updateBeastSkills,
  updateBeastEp,
  calculateStage,
  getUnlockedSkillsCount,
  BeastType
} from '../models/beast';

const router = Router();

// 创建神兽
router.post('/', (req, res) => {
  try {
    const { memberId, beastType } = req.body;
    if (!memberId || !beastType) {
      return res.status(400).json({ success: false, message: 'Missing memberId or beastType' });
    }
    const validTypes: BeastType[] = ['qinglong', 'zhuque', 'baihu', 'xuanwu', 'qilin'];
    if (!validTypes.includes(beastType)) {
      return res.status(400).json({ success: false, message: 'Invalid beast type' });
    }
    const beast = createBeast(memberId, beastType);
    res.json({ success: true, data: beast });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create beast' });
  }
});

// 获取神兽信息
router.get('/:beastId', (req, res) => {
  try {
    const beast = getBeastById(req.params.beastId);
    if (beast) {
      res.json({ success: true, data: beast });
    } else {
      res.status(404).json({ success: false, message: 'Beast not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get beast' });
  }
});

// 获取成员的神兽
router.get('/member/:memberId', (req, res) => {
  try {
    const beast = getBeastByMember(req.params.memberId);
    if (beast) {
      res.json({ success: true, data: beast });
    } else {
      res.json({ success: true, data: null });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get beast' });
  }
});

// 更新神兽阶段
router.patch('/:beastId/stage', (req, res) => {
  try {
    const { stage } = req.body;
    if (stage === undefined) {
      return res.status(400).json({ success: false, message: 'Missing stage' });
    }
    updateBeastStage(req.params.beastId, stage);
    const beast = getBeastById(req.params.beastId);
    res.json({ success: true, data: beast });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update stage' });
  }
});

// 更新神兽技能
router.patch('/:beastId/skills', (req, res) => {
  try {
    const { skills } = req.body;
    if (!skills || !Array.isArray(skills)) {
      return res.status(400).json({ success: false, message: 'Missing or invalid skills' });
    }
    updateBeastSkills(req.params.beastId, skills);
    const beast = getBeastById(req.params.beastId);
    res.json({ success: true, data: beast });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update skills' });
  }
});

// 更新神兽能量
router.patch('/:beastId/ep', (req, res) => {
  try {
    const { ep } = req.body;
    if (ep === undefined) {
      return res.status(400).json({ success: false, message: 'Missing ep' });
    }
    updateBeastEp(req.params.beastId, ep);
    const beast = getBeastById(req.params.beastId);
    res.json({ success: true, data: beast });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update ep' });
  }
});

// 根据积分计算阶段
router.post('/calculate-stage', (req, res) => {
  try {
    const { totalPoints } = req.body;
    if (totalPoints === undefined) {
      return res.status(400).json({ success: false, message: 'Missing totalPoints' });
    }
    const stage = calculateStage(totalPoints);
    const skillsCount = getUnlockedSkillsCount(stage);
    res.json({ success: true, data: { stage, skillsCount } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to calculate stage' });
  }
});

export default router;
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/routes/beast.ts
git commit -m "feat: add beast REST API routes"
```

---

### Task 7: 创建任务 API 路由

**Files:**
- Create: `server/src/routes/task.ts`

- [ ] **Step 1: 创建 routes/task.ts**

```typescript
import { Router } from 'express';
import {
  createTask,
  getTaskById,
  getTasksByFamily,
  getTasksByStatus,
  updateTaskStatus,
  deleteTask,
  TaskStatus
} from '../models/task';

const router = Router();

// 创建任务
router.post('/', (req, res) => {
  try {
    const { familyId, name, points, creatorId, isCustom } = req.body;
    if (!familyId || !name || points === undefined || !creatorId) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const task = createTask(familyId, name, points, creatorId, isCustom || false);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create task' });
  }
});

// 获取任务信息
router.get('/:taskId', (req, res) => {
  try {
    const task = getTaskById(req.params.taskId);
    if (task) {
      res.json({ success: true, data: task });
    } else {
      res.status(404).json({ success: false, message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get task' });
  }
});

// 获取家庭所有任务
router.get('/family/:familyId', (req, res) => {
  try {
    const tasks = getTasksByFamily(req.params.familyId);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get tasks' });
  }
});

// 获取家庭特定状态的任务
router.get('/family/:familyId/status/:status', (req, res) => {
  try {
    const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'pending_confirmation', 'completed'];
    const status = req.params.status as TaskStatus;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const tasks = getTasksByStatus(req.params.familyId, status);
    res.json({ success: true, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get tasks' });
  }
});

// 更新任务状态
router.patch('/:taskId/status', (req, res) => {
  try {
    const { status, executorId, confirmedBy } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Missing status' });
    }
    const validStatuses: TaskStatus[] = ['pending', 'in_progress', 'pending_confirmation', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    updateTaskStatus(req.params.taskId, status, executorId, confirmedBy);
    const task = getTaskById(req.params.taskId);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update task status' });
  }
});

// 删除任务
router.delete('/:taskId', (req, res) => {
  try {
    deleteTask(req.params.taskId);
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete task' });
  }
});

export default router;
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/routes/task.ts
git commit -m "feat: add task REST API routes"
```

---

### Task 8: 创建决斗 API 路由

**Files:**
- Create: `server/src/routes/duel.ts`

- [ ] **Step 1: 创建 routes/duel.ts**

```typescript
import { Router } from 'express';
import {
  createDuel,
  getDuelById,
  getDuelsByMember,
  getOngoingDuels,
  updateDuelResult,
  incrementDuelRounds,
  DuelResult
} from '../models/duel';

const router = Router();

// 创建决斗
router.post('/', (req, res) => {
  try {
    const { challengerId, defenderId } = req.body;
    if (!challengerId || !defenderId) {
      return res.status(400).json({ success: false, message: 'Missing challengerId or defenderId' });
    }
    const duel = createDuel(challengerId, defenderId);
    res.json({ success: true, data: duel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create duel' });
  }
});

// 获取决斗信息
router.get('/:duelId', (req, res) => {
  try {
    const duel = getDuelById(req.params.duelId);
    if (duel) {
      res.json({ success: true, data: duel });
    } else {
      res.status(404).json({ success: false, message: 'Duel not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get duel' });
  }
});

// 获取成员的决斗记录
router.get('/member/:memberId', (req, res) => {
  try {
    const duels = getDuelsByMember(req.params.memberId);
    res.json({ success: true, data: duels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get duels' });
  }
});

// 获取所有进行中的决斗
router.get('/ongoing', (req, res) => {
  try {
    const duels = getOngoingDuels();
    res.json({ success: true, data: duels });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get ongoing duels' });
  }
});

// 更新决斗结果
router.patch('/:duelId/result', (req, res) => {
  try {
    const { result, winnerId, rounds } = req.body;
    if (!result) {
      return res.status(400).json({ success: false, message: 'Missing result' });
    }
    const validResults: DuelResult[] = ['ongoing', 'challenger_win', 'defender_win', 'draw'];
    if (!validResults.includes(result)) {
      return res.status(400).json({ success: false, message: 'Invalid result' });
    }
    updateDuelResult(req.params.duelId, result, winnerId, rounds);
    const duel = getDuelById(req.params.duelId);
    res.json({ success: true, data: duel });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update duel result' });
  }
});

// 增加决斗回合数
router.patch('/:duelId/rounds/increment', (req, res) => {
  try {
    const newRounds = incrementDuelRounds(req.params.duelId);
    res.json({ success: true, data: { rounds: newRounds } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to increment rounds' });
  }
});

export default router;
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/routes/duel.ts
git commit -m "feat: add duel REST API routes"
```

---

### Task 9: 运行项目验证 API 和 Socket

**Files:**
- 无新文件，验证现有实现

- [ ] **Step 1: 安装依赖**

```bash
cd D:/Development/game/housework_beast/server && npm install
```

预期：依赖安装成功，无报错

- [ ] **Step 2: 启动后端服务器**

```bash
cd D:/Development/game/housework_beast/server && npm run dev
```

预期：
- sql.js engine initialized
- Database initialized successfully
- Server running on port 3000

- [ ] **Step 3: 测试 REST API 端点**

```bash
# 健康检查
curl http://localhost:3000/api/health

# 创建家庭
curl -X POST http://localhost:3000/api/family -H "Content-Type: application/json"

# 创建成员
curl -X POST http://localhost:3000/api/member -H "Content-Type: application/json" -d '{"familyId":"<family_id>","name":"测试成员"}'

# 创建神兽
curl -X POST http://localhost:3000/api/beast -H "Content-Type: application/json" -d '{"memberId":"<member_id>","beastType":"qinglong"}'

# 创建任务
curl -X POST http://localhost:3000/api/task -H "Content-Type: application/json" -d '{"familyId":"<family_id>","name":"扫地","points":10,"creatorId":"<member_id>"}'

# 获取家庭任务
curl http://localhost:3000/api/task/family/<family_id>
```

预期：所有 API 返回 `{ success: true, data: ... }` 格式响应

- [ ] **Step 4: 提交验证完成**

```bash
git add -A
git commit -m "chore: verify plan2 implementation - REST API and Socket.IO working"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ HELLO/HELLO_ACK 事件处理（加入家庭）
- ✅ SYNC_REQUEST/SYNC_DATA（数据同步）
- ✅ TASK_CREATE/TASK_UPDATE（任务创建和状态变更）
- ✅ DUEL_INVITE/DUEL_ACCEPT/DUEL_REJECT/DUEL_ACTION（决斗邀请和操作）
- ✅ MEMBER_UPDATE（成员状态更新）
- ✅ HEARTBEAT（心跳保持）
- ✅ BROADCAST（广播变更通知）
- ✅ REST API CRUD for family/member/beast/task/duel

**2. Placeholder scan:**
- 无 TBD/TODO 占位符
- 所有代码完整

**3. Type consistency:**
- SocketMessage<T> 泛型格式统一
- payload 接口命名一致（HelloPayload, TaskCreatePayload 等）
- Model 导入路径正确（../models/family 等）