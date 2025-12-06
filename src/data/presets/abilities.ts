/**
 * 能力预设
 */

import type { GameElement } from '@/shared/types';

// --- 基础能力 ---
export const ABILITY_OBSERVE: GameElement = {
  id: 'ability-observe',
  type: '能力',
  name: '观察',
  description: '仔细观察周围的环境，可能发现隐藏的细节',
  icon: 'eye',
  children: [],
};

export const ABILITY_TALK: GameElement = {
  id: 'ability-talk',
  type: '能力',
  name: '交谈',
  description: '与他人进行对话交流',
  icon: 'message-circle',
  children: [],
};

export const ABILITY_SEARCH: GameElement = {
  id: 'ability-search',
  type: '能力',
  name: '搜索',
  description: '在当前区域搜寻有价值的物品',
  icon: 'search',
  children: [],
};

export const ABILITY_REST: GameElement = {
  id: 'ability-rest',
  type: '能力',
  name: '休息',
  description: '短暂休息以恢复体力',
  icon: 'moon',
  children: [],
};

export const ABILITY_MOVE: GameElement = {
  id: 'ability-move',
  type: '能力',
  name: '移动',
  description: '前往其他可到达的地点',
  icon: 'map-pin',
  children: [],
};

export const ABILITY_USE: GameElement = {
  id: 'ability-use',
  type: '能力',
  name: '使用',
  description: '使用物品或与物体互动',
  icon: 'zap',
  children: [],
};

// --- 战斗能力 ---
export const ABILITY_ATTACK: GameElement = {
  id: 'ability-attack',
  type: '战斗能力',
  name: '攻击',
  description: '对目标发起物理攻击',
  icon: 'sword',
  children: [],
};

export const ABILITY_DEFEND: GameElement = {
  id: 'ability-defend',
  type: '战斗能力',
  name: '防御',
  description: '采取防御姿态，减少受到的伤害',
  icon: 'shield',
  children: [],
};

export const ABILITY_DODGE: GameElement = {
  id: 'ability-dodge',
  type: '战斗能力',
  name: '闪避',
  description: '尝试躲避即将到来的攻击',
  icon: 'zap',
  children: [],
};

// --- 魔法能力 ---
export const ABILITY_CAST_FIRE: GameElement = {
  id: 'ability-cast-fire',
  type: '魔法能力',
  name: '火球术',
  description: '召唤一团火焰攻击敌人',
  icon: 'flame',
  children: [],
};

export const ABILITY_CAST_HEAL: GameElement = {
  id: 'ability-cast-heal',
  type: '魔法能力',
  name: '治愈术',
  description: '用魔力治愈伤口',
  icon: 'heart',
  children: [],
};

export const ABILITY_CAST_LIGHT: GameElement = {
  id: 'ability-cast-light',
  type: '魔法能力',
  name: '照明术',
  description: '创造一束光芒照亮黑暗',
  icon: 'sun',
  children: [],
};

// --- 社交能力 ---
export const ABILITY_PERSUADE: GameElement = {
  id: 'ability-persuade',
  type: '社交能力',
  name: '说服',
  description: '试图说服他人接受你的观点',
  icon: 'message-circle',
  children: [],
};

export const ABILITY_INTIMIDATE: GameElement = {
  id: 'ability-intimidate',
  type: '社交能力',
  name: '威吓',
  description: '用气势压制对方',
  icon: 'angry',
  children: [],
};

export const ABILITY_TRADE: GameElement = {
  id: 'ability-trade',
  type: '社交能力',
  name: '交易',
  description: '与商人或NPC进行物品交换',
  icon: 'coins',
  children: [],
};

// --- 特殊能力 ---
export const ABILITY_STEALTH: GameElement = {
  id: 'ability-stealth',
  type: '特殊能力',
  name: '潜行',
  description: '悄无声息地移动，避免被发现',
  icon: 'eye-off',
  children: [],
};

export const ABILITY_LOCKPICK: GameElement = {
  id: 'ability-lockpick',
  type: '特殊能力',
  name: '开锁',
  description: '尝试打开上锁的门或箱子',
  icon: 'key',
  children: [],
};

export const ABILITY_CRAFT: GameElement = {
  id: 'ability-craft',
  type: '特殊能力',
  name: '制作',
  description: '利用材料制作物品',
  icon: 'hammer',
  children: [],
};

