/**
 * 世界树工具函数
 */

import type { GameElement } from '@/shared/types';

// 生成唯一 ID
export const generateId = (prefix: string = 'el'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// 深拷贝树
export const cloneTree = (root: GameElement): GameElement => {
  return JSON.parse(JSON.stringify(root));
};

// 查找节点
export const findNode = (root: GameElement, id: string): GameElement | null => {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

// 查找节点及其父节点
export const findNodeAndParent = (
  root: GameElement,
  id: string
): { node: GameElement | null; parent: GameElement | null } => {
  if (root.id === id) return { node: root, parent: null };

  for (const child of root.children) {
    if (child.id === id) return { node: child, parent: root };
    const found = findNodeAndParent(child, id);
    if (found.node) return found;
  }
  return { node: null, parent: null };
};

// 查找玩家
export const findPlayer = (root: GameElement): GameElement | null => {
  const isPlayer = (el: GameElement) =>
    el.type.includes('角色') ||
    el.type.includes('Player') ||
    el.type.includes('Character') ||
    el.name.includes('玩家') ||
    el.name.includes('Player');

  if (isPlayer(root)) return root;
  for (const child of root.children) {
    const found = findPlayer(child);
    if (found) return found;
  }
  return null;
};

// 遍历树
export const traverseTree = (
  root: GameElement,
  callback: (node: GameElement, depth: number) => void,
  depth: number = 0
): void => {
  callback(root, depth);
  for (const child of root.children) {
    traverseTree(child, callback, depth + 1);
  }
};

// 查找所有关系卡牌
export const findAllRelationships = (root: GameElement): GameElement[] => {
  const relationships: GameElement[] = [];

  traverseTree(root, (node) => {
    if (node.isRelationship) {
      relationships.push(node);
    }
  });

  return relationships;
};

// 查找从指定元素出发的关系
export const findRelationshipsFrom = (root: GameElement, elementId: string): GameElement[] => {
  return findAllRelationships(root).filter((rel) => rel.sourceId === elementId);
};

// 查找指向指定元素的关系
export const findRelationshipsTo = (root: GameElement, elementId: string): GameElement[] => {
  return findAllRelationships(root).filter((rel) => rel.targetId === elementId);
};

// 查找涉及指定元素的所有关系
export const findRelationshipsInvolving = (root: GameElement, elementId: string): GameElement[] => {
  return findAllRelationships(root).filter(
    (rel) => rel.sourceId === elementId || rel.targetId === elementId
  );
};
