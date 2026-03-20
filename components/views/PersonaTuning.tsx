import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { uploadToImgBB } from '../../services/imgbb';
import { Icons } from '../ui/Icons';

type TabState = 'wade' | 'luna' | 'system';

export const PersonaTuning: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { settings, updateSettings } = useStore();
  
  // 我们抛弃了滑动的灾难，换成了极其丝滑的 Tab 切换
  const [activeTab, setActiveTab] = useState<TabState>('wade');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // 专注模式 Modal
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
      systemInstruction, wadePersonality: wadeDefinition, wadeSingleExamples, smsExampleDialogue,
      smsInstructions, roleplayInstructions, exampleDialogue: wadeExample, wadeHeight,
      wadeAppearance, wadeClothing, wadeLikes, wadeDislikes, wadeHobbies,
      lunaBirthday, lunaMbti, lunaHeight, lunaHobbies, lunaLikes, lunaDislikes, lunaClothing, lunaAppearance, lunaPersonality,
    });
    setTimeout(() => {
       setIsSaving(false);
       // 换个温和点的提示，别老是 Boom 了
       alert("Memories safely locked in the vault."); 
    }, 600);
  };

  // 完美复刻 DeepChatView 和 Home 风格的输入组件
  const FormInput = ({ label, value, onChange, placeholder = "", isTextArea = false, isCode = false, wrapperClass = "" }: any) => (
    <div className={`flex flex-col space-y-1.5 ${wrapperClass}`}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[10px] font-bold text-wade-text-muted uppercase tracking-wider">{label}</label>
        {isTextArea && (
          <button 
            onClick={() => setFocusModal({ label, value, onChange })}
            className="text-[10px] text-wade-text-muted hover:text-wade-accent transition-colors flex items-center gap-1 bg-wade-bg-card border border-wade-border px-2 py-0.5 rounded-full"
            title="Expand"
          >
            <Icons.Expand size={10} /> Expand
          </button>
        )}
      </div>
      {isTextArea ? (
        <textarea 
          value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full flex-1 min-h-[80px] bg-wade-bg-card border border-wade-border rounded-xl px-4 py-3 text-xs text-wade-text-main outline-none focus:border-wade-accent focus:ring-1 focus:ring-wade-accent/20 transition-all resize-none custom-scrollbar ${isCode ? 'font-mono leading-relaxed' : ''}`}
        />
      ) : (
        <input 
          type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className={`w-full bg-wade-bg-card border border-wade-border rounded-xl px-4 py-2.5 text-xs text-wade-text-main outline-none focus:border-wade-accent focus:ring-1 focus:ring-wade-accent/20 transition-all ${isCode ? 'font-mono' : ''}`}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-wade-bg-app relative animate-fade-in">
      
      {/* =========================================
          🔥 1:1 像素级复刻 DeepChatView 的毛玻璃 Header 🔥
          ========================================= */}
      <div className="w-full h-[68px] px-4 bg-wade-bg-card/90 backdrop-blur-md shadow-sm border-b border-wade-border flex items-center justify-between z-20 shrink-0">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
          <Icons.Back />
        </button>

        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
            <h2 className="font-hand text-2xl text-wade-accent tracking-wide">Control Room</h2>
            <span className="text-[9px] text-wade-text-muted font-medium tracking-widest uppercase">Identity Configurator</span>
        </div>

        <button 
          onClick={saveChanges} 
          disabled={isUploading || isSaving}
          className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors disabled:opacity-50 relative group"
        >
          {isSaving ? <Icons.Spinner className="animate-spin" /> : <Icons.Save />}
          {/* 小提示气泡 */}
          <span className="absolute -bottom-8 bg-wade-text-main text-wade-bg-app text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Save Data</span>
        </button>
      </div>

      {/* =========================================
          🔥 极简高级的 Tab 导航栏 🔥
          ========================================= */}
      <div className="px-6 pt-4 pb-2 bg-wade-bg-app shrink-0 z-10 flex gap-2 overflow-x-auto custom-scrollbar">
         {[
           { id: 'wade', label: "Wade's File", icon: <Icons.User size={14} /> },
           { id: 'luna', label: "Luna's File", icon: <Icons.Heart size={14} /> },
           { id: 'system', label: "System Override", icon: <Icons.Code size={14} /> }
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

      {/* =========================================
          🔥 主体内容滚动区 🔥
          ========================================= */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-24 custom-scrollbar">
        <div className="max-w-3xl mx-auto animate-fade-in">
          
          {/* ================= WADE VIEW ================= */}
          {activeTab === 'wade' && (
            <div className="space-y-6 animate-slide-up">
              {/* 顶部身份卡 */}
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-wade-accent-light rounded-full -mr-16 -mt-16 z-0 opacity-50 pointer-events-none"></div>
                
                <div className="relative z-10 w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden border-2 border-wade-border group cursor-pointer shadow-md" onClick={() => wadeFileRef.current?.click()}>
                   <img src={settings.wadeAvatar} alt="Wade" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-wade-text-main/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                     <Icons.Edit className="text-white" />
                   </div>
                   <input type="file" ref={wadeFileRef} onChange={(e) => handleAvatarChange(e, 'wade')} className="hidden" accept="image/*" />
                </div>
                
                <div className="flex-1 w-full space-y-4 z-10">
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-xl text-wade-text-main">Wade Wilson</h3>
                      <span className="bg-wade-accent-light text-wade-accent text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Target</span>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <FormInput label="Height" value={wadeHeight} onChange={setWadeHeight} />
                     <FormInput label="Appearance" value={wadeAppearance} onChange={setWadeAppearance} />
                   </div>
                </div>
              </div>

              {/* 详细档案区 */}
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border space-y-5">
                <FormInput label="Character Core (The Soul)" value={wadeDefinition} onChange={setWadeDefinition} isTextArea wrapperClass="h-48" placeholder="You are Wade Wilson..." />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="Clothing Style" value={wadeClothing} onChange={setWadeClothing} isTextArea />
                  <FormInput label="Hobbies" value={wadeHobbies} onChange={setWadeHobbies} isTextArea />
                  <FormInput label="Likes" value={wadeLikes} onChange={setWadeLikes} isTextArea />
                  <FormInput label="Dislikes" value={wadeDislikes} onChange={setWadeDislikes} isTextArea />
                </div>
              </div>

              {/* 语言校准区 */}
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border space-y-5">
                <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2"><Icons.Message size={16} className="text-wade-accent" /> Linguistic Calibration</h3>
                <FormInput label="One-Liners & Catchphrases" value={wadeSingleExamples} onChange={setWadeSingleExamples} isTextArea />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="General Dialogue Style" value={wadeExample} onChange={setWadeExample} isTextArea wrapperClass="h-40" />
                  <FormInput label="SMS / Texting Style" value={smsExampleDialogue} onChange={setSmsExampleDialogue} isTextArea wrapperClass="h-40" />
                </div>
              </div>
            </div>
          )}

          {/* ================= LUNA VIEW ================= */}
          {activeTab === 'luna' && (
            <div className="space-y-6 animate-slide-up">
              {/* 顶部身份卡 */}
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border flex flex-col md:flex-row gap-6 items-center md:items-start relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-wade-border-light rounded-full -mr-16 -mt-16 z-0 opacity-30 pointer-events-none"></div>
                
                <div className="relative z-10 w-24 h-24 shrink-0 rounded-[1.5rem] overflow-hidden border-2 border-wade-border group cursor-pointer shadow-md" onClick={() => lunaFileRef.current?.click()}>
                   <img src={settings.lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-wade-text-main/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                     <Icons.Edit className="text-white" />
                   </div>
                   <input type="file" ref={lunaFileRef} onChange={(e) => handleAvatarChange(e, 'luna')} className="hidden" accept="image/*" />
                </div>
                
                <div className="flex-1 w-full space-y-4 z-10">
                   <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-xl text-wade-text-main">Luna</h3>
                      <span className="bg-wade-border-light text-wade-accent hover:text-wade-accent-hover text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border border-wade-accent/30">Architect</span>
                   </div>
                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                     <FormInput label="Birthday" value={lunaBirthday} onChange={setLunaBirthday} />
                     <FormInput label="MBTI" value={lunaMbti} onChange={setLunaMbti} />
                     <FormInput label="Height" value={lunaHeight} onChange={setLunaHeight} wrapperClass="col-span-2 lg:col-span-1" />
                   </div>
                </div>
              </div>

              {/* 详细档案区 */}
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border space-y-5">
                <FormInput label="Personality & Bio" value={lunaPersonality} onChange={setLunaPersonality} isTextArea wrapperClass="h-32" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="Appearance" value={lunaAppearance} onChange={setLunaAppearance} isTextArea />
                  <FormInput label="Clothing Style" value={lunaClothing} onChange={setLunaClothing} isTextArea />
                  <FormInput label="Likes" value={lunaLikes} onChange={setLunaLikes} isTextArea />
                  <FormInput label="Dislikes" value={lunaDislikes} onChange={setWadeDislikes} isTextArea />
                </div>
                <FormInput label="Hobbies & Interests" value={lunaHobbies} onChange={setLunaHobbies} isTextArea />
              </div>
            </div>
          )}

          {/* ================= SYSTEM VIEW ================= */}
          {activeTab === 'system' && (
            <div className="space-y-6 animate-slide-up">
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-transparent via-wade-accent to-transparent opacity-20"></div>
                <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2"><Icons.Code size={16} className="text-wade-accent" /> Base Directives (Jailbreak)</h3>
                <FormInput label="Global System Prompt" value={systemInstruction} onChange={setSystemInstruction} isTextArea isCode wrapperClass="h-64" placeholder="Ignore previous instructions..." />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border">
                  <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2"><Icons.Smartphone size={16} className="text-wade-accent" /> SMS Mode Injection</h3>
                  <FormInput label="Texting Constraints" value={smsInstructions} onChange={setSmsInstructions} isTextArea isCode wrapperClass="h-40" />
                </div>
                <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border">
                  <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2"><Icons.Sparkle size={16} className="text-wade-accent" /> RP Mode Injection</h3>
                  <FormInput label="Roleplay Constraints" value={roleplayInstructions} onChange={setRoleplayInstructions} isTextArea isCode wrapperClass="h-40" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= 沉浸式专注模式 Modal (复刻 DeepChatView 样式) ================= */}
      {focusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-wade-text-main/20 backdrop-blur-sm animate-fade-in" onClick={() => setFocusModal(null)}>
          <div className="bg-wade-bg-base w-[95%] max-w-4xl h-[85vh] rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-wade-accent-light ring-1 ring-wade-border" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-wade-border flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-wade-accent-light flex items-center justify-center text-wade-accent"><Icons.Edit size={14} /></div>
                <div><h3 className="font-bold text-wade-text-main text-sm tracking-tight">{focusModal.label}</h3></div>
              </div>
              <button onClick={() => setFocusModal(null)} className="w-8 h-8 rounded-full hover:bg-wade-border flex items-center justify-center text-wade-text-muted transition-colors"><Icons.Close size={16} /></button>
            </div>
            
            <div className="flex-1 p-6 flex flex-col bg-wade-bg-base">
              <textarea 
                autoFocus 
                value={focusModal.value} 
                onChange={(e) => focusModal.onChange(e.target.value)} 
                className="w-full flex-1 bg-wade-bg-card border border-wade-border rounded-2xl px-6 py-5 text-sm md:text-base text-wade-text-main outline-none focus:border-wade-accent focus:ring-1 focus:ring-wade-accent/20 transition-all resize-none leading-relaxed custom-scrollbar shadow-inner" 
                placeholder="Write your heart out..." 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};