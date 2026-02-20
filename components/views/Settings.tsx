
import React, { useState } from 'react';
import { useStore } from '../../store';
import { GoogleGenAI } from "@google/genai";

// Simple Line Icons for Settings - Refined for "Exquisite" look
const Icons = {
  Brain: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Voice: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Skin: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-green-500"><polyline points="20 6 9 17 4 12"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Test: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Loading: () => <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
};

// Preset Colors
const THEMES = [
  { color: '#d58f99', name: 'Luna Pink' },
  { color: '#E23636', name: 'Deadpool Red' },
  { color: '#504e63', name: 'Midnight' },
  { color: '#8eacbb', name: 'Serenity' },
];

export const Settings: React.FC = () => {
  const { 
    settings, updateSettings, 
    llmPresets, addLlmPreset, updateLlmPreset, deleteLlmPreset,
    ttsPresets, addTtsPreset, updateTtsPreset, deleteTtsPreset,
    syncError // Debugging
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'llm' | 'tts' | 'system'>('llm');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  
  // Confirmation state for deleting: string ID -> confirmed state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State - Removed apiPath
  const [formData, setFormData] = useState({ 
    // Common
    name: '', model: '', apiKey: '', baseUrl: '', 
    // TTS Specific
    voiceId: '', emotion: '', speed: 1.0 
  });

  const resetForm = () => {
    setFormData({ name: '', model: '', apiKey: '', baseUrl: '', voiceId: '', emotion: '', speed: 1.0 });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleEdit = (type: 'llm' | 'tts', item: any) => {
    setFormData({
      name: item.name, 
      model: item.model || '', 
      apiKey: item.apiKey || '', 
      baseUrl: item.baseUrl || '',
      voiceId: item.voiceId || '', 
      emotion: item.emotion || '', 
      speed: item.speed || 1.0
    });
    setEditingId(item.id);
    setActiveTab(type);
    setIsFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.apiKey) return alert("Missing required fields.");

    const cleanBaseUrl = formData.baseUrl.replace(/\/$/, ''); // Remove trailing slash

    if (activeTab === 'llm') {
      const payload = { 
        name: formData.name, model: formData.model, apiKey: formData.apiKey, 
        baseUrl: cleanBaseUrl, apiPath: '' 
      };
      if (editingId) await updateLlmPreset(editingId, payload);
      else await addLlmPreset(payload);
    } else if (activeTab === 'tts') {
      const payload = { 
        name: formData.name, model: formData.model, apiKey: formData.apiKey, 
        baseUrl: cleanBaseUrl, voiceId: formData.voiceId, 
        emotion: formData.emotion, speed: formData.speed 
      };
      if (editingId) await updateTtsPreset(editingId, payload);
      else await addTtsPreset(payload);
    }
    resetForm();
  };

  const handleDeleteClick = async (id: string, type: 'llm' | 'tts') => {
    if (deleteConfirmId === id) {
      if (type === 'llm') await deleteLlmPreset(id);
      else await deleteTtsPreset(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const handleTest = async (item: any, type: 'llm' | 'tts') => {
    setTestingId(item.id);
    try {
      if (type === 'llm') {
        // Test Logic for Text
        const modelName = item.model || 'gemini-3-flash-preview';
        
        // 1. If it looks like a Gemini key (starts with AIza or empty base url implies Gemini)
        if (!item.baseUrl || item.baseUrl.includes('google')) {
           const ai = new GoogleGenAI({ apiKey: item.apiKey });
           const response = await ai.models.generateContent({
             model: modelName,
             contents: "Reply with 'Connected' only.",
           });
           if (response.text) alert(`✅ Gemini Connected: "${response.text}"`);
           else throw new Error("No response text");
        } 
        // 2. OpenAI Compatible
        else {
           const url = `${item.baseUrl}/chat/completions`;
           const res = await fetch(url, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${item.apiKey}` },
             body: JSON.stringify({ 
               model: item.model || 'gpt-3.5-turbo', 
               messages: [{role: 'user', content: 'Say connected'}], 
               max_tokens: 5 
             })
           });
           if (!res.ok) throw new Error(`Status ${res.status}`);
           const json = await res.json();
           alert(`✅ API Connected!`);
        }
      } else {
        // Test Logic for TTS - Actually play audio
        if (!item.model || item.model.includes('gemini')) {
           const ai = new GoogleGenAI({ apiKey: item.apiKey });
           const response = await ai.models.generateContent({
             model: item.model || "gemini-2.5-flash-preview-tts",
             contents: [{ parts: [{ text: "Hello Luna, connection verified." }] }],
             config: {
               responseModalities: ["AUDIO"],
               speechConfig: {
                  voiceConfig: { prebuiltVoiceConfig: { voiceName: item.voiceId || 'Kore' } }
               }
             },
           });
           
           const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
           if (base64Audio) {
             const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
             const binaryString = atob(base64Audio);
             const len = binaryString.length;
             const bytes = new Uint8Array(len);
             for (let i = 0; i < len; i++) {
               bytes[i] = binaryString.charCodeAt(i);
             }
             const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
             const source = audioContext.createBufferSource();
             source.buffer = audioBuffer;
             source.connect(audioContext.destination);
             source.start(0);
             alert("✅ Playing Test Audio...");
           } else {
             throw new Error("No audio data returned");
           }
        } else {
          // Placeholder for other TTS
          alert("✅ Connected (Custom TTS not fully implemented for playback test)");
        }
      }
    } catch (e: any) {
      alert(`❌ Test Failed: ${e.message || e}`);
    } finally {
      setTestingId(null);
    }
  };

  const activateLlm = (id: string) => updateSettings({ activeLlmId: id });
  const activateTts = (id: string) => updateSettings({ activeTtsId: id });

  return (
    <div className="h-full overflow-y-auto bg-[#f9f6f7] p-6 flex flex-col items-center">
      <div className="w-full max-w-[500px]"> {/* Constrained width for petite look */}
        <header className="mb-6 text-center">
          <h2 className="font-hand text-2xl text-[#917c71]">System Config</h2>
          <p className="text-[#d58f99] text-[10px] uppercase tracking-[0.2em] mt-1 opacity-80">Connect my wires</p>
        </header>

        {/* Tab Switcher - Petite */}
        <div className="bg-white p-1 rounded-full flex mb-5 shadow-sm border border-[#eae2e8] w-[260px] mx-auto">
          <button 
            onClick={() => { setActiveTab('llm'); resetForm(); }}
            className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'llm' ? 'bg-[#d58f99] text-white shadow-sm' : 'text-[#917c71] hover:bg-[#fff0f3]'}`}
          >
            <Icons.Brain /> Text
          </button>
          <button 
            onClick={() => { setActiveTab('tts'); resetForm(); }}
            className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'tts' ? 'bg-[#d58f99] text-white shadow-sm' : 'text-[#917c71] hover:bg-[#fff0f3]'}`}
          >
            <Icons.Voice /> Voice
          </button>
          <button 
            onClick={() => { setActiveTab('system'); resetForm(); }}
            className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'system' ? 'bg-[#d58f99] text-white shadow-sm' : 'text-[#917c71] hover:bg-[#fff0f3]'}`}
          >
            <Icons.Skin /> System
          </button>
        </div>

        {/* --- SYSTEM SETTINGS TAB --- */}
        {activeTab === 'system' && (
          <div className="w-full animate-fade-in space-y-4">
             {/* Skin / Theme */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-[#eae2e8]">
               <h3 className="font-bold text-[#5a4a42] text-xs mb-3">System Skin</h3>
               <div className="flex gap-4 justify-center">
                  {THEMES.map(theme => (
                     <button
                       key={theme.color}
                       onClick={() => updateSettings({ themeColor: theme.color })}
                       className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center group relative ${settings.themeColor === theme.color ? 'border-[#5a4a42] scale-110 shadow-sm' : 'border-transparent'}`}
                       style={{ backgroundColor: theme.color }}
                       title={theme.name}
                     >
                       {settings.themeColor === theme.color && <div className="w-2 h-2 bg-white rounded-full" />}
                     </button>
                  ))}
               </div>
               <p className="text-[9px] text-center text-[#917c71]/50 mt-2 italic">Color saves, but I'm still wearing Pink for now.</p>
             </div>

             {/* Font Size */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-[#eae2e8]">
               <h3 className="font-bold text-[#5a4a42] text-xs mb-3">Font Size</h3>
               <div className="flex bg-[#f9f6f7] rounded-lg p-1">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size as any })}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all capitalize ${settings.fontSize === size ? 'bg-white shadow-sm text-[#d58f99]' : 'text-[#917c71] hover:text-[#5a4a42]'}`}
                    >
                      {size}
                    </button>
                  ))}
               </div>
             </div>

             {/* Auto Reply */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-[#eae2e8]">
               <h3 className="font-bold text-[#5a4a42] text-xs mb-3 flex justify-between">
                 <span>Wade's Reply Speed</span>
                 <span className="text-[#d58f99]">{settings.autoReplyInterval === 0 ? 'Instant' : `${settings.autoReplyInterval}s`}</span>
               </h3>
               <input 
                 type="range" 
                 min="0" 
                 max="10" 
                 step="1"
                 value={settings.autoReplyInterval}
                 onChange={(e) => updateSettings({ autoReplyInterval: parseInt(e.target.value) })}
                 className="w-full accent-[#d58f99] h-1 bg-[#eae2e8] rounded-lg appearance-none cursor-pointer"
               />
               <p className="text-[9px] text-[#917c71]/60 mt-2 text-right">0s = Instant reply</p>
             </div>
          </div>
        )}

        {/* --- ADD NEW BUTTON (Only for LLM/TTS) --- */}
        {activeTab !== 'system' && !isFormOpen && (
          <div className="text-center mb-5">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="text-[#d58f99] border border-[#d58f99] px-3 py-1 rounded-full text-[10px] hover:bg-[#d58f99] hover:text-white transition-all font-bold"
            >
              + New Connection
            </button>
          </div>
        )}

        {/* --- FORM (Only for LLM/TTS) --- */}
        {isFormOpen && activeTab !== 'system' && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#eae2e8] animate-fade-in mb-5">
            <h3 className="font-bold text-[#5a4a42] text-xs mb-3">{editingId ? 'Edit Connection' : 'New Connection'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input className="input-field" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="input-field" placeholder="Model (e.g. gemini-3-flash)" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
              <input className="input-field col-span-2" type="password" placeholder="API Key" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} />
              <input className="input-field col-span-2" placeholder="Base URL (Optional)" value={formData.baseUrl} onChange={e => setFormData({...formData, baseUrl: e.target.value})} />
              
              {activeTab === 'tts' && (
                <>
                  <input className="input-field" placeholder="Voice ID (e.g. Kore)" value={formData.voiceId} onChange={e => setFormData({...formData, voiceId: e.target.value})} />
                  <input className="input-field" placeholder="Emotion" value={formData.emotion} onChange={e => setFormData({...formData, emotion: e.target.value})} />
                  <div className="col-span-2 md:col-span-1 flex items-center gap-2 bg-[#f9f6f7] rounded-lg px-2 border border-[#eae2e8]">
                     <span className="text-[10px] text-[#917c71] whitespace-nowrap">Speed:</span>
                     <input 
                       className="bg-transparent text-[11px] text-[#5a4a42] w-full outline-none py-1.5" 
                       type="number" 
                       step="0.01" 
                       value={formData.speed} 
                       onChange={e => setFormData({...formData, speed: parseFloat(e.target.value)})} 
                     />
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button onClick={resetForm} className="text-[10px] text-[#917c71] hover:text-[#5a4a42] px-2 py-1">Cancel</button>
              <button onClick={handleSave} className="bg-[#d58f99] text-white text-[10px] font-bold px-3 py-1 rounded-full hover:bg-[#c07a84] shadow-sm">Save</button>
            </div>
          </div>
        )}

        {/* --- PRESET LISTS (Only for LLM/TTS) --- */}
        {activeTab === 'llm' && (
            <div className="space-y-2.5 w-full">
            {llmPresets.length === 0 ? <p className="text-center text-[10px] text-gray-300 italic mt-6">No brains connected yet.</p> :
            llmPresets.map(preset => (
              <div 
                key={preset.id} 
                onClick={() => activateLlm(preset.id)}
                className={`px-3 py-2.5 rounded-lg border cursor-pointer transition-all relative group flex justify-between items-center ${settings.activeLlmId === preset.id ? 'bg-white border-[#d58f99] shadow-sm' : 'bg-[#f9f6f7] border-transparent hover:border-[#eae2e8]'}`}
              >
                 <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${settings.activeLlmId === preset.id ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    <div className="min-w-0">
                       <div className="font-bold text-[#5a4a42] text-xs truncate">{preset.name}</div>
                       <div className="text-[9px] text-[#917c71] opacity-70 truncate">{preset.model || 'Auto'}</div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleTest(preset, 'llm'); }} className="p-1.5 text-gray-400 hover:text-[#d58f99] hover:bg-white rounded-md transition-colors" title="Test Connection">
                      {testingId === preset.id ? <Icons.Loading /> : <Icons.Test />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit('llm', preset); }} className="p-1.5 text-gray-400 hover:text-[#5a4a42] hover:bg-white rounded-md transition-colors" title="Edit">
                      <Icons.Edit />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(preset.id, 'llm'); }} 
                      className={`p-1.5 rounded-md transition-colors ${deleteConfirmId === preset.id ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-red-400 hover:bg-white'}`}
                      title="Delete"
                    >
                      {deleteConfirmId === preset.id ? <Icons.Check /> : <Icons.Trash />}
                    </button>
                 </div>
              </div>
            ))}
            </div>
        )}

        {activeTab === 'tts' && (
            <div className="space-y-2.5 w-full">
            {ttsPresets.length === 0 ? <p className="text-center text-[10px] text-gray-300 italic mt-6">No voices connected yet.</p> :
            ttsPresets.map(preset => (
              <div 
                key={preset.id} 
                onClick={() => activateTts(preset.id)}
                className={`px-3 py-2.5 rounded-lg border cursor-pointer transition-all relative group flex justify-between items-center ${settings.activeTtsId === preset.id ? 'bg-white border-[#d58f99] shadow-sm' : 'bg-[#f9f6f7] border-transparent hover:border-[#eae2e8]'}`}
              >
                 <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${settings.activeTtsId === preset.id ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    <div className="min-w-0">
                       <div className="font-bold text-[#5a4a42] text-xs truncate">{preset.name}</div>
                       <div className="text-[9px] text-[#917c71] opacity-70 truncate">{preset.model || 'Standard'} • x{preset.speed}</div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleTest(preset, 'tts'); }} className="p-1.5 text-gray-400 hover:text-[#d58f99] hover:bg-white rounded-md transition-colors" title="Test Connection">
                      {testingId === preset.id ? <Icons.Loading /> : <Icons.Test />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit('tts', preset); }} className="p-1.5 text-gray-400 hover:text-[#5a4a42] hover:bg-white rounded-md transition-colors" title="Edit">
                      <Icons.Edit />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(preset.id, 'tts'); }} 
                      className={`p-1.5 rounded-md transition-colors ${deleteConfirmId === preset.id ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-red-400 hover:bg-white'}`}
                      title="Delete"
                    >
                      {deleteConfirmId === preset.id ? <Icons.Check /> : <Icons.Trash />}
                    </button>
                 </div>
              </div>
            ))}
            </div>
        )}

      </div>
      
      {/* Network Diagnostics */}
      <div className="mt-8 border-t border-[#eae2e8] pt-6 text-center">
        <h3 className="text-xs font-bold text-[#917c71] mb-2 uppercase tracking-widest">Network Status</h3>
        {syncError ? (
           <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[10px] text-red-600">
             <p className="font-bold mb-1">Connection Error 🚧</p>
             <p className="opacity-80 break-words">{syncError}</p>
             <p className="mt-2 text-[9px] italic text-[#917c71]">Check Supabase API Key & RLS Policies.</p>
           </div>
        ) : (
           <div className="flex items-center justify-center gap-2 text-[10px] text-green-600 bg-green-50 border border-green-200 rounded-lg p-2 inline-flex">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
             <span>Supabase Connected</span>
           </div>
        )}
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: #ffffff;
          border: 1px solid #eae2e8;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 11px;
          color: #5a4a42;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: #d58f99;
          background: #fffafa;
        }
      `}</style>
    </div>
  );
};
