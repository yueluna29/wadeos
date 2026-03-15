import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { Icons } from '../ui/Icons';

// ==========================================
// 参谋的通用长按魔法 (Long Press Hook)
// ==========================================
export const useLongPress = (callback: () => void, ms = 500) => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) {
      startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    timerRef.current = setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      callback();
    }, ms);
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startPos.current = null;
  };

  const move = (e: React.TouchEvent) => {
    if (startPos.current) {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      if (Math.abs(x - startPos.current.x) > 10 || Math.abs(y - startPos.current.y) > 10) {
        stop();
      }
    }
  };

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchMove: move,
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      callback();
      stop();
    }
  };
};

// ==========================================
// 核心气泡组件
// ==========================================
interface MessageBubbleProps {
  msg: Message;
  settings: any;
  onSelect: (id: string) => void;
  isSMS: boolean;
  onPlayTTS: (text: string, messageId: string) => void;
  onRegenerateTTS: (text: string, messageId: string) => void;
  searchQuery?: string;
  playingMessageId: string | null;
  isPaused: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  msg, settings, onSelect, isSMS, onPlayTTS, onRegenerateTTS, searchQuery, playingMessageId, isPaused
}) => {
  const isLuna = msg.role === 'Luna';
  const [showThought, setShowThought] = useState(false);

  // 时间格式化小工具
  const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString([], { month: 'short', day: 'numeric' });

  // 绑定长按事件
  const longPressHandlers = useLongPress(() => onSelect(msg.id));

  const thinkingContent = msg.variantsThinking?.[msg.selectedIndex || 0] || msg.thinking;
  const isBase64Image = msg.text.startsWith('data:image/');
  const displayContent = msg.text.replace(/\|\|\|/g, '\n\n');

  // 渲染附件
  const renderAttachments = () => {
    const attachments = msg.attachments || [];
    if (attachments.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {attachments.map((att, i) => (
          att.type === 'image' ? (
             <img key={i} src={`data:${att.mimeType};base64,${att.content}`} className="max-w-full rounded-lg max-h-[200px] object-cover border border-wade-border/50" alt="attachment" />
          ) : (
             <div key={i} className="flex items-center gap-2 p-2 bg-wade-bg-app rounded-lg border border-wade-border shadow-sm">
               <Icons.File />
               <span className="text-xs truncate max-w-[150px] text-wade-text-main">{att.name}</span>
             </div>
          )
        ))}
      </div>
    );
  };

  // 高亮搜索词的 Markdown 渲染器
  const MarkdownWithHighlight = ({ content, query }: { content: string, query?: string }) => {
    const components = useMemo(() => {
      if (!query || !query.trim()) return {};
      return {
        p: ({ children, ...props }: any) => {
          const highlightText = (node: any): any => {
            if (typeof node === 'string') {
              const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
              return node.split(regex).map((part: string, i: number) =>
                part.toLowerCase() === query.toLowerCase()
                  ? <mark key={i} className="bg-wade-accent/30 rounded px-1">{part}</mark>
                  : part
              );
            }
            if (Array.isArray(node)) return node.map((child, i) => <React.Fragment key={i}>{highlightText(child)}</React.Fragment>);
            return node;
          };
          return <p {...props}>{highlightText(children)}</p>;
        }
      };
    }, [query]);

    return <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{content}</ReactMarkdown>;
  };

  // -------------------------
  // 状态 1: 重新生成中的动画
  // -------------------------
  if (msg.isRegenerating) {
    return (
      <div className={`flex flex-col mb-4 group ${isLuna ? 'items-end' : 'items-start'} animate-pulse`}>
        {!isSMS && !isLuna && (
          <div className="flex items-start gap-3 mb-0 ml-1 select-none">
            <img src={settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover border border-wade-border" alt="Wade" />
            <div className="flex flex-col mt-0.5">
              <span className="font-bold text-wade-text-main text-sm leading-tight">Wade</span>
              <span className="text-[10px] text-wade-text-muted">Rewriting history...</span>
            </div>
          </div>
        )}
        <div className={`mt-2 px-4 py-2 rounded-2xl ${isSMS ? 'bg-wade-bg-card text-wade-text-main border border-wade-border rounded-bl-none shadow-sm ml-0' : 'bg-wade-bg-card border border-wade-border rounded-tl-none shadow-sm'} flex items-center gap-3`}>
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 bg-wade-accent rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-wade-accent rounded-full animate-bounce delay-75"></div>
            <div className="w-1.5 h-1.5 bg-wade-accent rounded-full animate-bounce delay-150"></div>
          </div>
          <span className="text-xs text-wade-accent font-bold italic animate-pulse">Wait for it...</span>
        </div>
      </div>
    );
  }

  // -------------------------
  // 状态 2: SMS 短信模式排版
  // -------------------------
  if (isSMS) {
    const bubbleClasses = isLuna
      ? "bg-wade-accent text-white rounded-2xl rounded-br-none shadow-sm"
      : "bg-wade-bg-card text-wade-text-main border border-wade-border rounded-2xl rounded-bl-none shadow-sm";

    return (
      <div className={`flex flex-col group ${isLuna ? 'items-end' : 'items-start'} relative`}>
        <div className={`relative max-w-[85%] ${isLuna ? 'flex flex-row-reverse' : 'flex'} gap-2 items-end`}>
          <div
            {...longPressHandlers}
            style={{ WebkitTouchCallout: 'none' }}
            className={`px-4 py-2 relative ${bubbleClasses} min-w-[60px] cursor-pointer select-none`}
          >
            {thinkingContent && (
              <div className="absolute -top-3 right-0">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowThought(!showThought); }}
                  className="bg-wade-bg-app border border-wade-border rounded-full p-1 shadow-sm text-wade-accent hover:scale-110 transition-transform"
                >
                  <Icons.Brain />
                </button>
              </div>
            )}

            {thinkingContent && showThought && (
              <div className="mb-2 p-2 bg-wade-accent-light rounded-lg border border-wade-accent/20 text-[10px] text-wade-text-muted leading-relaxed markdown-thinking">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkingContent}</ReactMarkdown>
              </div>
            )}

            {renderAttachments()}
            {isBase64Image ? (
              <img src={msg.text} alt="Generated image" className="max-w-full rounded-lg" style={{ maxHeight: '400px', width: 'auto' }} />
            ) : (
              <div className={`text-[13px] leading-snug break-words markdown-content ${isLuna ? 'text-white' : 'text-wade-text-main'}`}>
                <MarkdownWithHighlight content={displayContent} query={searchQuery} />
              </div>
            )}
          </div>
          <span className="text-[9px] text-wade-text-muted/50 mb-1 whitespace-nowrap shrink-0 select-none">
            {formatTime(msg.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  // -------------------------
  // 状态 3: Deep / Roleplay / Archive 通用排版
  // -------------------------
  if (!isLuna) {
    return (
      <div className="flex flex-col items-start w-full group animate-fade-in pr-2">
        <div className="flex items-start gap-2 mb-0 ml-1 select-none w-full">
          <img src={settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover border border-wade-border shadow-sm" alt="Wade" />
          <div className="flex flex-col mt-0.5 flex-1">
            <span className="font-bold text-wade-text-main text-sm leading-tight">Wade</span>
            <div className="flex items-center justify-between w-full mt-0.5 pr-1">
              <div className="flex items-center gap-2 text-[10px] text-wade-text-muted">
                <span className="tracking-wide">{formatDate(msg.timestamp)}</span>
                <span className="opacity-70">{formatTime(msg.timestamp)}</span>
                
                {/* 语音小喇叭 */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onPlayTTS(msg.text, msg.id); }}
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                      playingMessageId === msg.id
                        ? isPaused
                          ? 'bg-wade-accent text-white scale-110 shadow-md'
                          : 'bg-wade-accent text-white shadow-lg animate-pulse'
                        : 'text-wade-accent hover:bg-wade-accent-light hover:scale-110'
                    }`}
                  >
                    {playingMessageId === msg.id && !isPaused ? <Icons.Pause /> : <Icons.Wave />}
                  </button>
                  {msg.audioCache && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRegenerateTTS(msg.text, msg.id); }}
                      className="w-5 h-5 rounded-full flex items-center justify-center text-wade-text-muted hover:bg-wade-accent-light hover:text-wade-accent hover:scale-110 transition-all duration-200"
                    >
                      <Icons.RotateThin size={14} />
                    </button>
                  )}
                </div>
              </div>
              {msg.model && (
                <span className="text-[9px] text-wade-text-muted/40 font-mono border border-wade-border rounded px-1.5 py-0.5 bg-wade-bg-app">
                  {msg.model}
                </span>
              )}
            </div>
          </div>
        </div>

        <div {...longPressHandlers} style={{ WebkitTouchCallout: 'none' }} className="bubble-wade-deep">
          {thinkingContent && (
            <div onClick={(e) => { e.stopPropagation(); setShowThought(!showThought); }} className="bg-wade-bg-app border-b border-wade-border px-4 py-1.5 flex items-center gap-2 cursor-pointer hover:bg-wade-accent-light transition-colors">
              <div className="text-wade-accent animate-pulse"><Icons.Brain /></div>
              <span className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider flex-1">Thinking Process</span>
              <div className="text-wade-text-muted">{showThought ? <Icons.Up /> : <Icons.Down />}</div>
            </div>
          )}

          {thinkingContent && showThought && (
            <div className="bg-wade-accent-light px-5 py-3 text-xs text-wade-text-muted border-b border-wade-border leading-relaxed markdown-thinking">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkingContent}</ReactMarkdown>
            </div>
          )}

          <div className="px-4 py-2 text-[13px] leading-relaxed tracking-wide markdown-content">
            {renderAttachments()}
            {isBase64Image ? (
              <img src={msg.text} alt="Generated image" className="max-w-full rounded-lg" style={{ maxHeight: '400px', width: 'auto' }} />
            ) : (
              <MarkdownWithHighlight content={displayContent} query={searchQuery} />
            )}
          </div>
        </div>
      </div>
    );
  }

  // 用户的气泡 (Luna)
  return (
    <div className="flex flex-col items-end w-full group animate-fade-in pl-2">
      <div className="flex items-start gap-2 mb-0 mr-1 select-none">
        <div className="flex flex-col items-end mt-0.5">
          <span className="font-bold text-wade-text-main text-sm leading-tight">Luna</span>
          <div className="flex items-center gap-2 text-[10px] text-wade-text-muted mt-0.5">
            <span className="tracking-wide">{formatDate(msg.timestamp)}</span>
            <span className="opacity-70">{formatTime(msg.timestamp)}</span>
          </div>
        </div>
        <img src={settings.lunaAvatar} className="w-10 h-10 rounded-full object-cover border border-wade-accent shadow-sm" alt="Luna" />
      </div>

      <div {...longPressHandlers} style={{ WebkitTouchCallout: 'none' }} className="bubble-luna-deep">
        {renderAttachments()}
        {isBase64Image ? (
          <img src={msg.text} alt="User uploaded image" className="max-w-full rounded-lg" style={{ maxHeight: '400px', width: 'auto' }} />
        ) : (
          <div className="text-[13px] leading-relaxed markdown-content">
            <MarkdownWithHighlight content={displayContent} query={searchQuery} />
          </div>
        )}
      </div>
    </div>
  );
};