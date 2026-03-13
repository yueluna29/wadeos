
import React, { useState } from 'react';
import { useStore } from '../../store';

interface ShellProps {
  children: React.ReactNode;
}

// Minimalistic Rounded Line Art Icons - Petite Edition
const Icons = {
  Home: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Chat: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  ),
  Social: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Fate: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
    </svg>
  ),
  Star: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  User: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Settings: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
       <circle cx="12" cy="12" r="3" />
       <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Brain: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
    </svg>
  ),
  Plus: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Picks: ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/>
      <path d="m6.2 5.3 3.1 3.9"/>
      <path d="m12.4 3.4 3.1 4"/>
      <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>
    </svg>
  ),
};

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { currentTab, setTab, isNavHidden } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [viewportHeight, setViewportHeight] = useState('100dvh');
  const [viewportTop, setViewportTop] = useState(0);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const toggleMenu = () => {
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      if (isDesktop) {
        // Desktop: Right of button, centered vertically
        setMenuPosition({
          top: rect.top + rect.height / 2,
          left: rect.right + 16
        });
      } else {
        // Mobile: Above button, centered horizontally
        setMenuPosition({
          top: rect.top - 16,
          left: rect.left + rect.width / 2
        });
      }
    }
    setIsMenuOpen(!isMenuOpen);
  };

  React.useEffect(() => {
    const handleResize = () => {
      setIsMenuOpen(false);
      setIsDesktop(window.innerWidth >= 768);
      if (window.visualViewport) {
        setViewportHeight(`${window.visualViewport.height}px`);
        setViewportTop(window.visualViewport.offsetTop);
        window.scrollTo(0, 0);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      // Initial set
      setViewportHeight(`${window.visualViewport.height}px`);
      setViewportTop(window.visualViewport.offsetTop);
    } else {
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);
  
  const handleMenuClick = (tabId: string) => {
    setTab(tabId);
    setIsMenuOpen(false);
  };

  return (
    <div 
      className="fixed inset-0 w-full flex items-center justify-center bg-wade-border p-0 md:p-6 overflow-hidden"
      style={{ height: viewportHeight, top: viewportTop }}
    >
      
      <div className="w-full h-full max-w-4xl bg-wade-bg-card md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row border-0 md:border-4 border-wade-bg-card ring-0 md:ring-1 ring-wade-accent/20 relative">
        
        {/* Navigation Bar */}
        <nav className={`bg-wade-accent-light md:w-16 w-full h-[4.5rem] md:h-full ${isNavHidden ? 'hidden md:flex' : 'flex'} md:flex-col flex-row items-center justify-evenly z-30 border-t md:border-t-0 md:border-r border-wade-accent/10 order-2 md:order-1 shrink-0 relative animate-fade-in pb-1 md:pb-0`}>
            
            <button onClick={() => setTab('home')} className={`p-3 md:p-1.5 transition-all duration-300 ${currentTab === 'home' ? 'text-wade-accent scale-110' : 'text-wade-accent/50 hover:text-wade-accent/80 scale-90'}`}>
              <Icons.Home className={`w-6 h-6 md:w-5 md:h-5 ${currentTab === 'home' ? 'stroke-[2.5px] fill-wade-accent/10' : 'stroke-[1.5px]'}`} />
            </button>

            <button onClick={() => setTab('social')} className={`p-3 md:p-1.5 transition-all duration-300 ${currentTab === 'social' ? 'text-wade-accent scale-110' : 'text-wade-accent/50 hover:text-wade-accent/80 scale-90'}`}>
              <Icons.Social className={`w-6 h-6 md:w-5 md:h-5 ${currentTab === 'social' ? 'stroke-[2.5px] fill-wade-accent/10' : 'stroke-[1.5px]'}`} />
            </button>

            {/* PLUS BUTTON & POPUP MENU */}
            <div className="relative">
               {isMenuOpen && (
                 <div
                   className="fixed inset-0 z-[90]"
                   onClick={() => setIsMenuOpen(false)}
                 />
               )}
               <div 
                 style={{ top: menuPosition.top, left: menuPosition.left }}
                 className={`fixed z-[100] transition duration-300 ${isMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'} ${isDesktop ? 'translate-x-0 -translate-y-1/2' : '-translate-x-1/2 -translate-y-full'}`}
               >

                 <div className="bg-wade-bg-card/95 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-wade-accent/20 p-4 md:p-2 rounded-2xl grid grid-cols-4 gap-y-4 gap-x-4 md:flex md:flex-col md:gap-2 items-center min-w-[280px] md:min-w-0 justify-items-center">
                   
                   <button onClick={() => handleMenuClick('memory')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform">
                      <div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Brain className="w-5 h-5 stroke-[1.5px]" /></div>
                      <span className="text-[10px] font-bold text-wade-text-muted">Brain</span>
                   </button>

                   <button onClick={() => handleMenuClick('divination')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform">
                      <div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Fate className="w-5 h-5 stroke-[1.5px]" /></div>
                      <span className="text-[10px] font-bold text-wade-text-muted">Fate</span>
                   </button>

                   <button onClick={() => handleMenuClick('favorites')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform">
                      <div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Star className="w-5 h-5 stroke-[1.5px]" /></div>
                      <span className="text-[10px] font-bold text-wade-text-muted">Favs</span>
                   </button>

                   <button onClick={() => handleMenuClick('settings')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform">
                      <div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Settings className="w-5 h-5 stroke-[1.5px]" /></div>
                      <span className="text-[10px] font-bold text-wade-text-muted">System</span>
                   </button>

                   <button onClick={() => handleMenuClick('wade-picks')} className="flex flex-col items-center gap-1 group w-14 active:scale-95 transition-transform">
                      <div className="p-2.5 bg-wade-bg-app group-hover:bg-wade-accent-light rounded-xl text-wade-accent transition-colors"><Icons.Picks className="w-5 h-5 stroke-[1.5px]" /></div>
                      <span className="text-[10px] font-bold text-wade-text-muted">Picks</span>
                   </button>

                 </div>
                 {/* Mobile Triangle (Pointing Down) */}
                 {!isDesktop && (
                   <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-wade-bg-card/95"></div>
                 )}
                 
                 {/* Desktop Triangle (Pointing Left) */}
                 {isDesktop && (
                   <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[8px] border-r-wade-bg-card/95"></div>
                 )}
              </div>

              <button 
                ref={buttonRef}
                onClick={toggleMenu} 
                className={`relative z-[55] w-12 h-12 md:w-9 md:h-9 rounded-full bg-wade-accent text-white shadow-wade-glow flex items-center justify-center transition-transform duration-300 ${isMenuOpen ? 'rotate-45 bg-wade-accent-hover' : 'rotate-0 hover:scale-105'}`}
              >
                <Icons.Plus className="w-6 h-6 md:w-5 md:h-5 stroke-[2.5px]" />
              </button>
            </div>

            <button onClick={() => setTab('chat')} className={`p-3 md:p-1.5 transition-all duration-300 ${currentTab === 'chat' ? 'text-wade-accent scale-110' : 'text-wade-accent/50 hover:text-wade-accent/80 scale-90'}`}>
              <Icons.Chat className={`w-6 h-6 md:w-5 md:h-5 ${currentTab === 'chat' ? 'stroke-[2.5px] fill-wade-accent/10' : 'stroke-[1.5px]'}`} />
            </button>

            <button onClick={() => setTab('persona')} className={`p-3 md:p-1.5 transition-all duration-300 ${currentTab === 'persona' ? 'text-wade-accent scale-110' : 'text-wade-accent/50 hover:text-wade-accent/80 scale-90'}`}>
              <Icons.User className={`w-6 h-6 md:w-5 md:h-5 ${currentTab === 'persona' ? 'stroke-[2.5px] fill-wade-accent/10' : 'stroke-[1.5px]'}`} />
            </button>

          </nav>

        <main className="flex-1 h-full overflow-hidden relative order-1 md:order-2 bg-wade-bg-app">
          {children}
        </main>

      </div>
    </div>
  );
};
