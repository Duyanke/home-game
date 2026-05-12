// server/src/game/growth.ts

import { BeastType } from './constants';
import { GROWTH_STAGES, BEAST_SKILLS } from './constants';
import { getBeastByMember, updateBeastStage, updateBeastSkills } from '../models/beast';
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