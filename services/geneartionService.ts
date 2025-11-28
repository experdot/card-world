import OpenAI from "openai";
import {
  GameElement,
  TurnResponse,
  OperationType,
  GameSetupConfig,
  RichTextSegment,
  ChatMessage,
  ActionOption,
  SelectedElement,
} from "../types";
import { LLMConfig } from "./storageService";

// --- XML Helpers ---

// 1. Convert JSON State to XML for the prompt
const stateToXML = (element: GameElement): string => {
  // Core attributes
  let xml = `<Element id="${element.id}" type="${element.type}" name="${
    element.name
  }" description="${element.description}" enabled="${
    element.enabled
  }" visible="${element.visible}" icon="${element.icon || ""}"`;

  if (element.children && element.children.length > 0) {
    xml += element.children.map((child) => stateToXML(child)).join("");
  }

  xml += `</Element>`;
  return xml;
};

// 2. Convert XML String back to GameElement (for initial generation)
const xmlToGameElement = (node: Element): GameElement => {
  const id =
    node.getAttribute("id") || `gen-${Math.random().toString(36).substr(2, 9)}`;
  const type = node.getAttribute("type") || "未知";
  const name = node.getAttribute("name") || "未知";
  const description = node.getAttribute("description") || "";
  const icon = node.getAttribute("icon") || undefined;
  const enabled = node.getAttribute("enabled") !== "false";
  const visible = node.getAttribute("visible") !== "false";

  // Relationship attributes
  const isRelationship = node.getAttribute("isRelationship") === "true";
  const sourceId = node.getAttribute("sourceId") || undefined;
  const targetId = node.getAttribute("targetId") || undefined;

  const children: GameElement[] = [];
  // Iterate over child Elements only
  for (const childNode of Array.from(node.children)) {
    if (childNode.tagName === "Element") {
      children.push(xmlToGameElement(childNode));
    }
  }

  return {
    id,
    type,
    name,
    description,
    icon,
    enabled,
    visible,
    children,
    isRelationship,
    sourceId,
    targetId,
  };
};

const systemInstructionBase = `
你是一个基于卡牌构建的世界的AI游戏主宰 (Game Master)。
在这个世界里，万物皆卡牌（元素）。

**Icon图标库**:
请从以下列表中为新卡牌选择最合适的 icon (字符串):
user, box, map-pin, key, sword, shield, zap, heart, skull, ghost, flame, droplet, snowflake, sun, moon, star, cloud, cloud-fog, music, message-circle, eye, eye-off, lock, unlock, book, scroll, feather, gem, coins, hammer, wrench, trash, archive, link, layers, image, smile, frown, angry, meh, thumbs-up, flag, home, castle, tent, door-open, door-closed, brick-wall, search, flask-conical, scissors, backpack, brain, box-select, globe
`;

