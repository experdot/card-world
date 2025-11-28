
import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { ActionOption } from '../types';

interface OptionPanelProps {
  options: ActionOption[];
  onSelectOption: (option: ActionOption) => void;
  loading?: boolean;
  visible: boolean;
}

export const OptionPanel: React.FC<OptionPanelProps> = ({
  options,
  onSelectOption,
  loading = false,
  visible
}) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 mx-4 bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-20">
      {/* Header */}
      <div className="px-4 py-2 border-b border-slate-800/50 flex items-center gap-2">
        <Sparkles className="text-purple-400" size={16} />
        <h3 className="text-sm font-semibold text-purple-300">可选行动</h3>
        {loading && (
          <span className="text-xs text-slate-500 ml-1">加载中...</span>
        )}
      </div>

      {/* Options List */}
      <div className="px-4 py-3 overflow-y-auto space-y-2">
        {loading && options.length === 0 ? (
          <div className="text-center py-6 text-slate-500">
            <Loader2 className="animate-spin mx-auto mb-2" size={20} />
          </div>
        ) : (
          options.map((option, index) => (
            <button
              key={option.id}
              onClick={() => onSelectOption(option)}
              className="w-full text-left p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-purple-500/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                {/* Number Badge */}
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white group-hover:text-purple-300 transition-colors mb-1">
                    {option.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {option.description}
                  </p>
                  {option.context && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      {option.context}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
