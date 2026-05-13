import { Server, Socket } from 'socket.io';
import {
  SocketEventType,
  SocketMessage,
  HelloPayload,
  HelloAckPayload,
  RejoinPayload,
  RejoinAckPayload,
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
  updateMemberPoints,
  updateMemberBeast
} from '../models/member';
import {
  createBeast,
  getBeastByMember,
  getBeastById,
  deleteBeastByMember
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
import { addPointsAndCheckGrowth } from '../game/growth';
import { DUEL_REWARDS } from '../game/constants';
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

    // REJOIN: 恢复登录（重连时使用）
    socket.on('REJOIN', (msg: SocketMessage<RejoinPayload>) => {
      handleRejoin(io, socket, msg);
    });

    // SYNC_REQUEST: 请求数据同步
    socket.on('SYNC_REQUEST', (msg: SocketMessage<SyncRequestPayload>) => {
      handleSyncRequest(socket, msg);
    });

    // SELECT_BEAST: 选择神兽
    socket.on('SELECT_BEAST', (msg: SocketMessage<{ beastType: string; memberId: string }>) => {
      handleSelectBeast(io, socket, msg);
    });

    // TASK_CREATE: 创建任务
    socket.on('TASK_CREATE', (msg: SocketMessage<TaskCreatePayload>) => {
      handleTaskCreate(io, socket, msg);
    });

    // TASK_CLAIM: 领取任务
    socket.on('TASK_CLAIM', (msg: SocketMessage<{ taskId: string; memberId: string }>) => {
      handleTaskClaim(io, socket, msg);
    });

    // TASK_COMPLETE: 完成任务
    socket.on('TASK_COMPLETE', (msg: SocketMessage<{ taskId: string; memberId: string }>) => {
      handleTaskComplete(io, socket, msg);
    });

    // CONFIRM_TASK: 确认任务
    socket.on('CONFIRM_TASK', (msg: SocketMessage<{ taskId: string; memberId: string }>) => {
      handleTaskConfirm(io, socket, msg);
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
  console.log('[HELLO] Received from socket:', socket.id, 'familyCode:', familyCode, 'memberName:', memberName);

  // 尝试查找现有家庭
  let family = getFamilyByCode(familyCode);

  // 如果家庭不存在，创建新家庭
  if (!family) {
    family = createFamily();
    console.log('[HELLO] Created new family:', family.family_code);
  }

  // 创建成员
  const member = createMember(family.family_id, memberName);
  updateMemberStatus(member.member_id, 'online');
  console.log('[HELLO] Created member:', member.member_id, 'name:', member.name);

  // 存储映射关系
  memberSocketMap.set(member.member_id, socket);
  socketMemberMap.set(socket.id, member.member_id);
  console.log('[HELLO] socketMemberMap set:', socket.id, '->', member.member_id);
  console.log('[HELLO] Current socketMemberMap size:', socketMemberMap.size);

  // 加入家庭房间
  socket.join(`family:${family.family_id}`);

  // 发送确认（包含家庭码）
  const ackPayload: HelloAckPayload = {
    success: true,
    familyId: family.family_id,
    familyCode: family.family_code,
    memberId: member.member_id
  };

  socket.emit('HELLO_ACK', {
    type: 'HELLO_ACK',
    payload: ackPayload,
    timestamp: Date.now()
  });
  console.log('[HELLO] Sent HELLO_ACK to socket:', socket.id);

  // 广播新成员加入
  broadcastToFamily(io, family.family_id, 'MEMBER_JOINED', {
    memberId: member.member_id,
    memberName: member.name
  });
}

// REJOIN 处理：恢复登录
function handleRejoin(io: Server, socket: Socket, msg: SocketMessage<RejoinPayload>): void {
  const { memberId, familyId } = msg.payload;
  console.log('[REJOIN] Received from socket:', socket.id, 'memberId:', memberId, 'familyId:', familyId);

  // 验证成员是否存在
  const member = getMemberById(memberId);
  if (!member) {
    console.log('[REJOIN] ERROR: member not found');
    socket.emit('REJOIN_ACK', {
      type: 'REJOIN_ACK',
      payload: { success: false, message: '成员不存在' },
      timestamp: Date.now()
    });
    return;
  }

  // 验证家庭是否存在
  const family = getFamilyById(familyId);
  if (!family) {
    console.log('[REJOIN] ERROR: family not found');
    socket.emit('REJOIN_ACK', {
      type: 'REJOIN_ACK',
      payload: { success: false, message: '家庭不存在' },
      timestamp: Date.now()
    });
    return;
  }

  // 更新成员状态
  updateMemberStatus(memberId, 'online');

  // 存储映射关系
  memberSocketMap.set(memberId, socket);
  socketMemberMap.set(socket.id, memberId);
  console.log('[REJOIN] socketMemberMap set:', socket.id, '->', memberId);

  // 加入家庭房间
  socket.join(`family:${familyId}`);

  // 发送确认
  const ackPayload: RejoinAckPayload = {
    success: true,
    familyId: family.family_id,
    familyCode: family.family_code,
    memberId: member.member_id
  };

  socket.emit('REJOIN_ACK', {
    type: 'REJOIN_ACK',
    payload: ackPayload,
    timestamp: Date.now()
  });
  console.log('[REJOIN] Sent REJOIN_ACK to socket:', socket.id);

  // 广播成员上线
  broadcastToFamily(io, familyId, 'MEMBER_STATUS_UPDATED', {
    memberId,
    status: 'online'
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
  console.log('[TASK_CREATE] Received from socket:', socket.id);
  console.log('[TASK_CREATE] Payload:', msg.payload);

  const memberId = socketMemberMap.get(socket.id);
  console.log('[TASK_CREATE] memberId from socketMemberMap:', memberId);

  if (!memberId) {
    console.log('[TASK_CREATE] ERROR: memberId not found in socketMemberMap');
    socket.emit('ERROR', { type: 'ERROR', payload: { message: '未找到成员信息' }, timestamp: Date.now() });
    return;
  }

  const member = getMemberById(memberId);
  if (!member) {
    console.log('[TASK_CREATE] ERROR: member not found in database');
    socket.emit('ERROR', { type: 'ERROR', payload: { message: '成员不存在' }, timestamp: Date.now() });
    return;
  }

  const { name, points, isCustom } = msg.payload;
  const familyId = member.family_id;
  console.log('[TASK_CREATE] Creating task:', name, 'points:', points, 'familyId:', familyId);

  const task = createTask(familyId, name, points, memberId, isCustom);
  console.log('[TASK_CREATE] Created task:', task.task_id);

  // 转换为前端格式
  const frontendTask = {
    id: task.task_id,
    name: task.name,
    points: task.points,
    status: task.status,
    createdBy: task.creator_id,
    claimedBy: task.executor_id,
    confirmedBy: task.confirmed_by,
    isCustom: task.is_custom,
    createdAt: task.created_at
  };

  broadcastToFamily(io, familyId, 'TASK_CREATED', frontendTask);
  console.log('[TASK_CREATE] Broadcasted TASK_CREATED to family:', familyId);
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
  console.log('[DUEL_INVITE] challengerId:', challengerId, 'defenderId:', defenderId);

  const duel = createDuel(challengerId, defenderId);
  console.log('[DUEL_INVITE] Created duel:', duel.duel_id);

  // 找到防守方的 socket
  const defenderSocket = memberSocketMap.get(defenderId);
  console.log('[DUEL_INVITE] defenderSocket found:', !!defenderSocket);

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
    console.log('[DUEL_INVITE] Sent DUEL_INVITE_RECEIVED to defender');
  }
}

// DUEL_ACCEPT 处理：接受决斗
function handleDuelAccept(io: Server, socket: Socket, msg: SocketMessage<{ duelId: string; defenderId: string }>): void {
  const { duelId, defenderId } = msg.payload;
  console.log('[DUEL_ACCEPT] duelId:', duelId, 'defenderId:', defenderId);

  const duel = getDuelById(duelId);
  console.log('[DUEL_ACCEPT] duel found:', !!duel);

  if (duel) {
    try {
      // 初始化战斗状态
      const { challengerState, defenderState } = initBattle(duelId, duel.challenger_id, duel.defender_id);
      console.log('[DUEL_ACCEPT] Battle initialized');
      console.log('[DUEL_ACCEPT] challengerState:', challengerState);
      console.log('[DUEL_ACCEPT] defenderState:', defenderState);

      // 确定行动顺序
      const order = determineOrder(challengerState, defenderState);
      console.log('[DUEL_ACCEPT] order:', order);

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
      console.log('[DUEL_ACCEPT] DUEL_STARTED broadcasted');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to init battle';
      console.log('[DUEL_ACCEPT] ERROR:', errorMsg);
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
  console.log('[DUEL_ACTION] Received:', msg.payload);
  const { duelId, memberId, action, skillId } = msg.payload;

  const duel = getDuelById(duelId);
  console.log('[DUEL_ACTION] duel found:', !!duel);

  if (!duel) {
    console.log('[DUEL_ACTION] ERROR: Duel not found');
    socket.emit('ERROR', { type: 'ERROR', payload: { message: 'Duel not found' }, timestamp: Date.now() });
    return;
  }

  // 确定行动方
  const actor: 'challenger' | 'defender' = memberId === duel.challenger_id ? 'challenger' : 'defender';
  console.log('[DUEL_ACTION] actor:', actor, 'action:', action);

  let actionResult: any;

  try {
    switch (action) {
      case 'attack':
        actionResult = executeAttack(duelId, actor);
        console.log('[DUEL_ACTION] attack result:', actionResult);
        break;
      case 'skill':
        if (!skillId) throw new Error('Skill ID required for skill action');
        actionResult = executeSkill(duelId, actor, skillId);
        console.log('[DUEL_ACTION] skill result:', actionResult);
        break;
      case 'defend':
        actionResult = executeDefend(duelId, actor);
        console.log('[DUEL_ACTION] defend result:', actionResult);
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

// SELECT_BEAST 处理：选择神兽（支持更换）
function handleSelectBeast(io: Server, socket: Socket, msg: SocketMessage<{ beastType: string; memberId: string }>): void {
  console.log('[SELECT_BEAST] Received from socket:', socket.id);
  console.log('[SELECT_BEAST] Payload:', msg.payload);
  console.log('[SELECT_BEAST] socketMemberMap size:', socketMemberMap.size);

  const memberId = socketMemberMap.get(socket.id);
  console.log('[SELECT_BEAST] memberId from socketMemberMap:', memberId);

  if (!memberId) {
    console.log('[SELECT_BEAST] ERROR: memberId not found in socketMemberMap');
    socket.emit('ERROR', { type: 'ERROR', payload: { message: '未找到成员信息' }, timestamp: Date.now() });
    return;
  }

  const member = getMemberById(memberId);
  if (!member) {
    console.log('[SELECT_BEAST] ERROR: member not found in database');
    socket.emit('ERROR', { type: 'ERROR', payload: { message: '成员不存在' }, timestamp: Date.now() });
    return;
  }

  // 类型映射：前端英文 -> 后端中文拼音
  const typeMap: Record<string, string> = {
    dragon: 'qinglong',
    phoenix: 'zhuque',
    tiger: 'baihu',
    turtle: 'xuanwu',
    kirin: 'qilin'
  };

  const { beastType } = msg.payload;
  const backendType = typeMap[beastType] || beastType;
  console.log('[SELECT_BEAST] beastType:', beastType, '-> backendType:', backendType);

  // 检查是否已有神兽，如果有则删除（支持更换）
  const existingBeast = getBeastByMember(memberId);
  if (existingBeast) {
    console.log('[SELECT_BEAST] Member already has beast, deleting old beast:', existingBeast.beast_id);
    deleteBeastByMember(memberId);
  }

  // 创建新神兽
  const beast = createBeast(memberId, backendType as any);
  console.log('[SELECT_BEAST] Created new beast:', beast.beast_id);

  // 更新成员的神兽关联
  updateMemberBeast(memberId, beast.beast_id);
  console.log('[SELECT_BEAST] Updated member beast_id:', memberId, '->', beast.beast_id);

  // 发送确认
  socket.emit('BEAST_SELECTED', {
    type: 'BEAST_SELECTED',
    payload: {
      success: true,
      beast: {
        id: beast.beast_id,
        memberId: beast.member_id,
        type: beastType, // 返回前端使用的英文类型
        stage: beast.stage,
        stats: { hp: beast.hp, atk: beast.atk, def: beast.def, spd: beast.spd },
        skills: beast.unlocked_skills,
        growthPoints: 0
      }
    },
    timestamp: Date.now()
  });
  console.log('[SELECT_BEAST] Sent BEAST_SELECTED to socket:', socket.id);

  // 广播神兽创建
  broadcastToFamily(io, member.family_id, 'BEAST_CREATED', {
    memberId,
    beastType,
    beastId: beast.beast_id
  });
}

// TASK_CLAIM 处理：领取任务
function handleTaskClaim(io: Server, socket: Socket, msg: SocketMessage<{ taskId: string; memberId: string }>): void {
  const memberId = socketMemberMap.get(socket.id);
  if (!memberId) return;

  const { taskId } = msg.payload;
  const task = getTaskById(taskId);
  if (!task) return;

  updateTaskStatus(taskId, 'in_progress', memberId);
  const updatedTask = getTaskById(taskId);

  if (updatedTask) {
    broadcastToFamily(io, task.family_id, 'TASK_UPDATED', updatedTask);
  }
}

// TASK_COMPLETE 处理：完成任务
function handleTaskComplete(io: Server, socket: Socket, msg: SocketMessage<{ taskId: string; memberId: string }>): void {
  const memberId = socketMemberMap.get(socket.id);
  if (!memberId) return;

  const { taskId } = msg.payload;
  const task = getTaskById(taskId);
  if (!task) return;

  // 标记为已完成
  updateTaskStatus(taskId, 'completed');
  const updatedTask = getTaskById(taskId);

  if (updatedTask) {
    broadcastToFamily(io, task.family_id, 'TASK_UPDATED', updatedTask);
  }
}

// CONFIRM_TASK 处理：确认任务
function handleTaskConfirm(io: Server, socket: Socket, msg: SocketMessage<{ taskId: string; memberId: string }>): void {
  const memberId = socketMemberMap.get(socket.id);
  if (!memberId) return;

  const { taskId } = msg.payload;
  const task = getTaskById(taskId);
  if (!task) return;

  // 确认任务
  updateTaskStatus(taskId, 'confirmed', undefined, memberId);
  const updatedTask = getTaskById(taskId);

  if (updatedTask && updatedTask.executor_id) {
    // 给执行者加积分
    const growthResult = addPointsAndCheckGrowth(updatedTask.executor_id, task.points);

    // 广播任务更新
    broadcastToFamily(io, task.family_id, 'TASK_UPDATED', updatedTask);

    // 广播积分更新
    broadcastToFamily(io, task.family_id, 'MEMBER_POINTS_UPDATED', {
      memberId: updatedTask.executor_id,
      newPoints: growthResult.newTotalPoints
    });

    // 如果阶段提升
    if (growthResult.stageChanged) {
      broadcastToFamily(io, task.family_id, 'BEAST_STAGE_UP', {
        memberId: updatedTask.executor_id,
        newStage: growthResult.newStage,
        newSkills: growthResult.newSkills
      });
    }
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