/**
 * 游戏核心类型定义
 */

// 游戏元素（卡牌）
export interface GameElement {
  id: string;
  type: string; // 任意字符串类型 (如 "物品", "概念", "NPC", "关系")
  name: string;
  description?: string;
  icon?: string; // 图标名称，由 LLM 决定
  enabled?: boolean;
  visible?: boolean;
  children: GameElement[];

  // 关系卡牌属性 (可选，仅用于关系卡牌)
  isRelationship?: boolean;
  sourceId?: string;
  targetId?: string;
}

// 操作类型
export enum OperationType {
  NEW = 'new',
  DELETE = 'delete',
  UPDATE = 'update',
  MOVE = 'move',
  DUPLICATE = 'duplicate',
}

// 游戏操作
export interface GameOperation {
  tool: OperationType | string;
  args: {
    id?: string;
    parentId?: string;
    newParentId?: string;
    type?: string;
    name?: string;
    description?: string;
    icon?: string;
    enabled?: boolean;
    visible?: boolean;
    // 关系字段
    isRelationship?: boolean;
    sourceId?: string;
    targetId?: string;
  };
}

// 回合响应
export interface TurnResponse {
  narrative: string;
  operations: GameOperation[];
  // 事件链支持
  hasFollowUpEvent?: boolean;
  followUpEventType?: string;
  followUpEventDescription?: string;
}

// 游戏设置配置
export interface GameSetupConfig {
  worldTheme: string;
  characterDesc: string;
  narrativeStyle: string;
  systems: string[]; // 如 ['inventory', 'abilities', 'quests']
  presetElements?: GameElement[];
  skipAIEnhancement?: boolean;
}

// 聊天消息（AI 对话历史）
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// AI 生成的行动选项
export interface ActionOption {
  id: string;
  title: string;
  description: string;
  context?: string;
}
