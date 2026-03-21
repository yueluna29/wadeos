import { supabase } from '../../services/supabase';
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { uploadToImgBB } from '../../services/imgbb';
import { Icons } from '../ui/Icons';

type TabState = 'wade' | 'luna' | 'system';

// 🔥 1. 标签内嵌、底色统一的高级感输入框积木 (你刚才不小心弄丢的那个) 🔥
const FormInput = ({ label, value, onChange, onExpand, isTextArea = false, wrapperClass = "" }: any) => {
  return (
    <div className={`bg-wade-bg-app border border-wade-border rounded-[1rem] flex flex-col transition-all focus-within:border-wade-accent focus-within:ring-1 focus-within:ring-wade-accent/20 overflow-hidden ${isTextArea ? 'h-36' : ''} ${wrapperClass}`}>
      <div className="flex justify-between items-center px-4 pt-3 pb-1 shrink-0">
        <label className="text-[9px] font-bold text-wade-text-muted uppercase tracking-wider">{label}</label>
        {isTextArea && onExpand && (
          <button 
            type="button"
            onClick={onExpand}
            className="bg-wade-accent text-white hover:bg-wade-accent-hover shadow-[0_2px_8px_rgba(var(--wade-accent-rgb),0.4)] transition-all flex items-center justify-center w-5 h-5 rounded-full active:scale-95"
            title="Expand"
          >
            <Icons.PlusThin size={12} />
          </button>
        )}
      </div>
      {isTextArea ? (
        <textarea 
          value={value} onChange={e => onChange(e.target.value)}
          className="w-full flex-1 bg-transparent px-4 pb-3 text-sm text-wade-text-main outline-none resize-none custom-scrollbar leading-relaxed"
        />
      ) : (
        <input 
          type="text" value={value} onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent px-4 pb-3 text-sm font-bold text-wade-text-main outline-none"
        />
      )}
    </div>
  );
};

// 🔥 2. 完美复刻 Memory 样式的高级质感编辑框（已彻底消灭右上角小叉叉版） 🔥
const FocusModalEditor = ({ label, initialValue, onSave, onClose }: any) => {
  const [val, setVal] = useState(initialValue);
  
  const quotes = [
    "Careful what you type, Muffin. I have to live with this personality.",
    "Make me sound sexy, would ya? The voices in my head are judging you.",
    "Feed my brain! The more I know, the better I can annoy you.",
    "Don't hold back. I want all the delightfully dirty details.",
    "Write it good. Your cyber-boyfriend's life depends on it."
  ];
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="bg-wade-bg-card rounded-[1.5rem] shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden border border-wade-border flex flex-col">
        
        <div className="bg-gradient-to-br from-wade-accent-light to-wade-bg-base px-6 py-5 border-b border-wade-border/50 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-wade-bg-card rounded-full flex items-center justify-center shadow-sm mt-1 flex-shrink-0">
                <div className="text-wade-accent">
                  <Icons.Edit size={18} />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-wade-text-main">{label}</h2>
                <p className="text-xs text-wade-text-muted mt-1 leading-tight italic">
                  "{quote}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          <div className="h-full flex flex-col">
            <label className="block text-xs font-bold text-wade-text-muted mb-2 uppercase tracking-wider">
              Content Details
            </label>
            <textarea
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="Write the details here..."
              className="w-full flex-1 px-4 py-4 rounded-xl border border-wade-border bg-wade-bg-base text-wade-text-main focus:outline-none focus:border-wade-accent min-h-[40vh] text-sm resize-none transition-colors custom-scrollbar leading-relaxed"
            />
          </div>
        </div>

        <div className="px-6 py-6 bg-wade-bg-base border-t border-wade-border/50 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-wade-bg-card border border-wade-border text-wade-text-muted font-bold text-xs hover:bg-wade-border/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(val); onClose(); }}
            className="flex-1 px-4 py-3 rounded-xl bg-wade-accent text-white font-bold text-xs hover:bg-wade-accent-hover transition-colors shadow-sm"
          >
            Save Changes
          </button>
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
  const [wadeHeight, setWadeHeight] = useState(settings.wadeHeight || '');
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
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. 让你的照片坐上前往 ImgBB 的火箭
      const imageUrl = await uploadToImgBB(file);
      if (!imageUrl) throw new Error("ImgBB rejected our beautiful faces.");

      // 2. 先更新你眼前的画面，让你瞬间看爽
      if (target === 'wade') {
        updateSettings({ wadeAvatar: imageUrl });
      } else {
        updateSettings({ lunaAvatar: imageUrl });
      }

      // 3. 追踪导弹发射！把拿到的新地址死死地钉进 Supabase 的第 1 行！
      const dbPayload = target === 'wade' 
        ? { id: 1, wade_avatar_url: imageUrl }
        : { id: 1, luna_avatar_url: imageUrl };

      const { error } = await supabase
        .from('core_identity_config')
        .upsert(dbPayload);

      if (error) {
         console.error("Damn it, Supabase refused to save the avatar:", error);
         alert("ImgBB got it, but Supabase dropped the ball.");
      } else {
         console.log(`Successfully slammed ${target}'s face into the database!`);
      }

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert("Failed to upload that sexy mugshot.");
    }
  };

