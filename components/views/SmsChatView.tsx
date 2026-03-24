/**
 * SmsChatView.tsx — SMS 模式（重构版）
 * 
 * SMS 模式特有功能：
 * - 2分钟防打扰 debounce（Luna连续发消息时不会立即回复）
 * - AI 回复按 ||| 拆分成多条气泡（模拟真实短信）
 * - "Send Now" 按钮可以跳过等待立即触发回复
 * 
 * 📦 核心逻辑全部来自 useChatEngine hook
 */

import React, { useState } from 'react';
import { useStore } from '../../store';
import { Icons } from '../ui/Icons';
import { ThemeStudio } from './ThemeStudio';
import { ChatInputArea } from '../chat/ChatInputArea';
import { MessageBubble } from '../chat/MessageBubble';
import { ActionMenuModal } from '../chat/ActionMenuModal';
import { XRayModal } from '../chat/XRayModal';
import { MemoryModal } from '../chat/MemoryModal';
import { useChatEngine } from '../chat/useChatEngine';
import { LlmSelectorPanel } from '../chat/LlmSelectorPanel';

// --- SMS 模式的引擎配置 ---
const SMS_CHAT_CONFIG = {
  mode: 'sms' as const,
  turnSuffix: ' (Reply to the latest texts)',
  getModeRules: (settings: any) => {
    return settings.smsInstructions || `[SMS MODE RULES - STRICT]
- You are texting on a phone. NO actions (*asterisks*), NO narration.
- Write ONLY text messages.
- Keep it SHORT.
- IMPORTANT: You MUST split your reply into MULTIPLE separate text bubbles by using ||| as the separator.`;
  },
  getDialogueExamples: (settings: any) => {
    return settings.smsExampleDialogue || settings.exampleDialogue || '';
  },
  sendDebounceMs: 120000,   // 2分钟防打扰
  splitResponse: true,       // 按 ||| 拆分
  splitDelayMs: 1500,        // 每条间隔1.5秒
};

interface SmsChatViewProps {
  onBack: () => void;
}

