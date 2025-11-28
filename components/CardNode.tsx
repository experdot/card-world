
import React, { useState, useRef, useEffect } from 'react';
import { GameElement, SelectedElement } from '../types';
import {
    ChevronRight, ChevronDown, Eye, EyeOff, Ban,
    Box, User, MapPin, Zap, Layers, Sparkles,
    Key, Sword, Shield, Heart, Skull, Ghost, Flame,
    Droplet, Snowflake, Sun, Moon, Star, Cloud, CloudFog,
    Music, MessageCircle, Lock, Unlock, Book, Scroll, Feather,
    Gem, Coins, Hammer, Wrench, Trash, Archive, Link, Image,
    Smile, Frown, Angry, Meh, ThumbsUp, Flag, Home, Castle,
    Tent, DoorOpen, DoorClosed, BrickWall, Search, FlaskConical,
    Scissors, Backpack, Brain, BoxSelect, Globe, Link2, ArrowRight
} from 'lucide-react';

interface CardNodeProps {
  element: GameElement;
  depth: number;
  onSelect: (id: string, type: string, name: string) => void;
  selectedElements: SelectedElement[];
  scrollToId?: string | null;
  onScrollComplete?: () => void;
}

// A dynamic map for Lucide icons
const IconMap: { [key: string]: React.ElementType } = {
    'world': Globe,
    'globe': Globe,
    'location': MapPin,
    'map-pin': MapPin,
    'character': User,
    'user': User,
    'ability': Zap,
    'zap': Zap,
    'item': Box,
    'box': Box,
    'building': Home,
    'home': Home,
    'concept': Sparkles,
    'sparkles': Sparkles,
    'key': Key,
    'sword': Sword,
    'shield': Shield,
    'heart': Heart,
    'skull': Skull,
    'ghost': Ghost,
    'flame': Flame,
    'droplet': Droplet,
    'snowflake': Snowflake,
    'sun': Sun,
    'moon': Moon,
    'star': Star,
    'cloud': Cloud,
    'cloud-fog': CloudFog,
    'music': Music,
    'message-circle': MessageCircle,
    'eye': Eye,
    'eye-off': EyeOff,
    'lock': Lock,
    'unlock': Unlock,
    'book': Book,
    'scroll': Scroll,
    'feather': Feather,
    'gem': Gem,
    'coins': Coins,
    'hammer': Hammer,
    'wrench': Wrench,
    'trash': Trash,
    'archive': Archive,
    'link': Link,
    'layers': Layers,
    'image': Image,
    'smile': Smile,
    'frown': Frown,
    'angry': Angry,
    'meh': Meh,
    'thumbs-up': ThumbsUp,
    'flag': Flag,
    'castle': Castle,
    'tent': Tent,
    'door-open': DoorOpen,
    'door-closed': DoorClosed,
    'brick-wall': BrickWall,
    'search': Search,
    'flask-conical': FlaskConical,
    'scissors': Scissors,
    'backpack': Backpack,
    'brain': Brain,
    'box-select': BoxSelect
};

const getIcon = (iconName?: string, type?: string) => {
    // 1. Try explicit icon name
    if (iconName && IconMap[iconName]) {
        const Icon = IconMap[iconName];
        return <Icon size={16} className="text-slate-300" />;
    }

    // 2. Fallback: Guess based on type string (Chinese or English)
    const lowerType = (type || '').toLowerCase();

    if (lowerType.includes('世界')) return <Globe size={16} className="text-purple-400" />;
    if (lowerType.includes('地点') || lowerType.includes('location')) return <MapPin size={16} className="text-green-400" />;
    if (lowerType.includes('角色') || lowerType.includes('character')) return <User size={16} className="text-blue-400" />;
    if (lowerType.includes('能力') || lowerType.includes('技能') || lowerType.includes('ability')) return <Zap size={16} className="text-yellow-400" />;
    if (lowerType.includes('物品') || lowerType.includes('item')) return <Box size={16} className="text-orange-400" />;
    if (lowerType.includes('建筑') || lowerType.includes('building')) return <BrickWall size={16} className="text-stone-400" />;
    if (lowerType.includes('卡槽') || lowerType.includes('slot') || lowerType.includes('容器')) return <BoxSelect size={14} className="text-gray-500" />;
    if (lowerType.includes('情绪') || lowerType.includes('memory')) return <Sparkles size={16} className="text-pink-400" />;
    if (lowerType.includes('状态') || lowerType.includes('属性')) return <Heart size={16} className="text-red-400" />;

    // 3. Default
    return <Box size={16} className="text-gray-400" />;
};

