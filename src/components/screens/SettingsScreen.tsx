/**
 * 设置屏幕
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Key,
  Server,
  Cpu,
  Loader2,
  Plus,
  Trash2,
  Star,
  ChevronDown,
  ChevronRight,
  Edit2,
} from 'lucide-react';
import type { GameSettings, LLMConfig } from '@/shared/types';
import {
  getSettings,
  saveSettings,
  getDefaultSettings,
  generateLLMConfigId,
} from '@/features/storage/services';

interface SettingsScreenProps {
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<GameSettings>(getDefaultSettings());
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = await getSettings();
      if (savedSettings) {
        setSettings({ ...getDefaultSettings(), ...savedSettings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: GameSettings) => {
    setSettings(newSettings);
    try {
      await saveSettings(newSettings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const addNewConfig = async () => {
    const newConfig: LLMConfig = {
      id: generateLLMConfigId(),
      name: `配置 ${settings.llmConfigs.length + 1}`,
      apiKey: '',
      apiHost: '',
      apiModel: '',
    };
    const newSettings = {
      ...settings,
      llmConfigs: [...settings.llmConfigs, newConfig],
      defaultLLMId: settings.llmConfigs.length === 0 ? newConfig.id : settings.defaultLLMId,
    };
    await updateSettings(newSettings);
    setExpandedId(newConfig.id);
  };

  const confirmDelete = async (id: string) => {
    const newConfigs = settings.llmConfigs.filter((c) => c.id !== id);
    const newDefaultId =
      settings.defaultLLMId === id ? newConfigs[0]?.id || '' : settings.defaultLLMId;
    await updateSettings({
      ...settings,
      llmConfigs: newConfigs,
      defaultLLMId: newDefaultId,
    });
    if (expandedId === id) {
      setExpandedId(null);
    }
    setDeletingId(null);
  };

  const updateConfig = async (id: string, updates: Partial<LLMConfig>) => {
    const newConfigs = settings.llmConfigs.map((c) => (c.id === id ? { ...c, ...updates } : c));
    await updateSettings({ ...settings, llmConfigs: newConfigs });
  };

  const setDefaultConfig = async (id: string) => {
    await updateSettings({ ...settings, defaultLLMId: id });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200">
        <Loader2 className="animate-spin text-slate-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200 p-4">
      <div className="max-w-lg w-full bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-sm">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">返回</span>
          </button>
          <h1 className="text-xl font-bold text-slate-200">设置</h1>
          <div className="w-16" />
        </div>

        <div className="space-y-6">
          {/* LLM 配置 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                LLM 配置
              </h2>
              <button
                onClick={addNewConfig}
                className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus size={16} />
                添加
              </button>
            </div>

            {settings.llmConfigs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="mb-2">暂无配置</p>
                <button
                  onClick={addNewConfig}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  添加第一个配置
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {settings.llmConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/30"
                  >
                    {/* 配置头部 */}
                    <div
                      className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
                      onClick={() => setExpandedId(expandedId === config.id ? null : config.id)}
                    >
                      {expandedId === config.id ? (
                        <ChevronDown size={16} className="text-slate-500" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-500" />
                      )}

                      {editingNameId === config.id ? (
                        <input
                          type="text"
                          value={config.name}
                          onChange={(e) => updateConfig(config.id, { name: e.target.value })}
                          onBlur={() => setEditingNameId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingNameId(null)}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                          className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm outline-none focus:border-blue-500"
                        />
                      ) : (
                        <span className="flex-1 text-sm font-medium text-slate-200">
                          {config.name}
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        {settings.defaultLLMId === config.id && (
                          <span className="text-xs bg-blue-600/30 text-blue-400 px-2 py-0.5 rounded">
                            默认
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingNameId(config.id);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                          title="重命名"
                        >
                          <Edit2 size={14} />
                        </button>
                        {settings.defaultLLMId !== config.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefaultConfig(config.id);
                            }}
                            className="p-1 text-slate-500 hover:text-yellow-400 transition-colors"
                            title="设为默认"
                          >
                            <Star size={14} />
                          </button>
                        )}
                        {settings.defaultLLMId === config.id && (
                          <Star size={14} className="text-yellow-400" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingId(config.id);
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* 配置详情 */}
                    {expandedId === config.id && (
                      <div className="p-4 pt-2 space-y-4 border-t border-slate-700">
                        {/* API Key */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-slate-300">
                            <Key size={14} className="text-slate-500" />
                            API Key
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => updateConfig(config.id, { apiKey: e.target.value })}
                            placeholder="输入 API Key..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>

                        {/* API Host */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-slate-300">
                            <Server size={14} className="text-slate-500" />
                            API Host
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={config.apiHost}
                            onChange={(e) => updateConfig(config.id, { apiHost: e.target.value })}
                            placeholder="例如: https://openrouter.ai/api/v1"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-colors"
                          />
                          <p className="text-xs text-slate-600">OpenAI 兼容的 API 地址</p>
                        </div>

                        {/* API Model */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm text-slate-300">
                            <Cpu size={14} className="text-slate-500" />
                            模型
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={config.apiModel}
                            onChange={(e) => updateConfig(config.id, { apiModel: e.target.value })}
                            placeholder="例如: anthropic/claude-3.5-sonnet"
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-colors"
                          />
                          <p className="text-xs text-slate-600">模型名称，格式取决于 API 服务商</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-200 mb-2">确认删除</h3>
            <p className="text-sm text-slate-400 mb-6">
              确定要删除配置「{settings.llmConfigs.find((c) => c.id === deletingId)?.name}
              」吗？此操作无法撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => confirmDelete(deletingId)}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
