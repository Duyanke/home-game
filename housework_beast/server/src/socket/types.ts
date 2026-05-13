// Socket 事件类型定义
export type SocketEventType =
  | 'HELLO'           // 客户端加入家庭
  | 'HELLO_ACK'       // 服务器确认加入
  | 'REJOIN'          // 恢复登录（重连时使用）
  | 'REJOIN_ACK'      // 恢复登录确认
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
  familyCode?: string;
  memberId?: string;
  message?: string;
}

export interface RejoinPayload {
  memberId: string;
  familyId: string;
}

export interface RejoinAckPayload {
  success: boolean;
  familyId?: string;
  familyCode?: string;
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