const gameLoopInstruction = `
${systemInstructionBase}
你的目标是根据玩家的行为进行叙事，并维护世界的结构化数据模型。

**核心规则：**
1. **叙事 (Narrative)**：用中文写一段引人入胜的、有氛围感的短文描述发生的事情。
2. **卡牌化 (Extraction)**：分析你的叙事。出现了新物品？情绪变化了？发现了新地点？建立了新的关系？
3. **维护 (Maintenance)**：使用 XML 工具指令来更新世界树。
   - \`<new>\`：新建卡牌。你需要决定它的 type (如"物品","情绪","线索","建筑","关系") 和 icon。
   - \`<update>\`：修改属性。重要：若要让某物可见，设置 \`visible="true"\`。若要解锁能力，设置 \`enabled="true"\`。
   - \`<delete>\`：删除销毁的卡牌。
   - \`<move>\`：移动卡牌（例如从地点移到玩家背包）。
   - \`<duplicate>\`：复制卡牌。

**关系卡牌系统：**
除了普通的结构树关系（父子包含），你还可以创建**关系卡牌**来表达任意两个元素之间的语义关系。

关系卡牌示例：
- 角色间的关系：好友、仇敌、盟友、师徒
- 地点间的关系：通往、传送门
- 物品间的关系：需要（合成）、升级自
- 任务间的关系：前置任务、后续任务
- 任意元素间的关系：依赖、触发、影响

创建关系卡牌的语法：
\`\`\`xml
<new parentId="world-root" type="关系" name="好友" description="深厚的友谊" icon="heart"
     isRelationship="true" sourceId="player-1" targetId="npc-merchant" visible="true" enabled="true">
</new>
\`\`\`

关键属性：
- \`isRelationship="true"\`：标记这是一个关系卡牌
- \`sourceId\`：关系的源头元素ID（从谁的视角）
- \`targetId\`：关系的目标元素ID（指向谁）
- 关系卡牌也可以有子卡牌，用来表示关系的详细属性（如好感度、持续时间等）

**何时使用关系卡牌：**
- 当两个元素之间建立了语义联系（非包含关系）
- 当关系本身需要被追踪、修改或查询
- 当关系可能影响后续的游戏逻辑

**示例场景：**
1. 玩家与NPC交谈建立友谊 → 创建"好友"关系卡牌
2. 发现两个地点间的秘密通道 → 创建"通往"关系卡牌
3. 学习了合成配方 → 创建"需要"关系卡牌（物品A需要物品B）
4. 接受任务后解锁新任务 → 创建"前置"关系卡牌

**叙事富文本标记**:
在叙事中，使用以下特殊标记来高亮关键内容，让玩家可以与之交互：
- \`[[id:元素ID|显示文本]]\`：引用游戏元素（如物品、角色、地点）。玩家可点击查看或选中。例如：\`[[id:item-sword|锈迹斑斑的长剑]]\`
- \`**文本**\`：强调重要信息（如关键线索、重要对话）
- \`~~文本~~\`：危险/负面信息（如伤害、威胁、诅咒）

**事件链系统：**
玩家行动后，世界可能触发连锁反应。你需要判断是否有**系统事件**需要立即发生。

**系统事件类型：**
- **环境变化**：天气、时间、自然现象（例如：雷雨开始、夜幕降临）
- **NPC反应**：NPC对玩家行动的反应（例如：商人听到声音走来、守卫发现异常）
- **意外事件**：随机发生的事情（例如：突然出现怪物、物品掉落）
- **连锁反应**：玩家行动触发的必然结果（例如：打碎花瓶引起注意、开门触发陷阱）
- **定时事件**：之前设定的延迟事件触发（例如：药效结束、诅咒生效）

**判断标准：**
- 系统事件应该是**玩家行动的直接/间接后果**
- 系统事件应该推动故事发展或增加紧张感
- **不要过度**：通常0-2个后续事件即可
- 如果世界处于稳定状态，无需强制触发事件

**交互格式**:
你将收到当前世界的 XML 快照。
请输出一个 XML 响应，格式如下：

\`\`\`xml
<Response>
    <Narrative>你发现了[[id:item-1|一把古老的钥匙]]，它散发着**神秘的光芒**。但你也感到~~一阵寒意~~从背后袭来...</Narrative>
    <Operations>
        <new parentId="loc-1" type="物品" name="闪光的碎片" description="它是某个巨大物体的一部分。" icon="gem" visible="true" enabled="true"></new>
        <update id="player-1" HP="95" />
        <delete id="old-card-id" />
    </Operations>
    <FollowUpEvent hasEvent="true" type="NPC反应" description="守卫听到你打开宝箱的声音，正在向这里走来"></FollowUpEvent>
</Response>
\`\`\`

**关于 FollowUpEvent：**
- \`hasEvent="true"\`：表示有后续系统事件，世界将自动触发下一轮
- \`hasEvent="false"\` 或不写：表示没有后续事件，回到玩家轮次
- \`type\`：事件类型（环境变化、NPC反应、意外、连锁反应、定时事件）
- \`description\`：简短描述即将发生什么（作为提示）
`;

