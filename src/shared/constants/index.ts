/**
 * 全局常量
 */

// 数据库配置
export const DB_NAME = 'aetheria-card-world';
export const DB_VERSION = 1;
export const SAVES_STORE = 'saves';
export const SETTINGS_STORE = 'settings';

// 对话历史限制
export const MAX_CHAT_HISTORY = 20;

// 事件链限制
export const MAX_EVENT_CHAIN = 5;

// 图标库
export const ICON_LIBRARY = [
  'user',
  'box',
  'map-pin',
  'key',
  'sword',
  'shield',
  'zap',
  'heart',
  'skull',
  'ghost',
  'flame',
  'droplet',
  'snowflake',
  'sun',
  'moon',
  'star',
  'cloud',
  'cloud-fog',
  'music',
  'message-circle',
  'eye',
  'eye-off',
  'lock',
  'unlock',
  'book',
  'scroll',
  'feather',
  'gem',
  'coins',
  'hammer',
  'wrench',
  'trash',
  'archive',
  'link',
  'layers',
  'image',
  'smile',
  'frown',
  'angry',
  'meh',
  'thumbs-up',
  'flag',
  'home',
  'castle',
  'tent',
  'door-open',
  'door-closed',
  'brick-wall',
  'search',
  'flask-conical',
  'scissors',
  'backpack',
  'brain',
  'box-select',
  'globe',
] as const;

export type IconName = (typeof ICON_LIBRARY)[number];
