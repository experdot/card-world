
import React, { useState, useEffect, useRef } from 'react';
import { GameElement, SelectionState, GameSetupConfig, ChatMessage, ActionOption, SelectedElement, UserActionLog } from './types';
import { INITIAL_WORLD_STATE } from './constants';
import { applyOperations } from './services/treeService';
import { generateGameTurnStream, generateInitialWorld, generateActionOptionsStream, generateSystemEventStream } from './services/geneartionService';
import {
  GameSave,
  GameSettings,
  LLMConfig,
  saveGame,
  getSettings,
  generateSaveId,
  getDefaultSettings,
  getDefaultLLMConfig,
} from './services/storageService';
import { CardNode } from './components/CardNode';
import { ActionPanel } from './components/ActionPanel';
import { LogPanel } from './components/LogPanel';
import { SetupScreen } from './components/SetupScreen';
import { OptionPanel } from './components/OptionPanel';
import { RelationshipPanel } from './components/RelationshipPanel';
import { MainMenu } from './components/MainMenu';
import { SettingsScreen } from './components/SettingsScreen';

// --- State Types ---
export interface LogEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'user' | 'ai' | 'system';
  isStreaming?: boolean; // For streaming AI responses
  action?: UserActionLog; // Structured action data for user logs
}

// App Screen Types
type AppScreen = 'menu' | 'setup' | 'game' | 'settings';

