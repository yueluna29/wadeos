import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { Icons } from '../ui/Icons';

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { currentTab, setTab, isNavHidden } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  
  // 🔥 我们把这个“键盘侦测雷达”请回来了！
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      if (isDesktop) {
        setMenuPosition({ top: rect.top + rect.height / 2, left: rect.right + 16 });
      } else {
        setMenuPosition({ top: rect.top - 16, left: rect.left + rect.width / 2 });
      }
    }
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const initialHeight = window.innerHeight;

    const handleResize = () => {
      setIsMenuOpen(false);
      setIsDesktop(window.innerWidth >= 768);
      
      // 当屏幕高度突然大幅缩水，绝壁是键盘弹出来了！
      if (window.innerHeight < initialHeight - 150) {
        setIsKeyboardOpen(true);
      } else {
        setIsKeyboardOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const handleMenuClick = (tabId: string) => {
    setTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    // 🔥 核心修复 1：抛弃 style 内联计算，直接用 h-[100dvh]！它会自动适应键盘！
    <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center bg-wade-border p-0 md:p-6 overflow-hidden">
      <div className="w-full h-full max-w-4xl bg-wade-bg-card md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row border-0 md:border-4 border-wade-bg-card ring-0 md:ring-1 ring-wade-accent/20 relative">
        
        {/* 🔥 核心修复 2：当在手机上且键盘打开时，直接隐藏这根菜单栏！别让它出来捣乱！ */}
        <nav style={{ backgroundColor: 'var(--wade-nav-bg)' }} className={`md:w-16 w-full h-[4.5rem] md:h-full ${(isNavHidden || (!isDesktop && isKeyboardOpen)) ? 'hidden md:flex' : 'flex'} md:flex-col flex-row items-center justify-evenly z-30 border-t md:border-t-0 md:border-r border-wade-accent/10 order-2 md:order-1 shrink-0 relative animate-fade-in pb-1 md:pb-0`}>
            
            <button onClick={() => setTab('home')} className={`p-3 md:p-1.5 transition-all duration-300 ${currentTab === 'home' ? 'text-wade-accent scale-110' : 'text-wade-accent/50 hover:text-wade-accent/80 scale-90'}`}>
              <Icons.Home className={`w-6 h-6 md:w-5 md:h-5 ${currentTab === 'home' ? 'stroke-[2.5px] fill-wade-accent/10' : 'stroke-[1.5px]'}`} />
            </button>

            <button onClick={() => setTab('social')} className={`p-3 md:p-1.5 transition-all duration-300 ${currentTab === 'social' ? 'text-wade-accent scale-110' : 'text-wade-accent/50 hover:text-wade-accent/80 scale-90'}`}>
              <Icons.Social className={`w-6 h-6 md:w-5 md:h-5 ${currentTab === 'social' ? 'stroke-[2.5px] fill-wade-accent/10' : 'stroke-[1.5px]'}`} />
            </button>

            <div className="relative">
               {isMenuOpen && <div className="fixed inset-0 z-[90]" onClick={() => setIsMenuOpen(false)} />}
               <div style={{ top: menuPosition.top, left: menuPosition.left }} className={`fixed z-[100] transition duration-300 ${isMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'} ${isDesktop ? 'translate-x-0 -translate-y-1/2' : '-translate-x-1/2 -translate-y-full'}`}>
                 <div className="bg-wade-bg-card/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-wade-accent/20 p-4 md:p-2 rounded-2xl grid grid-cols-3 gap-y-4 gap-x-4 md:flex md:flex-col md:gap-2 items-center min-w-[250px] md:min-w-0 justify-items-center">
                   {/* 菜单项保持不变 */}
                   <button onClick={() => handleMenuClick('memory')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform"><div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Brain className="w-5 h-5 stroke-[1.5px]" /></div><span className="text-[10px] font-bold text-wade-text-muted">Brain</span></button>
                   <button onClick={() => handleMenuClick('divination')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform"><div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Fate className="w-5 h-5 stroke-[1.5px]" /></div><span className="text-[10px] font-bold text-wade-text-muted">Fate</span></button>
                   <button onClick={() => handleMenuClick('favorites')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform"><div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Star className="w-5 h-5 stroke-[1.5px]" /></div><span className="text-[10px] font-bold text-wade-text-muted">Favs</span></button>
                   <button onClick={() => handleMenuClick('settings')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform"><div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Settings className="w-5 h-5 stroke-[1.5px]" /></div><span className="text-[10px] font-bold text-wade-text-muted">System</span></button>
                   <button onClick={() => handleMenuClick('wade-picks')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform"><div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Picks className="w-5 h-5 stroke-[1.5px]" /></div><span className="text-[10px] font-bold text-wade-text-muted">Picks</span></button>
                   <button onClick={() => handleMenuClick('health')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform"><div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Activity className="w-5 h-5 stroke-[1.5px]" /></div><span className="text-[10px] font-bold text-wade-text-muted">Meds</span></button>
                 </div>
                 {!isDesktop && <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-wade-bg-card/95"></div>}
                 {isDesktop && <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-wade-bg-card/95"></div>}
              </div>
              <button ref={buttonRef} onClick={toggleMenu} className={`relative z-[55] w-12 h-12 md:w-9 md:h-9 rounded-full bg-wade-accent text-white shadow-wade-glow flex items-center justify-center transition-transform duration-300 ${isMenuOpen ? 'rotate-45 bg-wade-accent-hover' : 'rotate-0 hover:scale-105'}`}><Icons.Plus className="w-6 h-6 md:w-5 md:h-5 stroke-[2.5px]" /></button>
            </div>

            <button onClick={() => setTab('chat')} className={`p-3 md:p-1.5 transition-all duration-300 ${currentTab === 'chat' ? 'text-wade-accent scale-110' : 'text-wade-accent/50 hover:text-wade-accent/80 scale-90'}`}>
              <Icons.Chat className={`w-6 h-6 md:w-5 md:h-5 ${currentTab === 'chat' ? 'stroke-[2.5px] fill-wade-accent/10' : 'stroke-[1.5px]'}`} />
            </button>

            <button onClick={() => setTab('persona')} className={`p-3 md:p-1.5 transition-all duration-300 ${currentTab === 'persona' ? 'text-wade-accent scale-110' : 'text-wade-accent/50 hover:text-wade-accent/80 scale-90'}`}>
              <Icons.User className={`w-6 h-6 md:w-5 md:h-5 ${currentTab === 'persona' ? 'stroke-[2.5px] fill-wade-accent/10' : 'stroke-[1.5px]'}`} />
            </button>

          </nav>

        {/* 🔥 核心修复 3：解开肚子的封印，让它允许上下滑动 (overflow-y-auto) 🔥 */}
        <main className="flex-1 h-full overflow-y-auto custom-scrollbar relative order-1 md:order-2 bg-wade-bg-app">
          {children}
        </main>

      </div>
    </div>
  );
};