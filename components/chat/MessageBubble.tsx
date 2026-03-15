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

  // 时间格式
  const formatDateTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getMonth() + 1}月${d.getDate()}日 ${d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`;
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

  // --- 状态 1: 重生成中 ---
  if (msg.isRegenerating) {
    return (
      <div className={`flex w-full mb-6 gap-4 animate-pulse ${isLuna ? 'justify-end pr-4' : 'pl-2'}`}>
        {!isLuna && <img src={settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0" />}
        <div className="flex flex-col gap-3">
           <span className="text-[12px] text-wade-text-muted font-medium">{isLuna ? 'Luna' : 'Wade'}</span>
           <div className="flex gap-1.5 px-2">
             <div className="w-1.5 h-1.5 bg-wade-accent/50 rounded-full animate-bounce"></div>
             <div className="w-1.5 h-1.5 bg-wade-accent/50 rounded-full animate-bounce delay-75"></div>
             <div className="w-1.5 h-1.5 bg-wade-accent/50 rounded-full animate-bounce delay-150"></div>
           </div>
        </div>
      </div>
    );
  }

  // --- 状态 2: SMS ---
  if (isSMS) {
    const bubbleClasses = isLuna
      ? "bg-wade-accent text-white rounded-2xl rounded-br-none shadow-sm"
      : "bg-wade-bg-card text-wade-text-main border border-wade-border rounded-2xl rounded-bl-none shadow-sm";
    return (
      <div className={`flex flex-col group ${isLuna ? 'items-end' : 'items-start'} relative mb-1`}>
        <div className={`relative max-w-[85%] ${isLuna ? 'flex flex-row-reverse' : 'flex'} gap-2 items-end`}>
          <div {...longPressHandlers} style={{ WebkitTouchCallout: 'none' }} className={`px-4 py-2 relative ${bubbleClasses} min-w-[60px] cursor-pointer select-none`}>
            {isBase64Image ? <img src={msg.text} alt="img" className="max-w-full rounded-lg" style={{ maxHeight: '400px' }} /> : <div className={`text-[13px] leading-snug break-words markdown-content ${isLuna ? 'text-white' : 'text-wade-text-main'}`}><MarkdownWithHighlight content={displayContent} query={searchQuery} /></div>}
          </div>
        </div>
      </div>
    );
  }

  // --- 状态 3: Wade ---
  if (!isLuna) {
    return (
      <div className="flex w-full mb-8 gap-4 group animate-fade-in pl-2 pr-4">
        {/* 左侧：头像 */}
        <img src={settings.wadeAvatar} className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0" alt="Wade" />

        {/* 右侧：纵向排列的名字、脑部卡片、文本 */}
        <div className="flex flex-col flex-1 min-w-0" {...longPressHandlers} style={{ WebkitTouchCallout: 'none' }}>
          
          {/* 第一行：名字 + 时间 + 播放按钮 (加入了 mb-3 完美呼吸感) */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[13px] font-medium text-wade-text-muted">Wade</span>
            <span className="text-[11px] text-wade-text-muted/60 tracking-wide">{formatDateTime(msg.timestamp)}</span>
            <button 
              onClick={(e) => { e.stopPropagation(); onPlayTTS(msg.text, msg.id); }} 
              className={`transition-all ml-1 ${playingMessageId === msg.id ? 'text-wade-accent animate-pulse scale-110' : 'text-wade-text-muted/40 hover:text-wade-accent'}`}
            >
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v16"/><path d="M8 8v8"/><path d="M16 8v8"/><path d="M4 11v2"/><path d="M20 11v2"/></svg>
            </button>
          </div>

          {/* 第二行：带有圆角和描边的 Thinking Process 卡片 */}
          {thinkingContent && (
            <div className="mb-4 border border-wade-accent/20 rounded-xl overflow-hidden bg-wade-bg-card/50 shadow-sm">
              <div onClick={(e) => { e.stopPropagation(); setShowThought(!showThought); }} className="flex items-center gap-2 cursor-pointer bg-wade-bg-app px-4 py-2 hover:bg-wade-bg-card transition-colors">
                <div className="text-wade-accent/80"><Icons.Brain size={14} /></div>
                <span className="text-[10px] font-bold text-wade-accent/80 uppercase tracking-widest flex-1">Thinking Process</span>
                <div className={`text-wade-accent/40 transition-transform duration-300 ${showThought ? 'rotate-180' : ''}`}><Icons.Down size={14} /></div>
              </div>
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${showThought ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 py-4 text-[12px] text-wade-text-muted italic leading-relaxed markdown-thinking border-t border-wade-accent/10">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{thinkingContent}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}

          {/* 第三行：无边框悬浮正文 */}
          <div className="text-[14.5px] text-wade-text-main leading-relaxed tracking-wide markdown-content prose-p:my-2 cursor-pointer">
            {isBase64Image ? <img src={msg.text} alt="img" className="max-w-full rounded-lg mt-2" style={{ maxHeight: '400px' }} /> : <MarkdownWithHighlight content={displayContent} query={searchQuery} />}
          </div>
        </div>
      </div>
    );
  }

  // --- 状态 4: Luna ---
  return (
    <div className="flex w-full mb-8 gap-4 group animate-fade-in justify-end pl-4 pr-2">
      {/* 左侧：文字和气泡框 */}
      <div className="flex flex-col items-end flex-1 min-w-0" {...longPressHandlers} style={{ WebkitTouchCallout: 'none' }}>
        
        {/* 第一行：右对齐的名字和时间 (加入了 mb-3 完美呼吸感) */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[13px] font-medium text-wade-text-muted">Luna</span>
          <span className="text-[11px] text-wade-text-muted/60 tracking-wide">{formatDateTime(msg.timestamp)}</span>
        </div>

        {/* 第二行：粉色气泡本体 */}
        <div className="bg-wade-accent text-white rounded-2xl rounded-tr-[4px] shadow-sm px-5 py-3 max-w-[90%] cursor-pointer active:brightness-95 transition-all select-none">
          {isBase64Image ? <img src={msg.text} alt="img" className="max-w-full rounded-lg" style={{ maxHeight: '400px' }} /> : <div className="text-[14.5px] leading-relaxed markdown-content text-white/95 prose-p:my-1"><MarkdownWithHighlight content={displayContent} query={searchQuery} /></div>}
        </div>
      </div>

      {/* 右侧：永远霸占最右边的头像 */}
      <img src={settings.lunaAvatar} className="w-10 h-10 rounded-full object-cover shadow-sm shrink-0" alt="Luna" />
    </div>
  );
};