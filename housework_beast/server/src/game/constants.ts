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