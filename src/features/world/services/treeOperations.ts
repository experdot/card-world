/**
 * 世界树操作服务
 */

import { produce } from 'immer';
import type { GameElement, GameOperation, OperationType } from '@/shared/types';
import { generateId, findNode, findNodeAndParent } from '../utils/treeUtils';

// 新建节点
const opNew = (root: GameElement, args: GameOperation['args']): GameElement => {
  return produce(root, (draft) => {
    const parentId = args.parentId || args.id;
    if (!parentId) return;

    const parent = findNode(draft, parentId);
    if (parent) {
      const prefix = args.type ? args.type.substring(0, 2) : 'entity';
      const newElement: GameElement = {
        id: generateId(prefix),
        type: args.type || '未知',
        name: args.name || '未知',
        description: args.description,
        icon: args.icon,
        enabled: args.enabled !== false,
        visible: args.visible !== false,
        children: [],
        isRelationship: args.isRelationship,
        sourceId: args.sourceId,
        targetId: args.targetId,
      };
      parent.children.push(newElement);
    }
  });
};

// 删除节点
const opDelete = (root: GameElement, args: GameOperation['args']): GameElement => {
  if (!args.id) return root;
  if (root.id === args.id) return root; // 不能删除根节点

  return produce(root, (draft) => {
    const { parent } = findNodeAndParent(draft, args.id!);
    if (parent) {
      parent.children = parent.children.filter((c) => c.id !== args.id);
    }
  });
};

// 更新节点
const opUpdate = (root: GameElement, args: GameOperation['args']): GameElement => {
  if (!args.id) return root;

  return produce(root, (draft) => {
    const node = findNode(draft, args.id!);
    if (node) {
      if (args.name !== undefined) node.name = args.name;
      if (args.description !== undefined) node.description = args.description;
      if (args.icon !== undefined) node.icon = args.icon;
      if (args.enabled !== undefined) node.enabled = args.enabled;
      if (args.visible !== undefined) node.visible = args.visible;
    }
  });
};

// 移动节点
const opMove = (root: GameElement, args: GameOperation['args']): GameElement => {
  if (!args.id || !args.newParentId) return root;

  return produce(root, (draft) => {
    const { node: nodeToMove, parent: oldParent } = findNodeAndParent(draft, args.id!);
    if (!nodeToMove || !oldParent) return;

    // 从旧父节点移除
    oldParent.children = oldParent.children.filter((c) => c.id !== args.id);

    // 添加到新父节点
    const newParent = findNode(draft, args.newParentId!);
    if (newParent) {
      newParent.children.push(nodeToMove);
    }
  });
};

// 复制节点
const opDuplicate = (root: GameElement, args: GameOperation['args']): GameElement => {
  if (!args.id) return root;

  const originalNode = findNode(root, args.id);
  if (!originalNode) return root;

  return produce(root, (draft) => {
    const newNode = JSON.parse(JSON.stringify(originalNode));
    newNode.id = generateId(args.type || 'copy');

    const parentId = args.newParentId || args.parentId;
    if (parentId) {
      const parent = findNode(draft, parentId);
      if (parent) {
        parent.children.push(newNode);
      }
    } else {
      const { parent } = findNodeAndParent(draft, args.id!);
      if (parent) {
        parent.children.push(newNode);
      }
    }
  });
};

// 应用操作列表
export const applyOperations = (root: GameElement, operations: GameOperation[]): GameElement => {
  let currentRoot = root;

  for (const op of operations) {
    try {
      const tool = (op.tool as string).toLowerCase() as OperationType;

      switch (tool) {
        case 'new':
          currentRoot = opNew(currentRoot, op.args);
          break;
        case 'delete':
          currentRoot = opDelete(currentRoot, op.args);
          break;
        case 'update':
          currentRoot = opUpdate(currentRoot, op.args);
          break;
        case 'move':
          currentRoot = opMove(currentRoot, op.args);
          break;
        case 'duplicate':
          currentRoot = opDuplicate(currentRoot, op.args);
          break;
        default:
          console.warn(`Unknown operation tool: ${tool}`);
      }
    } catch (e) {
      console.error(`Failed to execute operation ${op.tool}`, e);
    }
  }

  return currentRoot;
};
