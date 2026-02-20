import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { generateTextResponse, generateTTS, generateChatTitle } from '../../services/geminiService';
import { Message, ChatMode, ArchiveMessage, ChatArchive } from '../../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Simple Icons
const Icons = {
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Volume: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  VolumeLarge: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  Heart: ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
  Send: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  Refresh: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>,
  ChevronLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  More: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Brain: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>,
  Down: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Up: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>,
  Branch: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
};

// --- Long Press Hook ---
const useLongPress = (callback: () => void, ms = 500) => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const isMoved = useRef(false);

  const start = () => {
    isMoved.current = false;
    timerRef.current = setTimeout(() => {
      // Vibrate if supported for feedback
      if (navigator.vibrate) navigator.vibrate(50);
      callback();
    }, ms);
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };
  
  const move = () => {
    isMoved.current = true;
    stop();
  };

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchMove: move,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault(); // Prevent native right-click menu
      callback();
    }
  };
};

const MessageBubble = ({ 
  msg, settings, onSelect, isSMS, onPlayTTS 
}: { 
  msg: Message, settings: any, onSelect: (id: string) => void, isSMS: boolean, onPlayTTS: (text: string) => void
}) => {
  const isLuna = msg.role === 'Luna';
  const [showThought, setShowThought] = useState(false);
  
  // Format helpers
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });

  // Long press bindings
  const longPressHandlers = useLongPress(() => onSelect(msg.id));

  // Determine Thinking Content
  const idx = msg.selectedIndex || 0;
  const thinkingContent = msg.variantsThinking?.[idx];

  // FIX FOR "|||": Replace separators with visual spacing before rendering
  const displayContent = msg.text.replace(/\|\|\|/g, '\n\n');

  // -------------------------
  // LOADING / REGENERATING STATE
  // -------------------------
  if (msg.isRegenerating) {
    return (
      <div className={`flex flex-col mb-4 group ${isLuna ? 'items-end' : 'items-start'} animate-pulse`}>
         {!isSMS && !isLuna && (
            <div className="flex items-start gap-3 mb-0 ml-1 select-none">
              <img src={settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover border border-[#eae2e8]" />
              <div className="flex flex-col mt-0.5">
                 <span className="font-bold text-[#5a4a42] text-sm leading-tight">Wade</span>
                 <span className="text-[10px] text-[#917c71]">Updating...</span>
              </div>
            </div>
         )}
         <div className={`mt-2 px-5 py-4 rounded-2xl ${isSMS ? 'bg-white text-[#5a4a42] border border-[#eae2e8] rounded-bl-none shadow-sm ml-0' : 'bg-white border border-[#eae2e8] rounded-tl-none shadow-sm'} flex items-center gap-3`}>
             <div className="flex gap-1.5">
               <div className="w-1.5 h-1.5 bg-[#d58f99] rounded-full animate-bounce"></div>
               <div className="w-1.5 h-1.5 bg-[#d58f99] rounded-full animate-bounce delay-75"></div>
               <div className="w-1.5 h-1.5 bg-[#d58f99] rounded-full animate-bounce delay-150"></div>
             </div>
             {!isSMS && <span className="text-xs text-[#d58f99] font-bold italic animate-pulse">Wade is rethinking...</span>}
         </div>
      </div>
    );
  }

  // -------------------------
  // MODE 1: SMS LAYOUT
  // -------------------------
  if (isSMS) {
    const bubbleClasses = isLuna 
      ? "bg-[#d58f99] text-white rounded-2xl rounded-br-none shadow-sm" 
      : "bg-white text-[#5a4a42] border border-[#eae2e8] rounded-2xl rounded-bl-none shadow-sm";

    return (
      <div className={`flex flex-col group ${isLuna ? 'items-end' : 'items-start'} relative`}>
        <div className={`relative max-w-[85%] ${isLuna ? 'flex flex-row-reverse' : 'flex'} gap-2 items-end`}>
          <div 
            {...longPressHandlers}
            style={{ WebkitTouchCallout: 'none' }}
            className={`px-4 py-2.5 relative ${bubbleClasses} min-w-[60px] cursor-pointer active:scale-95 transition-transform select-none`}
          >
             {thinkingContent && (
               <div className="absolute -top-3 right-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowThought(!showThought); }}
                    className="bg-[#f9f6f7] border border-[#eae2e8] rounded-full p-1 shadow-sm text-[#d58f99] hover:scale-110 transition-transform"
                  >
                    <Icons.Brain />
                  </button>
               </div>
             )}
             
             {thinkingContent && showThought && (
               <div className="mb-2 p-2 bg-[#fff0f3] rounded-lg border border-[#d58f99]/20 text-[10px] text-[#917c71] leading-relaxed markdown-thinking">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkingContent}</ReactMarkdown>
               </div>
             )}

             <div className={`text-sm md:text-base leading-snug break-words markdown-content ${isLuna ? 'text-white' : 'text-[#5a4a42]'}`}>
               <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
             </div>
          </div>
          <span className="text-[9px] text-[#917c71]/50 mb-1 whitespace-nowrap shrink-0 select-none">
            {formatTime(msg.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // -------------------------
  // MODE 2: DEEP / ROLEPLAY / ARCHIVE LAYOUT
  // -------------------------
  
  // WADE (AI)
  if (!isLuna) {
    return (
      <div className="flex flex-col items-start w-full group animate-fade-in pr-2">
        {/* Avatar Row */}
        <div className="flex items-start gap-3 mb-0 ml-1 select-none">
           <img 
            src={settings.wadeAvatar} 
            className="w-10 h-10 rounded-full object-cover border border-[#eae2e8] shadow-sm" 
           />
           <div className="flex flex-col mt-0.5">
             <div className="flex items-center gap-2">
                <span className="font-bold text-[#5a4a42] text-sm leading-tight">Wade</span>
                {/* QUICK TTS BUTTON */}
                <button 
                  onClick={(e) => { e.stopPropagation(); onPlayTTS(msg.text); }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[#d58f99] hover:bg-[#fff0f3] active:bg-[#d58f99] active:text-white transition-colors"
                >
                  <Icons.Volume />
                </button>
             </div>
             <div className="flex items-center gap-2 text-[10px] text-[#917c71] mt-0.5">
                <span className="tracking-wide">{formatDate(msg.timestamp)}</span>
                <span className="opacity-70">{formatTime(msg.timestamp)}</span>
             </div>
           </div>
        </div>

        {/* Bubble */}
        <div 
          {...longPressHandlers}
          style={{ WebkitTouchCallout: 'none' }}
          className="w-full mt-2 bg-white text-[#5a4a42] border border-[#eae2e8] rounded-2xl rounded-tl-none shadow-sm relative cursor-pointer active:bg-gray-50 transition-colors select-none overflow-hidden"
        >
             {/* THINKING HEADER (If available) */}
             {thinkingContent && (
               <div 
                 onClick={(e) => { e.stopPropagation(); setShowThought(!showThought); }}
                 className="bg-[#f9f6f7] border-b border-[#eae2e8] px-4 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-[#fff0f3] transition-colors"
               >
                 <div className="text-[#d58f99] animate-pulse"><Icons.Brain /></div>
                 <span className="text-[10px] font-bold text-[#917c71] uppercase tracking-wider flex-1">Thinking Process</span>
                 <div className="text-[#917c71]">{showThought ? <Icons.Up /> : <Icons.Down />}</div>
               </div>
             )}

             {/* THINKING CONTENT - MARKDOWN ENABLED */}
             {thinkingContent && showThought && (
               <div className="bg-[#fff0f3] px-5 py-3 text-xs text-[#917c71] border-b border-[#eae2e8] leading-relaxed markdown-thinking">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkingContent}</ReactMarkdown>
               </div>
             )}

             {/* MAIN TEXT */}
             <div className="px-5 py-3 text-base leading-relaxed markdown-content">
               <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
             </div>
        </div>
      </div>
    );
  }

  // LUNA (User)
  return (
    <div className="flex flex-col items-end w-full group animate-fade-in pl-2">
      {/* Avatar Row */}
      <div className="flex items-start gap-3 mb-0 mr-1 select-none">
         <div className="flex flex-col items-end mt-0.5">
             <span className="font-bold text-[#5a4a42] text-sm leading-tight">Luna</span>
             <div className="flex items-center gap-2 text-[10px] text-[#917c71] mt-0.5">
                <span className="tracking-wide">{formatDate(msg.timestamp)}</span>
                <span className="opacity-70">{formatTime(msg.timestamp)}</span>
             </div>
         </div>
         <img 
            src={settings.lunaAvatar} 
            className="w-10 h-10 rounded-full object-cover border border-[#d58f99] shadow-sm" 
         />
      </div>

      {/* Bubble */}
      <div 
         {...longPressHandlers}
         style={{ WebkitTouchCallout: 'none' }}
         className="max-w-[90%] mt-2 bg-[#d58f99] text-white rounded-2xl rounded-tr-none shadow-md px-5 py-3 relative cursor-pointer active:brightness-95 transition-all select-none"
      >
         <div className="text-base leading-relaxed markdown-content">
           <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
         </div>
      </div>
    </div>
  );
};

export const ChatInterface: React.FC = () => {
  const { 
    messages, addMessage, updateMessage, deleteMessage, settings, activeMode, setMode, toggleFavorite, setNavHidden,
    sessions, createSession, updateSessionTitle, deleteSession, activeSessionId, setActiveSessionId,
    addVariantToMessage, selectMessageVariant, setRegenerating, rewindConversation, forkSession,
    coreMemories, 
    chatArchives, loadArchiveMessages, deleteArchiveMessage, toggleArchiveFavorite // NEW
  } = useStore();
  
  const [viewState, setViewState] = useState<'menu' | 'list' | 'chat'>('menu');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForSMS, setWaitingForSMS] = useState(false);
  
  // Archive Viewer State
  const [archiveMessages, setArchiveMessages] = useState<ArchiveMessage[]>([]);
  const [activeArchiveId, setActiveArchiveId] = useState<string | null>(null); // NEW
  const [isLoadingArchive, setIsLoadingArchive] = useState(false);
  
  // Action Sheet State
  const [archiveDates, setArchiveDates] = useState<Record<string, string>>({});
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const smsDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (viewState === 'chat') {
      setNavHidden(true);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      setNavHidden(false);
    }
  }, [viewState]);

  useEffect(() => {
    return () => setNavHidden(false);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Determine which messages to show
  let displayMessages: Message[] = [];
  if (activeMode === 'archive') {
      // If in archive mode, convert ArchiveMessage[] to Message[] for display
      displayMessages = archiveMessages.map(am => ({
          id: am.id,
          role: am.role === 'user' ? 'Luna' : 'Wade',
          text: am.content,
          timestamp: am.timestamp,
          mode: 'archive',
          variants: [am.content],
          isFavorite: am.isFavorite // Pass favorite status
      }));
  } else {
      displayMessages = activeSessionId 
        ? messages.filter(m => m.sessionId === activeSessionId)
        : [];
  }

  const modeSessions = sessions.filter(s => s.mode === activeMode).sort((a,b) => b.updatedAt - a.updatedAt);

  const handleModeSelect = (mode: ChatMode) => {
    setMode(mode);
    setViewState('list');
  };

  const handleOpenSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setViewState('chat');
  };

  const handleOpenArchive = async (archiveId: string) => {
      setIsLoadingArchive(true);
      setActiveArchiveId(archiveId); // Set active ID
      try {
          const msgs = await loadArchiveMessages(archiveId);
          setArchiveMessages(msgs);
          setViewState('chat');
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoadingArchive(false);
      }
  };

  const handleStartDraftSession = () => {
    setActiveSessionId(null); 
    setViewState('chat');
  };

  const handleBack = () => {
    if (viewState === 'chat') {
      setViewState('list');
      setActiveSessionId(null);
      setActiveArchiveId(null); // Clear active archive
      setArchiveMessages([]);
      if (smsDebounceTimer.current) clearTimeout(smsDebounceTimer.current);
      setWaitingForSMS(false);
    } else if (viewState === 'list') {
      setViewState('menu');
    }
  };

  // ... (Keep existing actions: closeActions, handleCopy, handleDelete, etc.)
  const closeActions = () => {
    setSelectedMsgId(null);
    setIsEditing(false);
    setEditContent('');
    setIsDeleteConfirming(false); 
  };
  const selectedMsg = displayMessages.find(m => m.id === selectedMsgId);

  const handleCopy = () => {
    if (selectedMsg) {
      navigator.clipboard.writeText(selectedMsg.text);
      closeActions();
    }
  };

  const handleDelete = () => {
    if (selectedMsgId) {
      if (!isDeleteConfirming) {
        setIsDeleteConfirming(true);
        if (navigator.vibrate) navigator.vibrate(50);
      } else {
        if (activeMode === 'archive' && activeArchiveId) {
            deleteArchiveMessage(selectedMsgId, activeArchiveId);
            setArchiveMessages(prev => prev.filter(m => m.id !== selectedMsgId));
        } else {
            deleteMessage(selectedMsgId);
        }
        closeActions();
      }
    }
  };

  const handleFavorite = () => {
    if (selectedMsgId) {
      if (activeMode === 'archive' && activeArchiveId) {
          toggleArchiveFavorite(selectedMsgId, activeArchiveId);
          setArchiveMessages(prev => prev.map(m => m.id === selectedMsgId ? { ...m, isFavorite: !m.isFavorite } : m));
      } else {
          toggleFavorite(selectedMsgId);
      }
      closeActions();
    }
  };

  const handleRegenerate = async () => {
    if (selectedMsgId && activeSessionId) {
      closeActions();
      const currentSessionMsgs = messagesRef.current.filter(m => m.sessionId === activeSessionId).sort((a,b) => a.timestamp - b.timestamp);
      const isLatest = currentSessionMsgs.length > 0 && currentSessionMsgs[currentSessionMsgs.length - 1].id === selectedMsgId;
      if (!isLatest) {
        if (activeMode === 'sms') {
           alert("Babe, in SMS mode, I can only rewrite my last text. Otherwise I get confused!");
           return;
        }
        if (confirm("Create a new timeline (branch) from here? This will start a new chat with history up to this point.")) {
            await forkSession(selectedMsgId);
        }
      } else {
        triggerAIResponse(activeSessionId, selectedMsgId);
      }
    }
  };
  
  const handleBranch = async () => {
      if (selectedMsgId) {
          closeActions();
          await forkSession(selectedMsgId);
      }
  };

  const handleInitEdit = () => {
    if (selectedMsg) {
      setEditContent(selectedMsg.text);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = () => {
    if (selectedMsgId && editContent) {
      updateMessage(selectedMsgId, editContent);
      closeActions();
    }
  };

  const executeTTS = async (text: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const base64Audio = await generateTTS(text);
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBuffer = await audioContextRef.current.decodeAudioData(bytes.buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);
    } catch (e) {
      console.error("TTS Error", e);
      alert("Voice module glitching. Check key?");
    }
  };

  const playTTS = async () => {
    if (selectedMsg) {
      closeActions();
      executeTTS(selectedMsg.text);
    }
  };
  
  const handleQuickTTS = (text: string) => {
    executeTTS(text);
  };
  
  const prevVariant = () => {
    if (selectedMsg && selectedMsg.selectedIndex !== undefined && selectedMsg.selectedIndex > 0) {
       selectMessageVariant(selectedMsg.id, selectedMsg.selectedIndex - 1);
    }
  };
  const nextVariant = () => {
    if (selectedMsg && selectedMsg.variants && selectedMsg.selectedIndex !== undefined && selectedMsg.selectedIndex < selectedMsg.variants.length - 1) {
       selectMessageVariant(selectedMsg.id, selectedMsg.selectedIndex + 1);
    }
  };

  const isLatestMessage = (() => {
    if (!selectedMsg) return false;
    const msgs = displayMessages.sort((a,b) => a.timestamp - b.timestamp);
    return msgs.length > 0 && msgs[msgs.length - 1].id === selectedMsg.id;
  })();

  const canRegenerate = selectedMsg?.role === 'Wade' && isLatestMessage && activeMode !== 'archive';
  const canBranch = selectedMsg && activeMode !== 'sms' && activeMode !== 'archive';

  const triggerAIResponse = async (targetSessionId: string, regenMsgId?: string) => {
    if (regenMsgId) setRegenerating(regenMsgId, true);
    else {
      setIsTyping(true);
      setWaitingForSMS(false);
    }
    try {
      const freshMessages = messagesRef.current.filter(m => m.sessionId === targetSessionId);
      let historyMsgs = freshMessages;
      if (regenMsgId) {
         const targetIdx = freshMessages.findIndex(m => m.id === regenMsgId);
         if (targetIdx !== -1) historyMsgs = freshMessages.slice(0, targetIdx);
      }
      const history = historyMsgs.map(m => {
        let content = m.text;
        if (m.role === 'Wade') {
           const idx = m.selectedIndex || 0;
           const thought = m.variantsThinking?.[idx];
           if (thought) content = `#{@thought}#{@content}`;
        }
        return { role: m.role, parts: [{ text: content }] };
      }).slice(-15);

      let modePrompt = settings.wadePersonality;
      if (activeMode === 'sms') modePrompt += "\n STYLE: Short text messages. Use emojis...";
      else if (activeMode === 'roleplay') modePrompt += "\n STYLE: Descriptive roleplay...";

      const isRegeneration = !!regenMsgId;
      const response = await generateTextResponse(
        activeMode === 'roleplay' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview',
        activeMode === 'sms' ? " (Reply to the latest texts)" : inputText || "...", 
        history,
        modePrompt,
        settings.lunaInfo,
        settings.exampleDialogue,
        coreMemories,
        isRegeneration,
        activeMode as any
      );

      const responseText = response.text;
      const thinking = response.thinking;

      if (regenMsgId) {
        addVariantToMessage(regenMsgId, responseText, thinking);
        return;
      }
      if (activeMode === 'sms' && responseText.includes('|||')) {
          // ... split logic ...
          const parts = responseText.split('|||').map(s => s.trim()).filter(s => s);
          for (let i = 0; i < parts.length; i++) {
            setTimeout(() => {
              addMessage({
                id: Date.now().toString() + i,
                sessionId: targetSessionId,
                role: 'Wade',
                text: parts[i],
                timestamp: Date.now(),
                mode: activeMode,
                variantsThinking: i === 0 && thinking ? [thinking] : [null]
              });
              if (i === parts.length - 1) setIsTyping(false);
            }, i * 1500); 
          }
      } else {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          sessionId: targetSessionId,
          role: 'Wade',
          text: responseText,
          timestamp: Date.now(),
          mode: activeMode,
          variantsThinking: [thinking || null]
        };
        addMessage(botMessage);
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Chat Error", error);
      setIsTyping(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || activeMode === 'archive') return; // Disable send in archive
    let targetSessionId = activeSessionId;
    if (!targetSessionId) {
      targetSessionId = await createSession(activeMode);
      setActiveSessionId(targetSessionId); 
    }
    const currentInput = inputText;
    const isFirstMessage = messagesRef.current.filter(m => m.sessionId === targetSessionId).length === 0;
    const newMessage: Message = {
      id: Date.now().toString(),
      sessionId: targetSessionId,
      role: 'Luna',
      text: inputText,
      timestamp: Date.now(),
      mode: activeMode
    };
    addMessage(newMessage);
    setInputText('');
    if (textareaRef.current) textareaRef.current.style.height = '48px';
    if (isFirstMessage) {
      generateChatTitle(currentInput).then(title => {
        if (targetSessionId) updateSessionTitle(targetSessionId, title);
      });
    }
    if (activeMode === 'sms') {
      setWaitingForSMS(true);
      if (smsDebounceTimer.current) clearTimeout(smsDebounceTimer.current);
      smsDebounceTimer.current = setTimeout(() => {
        if (targetSessionId) triggerAIResponse(targetSessionId);
      }, 60000); 
    } else {
      setIsTyping(true);
      setTimeout(() => {
        if (targetSessionId) triggerAIResponse(targetSessionId);
      }, 600);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (window.innerWidth >= 768 && e.key === 'Enter' && !e.shiftKey) {
       e.preventDefault();
       handleSend();
    }
  };

  // --- RENDER ---
  
  if (viewState === 'menu') { 
    return (
    <div className="h-full bg-[#f9f6f7] p-6 flex flex-col items-center justify-center space-y-8 animate-fade-in">
        <div className="text-center mb-4">
          <h2 className="font-hand text-4xl text-[#d58f99] mb-2">Connect with Wade</h2>
          <p className="text-[#917c71] text-sm opacity-80">Choose your frequency, babe.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <button onClick={() => handleModeSelect('deep')} className="col-span-2 group relative overflow-hidden bg-white p-6 rounded-3xl shadow-sm border border-[#eae2e8] text-left hover:border-[#d58f99] transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#fff0f3] rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f9f6f7] rounded-full flex items-center justify-center text-2xl group-hover:bg-[#d58f99] group-hover:text-white transition-colors">🧠</div>
              <div><h3 className="font-bold text-[#5a4a42] text-lg">Deep Chat</h3><p className="text-[#917c71] text-xs mt-1">Soul-to-soul connection.</p></div>
            </div>
          </button>
          <button onClick={() => handleModeSelect('sms')} className="group relative overflow-hidden bg-white p-4 rounded-3xl shadow-sm border border-[#eae2e8] text-left hover:border-[#d58f99] transition-all hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-[#f9f6f7] rounded-full flex items-center justify-center text-xl mb-2 group-hover:bg-[#d58f99] group-hover:text-white transition-colors">💬</div>
              <h3 className="font-bold text-[#5a4a42]">SMS Mode</h3>
            </div>
          </button>
          <button onClick={() => handleModeSelect('roleplay')} className="group relative overflow-hidden bg-white p-4 rounded-3xl shadow-sm border border-[#eae2e8] text-left hover:border-[#d58f99] transition-all hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-[#f9f6f7] rounded-full flex items-center justify-center text-xl mb-2 group-hover:bg-[#d58f99] group-hover:text-white transition-colors">🎭</div>
              <h3 className="font-bold text-[#5a4a42]">Roleplay</h3>
            </div>
          </button>
          {/* ARCHIVE BUTTON - NEW */}
          <button onClick={() => handleModeSelect('archive')} className="col-span-2 group relative overflow-hidden bg-[#eae2e8]/50 p-4 rounded-3xl shadow-inner border border-[#eae2e8] text-left hover:bg-white hover:border-[#d58f99] transition-all hover:-translate-y-1">
             <div className="relative z-10 flex items-center gap-3 justify-center">
                 <svg className="w-5 h-5 text-[#917c71]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                 <span className="font-bold text-[#917c71] text-sm uppercase tracking-widest">Archives</span>
             </div>
          </button>
        </div>
      </div>
  ); }

  if (viewState === 'list') { 
      return (
      <div className="h-full bg-[#f9f6f7] p-6 flex flex-col items-center animate-fade-in">
        <div className="w-full max-w-md flex justify-between items-center mb-6 px-1">
           <button onClick={handleBack} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#917c71] hover:text-[#d58f99] transition-colors"><Icons.Back /></button>
           <h2 className="font-hand text-2xl text-[#d58f99] capitalize">{activeMode} {activeMode === 'archive' ? 'Files' : 'Threads'}</h2>
           {activeMode !== 'archive' && <button onClick={handleStartDraftSession} className="w-8 h-8 rounded-full bg-[#d58f99] text-white shadow-md flex items-center justify-center hover:bg-[#c07a84] transition-colors"><Icons.Plus /></button>}
        </div>
        <div className="w-full max-w-md space-y-3 overflow-y-auto pb-20">
           
           {/* ARCHIVE LIST LOGIC */}
           {activeMode === 'archive' ? (
              chatArchives.length === 0 ? (
                 <div className="text-center text-[#917c71]/50 py-10 italic">No archives found. Import them in the Memory Bank.</div>
              ) : (
                 chatArchives.map(arch => (
                   <div key={arch.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#eae2e8] flex justify-between items-center group hover:border-[#d58f99] transition-all cursor-pointer" onClick={() => handleOpenArchive(arch.id)}>
                      <div className="flex-1 min-w-0">
                         <h3 className="font-bold text-[#5a4a42] text-sm truncate">{arch.title}</h3>
                         <p className="text-[10px] text-[#917c71] mt-1">Imported {new Date(arch.importedAt).toLocaleDateString([], { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
                      </div>
                      <div className="p-2 text-[#d58f99]"><Icons.ChevronRight /></div>
                   </div>
                 ))
              )
           ) : (
             modeSessions.length === 0 ? (
               <div className="opacity-60 grayscale select-none pointer-events-none">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eae2e8] flex justify-between items-center">
                   <div className="flex-1 min-w-0"><h3 className="font-bold text-[#5a4a42] text-sm truncate">Sample Conversation</h3><p className="text-[10px] text-[#917c71] mt-1">Just now • 12:00 PM</p></div>
                 </div>
                 <div className="text-center text-[#917c71] text-xs mt-4">No active threads. Start a new one above!</div>
               </div>
             ) : (
               modeSessions.map(session => (
                 <div key={session.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#eae2e8] flex justify-between items-center group hover:border-[#d58f99] transition-all cursor-pointer" onClick={() => handleOpenSession(session.id)}>
                   <div className="flex-1 min-w-0"><h3 className="font-bold text-[#5a4a42] text-sm truncate">{session.title}</h3><p className="text-[10px] text-[#917c71] mt-1">{new Date(session.updatedAt).toLocaleDateString()} • {new Date(session.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p></div>
                   <button onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} className="p-2 text-gray-300 hover:text-red-400 transition-colors"><Icons.Trash /></button>
                 </div>
               ))
             )
           )}
        </div>
      </div>
  ); }

  // --- VIEW 3: CHAT ---
  return (
    <div className="flex flex-col h-full bg-[#f9f6f7] relative">
      {/* Immersive Header */}
      <div className="w-full p-4 bg-white/90 backdrop-blur-md shadow-sm border-b border-[#eae2e8] flex items-center gap-4 z-20">
        <button onClick={handleBack} className="w-8 h-8 rounded-full bg-[#f9f6f7] flex items-center justify-center text-[#917c71] hover:bg-[#d58f99] hover:text-white transition-colors"><Icons.Back /></button>
        <div className="flex items-center gap-3">
           <div className="relative">
             {activeMode === 'archive' ? (
                <div className="w-10 h-10 rounded-full bg-[#eae2e8] flex items-center justify-center text-lg">📚</div>
             ) : (
                <img src={settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover border border-[#eae2e8]" />
             )}
             {(isTyping || waitingForSMS) && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>}
           </div>
           <div>
              <div className="font-bold text-[#5a4a42] text-sm">
                {activeMode === 'archive' 
                  ? (displayMessages.length > 0 
                      ? new Date(displayMessages[0].timestamp).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }) + ' ' + new Date(displayMessages[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : (activeArchiveId ? chatArchives.find(a => a.id === activeArchiveId)?.title || 'Archive Reader' : 'Archive Reader'))
                  : 'Wade'}
              </div>
              <div className="text-[#917c71] text-[10px] uppercase tracking-wider font-bold">{isTyping ? 'Typing...' : waitingForSMS ? 'Read now' : activeMode}</div>
           </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {isLoadingArchive && <div className="text-center mt-20 text-[#d58f99] animate-pulse">Decrypting legacy data...</div>}
        
        {displayMessages.length === 0 && !isLoadingArchive && (
          <div className="text-center text-[#917c71] mt-20 opacity-50"><p className="font-hand text-xl mb-2">{activeMode === 'archive' ? 'Empty Record.' : 'Say hi to Wade.'}</p></div>
        )}
        
        <div className="flex flex-col w-full">
          {displayMessages.map((msg, idx) => {
             // DYNAMIC SPACING LOGIC
             let marginBottom = 'mb-6';
             const nextMsg = displayMessages[idx + 1];
             if (activeMode === 'sms') {
                if (nextMsg && nextMsg.role === msg.role) marginBottom = 'mb-1';
                else marginBottom = 'mb-4';
             }

             return (
               <div key={msg.id} className={marginBottom}>
                  <MessageBubble 
                    msg={msg} 
                    settings={settings}
                    onSelect={setSelectedMsgId}
                    isSMS={activeMode === 'sms'}
                    onPlayTTS={handleQuickTTS}
                  />
               </div>
             );
          })}
        </div>
        {isTyping && activeMode !== 'sms' && (
           <div className="flex justify-start items-end gap-2 mt-4 ml-1"> 
             <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-[#eae2e8]">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-[#d58f99] rounded-full animate-bounce"></div>
                 <div className="w-1.5 h-1.5 bg-[#d58f99] rounded-full animate-bounce delay-100"></div>
                 <div className="w-1.5 h-1.5 bg-[#d58f99] rounded-full animate-bounce delay-200"></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Action Sheet (Bottom Menu) */}
      {selectedMsg && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity animate-fade-in" onClick={closeActions} />
          <div 
             className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] shadow-2xl border-t border-[#d58f99]/20 transform transition-transform animate-slide-up overflow-hidden max-w-4xl mx-auto"
             onClick={() => isDeleteConfirming && setIsDeleteConfirming(false)} 
          >
            <div className="p-1.5 flex justify-center"><div className="w-10 h-1 bg-[#eae2e8] rounded-full"></div></div>
            {isEditing ? (
              <div className="p-4">
                 <h3 className="text-xs font-bold text-[#d58f99] uppercase tracking-wider mb-2">Editing</h3>
                 <textarea 
                   value={editContent}
                   onChange={(e) => setEditContent(e.target.value)}
                   className="w-full bg-[#f9f6f7] rounded-xl p-3 border border-[#eae2e8] focus:border-[#d58f99] outline-none text-[#5a4a42] min-h-[100px] mb-3"
                 />
                 <div className="flex gap-2">
                   <Button variant="ghost" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
                   <Button onClick={handleSaveEdit} className="flex-1">Save</Button>
                 </div>
              </div>
            ) : (
              <div className="p-6">
                {(selectedMsg.variants?.length || 0) > 1 && activeMode !== 'archive' && (
                   <div className="flex items-center justify-between bg-[#f9f6f7] p-2 rounded-xl mb-4 border border-[#eae2e8]">
                      <button onClick={prevVariant} disabled={!selectedMsg.selectedIndex} className="p-2 text-[#917c71] hover:text-[#d58f99] disabled:opacity-30"><Icons.ChevronLeft /></button>
                      <span className="text-xs font-bold text-[#5a4a42]">Variant {(selectedMsg.selectedIndex||0)+1} / {selectedMsg.variants?.length}</span>
                      <button onClick={nextVariant} disabled={(selectedMsg.selectedIndex||0) >= (selectedMsg.variants?.length||0)-1} className="p-2 text-[#917c71] hover:text-[#d58f99] disabled:opacity-30"><Icons.ChevronRight /></button>
                   </div>
                )}
                <div className="grid grid-cols-4 gap-4">
                  <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-[#f9f6f7] rounded-full flex items-center justify-center text-[#917c71] group-hover:bg-[#d58f99] group-hover:text-white transition-colors shadow-sm"><Icons.Copy /></div>
                    <span className="text-[10px] text-[#917c71]">Copy</span>
                  </button>
                  
                  {activeMode !== 'archive' && canRegenerate && (
                    <button onClick={(e) => { e.stopPropagation(); handleRegenerate(); }} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 bg-[#f9f6f7] rounded-full flex items-center justify-center text-[#917c71] group-hover:bg-[#d58f99] group-hover:text-white transition-colors shadow-sm"><Icons.Refresh /></div>
                      <span className="text-[10px] text-[#917c71]">Regen</span>
                    </button>
                  )}
                  
                  {activeMode !== 'archive' && canBranch && !canRegenerate && (
                    <button onClick={(e) => { e.stopPropagation(); handleBranch(); }} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 bg-[#f9f6f7] rounded-full flex items-center justify-center text-[#917c71] group-hover:bg-[#d58f99] group-hover:text-white transition-colors shadow-sm"><Icons.Branch /></div>
                      <span className="text-[10px] text-[#917c71]">Branch</span>
                    </button>
                  )}
                  
                  {activeMode !== 'archive' && (
                    <button onClick={(e) => { e.stopPropagation(); handleInitEdit(); }} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 bg-[#f9f6f7] rounded-full flex items-center justify-center text-[#917c71] group-hover:bg-[#d58f99] group-hover:text-white transition-colors shadow-sm"><Icons.Edit /></div>
                      <span className="text-[10px] text-[#917c71]">Edit</span>
                    </button>
                  )}
                  
                  {selectedMsg.role === 'Wade' && activeMode !== 'archive' && (
                    <button onClick={(e) => { e.stopPropagation(); playTTS(); }} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 bg-[#f9f6f7] rounded-full flex items-center justify-center text-[#917c71] group-hover:bg-[#d58f99] group-hover:text-white transition-colors shadow-sm"><Icons.VolumeLarge /></div>
                      <span className="text-[10px] text-[#917c71]">Speak</span>
                    </button>
                  )}
                  
                  <button onClick={(e) => { e.stopPropagation(); handleFavorite(); }} className="flex flex-col items-center gap-2 group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${selectedMsg.isFavorite ? 'bg-[#d58f99] text-white' : 'bg-[#f9f6f7] text-[#917c71] group-hover:bg-[#d58f99] group-hover:text-white'}`}><Icons.Heart filled={!!selectedMsg.isFavorite} /></div>
                    <span className="text-[10px] text-[#917c71]">Save</span>
                  </button>
                  
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(); }} className="flex flex-col items-center gap-2 group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${isDeleteConfirming ? 'bg-red-500 text-white animate-pulse' : 'bg-[#f9f6f7] text-red-400 group-hover:bg-red-400 group-hover:text-white'}`}>{isDeleteConfirming ? <Icons.Check /> : <Icons.Trash />}</div>
                    <span className={`text-[10px] ${isDeleteConfirming ? 'text-red-500 font-bold' : 'text-[#917c71]'}`}>{isDeleteConfirming ? 'Confirm?' : 'Delete'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Input Area - Hidden in Archive Mode */}
      {activeMode !== 'archive' && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-[#eae2e8] z-30">
          <div className="flex gap-2 max-w-4xl mx-auto items-end">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeMode === 'sms' ? "Text message..." : "Type a message..."}
              rows={1}
              className="flex-1 bg-[#f9f6f7] border border-[#eae2e8] rounded-3xl px-5 py-3 focus:outline-none focus:border-[#d58f99] text-[#5a4a42] placeholder-[#917c71]/50 shadow-inner resize-none overflow-y-auto min-h-[48px] max-h-[120px]"
            />
            <Button onClick={handleSend} disabled={isTyping && activeMode !== 'sms'} className="w-12 h-12 !px-0 rounded-full flex items-center justify-center shadow-md mb-0">
               <Icons.Send />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
