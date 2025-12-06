/**
 * 日志面板组件
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { GameElement, RichTextSegment, LogEntry } from '@/shared/types';
import { parseRichNarrative } from '@/features/ai/parsers';
import { findNode } from '@/features/world/utils';

interface LogPanelProps {
  logs: LogEntry[];
  world: GameElement;
  onElementClick?: (elementId: string, elementType: string, elementName: string) => void;
}

// 闪烁光标
const StreamingCursor: React.FC = () => (
  <span className="inline-block w-2 h-4 ml-0.5 bg-purple-400 animate-pulse" />
);

// 打字机 Hook
const useTypewriter = (targetText: string, isStreaming: boolean, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const targetRef = useRef(targetText);
  const displayedRef = useRef('');

  useEffect(() => {
    targetRef.current = targetText;
    if (targetText.length > displayedRef.current.length) {
      setIsTyping(true);
    }
  }, [targetText]);

  useEffect(() => {
    if (!isTyping) return;

    const typeNextChar = () => {
      const target = targetRef.current;
      const current = displayedRef.current;

      if (current.length < target.length) {
        const charsToAdd = Math.min(3, target.length - current.length);
        const newText = target.slice(0, current.length + charsToAdd);
        displayedRef.current = newText;
        setDisplayedText(newText);
      } else {
        setIsTyping(false);
      }
    };

    const timer = setTimeout(typeNextChar, speed);
    return () => clearTimeout(timer);
  }, [isTyping, displayedText, speed]);

  useEffect(() => {
    if (!isStreaming && targetText !== displayedRef.current) {
      displayedRef.current = targetText;
      setDisplayedText(targetText);
      setIsTyping(false);
    }
  }, [isStreaming, targetText]);

  return {
    displayedText,
    isTyping: isTyping || (isStreaming && displayedText.length < targetText.length),
  };
};

// 元素悬停提示
const ElementTooltip: React.FC<{
  element: GameElement;
  position: { x: number; y: number };
}> = ({ element, position }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y - 8;

      // 水平边界检测
      const halfWidth = rect.width / 2;
      if (newX - halfWidth < 8) {
        newX = halfWidth + 8;
      } else if (newX + halfWidth > viewportWidth - 8) {
        newX = viewportWidth - halfWidth - 8;
      }

      // 垂直边界检测：如果上方空间不够，显示在下方
      if (newY - rect.height < 8) {
        newY = position.y + 32; // 显示在元素下方
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [position]);

  const tooltip = (
    <div
      ref={tooltipRef}
      className="fixed z-[9999] px-3 py-2 bg-slate-800 border border-purple-500/50 rounded-lg shadow-lg max-w-xs pointer-events-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="text-sm font-medium text-purple-300">{element.name}</div>
      <div className="text-xs text-slate-400">{element.type}</div>
      {element.description && (
        <div className="text-xs text-slate-300 mt-1 border-t border-slate-700 pt-1">
          {element.description}
        </div>
      )}
    </div>
  );

  return createPortal(tooltip, document.body);
};

// 富文本渲染器
const RichTextRenderer: React.FC<{
  segments: RichTextSegment[];
  world: GameElement;
  onElementClick?: (elementId: string, elementType: string, elementName: string) => void;
  showCursor?: boolean;
  _hoveredElement?: { element: GameElement; position: { x: number; y: number } } | null;
  _setHoveredElement?: (
    el: { element: GameElement; position: { x: number; y: number } } | null
  ) => void;
  _isNested?: boolean;
}> = ({
  segments,
  world,
  onElementClick,
  showCursor,
  _hoveredElement,
  _setHoveredElement,
  _isNested,
}) => {
  const [localHoveredElement, setLocalHoveredElement] = useState<{
    element: GameElement;
    position: { x: number; y: number };
  } | null>(null);

  const hoveredElement = _isNested ? _hoveredElement : localHoveredElement;
  const setHoveredElement = _isNested ? _setHoveredElement : setLocalHoveredElement;

  const handleMouseEnter = (elementId: string, event: React.MouseEvent) => {
    const element = findNode(world, elementId);
    if (element && setHoveredElement) {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoveredElement({
        element,
        position: { x: rect.left + rect.width / 2, y: rect.top },
      });
    }
  };

  const handleMouseLeave = () => {
    if (setHoveredElement) {
      setHoveredElement(null);
    }
  };

  const handleClick = (elementId: string) => {
    const element = findNode(world, elementId);
    if (element && onElementClick) {
      onElementClick(element.id, element.type, element.name);
    }
  };

  const renderContent = (segment: RichTextSegment) => {
    if (segment.children && segment.children.length > 0) {
      return (
        <RichTextRenderer
          segments={segment.children}
          world={world}
          onElementClick={onElementClick}
          _hoveredElement={hoveredElement}
          _setHoveredElement={setHoveredElement}
          _isNested={true}
        />
      );
    }
    return segment.content;
  };

  return (
    <>
      {!_isNested && hoveredElement && (
        <ElementTooltip element={hoveredElement.element} position={hoveredElement.position} />
      )}
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'element': {
            const elementExists = segment.elementId ? findNode(world, segment.elementId) : null;
            return (
              <span
                key={index}
                className={`
                  inline-flex items-center mx-0.5 px-1.5 py-0.5 rounded
                  ${
                    elementExists
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30 cursor-pointer hover:bg-purple-800/50 hover:border-purple-400/50 transition-colors'
                      : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                  }
                `}
                onMouseEnter={(e) => segment.elementId && handleMouseEnter(segment.elementId, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => segment.elementId && elementExists && handleClick(segment.elementId)}
              >
                {elementExists && <span className="mr-1 text-xs">&#9670;</span>}
                {renderContent(segment)}
              </span>
            );
          }

          case 'emphasis':
            return (
              <span key={index} className="text-amber-300 font-medium">
                {renderContent(segment)}
              </span>
            );

          case 'danger':
            return (
              <span key={index} className="text-red-400 font-medium">
                {renderContent(segment)}
              </span>
            );

          case 'text':
          default:
            return <span key={index}>{segment.content}</span>;
        }
      })}
      {showCursor && <StreamingCursor />}
    </>
  );
};

// 打字机文本组件
const TypewriterText: React.FC<{
  text: string;
  isStreaming: boolean;
  world: GameElement;
  onElementClick?: (elementId: string, elementType: string, elementName: string) => void;
}> = ({ text, isStreaming, world, onElementClick }) => {
  const { displayedText, isTyping } = useTypewriter(text, isStreaming);
  const segments = displayedText ? parseRichNarrative(displayedText) : [];
  const showCursor = isTyping || isStreaming;

  if (segments.length === 0 && showCursor) {
    return <StreamingCursor />;
  }

  return (
    <RichTextRenderer
      segments={segments}
      world={world}
      onElementClick={onElementClick}
      showCursor={showCursor}
    />
  );
};

export const LogPanel: React.FC<LogPanelProps> = ({ logs, world, onElementClick }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4 bg-gradient-to-b from-slate-950 to-slate-900 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
      {logs.map((log, index) => {
        // 用户行动
        if (log.type === 'user') {
          if (log.action) {
            const displayText = `${log.action.title}: ${log.action.description}`;
            return (
              <div key={log.id} className="animate-in fade-in duration-300 text-center py-2">
                <span
                  className="text-slate-500 text-sm cursor-default"
                  title={log.action.context || undefined}
                >
                  {'>'} {displayText}
                </span>
              </div>
            );
          }
          return (
            <div key={log.id} className="animate-in fade-in duration-300 text-center py-2">
              <span className="text-slate-500 text-sm">
                {'>'} {log.text}
              </span>
            </div>
          );
        }

        // 系统消息
        if (log.type === 'system') {
          const isEventIndicator = log.text.startsWith('[');

          return (
            <div key={log.id} className="animate-in fade-in duration-300 text-center py-2">
              {isEventIndicator ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/20 border border-purple-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-purple-300 text-xs font-medium">{log.text}</span>
                </div>
              ) : (
                <span className="text-slate-600 text-xs italic">{log.text}</span>
              )}
            </div>
          );
        }

        // AI 叙事
        return (
          <div key={log.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-slate-200 text-sm leading-loose tracking-wide">
              {log.isStreaming && !log.text && (
                <span className="text-slate-500 text-xs">
                  <StreamingCursor />
                </span>
              )}
              <TypewriterText
                text={log.text}
                isStreaming={!!log.isStreaming}
                world={world}
                onElementClick={onElementClick}
              />
            </div>
            {/* 分隔符 */}
            {!log.isStreaming && index < logs.length - 1 && (
              <div className="flex items-center justify-center my-6">
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
                <span className="mx-3 text-slate-700 text-xs">*</span>
                <div className="h-px w-16 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
              </div>
            )}
          </div>
        );
      })}
      <div ref={bottomRef} className="h-4" />
    </div>
  );
};
