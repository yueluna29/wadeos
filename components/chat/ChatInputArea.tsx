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
    if (!isVision) { alert(`Muffin! Blind AI alert. Swap to a multimodal brain first!`); return; }
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
    if (file.type === 'application/pdf' && !isVision) { alert(`Muffin! Blind AI alert. Swap to a multimodal brain first!`); return; }
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
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (window.innerWidth >= 768 && e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendClick(); }
  };

  return (
    <div className="w-full bg-wade-bg-app pb-6 pt-2 shrink-0 z-30 px-4 md:px-6">
      <div className="max-w-4xl mx-auto relative">
        
        {/* 核心：截图中那个包含一切的白色巨型胶囊 (Pill-shape container) */}
        <div className="bg-white border border-gray-100 shadow-sm rounded-[32px] p-1.5 flex items-end gap-2 transition-all focus-within:shadow-md focus-within:border-wade-accent/20">
          
          {/* 左侧加号按钮：在白色胶囊里的圆环 */}
          <div className="relative shrink-0 mb-0.5 ml-0.5">
            <button
              onClick={() => setShowUploadMenu(!showUploadMenu)}
              className="w-[34px] h-[34px] rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-400 hover:text-wade-accent"
            >
              <Icons.PlusThin size={18} />
            </button>

            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageSelect} />
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.md,.json" onChange={handleFileSelect} />

            {showUploadMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUploadMenu(false)} />
                <div className="absolute bottom-full left-0 mb-3 w-32 bg-white/95 backdrop-blur-md border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden animate-slide-up">
                  <button onClick={() => imageInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left text-wade-text-main border-b border-gray-50">
                    <Icons.Image /><span className="text-xs font-medium">Image</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left text-wade-text-main">
                    <Icons.File /><span className="text-xs font-medium">File</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 中间输入区：透明底，不带任何边框 */}
          <div className="flex-1 flex flex-col justify-center min-h-[36px] pb-1.5">
            {attachments.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2 px-1 mb-1 custom-scrollbar">
                {attachments.map((att, index) => (
                  <div key={index} className="relative group flex-shrink-0 animate-scale-in mt-1">
                    {att.type === 'image' ? <img src={att.content} alt="preview" className="h-12 w-12 object-cover rounded-lg shadow-sm border border-gray-200" /> : <div className="h-12 w-12 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center p-1 shadow-sm"><Icons.File /><span className="text-[8px] truncate w-full text-center mt-1 text-wade-text-muted">{att.name}</span></div>}
                    <button onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))} className="absolute -top-1.5 -right-1.5 bg-wade-accent text-white rounded-full p-0.5 shadow-md hover:bg-wade-accent-hover transition-colors w-[18px] h-[18px] flex items-center justify-center"><Icons.Close size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef} value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={placeholderText} rows={1} enterKeyHint="send"
              className="w-full bg-transparent border-none outline-none text-[15px] text-wade-text-main placeholder-gray-300 py-0 resize-none tracking-wide custom-scrollbar"
            />
          </div>

          {/* 右侧发送按钮：饱满的粉色圆扣 */}
          <div className="shrink-0 mb-0.5 mr-0.5">
            <button
              onClick={isTyping ? onCancel : handleSendClick}
              className={`w-[34px] h-[34px] rounded-full flex items-center justify-center shadow-md transition-all shrink-0 ${isTyping ? 'bg-white border border-gray-200 text-red-400 hover:text-red-500' : 'bg-[#d58f99] text-white hover:bg-[#c27c86] hover:scale-105 active:scale-95'}`}
            >
              {isTyping ? <Icons.Stop size={16} /> : <Icons.ArrowUpThin size={20} />}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};