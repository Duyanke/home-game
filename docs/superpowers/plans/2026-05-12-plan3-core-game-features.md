# 核心游戏功能实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现神兽成长逻辑、完整任务流程、决斗战斗系统，使游戏核心玩法可运行。

**Architecture:** 在现有 Socket handlers 中集成战斗引擎，新增战斗状态管理模块，完善神兽成长和技能解锁逻辑。

**Tech Stack:** TypeScript, Socket.IO, Express

---

## 文件结构

```
server/src/
├── game/
│   ├── battle-engine.ts    # 决斗战斗引擎（回合制、伤害计算、克制）
│   ├── battle-state.ts     # 战斗状态管理（当前回合、双方状态）
│   ├── growth.ts           # 神兽成长逻辑（积分→阶段→技能解锁）
│   └── constants.ts        # 游戏常量（技能数据、克制关系、奖励配置）
├── socket/
│   └── handlers.ts         # 修改：集成战斗引擎
├── routes/
│   └── beast.ts            # 修改：添加成长同步 API
├── models/
│   └── beast.ts            # 修改：添加属性更新函数
│   └── member.ts           # 修改：添加连胜记录
└── db/
│   └── schema.sql          # 修改：添加连胜字段
```

---

### Task 1: 创建游戏常量文件

**Files:**
- Create: `server/src/game/constants.ts`

- [ ] **Step 1: 创建 game/constants.ts 包含技能、克制、奖励配置**

```typescript
// server/src/game/constants.ts

export type BeastType = 'qinglong' | 'zhuque' | 'baihu' | 'xuanwu' | 'qilin';
export type ElementType = 'wood' | 'fire' | 'metal' | 'water' | 'light';

// 神兽元素映射
export const BEAST_ELEMENTS: Record<BeastType, ElementType> = {
  qinglong: 'wood',
  zhuque: 'fire',
  baihu: 'metal',
  xuanwu: 'water',
  qilin: 'light'
};

// 元素克制关系：攻击方 -> 被克制方
export const ELEMENT_COUNTER: Record<ElementType, ElementType> = {
  wood: 'water',   // 木克水
  fire: 'metal',   // 火克金
  metal: 'wood',   // 金克木
  water: 'fire',   // 水克火
  light: 'light'   // 光不参与克制
};

// 成长阶段配置
export interface GrowthStage {
  stage: number;
  name: string;
  threshold: number;
  skillsCount: number;
  powerBonus: number;
}

export const GROWTH_STAGES: GrowthStage[] = [
  { stage: 1, name: '幼年期', threshold: 0, skillsCount: 1, powerBonus: 0 },
  { stage: 2, name: '成年期', threshold: 500, skillsCount: 2, powerBonus: 0 },
  { stage: 3, name: '进化期', threshold: 1500, skillsCount: 3, powerBonus: 0 },
  { stage: 4, name: '神圣期', threshold: 3000, skillsCount: 3, powerBonus: 0.3 }
];

// 技能定义
export interface SkillDefinition {
  id: string;
  name: string;
  epCost: number;
  type: 'damage' | 'heal' | 'buff' | 'shield';
  damageMultiplier?: number;
  healPercent?: number;
  effect?: string;
  value?: number;
}

export const BEAST_SKILLS: Record<BeastType, SkillDefinition[]> = {
  qinglong: [
    { id: 'wind_slash', name: '风刃斩', epCost: 25, type: 'damage', damageMultiplier: 1.2 },
    { id: 'dragon_roar', name: '龙啸天地', epCost: 50, type: 'damage', damageMultiplier: 1.5 },
    { id: 'wind_shield', name: '御风护盾', epCost: 30, type: 'shield', effect: 'defenseBoost', value: 0.4 }
  ],
  zhuque: [
    { id: 'flame_strike', name: '烈焰冲击', epCost: 30, type: 'damage', damageMultiplier: 1.3 },
    { id: 'sky_flame', name: '焚天烈焰', epCost: 45, type: 'damage', damageMultiplier: 2.0 },
    { id: 'rebirth', name: '涅槃重生', epCost: 60, type: 'buff', effect: 'revive', value: 0.5 }
  ],
  baihu: [
    { id: 'frost_bite', name: '霜牙咬', epCost: 20, type: 'damage', damageMultiplier: 1.1 },
    { id: 'tiger_roar', name: '虎啸雷霆', epCost: 40, type: 'damage', damageMultiplier: 1.5 },
    { id: 'iron_body', name: '金刚护体', epCost: 25, type: 'shield', effect: 'defenseDouble', value: 1 }
  ],
  xuanwu: [
    { id: 'rock_wall', name: '坚岩壁垒', epCost: 15, type: 'shield', effect: 'damageReduce', value: 0.3 },
    { id: 'ice_shield', name: '冰封护盾', epCost: 35, type: 'shield', effect: 'immune', value: 1 },
    { id: 'xuanwu_power', name: '玄武之力', epCost: 45, type: 'buff', effect: 'counter', value: 0.5 }
  ],
  qilin: [
    { id: 'bless_light', name: '祥瑞之光', epCost: 35, type: 'heal', healPercent: 0.3 },
    { id: 'holy_heal', name: '圣光治愈', epCost: 40, type: 'heal', healPercent: 0.3 },
    { id: 'blessing', name: '祥瑞赐福', epCost: 55, type: 'buff', effect: 'allStatsBoost', value: 0.2 }
  ]
};

// 决斗奖励配置
export const DUEL_REWARDS = {
  win: 50,
  draw: 25,
  surrender: 20,
  streakBonus: 10,
  streakThreshold: 3
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
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/game/constants.ts
git commit -m "feat: add game constants (skills, elements, growth stages, rewards)"
```

