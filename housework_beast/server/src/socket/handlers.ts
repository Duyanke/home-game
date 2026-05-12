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
import {
  initBattle,
  getActiveBattle,
  endBattle,
  executeAttack,
  executeSkill,
  executeDefend,
  checkBattleEnd,
  endRound
} from '../game/battle-engine';
import { determineOrder, BattleBeastState, BattleResult } from '../game/battle-state';
import { addPointsAndCheckGrowth, DUEL_REWARDS } from '../game/growth';
import { DuelResult } from '../models/duel';

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
    // 如果任务完成，给执行者加积分并检查成长
    if (status === 'completed' && task.executor_id) {
      const member = getMemberById(task.executor_id);
      if (member) {
        // 使用成长逻辑模块处理积分和成长
        const growthResult = addPointsAndCheckGrowth(task.executor_id, task.points);

        // 广播积分更新
        broadcastToFamily(io, member.family_id, 'MEMBER_POINTS_UPDATED', {
          memberId: task.executor_id,
          newPoints: growthResult.newTotalPoints
        });

        // 如果阶段提升，广播成长消息
        if (growthResult.stageChanged) {
          broadcastToFamily(io, member.family_id, 'BEAST_STAGE_UP', {
            memberId: task.executor_id,
            newStage: growthResult.newStage,
            newSkills: growthResult.newSkills
          });
        }
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
    try {
      // 初始化战斗状态
      const { challengerState, defenderState } = initBattle(duelId, duel.challenger_id, duel.defender_id);

      // 确定行动顺序
      const order = determineOrder(challengerState, defenderState);

      // 广播决斗开始，包含双方状态和行动顺序
      broadcastToDuelists(io, duel, 'DUEL_STARTED', {
        duelId,
        challengerId: duel.challenger_id,
        defenderId: duel.defender_id,
        challengerState,
        defenderState,
        firstActor: order.first,
        currentRound: 1,
        waitingFor: order.first
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to init battle';
      socket.emit('ERROR', { type: 'ERROR', payload: { message: errorMsg }, timestamp: Date.now() });
    }
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

// DUEL_ACTION 处理：决斗操作
function handleDuelAction(io: Server, socket: Socket, msg: SocketMessage<DuelActionPayload>): void {
  const { duelId, memberId, action, skillId } = msg.payload;

  const duel = getDuelById(duelId);
  if (!duel) {
    socket.emit('ERROR', { type: 'ERROR', payload: { message: 'Duel not found' }, timestamp: Date.now() });
    return;
  }

  // 确定行动方
  const actor: 'challenger' | 'defender' = memberId === duel.challenger_id ? 'challenger' : 'defender';

  let actionResult: any;

  try {
    switch (action) {
      case 'attack':
        actionResult = executeAttack(duelId, actor);
        break;
      case 'skill':
        if (!skillId) throw new Error('Skill ID required for skill action');
        actionResult = executeSkill(duelId, actor, skillId);
        break;
      case 'defend':
        actionResult = executeDefend(duelId, actor);
        break;
      case 'surrender':
        // 投降处理
        const surrenderResult: BattleResult = {
          duelId,
          winner: actor === 'challenger' ? 'defender' : 'challenger',
          winnerId: actor === 'challenger' ? duel.defender_id : duel.challenger_id,
          finalRound: getActiveBattle(duelId)?.currentRound || 0,
          challengerFinalHp: 0,
          defenderFinalHp: 0
        };
        handleBattleEnd(io, duel, surrenderResult, true);
        return;
    }

    // 广播行动结果
    broadcastToDuelists(io, duel, 'DUEL_ACTION_RESULT', {
      duelId,
      action: actionResult,
      actor: memberId
    });

    // 检查战斗结束
    const battleEnd = checkBattleEnd(duelId);
    if (battleEnd) {
      handleBattleEnd(io, duel, battleEnd, false);
    } else {
      // 获取当前战斗状态
      const battle = getActiveBattle(duelId);
      if (battle) {
        endRound(duelId);

        // 重新确定行动顺序
        const order = determineOrder(battle.challengerState, battle.defenderState);

        // 广播回合结束和新回合开始
        broadcastToDuelists(io, duel, 'ROUND_ENDED', {
          duelId,
          currentRound: battle.currentRound,
          challengerState: battle.challengerState,
          defenderState: battle.defenderState,
          nextFirstActor: order.first
        });
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Action failed';
    socket.emit('ERROR', { type: 'ERROR', payload: { message: errorMsg }, timestamp: Date.now() });
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

// 处理战斗结束
function handleBattleEnd(io: Server, duel: any, result: BattleResult, isSurrender: boolean): void {
  // 更新决斗结果
  const duelResult: DuelResult = result.winner === 'challenger' ? 'challenger_win'
    : result.winner === 'defender' ? 'defender_win'
    : 'draw';

  updateDuelResult(duel.duel_id, duelResult, result.winnerId, result.finalRound);

  // 计算奖励
  const winnerId = result.winnerId;

  if (winnerId) {
    // 获胜奖励
    const reward = isSurrender ? DUEL_REWARDS.surrender : DUEL_REWARDS.win;
    const growthResult = addPointsAndCheckGrowth(winnerId, reward);

    // 广播获胜和成长更新
    broadcastToDuelists(io, duel, 'DUEL_ENDED', {
      duelId: duel.duel_id,
      result: duelResult,
      winnerId,
      winnerReward: reward,
      growthUpdate: growthResult
    });

    // 广播积分更新到家庭
    const winnerMember = getMemberById(winnerId);
    if (winnerMember) {
      broadcastToFamily(io, winnerMember.family_id, 'MEMBER_POINTS_UPDATED', {
        memberId: winnerId,
        newPoints: growthResult.newTotalPoints
      });

      // 如果阶段提升，广播成长消息
      if (growthResult.stageChanged) {
        broadcastToFamily(io, winnerMember.family_id, 'BEAST_STAGE_UP', {
          memberId: winnerId,
          newStage: growthResult.newStage,
          newSkills: growthResult.newSkills
        });
      }
    }
  } else {
    // 平局
    const drawReward = DUEL_REWARDS.draw;
    const challengerGrowth = addPointsAndCheckGrowth(duel.challenger_id, drawReward);
    const defenderGrowth = addPointsAndCheckGrowth(duel.defender_id, drawReward);

    broadcastToDuelists(io, duel, 'DUEL_ENDED', {
      duelId: duel.duel_id,
      result: 'draw',
      reward: drawReward,
      challengerGrowth,
      defenderGrowth
    });
  }

  // 清理战斗状态
  endBattle(duel.duel_id);
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