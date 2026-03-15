import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { ChatMode } from '../../types';
import { Icons } from '../ui/Icons';
import { DeepChatView } from './DeepChatView';
import { SmsChatView } from './SmsChatView';
import { RoleplayView } from './RoleplayView';
import { ArchiveView } from './ArchiveView';

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

export const ChatInterface: React.FC = () => {
  const {
    activeMode, setMode, setNavHidden, sessions, updateSessionTitle, deleteSession, toggleSessionPin, 
    activeSessionId, setActiveSessionId, chatArchives, loadArchiveMessages, updateArchiveTitle, deleteArchive, importArchive
  } = useStore();

  const [viewState, setViewState] = useState<'menu' | 'list' | 'chat'>('menu');
  const [activeArchiveId, setActiveArchiveId] = useState<string | null>(null);
  const [sessionPage, setSessionPage] = useState(1);
  const SESSIONS_PER_PAGE = 10;

  const [archiveDates, setArchiveDates] = useState<Record<string, string>>({});
  const [archiveTimestamps, setArchiveTimestamps] = useState<Record<string, number>>({});
  const [isLoadingArchiveList, setIsLoadingArchiveList] = useState(false);

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
      setViewState('menu');
    }
  };

  const handleArchiveUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const text = await file.text();
      const title = file.name.replace('.txt', '');
      const count = await importArchive(title, text);
      alert(`Success! Imported ${count} messages into archive "${title}".`);
    } catch (err) { alert("Failed to import archive."); } 
    finally { setIsUploading(false); if (archiveInputRef.current) archiveInputRef.current.value = ''; }
  };

  // 👇 就是这个被我不小心删掉的函数导致了白屏！现在它回来了！ 👇
  const handleStartDraftSession = () => {
    setActiveSessionId(null);
    setViewState('chat');
  };

  if (viewState === 'chat') {
    switch (activeMode) {
      case 'deep': 
        return <DeepChatView onBack={handleBack} />;
      case 'sms': 
        return <SmsChatView onBack={handleBack} />;
      case 'roleplay': 
        return <RoleplayView onBack={handleBack} />;
      case 'archive': 
        if (!activeArchiveId) { setViewState('list'); return null; }
        return <ArchiveView archiveId={activeArchiveId} onBack={handleBack} />;
      default: 
        return <DeepChatView onBack={handleBack} />;
    }
  }

  if (viewState === 'menu') {
    return (
      <div className="h-full bg-wade-bg-app p-6 flex flex-col items-center justify-center space-y-8 animate-fade-in">
        <div className="text-center mb-4">
          <h2 className="font-hand text-4xl text-wade-accent mb-2">Connect with Wade</h2>
          <p className="text-wade-text-muted text-sm opacity-80">Choose your frequency, babe.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <button onClick={() => handleModeSelect('deep')} className="col-span-2 group relative overflow-hidden bg-wade-bg-card p-6 rounded-3xl shadow-sm border border-wade-border text-left hover:border-wade-accent transition-all hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-24 h-24 bg-wade-accent-light rounded-full -mr-8 -mt-8 opacity-50 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-wade-bg-app rounded-full flex items-center justify-center text-wade-accent group-hover:bg-wade-accent group-hover:text-white transition-colors"><Icons.Infinity /></div>
              <div><h3 className="font-bold text-wade-text-main text-lg">Deep Chat</h3><p className="text-wade-text-muted text-xs mt-1">Soul-to-soul connection.</p></div>
            </div>
          </button>
          <button onClick={() => handleModeSelect('sms')} className="group relative overflow-hidden bg-wade-bg-card p-4 rounded-3xl shadow-sm border border-wade-border text-left hover:border-wade-accent transition-all hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-wade-bg-app rounded-full flex items-center justify-center mb-2 text-wade-accent group-hover:bg-wade-accent group-hover:text-white transition-colors"><Icons.Smartphone /></div>
              <h3 className="font-bold text-wade-text-main">SMS Mode</h3>
            </div>
          </button>
          <button onClick={() => handleModeSelect('roleplay')} className="group relative overflow-hidden bg-wade-bg-card p-4 rounded-3xl shadow-sm border border-wade-border text-left hover:border-wade-accent transition-all hover:-translate-y-1">
            <div className="relative z-10">
              <div className="w-10 h-10 bg-wade-bg-app rounded-full flex items-center justify-center mb-2 text-wade-accent group-hover:bg-wade-accent group-hover:text-white transition-colors"><Icons.Feather /></div>
              <h3 className="font-bold text-wade-text-main">Roleplay</h3>
            </div>
          </button>
          <button onClick={() => handleModeSelect('archive')} className="col-span-2 group relative overflow-hidden bg-wade-border/50 p-4 rounded-3xl shadow-inner border border-wade-border text-left hover:bg-wade-bg-card hover:border-wade-accent transition-all hover:-translate-y-1">
            <div className="relative z-10 flex items-center gap-3 justify-center">
              <span className="font-bold text-wade-text-muted text-sm uppercase tracking-widest">Archives</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-wade-bg-app flex flex-col overflow-hidden animate-fade-in">
      {/* =========================================
            🔥 终极防跳跃 Header (绝对居中，电脑宽屏也不变形) 🔥
            ========================================= */}
      <div className="w-full h-[68px] px-4 bg-wade-bg-app flex items-center justify-between z-20 shrink-0 border-b border-transparent relative">
        
        <div className="flex z-10">
          <button onClick={handleBack} className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-card shadow-sm flex items-center justify-center text-wade-text-muted hover:text-wade-accent transition-colors">
            <Icons.Back />
          </button>
        </div>

        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <h2 className="font-hand text-2xl text-wade-accent capitalize pointer-events-auto">{activeMode} {activeMode === 'archive' ? 'Files' : 'Threads'}</h2>
        </div>
        
        <div className="flex items-center gap-2 z-10">
          {activeMode === 'archive' ? (
             <button onClick={() => !isUploading && archiveInputRef.current?.click()} className="w-8 h-8 shrink-0 rounded-full bg-wade-accent text-white shadow-md flex items-center justify-center hover:bg-wade-accent-hover transition-colors" title="Import Archive">
               {isUploading ? <div className="animate-spin text-[10px]">⏳</div> : <Icons.Upload />}
             </button>
          ) : (
             <button onClick={handleStartDraftSession} className="w-8 h-8 shrink-0 rounded-full bg-wade-accent text-white shadow-md flex items-center justify-center hover:bg-wade-accent-hover transition-colors">
               <Icons.Plus />
             </button>
          )}
          <input type="file" ref={archiveInputRef} className="hidden" accept=".txt" onChange={handleArchiveUpload} />
        </div>
      </div>
      
      {/* 解除了列表宽度的紧身衣，现在是 max-w-2xl */}
      <div className="flex-1 w-full max-w-2xl mx-auto overflow-y-auto px-4 md:px-6 pt-4 pb-24 custom-scrollbar space-y-3">
        {activeMode === 'archive' ? (
          isLoadingArchiveList ? (
            <div className="text-center text-wade-accent py-10 animate-pulse">Loading archives...</div>
          ) : chatArchives.length === 0 ? (
            <div className="text-center text-wade-text-muted/50 py-10 italic">No archives found. Import one above!</div>
          ) : (
            <>
              {[...chatArchives].sort((a, b) => (archiveTimestamps[b.id] || 0) - (archiveTimestamps[a.id] || 0))
              .slice((sessionPage - 1) * SESSIONS_PER_PAGE, sessionPage * SESSIONS_PER_PAGE)
              .map(arch => (
                <ArchiveItem key={arch.id} archive={arch} dateString={archiveDates[arch.id]} onOpen={(id: string) => { setActiveArchiveId(id); setViewState('chat'); }} onLongPress={setActionArchiveId} isRenaming={renamingArchiveId === arch.id} onRenameSubmit={(id: string, title: string) => { updateArchiveTitle(id, title); setRenamingArchiveId(null); }} onRenameCancel={() => setRenamingArchiveId(null)} />
              ))}
              {chatArchives.length > SESSIONS_PER_PAGE && (
                <div className="flex justify-center items-center gap-4 mt-6 pt-2">
                  <button onClick={() => setSessionPage(p => Math.max(1, p - 1))} disabled={sessionPage === 1} className="w-10 h-10 flex items-center justify-center text-wade-accent disabled:opacity-30"><Icons.ChevronLeft /></button>
                  <span className="text-xs font-bold text-wade-text-muted font-mono">{sessionPage} / {Math.ceil(chatArchives.length / SESSIONS_PER_PAGE)}</span>
                  <button onClick={() => setSessionPage(p => Math.min(Math.ceil(chatArchives.length / SESSIONS_PER_PAGE), p + 1))} disabled={sessionPage === Math.ceil(chatArchives.length / SESSIONS_PER_PAGE)} className="w-10 h-10 flex items-center justify-center text-wade-accent disabled:opacity-30"><Icons.ChevronRight /></button>
                </div>
              )}
            </>
          )
        ) : (
          modeSessions.length === 0 ? (
            <div className="text-center text-wade-text-muted text-xs mt-10">No active threads. Start a new one above!</div>
          ) : (
            <>
              {modeSessions.slice((sessionPage - 1) * SESSIONS_PER_PAGE, sessionPage * SESSIONS_PER_PAGE).map(session => (
                <SessionItem key={session.id} session={session} onOpen={(id: string) => { setActiveSessionId(id); setViewState('chat'); }} onLongPress={setActionSessionId} isRenaming={renamingSessionId === session.id} onRenameSubmit={(id: string, title: string) => { updateSessionTitle(id, title); setRenamingSessionId(null); }} onRenameCancel={() => setRenamingSessionId(null)} />
              ))}
              {modeSessions.length > SESSIONS_PER_PAGE && (
                <div className="flex justify-center items-center gap-4 mt-6 pt-2">
                  <button onClick={() => setSessionPage(p => Math.max(1, p - 1))} disabled={sessionPage === 1} className="w-10 h-10 flex items-center justify-center text-wade-accent disabled:opacity-30"><Icons.ChevronLeft /></button>
                  <span className="text-xs font-bold text-wade-text-muted font-mono">{sessionPage} / {Math.ceil(modeSessions.length / SESSIONS_PER_PAGE)}</span>
                  <button onClick={() => setSessionPage(p => Math.min(Math.ceil(modeSessions.length / SESSIONS_PER_PAGE), p + 1))} disabled={sessionPage === Math.ceil(modeSessions.length / SESSIONS_PER_PAGE)} className="w-10 h-10 flex items-center justify-center text-wade-accent disabled:opacity-30"><Icons.ChevronRight /></button>
                </div>
              )}
            </>
          )
        )}

        {(actionSessionId || actionArchiveId) && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-fade-in" onClick={() => { setActionSessionId(null); setActionArchiveId(null); setSessionDeleteConfirm(false); setArchiveDeleteConfirm(false); }} />
            <div className="relative w-full max-w-4xl mx-auto bg-wade-bg-card/70 backdrop-blur-2xl rounded-t-[32px] shadow-2xl border-t border-wade-accent/20 p-6 animate-slide-up">
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-wade-border rounded-full opacity-50" />
              <div className="grid grid-cols-3 gap-4 justify-items-center">
                <button onClick={() => { if (actionSessionId) setRenamingSessionId(actionSessionId); if (actionArchiveId) setRenamingArchiveId(actionArchiveId); setActionSessionId(null); setActionArchiveId(null); }} className="flex flex-col items-center gap-2 group">
                  <div className="w-12 h-12 bg-wade-bg-app rounded-full flex items-center justify-center text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white transition-colors shadow-sm"><Icons.Edit /></div>
                  <span className="text-[10px] text-wade-text-muted">Edit Title</span>
                </button>
                {actionSessionId && (
                  <button onClick={() => { toggleSessionPin(actionSessionId); setActionSessionId(null); }} className="flex flex-col items-center gap-2 group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${sessions.find(s => s.id === actionSessionId)?.isPinned ? 'bg-wade-accent text-white' : 'bg-wade-bg-app text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white'}`}><Icons.Pin /></div>
                    <span className="text-[10px] text-wade-text-muted">{sessions.find(s => s.id === actionSessionId)?.isPinned ? 'Unpin' : 'Pin'}</span>
                  </button>
                )}
                {actionArchiveId && (
                  <button onClick={() => { setActionArchiveId(null); alert("Favorite function pending integration in core."); }} className="flex flex-col items-center gap-2 group">
                    <div className="w-12 h-12 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted group-hover:bg-wade-accent group-hover:text-white transition-colors shadow-sm"><Icons.Heart filled={false} /></div>
                    <span className="text-[10px] text-wade-text-muted">Favorite</span>
                  </button>
                )}
                <button onClick={() => {
                  if (actionSessionId) { if (sessionDeleteConfirm) { deleteSession(actionSessionId); setActionSessionId(null); setSessionDeleteConfirm(false); } else { setSessionDeleteConfirm(true); } }
                  if (actionArchiveId) { if (archiveDeleteConfirm) { deleteArchive(actionArchiveId); setActionArchiveId(null); setArchiveDeleteConfirm(false); } else { setArchiveDeleteConfirm(true); } }
                }} className="flex flex-col items-center gap-2 group">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm ${(sessionDeleteConfirm || archiveDeleteConfirm) ? 'bg-red-500 text-white animate-pulse' : 'bg-wade-bg-app text-red-400 group-hover:bg-red-400 group-hover:text-white'}`}>{(sessionDeleteConfirm || archiveDeleteConfirm) ? <Icons.Check /> : <Icons.Trash />}</div>
                  <span className={`text-[10px] ${(sessionDeleteConfirm || archiveDeleteConfirm) ? 'text-red-500 font-bold' : 'text-wade-text-muted'}`}>{(sessionDeleteConfirm || archiveDeleteConfirm) ? 'Confirm?' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};