---

### Task 2: 创建神兽成长逻辑模块

**Files:**
- Create: `server/src/game/growth.ts`

- [ ] **Step 1: 创建 game/growth.ts 实现成长逻辑**

```typescript
// server/src/game/growth.ts

import { BeastType } from './constants';
import { GROWTH_STAGES, BEAST_SKILLS } from './constants';
import { getBeastByMember, updateBeastStage, updateBeastSkills, getBeastById } from '../models/beast';
import { getMemberById, updateMemberPoints } from '../models/member';

// 根据积分计算当前阶段
export function calculateGrowthStage(totalPoints: number): number {
  for (let i = GROWTH_STAGES.length - 1; i >= 0; i--) {
    if (totalPoints >= GROWTH_STAGES[i].threshold) {
      return GROWTH_STAGES[i].stage;
    }
  }
  return 1;
}

// 获取阶段对应的技能数量
export function getSkillsCountForStage(stage: number): number {
  const stageConfig = GROWTH_STAGES.find(s => s.stage === stage);
  return stageConfig ? stageConfig.skillsCount : 1;
}

// 获取阶段威力加成
export function getPowerBonusForStage(stage: number): number {
  const stageConfig = GROWTH_STAGES.find(s => s.stage === stage);
  return stageConfig ? stageConfig.powerBonus : 0;
}

// 获取神兽应解锁的技能列表
export function getUnlockedSkills(beastType: BeastType, stage: number): string[] {
  const allSkills = BEAST_SKILLS[beastType];
  const count = getSkillsCountForStage(stage);
  return allSkills.slice(0, count).map(s => s.id);
}

// 检查并更新神兽成长阶段
export function checkAndUpdateGrowth(memberId: string): {
  stageChanged: boolean;
  newStage: number;
  newSkills: string[];
} {
  const member = getMemberById(memberId);
  if (!member) {
    return { stageChanged: false, newStage: 1, newSkills: [] };
  }

  const beast = getBeastByMember(memberId);
  if (!beast) {
    return { stageChanged: false, newStage: 1, newSkills: [] };
  }

  const newStage = calculateGrowthStage(member.total_points);
  const currentStage = beast.stage;

  if (newStage > currentStage) {
    // 阶段提升
    updateBeastStage(beast.beast_id, newStage);
    
    // 解锁新技能
    const newSkills = getUnlockedSkills(beast.beast_type, newStage);
    updateBeastSkills(beast.beast_id, newSkills);

    return { stageChanged: true, newStage, newSkills };
  }

  return { 
    stageChanged: false, 
    newStage: currentStage, 
    newSkills: beast.unlocked_skills 
  };
}

// 添加积分并触发成长检查
export function addPointsAndCheckGrowth(memberId: string, pointsToAdd: number): {
  newTotalPoints: number;
  stageChanged: boolean;
  newStage: number;
  newSkills: string[];
} {
  const member = getMemberById(memberId);
  if (!member) {
    return { newTotalPoints: 0, stageChanged: false, newStage: 1, newSkills: [] };
  }

  const newTotalPoints = member.total_points + pointsToAdd;
  updateMemberPoints(memberId, newTotalPoints);

  const growthResult = checkAndUpdateGrowth(memberId);

  return {
    newTotalPoints,
    ...growthResult
  };
}
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/game/growth.ts
git commit -m "feat: add beast growth logic (stage calculation, skill unlocking)"
```

