/**
 * useChatEngine.ts — 聊天引擎核心 Hook
 * 
 * 三个聊天模式（Deep/SMS/Roleplay）共享的所有逻辑都在这里。
 * 每个 View 只需要传入 mode 和少量配置，剩下的全部由这个 hook 搞定。
 * 
 * 🔧 管理: 会话创建、消息发送、AI响应、重新生成、TTS、搜索、取消
 * 🗄️ Supabase: 通过 store 的 createSession / addMessage 正确同步
 * 📦 依赖: store (全局状态), geminiService (AI调用)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../../store';
import { generateTextResponse } from '../../services/geminiService';
import { Message, ChatMode } from '../../types';
import { supabase } from '../../services/supabase';

// ==========================================
// 类型定义
// ==========================================

export interface Attachment {
  type: 'image' | 'file';
  content: string;
  mimeType: string;
  name: string;
}

export interface ChatEngineConfig {
  mode: ChatMode;
  
  /** AI 调用时附加在 turnPrompt 上的文字 */
  turnSuffix?: string;
  
  /** 在 persona 后面追加的模式专属规则 */
  getModeRules: (settings: any) => string;
  
  /** 获取该模式使用的对话示例 */
  getDialogueExamples: (settings: any) => string;
  
  /** SMS 模式特有：发送后等待N毫秒再触发AI回复（防打扰），0表示不等待 */
  sendDebounceMs?: number;
  
  /** SMS 模式特有：AI回复是否需要按 ||| 拆分成多条消息 */
  splitResponse?: boolean;
  
  /** 拆分后每条消息之间的延迟（毫秒） */
  splitDelayMs?: number;
}

// ==========================================
// 打字提示词
// ==========================================

const TYPING_INDICATORS = [
  "Typing with maximum effort...",
  "Consulting the chimichanga gods...",
  "Breaking the fourth wall...",
  "Writing something inappropriate...",
  "Deleting the bad words...",
  "Making it sound smarter...",
  "Rethinking my life choices...",
  "Summoning the plot armor..."
];

// ==========================================
// Hook 本体
// ==========================================

