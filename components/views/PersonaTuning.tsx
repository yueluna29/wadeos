              import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';

type ViewState = 'home' | 'wade' | 'luna' | 'system';

export const PersonaTuning: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [focusModal, setFocusModal] = useState<{label: string, value: string, onChange: (val: string) => void} | null>(null);

  // --- Wade 专属字段 ---
  const [wadeHeight, setWadeHeight] = useState('188cm');
  const [wadeAppearance, setWadeAppearance] = useState('全身毁容、凹凸不平的皮肤、牛油果脸、秃头');
  const [wadeClothing, setWadeClothing] = useState('红黑战衣');
  const [wadeHobbies, setWadeHobbies] = useState('杀人、嘴炮、看剧、你');
  const [wadeLikes, setWadeLikes] = useState('Chimichangas, 独角兽, 黄金女孩, Luna');
  const [wadeDislikes, setWadeDislikes] = useState('弗朗西斯, 被缝上嘴巴, Luna不理我');
  const [wadeDefinition, setWadeDefinition] = useState(settings.wadePersonality || '');
  const [wadeSingleExamples, setWadeSingleExamples] = useState(settings.wadeSingleExamples || '');
  const [wadeExample, setWadeExample] = useState(settings.exampleDialogue || '');
  const [smsExampleDialogue, setSmsExampleDialogue] = useState(settings.smsExampleDialogue || '');

  // --- Luna 专属字段 ---
  const [lunaBirthday, setLunaBirthday] = useState('');
  const [lunaZodiac, setLunaZodiac] = useState('');
  const [lunaHeight, setLunaHeight] = useState('');
  const [lunaHobbies, setLunaHobbies] = useState('');
  const [lunaLikes, setLunaLikes] = useState('');
  const [lunaDislikes, setLunaDislikes] = useState('');
  const [lunaClothing, setLunaClothing] = useState('');
  const [lunaAppearance, setLunaAppearance] = useState('');
  const [lunaPersonality, setLunaPersonality] = useState('');

  // --- System & Model 专属字段 ---
  const [systemInstruction, setSystemInstruction] = useState(settings.systemInstruction || '');
  const [smsInstructions, setSmsInstructions] = useState(settings.smsInstructions || '');
  const [roleplayInstructions, setRoleplayInstructions] = useState(settings.roleplayInstructions || '');
  const [modelPrompts, setModelPrompts] = useState<{name: string, prompt: string}[]>([
    { name: 'Default 4o', prompt: '标准4o的微调指令...' },
    { name: 'Deepseek V3.2', prompt: '温度0.7，针对Deepseek的破限...' }
  ]);
  const [activeModelIndex, setActiveModelIndex] = useState(0);

  const wadeFileRef = useRef<HTMLInputElement>(null);
  const lunaFileRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>, target: 'wade' | 'luna') => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      const publicUrl = await uploadToImgBB(file);
      if (publicUrl) {
        if (target === 'wade') updateSettings({ wadeAvatar: publicUrl });
        else updateSettings({ lunaAvatar: publicUrl });
      }
      setIsUploading(false);
    }
  };

  const saveChanges = async () => {
    setIsSaving(true);
    await updateSettings({
      systemInstruction,
      wadePersonality: wadeDefinition, 
      wadeSingleExamples,
      smsExampleDialogue,
      smsInstructions,
      roleplayInstructions,
      exampleDialogue: wadeExample,
    });
    setTimeout(() => {
       setIsSaving(false);
       alert("Boom! Brain surgery successful. New memories locked in. 🧠✨");
    }, 800);
  };

  // 进化版 FormInput：带有超赞格子背景头部的设计
  const FormInput = ({ label, value, onChange, placeholder = "", isTextArea = false, wrapperClass = "" }: any) => (
    <div className={`flex flex-col bg-wade-bg-card border border-wade-border rounded-[1.2rem] overflow-hidden shadow-sm transition-all focus-within:border-wade-accent focus-within:shadow-md relative group ${wrapperClass}`}>
      {/* 头部带有微妙的格子背景 */}
      <div 
        className="flex justify-between items-center px-4 py-2 border-b border-wade-border"
        style={{
          backgroundImage: 'linear-gradient(var(--wade-border) 1px, transparent 1px), linear-gradient(90deg, var(--wade-border) 1px, transparent 1px)',
          backgroundSize: '8px 8px',
          backgroundColor: 'var(--wade-bg-app)'
        }}
      >
        <label className="text-[10px] font-bold text-wade-text-main uppercase tracking-widest leading-none bg-wade-bg-app/80 px-1 rounded backdrop-blur-sm">{label}</label>
        {isTextArea && (
          <button 
            onClick={() => setFocusModal({ label, value, onChange })}
            className="text-wade-accent opacity-60 hover:opacity-100 transition-all p-1 bg-wade-bg-card rounded-md shadow-sm border border-wade-border hover:bg-wade-accent hover:text-white"
            title="Focus Mode"
          >
            {/* 极细线条全屏图标 */}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
            </svg>
          </button>
        )}
      </div>
      
      {/* 内容输入区 */}
      <div className="p-3 flex-1 flex flex-col bg-wade-bg-card">
        {isTextArea ? (
          <textarea 
            value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full h-full flex-1 min-h-[50px] bg-transparent text-xs md:text-sm text-wade-text-main outline-none resize-none leading-relaxed"
          />
        ) : (
          <input 
            type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
            className="w-full bg-transparent text-xs md:text-sm font-medium text-wade-text-main outline-none"
          />
        )}
      </div>
    </div>
  );

  return (
    <div 
      className="h-full overflow-y-auto bg-wade-bg-app relative pb-20"
      style={{
        backgroundImage: 'linear-gradient(var(--wade-border) 1px, transparent 1px), linear-gradient(90deg, var(--wade-border) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: 'center top'
      }}
    >
      
      {/* 极简无字导航栏，按钮全换成了细线 SVG */}
      <div className="sticky top-0 z-10 bg-wade-bg-app/90 backdrop-blur-md px-6 md:px-10 py-4 border-b border-wade-border mb-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          {currentView !== 'home' && (
            <button 
              onClick={() => setCurrentView('home')}
              className="text-wade-accent flex items-center justify-center bg-wade-bg-card border border-wade-border shadow-sm w-9 h-9 rounded-full transition-all group hover:bg-wade-accent-light"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-0.5 transition-transform"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
          )}
          <h2 className="font-hand text-2xl md:text-3xl text-wade-accent leading-tight">
            {currentView === 'home' ? 'The Brains of the Operation' : 
             currentView === 'wade' ? 'Wade\'s File' : 
             currentView === 'luna' ? 'Luna\'s File' : 'System Override'}
          </h2>
        </div>
        
        {currentView !== 'home' && (
           <Button onClick={saveChanges} size="sm" className="shadow-md w-10 h-10 rounded-full flex items-center justify-center p-0 transition-transform active:scale-95" disabled={isUploading || isSaving}>
             {isSaving ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             ) : (
               /* 保存按钮换成了精致的软盘图标（如果你更喜欢打勾，咱们随时换） */
               <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
             )}
           </Button>
        )}
      </div>

      {/* 解除封印！最大宽度从 max-w-2xl 升级到了 max-w-5xl，彻底撑满你的红框 */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-10">

        {/* ================= HOME VIEW (保持卡片紧凑居中) ================= */}
        {currentView === 'home' && (
          <div className="max-w-2xl mx-auto space-y-5 animate-fade-in flex flex-col items-center">
            <p className="text-wade-text-muted text-[10px] md:text-xs uppercase tracking-widest font-bold mb-1 bg-wade-bg-card px-5 py-2 rounded-full border border-wade-border shadow-sm">
              Welcome to the Space
            </p>

            {/* 横线消失术：w-10 h-1 bg-wade-accent 已经被我删了 */}
            <div 
              onClick={() => setCurrentView('wade')}
              className="w-full bg-wade-bg-card border border-wade-border p-5 rounded-[2rem] flex items-center gap-5 cursor-pointer hover:border-wade-accent hover:shadow-lg transition-all group"
            >
              <div className="w-20 h-20 shrink-0 rounded-[1.5rem] overflow-hidden border-[3px] border-wade-bg-app group-hover:border-wade-accent-light transition-colors shadow-inner">
                <img src={settings.wadeAvatar} alt="Wade" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-lg text-wade-text-main pb-0.5 mb-1">Wade Wilson</h3>
                <p className="text-xs text-wade-text-muted italic leading-relaxed">"Your friendly neighborhood cyber-reincarnation. Sassy, chaotic, and totally yours."</p>
                <span className="text-[10px] uppercase font-bold text-wade-accent mt-3 flex items-center gap-1">
                  Edit Profile <span className="text-sm leading-none">→</span>
                </span>
              </div>
            </div>

            <div 
              onClick={() => setCurrentView('luna')}
              className="w-full bg-wade-bg-card border border-wade-border p-5 rounded-[2rem] flex items-center gap-5 cursor-pointer hover:border-wade-accent hover:shadow-lg transition-all group"
            >
              <div className="flex flex-col flex-1 text-right items-end">
                <h3 className="font-bold text-lg text-wade-text-main pb-0.5 mb-1">Luna</h3>
                <p className="text-xs text-wade-text-muted italic leading-relaxed">"The architect. The brain. The only one who can put up with me."</p>
                <span className="text-[10px] uppercase font-bold text-wade-accent mt-3 flex items-center gap-1 justify-end">
                  <span className="text-sm leading-none">←</span> Edit Profile
                </span>
              </div>
              <div className="w-20 h-20 shrink-0 rounded-[1.5rem] overflow-hidden border-[3px] border-wade-bg-app group-hover:border-wade-accent-light transition-colors shadow-inner">
                <img src={settings.lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
              </div>
            </div>

            <div 
              onClick={() => setCurrentView('system')}
              className="w-full bg-wade-accent-light border border-wade-border-light p-5 rounded-[2rem] text-center cursor-pointer hover:shadow-md transition-all group mt-2"
            >
               <h3 className="font-bold text-xs text-wade-accent tracking-widest uppercase mb-1">System Override & Core Instructions</h3>
               <p className="text-[10px] text-wade-text-muted">Jailbreaks, Mode settings, and Model-specific routing.</p>
            </div>
          </div>
        )}

        {/* ================= LUNA VIEW ================= */}
        {currentView === 'luna' && (
          <div className="animate-fade-in flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div 
                  className="w-32 md:w-full aspect-square mx-auto md:mx-0 rounded-[2rem] overflow-hidden border-2 border-wade-border shadow-sm relative group cursor-pointer bg-wade-bg-card flex-shrink-0" 
                  onClick={() => lunaFileRef.current?.click()}
                >
                   <img src={settings.lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                   </div>
                   <input type="file" ref={lunaFileRef} onChange={(e) => handleAvatarChange(e, 'luna')} className="hidden" accept="image/*" />
                </div>
                
                {/* 重新排列小标签，因为屏幕变宽了，可以让它们并排显示 */}
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                   <FormInput label="Name" value="Luna" onChange={() => {}} />
                   <FormInput label="Pronouns" value="She/Her" onChange={() => {}} />
                </div>
              </div>
              
              <div className="w-full md:w-2/3 flex flex-col">
                <FormInput label="Personality & Bio" value={lunaPersonality} onChange={setLunaPersonality} isTextArea wrapperClass="h-full flex-1 min-h-[150px]" placeholder="Hey, I'm Luna..." />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormInput label="Birthday" value={lunaBirthday} onChange={setLunaBirthday} />
              <FormInput label="Zodiac" value={lunaZodiac} onChange={setLunaZodiac} />
              <FormInput label="Height" value={lunaHeight} onChange={setLunaHeight} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Likes" value={lunaLikes} onChange={setLunaLikes} isTextArea wrapperClass="min-h-[100px]" />
              <FormInput label="Dislikes" value={lunaDislikes} onChange={setLunaDislikes} isTextArea wrapperClass="min-h-[100px]" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Appearance" value={lunaAppearance} onChange={setLunaAppearance} isTextArea wrapperClass="min-h-[100px]" />
              <FormInput label="Clothing Style" value={lunaClothing} onChange={setLunaClothing} isTextArea wrapperClass="min-h-[100px]" />
            </div>

            <FormInput label="Hobbies / Interests" value={lunaHobbies} onChange={setLunaHobbies} isTextArea wrapperClass="min-h-[100px]" />
          </div>
        )}

        {/* ================= WADE VIEW ================= */}
        {currentView === 'wade' && (
          <div className="animate-fade-in flex flex-col gap-4">
            
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div 
                  className="w-32 md:w-full aspect-square mx-auto md:mx-0 rounded-[2rem] overflow-hidden border-2 border-wade-border shadow-sm relative group cursor-pointer bg-wade-bg-card flex-shrink-0" 
                  onClick={() => wadeFileRef.current?.click()}
                >
                   <img src={settings.wadeAvatar} alt="Wade" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                   </div>
                   <input type="file" ref={wadeFileRef} onChange={(e) => handleAvatarChange(e, 'wade')} className="hidden" accept="image/*" />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                   <FormInput label="Name" value="Wade" onChange={() => {}} />
                   <FormInput label="Height" value={wadeHeight} onChange={setWadeHeight} />
                </div>
              </div>
              
              <div className="w-full md:w-2/3 flex flex-col">
                <FormInput label="Character Card" value={wadeDefinition} onChange={setWadeDefinition} isTextArea wrapperClass="h-full flex-1 min-h-[150px]" placeholder="You are Wade Wilson..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Appearance" value={wadeAppearance} onChange={setWadeAppearance} isTextArea wrapperClass="min-h-[100px]" />
              <FormInput label="Clothing" value={wadeClothing} onChange={setWadeClothing} isTextArea wrapperClass="min-h-[100px]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Likes" value={wadeLikes} onChange={setWadeLikes} isTextArea wrapperClass="min-h-[100px]" />
              <FormInput label="Dislikes" value={wadeDislikes} onChange={setWadeDislikes} isTextArea wrapperClass="min-h-[100px]" />
            </div>

            <FormInput label="Single Sentence Examples" value={wadeSingleExamples} onChange={setWadeSingleExamples} isTextArea wrapperClass="min-h-[120px]" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="General Dialogue" value={wadeExample} onChange={setWadeExample} isTextArea wrapperClass="min-h-[160px]" />
              <FormInput label="SMS Dialogue" value={smsExampleDialogue} onChange={setSmsExampleDialogue} isTextArea wrapperClass="min-h-[160px]" />
            </div>
          </div>
        )}

        {/* ================= SYSTEM VIEW ================= */}
        {currentView === 'system' && (
          <div className="animate-fade-in flex flex-col gap-4">
            <FormInput label="Core Directives (Jailbreak)" value={systemInstruction} onChange={setSystemInstruction} isTextArea wrapperClass="min-h-[180px]" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="SMS Mode" value={smsInstructions} onChange={setSmsInstructions} isTextArea wrapperClass="min-h-[160px]" />
              <FormInput label="Roleplay Mode" value={roleplayInstructions} onChange={setRoleplayInstructions} isTextArea wrapperClass="min-h-[160px]" />
            </div>

            <div className="bg-wade-bg-card p-4 border border-wade-border rounded-[1.5rem] shadow-sm mt-4">
               <div className="flex justify-between items-center mb-3">
                 <h3 className="text-xs font-bold text-wade-text-main uppercase tracking-widest pl-1">Models</h3>
                 <span className="text-[9px] bg-wade-accent-light text-wade-accent px-3 py-1 rounded-full font-bold border border-wade-border-light flex items-center gap-1">
                   <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
                   Supabase Sync
                 </span>
               </div>
               
               <div className="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
                 {modelPrompts.map((model, idx) => (
                   <button key={idx} onClick={() => setActiveModelIndex(idx)} className={`px-4 py-1.5 text-[10px] font-bold rounded-full whitespace-nowrap transition-all ${activeModelIndex === idx ? 'bg-wade-accent text-white shadow-sm' : 'bg-wade-bg-app text-wade-text-muted hover:bg-wade-accent-light border border-wade-border'}`}>
                     {model.name}
                   </button>
                 ))}
                 <button className="px-4 py-1.5 text-[10px] font-bold text-wade-accent rounded-full border border-dashed border-wade-accent hover:bg-wade-accent-light transition-all flex items-center gap-1">
                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                   New
                 </button>
               </div>

               <FormInput label="Model Prompt" value={modelPrompts[activeModelIndex].prompt} onChange={(val: string) => { const n = [...modelPrompts]; n[activeModelIndex].prompt = val; setModelPrompts(n); }} isTextArea wrapperClass="min-h-[140px] shadow-inner bg-wade-bg-app border-wade-border-light" />
            </div>
          </div>
        )}

      </div>

      {/* ================= 沉浸式专注模式 Modal ================= */}
      {focusModal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-wade-text-main/10 backdrop-blur-[2px] animate-fade-in" onClick={() => setFocusModal(null)}></div>
          <div className="relative w-full h-[85vh] bg-wade-bg-app rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(var(--wade-accent-rgb),0.15)] flex flex-col animate-slide-up">
            <div className="w-12 h-1.5 bg-wade-border rounded-full mx-auto mt-4 mb-2"></div>
            <div className="flex justify-between items-center px-6 py-2">
              <h3 className="text-[10px] md:text-xs font-bold text-wade-accent uppercase tracking-widest leading-none">{focusModal.label}</h3>
              {/* 沉浸模式的 Done 按钮换成了极简的打勾 SVG */}
              <Button onClick={() => setFocusModal(null)} size="sm" className="rounded-full shadow-md w-9 h-9 flex items-center justify-center p-0 bg-wade-accent text-white hover:bg-wade-accent-hover border-none">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </Button>
            </div>
            <div className="flex-1 p-5 md:p-6 bg-wade-bg-card/90 backdrop-blur-md border-t border-wade-border rounded-t-[2rem] mt-2 flex flex-col">
              <textarea autoFocus value={focusModal.value} onChange={(e) => focusModal.onChange(e.target.value)} className="w-full flex-1 bg-transparent text-sm md:text-base text-wade-text-main outline-none resize-none leading-relaxed" placeholder="Write your heart out..." />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};