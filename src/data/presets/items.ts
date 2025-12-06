/**
 * 物品预设
 */

import type { GameElement } from '@/shared/types';

export const ITEM_TORCH: GameElement = {
  id: 'item-torch',
  type: '物品',
  name: '火把',
  description: '可以照亮周围的简陋火把',
  icon: 'flame',
  children: [],
};

export const ITEM_BREAD: GameElement = {
  id: 'item-bread',
  type: '物品',
  name: '干粮',
  description: '朴素但能填饱肚子的食物',
  icon: 'box',
  children: [],
};

export const ITEM_POTION: GameElement = {
  id: 'item-potion',
  type: '物品',
  name: '治疗药水',
  description: '红色的液体，可以恢复少量生命',
  icon: 'flask-conical',
  children: [],
};

export const ITEM_BROKEN_SWORD: GameElement = {
  id: 'item-broken-sword',
  type: '武器',
  name: '断剑',
  description: '残破但仍可使用的剑刃',
  icon: 'sword',
  children: [],
};

export const ITEM_DATA_CHIP: GameElement = {
  id: 'item-data-chip',
  type: '物品',
  name: '数据芯片',
  description: '存储着未知信息的芯片',
  icon: 'layers',
  children: [],
};

export const ITEM_SPIRIT_STONE: GameElement = {
  id: 'item-spirit-stone',
  type: '物品',
  name: '灵石',
  description: '蕴含灵气的晶石，修炼必备',
  icon: 'gem',
  children: [],
};
