import { v4 as uuidv4 } from 'uuid';
import { queryOne, queryAll, runSql } from '../db/database';

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

function parseBeast(row: any): Beast {
  return {
    ...row,
    unlocked_skills: row.unlocked_skills ? row.unlocked_skills.split(',') : []
  };
}

export function createBeast(memberId: string, beastType: BeastType): Beast {
  const beastId = uuidv4();
  const baseStats = BEAST_BASE_STATS[beastType];

  runSql(`
    INSERT INTO beasts (beast_id, member_id, beast_type, stage, hp, atk, def, spd, ep, unlocked_skills)
    VALUES (?, ?, ?, 1, ?, ?, ?, ?, 100, '')
  `, [beastId, memberId, beastType, baseStats.hp, baseStats.atk, baseStats.def, baseStats.spd]);

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
  const row = queryOne('SELECT * FROM beasts WHERE beast_id = ?', [beastId]);
  return row ? parseBeast(row) : null;
}

export function getBeastByMember(memberId: string): Beast | null {
  const row = queryOne('SELECT * FROM beasts WHERE member_id = ?', [memberId]);
  return row ? parseBeast(row) : null;
}

export function updateBeastStage(beastId: string, stage: number): void {
  runSql('UPDATE beasts SET stage = ? WHERE beast_id = ?', [stage, beastId]);
}

export function updateBeastSkills(beastId: string, skills: string[]): void {
  runSql('UPDATE beasts SET unlocked_skills = ? WHERE beast_id = ?', [skills.join(','), beastId]);
}

export function updateBeastEp(beastId: string, ep: number): void {
  runSql('UPDATE beasts SET ep = ? WHERE beast_id = ?', [ep, beastId]);
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