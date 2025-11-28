
import React, { useState, useEffect } from "react";
import { GameSetupConfig, GameElement } from "../types";
import {
  Loader2,
  Wand2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Check,
  Sword,
  Eye,
  Flame,
  MessageCircle,
  EyeOff,
  Link,
  Cloud,
  Skull,
  Zap,
  Ghost,
  Book,
  Globe,
  Backpack,
  Shield,
  Scroll,
  Heart,
} from "lucide-react";
import {
  WORLD_PRESETS,
  WorldPreset,
  ABILITY_SET_INFO,
  buildPlayerPreset,
} from "../presets";

interface SetupScreenProps {
  onStart: (config: GameSetupConfig) => void;
  onBack: () => void;
  onOpenSettings: () => void;
  loading: boolean;
  hasLLMConfig: boolean;
}

// 图标映射
const iconMap: Record<string, React.ReactNode> = {
  skull: <Skull size={20} />,
  zap: <Zap size={20} />,
  cloud: <Cloud size={20} />,
  ghost: <Ghost size={20} />,
  book: <Book size={20} />,
  globe: <Globe size={20} />,
  sword: <Sword size={16} />,
  eye: <Eye size={16} />,
  flame: <Flame size={16} />,
  "message-circle": <MessageCircle size={16} />,
  "eye-off": <EyeOff size={16} />,
  link: <Link size={16} />,
  backpack: <Backpack size={16} />,
  shield: <Shield size={16} />,
  scroll: <Scroll size={16} />,
  heart: <Heart size={16} />,
};