// --- App Component ---
export default function App() {
  // Screen Mode
  const [screen, setScreen] = useState<AppScreen>('menu');
  const [initLoading, setInitLoading] = useState(false);

  // World State
  const [world, setWorld] = useState<GameElement>(INITIAL_WORLD_STATE);

  // UI State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentLLMConfig, setCurrentLLMConfig] = useState<LLMConfig | null>(null);

  // Save State
  const [currentSaveId, setCurrentSaveId] = useState<string | null>(null);
  const [saveName, setSaveName] = useState<string>('');
  const [settings, setSettings] = useState<GameSettings>(getDefaultSettings());
  const createdAtRef = useRef<number>(0);

  // Conversation history for AI context
  const chatHistoryRef = useRef<ChatMessage[]>([]);

  // Scroll to element in tree
  const [scrollToId, setScrollToId] = useState<string | null>(null);

  // Selection State (new system)
  const [selection, setSelection] = useState<SelectionState>({
    elements: []
  });

  // Currently viewing element for relationships
  const [viewingElement, setViewingElement] = useState<GameElement | null>(null);

  // Options State
  const [options, setOptions] = useState<ActionOption[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [generatingOptions, setGeneratingOptions] = useState(false);

  // Load settings function
  const loadStoredSettings = async () => {
    try {
      const storedSettings = await getSettings();
      if (storedSettings) {
        const mergedSettings = { ...getDefaultSettings(), ...storedSettings };
        setSettings(mergedSettings);
        const defaultConfig = getDefaultLLMConfig(mergedSettings);
        setCurrentLLMConfig(defaultConfig);
      } else {
        setSettings(getDefaultSettings());
        setCurrentLLMConfig(null);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadStoredSettings();
  }, []);

  // Reload settings when returning from settings screen
  useEffect(() => {
    if (screen !== 'settings') {
      loadStoredSettings();
    }
  }, [screen]);

  // Real-time save on world/logs change
  useEffect(() => {
    if (screen !== 'game' || !currentSaveId) return;

    const performSave = async () => {
      try {
        const save: GameSave = {
          id: currentSaveId,
          name: saveName || '存档',
          world,
          logs,
          chatHistory: chatHistoryRef.current,
          createdAt: createdAtRef.current,
          updatedAt: Date.now(),
          previewText: logs[logs.length - 1]?.text.slice(0, 100),
        };
        await saveGame(save);
      } catch (error) {
        console.error('Save failed:', error);
      }
    };

    performSave();
  }, [world, logs, screen, currentSaveId, saveName]);

  const addLog = (text: string, type: 'user' | 'ai' | 'system', action?: UserActionLog) => {
    setLogs(prev => [...prev, { id: Math.random().toString(), text, timestamp: Date.now(), type, action }]);
  };

  // Build a simple preset world without AI enhancement
  const buildPresetWorld = (config: GameSetupConfig): { world: GameElement; firstLog: string } => {
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
  };

  const handleGameStart = async (config: GameSetupConfig) => {
    if (!currentLLMConfig) {
      alert("请先在设置中配置 LLM");
      return;
    }
    setInitLoading(true);
    try {
        let newWorld: GameElement;
        let firstLog: string;

        if (config.skipAIEnhancement) {
          // Skip AI, use preset directly
          const result = buildPresetWorld(config);
          newWorld = result.world;
          firstLog = result.firstLog;
        } else {
          // Use AI to generate initial world
          const result = await generateInitialWorld(currentLLMConfig, config);
          newWorld = result.world;
          firstLog = result.firstLog;
        }

        // Initialize new save
        const newSaveId = generateSaveId();
        const newSaveName = config.worldTheme?.slice(0, 20) || '新冒险';
        setCurrentSaveId(newSaveId);
        setSaveName(newSaveName);
        createdAtRef.current = Date.now();
        chatHistoryRef.current = [];

        setWorld(newWorld);
        const initialLogs = [{ id: 'init', text: firstLog, timestamp: Date.now(), type: 'ai' as const }];
        setLogs(initialLogs);
        setScreen('game');

        // Save initial state
        const initialSave: GameSave = {
          id: newSaveId,
          name: newSaveName,
          world: newWorld,
          logs: initialLogs,
          chatHistory: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          previewText: firstLog.slice(0, 100),
        };
        await saveGame(initialSave);

        // Auto-select player if found
        setTimeout(() => {
             const findPlayer = (root: GameElement): SelectedElement | null => {
                // Flexible check for player
                const isPlayer = (el: GameElement) =>
                    el.type.includes('角色') || el.type.includes('Player') || el.type.includes('Character') ||
                    el.name.includes('玩家') || el.name.includes('Player');

                if (isPlayer(root)) return { id: root.id, name: root.name, type: root.type };
                for (const c of root.children) {
                    const found = findPlayer(c);
                    if (found) return found;
                }
                return null;
            }
            const player = findPlayer(newWorld);
            if (player) {
                handleSelect(player.id, player.type, player.name);
            }
        }, 500);

    } catch (e) {
        alert("世界生成失败: " + e);
    } finally {
        setInitLoading(false);
    }
  };

  // Continue from saved game
  const handleContinueGame = (save: GameSave) => {
    setCurrentSaveId(save.id);
    setSaveName(save.name);
    setWorld(save.world);
    setLogs(save.logs);
    chatHistoryRef.current = save.chatHistory || [];
    createdAtRef.current = save.createdAt;
    setScreen('game');

    // Reset selection state
    setSelection({ elements: [] });
    setOptions([]);
    setShowOptions(false);
    setViewingElement(null);
  };

  // Return to main menu
  const handleReturnToMenu = () => {
    // Game is already saved in real-time, no need to save again

    // Reset game state
    setWorld(INITIAL_WORLD_STATE);
    setLogs([]);
    setSelection({ elements: [] });
    setOptions([]);
    setShowOptions(false);
    setViewingElement(null);
    setCurrentSaveId(null);
    setSaveName('');
    chatHistoryRef.current = [];

    setScreen('menu');
  };

  // Handle Card Selection Logic (also used when clicking elements in log)
  const handleSelect = (id: string, type: string, name: string) => {
    // Trigger scroll to the selected element
    setScrollToId(id);

    // Find the element to set as viewing
    const findElement = (root: GameElement, targetId: string): GameElement | null => {
      if (root.id === targetId) return root;
      for (const child of root.children) {
        const found = findElement(child, targetId);
        if (found) return found;
      }
      return null;
    };

    const element = findElement(world, id);
    if (element) {
      setViewingElement(element);
    }

    setSelection(prev => {
      // Check if already selected
      const alreadySelected = prev.elements.some(e => e.id === id);

      if (alreadySelected) {
        // Toggle off if already selected
        return {
          elements: prev.elements.filter(e => e.id !== id)
        };
      } else {
        // Add to selection
        return {
          elements: [...prev.elements, { id, name, type }]
        };
      }
    });
  };

  const removeElement = (id: string) => {
    setSelection(prev => ({
      elements: prev.elements.filter(e => e.id !== id)
    }));
  };

  const clearSelection = () => {
    setSelection({ elements: [] });
    setOptions([]);
    setShowOptions(false);
  };

  // Generate action options based on selected elements (with streaming)
  const handleGenerateOptions = async () => {
    if (selection.elements.length === 0) return;

    if (!currentLLMConfig) {
      addLog("LLM 配置丢失，无法继续。", 'system');
      return;
    }

    setGeneratingOptions(true);
    setShowOptions(true);
    setOptions([]);

    try {
      await generateActionOptionsStream(
        currentLLMConfig,
        world,
        selection.elements,
        chatHistoryRef.current,
        {
          onOptionChunk: (option) => {
            // Add option as it streams in
            if (option.id && option.title && option.description) {
              setOptions(prev => {
                // Check if already exists
                if (prev.find(o => o.id === option.id)) {
                  return prev;
                }
                return [...prev, option as ActionOption];
              });
            }
          },
          onComplete: (allOptions) => {
            setOptions(allOptions);
            setGeneratingOptions(false);
          },
          onError: (error) => {
            console.error("Option generation failed:", error);
            addLog("选项生成失败，请重试。", 'system');
            setShowOptions(false);
            setGeneratingOptions(false);
          }
        }
      );
    } catch (error) {
      console.error("Option generation failed:", error);
      addLog("选项生成失败，请重试。", 'system');
      setShowOptions(false);
      setGeneratingOptions(false);
    }
  };

  // Execute selected action option
  const handleExecuteOption = async (option: ActionOption) => {
    // Close options panel
    setShowOptions(false);

    // Construct action data for both AI and display
    const actionData: UserActionLog = {
      title: option.title,
      description: option.description,
      context: option.context,
    };

    // Construct full action sentence for AI (include all fields)
    let actionSentence = `${option.title}: ${option.description}`;
    if (option.context) {
      actionSentence += ` (${option.context})`;
    }

    // Execute event chain starting with player action
    await executeEventChain(actionSentence, true, undefined, actionData);
  };

  // Execute event chain (player action or system event)
  const executeEventChain = async (
    initialAction: string,
    isPlayerAction: boolean = true,
    initialEventType?: string,
    actionData?: UserActionLog
  ) => {
    if (!currentLLMConfig) {
      addLog("LLM 配置丢失，无法继续。", 'system');
      return;
    }

    setLoading(true);

    // Add initial log (with structured action data if available)
    if (isPlayerAction) {
      addLog(initialAction, 'user', actionData);
    }

    let currentWorld = world;
    let eventCount = 0;
    const MAX_EVENT_CHAIN = 5; // Prevent infinite loops
    let currentAction = initialAction;
    let currentEventType = initialEventType;
    let isCurrentPlayerAction = isPlayerAction;

    try {
      while (eventCount < MAX_EVENT_CHAIN) {
        eventCount++;

        // Create streaming log entry for this event
        const streamLogId = Math.random().toString();
        const logType = isCurrentPlayerAction ? 'ai' : 'ai';

        setLogs(prev => [...prev, {
          id: streamLogId,
          text: '',
          timestamp: Date.now(),
          type: logType,
          isStreaming: true
        }]);

        // Generate response based on action type
        const generateFunc = isCurrentPlayerAction
          ? generateGameTurnStream
          : generateSystemEventStream;

        const args = isCurrentPlayerAction
          ? [currentLLMConfig, currentWorld, currentAction, chatHistoryRef.current]
          : [currentLLMConfig, currentWorld, currentEventType || '系统事件', currentAction, chatHistoryRef.current];

        let turnResponse = null;
        let userMsg = '';
        let assistantMsg = '';

        const result = await (generateFunc as any)(...args,
          {
            onNarrativeChunk: (chunk: string, fullNarrative: string) => {
              setLogs(prev => prev.map(log =>
                log.id === streamLogId
                  ? { ...log, text: fullNarrative }
                  : log
              ));
            },
            onComplete: (response: any) => {
              turnResponse = response;

              // Finalize the log entry
              setLogs(prev => prev.map(log =>
                log.id === streamLogId
                  ? { ...log, text: response.narrative, isStreaming: false }
                  : log
              ));

              // Apply operations to update world state
              currentWorld = applyOperations(currentWorld, response.operations);
              setWorld(currentWorld);
            },
            onError: (error: Error) => {
              setLogs(prev => prev.map(log =>
                log.id === streamLogId
                  ? { ...log, text: "世界响应超时或出错，请重试。", type: 'system', isStreaming: false }
                  : log
              ));
              console.error(error);
              throw error;
            }
          }
        );

        userMsg = result.userMessage;
        assistantMsg = result.assistantMessage;

        // Add to conversation history
        if (assistantMsg) {
          chatHistoryRef.current.push(
            { role: 'user', content: userMsg },
            { role: 'assistant', content: assistantMsg }
          );

          // Keep history manageable
          if (chatHistoryRef.current.length > 20) {
            chatHistoryRef.current = chatHistoryRef.current.slice(-20);
          }
        }

        // Check if there's a follow-up event
        if (turnResponse && turnResponse.hasFollowUpEvent) {
          // Prepare for next iteration
          currentAction = turnResponse.followUpEventDescription || '系统事件发生';
          currentEventType = turnResponse.followUpEventType || '系统事件';
          isCurrentPlayerAction = false;

          // Add system event indicator log
          addLog(`[${currentEventType}] ${currentAction}`, 'system');

          // Continue loop
        } else {
          // No more events, break
          break;
        }
      }

      // Event chain complete
      clearSelection();
      setLoading(false);

    } catch (error) {
        addLog("世界响应超时或出错，请重试。", 'system');
        console.error(error);
        setLoading(false);
    }
  };

  // Render based on current screen
  if (screen === 'menu') {
    return (
      <MainMenu
        onNewGame={() => setScreen('setup')}
        onContinueGame={handleContinueGame}
        onOpenSettings={() => setScreen('settings')}
      />
    );
  }

  if (screen === 'settings') {
    return <SettingsScreen onBack={() => setScreen('menu')} />;
  }

  if (screen === 'setup') {
    // 使用新的向导式设置界面
    return (
      <SetupScreen
        onStart={handleGameStart}
        onBack={() => setScreen('menu')}
        onOpenSettings={() => setScreen('settings')}
        loading={initLoading}
        hasLLMConfig={!!currentLLMConfig}
      />
    );
  }

  // Game screen
  return (
    <div className="flex h-full flex-col md:flex-row font-sans text-slate-200">

      {/* Left: World Tree View + Relationship Panel */}
      <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col border-r border-slate-800 bg-[#151b2b]">
        <div className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex justify-between items-center">
            <button
              onClick={handleReturnToMenu}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1"
              title="返回主菜单"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </button>
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                Aetheria: 卡牌世界
            </h1>
            <div className="text-xs text-slate-500 border border-slate-800 px-2 py-1 rounded">
                Card Mode
            </div>
        </div>

        {/* World Tree */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700 min-h-0">
            <CardNode
                element={world}
                depth={0}
                onSelect={handleSelect}
                selectedElements={selection.elements}
                scrollToId={scrollToId}
                onScrollComplete={() => setScrollToId(null)}
            />
        </div>

        {/* Relationship Panel (bottom section) */}
        <div className="shrink-0 max-h-64 border-t border-slate-800 overflow-y-auto">
          <RelationshipPanel
            world={world}
            selectedElement={viewingElement}
            onElementClick={handleSelect}
          />
        </div>
      </div>

      {/* Right: Narrative & Action */}
      <div className="flex-1 flex flex-col h-[50vh] md:h-auto bg-[#0f172a]">

        {/* Narrative Logs */}
        <LogPanel logs={logs} world={world} onElementClick={handleSelect} />

        {/* Action Controls with floating Option Panel */}
        <div className="relative shrink-0">
          {/* Option Selection Panel (floating above) */}
          <OptionPanel
            options={options}
            onSelectOption={handleExecuteOption}
            loading={generatingOptions}
            visible={showOptions}
          />

          {/* Action Controls */}
          <ActionPanel
              selectedElements={selection.elements}
              onClear={clearSelection}
              onGenerateOptions={handleGenerateOptions}
              onRemoveElement={removeElement}
              loading={generatingOptions}
          />
        </div>
      </div>

    </div>
  );
}
