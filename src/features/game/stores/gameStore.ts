/**
 * 游戏状态管理 - Zustand Store
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  GameElement,
  LogEntry,
  SelectedElement,
  ActionOption,
  ChatMessage,
  LLMConfig,
  GameSettings,
  GameSave,
  AppScreen,
  GameSetupConfig,
  TurnResponse,
} from '@/shared/types';
import { MAX_CHAT_HISTORY, MAX_EVENT_CHAIN } from '@/shared/constants';
import { INITIAL_WORLD_STATE } from '@/data/presets';
import { applyOperations } from '@/features/world/services';
import { findNode, findPlayer } from '@/features/world/utils';
import {
  saveGame,
  getSettings,
  getDefaultSettings,
  getDefaultLLMConfig,
  generateSaveId,
} from '@/features/storage/services';
import {
  generateGameTurnStream,
  generateSystemEventStream,
  generateActionOptionsStream,
  generateInitialWorld,
} from '@/features/ai/services';

// 游戏状态接口
interface GameState {
  // 屏幕状态
  screen: AppScreen;

  // 世界状态
  world: GameElement;

  // 日志
  logs: LogEntry[];

  // 选择状态
  selectedElements: SelectedElement[];
  viewingElement: GameElement | null;
  scrollToId: string | null;

  // 选项状态
  options: ActionOption[];
  showOptions: boolean;
  generatingOptions: boolean;

  // 加载状态
  loading: boolean;
  initLoading: boolean;

  // LLM 配置
  settings: GameSettings;
  currentLLMConfig: LLMConfig | null;

  // 存档状态
  currentSaveId: string | null;
  saveName: string;
  createdAt: number;

  // 对话历史
  chatHistory: ChatMessage[];
}

// 游戏动作接口
interface GameActions {
  // 屏幕导航
  setScreen: (screen: AppScreen) => void;

  // 设置相关
  loadSettings: () => Promise<void>;

  // 游戏开始/继续
  startNewGame: (config: GameSetupConfig) => Promise<void>;
  continueGame: (save: GameSave) => void;
  returnToMenu: () => void;

  // 选择操作
  selectElement: (id: string, type: string, name: string) => void;
  removeElement: (id: string) => void;
  clearSelection: () => void;
  setScrollToId: (id: string | null) => void;

  // 选项操作
  generateOptions: () => Promise<void>;
  executeOption: (option: ActionOption) => Promise<void>;

  // 日志操作
  addLog: (text: string, type: LogEntry['type'], action?: LogEntry['action']) => void;
  updateStreamingLog: (id: string, text: string, isStreaming?: boolean) => void;

  // 世界操作
  updateWorld: (world: GameElement) => void;
}

// 创建 Store
export const useGameStore = create<GameState & GameActions>()(
  immer((set, get) => ({
    // 初始状态
    screen: 'menu',
    world: INITIAL_WORLD_STATE,
    logs: [],
    selectedElements: [],
    viewingElement: null,
    scrollToId: null,
    options: [],
    showOptions: false,
    generatingOptions: false,
    loading: false,
    initLoading: false,
    settings: getDefaultSettings(),
    currentLLMConfig: null,
    currentSaveId: null,
    saveName: '',
    createdAt: 0,
    chatHistory: [],

    // 屏幕导航
    setScreen: (screen) => {
      set({ screen });
    },

    // 加载设置
    loadSettings: async () => {
      try {
        const storedSettings = await getSettings();
        if (storedSettings) {
          const mergedSettings = { ...getDefaultSettings(), ...storedSettings };
          const defaultConfig = getDefaultLLMConfig(mergedSettings);
          set({
            settings: mergedSettings,
            currentLLMConfig: defaultConfig,
          });
        } else {
          set({
            settings: getDefaultSettings(),
            currentLLMConfig: null,
          });
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    },

    // 开始新游戏
    startNewGame: async (config) => {
      const { currentLLMConfig } = get();
      if (!currentLLMConfig) {
        alert('请先在设置中配置 LLM');
        return;
      }

      set({ initLoading: true });

      try {
        let newWorld: GameElement;
        let firstLog: string;

        if (config.skipAIEnhancement) {
          // 跳过 AI，使用预设
          const result = buildPresetWorld(config);
          newWorld = result.world;
          firstLog = result.firstLog;
        } else {
          // 使用 AI 生成
          const result = await generateInitialWorld(currentLLMConfig, config);
          newWorld = result.world;
          firstLog = result.firstLog;
        }

        // 初始化存档
        const newSaveId = generateSaveId();
        const newSaveName = config.worldTheme?.slice(0, 20) || '新冒险';
        const now = Date.now();

        const initialLogs: LogEntry[] = [
          { id: 'init', text: firstLog, timestamp: now, type: 'ai' },
        ];

        set({
          world: newWorld,
          logs: initialLogs,
          currentSaveId: newSaveId,
          saveName: newSaveName,
          createdAt: now,
          chatHistory: [],
          screen: 'game',
          initLoading: false,
          selectedElements: [],
          options: [],
          showOptions: false,
          viewingElement: null,
        });

        // 保存初始状态
        await saveGame({
          id: newSaveId,
          name: newSaveName,
          world: newWorld,
          logs: initialLogs,
          chatHistory: [],
          createdAt: now,
          updatedAt: now,
          previewText: firstLog.slice(0, 100),
        });

        // 自动选择玩家
        setTimeout(() => {
          const player = findPlayer(newWorld);
          if (player) {
            get().selectElement(player.id, player.type, player.name);
          }
        }, 500);
      } catch (e) {
        alert('世界生成失败: ' + e);
        set({ initLoading: false });
      }
    },

    // 继续游戏
    continueGame: (save) => {
      set({
        currentSaveId: save.id,
        saveName: save.name,
        world: save.world,
        logs: save.logs,
        chatHistory: save.chatHistory || [],
        createdAt: save.createdAt,
        screen: 'game',
        selectedElements: [],
        options: [],
        showOptions: false,
        viewingElement: null,
      });
    },

    // 返回主菜单
    returnToMenu: () => {
      set({
        world: INITIAL_WORLD_STATE,
        logs: [],
        selectedElements: [],
        options: [],
        showOptions: false,
        viewingElement: null,
        currentSaveId: null,
        saveName: '',
        chatHistory: [],
        screen: 'menu',
      });
    },

    // 选择元素
    selectElement: (id, type, name) => {
      const { world, selectedElements } = get();

      // 触发滚动
      set({ scrollToId: id });

      // 查找并设置查看元素
      const element = findNode(world, id);
      if (element) {
        set({ viewingElement: element });
      }

      // 切换选择
      const alreadySelected = selectedElements.some((e) => e.id === id);
      if (alreadySelected) {
        set({
          selectedElements: selectedElements.filter((e) => e.id !== id),
        });
      } else {
        set({
          selectedElements: [...selectedElements, { id, name, type }],
        });
      }
    },

    // 移除元素
    removeElement: (id) => {
      set((state) => {
        state.selectedElements = state.selectedElements.filter((e) => e.id !== id);
      });
    },

    // 清除选择
    clearSelection: () => {
      set({
        selectedElements: [],
        options: [],
        showOptions: false,
      });
    },

    // 设置滚动目标
    setScrollToId: (id) => {
      set({ scrollToId: id });
    },

    // 生成选项
    generateOptions: async () => {
      const { selectedElements, currentLLMConfig, world, chatHistory } = get();
      if (selectedElements.length === 0) return;

      if (!currentLLMConfig) {
        get().addLog('LLM 配置丢失，无法继续。', 'system');
        return;
      }

      set({
        generatingOptions: true,
        showOptions: true,
        options: [],
      });

      try {
        await generateActionOptionsStream(currentLLMConfig, world, selectedElements, chatHistory, {
          onOptionChunk: (option) => {
            if (option.id && option.title && option.description) {
              set((state) => {
                if (!state.options.find((o) => o.id === option.id)) {
                  state.options.push(option as ActionOption);
                }
              });
            }
          },
          onComplete: (allOptions) => {
            set({
              options: allOptions,
              generatingOptions: false,
            });
          },
          onError: (error) => {
            console.error('Option generation failed:', error);
            get().addLog('选项生成失败，请重试。', 'system');
            set({
              showOptions: false,
              generatingOptions: false,
            });
          },
        });
      } catch (error) {
        console.error('Option generation failed:', error);
        get().addLog('选项生成失败，请重试。', 'system');
        set({
          showOptions: false,
          generatingOptions: false,
        });
      }
    },

    // 执行选项
    executeOption: async (option) => {
      set({ showOptions: false });

      const actionData = {
        title: option.title,
        description: option.description,
        context: option.context,
      };

      let actionSentence = `${option.title}: ${option.description}`;
      if (option.context) {
        actionSentence += ` (${option.context})`;
      }

      await executeEventChain(get, set, actionSentence, true, undefined, actionData);
    },

    // 添加日志
    addLog: (text, type, action) => {
      set((state) => {
        state.logs.push({
          id: Math.random().toString(),
          text,
          timestamp: Date.now(),
          type,
          action,
        });
      });
    },

    // 更新流式日志
    updateStreamingLog: (id, text, isStreaming) => {
      set((state) => {
        const log = state.logs.find((l) => l.id === id);
        if (log) {
          log.text = text;
          if (isStreaming !== undefined) {
            log.isStreaming = isStreaming;
          }
        }
      });
    },

    // 更新世界
    updateWorld: (world) => {
      set({ world });
    },
  }))
);

// 辅助函数：构建预设世界
function buildPresetWorld(config: GameSetupConfig): { world: GameElement; firstLog: string } {
  const worldId = `world-${Date.now()}`;
  const locationId = `loc-${Date.now()}`;
  const playerId = `player-${Date.now()}`;

  const player: GameElement = {
    id: playerId,
    type: '角色',
    name: '玩家',
    description: config.characterDesc || '一名冒险者',
    icon: 'user',
    enabled: true,
    visible: true,
    children: config.presetElements || [],
  };

  const location: GameElement = {
    id: locationId,
    type: '地点',
    name: '起始之地',
    description: config.worldTheme || '一个神秘的地方',
    icon: 'map-pin',
    enabled: true,
    visible: true,
    children: [player],
  };

  const world: GameElement = {
    id: worldId,
    type: '世界',
    name: '世界',
    description: config.worldTheme || '等待探索的世界',
    icon: 'globe',
    enabled: false,
    visible: true,
    children: [location],
  };

  const firstLog = config.worldTheme
    ? `你来到了这个世界：${config.worldTheme.slice(0, 100)}${config.worldTheme.length > 100 ? '...' : ''}`
    : '你的冒险从这里开始...';

  return { world, firstLog };
}

// 辅助函数：执行事件链
async function executeEventChain(
  get: () => GameState & GameActions,
  set: (fn: (state: GameState & GameActions) => void) => void,
  initialAction: string,
  isPlayerAction: boolean = true,
  initialEventType?: string,
  actionData?: LogEntry['action']
) {
  const { currentLLMConfig, world: initialWorld, chatHistory: initialHistory } = get();

  if (!currentLLMConfig) {
    get().addLog('LLM 配置丢失，无法继续。', 'system');
    return;
  }

  set((state) => {
    state.loading = true;
  });

  // 添加初始日志
  if (isPlayerAction) {
    get().addLog(initialAction, 'user', actionData);
  }

  let currentWorld = initialWorld;
  let currentHistory = [...initialHistory];
  let eventCount = 0;
  let currentAction = initialAction;
  let currentEventType = initialEventType;
  let isCurrentPlayerAction = isPlayerAction;

  try {
    while (eventCount < MAX_EVENT_CHAIN) {
      eventCount++;

      // 创建流式日志
      const streamLogId = Math.random().toString();
      set((state) => {
        state.logs.push({
          id: streamLogId,
          text: '',
          timestamp: Date.now(),
          type: 'ai',
          isStreaming: true,
        });
      });

      // 生成响应
      const generateFunc = isCurrentPlayerAction ? generateGameTurnStream : generateSystemEventStream;

      let turnResponse: TurnResponse | null = null;

      const args = isCurrentPlayerAction
        ? [currentLLMConfig, currentWorld, currentAction, currentHistory]
        : [currentLLMConfig, currentWorld, currentEventType || '系统事件', currentAction, currentHistory];

      const result = await (generateFunc as (...args: unknown[]) => Promise<{ userMessage: string; assistantMessage: string }>)(
        ...args,
        {
          onNarrativeChunk: (chunk: string, fullNarrative: string) => {
            get().updateStreamingLog(streamLogId, fullNarrative);
          },
          onComplete: (response: TurnResponse) => {
            turnResponse = response;
            get().updateStreamingLog(streamLogId, response.narrative, false);

            // 应用操作更新世界
            currentWorld = applyOperations(currentWorld, response.operations);
            get().updateWorld(currentWorld);
          },
          onError: (error: Error) => {
            get().updateStreamingLog(streamLogId, '世界响应超时或出错，请重试。');
            set((state) => {
              const log = state.logs.find((l) => l.id === streamLogId);
              if (log) {
                log.type = 'system';
                log.isStreaming = false;
              }
            });
            console.error(error);
            throw error;
          },
        }
      );

      // 更新对话历史
      if (result.assistantMessage) {
        currentHistory.push(
          { role: 'user', content: result.userMessage },
          { role: 'assistant', content: result.assistantMessage }
        );

        // 限制历史长度
        if (currentHistory.length > MAX_CHAT_HISTORY) {
          currentHistory = currentHistory.slice(-MAX_CHAT_HISTORY);
        }

        set((state) => {
          state.chatHistory = currentHistory;
        });
      }

      // 检查后续事件
      if (turnResponse && turnResponse.hasFollowUpEvent) {
        currentAction = turnResponse.followUpEventDescription || '系统事件发生';
        currentEventType = turnResponse.followUpEventType || '系统事件';
        isCurrentPlayerAction = false;

        get().addLog(`[${currentEventType}] ${currentAction}`, 'system');
      } else {
        break;
      }
    }

    // 事件链完成
    get().clearSelection();
    set((state) => {
      state.loading = false;
    });

    // 自动保存
    const { currentSaveId, saveName, createdAt, logs } = get();
    if (currentSaveId) {
      await saveGame({
        id: currentSaveId,
        name: saveName || '存档',
        world: currentWorld,
        logs,
        chatHistory: currentHistory,
        createdAt,
        updatedAt: Date.now(),
        previewText: logs[logs.length - 1]?.text.slice(0, 100),
      });
    }
  } catch (error) {
    get().addLog('世界响应超时或出错，请重试。', 'system');
    console.error(error);
    set((state) => {
      state.loading = false;
    });
  }
}
