/**
 * 动作面板组件
 */

import React from 'react';
import { Sparkles, RotateCcw, X } from 'lucide-react';
import type { SelectedElement } from '@/shared/types';

interface ActionPanelProps {
  selectedElements: SelectedElement[];
  onClear: () => void;
  onGenerateOptions: () => void;
  onRemoveElement: (id: string) => void;
  loading: boolean;
}

export const ActionPanel: React.FC<ActionPanelProps> = ({
  selectedElements,
  onClear,
  onGenerateOptions,
  onRemoveElement,
  loading,
}) => {
  const hasSelection = selectedElements.length > 0;

  return (
    <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 shadow-lg shrink-0 z-10">
      <div className="flex items-center gap-4">
        {/* 已选元素显示 */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-xs text-slate-500 shrink-0">已选择 ({selectedElements.length})</span>

          {selectedElements.length === 0 ? (
            <span className="text-slate-600 text-sm italic truncate">选择卡牌以查看行动...</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 items-center">
              {selectedElements.map((element) => (
                <div
                  key={element.id}
                  className="group flex items-center gap-1.5 px-2 py-1 bg-slate-800 border border-slate-700 rounded hover:border-purple-500 transition-colors"
                >
                  <span className="text-white text-sm">{element.name}</span>
                  <span className="text-slate-500 text-xs">({element.type})</span>
                  <button
                    onClick={() => onRemoveElement(element.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-slate-700 rounded transition-all"
                    title="移除"
                  >
                    <X size={12} className="text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 动作按钮 */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onClear}
            disabled={!hasSelection || loading}
            className="p-2 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="清除所有选择"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={onGenerateOptions}
            disabled={!hasSelection || loading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-white text-sm shadow-lg transition-all
              ${
                hasSelection && !loading
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:scale-105'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <>
                <Sparkles size={16} className="animate-pulse" />
                ...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                行动
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
