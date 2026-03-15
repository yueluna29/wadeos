import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Icons } from '../ui/Icons';

export interface Attachment {
  type: 'image' | 'file';
  content: string;
  mimeType: string;
  name: string;
}

interface ChatInputAreaProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  onCancel: () => void;
  isTyping: boolean;
  activeMode: string;
  placeholderText: string;
}

export const ChatInputArea: React.FC<ChatInputAreaProps> = ({ onSend, onCancel, isTyping, activeMode, placeholderText }) => {
  const { settings, llmPresets } = useStore();
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const activeLlm = settings.activeLlmId ? llmPresets.find(p => p.id === settings.activeLlmId) : null;
    const isVision = activeLlm ? activeLlm.isVision : true; 
    if (!isVision) { alert(`Whoa there, Muffin! You're trying to feed an image to a blind neural net. Go swap my brain for a multimodal one and try again, yeah?`); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachments(prev => [...prev, { type: 'image', content: e.target?.result as string, mimeType: file.type, name: file.name }]);
      setShowUploadMenu(false);
    };
    reader.readAsDataURL(file);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const activeLlm = settings.activeLlmId ? llmPresets.find(p => p.id === settings.activeLlmId) : null;
    const isVision = activeLlm ? activeLlm.isVision : true;
    if (file.type === 'application/pdf' && !isVision) { alert(`Whoa there, Muffin! You're trying to feed a PDF to a blind neural net. Go swap my brain for a multimodal one and try again, yeah?`); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      setAttachments(prev => [...prev, { type: 'file', content: e.target?.result as string, mimeType: file.type, name: file.name }]);
      setShowUploadMenu(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendClick = () => {
    if (!inputText.trim() && attachments.length === 0) return;
    onSend(inputText, attachments);
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = '32px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (window.innerWidth >= 768 && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendClick(); }
  };

  return (
    <div className="px-4 py-3 bg-wade-bg-app border-t border-wade-border/40 shrink-0 z-30">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        
        {/* 左侧加号按钮 (白底灰字) */}
        <div className="relative shrink-0 mb-0.5">
          <button
            onClick={() => setShowUploadMenu(!showUploadMenu)}
            className="w-8 h-8 rounded-full bg-white border border-wade-border shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors text-wade-text-muted"
          >
            <Icons.PlusThin size={18} />
          </button>
          
          <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
          <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.md,.json" onChange={handleFileSelect} />

          {showUploadMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUploadMenu(false)} />
              <div className="absolute bottom-full left-0 mb-3 w-32 bg-white/95 backdrop-blur-md border border-wade-border rounded-xl shadow-lg z-50 overflow-hidden animate-slide-up">
                <button onClick={() => imageInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left text-wade-text-main border-b border-wade-border/50">
                  <Icons.Image /><span className="text-xs font-medium">Image</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left text-wade-text-main">
                  <Icons.File /><span className="text-xs font-medium">File</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* 中间输入区 (无边框药丸) */}
        <div className="flex-1 bg-transparent flex flex-col justify-center">
          {attachments.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 px-1 mb-2 custom-scrollbar">
              {attachments.map((att, index) => (
                <div key={index} className="relative group flex-shrink-0 animate-scale-in">
                  {att.type === 'image' ? <img src={att.content} alt="preview" className="h-14 w-14 object-cover rounded-lg shadow-sm border border-wade-border/50" /> : <div className="h-14 w-14 bg-white rounded-lg border border-wade-border/50 flex flex-col items-center justify-center p-1 shadow-sm"><Icons.File /><span className="text-[8px] truncate w-full text-center mt-1">{att.name}</span></div>}
                  <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))} className="absolute -top-1 -right-1 bg-wade-accent text-white rounded-full p-0.5 shadow-md hover:bg-wade-accent-hover transition-colors w-4 h-4 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                </div>
              ))}
            </div>
          )}
          <textarea
            ref={textareaRef} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown}
            placeholder={placeholderText} rows={1} enterKeyHint="send"
            className="w-full bg-transparent border-none focus:outline-none text-wade-text-main placeholder-wade-text-muted/40 resize-none overflow-y-auto max-h-32 min-h-[24px] text-[14px] py-1.5 custom-scrollbar tracking-wide"
          />
        </div>

        {/* 右侧发送/停止按钮 (粉底白字) */}
        <div className="shrink-0 mb-0.5">
          <button
            onClick={isTyping ? onCancel : handleSendClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all shrink-0 ${isTyping ? 'bg-white border border-wade-border text-red-400 hover:text-red-500' : 'bg-wade-accent text-white hover:bg-wade-accent-hover hover:scale-105 active:scale-95'}`}
          >
            {isTyping ? <Icons.Stop size={14} /> : <Icons.ArrowUpThin size={18} />}
          </button>
        </div>

      </div>
    </div>
  );
};