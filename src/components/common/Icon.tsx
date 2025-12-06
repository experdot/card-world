/**
 * 图标映射组件
 */

import React from 'react';
import {
  Box,
  User,
  MapPin,
  Zap,
  Sparkles,
  Key,
  Sword,
  Shield,
  Heart,
  Skull,
  Ghost,
  Flame,
  Droplet,
  Snowflake,
  Sun,
  Moon,
  Star,
  Cloud,
  CloudFog,
  Music,
  MessageCircle,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Book,
  Scroll,
  Feather,
  Gem,
  Coins,
  Hammer,
  Wrench,
  Trash,
  Archive,
  Link,
  Layers,
  Image,
  Smile,
  Frown,
  Angry,
  Meh,
  ThumbsUp,
  Flag,
  Home,
  Castle,
  Tent,
  DoorOpen,
  DoorClosed,
  BrickWall,
  Search,
  FlaskConical,
  Scissors,
  Backpack,
  Brain,
  BoxSelect,
  Globe,
} from 'lucide-react';

// 图标映射表
export const IconMap: { [key: string]: React.ElementType } = {
  world: Globe,
  globe: Globe,
  location: MapPin,
  'map-pin': MapPin,
  character: User,
  user: User,
  ability: Zap,
  zap: Zap,
  item: Box,
  box: Box,
  building: Home,
  home: Home,
  concept: Sparkles,
  sparkles: Sparkles,
  key: Key,
  sword: Sword,
  shield: Shield,
  heart: Heart,
  skull: Skull,
  ghost: Ghost,
  flame: Flame,
  droplet: Droplet,
  snowflake: Snowflake,
  sun: Sun,
  moon: Moon,
  star: Star,
  cloud: Cloud,
  'cloud-fog': CloudFog,
  music: Music,
  'message-circle': MessageCircle,
  eye: Eye,
  'eye-off': EyeOff,
  lock: Lock,
  unlock: Unlock,
  book: Book,
  scroll: Scroll,
  feather: Feather,
  gem: Gem,
  coins: Coins,
  hammer: Hammer,
  wrench: Wrench,
  trash: Trash,
  archive: Archive,
  link: Link,
  layers: Layers,
  image: Image,
  smile: Smile,
  frown: Frown,
  angry: Angry,
  meh: Meh,
  'thumbs-up': ThumbsUp,
  flag: Flag,
  castle: Castle,
  tent: Tent,
  'door-open': DoorOpen,
  'door-closed': DoorClosed,
  'brick-wall': BrickWall,
  search: Search,
  'flask-conical': FlaskConical,
  scissors: Scissors,
  backpack: Backpack,
  brain: Brain,
  'box-select': BoxSelect,
};

interface GameIconProps {
  iconName?: string;
  type?: string;
  size?: number;
  className?: string;
}

export const GameIcon: React.FC<GameIconProps> = ({ iconName, type, size = 16, className }) => {
  // 1. 尝试显式图标名
  if (iconName && IconMap[iconName]) {
    const Icon = IconMap[iconName];
    return <Icon size={size} className={className || 'text-slate-300'} />;
  }

  // 2. 根据类型猜测
  const lowerType = (type || '').toLowerCase();

  if (lowerType.includes('世界'))
    return <Globe size={size} className={className || 'text-purple-400'} />;
  if (lowerType.includes('地点') || lowerType.includes('location'))
    return <MapPin size={size} className={className || 'text-green-400'} />;
  if (lowerType.includes('角色') || lowerType.includes('character'))
    return <User size={size} className={className || 'text-blue-400'} />;
  if (lowerType.includes('能力') || lowerType.includes('技能') || lowerType.includes('ability'))
    return <Zap size={size} className={className || 'text-yellow-400'} />;
  if (lowerType.includes('物品') || lowerType.includes('item'))
    return <Box size={size} className={className || 'text-orange-400'} />;
  if (lowerType.includes('建筑') || lowerType.includes('building'))
    return <BrickWall size={size} className={className || 'text-stone-400'} />;
  if (lowerType.includes('卡槽') || lowerType.includes('slot') || lowerType.includes('容器'))
    return <BoxSelect size={14} className={className || 'text-gray-500'} />;
  if (lowerType.includes('情绪') || lowerType.includes('memory'))
    return <Sparkles size={size} className={className || 'text-pink-400'} />;
  if (lowerType.includes('状态') || lowerType.includes('属性'))
    return <Heart size={size} className={className || 'text-red-400'} />;

  // 3. 默认
  return <Box size={size} className={className || 'text-gray-400'} />;
};
