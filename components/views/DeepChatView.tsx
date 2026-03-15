import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { generateTextResponse } from '../../services/geminiService';
import { Message } from '../../types';
import { supabase } from '../../services/supabase';
import { Icons } from '../ui/Icons';

// 👇 看看这里！我们把你刚捏的三块乐高积木全引进来了！ 👇
import { ChatInputArea, Attachment } from '../chat/ChatInputArea';
import { MessageBubble } from '../chat/MessageBubble';
import { ActionMenuModal } from '../chat/ActionMenuModal';

interface DeepChatViewProps {
  onBack: () => void;
}

export const DeepChatView: React.FC<DeepChatViewProps> = ({ onBack }) => {
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
  
  // 长按菜单 & 操作状态
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const displayMessages = messages.filter(m => m.sessionId === activeSessionId).sort((a, b) => a.timestamp - b.timestamp);

  // 每次发消息自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length, isTyping]);

  // 读取数据库里的记忆总结
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

  // 乐高积木 1 号的核心逻辑：发送消息
  const handleSend = async (text: string, attachments: Attachment[]) => {
    if (!activeSessionId) return;
    
    const newMessage: Message = {
      id: Date.now().toString(), 
      sessionId: activeSessionId, 
      role: 'Luna',
      text: text, 
      timestamp: Date.now(), 
      mode: 'deep',
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

    // 稍微等一下再触发 AI，显得像个真人
    setTimeout(() => { triggerAIResponse(activeSessionId); }, 1000); 
  };

  // 触发 Wade 的脑子
  const triggerAIResponse = async (targetSessionId: string, regenMsgId?: string) => {
    abortControllerRef.current = new AbortController();
    if (regenMsgId) setRegenerating(regenMsgId, true);

    try {
      const historyMsgs = messages.filter(m => m.sessionId === targetSessionId).slice(-(settings.contextLimit || 50));
      const history = historyMsgs.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      
      let modePrompt = settings.wadePersonality;
      if (sessionSummary) modePrompt = `[PREVIOUS SUMMARY]\n${sessionSummary}\n[END SUMMARY]\n\n${modePrompt}`;

      const activeLlm = llmPresets.find(p => p.id === settings.activeLlmId);
      if (!activeLlm?.apiKey) throw new Error("API Key missing! Check settings.");

      const response = await generateTextResponse(
        activeLlm.model, "...", history, settings.systemInstruction, modePrompt, settings.lunaInfo,
        settings.wadeSingleExamples, "", "", "", "", [], !!regenMsgId, 'deep', activeLlm.apiKey, undefined, "", activeLlm.baseUrl
      );

      if (regenMsgId) {
        addVariantToMessage(regenMsgId, response.text, response.thinking, activeLlm.model);
        setRegenerating(regenMsgId, false);
      } else {
        addMessage({
          id: (Date.now() + 1).toString(), sessionId: targetSessionId, role: 'Wade',
          text: response.text, model: activeLlm.model, timestamp: Date.now(), mode: 'deep',
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
      // 简化版 TTS，以后可以把具体发音代码填回来
      alert("TTS Triggered! (Muffin, remember to link the real TTS engine here later)");
  };

  const selectedMsg = displayMessages.find(m => m.id === selectedMsgId);
  const isLatestMessage = selectedMsg && displayMessages[displayMessages.length - 1]?.id === selectedMsg.id;

  return (
    <div className="flex flex-col h-full bg-wade-bg-app relative animate-fade-in">
      
      {/* 顶部导航栏 */}
      <div className="chat-header">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted shadow-sm hover:text-wade-accent"><Icons.Back /></button>
        <div className="flex-1 flex items-center gap-2 ml-4">
          <div className="relative">
            <img src={settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover border border-wade-border shadow-sm" alt="Wade" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-wade-bg-card rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-wade-text-main text-sm">Wade</span>
            <span className="text-[9px] text-wade-accent">{wadeStatus === 'typing' ? 'Deep thinking...' : 'Soul connected'}</span>
          </div>
        </div>
        <button onClick={() => setShowSearch(!showSearch)} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted shadow-sm hover:text-wade-accent"><Icons.Search /></button>
      </div>

      {/* 搜索框浮层 */}
      {showSearch && (
        <div className="absolute top-20 left-4 right-4 z-40 bg-wade-bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-wade-border p-3 animate-fade-in flex gap-2">
          <input 
            type="text" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            placeholder="Hunt words in the deep..." 
            className="flex-1 bg-wade-bg-app border border-wade-border rounded-full px-4 py-2 text-xs focus:outline-none focus:border-wade-accent text-wade-text-main"
            autoFocus
          />
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="text-wade-text-muted hover:text-wade-accent px-2"><Icons.Close /></button>
        </div>
      )}

      {/* 聊天气泡展示区 */}
      <div className="flex-1 overflow-y-auto p-4 relative custom-scrollbar">
        {displayMessages.length === 0 && (
           <div className="text-center text-wade-text-muted mt-20 opacity-50 font-hand text-xl">Dive into the deep end.</div>
        )}

        <div className="flex flex-col w-full">
          {displayMessages.map(msg => (
            <div key={msg.id} className="mb-4">
              {/* 乐高积木 2 号：通用气泡 */}
              <MessageBubble 
                msg={msg} 
                settings={settings} 
                onSelect={setSelectedMsgId} 
                isSMS={false} 
                onPlayTTS={executeTTS} 
                onRegenerateTTS={executeTTS} 
                searchQuery={searchQuery} 
                playingMessageId={playingMessageId} 
                isPaused={isPaused} 
              />
            </div>
          ))}
        </div>
        
        {/* 打字指示器 */}
        {isTyping && (
           <div className="flex gap-2 mt-2 ml-2 items-center text-wade-accent animate-fade-in">
               <div className="w-2 h-2 rounded-full bg-wade-accent animate-bounce"></div>
               <div className="w-2 h-2 rounded-full bg-wade-accent animate-bounce delay-100"></div>
               <div className="w-2 h-2 rounded-full bg-wade-accent animate-bounce delay-200"></div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 乐高积木 1 号：通用输入框 */}
      <ChatInputArea 
        onSend={handleSend}
        onCancel={handleCancel}
        isTyping={isTyping}
        activeMode="deep"
        placeholderText="Talk to my soul, Muffin..."
      />

      {/* 乐高积木 3 号：通用长按操作抽屉 */}
      {selectedMsg && (
        <ActionMenuModal
          selectedMsg={selectedMsg}
          activeMode="deep"
          playingMessageId={playingMessageId}
          isPaused={isPaused}
          onClose={() => setSelectedMsgId(null)}
          onCopy={() => {
            navigator.clipboard.writeText(selectedMsg.text);
            setSelectedMsgId(null);
          }}
          onSelectText={() => {
            // 这里可以接回你的选词 Modal，为了轻量化暂时先全选复制
            navigator.clipboard.writeText(selectedMsg.text);
            alert("Copied to clipboard!");
            setSelectedMsgId(null);
          }}
          onRegenerate={() => {
            if (activeSessionId) triggerAIResponse(activeSessionId, selectedMsg.id);
            setSelectedMsgId(null);
          }}
          onBranch={async () => {
            await forkSession(selectedMsg.id);
            setSelectedMsgId(null);
          }}
          onEdit={() => {
            const newText = prompt("Rewrite history:", selectedMsg.text);
            if (newText) updateMessage(selectedMsg.id, newText);
            setSelectedMsgId(null);
          }}
          onPlayTTS={() => executeTTS(selectedMsg.text, selectedMsg.id)}
          onRegenerateTTS={() => executeTTS(selectedMsg.text, selectedMsg.id)}
          onFavorite={() => {
            toggleFavorite(selectedMsg.id);
            setSelectedMsgId(null);
          }}
          onDelete={() => {
            deleteMessage(selectedMsg.id);
            setSelectedMsgId(null);
          }}
          onPrevVariant={() => selectMessageVariant(selectedMsg.id, (selectedMsg.selectedIndex || 0) - 1)}
          onNextVariant={() => selectMessageVariant(selectedMsg.id, (selectedMsg.selectedIndex || 0) + 1)}
          canRegenerate={selectedMsg.role === 'Wade' && !!isLatestMessage}
          canBranch={true}
        />
      )}
    </div>
  );
};