/**
 * 容器/系统预设
 */

import type { GameElement } from '@/shared/types';

export const SLOT_INVENTORY: GameElement = {
  id: 'slot-inventory',
  type: '容器',
  name: '背包',
  description: '存放随身物品的空间',
  icon: 'backpack',
  enabled: true,
  visible: true,
  children: [],
};

export const SLOT_EQUIPMENT: GameElement = {
  id: 'slot-equipment',
  type: '容器',
  name: '装备栏',
  description: '当前穿戴的装备',
  icon: 'shield',
  enabled: true,
  visible: true,
  children: [],
};

export const SLOT_ABILITIES: GameElement = {
  id: 'slot-abilities',
  type: '容器',
  name: '能力',
  description: '可使用的能力和技能',
  icon: 'zap',
  enabled: true,
  visible: true,
  children: [],
};

export const SLOT_QUESTS: GameElement = {
  id: 'slot-quests',
  type: '容器',
  name: '任务',
  description: '当前的任务和目标',
  icon: 'scroll',
  enabled: true,
  visible: true,
  children: [],
};

export const SLOT_STATUS: GameElement = {
  id: 'slot-status',
  type: '状态',
  name: '状态',
  description: '身体和精神状态',
  icon: 'heart',
  enabled: true,
  visible: true,
  children: [],
};
