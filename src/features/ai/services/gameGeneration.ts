/**
 * 游戏内容生成服务
 */

import type {
  GameElement,
  GameSetupConfig,
  TurnResponse,
  ChatMessage,
  ActionOption,
  LLMConfig,
  SelectedElement,
} from '@/shared/types';
import { createLLMClient, createChatCompletionStream, type ChatCompletionMessage } from './llmClient';
import { parseXMLResponse, parseInitialWorldXML, gameElementToXML, parseOptionFromStream } from '../parsers/xmlParser';
import {
  SYSTEM_INSTRUCTION_BASE,
  GAME_LOOP_INSTRUCTION,
  OPTION_GENERATION_INSTRUCTION,
  getInitialWorldPrompt,
} from '../prompts/systemPrompts';
import { findPlayer } from '@/features/world/utils';

// 流式回调接口
export interface StreamCallbacks {
  onNarrativeChunk: (chunk: string, fullNarrative: string) => void;
  onComplete: (response: TurnResponse) => void;
  onError: (error: Error) => void;
}

// 选项流式回调接口
export interface OptionStreamCallbacks {
  onOptionChunk: (option: Partial<ActionOption>) => void;
  onComplete: (options: ActionOption[]) => void;
  onError: (error: Error) => void;
}

// 生成游戏回合（流式）
export const generateGameTurnStream = async (
  llmConfig: LLMConfig,
  worldState: GameElement,
  actionDescription: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<{ userMessage: string; assistantMessage: string }> => {
  const client = createLLMClient(llmConfig);
  const worldXML = gameElementToXML(worldState);

  const userPromptWithWorld = `
当前世界状态 (XML):
${worldXML}

---

玩家行动:
${actionDescription}

---

请生成 XML 响应。
`;

  const userPromptSimple = `玩家行动: ${actionDescription}`;

  // 构建消息
  const messages: ChatCompletionMessage[] = [{ role: 'system', content: GAME_LOOP_INSTRUCTION }];

  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: 'user', content: userPromptWithWorld });

  let narrativeForHistory = '';

  try {
    const stream = await createChatCompletionStream(client, llmConfig.apiModel, messages);

    let fullText = '';
    let currentNarrative = '';
    let inNarrative = false;
    let narrativeBuffer = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullText += content;

      // 实时提取叙事内容
      if (!inNarrative && fullText.includes('<Narrative>')) {
        inNarrative = true;
        const startIdx = fullText.indexOf('<Narrative>') + '<Narrative>'.length;
        narrativeBuffer = fullText.slice(startIdx);
      } else if (inNarrative) {
        narrativeBuffer += content;
      }

      // 检查叙事是否完成
      if (inNarrative && narrativeBuffer.includes('</Narrative>')) {
        const endIdx = narrativeBuffer.indexOf('</Narrative>');
        currentNarrative = narrativeBuffer.slice(0, endIdx);
        inNarrative = false;
      } else if (inNarrative) {
        let safeNarrative = narrativeBuffer;
        if (safeNarrative.includes('<')) {
          safeNarrative = safeNarrative.slice(0, safeNarrative.lastIndexOf('<'));
        }
        if (safeNarrative !== currentNarrative) {
          const newChunk = safeNarrative.slice(currentNarrative.length);
          currentNarrative = safeNarrative;
          if (newChunk) {
            callbacks.onNarrativeChunk(newChunk, currentNarrative);
          }
        }
      }
    }

    // 解析完整响应
    const response = parseXMLResponse(fullText);
    narrativeForHistory = response.narrative;
    callbacks.onComplete(response);

    return {
      userMessage: userPromptSimple,
      assistantMessage: `叙事: ${narrativeForHistory}`,
    };
  } catch (error) {
    console.error('AI Streaming Failed:', error);
    callbacks.onError(error as Error);
    return { userMessage: userPromptSimple, assistantMessage: '' };
  }
};

