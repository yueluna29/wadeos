import './globals.css';
import React from 'react';
import { StoreProvider, useStore } from './store';
import { useWadeTheme } from './hooks/useWadeTheme';
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
import { HealthTracker } from './components/views/HealthTracker';

const AppContent = () => {
  const { currentTab } = useStore();
  
  useWadeTheme();

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
      case 'health': return <HealthTracker />;
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