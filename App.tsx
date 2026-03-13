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
  const { currentTab, settings, sessions, activeSessionId } = useStore();

  React.useEffect(() => {
    let activeCustomTheme = settings.customTheme;
    
    if (currentTab === 'chat' && activeSessionId) {
      const session = sessions.find(s => s.id === activeSessionId);
      if (session?.customTheme) {
        activeCustomTheme = session.customTheme;
      }
    }

    const root = document.documentElement;

    if (activeCustomTheme) {
      root.setAttribute('data-theme', 'custom');
      
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
      };

      root.style.setProperty('--wade-accent', activeCustomTheme.accent);
      root.style.setProperty('--wade-accent-rgb', hexToRgb(activeCustomTheme.accent));
      root.style.setProperty('--wade-accent-hover', activeCustomTheme.accentHover);
      root.style.setProperty('--wade-accent-hover-rgb', hexToRgb(activeCustomTheme.accentHover));
      root.style.setProperty('--wade-accent-light', activeCustomTheme.accentLight);
      root.style.setProperty('--wade-accent-light-rgb', hexToRgb(activeCustomTheme.accentLight));
      
      root.style.setProperty('--wade-bg-base', activeCustomTheme.bgBase);
      root.style.setProperty('--wade-bg-base-rgb', hexToRgb(activeCustomTheme.bgBase));
      root.style.setProperty('--wade-bg-card', activeCustomTheme.bgCard);
      root.style.setProperty('--wade-bg-card-rgb', hexToRgb(activeCustomTheme.bgCard));
      root.style.setProperty('--wade-bg-app', activeCustomTheme.bgApp);
      root.style.setProperty('--wade-bg-app-rgb', hexToRgb(activeCustomTheme.bgApp));
      
      root.style.setProperty('--wade-text-main', activeCustomTheme.textMain);
      root.style.setProperty('--wade-text-main-rgb', hexToRgb(activeCustomTheme.textMain));
      root.style.setProperty('--wade-text-muted', activeCustomTheme.textMuted);
      root.style.setProperty('--wade-text-muted-rgb', hexToRgb(activeCustomTheme.textMuted));
      
      root.style.setProperty('--wade-border', activeCustomTheme.border);
      root.style.setProperty('--wade-border-rgb', hexToRgb(activeCustomTheme.border));
      root.style.setProperty('--wade-border-light', activeCustomTheme.borderLight);
      root.style.setProperty('--wade-border-light-rgb', hexToRgb(activeCustomTheme.borderLight));
      
      root.style.setProperty('--wade-code-bg', activeCustomTheme.codeBg);
      root.style.setProperty('--wade-code-bg-rgb', hexToRgb(activeCustomTheme.codeBg));
      root.style.setProperty('--wade-code-text', activeCustomTheme.codeText);
      root.style.setProperty('--wade-code-text-rgb', hexToRgb(activeCustomTheme.codeText));
      
      root.style.setProperty('--wade-shadow-glow', activeCustomTheme.shadowGlow);
      
      root.style.setProperty('--wade-bubble-luna', activeCustomTheme.bubbleLuna);
      root.style.setProperty('--wade-bubble-wade', activeCustomTheme.bubbleWade);
      
      // Apply font family and size
      document.body.style.fontFamily = `"${activeCustomTheme.fontFamily}", sans-serif`;
      
      // Handle custom uploaded font
      if (activeCustomTheme.customFontUrl) {
        const styleId = 'custom-uploaded-font';
        let styleEl = document.getElementById(styleId);
        if (!styleEl) {
          styleEl = document.createElement('style');
          styleEl.id = styleId;
          document.head.appendChild(styleEl);
        }
        styleEl.innerHTML = `
          @font-face {
            font-family: "${activeCustomTheme.fontFamily}";
            src: url("${activeCustomTheme.customFontUrl}");
          }
        `;
      } else {
        // Dynamically load Google Font if it's not a standard web font
        const standardFonts = ['Nunito', 'Inter', 'Comic Sans MS', 'Courier New', 'Georgia', 'Arial', 'Times New Roman'];
        if (activeCustomTheme.fontFamily && !standardFonts.includes(activeCustomTheme.fontFamily)) {
          const fontId = `google-font-${activeCustomTheme.fontFamily.replace(/\s+/g, '-')}`;
          if (!document.getElementById(fontId)) {
            const link = document.createElement('link');
            link.id = fontId;
            link.rel = 'stylesheet';
            link.href = `https://fonts.googleapis.com/css2?family=${activeCustomTheme.fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
            document.head.appendChild(link);
          }
        }
      }
      
      const fontSizeMap: Record<string, string> = {
        'small': '14px',
        'medium': '16px',
        'large': '18px'
      };
      // Apply to documentElement so Tailwind's rem units scale accordingly
      document.documentElement.style.fontSize = fontSizeMap[activeCustomTheme.fontSize || 'medium'];
      
    } else {
      // Remove custom styles
      root.removeAttribute('style');
      document.body.removeAttribute('style');
      
      const fontSizeMap: Record<string, string> = {
        'small': '14px',
        'medium': '16px',
        'large': '18px'
      };
      document.documentElement.style.fontSize = fontSizeMap[settings.fontSize || 'medium'];
      
      const themeMap: Record<string, string> = {
        '#d58f99': 'default',
        '#97181A': 'deadpool',
        '#9D8DF1': 'midnight',
        '#4A6FA5': 'serenity',
        '#04BAE8': 'cyberpunk'
      };
      const themeName = themeMap[settings.themeColor] || 'default';
      root.setAttribute('data-theme', themeName);
    }
  }, [settings.themeColor, settings.customTheme, settings.fontSize, currentTab, activeSessionId, sessions]);

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
