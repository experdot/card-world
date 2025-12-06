/**
 * 游戏主屏幕
 */

import React from 'react';
import { Menu } from 'lucide-react';
import { useGameStore } from '@/features/game/stores';
import { CardNode, ActionPanel, OptionPanel, LogPanel, RelationshipPanel } from '@/components/game';

interface GameScreenProps {
  onReturnToMenu: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onReturnToMenu }) => {
  const {
    world,
    logs,
    selectedElements,
    viewingElement,
    scrollToId,
    options,
    showOptions,
    generatingOptions,
    loading,
    selectElement,
    removeElement,
    clearSelection,
    setScrollToId,
    generateOptions,
    executeOption,
  } = useGameStore();

  return (
    <div className="fixed inset-0 flex flex-col bg-slate-950 text-slate-200 overflow-hidden">
      {/* 顶部栏 */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center px-4 shrink-0">
        <button
          onClick={onReturnToMenu}
          className="p-2 rounded hover:bg-slate-800 transition-colors"
          title="返回主菜单"
        >
          <Menu size={20} className="text-slate-400" />
        </button>
        <h1 className="ml-4 text-lg font-semibold text-slate-300">Aetheria</h1>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* 左侧：世界树 */}
        <div className="w-80 shrink-0 bg-slate-900/50 border-r border-slate-800 flex flex-col min-h-0">
          <div className="p-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400">世界</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            <CardNode
              element={world}
              depth={0}
              onSelect={selectElement}
              selectedElements={selectedElements}
              scrollToId={scrollToId}
              onScrollComplete={() => setScrollToId(null)}
            />
          </div>
          {/* 关系面板 */}
          <div className="border-t border-slate-800 max-h-48 overflow-y-auto">
            <RelationshipPanel
              world={world}
              selectedElement={viewingElement}
              onElementClick={selectElement}
            />
          </div>
        </div>

        {/* 中间：日志 */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <LogPanel logs={logs} world={world} onElementClick={selectElement} />

          {/* 动作区 */}
          <div className="relative shrink-0">
            <OptionPanel
              options={options}
              onSelectOption={executeOption}
              loading={generatingOptions}
              visible={showOptions}
            />
            <ActionPanel
              selectedElements={selectedElements}
              onClear={clearSelection}
              onGenerateOptions={generateOptions}
              onRemoveElement={removeElement}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