// Check if element or any descendant has the target id
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
  onScrollComplete
}) => {
  const [expanded, setExpanded] = useState(true);
  const nodeRef = useRef<HTMLDivElement>(null);

  // Auto-expand if scrollToId is in this subtree
  useEffect(() => {
    if (scrollToId && containsId(element, scrollToId) && element.id !== scrollToId) {
      setExpanded(true);
    }
  }, [scrollToId, element]);

  // Scroll into view if this is the target
  useEffect(() => {
    if (scrollToId === element.id && nodeRef.current) {
      nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash effect
      nodeRef.current.classList.add('animate-pulse');
      setTimeout(() => {
        nodeRef.current?.classList.remove('animate-pulse');
        onScrollComplete?.();
      }, 1000);
    }
  }, [scrollToId, element.id, onScrollComplete]);

  if (!element.visible) return null;

  const isSelected = selectedElements.some(e => e.id === element.id);

  const isSlot = element.type === '卡槽' || element.type === 'Slot' || element.type === '容器';
  const hasChildren = element.children && element.children.length > 0;
  const isRelationshipCard = element.isRelationship === true;

  // Styling based on state
  let borderClass = "border-slate-700";
  if (isSelected) borderClass = "border-purple-500 ring-2 ring-purple-500 bg-purple-900/20";

  // Opacity for disabled
  const opacityClass = element.enabled ? "opacity-100" : "opacity-50 grayscale";

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!element.enabled) return;
    onSelect(element.id, element.type, element.name);
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className={`flex flex-col ${depth > 0 ? 'ml-4' : ''} my-1`}>
      {/* Card Header / Body */}
      <div
        ref={nodeRef}
        className={`
          relative flex items-center p-2 rounded-md border transition-all duration-200
          ${isSlot ? 'bg-transparent border-dashed border-slate-600' : 'bg-slate-800 shadow-sm'}
          ${borderClass} ${opacityClass}
          ${element.enabled ? 'cursor-pointer hover:bg-slate-750 hover:border-slate-500' : 'cursor-not-allowed'}
        `}
        onClick={handleClick}
      >
        {/* Expand Toggle */}
        {hasChildren ? (
          <button onClick={toggleExpand} className="mr-2 text-slate-400 hover:text-white focus:outline-none">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <div className="w-5" /> /* Spacer */
        )}

        {/* Icon & Content */}
        <div className="flex-1 flex items-center gap-2 overflow-hidden">
          {getIcon(element.icon, element.type)}

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
                <span className={`font-medium text-sm truncate ${isSlot ? 'text-slate-500 uppercase tracking-wider text-xs' : 'text-slate-200'}`}>
                {element.name}
                </span>
                <span className="text-[10px] text-slate-600 bg-slate-950 px-1 rounded border border-slate-800">
                    {element.type}
                </span>
                {/* Relationship indicator */}
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

        {/* Status Indicators */}
        <div className="ml-2 flex gap-1 text-slate-500">
           {!element.visible && <EyeOff size={12} />}
           {!element.enabled && <Ban size={12} />}
        </div>
      </div>

      {/* Children (Recursive) */}
      {expanded && hasChildren && (
        <div className={`border-l border-slate-700 ml-2 pl-2 mt-1`}>
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
