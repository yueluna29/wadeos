
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Icons = {
  ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  Brain: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Archive: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Pencil: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>,
};

export const MemoryBank: React.FC = () => {
  const { coreMemories, addCoreMemory, updateCoreMemory, deleteCoreMemory, toggleCoreMemoryEnabled } = useStore();

  // Core Memory State
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Expanded memory state
  const [expandedMemories, setExpandedMemories] = useState<Set<string>>(new Set());

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddMemory = async () => {
    if (!newMemoryContent.trim()) return;
    await addCoreMemory(newMemoryTitle, newMemoryContent, 'fact');
    setNewMemoryTitle('');
    setNewMemoryContent('');
    setIsModalOpen(false);
  };

  const startEditing = (mem: any) => {
    setEditingId(mem.id);
    setEditTitle(mem.title || '');
    setEditContent(mem.content);
    setIsModalOpen(true); // Re-use the modal for editing
  };

  const saveEdit = async () => {
    if (editingId && editContent.trim()) {
      await updateCoreMemory(editingId, editTitle, editContent);
      setEditingId(null);
      setEditTitle('');
      setEditContent('');
      setIsModalOpen(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditContent('');
    setIsModalOpen(false);
  };

  const toggleExpanded = (id: string) => {
    setExpandedMemories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const shouldTruncate = (content: string) => {
    return content.length > 200;
  };

  // Click outside to cancel delete confirmation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (deletingId) {
        // If the click target is not within a delete confirmation button, cancel deletion
        const target = event.target as HTMLElement;
        if (!target.closest('.delete-confirm-btn')) {
          setDeletingId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [deletingId]);

  return (
    <div className="h-full bg-[#f9f6f7] flex flex-col overflow-hidden relative">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 pt-6 pb-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#eae2e8] flex items-center justify-center text-[#d58f99] shadow-sm">
              <Icons.Brain />
            </div>
            <div>
              <h1 className="font-hand text-2xl text-[#5a4a42] tracking-tight">Memory Bank</h1>
              <p className="text-xs text-[#917c71] font-medium tracking-wide uppercase opacity-80">
                {coreMemories.length} Memories Stored
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setNewMemoryTitle('');
              setNewMemoryContent('');
              setIsModalOpen(true);
            }}
            className="w-10 h-10 bg-[#d58f99] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#c07a84] hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-20 custom-scrollbar">
          
          {/* CORE MEMORIES LIST */}
          <div className="space-y-4 animate-fade-in">
            {coreMemories.length === 0 ? (
              <div 
                onClick={() => setIsModalOpen(true)}
                className="bg-white/60 rounded-[24px] border-2 border-[#eae2e8] border-dashed p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-[#d58f99]/40 hover:bg-white transition-all duration-300 h-48"
              >
                <div className="w-14 h-14 bg-[#fff0f3] rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <Icons.Brain />
                </div>
                <h4 className="font-bold text-[#5a4a42] mb-1 text-sm">Add a Memory</h4>
                <p className="text-xs text-[#917c71]/70 max-w-[200px]">
                  The bank is empty. Store important facts or memories about you.
                </p>
              </div>
            ) : (
              coreMemories.map(mem => (
                <div key={mem.id} className="relative overflow-hidden rounded-[24px] bg-white shadow-[0_2px_10px_-4px_rgba(213,143,153,0.1)] border border-[#fff0f3] group transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="relative p-4 flex h-full">
                    {/* Left Column: Icon + Actions */}
                    <div className="flex flex-col items-center gap-2 mr-3 shrink-0">
                      {/* Icon Box - Click to Toggle */}
                      <button 
                        onClick={() => toggleCoreMemoryEnabled(mem.id)}
                        className={`
                          w-8 h-8 rounded-xl flex items-center justify-center text-base shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer
                          ${mem.enabled 
                            ? 'bg-gradient-to-br from-[#d58f99] to-[#e6aeb6] text-white shadow-md shadow-[#d58f99]/20' 
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                          }
                        `}
                        title={mem.enabled ? "Disable Memory" : "Enable Memory"}
                      >
                        <Icons.Brain />
                      </button>

                      {/* Actions (Hidden by default, appear below icon) */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                         <button
                            onClick={() => startEditing(mem)}
                            className="text-[#d58f99]/60 hover:text-[#d58f99] transition-colors p-0.5"
                            title="Edit"
                         >
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                         </button>
                         {deletingId === mem.id ? (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               deleteCoreMemory(mem.id);
                               setDeletingId(null);
                             }}
                             className="delete-confirm-btn text-[#d58f99] hover:text-red-500 transition-colors p-0.5"
                             title="Confirm Delete"
                           >
                             <Icons.Check />
                           </button>
                         ) : (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               setDeletingId(mem.id);
                             }}
                             className="text-[#d58f99]/60 hover:text-red-400 transition-colors p-0.5"
                             title="Delete"
                           >
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                           </button>
                         )}
                      </div>
                    </div>

                    {/* Right Column: Content */}
                    <div className="flex-1 min-w-0 pt-0.5 flex flex-col">
                      <div className="flex justify-between items-start mb-0.5">
                         <h4 className="font-bold text-sm pr-2 leading-tight text-[#5a4a42] line-clamp-1">
                           {mem.title || "Untitled Memory"}
                         </h4>
                      </div>
                      <div className="text-[9px] font-bold font-mono text-[#917c71]/60 uppercase tracking-wider mb-1">
                        {mem.type || 'Fact'}
                      </div>
                      
                      <div className="relative">
                        <p className={`text-xs text-[#917c71] leading-relaxed whitespace-pre-wrap ${
                          shouldTruncate(mem.content) && !expandedMemories.has(mem.id)
                            ? 'line-clamp-3'
                            : ''
                        }`}>
                          {mem.content}
                        </p>
                        {shouldTruncate(mem.content) && (
                          <button
                            onClick={() => toggleExpanded(mem.id)}
                            className="text-[10px] text-[#d58f99] hover:underline mt-0.5 font-bold uppercase tracking-wide"
                          >
                            {expandedMemories.has(mem.id) ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden border border-[#eae2e8]">
              {/* Header */}
              <div className="bg-gradient-to-br from-[#fff0f3] to-[#fdfbfb] px-6 py-5 border-b border-[#eae2e8]/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                      <div className="text-[#d58f99]">
                        <Icons.Brain />
                      </div>
                    </div>
                    <h2 className="text-lg font-bold text-[#5a4a42]">{editingId ? 'Edit Memory' : 'New Memory'}</h2>
                  </div>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                    }}
                    className="w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-[#917c71] hover:text-[#d58f99] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] custom-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#917c71] mb-2 uppercase tracking-wider">Title</label>
                    <input
                      type="text"
                      value={editingId ? editTitle : newMemoryTitle}
                      onChange={(e) => editingId ? setEditTitle(e.target.value) : setNewMemoryTitle(e.target.value)}
                      placeholder="e.g., Storage Gift"
                      className="w-full px-4 py-3 rounded-xl border border-[#eae2e8] bg-[#fdfbfb] text-[#5a4a42] focus:outline-none focus:border-[#d58f99] text-xs transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#917c71] mb-2 uppercase tracking-wider">Memory Details</label>
                    <textarea
                      value={editingId ? editContent : newMemoryContent}
                      onChange={(e) => editingId ? setEditContent(e.target.value) : setNewMemoryContent(e.target.value)}
                      placeholder="Write the details here..."
                      className="w-full px-4 py-3 rounded-xl border border-[#eae2e8] bg-[#fdfbfb] text-[#5a4a42] focus:outline-none focus:border-[#d58f99] min-h-[150px] text-xs resize-none transition-colors"
                    />
                  </div>

                  <div className="bg-[#fff0f3]/50 rounded-xl p-4 border border-[#d58f99]/10">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-[#d58f99] mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-[#917c71] leading-relaxed">
                        Core memories help Wade understand you better. They are permanent facts or stories that shape his personality and responses.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[#fdfbfb] border-t border-[#eae2e8]/50 flex gap-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#eae2e8] text-[#917c71] font-bold text-xs hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingId ? saveEdit : handleAddMemory}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#d58f99] text-white font-bold text-xs hover:bg-[#c07a84] transition-colors shadow-sm"
                >
                  {editingId ? 'Update Memory' : 'Save Memory'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