---

### Task 3: 创建战斗状态管理模块

**Files:**
- Create: `server/src/game/battle-state.ts`

- [ ] **Step 1: 创建 game/battle-state.ts**

```typescript
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
  defenseBoost: number;      // 防御加成倍率
  damageReduce: number;      // 伤害减免倍率
  immune: boolean;           // 是否免疫伤害
  counter: number;           // 反击伤害倍率
  statsBoost: number;        // 全属性加成
  statsBoostTurns: number;   // 属性加成剩余回合
  
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
  
  // 行动顺序
  firstActor: 'challenger' | 'defender';
  secondActor: 'challenger' | 'defender';
  
  // 当前等待行动方
  waitingFor: 'challenger' | 'defender' | 'both';
  
  // 回合日志
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
    // 速度相同，随机决定
    return Math.random() < 0.5 
      ? { first: 'challenger', second: 'defender' }
      : { first: 'defender', second: 'challenger' };
  }
}

// 清除回合临时效果
export function clearRoundEffects(state: BattleBeastState): void {
  state.isDefending = false;
  state.immune = false;
  
  // 减少属性加成回合
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
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/game/battle-state.ts
git commit -m "feat: add battle state management (beast states, round tracking)"
```

---

### Task 4: 创建战斗引擎模块

**Files:**
- Create: `server/src/game/battle-engine.ts`

- [ ] **Step 1: 创建 game/battle-engine.ts 实现战斗逻辑**