// 生成系统事件（流式）
export const generateSystemEventStream = async (
  llmConfig: LLMConfig,
  worldState: GameElement,
  eventType: string,
  eventDescription: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<{ userMessage: string; assistantMessage: string }> => {
  const client = createLLMClient(llmConfig);
  const worldXML = gameElementToXML(worldState);

  const systemEventPrompt = `
当前世界状态 (XML):
${worldXML}

---

**系统事件触发**
类型: ${eventType}
描述: ${eventDescription}

---

这是一个**系统事件**（非玩家主动行为）。
请基于上述事件描述，生成叙事和世界变化。

**注意：**
- 这是世界的自主反应，不是玩家行动
- 叙事应该描述这个系统事件如何发生、如何影响世界
- 可以继续判断是否有更多后续事件（但通常1-2个事件链即可，避免过长）
- 如果世界回归稳定，设置 hasEvent="false" 让玩家继续行动

请生成 XML 响应。
`;

  const userPromptSimple = `系统事件: [${eventType}] ${eventDescription}`;

  const messages: ChatCompletionMessage[] = [{ role: 'system', content: GAME_LOOP_INSTRUCTION }];

  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: 'user', content: systemEventPrompt });

  let narrativeForHistory = '';

  try {
    const stream = await createChatCompletionStream(client, llmConfig.apiModel, messages);

    let fullText = '';
    let currentNarrative = '';
    let inNarrative = false;
    let narrativeBuffer = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      fullText += content;

      if (!inNarrative && fullText.includes('<Narrative>')) {
        inNarrative = true;
        const startIdx = fullText.indexOf('<Narrative>') + '<Narrative>'.length;
        narrativeBuffer = fullText.slice(startIdx);
      } else if (inNarrative) {
        narrativeBuffer += content;
      }

      if (inNarrative && narrativeBuffer.includes('</Narrative>')) {
        const endIdx = narrativeBuffer.indexOf('</Narrative>');
        currentNarrative = narrativeBuffer.slice(0, endIdx);
        inNarrative = false;
      } else if (inNarrative) {
        let safeNarrative = narrativeBuffer;
        if (safeNarrative.includes('<')) {
          safeNarrative = safeNarrative.slice(0, safeNarrative.lastIndexOf('<'));
        }
        if (safeNarrative !== currentNarrative) {
          const newChunk = safeNarrative.slice(currentNarrative.length);
          currentNarrative = safeNarrative;
          if (newChunk) {
            callbacks.onNarrativeChunk(newChunk, currentNarrative);
          }
        }
      }
    }

    const response = parseXMLResponse(fullText);
    narrativeForHistory = response.narrative;
    callbacks.onComplete(response);

    return {
      userMessage: userPromptSimple,
      assistantMessage: `叙事: ${narrativeForHistory}`,
    };
  } catch (error) {
    console.error('System Event Streaming Failed:', error);
    callbacks.onError(error as Error);
    return { userMessage: userPromptSimple, assistantMessage: '' };
  }
};

// 生成行动选项（流式）
export const generateActionOptionsStream = async (
  llmConfig: LLMConfig,
  worldState: GameElement,
  selectedElements: SelectedElement[],
  history: ChatMessage[],
  callbacks: OptionStreamCallbacks
): Promise<void> => {
  const client = createLLMClient(llmConfig);
  const worldXML = gameElementToXML(worldState);

  const elementsDesc = selectedElements.map((e) => `- ${e.name} (${e.type}, id: ${e.id})`).join('\n');

  const prompt = `
当前世界状态 (XML):
${worldXML}

---

玩家选择了以下元素:
${elementsDesc}

---

请基于这些元素生成 3-5 个行动选项。
`;

  const messages: ChatCompletionMessage[] = [
    { role: 'system', content: OPTION_GENERATION_INSTRUCTION },
  ];

  const recentHistory = history.slice(-4);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: 'user', content: prompt });

  try {
    const stream = await createChatCompletionStream(client, llmConfig.apiModel, messages, {
      temperature: 0.9,
    });

    const parsedOptions: ActionOption[] = [];
    let currentOptionBuffer = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      currentOptionBuffer += content;

      // 尝试解析流中的选项
      const optionMatches = currentOptionBuffer.matchAll(/<Option[^>]*>[\s\S]*?<\/Option>/g);

      for (const match of optionMatches) {
        const optionXML = match[0];
        const option = parseOptionFromStream(optionXML);

        if (option && !parsedOptions.find((o) => o.id === option.id)) {
          parsedOptions.push(option);
          callbacks.onOptionChunk(option);
        }

        currentOptionBuffer = currentOptionBuffer.replace(optionXML, '');
      }
    }

    callbacks.onComplete(parsedOptions);
  } catch (error) {
    console.error('Option Generation Failed:', error);
    callbacks.onError(error as Error);
  }
};

// 生成初始世界
export const generateInitialWorld = async (
  llmConfig: LLMConfig,
  config: GameSetupConfig
): Promise<{ world: GameElement; firstLog: string }> => {
  const client = createLLMClient(llmConfig);

  const prompt = getInitialWorldPrompt({
    worldTheme: config.worldTheme,
    characterDesc: config.characterDesc,
    narrativeStyle: config.narrativeStyle,
    systems: config.systems,
  });

  try {
    const response = await client.chat.completions.create({
      model: llmConfig.apiModel,
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTION_BASE },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error('No response from AI');

    const { world, narrative } = parseInitialWorldXML(text);

    // 合并预设元素到玩家
    let finalWorld = world;
    if (config.presetElements && config.presetElements.length > 0) {
      finalWorld = mergePresetIntoPlayer(world, config.presetElements);
    }

    return { world: finalWorld, firstLog: narrative };
  } catch (e) {
    console.error('Init World Failed', e);
    throw e;
  }
};

// 合并预设元素到玩家
const mergePresetIntoPlayer = (
  root: GameElement,
  presetElements: GameElement[]
): GameElement => {
  // 深拷贝
  const cloneElement = (el: GameElement): GameElement => ({
    ...el,
    children: el.children.map(cloneElement),
  });

  const clonedRoot = cloneElement(root);
  const player = findPlayer(clonedRoot);

  if (player) {
    const existingTypes = new Set(player.children.map((c) => c.type));

    for (const preset of presetElements) {
      const existing = player.children.find((c) => c.type === preset.type);
      if (existing && preset.children.length > 0) {
        existing.children = [...existing.children, ...preset.children];
      } else if (!existingTypes.has(preset.type)) {
        player.children.push(preset);
        existingTypes.add(preset.type);
      }
    }
  }

  return clonedRoot;
};
