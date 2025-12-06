/**
 * 富文本解析器
 */

import type { RichTextSegment } from '@/shared/types';

/**
 * 解析富文本标记
 *
 * 支持的标记:
 * - [[id:element-id|display text]] - 元素引用
 * - **text** - 强调
 * - ~~text~~ - 危险/负面
 *
 * 支持嵌套:
 * - **[[id:xxx|名字]]** - 强调的元素
 * - ~~**危险**~~ - 危险且强调
 */
export const parseRichNarrative = (text: string): RichTextSegment[] => {
  const segments: RichTextSegment[] = [];

  // 匹配模式 (非贪婪，支持嵌套)
  const patterns = [
    { regex: /\[\[id:([^\]|]+)\|([\s\S]*?)\]\]/, type: 'element' as const },
    { regex: /\*\*([\s\S]*?)\*\*/, type: 'emphasis' as const },
    { regex: /~~([\s\S]*?)~~/, type: 'danger' as const },
  ];

  // 找到最早的匹配
  const findEarliestMatch = (
    str: string
  ): {
    match: RegExpExecArray;
    type: 'element' | 'emphasis' | 'danger';
  } | null => {
    let earliest: {
      match: RegExpExecArray;
      type: 'element' | 'emphasis' | 'danger';
    } | null = null;

    for (const p of patterns) {
      const regex = new RegExp(p.regex.source, 'g');
      const match = regex.exec(str);
      if (match && (earliest === null || match.index < earliest.match.index)) {
        earliest = { match, type: p.type };
      }
    }

    return earliest;
  };

  let remaining = text;

  while (remaining.length > 0) {
    const found = findEarliestMatch(remaining);

    if (!found) {
      // 没有更多匹配，添加剩余文本
      if (remaining.length > 0) {
        segments.push({ type: 'text', content: remaining });
      }
      break;
    }

    const { match, type } = found;

    // 添加匹配前的纯文本
    if (match.index > 0) {
      segments.push({
        type: 'text',
        content: remaining.slice(0, match.index),
      });
    }

    // 提取内容并递归解析
    if (type === 'element') {
      const elementId = match[1];
      const innerContent = match[2];
      const children = parseRichNarrative(innerContent);

      // 如果子节点只是相同内容的纯文本，不嵌套
      const isSimpleText =
        children.length === 1 && children[0].type === 'text' && children[0].content === innerContent;

      segments.push({
        type: 'element',
        content: innerContent,
        elementId,
        children: isSimpleText ? undefined : children,
      });
    } else {
      // emphasis 或 danger
      const innerContent = match[1];
      const children = parseRichNarrative(innerContent);

      const isSimpleText =
        children.length === 1 && children[0].type === 'text' && children[0].content === innerContent;

      segments.push({
        type,
        content: innerContent,
        children: isSimpleText ? undefined : children,
      });
    }

    // 移动到匹配之后
    remaining = remaining.slice(match.index + match[0].length);
  }

  // 如果没有找到任何段落，返回整个文本
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }

  return segments;
};
