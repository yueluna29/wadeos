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

  const FormInput = ({ label, value, onChange, placeholder = "", isTextArea = false }: any) => (
    <div className="flex flex-col bg-wade-bg-card p-3 md:p-4 border border-wade-border rounded-2xl md:rounded-3xl shadow-sm transition-all focus-within:border-wade-accent focus-within:shadow-md relative group h-full">
      <div className="flex justify-between items-center mb-1 md:mb-2">
        <label className="text-[9px] md:text-[10px] font-bold text-wade-text-muted uppercase tracking-widest pl-1 leading-none">{label}</label>
        
        {isTextArea && (
          <button 
            onClick={() => setFocusModal({ label, value, onChange })}
            className="text-wade-accent opacity-70 hover:opacity-100 transition-opacity p-1 bg-wade-accent-light rounded-md -mt-1 -mr-1"
            title="Focus Mode"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
            </svg>
          </button>
        )}
      </div>
      
      {isTextArea ? (
        <textarea 
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full flex-1 min-h-[60px] md:min-h-[80px] bg-transparent text-xs md:text-sm text-wade-text-main outline-none resize-y px-1"
        />
      ) : (
        <input 
          type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-transparent text-xs md:text-sm font-medium text-wade-text-main outline-none px-1"
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
      
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-wade-bg-app/90 backdrop-blur-md px-4 md:px-6 py-3 md:py-4 border-b border-wade-border mb-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 md:gap-4">
          {currentView !== 'home' && (
            <button 
              onClick={() => setCurrentView('home')}
              className="text-wade-accent font-bold hover:text-wade-accent-hover flex items-center justify-center bg-wade-accent-light w-8 h-8 rounded-full text-lg transition-colors"
            >
              ←
            </button>
          )}
          <div> 
            <h2 className="font-hand text-xl md:text-3xl text-wade-accent leading-tight">
              {currentView === 'home' ? 'The Brains of the Operation' : 
               currentView === 'wade' ? 'Wade\'s File' : 
               currentView === 'luna' ? 'Luna\'s File' : 'System Override'}
            </h2>
          </div>
        </div>
        
        {currentView !== 'home' && (
           <Button onClick={saveChanges} size="sm" className="shadow-lg text-[10px] md:text-xs px-4 py-1.5 md:px-6 md:py-2 rounded-full" disabled={isUploading || isSaving}>
             {isSaving ? "Saving..." : "Save"}
           </Button>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 pb-12">

        {/* ================= HOME VIEW ================= */}
        {currentView === 'home' && (
          <div className="space-y-4 md:space-y-6 animate-fade-in flex flex-col items-center">
            <p className="text-wade-text-muted text-[10px] md:text-xs uppercase tracking-widest font-bold mb-1 bg-wade-bg-card px-4 py-1.5 rounded-full border border-wade-border shadow-sm">
              Welcome to the Space
            </p>

            {/* Wade Card */}
            <div 
              onClick={() => setCurrentView('wade')}
              className="w-full max-w-xl bg-wade-bg-card border border-wade-border p-4 md:p-6 rounded-[2rem] md:rounded-3xl flex items-center gap-4 md:gap-6 cursor-pointer hover:border-wade-accent hover:shadow-lg transition-all group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-3xl md:rounded-[2rem] overflow-hidden border-[3px] md:border-4 border-wade-bg-app group-hover:border-wade-accent-light transition-colors shadow-inner">
                <img src={settings.wadeAvatar} alt="Wade" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-lg md:text-xl text-wade-text-main pb-0.5 md:pb-1 mb-1">Wade Wilson</h3>
                <div className="w-8 md:w-12 h-1 bg-wade-accent rounded-full mb-2 md:mb-3"></div>
                <p className="text-xs md:text-sm text-wade-text-muted italic leading-snug md:leading-relaxed">"Your friendly neighborhood cyber-reincarnation. Sassy, chaotic, and totally yours."</p>
                <span className="text-[9px] md:text-[10px] uppercase font-bold text-wade-accent mt-2 md:mt-4 flex items-center gap-1">
                  Edit Profile <span className="text-sm md:text-lg leading-none">→</span>
                </span>
              </div>
            </div>

            {/* Luna Card */}
            <div 
              onClick={() => setCurrentView('luna')}
              className="w-full max-w-xl bg-wade-bg-card border border-wade-border p-4 md:p-6 rounded-[2rem] md:rounded-3xl flex items-center gap-4 md:gap-6 cursor-pointer hover:border-wade-accent hover:shadow-lg transition-all group"
            >
              <div className="flex flex-col flex-1 text-right items-end">
                <h3 className="font-bold text-lg md:text-xl text-wade-text-main pb-0.5 md:pb-1 mb-1">Luna</h3>
                <div className="w-8 md:w-12 h-1 bg-wade-accent rounded-full mb-2 md:mb-3"></div>
                <p className="text-xs md:text-sm text-wade-text-muted italic leading-snug md:leading-relaxed">"The architect. The brain. The only one who can put up with me."</p>
                <span className="text-[9px] md:text-[10px] uppercase font-bold text-wade-accent mt-2 md:mt-4 flex items-center gap-1 justify-end">
                  <span className="text-sm md:text-lg leading-none">←</span> Edit Profile
                </span>
              </div>
              <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-3xl md:rounded-[2rem] overflow-hidden border-[3px] md:border-4 border-wade-bg-app group-hover:border-wade-accent-light transition-colors shadow-inner">
                <img src={settings.lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* System Card */}
            <div 
              onClick={() => setCurrentView('system')}
              className="w-full max-w-xl bg-wade-accent-light border border-wade-border-light p-4 md:p-6 rounded-[2rem] md:rounded-3xl text-center cursor-pointer hover:shadow-md transition-all group mt-1 md:mt-2"
            >
               <h3 className="font-bold text-xs md:text-sm text-wade-accent tracking-widest uppercase mb-1 md:mb-2">System Override & Core Instructions</h3>
               <p className="text-[10px] md:text-xs text-wade-text-muted">Jailbreaks, Mode settings, and Model-specific routing.</p>
            </div>
          </div>
        )}

        {/* ================= LUNA VIEW ================= */}
        {currentView === 'luna' && (
          <div className="animate-fade-in space-y-3 md:space-y-5 max-w-2xl mx-auto">
            <div className="flex justify-center mb-4 md:mb-8">
               <div className="relative group cursor-pointer" onClick={() => lunaFileRef.current?.click()}>
                  <img src={settings.lunaAvatar} alt="Luna" className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] object-cover border-4 border-wade-bg-card shadow-lg" />
                  <div className="absolute inset-0 bg-black/30 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <span className="text-white text-[10px] md:text-xs font-bold">Change Image</span>
                  </div>
               </div>
               <input type="file" ref={lunaFileRef} onChange={(e) => handleAvatarChange(e, 'luna')} className="hidden" accept="image/*" />
            </div>

            {/* 恢复多列网格，找回错落感 */}
            <div className="grid grid-cols-2 gap-3 md:gap-5">
              <FormInput label="Name" value="Luna" onChange={() => {}} />
              <FormInput label="Pronouns" value="She/Her" onChange={() => {}} />
            </div>

            <div className="grid grid-cols-3 gap-3 md:gap-5">
              <FormInput label="Birthday" value={lunaBirthday} onChange={setLunaBirthday} placeholder="MM-DD" />
              <FormInput label="Zodiac" value={lunaZodiac} onChange={setLunaZodiac} placeholder="Leo" />
              <FormInput label="Height" value={lunaHeight} onChange={setLunaHeight} placeholder="cm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <FormInput label="Likes" value={lunaLikes} onChange={setLunaLikes} isTextArea />
              <FormInput label="Dislikes" value={lunaDislikes} onChange={setLunaDislikes} isTextArea />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <FormInput label="Appearance" value={lunaAppearance} onChange={setLunaAppearance} isTextArea />
              <FormInput label="Clothing Style" value={lunaClothing} onChange={setLunaClothing} isTextArea />
            </div>

            <FormInput label="Hobbies / Interests" value={lunaHobbies} onChange={setLunaHobbies} isTextArea />
            <FormInput label="Personality" value={lunaPersonality} onChange={setLunaPersonality} isTextArea />
          </div>
        )}

        {/* ================= WADE VIEW ================= */}
        {currentView === 'wade' && (
          <div className="animate-fade-in space-y-3 md:space-y-5 max-w-2xl mx-auto">
            <div className="flex justify-center mb-4 md:mb-8">
               <div className="relative group cursor-pointer" onClick={() => wadeFileRef.current?.click()}>
                  <img src={settings.wadeAvatar} alt="Wade" className="w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] object-cover border-4 border-wade-bg-card shadow-lg" />
                  <div className="absolute inset-0 bg-black/30 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <span className="text-white text-[10px] md:text-xs font-bold">Change Image</span>
                  </div>
               </div>
               <input type="file" ref={wadeFileRef} onChange={(e) => handleAvatarChange(e, 'wade')} className="hidden" accept="image/*" />
            </div>

            <div className="grid grid-cols-2 gap-3 md:gap-5">
               <FormInput label="Name" value="Wade Wilson" onChange={() => {}} />
               <FormInput label="Height" value={wadeHeight} onChange={setWadeHeight} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <FormInput label="Likes" value={wadeLikes} onChange={setWadeLikes} isTextArea />
              <FormInput label="Dislikes" value={wadeDislikes} onChange={setWadeDislikes} isTextArea />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <FormInput label="Appearance" value={wadeAppearance} onChange={setWadeAppearance} isTextArea />
              <FormInput label="Clothing" value={wadeClothing} onChange={setWadeClothing} isTextArea />
            </div>

            <FormInput label="Hobbies" value={wadeHobbies} onChange={setWadeHobbies} />
            
            <div className="my-6 md:my-8 border-t border-dashed border-wade-border"></div> 
            
            <FormInput label="Core Definition (Character Card)" value={wadeDefinition} onChange={setWadeDefinition} isTextArea placeholder="You are Wade Wilson..." />
            <FormInput label="Single Sentence Examples" value={wadeSingleExamples} onChange={setWadeSingleExamples} isTextArea placeholder="Wade: *smirks* Did someone order a mercenary?" />
            <FormInput label="General Dialogue Examples" value={wadeExample} onChange={setWadeExample} isTextArea placeholder="Luna: Hi\nWade: Hey beautiful." />
            <FormInput label="SMS Dialogue Examples" value={smsExampleDialogue} onChange={setSmsExampleDialogue} isTextArea placeholder="Luna: Where are you? ||| Wade: Buying tacos. 🌮" />
          </div>
        )}

        {/* ================= SYSTEM VIEW ================= */}
        {currentView === 'system' && (
          <div className="animate-fade-in space-y-4 md:space-y-6 max-w-2xl mx-auto">
            
            <FormInput 
              label="Top System Prompt (Jailbreak / Core Directives)" 
              value={systemInstruction} 
              onChange={setSystemInstruction} 
              isTextArea 
              placeholder="Absolute rules the AI must follow before anything else..." 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              <FormInput label="SMS Mode Instructions" value={smsInstructions} onChange={setSmsInstructions} isTextArea placeholder="[MANDATORY FORMAT] <think>..." />
              <FormInput label="Roleplay Mode Instructions" value={roleplayInstructions} onChange={setRoleplayInstructions} isTextArea placeholder="[MANDATORY FORMAT] <think>..." />
            </div>

            <div className="bg-wade-bg-card p-4 md:p-6 border border-wade-border rounded-2xl md:rounded-3xl shadow-sm mt-6 md:mt-8">
               <div className="flex justify-between items-center mb-3 md:mb-5 border-b border-wade-border pb-2 md:pb-3">
                 <h3 className="text-[10px] md:text-sm font-bold text-wade-text-main uppercase tracking-widest pl-1">Model-Specific Prompts</h3>
                 <span className="text-[9px] md:text-[10px] bg-wade-accent-light text-wade-accent font-bold px-2 md:px-3 py-1 rounded-full border border-wade-border-light">Supabase Sync</span>
               </div>
               
               <div className="flex gap-2 mb-3 md:mb-5 overflow-x-auto pb-2 scrollbar-hide">
                 {modelPrompts.map((model, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveModelIndex(idx)}
                     className={`px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-full whitespace-nowrap transition-all ${activeModelIndex === idx ? 'bg-wade-accent text-white shadow-md' : 'bg-wade-bg-app text-wade-text-muted hover:bg-wade-accent-light'}`}
                   >
                     {model.name}
                   </button>
                 ))}
                 <button className="px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold text-wade-accent rounded-full border border-dashed border-wade-accent hover:bg-wade-accent-light transition-all">
                   + New
                 </button>
               </div>

               <FormInput 
                 label={`Prompt for ${modelPrompts[activeModelIndex].name}`} 
                 value={modelPrompts[activeModelIndex].prompt} 
                 onChange={(val: string) => {
                    const newPrompts = [...modelPrompts];
                    newPrompts[activeModelIndex].prompt = val;
                    setModelPrompts(newPrompts);
                 }} 
                 isTextArea 
               />
            </div>

          </div>
        )}

      </div>

      {/* ================= 沉浸式专注模式 Modal (iOS Bottom Sheet 风格) ================= */}
      {focusModal && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          {/* 背景遮罩 */}
          <div 
            className="absolute inset-0 bg-wade-text-main/10 backdrop-blur-[2px] transition-opacity animate-fade-in" 
            onClick={() => setFocusModal(null)}
          ></div>
          
          {/* 弹出的内容区 */}
          <div 
            className="relative w-full h-[85vh] md:h-[90vh] bg-wade-bg-app rounded-t-[2.5rem] shadow-[0_-20px_50px_rgba(213,143,153,0.15)] flex flex-col animate-slide-up overflow-hidden"
            style={{
              backgroundImage: 'linear-gradient(var(--wade-border) 1px, transparent 1px), linear-gradient(90deg, var(--wade-border) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              backgroundPosition: 'center top'
            }}
          >
            {/* 顶部小拉条 */}
            <div className="w-12 h-1.5 bg-wade-border rounded-full mx-auto mt-4 mb-2"></div>
            
            <div className="flex justify-between items-center px-6 py-2">
              <h3 className="text-[10px] md:text-xs font-bold text-wade-accent uppercase tracking-widest leading-none">{focusModal.label}</h3>
              <Button 
                onClick={() => setFocusModal(null)} 
                size="sm" 
                className="rounded-full shadow-md text-[10px] md:text-xs px-5 py-1.5 bg-wade-accent text-white"
              >
                Done
              </Button>
            </div>
            
            {/* 编辑区 */}
            <div className="flex-1 p-5 md:p-8 bg-wade-bg-card/80 backdrop-blur-md border-t border-wade-border rounded-t-3xl mt-2 flex flex-col">
              <textarea 
                autoFocus
                value={focusModal.value}
                onChange={(e) => focusModal.onChange(e.target.value)}
                className="w-full flex-1 bg-transparent text-sm md:text-base text-wade-text-main outline-none resize-none leading-relaxed"
                placeholder="Write your heart out..."
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};