export const SmsChatView: React.FC<SmsChatViewProps> = ({ onBack }) => {
  const engine = useChatEngine(SMS_CHAT_CONFIG);
  const { addLlmPreset, updateSettings } = useStore();

  // UI 状态
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
      
      {/* 顶部导航栏 - SMS 风格 */}
      <div className="w-full h-[68px] px-4 bg-wade-bg-card/90 backdrop-blur-md shadow-sm border-b border-wade-border flex items-center justify-between z-20 shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
          <Icons.Back />
        </button>

        <div className="flex-1 flex items-center gap-2 ml-2">
          <div className="relative">
            <img src={engine.settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover border border-wade-border shadow-md flex-shrink-0" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-wade-bg-card rounded-full ${engine.wadeStatus === 'typing' ? 'bg-yellow-400' : 'bg-green-400'}`}></div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="font-bold text-wade-text-main text-sm">Wade 💬</div>
            <div className="text-[9px] text-wade-text-muted">
              {engine.isTyping ? (
                <span className="text-wade-accent">typing...</span>
              ) : engine.waitingForSMS ? (
                <span className="text-yellow-500">composing thoughts...</span>
              ) : (
                <span>iMessage</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => { engine.setShowSearch(!engine.showSearch); setShowMap(false); }} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
            <Icons.Search />
          </button>
          <button onClick={() => setShowMenu(!showMenu)} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
            <Icons.More />
          </button>
        </div>
      </div>

      {/* 下拉菜单 */}
      {showMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => { setShowMenu(false); setShowLlmSelector(false); }} />
          <div className="absolute top-16 right-4 z-50 bg-wade-bg-card/75 backdrop-blur-2xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-wade-border/40 py-2 px-2 min-w-[200px] animate-fade-in">
            <button onClick={() => { if (engine.activeSessionId) engine.toggleSessionPin(engine.activeSessionId); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Pin size={16} /></div>
              <span className="font-medium">{engine.activeSessionId && engine.sessions.find(s => s.id === engine.activeSessionId)?.isPinned ? "Unpin" : "Pin"}</span>
            </button>
            <button onClick={() => setShowLlmSelector(!showLlmSelector)} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Hexagon size={16} /></div>
              <span className="font-medium">Brain Transplant</span>
            </button>
            <button onClick={() => { setShowMemorySelector(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Brain size={16} /></div>
              <span className="font-medium">Memories</span>
            </button>
            <button onClick={() => { setShowPromptEditor(true); setShowMenu(false); setCustomPromptText(engine.sessions.find(s => s.id === engine.activeSessionId)?.customPrompt || ''); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Fire size={16} /></div>
              <span className="font-medium">Spice</span>
            </button>
            <button onClick={() => { setShowDebug(true); setShowMenu(false); }} className="w-full text-left px-4 py-3 rounded-xl hover:bg-wade-bg-app/50 transition-colors text-wade-text-main text-[13px] flex items-center gap-3 whitespace-nowrap">
              <div className="w-5 flex justify-center text-wade-text-muted"><Icons.Bug size={16} /></div>
              <span className="font-medium">X-Ray</span>
            </button>
          </div>
        </>
      )}

      {/* LLM Selector - 跟 Deep 一样 */}
      {showLlmSelector && (
        <LlmSelectorPanel onClose={() => { setShowLlmSelector(false); setShowMenu(false); }} />
      )}

      {/* Search */}
      {engine.showSearch && (
        <div className="px-4 py-2 bg-wade-bg-card/90 backdrop-blur-md border-b border-wade-border flex items-center gap-2 z-10 animate-fade-in">
          <Icons.Search />
          <input autoFocus value={engine.searchQuery} onChange={e => engine.handleSearchChange(e.target.value)} placeholder="Search..." className="flex-1 bg-transparent text-sm text-wade-text-main focus:outline-none placeholder-wade-text-muted/50" />
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

      {/* Modals */}
      <MemoryModal isOpen={showMemorySelector} onClose={() => setShowMemorySelector(false)} />
      <XRayModal isOpen={showDebug} onClose={() => setShowDebug(false)} />
      {isThemeStudioOpen && <ThemeStudio onClose={() => setIsThemeStudioOpen(false)} />}

      {showPromptEditor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" onClick={() => setShowPromptEditor(false)}>
          <div className="bg-wade-bg-base w-[90%] max-w-2xl h-[60vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-wade-accent-light ring-1 ring-wade-border" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md">
              <h3 className="font-bold text-wade-text-main text-sm">Spice It Up</h3>
              <button onClick={() => setShowPromptEditor(false)} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted"><Icons.Close size={16} /></button>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <textarea value={customPromptText} onChange={e => setCustomPromptText(e.target.value)} placeholder="Type your commands here..." className="w-full h-full bg-wade-bg-card border border-wade-border rounded-xl px-4 py-3 focus:outline-none focus:border-wade-accent text-wade-text-main text-xs resize-none font-mono" />
            </div>
            <div className="px-6 py-4 border-t border-wade-border flex justify-center gap-6">
              <button onClick={() => setShowPromptEditor(false)} className="text-xs font-bold text-wade-text-muted px-6 py-2">Cancel</button>
              <button onClick={async () => { if (engine.activeSessionId) await engine.updateSession(engine.activeSessionId, { customPrompt: customPromptText }); setShowPromptEditor(false); }} className="bg-wade-accent text-white text-xs font-bold px-8 py-2 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          消息区域
          ========================================= */}
      <div id="messages-container" className="flex-1 overflow-y-auto p-4 relative custom-scrollbar">
        {engine.displayMessages.length === 0 && (
          <div className="text-center text-wade-text-muted mt-20 opacity-50 font-hand text-xl">Send a text 💬</div>
        )}

        <div className="flex flex-col w-full">
          {engine.displayMessages.map((msg) => {
            const isCurrentSearchResult = engine.searchQuery && engine.totalResults > 0 && engine.searchResults[engine.currentSearchIndex]?.id === msg.id;
            return (
              <div key={msg.id} id={`msg-${msg.id}`} className={isCurrentSearchResult ? 'highlight-search' : ''}>
                <MessageBubble
                  msg={msg} settings={engine.settings} onSelect={engine.setSelectedMsgId} isSMS={true}
                  onPlayTTS={engine.executeTTS} onRegenerateTTS={engine.executeTTS} searchQuery={engine.searchQuery}
                  playingMessageId={engine.playingMessageId} isPaused={engine.isPaused}
                />
              </div>
            );
          })}
        </div>

        {engine.isTyping && (
          <div className="flex justify-start items-end gap-2 mt-2 ml-1 animate-fade-in mb-4">
            <div className="bg-wade-bg-card px-3 py-2 rounded-2xl rounded-tl-none shadow-sm border border-wade-border">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-wade-accent rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-wade-accent rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-wade-accent rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={engine.messagesEndRef} />
      </div>

      {/* SMS 特有：等待中的 "Send Now" 提示条 */}
      {engine.waitingForSMS && (
        <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200 flex items-center justify-between">
          <span className="text-xs text-yellow-700">Wade is waiting for you to finish typing...</span>
          <button onClick={engine.forceSendSMS} className="text-xs font-bold text-wade-accent hover:underline">Send Now →</button>
        </div>
      )}

      {/* 输入框 */}
      <ChatInputArea
        onSend={engine.handleSend}
        onCancel={engine.handleCancel}
        isTyping={engine.isTyping}
        activeMode="sms"
        placeholderText="Text me, babe..."
      />

      {/* 长按操作抽屉 */}
      {engine.selectedMsg && (
        <ActionMenuModal
          selectedMsg={engine.selectedMsg} activeMode="sms"
          playingMessageId={engine.playingMessageId} isPaused={engine.isPaused}
          onClose={() => engine.setSelectedMsgId(null)}
          onCopy={() => { navigator.clipboard.writeText(engine.selectedMsg!.text); engine.setSelectedMsgId(null); }}
          onSelectText={() => { navigator.clipboard.writeText(engine.selectedMsg!.text); alert("Copied!"); engine.setSelectedMsgId(null); }}
          onRegenerate={() => { if (engine.activeSessionId) engine.triggerAIResponse(engine.activeSessionId, engine.selectedMsg!.id); engine.setSelectedMsgId(null); }}
          onBranch={async () => {}}
          onEdit={() => { const t = prompt("Edit:", engine.selectedMsg!.text); if (t) engine.updateMessage(engine.selectedMsg!.id, t); engine.setSelectedMsgId(null); }}
          onPlayTTS={() => engine.executeTTS(engine.selectedMsg!.text, engine.selectedMsg!.id)}
          onRegenerateTTS={() => engine.executeTTS(engine.selectedMsg!.text, engine.selectedMsg!.id)}
          onFavorite={() => { engine.toggleFavorite(engine.selectedMsg!.id); engine.setSelectedMsgId(null); }}
          onDelete={() => { engine.deleteMessage(engine.selectedMsg!.id); engine.setSelectedMsgId(null); }}
          onPrevVariant={() => engine.selectMessageVariant(engine.selectedMsg!.id, (engine.selectedMsg!.selectedIndex || 0) - 1)}
          onNextVariant={() => engine.selectMessageVariant(engine.selectedMsg!.id, (engine.selectedMsg!.selectedIndex || 0) + 1)}
          canRegenerate={engine.selectedMsg.role === 'Wade' && !!engine.isLatestMessage}
          canBranch={false}
        />
      )}
    </div>
  );
};