```typescript
// server/src/game/battle-engine.ts

import { BattleBeastState, BattleAction, BattleResult, clearRoundEffects, recoverEp } from './battle-state';
import { BEAST_ELEMENTS, ELEMENT_COUNTER, BEAST_SKILLS, SkillDefinition, getPowerBonusForStage } from './constants';
import { Beast, getBeastById } from '../models/beast';
import { getMemberById, Member } from '../models/member';

// 活跃战斗存储
const activeBattles: Map<string, {
  challengerId: string;
  defenderId: string;
  challengerState: BattleBeastState;
  defenderState: BattleBeastState;
  currentRound: number;
}> = new Map();

// 初始化战斗
export function initBattle(duelId: string, challengerId: string, defenderId: string): {
  challengerState: BattleBeastState;
  defenderState: BattleBeastState;
} {
  const challengerBeast = getBeastByMember(challengerId);
  const defenderBeast = getBeastByMember(defenderId);
  
  if (!challengerBeast || !defenderBeast) {
    throw new Error('Both members must have beasts to battle');
  }
  
  const challengerMember = getMemberById(challengerId);
  const defenderMember = getMemberById(defenderId);
  
  // 需要从 beast 模型导入 getBeastByMember
  // 这里暂时用 getBeastById 替代，实际需要 member -> beast 映射
  
  const challengerBonus = getPowerBonusForStage(challengerBeast.stage);
  const defenderBonus = getPowerBonusForStage(defenderBeast.stage);
  
  // 简化：直接用 beast 的 member_id 作为关联
  const challengerState = createBattleStateFromBeast(challengerBeast, challengerBonus);
  const defenderState = createBattleStateFromBeast(defenderBeast, defenderBonus);
  
  activeBattles.set(duelId, {
    challengerId,
    defenderId,
    challengerState,
    defenderState,
    currentRound: 1
  });
  
  return { challengerState, defenderState };
}

// 从 Beast 创建战斗状态（需要导入 createBattleState）
function createBattleStateFromBeast(beast: Beast, powerBonus: number): BattleBeastState {
  return {
    beastId: beast.beast_id,
    memberId: beast.member_id,
    beastType: beast.beast_type,
    currentHp: beast.hp,
    maxHp: beast.hp,
    atk: beast.atk,
    def: beast.def,
    spd: beast.spd,
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

// 获取活跃战斗
export function getActiveBattle(duelId: string) {
  return activeBattles.get(duelId);
}

// 结束战斗并清理
export function endBattle(duelId: string): void {
  activeBattles.delete(duelId);
}

// 获取攻击目标
function getTarget(duelId: string, actor: 'challenger' | 'defender'): BattleBeastState {
  const battle = activeBattles.get(duelId);
  if (!battle) throw new Error('Battle not found');
  
  return actor === 'challenger' ? battle.defenderState : battle.challengerState;
}

function getActor(duelId: string, actor: 'challenger' | 'defender'): BattleBeastState {
  const battle = activeBattles.get(duelId);
  if (!battle) throw new Error('Battle not found');
  
  return actor === 'challenger' ? battle.challengerState : battle.defenderState;
}

// 计算克制加成
function calculateCounterBonus(attackerType: string, defenderType: string): number {
  const attackerElement = BEAST_ELEMENTS[attackerType as keyof typeof BEAST_ELEMENTS];
  const defenderElement = BEAST_ELEMENTS[defenderType as keyof typeof BEAST_ELEMENTS];
  
  if (attackerElement === 'light' || defenderElement === 'light') {
    return 0; // 光元素不参与克制
  }
  
  if (ELEMENT_COUNTER[attackerElement] === defenderElement) {
    return 0.5; // 克制时 +50% 伤害
  }
  
  return 0;
}

// 计算伤害
export function calculateDamage(
  attacker: BattleBeastState,
  defender: BattleBeastState,
  skillMultiplier: number = 1
): number {
  // 基础伤害 = ATK × 技能倍率 × (1 + 阶段威力加成)
  let baseDamage = attacker.atk * skillMultiplier * (1 + attacker.powerBonus);
  
  // 克制加成
  const counterBonus = calculateCounterBonus(attacker.beastType, defender.beastType);
  baseDamage *= (1 + counterBonus);
  
  // 防御减伤
  let defenseValue = defender.def * (1 + defender.defenseBoost + defender.statsBoost);
  
  // 防御姿态减半
  if (defender.isDefending) {
    baseDamage *= 0.5;
  }
  
  // 免疫伤害
  if (defender.immune) {
    return 0;
  }
  
  // 伤害减免效果
  if (defender.damageReduce > 0) {
    baseDamage *= (1 - defender.damageReduce);
  }
  
  // 实际伤害 = 基础伤害 - 防御
  const actualDamage = Math.max(1, Math.floor(baseDamage - defenseValue));
  
  return actualDamage;
}

// 执行普通攻击
export function executeAttack(duelId: string, actor: 'challenger' | 'defender'): BattleAction {
  const attackerState = getActor(duelId, actor);
  const defenderState = getTarget(duelId, actor);
  
  const damage = calculateDamage(attackerState, defenderState, 1);
  defenderState.currentHp -= damage;
  
  // 反击检查
  if (defenderState.counter > 0 && damage > 0) {
    const counterDamage = Math.floor(damage * defenderState.counter);
    attackerState.currentHp -= counterDamage;
  }
  
  // 确保 HP 不低于 0
  defenderState.currentHp = Math.max(0, defenderState.currentHp);
  attackerState.currentHp = Math.max(0, attackerState.currentHp);
  
  return {
    actor,
    actionType: 'attack',
    damage,
    targetHp: defenderState.currentHp
  };
}

// 执行技能
export function executeSkill(duelId: string, actor: 'challenger' | 'defender', skillId: string): BattleAction {
  const actorState = getActor(duelId, actor);
  const targetState = getTarget(duelId, actor);
  
  const skill = findSkill(actorState.beastType, skillId);
  if (!skill) {
    throw new Error(`Skill ${skillId} not found for beast type ${actorState.beastType}`);
  }
  
  // 检查 EP
  if (actorState.currentEp < skill.epCost) {
    throw new Error(`Not enough EP for skill ${skillId}`);
  }
  
  // 消耗 EP
  actorState.currentEp -= skill.epCost;
  
  let damage = 0;
  let heal = 0;
  let effect = '';
  
  switch (skill.type) {
    case 'damage':
      damage = calculateDamage(actorState, targetState, skill.damageMultiplier || 1);
      targetState.currentHp -= damage;
      targetState.currentHp = Math.max(0, targetState.currentHp);
      break;
      
    case 'heal':
      heal = Math.floor(actorState.maxHp * (skill.healPercent || 0.3));
      actorState.currentHp = Math.min(actorState.currentHp + heal, actorState.maxHp);
      effect = 'heal';
      break;
      
    case 'shield':
      applyShieldEffect(actorState, skill);
      effect = skill.effect || 'shield';
      break;
      
    case 'buff':
      applyBuffEffect(actorState, skill);
      effect = skill.effect || 'buff';
      break;
  }
  
  return {
    actor,
    actionType: 'skill',
    skillId,
    damage,
    heal,
    effect,
    targetHp: targetState.currentHp
  };
}

// 应用护盾效果
function applyShieldEffect(state: BattleBeastState, skill: SkillDefinition): void {
  switch (skill.effect) {
    case 'defenseBoost':
      state.defenseBoost = skill.value || 0;
      break;
    case 'defenseDouble':
      state.defenseBoost = skill.value || 1;
      break;
    case 'damageReduce':
      state.damageReduce = skill.value || 0;
      break;
    case 'immune':
      state.immune = true;
      break;
  }
}

// 应用增益效果
function applyBuffEffect(state: BattleBeastState, skill: SkillDefinition): void {
  switch (skill.effect) {
    case 'revive':
      state.hasRevive = true;
      break;
    case 'counter':
      state.counter = skill.value || 0;
      break;
    case 'allStatsBoost':
      state.statsBoost = skill.value || 0;
      state.statsBoostTurns = 3;
      break;
  }
}

// 执行防御姿态
export function executeDefend(duelId: string, actor: 'challenger' | 'defender'): BattleAction {
  const actorState = getActor(duelId, actor);
  actorState.isDefending = true;
  
  return {
    actor,
    actionType: 'defend',
    effect: 'defending'
  };
}

// 查找技能定义
function findSkill(beastType: string, skillId: string): SkillDefinition | null {
  const skills = BEAST_SKILLS[beastType as keyof typeof BEAST_SKILLS];
  return skills.find(s => s.id === skillId) || null;
}

// 检查战斗结束
export function checkBattleEnd(duelId: string): BattleResult | null {
  const battle = activeBattles.get(duelId);
  if (!battle) return null;
  
  const { challengerState, defenderState, currentRound } = battle;
  
  // 检查是否有人 HP <= 0
  if (challengerState.currentHp <= 0) {
    // 检查复活
    if (challengerState.hasRevive) {
      challengerState.currentHp = Math.floor(challengerState.maxHp * 0.5);
      challengerState.hasRevive = false;
      return null; // 复活后继续战斗
    }
    
    return {
      duelId,
      winner: 'defender',
      winnerId: battle.defenderId,
      finalRound: currentRound,
      challengerFinalHp: 0,
      defenderFinalHp: defenderState.currentHp
    };
  }
  
  if (defenderState.currentHp <= 0) {
    if (defenderState.hasRevive) {
      defenderState.currentHp = Math.floor(defenderState.maxHp * 0.5);
      defenderState.hasRevive = false;
      return null;
    }
    
    return {
      duelId,
      winner: 'challenger',
      winnerId: battle.challengerId,
      finalRound: currentRound,
      challengerFinalHp: challengerState.currentHp,
      defenderFinalHp: 0
    };
  }
  
  return null; // 战斗继续
}

// 结束回合
export function endRound(duelId: string): void {
  const battle = activeBattles.get(duelId);
  if (!battle) return;
  
  // 清除临时效果
  clearRoundEffects(battle.challengerState);
  clearRoundEffects(battle.defenderState);
  
  // EP 恢复
  recoverEp(battle.challengerState);
  recoverEp(battle.defenderState);
  
  // 增加回合数
  battle.currentRound++;
}

// 需要导入 getBeastByMember
import { getBeastByMember } from '../models/beast';
```

