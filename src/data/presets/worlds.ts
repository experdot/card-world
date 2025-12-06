/**
 * 世界预设
 */

import type { GameElement } from '@/shared/types';
import { ITEM_BROKEN_SWORD, ITEM_TORCH, ITEM_POTION, ITEM_DATA_CHIP, ITEM_SPIRIT_STONE, ITEM_BREAD } from './items';
import { SLOT_INVENTORY, SLOT_EQUIPMENT, SLOT_ABILITIES, SLOT_QUESTS, SLOT_STATUS } from './containers';
import { getAbilitiesBySetIds } from './abilities';

export interface WorldPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  characterDesc: string;
  narrativeStyle: string;
  abilitySets: string[];
  includeSystems: {
    inventory: boolean;
    equipment: boolean;
    quests: boolean;
    status: boolean;
  };
  starterItems?: GameElement[];
}

// 世界预设列表
export const WORLD_PRESETS: WorldPreset[] = [
  {
    id: 'dungeon',
    name: '黑暗地牢',
    description: '经典的地下城探险，充满怪物、陷阱和宝藏',
    icon: 'skull',
    theme: '阴暗潮湿的地下迷宫，石壁上爬满苔藓，火把的光芒摇曳不定。深处传来低沉的咆哮声...',
    characterDesc: '一名失去记忆的冒险者，在地牢入口处醒来，只带着一把断剑和模糊的使命感。',
    narrativeStyle: '黑暗奇幻风格，氛围紧张，描写细腻，偶尔带有黑色幽默',
    abilitySets: ['basic', 'combat', 'stealth'],
    includeSystems: {
      inventory: true,
      equipment: true,
      quests: true,
      status: true,
    },
    starterItems: [ITEM_BROKEN_SWORD, ITEM_TORCH, ITEM_POTION],
  },
  {
    id: 'cyberpunk',
    name: '霓虹都市',
    description: '赛博朋克风格的未来城市，财团、黑客与街头文化交织',
    icon: 'zap',
    theme: '2087年的新东京，霓虹灯永不熄灭，全息广告铺天盖地。巨型财团控制一切，而你只是夜城中的一个小角色...',
    characterDesc: '一名独立黑客，大脑植入了军用级神经接口。刚刚从一次失败的任务中逃脱，身上还带着重要的数据。',
    narrativeStyle: '冷硬派风格，对话简洁有力，充满科技术语和街头俚语',
    abilitySets: ['basic', 'cyber', 'social'],
    includeSystems: {
      inventory: true,
      equipment: true,
      quests: true,
      status: true,
    },
    starterItems: [ITEM_DATA_CHIP],
  },
  {
    id: 'cultivation',
    name: '修仙世界',
    description: '东方玄幻风格，宗门林立，大道三千',
    icon: 'cloud',
    theme: '灵气��苏的苍穹大陆，修仙者御剑飞行，宗门之间争斗不休。凡人仰望天空，期盼着踏入修行之路...',
    characterDesc: '一个资质平平的散修，意外获得一块神秘玉简，似乎记载着失传的功法。',
    narrativeStyle: '古风仙侠，辞藻华丽，注重意境，偶尔引用诗词',
    abilitySets: ['basic', 'cultivation', 'social'],
    includeSystems: {
      inventory: true,
      equipment: true,
      quests: true,
      status: true,
    },
    starterItems: [ITEM_SPIRIT_STONE],
  },
  {
    id: 'wasteland',
    name: '末日废土',
    description: '核战后的荒原世界，生存才是第一要务',
    icon: 'ghost',
    theme: '核战已过去两百年，世界变成了一片荒芜。变异生物游荡在废墟间，干净的水和食物比黄金还珍贵...',
    characterDesc: '废土上的拾荒者，从小在避难所长大，最近被迫离开家园，独自面对外面的世界。',
    narrativeStyle: '写实硬核，注重生存细节，对话粗犷直接，偶尔流露出人性的温暖',
    abilitySets: ['basic', 'combat', 'stealth'],
    includeSystems: {
      inventory: true,
      equipment: true,
      quests: false,
      status: true,
    },
    starterItems: [ITEM_BREAD],
  },
  {
    id: 'magic-academy',
    name: '魔法学院',
    description: '神秘的魔法学校，学习咒语、结交朋友、解开谜团',
    icon: 'book',
    theme: '千年历史的奥术学院坐落在云端，塔楼高耸入云，魔法生物在走廊间穿梭。新学期即将开始...',
    characterDesc: '一名刚入学的新生，出身普通却被学院破格录取。似乎有着不为人知的特殊天赋...',
    narrativeStyle: '轻松明快，充满奇思妙想，注重人物互动和成长',
    abilitySets: ['basic', 'magic', 'social'],
    includeSystems: {
      inventory: true,
      equipment: false,
      quests: true,
      status: false,
    },
    starterItems: [],
  },
  {
    id: 'custom',
    name: '自定义世界',
    description: '从零开始，创造你自己的世界',
    icon: 'globe',
    theme: '',
    characterDesc: '',
    narrativeStyle: '根据世界观自动适配',
    abilitySets: ['basic'],
    includeSystems: {
      inventory: true,
      equipment: false,
      quests: false,
      status: true,
    },
    starterItems: [],
  },
];

