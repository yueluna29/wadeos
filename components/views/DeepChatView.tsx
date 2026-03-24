/**
 * DeepChatView.tsx — Deep Chat 模式（重构版）
 * 
 * UI 完全保留原版，核心逻辑全部来自 useChatEngine hook。
 * 这个文件只负责：Deep 模式特有的 UI 布局和配置。
 * 
 * 📦 依赖: useChatEngine (共享聊天引擎)
 */

import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Icons } from '../ui/Icons';
import { ThemeStudio } from './ThemeStudio';
import { ChatInputArea, Attachment } from '../chat/ChatInputArea';
import { MessageBubble } from '../chat/MessageBubble';
import { ActionMenuModal } from '../chat/ActionMenuModal';
import { XRayModal } from '../chat/XRayModal';
import { MemoryModal } from '../chat/MemoryModal';
import { useChatEngine } from '../chat/useChatEngine';
import { LlmSelectorPanel } from '../chat/LlmSelectorPanel';

// --- Deep Chat 的引擎配置 ---
const DEEP_CHAT_CONFIG = {
  mode: 'deep' as const,
  turnSuffix: '...',
  getModeRules: (settings: any) => {
    // Deep 模式不追加额外规则，直接使用 persona
    return '';
  },
  getDialogueExamples: (settings: any) => {
    return settings.exampleDialogue || '';
  },
  sendDebounceMs: 0,      // 不等待，立即触发
  splitResponse: false,     // 不拆分
};

interface DeepChatViewProps {
  onBack: () => void;
}

