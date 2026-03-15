import React, { useState, useEffect } from 'react';
import { Message } from '../../types';
import { Icons } from '../ui/Icons';

interface ActionMenuModalProps {
  selectedMsg: Message;
  activeMode: string;
  playingMessageId: string | null;
  isPaused: boolean;
  onClose: () => void;
  onCopy: () => void;
  onSelectText: () => void;
  onRegenerate: () => void;
  onBranch: () => void;
  onEdit: () => void;
  onPlayTTS: () => void;
  onRegenerateTTS: () => void;
  onFavorite: () => void;
  onDelete: () => void;
  onPrevVariant: () => void;
  onNextVariant: () => void;
  canRegenerate: boolean;
  canBranch: boolean;
}

export const ActionMenuModal: React.FC<ActionMenuModalProps> = ({
  selectedMsg,
  activeMode,
  playingMessageId,
  isPaused,
  onClose,
  onCopy,
  onSelectText,
  onRegenerate,
  onBranch,
  onEdit,
  onPlayTTS,
  onRegenerateTTS,
  onFavorite,
  onDelete,
  onPrevVariant,
  onNextVariant,
  canRegenerate,
  canBranch
}) => {
  // 把二次确认删除的逻辑封印在抽屉内部，不给外面添乱
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  // 每次打开抽屉时，重置删除确认状态
  useEffect(() => {
    setIsDeleteConfirming(false);
  }, [selectedMsg.id]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleteConfirming) {
      onDelete();
    } else {
      setIsDeleteConfirming(true);
    }
  };

  return (
    <>
      {/* 黑色半透明背景遮罩，点击关闭抽屉 */}
      <div 
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity animate-fade-in" 
        onClick={onClose} 
      />
      
      {/* 抽屉本体 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-wade-bg-card/70 backdrop-blur-2xl rounded-t-[32px] shadow-2xl border-t border-wade-accent/20 transform transition-transform animate-slide-up overflow-hidden max-w-4xl mx-auto"
        onClick={() => isDeleteConfirming && setIsDeleteConfirming(false)}
      >
        <div className="p-1.5 flex justify-center">
          <div className="w-10 h-1 bg-wade-border rounded-full"></div>
        </div>
        
        <div className="p-6">
          {/* 变体切换器 (如果有多次生成的历史) */}
          {(selectedMsg.variants?.length || 0) > 1 && activeMode !== 'archive' && (
            <div className="flex items-center justify-between bg-wade-bg-app p-2 rounded-xl mb-4 border border-wade-border">
              <button 
                onClick={(e) => { e.stopPropagation(); onPrevVariant(); }} 
                disabled={!selectedMsg.selectedIndex} 
                className="p-2 text-wade-text-muted hover:text-wade-accent disabled:opacity-30"
              >
                <Icons.ChevronLeft />
              </button>
              <span className="text-xs font-bold text-wade-text-main">
                Variant {(selectedMsg.selectedIndex || 0) + 1} / {selectedMsg.variants?.length}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onNextVariant(); }} 
                disabled={(selectedMsg.selectedIndex || 0) >= (selectedMsg.variants?.length || 0) - 1} 
                className="p-2 text-wade-text-muted hover:text-wade-accent disabled:opacity-30"
              >
                <Icons.ChevronRight />
              </button>
            </div>
          )}

          {/* 按钮矩阵 */}
          <div className="grid grid-cols-4 gap-4">
            
            {/* Copy */}
            <button onClick={(e) => { e.stopPropagation(); onCopy(); }} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-wade-bg-app rounded-full flex items-center justify-center text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white transition-colors shadow-sm"><Icons.Copy /></div>
              <span className="text-[10px] text-wade-text-muted">Copy</span>
            </button>

            {/* Select Text */}
            <button onClick={(e) => { e.stopPropagation(); onSelectText(); }} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-wade-bg-app rounded-full flex items-center justify-center text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white transition-colors shadow-sm"><Icons.TextSelect /></div>
              <span className="text-[10px] text-wade-text-muted">Select</span>
            </button>

            {/* Regenerate */}
            {activeMode !== 'archive' && canRegenerate && (
              <button onClick={(e) => { e.stopPropagation(); onRegenerate(); }} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-wade-bg-app rounded-full flex items-center justify-center text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white transition-colors shadow-sm"><Icons.Refresh /></div>
                <span className="text-[10px] text-wade-text-muted">Regen</span>
              </button>
            )}

            {/* Branch */}
            {activeMode !== 'archive' && canBranch && !canRegenerate && (
              <button onClick={(e) => { e.stopPropagation(); onBranch(); }} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-wade-bg-app rounded-full flex items-center justify-center text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white transition-colors shadow-sm"><Icons.Branch /></div>
                <span className="text-[10px] text-wade-text-muted">Branch</span>
              </button>
            )}

            {/* Edit */}
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 bg-wade-bg-app rounded-full flex items-center justify-center text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white transition-colors shadow-sm"><Icons.Edit /></div>
              <span className="text-[10px] text-wade-text-muted">Edit</span>
            </button>

            {/* Wade 专属功能：语音播报 */}
            {selectedMsg.role === 'Wade' && activeMode !== 'archive' && (
              <>
                <button onClick={(e) => { e.stopPropagation(); onPlayTTS(); }} className="flex flex-col items-center gap-2 group">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
                      playingMessageId === selectedMsg.id
                        ? isPaused
                          ? 'bg-wade-accent text-white scale-110 shadow-lg'
                          : 'bg-wade-accent text-white shadow-xl'
                        : 'bg-wade-bg-app text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white'
                    }`}
                    style={playingMessageId === selectedMsg.id && !isPaused ? { animation: 'audio-pulse 2s ease-in-out infinite' } : {}}
                  >
                    {playingMessageId === selectedMsg.id && !isPaused ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    ) : (
                      <Icons.VolumeLarge />
                    )}
                  </div>
                  <span className={`text-[10px] ${playingMessageId === selectedMsg.id ? 'text-wade-accent font-bold' : 'text-wade-text-muted'}`}>
                    {playingMessageId === selectedMsg.id ? (isPaused ? 'Resume' : 'Pause') : 'Speak'}
                  </span>
                </button>

                {selectedMsg.audioCache && (
                  <button onClick={(e) => { e.stopPropagation(); onRegenerateTTS(); }} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 bg-wade-bg-app rounded-full flex items-center justify-center text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white transition-colors shadow-sm">
                      <Icons.RotateThin />
                    </div>
                    <span className="text-[10px] text-wade-text-muted">Re-Speak</span>
                  </button>
                )}
              </>
            )}

            {/* Favorite */}
            <button onClick={(e) => { e.stopPropagation(); onFavorite(); }} className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${selectedMsg.isFavorite ? 'bg-wade-accent text-white' : 'bg-wade-bg-app text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white'}`}>
                <Icons.Heart filled={!!selectedMsg.isFavorite} />
              </div>
              <span className="text-[10px] text-wade-text-muted">Save</span>
            </button>

            {/* Delete */}
            <button onClick={handleDeleteClick} className="flex flex-col items-center gap-2 group">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${isDeleteConfirming ? 'bg-red-500 text-white animate-pulse' : 'bg-wade-bg-app text-red-400 group-hover:bg-red-400 group-hover:text-white'}`}>
                {isDeleteConfirming ? <Icons.Check /> : <Icons.Trash />}
              </div>
              <span className={`text-[10px] ${isDeleteConfirming ? 'text-red-500 font-bold' : 'text-wade-text-muted'}`}>
                {isDeleteConfirming ? 'Confirm?' : 'Delete'}
              </span>
            </button>

          </div>
        </div>
      </div>
    </>
  );
};