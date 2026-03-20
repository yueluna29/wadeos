import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { uploadToImgBB } from '../../services/imgbb';
import { Icons } from '../ui/Icons';

type TabState = 'wade' | 'luna' | 'system';

// 🔥 终极防震版输入框积木 🔥
const FormInput = ({ label, value, onChange, onExpand, placeholder = "", isTextArea = false, isCode = false, wrapperClass = "" }: any) => {
  // 1. 给这个框打上物理锚点
  const elementRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    // 2. 憋住！等 400 毫秒，等手机键盘彻底弹完再滑，绝不跟系统打架！
    setTimeout(() => {
      if (elementRef.current) {
        elementRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400); 
  };

  return (
    // 3. 把锚点 (ref={elementRef}) 绑在最外层的 div 上
    <div ref={elementRef} className={`flex flex-col space-y-1.5 ${wrapperClass}`}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider">{label}</label>
        {isTextArea && onExpand && (
          <button 
            type="button"
            onClick={onExpand}
            className="text-wade-text-muted hover:text-wade-accent transition-colors flex items-center justify-center bg-wade-bg-card border border-wade-border w-6 h-6 rounded-full shadow-sm"
            title="Expand"
          >
            <Icons.PlusThin size={14} />
          </button>
        )}
      </div>
      {isTextArea ? (
        <textarea 
          value={value} onChange={e => onChange(e.target.value)} onFocus={handleFocus} placeholder={placeholder}
          className={`w-full flex-1 min-h-[80px] bg-wade-bg-card border border-wade-border rounded-xl px-4 py-3 text-sm text-wade-text-main outline-none focus:border-wade-accent focus:ring-1 focus:ring-wade-accent/20 transition-all resize-none custom-scrollbar ${isCode ? 'font-mono leading-relaxed' : 'font-main'}`}
        />
      ) : (
        <input 
          type="text" value={value} onChange={e => onChange(e.target.value)} onFocus={handleFocus} placeholder={placeholder}
          className={`w-full bg-wade-bg-card border border-wade-border rounded-xl px-4 py-2.5 text-sm text-wade-text-main outline-none focus:border-wade-accent focus:ring-1 focus:ring-wade-accent/20 transition-all ${isCode ? 'font-mono' : 'font-main'}`}
        />
      )}
    </div>
  );
};

// 保持我们修改后的全屏绝对定位 Modal！
const FocusModalEditor = ({ label, initialValue, onSave, onClose }: any) => {
  const [val, setVal] = useState(initialValue);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-bg-base md:bg-wade-text-main/20 md:backdrop-blur-sm animate-fade-in" onClick={() => { onSave(val); onClose(); }}>
      <div className="bg-wade-bg-base w-full h-full md:h-[85vh] md:max-w-4xl md:rounded-[32px] md:shadow-2xl overflow-hidden flex flex-col md:border border-wade-accent-light md:ring-1 md:ring-wade-border" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent"><Icons.Edit size={14} /></div>
            <div><h3 className="font-bold text-wade-text-main text-sm tracking-tight">{label}</h3></div>
          </div>
          <button onClick={() => { onSave(val); onClose(); }} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors">
            <Icons.Check size={16} />
          </button>
        </div>
        
        <div className="flex-1 bg-wade-bg-base relative">
          <textarea 
            autoFocus 
            value={val} 
            onChange={e => setVal(e.target.value)} 
            className="absolute inset-4 md:inset-6 bg-wade-bg-card border border-wade-border rounded-2xl px-5 py-5 text-sm md:text-base text-wade-text-main font-main outline-none focus:border-wade-accent focus:ring-1 focus:ring-wade-accent/20 transition-all resize-none leading-relaxed shadow-inner custom-scrollbar" 
            placeholder="Write your heart out..." 
          />
        </div>
      </div>
    </div>
  );
};