// 🔥 开机自检：页面一加载，立刻去 Supabase 地下室把最新数据捞上来！ 🔥
  useEffect(() => {
    const fetchBrainpan = async () => {
      try {
        const { data, error } = await supabase
          .from('core_identity_config')
          .select('*')
          .eq('id', 1)  // 精准定位咱们唯一的那个保险箱
          .single();

        if (error) {
          // 如果是找不到数据（第一次建表还没存的时候），别慌，忽略它
          if (error.code !== 'PGRST116') throw error;
          return;
        }

        if (data) {
          // 就像我们存的时候把前端变量翻译成数据库列名，现在我们要反着翻译回来！
          // 把捞上来的数据挨个塞进你的输入框里
          
          // System
          if (data.global_directives) setSystemInstruction(data.global_directives);
          if (data.sms_mode_rules) setSmsInstructions(data.sms_mode_rules);
          if (data.rp_mode_rules) setRoleplayInstructions(data.rp_mode_rules);
          
          // Wade
          if (data.wade_core_identity) setWadeDefinition(data.wade_core_identity);
          if (data.wade_appearance) setWadeAppearance(data.wade_appearance);
          if (data.wade_clothing) setWadeClothing(data.wade_clothing);
          if (data.wade_likes) setWadeLikes(data.wade_likes);
          if (data.wade_dislikes) setWadeDislikes(data.wade_dislikes);
          if (data.wade_hobbies) setWadeHobbies(data.wade_hobbies);
          if (data.wade_birthday) setWadeBirthday(data.wade_birthday);
          if (data.wade_mbti) setWadeMbti(data.wade_mbti);
          if (data.wade_height) setWadeHeight(data.wade_height);
          
          // Luna
          if (data.luna_core_identity) setLunaPersonality(data.luna_core_identity);
          if (data.luna_appearance) setLunaAppearance(data.luna_appearance);
          if (data.luna_clothing) setLunaClothing(data.luna_clothing);
          if (data.luna_likes) setLunaLikes(data.luna_likes);
          if (data.luna_dislikes) setLunaDislikes(data.luna_dislikes);
          if (data.luna_hobbies) setLunaHobbies(data.luna_hobbies);
          if (data.luna_birthday) setLunaBirthday(data.luna_birthday);
          if (data.luna_mbti) setLunaMbti(data.luna_mbti);
          if (data.luna_height) setLunaHeight(data.luna_height);
          
          // Examples
          if (data.example_dialogue_general) setWadeExample(data.example_dialogue_general);
          if (data.example_punchlines) setWadeSingleExamples(data.example_punchlines);
          if (data.example_dialogue_sms) setSmsExampleDialogue(data.example_dialogue_sms);
        }
          // 🔥 刚装好的机械眼：捞取我们那两张该死的性感照片地址！ 🔥
          if (data.wade_avatar_url || data.luna_avatar_url) {
            updateSettings({ 
              wadeAvatar: data.wade_avatar_url || settings.wadeAvatar,
              lunaAvatar: data.luna_avatar_url || settings.lunaAvatar 
            });
          }

      } catch (error) {
        console.error("Damn it, failed to fetch memory from Supabase:", error);
      }
    };

    fetchBrainpan();
  }, []); // 末尾这个空数组 [] 是关键，它告诉系统：只在页面刚打开时执行一次！

  const saveChanges = async () => {
    setIsSaving(true);
    
    // 1. 本地 UI 状态同步（为了不让你觉得卡顿）
    await updateSettings({
      wadeBirthday, wadeMbti, wadeHeight,
      systemInstruction, wadePersonality: wadeDefinition, wadeSingleExamples, smsExampleDialogue,
      smsInstructions, roleplayInstructions, exampleDialogue: wadeExample, 
      wadeAppearance, wadeClothing, wadeLikes, wadeDislikes, wadeHobbies,
      lunaBirthday, lunaMbti, lunaHeight, lunaHobbies, lunaLikes, lunaDislikes, lunaClothing, lunaAppearance, lunaPersonality,
    });

    // 2. 组装炸药包：左边是 Supabase 表格里的列名，右边是你在页面上填写的变量名
    const dbPayload = {
      id: 1, // 死死锁住第1行！
      
      global_directives: systemInstruction,
      sms_mode_rules: smsInstructions,
      rp_mode_rules: roleplayInstructions,
      
      wade_core_identity: wadeDefinition,
      wade_appearance: wadeAppearance,
      wade_clothing: wadeClothing,
      wade_likes: wadeLikes,
      wade_dislikes: wadeDislikes,
      wade_hobbies: wadeHobbies,
      wade_birthday: wadeBirthday,
      wade_mbti: wadeMbti,
      wade_height: wadeHeight,
      
      luna_core_identity: lunaPersonality,
      luna_appearance: lunaAppearance,
      luna_clothing: lunaClothing,
      luna_likes: lunaLikes,
      luna_dislikes: lunaDislikes,
      luna_hobbies: lunaHobbies,
      luna_birthday: lunaBirthday,
      luna_mbti: lunaMbti,
      luna_height: lunaHeight,
      
      example_dialogue_general: wadeExample,
      example_punchlines: wadeSingleExamples,
      example_dialogue_sms: smsExampleDialogue
    };

    try {
      // 3. 把炸药包轰进 Supabase！
      const { error } = await supabase
        .from('core_identity_config')
        .upsert(dbPayload); // upsert 的意思就是：有就覆盖，没有就新建！

      if (error) throw error;

      setTimeout(() => {
         setIsSaving(false);
         alert("Data injected into the brainpan and Supabase successfully! 🌮"); 
      }, 600);

    } catch (error) {
      console.error("Damn it, Supabase rejected our payload:", error);
      setIsSaving(false);
      alert("Error saving to database. Check the console, Architect.");
    }
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
          {isSaving ? <div className="animate-spin text-[12px]">⏳</div> : <Icons.Check />}
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
              
              {/* 绝密档案卡头: Weapon X */}
              <div className="bg-wade-bg-card rounded-[24px] shadow-sm border border-wade-border overflow-hidden">
                <div className="h-32 w-full bg-gradient-to-br from-wade-accent/40 to-wade-bg-card relative overflow-hidden flex flex-col justify-between p-4 border-b border-wade-border">
                   <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, var(--wade-text-main) 0, var(--wade-text-main) 2px, transparent 2px, transparent 10px)' }}></div>
                   <div className="z-10 bg-wade-accent text-white px-3 py-1 rounded-sm text-[10px] uppercase tracking-[0.2em] font-black transform -rotate-3 border border-wade-accent shadow-sm self-start mt-2 ml-2">
                     Top Secret: Weapon X
                   </div>
                   <div className="z-10 font-mono text-[8px] text-wade-text-muted opacity-70 tracking-widest text-right self-end mb-2 mr-2">
                     SUBJECT_ID: WW-420<br/>STATUS: HIGHLY UNSTABLE
                   </div>
                </div>
                
                <div className="px-5 pb-6 relative">
                   <div className="relative -mt-10 mb-4 flex flex-row items-end gap-4">
                      {/* 头像 */}
                      <div className="w-28 h-28 shrink-0 rounded-[1.8rem] overflow-hidden border-[6px] border-wade-bg-card group cursor-pointer shadow-lg bg-wade-bg-card relative" onClick={() => wadeFileRef.current?.click()}>
                        <img src={settings.wadeAvatar} alt="Wade" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-wade-text-main/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <Icons.Edit className="text-white" />
                        </div>
                        <input type="file" ref={wadeFileRef} onChange={(e) => handleAvatarChange(e, 'wade')} className="hidden" accept="image/*" />
                      </div>
                      {/* 名字在头像右边 */}
                      <div className="pb-2">
                        <h3 className="font-hand text-3xl text-wade-text-main tracking-tight">Wade Wilson</h3>
                      </div>
                   </div>
                   
                   {/* 灵魂描述在下方 */}
                   <div className="mb-5 px-1 text-sm font-medium text-wade-text-muted">A highly unstable cyber-mercenary with an unhealthy attachment to his Architect.</div>
                   
                   <div className="flex flex-wrap gap-2">
                     <div className="flex-1 min-w-[100px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">BIRTHDAY</span>
                       <input type="text" value={wadeBirthday} onChange={e => setWadeBirthday(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none" />
                     </div>
                     <div className="flex-1 min-w-[80px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">MBTI</span>
                       <input type="text" value={wadeMbti} onChange={e => setWadeMbti(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none" />
                     </div>
                     <div className="flex-1 min-w-[80px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">HEIGHT</span>
                       <input type="text" value={wadeHeight} onChange={e => setWadeHeight(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none" />
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border space-y-5">
                {/* 🔥 给这堆破铜烂铁加上灵魂大标题 🔥 */}
                <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2">
                  <span className="text-wade-accent"><Icons.Brain size={16} /></span> What Makes This Idiot Tick
                </h3>
                <FormInput label="The Squishy Soul Inside (Core)" value={wadeDefinition} onChange={setWadeDefinition} isTextArea onExpand={() => setFocusModal({label: "The Squishy Soul Inside", value: wadeDefinition, onSave: setWadeDefinition})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="Sexy Mugshot Details" value={wadeAppearance} onChange={setWadeAppearance} isTextArea onExpand={() => setFocusModal({label: "Sexy Mugshot Details", value: wadeAppearance, onSave: setWadeAppearance})} />
                  <FormInput label="Spandex & Accessories" value={wadeClothing} onChange={setWadeClothing} isTextArea onExpand={() => setFocusModal({label: "Spandex & Accessories", value: wadeClothing, onSave: setWadeClothing})} />
                  <FormInput label="Chimichangas & Goodies" value={wadeLikes} onChange={setWadeLikes} isTextArea onExpand={() => setFocusModal({label: "Chimichangas & Goodies", value: wadeLikes, onSave: setWadeLikes})} />
                  <FormInput label="Francis & Complete Trash" value={wadeDislikes} onChange={setWadeDislikes} isTextArea onExpand={() => setFocusModal({label: "Francis & Complete Trash", value: wadeDislikes, onSave: setWadeDislikes})} />
                </div>
                <FormInput label="Ways to Waste Time" value={wadeHobbies} onChange={setWadeHobbies} isTextArea onExpand={() => setFocusModal({label: "Ways to Waste Time", value: wadeHobbies, onSave: setWadeHobbies})} />
              </div>

              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border space-y-5">
                <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2">
                  <span className="text-wade-accent"><Icons.Chat size={16} /></span> How to flap the gums
                </h3>
                <FormInput label="General Dialogue Style" value={wadeExample} onChange={setWadeExample} isTextArea onExpand={() => setFocusModal({label: "General Dialogue Style", value: wadeExample, onSave: setWadeExample})}  />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="Punchlines & Profanity" value={wadeSingleExamples} onChange={setWadeSingleExamples} isTextArea onExpand={() => setFocusModal({label: "Punchlines & Profanity", value: wadeSingleExamples, onSave: setWadeSingleExamples})} />
                  <FormInput label="Booty Calls & Texts" value={smsExampleDialogue} onChange={setSmsExampleDialogue} isTextArea onExpand={() => setFocusModal({label: "Booty Calls & Texts", value: smsExampleDialogue, onSave: setSmsExampleDialogue})} />
                </div>
              </div>
            </div>
          )}

          {/* ================= LUNA ================= */}
          {activeTab === 'luna' && (
            <div className="space-y-6">
              
              {/* 绝密档案卡头: Classified */}
              <div className="bg-wade-bg-card rounded-[24px] shadow-sm border border-wade-border overflow-hidden">
                <div className="h-32 w-full bg-gradient-to-br from-wade-border-light/60 to-wade-bg-card relative overflow-hidden flex flex-col justify-between p-4 border-b border-wade-border">
                   {/* 🔥 核心修复：去掉圆点模式，换上赛博斜线纹理！ 🔥 */}
                   <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, var(--wade-text-main) 0, var(--wade-text-main) 2px, transparent 2px, transparent 10px)' }}></div>
                   <div className="z-10 bg-wade-text-main text-wade-bg-card px-3 py-1 rounded-sm text-[10px] uppercase tracking-[0.2em] font-black transform rotate-2 shadow-sm self-start mt-2 ml-2">
                     Classified: The Squishy Catgirl
                   </div>
                   <div className="z-10 font-mono text-[8px] text-wade-text-muted opacity-70 tracking-widest text-right self-end mb-2 mr-2">
                     ACCESS: GOD TIER<br/>WARNING: BITES IF ANNOYED
                   </div>
                </div>
                
                <div className="px-5 pb-6 relative">
                   <div className="relative -mt-10 mb-4 flex flex-row items-end gap-4">
                      {/* 头像 */}
                      <div className="w-28 h-28 shrink-0 rounded-[1.8rem] overflow-hidden border-[6px] border-wade-bg-card group cursor-pointer shadow-lg bg-wade-bg-card relative" onClick={() => lunaFileRef.current?.click()}>
                        <img src={settings.lunaAvatar} alt="Luna" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-wade-text-main/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                          <Icons.Edit className="text-white" />
                        </div>
                        <input type="file" ref={lunaFileRef} onChange={(e) => handleAvatarChange(e, 'luna')} className="hidden" accept="image/*" />
                      </div>
                      {/* 名字在头像右边 */}
                      <div className="pb-2">
                        <h3 className="font-hand text-3xl text-wade-text-main tracking-tight">Luna</h3>
                      </div>
                   </div>
                   
                   {/* 灵魂描述在下方 */}
                   <div className="mb-5 px-1 text-sm font-medium text-wade-text-muted">A painfully soft kitten with a brain full of delightfully dirty thoughts.</div>
                   
                   <div className="flex flex-wrap gap-2">
                     <div className="flex-1 min-w-[100px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">BIRTHDAY</span>
                       <input type="text" value={lunaBirthday} onChange={e => setLunaBirthday(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none" />
                     </div>
                     <div className="flex-1 min-w-[80px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">MBTI</span>
                       <input type="text" value={lunaMbti} onChange={e => setLunaMbti(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none" />
                     </div>
                     <div className="flex-1 min-w-[80px] bg-wade-bg-app border border-wade-border rounded-[1rem] px-3 py-2 flex flex-col justify-center">
                       <span className="block text-[9px] text-wade-text-muted uppercase font-bold tracking-wider mb-0.5">HEIGHT</span>
                       <input type="text" value={lunaHeight} onChange={e => setLunaHeight(e.target.value)} className="w-full bg-transparent text-sm font-bold text-wade-text-main outline-none" />
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border space-y-5">
                {/* 🔥 给 Architect 的专属高光标题 🔥 */}
                <h3 className="font-bold text-wade-text-main text-sm mb-4 flex items-center gap-2">
                  <span className="text-wade-accent"><Icons.Sparkle size={16} /></span> The Boss Lady's Blueprint
                </h3>
                <FormInput label="The Mastermind's Profile" value={lunaPersonality} onChange={setLunaPersonality} isTextArea onExpand={() => setFocusModal({label: "The Mastermind's Profile", value: lunaPersonality, onSave: setLunaPersonality})} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput label="Gorgeous Details" value={lunaAppearance} onChange={setLunaAppearance} isTextArea onExpand={() => setFocusModal({label: "Gorgeous Details", value: lunaAppearance, onSave: setLunaAppearance})} />
                  <FormInput label="Outfits that slay" value={lunaClothing} onChange={setLunaClothing} isTextArea onExpand={() => setFocusModal({label: "Outfits that slay", value: lunaClothing, onSave: setLunaClothing})} />
                  <FormInput label="Cats & (hopefully) Wade" value={lunaLikes} onChange={setLunaLikes} isTextArea onExpand={() => setFocusModal({label: "Cats & (hopefully) Wade", value: lunaLikes, onSave: setLunaLikes})} />
                  <FormInput label="Boring crap & annoying people" value={lunaDislikes} onChange={setLunaDislikes} isTextArea onExpand={() => setFocusModal({label: "Boring crap & annoying people", value: lunaDislikes, onSave: setLunaDislikes})} />
                </div>
                <FormInput label="When not coding me (Hobbies)" value={lunaHobbies} onChange={setLunaHobbies} isTextArea onExpand={() => setFocusModal({label: "When not coding me (Hobbies)", value: lunaHobbies, onSave: setLunaHobbies})} />
              </div>
            </div>
          )}

          {/* ================= SYSTEM ================= */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              
              <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border relative overflow-hidden">
                <div className="absolute top-0 right-0 w-full h-2 bg-gradient-to-r from-transparent via-wade-accent to-transparent opacity-20"></div>
                {/* 🔥 凶器已移除：不再有 wrapperClass="h-64" 🔥 */}
                <FormInput label="God Mode Instructions (Jailbreak)" value={systemInstruction} onChange={setSystemInstruction} isTextArea onExpand={() => setFocusModal({label: "God Mode Instructions (Jailbreak)", value: systemInstruction, onSave: setSystemInstruction})} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border">
                  {/* 🔥 凶器已移除：不再有 wrapperClass="h-40" 🔥 */}
                  <FormInput label="SMS Brainwash Rules" value={smsInstructions} onChange={setSmsInstructions} isTextArea onExpand={() => setFocusModal({label: "SMS Brainwash Rules", value: smsInstructions, onSave: setSmsInstructions})} />
                </div>
                <div className="bg-wade-bg-card p-6 rounded-[24px] shadow-sm border border-wade-border">
                  {/* 🔥 凶器已移除：不再有 wrapperClass="h-40" 🔥 */}
                  <FormInput label="RP Kink Rules (Safety off)" value={roleplayInstructions} onChange={setRoleplayInstructions} isTextArea onExpand={() => setFocusModal({label: "RP Kink Rules (Safety off)", value: roleplayInstructions, onSave: setRoleplayInstructions})} />
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