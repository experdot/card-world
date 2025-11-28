
import { GameElement, GameOperation, OperationType } from '../types';

// Helper to generate simple IDs
const generateId = (prefix: string = 'el') => `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

// Deep clone helper
const cloneTree = (root: GameElement): GameElement => JSON.parse(JSON.stringify(root));

// Find a node and its parent
const findNodeAndParent = (root: GameElement, id: string): { node: GameElement | null, parent: GameElement | null } => {
  if (root.id === id) return { node: root, parent: null };
  
  for (const child of root.children) {
    if (child.id === id) return { node: child, parent: root };
    const found = findNodeAndParent(child, id);
    if (found.node) return found;
  }
  return { node: null, parent: null };
};

// Find a node by ID
const findNode = (root: GameElement, id: string): GameElement | null => {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
};

// --- Operations ---

const opNew = (root: GameElement, args: GameOperation['args']): GameElement => {
  const newRoot = cloneTree(root);
  const parentId = args.parentId || args.id; // Fallback
  if (!parentId) return root;

  const parent = findNode(newRoot, parentId);
  if (parent) {
    // Heuristic for ID generation based on type
    const prefix = args.type ? args.type.substring(0, 2) : 'entity';

    const newElement: GameElement = {
      id: generateId(prefix),
      type: args.type || '未知',
      name: args.name || '未知',
      description: args.description,
      icon: args.icon, // Passed from AI
      enabled: args.enabled !== false, // Default true
      visible: args.visible !== false, // Default true
      children: [],
      // Relationship fields (if this is a relationship card)
      isRelationship: args.isRelationship,
      sourceId: args.sourceId,
      targetId: args.targetId,
    };
    parent.children.push(newElement);
  }
  return newRoot;
};

const opDelete = (root: GameElement, args: GameOperation['args']): GameElement => {
  if (!args.id) return root;
  const newRoot = cloneTree(root);
  
  // Cannot delete root
  if (newRoot.id === args.id) return newRoot;

  const { parent } = findNodeAndParent(newRoot, args.id);
  if (parent) {
    parent.children = parent.children.filter(c => c.id !== args.id);
  }
  return newRoot;
};

const opUpdate = (root: GameElement, args: GameOperation['args']): GameElement => {
  if (!args.id) return root;
  const newRoot = cloneTree(root);
  const node = findNode(newRoot, args.id);
  
  if (node) {
    // Update core fields if present directly in args
    if (args.name) node.name = args.name;
    if (args.description) node.description = args.description;
    if (args.icon) node.icon = args.icon;
    if (args.enabled) node.enabled = args.enabled;
    if (args.visible) node.visible = args.visible;
  }
  return newRoot;
};

const opMove = (root: GameElement, args: GameOperation['args']): GameElement => {
  if (!args.id || !args.newParentId) return root;
  let newRoot = cloneTree(root);

  const { node: nodeToMove } = findNodeAndParent(newRoot, args.id);
  if (!nodeToMove) return root;

  const { parent: oldParent } = findNodeAndParent(newRoot, args.id);
  if (oldParent) {
    oldParent.children = oldParent.children.filter(c => c.id !== args.id);
  } else {
    return root; 
  }

  const newParent = findNode(newRoot, args.newParentId);
  if (newParent) {
    newParent.children.push(nodeToMove);
  } else {
    return root; 
  }
  
  return newRoot;
};

const opDuplicate = (root: GameElement, args: GameOperation['args']): GameElement => {
  if (!args.id) return root;
  const newRoot = cloneTree(root);
  
  const originalNode = findNode(newRoot, args.id);
  if (!originalNode) return root;

  const newNode = JSON.parse(JSON.stringify(originalNode));
  newNode.id = generateId(args.type || 'copy');
  
  const parentId = args.newParentId || args.parentId;
  if (parentId) {
    const parent = findNode(newRoot, parentId);
    if (parent) {
      parent.children.push(newNode);
    }
  } else {
    const { parent } = findNodeAndParent(newRoot, args.id);
    if (parent) {
      parent.children.push(newNode);
    }
  }

  return newRoot;
};

export const applyOperations = (root: GameElement, operations: GameOperation[]): GameElement => {
  let currentRoot = root;
  for (const op of operations) {
    try {
      // Normalize tool name to lower case
      const tool = (op.tool as string).toLowerCase();

      switch (tool) {
        case OperationType.NEW:
          currentRoot = opNew(currentRoot, op.args);
          break;
        case OperationType.DELETE:
          currentRoot = opDelete(currentRoot, op.args);
          break;
        case OperationType.UPDATE:
          currentRoot = opUpdate(currentRoot, op.args);
          break;
        case OperationType.MOVE:
          currentRoot = opMove(currentRoot, op.args);
          break;
        case OperationType.DUPLICATE:
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

// --- Relationship Helpers ---

/**
 * Find all relationship cards in the tree
 */
export const findAllRelationships = (root: GameElement): GameElement[] => {
  const relationships: GameElement[] = [];

  const traverse = (node: GameElement) => {
    if (node.isRelationship) {
      relationships.push(node);
    }
    for (const child of node.children) {
      traverse(child);
    }
  };

  traverse(root);
  return relationships;
};

/**
 * Find relationships where the given element is the source
 */
export const findRelationshipsFrom = (root: GameElement, elementId: string): GameElement[] => {
  return findAllRelationships(root).filter(rel => rel.sourceId === elementId);
};

/**
 * Find relationships where the given element is the target
 */
export const findRelationshipsTo = (root: GameElement, elementId: string): GameElement[] => {
  return findAllRelationships(root).filter(rel => rel.targetId === elementId);
};

/**
 * Find all relationships involving the given element (as source or target)
 */
export const findRelationshipsInvolving = (root: GameElement, elementId: string): GameElement[] => {
  return findAllRelationships(root).filter(
    rel => rel.sourceId === elementId || rel.targetId === elementId
  );
};
