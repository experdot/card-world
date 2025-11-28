import { GameElement } from "./types";

// ============================================
// 预设卡牌模板库
// ============================================

// --- 基础能力 ---
export const ABILITY_OBSERVE: GameElement = {
  id: "ability-observe",
  type: "能力",
  name: "观察",
  description: "仔细观察周围的环境，可能发现隐藏的细节",
  icon: "eye",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_TALK: GameElement = {
  id: "ability-talk",
  type: "能力",
  name: "交谈",
  description: "与他人进行对话交流",
  icon: "message-circle",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_SEARCH: GameElement = {
  id: "ability-search",
  type: "能力",
  name: "搜索",
  description: "在当前区域搜寻有价值的物品",
  icon: "search",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_REST: GameElement = {
  id: "ability-rest",
  type: "能力",
  name: "休息",
  description: "短暂休息以恢复体力",
  icon: "moon",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_MOVE: GameElement = {
  id: "ability-move",
  type: "能力",
  name: "移动",
  description: "前往其他可到达的地点",
  icon: "map-pin",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_USE: GameElement = {
  id: "ability-use",
  type: "能力",
  name: "使用",
  description: "使用物品或与物体互动",
  icon: "zap",
  enabled: true,
  visible: true,
  children: [],
};

// --- 战斗能力 ---
export const ABILITY_ATTACK: GameElement = {
  id: "ability-attack",
  type: "战斗能力",
  name: "攻击",
  description: "对目标发起物理攻击",
  icon: "sword",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_DEFEND: GameElement = {
  id: "ability-defend",
  type: "战斗能力",
  name: "防御",
  description: "采取防御姿态，减少受到的伤害",
  icon: "shield",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_DODGE: GameElement = {
  id: "ability-dodge",
  type: "战斗能力",
  name: "闪避",
  description: "尝试躲避即将到来的攻击",
  icon: "zap",
  enabled: true,
  visible: true,
  children: [],
};

// --- 魔法能力 ---
export const ABILITY_CAST_FIRE: GameElement = {
  id: "ability-cast-fire",
  type: "魔法能力",
  name: "火球术",
  description: "召唤一团火焰攻击敌人",
  icon: "flame",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_CAST_HEAL: GameElement = {
  id: "ability-cast-heal",
  type: "魔法能力",
  name: "治愈术",
  description: "用魔力治愈伤口",
  icon: "heart",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_CAST_LIGHT: GameElement = {
  id: "ability-cast-light",
  type: "魔法能力",
  name: "照明术",
  description: "创造一束光芒照亮黑暗",
  icon: "sun",
  enabled: true,
  visible: true,
  children: [],
};

// --- 社交能力 ---
export const ABILITY_PERSUADE: GameElement = {
  id: "ability-persuade",
  type: "社交能力",
  name: "说服",
  description: "试图说服他人接受你的观点",
  icon: "message-circle",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_INTIMIDATE: GameElement = {
  id: "ability-intimidate",
  type: "社交能力",
  name: "威吓",
  description: "用气势压制对方",
  icon: "angry",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_TRADE: GameElement = {
  id: "ability-trade",
  type: "社交能力",
  name: "交易",
  description: "与商人或NPC进行物品交换",
  icon: "coins",
  enabled: true,
  visible: true,
  children: [],
};

// --- 特殊能力 ---
export const ABILITY_STEALTH: GameElement = {
  id: "ability-stealth",
  type: "特殊能力",
  name: "潜行",
  description: "悄无声息地移动，避免被发现",
  icon: "eye-off",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_LOCKPICK: GameElement = {
  id: "ability-lockpick",
  type: "特殊能力",
  name: "开锁",
  description: "尝试打开上锁的门或箱子",
  icon: "key",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_CRAFT: GameElement = {
  id: "ability-craft",
  type: "特殊能力",
  name: "制作",
  description: "利用材料制作物品",
  icon: "hammer",
  enabled: true,
  visible: true,
  children: [],
};

// --- 科技能力 ---
export const ABILITY_HACK: GameElement = {
  id: "ability-hack",
  type: "科技能力",
  name: "黑入",
  description: "侵入电子系统获取信息或控制权",
  icon: "link",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_SCAN: GameElement = {
  id: "ability-scan",
  type: "科技能力",
  name: "扫描",
  description: "使用设备扫描分析目标",
  icon: "search",
  enabled: true,
  visible: true,
  children: [],
};

// --- 修仙能力 ---
export const ABILITY_MEDITATE: GameElement = {
  id: "ability-meditate",
  type: "修炼能力",
  name: "打坐",
  description: "静心修炼，恢复灵力",
  icon: "brain",
  enabled: true,
  visible: true,
  children: [],
};

export const ABILITY_SWORD_QI: GameElement = {
  id: "ability-sword-qi",
  type: "修炼能力",
  name: "剑气",
  description: "释放凝聚的剑意攻击敌人",
  icon: "sword",
  enabled: true,
  visible: true,
  children: [],
};

// ============================================
// 容器/系统模板
// ============================================

export const SLOT_INVENTORY: GameElement = {
  id: "slot-inventory",
  type: "容器",
  name: "背包",
  description: "存放随身物品的空间",
  icon: "backpack",
  enabled: true,
  visible: true,
  children: [],
};

export const SLOT_EQUIPMENT: GameElement = {
  id: "slot-equipment",
  type: "容器",
  name: "装备栏",
  description: "当前穿戴的装备",
  icon: "shield",
  enabled: true,
  visible: true,
  children: [],
};

export const SLOT_ABILITIES: GameElement = {
  id: "slot-abilities",
  type: "容器",
  name: "能力",
  description: "可使用的能力和技能",
  icon: "zap",
  enabled: true,
  visible: true,
  children: [],
};

export const SLOT_QUESTS: GameElement = {
  id: "slot-quests",
  type: "容器",
  name: "任务",
  description: "当前的任务和目标",
  icon: "scroll",
  enabled: true,
  visible: true,
  children: [],
};

export const SLOT_STATUS: GameElement = {
  id: "slot-status",
  type: "状态",
  name: "状态",
  description: "身体和精神状态",
  icon: "heart",
  enabled: true,
  visible: true,
  children: [],
};

// ============================================
// 能力集合
// ============================================

export const ABILITY_SET_BASIC: GameElement[] = [
  ABILITY_OBSERVE,
  ABILITY_TALK,
  ABILITY_SEARCH,
  ABILITY_REST,
  ABILITY_MOVE,
  ABILITY_USE,
];

export const ABILITY_SET_COMBAT: GameElement[] = [
  ABILITY_ATTACK,
  ABILITY_DEFEND,
  ABILITY_DODGE,
];

export const ABILITY_SET_MAGIC: GameElement[] = [
  ABILITY_CAST_FIRE,
  ABILITY_CAST_HEAL,
  ABILITY_CAST_LIGHT,
];

export const ABILITY_SET_SOCIAL: GameElement[] = [
  ABILITY_PERSUADE,
  ABILITY_INTIMIDATE,
  ABILITY_TRADE,
];

export const ABILITY_SET_STEALTH: GameElement[] = [
  ABILITY_STEALTH,
  ABILITY_LOCKPICK,
];

export const ABILITY_SET_CYBER: GameElement[] = [ABILITY_HACK, ABILITY_SCAN];

export const ABILITY_SET_CULTIVATION: GameElement[] = [
  ABILITY_MEDITATE,
  ABILITY_SWORD_QI,
];

// ============================================
// 世界预设
// ============================================

export interface WorldPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  theme: string;
  characterDesc: string;
  narrativeStyle: string;
  abilitySets: string[]; // 能力集合 ID
  includeSystems: {
    inventory: boolean;
    equipment: boolean;
    quests: boolean;
    status: boolean;
  };
  starterItems?: GameElement[];
}

// 起始物品模板
const ITEM_TORCH: GameElement = {
  id: "item-torch",
  type: "物品",
  name: "火把",
  description: "可以照亮周围的简陋火把",
  icon: "flame",
  enabled: true,
  visible: true,
  children: [],
};

const ITEM_BREAD: GameElement = {
  id: "item-bread",
  type: "物品",
  name: "干粮",
  description: "朴素但能填饱肚子的食物",
  icon: "box",
  enabled: true,
  visible: true,
  children: [],
};

const ITEM_POTION: GameElement = {
  id: "item-potion",
  type: "物品",
  name: "治疗药水",
  description: "红色的液体，可以恢复少量生命",
  icon: "flask-conical",
  enabled: true,
  visible: true,
  children: [],
};

const ITEM_BROKEN_SWORD: GameElement = {
  id: "item-broken-sword",
  type: "武器",
  name: "断剑",
  description: "残破但仍可使用的剑刃",
  icon: "sword",
  enabled: true,
  visible: true,
  children: [],
};

const ITEM_DATA_CHIP: GameElement = {
  id: "item-data-chip",
  type: "物品",
  name: "数据芯片",
  description: "存储着未知信息的芯片",
  icon: "layers",
  enabled: true,
  visible: true,
  children: [],
};

const ITEM_SPIRIT_STONE: GameElement = {
  id: "item-spirit-stone",
  type: "物品",
  name: "灵石",
  description: "蕴含灵气的晶石，修炼必备",
  icon: "gem",
  enabled: true,
  visible: true,
  children: [],
};

// 世界预设
export const WORLD_PRESETS: WorldPreset[] = [
  {
    id: "dungeon",
    name: "黑暗地牢",
    description: "经典的地下城探险，充满怪物、陷阱和宝藏",
    icon: "skull",
    theme:
      "阴暗潮湿的地下迷宫，石壁上爬满苔藓，火把的光芒摇曳不定。深处传来低沉的咆哮声...",
    characterDesc: "一名失去记忆的冒险者，在地牢入口处醒来，只带着一把断剑和模糊的使命感。",
    narrativeStyle: "黑暗奇幻风格，氛围紧张，描写细腻，偶尔带有黑色幽默",
    abilitySets: ["basic", "combat", "stealth"],
    includeSystems: {
      inventory: true,
      equipment: true,
      quests: true,
      status: true,
    },
    starterItems: [ITEM_BROKEN_SWORD, ITEM_TORCH, ITEM_POTION],
  },
  {
    id: "cyberpunk",
    name: "霓虹都市",
    description: "赛博朋克风格的未来城市，财团、黑客与街头文化交织",
    icon: "zap",
    theme:
      "2087年的新东京，霓虹灯永不熄灭，全息广告铺天盖地。巨型财团控制一切，而你只是夜城中的一个小角色...",
    characterDesc: "一名独立黑客，大脑植入了军用级神经接口。刚刚从一次失败的任务中逃脱，身上还带着重要的数据。",
    narrativeStyle: "冷硬派风格，对话简洁有力，充满科技术语和街头俚语",
    abilitySets: ["basic", "cyber", "social"],
    includeSystems: {
      inventory: true,
      equipment: true,
      quests: true,
      status: true,
    },
    starterItems: [ITEM_DATA_CHIP],
  },
  {
    id: "cultivation",
    name: "修仙世界",
    description: "东方玄幻风格，宗门林立，大道三千",
    icon: "cloud",
    theme:
      "灵气复苏的苍穹大陆，修仙者御剑飞行，宗门之间争斗不休。凡人仰望天空，期盼着踏入修行之路...",
    characterDesc:
      "一个资质平平的散修，意外获得一块神秘玉简，似乎记载着失传的功法。",
    narrativeStyle: "古风仙侠，辞藻华丽，注重意境，偶尔引用诗词",
    abilitySets: ["basic", "cultivation", "social"],
    includeSystems: {
      inventory: true,
      equipment: true,
      quests: true,
      status: true,
    },
    starterItems: [ITEM_SPIRIT_STONE],
  },
  {
    id: "wasteland",
    name: "末日废土",
    description: "核战后的荒原世界，生存才是第一要务",
    icon: "ghost",
    theme:
      "核战已过去两百年，世界变成了一片荒芜。变异生物游荡在废墟间，干净的水和食物比黄金还珍贵...",
    characterDesc:
      "废土上的拾荒者，从小在避难所长大，最近被迫离开家园，独自面对外面的世界。",
    narrativeStyle: "写实硬核，注重生存细节，对话粗犷直接，偶尔流露出人性的温暖",
    abilitySets: ["basic", "combat", "stealth"],
    includeSystems: {
      inventory: true,
      equipment: true,
      quests: false,
      status: true,
    },
    starterItems: [ITEM_BREAD],
  },
  {
    id: "magic-academy",
    name: "魔法学院",
    description: "神秘的魔法学校，学习咒语、结交朋友、解开谜团",
    icon: "book",
    theme:
      "千年历史的奥术学院坐落在云端，塔楼高耸入云，魔法生物在走廊间穿梭。新学期即将开始...",
    characterDesc:
      "一名刚入学的新生，出身普通却被学院破格录取。似乎有着不为人知的特殊天赋...",
    narrativeStyle: "轻松明快，充满奇思妙想，注重人物互动和成长",
    abilitySets: ["basic", "magic", "social"],
    includeSystems: {
      inventory: true,
      equipment: false,
      quests: true,
      status: false,
    },
    starterItems: [],
  },
  {
    id: "custom",
    name: "自定义世界",
    description: "从零开始，创造你自己的世界",
    icon: "globe",
    theme: "",
    characterDesc: "",
    narrativeStyle: "根据世界观自动适配",
    abilitySets: ["basic"],
    includeSystems: {
      inventory: true,
      equipment: false,
      quests: false,
      status: true,
    },
    starterItems: [],
  },
];

// ============================================
// 辅助函数
// ============================================

// 根据能力集合 ID 获取能力列表
export function getAbilitiesBySetIds(setIds: string[]): GameElement[] {
  const abilities: GameElement[] = [];
  const seen = new Set<string>();

  for (const setId of setIds) {
    let set: GameElement[] = [];
    switch (setId) {
      case "basic":
        set = ABILITY_SET_BASIC;
        break;
      case "combat":
        set = ABILITY_SET_COMBAT;
        break;
      case "magic":
        set = ABILITY_SET_MAGIC;
        break;
      case "social":
        set = ABILITY_SET_SOCIAL;
        break;
      case "stealth":
        set = ABILITY_SET_STEALTH;
        break;
      case "cyber":
        set = ABILITY_SET_CYBER;
        break;
      case "cultivation":
        set = ABILITY_SET_CULTIVATION;
        break;
    }

    for (const ability of set) {
      if (!seen.has(ability.id)) {
        seen.add(ability.id);
        abilities.push({ ...ability, id: `${ability.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` });
      }
    }
  }

  return abilities;
}

// 构建玩家预设结构
export function buildPlayerPreset(
  preset: WorldPreset,
  customAbilitySets?: string[]
): GameElement[] {
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
          type: "属性",
          name: "生命值",
          description: "100/100",
          icon: "heart",
          enabled: true,
          visible: true,
          children: [],
        },
      ],
    });
  }

  return elements;
}

// 能力集合显示信息
export const ABILITY_SET_INFO: Record<
  string,
  { name: string; description: string; icon: string }
> = {
  basic: {
    name: "基础能力",
    description: "观察、交谈、搜索等通用能力",
    icon: "eye",
  },
  combat: {
    name: "战斗能力",
    description: "攻击、防御、闪避",
    icon: "sword",
  },
  magic: {
    name: "魔法能力",
    description: "火球术、治愈术、照明术",
    icon: "flame",
  },
  social: {
    name: "社交能力",
    description: "说服、威吓、交易",
    icon: "message-circle",
  },
  stealth: {
    name: "潜行能力",
    description: "潜行、开锁",
    icon: "eye-off",
  },
  cyber: {
    name: "科技能力",
    description: "黑入、扫描",
    icon: "link",
  },
  cultivation: {
    name: "修炼能力",
    description: "打坐、剑气",
    icon: "cloud",
  },
};