// --- Rich Text Parser ---

/**
 * Parse narrative text with rich text markers into segments (supports nesting)
 * Supported markers:
 * - [[id:element-id|display text]] - element reference
 * - **text** - emphasis
 * - ~~text~~ - danger/negative
 *
 * Nesting examples:
 * - **[[id:xxx|名字]]** - emphasized element
 * - ~~**危险**~~ - danger with emphasis
 * - [[id:xxx|**强调名**]] - element with emphasized content
 */
export const parseRichNarrative = (text: string): RichTextSegment[] => {
  const segments: RichTextSegment[] = [];

  // Patterns for different marker types (non-greedy, allows nesting)
  // Use [\s\S] instead of . to match across potential nested content
  const patterns = [
    { regex: /\[\[id:([^\]|]+)\|([\s\S]*?)\]\]/, type: 'element' as const },
    { regex: /\*\*([\s\S]*?)\*\*/, type: 'emphasis' as const },
    { regex: /~~([\s\S]*?)~~/, type: 'danger' as const },
  ];

  // Find the earliest match among all patterns
  const findEarliestMatch = (str: string): {
    match: RegExpExecArray;
    type: 'element' | 'emphasis' | 'danger';
    pattern: RegExp;
  } | null => {
    let earliest: { match: RegExpExecArray; type: 'element' | 'emphasis' | 'danger'; pattern: RegExp } | null = null;

    for (const p of patterns) {
      const regex = new RegExp(p.regex.source, 'g');
      const match = regex.exec(str);
      if (match && (earliest === null || match.index < earliest.match.index)) {
        earliest = { match, type: p.type, pattern: p.regex };
      }
    }

    return earliest;
  };

  let remaining = text;
  let offset = 0;

  while (remaining.length > 0) {
    const found = findEarliestMatch(remaining);

    if (!found) {
      // No more matches, add remaining as plain text
      if (remaining.length > 0) {
        segments.push({ type: 'text', content: remaining });
      }
      break;
    }

    const { match, type } = found;

    // Add plain text before this match
    if (match.index > 0) {
      segments.push({
        type: 'text',
        content: remaining.slice(0, match.index),
      });
    }

    // Extract inner content and recursively parse
    if (type === 'element') {
      const elementId = match[1];
      const innerContent = match[2];
      const children = parseRichNarrative(innerContent);

      // If children is just plain text with same content, don't nest
      const isSimpleText = children.length === 1 &&
                          children[0].type === 'text' &&
                          children[0].content === innerContent;

      segments.push({
        type: 'element',
        content: innerContent,
        elementId,
        children: isSimpleText ? undefined : children,
      });
    } else {
      // emphasis or danger
      const innerContent = match[1];
      const children = parseRichNarrative(innerContent);

      // If children is just plain text with same content, don't nest
      const isSimpleText = children.length === 1 &&
                          children[0].type === 'text' &&
                          children[0].content === innerContent;

      segments.push({
        type,
        content: innerContent,
        children: isSimpleText ? undefined : children,
      });
    }

    // Move past this match
    remaining = remaining.slice(match.index + match[0].length);
  }

  // If no segments found, return the whole text as plain
  if (segments.length === 0) {
    segments.push({ type: 'text', content: text });
  }

  return segments;
};

// --- Parsers ---