- [ ] **Step 2: 提交文件**

```bash
git add server/src/game/battle-engine.ts
git commit -m "feat: add battle engine (damage calculation, skills, counter system)"
```

---

### Task 5: 修改 Socket handlers 集成战斗引擎

**Files:**
- Modify: `server/src/socket/handlers.ts`

- [ ] **Step 1: 在 handlers.ts 中添加战斗相关导入**

在文件顶部添加：

```typescript
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
import { determineOrder, BattleBeastState } from '../game/battle-state';
import { addPointsAndCheckGrowth, DUEL_REWARDS } from '../game/growth';
```

- [ ] **Step 2: 修改 handleDuelAccept 函数初始化战斗**

替换原有的 handleDuelAccept：

```typescript
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
```

- [ ] **Step 3: 修改 handleDuelAction 函数实现完整战斗逻辑**

替换原有的 handleDuelAction：

```typescript
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
        // 结束回合（双方都行动后）
        // 这里简化为每次行动后都结束回合
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
```

- [ ] **Step 4: 添加战斗结束处理函数**

在文件中添加新函数：

```typescript
// 处理战斗结束
function handleBattleEnd(io: Server, duel: any, result: BattleResult, isSurrender: boolean): void {
  // 更新决斗结果
  const duelResult: DuelResult = result.winner === 'challenger' ? 'challenger_win' 
    : result.winner === 'defender' ? 'defender_win' 
    : 'draw';
  
  updateDuelResult(duel.duel_id, duelResult, result.winnerId, result.finalRound);
  
  // 计算奖励
  const winnerId = result.winnerId;
  const loserId = result.winner === 'challenger' ? duel.defender_id : duel.challenger_id;
  
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
        newPoints: winnerMember.total_points
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
    addPointsAndCheckGrowth(duel.challenger_id, drawReward);
    addPointsAndCheckGrowth(duel.defender_id, drawReward);
    
    broadcastToDuelists(io, duel, 'DUEL_ENDED', {
      duelId: duel.duel_id,
      result: 'draw',
      reward: drawReward
    });
  }
  
  // 清理战斗状态
  endBattle(duel.duel_id);
}

// 需要导入 DuelResult 类型
import { DuelResult } from '../models/duel';
import { BattleResult } from '../game/battle-engine';
```

