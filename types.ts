export interface GameElement {
  id: string;
  type: string; // Arbitrary string (e.g., "物品", "概念", "NPC", "关系")
  name: string;
  description?: string;
  icon?: string; // Icon name determined by LLM
  enabled?: boolean;
  visible?: boolean;
  children: GameElement[];

  // Relationship properties (optional, only for relationship cards)
  isRelationship?: boolean; // True if this is a relationship card
  sourceId?: string; // ID of the source element
  targetId?: string; // ID of the target element
}

export enum OperationType {
  NEW = "new",
  DELETE = "delete",
  UPDATE = "update",
  MOVE = "move",
  DUPLICATE = "duplicate",
}

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
    // Relationship fields
    isRelationship?: boolean;
    sourceId?: string;
    targetId?: string;
  };
}

export interface TurnResponse {
  narrative: string;
  operations: GameOperation[];
  // Event chain support
  hasFollowUpEvent?: boolean; // Whether there's a system event to follow
  followUpEventType?: string; // Type of follow-up event (环境变化、NPC反应、意外、连锁反应等)
  followUpEventDescription?: string; // Brief description of what will happen
}

// For multi-element selection (new system)
export interface SelectedElement {
  id: string;
  name: string;
  type: string;
}

export interface SelectionState {
  elements: SelectedElement[]; // Changed to array of selected elements
}

// AI-generated action option
export interface ActionOption {
  id: string;
  title: string; // Short action title
  description: string; // What will happen if chosen
  context?: string; // Optional context/flavor text
}

// User action log entry (structured for rich display)
export interface UserActionLog {
  title: string;
  description: string;
  context?: string;
}

export interface GameSetupConfig {
  worldTheme: string;
  characterDesc: string;
  narrativeStyle: string;
  systems: string[]; // e.g. ['inventory', 'abilities', 'quests']
  presetElements?: GameElement[]; // Pre-built elements to merge into world
  skipAIEnhancement?: boolean; // Skip AI world generation, use preset directly
}

// Rich text segment types for narrative rendering
export type RichTextSegmentType = 'text' | 'element' | 'emphasis' | 'danger';

export interface RichTextSegment {
  type: RichTextSegmentType;
  content: string;
  elementId?: string; // For 'element' type - the referenced game element id
  children?: RichTextSegment[]; // For nested markup support
}

// Chat message for conversation history
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