export function useChatEngine(config: ChatEngineConfig) {
  const {
    messages, addMessage, deleteMessage, updateMessage, updateMessageAudioCache,
    settings, activeSessionId, setActiveSessionId, sessions, updateSession,
    llmPresets, coreMemories, toggleFavorite, setRegenerating,
    addVariantToMessage, selectMessageVariant, forkSession,
    createSession, toggleSessionPin
  } = useStore();

  // --- 状态 ---
  const [sessionSummary, setSessionSummary] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [waitingForSMS, setWaitingForSMS] = useState(false);
  const [wadeStatus, setWadeStatus] = useState<'online' | 'typing'>('online');
  const [typingText, setTypingText] = useState(TYPING_INDICATORS[0]);

  // 搜索
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

  // 长按菜单
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const smsDebounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- 派生数据 ---
  const displayMessages = messages
    .filter(m => m.sessionId === activeSessionId)
    .sort((a, b) => a.timestamp - b.timestamp);

  const selectedMsg = displayMessages.find(m => m.id === selectedMsgId) || null;
  const isLatestMessage = selectedMsg
    ? displayMessages[displayMessages.length - 1]?.id === selectedMsg.id
    : false;

  // --- Effects ---

  // 打字提示词循环
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTyping) {
      setTypingText(TYPING_INDICATORS[Math.floor(Math.random() * TYPING_INDICATORS.length)]);
      interval = setInterval(() => {
        setTypingText(TYPING_INDICATORS[Math.floor(Math.random() * TYPING_INDICATORS.length)]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages.length, isTyping]);

  // 加载 Session Summary
  useEffect(() => {
    const loadSummary = async () => {
      setSessionSummary("");
      if (!activeSessionId) return;
      try {
        const { data } = await supabase
          .from('session_summaries')
          .select('summary')
          .eq('session_id', activeSessionId)
          .single();
        if (data?.summary) setSessionSummary(data.summary);
      } catch (err) {
        console.error("Summary load error:", err);
      }
    };
    loadSummary();
  }, [activeSessionId]);

  // --- 搜索功能 ---
  const searchResults = searchQuery
    ? displayMessages.filter(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const totalResults = searchResults.length;

  const scrollToMessage = useCallback((messageId: string) => {
    const element = document.getElementById(`msg-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-flash');
      setTimeout(() => element.classList.remove('highlight-flash'), 2000);
    }
  }, []);

  const goToNextResult = useCallback(() => {
    if (totalResults > 0) {
      const nextIndex = (currentSearchIndex + 1) % totalResults;
      setCurrentSearchIndex(nextIndex);
      scrollToMessage(searchResults[nextIndex].id);
    }
  }, [totalResults, currentSearchIndex, searchResults, scrollToMessage]);

  const goToPrevResult = useCallback(() => {
    if (totalResults > 0) {
      const prevIndex = currentSearchIndex === 0 ? totalResults - 1 : currentSearchIndex - 1;
      setCurrentSearchIndex(prevIndex);
      scrollToMessage(searchResults[prevIndex].id);
    }
  }, [totalResults, currentSearchIndex, searchResults, scrollToMessage]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentSearchIndex(0);
  }, []);

  // --- 核心：获取当前生效的 LLM ---
  const getActiveLlm = useCallback(() => {
    const currentSession = sessions.find(s => s.id === activeSessionId);
    const effectiveLlmId = currentSession?.customLlmId || settings.activeLlmId;
    return effectiveLlmId ? llmPresets.find(p => p.id === effectiveLlmId) : null;
  }, [sessions, activeSessionId, settings.activeLlmId, llmPresets]);

  // --- 核心：获取当前 session 的活跃记忆 ---
  const getActiveMemories = useCallback(() => {
    const currentSession = sessions.find(s => s.id === activeSessionId);
    const safeMemories = Array.isArray(coreMemories) ? coreMemories : [];
    return currentSession?.activeMemoryIds
      ? safeMemories.filter(m => currentSession.activeMemoryIds!.includes(m.id))
      : safeMemories.filter(m => m.enabled);
  }, [sessions, activeSessionId, coreMemories]);

  // --- 核心：AI 响应触发 ---
  const triggerAIResponse = useCallback(async (
    targetSessionId: string,
    regenMsgId?: string,
    pendingMessage?: Message
  ) => {
    abortControllerRef.current = new AbortController();
    if (regenMsgId) {
      setRegenerating(regenMsgId, true);
    }
    setIsTyping(true);
    setWadeStatus('typing');
    if (config.mode === 'sms') setWaitingForSMS(false);

    try {
      // 1. 获取历史消息
      let historyMsgs = messages
        .filter(m => m.sessionId === targetSessionId)
        .slice(-(settings.contextLimit || 50));

      // 如果有刚发的新消息还没进入state，手动塞进去
      if (pendingMessage && !historyMsgs.find(m => m.id === pendingMessage.id)) {
        historyMsgs = [...historyMsgs, pendingMessage];
      }
      const history = historyMsgs.map(m => ({ role: m.role, parts: [{ text: m.text }] }));

      // 2. 构建 prompt
      let modePrompt = settings.wadePersonality || '';
      if (sessionSummary) {
        modePrompt = `[PREVIOUS SUMMARY]\n${sessionSummary}\n[END SUMMARY]\n\n${modePrompt}`;
      }
      
      // 追加模式专属规则
      const modeRules = config.getModeRules(settings);
      if (modeRules) modePrompt += `\n\n${modeRules}`;

      // 3. 获取 LLM 和 Memories
      const currentSession = sessions.find(s => s.id === targetSessionId);
      const effectiveLlmId = currentSession?.customLlmId || settings.activeLlmId;
      const activeLlm = effectiveLlmId ? llmPresets.find(p => p.id === effectiveLlmId) : null;
      
      if (!activeLlm?.apiKey) {
        throw new Error("API Key missing! Go to Settings > Brain Transplant to add one.");
      }

      const sessionMemories = getActiveMemories();
      const dialogueExamples = config.getDialogueExamples(settings);

      // 4. 调用 AI
      const response = await generateTextResponse(
        activeLlm.model,
        config.turnSuffix || "...",
        history,
        settings.systemInstruction || '',
        modePrompt,
        settings.lunaInfo || '',
        settings.wadeSingleExamples || '',
        dialogueExamples,
        '', '', '', // 保留参数位
        sessionMemories,
        !!regenMsgId,
        config.mode,
        activeLlm.apiKey,
        undefined,
        currentSession?.customPrompt,
        activeLlm.baseUrl
      );

      // 5. 处理响应
      if (regenMsgId) {
        // 重新生成：添加为变体
        addVariantToMessage(regenMsgId, response.text, response.thinking, activeLlm.model);
        setRegenerating(regenMsgId, false);
      } else if (config.splitResponse) {
        // SMS 模式：拆分成多条消息
        let parts = response.text.split('|||').map(s => s.trim()).filter(s => s);
        if (parts.length === 1 && response.text.includes('\n')) {
          const lines = response.text.split('\n').map(s => s.trim()).filter(s => s);
          if (lines.length > 1) parts = lines;
        }
        if (parts.length === 0) parts = ["..."];

        const delay = config.splitDelayMs || 1500;
        for (let i = 0; i < parts.length; i++) {
          setTimeout(() => {
            addMessage({
              id: crypto.randomUUID(),
              sessionId: targetSessionId,
              role: 'Wade',
              text: parts[i],
              model: activeLlm.model,
              timestamp: Date.now(),
              mode: config.mode,
              variantsThinking: i === 0 && response.thinking ? [response.thinking] : [null]
            });
            if (i === parts.length - 1) {
              setIsTyping(false);
              setWadeStatus('online');
            }
          }, i * delay);
        }
        return; // 提前返回，不走 finally 里的 setIsTyping(false)
      } else {
        // Deep/Roleplay：单条消息
        addMessage({
          id: crypto.randomUUID(),
          sessionId: targetSessionId,
          role: 'Wade',
          text: response.text,
          model: activeLlm.model,
          timestamp: Date.now(),
          mode: config.mode,
          thinking: response.thinking,
          variants: [response.text],
          variantsThinking: [response.thinking || null],
          selectedIndex: 0
        });
      }
    } catch (err: any) {
      console.error(`[${config.mode}] AI Response Error:`, err);
      // 如果有错误，发一条错误消息让用户知道
      if (!regenMsgId) {
        addMessage({
          id: crypto.randomUUID(),
          sessionId: targetSessionId,
          role: 'Wade',
          text: `⚠️ Oops: ${err.message || 'Something went wrong.'}`,
          timestamp: Date.now(),
          mode: config.mode
        });
      }
      if (regenMsgId) setRegenerating(regenMsgId, false);
    } finally {
      // SMS 模式的分条发送已经自己管 isTyping 了
      if (!config.splitResponse) {
        setIsTyping(false);
        setWadeStatus('online');
      }
      abortControllerRef.current = null;
    }
  }, [
    messages, settings, sessions, llmPresets, sessionSummary,
    config, getActiveMemories, addMessage, addVariantToMessage, setRegenerating
  ]);

  // --- 核心：发送消息 ---
  const handleSend = useCallback(async (text: string, attachments: Attachment[]) => {
    let targetSessionId = activeSessionId;

    // 没有 session？正确地通过 store.createSession 创建（写入 Supabase）
    if (!targetSessionId) {
      try {
        targetSessionId = await createSession(config.mode);
        setActiveSessionId(targetSessionId);
      } catch (err) {
        console.error("Failed to create session:", err);
        alert("Failed to create chat session. Check your connection.");
        return;
      }
    }

    // 构建消息对象
    const newMessage: Message = {
      id: crypto.randomUUID(),
      sessionId: targetSessionId,
      role: 'Luna',
      text: text,
      timestamp: Date.now(),
      mode: config.mode,
      attachments: attachments.length > 0
        ? attachments.map(a => ({
            type: a.type,
            content: a.content.split(',')[1],
            mimeType: a.mimeType,
            name: a.name
          }))
        : undefined,
      image: attachments.find(a => a.type === 'image')?.content.split(',')[1]
    };

    addMessage(newMessage);

    // 根据模式决定何时触发 AI 响应
    if (config.sendDebounceMs && config.sendDebounceMs > 0) {
      // SMS 模式：等 N 毫秒后才触发 AI（可被新消息重置）
      setWaitingForSMS(true);
      if (smsDebounceTimer.current) clearTimeout(smsDebounceTimer.current);
      smsDebounceTimer.current = setTimeout(() => {
        triggerAIResponse(targetSessionId!, undefined, newMessage);
      }, config.sendDebounceMs);
    } else {
      // Deep / Roleplay：立即触发（带 1.5 秒假装在打字的延迟）
      setIsTyping(true);
      setWadeStatus('typing');
      setTimeout(() => {
        triggerAIResponse(targetSessionId!, undefined, newMessage);
      }, 1500);
    }
  }, [activeSessionId, createSession, setActiveSessionId, addMessage, config, triggerAIResponse]);

  // --- 取消 ---
  const handleCancel = useCallback(() => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (smsDebounceTimer.current) clearTimeout(smsDebounceTimer.current);
    setIsTyping(false);
    setWaitingForSMS(false);
    setWadeStatus('online');
  }, []);

  // --- TTS（占位，保留接口） ---
  const executeTTS = useCallback(async (text: string, msgId: string) => {
    // TODO: 接入真正的 TTS 服务
    alert(`TTS Triggered! (${config.mode} mode)`);
  }, [config.mode]);

  // --- 立即触发 SMS 回复（手动发送按钮） ---
  const forceSendSMS = useCallback(() => {
    if (smsDebounceTimer.current) clearTimeout(smsDebounceTimer.current);
    if (activeSessionId) {
      triggerAIResponse(activeSessionId);
    }
    setWaitingForSMS(false);
  }, [activeSessionId, triggerAIResponse]);

  // --- 返回给 View 使用的所有状态和函数 ---
  return {
    // 状态
    displayMessages,
    isTyping,
    waitingForSMS,
    wadeStatus,
    typingText,
    sessionSummary,

    // 搜索
    showSearch, setShowSearch,
    searchQuery, handleSearchChange,
    searchResults, totalResults,
    currentSearchIndex, goToNextResult, goToPrevResult,
    scrollToMessage,

    // 长按菜单
    selectedMsgId, setSelectedMsgId,
    selectedMsg,
    isLatestMessage,
    playingMessageId, setPlayingMessageId,
    isPaused, setIsPaused,

    // 核心操作
    handleSend,
    handleCancel,
    triggerAIResponse,
    executeTTS,
    forceSendSMS,

    // Store 透传（View 层需要用的）
    messages, settings, sessions,
    activeSessionId, setActiveSessionId,
    llmPresets, coreMemories,
    updateSession, updateMessage,
    deleteMessage, toggleFavorite,
    selectMessageVariant, forkSession,
    toggleSessionPin, addVariantToMessage,
    setRegenerating, getActiveLlm,

    // Refs
    messagesEndRef,
  };
}
