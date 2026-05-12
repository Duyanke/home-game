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
  wood: 'water',
  water: 'fire',
  fire: 'metal',
  metal: 'wood',
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