/**
 * 存储相关类型定义
 */

import type { GameElement, ChatMessage } from './game';
import type { LogEntry } from './ui';

// 游戏存档
export interface GameSave {
  id: string;
  name: string;
  world: GameElement;
  logs: LogEntry[];
  chatHistory: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  previewText?: string;
}

// LLM 配置
export interface LLMConfig {
  id: string;
  name: string;
  apiKey: string;
  apiHost: string;
  apiModel: string;
}

// 游戏设置
export interface GameSettings {
  llmConfigs: LLMConfig[];
  defaultLLMId: string;
}
