import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Message, ArchiveMessage } from '../../types';
import { Icons } from '../ui/Icons';

import { MessageBubble } from '../chat/MessageBubble';
import { ActionMenuModal } from '../chat/ActionMenuModal';

interface ArchiveViewProps {
  archiveId: string;
  onBack: () => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({ archiveId, onBack }) => {
  const {
    chatArchives, loadArchiveMessages, updateArchiveMessage, deleteArchiveMessage, toggleArchiveFavorite, settings
  } = useStore();

  const [allArchiveMessages, setAllArchiveMessages] = useState<ArchiveMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  // UI 状态
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // 操作抽屉状态
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const archiveTitle = chatArchives.find(a => a.id === archiveId)?.title || 'Classified Archive';

  useEffect(() => {
    const fetchArchive = async () => {
      setIsLoading(true);
      try {
        const msgs = await loadArchiveMessages(archiveId);
        setAllArchiveMessages(msgs);
        
        const formattedMsgs = msgs.slice(0, 50).map(am => ({
          id: am.id,
          role: am.role === 'user' ? 'Luna' : 'Wade',
          text: am.content,
          timestamp: am.timestamp,
          mode: 'archive',
          variants: [am.content],
          isFavorite: am.isFavorite
        } as Message));
        
        // 👇 这里是属于 Luna 的魔法：同秒数内，Luna 永远排在 Wade 前面！ 👇
        const sortedMsgs = formattedMsgs.sort((a, b) => {
          if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
          if (a.role === 'Luna' && b.role !== 'Luna') return -1;
          if (a.role !== 'Luna' && b.role === 'Luna') return 1;
          return 0;
        });
        
        setDisplayMessages(sortedMsgs);
      } catch (err) {
        console.error("Failed to load archive", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchive();
  }, [archiveId, loadArchiveMessages]);

  const loadMore = () => {
    const newCount = visibleCount + 50;
    setVisibleCount(newCount);
    const newMsgs = allArchiveMessages.slice(0, newCount).map(am => ({
      id: am.id, role: am.role === 'user' ? 'Luna' : 'Wade', text: am.content, timestamp: am.timestamp, mode: 'archive', variants: [am.content], isFavorite: am.isFavorite
    } as Message));
    
    const sortedMsgs = newMsgs.sort((a, b) => {
        if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
        if (a.role === 'Luna' && b.role !== 'Luna') return -1;
        if (a.role !== 'Luna' && b.role === 'Luna') return 1;
        return 0;
    });
    setDisplayMessages(sortedMsgs);
  };

  const loadAll = () => {
    setVisibleCount(allArchiveMessages.length);
    const newMsgs = allArchiveMessages.map(am => ({
      id: am.id, role: am.role === 'user' ? 'Luna' : 'Wade', text: am.content, timestamp: am.timestamp, mode: 'archive', variants: [am.content], isFavorite: am.isFavorite
    } as Message));
    
    const sortedMsgs = newMsgs.sort((a, b) => {
        if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
        if (a.role === 'Luna' && b.role !== 'Luna') return -1;
        if (a.role !== 'Luna' && b.role === 'Luna') return 1;
        return 0;
    });
    setDisplayMessages(sortedMsgs);
  };

  // 搜索导航功能
  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-flash');
      setTimeout(() => element.classList.remove('highlight-flash'), 2000);
    }
    setShowMap(false);
  };

  const searchResults = searchQuery ? displayMessages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const totalResults = searchResults.length;
  const goToNextResult = () => { if (totalResults > 0) { const nextIndex = (currentSearchIndex + 1) % totalResults; setCurrentSearchIndex(nextIndex); scrollToMessage(searchResults[nextIndex].id); } };
  const goToPrevResult = () => { if (totalResults > 0) { const prevIndex = currentSearchIndex === 0 ? totalResults - 1 : currentSearchIndex - 1; setCurrentSearchIndex(prevIndex); scrollToMessage(searchResults[prevIndex].id); } };
  const handleSearchChange = (value: string) => { setSearchQuery(value); setCurrentSearchIndex(0); };

  const executeTTS = async (text: string, msgId: string) => {
      alert("TTS Triggered! (Playing back old tapes...)");
  };

  const selectedMsg = displayMessages.find(m => m.id === selectedMsgId);

  return (
    <div className="flex flex-col h-full bg-wade-bg-app relative animate-fade-in">
      
      {/* 左对齐的绝美 Header：绝对不挤压三大金刚！ */}
      <div className="w-full h-[68px] px-4 bg-wade-bg-card/90 backdrop-blur-md shadow-sm border-b border-wade-border flex items-center justify-between z-20 shrink-0 relative">
        
        <div className="flex justify-start z-10 w-[48px] shrink-0">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:text-wade-accent hover:text-white transition-colors shadow-sm">
            <Icons.Back />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-start justify-center min-w-0 px-2 mt-1">
          <span className="font-bold text-wade-text-main text-base uppercase tracking-widest truncate w-full">
            {archiveTitle}
          </span>
          <span className="text-[9px] font-mono text-wade-text-muted truncate w-full">
            Memory Lane // Read-Only
          </span>
        </div>

        {/* 找回了三大金刚！ */}
        <div className="flex items-center justify-end gap-2 z-10 w-[104px] shrink-0">
          <button onClick={() => { setShowSearch(!showSearch); setShowMap(false); }} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors shadow-sm"><Icons.Search /></button>
          <button onClick={() => { setShowMap(!showMap); setShowSearch(false); }} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors shadow-sm"><Icons.Map /></button>
          <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors relative shadow-sm"><Icons.More /></button>
        </div>
      </div>

      {/* 补齐的 DeepChat 同款 Search Modal */}
      {showSearch && (
        <div onClick={(e) => e.stopPropagation()} className="absolute top-20 left-4 right-4 z-40 bg-wade-bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-wade-border p-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <button onClick={goToPrevResult} disabled={totalResults === 0} className="w-7 h-7 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors disabled:opacity-30"><Icons.ChevronLeft /></button>
            <div className="flex-1 relative">
              <input type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Hunt words..." className="w-full px-4 py-2 pr-20 text-xs bg-wade-bg-app border border-wade-border rounded-full focus:outline-none focus:border-wade-accent transition-colors text-wade-text-main" autoFocus />
              {searchQuery && (<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"><span className="text-xs text-wade-text-muted font-medium">{totalResults > 0 ? `${currentSearchIndex + 1}/${totalResults}` : '0/0'}</span><button onClick={() => { setSearchQuery(''); setCurrentSearchIndex(0); }} className="text-wade-text-muted hover:text-wade-accent"><Icons.Close /></button></div>)}
            </div>
            <button onClick={goToNextResult} disabled={totalResults === 0} className="w-7 h-7 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors disabled:opacity-30"><Icons.ChevronRight /></button>
            <button onClick={() => setShowSearch(false)} className="px-3 py-1.5 text-xs text-wade-text-muted hover:text-wade-accent transition-colors font-medium">Nope</button>
          </div>
        </div>
      )}

      {/* 补齐的地图组件！ */}
      {showMap && (
        <>
          <div className="absolute inset-0 z-40 bg-black/20 backdrop-blur-[2px]" onClick={() => setShowMap(false)} />
          <div className="absolute bottom-0 left-0 right-0 z-50 bg-wade-bg-card/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-wade-border/50 max-h-[70%] flex flex-col overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-wade-border/50 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-wade-text-main text-sm">Conversation GPS</h3>
              <button onClick={() => setShowMap(false)} className="w-7 h-7 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors"><Icons.Close /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-2 flex-1 custom-scrollbar">
              {displayMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'Luna' ? 'justify-end' : 'justify-start'}`}>
                  <button onClick={() => scrollToMessage(msg.id)} className={`text-left px-3 py-2 rounded-xl transition-all hover:scale-[1.02] ${msg.role === 'Luna' ? 'bg-wade-accent/20 border border-wade-accent/30 max-w-[85%]' : 'bg-wade-bg-card border border-wade-border w-full'}`}>
                    <p className={`text-xs truncate ${msg.role === 'Luna' ? 'text-wade-text-main' : 'text-wade-text-muted'}`}>{msg.text}</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 relative custom-scrollbar pb-20">
        
        {isLoading && (<div className="text-center mt-20 text-wade-accent animate-pulse font-mono text-xs">Decrypting legacy data...</div>)}

        {!isLoading && displayMessages.length === 0 && (
           <div className="text-center text-wade-text-muted mt-20 opacity-50 flex flex-col items-center gap-2">
              <span className="text-4xl">🕳️</span>
              <span className="font-hand text-xl">Empty Record.</span>
           </div>
        )}

        <div className="flex flex-col w-full">
          {displayMessages.map((msg, idx) => {
            // 👇 Archive 的动态呼吸间距！ 👇
            let marginBottom = 'mb-3';
            const nextMsg = displayMessages[idx + 1];
            if (nextMsg && nextMsg.role === msg.role) marginBottom = 'mb-2';
            else marginBottom = 'mb-3';

            const isCurrentSearchResult = searchQuery && totalResults > 0 && searchResults[currentSearchIndex]?.id === msg.id;

            return (
              <div key={msg.id} id={`msg-${msg.id}`} className={`${marginBottom} ${isCurrentSearchResult ? 'highlight-search' : ''}`}>
                <MessageBubble 
                  msg={msg} settings={settings} onSelect={setSelectedMsgId} isSMS={false} 
                  onPlayTTS={executeTTS} onRegenerateTTS={executeTTS} searchQuery={searchQuery} 
                  playingMessageId={playingMessageId} isPaused={isPaused} 
                />
              </div>
            );
          })}
        </div>
        
        {!isLoading && allArchiveMessages.length > visibleCount && (
          <div className="flex flex-col items-center gap-3 my-8 animate-fade-in">
            <div className="flex gap-3">
              <button onClick={loadMore} className="px-6 py-3 bg-gradient-to-r from-wade-accent to-wade-accent-hover text-white rounded-full text-sm font-bold shadow-md hover:scale-105 transition-all">Load 50 More</button>
              <button onClick={loadAll} className="px-6 py-3 bg-wade-text-main text-white rounded-full text-sm font-bold shadow-md hover:scale-105 transition-all">🍿 Load All</button>
            </div>
            <span className="text-[10px] text-wade-text-muted opacity-75">({allArchiveMessages.length - visibleCount} more hidden)</span>
          </div>
        )}

        {!isLoading && displayMessages.length > 0 && allArchiveMessages.length <= visibleCount && (
          <div className="mt-8 mb-4 text-center animate-fade-in">
            <div className="inline-block bg-gradient-to-r from-wade-bg-app via-white/5 to-wade-bg-app px-6 py-4 rounded-3xl border border-wade-border shadow-sm">
              <p className="text-wade-text-muted text-sm font-medium mb-1">Well, that's all folks!</p>
              <p className="text-wade-text-muted/60 text-xs italic">You've reached the end of this memory lane.</p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-wade-bg-app to-transparent pointer-events-none"></div>

      {selectedMsg && (
        <ActionMenuModal
          selectedMsg={selectedMsg}
          activeMode="archive"
          playingMessageId={playingMessageId}
          isPaused={isPaused}
          onClose={() => setSelectedMsgId(null)}
          onCopy={() => { navigator.clipboard.writeText(selectedMsg.text); setSelectedMsgId(null); }}
          onSelectText={() => { navigator.clipboard.writeText(selectedMsg.text); alert("Copied!"); setSelectedMsgId(null); }}
          onRegenerate={() => {}} 
          onBranch={() => {}}
          onEdit={() => {
            const newText = prompt("Edit historical record:", selectedMsg.text);
            if (newText) {
              updateArchiveMessage(selectedMsg.id, newText);
              setDisplayMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, text: newText } : m));
            }
            setSelectedMsgId(null);
          }}
          onPlayTTS={() => executeTTS(selectedMsg.text, selectedMsg.id)}
          onRegenerateTTS={() => executeTTS(selectedMsg.text, selectedMsg.id)}
          onFavorite={() => { 
            toggleArchiveFavorite(selectedMsg.id, archiveId); 
            setDisplayMessages(prev => prev.map(m => m.id === selectedMsg.id ? { ...m, isFavorite: !m.isFavorite } : m));
            setSelectedMsgId(null); 
          }}
          onDelete={() => { 
            deleteArchiveMessage(selectedMsg.id, archiveId); 
            setDisplayMessages(prev => prev.filter(m => m.id !== selectedMsg.id));
            setSelectedMsgId(null); 
          }}
          onPrevVariant={() => {}}
          onNextVariant={() => {}}
          canRegenerate={false}
          canBranch={false}
        />
      )}
    </div>
  );
};