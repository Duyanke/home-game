// server/src/game/battle-state.ts

import { Beast } from '../models/beast';

// 战斗中的神兽状态（包含临时buff效果）
export interface BattleBeastState {
  beastId: string;
  memberId: string;
  beastType: string;

  // 当前战斗属性
  currentHp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  currentEp: number;
  maxEp: number;

  // 临时效果
  defenseBoost: number;
  damageReduce: number;
  immune: boolean;
  counter: number;
  statsBoost: number;
  statsBoostTurns: number;

  // 阶段加成
  powerBonus: number;

  // 已解锁技能
  unlockedSkills: string[];

  // 防御姿态
  isDefending: boolean;

  // 复活标记
  hasRevive: boolean;
}

// 战斗回合状态
export interface BattleRoundState {
  roundNumber: number;
  duelId: string;
  challenger: BattleBeastState;
  defender: BattleBeastState;
  firstActor: 'challenger' | 'defender';
  secondActor: 'challenger' | 'defender';
  waitingFor: 'challenger' | 'defender' | 'both';
  actions: BattleAction[];
}

// 战斗行动记录
export interface BattleAction {
  actor: 'challenger' | 'defender';
  actionType: 'attack' | 'skill' | 'defend' | 'surrender';
  skillId?: string;
  damage?: number;
  heal?: number;
  effect?: string;
  targetHp?: number;
}

// 战斗结果
export interface BattleResult {
  duelId: string;
  winner: 'challenger' | 'defender' | 'draw';
  winnerId?: string;
  finalRound: number;
  challengerFinalHp: number;
  defenderFinalHp: number;
}

// 从神兽数据创建战斗状态
export function createBattleState(beast: Beast, memberId: string, powerBonus: number): BattleBeastState {
  const statsMultiplier = 1 + (beast.stage > 1 ? 0.1 * (beast.stage - 1) : 0);

  return {
    beastId: beast.beast_id,
    memberId,
    beastType: beast.beast_type,
    currentHp: beast.hp,
    maxHp: beast.hp,
    atk: Math.floor(beast.atk * statsMultiplier),
    def: Math.floor(beast.def * statsMultiplier),
    spd: Math.floor(beast.spd * statsMultiplier),
    currentEp: beast.ep,
    maxEp: 200,
    defenseBoost: 0,
    damageReduce: 0,
    immune: false,
    counter: 0,
    statsBoost: 0,
    statsBoostTurns: 0,
    powerBonus,
    unlockedSkills: beast.unlocked_skills,
    isDefending: false,
    hasRevive: false
  };
}

// 确定行动顺序
export function determineOrder(challenger: BattleBeastState, defender: BattleBeastState): {
  first: 'challenger' | 'defender';
  second: 'challenger' | 'defender';
} {
  const challengerSpd = challenger.spd * (1 + challenger.statsBoost);
  const defenderSpd = defender.spd * (1 + defender.statsBoost);

  if (challengerSpd > defenderSpd) {
    return { first: 'challenger', second: 'defender' };
  } else if (defenderSpd > challengerSpd) {
    return { first: 'defender', second: 'challenger' };
  } else {
    return Math.random() < 0.5
      ? { first: 'challenger', second: 'defender' }
      : { first: 'defender', second: 'challenger' };
  }
}

// 清除回合临时效果
export function clearRoundEffects(state: BattleBeastState): void {
  state.isDefending = false;
  state.immune = false;

  if (state.statsBoostTurns > 0) {
    state.statsBoostTurns--;
    if (state.statsBoostTurns === 0) {
      state.statsBoost = 0;
    }
  }
}

// EP 每回合恢复
export function recoverEp(state: BattleBeastState, amount: number = 10): void {
  state.currentEp = Math.min(state.currentEp + amount, state.maxEp);
}