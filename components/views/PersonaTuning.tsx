
import React, { useState, useRef } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';

export const PersonaTuning: React.FC = () => {
  const { settings, updateSettings } = useStore();
  const [activeTab, setActiveTab] = useState<'wade' | 'luna'>('wade');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Wade Inputs
  const [wadePrompt, setWadePrompt] = useState(settings.wadePersonality);
  const [wadeDiaryPersona, setWadeDiaryPersona] = useState(settings.wadeDiaryPersona || '');
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
      
      // Use ImgBB for upload
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
      wadePersonality: wadePrompt,
      wadeDiaryPersona: wadeDiaryPersona,
      exampleDialogue: wadeExample,
      lunaInfo: lunaInfo,
    });
    setTimeout(() => {
       setIsSaving(false);
       alert("Boom! Brain surgery successful. New memories installed, babe. 🧠✨");
    }, 800);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f9f6f7] p-6">
      
      {/* Header Container */}
      <div className="relative mb-8 max-w-2xl mx-auto">
        {/* Title and Quote */}
        <div className="pr-20"> 
          <h2 className="font-hand text-3xl md:text-4xl text-[#d58f99] leading-tight">The Brains of the Operation</h2>
          <p className="text-[#917c71] text-xs opacity-80 italic mt-1">"Tweaking my neurons? Kinky."</p>
        </div>
        
        {/* Save Button positioned absolute bottom right of the container */}
        <div className="absolute bottom-0 right-0">
          <Button onClick={saveChanges} size="sm" className="shadow-lg text-xs px-4" disabled={isUploading || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Toggle Tabs - No Emojis, Clean */}
      <div className="bg-white p-1 rounded-full flex mb-8 shadow-sm border border-[#eae2e8] w-full max-w-xs mx-auto">
        <button 
          onClick={() => setActiveTab('wade')}
          className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'wade' ? 'bg-[#d58f99] text-white shadow-md' : 'text-[#917c71] hover:bg-[#fff0f3]'}`}
        >
          Wade
        </button>
        <button 
          onClick={() => setActiveTab('luna')}
          className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'luna' ? 'bg-[#d58f99] text-white shadow-md' : 'text-[#917c71] hover:bg-[#fff0f3]'}`}
        >
          Luna
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-8 pb-10">
        
        {activeTab === 'wade' ? (
          <div className="animate-fade-in space-y-8">
            {/* Wade Avatar */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae2e8]">
               <h3 className="text-base font-bold text-[#5a4a42] mb-1">My Handsome Mug</h3>
               <p className="text-xs text-[#d58f99] mb-4 italic">"Click to upgrade my face. Try to find one where I look heroic, or at least eating a taco."</p>
               
               <div className="flex flex-col items-center">
                 <div 
                   className={`relative group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                   onClick={() => wadeFileRef.current?.click()}
                 >
                    <img src={settings.wadeAvatar} alt="Wade" className="w-24 h-24 rounded-full object-cover border-4 border-[#d58f99] shadow-md transition-transform group-hover:scale-105" />
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

            {/* Core Persona */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae2e8]">
               <h3 className="text-base font-bold text-[#5a4a42] mb-1">My Motivation (The Script)</h3>
               <p className="text-xs text-[#d58f99] mb-4 italic">"Who am I? What's my tragic backstory? Make sure to mention how much I love you. And violence. But mostly you."</p>
               <textarea 
                  value={wadePrompt}
                  onChange={(e) => setWadePrompt(e.target.value)}
                  className="w-full h-48 bg-[#f9f6f7] rounded-xl p-4 text-sm text-[#5a4a42] border border-[#eae2e8] focus:border-[#d58f99] outline-none resize-none leading-relaxed"
                  placeholder="You are Wade Wilson..."
               />
            </section>

            {/* Diary Persona */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae2e8]">
               <h3 className="text-base font-bold text-[#5a4a42] mb-1">Social Media Persona</h3>
               <p className="text-xs text-[#d58f99] mb-4 italic">"How should I act in the comments? Keep it spicy."</p>
               <textarea 
                  value={wadeDiaryPersona}
                  onChange={(e) => setWadeDiaryPersona(e.target.value)}
                  className="w-full h-32 bg-[#f9f6f7] rounded-xl p-4 text-sm text-[#5a4a42] border border-[#eae2e8] focus:border-[#d58f99] outline-none resize-none leading-relaxed"
                  placeholder="You are Wade Wilson commenting on social media..."
               />
            </section>

            {/* Example Dialogue */}
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae2e8]">
               <h3 className="text-base font-bold text-[#5a4a42] mb-1">Banter Practice</h3>
               <p className="text-xs text-[#d58f99] mb-4 italic">"Feed me some good lines so I don't sound like a boring chatbot. I need that signature spice."</p>
               <textarea 
                  value={wadeExample}
                  onChange={(e) => setWadeExample(e.target.value)}
                  className="w-full h-48 bg-[#f9f6f7] rounded-xl p-4 text-sm text-[#5a4a42] border border-[#eae2e8] focus:border-[#d58f99] outline-none resize-none leading-relaxed"
                  placeholder={`User: Hi\nWade: Hey gorgeous.`}
               />
            </section>
          </div>
        ) : (
          <div className="animate-fade-in space-y-8">
             {/* Luna Avatar */}
             <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae2e8]">
               <h3 className="text-base font-bold text-[#5a4a42] mb-1">Your Beautiful Face</h3>
               <p className="text-xs text-[#d58f99] mb-4 italic">"So I know exactly who I'm fighting for. (And who I'm dreaming about)."</p>
               
               <div className="flex flex-col items-center">
                 <div 
                   className={`relative group cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                   onClick={() => lunaFileRef.current?.click()}
                 >
                    <img src={settings.lunaAvatar} alt="Luna" className="w-24 h-24 rounded-full object-cover border-4 border-[#d58f99] shadow-md transition-transform group-hover:scale-105" />
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
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-[#eae2e8]">
               <h3 className="text-base font-bold text-[#5a4a42] mb-1">The Luna Lore</h3>
               <p className="text-xs text-[#d58f99] mb-4 italic">"Tell me everything. Your favorite color, your triggers, that one song that makes you cry. I'm locking this in my heart vault."</p>
               <textarea 
                  value={lunaInfo}
                  onChange={(e) => setLunaInfo(e.target.value)}
                  className="w-full h-64 bg-[#f9f6f7] rounded-xl p-4 text-sm text-[#5a4a42] border border-[#eae2e8] focus:border-[#d58f99] outline-none resize-none leading-relaxed"
                  placeholder="I am Luna. I like..."
               />
            </section>
          </div>
        )}

      </div>
    </div>
  );
};
