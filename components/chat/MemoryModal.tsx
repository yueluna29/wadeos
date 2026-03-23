import React, { useState } from 'react';
import { useStore } from '../../store';
import { Icons } from '../ui/Icons';

interface MemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ isOpen, onClose }) => {
  // 把大管家的权限拿过来
  const {
    coreMemories,
    sessions,
    activeSessionId,
    toggleCoreMemoryEnabled,
    updateSession
  } = useStore();

  // 原来的这行 UI 状态，被我们安全地包裹进来了
  const [selectedMemoryTag, setSelectedMemoryTag] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-wade-bg-base w-[90%] max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-wade-accent-light ring-1 ring-wade-border" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent"><Icons.Brain size={14} /></div>
            <div>
              <h3 className="font-bold text-wade-text-main text-sm tracking-tight">Link Memories</h3>
              <p className="text-[10px] text-wade-text-muted uppercase tracking-wider font-medium">Total recall... but cheaper.</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"><Icons.Close size={16} /></button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {coreMemories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 custom-scrollbar">
              <button onClick={() => setSelectedMemoryTag(null)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors border ${selectedMemoryTag === null ? 'bg-wade-accent text-white border-wade-accent' : 'bg-wade-bg-card text-wade-text-muted border-wade-border hover:border-wade-accent'}`}>All</button>
              {Array.from(new Set(coreMemories.flatMap(m => m.tags || []))).sort().map(tag => (
                <button key={tag} onClick={() => setSelectedMemoryTag(tag === selectedMemoryTag ? null : tag)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-colors border ${selectedMemoryTag === tag ? 'bg-wade-accent text-white border-wade-accent' : 'bg-wade-bg-card text-wade-text-muted border-wade-border hover:border-wade-accent'}`}>#{tag}</button>
              ))}
            </div>
          )}
          
          <div className="space-y-2">
            {coreMemories.filter(m => !selectedMemoryTag || (m.tags && m.tags.includes(selectedMemoryTag))).map(memory => {
              const currentSession = sessions.find(s => s.id === activeSessionId);
              const isSessionActive = currentSession?.activeMemoryIds ? currentSession.activeMemoryIds.includes(memory.id) : memory.enabled;
              
              return (
                <div key={memory.id} onClick={() => {
                    if (!activeSessionId) { toggleCoreMemoryEnabled(memory.id); return; }
                    const session = sessions.find(s => s.id === activeSessionId);
                    if (!session) return;
                    const safeMemories = Array.isArray(coreMemories) ? coreMemories : [];
                    let newActiveIds = session.activeMemoryIds || safeMemories.filter(m => m.enabled).map(m => m.id);
                    if (isSessionActive) newActiveIds = newActiveIds.filter(id => id !== memory.id); else newActiveIds = [...newActiveIds, memory.id];
                    updateSession(activeSessionId, { activeMemoryIds: newActiveIds });
                  }} className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3 group ${isSessionActive ? 'bg-wade-bg-card border-wade-accent shadow-sm' : 'bg-wade-bg-card border-wade-border hover:border-wade-accent/50'}`}>
                  
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isSessionActive ? 'bg-gradient-to-br from-wade-accent to-wade-border-light text-white shadow-md shadow-wade-accent/20' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}>
                    <Icons.Brain />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-bold ${isSessionActive ? 'text-wade-text-main' : 'text-wade-text-muted'}`}>{memory.title}</h4>
                    <p className="text-xs text-wade-text-muted line-clamp-2 mt-1 leading-relaxed">{memory.content}</p>
                  </div>
                  
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};