// 构建玩家预设结构
export function buildPlayerPreset(preset: WorldPreset, customAbilitySets?: string[]): GameElement[] {
  const elements: GameElement[] = [];
  const abilitySets = customAbilitySets || preset.abilitySets;
  const abilities = getAbilitiesBySetIds(abilitySets);

  // 能力容器
  if (abilities.length > 0) {
    elements.push({
      ...SLOT_ABILITIES,
      id: `slot-abilities-${Date.now()}`,
      children: abilities,
    });
  }

  // 背包（含起始物品）
  if (preset.includeSystems.inventory) {
    const starterItems = (preset.starterItems || []).map((item) => ({
      ...item,
      id: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }));
    elements.push({
      ...SLOT_INVENTORY,
      id: `slot-inventory-${Date.now()}`,
      children: starterItems,
    });
  }

  // 装备栏
  if (preset.includeSystems.equipment) {
    elements.push({
      ...SLOT_EQUIPMENT,
      id: `slot-equipment-${Date.now()}`,
      children: [],
    });
  }

  // 任务
  if (preset.includeSystems.quests) {
    elements.push({
      ...SLOT_QUESTS,
      id: `slot-quests-${Date.now()}`,
      children: [],
    });
  }

  // 状态
  if (preset.includeSystems.status) {
    elements.push({
      ...SLOT_STATUS,
      id: `slot-status-${Date.now()}`,
      children: [
        {
          id: `status-hp-${Date.now()}`,
          type: '属性',
          name: '生命值',
          description: '100/100',
          icon: 'heart',
          enabled: true,
          visible: true,
          children: [],
        },
      ],
    });
  }

  return elements;
}

// 初始世界状态
export const INITIAL_WORLD_STATE: GameElement = {
  id: 'world-root',
  type: '世界',
  name: '世界',
  icon: 'globe',
  enabled: false,
  visible: true,
  children: [
    {
      id: 'loc-dungeon',
      type: '地点',
      name: '潮湿的地牢',
      icon: 'castle',
      enabled: true,
      visible: true,
      children: [
        {
          id: 'player-1',
          type: '角色',
          name: '玩家',
          icon: 'user',
          enabled: true,
          visible: true,
          children: [
            {
              id: 'slot-abilities',
              type: '卡槽',
              name: '能力',
              icon: 'box-select',
              enabled: false,
              visible: true,
              children: [
                {
                  id: 'ability-observe',
                  type: '能力',
                  name: '观察',
                  icon: 'eye',
                  enabled: true,
                  visible: true,
                  children: [],
                },
                {
                  id: 'ability-chat',
                  type: '能力',
                  name: '对话',
                  icon: 'message-circle',
                  enabled: false,
                  visible: true,
                  children: [],
                },
                {
                  id: 'ability-combine',
                  type: '能力',
                  name: '合成',
                  icon: 'flask-conical',
                  enabled: true,
                  visible: true,
                  children: [],
                },
                {
                  id: 'ability-split',
                  type: '能力',
                  name: '拆解',
                  icon: 'scissors',
                  enabled: true,
                  visible: true,
                  children: [],
                },
              ],
            },
            {
              id: 'slot-inventory',
              type: '卡槽',
              name: '背包',
              icon: 'backpack',
              enabled: false,
              visible: true,
              children: [
                {
                  id: 'item-lint',
                  type: '物品',
                  name: '口袋里的灰尘',
                  icon: 'feather',
                  enabled: true,
                  visible: true,
                  children: [],
                },
              ],
            },
            {
              id: 'slot-mind',
              type: '卡槽',
              name: '意识',
              icon: 'brain',
              enabled: false,
              visible: true,
              children: [],
            },
          ],
        },
        {
          id: 'bldg-walls',
          type: '建筑',
          name: '石墙',
          icon: 'brick-wall',
          enabled: true,
          visible: true,
          children: [],
        },
        {
          id: 'bldg-gate',
          type: '建筑',
          name: '铁栅栏',
          icon: 'door-closed',
          enabled: true,
          visible: true,
          children: [
            {
              id: 'item-key-hidden',
              type: '物品',
              name: '生锈的钥匙',
              icon: 'key',
              enabled: true,
              visible: false,
              children: [],
            },
          ],
        },
        {
          id: 'concept-silence',
          type: '环境',
          name: '死寂',
          icon: 'cloud-fog',
          enabled: true,
          visible: true,
          children: [],
        },
      ],
    },
  ],
};
