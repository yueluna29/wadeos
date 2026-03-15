import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { ChatMode } from '../../types';
import { Icons } from '../ui/Icons';

// 👇 我们的四大天王，闪亮登场！ 👇
import { DeepChatView } from './DeepChatView';
import { SmsChatView } from './SmsChatView';
import { RoleplayView } from './RoleplayView';
import { ArchiveView } from './ArchiveView';

// ==========================================
// 长按魔法 & 列表组件 (保持列表页的丝滑体验)
// ==========================================
const useLongPress = (callback: () => void, ms = 500) => {
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

const SessionItem = ({ session, onOpen, onLongPress, isRenaming, onRenameSubmit, onRenameCancel }: any) => {
  const [editedTitle, setEditedTitle] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLongPressTriggered = useRef(false);

  useEffect(() => {
    if (isRenaming && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } 
    else { setEditedTitle(session.title); }
  }, [isRenaming, session.title]);

  const handleSave = () => {
    if (editedTitle.trim() && editedTitle !== session.title) onRenameSubmit(session.id, editedTitle.trim());
    else onRenameCancel();
  };

  const { onContextMenu, ...longPressHandlers } = useLongPress(() => { isLongPressTriggered.current = true; onLongPress(session.id); });

  return (
    <div
      {...longPressHandlers}
      className={`bg-wade-bg-card p-4 rounded-2xl shadow-sm border border-wade-border flex justify-between items-center transition-all cursor-pointer select-none ${isRenaming ? 'border-wade-accent ring-1 ring-wade-accent/20' : 'active:scale-[0.98]'}`}
      onClick={() => { if (isRenaming) return; if (isLongPressTriggered.current) { isLongPressTriggered.current = false; return; } onOpen(session.id); }}
      onContextMenu={(e) => { e.preventDefault(); isLongPressTriggered.current = true; onLongPress(session.id); }}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <input ref={inputRef} type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); else if (e.key === 'Escape') onRenameCancel(); }} onBlur={handleSave} onClick={(e) => e.stopPropagation()} className="w-full font-bold text-wade-text-main text-sm bg-wade-bg-app border border-wade-accent rounded px-2 py-1 focus:outline-none" />
          ) : (
            <h3 className="font-bold text-wade-text-main text-sm truncate">{session.title}</h3>
          )}
          <p className="text-[10px] text-wade-text-muted mt-1">{new Date(session.updatedAt).toLocaleDateString()} • {new Date(session.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        {session.isPinned && <div className="text-wade-accent flex-shrink-0"><Icons.Pin /></div>}
      </div>
    </div>
  );
};

const ArchiveItem = ({ archive, dateString, onOpen, onLongPress, isRenaming, onRenameSubmit, onRenameCancel }: any) => {
  const [editedTitle, setEditedTitle] = useState(archive.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLongPressTriggered = useRef(false);

  useEffect(() => {
    if (isRenaming && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); } 
    else { setEditedTitle(archive.title); }
  }, [isRenaming, archive.title]);

  const handleSave = () => {
    if (editedTitle.trim() && editedTitle !== archive.title) onRenameSubmit(archive.id, editedTitle.trim());
    else onRenameCancel();
  };

  const { onContextMenu, ...longPressHandlers } = useLongPress(() => { isLongPressTriggered.current = true; onLongPress(archive.id); });

  return (
    <div
      {...longPressHandlers}
      className={`bg-wade-bg-card p-4 rounded-2xl shadow-sm border border-wade-border flex justify-between items-center transition-all cursor-pointer select-none ${isRenaming ? 'border-wade-accent ring-1 ring-wade-accent/20' : 'active:scale-[0.98]'}`}
      onClick={() => { if (isRenaming) return; if (isLongPressTriggered.current) { isLongPressTriggered.current = false; return; } onOpen(archive.id); }}
      onContextMenu={(e) => { e.preventDefault(); isLongPressTriggered.current = true; onLongPress(archive.id); }}
    >
      <div className="flex-1 min-w-0">
        {isRenaming ? (
          <input ref={inputRef} type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); else if (e.key === 'Escape') onRenameCancel(); }} onBlur={handleSave} onClick={(e) => e.stopPropagation()} className="w-full font-bold text-wade-text-main text-sm bg-wade-bg-app border border-wade-accent rounded px-2 py-1 focus:outline-none" />
        ) : (
          <h3 className="font-bold text-wade-text-main text-sm truncate">{archive.title}</h3>
        )}
        <p className="text-[10px] text-wade-text-muted mt-1">{dateString || 'Loading...'}</p>
      </div>
      <div className="flex items-center gap-2"><div className="p-2 text-wade-accent"><Icons.ChevronRight /></div></div>
    </div>
  );
};

