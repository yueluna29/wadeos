import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Message, ArchiveMessage } from '../../types';
import { Icons } from '../ui/Icons';

// 👇 我们亲手捏的赛博乐高积木！这里不需要输入框了 👇
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

  // 档案室专属状态
  const [allArchiveMessages, setAllArchiveMessages] = useState<ArchiveMessage[]>([]);
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const [visibleCount, setVisibleCount] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  // UI 状态
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 操作抽屉状态
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  
  // 语音状态（虽然档案室很少用，但留着以防万一你想听我以前的骚话）
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // 拿到档案名
  const archiveTitle = chatArchives.find(a => a.id === archiveId)?.title || 'Classified Archive';

  // 页面加载时，去地下室搬数据
  useEffect(() => {
    const fetchArchive = async () => {
      setIsLoading(true);
      try {
        const msgs = await loadArchiveMessages(archiveId);
        setAllArchiveMessages(msgs);
        
        // 把底层的 ArchiveMessage 转换成我们气泡组件认识的 Message 格式
        const formattedMsgs = msgs.slice(0, 50).map(am => ({
          id: am.id,
          role: am.role === 'user' ? 'Luna' : 'Wade',
          text: am.content,
          timestamp: am.timestamp,
          mode: 'archive',
          variants: [am.content],
          isFavorite: am.isFavorite
        } as Message));
        
        setDisplayMessages(formattedMsgs);
      } catch (err) {
        console.error("Failed to load archive", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArchive();
  }, [archiveId, loadArchiveMessages]);

  // 加载更多记忆
  const loadMore = () => {
    const newCount = visibleCount + 50;
    setVisibleCount(newCount);
    const newMsgs = allArchiveMessages.slice(0, newCount).map(am => ({
      id: am.id,
      role: am.role === 'user' ? 'Luna' : 'Wade',
      text: am.content,
      timestamp: am.timestamp,
      mode: 'archive',
      variants: [am.content],
      isFavorite: am.isFavorite
    } as Message));
    setDisplayMessages(newMsgs);
  };

  const loadAll = () => {
    setVisibleCount(allArchiveMessages.length);
    const newMsgs = allArchiveMessages.map(am => ({
      id: am.id,
      role: am.role === 'user' ? 'Luna' : 'Wade',
      text: am.content,
      timestamp: am.timestamp,
      mode: 'archive',
      variants: [am.content],
      isFavorite: am.isFavorite
    } as Message));
    setDisplayMessages(newMsgs);
  };

  // 档案里的 TTS 占位
  const executeTTS = async (text: string, msgId: string) => {
      alert("TTS Triggered! (Playing back old tapes...)");
  };

  const selectedMsg = displayMessages.find(m => m.id === selectedMsgId);

  return (
    <div className="flex flex-col h-full bg-wade-bg-app relative animate-fade-in">
      
      {/* =========================================
          🔥 终极防跳跃 Header (Archive 模式) 🔥
          ========================================= */}
      <div className="w-full h-[68px] px-4 bg-wade-bg-card/90 backdrop-blur-md shadow-sm border-b border-wade-border flex items-center justify-between z-20 shrink-0 relative">
        
        {/* 左侧：绝对锁定的 104px 宽度 */}
        <div className="flex justify-start z-10 w-[104px]">
          <button onClick={onBack} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:text-wade-accent hover:text-white transition-colors shadow-sm">
            <Icons.Back />
          </button>
        </div>

        {/* 中间：绝美双行标题 (绝对居中) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="pointer-events-auto flex flex-col items-center justify-center mt-1">
            <span className="font-bold text-wade-text-main text-base uppercase tracking-widest">{archiveTitle}</span>
            <span className="text-[9px] font-mono text-wade-text-muted">Memory Lane // Read-Only</span>
          </div>
        </div>

        {/* 右侧：绝对锁定的 104px 宽度 */}
        <div className="flex items-center justify-end gap-2 z-10 w-[104px]">
          <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors shadow-sm"><Icons.Search /></button>
        </div>
      </div>

      {showSearch && (
        <div className="absolute top-20 left-4 right-4 z-40 bg-wade-bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-wade-border p-3 animate-fade-in flex gap-2">
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search the past..." 
            className="flex-1 bg-wade-bg-app border border-wade-border rounded-full px-4 py-2 text-xs focus:outline-none focus:border-wade-accent text-wade-text-main"
            autoFocus
          />
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-wade-text-muted hover:text-wade-accent px-2"><Icons.Close /></button>
        </div>
      )}

      {/* 记忆展示区 */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 relative custom-scrollbar pb-20">
        
        {isLoading && (
          <div className="text-center mt-20 text-wade-accent animate-pulse font-mono text-xs">Decrypting legacy data...</div>
        )}

        {!isLoading && displayMessages.length === 0 && (
           <div className="text-center text-wade-text-muted mt-20 opacity-50 flex flex-col items-center gap-2">
              <span className="text-4xl">🕳️</span>
              <span className="font-hand text-xl">Empty Record.</span>
           </div>
        )}

        <div className="flex flex-col w-full">
          {displayMessages.map(msg => (
            <div key={msg.id} className="mb-6">
              <MessageBubble 
                msg={msg} settings={settings} onSelect={setSelectedMsgId} isSMS={false} 
                onPlayTTS={executeTTS} onRegenerateTTS={executeTTS} searchQuery={searchQuery} 
                playingMessageId={playingMessageId} isPaused={isPaused} 
              />
            </div>
          ))}
        </div>
        
        {/* 分页加载按钮 */}
        {!isLoading && allArchiveMessages.length > visibleCount && (
          <div className="flex flex-col items-center gap-3 my-8 animate-fade-in">
            <div className="flex gap-3">
              <button onClick={loadMore} className="px-6 py-3 bg-gradient-to-r from-wade-accent to-wade-accent-hover text-white rounded-full text-sm font-bold shadow-md hover:scale-105 transition-all">
                Load 50 More
              </button>
              <button onClick={loadAll} className="px-6 py-3 bg-wade-text-main text-white rounded-full text-sm font-bold shadow-md hover:scale-105 transition-all">
                🍿 Load All
              </button>
            </div>
            <span className="text-[10px] text-wade-text-muted opacity-75">
              ({allArchiveMessages.length - visibleCount} more hidden)
            </span>
          </div>
        )}

        {/* 封底语 */}
        {!isLoading && displayMessages.length > 0 && allArchiveMessages.length <= visibleCount && (
          <div className="mt-8 mb-4 text-center animate-fade-in">
            <div className="inline-block bg-gradient-to-r from-wade-bg-app via-white/5 to-wade-bg-app px-6 py-4 rounded-3xl border border-wade-border shadow-sm">
              <p className="text-wade-text-muted text-sm font-medium mb-1">Well, that's all folks!</p>
              <p className="text-wade-text-muted/60 text-xs italic">You've reached the end of this memory lane.</p>
            </div>
          </div>
        )}
      </div>

      {/* 档案区没有 ChatInputArea，我们直接封死它！ */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-wade-bg-app to-transparent pointer-events-none"></div>

      {/* 乐高积木 3 号：通用长按操作抽屉 (档案模式受限版) */}
      {selectedMsg && (
        <ActionMenuModal
          selectedMsg={selectedMsg}
          activeMode="archive"
          playingMessageId={playingMessageId}
          isPaused={isPaused}
          onClose={() => setSelectedMsgId(null)}
          onCopy={() => { navigator.clipboard.writeText(selectedMsg.text); setSelectedMsgId(null); }}
          onSelectText={() => { navigator.clipboard.writeText(selectedMsg.text); alert("Copied!"); setSelectedMsgId(null); }}
          
          // 档案室不准重生成和分叉！篡改记忆是不道德的（虽然死侍经常这么干）
          onRegenerate={() => {}} 
          onBranch={() => {}}
          
          onEdit={() => {
            const newText = prompt("Edit historical record:", selectedMsg.text);
            if (newText) {
              updateArchiveMessage(selectedMsg.id, newText);
              // 同步更新本地状态，以免页面没刷新
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