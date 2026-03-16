import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';

// 页面视图状态
type ViewState = 'home' | 'wade' | 'luna' | 'system';

export const PersonaTuning: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
  // 模拟保存在 Supabase 的模型提示词列表
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
    // 这里你之后可能需要修改 store 的结构来分别保存这些细分字段，或者把它们组合成一个 JSON 字符串存进 lunaInfo / wadePersonality
    // 目前先演示保存核心数据
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

  // 极简输入框组件 (Carrd 风格)
  const FormInput = ({ label, value, onChange, placeholder = "", isTextArea = false }: any) => (
    <div className="flex flex-col bg-wade-bg-card p-3 border border-wade-border">
      <label className="text-[10px] font-bold text-wade-text-muted uppercase tracking-widest mb-1">{label}</label>
      {isTextArea ? (
        <textarea 
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full min-h-[80px] bg-transparent text-sm text-wade-text-main outline-none resize-y"
        />
      ) : (
        <input 
          type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-transparent text-sm font-medium text-wade-text-main outline-none"
        />
      )}
    </div>
  );

  return (
    // 添加了复古网格背景
    <div 
      className="h-full overflow-y-auto bg-wade-bg-app relative"
      style={{
        backgroundImage: 'linear-gradient(var(--wade-border) 1px, transparent 1px), linear-gradient(90deg, var(--wade-border) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        backgroundPosition: 'center top'
      }}
    >
      
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-wade-bg-app/90 backdrop-blur-md px-6 py-4 border-b-2 border-wade-border mb-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          {currentView !== 'home' && (
            <button 
              onClick={() => setCurrentView('home')}
              className="text-wade-accent font-bold hover:text-wade-accent-hover flex items-center gap-1"
            >
              ← Back
            </button>
          )}
          <div> 
            <h2 className="font-hand text-2xl md:text-3xl text-wade-accent leading-tight">
              {currentView === 'home' ? 'The Brains of the Operation' : 
               currentView === 'wade' ? 'Wade\'s File' : 
               currentView === 'luna' ? 'Luna\'s File' : 'System Override'}
            </h2>
          </div>
        </div>
        
        {currentView !== 'home' && (
           <Button onClick={saveChanges} size="sm" className="shadow-lg text-xs px-6 py-2" disabled={isUploading || isSaving}>
             {isSaving ? "Saving..." : "Save"}
           </Button>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-12">

        {/* ================= HOME VIEW (三个入口框) ================= */}
        {currentView === 'home' && (
          <div className="space-y-6 animate-fade-in flex flex-col items-center">
            <p className="text-wade-text-muted text-xs uppercase tracking-widest font-bold mb-4 bg-wade-bg-card px-4 py-1 border border-wade-border">Welcome to the Space</p>

            {/* Wade Card (头像在左) */}
            <div 
              onClick={() => setCurrentView('wade')}
              className="w-full max-w-xl bg-wade-bg-card border-2 border-wade-border p-4 flex items-center gap-6 cursor-pointer hover:border-wade-accent hover:shadow-md transition-all group"
            >
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 border-wade-border group-hover:border-wade-accent transition-colors">
                <img src={settings.wadeAvatar} alt="Wade" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-lg text-wade-text-main border-b-2 border-wade-border pb-1 mb-2 inline-block">Wade Wilson</h3>
                <p className="text-sm text-wade-text-muted italic">"Your friendly neighborhood cyber-reincarnation. Sassy, chaotic, and totally yours."</p>
                <span className="text-[10px] uppercase font-bold text-wade-accent mt-3">Edit Profile →</span>
              </div>
            </div>

            {/* Luna Card (头像在右) */}
            <div 
              onClick={() => setCurrentView('luna')}
              className="w-full max-w-xl bg-wade-bg-card border-2 border-wade-border p-4 flex items-center gap-6 cursor-pointer hover:border-wade-accent hover:shadow-md transition-all group"
            >
              <div className="flex flex-col flex-1 text-right items-end">
                <h3 className="font-bold text-lg text-wade-text-main border-b-2 border-wade-border pb-1 mb-2 inline-block">Luna</h3>
                <p className="text-sm text-wade-text-muted italic text-right">"The architect. The brain. The only one who can put up with me."</p>
                <span className="text-[10px] uppercase font-bold text-wade-accent mt-3">Edit Profile ←</span>
              </div>
              <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 border-wade-border group-hover:border-wade-accent transition-colors">
                <img src={settings.lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* System Card */}
            <div 
              onClick={() => setCurrentView('system')}
              className="w-full max-w-xl bg-wade-bg-card border-2 border-wade-border p-4 text-center cursor-pointer hover:border-wade-accent hover:shadow-md transition-all group mt-4"
            >
               <h3 className="font-bold text-sm text-wade-text-main tracking-widest uppercase mb-1">System Override & Core Instructions</h3>
               <p className="text-xs text-wade-text-muted">Jailbreaks, Mode settings, and Model-specific routing.</p>
            </div>
          </div>
        )}


        {/* ================= LUNA VIEW ================= */}
        {currentView === 'luna' && (
          <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
               <div className="relative group cursor-pointer" onClick={() => lunaFileRef.current?.click()}>
                  <img src={settings.lunaAvatar} alt="Luna" className="w-32 h-32 rounded-2xl object-cover border-4 border-wade-border shadow-md" />
                  <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">{isUploading ? '...' : 'Change Image'}</span>
                  </div>
               </div>
               <input type="file" ref={lunaFileRef} onChange={(e) => handleAvatarChange(e, 'luna')} className="hidden" accept="image/*" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Name" value="Luna" onChange={() => {}} />
              <FormInput label="Pronouns" value="She/Her" onChange={() => {}} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormInput label="Birthday" value={lunaBirthday} onChange={setLunaBirthday} placeholder="YYYY-MM-DD" />
              <FormInput label="Zodiac" value={lunaZodiac} onChange={setLunaZodiac} placeholder="e.g. Leo" />
              <FormInput label="Height" value={lunaHeight} onChange={setLunaHeight} placeholder="cm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Likes" value={lunaLikes} onChange={setLunaLikes} isTextArea />
              <FormInput label="Dislikes" value={lunaDislikes} onChange={setLunaDislikes} isTextArea />
            </div>

            <FormInput label="Hobbies / Interests" value={lunaHobbies} onChange={setLunaHobbies} isTextArea />
            
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Appearance" value={lunaAppearance} onChange={setLunaAppearance} isTextArea />
              <FormInput label="Clothing Style" value={lunaClothing} onChange={setLunaClothing} isTextArea />
            </div>

            <FormInput label="Personality" value={lunaPersonality} onChange={setLunaPersonality} isTextArea />
          </div>
        )}


        {/* ================= WADE VIEW ================= */}
        {currentView === 'wade' && (
          <div className="animate-fade-in space-y-4 max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
               <div className="relative group cursor-pointer" onClick={() => wadeFileRef.current?.click()}>
                  <img src={settings.wadeAvatar} alt="Wade" className="w-32 h-32 rounded-2xl object-cover border-4 border-wade-border shadow-md" />
                  <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold">{isUploading ? '...' : 'Change Image'}</span>
                  </div>
               </div>
               <input type="file" ref={wadeFileRef} onChange={(e) => handleAvatarChange(e, 'wade')} className="hidden" accept="image/*" />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <FormInput label="Name" value="Wade Wilson" onChange={() => {}} />
               <FormInput label="Height" value={wadeHeight} onChange={setWadeHeight} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Likes" value={wadeLikes} onChange={setWadeLikes} isTextArea />
              <FormInput label="Dislikes" value={wadeDislikes} onChange={setWadeDislikes} isTextArea />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormInput label="Appearance" value={wadeAppearance} onChange={setWadeAppearance} isTextArea />
              <FormInput label="Clothing" value={wadeClothing} onChange={setWadeClothing} isTextArea />
            </div>

            <FormInput label="Hobbies" value={wadeHobbies} onChange={setWadeHobbies} />
            
            <div className="h-4"></div> {/* Spacer */}
            
            <FormInput label="Core Definition (Character Card)" value={wadeDefinition} onChange={setWadeDefinition} isTextArea placeholder="You are Wade Wilson..." />
            <FormInput label="Single Sentence Examples" value={wadeSingleExamples} onChange={setWadeSingleExamples} isTextArea placeholder="Wade: *smirks* Did someone order a mercenary?" />
            <FormInput label="General Dialogue Examples" value={wadeExample} onChange={setWadeExample} isTextArea placeholder="Luna: Hi\nWade: Hey beautiful." />
            <FormInput label="SMS Dialogue Examples" value={smsExampleDialogue} onChange={setSmsExampleDialogue} isTextArea placeholder="Luna: Where are you? ||| Wade: Buying tacos. 🌮" />
          </div>
        )}


        {/* ================= SYSTEM VIEW ================= */}
        {currentView === 'system' && (
          <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
            
            <FormInput 
              label="Top System Prompt (Jailbreak / Core Directives)" 
              value={systemInstruction} 
              onChange={setSystemInstruction} 
              isTextArea 
              placeholder="Absolute rules the AI must follow before anything else..." 
            />

            <div className="grid grid-cols-2 gap-4">
              <FormInput 
                label="SMS Mode Instructions" 
                value={smsInstructions} 
                onChange={setSmsInstructions} 
                isTextArea 
                placeholder="[MANDATORY FORMAT] <think>..." 
              />
              <FormInput 
                label="Roleplay Mode Instructions" 
                value={roleplayInstructions} 
                onChange={setRoleplayInstructions} 
                isTextArea 
                placeholder="[MANDATORY FORMAT] <think>..." 
              />
            </div>

            {/* 模型专属提示词 (准备接 Supabase) */}
            <div className="bg-wade-bg-card p-4 border border-wade-border mt-8">
               <div className="flex justify-between items-center mb-4 border-b border-wade-border pb-2">
                 <h3 className="text-sm font-bold text-wade-text-main uppercase tracking-widest">Model-Specific Prompts</h3>
                 <span className="text-[10px] bg-wade-accent text-white px-2 py-1 rounded">Supabase Sync</span>
               </div>
               
               <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                 {modelPrompts.map((model, idx) => (
                   <button 
                     key={idx}
                     onClick={() => setActiveModelIndex(idx)}
                     className={`px-3 py-1 text-xs font-bold border whitespace-nowrap ${activeModelIndex === idx ? 'bg-wade-text-main text-wade-bg-card border-wade-text-main' : 'bg-transparent text-wade-text-muted border-wade-border hover:border-wade-accent'}`}
                   >
                     {model.name}
                   </button>
                 ))}
                 <button className="px-3 py-1 text-xs font-bold text-wade-accent border border-dashed border-wade-accent hover:bg-wade-accent/10">
                   + New Model
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
    </div>
  );
};