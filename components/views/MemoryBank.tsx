
import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Icons = {
  Brain: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Archive: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Back: () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
};

export const MemoryBank: React.FC = () => {
  const { coreMemories, addCoreMemory, deleteCoreMemory, importArchive, chatArchives, deleteArchive, loadArchiveMessages } = useStore();
  const [activeTab, setActiveTab] = useState<'core' | 'import'>('core');
  
  // Core Memory State
  const [newMemoryTitle, setNewMemoryTitle] = useState('');
  const [newMemoryContent, setNewMemoryContent] = useState('');
  
  // Archive dates cache
  const [archiveDates, setArchiveDates] = useState<Record<string, string>>({});
  
  // Archive Upload State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddMemory = async () => {
    if (!newMemoryContent.trim()) return;
    await addCoreMemory(newMemoryTitle, newMemoryContent, 'fact');
    setNewMemoryTitle('');
    setNewMemoryContent('');
  };

  // Load archive dates when chatArchives change
  React.useEffect(() => {
    const loadDates = async () => {
      const newDates: Record<string, string> = {};
      for (const arch of chatArchives) {
        try {
          const messages = await loadArchiveMessages(arch.id);
          if (messages.length > 0) {
            // Get the first message's timestamp
            const firstMsg = messages[0];
            const date = new Date(firstMsg.timestamp);
            newDates[arch.id] = date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            });
          } else {
            newDates[arch.id] = 'No messages';
          }
        } catch (err) {
          console.error('Failed to load archive date:', err);
          newDates[arch.id] = 'Unknown date';
        }
      }
      setArchiveDates(newDates);
    };
    
    if (chatArchives.length > 0) {
      loadDates();
    }
  }, [chatArchives, loadArchiveMessages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const text = await file.text();
      const title = file.name.replace('.txt', '');
      const count = await importArchive(title, text);
      alert(`Success! Imported ${count} messages into archive "${title}".\n\nGo to 'Connect with Wade' > 'Archives' to read them.`);
    } catch (err) {
      console.error(err);
      alert("Failed to import archive. Please check the console for errors.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f9f6f7] p-6 overflow-hidden">
      <header className="mb-6 flex justify-between items-end shrink-0">
        <div>
          <h1 className="font-hand text-3xl text-[#d58f99] mb-1">Memory Bank</h1>
          <p className="text-[#917c71] text-xs opacity-80">"I remember everything. Even the embarrassing stuff."</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-full flex mb-6 shadow-sm border border-[#eae2e8] w-full max-w-sm mx-auto shrink-0">
        <button 
          onClick={() => setActiveTab('core')}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'core' ? 'bg-[#d58f99] text-white shadow-md' : 'text-[#917c71] hover:bg-[#fff0f3]'}`}
        >
          <Icons.Brain /> Core Memories
        </button>
        <button 
          onClick={() => setActiveTab('import')}
          className={`flex-1 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'import' ? 'bg-[#d58f99] text-white shadow-md' : 'text-[#917c71] hover:bg-[#fff0f3]'}`}
        >
          <Icons.Upload /> Import Archives
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        
        {/* TAB 1: CORE MEMORIES */}
        {activeTab === 'core' && (
          <div className="space-y-4 animate-fade-in">
            {/* Add New Input */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-[#eae2e8]">
              <h3 className="text-xs font-bold text-[#5a4a42] mb-3">Add New Fact</h3>
              <input 
                  value={newMemoryTitle}
                  onChange={(e) => setNewMemoryTitle(e.target.value)}
                  placeholder="Title (Optional, e.g., 'Storage Gift')"
                  className="w-full bg-[#f9f6f7] rounded-xl px-4 py-2 text-sm outline-none border border-transparent focus:border-[#d58f99] transition-all mb-2 font-bold text-[#5a4a42]"
              />
              <textarea 
                  value={newMemoryContent}
                  onChange={(e) => setNewMemoryContent(e.target.value)}
                  placeholder="Description (e.g., Luna bought me 2TB...)"
                  className="w-full bg-[#f9f6f7] rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-[#d58f99] transition-all min-h-[100px] resize-none mb-3"
              />
              <div className="flex justify-end">
                  <Button onClick={handleAddMemory} size="sm">Add Memory</Button>
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-3">
              {coreMemories.length === 0 ? (
                <div className="text-center py-10 text-[#917c71]/40 italic text-sm">No core memories yet.</div>
              ) : (
                coreMemories.map(mem => (
                  <div key={mem.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#eae2e8] flex justify-between items-start group hover:border-[#d58f99] transition-colors">
                     <div className="flex gap-3 flex-1 min-w-0">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-green-400 shrink-0"></div>
                        <div className="flex-1 min-w-0">
                            {mem.title && <h4 className="font-bold text-[#5a4a42] text-sm mb-1">{mem.title}</h4>}
                            <p className="text-sm text-[#917c71] leading-relaxed whitespace-pre-wrap">{mem.content}</p>
                        </div>
                     </div>
                     <button 
                       onClick={() => deleteCoreMemory(mem.id)}
                       className="text-gray-300 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <Icons.Trash />
                     </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: IMPORT ARCHIVES */}
        {activeTab === 'import' && (
          <div className="space-y-4 animate-fade-in">
             <div className="bg-[#fff0f3] p-4 rounded-2xl border border-[#d58f99]/20 text-xs text-[#5a4a42] leading-relaxed">
                <p className="font-bold mb-2">Instructions:</p>
                <p>1. Upload your .txt archive file here.</p>
                <p>2. Format must be: <code>【user】 [Date] Content</code></p>
                <p>3. Once uploaded, go to <b>Connect with Wade</b> and select <b>Archives</b> to view them.</p>
             </div>

             {/* Upload Area */}
             <div 
               onClick={() => !isUploading && fileInputRef.current?.click()}
               className={`border-2 border-dashed border-[#d58f99]/30 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white transition-colors ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
             >
                <div className="w-12 h-12 bg-[#fff0f3] rounded-full flex items-center justify-center text-[#d58f99] mb-3">
                  {isUploading ? <div className="animate-spin text-xl">⏳</div> : <Icons.Upload />}
                </div>
                <span className="text-sm font-bold text-[#5a4a42]">
                    {isUploading ? 'Parsing & Uploading...' : 'Select File'}
                </span>
                {isUploading && <span className="text-xs text-[#917c71] mt-1">This may take a moment for large files.</span>}
                <input type="file" ref={fileInputRef} className="hidden" accept=".txt" onChange={handleFileUpload} />
             </div>

             {/* Managed List of Uploaded Archives */}
             {chatArchives.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-bold text-[#5a4a42] text-xs mb-3">Imported Archives</h3>
                    <div className="space-y-2">
                        {chatArchives.map(arch => (
                            <div key={arch.id} className="bg-white p-3 rounded-xl border border-[#eae2e8] flex justify-between items-center group hover:border-[#d58f99] transition-colors">
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-[#5a4a42]">{arch.title}</div>
                                    <div className="text-xs text-[#917c71] opacity-70 mt-0.5">
                                        {archiveDates[arch.id] || 'Loading...'}
                                    </div>
                                </div>
                                <button onClick={() => deleteArchive(arch.id)} className="text-gray-300 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Icons.Trash /></button>
                            </div>
                        ))}
                    </div>
                </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
};