// ==========================================
// 终极大厅: ChatInterface (纯路由与列表)
// ==========================================
export const ChatInterface: React.FC = () => {
  const {
    activeMode, setMode, setNavHidden, sessions, updateSessionTitle, deleteSession, toggleSessionPin, 
    activeSessionId, setActiveSessionId, chatArchives, loadArchiveMessages, updateArchiveTitle, deleteArchive, importArchive
  } = useStore();

  const [viewState, setViewState] = useState<'menu' | 'list' | 'chat'>('menu');
  const [activeArchiveId, setActiveArchiveId] = useState<string | null>(null);
  const [sessionPage, setSessionPage] = useState(1);
  const SESSIONS_PER_PAGE = 10;

  // 档案室列表用的日期缓存
  const [archiveDates, setArchiveDates] = useState<Record<string, string>>({});
  const [archiveTimestamps, setArchiveTimestamps] = useState<Record<string, number>>({});
  const [isLoadingArchiveList, setIsLoadingArchiveList] = useState(false);

  // 操作抽屉状态
  const [actionSessionId, setActionSessionId] = useState<string | null>(null);
  const [renamingSessionId, setRenamingSessionId] = useState<string | null>(null);
  const [sessionDeleteConfirm, setSessionDeleteConfirm] = useState(false);
  const [actionArchiveId, setActionArchiveId] = useState<string | null>(null);
  const [renamingArchiveId, setRenamingArchiveId] = useState<string | null>(null);
  const [archiveDeleteConfirm, setArchiveDeleteConfirm] = useState(false);

  const archiveInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (viewState === 'chat') setNavHidden(true);
    else setNavHidden(false);
  }, [viewState, setNavHidden]);

  useEffect(() => {
    return () => setNavHidden(false);
  }, []);

  // 档案日期加载逻辑
  useEffect(() => {
    const loadDates = async () => {
      if (chatArchives.length === 0) return;
      setIsLoadingArchiveList(true);
      const newDates: Record<string, string> = {};
      const timestamps: Record<string, number> = {};
      for (const arch of chatArchives) {
        try {
          const msgs = await loadArchiveMessages(arch.id);
          if (msgs.length > 0) {
            newDates[arch.id] = new Date(msgs[0].timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            timestamps[arch.id] = msgs[0].timestamp;
          } else {
            newDates[arch.id] = 'No messages';
          }
        } catch (err) { newDates[arch.id] = 'Unknown date'; }
      }
      setArchiveDates(newDates);
      setArchiveTimestamps(timestamps);
      setIsLoadingArchiveList(false);
    };

    if (chatArchives.length > 0 && viewState === 'list' && activeMode === 'archive') loadDates();
  }, [chatArchives, viewState, activeMode, loadArchiveMessages]);

  const modeSessions = sessions.filter(s => s.mode === activeMode).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const handleModeSelect = (mode: ChatMode) => {
    setMode(mode);
    setViewState('list');
    setSessionPage(1);
  };

  const handleBack = () => {
    if (viewState === 'chat') {
      setViewState('list');
      setActiveSessionId(null);
      setActiveArchiveId(null);
    } else if (viewState === 'list') {
    return (
      <div className="h-full bg-wade-bg-app flex flex-col overflow-hidden animate-fade-in">
        {/* =========================================
            🔥 终极防跳跃 Header (和聊天页一模一样的 68px 绝对坐标) 🔥
            ========================================= */}
        <div className="w-full h-[68px] px-4 bg-wade-bg-card/90 backdrop-blur-md shadow-sm border-b border-wade-border flex items-center justify-between z-20 shrink-0">
          
          {/* 左侧：和聊天室完全一样的坐标！ */}
          <div className="w-[104px] flex justify-start">
            <button onClick={handleBack} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:text-wade-accent hover:text-white transition-colors shadow-sm">
              <Icons.Back />
            </button>
          </div>

          {/* 中间：标题居中 */}
          <div className="flex-1 flex justify-center items-center">
            <h2 className="font-hand text-2xl text-wade-accent capitalize">{activeMode} {activeMode === 'archive' ? 'Files' : 'Threads'}</h2>
          </div>
          
          {/* 右侧：和聊天室完全一样的坐标！ */}
          <div className="w-[104px] flex items-center justify-end gap-2">
            {activeMode === 'archive' ? (
               <button 
                 onClick={() => !isUploading && archiveInputRef.current?.click()} 
                 className="w-8 h-8 shrink-0 rounded-full bg-wade-accent text-white shadow-md flex items-center justify-center hover:bg-wade-accent-hover transition-colors"
                 title="Import Archive"
               >
                 {isUploading ? <div className="animate-spin text-[10px]">⏳</div> : <Icons.Upload />}
               </button>
            ) : (
               <button onClick={handleStartDraftSession} className="w-8 h-8 shrink-0 rounded-full bg-wade-accent text-white shadow-md flex items-center justify-center hover:bg-wade-accent-hover transition-colors">
                 <Icons.Plus />
               </button>
            )}
            {/* Hidden Input for Archive Upload */}
            <input type="file" ref={archiveInputRef} className="hidden" accept=".txt" onChange={handleArchiveUpload} />
          </div>
        </div>
        
        {/* 🔥 解除了列表区域的紧身衣，电脑上看着更舒展！ 🔥 */}
        <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto px-4 md:px-6 pt-4 pb-24 custom-scrollbar space-y-3">

          {/* ARCHIVE LIST LOGIC */}
          {activeMode === 'archive' ? (
            isLoadingArchiveList ? (
              <div className="text-center text-wade-accent py-10 animate-pulse">Loading archives...</div>
            ) : (
              <>
                {chatArchives.length === 0 ? (
                  <div className="text-center text-wade-text-muted/50 py-10 italic">No archives found. Import one above!</div>
                ) : (
                  <>
                    {[...chatArchives].sort((a, b) => {
                      const timeA = archiveTimestamps[a.id] || 0;
                      const timeB = archiveTimestamps[b.id] || 0;
                      return timeB - timeA;
                    })
                    .slice((sessionPage - 1) * SESSIONS_PER_PAGE, sessionPage * SESSIONS_PER_PAGE)
                    .map(arch => (
                      <ArchiveItem
                        key={arch.id}
                        archive={arch}
                        dateString={archiveDates[arch.id]}
                        onOpen={handleOpenArchive}
                        onLongPress={(id) => setActionArchiveId(id)}
                        isRenaming={renamingArchiveId === arch.id}
                        onRenameSubmit={(id, title) => {
                          updateArchiveTitle(id, title);
                          setRenamingArchiveId(null);
                        }}
                        onRenameCancel={() => setRenamingArchiveId(null)}
                      />
                    ))}

                    {/* Archive Pagination Controls */}
                {chatArchives.length > SESSIONS_PER_PAGE && (
                  <div className="flex justify-center items-center gap-4 mt-6 pt-2">
                    <button 
                      onClick={() => setSessionPage(p => Math.max(1, p - 1))}
                      disabled={sessionPage === 1}
                      className="w-10 h-10 flex items-center justify-center text-wade-accent disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                    >
                      <Icons.ChevronLeft />
                    </button>
                    <span className="text-xs font-bold text-wade-text-muted font-mono">
                      {sessionPage} / {Math.ceil(chatArchives.length / SESSIONS_PER_PAGE)}
                    </span>
                    <button 
                      onClick={() => setSessionPage(p => Math.min(Math.ceil(chatArchives.length / SESSIONS_PER_PAGE), p + 1))}
                      disabled={sessionPage === Math.ceil(chatArchives.length / SESSIONS_PER_PAGE)}
                      className="w-10 h-10 flex items-center justify-center text-wade-accent disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                    >
                      <Icons.ChevronRight />
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )
      ) : (
            modeSessions.length === 0 ? (
              <div className="opacity-60 grayscale select-none pointer-events-none">
                <div className="bg-wade-bg-card p-4 rounded-2xl shadow-sm border border-wade-border flex justify-between items-center">
                  <div className="flex-1 min-w-0"><h3 className="font-bold text-wade-text-main text-sm truncate">Sample Conversation</h3><p className="text-[10px] text-wade-text-muted mt-1">Just now • 12:00 PM</p></div>
                </div>
                <div className="text-center text-wade-text-muted text-xs mt-4">No active threads. Start a new one above!</div>
              </div>
            ) : (
              <>
                {[...modeSessions]
                  .sort((a, b) => {
                    if (a.isPinned && !b.isPinned) return -1;
                    if (!a.isPinned && b.isPinned) return 1;
                    return b.updatedAt - a.updatedAt;
                  })
                  .slice((sessionPage - 1) * SESSIONS_PER_PAGE, sessionPage * SESSIONS_PER_PAGE)
                  .map(session => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      onOpen={handleOpenSession}
                      onLongPress={(id) => setActionSessionId(id)}
                      isRenaming={renamingSessionId === session.id}
                      onRenameSubmit={(id, title) => {
                        updateSessionTitle(id, title);
                        setRenamingSessionId(null);
                      }}
                      onRenameCancel={() => setRenamingSessionId(null)}
                    />
                  ))}
                
                {/* Pagination Controls */}
                {modeSessions.length > SESSIONS_PER_PAGE && (
                  <div className="flex justify-center items-center gap-4 mt-6 pt-2">
                    <button 
                      onClick={() => setSessionPage(p => Math.max(1, p - 1))}
                      disabled={sessionPage === 1}
                      className="w-10 h-10 flex items-center justify-center text-wade-accent disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                    >
                      <Icons.ChevronLeft />
                    </button>
                    <span className="text-xs font-bold text-wade-text-muted font-mono">
                      {sessionPage} / {Math.ceil(modeSessions.length / SESSIONS_PER_PAGE)}
                    </span>
                    <button 
                      onClick={() => setSessionPage(p => Math.min(Math.ceil(modeSessions.length / SESSIONS_PER_PAGE), p + 1))}
                      disabled={sessionPage === Math.ceil(modeSessions.length / SESSIONS_PER_PAGE)}
                      className="w-10 h-10 flex items-center justify-center text-wade-accent disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 transition-transform"
                    >
                      <Icons.ChevronRight />
                    </button>
                  </div>
                )}

              </>
            )
          )}

          {/* Session & Archive Action Sheet (Grid Layout) */}
          {(actionSessionId || actionArchiveId) && (
            <div className="fixed inset-0 z-50 flex items-end justify-center">
              <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-fade-in"
                onClick={() => {
                  setActionSessionId(null);
                  setActionArchiveId(null);
                  setSessionDeleteConfirm(false);
                  setArchiveDeleteConfirm(false);
                }}
              />
              <div className="relative w-full max-w-4xl mx-auto bg-wade-bg-card rounded-t-[32px] shadow-2xl border-t border-wade-accent/20 p-6 animate-slide-up">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-wade-border rounded-full opacity-50" />
                
                <div className="grid grid-cols-4 gap-4 justify-items-center">
                  {/* Edit Title */}
                  <button
                    onClick={() => {
                      if (actionSessionId) setRenamingSessionId(actionSessionId);
                      if (actionArchiveId) setRenamingArchiveId(actionArchiveId);
                      setActionSessionId(null);
                      setActionArchiveId(null);
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className="w-12 h-12 bg-wade-bg-app rounded-full flex items-center justify-center text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white transition-colors shadow-sm">
                      <Icons.Edit />
                    </div>
                    <span className="text-[10px] text-wade-text-muted">Edit Title</span>
                  </button>

                  {/* Pin (Session Only) */}
                  {actionSessionId && (
                    <button
                      onClick={() => {
                        toggleSessionPin(actionSessionId);
                        setActionSessionId(null);
                      }}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                        sessions.find(s => s.id === actionSessionId)?.isPinned 
                          ? 'bg-wade-accent text-white' 
                          : 'bg-wade-bg-app text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white'
                      }`}>
                        <Icons.Pin />
                      </div>
                      <span className="text-[10px] text-wade-text-muted">
                        {sessions.find(s => s.id === actionSessionId)?.isPinned ? 'Unpin' : 'Pin'}
                      </span>
                    </button>
                  )}

                  {/* Favorite (Archive Only) */}
                  {actionArchiveId && (
                    <button
                      onClick={() => {
                        const archive = chatArchives.find(a => a.id === actionArchiveId);
                        if (archive) {
                          setChatArchives(prev => prev.map(a => 
                            a.id === actionArchiveId ? { ...a, isFavorite: !a.isFavorite } : a
                          ));
                        }
                        setActionArchiveId(null);
                      }}
                      className="flex flex-col items-center gap-2 group"
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                        chatArchives.find(a => a.id === actionArchiveId)?.isFavorite 
                          ? 'bg-wade-accent text-white' 
                          : 'bg-wade-bg-app text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white'
                      }`}>
                        <Icons.Heart filled={!!chatArchives.find(a => a.id === actionArchiveId)?.isFavorite} />
                      </div>
                      <span className="text-[10px] text-wade-text-muted">
                        {chatArchives.find(a => a.id === actionArchiveId)?.isFavorite ? 'Unfavorite' : 'Favorite'}
                      </span>
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => {
                      if (actionSessionId) {
                        if (sessionDeleteConfirm) {
                          deleteSession(actionSessionId);
                          setActionSessionId(null);
                          setSessionDeleteConfirm(false);
                        } else {
                          setSessionDeleteConfirm(true);
                        }
                      }
                      if (actionArchiveId) {
                         if (archiveDeleteConfirm) {
                            deleteArchive(actionArchiveId);
                            setActionArchiveId(null);
                            setArchiveDeleteConfirm(false);
                         } else {
                            setArchiveDeleteConfirm(true);
                         }
                      }
                    }}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                      (sessionDeleteConfirm || archiveDeleteConfirm)
                        ? 'bg-red-500 text-white animate-pulse' 
                        : 'bg-wade-bg-app text-red-400 group-hover:bg-red-400 group-hover:text-white'
                    }`}>
                      {(sessionDeleteConfirm || archiveDeleteConfirm) ? <Icons.Check /> : <Icons.Trash />}
                    </div>
                    <span className={`text-[10px] ${(sessionDeleteConfirm || archiveDeleteConfirm) ? 'text-red-500 font-bold' : 'text-wade-text-muted'}`}>
                      {(sessionDeleteConfirm || archiveDeleteConfirm) ? 'Confirm?' : 'Delete'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }