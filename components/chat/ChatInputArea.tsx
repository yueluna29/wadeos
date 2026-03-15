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

    if (!isVision) {
      alert(`The current model (${activeLlm?.name || 'Unknown'}) does not support images. Please switch to a vision-capable model.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setAttachments(prev => [...prev, {
        type: 'image',
        content: content,
        mimeType: file.type,
        name: file.name
      }]);
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

    if (file.type === 'application/pdf' && !isVision) {
       alert(`The current model (${activeLlm?.name || 'Unknown'}) might not support PDF files. Please switch to a multimodal model.`);
       return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setAttachments(prev => [...prev, {
        type: 'file',
        content: content,
        mimeType: file.type,
        name: file.name
      }]);
      setShowUploadMenu(false);
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendClick = () => {
    if (!inputText.trim() && attachments.length === 0) return;
    
    onSend(inputText, attachments);
    
    setInputText('');
    setAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = '32px';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (window.innerWidth >= 768 && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendClick();
    }
  };

  return (
    <div className="p-3 pb-6 md:pb-3 bg-wade-bg-card border-t border-wade-border z-30 shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="bg-wade-bg-app border border-wade-border rounded-3xl px-2 py-2 focus-within:border-wade-accent shadow-inner flex flex-col gap-2 transition-colors">
          
          {/* Attachment Preview Inside Input */}
          {attachments.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 px-1">
              {attachments.map((att, index) => (
                <div key={index} className="relative group flex-shrink-0">
                  {att.type === 'image' ? (
                    <img src={att.content} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-wade-border" />
                  ) : (
                    <div className="h-16 w-16 bg-wade-bg-card rounded-lg border border-wade-border flex flex-col items-center justify-center p-1">
                      <Icons.File />
                      <span className="text-[8px] truncate w-full text-center mt-1 text-wade-text-main">{att.name}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(index)}
                    className="absolute top-1 right-1 bg-wade-accent text-white rounded-full p-0.5 shadow-md hover:bg-wade-accent-hover transition-colors w-4 h-4 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* File Upload Button (Bottom Left) */}
            <div className="relative shrink-0">
              <button
                onClick={() => setShowUploadMenu(!showUploadMenu)}
                className="w-8 h-8 rounded-full bg-wade-bg-card border border-wade-border flex items-center justify-center hover:bg-wade-accent hover:text-white transition-colors text-wade-text-muted shadow-sm"
              >
                <Icons.PlusThin size={16} />
              </button>

              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageSelect}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.txt,.md,.json"
                onChange={handleFileSelect}
              />

              {/* Upload Menu Popup */}
              {showUploadMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUploadMenu(false)}
                  />
                  <div className="absolute bottom-full left-0 mb-2 w-32 bg-wade-bg-card/90 backdrop-blur-md border border-wade-border rounded-xl shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={() => {
                        imageInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-wade-bg-app/80 transition-colors text-left text-wade-text-main border-b border-wade-border/50"
                    >
                      <Icons.Image />
                      <span className="text-xs font-medium">Image</span>
                    </button>
                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-wade-bg-app/80 transition-colors text-left text-wade-text-main"
                    >
                      <Icons.File />
                      <span className="text-xs font-medium">File</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              rows={1}
              enterKeyHint="send"
              className="flex-1 bg-transparent border-none focus:outline-none text-wade-text-main placeholder-wade-text-muted/50 resize-none overflow-y-auto max-h-32 min-h-[32px] text-sm py-1.5"
            />

            {/* Send Button (Bottom Right) */}
            <button
              onClick={isTyping ? onCancel : handleSendClick}
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all border border-wade-border shrink-0 bg-wade-accent text-white border-wade-accent hover:bg-wade-accent-hover"
            >
              {isTyping ? <Icons.Stop size={16} /> : <Icons.ArrowUpThin size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};