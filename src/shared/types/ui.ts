/**
 * UI 相关类型定义
 */

// 用户行动日志（结构化显示）
export interface UserActionLog {
  title: string;
  description: string;
  context?: string;
}

// 日志条目
export interface LogEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'user' | 'ai' | 'system';
  isStreaming?: boolean;
  action?: UserActionLog;
}

// 选中的元素
export interface SelectedElement {
  id: string;
  name: string;
  type: string;
}

// 选择状态
export interface SelectionState {
  elements: SelectedElement[];
}

// 富文本段落类型
export type RichTextSegmentType = 'text' | 'element' | 'emphasis' | 'danger';

// 富文本段落
export interface RichTextSegment {
  type: RichTextSegmentType;
  content: string;
  elementId?: string;
  children?: RichTextSegment[];
}

// 应用屏幕类型
export type AppScreen = 'menu' | 'setup' | 'game' | 'settings';
