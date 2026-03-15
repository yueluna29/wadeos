import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { generateTextResponse } from '../../services/geminiService';
import { Message } from '../../types';
import { supabase } from '../../services/supabase';
import { Icons } from '../ui/Icons';

// 👇 我们亲手捏的赛博乐高积木，继续发光发热！ 👇
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

    // 稍微延迟一下，显得他在入戏
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

      // 👇 Roleplay 专属核心：注入动作指令 👇
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
      
      {/* 极具剧场感的 Header */}
      <div className="chat-header !bg-wade-bg-app border-b-2 border-wade-accent/30">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-wade-bg-card shadow-sm flex items-center justify-center text-wade-text-muted hover:text-wade-accent"><Icons.Back /></button>
        <div className="flex-1 flex items-center justify-center gap-3">
          <Icons.Feather />
          <div className="flex flex-col items-center">
            <span className="font-black tracking-widest text-wade-text-main text-sm uppercase">Immersive Theater</span>
            <span className="text-[9px] font-mono text-wade-accent">{wadeStatus === 'typing' ? '*Setting the scene...*' : 'Curtain is up'}</span>
          </div>
          <Icons.Feather />
        </div>
        <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 rounded-full bg-wade-bg-card shadow-sm flex items-center justify-center text-wade-text-muted hover:text-wade-accent"><Icons.Search /></button>
      </div>

      {showSearch && (
        <div className="absolute top-20 left-4 right-4 z-40 bg-wade-bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-wade-border p-3 animate-fade-in flex gap-2">
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search your memories..." 
            className="flex-1 bg-wade-bg-app border border-wade-border rounded-full px-4 py-2 text-xs focus:outline-none focus:border-wade-accent text-wade-text-main"
            autoFocus
          />
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-wade-text-muted hover:text-wade-accent px-2"><Icons.Close /></button>
        </div>
      )}

      {/* 聊天气泡展示区 */}
      <div className="flex-1 overflow-y-auto p-4 relative custom-scrollbar">
        {displayMessages.length === 0 && (
           <div className="text-center text-wade-text-muted mt-20 opacity-50 flex flex-col items-center gap-2">
              <span className="text-4xl">🎭</span>
              <span className="font-hand text-xl">The stage is yours, Muffin.</span>
           </div>
        )}

        <div className="flex flex-col w-full">
          {displayMessages.map(msg => (
            <div key={msg.id} className="mb-4">
              <MessageBubble 
                msg={msg} settings={settings} onSelect={setSelectedMsgId} isSMS={false} 
                onPlayTTS={executeTTS} onRegenerateTTS={executeTTS} searchQuery={searchQuery} 
                playingMessageId={playingMessageId} isPaused={isPaused} 
              />
            </div>
          ))}
        </div>
        
        {isTyping && (
           <div className="flex gap-2 mt-2 ml-2 items-center text-wade-accent animate-fade-in">
               <span className="text-xs font-bold italic tracking-wider">*Writing...*</span>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 乐高积木 1 号：通用输入框 */}
      <ChatInputArea 
        onSend={handleSend}
        onCancel={handleCancel}
        isTyping={isTyping}
        activeMode="roleplay"
        placeholderText="*Walks in and looks at you...*"
      />

      {/* 乐高积木 3 号：通用长按操作抽屉 */}
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