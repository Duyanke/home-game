// server/src/game/battle-engine.ts

import { BattleBeastState, BattleAction, BattleResult, clearRoundEffects, recoverEp } from './battle-state';
import { BEAST_ELEMENTS, ELEMENT_COUNTER, BEAST_SKILLS, SkillDefinition, getPowerBonusForStage } from './constants';
import { Beast, getBeastById, getBeastByMember } from '../models/beast';
import { getMemberById } from '../models/member';

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

  const challengerBonus = getPowerBonusForStage(challengerBeast.stage);
  const defenderBonus = getPowerBonusForStage(defenderBeast.stage);

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

export function getActiveBattle(duelId: string) {
  return activeBattles.get(duelId);
}

export function endBattle(duelId: string): void {
  activeBattles.delete(duelId);
}

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

function calculateCounterBonus(attackerType: string, defenderType: string): number {
  const attackerElement = BEAST_ELEMENTS[attackerType as keyof typeof BEAST_ELEMENTS];
  const defenderElement = BEAST_ELEMENTS[defenderType as keyof typeof BEAST_ELEMENTS];

  if (attackerElement === 'light' || defenderElement === 'light') return 0;
  if (ELEMENT_COUNTER[attackerElement] === defenderElement) return 0.5;
  return 0;
}

export function calculateDamage(attacker: BattleBeastState, defender: BattleBeastState, skillMultiplier: number = 1): number {
  let baseDamage = attacker.atk * skillMultiplier * (1 + attacker.powerBonus);
  const counterBonus = calculateCounterBonus(attacker.beastType, defender.beastType);
  baseDamage *= (1 + counterBonus);

  let defenseValue = defender.def * (1 + defender.defenseBoost + defender.statsBoost);
  if (defender.isDefending) baseDamage *= 0.5;
  if (defender.immune) return 0;
  if (defender.damageReduce > 0) baseDamage *= (1 - defender.damageReduce);

  return Math.max(1, Math.floor(baseDamage - defenseValue));
}

export function executeAttack(duelId: string, actor: 'challenger' | 'defender'): BattleAction {
  const attackerState = getActor(duelId, actor);
  const defenderState = getTarget(duelId, actor);

  const damage = calculateDamage(attackerState, defenderState, 1);
  defenderState.currentHp -= damage;

  if (defenderState.counter > 0 && damage > 0) {
    const counterDamage = Math.floor(damage * defenderState.counter);
    attackerState.currentHp -= counterDamage;
  }

  defenderState.currentHp = Math.max(0, defenderState.currentHp);
  attackerState.currentHp = Math.max(0, attackerState.currentHp);

  return { actor, actionType: 'attack', damage, targetHp: defenderState.currentHp };
}

export function executeSkill(duelId: string, actor: 'challenger' | 'defender', skillId: string): BattleAction {
  const actorState = getActor(duelId, actor);
  const targetState = getTarget(duelId, actor);

  const skill = findSkill(actorState.beastType, skillId);
  if (!skill) throw new Error(`Skill ${skillId} not found`);
  if (actorState.currentEp < skill.epCost) throw new Error(`Not enough EP`);

  actorState.currentEp -= skill.epCost;

  let damage = 0, heal = 0, effect = '';

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

  return { actor, actionType: 'skill', skillId, damage, heal, effect, targetHp: targetState.currentHp };
}

function applyShieldEffect(state: BattleBeastState, skill: SkillDefinition): void {
  if (skill.effect === 'defenseBoost') state.defenseBoost = skill.value || 0;
  if (skill.effect === 'defenseDouble') state.defenseBoost = skill.value || 1;
  if (skill.effect === 'damageReduce') state.damageReduce = skill.value || 0;
  if (skill.effect === 'immune') state.immune = true;
}

function applyBuffEffect(state: BattleBeastState, skill: SkillDefinition): void {
  if (skill.effect === 'revive') state.hasRevive = true;
  if (skill.effect === 'counter') state.counter = skill.value || 0;
  if (skill.effect === 'allStatsBoost') {
    state.statsBoost = skill.value || 0;
    state.statsBoostTurns = 3;
  }
}

export function executeDefend(duelId: string, actor: 'challenger' | 'defender'): BattleAction {
  const actorState = getActor(duelId, actor);
  actorState.isDefending = true;
  return { actor, actionType: 'defend', effect: 'defending' };
}

function findSkill(beastType: string, skillId: string): SkillDefinition | null {
  const skills = BEAST_SKILLS[beastType as keyof typeof BEAST_SKILLS];
  return skills.find(s => s.id === skillId) || null;
}

export function checkBattleEnd(duelId: string): BattleResult | null {
  const battle = activeBattles.get(duelId);
  if (!battle) return null;

  const { challengerState, defenderState, currentRound } = battle;

  if (challengerState.currentHp <= 0) {
    if (challengerState.hasRevive) {
      challengerState.currentHp = Math.floor(challengerState.maxHp * 0.5);
      challengerState.hasRevive = false;
      return null;
    }
    return { duelId, winner: 'defender', winnerId: battle.defenderId, finalRound: currentRound, challengerFinalHp: 0, defenderFinalHp: defenderState.currentHp };
  }

  if (defenderState.currentHp <= 0) {
    if (defenderState.hasRevive) {
      defenderState.currentHp = Math.floor(defenderState.maxHp * 0.5);
      defenderState.hasRevive = false;
      return null;
    }
    return { duelId, winner: 'challenger', winnerId: battle.challengerId, finalRound: currentRound, challengerFinalHp: challengerState.currentHp, defenderFinalHp: 0 };
  }

  return null;
}

export function endRound(duelId: string): void {
  const battle = activeBattles.get(duelId);
  if (!battle) return;

  clearRoundEffects(battle.challengerState);
  clearRoundEffects(battle.defenderState);
  recoverEp(battle.challengerState);
  recoverEp(battle.defenderState);
  battle.currentRound++;
}