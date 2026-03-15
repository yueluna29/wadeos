import React, { useState, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../../types';
import { Icons } from '../ui/Icons';

export const useLongPress = (callback: () => void, ms = 500) => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const startPos = useRef<{ x: number, y: number } | null>(null);

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e) startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    timerRef.current = setTimeout(() => { if (navigator.vibrate) navigator.vibrate(50); callback(); }, ms);
  };
  const stop = () => { if (timerRef.current) clearTimeout(timerRef.current); startPos.current = null; };
  const move = (e: React.TouchEvent) => {
    if (startPos.current) {
      if (Math.abs(e.touches[0].clientX - startPos.current.x) > 10 || Math.abs(e.touches[0].clientY - startPos.current.y) > 10) stop();
    }
  };

  return {
    onMouseDown: start, onMouseUp: stop, onMouseLeave: stop, onTouchStart: start, onTouchEnd: stop, onTouchMove: move,
    onContextMenu: (e: React.MouseEvent) => { e.preventDefault(); callback(); stop(); }
  };
};

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

  // 恢复截图里的时间格式 (例如: 3月8日 13:22)
  const formatDateTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  };

  const longPressHandlers = useLongPress(() => onSelect(msg.id));
  const thinkingContent = msg.variantsThinking?.[msg.selectedIndex || 0] || msg.thinking;
  const isBase64Image = msg.text.startsWith('data:image/');
  const displayContent = msg.text.replace(/\|\|\|/g, '\n\n');

  const MarkdownWithHighlight = ({ content, query }: { content: string, query?: string }) => {
    const components = useMemo(() => {
      if (!query || !query.trim()) return {};
      return {
        p: ({ children, ...props }: any) => {
          const highlightText = (node: any): any => {
            if (typeof node === 'string') {
              const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
              return node.split(regex).map((part: string, i: number) =>
                part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="bg-wade-accent/30 rounded px-1">{part}</mark> : part
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
  // 状态 1: 重新生成中
  // -------------------------
  if (msg.isRegenerating) {
    return (
      <div className={`flex items-start gap-4 mb-6 group animate-pulse ${isLuna ? 'justify-end' : 'justify-start'}`}>
        {!isSMS && !isLuna && <img src={settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover mt-1" alt="Wade" />}
        <div className="flex gap-1.5 px-4 py-3">
          <div className="w-1.5 h-1.5 bg-wade-accent/50 rounded-full animate-bounce"></div>
          <div className="w-1.5 h-1.5 bg-wade-accent/50 rounded-full animate-bounce delay-75"></div>
          <div className="w-1.5 h-1.5 bg-wade-accent/50 rounded-full animate-bounce delay-150"></div>
        </div>
      </div>
    );
  }

  // -------------------------
  // 状态 2: SMS 模式
  // -------------------------
  if (isSMS) {
    const bubbleClasses = isLuna
      ? "bg-wade-accent text-white rounded-2xl rounded-br-none shadow-sm"
      : "bg-wade-bg-card text-wade-text-main border border-wade-border rounded-2xl rounded-bl-none shadow-sm";
    return (
      <div className={`flex flex-col group ${isLuna ? 'items-end' : 'items-start'} relative`}>
        <div className={`relative max-w-[85%] ${isLuna ? 'flex flex-row-reverse' : 'flex'} gap-2 items-end`}>
          <div {...longPressHandlers} style={{ WebkitTouchCallout: 'none' }} className={`px-4 py-2 relative ${bubbleClasses} min-w-[60px] cursor-pointer select-none`}>
            {isBase64Image ? <img src={msg.text} alt="img" className="max-w-full rounded-lg" style={{ maxHeight: '400px' }} /> : <div className={`text-[13px] leading-snug break-words markdown-content ${isLuna ? 'text-white' : 'text-wade-text-main'}`}><MarkdownWithHighlight content={displayContent} query={searchQuery} /></div>}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------
  // 状态 3: Deep / Roleplay 通用排版 (高度还原截图)
  // -------------------------
  if (!isLuna) {
    return (
      <div className="flex items-start gap-4 w-full group animate-fade-in pr-2 mb-6">
        {/* 头像 */}
        <img src={settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover shrink-0 mt-1 shadow-sm" alt="Wade" />
        
        <div className="flex flex-col w-full min-w-0" {...longPressHandlers} style={{ WebkitTouchCallout: 'none' }}>
          {/* 名字和时间戳 */}
          <div className="flex items-center gap-3 mb-2">
            <span className="font-medium text-wade-text-muted text-[13px]">Wade</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-wade-text-muted/60">{formatDateTime(msg.timestamp)}</span>
              {/* 播放小喇叭 */}
              <button onClick={(e) => { e.stopPropagation(); onPlayTTS(msg.text, msg.id); }} className={`text-wade-accent transition-all ${playingMessageId === msg.id ? 'opacity-100 animate-pulse scale-110' : 'opacity-40 hover:opacity-100'}`}>
                {playingMessageId === msg.id && !isPaused ? <Icons.Pause /> : <Icons.Wave />}
              </button>
            </div>
          </div>

          {/* 高级感 Thinking Process */}
          {thinkingContent && (
            <div className="mb-4">
              <div onClick={(e) => { e.stopPropagation(); setShowThought(!showThought); }} className="flex items-center gap-2 cursor-pointer group/think py-1 border-b border-wade-accent/10 pb-2">
                <div className="text-wade-accent/60 group-hover/think:text-wade-accent transition-colors"><Icons.Brain /></div>
                <span className="text-[10px] font-bold text-wade-accent/60 group-hover/think:text-wade-accent uppercase tracking-[0.15em] flex-1 transition-colors">Thinking Process</span>
                <div className={`text-wade-accent/40 transition-transform duration-300 ${showThought ? 'rotate-180' : ''}`}><Icons.Down /></div>
              </div>
              
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showThought ? 'max-h-[1000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                <div className="text-[12px] text-wade-text-muted italic leading-relaxed markdown-thinking pr-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkingContent}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* 无气泡框的文字内容 */}
          <div className="text-[14px] text-wade-text-main leading-relaxed tracking-wide markdown-content prose-p:my-2 prose-em:italic prose-em:text-wade-text-muted cursor-pointer">
            {isBase64Image ? <img src={msg.text} alt="img" className="max-w-full rounded-lg mt-2" style={{ maxHeight: '400px' }} /> : <MarkdownWithHighlight content={displayContent} query={searchQuery} />}
          </div>
        </div>
      </div>
    );
  }

  // 用户的气泡 (Luna - 保持粉色气泡)
  return (
    <div className="flex flex-col items-end w-full group animate-fade-in pl-2 mb-6">
      <div className="flex flex-col items-end gap-1.5 max-w-full">
        {/* 名字和时间 */}
        <div className="flex items-center gap-3 mr-14">
          <span className="font-medium text-wade-text-muted text-[13px]">Luna</span>
          <span className="text-[11px] text-wade-text-muted/60">{formatDateTime(msg.timestamp)}</span>
        </div>
        
        {/* 气泡与头像并排 */}
        <div className="flex items-start gap-3 justify-end w-full">
          <div {...longPressHandlers} style={{ WebkitTouchCallout: 'none' }} className="bg-wade-accent text-white rounded-[20px] rounded-tr-sm shadow-sm px-4 py-2.5 max-w-[85%] relative cursor-pointer active:brightness-95 transition-all select-none">
            {isBase64Image ? <img src={msg.text} alt="img" className="max-w-full rounded-lg" style={{ maxHeight: '400px' }} /> : <div className="text-[14px] leading-relaxed markdown-content text-white/90 prose-p:my-1"><MarkdownWithHighlight content={displayContent} query={searchQuery} /></div>}
          </div>
          <img src={settings.lunaAvatar} className="w-10 h-10 rounded-full object-cover shrink-0 shadow-sm" alt="Luna" />
        </div>
      </div>
    </div>
  );
};