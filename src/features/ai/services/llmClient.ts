/**
 * LLM 客户端封装
 */

import OpenAI from 'openai';
import type { LLMConfig } from '@/shared/types';

// 创建 OpenAI 客户端
export const createLLMClient = (config: LLMConfig): OpenAI => {
  return new OpenAI({
    baseURL: config.apiHost,
    apiKey: config.apiKey,
    dangerouslyAllowBrowser: true,
  });
};

// 消息类型
export type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// 创建聊天完成请求
export const createChatCompletion = async (
  client: OpenAI,
  model: string,
  messages: ChatCompletionMessage[],
  options?: { temperature?: number }
) => {
  return client.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature,
  });
};

// 创建流式聊天完成请求
export const createChatCompletionStream = async (
  client: OpenAI,
  model: string,
  messages: ChatCompletionMessage[],
  options?: { temperature?: number }
) => {
  return client.chat.completions.create({
    model,
    messages,
    temperature: options?.temperature,
    stream: true,
  });
};
