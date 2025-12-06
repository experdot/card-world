/**
 * 应用根组件
 */

import React, { useEffect } from 'react';
import { useGameStore } from '@/features/game/stores';
import { MenuScreen, SettingsScreen, SetupScreen, GameScreen } from '@/components/screens';

const App: React.FC = () => {
  const {
    screen,
    setScreen,
    loadSettings,
    startNewGame,
    continueGame,
    returnToMenu,
    currentLLMConfig,
    initLoading,
  } = useGameStore();

  // 加载设置
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // 渲染当前屏幕
  const renderScreen = () => {
    switch (screen) {
      case 'menu':
        return (
          <MenuScreen
            onNewGame={() => setScreen('setup')}
            onContinueGame={(save) => continueGame(save)}
            onOpenSettings={() => setScreen('settings')}
          />
        );

      case 'setup':
        return (
          <SetupScreen
            onStart={startNewGame}
            onBack={() => setScreen('menu')}
            onOpenSettings={() => setScreen('settings')}
            loading={initLoading}
            hasLLMConfig={!!currentLLMConfig}
          />
        );

      case 'game':
        return <GameScreen onReturnToMenu={returnToMenu} />;

      case 'settings':
        return <SettingsScreen onBack={() => setScreen('menu')} />;

      default:
        return null;
    }
  };

  return <>{renderScreen()}</>;
};

export default App;