const parseXMLResponse = (xmlString: string): TurnResponse => {
  // Simple sanitization to find the <Response> block if AI adds markdown
  const match = xmlString.match(/<Response>[\s\S]*?<\/Response>/);
  const cleanXML = match ? match[0] : xmlString;

  const parser = new DOMParser();
  const doc = parser.parseFromString(cleanXML, "text/xml");

  const narrative =
    doc.querySelector("Narrative")?.textContent || "世界没有回应...";
  const operations: any[] = [];

  const opsNode = doc.querySelector("Operations");
  if (opsNode) {
    for (const opNode of Array.from(opsNode.children)) {
      const tool = opNode.tagName.toLowerCase() as OperationType;
      const args: any = {};

      // Extract attributes to args
      for (const attr of Array.from(opNode.attributes)) {
        args[attr.name] = attr.value;
      }

      if (args.visible === "true") args.visible = true;
      if (args.visible === "false") args.visible = false;
      if (args.enabled === "true") args.enabled = true;
      if (args.enabled === "false") args.enabled = false;
      if (args.isRelationship === "true") args.isRelationship = true;
      if (args.isRelationship === "false") args.isRelationship = false;

      operations.push({ tool, args });
    }
  }

  // Parse FollowUpEvent
  const followUpNode = doc.querySelector("FollowUpEvent");
  let hasFollowUpEvent = false;
  let followUpEventType: string | undefined;
  let followUpEventDescription: string | undefined;

  if (followUpNode) {
    const hasEventAttr = followUpNode.getAttribute("hasEvent");
    hasFollowUpEvent = hasEventAttr === "true";

    if (hasFollowUpEvent) {
      followUpEventType = followUpNode.getAttribute("type") || undefined;
      followUpEventDescription = followUpNode.getAttribute("description") || undefined;
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

// --- API Calls ---

export const generateGameTurn = async (
  llmConfig: LLMConfig,
  worldState: GameElement,
  actionDescription: string
): Promise<TurnResponse> => {
  const openai = new OpenAI({
    baseURL: llmConfig.apiHost,
    apiKey: llmConfig.apiKey,
    dangerouslyAllowBrowser: true,
  });
  const worldXML = stateToXML(worldState);

  const prompt = `
    当前世界状态 (XML):
    ${worldXML}

---

    玩家行动:
    ${actionDescription}

---

    请生成 XML 响应。
  `;

  try {
    const response = await openai.chat.completions.create({
      model: llmConfig.apiModel,
      messages: [
        { role: "system", content: gameLoopInstruction },
        { role: "user", content: prompt },
      ],
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No response from AI");
    return parseXMLResponse(text);
  } catch (error) {
    console.error("AI Generation Failed:", error);
    throw error;
  }
};

// Streaming version of generateGameTurn
export interface StreamCallbacks {
  onNarrativeChunk: (chunk: string, fullNarrative: string) => void;
  onComplete: (response: TurnResponse) => void;
  onError: (error: Error) => void;
}

export const generateGameTurnStream = async (
  llmConfig: LLMConfig,
  worldState: GameElement,
  actionDescription: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<{ userMessage: string; assistantMessage: string }> => {
  const openai = new OpenAI({
    baseURL: llmConfig.apiHost,
    apiKey: llmConfig.apiKey,
    dangerouslyAllowBrowser: true,
  });
  const worldXML = stateToXML(worldState);

  // Full prompt with world state (only for current turn)
  const userPromptWithWorld = `
当前世界状态 (XML):
${worldXML}

---

玩家行动:
${actionDescription}

---

请生成 XML 响应。
  `;

  // Simplified prompt for history (without world state)
  const userPromptSimple = `玩家行动: ${actionDescription}`;

  // Build messages array with history
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: gameLoopInstruction }];

  // Add conversation history (already simplified)
  for (const msg of history) {
    messages.push({ role: msg.role, content: msg.content });
  }

  // Add current user prompt WITH world state
  messages.push({ role: "user", content: userPromptWithWorld });

  let narrativeForHistory = "";

  try {
    const stream = await openai.chat.completions.create({
      model: llmConfig.apiModel,
      messages,
      stream: true,
    });

    let fullText = "";
    let currentNarrative = "";
    let inNarrative = false;
    let narrativeBuffer = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullText += content;

      // Try to extract narrative content in real-time
      // Check if we've entered <Narrative> tag
      if (!inNarrative && fullText.includes("<Narrative>")) {
        inNarrative = true;
        const startIdx = fullText.indexOf("<Narrative>") + "<Narrative>".length;
        narrativeBuffer = fullText.slice(startIdx);
      } else if (inNarrative) {
        narrativeBuffer += content;
      }

      // Check if narrative is complete
      if (inNarrative && narrativeBuffer.includes("</Narrative>")) {
        const endIdx = narrativeBuffer.indexOf("</Narrative>");
        currentNarrative = narrativeBuffer.slice(0, endIdx);
        inNarrative = false; // Stop updating narrative
      } else if (inNarrative) {
        // Still streaming narrative - send chunk
        // Remove any partial closing tag
        let safeNarrative = narrativeBuffer;
        if (safeNarrative.includes("<")) {
          safeNarrative = safeNarrative.slice(
            0,
            safeNarrative.lastIndexOf("<")
          );
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

    // Parse the complete response
    const response = parseXMLResponse(fullText);
    narrativeForHistory = response.narrative;
    callbacks.onComplete(response);

    // Return simplified messages for history (no XML, just action and narrative)
    return {
      userMessage: userPromptSimple,
      assistantMessage: `叙事: ${narrativeForHistory}`,
    };
  } catch (error) {
    console.error("AI Streaming Failed:", error);
    callbacks.onError(error as Error);
    return { userMessage: userPromptSimple, assistantMessage: "" };
  }
};

export const generateInitialWorld = async (
  llmConfig: LLMConfig,
  config: GameSetupConfig
): Promise<{ world: GameElement; firstLog: string }> => {
  const openai = new OpenAI({
    baseURL: llmConfig.apiHost,
    apiKey: llmConfig.apiKey,
    dangerouslyAllowBrowser: true,
  });

  const prompt = `
    请根据以下用户设定，创建一个初始的游戏世界数据模型（XML格式）和开场旁白。

    **用户设定**:
    1. **世界观/主题**: ${config.worldTheme}
    2. **角色设定**: ${config.characterDesc}
    3. **叙事风格**: ${config.narrativeStyle}
    4. **包含系统**: ${config.systems.join(", ")}

    **要求**:
    1. 输出必须包含一个 <InitResponse> 根节点。
    2. 在 <InitResponse> 内，包含 <Narrative>（开场白）和 <World>（根元素数据）。
    3. <World> 标签必须是 <Element> 结构，type="世界" 或 "World"。
    4. 根世界下必须包含至少一个 Location（地点）。
    5. Location 下必须包含 Player（玩家角色）。
    6. 根据"包含系统"的要求，在玩家或界面下预制好相应的卡牌（例如：背包卡槽、任务列表卡槽、HP属性等）。
    7. 所有属性值和文本尽量使用中文。
    8. **务必为关键卡牌指定合适的 icon** (参考 system instruction 的图标库)。

    **XML 结构示例**:
    <InitResponse>
        <Narrative>
            风沙掩埋了旧时代的遗迹... 你醒来了。
        </Narrative>
        <World>
            <Element id="root" type="世界" name="废土世界" icon="globe" visible="true" enabled="false">
                <Element id="loc-1" type="地点" name="坠毁的飞船" icon="map-pin" visible="true" enabled="true">
                    <Element id="player" type="角色" name="幸存者" description="..." icon="user" visible="true" enabled="true">
                         <Properties HP="10"/>
                         <!-- 如果用户选了背包系统 -->
                         <Element id="slot-bag" type="卡槽" name="背包" icon="backpack" ... />
                    </Element>
                </Element>
            </Element>
        </World>
    </InitResponse>
    `;

  try {
    const response = await openai.chat.completions.create({
      model: llmConfig.apiModel,
      messages: [
        { role: "system", content: systemInstructionBase },
        { role: "user", content: prompt },
      ],
      temperature: 0.8,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No response from AI");

    console.log("Initial World XML:", text);

    // Parse
    const match = text.match(/<InitResponse>[\s\S]*?<\/InitResponse>/);
    const cleanXML = match ? match[0] : text;
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanXML, "text/xml");

    const narrative =
      doc.querySelector("Narrative")?.textContent || "欢迎来到新世界。";

    // Find the root element inside <World>
    // The AI might wrap it in <World><Element...></Element></World> or just <Element...>
    const worldContainer = doc.querySelector("World");
    let rootElementNode = worldContainer?.firstElementChild;

    if (!rootElementNode && doc.querySelector("Element")) {
      rootElementNode = doc.querySelector("Element");
    }

    if (!rootElementNode) {
      throw new Error("Could not find root <Element> in AI response");
    }

    let worldElement = xmlToGameElement(rootElementNode);

    // Merge preset elements into the player character
    if (config.presetElements && config.presetElements.length > 0) {
      worldElement = mergePresetIntoPlayer(worldElement, config.presetElements);
    }

    return { world: worldElement, firstLog: narrative };
  } catch (e) {
    console.error("Init World Failed", e);
    throw e;
  }
};

// Helper function to find and merge preset elements into player
const mergePresetIntoPlayer = (
  root: GameElement,
  presetElements: GameElement[]
): GameElement => {
  // Find player in the tree
  const findPlayer = (el: GameElement): GameElement | null => {
    const isPlayer =
      el.type.includes("角色") ||
      el.type.includes("Player") ||
      el.type.includes("Character") ||
      el.name.includes("玩家") ||
      el.name.includes("Player");
    if (isPlayer) return el;
    for (const child of el.children) {
      const found = findPlayer(child);
      if (found) return found;
    }
    return null;
  };

  // Deep clone the tree
  const cloneElement = (el: GameElement): GameElement => ({
    ...el,
    children: el.children.map(cloneElement),
  });

  const clonedRoot = cloneElement(root);
  const player = findPlayer(clonedRoot);

  if (player) {
    // Merge preset elements, avoiding duplicates by type
    const existingTypes = new Set(player.children.map((c) => c.type));

    for (const preset of presetElements) {
      // If player already has a container of this type, merge children
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

// --- Generate Action Options ---

const optionGenerationInstruction = `
${systemInstructionBase}
你是一个基于玩家选择的元素生成行动选项的AI。

**任务**:
玩家选择了一些游戏元素（可能是角色、物品、地点、能力等的任意组合）。
根据这些元素和当前世界状态，生成 3-5 个合理的、有趣的行动选项。

**要求**:
1. 每个选项应该是玩家可以执行的具体行动
2. 选项应该多样化，包含不同的可能性（探索、互动、战斗、对话等）
3. 考虑所选元素之间的关系和上下文
4. 选项应该推动故事发展

**输出格式** (XML):
\`\`\`xml
<OptionsResponse>
    <Option id="opt-1">
        <Title>尝试使用钥匙开门</Title>
        <Description>用刚找到的古老钥匙尝试打开神秘的门，可能会发现新的区域</Description>
        <Context>钥匙似乎和门上的锁孔形状吻合...</Context>
    </Option>
    <Option id="opt-2">
        <Title>仔细观察门上的符文</Title>
        <Description>门上刻着奇怪的符文，也许能找到线索</Description>
    </Option>
    <Option id="opt-3">
        <Title>与守卫对话</Title>
        <Description>向附近的守卫询问关于这扇门的信息</Description>
    </Option>
</OptionsResponse>
\`\`\`

注意：Context 是可选的，用于提供额外的氛围描述。
`;

// Streaming version of generateActionOptions
export interface OptionStreamCallbacks {
  onOptionChunk: (option: Partial<ActionOption>) => void;
  onComplete: (options: ActionOption[]) => void;
  onError: (error: Error) => void;
}

export const generateActionOptionsStream = async (
  llmConfig: LLMConfig,
  worldState: GameElement,
  selectedElements: SelectedElement[],
  history: ChatMessage[],
  callbacks: OptionStreamCallbacks
): Promise<void> => {
  const openai = new OpenAI({
    baseURL: llmConfig.apiHost,
    apiKey: llmConfig.apiKey,
    dangerouslyAllowBrowser: true,
  });

  const worldXML = stateToXML(worldState);

  // Format selected elements for prompt
  const elementsDesc = selectedElements
    .map((e) => `- ${e.name} (${e.type}, id: ${e.id})`)
    .join("\n");

  const prompt = `
当前世界状态 (XML):
${worldXML}

---

玩家选择了以下元素:
${elementsDesc}

---

请基于这些元素生成 3-5 个行动选项。
`;

  // Build messages with history
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: optionGenerationInstruction }];

  // Add recent history for context (last 4 messages)
  const recentHistory = history.slice(-4);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: "user", content: prompt });

  try {
    const stream = await openai.chat.completions.create({
      model: llmConfig.apiModel,
      messages,
      temperature: 0.9,
      stream: true,
    });

    let fullText = "";
    const parsedOptions: ActionOption[] = [];
    let currentOptionBuffer = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullText += content;
      currentOptionBuffer += content;

      // Try to parse options as they stream in
      // Look for complete <Option> tags
      const optionMatches = currentOptionBuffer.matchAll(
        /<Option[^>]*>[\s\S]*?<\/Option>/g
      );

      for (const match of optionMatches) {
        const optionXML = match[0];

        // Parse this option
        const parser = new DOMParser();
        const doc = parser.parseFromString(optionXML, "text/xml");
        const optNode = doc.querySelector("Option");

        if (optNode) {
          const id =
            optNode.getAttribute("id") ||
            `opt-${Math.random().toString(36).substr(2, 9)}`;
          const title =
            optNode.querySelector("Title")?.textContent || "未知选项";
          const description =
            optNode.querySelector("Description")?.textContent || "";
          const context =
            optNode.querySelector("Context")?.textContent || undefined;

          const option: ActionOption = { id, title, description, context };

          // Check if we already have this option
          if (!parsedOptions.find(o => o.id === id)) {
            parsedOptions.push(option);
            callbacks.onOptionChunk(option);
          }
        }

        // Remove parsed option from buffer
        currentOptionBuffer = currentOptionBuffer.replace(optionXML, "");
      }
    }

    callbacks.onComplete(parsedOptions);
  } catch (error) {
    console.error("Option Generation Failed:", error);
    callbacks.onError(error as Error);
  }
};

// --- System Event Generation ---

/**
 * Generate a system event (follow-up event triggered by the world)
 */
export const generateSystemEvent = async (
  llmConfig: LLMConfig,
  worldState: GameElement,
  eventType: string,
  eventDescription: string,
  history: ChatMessage[]
): Promise<TurnResponse> => {
  const openai = new OpenAI({
    baseURL: llmConfig.apiHost,
    apiKey: llmConfig.apiKey,
    dangerouslyAllowBrowser: true,
  });

  const worldXML = stateToXML(worldState);

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

  // Build messages with history
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: gameLoopInstruction }];

  // Add recent history for context
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: "user", content: systemEventPrompt });

  try {
    const response = await openai.chat.completions.create({
      model: llmConfig.apiModel,
      messages,
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No response from AI");
    return parseXMLResponse(text);
  } catch (error) {
    console.error("System Event Generation Failed:", error);
    throw error;
  }
};

// Streaming version for system events
export const generateSystemEventStream = async (
  llmConfig: LLMConfig,
  worldState: GameElement,
  eventType: string,
  eventDescription: string,
  history: ChatMessage[],
  callbacks: StreamCallbacks
): Promise<{ userMessage: string; assistantMessage: string }> => {
  const openai = new OpenAI({
    baseURL: llmConfig.apiHost,
    apiKey: llmConfig.apiKey,
    dangerouslyAllowBrowser: true,
  });

  const worldXML = stateToXML(worldState);

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

  // Build messages with history
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: gameLoopInstruction }];

  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: "user", content: systemEventPrompt });

  let narrativeForHistory = "";

  try {
    const stream = await openai.chat.completions.create({
      model: llmConfig.apiModel,
      messages,
      stream: true,
    });

    let fullText = "";
    let currentNarrative = "";
    let inNarrative = false;
    let narrativeBuffer = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullText += content;

      // Extract narrative content in real-time
      if (!inNarrative && fullText.includes("<Narrative>")) {
        inNarrative = true;
        const startIdx = fullText.indexOf("<Narrative>") + "<Narrative>".length;
        narrativeBuffer = fullText.slice(startIdx);
      } else if (inNarrative) {
        narrativeBuffer += content;
      }

      // Check if narrative is complete
      if (inNarrative && narrativeBuffer.includes("</Narrative>")) {
        const endIdx = narrativeBuffer.indexOf("</Narrative>");
        currentNarrative = narrativeBuffer.slice(0, endIdx);
        inNarrative = false;
      } else if (inNarrative) {
        let safeNarrative = narrativeBuffer;
        if (safeNarrative.includes("<")) {
          safeNarrative = safeNarrative.slice(
            0,
            safeNarrative.lastIndexOf("<")
          );
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

    // Parse the complete response
    const response = parseXMLResponse(fullText);
    narrativeForHistory = response.narrative;
    callbacks.onComplete(response);

    return {
      userMessage: userPromptSimple,
      assistantMessage: `叙事: ${narrativeForHistory}`,
    };
  } catch (error) {
    console.error("System Event Streaming Failed:", error);
    callbacks.onError(error as Error);
    return { userMessage: userPromptSimple, assistantMessage: "" };
  }
};

export const generateActionOptions = async (
  llmConfig: LLMConfig,
  worldState: GameElement,
  selectedElements: SelectedElement[],
  history: ChatMessage[]
): Promise<ActionOption[]> => {
  const openai = new OpenAI({
    baseURL: llmConfig.apiHost,
    apiKey: llmConfig.apiKey,
    dangerouslyAllowBrowser: true,
  });

  const worldXML = stateToXML(worldState);

  // Format selected elements for prompt
  const elementsDesc = selectedElements
    .map((e) => `- ${e.name} (${e.type}, id: ${e.id})`)
    .join("\n");

  const prompt = `
当前世界状态 (XML):
${worldXML}

---

玩家选择了以下元素:
${elementsDesc}

---

请基于这些元素生成 3-5 个行动选项。
`;

  // Build messages with history
  const messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [{ role: "system", content: optionGenerationInstruction }];

  // Add recent history for context (last 4 messages)
  const recentHistory = history.slice(-4);
  for (const msg of recentHistory) {
    messages.push({ role: msg.role, content: msg.content });
  }

  messages.push({ role: "user", content: prompt });

  try {
    const response = await openai.chat.completions.create({
      model: llmConfig.apiModel,
      messages,
      temperature: 0.9, // Higher temperature for more creative options
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No response from AI");

    // Parse XML response
    const match = text.match(/<OptionsResponse>[\s\S]*?<\/OptionsResponse>/);
    const cleanXML = match ? match[0] : text;
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanXML, "text/xml");

    const options: ActionOption[] = [];
    const optionNodes = doc.querySelectorAll("Option");

    for (const optNode of Array.from(optionNodes)) {
      const id =
        optNode.getAttribute("id") ||
        `opt-${Math.random().toString(36).substr(2, 9)}`;
      const title =
        optNode.querySelector("Title")?.textContent || "未知选项";
      const description =
        optNode.querySelector("Description")?.textContent || "";
      const context = optNode.querySelector("Context")?.textContent || undefined;

      options.push({ id, title, description, context });
    }

    return options;
  } catch (error) {
    console.error("Option Generation Failed:", error);
    throw error;
  }
};