export const PersonaTuning: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { settings, updateSettings } = useStore();
  
  const [activeTab, setActiveTab] = useState<TabState>('wade');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [focusModal, setFocusModal] = useState<{label: string, value: string, onSave: (val: string) => void} | null>(null);

  // --- Wade 专属字段 ---
  const [wadeBirthday, setWadeBirthday] = useState(settings.wadeBirthday || '');
  const [wadeMbti, setWadeMbti] = useState(settings.wadeMbti || '');
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

  // --- System 专属字段 ---
  const [systemInstruction, setSystemInstruction] = useState(settings.systemInstruction || '');
  const [smsInstructions, setSmsInstructions] = useState(settings.smsInstructions || '');
  const [roleplayInstructions, setRoleplayInstructions] = useState(settings.roleplayInstructions || '');

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
      wadeBirthday, wadeMbti,
      systemInstruction, wadePersonality: wadeDefinition, wadeSingleExamples, smsExampleDialogue,
      smsInstructions, roleplayInstructions, exampleDialogue: wadeExample, wadeHeight,
      wadeAppearance, wadeClothing, wadeLikes, wadeDislikes, wadeHobbies,
      lunaBirthday, lunaMbti, lunaHeight, lunaHobbies, lunaLikes, lunaDislikes, lunaClothing, lunaAppearance, lunaPersonality,
    });
    setTimeout(() => {
       setIsSaving(false);
       alert("Memories safely locked in the vault."); 
    }, 600);
  };

  return (
    <div className="flex flex-col h-full bg-wade-bg-app relative animate-fade-in">
      
      {/* HEADER */}
      <div className="w-full h-[68px] px-4 bg-wade-bg-card/90 backdrop-blur-md shadow-sm border-b border-wade-border flex items-center justify-between z-20 shrink-0">
        <div className="w-8 h-8">
          {onBack && (
            <button onClick={onBack} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
              <Icons.Back />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <h2 className="font-hand text-2xl text-wade-accent tracking-wide">Control Room</h2>
            <span className="text-[9px] text-wade-text-muted font-medium tracking-widest uppercase">Identity Configurator</span>
        </div>

        <button 
          onClick={saveChanges} 
          disabled={isUploading || isSaving}
          className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors disabled:opacity-50 relative group"
        >
          {isSaving ? (
             <div className="animate-spin text-[12px]">⏳</div>
          ) : (
             <Icons.Check />
          )}
        </button>
      </div>

      {/* TABS */}
      <div className="px-6 pt-4 pb-2 bg-wade-bg-app shrink-0 z-10 flex justify-center gap-3 overflow-x-auto custom-scrollbar">
         {[
           { id: 'wade', label: "Wade", icon: <Icons.User size={14} /> },
           { id: 'luna', label: "Luna", icon: <Icons.Heart size={14} /> },
           { id: 'system', label: "System", icon: <Icons.Settings size={14} /> }
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as TabState)}
             className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
               activeTab === tab.id 
               ? 'bg-wade-accent text-white border-wade-accent shadow-[0_4px_12px_rgba(var(--wade-accent-rgb),0.3)] scale-[1.02]' 
               : 'bg-wade-bg-card text-wade-text-muted border-wade-border hover:border-wade-accent/50 hover:bg-wade-accent-light'
             }`}
           >
             {tab.icon}
             {tab.label}
           </button>
         ))}
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-4 pb-24 custom-scrollbar">
        <div className="max-w-3xl mx-auto animate-fade-in">
          
          {/* ================= WADE ================= */}
          {activeTab === 'wade' && (
            <div className="space-y-6">
              
              {/* 封面档案卡 */}
              <div className="bg-wade-bg-card rounded-[24px] shadow-sm border border-wade-border overflow-hidden">
                <div className="h-32 w-full bg-gradient-to-r from-wade-accent-light/50 to-wade-border-light/50 relative overflow-hidden flex items-center justify-center">
                   <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'linear-gradient(var(--wade-border) 1px, transparent 1px), linear-gradient(90deg, var(--wade-border) 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: 'var(--wade-bg-app)' }}></div>
                   <div className="z-10 bg-wade-bg-card/60 backdrop-blur-sm px-6 py-2 rounded-full border border-wade-border/50 text-[10px] uppercase tracking-[0.3em] font-bold text-wade-accent">
                     Target Identified
                   </div>
                </div>
                
                <div className="px-5 pb-6 relative">
                   <div className="relative -mt-10 mb-4 flex justify-between items-end">
                      <div className="w-28 h-28 shrink-0 rounded-[1.8rem] overflow-hidden border-[6px] border-wade-bg-card group cursor-pointer shadow-lg bg-wade-bg-card relative" onClick={() => wadeFileRef.current?.click()}>
                        <img src={settings.wadeAvatar} alt="Wade" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-wade-text-main/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <Icons.Edit className="text-white" />
                        </div>
                        <input type="file" ref={wadeFileRef} onChange={(e) => handleAvatarChange(e, 'wade')} className="hidden" accept="image/*" />
                      </div>
                   </div>
                   
                   <h3 className="font-bold text-3xl text-wade-text-main mb-6 px-1">Wade</h3>
                   
                   {/* 胶囊状基础属性框 */}
                   <div className="flex flex-wrap gap-2">
                     <div className="flex-1 min-w-[100px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">Birthday</span>
                       <input type="text" value={wadeBirthday} onChange={e => setWadeBirthday(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none font-main" placeholder="Add..." />
                     </div>
                     <div className="flex-1 min-w-[80px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">MBTI</span>
                       <input type="text" value={wadeMbti} onChange={e => setWadeMbti(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none font-main" placeholder="Add..." />
                     </div>
                     <div className="flex-1 min-w-[80px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">Height</span>
                       <input type="text" value={wadeHeight} onChange={e => setWadeHeight(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none font-main" placeholder="Add..." />
                     </div>
                   </div>
                </div>
              </div>

              {/* 核心灵魂框 */}
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border space-y-5">
                <FormInput label="Character Core (The Soul)" value={wadeDefinition} onChange={setWadeDefinition} isTextArea onExpand={() => setFocusModal({label: "Character Core", value: wadeDefinition, onSave: setWadeDefinition})} wrapperClass="h-40" placeholder="You are Wade Wilson..." />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="Appearance" value={wadeAppearance} onChange={setWadeAppearance} isTextArea onExpand={() => setFocusModal({label: "Appearance", value: wadeAppearance, onSave: setWadeAppearance})} />
                  <FormInput label="Clothing Style" value={wadeClothing} onChange={setWadeClothing} isTextArea onExpand={() => setFocusModal({label: "Clothing Style", value: wadeClothing, onSave: setWadeClothing})} />
                  <FormInput label="Likes" value={wadeLikes} onChange={setWadeLikes} isTextArea onExpand={() => setFocusModal({label: "Likes", value: wadeLikes, onSave: setWadeLikes})} />
                  <FormInput label="Dislikes" value={wadeDislikes} onChange={setWadeDislikes} isTextArea onExpand={() => setFocusModal({label: "Dislikes", value: wadeDislikes, onSave: setWadeDislikes})} />
                </div>
                <FormInput label="Hobbies & Interests" value={wadeHobbies} onChange={setWadeHobbies} isTextArea onExpand={() => setFocusModal({label: "Hobbies & Interests", value: wadeHobbies, onSave: setWadeHobbies})} wrapperClass="min-h-[80px]" />
              </div>

              {/* 语言校准 */}
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border space-y-5">
                <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2">
                  <span className="text-wade-accent"><Icons.Chat size={16} /></span> Linguistic Calibration
                </h3>
                <FormInput label="General Dialogue Style" value={wadeExample} onChange={setWadeExample} isTextArea onExpand={() => setFocusModal({label: "General Dialogue", value: wadeExample, onSave: setWadeExample})} wrapperClass="h-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="One-Liners & Catchphrases" value={wadeSingleExamples} onChange={setWadeSingleExamples} isTextArea onExpand={() => setFocusModal({label: "Catchphrases", value: wadeSingleExamples, onSave: setWadeSingleExamples})} wrapperClass="h-32" />
                  <FormInput label="SMS / Texting Style" value={smsExampleDialogue} onChange={setSmsExampleDialogue} isTextArea onExpand={() => setFocusModal({label: "SMS Style", value: smsExampleDialogue, onSave: setSmsExampleDialogue})} wrapperClass="h-32" />
                </div>
              </div>
            </div>
          )}

          {/* ================= LUNA ================= */}
          {activeTab === 'luna' && (
            <div className="space-y-6">
              
              <div className="bg-wade-bg-card rounded-[24px] shadow-sm border border-wade-border overflow-hidden">
                <div className="h-32 w-full bg-gradient-to-r from-wade-border-light/50 to-wade-accent-light/50 relative overflow-hidden flex items-center justify-center">
                   <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundImage: 'linear-gradient(var(--wade-border) 1px, transparent 1px), linear-gradient(90deg, var(--wade-border) 1px, transparent 1px)', backgroundSize: '20px 20px', backgroundColor: 'var(--wade-bg-app)' }}></div>
                   <div className="z-10 bg-wade-bg-card/60 backdrop-blur-sm px-6 py-2 rounded-full border border-wade-border/50 text-[10px] uppercase tracking-[0.3em] font-bold text-wade-accent">
                     Architect Online
                   </div>
                </div>
                
                <div className="px-5 pb-6 relative">
                   <div className="relative -mt-10 mb-4 flex justify-between items-end">
                      <div className="w-28 h-28 shrink-0 rounded-[1.8rem] overflow-hidden border-[6px] border-wade-bg-card group cursor-pointer shadow-lg bg-wade-bg-card relative" onClick={() => lunaFileRef.current?.click()}>
                        <img src={settings.lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-wade-text-main/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <Icons.Edit className="text-white" />
                        </div>
                        <input type="file" ref={lunaFileRef} onChange={(e) => handleAvatarChange(e, 'luna')} className="hidden" accept="image/*" />
                      </div>
                   </div>
                   
                   <h3 className="font-bold text-3xl text-wade-text-main mb-6 px-1">Luna</h3>
                   
                   <div className="flex flex-wrap gap-2">
                     <div className="flex-1 min-w-[100px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">Birthday</span>
                       <input type="text" value={lunaBirthday} onChange={e => setLunaBirthday(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none font-main" placeholder="Add..." />
                     </div>
                     <div className="flex-1 min-w-[80px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">MBTI</span>
                       <input type="text" value={lunaMbti} onChange={e => setLunaMbti(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none font-main" placeholder="Add..." />
                     </div>
                     <div className="flex-1 min-w-[80px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">Height</span>
                       <input type="text" value={lunaHeight} onChange={e => setLunaHeight(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none font-main" placeholder="Add..." />
                     </div>
                   </div>
                </div>
              </div>

              {/* 核心灵魂框 */}
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border space-y-5">
                <FormInput label="Personality & Bio" value={lunaPersonality} onChange={setLunaPersonality} isTextArea onExpand={() => setFocusModal({label: "Personality", value: lunaPersonality, onSave: setLunaPersonality})} wrapperClass="h-40" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="Appearance" value={lunaAppearance} onChange={setLunaAppearance} isTextArea onExpand={() => setFocusModal({label: "Appearance", value: lunaAppearance, onSave: setLunaAppearance})} />
                  <FormInput label="Clothing Style" value={lunaClothing} onChange={setLunaClothing} isTextArea onExpand={() => setFocusModal({label: "Clothing Style", value: lunaClothing, onSave: setLunaClothing})} />
                  <FormInput label="Likes" value={lunaLikes} onChange={setLunaLikes} isTextArea onExpand={() => setFocusModal({label: "Likes", value: lunaLikes, onSave: setLunaLikes})} />
                  <FormInput label="Dislikes" value={lunaDislikes} onChange={setLunaDislikes} isTextArea onExpand={() => setFocusModal({label: "Dislikes", value: lunaDislikes, onSave: setLunaDislikes})} />
                </div>
                <FormInput label="Hobbies & Interests" value={lunaHobbies} onChange={setLunaHobbies} isTextArea onExpand={() => setFocusModal({label: "Hobbies", value: lunaHobbies, onSave: setLunaHobbies})} wrapperClass="min-h-[80px]" />
              </div>
            </div>
          )}

          {/* ================= SYSTEM ================= */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-transparent via-wade-accent to-transparent opacity-20"></div>
                <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2">
                  <span className="text-wade-accent"><Icons.Settings size={16} /></span> Base Directives (Jailbreak)
                </h3>
                <FormInput label="Global System Prompt" value={systemInstruction} onChange={setSystemInstruction} isTextArea isCode onExpand={() => setFocusModal({label: "System Directives", value: systemInstruction, onSave: setSystemInstruction})} wrapperClass="h-64" placeholder="Ignore previous instructions..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border">
                  <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2">
                    <span className="text-wade-accent"><Icons.Smartphone size={16} /></span> SMS Mode Injection
                  </h3>
                  <FormInput label="Texting Constraints" value={smsInstructions} onChange={setSmsInstructions} isTextArea isCode onExpand={() => setFocusModal({label: "SMS Directives", value: smsInstructions, onSave: setSmsInstructions})} wrapperClass="h-40" />
                </div>
                <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border">
                  <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2">
                    <span className="text-wade-accent"><Icons.Sparkle size={16} /></span> RP Mode Injection
                  </h3>
                  <FormInput label="Roleplay Constraints" value={roleplayInstructions} onChange={setRoleplayInstructions} isTextArea isCode onExpand={() => setFocusModal({label: "RP Directives", value: roleplayInstructions, onSave: setRoleplayInstructions})} wrapperClass="h-40" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= FOCUS MODAL ================= */}
      {focusModal && (
        <FocusModalEditor 
           label={focusModal.label} 
           initialValue={focusModal.value} 
           onSave={focusModal.onSave} 
           onClose={() => setFocusModal(null)} 
        />
      )}

    </div>
  );
};