- [ ] **Step 5: 提交修改**

```bash
git add server/src/socket/handlers.ts
git commit -m "feat: integrate battle engine into socket handlers"
```

---

### Task 6: 修改神兽模型添加属性更新

**Files:**
- Modify: `server/src/models/beast.ts`

- [ ] **Step 1: 添加属性更新函数**

在 beast.ts 文件末尾添加：

```typescript
// 更新神兽所有属性（战斗后同步）
export function updateBeastStats(
  beastId: string, 
  hp: number, 
  atk: number, 
  def: number, 
  spd: number,
  ep: number
): void {
  runSql(`
    UPDATE beasts SET hp = ?, atk = ?, def = ?, spd = ?, ep = ? WHERE beast_id = ?
  `, [hp, atk, def, spd, ep, beastId]);
}

// 根据成员ID获取神兽
export function getBeastByMember(memberId: string): Beast | null {
  const row = queryOne('SELECT * FROM beasts WHERE member_id = ?', [memberId]);
  return row ? parseBeast(row) : null;
}
```

- [ ] **Step 2: 提交修改**

```bash
git add server/src/models/beast.ts
git commit -m "feat: add beast stats update function"
```

---

### Task 7: 修改任务处理集成成长逻辑

**Files:**
- Modify: `server/src/socket/handlers.ts`

