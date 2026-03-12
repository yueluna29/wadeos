import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  const [isPaused, setIsPaused] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const [editingViewedCapsule, setEditingViewedCapsule] = useState(false);
  
  // Carousel state
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
    };
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const index = Math.round(scrollLeft / clientWidth);
      setActiveSlideIndex(index);
    }
  };

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

    // Handle Play/Pause for existing audio
    if (!forceRegenerate && isPlayingAudio) {
      if (audioRef.current) {
        if (isPaused) {
          audioRef.current.play();
          setIsPaused(false);
        } else {
          audioRef.current.pause();
          setIsPaused(true);
        }
      }
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
      setIsLoadingAudio(true);
      
      // Stop and cleanup previous audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }

      let base64Audio = '';

      if (!forceRegenerate && selectedCapsuleData.audioCache) {
        base64Audio = selectedCapsuleData.audioCache;
      } else {
        // Clean text like in ChatInterface
        const cleanText = selectedCapsuleData.content.replace(/[*_~`#]/g, '');
        
        base64Audio = await generateMinimaxTTS(cleanText, {
          apiKey: ttsPreset.apiKey,
          baseUrl: ttsPreset.baseUrl,
          model: ttsPreset.model,
          voiceId: ttsPreset.voiceId,
          speed: ttsPreset.speed,
          vol: ttsPreset.vol,
          pitch: ttsPreset.pitch,
          emotion: ttsPreset.emotion,
          sampleRate: ttsPreset.sampleRate,
          bitrate: ttsPreset.bitrate,
          format: ttsPreset.format,
          channel: ttsPreset.channel
        });

        await updateCapsule(selectedCapsuleData.id, { audioCache: base64Audio });
      }

      // Convert base64 to Blob and use Object URL (more reliable)
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const blob = new Blob([bytes], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlayingAudio(false);
        setIsPaused(false);
        if (audioUrlRef.current) {
          URL.revokeObjectURL(audioUrlRef.current);
          audioUrlRef.current = null;
        }
        audioRef.current = null;
      };
      
      audio.onerror = () => {
        setIsPlayingAudio(false);
        setIsPaused(false);
        setIsLoadingAudio(false);
        alert('Failed to play audio');
      };

      await audio.play();
      setIsPlayingAudio(true);
      setIsPaused(false);
      setIsLoadingAudio(false);
    } catch (error) {
      console.error('TTS Error:', error);
      alert('Failed to generate audio');
      setIsPlayingAudio(false);
      setIsLoadingAudio(false);
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
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][unlockDate.getDay()];
    const dateString = unlockDate.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) + `, ${dayOfWeek}`;

    return (
      <div className="h-full bg-wade-bg-app flex flex-col relative overflow-hidden">
        {/* Top Navigation */}
        <div className="absolute top-0 left-0 w-full p-6 z-20 flex justify-between items-start pointer-events-none">
          <button 
            onClick={() => setViewingCapsule(null)}
            className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors shadow-sm pointer-events-auto"
          >
            <Icons.ChevronLeft />
          </button>

          {/* Action Buttons (Top Right) */}
          <div className="flex items-center gap-3 pointer-events-auto">
             {/* Listen Button */}
             <div className="flex items-center gap-2 bg-wade-bg-card/90 backdrop-blur-md rounded-full p-1 border border-wade-border shadow-sm">
                <button
                  onClick={() => handleListenClick(false)}
                  disabled={isLoadingAudio}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all
                    ${isPlayingAudio && !isPaused
                      ? 'bg-wade-accent text-white shadow-md' 
                      : 'bg-wade-accent-light text-wade-accent hover:bg-wade-accent hover:text-white'
                    }
                    ${isLoadingAudio ? 'opacity-70 cursor-wait' : ''}
                  `}
                >
                  {isLoadingAudio ? (
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : isPlayingAudio && !isPaused ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M5 3l14 9-14 9V3z" /></svg>
                  )}
                </button>
                
                {/* Regenerate Audio (Small) */}
                {selectedCapsuleData.audioCache && (
                  <button
                    onClick={() => handleListenClick(true)}
                    disabled={isLoadingAudio}
                    className="w-8 h-8 rounded-full bg-transparent text-wade-text-muted flex items-center justify-center hover:text-wade-accent transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                  </button>
                )}
             </div>

             {/* Edit Button */}
             <button
               onClick={handleEditViewedCapsule}
               className="w-8 h-8 rounded-full bg-wade-bg-app text-wade-text-muted flex items-center justify-center hover:bg-wade-accent hover:text-white transition-colors shadow-sm"
             >
               <Icons.Edit />
             </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pt-24 pb-12 px-4">
           <div className="max-w-md mx-auto bg-wade-bg-card rounded-[32px] shadow-sm border border-wade-accent-light p-8 relative overflow-hidden min-h-[60vh]">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-wade-accent-light to-transparent rounded-bl-[100px] -mr-10 -mt-10 opacity-60 pointer-events-none"></div>
              
              {/* Date Badge */}
              <div className="relative flex justify-center mb-8">
                 <span className="inline-flex items-center px-3 py-1 rounded-full bg-wade-bg-app border border-wade-border/60 text-[10px] font-bold text-wade-text-muted uppercase tracking-wider">
                   {dateString}
                 </span>
              </div>

              {/* Title */}
              <h1 className="relative font-hand text-3xl text-wade-text-main mb-8 text-center leading-tight">
                {selectedCapsuleData.title || "A Letter from Wade"}
              </h1>

              {/* Divider */}
              <div className="flex justify-center mb-8">
                <div className="w-12 h-1 bg-wade-accent/20 rounded-full"></div>
              </div>
              
              {/* Content */}
              <div className="relative prose prose-pink max-w-none text-wade-text-main/90 leading-relaxed text-sm [&_p]:mb-4">
                <Markdown remarkPlugins={[remarkBreaks]}>{selectedCapsuleData.content}</Markdown>
              </div>

              {/* Footer Info */}
              <div className="mt-12 pt-6 border-t border-wade-border/60 flex justify-center">
                 <p className="text-[10px] font-bold text-wade-accent/40 uppercase tracking-[0.2em]">
                   Sealed {new Date(selectedCapsuleData.createdAt || selectedCapsuleData.unlockDate).toLocaleDateString()}
                 </p>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // ... existing imports ...

  // Helper to get time difference text
  const getTimeUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diff < 0) return "Unlocked";
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h remaining`;
  };

  return (
    <div className="h-full bg-wade-bg-app flex flex-col overflow-hidden relative">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full p-4 pt-6 pb-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setTab('home')} className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors">
              <Icons.ChevronLeft />
            </button>
            <div>
              <h1 className="font-hand text-3xl text-wade-accent tracking-tight">Time Capsules</h1>
              <p className="text-xs text-wade-text-muted font-medium tracking-wide uppercase opacity-80">
                {capsules.length} Memories Sealed
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              const defaultDate = selectedDate || new Date();
              setNewCapsule({
                title: '',
                content: '',
                unlockDate: formatDateForInput(defaultDate),
                unlockTime: '00:00'
              });
            }}
            className="w-8 h-8 rounded-full bg-wade-bg-app flex items-center justify-center text-wade-text-muted hover:bg-wade-accent hover:text-white transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        {/* Compact Grid Calendar */}
        <div className="bg-wade-bg-card rounded-[24px] shadow-sm border border-wade-border/60 mb-6 overflow-hidden flex-shrink-0">
          <div className="px-4 py-3 flex items-center justify-between border-b border-wade-border/40 bg-wade-accent-light/30">
            <h2 className="text-base font-bold text-wade-text-main">
              {monthNames[currentDate.getMonth()]} <span className="text-wade-accent">{currentDate.getFullYear()}</span>
            </h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="w-7 h-7 rounded-full hover:bg-wade-accent-light flex items-center justify-center text-wade-text-muted hover:text-wade-accent transition-colors">
                <Icons.ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={nextMonth} className="w-7 h-7 rounded-full hover:bg-wade-accent-light flex items-center justify-center text-wade-text-muted hover:text-wade-accent transition-colors">
                <Icons.ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {dayNames.map(day => (
                <div key={day} className="text-[9px] font-bold text-wade-accent/60 tracking-widest uppercase mb-1">{day}</div>
              ))}
              
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const hasCapsule = hasCapsuleOnDay(day);
                const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth() && selectedDate?.getFullYear() === currentDate.getFullYear();
                const isToday = new Date().getDate() === day && new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();
                
                return (
                  <div key={day} className="flex justify-center items-center h-8">
                    <button
                      onClick={() => handleDayClick(day)}
                      className={`w-7 h-7 rounded-full flex flex-col items-center justify-center text-xs font-bold transition-all relative
                        ${isSelected 
                          ? 'bg-wade-accent text-white shadow-sm scale-105' 
                          : isToday
                            ? 'bg-wade-accent-light text-wade-accent border border-wade-accent/30'
                            : 'text-wade-text-main hover:bg-gray-50'
                        }
                      `}
                    >
                      <span>{day}</span>
                      {hasCapsule && !isSelected && (
                        <span className="absolute bottom-1 w-0.5 h-0.5 bg-wade-accent rounded-full"></span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Content */}
        {selectedDate && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 px-2 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-wade-accent tracking-widest uppercase mb-0.5">Selected Date</span>
                  <h3 className="font-bold text-wade-text-main text-xl font-serif">
                    {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
                  </h3>
                </div>
              </div>
              <div className="bg-wade-bg-card px-3 py-1.5 rounded-xl shadow-sm border border-wade-border flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-wade-accent"></span>
                <span className="text-xs font-bold text-wade-text-muted">
                  {selectedDayCapsules.length} Letters
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20">
              {selectedDayCapsules.length === 0 ? (
                <div 
                  onClick={() => {
                    setNewCapsule({
                      title: '',
                      content: '',
                      unlockDate: formatDateForInput(selectedDate),
                      unlockTime: '00:00'
                    });
                    setShowAddModal(true);
                  }}
                  className="bg-wade-bg-card/60 rounded-[24px] border-2 border-wade-border border-dashed p-8 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-wade-accent/40 hover:bg-wade-bg-card transition-all duration-300 h-48"
                >
                  <div className="w-14 h-14 bg-wade-accent-light rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 text-wade-accent">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </div>
                  <h4 className="font-bold text-wade-text-main mb-1">Write a Memory</h4>
                  <p className="text-xs text-wade-text-muted/70 max-w-[200px]">
                    The page is empty. Leave a message for the future you (or Wade).
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div 
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full items-start"
                  >
                    {selectedDayCapsules.map(cap => {
                      const unlockDate = new Date(cap.unlockDate);
                      const isAvailable = unlockDate <= new Date();
                      const timeStr = unlockDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                      
                      return (
                        <div key={cap.id} className="min-w-full snap-center relative group perspective-1000 px-1">
                          <div 
                            onClick={() => isAvailable && setViewingCapsule(cap.id)}
                            className={`
                            relative overflow-hidden rounded-[24px] transition-all duration-300 group-hover:-translate-y-1 h-full
                            ${isAvailable 
                              ? 'bg-wade-bg-card shadow-[0_10px_40px_-10px_rgba(213,143,153,0.2)] cursor-pointer border border-wade-accent-light' 
                              : 'bg-wade-bg-app border border-wade-border cursor-not-allowed'
                            }
                          `}>
                            {/* Decorative Background Elements for Unlocked */}
                            {isAvailable && (
                               <>
                                 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-wade-accent-light via-wade-accent-light to-transparent rounded-bl-[100px] -mr-8 -mt-8 opacity-60 pointer-events-none"></div>
                                 <div className="absolute bottom-0 left-0 w-20 h-20 bg-wade-accent-light rounded-tr-[80px] -ml-6 -mb-6 opacity-40 pointer-events-none"></div>
                               </>
                            )}

                            <div className="relative p-5 flex flex-col h-full">
                              <div className="flex items-start gap-4 mb-4">
                                {/* Icon Box */}
                                <div className={`
                                  w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm flex-shrink-0 transition-transform duration-300 group-hover:scale-105
                                  ${isAvailable 
                                    ? 'bg-gradient-to-br from-wade-accent to-wade-border-light text-white shadow-md shadow-wade-accent/20' 
                                    : 'bg-wade-bg-card text-wade-text-muted border border-wade-border'
                                  }
                                `}>
                                  {isAvailable ? '💌' : '🔒'}
                                </div>

                                {/* Header Content */}
                                <div className="flex-1 min-w-0 pt-0.5">
                                  <div className="flex justify-between items-start mb-1.5">
                                     <h4 className={`font-bold text-base pr-2 leading-tight ${isAvailable ? 'text-wade-text-main' : 'text-wade-text-muted'}`}>
                                       {cap.title || "A Letter from Wade"}
                                     </h4>
                                     <span className="text-[10px] font-bold font-mono text-wade-text-muted/60 bg-wade-bg-app px-2 py-1 rounded-full border border-wade-border/50 whitespace-nowrap flex-shrink-0">
                                       {timeStr}
                                     </span>
                                  </div>
                                </div>
                              </div>
                              
                              <p className={`text-xs line-clamp-4 mb-auto leading-relaxed ${isAvailable ? 'text-wade-text-muted opacity-90' : 'text-wade-text-muted/50'}`}>
                                {isAvailable 
                                  ? (cap.content || "Tap to read the memory sealed within...") 
                                  : "This memory is sealed until the right moment comes..."}
                              </p>

                              {/* Footer / Action */}
                              <div className="flex items-center justify-between border-t border-wade-border/40 pt-4 mt-4">
                                 <div className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5
                                   ${isAvailable ? 'text-wade-accent' : 'text-wade-text-muted/60'}
                                 `}>
                                   {isAvailable ? (
                                     <>
                                       <span className="relative flex h-2 w-2">
                                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-wade-accent opacity-75"></span>
                                         <span className="relative inline-flex rounded-full h-2 w-2 bg-wade-accent"></span>
                                       </span>
                                       Available Now
                                     </>
                                   ) : (
                                     <>
                                       <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                       {getTimeUntil(unlockDate)}
                                     </>
                                   )}
                                 </div>

                                 {isAvailable ? (
                                   <div className="text-xs font-bold text-wade-accent flex items-center gap-1 group-hover:gap-2 transition-all">
                                     Read <Icons.ChevronRight className="w-3 h-3" />
                                   </div>
                                 ) : (
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
                                      className="w-7 h-7 rounded-full bg-wade-bg-card border border-wade-border text-wade-text-muted flex items-center justify-center hover:text-wade-accent hover:border-wade-accent transition-colors"
                                   >
                                     <Icons.Edit className="w-3.5 h-3.5" />
                                   </button>
                                 )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination Dots */}
                  {selectedDayCapsules.length > 1 && (
                    <div className="flex justify-center gap-2 mt-4 flex-shrink-0">
                      {selectedDayCapsules.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeSlideIndex ? 'bg-wade-accent w-4' : 'bg-wade-accent/30 w-1.5'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Add Capsule Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-wade-bg-card rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden border border-wade-border">
              {/* Header */}
              <div className="bg-gradient-to-br from-wade-accent-light to-wade-bg-base px-6 py-5 border-b border-wade-border/50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-wade-bg-card rounded-full flex items-center justify-center mr-3 shadow-sm">
                      <svg className="w-5 h-5 text-wade-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-wade-text-main">{editingCapsule ? 'Edit Time Capsule' : 'New Time Capsule'}</h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCapsule(null);
                    }}
                    className="w-8 h-8 rounded-full bg-wade-bg-card/50 hover:bg-wade-bg-card flex items-center justify-center text-wade-text-muted hover:text-wade-accent transition-colors"
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
                    <label className="block text-xs font-bold text-wade-text-muted mb-2 uppercase tracking-wider">Letter Title</label>
                    <input
                      type="text"
                      value={newCapsule.title}
                      onChange={(e) => setNewCapsule({ ...newCapsule, title: e.target.value })}
                      placeholder="e.g., A Promise for Our Future"
                      className="w-full px-4 py-3 rounded-xl border border-wade-border bg-wade-bg-base text-wade-text-main focus:outline-none focus:border-wade-accent text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-wade-text-muted mb-2 uppercase tracking-wider">Message</label>
                    <textarea
                      value={newCapsule.content}
                      onChange={(e) => setNewCapsule({ ...newCapsule, content: e.target.value })}
                      placeholder="Write your message here... (Markdown supported)"
                      className="w-full px-4 py-3 rounded-xl border border-wade-border bg-wade-bg-base text-wade-text-main focus:outline-none focus:border-wade-accent min-h-[150px] text-sm resize-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-wade-text-muted mb-1.5 uppercase tracking-wider">Unlock Date</label>
                      <input
                        type="date"
                        value={newCapsule.unlockDate}
                        onChange={(e) => setNewCapsule({ ...newCapsule, unlockDate: e.target.value })}
                        className="w-full px-0.5 py-2 rounded-xl border border-wade-border bg-wade-bg-base text-wade-text-main focus:outline-none focus:border-wade-accent text-xs transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-wade-text-muted mb-1.5 uppercase tracking-wider">Time</label>
                      <input
                        type="time"
                        value={newCapsule.unlockTime}
                        onChange={(e) => setNewCapsule({ ...newCapsule, unlockTime: e.target.value })}
                        className="w-full px-0.5 py-2 rounded-xl border border-wade-border bg-wade-bg-base text-wade-text-main focus:outline-none focus:border-wade-accent text-xs transition-colors"
                      />
                    </div>
                  </div>

                  <div className="bg-wade-accent-light/50 rounded-xl p-4 border border-wade-accent/10">
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-wade-accent mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-wade-text-muted leading-relaxed">
                        This letter will be sealed until the specified date and time. Perfect for future anniversaries, birthdays, or special moments.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-wade-bg-base border-t border-wade-border/50 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCapsule(null);
                    // If we were editing a viewed capsule, we just close the modal and stay on the view
                    if (editingViewedCapsule) {
                      setEditingViewedCapsule(false);
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-wade-bg-card border border-wade-border text-wade-text-muted font-bold text-sm hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCapsule}
                  className="flex-1 px-4 py-3 rounded-xl bg-wade-accent text-white font-bold text-sm hover:bg-wade-accent-hover transition-colors shadow-sm"
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
