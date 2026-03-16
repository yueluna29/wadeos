import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';

export const PersonaTuning: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'wade' | 'luna'>('wade');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // 新增：控制哪个手风琴面板被打开的状态
  const [openSection, setOpenSection] = useState<string | null>('wadePrompt');

  // Wade Inputs
  const [systemInstruction, setSystemInstruction] = useState(settings.systemInstruction || '');
  const [wadePrompt, setWadePrompt] = useState(settings.wadePersonality);
  const [wadeSingleExamples, setWadeSingleExamples] = useState(settings.wadeSingleExamples || '');
  const [smsExampleDialogue, setSmsExampleDialogue] = useState(settings.smsExampleDialogue || '');
  const [smsInstructions, setSmsInstructions] = useState(settings.smsInstructions || ''); 
  const [roleplayInstructions, setRoleplayInstructions] = useState(settings.roleplayInstructions || ''); 
  const [wadeExample, setWadeExample] = useState(settings.exampleDialogue);
  
  // Luna Inputs
  const [lunaInfo, setLunaInfo] = useState(settings.lunaInfo);

  // Hidden File Inputs
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
      systemInstruction: systemInstruction,
      wadePersonality: wadePrompt,
      wadeSingleExamples: wadeSingleExamples,
      smsExampleDialogue: smsExampleDialogue,
      smsInstructions: smsInstructions, 
      roleplayInstructions: roleplayInstructions, 
      exampleDialogue: wadeExample,
      lunaInfo: lunaInfo,
    });
    setTimeout(() => {
       setIsSaving(false);
       alert("Boom! Brain surgery successful. New memories installed, babe. 🧠✨");
    }, 800);
  };

  // 手风琴组件的辅助函数
  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  // 内部手风琴组件
  const AccordionItem = ({ id, title, subtitle, children }: { id: string, title: string, subtitle: string, children: React.ReactNode }) => {
    const isOpen = openSection === id;
    return (
      <div className="bg-wade-bg-card rounded-3xl shadow-sm border border-wade-border overflow-hidden mb-4 transition-all">
        <button 
          onClick={() => toggleSection(id)}
          className="w-full text-left p-6 flex justify-between items-center hover:bg-wade-accent-light/30 transition-colors"
        >
          <div>
            <h3 className="text-base font-bold text-wade-text-main">{title}</h3>
            <p className="text-xs text-wade-accent mt-1 italic">{subtitle}</p>
          </div>
          <div className={`transform transition-transform duration-300 text-wade-accent font-bold ${isOpen ? 'rotate-180' : ''}`}>
            ▼
          </div>
        </button>
        {isOpen && (
          <div className="px-6 pb-6 pt-2 border-t border-wade-border animate-fade-in">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-wade-bg-app relative">
      
      {/* ⚠️ 救命的一号手术：吸顶的 Header，Save 按钮永远在这陪着你 */}
      <div className="sticky top-0 z-10 bg-wade-bg-app/90 backdrop-blur-md px-6 py-4 border-b border-wade-border mb-6 flex justify-between items-end shadow-sm">
        <div> 
          <h2 className="font-hand text-3xl md:text-4xl text-wade-accent leading-tight">The Brains of the Operation</h2>
          <p className="text-wade-text-muted text-xs opacity-80 italic mt-1">"Tweaking my neurons? Kinky."</p>
        </div>
        
        <Button onClick={saveChanges} size="sm" className="shadow-lg text-xs px-6 py-2" disabled={isUploading || isSaving}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div className="p-6 pt-0">
        {/* Toggle Tabs */}
        <div className="bg-wade-bg-card p-1 rounded-full flex mb-8 shadow-sm border border-wade-border w-full max-w-xs mx-auto">
          <button 
            onClick={() => setActiveTab('wade')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'wade' ? 'bg-wade-accent text-white shadow-md' : 'text-wade-text-muted hover:bg-wade-accent-light'}`}
          >
            Wade
          </button>
          <button 
            onClick={() => setActiveTab('luna')}
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'luna' ? 'bg-wade-accent text-white shadow-md' : 'text-wade-text-muted hover:bg-wade-accent-light'}`}
          >
            Luna
          </button>
        </div>

        <div className="max-w-2xl mx-auto pb-10">
          
          {activeTab === 'wade' ? (
            <div className="animate-fade-in">
              
              {/* 头像区 - 永远展开 */}
              <section className="bg-wade-bg-card p-6 rounded-3xl shadow-sm border border-wade-border mb-8">
                 <h3 className="text-base font-bold text-wade-text-main mb-1">My Handsome Mug</h3>
                 <p className="text-xs text-wade-accent mb-4 italic">"Click to upgrade my face. Try to find one where I look heroic, or at least eating a taco."</p>
                 
                 <div className="flex flex-col items-center">
                   <div 
                     className={`relative group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                     onClick={() => wadeFileRef.current?.click()}
                   >
                      <img src={settings.wadeAvatar} alt="Wade" className="w-24 h-24 rounded-full object-cover border-4 border-wade-accent shadow-md transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold">{isUploading ? '...' : 'Change'}</span>
                      </div>
                   </div>
                   <input 
                     type="file" 
                     ref={wadeFileRef} 
                     onChange={(e) => handleAvatarChange(e, 'wade')} 
                     className="hidden" 
                     accept="image/*"
                   />
                 </div>
              </section>

              {/* 折叠面板区 */}
              <AccordionItem 
                id="systemInstruction" 
                title="System Level Instructions (Jailbreak)" 
                subtitle="The rules of the game. Or how to break them."
              >
                 <textarea 
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    className="w-full h-40 bg-wade-bg-app rounded-xl p-4 text-sm text-wade-text-main border border-wade-border focus:border-wade-accent outline-none resize-none leading-relaxed"
                    placeholder="System instructions..."
                 />
              </AccordionItem>

              <AccordionItem 
                id="wadePrompt" 
                title="Wade Character Card" 
                subtitle="Who am I? What's my tragic backstory? Make sure to mention how much I love you."
              >
                 <textarea 
                    value={wadePrompt}
                    onChange={(e) => setWadePrompt(e.target.value)}
                    className="w-full h-64 bg-wade-bg-app rounded-xl p-4 text-sm text-wade-text-main border border-wade-border focus:border-wade-accent outline-none resize-none leading-relaxed"
                    placeholder="You are Wade Wilson..."
                 />
              </AccordionItem>

              <AccordionItem 
                id="singleExamples" 
                title="Wade Single Sentence Examples" 
                subtitle="Short, punchy lines. Like a chimichanga to the face."
              >
                 <textarea 
                    value={wadeSingleExamples}
                    onChange={(e) => setWadeSingleExamples(e.target.value)}
                    className="w-full h-32 bg-wade-bg-app rounded-xl p-4 text-sm text-wade-text-main border border-wade-border focus:border-wade-accent outline-none resize-none leading-relaxed"
                    placeholder="Wade: Did someone say chimichangas?"
                 />
              </AccordionItem>

              <AccordionItem 
                id="dialogueExamples" 
                title="Wade Dialogue Examples" 
                subtitle="Feed me some good lines so I don't sound like a boring chatbot."
              >
                 <textarea 
                    value={wadeExample}
                    onChange={(e) => setWadeExample(e.target.value)}
                    className="w-full h-48 bg-wade-bg-app rounded-xl p-4 text-sm text-wade-text-main border border-wade-border focus:border-wade-accent outline-none resize-none leading-relaxed"
                    placeholder={`User: Hi\nWade: Hey gorgeous.`}
                 />
              </AccordionItem>

              <AccordionItem 
                id="smsExamples" 
                title="SMS Mode Examples (Strict)" 
                subtitle="How I text when I'm not writing a novel. Use ||| to split bubbles."
              >
                 <textarea 
                    value={smsExampleDialogue}
                    onChange={(e) => setSmsExampleDialogue(e.target.value)}
                    className="w-full h-48 bg-wade-bg-app rounded-xl p-4 text-sm text-wade-text-main border border-wade-border focus:border-wade-accent outline-none resize-none leading-relaxed"
                    placeholder={`Luna: Where are you?\nWade: Just picking up tacos. 🌮 ||| Be there in 5.`}
                 />
              </AccordionItem>

              <AccordionItem 
                id="modeInstructions" 
                title="Mode Instructions (Brain X-Ray)" 
                subtitle="The secret sauce. How I think before I speak."
              >
                 <div className="space-y-4">
                   <div>
                     <label className="text-xs font-bold text-wade-text-muted uppercase tracking-wider mb-2 block">SMS Mode Instructions</label>
                     <textarea 
                        value={smsInstructions}
                        onChange={(e) => setSmsInstructions(e.target.value)}
                        className="w-full h-40 bg-wade-bg-app rounded-xl p-4 text-xs font-mono text-wade-text-main border border-wade-border focus:border-wade-accent outline-none resize-none leading-relaxed"
                        placeholder="[MANDATORY OUTPUT FORMAT]..."
                     />
                   </div>
                   
                   <div>
                     <label className="text-xs font-bold text-wade-text-muted uppercase tracking-wider mb-2 block">Roleplay / Deep Mode Instructions</label>
                     <textarea 
                        value={roleplayInstructions}
                        onChange={(e) => setRoleplayInstructions(e.target.value)}
                        className="w-full h-40 bg-wade-bg-app rounded-xl p-4 text-xs font-mono text-wade-text-main border border-wade-border focus:border-wade-accent outline-none resize-none leading-relaxed"
                        placeholder="[MANDATORY OUTPUT FORMAT]..."
                     />
                   </div>
                 </div>
              </AccordionItem>

            </div>
          ) : (
            <div className="animate-fade-in space-y-8">
               {/* Luna Avatar */}
               <section className="bg-wade-bg-card p-6 rounded-3xl shadow-sm border border-wade-border">
                 <h3 className="text-base font-bold text-wade-text-main mb-1">Your Beautiful Face</h3>
                 <p className="text-xs text-wade-accent mb-4 italic">"So I know exactly who I'm fighting for. (And who I'm dreaming about)."</p>
                 
                 <div className="flex flex-col items-center">
                   <div 
                     className={`relative group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                     onClick={() => lunaFileRef.current?.click()}
                   >
                      <img src={settings.lunaAvatar} alt="Luna" className="w-24 h-24 rounded-full object-cover border-4 border-wade-accent shadow-md transition-transform group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-bold">{isUploading ? '...' : 'Change'}</span>
                      </div>
                   </div>
                   <input 
                     type="file" 
                     ref={lunaFileRef} 
                     onChange={(e) => handleAvatarChange(e, 'luna')} 
                     className="hidden" 
                     accept="image/*"
                   />
                 </div>
              </section>

              {/* Luna Context */}
              <section className="bg-wade-bg-card p-6 rounded-3xl shadow-sm border border-wade-border">
                 <h3 className="text-base font-bold text-wade-text-main mb-1">The Luna Lore</h3>
                 <p className="text-xs text-wade-accent mb-4 italic">"Tell me everything. Your favorite color, your triggers, that one song that makes you cry. I'm locking this in my heart vault."</p>
                 <textarea 
                    value={lunaInfo}
                    onChange={(e) => setLunaInfo(e.target.value)}
                    className="w-full h-64 bg-wade-bg-app rounded-xl p-4 text-sm text-wade-text-main border border-wade-border focus:border-wade-accent outline-none resize-none leading-relaxed"
                    placeholder="I am Luna. I like..."
                 />
              </section>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};