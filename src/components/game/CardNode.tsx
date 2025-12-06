/**
 * 卡牌节点组件
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronRight, ChevronDown, Link2, ArrowRight } from 'lucide-react';
import type { GameElement, SelectedElement } from '@/shared/types';
import { GameIcon } from '@/components/common/Icon';

interface CardNodeProps {
  element: GameElement;
  depth: number;
  onSelect: (id: string, type: string, name: string) => void;
  selectedElements: SelectedElement[];
  scrollToId?: string | null;
  onScrollComplete?: () => void;
}

// 检查元素或其后代是否包含目标 ID
const containsId = (element: GameElement, targetId: string): boolean => {
  if (element.id === targetId) return true;
  for (const child of element.children) {
    if (containsId(child, targetId)) return true;
  }
  return false;
};

export const CardNode: React.FC<CardNodeProps> = ({
  element,
  depth,
  onSelect,
  selectedElements,
  scrollToId,
  onScrollComplete,
}) => {
  // 计算是否应该因为滚动目标而展开
  const shouldExpandForScroll = useMemo(() => {
    return scrollToId && containsId(element, scrollToId) && element.id !== scrollToId;
  }, [scrollToId, element]);

  const [expanded, setExpanded] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);

  // 自动展开包含目标 ID 的子树（响应外部滚动目标变化）
  useEffect(() => {
    if (shouldExpandForScroll) {
      setExpanded(true);
    }
  }, [shouldExpandForScroll]);

  // 滚动到目标元素
  useEffect(() => {
    if (scrollToId === element.id && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nodeRef.current.classList.add('animate-pulse');
      setTimeout(() => {
        nodeRef.current?.classList.remove('animate-pulse');
        onScrollComplete?.();
      }, 1000);
    }
  }, [scrollToId, element.id, onScrollComplete]);

  const isSelected = selectedElements.some((e) => e.id === element.id);
  const isSlot = element.type === '卡槽' || element.type === 'Slot' || element.type === '容器';
  const hasChildren = element.children && element.children.length > 0;
  const isRelationshipCard = element.isRelationship === true;

  // 样式
  let borderClass = 'border-slate-700';
  if (isSelected) borderClass = 'border-purple-500 ring-2 ring-purple-500 bg-purple-900/20';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(element.id, element.type, element.name);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className={`flex flex-col ${depth > 0 ? 'ml-4' : ''} my-1`}>
      <div
        ref={nodeRef}
        className={`
          relative flex items-center p-2 rounded-md border transition-all duration-200
          ${isSlot ? 'bg-transparent border-dashed border-slate-600' : 'bg-slate-800 shadow-sm'}
          ${borderClass}
          cursor-pointer hover:bg-slate-750 hover:border-slate-500
        `}
        onClick={handleClick}
      >
        {/* 展开按钮 */}
        {hasChildren ? (
          <button
            onClick={toggleExpand}
            className="mr-2 text-slate-400 hover:text-white focus:outline-none"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-5" />
        )}

        {/* 图标和内容 */}
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          <GameIcon iconName={element.icon} type={element.type} />

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span
                className={`font-medium text-sm truncate ${isSlot ? 'text-slate-500 uppercase tracking-wider text-xs' : 'text-slate-200'}`}
              >
                {element.name}
              </span>
              <span className="text-[10px] text-slate-600 bg-slate-950 px-1 rounded border border-slate-800">
                {element.type}
              </span>
              {isRelationshipCard && (
                <div className="flex items-center gap-1 text-purple-400">
                  <Link2 size={10} />
                  <ArrowRight size={10} />
                </div>
              )}
            </div>
            {!isSlot && element.description && (
              <span className="text-xs text-slate-400 truncate max-w-[300px]">
                {element.description}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* 子节点 */}
      {expanded && hasChildren && (
        <div className="border-l border-slate-700 ml-2 pl-2 mt-1">
          {element.children.map((child) => (
            <CardNode
              key={child.id}
              element={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedElements={selectedElements}
              scrollToId={scrollToId}
              onScrollComplete={onScrollComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