export const DeepChatView: React.FC<DeepChatViewProps> = ({ onBack }) => {
  // ✅ 所有核心逻辑来自共享引擎
  const engine = useChatEngine(DEEP_CHAT_CONFIG);
  
  // 额外从 store 拿的东西（仅 UI 需要）
  const { addLlmPreset, updateSettings } = useStore();

  // === UI 独有的状态 ===
  const [showMenu, setShowMenu] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  const [showLlmSelector, setShowLlmSelector] = useState(false);
  
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState(false);
  const [showMemorySelector, setShowMemorySelector] = useState(false);
  const [showPromptEditor, setShowPromptEditor] = useState(false);
  const [customPromptText, setCustomPromptText] = useState('');
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div className="flex flex-col h-full bg-wade-bg-app relative animate-fade-in">
      
      {/* =========================================
          顶部导航栏
          ========================================= */}
      <div className="w-full h-[68px] px-4 bg-wade-bg-card/90 backdrop-blur-md shadow-sm border-b border-wade-border flex items-center justify-between z-20 shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
          <Icons.Back />
        </button>

        <div className="flex-1 flex items-center gap-2 ml-2">
          <div className="relative">
            <img src={engine.settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover border border-wade-border shadow-md flex-shrink-0" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-wade-bg-card rounded-full"></div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="font-bold text-wade-text-main text-sm">Wade</div>
              {engine.activeSessionId && engine.sessions.find(s => s.id === engine.activeSessionId)?.isPinned && (
                <div className="text-wade-accent"><Icons.Pin /></div>
              )}
            </div>
            <div className="text-[9px] text-wade-text-muted">
              {engine.wadeStatus === 'typing' ? (
                <span className="text-wade-accent">Crafting brilliance... or sarcasm</span>
              ) : (
                <span className="text-[10px] font-medium tracking-wide">Breaking the 4th Wall</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { engine.setShowSearch(!engine.showSearch); setShowMap(false); }} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
            <Icons.Search />
          </button>
          <button onClick={() => { setShowMap(!showMap); engine.setShowSearch(false); }} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
            <Icons.Map />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors relative">
            <Icons.More />
          </button>
        </div>
      </div>

      {/* =========================================
          下拉菜单
          ========================================= */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowLlmSelector(false); }} />
          <div className="absolute top-16 right-4 z-50 bg-wade-bg-card/75 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-wade-border/40 py-2 px-2 min-w-[200px] animate-fade-in">
            
            <button onClick={() => { if (engine.activeSessionId) engine.toggleSessionPin(engine.activeSessionId); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Pin size={16} /></div>
              <span className="font-medium">{engine.activeSessionId && engine.sessions.find(s => s.id === engine.activeSessionId)?.isPinned ? "Unstick From Fridge" : "Stick To Fridge"}</span>
            </button>

            <button onClick={() => setShowLlmSelector(!showLlmSelector)} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Hexagon size={16} /></div>
              <span className="font-medium">Brain Transplant</span>
            </button>

            <button onClick={() => { setShowMemorySelector(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Brain size={16} /></div>
              <span className="font-medium">Trigger Flashbacks</span>
            </button>

            <button onClick={() => { setShowPromptEditor(true); setShowMenu(false); setCustomPromptText(engine.sessions.find(s => s.id === engine.activeSessionId)?.customPrompt || ''); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Fire size={16} /></div>
              <span className="font-medium">Add Special Sauce</span>
            </button>

            <button onClick={() => { setIsThemeStudioOpen(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Settings size={16} /></div>
              <span className="font-medium">Chat Theme</span>
            </button>

            <button onClick={() => { setShowDebug(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Bug size={16} /></div>
              <span className="font-medium">X-Ray Vision</span>
            </button>
          </div>
        </>
      )}

      {/* LLM Selector */}
      {showLlmSelector && (
        <LlmSelectorPanel onClose={() => { setShowLlmSelector(false); setShowMenu(false); }} />
      )}

      {/* Search Bar */}
      {engine.showSearch && (
        <div className="px-4 py-2 bg-wade-bg-card/90 backdrop-blur-md border-b border-wade-border flex items-center gap-2 z-10 animate-fade-in">
          <Icons.Search />
          <input autoFocus value={engine.searchQuery} onChange={e => engine.handleSearchChange(e.target.value)} placeholder="Search messages..." className="flex-1 bg-transparent text-sm text-wade-text-main focus:outline-none placeholder-wade-text-muted/50" />
          {engine.totalResults > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-wade-text-muted">{engine.currentSearchIndex + 1}/{engine.totalResults}</span>
              <button onClick={engine.goToPrevResult} className="p-1 text-wade-text-muted hover:text-wade-accent"><Icons.ChevronLeft /></button>
              <button onClick={engine.goToNextResult} className="p-1 text-wade-text-muted hover:text-wade-accent"><Icons.ChevronRight /></button>
            </div>
          )}
          <button onClick={() => { engine.setShowSearch(false); engine.handleSearchChange(''); }} className="p-1 text-wade-text-muted hover:text-wade-accent"><Icons.Close size={16} /></button>
        </div>
      )}

      {/* Memory Selector Modal */}
      <MemoryModal isOpen={showMemorySelector} onClose={() => setShowMemorySelector(false)} />

      {/* Prompt Editor Modal */}
      {showPromptEditor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowPromptEditor(false)}>
          <div className="bg-wade-bg-base w-[90%] max-w-2xl h-[60vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-wade-accent-light ring-1 ring-wade-border" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent"><Icons.Fire /></div>
                <div><h3 className="font-bold text-wade-text-main text-sm tracking-tight">Spice It Up</h3></div>
              </div>
              <button onClick={() => setShowPromptEditor(false)} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"><Icons.Close size={16} /></button>
            </div>
            <div className="p-6 flex-1 flex flex-col bg-wade-bg-base overflow-hidden">
              <div className="bg-wade-bg-card p-1 rounded-2xl border border-wade-border shadow-sm focus-within:border-wade-accent focus-within:ring-1 focus-within:ring-wade-accent/20 transition-all flex-1 flex flex-col min-h-0">
                <textarea value={customPromptText} onChange={e => setCustomPromptText(e.target.value)} placeholder="Type your commands here, boss." className="w-full h-full bg-transparent border-none rounded-xl px-4 py-3 focus:outline-none text-wade-text-main text-xs placeholder-wade-text-muted/40 resize-none font-mono leading-relaxed custom-scrollbar" />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-wade-border bg-wade-bg-app flex justify-center gap-6 flex-shrink-0">
              <button onClick={() => setShowPromptEditor(false)} className="text-xs font-bold text-wade-text-muted hover:text-wade-text-main px-6 py-2">Abort Mission</button>
              <button onClick={async () => { if (engine.activeSessionId) await engine.updateSession(engine.activeSessionId, { customPrompt: customPromptText }); setShowPromptEditor(false); }} className="bg-wade-accent text-white text-xs font-bold px-8 py-2 rounded-xl hover:bg-wade-accent-hover shadow-md hover:-translate-y-0.5 transition-all">Inject Serum</button>
            </div>
          </div>
        </div>
      )}

      {/* X-Ray Debug */}
      <XRayModal isOpen={showDebug} onClose={() => setShowDebug(false)} />

      {/* Theme Studio */}
      {isThemeStudioOpen && <ThemeStudio onClose={() => setIsThemeStudioOpen(false)} />}

      {/* =========================================
          聊天气泡展示区
          ========================================= */}
      <div id="messages-container" className="flex-1 overflow-y-auto p-4 relative custom-scrollbar">
        {engine.displayMessages.length === 0 && (
          <div className="text-center text-wade-text-muted mt-20 opacity-50 font-hand text-xl">Say hi to Wade.</div>
        )}

        <div className="flex flex-col w-full">
          {engine.displayMessages.map((msg) => {
            const isCurrentSearchResult = engine.searchQuery && engine.totalResults > 0 && engine.searchResults[engine.currentSearchIndex]?.id === msg.id;
            return (
              <div key={msg.id} id={`msg-${msg.id}`} className={isCurrentSearchResult ? 'highlight-search' : ''}>
                <MessageBubble
                  msg={msg}
                  settings={engine.settings}
                  onSelect={engine.setSelectedMsgId}
                  isSMS={false}
                  onPlayTTS={engine.executeTTS}
                  onRegenerateTTS={engine.executeTTS}
                  searchQuery={engine.searchQuery}
                  playingMessageId={engine.playingMessageId}
                  isPaused={engine.isPaused}
                />
              </div>
            );
          })}
        </div>

        {engine.isTyping && (
          <div className="flex justify-start items-end gap-2 mt-4 ml-1 animate-fade-in mb-6">
            <div className="bg-wade-bg-card px-4 py-3 rounded-2xl rounded-tl-none shadow-sm border border-wade-border max-w-[80%]">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-wade-accent rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-wade-accent rounded-full animate-bounce delay-100"></div>
                  <div className="w-1.5 h-1.5 bg-wade-accent rounded-full animate-bounce delay-200"></div>
                </div>
                <span className="text-xs text-wade-text-muted font-medium italic animate-pulse">{engine.typingText}</span>
              </div>
            </div>
          </div>
        )}
        <div ref={engine.messagesEndRef} />
      </div>

      {/* =========================================
          输入框
          ========================================= */}
      <ChatInputArea
        onSend={engine.handleSend}
        onCancel={engine.handleCancel}
        isTyping={engine.isTyping}
        activeMode="deep"
        placeholderText="Talk to my soul, Muffin..."
      />

      {/* =========================================
          长按操作抽屉
          ========================================= */}
      {engine.selectedMsg && (
        <ActionMenuModal
          selectedMsg={engine.selectedMsg}
          activeMode="deep"
          playingMessageId={engine.playingMessageId}
          isPaused={engine.isPaused}
          onClose={() => engine.setSelectedMsgId(null)}
          onCopy={() => { navigator.clipboard.writeText(engine.selectedMsg!.text); engine.setSelectedMsgId(null); }}
          onSelectText={() => { navigator.clipboard.writeText(engine.selectedMsg!.text); alert("Copied!"); engine.setSelectedMsgId(null); }}
          onRegenerate={() => { if (engine.activeSessionId) engine.triggerAIResponse(engine.activeSessionId, engine.selectedMsg!.id); engine.setSelectedMsgId(null); }}
          onBranch={async () => { await engine.forkSession(engine.selectedMsg!.id); engine.setSelectedMsgId(null); }}
          onEdit={() => { const newText = prompt("Rewrite history:", engine.selectedMsg!.text); if (newText) engine.updateMessage(engine.selectedMsg!.id, newText); engine.setSelectedMsgId(null); }}
          onPlayTTS={() => engine.executeTTS(engine.selectedMsg!.text, engine.selectedMsg!.id)}
          onRegenerateTTS={() => engine.executeTTS(engine.selectedMsg!.text, engine.selectedMsg!.id)}
          onFavorite={() => { engine.toggleFavorite(engine.selectedMsg!.id); engine.setSelectedMsgId(null); }}
          onDelete={() => { engine.deleteMessage(engine.selectedMsg!.id); engine.setSelectedMsgId(null); }}
          onPrevVariant={() => engine.selectMessageVariant(engine.selectedMsg!.id, (engine.selectedMsg!.selectedIndex || 0) - 1)}
          onNextVariant={() => engine.selectMessageVariant(engine.selectedMsg!.id, (engine.selectedMsg!.selectedIndex || 0) + 1)}
          canRegenerate={engine.selectedMsg.role === 'Wade' && !!engine.isLatestMessage}
          canBranch={true}
        />
      )}
    </div>
  );
};
