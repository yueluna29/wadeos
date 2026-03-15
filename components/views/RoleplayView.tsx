import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { generateTextResponse } from '../../services/geminiService';
import { Message } from '../../types';
import { supabase } from '../../services/supabase';
import { Icons } from '../ui/Icons';

import { ChatInputArea, Attachment } from '../chat/ChatInputArea';
import { MessageBubble } from '../chat/MessageBubble';
import { ActionMenuModal } from '../chat/ActionMenuModal';

interface RoleplayViewProps {
  onBack: () => void;
}

export const RoleplayView: React.FC<RoleplayViewProps> = ({ onBack }) => {
  const {
    messages, addMessage, deleteMessage, updateMessage, settings, activeSessionId, sessions, 
    llmPresets, updateMessageAudioCache, toggleFavorite, setRegenerating, addVariantToMessage, selectMessageVariant, forkSession
  } = useStore();

  const [sessionSummary, setSessionSummary] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [wadeStatus, setWadeStatus] = useState<'online' | 'typing'>('online');
  
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const displayMessages = messages.filter(m => m.sessionId === activeSessionId).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length, isTyping]);

  useEffect(() => {
    const loadSummary = async () => {
      setSessionSummary("");
      if (!activeSessionId) return;
      try {
        const { data } = await supabase.from('session_summaries').select('summary').eq('session_id', activeSessionId).single();
        if (data?.summary) setSessionSummary(data.summary);
      } catch (err) { console.error("Summary error:", err); }
    };
    loadSummary();
  }, [activeSessionId]);

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

  const handleSend = async (text: string, attachments: Attachment[]) => {
    if (!activeSessionId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(), 
      sessionId: activeSessionId, 
      role: 'Luna',
      text: text, 
      timestamp: Date.now(), 
      mode: 'roleplay',
      attachments: attachments.map(a => ({
          type: a.type,
          content: a.content.split(',')[1],
          mimeType: a.mimeType,
          name: a.name
      })),
      image: attachments.find(a => a.type === 'image')?.content.split(',')[1]
    };
    
    addMessage(newMessage);
    setIsTyping(true);
    setWadeStatus('typing');

    setTimeout(() => { triggerAIResponse(activeSessionId); }, 1500); 
  };

  const triggerAIResponse = async (targetSessionId: string, regenMsgId?: string) => {
    abortControllerRef.current = new AbortController();
    if (regenMsgId) setRegenerating(regenMsgId, true);

    try {
      const historyMsgs = messages.filter(m => m.sessionId === targetSessionId).slice(-(settings.contextLimit || 50));
      const history = historyMsgs.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      
      let modePrompt = settings.wadePersonality;
      if (sessionSummary) modePrompt = `[PREVIOUS SUMMARY]\n${sessionSummary}\n[END SUMMARY]\n\n${modePrompt}`;

      const rpRules = settings.roleplayInstructions || `[ROLEPLAY MODE RULES]\n- Write detailed, descriptive responses\n- Include actions in *asterisks*\n- Be immersive and narrative`;
      modePrompt += `\n\n${rpRules}`;

      const activeLlm = llmPresets.find(p => p.id === settings.activeLlmId);
      if (!activeLlm?.apiKey) throw new Error("API Key missing! Check settings.");

      const response = await generateTextResponse(
        activeLlm.model, "...", history, settings.systemInstruction, modePrompt, settings.lunaInfo,
        settings.wadeSingleExamples, "", "", "", settings.exampleDialogue, [], !!regenMsgId, 'roleplay', activeLlm.apiKey, undefined, "", activeLlm.baseUrl
      );

      if (regenMsgId) {
        addVariantToMessage(regenMsgId, response.text, response.thinking, activeLlm.model);
        setRegenerating(regenMsgId, false);
      } else {
        addMessage({
          id: (Date.now() + 1).toString(), sessionId: targetSessionId, role: 'Wade',
          text: response.text, model: activeLlm.model, timestamp: Date.now(), mode: 'roleplay',
          variantsThinking: [response.thinking || null]
        });
      }
    } catch (err) {
      console.error(err);
      if (regenMsgId) setRegenerating(regenMsgId, false);
    } finally {
      setIsTyping(false);
      setWadeStatus('online');
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
    setWadeStatus('online');
  };

  const executeTTS = async (text: string, msgId: string) => {
      alert("TTS Triggered! (Imagine Wade whispering this in your ear...)");
  };

  const selectedMsg = displayMessages.find(m => m.id === selectedMsgId);
  const isLatestMessage = selectedMsg && displayMessages[displayMessages.length - 1]?.id === selectedMsg.id;

  return (
    <div className="flex flex-col h-full bg-wade-bg-app relative animate-fade-in">
      
      {/* 左对齐的绝美 Header：绝对不挤压三大金刚！ */}
      <div className="w-full h-[68px] px-4 bg-wade-bg-card/90 backdrop-blur-md shadow-sm border-b border-wade-border flex items-center justify-between z-20 shrink-0 relative">
        
        <div className="flex justify-start z-10 w-[48px] shrink-0">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:text-wade-accent hover:text-white transition-colors shadow-sm">
            <Icons.Back />
          </button>
        </div>

        {/* 左对齐标题，允许截断 (truncate)，保护右侧按钮 */}
        <div className="flex-1 flex flex-col items-start justify-center min-w-0 px-2 cursor-pointer hover:opacity-80 transition-opacity">
          <span className="font-bold text-wade-text-main text-base uppercase tracking-widest truncate w-full">
            {activeSessionId && sessions ? sessions.find(s => s.id === activeSessionId)?.title || 'Roleplay' : 'Roleplay'}
          </span>
          <span className="text-[9px] font-mono text-wade-text-muted truncate w-full">
            {wadeStatus === 'typing' ? '*Setting the scene...*' : 'Immersive Theater'}
          </span>
        </div>

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

      {/* 聊天气泡展示区：加入 DeepChat 相同的呼吸感间距 */}
      <div className="flex-1 overflow-y-auto p-4 relative custom-scrollbar">
        {displayMessages.length === 0 && (
           <div className="text-center text-wade-text-muted mt-20 opacity-50 flex flex-col items-center gap-2">
              <span className="text-4xl">🎭</span>
              <span className="font-hand text-xl">The stage is yours, Muffin.</span>
           </div>
        )}

        <div className="flex flex-col w-full">
          {displayMessages.map((msg, idx) => {
            // 👇 完美的动态呼吸间距！ 👇
            let marginBottom = 'mb-6';
            const nextMsg = displayMessages[idx + 1];
            if (nextMsg && nextMsg.role === msg.role) marginBottom = 'mb-2';
            else marginBottom = 'mb-6';

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
        
        {isTyping && (
           <div className="flex gap-2 mt-2 ml-2 items-center text-wade-accent animate-fade-in">
               <span className="text-xs font-bold italic tracking-wider">*Writing...*</span>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInputArea 
        onSend={handleSend}
        onCancel={handleCancel}
        isTyping={isTyping}
        activeMode="roleplay"
        placeholderText="*Walks in and looks at you...*"
      />

      {selectedMsg && (
        <ActionMenuModal
          selectedMsg={selectedMsg}
          activeMode="roleplay"
          playingMessageId={playingMessageId}
          isPaused={isPaused}
          onClose={() => setSelectedMsgId(null)}
          onCopy={() => { navigator.clipboard.writeText(selectedMsg.text); setSelectedMsgId(null); }}
          onSelectText={() => { navigator.clipboard.writeText(selectedMsg.text); alert("Copied!"); setSelectedMsgId(null); }}
          onRegenerate={() => {
            if (activeSessionId) triggerAIResponse(activeSessionId, selectedMsg.id);
            setSelectedMsgId(null);
          }}
          onBranch={async () => {
            await forkSession(selectedMsg.id);
            setSelectedMsgId(null);
          }}
          onEdit={() => {
            const newText = prompt("Rewrite the scene:", selectedMsg.text);
            if (newText) updateMessage(selectedMsg.id, newText);
            setSelectedMsgId(null);
          }}
          onPlayTTS={() => executeTTS(selectedMsg.text, selectedMsg.id)}
          onRegenerateTTS={() => executeTTS(selectedMsg.text, selectedMsg.id)}
          onFavorite={() => { toggleFavorite(selectedMsg.id); setSelectedMsgId(null); }}
          onDelete={() => { deleteMessage(selectedMsg.id); setSelectedMsgId(null); }}
          onPrevVariant={() => selectMessageVariant(selectedMsg.id, (selectedMsg.selectedIndex || 0) - 1)}
          onNextVariant={() => selectMessageVariant(selectedMsg.id, (selectedMsg.selectedIndex || 0) + 1)}
          canRegenerate={selectedMsg.role === 'Wade' && !!isLatestMessage}
          canBranch={true}
        />
      )}
    </div>
  );
};