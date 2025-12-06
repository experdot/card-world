/**
 * 主菜单屏幕
 */

import React, { useState, useEffect } from 'react';
import { Play, FolderOpen, Settings, Trash2, Clock, Loader2, Sparkles } from 'lucide-react';
import type { GameSave } from '@/shared/types';
import { getAllSaves, deleteSave } from '@/features/storage/services';

interface MenuScreenProps {
  onNewGame: () => void;
  onContinueGame: (save: GameSave) => void;
  onOpenSettings: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  onNewGame,
  onContinueGame,
  onOpenSettings,
}) => {
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaves, setShowSaves] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadSaves();
  }, []);

  const loadSaves = async () => {
    try {
      setLoading(true);
      const allSaves = await getAllSaves();
      setSaves(allSaves);
    } catch (error) {
      console.error('Failed to load saves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSave = async (id: string) => {
    try {
      await deleteSave(id);
      setSaves(saves.filter((s) => s.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete save:', error);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSavesList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-200">选择存档</h2>
        <button
          onClick={() => setShowSaves(false)}
          className="text-sm text-slate-500 hover:text-slate-300"
        >
          返回
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-slate-500" size={32} />
        </div>
      ) : saves.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <FolderOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>暂无存档</p>
          <p className="text-sm mt-2">开始新游戏后会自动保存</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {saves.map((save) => (
            <div
              key={save.id}
              className="group relative p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all"
            >
              <div className="cursor-pointer" onClick={() => onContinueGame(save)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-200 truncate">{save.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {save.previewText || '冒险进行中...'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 ml-3">
                    <Clock size={12} />
                    {formatDate(save.updatedAt)}
                  </div>
                </div>
              </div>

              {deleteConfirm === save.id ? (
                <div className="absolute right-2 top-2 flex items-center gap-2 bg-slate-900 p-2 rounded-lg">
                  <span className="text-xs text-red-400">确认删除?</span>
                  <button
                    onClick={() => handleDeleteSave(save.id)}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500"
                  >
                    删除
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="text-xs px-2 py-1 bg-slate-700 text-slate-300 rounded hover:bg-slate-600"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(save.id);
                  }}
                  className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMainMenu = () => (
    <div className="space-y-8">
      {/* 标题 */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="text-purple-400" size={32} />
        </div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-3">
          Aetheria
        </h1>
        <p className="text-lg text-slate-400">卡牌世界</p>
        <p className="text-sm text-slate-600 mt-2">AI驱动的交互式冒险游戏</p>
      </div>

      {/* 菜单按钮 */}
      <div className="space-y-3">
        <button
          onClick={onNewGame}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-purple-900/30 hover:scale-[1.02]"
        >
          <Play size={20} />
          新游戏
        </button>

        <button
          onClick={() => setShowSaves(true)}
          disabled={saves.length === 0 && !loading}
          className={`
            w-full py-4 px-6 font-semibold rounded-xl flex items-center justify-center gap-3 transition-all
            ${
              saves.length === 0 && !loading
                ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600'
            }
          `}
        >
          <FolderOpen size={20} />
          继续游戏
          {saves.length > 0 && (
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full">{saves.length}</span>
          )}
        </button>

        <button
          onClick={onOpenSettings}
          className="w-full py-4 px-6 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold rounded-xl flex items-center justify-center gap-3 transition-all border border-slate-800 hover:border-slate-700"
        >
          <Settings size={20} />
          设置
        </button>
      </div>

      {/* 页脚 */}
      <div className="text-center text-xs text-slate-600 pt-4">
        <p>Card World AI v0.1</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-200 p-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
        {showSaves ? renderSavesList() : renderMainMenu()}
      </div>
    </div>
  );
};