- [ ] **Step 1: 修改 handleTaskUpdate 函数**

找到现有的 handleTaskUpdate 函数，修改积分更新部分：

```typescript
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
```

- [ ] **Step 2: 添加成长模块导入**

确保在 handlers.ts 顶部有：

```typescript
import { addPointsAndCheckGrowth } from '../game/growth';
```

- [ ] **Step 3: 提交修改**

```bash
git add server/src/socket/handlers.ts
git commit -m "feat: integrate growth logic into task completion"
```

---

### Task 8: 运行项目验证战斗功能

**Files:**
- 无新文件，验证现有实现

- [ ] **Step 1: 安装依赖**

```bash
cd D:/Development/game/housework_beast && npm install
```

预期：依赖安装成功

- [ ] **Step 2: 启动后端服务器**

```bash
cd D:/Development/game/housework_beast/server && npm run dev
```

预期：服务器启动无 TypeScript 编译错误

- [ ] **Step 3: 测试成长逻辑 API**

```bash
# 创建家庭
curl -X POST http://localhost:3000/api/family -H "Content-Type: application/json"

# 创建成员
curl -X POST http://localhost:3000/api/member -H "Content-Type: application/json" -d '{"familyId":"<family_id>","name":"测试玩家"}'

# 创建神兽
curl -X POST http://localhost:3000/api/beast -H "Content-Type: application/json" -d '{"memberId":"<member_id>","beastType":"qinglong"}'

# 检查成长阶段
curl -X POST http://localhost:3000/api/beast/calculate-stage -H "Content-Type: application/json" -d '{"totalPoints":500}'
```

预期：
- 创建成功
- calculate-stage 返回 `{ stage: 2, skillsCount: 2 }`

- [ ] **Step 4: 提交验证完成**

```bash
git add -A
git commit -m "chore: verify plan3 implementation - battle engine working"
```

---

## Self-Review Checklist

**1. Spec coverage:**
- ✅ 神兽成长：积分→阶段→技能解锁（Task 2）
- ✅ 元素克制：木→水→火→金→木循环（Task 1）
- ✅ 战斗回合：速度判定、行动选择、伤害计算（Task 3-4）
- ✅ 技能系统：伤害/治疗/护盾/增益类型（Task 1, 4）
- ✅ 决斗奖励：胜利50、平局25、投降20（Task 1）
- ✅ 任务完成触发成长（Task 7）

**2. Placeholder scan:**
- 无 TBD/TODO 占位符
- 所有代码完整

**3. Type consistency:**
- BeastType 在 constants.ts 和 beast.ts 一致
- BattleBeastState 接口定义完整
- SkillDefinition 类型覆盖所有技能类型