/**
 * 关系面板组件
 */

import React from 'react';
import { Link2, ArrowRight, Heart } from 'lucide-react';
import type { GameElement } from '@/shared/types';
import { findRelationshipsInvolving, findNode } from '@/features/world/utils';

interface RelationshipPanelProps {
  world: GameElement;
  selectedElement: GameElement | null;
  onElementClick: (id: string, type: string, name: string) => void;
}

export const RelationshipPanel: React.FC<RelationshipPanelProps> = ({
  world,
  selectedElement,
  onElementClick,
}) => {
  if (!selectedElement) {
    return (
      <div className="bg-slate-900/30 p-3 flex items-center justify-center">
        <p className="text-slate-600 text-xs">选择元素查看关系</p>
      </div>
    );
  }

  const relationships = findRelationshipsInvolving(world, selectedElement.id);

  const outgoing = relationships.filter((r) => r.sourceId === selectedElement.id);
  const incoming = relationships.filter((r) => r.targetId === selectedElement.id);

  if (relationships.length === 0) {
    return (
      <div className="bg-slate-900/30 p-3">
        <div className="flex items-center gap-2 text-slate-600">
          <Link2 size={14} />
          <span className="text-xs">{selectedElement.name} 暂无关系</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900/30 flex flex-col">
      {/* 头部 */}
      <div className="p-3 border-b border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Link2 className="text-purple-400" size={16} />
          <h3 className="text-xs font-semibold text-purple-300">
            {selectedElement.name} 的关系 ({relationships.length})
          </h3>
        </div>
      </div>

      {/* 关系列表 */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* 发出的关系 */}
        {outgoing.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <ArrowRight size={14} />
              发出的关系 ({outgoing.length})
            </h4>
            <div className="space-y-2">
              {outgoing.map((rel) => {
                const target = rel.targetId ? findNode(world, rel.targetId) : null;
                return (
                  <div
                    key={rel.id}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-purple-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="text-purple-400" size={14} />
                      <span className="text-white text-sm font-medium">{rel.name}</span>
                    </div>

                    {rel.description && (
                      <p className="text-xs text-slate-400 mb-2">{rel.description}</p>
                    )}

                    {target && (
                      <button
                        onClick={() => onElementClick(target.id, target.type, target.name)}
                        className="flex items-center gap-2 text-xs text-purple-300 hover:text-purple-200 transition-colors"
                      >
                        <ArrowRight size={12} />
                        <span>{target.name}</span>
                        <span className="text-slate-600">({target.type})</span>
                      </button>
                    )}

                    {rel.children.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-slate-700 space-y-1">
                        {rel.children.map((child) => (
                          <div key={child.id} className="text-xs text-slate-500">
                            <span className="text-slate-400">{child.name}:</span> {child.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 接收的关系 */}
        {incoming.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-2">
              <ArrowRight size={14} className="rotate-180" />
              接收的关系 ({incoming.length})
            </h4>
            <div className="space-y-2">
              {incoming.map((rel) => {
                const source = rel.sourceId ? findNode(world, rel.sourceId) : null;
                return (
                  <div
                    key={rel.id}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:border-blue-500/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="text-blue-400" size={14} />
                      <span className="text-white text-sm font-medium">{rel.name}</span>
                    </div>

                    {rel.description && (
                      <p className="text-xs text-slate-400 mb-2">{rel.description}</p>
                    )}

                    {source && (
                      <button
                        onClick={() => onElementClick(source.id, source.type, source.name)}
                        className="flex items-center gap-2 text-xs text-blue-300 hover:text-blue-200 transition-colors"
                      >
                        <ArrowRight size={12} className="rotate-180" />
                        <span>{source.name}</span>
                        <span className="text-slate-600">({source.type})</span>
                      </button>
                    )}

                    {rel.children.length > 0 && (
                      <div className="mt-2 pl-4 border-l-2 border-slate-700 space-y-1">
                        {rel.children.map((child) => (
                          <div key={child.id} className="text-xs text-slate-500">
                            <span className="text-slate-400">{child.name}:</span> {child.description}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
