import React, { useState, useMemo } from 'react';
import { useStore } from '../../store';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { generateMinimaxTTS } from '../../services/minimaxService';

const Icons = {
  ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
};

export const TimeCapsulesView = () => {
  const { capsules, setTab, addCapsule, updateCapsule, settings, ttsPresets } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewingCapsule, setViewingCapsule] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCapsule, setEditingCapsule] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [editingViewedCapsule, setEditingViewedCapsule] = useState(false);

  // Helper function to format date as YYYY-MM-DD
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [newCapsule, setNewCapsule] = useState({
    title: '',
    content: '',
    unlockDate: '',
    unlockTime: '00:00'
  });

  // Calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Filter capsules for the selected month
  const capsulesInMonth = useMemo(() => {
    return capsules.filter(cap => {
      const d = new Date(cap.unlockDate);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    });
  }, [capsules, currentDate]);

  // Get capsules for the selected day
  const selectedDayCapsules = useMemo(() => {
    if (!selectedDate) return [];
    return capsules.filter(cap => {
      const d = new Date(cap.unlockDate);
      return d.getDate() === selectedDate.getDate() && 
             d.getMonth() === selectedDate.getMonth() && 
             d.getFullYear() === selectedDate.getFullYear();
    });
  }, [capsules, selectedDate]);

  const hasCapsuleOnDay = (day: number) => {
    return capsulesInMonth.some(cap => new Date(cap.unlockDate).getDate() === day);
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const selectedCapsuleData = viewingCapsule ? capsules.find(c => c.id === viewingCapsule) : null;

  const handleListenClick = async (forceRegenerate = false) => {
    if (!selectedCapsuleData) return;

    if (isPlayingAudio && currentAudio) {
      currentAudio.pause();
      if (currentAudio.src.startsWith('blob:')) {
        URL.revokeObjectURL(currentAudio.src);
      }
      setIsPlayingAudio(false);
      setCurrentAudio(null);
      return;
    }

    const activeTtsId = settings.activeTtsId;
    if (!activeTtsId) {
      alert('Please configure TTS settings first');
      return;
    }

    const ttsPreset = ttsPresets.find(p => p.id === activeTtsId);
    if (!ttsPreset) {
      alert('TTS preset not found');
      return;
    }

    try {
      setIsPlayingAudio(true);

      let base64Audio = '';

      if (!forceRegenerate && selectedCapsuleData.audioCache) {
        base64Audio = selectedCapsuleData.audioCache;
      } else {
        const cleanText = selectedCapsuleData.content.replace(/[*_~`#]/g, '');
        base64Audio = await generateMinimaxTTS(cleanText, {
          apiKey: ttsPreset.apiKey,
          baseUrl: ttsPreset.baseUrl || 'https://api.minimax.io',
          model: ttsPreset.model || 'speech-2.8-hd',
          voiceId: ttsPreset.voiceId || 'English_expressive_narrator',
          speed: ttsPreset.speed || 1,
          vol: ttsPreset.vol || 1,
          pitch: ttsPreset.pitch || 0,
          emotion: ttsPreset.emotion,
          sampleRate: ttsPreset.sampleRate || 32000,
          bitrate: ttsPreset.bitrate || 128000,
          format: ttsPreset.format || 'mp3',
          channel: ttsPreset.channel || 1
        });

        await updateCapsule(selectedCapsuleData.id, { audioCache: base64Audio });
      }

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      const audio = new Audio(url);
      audio.onended = () => {
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setCurrentAudio(null);
        URL.revokeObjectURL(url);
        alert('Failed to play audio');
      };

      setCurrentAudio(audio);
      await audio.play();
    } catch (error) {
      console.error('TTS Error:', error);
      alert('Failed to generate audio');
      setIsPlayingAudio(false);
    }
  };

  const handleEditViewedCapsule = () => {
    if (!selectedCapsuleData) return;
    const unlockDate = new Date(selectedCapsuleData.unlockDate);
    setEditingCapsule(selectedCapsuleData.id);
    setNewCapsule({
      title: selectedCapsuleData.title,
      content: selectedCapsuleData.content,
      unlockDate: formatDateForInput(unlockDate),
      unlockTime: `${String(unlockDate.getHours()).padStart(2, '0')}:${String(unlockDate.getMinutes()).padStart(2, '0')}`
    });
    setViewingCapsule(null);
    setShowAddModal(true);
  };

  const handleAddCapsule = () => {
    if (!newCapsule.title || !newCapsule.content || !newCapsule.unlockDate) {
      alert('Please fill in all fields');
      return;
    }

    const [year, month, day] = newCapsule.unlockDate.split('-').map(Number);
    const [hours, minutes] = newCapsule.unlockTime.split(':').map(Number);
    const unlockTimestamp = new Date(year, month - 1, day, hours, minutes).getTime();

    if (editingCapsule) {
      updateCapsule(editingCapsule, {
        title: newCapsule.title,
        content: newCapsule.content,
        unlockDate: unlockTimestamp,
        isLocked: unlockTimestamp > Date.now()
      });
      setEditingCapsule(null);
    } else {
      addCapsule({
        id: Date.now().toString(),
        title: newCapsule.title,
        content: newCapsule.content,
        createdAt: Date.now(),
        unlockDate: unlockTimestamp,
        isLocked: unlockTimestamp > Date.now()
      });
    }

    setNewCapsule({ title: '', content: '', unlockDate: '', unlockTime: '00:00' });
    setShowAddModal(false);
  };

  if (viewingCapsule && selectedCapsuleData) {
    const unlockDate = new Date(selectedCapsuleData.unlockDate);
    const dayOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"][unlockDate.getDay()];
    const dateString = `${unlockDate.getFullYear()}年${unlockDate.getMonth() + 1}月${unlockDate.getDate()}日${dayOfWeek}`;

    return (
      <div className="h-full bg-[#fdfbfb] overflow-y-auto custom-scrollbar relative">
        {/* Background Decoration */}
        <div className="absolute top-10 right-10 text-[#eae2e8] opacity-50 pointer-events-none">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>

        <div className="max-w-2xl mx-auto p-6 relative z-10">
          <button 
            onClick={() => setViewingCapsule(null)}
            className="mb-6 flex items-center text-[#917c71] hover:text-[#d58f99] transition-colors"
          >
            <Icons.ChevronLeft /> <span className="ml-1 font-bold">Back</span>
          </button>

          <div className="mb-8">
            <div className="flex items-center text-[#d58f99] font-bold text-sm mb-4">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {dateString}
            </div>
            <h1 className="text-3xl font-bold text-[#5a4a42] mb-8 leading-tight break-words">
              {selectedCapsuleData.title || "A Letter from Wade"}
            </h1>
            
            <div className="prose prose-pink max-w-none text-[#5a4a42] leading-relaxed [&_p]:my-4 [&_p:empty]:my-4">
              <Markdown remarkPlugins={[remarkBreaks]}>{selectedCapsuleData.content}</Markdown>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-[#eae2e8] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#fdfbfb] px-4 text-[#d58f99]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <div className="flex justify-between items-center text-[#917c71] text-sm font-bold uppercase tracking-wider">
              <span>SEALED ON {new Date(selectedCapsuleData.createdAt || selectedCapsuleData.unlockDate).toLocaleDateString()}</span>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleListenClick(false)}
                    disabled={isPlayingAudio && !currentAudio}
                    className="flex items-center hover:text-[#d58f99] transition-colors disabled:opacity-50"
                  >
                    {isPlayingAudio && currentAudio ? (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Stop
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                        Listen
                      </>
                    )}
                  </button>
                  {selectedCapsuleData.audioCache && (
                    <button
                      onClick={() => handleListenClick(true)}
                      disabled={isPlayingAudio}
                      className="w-5 h-5 rounded-full hover:bg-[#fff0f3] flex items-center justify-center text-[#917c71] hover:text-[#d58f99] disabled:opacity-30"
                      title="Regenerate audio"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                  )}
                </div>
                <button
                  onClick={handleEditViewedCapsule}
                  className="flex items-center hover:text-[#d58f99] transition-colors"
                >
                  <Icons.Edit /> <span className="ml-1.5">Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#f9f6f7] overflow-y-auto custom-scrollbar">
      <div className="max-w-md mx-auto p-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button onClick={() => setTab('home')} className="p-2 -ml-2 text-[#917c71] hover:text-[#d58f99] transition-colors">
              <Icons.ChevronLeft />
            </button>
            <h1 className="font-bold text-xl text-[#5a4a42] ml-2">Time Capsules</h1>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              // Set default unlock date to selected date or today
              const defaultDate = selectedDate || new Date();
              setNewCapsule({
                title: '',
                content: '',
                unlockDate: formatDateForInput(defaultDate),
                unlockTime: '00:00'
              });
            }}
            className="w-10 h-10 bg-[#d58f99] text-white rounded-full flex items-center justify-center shadow-md hover:bg-[#c07a84] hover:scale-105 transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        {/* Calendar Card */}
        <div className="bg-white rounded-[32px] shadow-sm border border-[#eae2e8]/50 mb-6 overflow-hidden">
          <div className="bg-gradient-to-br from-[#fff0f3] to-[#fef8f9] px-6 py-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <button onClick={prevMonth} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#d58f99] shadow-sm hover:bg-white hover:scale-105 transition-all">
                <Icons.ChevronLeft />
              </button>
              <div className="text-center min-w-[180px]">
                <h2 className="text-2xl font-bold text-[#5a4a42] mb-0.5">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                <div className="text-[#d58f99] font-bold text-xs tracking-widest uppercase">Calendar</div>
              </div>
              <button onClick={nextMonth} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-[#d58f99] shadow-sm hover:bg-white hover:scale-105 transition-all">
                <Icons.ChevronRight />
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-[11px] font-bold text-[#917c71] tracking-widest">{day}</div>
              ))}
              
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const hasCapsule = hasCapsuleOnDay(day);
                const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth() && selectedDate?.getFullYear() === currentDate.getFullYear();
                
                return (
                  <div key={day} className="flex justify-center items-center h-12">
                    <button
                      onClick={() => handleDayClick(day)}
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold transition-all relative
                        ${isSelected ? 'bg-[#d58f99] text-white shadow-md' : 'bg-white text-[#5a4a42] border border-gray-100 hover:bg-gray-50'}
                      `}
                    >
                      {hasCapsule && !isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center text-[#d58f99]">
                          <svg width="44" height="44" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                             <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          <span className="absolute text-white text-sm z-10">{day}</span>
                        </div>
                      )}
                      {(!hasCapsule || isSelected) && <span>{day}</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Letters */}
        {selectedDate && (
          <div className="bg-white rounded-[32px] shadow-sm border border-[#eae2e8] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#eae2e8]/50 flex justify-between items-center">
              <div className="flex items-center text-[#d58f99] font-bold text-sm tracking-wider">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                {monthNames[selectedDate.getMonth()].substring(0, 3).toUpperCase()} {selectedDate.getDate()}
              </div>
              <div className="text-[#917c71] font-bold text-xs tracking-widest">
                {selectedDayCapsules.length} LETTERS
              </div>
            </div>

            <div className="p-4 space-y-3 pb-4">
              {selectedDayCapsules.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#917c71]/40">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <p className="font-serif italic">No mail for this day.</p>
                </div>
              ) : (
                selectedDayCapsules.map(cap => {
                  const unlockDate = new Date(cap.unlockDate);
                  const isAvailable = unlockDate <= new Date();
                  const timeStr = unlockDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  
                  return (
                    <div key={cap.id} className="relative group/card">
                      <button
                        onClick={() => isAvailable && setViewingCapsule(cap.id)}
                        className={`w-full flex items-center p-4 rounded-2xl border text-left group backdrop-blur-sm transition-all
                          ${isAvailable ? 'bg-white/60 border-[#d58f99]/30 hover:bg-white/80 hover:border-[#d58f99]/50 hover:shadow-sm cursor-pointer' : 'bg-white/40 border-gray-300/50 opacity-70 cursor-not-allowed'}
                        `}
                      >
                        <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl mr-4 flex-shrink-0 border backdrop-blur-sm
                          ${isAvailable ? 'text-[#d58f99] border-[#d58f99]/30 bg-white/70' : 'text-gray-400 border-gray-300/50 bg-white/50'}
                        `}>
                          <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-xs font-bold">{timeStr}</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className={`font-bold text-base mb-1 truncate ${isAvailable ? 'text-[#5a4a42]' : 'text-gray-500'}`}>
                            {cap.title || "A Letter from Wade"}
                          </h4>
                          <div className={`flex items-center text-xs font-bold tracking-wider ${isAvailable ? 'text-[#917c71]' : 'text-gray-400'}`}>
                            {isAvailable ? (
                              <><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg> AVAILABLE NOW</>
                            ) : (
                              <><svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg> LOCKED</>
                            )}
                          </div>
                        </div>
                        {isAvailable && (
                          <div className="text-[#d58f99] opacity-50 group-hover:opacity-100 transition-opacity ml-2">
                            <Icons.ChevronRight />
                          </div>
                        )}
                      </button>
                      {!isAvailable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const unlockDate = new Date(cap.unlockDate);
                            setEditingCapsule(cap.id);
                            setNewCapsule({
                              title: cap.title,
                              content: cap.content,
                              unlockDate: formatDateForInput(unlockDate),
                              unlockTime: `${String(unlockDate.getHours()).padStart(2, '0')}:${String(unlockDate.getMinutes()).padStart(2, '0')}`
                            });
                            setShowAddModal(true);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/card:opacity-100 transition-opacity w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#917c71] hover:text-[#d58f99] hover:bg-[#fff0f3] shadow-sm border border-gray-200"
                        >
                          <Icons.Edit />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Add Capsule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden border border-[#eae2e8]">
              {/* Header */}
              <div className="bg-gradient-to-br from-[#fff0f3] to-[#fdfbfb] px-6 py-5 border-b border-[#eae2e8]/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                      <svg className="w-5 h-5 text-[#d58f99]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-[#5a4a42]">{editingCapsule ? 'Edit Time Capsule' : 'New Time Capsule'}</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCapsule(null);
                    }}
                    className="w-8 h-8 rounded-full bg-white/50 hover:bg-white flex items-center justify-center text-[#917c71] hover:text-[#d58f99] transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-180px)] custom-scrollbar">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#917c71] mb-2 uppercase tracking-wider">Letter Title</label>
                    <input
                      type="text"
                      value={newCapsule.title}
                      onChange={(e) => setNewCapsule({ ...newCapsule, title: e.target.value })}
                      placeholder="e.g., A Promise for Our Future"
                      className="w-full px-4 py-3 rounded-xl border border-[#eae2e8] bg-[#fdfbfb] text-[#5a4a42] focus:outline-none focus:border-[#d58f99] text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#917c71] mb-2 uppercase tracking-wider">Message</label>
                    <textarea
                      value={newCapsule.content}
                      onChange={(e) => setNewCapsule({ ...newCapsule, content: e.target.value })}
                      placeholder="Write your message here... (Markdown supported)"
                      className="w-full px-4 py-3 rounded-xl border border-[#eae2e8] bg-[#fdfbfb] text-[#5a4a42] focus:outline-none focus:border-[#d58f99] min-h-[150px] text-sm resize-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#917c71] mb-2 uppercase tracking-wider">Unlock Date</label>
                      <input
                        type="date"
                        value={newCapsule.unlockDate}
                        onChange={(e) => setNewCapsule({ ...newCapsule, unlockDate: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#eae2e8] bg-[#fdfbfb] text-[#5a4a42] focus:outline-none focus:border-[#d58f99] text-sm transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#917c71] mb-2 uppercase tracking-wider">Time</label>
                      <input
                        type="time"
                        value={newCapsule.unlockTime}
                        onChange={(e) => setNewCapsule({ ...newCapsule, unlockTime: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-[#eae2e8] bg-[#fdfbfb] text-[#5a4a42] focus:outline-none focus:border-[#d58f99] text-sm transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-[#fff0f3]/50 rounded-xl p-4 border border-[#d58f99]/10">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-[#d58f99] mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-[#917c71] leading-relaxed">
                        This letter will be sealed until the specified date and time. Perfect for future anniversaries, birthdays, or special moments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-[#fdfbfb] border-t border-[#eae2e8]/50 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCapsule(null);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#eae2e8] text-[#917c71] font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCapsule}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#d58f99] text-white font-bold text-sm hover:bg-[#c07a84] transition-colors shadow-sm"
                >
                  {editingCapsule ? 'Update Letter' : 'Seal Letter'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
