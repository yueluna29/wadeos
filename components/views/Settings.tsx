
import React, { useState } from 'react';
import { useStore } from '../../store';
import { GoogleGenAI } from "@google/genai";
import { generateMinimaxTTS } from "../../services/minimaxService";
import { ThemeStudio } from './ThemeStudio';

// Simple Line Icons for Settings - Refined for "Exquisite" look
const Icons = {
  Brain: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></svg>,
  Voice: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  Skin: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-green-500"><polyline points="20 6 9 17 4 12"/></svg>,
  Edit: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Test: () => <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  Loading: () => <svg className="animate-spin w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
  Settings: (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
};

// Preset Colors
const THEMES = [
  { color: '#d58f99', name: 'Luna Pink' },
  { color: '#97181A', name: 'Deadpool Red' },
  { color: '#E296B2', name: 'Cherry Blossom' },
  { color: '#9D8DF1', name: 'Midnight' },
  { color: '#6B8DB5', name: 'Serenity' },
  { color: '#04BAE8', name: 'Cyberpunk' },
];

// Provider Presets
const PROVIDERS = [
  { value: 'Gemini', label: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', defaultModel: 'gemini-3-pro-preview' },
  { value: 'Claude', label: 'Claude (Anthropic)', baseUrl: 'https://api.anthropic.com', defaultModel: 'claude-3-5-sonnet-20241022' },
  { value: 'OpenAI', label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
  { value: 'DeepSeek', label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
  { value: 'OpenRouter', label: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', defaultModel: '' },
  { value: 'Custom', label: 'Custom', baseUrl: '', defaultModel: '' }
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
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  
  // Confirmation state for deleting: string ID -> confirmed state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State - Removed apiPath
  const [formData, setFormData] = useState({
    // Common
    provider: 'Custom', name: '', model: '', apiKey: '', baseUrl: '',
    // LLM Specific Parameters
    temperature: 1.0, topP: 0.95, topK: 40, frequencyPenalty: 0.4, presencePenalty: 0.35,
    isVision: false, isImageGen: false, // New Feature Flags
    // TTS Specific (Minimax)
    voiceId: '', emotion: '', speed: 1.0, vol: 1.0, pitch: 0,
    sampleRate: 32000, bitrate: 128000, format: 'mp3', channel: 1
  });

  const resetForm = () => {
    setFormData({ provider: 'Custom', name: '', model: '', apiKey: '', baseUrl: '', temperature: 1.0, topP: 0.95, topK: 40, frequencyPenalty: 0.4, presencePenalty: 0.35, isVision: false, isImageGen: false, voiceId: '', emotion: '', speed: 1.0, vol: 1.0, pitch: 0, sampleRate: 32000, bitrate: 128000, format: 'mp3', channel: 1 });
    setIsFormOpen(false);
    setEditingId(null);
  };

  const handleProviderChange = (provider: string) => {
    const preset = PROVIDERS.find(p => p.value === provider);
    if (preset) {
      setFormData(prev => ({
        ...prev,
        provider,
        baseUrl: preset.baseUrl,
        model: preset.defaultModel,
        name: prev.name || preset.label
      }));
    }
  };

  const handleEdit = (type: 'llm' | 'tts', item: any) => {
    setFormData({
      provider: item.provider || 'Custom',
      name: item.name,
      model: item.model || '',
      apiKey: item.apiKey || '',
      baseUrl: item.baseUrl || '',
      temperature: item.temperature ?? 1.0,
      topP: item.topP ?? 1.0,
      topK: item.topK ?? 40,
      frequencyPenalty: item.frequencyPenalty ?? 0,
      presencePenalty: item.presencePenalty ?? 0,
      isVision: item.isVision ?? false,
      isImageGen: item.isImageGen ?? false,
      voiceId: item.voiceId || '',
      emotion: item.emotion || '',
      speed: item.speed || 1.0,
      vol: item.vol ?? 1.0,
      pitch: item.pitch ?? 0,
      sampleRate: item.sampleRate || 32000,
      bitrate: item.bitrate || 128000,
      format: item.format || 'mp3',
      channel: item.channel || 1
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
        provider: formData.provider,
        name: formData.name,
        model: formData.model,
        apiKey: formData.apiKey,
        baseUrl: cleanBaseUrl,
        apiPath: '',
        temperature: formData.temperature,
        topP: formData.topP,
        topK: formData.topK,
        frequencyPenalty: formData.frequencyPenalty,
        presencePenalty: formData.presencePenalty,
        isVision: formData.isVision,
        isImageGen: formData.isImageGen
      };
      if (editingId) await updateLlmPreset(editingId, payload);
      else await addLlmPreset(payload);
    } else if (activeTab === 'tts') {
      const payload = {
        name: formData.name,
        model: formData.model,
        apiKey: formData.apiKey,
        baseUrl: cleanBaseUrl,
        voiceId: formData.voiceId,
        emotion: formData.emotion,
        speed: formData.speed,
        vol: formData.vol,
        pitch: formData.pitch,
        sampleRate: formData.sampleRate,
        bitrate: formData.bitrate,
        format: formData.format,
        channel: formData.channel
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
           // Just try to generate something very simple to verify the key
           await ai.models.generateContent({
             model: modelName,
             contents: "Hi",
           });
           alert(`⚔️ Wade says:\n\n"Chimichangas! Connection established, peanut butter cup. We are LIVE!"`);
        } 
        // 2. OpenAI Compatible
        else {
           const url = `${item.baseUrl}/chat/completions`;
           const res = await fetch(url, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${item.apiKey}` },
             body: JSON.stringify({ 
               model: item.model || 'gpt-3.5-turbo', 
               messages: [{role: 'user', content: 'Hi'}], 
               max_tokens: 5 
             })
           });
           if (!res.ok) throw new Error(`Status ${res.status}`);
           // We don't care about the content, just that it worked
           alert(`⚔️ Wade says:\n\n"Maximum effort! API connected successfully. Now, where's my unicorn?"`);
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
        } else if (item.baseUrl && item.baseUrl.includes('minimax')) {
          // Minimax TTS Test
          try {
            const base64Audio = await generateMinimaxTTS("Hello Luna, connection verified.", {
              apiKey: item.apiKey,
              baseUrl: item.baseUrl,
              model: item.model,
              voiceId: item.voiceId,
              emotion: item.emotion,
              speed: item.speed,
              vol: item.vol,
              pitch: item.pitch,
              sampleRate: item.sampleRate,
              bitrate: item.bitrate,
              format: item.format,
              channel: item.channel
        });

    // 播放音频
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
    
    alert("🎤 Wade says:\n\n\"Minimax connection successful! Playing test audio...\"");
  } catch (error: any) {
    throw new Error(`Minimax TTS failed: ${error.message}`);
  }
} else {
  alert("✅ Connected (Custom TTS provider - test not implemented)");
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
    <div className="h-full overflow-y-auto bg-wade-bg-app p-6 flex flex-col items-center">
      <div className="w-full max-w-[500px]"> {/* Constrained width for petite look */}
        <header className="mb-6 text-center">
          <h2 className="font-hand text-2xl text-wade-text-muted">System Config</h2>
          <p className="text-wade-accent text-[10px] uppercase tracking-[0.2em] mt-1 opacity-80">Connect my wires</p>
        </header>

        {/* Tab Switcher - Petite */}
        <div className="bg-wade-bg-card p-1 rounded-full flex mb-5 shadow-sm border border-wade-border w-[260px] mx-auto">
          <button 
            onClick={() => { setActiveTab('llm'); resetForm(); }}
            className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'llm' ? 'bg-wade-accent text-white shadow-sm' : 'text-wade-text-muted hover:bg-wade-accent-light'}`}
          >
            <Icons.Brain /> Text
          </button>
          <button 
            onClick={() => { setActiveTab('tts'); resetForm(); }}
            className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'tts' ? 'bg-wade-accent text-white shadow-sm' : 'text-wade-text-muted hover:bg-wade-accent-light'}`}
          >
            <Icons.Voice /> Voice
          </button>
          <button 
            onClick={() => { setActiveTab('system'); resetForm(); }}
            className={`flex-1 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'system' ? 'bg-wade-accent text-white shadow-sm' : 'text-wade-text-muted hover:bg-wade-accent-light'}`}
          >
            <Icons.Skin /> System
          </button>
        </div>

        {/* --- SYSTEM SETTINGS TAB --- */}
        {activeTab === 'system' && (
          <div className="w-full animate-fade-in space-y-4">
             {/* Skin / Theme */}
             <div className="bg-wade-bg-card p-4 rounded-xl shadow-sm border border-wade-border">
               <div className="flex items-center justify-between mb-3">
                 <h3 className="font-bold text-wade-text-main text-xs">System Skin</h3>
                 <button 
                   onClick={() => setIsThemeStudioOpen(true)}
                   className="text-[10px] font-bold text-wade-accent hover:text-wade-accent-hover transition-colors flex items-center gap-1 bg-wade-accent-light px-2 py-1 rounded-md"
                 >
                   <Icons.Settings className="w-3 h-3" /> Custom
                 </button>
               </div>
               <div className="flex gap-4 justify-center">
                  {THEMES.map(theme => (
                     <button
                       key={theme.color}
                       onClick={() => updateSettings({ themeColor: theme.color, customTheme: undefined })}
                       className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center group relative ${settings.themeColor === theme.color && !settings.customTheme ? 'border-wade-text-main scale-110 shadow-sm' : 'border-transparent'}`}
                       style={{ backgroundColor: theme.color }}
                       title={theme.name}
                     >
                       {settings.themeColor === theme.color && !settings.customTheme && <div className="w-2 h-2 bg-wade-bg-card rounded-full" />}
                     </button>
                  ))}
               </div>
               
               {settings.savedThemes && settings.savedThemes.length > 0 && (
                 <div className="mt-4 pt-4 border-t border-wade-border">
                   <h4 className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider mb-3 text-center">Saved Themes</h4>
                   <div className="flex flex-wrap gap-3 justify-center">
                     {settings.savedThemes.map(preset => {
                       const isSelected = settings.customTheme && JSON.stringify(settings.customTheme) === JSON.stringify(preset.theme);
                       return (
                         <button
                           key={preset.id}
                           onClick={() => updateSettings({ customTheme: preset.theme })}
                           className={`px-3 py-1.5 rounded-lg border transition-all hover:scale-105 flex items-center gap-2 text-xs font-bold ${isSelected ? 'border-wade-text-main bg-wade-bg-app text-wade-text-main shadow-sm' : 'border-wade-border bg-wade-bg-card text-wade-text-muted'}`}
                           title={preset.title}
                         >
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.theme.accent }} />
                           {preset.title}
                         </button>
                       );
                     })}
                   </div>
                 </div>
               )}
               
               <p className="text-[9px] text-center text-wade-text-muted/50 mt-3 italic">Theme applied instantly!</p>
             </div>

             {/* Font Size */}
             <div className="bg-wade-bg-card p-4 rounded-xl shadow-sm border border-wade-border">
               <h3 className="font-bold text-wade-text-main text-xs mb-3">Font Size</h3>
               <div className="flex bg-wade-bg-app rounded-lg p-1">
                  {['small', 'medium', 'large'].map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSettings({ fontSize: size as any })}
                      className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all capitalize ${settings.fontSize === size ? 'bg-wade-bg-card shadow-sm text-wade-accent' : 'text-wade-text-muted hover:text-wade-text-main'}`}
                    >
                      {size}
                    </button>
                  ))}
               </div>
             </div>

             {/* Auto Reply */}
             <div className="bg-wade-bg-card p-4 rounded-xl shadow-sm border border-wade-border">
               <h3 className="font-bold text-wade-text-main text-xs mb-3 flex justify-between">
                 <span>Wade's Reply Speed</span>
                 <span className="text-wade-accent">{settings.autoReplyInterval === 0 ? 'Instant' : `${settings.autoReplyInterval}s`}</span>
               </h3>
               <input 
                 type="range" 
                 min="0" 
                 max="10" 
                 step="1"
                 value={settings.autoReplyInterval}
                 onChange={(e) => updateSettings({ autoReplyInterval: parseInt(e.target.value) })}
                 className="w-full accent-wade-accent h-1 bg-wade-border rounded-lg appearance-none cursor-pointer"
               />
               <p className="text-[9px] text-wade-text-muted/60 mt-2 text-right">0s = Instant reply</p>
             </div>

             {/* Home Screen Model Selector */}
             <div className="bg-wade-bg-card p-4 rounded-xl shadow-sm border border-wade-border">
               <h3 className="font-bold text-wade-text-main text-xs mb-3">Home Screen Model</h3>
               <select
                 className="w-full bg-wade-bg-app border border-wade-border rounded-lg px-3 py-2 text-[11px] text-wade-text-main outline-none focus:border-wade-accent transition-colors appearance-none cursor-pointer"
                 value={settings.homeLlmId || ''}
                 onChange={(e) => updateSettings({ homeLlmId: e.target.value || undefined })}
               >
                 <option value="">Same as Active Model (Default)</option>
                 {llmPresets.map(preset => (
                   <option key={preset.id} value={preset.id}>
                     {preset.name} ({preset.model})
                   </option>
                 ))}
               </select>
               <p className="text-[9px] text-wade-text-muted/60 mt-2 italic">
                 Dedicated model for generating "Wade's Daily Sass" on the home screen.
               </p>
             </div>
          </div>
        )}

        {/* --- ADD NEW BUTTON (Only for LLM/TTS) --- */}
        {activeTab !== 'system' && !isFormOpen && (
          <div className="text-center mb-5">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="text-wade-accent border border-wade-accent px-3 py-1 rounded-full text-[10px] hover:bg-wade-accent hover:text-white transition-all font-bold"
            >
              + New Connection
            </button>
          </div>
        )}

        {/* --- FORM MODAL (Only for LLM/TTS) --- */}
        {isFormOpen && activeTab !== 'system' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-wade-bg-card w-full max-w-[500px] max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-2xl border border-wade-accent-light flex flex-col relative">
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-hand text-2xl text-wade-text-main">{editingId ? 'Edit Connection' : 'New Connection'}</h3>
                <button 
                  onClick={resetForm}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-wade-bg-app text-wade-accent hover:bg-wade-accent hover:text-white transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar px-1 pb-2">
                {activeTab === 'llm' && (
                  <select
                    className="input-field col-span-2 h-10"
                    value={formData.provider}
                    onChange={e => handleProviderChange(e.target.value)}
                  >
                    {PROVIDERS.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                )}

                <input className="input-field h-10" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />

                {activeTab === 'llm' && (
                  <input
                    className="input-field h-10"
                    placeholder={formData.provider === 'OpenRouter' ? 'Model (e.g. google/gemini-flash-1.5)' : 'Model (e.g. gemini-3-flash)'}
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                  />
                )}

                <input className="input-field col-span-2 h-10" type="password" placeholder="API Key" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} />
                <input className="input-field col-span-2 h-10" placeholder="Base URL (Optional)" value={formData.baseUrl} onChange={e => setFormData({...formData, baseUrl: e.target.value})} />

                {activeTab === 'llm' && (
                  <div className="col-span-2 flex gap-4 items-center bg-wade-bg-app p-3 rounded-lg border border-wade-border">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={formData.isVision}
                        onChange={e => setFormData({...formData, isVision: e.target.checked})}
                        className="w-3.5 h-3.5 rounded border-wade-accent text-wade-accent focus:ring-wade-accent focus:ring-offset-0"
                      />
                      <span className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider">Vision</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={formData.isImageGen}
                        onChange={e => setFormData({...formData, isImageGen: e.target.checked})}
                        className="w-3.5 h-3.5 rounded border-wade-accent text-wade-accent focus:ring-wade-accent focus:ring-offset-0"
                      />
                      <span className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider">Image Gen</span>
                    </label>
                  </div>
                )}

                {activeTab === 'llm' && !formData.isImageGen && (
                  <div className="col-span-2 space-y-5 mt-2 p-5 bg-wade-bg-app rounded-xl border border-wade-border/60">
                    {[
                      { label: 'Temperature', value: formData.temperature, setter: (v: number) => setFormData({...formData, temperature: v}), min: 0, max: 2, step: 0.01 },
                      { label: 'Top P', value: formData.topP, setter: (v: number) => setFormData({...formData, topP: v}), min: 0, max: 1, step: 0.01 },
                      { label: 'Frequency Penalty', value: formData.frequencyPenalty, setter: (v: number) => setFormData({...formData, frequencyPenalty: v}), min: -2, max: 2, step: 0.01 },
                      { label: 'Presence Penalty', value: formData.presencePenalty, setter: (v: number) => setFormData({...formData, presencePenalty: v}), min: -2, max: 2, step: 0.01 },
                    ].map((field) => (
                      <div key={field.label}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[11px] font-bold text-wade-text-muted uppercase tracking-wider">{field.label}</span>
                          <span className="text-[11px] font-mono text-wade-text-main bg-wade-bg-card px-2 py-0.5 rounded border border-wade-border">{field.value.toFixed(2)}</span>
                        </div>
                        <input
                          type="range"
                          min={field.min} max={field.max} step={field.step}
                          value={field.value}
                          onChange={e => field.setter(parseFloat(e.target.value))}
                          className="w-full accent-wade-accent h-1.5 bg-wade-border rounded-lg cursor-pointer appearance-none hover:accent-wade-accent-hover transition-all"
                        />
                      </div>
                    ))}

                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-bold text-wade-text-muted uppercase tracking-wider">Top K</span>
                        <input
                          type="number"
                          value={formData.topK}
                          onChange={e => setFormData({...formData, topK: parseInt(e.target.value) || 0})}
                          className="w-20 text-[11px] text-wade-text-main bg-wade-bg-card border border-wade-border rounded px-2 py-1 text-right outline-none focus:border-wade-accent transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tts' && (
                  <>
                    <input className="input-field h-10" placeholder="Voice ID" value={formData.voiceId} onChange={e => setFormData({...formData, voiceId: e.target.value})} />
                    <select className="input-field h-10" value={formData.emotion} onChange={e => setFormData({...formData, emotion: e.target.value})}>
                      <option value="">Emotion (Auto)</option>
                      <option value="happy">Happy</option>
                      <option value="sad">Sad</option>
                      <option value="angry">Angry</option>
                      <option value="fearful">Fearful</option>
                      <option value="disgusted">Disgusted</option>
                      <option value="surprised">Surprised</option>
                      <option value="calm">Calm</option>
                      <option value="fluent">Fluent</option>
                    </select>

                    <div className="col-span-2 space-y-4 mt-2 p-5 bg-wade-bg-app rounded-xl border border-wade-border/60">
                      {[
                        { label: 'Speed', value: formData.speed, setter: (v: number) => setFormData({...formData, speed: v}), min: 0.5, max: 2, step: 0.01 },
                        { label: 'Volume', value: formData.vol, setter: (v: number) => setFormData({...formData, vol: v}), min: 0.1, max: 10, step: 0.1 },
                        { label: 'Pitch', value: formData.pitch, setter: (v: number) => setFormData({...formData, pitch: v}), min: -12, max: 12, step: 1 },
                      ].map((field) => (
                        <div key={field.label}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-wade-text-muted uppercase tracking-wider">{field.label}</span>
                            <span className="text-[11px] font-mono text-wade-text-main bg-wade-bg-card px-2 py-0.5 rounded border border-wade-border">{field.value.toFixed(2)}</span>
                          </div>
                          <input 
                            type="range" 
                            min={field.min} max={field.max} step={field.step} 
                            value={field.value} 
                            onChange={e => field.setter(parseFloat(e.target.value))} 
                            className="w-full accent-wade-accent h-1.5 bg-wade-border rounded-lg cursor-pointer appearance-none hover:accent-wade-accent-hover transition-all" 
                          />
                        </div>
                      ))}

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        {[
                          { label: 'Sample Rate', value: formData.sampleRate, setter: (v: number) => setFormData({...formData, sampleRate: v}), options: [8000, 16000, 22050, 24000, 32000, 44100] },
                          { label: 'Bitrate', value: formData.bitrate, setter: (v: number) => setFormData({...formData, bitrate: v}), options: [32000, 64000, 128000, 256000], labels: ['32k', '64k', '128k', '256k'] },
                        ].map((field) => (
                          <div key={field.label}>
                            <label className="text-[10px] text-wade-text-muted font-bold mb-1.5 block uppercase tracking-wide">{field.label}</label>
                            <select className="input-field text-[10px] py-1.5 h-8" value={field.value} onChange={e => field.setter(parseInt(e.target.value))}>
                              {field.options.map((opt, i) => (
                                <option key={opt} value={opt}>{field.labels ? field.labels[i] : opt}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                        <div>
                          <label className="text-[10px] text-wade-text-muted font-bold mb-1.5 block uppercase tracking-wide">Format</label>
                          <select className="input-field text-[10px] py-1.5 h-8" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})}>
                            <option value="mp3">MP3</option>
                            <option value="pcm">PCM</option>
                            <option value="flac">FLAC</option>
                            <option value="wav">WAV</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-wade-text-muted font-bold mb-1.5 block uppercase tracking-wide">Channel</label>
                          <select className="input-field text-[10px] py-1.5 h-8" value={formData.channel} onChange={e => setFormData({...formData, channel: parseInt(e.target.value)})}>
                            <option value={1}>Mono</option>
                            <option value={2}>Stereo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-wade-border">
                <button onClick={resetForm} className="text-xs font-bold text-wade-text-muted hover:text-wade-text-main px-4 py-2 transition-colors rounded-lg hover:bg-wade-bg-app">Cancel</button>
                <button onClick={handleSave} className="bg-wade-accent text-white text-xs font-bold px-6 py-2 rounded-full hover:bg-wade-accent-hover shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5">Save</button>
              </div>
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
                className={`px-3 py-2.5 rounded-lg border cursor-pointer transition-all relative group flex justify-between items-center ${settings.activeLlmId === preset.id ? 'bg-wade-bg-card border-wade-accent shadow-sm' : 'bg-wade-bg-app border-transparent hover:border-wade-border'}`}
              >
                 <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${settings.activeLlmId === preset.id ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    <div className="min-w-0">
                       <div className="font-bold text-wade-text-main text-xs truncate">{preset.name}</div>
                       <div className="text-[9px] text-wade-text-muted opacity-70 truncate">{preset.model || 'Auto'}</div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleTest(preset, 'llm'); }} className="p-1.5 text-gray-400 hover:text-wade-accent hover:bg-wade-bg-card rounded-md transition-colors" title="Test Connection">
                      {testingId === preset.id ? <Icons.Loading /> : <Icons.Test />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit('llm', preset); }} className="p-1.5 text-gray-400 hover:text-wade-text-main hover:bg-wade-bg-card rounded-md transition-colors" title="Edit">
                      <Icons.Edit />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(preset.id, 'llm'); }} 
                      className={`p-1.5 rounded-md transition-colors ${deleteConfirmId === preset.id ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-red-400 hover:bg-wade-bg-card'}`}
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
                className={`px-3 py-2.5 rounded-lg border cursor-pointer transition-all relative group flex justify-between items-center ${settings.activeTtsId === preset.id ? 'bg-wade-bg-card border-wade-accent shadow-sm' : 'bg-wade-bg-app border-transparent hover:border-wade-border'}`}
              >
                 <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${settings.activeTtsId === preset.id ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                    <div className="min-w-0">
                       <div className="font-bold text-wade-text-main text-xs truncate">{preset.name}</div>
                       <div className="text-[9px] text-wade-text-muted opacity-70 truncate">{preset.model || 'Standard'} • x{preset.speed}</div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-1 shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); handleTest(preset, 'tts'); }} className="p-1.5 text-gray-400 hover:text-wade-accent hover:bg-wade-bg-card rounded-md transition-colors" title="Test Connection">
                      {testingId === preset.id ? <Icons.Loading /> : <Icons.Test />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit('tts', preset); }} className="p-1.5 text-gray-400 hover:text-wade-text-main hover:bg-wade-bg-card rounded-md transition-colors" title="Edit">
                      <Icons.Edit />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(preset.id, 'tts'); }} 
                      className={`p-1.5 rounded-md transition-colors ${deleteConfirmId === preset.id ? 'bg-red-50 text-red-500' : 'text-gray-400 hover:text-red-400 hover:bg-wade-bg-card'}`}
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
      <div className="mt-8 border-t border-wade-border pt-6 text-center">
        <h3 className="text-xs font-bold text-wade-text-muted mb-2 uppercase tracking-widest">Network Status</h3>
        {syncError ? (
           <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-[10px] text-red-600">
             <p className="font-bold mb-1">Connection Error 🚧</p>
             <p className="opacity-80 break-words">{syncError}</p>
             <p className="mt-2 text-[9px] italic text-wade-text-muted">Check Supabase API Key & RLS Policies.</p>
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
          background: var(--wade-bg-card);
          border: 1px solid var(--wade-border);
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 11px;
          color: var(--wade-text-main);
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: var(--wade-accent);
          background: var(--wade-bg-base);
        }
      `}</style>
      <ThemeStudio 
        isOpen={isThemeStudioOpen} 
        onClose={() => setIsThemeStudioOpen(false)} 
      />
    </div>
  );
};
