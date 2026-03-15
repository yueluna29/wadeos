import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { generateTextResponse } from '../../services/geminiService';
import { Message } from '../../types';
import { supabase } from '../../services/supabase';
import { Icons } from '../ui/Icons';
import { ThemeStudio } from './ThemeStudio';

// 导入我们引以为傲的赛博乐高积木
import { ChatInputArea, Attachment } from '../chat/ChatInputArea';
import { MessageBubble } from '../chat/MessageBubble';
import { ActionMenuModal } from '../chat/ActionMenuModal';

const PROVIDERS = [
  { value: 'Gemini', label: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', defaultModel: 'gemini-3-pro-preview' },
  { value: 'Claude', label: 'Claude (Anthropic)', baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-3-5-sonnet-20241022' },
  { value: 'OpenAI', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  { value: 'DeepSeek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
  { value: 'OpenRouter', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', defaultModel: '' },
  { value: 'Custom', label: 'Custom', baseUrl: '', defaultModel: '' }
];

const getProviderIcon = (provider: string) => {
  switch (provider) {
    case 'Gemini': return <Icons.Sparkle />;
    case 'Claude': return <Icons.Face />;
    case 'OpenAI': return <Icons.Hexagon />;
    case 'DeepSeek': return <Icons.Eye />;
    case 'OpenRouter': return <Icons.Infinity />;
    default: return <Icons.Cube />;
  }
};

interface SmsChatViewProps {
  onBack: () => void;
}

export const SmsChatView: React.FC<SmsChatViewProps> = ({ onBack }) => {
  const {
    messages, addMessage, deleteMessage, updateMessage, settings, activeSessionId, sessions, updateSession, updateSettings, toggleSessionPin,
    llmPresets, addLlmPreset, coreMemories, toggleCoreMemoryEnabled, toggleFavorite, setRegenerating, addVariantToMessage, selectMessageVariant
  } = useStore();

  const [sessionSummary, setSessionSummary] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForSMS, setWaitingForSMS] = useState(false);
  const [wadeStatus, setWadeStatus] = useState<'online' | 'typing'>('online');
  
  // === 豪华功能区状态 ===
  const [showMenu, setShowMenu] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  
  const [showLlmSelector, setShowLlmSelector] = useState(false);
  const [llmSelectorMode, setLlmSelectorMode] = useState<'list' | 'add'>('list');
  const [newPresetForm, setNewPresetForm] = useState({ provider: 'Custom', name: '', model: '', apiKey: '', baseUrl: '' });

  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState(false);
  
  const [showMemorySelector, setShowMemorySelector] = useState(false);
  const [selectedMemoryTag, setSelectedMemoryTag] = useState<string | null>(null);
  const [expandedMemoryIds, setExpandedMemoryIds] = useState<string[]>([]);
  
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [customPromptText, setCustomPromptText] = useState('');
  
  const [showDebug, setShowDebug] = useState(false);

  // UI & 菜单状态
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

  // --- 各种功能函数 ---
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

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDERS.find(p => p.value === provider);
    if (preset) setNewPresetForm(prev => ({ ...prev, provider, baseUrl: preset.baseUrl, model: preset.defaultModel, name: prev.name || preset.label }));
  };

  const handleSavePreset = async () => {
    if (!newPresetForm.name || !newPresetForm.apiKey) return alert("Missing required fields.");
    await addLlmPreset({
      provider: newPresetForm.provider, name: newPresetForm.name, model: newPresetForm.model, apiKey: newPresetForm.apiKey, baseUrl: newPresetForm.baseUrl.replace(/\/$/, ''),
      apiPath: '', temperature: 1.0, topP: 0.95, topK: 40, frequencyPenalty: 0, presencePenalty: 0, isVision: false, isImageGen: false
    });
    setLlmSelectorMode('list');
    setNewPresetForm({ provider: 'Custom', name: '', model: '', apiKey: '', baseUrl: '' });
  };

  const toggleMemoryExpand = (id: string) => setExpandedMemoryIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

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
      attachments: attachments.map(a => ({ type: a.type, content: a.content.split(',')[1], mimeType: a.mimeType, name: a.name })),
      image: attachments.find(a => a.type === 'image')?.content.split(',')[1]
    };
    
    addMessage(newMessage);
    setWaitingForSMS(true);

    if (smsDebounceTimer.current) clearTimeout(smsDebounceTimer.current);
    
    smsDebounceTimer.current = setTimeout(() => {
      setWadeStatus('typing');
      setTimeout(() => {
        if (activeSessionId) { triggerAIResponse(activeSessionId); }
      }, 2000);
    }, 120000); 
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

      const smsRules = settings.smsInstructions || `[SMS MODE RULES - STRICT]\n- You are texting on a phone. NO actions (*asterisks*), NO narration.\n- Write ONLY text messages.\n- Keep it SHORT.\n- IMPORTANT: You MUST split your reply into MULTIPLE separate text bubbles by using ||| as the separator.`;
      modePrompt += `\n\n${smsRules}`;

      const currentSession = sessions.find(s => s.id === targetSessionId);
      const effectiveLlmId = currentSession?.customLlmId || settings.activeLlmId;
      const activeLlm = effectiveLlmId ? llmPresets.find(p => p.id === effectiveLlmId) : null;
      if (!activeLlm?.apiKey) throw new Error("API Key missing!");

      const safeMemories = Array.isArray(coreMemories) ? coreMemories : [];
      const sessionMemories = currentSession?.activeMemoryIds ? safeMemories.filter(m => currentSession.activeMemoryIds!.includes(m.id)) : safeMemories.filter(m => m.enabled);

      const response = await generateTextResponse(
        activeLlm.model, " (Reply to the latest texts)", history, settings.systemInstruction, modePrompt, settings.lunaInfo,
        settings.wadeSingleExamples, settings.smsExampleDialogue, "", "", "", sessionMemories, !!regenMsgId, 'sms', activeLlm.apiKey, undefined, currentSession?.customPrompt, activeLlm.baseUrl
      );

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
            if (i === parts.length - 1) { setIsTyping(false); setWadeStatus('online'); }
          }, i * 1500); 
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

  const executeTTS = async (text: string, msgId: string) => { alert("TTS Triggered! (SMS mode)"); };

  const selectedMsg = displayMessages.find(m => m.id === selectedMsgId);
  const isLatestMessage = selectedMsg && displayMessages[displayMessages.length - 1]?.id === selectedMsg.id;

  return (
    <div className="flex flex-col h-full bg-wade-bg-app relative animate-fade-in">
      
      {/* =========================================
          🔥 完美统一版 Header (加了 shrink-0 强行锁定圆形) 🔥
          ========================================= */}
      <div className="w-full p-4 bg-wade-bg-card/90 backdrop-blur-md shadow-sm border-b border-wade-border flex items-center justify-between z-20 shrink-0">
        
        <div className="w-[104px] flex justify-start">
          <button onClick={onBack} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
            <Icons.Back />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
          <img src={settings.wadeAvatar} className="w-8 h-8 shrink-0 rounded-full object-cover shadow-sm mb-0.5 border border-wade-border" alt="Wade" />
          <div className="flex items-center gap-1">
            <span className="font-bold text-wade-text-main text-[11px] tracking-wide">Wade Wilson</span>
            <Icons.ChevronRight size={10} className="text-wade-text-muted" />
          </div>
        </div>

        {/* 加了 shrink-0 防挤压，保证它们是完美的圆！ */}
        <div className="w-[104px] flex items-center justify-end gap-2">
          <button onClick={() => { setShowSearch(!showSearch); setShowMap(false); }} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors"><Icons.Search /></button>
          <button onClick={() => { setShowMap(!showMap); setShowSearch(false); }} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors"><Icons.Map /></button>
          <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors relative"><Icons.More /></button>
        </div>
      </div>

      {/* =========================================
          🔥 下拉菜单 (毛玻璃) 🔥
          ========================================= */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowLlmSelector(false); }} />
          <div className="absolute top-16 right-4 z-50 bg-wade-bg-card/75 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-wade-border/40 py-2 px-2 min-w-[200px] animate-fade-in">
            <button onClick={() => { if (activeSessionId) toggleSessionPin(activeSessionId); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Pin /></div><span className="font-medium">{activeSessionId && sessions.find(s => s.id === activeSessionId)?.isPinned ? "Unstick From Fridge" : "Stick To Fridge"}</span>
            </button>
            <button onClick={() => { setShowLlmSelector(!showLlmSelector); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Hexagon /></div><span className="font-medium">Brain Transplant</span>
            </button>
            <button onClick={() => { setShowMemorySelector(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Brain /></div><span className="font-medium">Trigger Flashbacks</span>
            </button>
            <button onClick={() => { setShowPromptEditor(true); setShowMenu(false); setCustomPromptText(sessions.find(s => s.id === activeSessionId)?.customPrompt || ''); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Fire /></div><span className="font-medium">Add Special Sauce</span>
            </button>
            <button onClick={() => { setIsThemeStudioOpen(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Settings size={16} /></div><span className="font-medium">Chat Theme</span>
            </button>
            <button onClick={() => { setShowDebug(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Bug /></div><span className="font-medium">X-Ray Vision</span>
            </button>
          </div>
        </>
      )}

      {/* ThemeStudio */}
      <ThemeStudio isOpen={isThemeStudioOpen} onClose={() => setIsThemeStudioOpen(false)} sessionId={activeSessionId || undefined} />

      {/* 搜索悬浮框 (换回 Nope) */}
      {showSearch && (
        <div onClick={(e) => e.stopPropagation()} className="absolute top-20 left-4 right-4 z-40 bg-wade-bg-card/95 backdrop-blur-md rounded-2xl shadow-lg border border-wade-border p-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <button onClick={goToPrevResult} disabled={totalResults === 0} className="w-7 h-7 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors disabled:opacity-30"><Icons.ChevronLeft /></button>
            <div className="flex-1 relative">
              <input type="text" value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Hunt words..." className="w-full px-4 py-2 pr-20 text-xs bg-wade-bg-app border border-wade-border rounded-full focus:outline-none focus:border-wade-accent transition-colors text-wade-text-main" autoFocus />
              {searchQuery && (<div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"><span className="text-xs text-wade-text-muted font-medium">{totalResults > 0 ? `${currentSearchIndex + 1}/${totalResults}` : '0/0'}</span><button onClick={() => { setSearchQuery(''); setCurrentSearchIndex(0); }} className="text-wade-text-muted hover:text-wade-accent"><Icons.Close /></button></div>)}
            </div>
            <button onClick={goToNextResult} disabled={totalResults === 0} className="w-7 h-7 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors disabled:opacity-30"><Icons.ChevronRight /></button>
            {/* 取消键变回 Nope */}
            <button onClick={() => setShowSearch(false)} className="px-3 py-1.5 text-xs text-wade-text-muted hover:text-wade-accent transition-colors font-medium">Nope</button>
          </div>
        </div>
      )}

      {/* 对话地图 (Conversation GPS) */}
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

      {/* 脑部移植 (LLM Selector) */}
      {showLlmSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowLlmSelector(false)}>
          <div className="bg-wade-bg-base w-[90%] max-w-3xl h-[auto] max-h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-wade-accent-light ring-1 ring-wade-border" onClick={e => e.stopPropagation()}>
            {llmSelectorMode === 'list' ? (
              <>
                <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent"><Icons.Hexagon size={14} /></div>
                    <div><h3 className="font-bold text-wade-text-main text-sm tracking-tight">Neural Net Selector</h3><p className="text-[10px] text-wade-text-muted uppercase tracking-wider font-medium">Pick my brain. Literally.</p></div>
                  </div>
                  <button onClick={() => setShowLlmSelector(false)} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"><Icons.Close size={16} /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar bg-wade-bg-base">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {llmPresets.map((preset) => {
                      const currentSession = sessions.find(s => s.id === activeSessionId);
                      const isActive = currentSession?.customLlmId === preset.id || (!currentSession?.customLlmId && settings.activeLlmId === preset.id);
                      return (
                        <button key={preset.id} onClick={async () => { if (activeSessionId) await updateSession(activeSessionId, { customLlmId: preset.id }); else await updateSettings({ activeLlmId: preset.id }); }} className={`relative group p-4 rounded-2xl border text-left transition-all duration-300 ease-out flex flex-col gap-3 ${isActive ? 'bg-wade-bg-card border-wade-accent shadow-md scale-[1.02]' : 'bg-wade-bg-card border-wade-border hover:border-wade-accent/50 hover:shadow-sm'}`}>
                          {isActive && <div className="absolute top-4 right-4 w-2 h-2 bg-wade-accent rounded-full animate-pulse shadow-[0_0_8px_var(--wade-accent)]" />}
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-wade-accent-light text-wade-accent' : 'bg-wade-bg-app text-wade-text-muted group-hover:text-wade-accent group-hover:bg-wade-accent-light'}`}>{getProviderIcon(preset.provider)}</div>
                            <div className="flex-1 min-w-0"><h4 className={`font-bold text-sm truncate ${isActive ? 'text-wade-text-main' : 'text-wade-text-main/80'}`}>{preset.name}</h4><span className={`text-[9px] font-bold uppercase tracking-widest ${isActive ? 'text-wade-accent' : 'text-wade-text-muted/60'}`}>{preset.provider || 'UNKNOWN'}</span></div>
                          </div>
                          <p className={`text-xs font-mono truncate w-full ${isActive ? 'text-wade-text-muted' : 'text-wade-text-muted/60'}`}>{preset.model}</p>
                        </button>
                      );
                    })}
                    <button onClick={() => setLlmSelectorMode('add')} className="p-4 rounded-2xl border border-dashed border-wade-border hover:border-wade-accent/60 hover:bg-wade-accent-light/30 transition-all flex flex-col items-center justify-center gap-2 text-wade-text-muted hover:text-wade-accent min-h-[100px] group"><div className="p-2 rounded-full bg-wade-bg-app group-hover:bg-wade-accent group-hover:text-white transition-colors"><Icons.Plus size={16} /></div><span className="text-xs font-bold">Configure Nets</span></button>
                  </div>
                </div>
              </>
            ) : (
              <>
                 <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setLlmSelectorMode('list')} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"><Icons.ArrowLeft size={16} /></button>
                    <div><h3 className="font-bold text-wade-text-main flex items-center gap-2 text-sm tracking-tight">Add Neural Net</h3></div>
                  </div>
                  <button onClick={() => setShowLlmSelector(false)} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"><Icons.Close size={16} /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar bg-wade-bg-base">
                  <div className="space-y-4 max-w-lg mx-auto">
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider ml-1">Provider</label><select className="w-full bg-wade-bg-card border border-wade-border rounded-xl px-3 py-2.5 text-xs text-wade-text-main outline-none focus:border-wade-accent transition-colors appearance-none" value={newPresetForm.provider} onChange={e => handleProviderChange(e.target.value)}>{PROVIDERS.map(p => (<option key={p.value} value={p.value}>{p.label}</option>))}</select></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider ml-1">Name</label><input className="w-full bg-wade-bg-card border border-wade-border rounded-xl px-3 py-2.5 text-xs text-wade-text-main outline-none focus:border-wade-accent transition-colors" placeholder="e.g. My Custom Brain" value={newPresetForm.name} onChange={e => setNewPresetForm({...newPresetForm, name: e.target.value})} /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider ml-1">Model ID</label><input className="w-full bg-wade-bg-card border border-wade-border rounded-xl px-3 py-2.5 text-xs text-wade-text-main outline-none focus:border-wade-accent transition-colors" placeholder="e.g. gemini-3-flash" value={newPresetForm.model} onChange={e => setNewPresetForm({...newPresetForm, model: e.target.value})} /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider ml-1">API Key</label><input className="w-full bg-wade-bg-card border border-wade-border rounded-xl px-3 py-2.5 text-xs text-wade-text-main outline-none focus:border-wade-accent transition-colors" type="password" placeholder="sk-..." value={newPresetForm.apiKey} onChange={e => setNewPresetForm({...newPresetForm, apiKey: e.target.value})} /></div>
                    <div className="space-y-1.5"><label className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider ml-1">Base URL (Optional)</label><input className="w-full bg-wade-bg-card border border-wade-border rounded-xl px-3 py-2.5 text-xs text-wade-text-main outline-none focus:border-wade-accent transition-colors" placeholder="https://api.example.com/v1" value={newPresetForm.baseUrl} onChange={e => setNewPresetForm({...newPresetForm, baseUrl: e.target.value})} /></div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-wade-border bg-wade-bg-app flex justify-end gap-3">
                  <button onClick={() => { setLlmSelectorMode('list'); setNewPresetForm({ provider: 'Custom', name: '', model: '', apiKey: '', baseUrl: '' }); }} className="text-xs font-bold text-wade-text-muted hover:text-wade-text-main px-4 py-2">Cancel</button>
                  <button onClick={handleSavePreset} className="bg-wade-accent text-white text-xs font-bold px-6 py-2 rounded-xl hover:bg-wade-accent-hover shadow-md hover:-translate-y-0.5 transition-all">Save Connection</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 记忆闪回 (Memory Selector) - 加入了内容预览和标题换行 */}
      {showMemorySelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowMemorySelector(false)}>
          <div className="bg-wade-bg-base w-[90%] max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-wade-accent-light ring-1 ring-wade-border" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent"><Icons.Brain size={14} /></div>
                <div><h3 className="font-bold text-wade-text-main text-sm tracking-tight">Link Memories</h3></div>
              </div>
              <button onClick={() => setShowMemorySelector(false)} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"><Icons.Close size={16} /></button>
            </div>
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
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${isSessionActive ? 'bg-gradient-to-br from-wade-accent to-wade-border-light text-white shadow-md shadow-wade-accent/20' : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200'}`}><Icons.Brain /></div>
                      
                      {/* 这里加入了标题换行和内容预览！ */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-bold break-words leading-tight ${isSessionActive ? 'text-wade-text-main' : 'text-wade-text-muted'}`}>{memory.title}</h4>
                        <p className="text-xs text-wade-text-muted line-clamp-2 mt-1 leading-relaxed">{memory.content}</p>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 加料 (Prompt Editor) */}
      {showPromptEditor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowPromptEditor(false)}>
          <div className="bg-wade-bg-base w-[90%] max-w-2xl h-[60vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-wade-accent-light ring-1 ring-wade-border" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent"><Icons.Fire /></div>
                <div><h3 className="font-bold text-wade-text-main text-sm tracking-tight">Spice It Up</h3></div>
              </div>
              <button onClick={() => setShowPromptEditor(false)} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"><Icons.Close size={16} /></button>
            </div>
            <div className="p-6 flex-1 flex flex-col bg-wade-bg-base">
              <textarea value={customPromptText} onChange={(e) => setCustomPromptText(e.target.value)} placeholder="Type your commands here..." className="w-full h-full bg-wade-bg-card border border-wade-border rounded-xl px-4 py-3 focus:outline-none text-wade-text-main text-xs resize-none font-mono custom-scrollbar" />
            </div>
            <div className="px-6 py-4 border-t border-wade-border bg-wade-bg-app flex justify-center gap-6">
              <button onClick={() => setShowPromptEditor(false)} className="text-xs font-bold text-wade-text-muted hover:text-wade-text-main px-6 py-2">Abort</button>
              <button onClick={async () => { if (activeSessionId) { await updateSession(activeSessionId, { customPrompt: customPromptText }); } setShowPromptEditor(false); }} className="bg-wade-accent text-white text-xs font-bold px-8 py-2 rounded-xl hover:bg-wade-accent-hover shadow-md transition-all">Inject</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          🔥 X-Ray Debug (把那些丢失的复杂逻辑全搬回来了！) 🔥
          ========================================= */}
      {showDebug && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowDebug(false)}>
          <div className="bg-wade-bg-base w-[90%] max-w-3xl h-[80vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-wade-accent-light ring-1 ring-wade-border" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent"><Icons.Bug size={14} /></div>
                <h3 className="font-bold text-wade-text-main text-sm">Brain X-Ray</h3>
              </div>
              <button onClick={() => setShowDebug(false)} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"><Icons.Close size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {(() => {
                // 极其复杂的逻辑演算又回来了
                const currentSessionMsgs = messages.filter(m => m.sessionId === activeSessionId).sort((a, b) => a.timestamp - b.timestamp);
                const historyPayload = currentSessionMsgs.slice(-20).map(m => ({ role: m.role, content: m.text }));

                let systemInstructions = settings.systemInstruction || "";
                const wadePersona = settings.wadePersonality || "(None)";
                const lunaInfo = settings.lunaInfo || "(None)";
                const singleExamples = settings.wadeSingleExamples || "(None)";
                
                let dialogueExamples = settings.smsExampleDialogue || "(None)";
                let modeSpecificInstructions = settings.smsInstructions || `[SMS MODE RULES - STRICT]...`;
                
                systemInstructions += `\n\n${modeSpecificInstructions}`;
                if (settings.wadePersonality) systemInstructions += `\n\n[CHARACTER PERSONA]\n${settings.wadePersonality}`;
                
                const currentSession = sessions.find(s => s.id === activeSessionId);
                const safeMemories = Array.isArray(coreMemories) ? coreMemories : [];
                const activeMemories = currentSession?.activeMemoryIds ? safeMemories.filter(m => currentSession.activeMemoryIds!.includes(m.id)) : safeMemories.filter(m => m.enabled);
                const spiceContent = currentSession?.customPrompt || "";
                const memoriesContent = JSON.stringify(activeMemories);
                
                if (sessionSummary) {
                    systemInstructions += `\n\n[PREVIOUS SUMMARY]\n${sessionSummary}\n[END SUMMARY]`;
                }
                
                const effectiveLlmId = currentSession?.customLlmId || settings.activeLlmId;
                const activeLlm = effectiveLlmId ? llmPresets.find(p => p.id === effectiveLlmId) : null;
                const currentModelName = activeLlm?.name || 'Gemini 3 Flash (Default)';
                const currentProvider = activeLlm?.provider || 'Google';
                
                const promptLength = JSON.stringify(historyPayload).length + systemInstructions.length + wadePersona.length + lunaInfo.length + singleExamples.length + dialogueExamples.length + memoriesContent.length + spiceContent.length;
                const estTokens = Math.round(promptLength / 4);

                return (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-wade-bg-card p-4 rounded-2xl border border-wade-accent shadow-sm flex flex-col items-center justify-center text-center">
                         <div className="text-wade-accent font-bold uppercase text-[9px] tracking-[0.2em] mb-1">Active Brain</div>
                         <div className="text-sm font-black text-wade-text-main tracking-tight line-clamp-1 px-1">{currentModelName}</div>
                         <div className="text-[9px] text-wade-text-muted/60 mt-1 font-mono uppercase">{currentProvider}</div>
                      </div>
                      <div className="bg-wade-bg-card p-4 rounded-2xl border border-wade-border shadow-sm flex flex-col items-center justify-center text-center">
                         <div className="text-wade-text-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1">Total Context</div>
                         <div className="text-2xl font-black text-wade-text-main tracking-tight">{estTokens}</div>
                         <div className="text-[9px] text-wade-text-muted/60 mt-1 font-medium">Est. Tokens</div>
                      </div>
                      <div className="bg-wade-bg-card p-4 rounded-2xl border border-wade-border shadow-sm flex flex-col items-center justify-center text-center">
                         <div className="text-wade-text-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1">Active Memories</div>
                         <div className="text-2xl font-black text-wade-text-main tracking-tight">{activeMemories.length}</div>
                         <div className="text-[9px] text-wade-text-muted/60 mt-1 font-medium">Injected Items</div>
                      </div>
                      <div className="bg-wade-bg-card p-4 rounded-2xl border border-wade-border shadow-sm flex flex-col items-center justify-center text-center">
                         <div className="text-wade-text-muted font-bold uppercase text-[9px] tracking-[0.2em] mb-1">History Limit</div>
                         <div className="text-2xl font-black text-wade-text-main tracking-tight">{settings.contextLimit || 50}</div>
                         <div className="text-[9px] text-wade-text-muted/60 mt-1 font-medium">Messages</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-bold text-wade-text-main text-xs uppercase tracking-widest">Raw Payload</h4>
                      <div className="mt-4 bg-wade-code-bg rounded-xl p-4 overflow-hidden shadow-inner">
                        <pre className="text-[10px] font-mono text-wade-code-text overflow-x-auto custom-scrollbar leading-tight whitespace-pre-wrap">
                          {JSON.stringify({ 
                            system_instructions: systemInstructions,
                            wade_persona: wadePersona,
                            luna_info: lunaInfo,
                            single_examples: singleExamples,
                            dialogue_examples: dialogueExamples,
                            memories_sent: activeMemories.map(m => m.content), 
                            history: historyPayload,
                            current_turn_spice: spiceContent || "(None)"
                          }, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 聊天气泡展示区 */}
      <div className="flex-1 overflow-y-auto p-4 relative custom-scrollbar">
        {displayMessages.length === 0 && (
           <div className="text-center text-wade-text-muted mt-20 opacity-50 text-xs">iMessage<br/>Today</div>
        )}

        <div className="flex flex-col w-full">
          {displayMessages.map((msg, idx) => {
            const nextMsg = displayMessages[idx + 1];
            const spacingClass = (nextMsg && nextMsg.role === msg.role) ? "-mb-1" : "mb-3";
            const isCurrentSearchResult = searchQuery && totalResults > 0 && searchResults[currentSearchIndex]?.id === msg.id;
            
            return (
              <div key={msg.id} id={`msg-${msg.id}`} className={`${spacingClass} ${isCurrentSearchResult ? 'highlight-search' : ''}`}>
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
            );
          })}
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

      {/* 乐高积木 1 号：通用输入框 */}
      <ChatInputArea 
        onSend={handleSend}
        onCancel={handleCancel}
        isTyping={isTyping || waitingForSMS}
        activeMode="sms"
        placeholderText="iMessage"
      />

      {/* 长按菜单抽屉：SMS 模式下禁止 Branch */}
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
          canBranch={false} 
        />
      )}
    </div>
  );
};