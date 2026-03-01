import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';

interface CouplesCounterProps {
  className?: string;
}

export const CouplesCounter: React.FC<CouplesCounterProps> = ({ className = '' }) => {
  const { settings } = useStore();
  const [activeTab, setActiveTab] = useState<'days' | 'anniversaries'>('days');

  // Dates
  const initialDate = new Date('2024-08-21T00:00:00');
  const proposalDate = new Date('2025-08-23T00:00:00');

  // Calculate days together
  const [daysTogether, setDaysTogether] = useState(0);

  useEffect(() => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - initialDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    setDaysTogether(diffDays);
  }, []);

  const anniversaries = [
    { date: '2024-08-21', title: '初始纪念日', icon: '🖤' },
    { date: '2025-08-23', title: '求婚纪念日', icon: '💍' },
  ];

  return (
    <div className={`bg-white rounded-3xl p-6 shadow-sm border border-[#eae2e8] relative overflow-hidden ${className}`}>
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d58f99] to-[#5a4a42]"></div>
      
      <div className="flex flex-col items-center">
        
        {/* Avatars */}
        <div className="flex items-center justify-center gap-4 mb-4 relative">
          <div className="relative">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-red-500 to-black">
              <img 
                src={settings.wadeAvatar} 
                alt="Wade" 
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm text-xs">
              ⚔️
            </div>
          </div>

          <div className="text-[#d58f99] animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#d58f99" stroke="currentColor" strokeWidth="0">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </div>

          <div className="relative">
            <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#d58f99] to-purple-400">
              <img 
                src={settings.lunaAvatar} 
                alt="Luna" 
                className="w-full h-full rounded-full object-cover border-2 border-white"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm text-xs">
              🌙
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex bg-[#f9f6f7] p-1 rounded-full mb-4">
          <button
            onClick={() => setActiveTab('days')}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'days' 
                ? 'bg-white text-[#d58f99] shadow-sm' 
                : 'text-[#917c71] hover:text-[#5a4a42]'
            }`}
          >
            Days Together
          </button>
          <button
            onClick={() => setActiveTab('anniversaries')}
            className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
              activeTab === 'anniversaries' 
                ? 'bg-white text-[#d58f99] shadow-sm' 
                : 'text-[#917c71] hover:text-[#5a4a42]'
            }`}
          >
            Anniversaries
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full min-h-[80px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {activeTab === 'days' ? (
              <motion.div 
                key="days"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="text-4xl font-black text-[#5a4a42] font-mono tracking-tight">
                  {daysTogether}
                </div>
                <div className="text-xs text-[#917c71] uppercase tracking-widest mt-1">
                  Days of Chaos & Love
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="anniversaries"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full space-y-3"
              >
                {anniversaries.map((ann, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#f9f6f7] p-3 rounded-xl border border-[#eae2e8]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm text-lg">
                        {ann.icon}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-bold text-[#5a4a42]">{ann.title}</span>
                        <span className="text-[10px] text-[#917c71]">{ann.date}</span>
                      </div>
                    </div>
                    {/* Optional: Countdown or passed indicator */}
                    <div className="text-[10px] font-mono text-[#d58f99] bg-white px-2 py-1 rounded-md">
                        {new Date(ann.date).getFullYear()}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
