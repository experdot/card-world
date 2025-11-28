
import React, { useEffect, useRef, useState } from 'react';
import { GameElement, RichTextSegment, UserActionLog } from '../types';
import { parseRichNarrative } from '../services/geneartionService';

interface LogEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'user' | 'ai' | 'system';
  isStreaming?: boolean;
  action?: UserActionLog; // Structured action data for user logs
}

interface LogPanelProps {
  logs: LogEntry[];
  world: GameElement;
  onElementClick?: (elementId: string, elementType: string, elementName: string) => void;
}

// Helper to find element by id in the tree
const findElementById = (root: GameElement, id: string): GameElement | null => {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findElementById(child, id);
    if (found) return found;
  }
  return null;
};

// Blinking cursor component for streaming effect
const StreamingCursor: React.FC = () => (
  <span className="inline-block w-2 h-4 ml-0.5 bg-purple-400 animate-pulse" />
);

// Typewriter hook - animates text display character by character
const useTypewriter = (targetText: string, isStreaming: boolean, speed: number = 30) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const targetRef = useRef(targetText);
  const displayedRef = useRef('');

  useEffect(() => {
    targetRef.current = targetText;

    // If target text is longer than displayed, start typing
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
        // Type multiple characters at once for faster display (2-4 chars)
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

  // When streaming ends, immediately show all remaining text
  useEffect(() => {
    if (!isStreaming && targetText !== displayedRef.current) {
      displayedRef.current = targetText;
      setDisplayedText(targetText);
      setIsTyping(false);
    }
  }, [isStreaming, targetText]);

  return { displayedText, isTyping: isTyping || (isStreaming && displayedText.length < targetText.length) };
};

// Tooltip component for element hover
const ElementTooltip: React.FC<{
  element: GameElement;
  position: { x: number; y: number };
}> = ({ element, position }) => {
  return (
    <div
      className="fixed z-50 px-3 py-2 bg-slate-800 border border-purple-500/50 rounded-lg shadow-lg max-w-xs pointer-events-none"
      style={{
        left: position.x,
        top: position.y - 8,
        transform: 'translate(-50%, -100%)'
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
};

// Rich text segment renderer (supports nested segments)
const RichTextRenderer: React.FC<{
  segments: RichTextSegment[];
  world: GameElement;
  onElementClick?: (elementId: string, elementType: string, elementName: string) => void;
  showCursor?: boolean;
  // Internal props for nested rendering
  _hoveredElement?: { element: GameElement; position: { x: number; y: number } } | null;
  _setHoveredElement?: (el: { element: GameElement; position: { x: number; y: number } } | null) => void;
  _isNested?: boolean;
}> = ({ segments, world, onElementClick, showCursor, _hoveredElement, _setHoveredElement, _isNested }) => {
  const [localHoveredElement, setLocalHoveredElement] = useState<{
    element: GameElement;
    position: { x: number; y: number };
  } | null>(null);

  // Use passed hover state if nested, otherwise use local
  const hoveredElement = _isNested ? _hoveredElement : localHoveredElement;
  const setHoveredElement = _isNested ? _setHoveredElement : setLocalHoveredElement;

  const handleMouseEnter = (elementId: string, event: React.MouseEvent) => {
    const element = findElementById(world, elementId);
    if (element && setHoveredElement) {
      const rect = event.currentTarget.getBoundingClientRect();
      setHoveredElement({
        element,
        position: { x: rect.left + rect.width / 2, y: rect.top }
      });
    }
  };

  const handleMouseLeave = () => {
    if (setHoveredElement) {
      setHoveredElement(null);
    }
  };

  const handleClick = (elementId: string) => {
    const element = findElementById(world, elementId);
    if (element && onElementClick) {
      onElementClick(element.id, element.type, element.name);
    }
  };

  // Render children or plain content
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
        <ElementTooltip
          element={hoveredElement.element}
          position={hoveredElement.position}
        />
      )}
      {segments.map((segment, index) => {
        switch (segment.type) {
          case 'element':
            const elementExists = segment.elementId ? findElementById(world, segment.elementId) : null;
            return (
              <span
                key={index}
                className={`
                  inline-flex items-center mx-0.5 px-1.5 py-0.5 rounded
                  ${elementExists
                    ? 'bg-purple-900/50 text-purple-300 border border-purple-500/30 cursor-pointer hover:bg-purple-800/50 hover:border-purple-400/50 transition-colors'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'}
                `}
                onMouseEnter={(e) => segment.elementId && handleMouseEnter(segment.elementId, e)}
                onMouseLeave={handleMouseLeave}
                onClick={() => segment.elementId && elementExists && handleClick(segment.elementId)}
              >
                {elementExists && <span className="mr-1 text-xs">◆</span>}
                {renderContent(segment)}
              </span>
            );

          case 'emphasis':
            return (
              <span
                key={index}
                className="text-amber-300 font-medium"
              >
                {renderContent(segment)}
              </span>
            );

          case 'danger':
            return (
              <span
                key={index}
                className="text-red-400 font-medium"
              >
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

// Typewriter text component for AI messages
const TypewriterText: React.FC<{
  text: string;
  isStreaming: boolean;
  world: GameElement;
  onElementClick?: (elementId: string, elementType: string, elementName: string) => void;
}> = ({ text, isStreaming, world, onElementClick }) => {
  const { displayedText, isTyping } = useTypewriter(text, isStreaming);

  // Parse rich text for the currently displayed text
  const segments = displayedText ? parseRichNarrative(displayedText) : [];

  // Show cursor while typing or streaming
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
        // User action - inline style with optional tooltip for context
        if (log.type === 'user') {
          // If structured action data is available, show title: description with context as tooltip
          if (log.action) {
            const displayText = `${log.action.title}: ${log.action.description}`;
            return (
              <div
                key={log.id}
                className="animate-in fade-in duration-300 text-center py-2"
              >
                <span
                  className="text-slate-500 text-sm cursor-default"
                  title={log.action.context || undefined}
                >
                  {'>'} {displayText}
                </span>
              </div>
            );
          }
          // Fallback for plain text user logs
          return (
            <div
              key={log.id}
              className="animate-in fade-in duration-300 text-center py-2"
            >
              <span className="text-slate-500 text-sm">
                {'>'} {log.text}
              </span>
            </div>
          );
        }

        // System message
        if (log.type === 'system') {
          // Check if it's a system event indicator (starts with [)
          const isEventIndicator = log.text.startsWith('[');

          return (
            <div
              key={log.id}
              className="animate-in fade-in duration-300 text-center py-2"
            >
              {isEventIndicator ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/20 border border-purple-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span className="text-purple-300 text-xs font-medium">
                    {log.text}
                  </span>
                </div>
              ) : (
                <span className="text-slate-600 text-xs italic">
                  {log.text}
                </span>
              )}
            </div>
          );
        }

        // AI narrative - main content
        return (
          <div
            key={log.id}
            className="animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <div className={`
              text-slate-200 text-sm leading-loose tracking-wide
              ${log.isStreaming ? '' : ''}
            `}>
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
            {/* Separator after AI response */}
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
