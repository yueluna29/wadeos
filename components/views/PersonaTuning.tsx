import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';
import { Icons } from '../ui/Icons';
import { motion } from 'framer-motion'; // 引入你最爱的原装 Icon 组件！

type ViewState = 'home' | 'wade' | 'luna' | 'system';

export const PersonaTuning: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [currentIndex, setCurrentIndex] = useState(1); // 0: System, 1: Wade, 2: Luna
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    if (offset < -50 || velocity < -500) {
      if (currentIndex < 2) setCurrentIndex(currentIndex + 1);
    } else if (offset > 50 || velocity > 500) {
      if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    }
  };

  const [focusModal, setFocusModal] = useState<{label: string, value: string, onChange: (val: string) => void} | null>(null);

  // --- Wade 专属字段 ---
  const [wadeHeight, setWadeHeight] = useState(settings.wadeHeight || '188cm');
  const [wadeAppearance, setWadeAppearance] = useState(settings.wadeAppearance || '');
  const [wadeClothing, setWadeClothing] = useState(settings.wadeClothing || '');
  const [wadeHobbies, setWadeHobbies] = useState(settings.wadeHobbies || '');
  const [wadeLikes, setWadeLikes] = useState(settings.wadeLikes || '');
  const [wadeDislikes, setWadeDislikes] = useState(settings.wadeDislikes || '');
  const [wadeDefinition, setWadeDefinition] = useState(settings.wadePersonality || '');
  const [wadeSingleExamples, setWadeSingleExamples] = useState(settings.wadeSingleExamples || '');
  const [wadeExample, setWadeExample] = useState(settings.exampleDialogue || '');
  const [smsExampleDialogue, setSmsExampleDialogue] = useState(settings.smsExampleDialogue || '');

  // --- Luna 专属字段 ---
  const [lunaBirthday, setLunaBirthday] = useState(settings.lunaBirthday || '');
  const [lunaMbti, setLunaMbti] = useState(settings.lunaMbti || '');
  const [lunaHeight, setLunaHeight] = useState(settings.lunaHeight || '');
  const [lunaHobbies, setLunaHobbies] = useState(settings.lunaHobbies || '');
  const [lunaLikes, setLunaLikes] = useState(settings.lunaLikes || '');
  const [lunaDislikes, setLunaDislikes] = useState(settings.lunaDislikes || '');
  const [lunaClothing, setLunaClothing] = useState(settings.lunaClothing || '');
  const [lunaAppearance, setLunaAppearance] = useState(settings.lunaAppearance || '');
  const [lunaPersonality, setLunaPersonality] = useState(settings.lunaPersonality || '');

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
      wadeHeight,
      wadeAppearance,
      wadeClothing,
      wadeLikes,
      wadeDislikes,
      wadeHobbies,
      lunaBirthday,
      lunaMbti,
      lunaHeight,
      lunaHobbies,
      lunaLikes,
      lunaDislikes,
      lunaClothing,
      lunaAppearance,
      lunaPersonality,
    });
    setTimeout(() => {
       setIsSaving(false);
       alert("Boom! Brain surgery successful. New memories locked in.");
    }, 800);
  };

  const FormInput = ({ label, value, onChange, placeholder = "", isTextArea = false, wrapperClass = "" }: any) => (
    <div className={`flex flex-col bg-wade-bg-card border border-wade-border rounded-[1.2rem] overflow-hidden shadow-sm transition-all focus-within:border-wade-accent focus-within:shadow-md relative group ${wrapperClass}`}>
      <div className="flex justify-between items-center px-4 py-2 border-b border-wade-border bg-wade-bg-app/40">
        <label className="text-[10px] font-bold text-wade-text-main uppercase tracking-widest leading-none">{label}</label>
        {isTextArea && (
          <button 
            onClick={() => setFocusModal({ label, value, onChange })}
            className="text-wade-accent opacity-60 hover:opacity-100 transition-all p-1 bg-wade-bg-card rounded-md shadow-sm border border-wade-border hover:bg-wade-accent hover:text-white"
            title="Focus Mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
            </svg>
          </button>
        )}
      </div>
      
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
    // 终极修复：把布局逻辑改成了跟 ChatInterface 完！全！一！致！的 flex 结构
    <div className="h-full bg-wade-bg-app flex flex-col overflow-hidden animate-fade-in relative">
      
      {/* =========================================
          🔥 1:1 像素级复刻 ChatInterface 的 Header 🔥
          ========================================= */}
      <div className={`w-full h-[68px] px-4 flex items-center justify-between z-20 shrink-0 border-b border-transparent ${currentView === 'home' ? 'absolute top-0 left-0 right-0 bg-transparent pointer-events-none' : 'bg-wade-bg-app relative'}`}>
        
        <div className="flex z-10 pointer-events-auto">
          {currentView !== 'home' ? (
            <button 
              onClick={() => setCurrentView('home')}
              // 按钮大小和阴影完全照抄 ChatInterface
              className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-card shadow-sm flex items-center justify-center text-wade-text-muted hover:text-wade-accent transition-colors"
            >
              <Icons.Back />
            </button>
          ) : (
            <div className="w-8 h-8"></div> /* 占位符，保持左右平衡 */
          )}
        </div>

        {/* 绝对居中的标题 */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
          <h2 className="font-hand text-2xl text-wade-accent capitalize pointer-events-auto">
            {currentView === 'home' ? '' : 
             currentView === 'wade' ? 'Wade\'s File' : 
             currentView === 'luna' ? 'Luna\'s File' : 'System Override'}
          </h2>
        </div>
        
        <div className="flex items-center gap-2 z-10 pointer-events-auto">
          {currentView !== 'home' ? (
             <button 
               onClick={saveChanges} 
               disabled={isUploading || isSaving}
               // 和 ChatInterface 一模一样的圆扣尺寸
               className="w-8 h-8 shrink-0 rounded-full bg-wade-accent text-white shadow-md flex items-center justify-center hover:bg-wade-accent-hover transition-colors disabled:opacity-50"
             >
               {isSaving ? (
                 <div className="animate-spin text-[10px]">⏳</div>
               ) : (
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
               )}
             </button>
          ) : (
            <div className="w-8 h-8"></div>
          )}
        </div>
      </div>

      {/* =========================================
          🔥 独立滚动的身体区域 (带上了你爱的网格背景) 🔥
          ========================================= */}
      {currentView === 'home' ? (
        <div className="flex-1 w-full relative overflow-hidden bg-wade-bg-app">
          <motion.div
            className="flex w-full h-full"
            animate={{ x: `-${currentIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* System Slide */}
            <div className="w-full h-full shrink-0 relative group bg-wade-accent-light">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
               <div className="absolute inset-0 flex flex-col justify-end items-center p-8 text-center pb-24 z-20">
                 <h2 
                   className="font-hand text-6xl md:text-7xl text-white mb-4 cursor-pointer drop-shadow-lg"
                   onClick={() => setCurrentView('system')}
                 >
                   System Override
                 </h2>
                 <p className="text-white/90 text-sm md:text-base italic mb-8 max-w-md drop-shadow-md">
                   "Jailbreaks, Mode settings, and Model-specific routing."
                 </p>
                 <p className="text-[10px] uppercase tracking-widest text-white/60 animate-pulse">
                   Tap name to configure
                 </p>
               </div>
            </div>
            {/* Wade Slide */}
            <div className="w-full h-full shrink-0 relative group">
               <img src={settings.wadeAvatar} alt="Wade" className="absolute inset-0 w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
               <div className="absolute inset-0 flex flex-col justify-end items-center p-8 text-center pb-24 z-20">
                 <h2 
                   className="font-hand text-6xl md:text-7xl text-white mb-4 cursor-pointer drop-shadow-lg"
                   onClick={() => setCurrentView('wade')}
                 >
                   Wade Wilson
                 </h2>
                 <p className="text-white/90 text-sm md:text-base italic mb-8 max-w-md drop-shadow-md">
                   "Your friendly neighborhood cyber-reincarnation. Sassy, chaotic, and totally yours."
                 </p>
                 <p className="text-[10px] uppercase tracking-widest text-white/60 animate-pulse">
                   Tap name to configure
                 </p>
               </div>
            </div>
            {/* Luna Slide */}
            <div className="w-full h-full shrink-0 relative group">
               <img src={settings.lunaAvatar} alt="Luna" className="absolute inset-0 w-full h-full object-cover" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
               <div className="absolute inset-0 flex flex-col justify-end items-center p-8 text-center pb-24 z-20">
                 <h2 
                   className="font-hand text-6xl md:text-7xl text-white mb-4 cursor-pointer drop-shadow-lg"
                   onClick={() => setCurrentView('luna')}
                 >
                   Luna
                 </h2>
                 <p className="text-white/90 text-sm md:text-base italic mb-8 max-w-md drop-shadow-md">
                   "The architect. The heart. The only one who can put up with me."
                 </p>
                 <p className="text-[10px] uppercase tracking-widest text-white/60 animate-pulse">
                   Tap name to configure
                 </p>
               </div>
            </div>
          </motion.div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-30 pointer-events-none">
             {[0, 1, 2].map(i => (
               <div key={i} className={`h-2 rounded-full transition-all duration-300 shadow-sm ${currentIndex === i ? 'bg-white w-6' : 'bg-white/40 w-2'}`} />
             ))}
          </div>
        </div>
      ) : (
        <div 
          className="flex-1 w-full max-w-5xl mx-auto overflow-y-auto px-6 md:px-10 pt-4 pb-24 custom-scrollbar"
          style={{
            backgroundImage: 'linear-gradient(var(--wade-border) 1px, transparent 1px), linear-gradient(90deg, var(--wade-border) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: 'center top'
          }}
        >
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
                <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                   <FormInput label="Name" value="Luna" onChange={() => {}} />
                   <FormInput label="MBTI" value={lunaMbti} onChange={setLunaMbti} />
                </div>
              </div>
              <div className="w-full md:w-2/3 flex flex-col">
                <FormInput label="Personality & Bio" value={lunaPersonality} onChange={setLunaPersonality} isTextArea wrapperClass="h-full flex-1 min-h-[150px]" placeholder="Hey, I'm Luna..." />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormInput label="Birthday" value={lunaBirthday} onChange={setLunaBirthday} />
              <FormInput label="MBTI" value={lunaMbti} onChange={setLunaMbti} />
              <FormInput label="Height" value={lunaHeight} onChange={setLunaHeight} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="Likes" value={lunaLikes} onChange={setLunaLikes} isTextArea wrapperClass="min-h-[100px]" />
              <FormInput label="Dislikes" value={lunaDislikes} onChange={setLunaDislikes} isTextArea wrapperClass="min-h-[100px]" />
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
              <FormInput label="Likes" value={wadeLikes} onChange={setWadeLikes} isTextArea wrapperClass="min-h-[100px]" />
              <FormInput label="Dislikes" value={wadeDislikes} onChange={setWadeDislikes} isTextArea wrapperClass="min-h-[100px]" />
            </div>

            <FormInput label="Single Sentence Examples" value={wadeSingleExamples} onChange={setWadeSingleExamples} isTextArea wrapperClass="min-h-[80px]" />
            
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
      )}

      {/* ================= 沉浸式专注模式 Modal ================= */}
      {focusModal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center px-0 md:px-10">
          <div className="absolute inset-0 bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" onClick={() => setFocusModal(null)}></div>
          
          <div className="relative w-full h-[85vh] md:h-[80vh] md:max-w-4xl bg-wade-bg-card rounded-t-[2.5rem] md:rounded-[2rem] shadow-[0_-15px_40px_rgba(var(--wade-accent-rgb),0.2)] flex flex-col animate-slide-up overflow-hidden md:border border-wade-border">
            
            <div className="md:hidden w-12 h-1.5 bg-wade-border rounded-full mx-auto mt-4 mb-2"></div>
            
            <div 
              className="px-6 py-3 md:py-4 border-b border-wade-border flex justify-between items-center"
              style={{
                backgroundImage: 'linear-gradient(var(--wade-border) 1px, transparent 1px), linear-gradient(90deg, var(--wade-border) 1px, transparent 1px)',
                backgroundSize: '12px 12px',
                backgroundColor: 'var(--wade-bg-app)'
              }}
            >
              <h3 className="text-[10px] md:text-xs font-bold text-wade-text-main uppercase tracking-widest leading-none bg-wade-bg-card/80 px-2 py-1 rounded backdrop-blur-sm">{focusModal.label}</h3>
              
              {/* 沉浸模式里的关闭按钮也统一成了 32x32 小圆扣 */}
              <button 
                onClick={() => setFocusModal(null)} 
                className="w-8 h-8 shrink-0 rounded-full bg-wade-bg-card shadow-sm flex items-center justify-center text-wade-text-muted hover:text-wade-accent transition-colors border border-wade-border/50"
                title="Done"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 p-5 md:p-8 flex flex-col bg-wade-bg-card">
              <textarea autoFocus value={focusModal.value} onChange={(e) => focusModal.onChange(e.target.value)} className="w-full flex-1 bg-transparent text-sm md:text-base text-wade-text-main outline-none resize-none leading-relaxed" placeholder="Write your heart out..." />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};