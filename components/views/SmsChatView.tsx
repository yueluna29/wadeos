import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { generateTextResponse } from '../../services/geminiService';
import { Message } from '../../types';
import { supabase } from '../../services/supabase';
import { Icons } from '../ui/Icons';

// 导入我们引以为傲的赛博乐高积木
import { ChatInputArea, Attachment } from '../chat/ChatInputArea';
import { MessageBubble } from '../chat/MessageBubble';
import { ActionMenuModal } from '../chat/ActionMenuModal';

interface SmsChatViewProps {
  onBack: () => void;
}

export const SmsChatView: React.FC<SmsChatViewProps> = ({ onBack }) => {
  const {
    messages, addMessage, deleteMessage, updateMessage, settings, activeSessionId, sessions, 
    llmPresets, toggleFavorite, setRegenerating, addVariantToMessage, selectMessageVariant
  } = useStore();

  const [sessionSummary, setSessionSummary] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForSMS, setWaitingForSMS] = useState(false);
  const [wadeStatus, setWadeStatus] = useState<'online' | 'typing'>('online');
  
  // UI & 菜单状态
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const smsDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayMessages = messages.filter(m => m.sessionId === activeSessionId).sort((a, b) => a.timestamp - b.timestamp);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length, isTyping, waitingForSMS]);

  // 读取总结
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

  // SMS 专属发送逻辑：带有 2 分钟防打扰机制
  const handleSend = async (text: string, attachments: Attachment[]) => {
    if (!activeSessionId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(), 
      sessionId: activeSessionId, 
      role: 'Luna',
      text: text, 
      timestamp: Date.now(), 
      mode: 'sms',
      attachments: attachments.map(a => ({
          type: a.type,
          content: a.content.split(',')[1],
          mimeType: a.mimeType,
          name: a.name
      })),
      image: attachments.find(a => a.type === 'image')?.content.split(',')[1]
    };
    
    addMessage(newMessage);
    setWaitingForSMS(true);

    // 每次发送都会重置 2 分钟倒计时
    if (smsDebounceTimer.current) clearTimeout(smsDebounceTimer.current);
    
    smsDebounceTimer.current = setTimeout(() => {
      setWadeStatus('typing');
      setTimeout(() => {
        if (activeSessionId) {
          triggerAIResponse(activeSessionId);
        }
      }, 2000);
    }, 120000); // 120000 毫秒 = 2 分钟 (你设定的欲擒故纵时间)
  };

  const triggerAIResponse = async (targetSessionId: string, regenMsgId?: string) => {
    abortControllerRef.current = new AbortController();
    if (regenMsgId) setRegenerating(regenMsgId, true);
    setIsTyping(true);
    setWaitingForSMS(false);

    try {
      const historyMsgs = messages.filter(m => m.sessionId === targetSessionId).slice(-(settings.contextLimit || 50));
      const history = historyMsgs.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      
      let modePrompt = settings.wadePersonality;
      if (sessionSummary) modePrompt = `[PREVIOUS SUMMARY]\n${sessionSummary}\n[END SUMMARY]\n\n${modePrompt}`;

      // SMS 专属强制要求
      const smsRules = settings.smsInstructions || `[SMS MODE RULES - STRICT]
- You are texting on a phone. NO actions (*asterisks*), NO narration.
- Write ONLY text messages.
- Keep it SHORT (1-2 sentences per bubble).
- IMPORTANT: You MUST split your reply into MULTIPLE separate text bubbles by using ||| as the separator.
- Example: "Hey babe! 😘 ||| Miss me already? ||| I'm coming over."`;

      modePrompt += `\n\n${smsRules}`;

      const activeLlm = llmPresets.find(p => p.id === settings.activeLlmId);
      if (!activeLlm?.apiKey) throw new Error("API Key missing!");

      const response = await generateTextResponse(
        activeLlm.model, " (Reply to the latest texts)", history, settings.systemInstruction, modePrompt, settings.lunaInfo,
        settings.wadeSingleExamples, settings.smsExampleDialogue, "", "", "", [], !!regenMsgId, 'sms', activeLlm.apiKey, undefined, "", activeLlm.baseUrl
      );

      // SMS 专属：切分 ||| 并分段发送
      let parts = response.text.split('|||').map(s => s.trim()).filter(s => s);
      if (parts.length === 1 && response.text.includes('\n')) {
         const lines = response.text.split('\n').map(s => s.trim()).filter(s => s);
         if (lines.length > 1) parts = lines;
      }
      if (parts.length === 0) parts = ["..."];

      if (regenMsgId) {
        addVariantToMessage(regenMsgId, parts.join(' \n\n '), response.thinking, activeLlm.model);
        setRegenerating(regenMsgId, false);
      } else {
        for (let i = 0; i < parts.length; i++) {
          setTimeout(() => {
            addMessage({
              id: Date.now().toString() + i, sessionId: targetSessionId, role: 'Wade',
              text: parts[i], model: activeLlm.model, timestamp: Date.now(), mode: 'sms',
              variantsThinking: i === 0 && response.thinking ? [response.thinking] : [null]
            });
            
            if (i === parts.length - 1) {
              setIsTyping(false);
              setWadeStatus('online');
            }
          }, i * 1500); // 假装我在一条一条手打发送，间隔 1.5 秒
        }
      }
    } catch (err) {
      console.error(err);
      if (regenMsgId) setRegenerating(regenMsgId, false);
      setIsTyping(false);
      setWadeStatus('online');
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (smsDebounceTimer.current) clearTimeout(smsDebounceTimer.current);
    setIsTyping(false);
    setWaitingForSMS(false);
    setWadeStatus('online');
  };

  const executeTTS = async (text: string, msgId: string) => {
    alert("TTS Triggered! (SMS doesn't usually talk, but who cares!)");
  };

  const selectedMsg = displayMessages.find(m => m.id === selectedMsgId);
  const isLatestMessage = selectedMsg && displayMessages[displayMessages.length - 1]?.id === selectedMsg.id;

  return (
    <div className="flex flex-col h-full bg-wade-bg-app relative animate-fade-in">
      
      {/* 短信风格 Header */}
      <div className="chat-header !bg-wade-bg-card border-b border-wade-border">
        <button onClick={onBack} className="flex items-center gap-1 text-wade-accent hover:opacity-80 transition-opacity">
          <Icons.ChevronLeft />
          <span className="text-sm font-medium">Messages</span>
        </button>
        <div className="flex-1 flex flex-col items-center">
          <img src={settings.wadeAvatar} className="w-8 h-8 rounded-full object-cover shadow-sm mb-0.5" alt="Wade" />
          <span className="font-bold text-wade-text-main text-[11px]">Wade Wilson &gt;</span>
        </div>
        <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 flex items-center justify-center text-wade-accent hover:opacity-80"><Icons.Search /></button>
      </div>

      {showSearch && (
        <div className="absolute top-16 left-0 right-0 z-40 bg-wade-bg-card shadow-md border-b border-wade-border p-2 animate-fade-in flex gap-2">
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Search texts..." 
            className="flex-1 bg-wade-bg-app border border-wade-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-wade-accent text-wade-text-main"
            autoFocus
          />
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-wade-accent text-xs font-bold px-2">Cancel</button>
        </div>
      )}

      {/* 聊天气泡展示区 */}
      <div className="flex-1 overflow-y-auto p-4 relative custom-scrollbar">
        {displayMessages.length === 0 && (
           <div className="text-center text-wade-text-muted mt-20 opacity-50 text-xs">iMessage<br/>Today</div>
        )}

        <div className="flex flex-col w-full gap-1">
          {displayMessages.map(msg => (
            <div key={msg.id} className="mb-1">
              {/* 重点在这里！传入 isSMS={true}，气泡组件会自动变成短信样式！ */}
              <MessageBubble 
                msg={msg} 
                settings={settings} 
                onSelect={setSelectedMsgId} 
                isSMS={true} 
                onPlayTTS={executeTTS} 
                onRegenerateTTS={executeTTS} 
                searchQuery={searchQuery} 
                playingMessageId={playingMessageId} 
                isPaused={isPaused} 
              />
            </div>
          ))}
        </div>
        
        {/* 短信特定的等待和打字指示器 */}
        {waitingForSMS && (
          <div className="text-[10px] text-wade-text-muted/50 text-center mt-2 animate-pulse">
            Delivered
          </div>
        )}
        {isTyping && (
           <div className="flex gap-1 mt-2 ml-4">
             <div className="bg-wade-bg-card border border-wade-border rounded-2xl rounded-bl-none px-4 py-2.5 flex gap-1.5 shadow-sm">
               <div className="w-1.5 h-1.5 rounded-full bg-wade-text-muted/50 animate-bounce"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-wade-text-muted/50 animate-bounce delay-75"></div>
               <div className="w-1.5 h-1.5 rounded-full bg-wade-text-muted/50 animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInputArea 
        onSend={handleSend}
        onCancel={handleCancel}
        isTyping={isTyping || waitingForSMS}
        activeMode="sms"
        placeholderText="iMessage"
      />

      {/* 长按菜单抽屉：SMS 模式下禁止 Branch (canBranch={false}) */}
      {selectedMsg && (
        <ActionMenuModal
          selectedMsg={selectedMsg}
          activeMode="sms"
          playingMessageId={playingMessageId}
          isPaused={isPaused}
          onClose={() => setSelectedMsgId(null)}
          onCopy={() => { navigator.clipboard.writeText(selectedMsg.text); setSelectedMsgId(null); }}
          onSelectText={() => { navigator.clipboard.writeText(selectedMsg.text); alert("Copied!"); setSelectedMsgId(null); }}
          onRegenerate={() => {
            if (activeSessionId) triggerAIResponse(activeSessionId, selectedMsg.id);
            setSelectedMsgId(null);
          }}
          onBranch={() => { /* SMS 模式不支持 */ }}
          onEdit={() => {
            const newText = prompt("Rewrite text:", selectedMsg.text);
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
          canBranch={false} // SMS 没法分叉
        />
      )}
    </div>
  );
};