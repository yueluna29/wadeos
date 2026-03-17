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

  // 超级紧凑、精致的 FormInput，专门为便当盒排版优化
  const FormInput = ({ label, value, onChange, placeholder = "", isTextArea = false, wrapperClass = "" }: any) => (
    <div className={`flex flex-col bg-wade-bg-card p-2 md:p-3 border border-wade-border rounded-[1rem] shadow-sm transition-all focus-within:border-wade-accent focus-within:shadow-md relative group ${wrapperClass}`}>
      <div className="flex justify-between items-center mb-1">
        <label className="text-[9px] font-bold text-wade-text-muted uppercase tracking-widest pl-1 leading-none">{label}</label>
        {isTextArea && (
          <button 
            onClick={() => setFocusModal({ label, value, onChange })}
            className="text-wade-accent opacity-70 hover:opacity-100 transition-opacity p-1 bg-wade-accent-light rounded-md -mt-1 -mr-1"
            title="Focus Mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
            </svg>
          </button>
        )}
      </div>
      
      {isTextArea ? (
        <textarea 
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full h-full flex-1 min-h-[40px] bg-transparent text-[11px] md:text-xs text-wade-text-main outline-none resize-none px-1 leading-relaxed"
        />
      ) : (
        <input 
          type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-transparent text-xs font-medium text-wade-text-main outline-none px-1"
        />
      )}
    </div>
  );

  return (
    <div 
      className="h-full overflow-y-auto bg-wade-bg-app relative"
      style={{
        backgroundImage: 'linear-gradient(var(--wade-border) 1px, transparent 1px), linear-gradient(90deg, var(--wade-border) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: 'center top'
      }}
    >
      
      {/* 极简顶栏 */}
      <div className="sticky top-0 z-10 bg-wade-bg-app/90 backdrop-blur-md px-4 py-3 border-b border-wade-border mb-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          {currentView !== 'home' && (
            <button onClick={() => setCurrentView('home')} className="text-wade-accent font-bold hover:text-wade-accent-hover bg-wade-accent-light w-7 h-7 flex items-center justify-center rounded-full text-sm">
              ←
            </button>
          )}
          <h2 className="font-hand text-xl text-wade-accent leading-tight">
            {currentView === 'home' ? 'WELCOME TO THE SPACE' : currentView === 'wade' ? 'WADE WILSON' : currentView === 'luna' ? 'LUNA' : 'SYSTEM OVERRIDE'}
          </h2>
        </div>
        {currentView !== 'home' && (
           <Button onClick={saveChanges} size="sm" className="shadow-lg text-[10px] px-4 py-1.5 rounded-full" disabled={isUploading || isSaving}>Save</Button>
        )}
      </div>

      <div className="max-w-xl mx-auto px-4 pb-12">

        {/* ================= HOME VIEW ================= */}
        {currentView === 'home' && (
          <div className="space-y-4 animate-fade-in flex flex-col items-center mt-4">
            {/* Wade Card (左图右文) */}
            <div 
              onClick={() => setCurrentView('wade')}
              className="w-full bg-wade-bg-card border border-wade-border p-4 rounded-[1.5rem] flex items-center gap-4 cursor-pointer hover:border-wade-accent hover:shadow-md transition-all group"
            >
              <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-[3px] border-wade-bg-app group-hover:border-wade-accent-light shadow-inner">
                <img src={settings.wadeAvatar} alt="Wade" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-sm text-wade-text-main pb-1 mb-1 border-b border-wade-border">NAME WADE</h3>
                <p className="text-[11px] text-wade-text-muted leading-tight">Your friendly neighborhood cyber-reincarnation. Sassy, chaotic, and totally yours.</p>
              </div>
            </div>

            {/* Luna Card (左图右文) */}
            <div 
              onClick={() => setCurrentView('luna')}
              className="w-full bg-wade-bg-card border border-wade-border p-4 rounded-[1.5rem] flex items-center gap-4 cursor-pointer hover:border-wade-accent hover:shadow-md transition-all group"
            >
              <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-[3px] border-wade-bg-app group-hover:border-wade-accent-light shadow-inner">
                <img src={settings.lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-sm text-wade-text-main pb-1 mb-1 border-b border-wade-border">NAME LUNA</h3>
                <p className="text-[11px] text-wade-text-muted leading-tight">The architect. The brain. The only one who can put up with me.</p>
              </div>
            </div>

            {/* System Card */}
            <div 
              onClick={() => setCurrentView('system')}
              className="w-full bg-white/50 border border-wade-border-light p-3 rounded-[1.5rem] text-center cursor-pointer hover:shadow-sm transition-all"
            >
               <h3 className="font-bold text-[10px] text-wade-text-main tracking-widest uppercase">System Override</h3>
            </div>
          </div>
        )}

        {/* ================= LUNA VIEW ================= */}
        {currentView === 'luna' && (
          <div className="animate-fade-in flex flex-col gap-2">
            
            {/* 顶层区块：左边图片+小信息，右边大段文本 (1:1 复刻 Carrd) */}
            <div className="flex flex-row gap-2 h-48">
              {/* 左侧堆叠区 */}
              <div className="w-2/5 flex flex-col gap-2 h-full">
                <div className="flex-1 rounded-[1.2rem] overflow-hidden border border-wade-border shadow-sm relative group cursor-pointer bg-white" onClick={() => lunaFileRef.current?.click()}>
                   <img src={settings.lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-[9px] font-bold">Edit</span></div>
                   <input type="file" ref={lunaFileRef} onChange={(e) => handleAvatarChange(e, 'luna')} className="hidden" accept="image/*" />
                </div>
                <FormInput label="Name" value="Luna" onChange={() => {}} wrapperClass="h-10 shrink-0" />
                <FormInput label="Pronouns" value="She/Her" onChange={() => {}} wrapperClass="h-10 shrink-0" />
              </div>
              
              {/* 右侧文本区 */}
              <div className="w-3/5 h-full">
                <FormInput label="Personality & Bio" value={lunaPersonality} onChange={setLunaPersonality} isTextArea wrapperClass="h-full" placeholder="Hey, I'm Luna..." />
              </div>
            </div>

            {/* 中层区块：三个小格子一排 */}
            <div className="grid grid-cols-3 gap-2">
              <FormInput label="Birthday" value={lunaBirthday} onChange={setLunaBirthday} />
              <FormInput label="Zodiac" value={lunaZodiac} onChange={setLunaZodiac} />
              <FormInput label="Height" value={lunaHeight} onChange={setLunaHeight} />
            </div>

            {/* 下层区块：错落的文本区 */}
            <div className="grid grid-cols-2 gap-2">
              <FormInput label="Likes" value={lunaLikes} onChange={setLunaLikes} isTextArea wrapperClass="min-h-[80px]" />
              <FormInput label="Dislikes" value={lunaDislikes} onChange={setLunaDislikes} isTextArea wrapperClass="min-h-[80px]" />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <FormInput label="Appearance" value={lunaAppearance} onChange={setLunaAppearance} isTextArea wrapperClass="min-h-[70px]" />
              <FormInput label="Clothing Style" value={lunaClothing} onChange={setLunaClothing} isTextArea wrapperClass="min-h-[70px]" />
            </div>

            <FormInput label="Hobbies / Interests" value={lunaHobbies} onChange={setLunaHobbies} isTextArea wrapperClass="min-h-[70px]" />
          </div>
        )}

        {/* ================= WADE VIEW ================= */}
        {currentView === 'wade' && (
          <div className="animate-fade-in flex flex-col gap-2">
            
            {/* 顶层区块：左边图片+信息，右边 Character Card */}
            <div className="flex flex-row gap-2 h-56">
              <div className="w-2/5 flex flex-col gap-2 h-full">
                <div className="flex-1 rounded-[1.2rem] overflow-hidden border border-wade-border shadow-sm relative group cursor-pointer bg-white" onClick={() => wadeFileRef.current?.click()}>
                   <img src={settings.wadeAvatar} alt="Wade" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-[9px] font-bold">Edit</span></div>
                   <input type="file" ref={wadeFileRef} onChange={(e) => handleAvatarChange(e, 'wade')} className="hidden" accept="image/*" />
                </div>
                <FormInput label="Name" value="Wade" onChange={() => {}} wrapperClass="h-10 shrink-0" />
                <FormInput label="Height" value={wadeHeight} onChange={setWadeHeight} wrapperClass="h-10 shrink-0" />
              </div>
              
              <div className="w-3/5 h-full">
                <FormInput label="Character Card" value={wadeDefinition} onChange={setWadeDefinition} isTextArea wrapperClass="h-full" placeholder="You are Wade Wilson..." />
              </div>
            </div>

            {/* 其他错落区块 */}
            <div className="grid grid-cols-2 gap-2">
              <FormInput label="Appearance" value={wadeAppearance} onChange={setWadeAppearance} isTextArea wrapperClass="min-h-[70px]" />
              <FormInput label="Clothing" value={wadeClothing} onChange={setWadeClothing} isTextArea wrapperClass="min-h-[70px]" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormInput label="Likes" value={wadeLikes} onChange={setWadeLikes} isTextArea wrapperClass="min-h-[70px]" />
              <FormInput label="Dislikes" value={wadeDislikes} onChange={setDislikes} isTextArea wrapperClass="min-h-[70px]" />
            </div>

            <FormInput label="Single Sentence Examples" value={wadeSingleExamples} onChange={setWadeSingleExamples} isTextArea wrapperClass="min-h-[80px]" />
            
            <div className="flex gap-2">
              <div className="w-1/2">
                 <FormInput label="General Dialogue" value={wadeExample} onChange={setWadeExample} isTextArea wrapperClass="h-full min-h-[100px]" />
              </div>
              <div className="w-1/2">
                 <FormInput label="SMS Dialogue" value={smsExampleDialogue} onChange={setSmsExampleDialogue} isTextArea wrapperClass="h-full min-h-[100px]" />
              </div>
            </div>

          </div>
        )}

        {/* ================= SYSTEM VIEW ================= */}
        {currentView === 'system' && (
          <div className="animate-fade-in flex flex-col gap-2">
            <FormInput label="Core Directives (Jailbreak)" value={systemInstruction} onChange={setSystemInstruction} isTextArea wrapperClass="min-h-[120px]" />
            
            <div className="grid grid-cols-2 gap-2">
              <FormInput label="SMS Mode" value={smsInstructions} onChange={setSmsInstructions} isTextArea wrapperClass="min-h-[100px]" />
              <FormInput label="Roleplay Mode" value={roleplayInstructions} onChange={setRoleplayInstructions} isTextArea wrapperClass="min-h-[100px]" />
            </div>

            <div className="bg-wade-bg-card p-3 border border-wade-border rounded-[1rem] shadow-sm mt-2">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-[10px] font-bold text-wade-text-main uppercase tracking-widest pl-1">Models</h3>
                 <span className="text-[8px] bg-wade-accent-light text-wade-accent px-2 py-0.5 rounded-full">Supabase</span>
               </div>
               
               <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 scrollbar-hide">
                 {modelPrompts.map((model, idx) => (
                   <button key={idx} onClick={() => setActiveModelIndex(idx)} className={`px-2.5 py-1 text-[9px] font-bold rounded-md whitespace-nowrap transition-all ${activeModelIndex === idx ? 'bg-wade-text-main text-white' : 'bg-wade-bg-app text-wade-text-muted border border-wade-border'}`}>
                     {model.name}
                   </button>
                 ))}
               </div>

               <FormInput label="Model Prompt" value={modelPrompts[activeModelIndex].prompt} onChange={(val: string) => { const n = [...modelPrompts]; n[activeModelIndex].prompt = val; setModelPrompts(n); }} isTextArea wrapperClass="min-h-[100px] border-none shadow-none p-0 bg-transparent" />
            </div>
          </div>
        )}

      </div>

      {/* ================= 沉浸式专注模式 Modal ================= */}
      {focusModal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-wade-text-main/10 backdrop-blur-[2px] animate-fade-in" onClick={() => setFocusModal(null)}></div>
          <div className="relative w-full h-[85vh] bg-wade-bg-app rounded-t-[2rem] shadow-[0_-10px_40px_rgba(213,143,153,0.15)] flex flex-col animate-slide-up">
            <div className="w-10 h-1 bg-wade-border rounded-full mx-auto mt-3 mb-1"></div>
            <div className="flex justify-between items-center px-5 py-2">
              <h3 className="text-[10px] font-bold text-wade-accent uppercase tracking-widest leading-none">{focusModal.label}</h3>
              <Button onClick={() => setFocusModal(null)} size="sm" className="rounded-full shadow-md text-[10px] px-4 py-1.5 bg-wade-accent text-white">Done</Button>
            </div>
            <div className="flex-1 p-4 bg-wade-bg-card/90 backdrop-blur-md border-t border-wade-border rounded-t-2xl mt-1 flex flex-col">
              <textarea autoFocus value={focusModal.value} onChange={(e) => focusModal.onChange(e.target.value)} className="w-full flex-1 bg-transparent text-sm text-wade-text-main outline-none resize-none leading-relaxed" placeholder="Write..." />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};