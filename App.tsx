import './globals.css';
import React from 'react';
import { StoreProvider, useStore } from './store';
import { Shell } from './components/layout/Shell';
import { ChatInterface } from './components/views/ChatInterface';
import { SocialFeed } from './components/views/SocialFeed';
import { Divination } from './components/views/Divination';
import { Settings } from './components/views/Settings';
import { PersonaTuning } from './components/views/PersonaTuning';
import { Memos } from './components/views/Memos';
import { MemoryBank } from './components/views/MemoryBank';
import { Home } from './components/views/Home';
import { TimeCapsulesView } from './components/views/TimeCapsulesView';
import { WadesPicksView } from './components/views/WadesPicksView';

const AppContent = () => {
  const { currentTab, settings } = useStore();

  React.useEffect(() => {
    const themeMap: Record<string, string> = {
      '#d58f99': 'default',
      '#E23636': 'deadpool',
      '#9D8DF1': 'midnight',
      '#5B9BB3': 'serenity',
      '#04BAE8': 'cyberpunk'
    };
    const themeName = themeMap[settings.themeColor] || 'default';
    document.documentElement.setAttribute('data-theme', themeName);
  }, [settings.themeColor]);

  const renderView = () => {
    switch(currentTab) {
      case 'home': return <Home />;
      case 'chat': return <ChatInterface />;
      case 'social': return <SocialFeed />;
      case 'divination': return <Divination />;
      case 'settings': return <Settings />;
      case 'persona': return <PersonaTuning />;
      case 'favorites': return <Memos />; 
      case 'memory': return <MemoryBank />;
      case 'time-capsules': return <TimeCapsulesView />;
      case 'wade-picks': return <WadesPicksView />;
      default: return <Home />;
    }
  };

  return (
    <Shell>
      {renderView()}
    </Shell>
  );
};

const App = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;
