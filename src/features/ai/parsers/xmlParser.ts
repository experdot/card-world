/**
 * XML 解析器
 */

import type { GameElement, TurnResponse, ActionOption, OperationType } from '@/shared/types';

// 解析游戏响应 XML
export const parseXMLResponse = (xmlString: string): TurnResponse => {
  // 提取 <Response> 块
  const match = xmlString.match(/<Response>[\s\S]*?<\/Response>/);
  const cleanXML = match ? match[0] : xmlString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanXML, 'text/xml');

  const narrative = doc.querySelector('Narrative')?.textContent || '世界没有回应...';
  const operations: TurnResponse['operations'] = [];

  const opsNode = doc.querySelector('Operations');
  if (opsNode) {
    for (const opNode of Array.from(opsNode.children)) {
      const tool = opNode.tagName.toLowerCase() as OperationType;
      const args: Record<string, unknown> = {};

      // 提取属性
      for (const attr of Array.from(opNode.attributes)) {
        args[attr.name] = attr.value;
      }

      // 转换布尔值
      if (args.isRelationship === 'true') args.isRelationship = true;
      if (args.isRelationship === 'false') args.isRelationship = false;

      operations.push({ tool, args });
    }
  }

  // 解析后续事件
  const followUpNode = doc.querySelector('FollowUpEvent');
  let hasFollowUpEvent = false;
  let followUpEventType: string | undefined;
  let followUpEventDescription: string | undefined;

  if (followUpNode) {
    const hasEventAttr = followUpNode.getAttribute('hasEvent');
    hasFollowUpEvent = hasEventAttr === 'true';

    if (hasFollowUpEvent) {
      followUpEventType = followUpNode.getAttribute('type') || undefined;
      followUpEventDescription = followUpNode.getAttribute('description') || undefined;
    }
  }

  return {
    narrative,
    operations,
    hasFollowUpEvent,
    followUpEventType,
    followUpEventDescription,
  };
};

// 解析初始世界 XML
export const parseInitialWorldXML = (
  xmlString: string
): { world: GameElement; narrative: string } => {
  const match = xmlString.match(/<InitResponse>[\s\S]*?<\/InitResponse>/);
  const cleanXML = match ? match[0] : xmlString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanXML, 'text/xml');

  const narrative = doc.querySelector('Narrative')?.textContent || '欢迎来到新世界。';

  // 查找根元素
  const worldContainer = doc.querySelector('World');
  let rootElementNode = worldContainer?.firstElementChild;

  if (!rootElementNode && doc.querySelector('Element')) {
    rootElementNode = doc.querySelector('Element');
  }

  if (!rootElementNode) {
    throw new Error('Could not find root <Element> in AI response');
  }

  const world = xmlToGameElement(rootElementNode);

  return { world, narrative };
};

// XML 节点转 GameElement
const xmlToGameElement = (node: Element): GameElement => {
  const id = node.getAttribute('id') || `gen-${Math.random().toString(36).substr(2, 9)}`;
  const type = node.getAttribute('type') || '未知';
  const name = node.getAttribute('name') || '未知';
  const description = node.getAttribute('description') || '';
  const icon = node.getAttribute('icon') || undefined;

  // 关系属性
  const isRelationship = node.getAttribute('isRelationship') === 'true';
  const sourceId = node.getAttribute('sourceId') || undefined;
  const targetId = node.getAttribute('targetId') || undefined;

  const children: GameElement[] = [];
  for (const childNode of Array.from(node.children)) {
    if (childNode.tagName === 'Element') {
      children.push(xmlToGameElement(childNode));
    }
  }

  return {
    id,
    type,
    name,
    description,
    icon,
    children,
    isRelationship,
    sourceId,
    targetId,
  };
};

// GameElement 转 XML
export const gameElementToXML = (element: GameElement): string => {
  let xml = `<Element id="${element.id}" type="${element.type}" name="${element.name}" description="${element.description || ''}" icon="${element.icon || ''}"`;

  if (element.children && element.children.length > 0) {
    xml += element.children.map((child) => gameElementToXML(child)).join('');
  }

  xml += `</Element>`;
  return xml;
};

// 解析选项响应 XML
export const parseOptionsXML = (xmlString: string): ActionOption[] => {
  const match = xmlString.match(/<OptionsResponse>[\s\S]*?<\/OptionsResponse>/);
  const cleanXML = match ? match[0] : xmlString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanXML, 'text/xml');

  const options: ActionOption[] = [];
  const optionNodes = doc.querySelectorAll('Option');

  for (const optNode of Array.from(optionNodes)) {
    const id = optNode.getAttribute('id') || `opt-${Math.random().toString(36).substr(2, 9)}`;
    const title = optNode.querySelector('Title')?.textContent || '未知选项';
    const description = optNode.querySelector('Description')?.textContent || '';
    const context = optNode.querySelector('Context')?.textContent || undefined;

    options.push({ id, title, description, context });
  }

  return options;
};

// 从流式内容中解析选项
export const parseOptionFromStream = (optionXML: string): ActionOption | null => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(optionXML, 'text/xml');
  const optNode = doc.querySelector('Option');

  if (!optNode) return null;

  const id = optNode.getAttribute('id') || `opt-${Math.random().toString(36).substr(2, 9)}`;
  const title = optNode.querySelector('Title')?.textContent || '未知选项';
  const description = optNode.querySelector('Description')?.textContent || '';
  const context = optNode.querySelector('Context')?.textContent || undefined;

  return { id, title, description, context };
};