// --- 科技能力 ---
export const ABILITY_HACK: GameElement = {
  id: 'ability-hack',
  type: '科技能力',
  name: '黑入',
  description: '侵入电子系统获取信息或控制权',
  icon: 'link',
  children: [],
};

export const ABILITY_SCAN: GameElement = {
  id: 'ability-scan',
  type: '科技能力',
  name: '扫描',
  description: '使用设备扫描分析目标',
  icon: 'search',
  children: [],
};

// --- 修仙能力 ---
export const ABILITY_MEDITATE: GameElement = {
  id: 'ability-meditate',
  type: '修炼能力',
  name: '打坐',
  description: '静心修炼，恢复灵力',
  icon: 'brain',
  children: [],
};

export const ABILITY_SWORD_QI: GameElement = {
  id: 'ability-sword-qi',
  type: '修炼能力',
  name: '剑气',
  description: '释放凝聚的剑意攻击敌人',
  icon: 'sword',
  children: [],
};

// 能力集合
export const ABILITY_SET_BASIC: GameElement[] = [
  ABILITY_OBSERVE,
  ABILITY_TALK,
  ABILITY_SEARCH,
  ABILITY_REST,
  ABILITY_MOVE,
  ABILITY_USE,
];

export const ABILITY_SET_COMBAT: GameElement[] = [ABILITY_ATTACK, ABILITY_DEFEND, ABILITY_DODGE];

export const ABILITY_SET_MAGIC: GameElement[] = [
  ABILITY_CAST_FIRE,
  ABILITY_CAST_HEAL,
  ABILITY_CAST_LIGHT,
];

export const ABILITY_SET_SOCIAL: GameElement[] = [ABILITY_PERSUADE, ABILITY_INTIMIDATE, ABILITY_TRADE];

export const ABILITY_SET_STEALTH: GameElement[] = [ABILITY_STEALTH, ABILITY_LOCKPICK];

export const ABILITY_SET_CYBER: GameElement[] = [ABILITY_HACK, ABILITY_SCAN];

export const ABILITY_SET_CULTIVATION: GameElement[] = [ABILITY_MEDITATE, ABILITY_SWORD_QI];

// 能力集合信息
export const ABILITY_SET_INFO: Record<string, { name: string; description: string; icon: string }> = {
  basic: {
    name: '基础能力',
    description: '观察、交谈、搜索等通用能力',
    icon: 'eye',
  },
  combat: {
    name: '战斗能力',
    description: '攻击、防御、闪避',
    icon: 'sword',
  },
  magic: {
    name: '魔法能力',
    description: '火球术、治愈术、照明术',
    icon: 'flame',
  },
  social: {
    name: '社交能力',
    description: '说服、威吓、交易',
    icon: 'message-circle',
  },
  stealth: {
    name: '潜行能力',
    description: '潜行、开锁',
    icon: 'eye-off',
  },
  cyber: {
    name: '科技能力',
    description: '黑入、扫描',
    icon: 'link',
  },
  cultivation: {
    name: '修炼能力',
    description: '打坐、剑气',
    icon: 'cloud',
  },
};

// 根据能力集合 ID 获取能力列表
export function getAbilitiesBySetIds(setIds: string[]): GameElement[] {
  const abilities: GameElement[] = [];
  const seen = new Set<string>();

  for (const setId of setIds) {
    let set: GameElement[] = [];
    switch (setId) {
      case 'basic':
        set = ABILITY_SET_BASIC;
        break;
      case 'combat':
        set = ABILITY_SET_COMBAT;
        break;
      case 'magic':
        set = ABILITY_SET_MAGIC;
        break;
      case 'social':
        set = ABILITY_SET_SOCIAL;
        break;
      case 'stealth':
        set = ABILITY_SET_STEALTH;
        break;
      case 'cyber':
        set = ABILITY_SET_CYBER;
        break;
      case 'cultivation':
        set = ABILITY_SET_CULTIVATION;
        break;
    }

    for (const ability of set) {
      if (!seen.has(ability.id)) {
        seen.add(ability.id);
        abilities.push({
          ...ability,
          id: `${ability.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        });
      }
    }
  }

  return abilities;
}