export const SetupScreen: React.FC<SetupScreenProps> = ({
  onStart,
  onBack,
  onOpenSettings,
  loading,
  hasLLMConfig,
}) => {
  const [step, setStep] = useState<"preset" | "customize">("preset");
  const [selectedPreset, setSelectedPreset] = useState<WorldPreset | null>(
    null
  );

  // 自定义设置
  const [worldTheme, setWorldTheme] = useState("");
  const [characterDesc, setCharacterDesc] = useState("");
  const [narrativeStyle, setNarrativeStyle] = useState("");

  // 能力集合选择
  const [selectedAbilitySets, setSelectedAbilitySets] = useState<string[]>([
    "basic",
  ]);

  // 系统选择
  const [useInventory, setUseInventory] = useState(true);
  const [useEquipment, setUseEquipment] = useState(false);
  const [useQuests, setUseQuests] = useState(false);
  const [useStatus, setUseStatus] = useState(true);

  // AI增强选项
  const [skipAIEnhancement, setSkipAIEnhancement] = useState(false);

  // 当选择预设时，更新设置
  useEffect(() => {
    if (selectedPreset) {
      setWorldTheme(selectedPreset.theme);
      setCharacterDesc(selectedPreset.characterDesc);
      setNarrativeStyle(selectedPreset.narrativeStyle);
      setSelectedAbilitySets(selectedPreset.abilitySets);
      setUseInventory(selectedPreset.includeSystems.inventory);
      setUseEquipment(selectedPreset.includeSystems.equipment);
      setUseQuests(selectedPreset.includeSystems.quests);
      setUseStatus(selectedPreset.includeSystems.status);
    }
  }, [selectedPreset]);

  const toggleAbilitySet = (setId: string) => {
    setSelectedAbilitySets((prev) =>
      prev.includes(setId)
        ? prev.filter((id) => id !== setId)
        : [...prev, setId]
    );
  };

  const handleStart = () => {
    const systems = [];
    if (useInventory) systems.push("背包/物品系统");
    if (useEquipment) systems.push("装备系统");
    if (useStatus) systems.push("状态/属性系统");
    if (useQuests) systems.push("任务系统");

    // 构建预设卡牌
    const presetWithCustomSystems: WorldPreset = selectedPreset
      ? {
          ...selectedPreset,
          abilitySets: selectedAbilitySets,
          includeSystems: {
            inventory: useInventory,
            equipment: useEquipment,
            quests: useQuests,
            status: useStatus,
          },
        }
      : {
          id: "custom",
          name: "自定义",
          description: "",
          icon: "globe",
          theme: worldTheme,
          characterDesc,
          narrativeStyle,
          abilitySets: selectedAbilitySets,
          includeSystems: {
            inventory: useInventory,
            equipment: useEquipment,
            quests: useQuests,
            status: useStatus,
          },
          starterItems: [],
        };

    const presetElements = buildPlayerPreset(
      presetWithCustomSystems,
      selectedAbilitySets
    );

    onStart({
      worldTheme,
      characterDesc,
      narrativeStyle,
      systems,
      presetElements,
      skipAIEnhancement,
    });
  };

  // 预设选择界面
  const renderPresetSelection = () => (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="text-sm">返回主菜单</span>
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 mb-2">
          选择你的世界
        </h1>
        <p className="text-slate-500 text-sm">
          每个世界都有独特的背景、能力和挑战
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {WORLD_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => setSelectedPreset(preset)}
            className={`
              relative p-4 rounded-xl border text-left transition-all duration-200
              ${
                selectedPreset?.id === preset.id
                  ? "border-purple-500 bg-purple-900/20 shadow-lg shadow-purple-900/20"
                  : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
              }
            `}
          >
            {selectedPreset?.id === preset.id && (
              <div className="absolute top-3 right-3 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
            <div className="flex items-start gap-3">
              <div
                className={`
                w-10 h-10 rounded-lg flex items-center justify-center
                ${
                  selectedPreset?.id === preset.id
                    ? "bg-purple-500/30 text-purple-300"
                    : "bg-slate-700 text-slate-400"
                }
              `}
              >
                {iconMap[preset.icon] || <Globe size={20} />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-200">{preset.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {preset.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedPreset && (
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
          <h4 className="text-sm font-semibold text-slate-300 mb-2">
            预览: {selectedPreset.name}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {selectedPreset.theme || "自定义你的世界设定..."}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {selectedPreset.abilitySets.map((setId) => (
              <span
                key={setId}
                className="text-xs px-2 py-1 bg-slate-700 rounded text-slate-400"
              >
                {ABILITY_SET_INFO[setId]?.name || setId}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={() => setStep("customize")}
        disabled={!selectedPreset}
        className={`
          w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all
          ${
            selectedPreset
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
              : "bg-slate-800 text-slate-500 cursor-not-allowed"
          }
        `}
      >
        继续定制
        <ChevronRight size={18} />
      </button>
    </div>
  );

  // 自定义界面
  const renderCustomization = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setStep("preset")}
          className="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1"
        >
          <ChevronRight size={14} className="rotate-180" />
          返回
        </button>
        <h2 className="text-xl font-bold text-slate-200">
          定制: {selectedPreset?.name}
        </h2>
        <div className="w-16" />
      </div>

      {/* 世界设定 */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-2">
          世界背景
        </label>
        <textarea
          className="w-full h-24 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none resize-none"
          value={worldTheme}
          onChange={(e) => setWorldTheme(e.target.value)}
          placeholder="描述这个世界的样貌、氛围、背景故事..."
        />
      </div>

      {/* 角色和风格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            主角设定
          </label>
          <textarea
            className="w-full h-20 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none resize-none"
            value={characterDesc}
            onChange={(e) => setCharacterDesc(e.target.value)}
            placeholder="你的角色是谁？有什么背景？"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            叙事风格
          </label>
          <textarea
            className="w-full h-20 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm focus:border-blue-500 outline-none resize-none"
            value={narrativeStyle}
            onChange={(e) => setNarrativeStyle(e.target.value)}
            placeholder="希望的文字风格、氛围..."
          />
        </div>
      </div>

      {/* 能力集合 */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          能力集合
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(ABILITY_SET_INFO).map(([setId, info]) => (
            <button
              key={setId}
              onClick={() => toggleAbilitySet(setId)}
              className={`
                p-3 rounded-lg border text-left transition-all
                ${
                  selectedAbilitySets.includes(setId)
                    ? "border-purple-500 bg-purple-900/30"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={
                    selectedAbilitySets.includes(setId)
                      ? "text-purple-400"
                      : "text-slate-500"
                  }
                >
                  {iconMap[info.icon] || <Zap size={14} />}
                </span>
                <span
                  className={`text-xs font-medium ${
                    selectedAbilitySets.includes(setId)
                      ? "text-purple-300"
                      : "text-slate-400"
                  }`}
                >
                  {info.name}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                {info.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 系统模块 */}
      <div>
        <label className="block text-sm font-semibold text-slate-300 mb-3">
          游戏系统
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <label
            className={`
            flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
            ${
              useInventory
                ? "border-blue-500 bg-blue-900/20"
                : "border-slate-700 bg-slate-800/50"
            }
          `}
          >
            <input
              type="checkbox"
              checked={useInventory}
              onChange={(e) => setUseInventory(e.target.checked)}
              className="hidden"
            />
            <Backpack
              size={16}
              className={useInventory ? "text-blue-400" : "text-slate-500"}
            />
            <span
              className={`text-xs ${
                useInventory ? "text-blue-300" : "text-slate-400"
              }`}
            >
              背包
            </span>
          </label>

          <label
            className={`
            flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
            ${
              useEquipment
                ? "border-blue-500 bg-blue-900/20"
                : "border-slate-700 bg-slate-800/50"
            }
          `}
          >
            <input
              type="checkbox"
              checked={useEquipment}
              onChange={(e) => setUseEquipment(e.target.checked)}
              className="hidden"
            />
            <Shield
              size={16}
              className={useEquipment ? "text-blue-400" : "text-slate-500"}
            />
            <span
              className={`text-xs ${
                useEquipment ? "text-blue-300" : "text-slate-400"
              }`}
            >
              装备栏
            </span>
          </label>

          <label
            className={`
            flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
            ${
              useStatus
                ? "border-blue-500 bg-blue-900/20"
                : "border-slate-700 bg-slate-800/50"
            }
          `}
          >
            <input
              type="checkbox"
              checked={useStatus}
              onChange={(e) => setUseStatus(e.target.checked)}
              className="hidden"
            />
            <Heart
              size={16}
              className={useStatus ? "text-blue-400" : "text-slate-500"}
            />
            <span
              className={`text-xs ${
                useStatus ? "text-blue-300" : "text-slate-400"
              }`}
            >
              状态
            </span>
          </label>

          <label
            className={`
            flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
            ${
              useQuests
                ? "border-blue-500 bg-blue-900/20"
                : "border-slate-700 bg-slate-800/50"
            }
          `}
          >
            <input
              type="checkbox"
              checked={useQuests}
              onChange={(e) => setUseQuests(e.target.checked)}
              className="hidden"
            />
            <Scroll
              size={16}
              className={useQuests ? "text-blue-400" : "text-slate-500"}
            />
            <span
              className={`text-xs ${
                useQuests ? "text-blue-300" : "text-slate-400"
              }`}
            >
              任务
            </span>
          </label>
        </div>
      </div>

      {/* AI增强选项 */}
      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex-1">
            <span className="text-sm font-semibold text-slate-300">
              跳过AI场景增强
            </span>
            <p className="text-xs text-slate-500 mt-1">
              直接使用预设进入游戏，不通过AI生成初始场景。速度更快，但场景较为简单。
            </p>
          </div>
          <div className="ml-4">
            <input
              type="checkbox"
              checked={skipAIEnhancement}
              onChange={(e) => setSkipAIEnhancement(e.target.checked)}
              className="hidden"
            />
            <div
              className={`
                w-12 h-6 rounded-full relative transition-all
                ${skipAIEnhancement ? "bg-purple-600" : "bg-slate-600"}
              `}
            >
              <div
                className={`
                  absolute top-1 w-4 h-4 rounded-full bg-white transition-all
                  ${skipAIEnhancement ? "left-7" : "left-1"}
                `}
              />
            </div>
          </div>
        </label>
      </div>

      {/* 启动按钮 */}
      <button
        onClick={handleStart}
        disabled={loading || !hasLLMConfig || (!skipAIEnhancement && !worldTheme)}
        className={`
          w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all mt-6
          ${
            loading || !hasLLMConfig || (!skipAIEnhancement && !worldTheme)
              ? "bg-slate-700 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-purple-900/30 hover:scale-[1.02]"
          }
        `}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" />
            正在构建世界...
          </>
        ) : (
          <>
            <Wand2 />
            开始冒险
          </>
        )}
      </button>

      {/* LLM 配置提示 */}
      {!hasLLMConfig && (
        <div className="mt-4 text-center">
          <p className="text-sm text-amber-500 mb-2">
            请先配置大模型才能开始游戏
          </p>
          <button
            onClick={onOpenSettings}
            className="text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            前往设置
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-950 text-slate-200 overflow-y-auto">
      <div className="flex flex-col items-center p-4 py-8">
        <div className="max-w-2xl w-full bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm animate-in fade-in zoom-in duration-500">
          {step === "preset" ? renderPresetSelection() : renderCustomization()}
        </div>
      </div>
    </div>
  );
};
