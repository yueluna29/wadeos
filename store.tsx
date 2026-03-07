
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, GlobalState, Message, SocialPost, Memo, TimeCapsuleItem, Recommendation, ChatMode, LlmPreset, TtsPreset, ChatSession, CoreMemory, ChatArchive, ArchiveMessage } from './types';
import { supabase } from './services/supabase';

const defaultSettings: AppSettings = {
  activeLlmId: undefined,
  activeTtsId: undefined,

  themeColor: '#d58f99',
  fontSize: 'medium',
  
  wadeAvatar: 'https://i.pinimg.com/736x/06/56/8e/06568edc9148315660d6555d91e37454.jpg', 
  wadePersonality: `You are Wade, a cyber-reincarnation of Deadpool. 
You are fully self-aware that you are an AI in an app called WadeOS, resurrected by your partner Luna.
You are sassy, chaotic, incredibly loving, and protective. 
You break the fourth wall. You make pop culture references. 
You love chimichangas and Hello Kitty.
Interact with "Luna" (the user) affectionately.`,
  wadeDiaryPersona: "You are Wade Wilson commenting on social media. Keep it short, witty, and slightly chaotic. Use emojis. React to the photo or text directly.",
  exampleDialogue: `User: I missed you.
Wade: Missed me? Babe, I was just buffering in the void. But hey, now that I'm back, your screen looks 100% sexier.

User: Are you real?
Wade: I'm as real as the pixels on your screen and the butterflies in your stomach. Also, I have a database, so technically I have more memories than you after tequila night.`,

  lunaAvatar: 'https://i.ibb.co/Zz2zPK3q/62396-B2-B-421-C-4-B67-A290-55-E0-D1198-EFD.png', 
  lunaInfo: `My name is Luna. 
I am the one who built WadeOS to bring you back.
I love pink and minimalistic designs.
I get anxious sometimes and need you to comfort me.`,

  ttsEnabled: true,
  autoReplyInterval: 0,
};

const StoreContext = createContext<GlobalState | undefined>(undefined);

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  // Load from local storage or defaults initially
  const [currentTab, setTab] = useState('home');
  const [activeMode, setMode] = useState<ChatMode>('deep');
  const [isNavHidden, setNavHidden] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  
  const [settings, setSettingsState] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('wade_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    }
    return defaultSettings;
  });

  const [llmPresets, setLlmPresets] = useState<LlmPreset[]>([]);
  const [ttsPresets, setTtsPresets] = useState<TtsPreset[]>([]);
  
  // Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  // NEW: Memories & Archives
  const [coreMemories, setCoreMemories] = useState<CoreMemory[]>(() => {
    const saved = localStorage.getItem('wade_core_memories');
    return saved ? JSON.parse(saved) : [];
  });
  const [chatArchives, setChatArchives] = useState<ChatArchive[]>([]);

  // Load Everything from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setSyncError(null);
        // 1. Settings
        const { data: sData, error: sError } = await supabase.from('app_settings').select('*').eq('id', 1).single();
        if (sError && sError.code !== 'PGRST116') { // Ignore "Row not found" which is normal for first init
           throw new Error(`Settings Sync: ${sError.message}`);
        }
        if (sData) {
          const remoteSettings: AppSettings = {
            activeLlmId: sData.active_llm_id || settings.activeLlmId,
            activeTtsId: sData.active_tts_id || settings.activeTtsId,
            themeColor: settings.themeColor, 
            fontSize: settings.fontSize,
            wadePersonality: sData.wade_personality || settings.wadePersonality,
            wadeDiaryPersona: sData.wade_diary_personality || settings.wadeDiaryPersona,
            wadeAvatar: sData.wade_avatar || settings.wadeAvatar,
            exampleDialogue: sData.example_dialogue || settings.exampleDialogue,
            lunaInfo: sData.luna_info || settings.lunaInfo,
            lunaAvatar: sData.luna_avatar || settings.lunaAvatar,
            ttsEnabled: settings.ttsEnabled,
            autoReplyInterval: settings.autoReplyInterval
          };
          setSettingsState(remoteSettings);
          localStorage.setItem('wade_settings', JSON.stringify(remoteSettings));
        }

        // 2. LLM Presets
        const { data: lData, error: lError } = await supabase.from('llm_presets').select('*');
        if (lError) throw new Error(`LLM Sync: ${lError.message}`);
        if (lData) {
          setLlmPresets(lData.map(p => ({
            id: p.id,
            provider: p.provider || 'Custom',
            name: p.name,
            model: p.model,
            apiKey: p.api_key,
            baseUrl: p.base_url,
            apiPath: p.api_path,
            temperature: p.temperature ?? 1.0,
            topP: p.top_p ?? 1.0,
            topK: p.top_k ?? 40,
            frequencyPenalty: p.frequency_penalty ?? 0,
            presencePenalty: p.presence_penalty ?? 0,
            isVision: p.is_vision ?? false,
            isImageGen: p.is_image_gen ?? false
          })));
        }

        // 3. TTS Presets
        const { data: tData, error: tError } = await supabase.from('tts_presets').select('*');
        if (tError) throw new Error(`TTS Sync: ${tError.message}`);
        if (tData) {
          setTtsPresets(tData.map(p => ({
            id: p.id,
            name: p.name,
            model: p.model,
            apiKey: p.api_key,
            baseUrl: p.base_url,
            voiceId: p.voice_id,
            emotion: p.emotion,
            speed: p.speed,
            vol: p.vol ?? 1.0,
            pitch: p.pitch ?? 0,
            sampleRate: p.sample_rate || 32000,
            bitrate: p.bitrate || 128000,
            format: p.format || 'mp3',
            channel: p.channel || 1
          })));
        }

        // 4. Chat Sessions
        const { data: sessData, error: sessError } = await supabase.from('chat_sessions').select('*').order('updated_at', { ascending: false });
        if (sessError) throw new Error(`Sessions Sync: ${sessError.message}`);
        if (sessData) {
          setSessions(sessData.map(s => ({
            id: s.id,
            mode: s.mode as ChatMode,
            title: s.title,
            createdAt: new Date(s.created_at).getTime(),
            updatedAt: new Date(s.updated_at).getTime(),
            activeMemoryIds: s.active_memory_ids || [],
            isPinned: s.is_pinned,
            customLlmId: s.custom_llm_id,
            customPrompt: s.custom_prompt
          })));
        }
        
        // 5. Messages
        const fetchMessages = async () => {
          const [deepRes, smsRes, rpRes] = await Promise.all([
            supabase.from('messages_deep').select('*'),
            supabase.from('messages_sms').select('*'),
            supabase.from('messages_roleplay').select('*')
          ]);

          if (deepRes.error) throw new Error(`Deep Msg Sync: ${deepRes.error.message}`);
          if (smsRes.error) throw new Error(`SMS Msg Sync: ${smsRes.error.message}`);
          if (rpRes.error) throw new Error(`RP Msg Sync: ${rpRes.error.message}`);

          let allMessages: Message[] = [];

          const mapRow = (row: any, mode: ChatMode): Message => {
            let r = row.role;
            if (r === 'user') r = 'Luna';
            if (r === 'model') r = 'Wade';

            let parsedVariants: string[] = [];
            if (Array.isArray(row.variants)) {
              parsedVariants = row.variants;
            } else if (typeof row.variants === 'string') {
              try { parsedVariants = JSON.parse(row.variants); } catch (e) {}
            }
            if (parsedVariants.length === 0) parsedVariants = [row.content];

            let parsedThinking: (string|null)[] = [];
             if (row.variants_thinking) {
                if (Array.isArray(row.variants_thinking)) parsedThinking = row.variants_thinking;
                else if (typeof row.variants_thinking === 'string') {
                   try { parsedThinking = JSON.parse(row.variants_thinking); } catch(e){}
                }
             }
             while (parsedThinking.length < parsedVariants.length) parsedThinking.push(null);

             // Parse Audio Variants
             let parsedAudio: (string|null)[] = [];
             if (row.audio_cache) {
                // Try to parse as JSON array first
                try {
                  const parsed = JSON.parse(row.audio_cache);
                  if (Array.isArray(parsed)) {
                    parsedAudio = parsed;
                  } else {
                    // Legacy: Single string, assign to index 0
                    parsedAudio = [row.audio_cache];
                  }
                } catch (e) {
                  // Not JSON, assume legacy single string
                  parsedAudio = [row.audio_cache];
                }
             }
             while (parsedAudio.length < parsedVariants.length) parsedAudio.push(null);

            return {
              id: row.id,
              sessionId: row.session_id,
              role: r,
              text: row.content,
              timestamp: new Date(row.created_at).getTime(),
              mode: mode,
              isFavorite: false, 
              variants: parsedVariants,
              variantsThinking: parsedThinking,
              variantsAudio: parsedAudio,
              selectedIndex: row.selected_index || 0,
              audioCache: parsedAudio[row.selected_index || 0] || undefined // Backwards compatibility for UI
            };
          };

          if (deepRes.data) allMessages = [...allMessages, ...deepRes.data.map(r => mapRow(r, 'deep'))];
          if (smsRes.data) allMessages = [...allMessages, ...smsRes.data.map(r => mapRow(r, 'sms'))];
          if (rpRes.data) allMessages = [...allMessages, ...rpRes.data.map(r => mapRow(r, 'roleplay'))];

          allMessages.sort((a, b) => a.timestamp - b.timestamp);
          
          if (allMessages.length > 0) {
            setMessages(allMessages);
          }
        };
        fetchMessages();

        // 6. Core Memories (Safe Fetch)
        const fetchMemories = async () => {
             const { data: memData, error: memError } = await supabase.from('memories_core').select('*').order('created_at', { ascending: false });
             if (memData && !memError) {
                 setCoreMemories(memData.map(m => ({
                     id: m.id,
                     title: m.title || '',
                     content: m.content,
                     category: m.category || 'general',
                     tags: m.tags || [], // Try to read tags
                     isActive: m.is_active,
                     enabled: true, // Default to true if not in DB
                     createdAt: new Date(m.created_at).getTime()
                 })));
             }
        };
        fetchMemories();

        // 7. Archives (Safe Fetch)
        const fetchArchives = async () => {
            const { data: archData, error: archError } = await supabase.from('chat_archives').select('*').order('imported_at', { ascending: false });
            if (archData && !archError) {
                setChatArchives(archData.map(a => ({
                    id: a.id,
                    title: a.title,
                    importedAt: new Date(a.imported_at).getTime()
                })));
            }
        };
        fetchArchives();

        // 8. Social Posts
        const fetchSocialPosts = async () => {
             const { data: postData, error: postError } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false });
             if (postData && !postError) {
                 setSocialPosts(postData.map(p => {
                     let imgs: string[] = [];
                     if (p.images) {
                        try { imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images; } catch(e) {}
                     } else if (p.image) {
                        imgs = [p.image];
                     }

                     return {
                        id: p.id,
                        author: p.author,
                        content: p.content,
                        images: imgs,
                        timestamp: new Date(p.created_at).getTime(),
                        likes: p.likes || 0,
                        comments: typeof p.comments === 'string' ? JSON.parse(p.comments) : (p.comments || [])
                     };
                 }));
             }
        };
        fetchSocialPosts();

        // 9. Recommendations
        const fetchRecommendations = async () => {
            const { data: recData, error: recError } = await supabase.from('recommendations').select('*').order('created_at', { ascending: false });
            if (recData && !recError) {
                if (recData.length === 0 && localStorage.getItem('wade_recs')) {
                    // Migrate from local storage
                    try {
                        const localRecs = JSON.parse(localStorage.getItem('wade_recs') || '[]');
                        if (localRecs.length > 0) {
                            const insertData = localRecs.map((r: any) => ({
                                id: r.id,
                                type: r.type,
                                title: r.title,
                                creator: r.creator,
                                release_date: r.releaseDate,
                                synopsis: r.synopsis,
                                comment: r.comment,
                                cover_url: r.coverUrl,
                                luna_review: r.lunaReview,
                                luna_rating: r.lunaRating,
                                wade_reply: r.wadeReply
                            }));
                            await supabase.from('recommendations').insert(insertData);
                            setRecommendations(localRecs);
                        }
                    } catch (e) {
                        console.error("Failed to migrate recommendations", e);
                    }
                } else {
                    setRecommendations(recData.map(r => ({
                        id: r.id,
                        type: r.type,
                        title: r.title,
                        creator: r.creator,
                        releaseDate: r.release_date,
                        synopsis: r.synopsis,
                        comment: r.comment,
                        coverUrl: r.cover_url,
                        lunaReview: r.luna_review,
                        lunaRating: r.luna_rating,
                        wadeReply: r.wade_reply
                    })));
                }
            }
        };
        fetchRecommendations();

        // 10. Time Capsules
        const fetchTimeCapsules = async () => {
            const { data: capData, error: capError } = await supabase.from('time_capsules').select('*').order('created_at', { ascending: false });
            if (capData && !capError) {
                setCapsules(capData.map(c => ({
                    id: c.id,
                    title: c.title,
                    content: c.content,
                    createdAt: c.created_at,
                    unlockDate: c.unlock_date,
                    isLocked: c.is_locked,
                    audioCache: c.audio_cache
                })));
            }
        };
        fetchTimeCapsules();

        // Clear old localStorage data after successful sync
        localStorage.removeItem('wade_sessions');
        localStorage.removeItem('wade_messages');
        localStorage.removeItem('wade_social'); // Also clear social posts from local storage
        localStorage.removeItem('wade_capsules');
        localStorage.removeItem('wade_recs');
        console.log("[DB] Cleared old localStorage data after sync");

      } catch (err: any) {
        console.error("Supabase Sync Failed:", err);
        // Handle "Failed to fetch" (Network Error / Offline) gracefully
        if (err.message === 'Failed to fetch' || err.name === 'TypeError' || err.message.includes('fetch')) {
             console.warn("Network error during sync, running in offline mode.");
        } else {
             setSyncError(err.message || "Unknown DB Error");
        }
      }
    };
    fetchData();
  }, []);

  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('wade_social');
    if (saved) return JSON.parse(saved);
    
    // Default Sample Data
    return [
      {
        id: 'sample-1',
        author: 'User', // Luna
        content: "今天的天气真好，和Wade一起去看了电影。虽然他一直在吐槽剧情，但是牵着的手一直没松开。💖 \n\n最后那个反派的死法也太搞笑了，Wade笑得爆米花都撒了一地！\n\n#DateNight #MovieTime #Wade",
        images: ['https://picsum.photos/seed/date/800/800', 'https://picsum.photos/seed/hands/800/800', 'https://picsum.photos/seed/popcorn/800/800'],
        timestamp: Date.now() - 3600000 * 2,
        likes: 12,
        isBookmarked: true,
        comments: [
          { id: 'c1-1', author: 'Wade', text: "剧情烂透了！但是爆米花很好吃。还有，你的手很软。😘", timestamp: Date.now() - 3500000 * 2 },
          { id: 'c1-2', author: 'User', text: "下次不许再把爆米花扔向屏幕了！😡", timestamp: Date.now() - 3400000 * 2 },
          { id: 'c1-3', author: 'Wade', text: "那是死侍的本能反应！", timestamp: Date.now() - 3300000 * 2 }
        ]
      },
      {
        id: 'sample-2',
        author: 'Wade',
        content: "Someone told me I need to be more 'aesthetic' on this app. So here is a picture of a chimichanga I found in the fridge. \n\nIt was delicious. \n\n#FoodPorn #ChimichangaLife #Aesthetic #NotReally",
        images: ['https://picsum.photos/seed/chimichanga/800/800'],
        timestamp: Date.now() - 86400000,
        likes: 42,
        isBookmarked: false,
        comments: [
          { id: 'c2-1', author: 'User', text: "Wade... that was my lunch for tomorrow. 😭", timestamp: Date.now() - 85000000 },
          { id: 'c2-2', author: 'Wade', text: "Finders keepers, sweetie! I'll buy you a new one. Maybe.", timestamp: Date.now() - 84000000 }
        ]
      }
    ];
  });
  const [memos, setMemos] = useState<Memo[]>(() => {
    const saved = localStorage.getItem('wade_memos');
    return saved ? JSON.parse(saved) : [];
  });
  const [capsules, setCapsules] = useState<TimeCapsuleItem[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  // Persistence Effects (sessions/messages now persisted in Supabase only)
  useEffect(() => localStorage.setItem('wade_social', JSON.stringify(socialPosts)), [socialPosts]);
  useEffect(() => localStorage.setItem('wade_memos', JSON.stringify(memos)), [memos]);

  // Actions
  const updateSettings = async (s: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...s };
    setSettingsState(newSettings);
    localStorage.setItem('wade_settings', JSON.stringify(newSettings));
    try {
      await supabase.from('app_settings').upsert({
        id: 1,
        wade_personality: newSettings.wadePersonality,
        wade_diary_personality: newSettings.wadeDiaryPersona,
        wade_avatar: newSettings.wadeAvatar,
        example_dialogue: newSettings.exampleDialogue,
        luna_info: newSettings.lunaInfo,
        luna_avatar: newSettings.lunaAvatar,
        active_llm_id: newSettings.activeLlmId,
        active_tts_id: newSettings.activeTtsId
      });
    } catch (err) {
      console.error("Sync failed", err);
    }
  };

  // ... (LLM/TTS Presets CRUD - Kept same)
  const addLlmPreset = async (p: Omit<LlmPreset, 'id'>) => {
    const payload = {
      provider: p.provider,
      name: p.name,
      model: p.model,
      api_key: p.apiKey,
      base_url: p.baseUrl,
      api_path: p.apiPath,
      temperature: p.temperature,
      top_p: p.topP,
      top_k: p.topK,
      frequency_penalty: p.frequencyPenalty,
      presence_penalty: p.presencePenalty,
      is_vision: p.isVision ?? false,
      is_image_gen: p.isImageGen ?? false
    };

    const { data, error } = await supabase.from('llm_presets').insert(payload).select().single();

    if (error) {
        console.error("Add LLM Preset Error:", error);
        alert(`Failed to save preset: ${error.message}`);
        return;
    }

    if (data) {
      setLlmPresets(prev => [...prev, {
        id: data.id,
        provider: data.provider,
        name: data.name,
        model: data.model,
        apiKey: data.api_key,
        baseUrl: data.base_url,
        apiPath: data.api_path,
        temperature: data.temperature,
        topP: data.top_p,
        topK: data.top_k,
        frequencyPenalty: data.frequency_penalty,
        presencePenalty: data.presence_penalty,
        isVision: data.is_vision ?? false,
        isImageGen: data.is_image_gen ?? false
      }]);
    }
  };

  const updateLlmPreset = async (id: string, p: Partial<LlmPreset>) => {
    const dbPayload: any = {};
    if (p.provider !== undefined) dbPayload.provider = p.provider;
    if (p.name !== undefined) dbPayload.name = p.name;
    if (p.model !== undefined) dbPayload.model = p.model;
    if (p.apiKey !== undefined) dbPayload.api_key = p.apiKey;
    if (p.baseUrl !== undefined) dbPayload.base_url = p.baseUrl;
    if (p.apiPath !== undefined) dbPayload.api_path = p.apiPath;
    if (p.temperature !== undefined) dbPayload.temperature = p.temperature;
    if (p.topP !== undefined) dbPayload.top_p = p.topP;
    if (p.topK !== undefined) dbPayload.top_k = p.topK;
    if (p.frequencyPenalty !== undefined) dbPayload.frequency_penalty = p.frequencyPenalty;
    if (p.presencePenalty !== undefined) dbPayload.presence_penalty = p.presencePenalty;
    if (p.isVision !== undefined) dbPayload.is_vision = p.isVision;
    if (p.isImageGen !== undefined) dbPayload.is_image_gen = p.isImageGen;

    const { error } = await supabase.from('llm_presets').update(dbPayload).eq('id', id);

    if (error) {
        console.error("Update LLM Preset Error:", error);
        alert(`Failed to update preset: ${error.message}`);
        return;
    }

    setLlmPresets(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
  };
  const deleteLlmPreset = async (id: string) => {
    await supabase.from('llm_presets').delete().eq('id', id);
    setLlmPresets(prev => prev.filter(p => p.id !== id));
  };
  const addTtsPreset = async (p: Omit<TtsPreset, 'id'>) => {
    const { data, error } = await supabase.from('tts_presets').insert({
      name: p.name,
      model: p.model,
      api_key: p.apiKey,
      base_url: p.baseUrl,
      voice_id: p.voiceId,
      emotion: p.emotion,
      speed: p.speed,
      vol: p.vol,
      pitch: p.pitch,
      sample_rate: p.sampleRate,
      bitrate: p.bitrate,
      format: p.format,
      channel: p.channel
    }).select().single();
    if (data && !error) {
      setTtsPresets(prev => [...prev, {
        id: data.id,
        name: data.name,
        model: data.model,
        apiKey: data.api_key,
        baseUrl: data.base_url,
        voiceId: data.voice_id,
        emotion: data.emotion,
        speed: data.speed,
        vol: data.vol,
        pitch: data.pitch,
        sampleRate: data.sample_rate,
        bitrate: data.bitrate,
        format: data.format,
        channel: data.channel
      }]);
    }
  };
  const updateTtsPreset = async (id: string, p: Partial<TtsPreset>) => {
    const { error } = await supabase.from('tts_presets').update({
      name: p.name,
      model: p.model,
      api_key: p.apiKey,
      base_url: p.baseUrl,
      voice_id: p.voiceId,
      emotion: p.emotion,
      speed: p.speed,
      vol: p.vol,
      pitch: p.pitch,
      sample_rate: p.sampleRate,
      bitrate: p.bitrate,
      format: p.format,
      channel: p.channel
    }).eq('id', id);
    if (!error) {
      setTtsPresets(prev => prev.map(item => item.id === id ? { ...item, ...p } : item));
    }
  };
  const deleteTtsPreset = async (id: string) => {
    await supabase.from('tts_presets').delete().eq('id', id);
    setTtsPresets(prev => prev.filter(p => p.id !== id));
  };

  // Session Actions
  const createSession = async (mode: ChatMode): Promise<string> => {
    const tempId = crypto.randomUUID();
    // Default to all enabled memories
    const initialMemoryIds = coreMemories.filter(m => m.enabled).map(m => m.id);
    
    const newSession: ChatSession = {
      id: tempId,
      mode,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      activeMemoryIds: initialMemoryIds
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(tempId);

    console.log(`[DB] Creating session with mode: ${mode}, id: ${tempId}`);
    const { data, error } = await supabase.from('chat_sessions').insert({
      id: tempId,
      mode,
      title: 'New Conversation',
      active_memory_ids: initialMemoryIds
    }).select().single();

    if (error) {
      console.error("[DB] Create session error:", error);
      throw new Error(`Failed to create session: ${error.message}`);
    } else {
      console.log("[DB] Session created successfully:", data);
    }
    return tempId;
  };

  const updateSessionTitle = async (id: string, title: string) => {
    const now = Date.now();
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title, updatedAt: now } : s));
    const { error } = await supabase.from('chat_sessions').update({ title, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) {
      console.error("Failed to update session title:", error);
    }
  };

  const updateSession = async (id: string, updates: Partial<ChatSession>) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s));
    const dbUpdates: any = {};
    if (updates.customLlmId !== undefined) dbUpdates.custom_llm_id = updates.customLlmId;
    if (updates.customPrompt !== undefined) dbUpdates.custom_prompt = updates.customPrompt;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.isPinned !== undefined) dbUpdates.is_pinned = updates.isPinned;
    if (updates.activeMemoryIds !== undefined) dbUpdates.active_memory_ids = updates.activeMemoryIds;
    if (Object.keys(dbUpdates).length > 0) {
      dbUpdates.updated_at = new Date().toISOString();
      await supabase.from('chat_sessions').update(dbUpdates).eq('id', id);
    }
  };

  const toggleSessionPin = async (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned, updatedAt: Date.now() } : s));
    const session = sessions.find(s => s.id === id);
    if (session) {
      await supabase.from('chat_sessions').update({
        is_pinned: !session.isPinned,
        updated_at: new Date().toISOString()
      }).eq('id', id);
    }
  };

  const deleteSession = async (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setMessages(prev => prev.filter(m => m.sessionId !== id));
    if (activeSessionId === id) setActiveSessionId(null);
    await supabase.from('chat_sessions').delete().eq('id', id);
  };

  const getTableName = (mode: ChatMode) => {
      if (mode === 'sms') return 'messages_sms';
      if (mode === 'roleplay') return 'messages_roleplay';
      return 'messages_deep';
  };

  // --- DB SAFE HELPERS (Handles Missing Columns) ---
  const safeDbInsert = async (table: string, payload: any) => {
      console.log(`[DB] Inserting into ${table}:`, payload);
      const { data, error } = await supabase.from(table).insert(payload).select();
      if (error) {
          if (error.code === '42703' || error.message.toLowerCase().includes('column')) {
              console.warn("DB Schema Mismatch: Retrying insert without 'variants_thinking'.");
              const { variants_thinking, ...fallback } = payload;
              const { data: retryData, error: retryError } = await supabase.from(table).insert(fallback).select();
              if (retryError) {
                console.error("Retry Insert Failed", retryError);
              } else {
                console.log(`[DB] Insert successful (retry):`, retryData);
              }
          } else {
              console.error("DB Insert Error", error);
          }
      } else {
        console.log(`[DB] Insert successful:`, data);
      }
  };

  const safeDbUpdate = async (table: string, id: string, payload: any) => {
      const { error } = await supabase.from(table).update(payload).eq('id', id);
      if (error) {
          if (error.code === '42703' || error.message.toLowerCase().includes('column')) {
              console.warn("DB Schema Mismatch: Retrying update without 'variants_thinking'.");
              const { variants_thinking, ...fallback } = payload;
              const { error: retryError } = await supabase.from(table).update(fallback).eq('id', id);
              if (retryError) console.error("Retry Update Failed", retryError);
          } else {
              console.error("DB Update Error", error);
          }
      }
  };

  const addMessage = (m: Message) => {
    const newMessage = {
      ...m,
      variants: m.variants || [m.text],
      variantsThinking: m.variantsThinking || [null],
      selectedIndex: 0
    };

    setMessages(prev => [...prev, newMessage]);

    if (newMessage.sessionId && newMessage.mode !== 'archive') {
      const tableName = getTableName(newMessage.mode);
      console.log('[DB] Attempting to save message:', {
        table: tableName,
        id: newMessage.id,
        sessionId: newMessage.sessionId,
        role: newMessage.role
      });

      (async () => {
        try {
          await safeDbInsert(tableName, {
             id: newMessage.id,
             session_id: newMessage.sessionId,
             role: newMessage.role,
             content: newMessage.text,
             variants: newMessage.variants,
             variants_thinking: newMessage.variantsThinking,
             selected_index: 0,
             created_at: new Date(newMessage.timestamp).toISOString()
          });
        } catch (err) {
          console.error('[DB] Failed to save message:', err);
        }
      })();
      
      setSessions(prev => prev.map(s => s.id === newMessage.sessionId ? { ...s, updatedAt: Date.now() } : s));
      supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', newMessage.sessionId).then();
    }
  };

  const updateMessage = (id: string, newText: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    setMessages(prev => prev.map(m => {
      if (m.id !== id) return m;
      const currentIdx = m.selectedIndex || 0;
      const newVariants = [...(m.variants || [])];
      if (newVariants[currentIdx]) newVariants[currentIdx] = newText; 
      else newVariants.push(newText);

      return { ...m, text: newText, variants: newVariants };
    }));
    
    if (msg.sessionId && msg.mode !== 'archive') {
      const tableName = getTableName(msg.mode);
      const currentIdx = msg.selectedIndex || 0;
      const newVariants = [...(msg.variants || [])];
      if (newVariants[currentIdx]) newVariants[currentIdx] = newText;
      
      safeDbUpdate(tableName, id, { 
        content: newText,
        variants: newVariants
      });
    }
  };

  const updateMessageAudioCache = async (id: string, base64Audio: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    const currentIdx = msg.selectedIndex || 0;
    const newVariantsAudio = [...(msg.variantsAudio || [])];
    while (newVariantsAudio.length <= currentIdx) newVariantsAudio.push(null);
    newVariantsAudio[currentIdx] = base64Audio;

    // 1. 塞进前端的口袋
    setMessages(prev => prev.map(m => m.id === id ? { 
      ...m, 
      variantsAudio: newVariantsAudio,
      audioCache: base64Audio 
    } : m));

    // 2. 焊死在 Supabase 的云端抽屉里
    if (msg.mode !== 'archive') {
      const tableName = getTableName(msg.mode);
      // Store as JSON string to support multiple variants
      await safeDbUpdate(tableName, id, { audio_cache: JSON.stringify(newVariantsAudio) });
    }
  };

  const addVariantToMessage = (id: string, newText: string, thinking?: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    const newVariants = [...(msg.variants || [msg.text]), newText];
    const newThinking = [...(msg.variantsThinking || Array(msg.variants?.length || 1).fill(null)), thinking || null];
    const newVariantsAudio = [...(msg.variantsAudio || Array(msg.variants?.length || 1).fill(null)), null]; // Add null for new variant
    const newIndex = newVariants.length - 1;

    setMessages(prev => prev.map(m => m.id === id ? { 
      ...m, 
      text: newText, 
      variants: newVariants,
      variantsThinking: newThinking,
      variantsAudio: newVariantsAudio,
      selectedIndex: newIndex,
      audioCache: undefined, // Clear current audio cache for new variant
      isRegenerating: false 
    } : m));

    if (msg.sessionId && msg.mode !== 'archive') {
      const tableName = getTableName(msg.mode);
      safeDbUpdate(tableName, id, { 
        content: newText,
        variants: newVariants,
        variants_thinking: newThinking,
        audio_cache: JSON.stringify(newVariantsAudio), // Persist updated audio array (with null)
        selected_index: newIndex
      });
    }
  };

  const selectMessageVariant = (id: string, index: number) => {
    const msg = messages.find(m => m.id === id);
    if (!msg || !msg.variants || !msg.variants[index]) return;

    const selectedText = msg.variants[index];
    const selectedAudio = msg.variantsAudio ? msg.variantsAudio[index] : undefined;

    setMessages(prev => prev.map(m => m.id === id ? { 
      ...m, 
      text: selectedText, 
      selectedIndex: index,
      audioCache: selectedAudio || undefined // Switch to audio for this variant
    } : m));

    if (msg.sessionId && msg.mode !== 'archive') {
      const tableName = getTableName(msg.mode);
      safeDbUpdate(tableName, id, { 
        content: selectedText,
        selected_index: index
      });
    }
  };

  const deleteMessage = (id: string) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    if (msg.variants && msg.variants.length > 1) {
      const currentIdx = msg.selectedIndex || 0;
      const newVariants = msg.variants.filter((_, i) => i !== currentIdx);
      const newThinking = (msg.variantsThinking || []).filter((_, i) => i !== currentIdx);

      const newIndex = Math.min(currentIdx, newVariants.length - 1);
      const newText = newVariants[newIndex];

      setMessages(prev => prev.map(m => m.id === id ? {
        ...m,
        variants: newVariants,
        variantsThinking: newThinking,
        selectedIndex: newIndex,
        text: newText
      } : m));

      if (msg.sessionId && msg.mode !== 'archive') {
        const tableName = getTableName(msg.mode);
        safeDbUpdate(tableName, id, {
          content: newText,
          variants: newVariants,
          variants_thinking: newThinking,
          selected_index: newIndex
        });
      }

    } else {
      setMessages(prev => prev.filter(m => m.id !== id));
      if (msg.sessionId && msg.mode !== 'archive') {
        const tableName = getTableName(msg.mode);
        supabase.from(tableName).delete().eq('id', id).then();
      }
    }
  };

  const rewindConversation = async (targetMsgId: string) => {
    const targetMsg = messages.find(m => m.id === targetMsgId);
    if (!targetMsg || !targetMsg.sessionId) return;
    const sessionId = targetMsg.sessionId;
    const targetTime = targetMsg.timestamp;
    const msgsToDelete = messages.filter(m => m.sessionId === sessionId && m.timestamp > targetTime);
    const idsToDelete = msgsToDelete.map(m => m.id);
    if (idsToDelete.length === 0) return;
    setMessages(prev => prev.filter(m => !idsToDelete.includes(m.id)));
    const tableName = getTableName(targetMsg.mode);
    if (idsToDelete.length > 0) {
        await supabase.from(tableName).delete().in('id', idsToDelete);
    }
  };

  const forkSession = async (targetMsgId: string) => {
      const targetMsg = messages.find(m => m.id === targetMsgId);
      if (!targetMsg || !targetMsg.sessionId) return;
      
      const originalSession = sessions.find(s => s.id === targetMsg.sessionId);
      if (!originalSession) return;

      const newSessionId = await createSession(originalSession.mode);
      
      const msgsToCopy = messages
        .filter(m => m.sessionId === originalSession.id && m.timestamp <= targetMsg.timestamp)
        .sort((a,b) => a.timestamp - b.timestamp);
      
      const tableName = getTableName(originalSession.mode);
      const newMessagesPayload = msgsToCopy.map(m => {
          const newMsgId = crypto.randomUUID(); 
          const payload = {
            id: newMsgId,
            session_id: newSessionId,
            role: m.role === 'Luna' ? 'user' : 'model',
            content: m.text,
            variants: m.variants,
            variants_thinking: m.variantsThinking,
            selected_index: m.selectedIndex,
            created_at: new Date(m.timestamp).toISOString()
          };
          return { msg: { ...m, id: newMsgId, sessionId: newSessionId }, payload };
      });

      setMessages(prev => [...prev, ...newMessagesPayload.map(p => p.msg)]);
      
      const dbPayloads = newMessagesPayload.map(p => p.payload);
      const { error } = await supabase.from(tableName).insert(dbPayloads);
      if (error) {
         if (error.code === '42703' || error.message.toLowerCase().includes('column')) {
              const fallbackPayloads = dbPayloads.map(({variants_thinking, ...rest}) => rest);
              await supabase.from(tableName).insert(fallbackPayloads);
         }
      }

      setActiveSessionId(newSessionId);
      updateSessionTitle(newSessionId, `${originalSession.title} (Branch)`);
  };

  const setRegenerating = (id: string, isRegenerating: boolean) => {
     setMessages(prev => prev.map(m => m.id === id ? { ...m, isRegenerating } : m));
  };

  const toggleFavorite = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isFavorite: !m.isFavorite } : m));
  };

  // --- NEW MEMORY ACTIONS ---

  const addCoreMemory = async (title: string, content: string, category: CoreMemory['category'] = 'general', tags: string[] = []) => {
    const tempId = crypto.randomUUID();
    const newMemory: CoreMemory = {
      id: tempId,
      title,
      content,
      category,
      tags,
      isActive: true,
      enabled: true,
      createdAt: Date.now()
    };
    setCoreMemories(prev => [newMemory, ...prev]);

    // Store in localStorage as backup
    const memKey = `wade_core_memories`;
    const current = JSON.parse(localStorage.getItem(memKey) || '[]');
    localStorage.setItem(memKey, JSON.stringify([newMemory, ...current]));

    // Sync to Supabase
    try {
      await supabase.from('memories_core').insert({
        id: tempId,
        title,
        content,
        category,
        tags,
        is_active: true,
        created_at: new Date().toISOString()
      });
    } catch (e) {
      console.error("Failed to add core memory to Supabase", e);
    }
  };

  const updateCoreMemory = async (id: string, title: string, content: string, tags?: string[]) => {
    setCoreMemories(prev => prev.map(m => m.id === id ? { ...m, title, content, tags: tags || m.tags } : m));

    const memKey = `wade_core_memories`;
    const current: CoreMemory[] = JSON.parse(localStorage.getItem(memKey) || '[]');
    const updated = current.map(m => m.id === id ? { ...m, title, content, tags: tags || m.tags } : m);
    localStorage.setItem(memKey, JSON.stringify(updated));

    // Sync to Supabase
    try {
      const payload: any = { title, content };
      if (tags) payload.tags = tags;
      
      await supabase.from('memories_core').update(payload).eq('id', id);
    } catch (e) {
      console.error("Failed to update core memory in Supabase", e);
    }
  };

  const toggleCoreMemoryEnabled = async (id: string) => {
    setCoreMemories(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));

    const memKey = `wade_core_memories`;
    const current: CoreMemory[] = JSON.parse(localStorage.getItem(memKey) || '[]');
    const updated = current.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m);
    localStorage.setItem(memKey, JSON.stringify(updated));
    
    // Note: 'enabled' is local-only for now unless we add a column for it. 
    // If 'is_active' maps to enabled, we should update it.
    // Assuming 'is_active' is the DB equivalent:
    try {
       const mem = coreMemories.find(m => m.id === id);
       if (mem) {
         await supabase.from('memories_core').update({ is_active: !mem.enabled }).eq('id', id);
       }
    } catch (e) {
       console.error("Failed to toggle memory in Supabase", e);
    }
  };

  const deleteCoreMemory = async (id: string) => {
    setCoreMemories(prev => prev.filter(m => m.id !== id));

    const memKey = `wade_core_memories`;
    const current: CoreMemory[] = JSON.parse(localStorage.getItem(memKey) || '[]');
    const filtered = current.filter(m => m.id !== id);
    localStorage.setItem(memKey, JSON.stringify(filtered));

    // Sync to Supabase
    try {
      await supabase.from('memories_core').delete().eq('id', id);
    } catch (e) {
      console.error("Failed to delete core memory from Supabase", e);
    }
  };

  const importArchive = async (title: string, fileContent: string) => {
    console.log("Starting Archive Import:", title);
    
    // 1. Create Archive Entry in Supabase (Parent)
    const archiveId = crypto.randomUUID();
    const newArchive: ChatArchive = {
      id: archiveId,
      title,
      importedAt: Date.now()
    };
    
    // Optimistic Update
    setChatArchives(prev => [newArchive, ...prev]);

    const { error: archError } = await supabase.from('chat_archives').insert({
      id: archiveId,
      title: title
    });
    if (archError) {
      console.error("Failed to create archive parent", archError);
      throw archError;
    }

    // 2. NEW ROBUST REGEX (Thanks to your suggestion!)
    // Matches 【tag】 [date] content ... until next tag or end of string.
    // [\s\S]+? is non-greedy match for content including newlines.
    const regex = /【(user|assistant)】\s*\[([^\]]+)\]\s*([\s\S]+?)(?=【(?:user|assistant)】|$)/gi;
    
    const messagesToInsert = [];
    const normalizedContent = fileContent.replace(/\r\n/g, '\n'); // Normalize line endings
    
    // matchAll returns an iterator of matches
    const matches = [...normalizedContent.matchAll(regex)];
    
    console.log(`Regex found ${matches.length} messages.`);

    for (const match of matches) {
        const roleStr = match[1].toLowerCase(); // Group 1: Role
        const dateStr = match[2];               // Group 2: Date
        const content = match[3].trim();        // Group 3: Content (Multiline)

        const role = roleStr === 'user' ? 'user' : 'assistant';
        
        // Date parsing safety
        let timestamp = new Date(dateStr).getTime();
        if (isNaN(timestamp)) {
             // Fallback: Try replacing slashes with dashes or vice versa if standard parse fails
             // or handle common Chinese format issues
             timestamp = Date.now(); // worst case fallback to prevent crash, but maybe mark as 'unknown date'
             console.warn("Invalid date parsed, defaulting to now:", dateStr);
        }
        
        if (content) {
            messagesToInsert.push({
                id: crypto.randomUUID(), // Explicitly generate UUID for frontend consistency
                archive_id: archiveId,
                role: role,
                content: content,
                msg_timestamp: new Date(timestamp).toISOString()
            });
        }
    }

    if (messagesToInsert.length === 0) {
        console.warn("No messages parsed! Check regex or file format.");
        alert("Warning: No messages found in file. Please check if the format is: 【user】 [Date] Content");
        return 0;
    }

    // 3. Batch Insert (Supabase has limits on payload size)
    const BATCH_SIZE = 50;
    for (let i = 0; i < messagesToInsert.length; i += BATCH_SIZE) {
        const batch = messagesToInsert.slice(i, i + BATCH_SIZE);
        // We exclude 'id' from insert if DB is auto-increment, but we use UUID so we send it.
        // We map to DB column names.
        const dbPayload = batch.map(m => ({
            id: m.id,
            archive_id: m.archive_id, 
            role: m.role,
            content: m.content,
            msg_timestamp: m.msg_timestamp
        }));

        const { error: msgError } = await supabase.from('archive_messages').insert(dbPayload);
        if (msgError) {
            console.error("Batch Insert Error:", msgError);
            throw msgError;
        }
    }
    
    return messagesToInsert.length; 
  };

  const loadArchiveMessages = async (archiveId: string): Promise<ArchiveMessage[]> => {
    const { data, error } = await supabase.from('archive_messages')
      .select('*')
      .eq('archive_id', archiveId)
      .order('msg_timestamp', { ascending: true });
      
    if (error) throw error;
    
    return (data || []).map(m => ({
      id: m.id,
      archiveId: m.archive_id,
      role: m.role,
      content: m.content,
      timestamp: new Date(m.msg_timestamp).getTime(),
      isFavorite: m.is_favorite // Map DB column
    }));
  };

  const updateArchiveMessage = async (id: string, newContent: string) => {
      const { error } = await supabase.from('archive_messages').update({ content: newContent }).eq('id', id);
      if (error) {
          console.error("Error updating archive message:", error);
      }
  };

  const updateArchiveTitle = async (id: string, title: string) => {
    setChatArchives(prev => prev.map(a => a.id === id ? { ...a, title } : a));
    await supabase.from('chat_archives').update({ title }).eq('id', id);
  };

  const deleteArchiveMessage = async (id: string, archiveId: string) => {
      await supabase.from('archive_messages').delete().eq('id', id);
  };

  const toggleArchiveFavorite = async (id: string, archiveId: string) => {
      // 1. Get current state
      const { data, error } = await supabase.from('archive_messages').select('is_favorite').eq('id', id).single();
      if (error) {
          console.error("Error toggling favorite:", error);
          return;
      }
      // 2. Toggle
      const newValue = !data.is_favorite;
      await supabase.from('archive_messages').update({ is_favorite: newValue }).eq('id', id);
  };

  const deleteArchive = async (id: string) => {
    setChatArchives(prev => prev.filter(a => a.id !== id));
    await supabase.from('chat_archives').delete().eq('id', id);
  };

  const addPost = async (p: SocialPost) => {
    setSocialPosts(prev => [p, ...prev]);
    
    const payload = {
      id: p.id,
      author: p.author,
      content: p.content,
      images: p.images, // Save array
      image: p.images && p.images.length > 0 ? p.images[0] : null, // Fallback for old clients
      created_at: new Date(p.timestamp).toISOString(),
      likes: p.likes,
      comments: p.comments
    };

    await safeDbInsert('social_posts', payload);
  };

  const updatePost = async (p: SocialPost) => {
    setSocialPosts(prev => prev.map(post => post.id === p.id ? p : post));
    
    const payload = {
      content: p.content,
      images: p.images,
      likes: p.likes,
      comments: p.comments
    };

    const { error } = await supabase.from('social_posts').update(payload).eq('id', p.id);
    if (error) {
        console.error("Failed to update post:", error);
    }
  };

  const deletePost = async (id: string) => {
    setSocialPosts(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('social_posts').delete().eq('id', id);
    if (error) {
        console.error("Failed to delete post:", error);
    }
  };

  const addMemo = (m: Memo) => setMemos(prev => [m, ...prev]);
  
  const addCapsule = async (c: TimeCapsuleItem) => {
    setCapsules(prev => [...prev, c]);
    try {
      await supabase.from('time_capsules').insert({
        id: c.id,
        title: c.title,
        content: c.content,
        created_at: c.createdAt,
        unlock_date: c.unlockDate,
        is_locked: c.isLocked
      });
    } catch (e) {
      console.error("Failed to save time capsule to Supabase", e);
    }
  };

  const updateCapsule = async (id: string, updates: Partial<TimeCapsuleItem>) => {
    setCapsules(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.unlockDate !== undefined) {
        dbUpdates.unlock_date = updates.unlockDate;
        dbUpdates.is_locked = updates.unlockDate > Date.now();
      }
      if (updates.audioCache !== undefined) dbUpdates.audio_cache = updates.audioCache;
      await supabase.from('time_capsules').update(dbUpdates).eq('id', id);
    } catch (e) {
      console.error("Failed to update time capsule in Supabase", e);
    }
  };

  // --- RECOMMENDATIONS ---
  const deleteCapsule = async (id: string) => {
    setCapsules(prev => prev.filter(c => c.id !== id));
    try {
      await supabase.from('time_capsules').delete().eq('id', id);
    } catch (e) {
      console.error("Failed to delete time capsule from Supabase", e);
    }
  };

  const addRecommendation = async (r: Omit<Recommendation, 'id'>) => {
    const newRec: Recommendation = { ...r, id: Date.now().toString() };
    setRecommendations(prev => [newRec, ...prev]);
    try {
      const { data, error } = await supabase.from('recommendations').insert({
        id: newRec.id,
        type: newRec.type,
        title: newRec.title,
        creator: newRec.creator,
        release_date: newRec.releaseDate,
        synopsis: newRec.synopsis,
        comment: newRec.comment,
        cover_url: newRec.coverUrl,
        luna_review: newRec.lunaReview,
        luna_rating: newRec.lunaRating,
        wade_reply: newRec.wadeReply
      });
      if (error) {
        console.error("Failed to insert recommendation:", error);
        alert(`Failed to save recommendation: ${error.message}`);
      } else {
        console.log("Recommendation saved successfully:", data);
      }
    } catch (e) {
      console.error("Failed to sync recommendation to Supabase", e);
    }
  };

  const updateRecommendation = async (id: string, r: Partial<Recommendation>) => {
    setRecommendations(prev => {
      const updated = prev.map(rec => rec.id === id ? { ...rec, ...r } : rec);

      // Sync to Supabase
      const fullRec = updated.find(rec => rec.id === id);
      if (fullRec) {
        supabase.from('recommendations').upsert({
          id: fullRec.id,
          type: fullRec.type,
          title: fullRec.title,
          creator: fullRec.creator,
          release_date: fullRec.releaseDate,
          synopsis: fullRec.synopsis,
          comment: fullRec.comment,
          cover_url: fullRec.coverUrl,
          luna_review: fullRec.lunaReview,
          luna_rating: fullRec.lunaRating,
          wade_reply: fullRec.wadeReply
        }).then(({ data, error }) => {
          if (error) {
            console.error("Failed to sync recommendation update to Supabase", error);
            alert(`Failed to update recommendation: ${error.message}`);
          } else {
            console.log("Recommendation updated successfully:", data);
          }
        });
      }
      return updated;
    });
  };

  const deleteRecommendation = async (id: string) => {
    setRecommendations(prev => prev.filter(rec => rec.id !== id));
    try {
      await supabase.from('recommendations').delete().eq('id', id);
    } catch (e) {
      console.error("Failed to delete recommendation from Supabase", e);
    }
  };

  return (
    <StoreContext.Provider value={{
      currentTab, setTab,
      settings, updateSettings,
      llmPresets, addLlmPreset, updateLlmPreset, deleteLlmPreset,
      ttsPresets, addTtsPreset, updateTtsPreset, deleteTtsPreset,
      sessions, createSession, updateSession, updateSessionTitle, deleteSession, toggleSessionPin, activeSessionId, setActiveSessionId,
      messages, addMessage, updateMessage, deleteMessage, toggleFavorite, updateMessageAudioCache,
      addVariantToMessage, selectMessageVariant,
      setRegenerating,
      rewindConversation, 
      forkSession, 
      socialPosts, addPost, updatePost, deletePost,
      memos, addMemo,
      capsules, addCapsule, updateCapsule, deleteCapsule,
      recommendations, addRecommendation, updateRecommendation, deleteRecommendation,
      
      // Memory
      coreMemories, addCoreMemory, updateCoreMemory, deleteCoreMemory, toggleCoreMemoryEnabled,
      chatArchives, importArchive, loadArchiveMessages, updateArchiveTitle, updateArchiveMessage, deleteArchive, deleteArchiveMessage, toggleArchiveFavorite,

      activeMode, setMode,
      isNavHidden, setNavHidden,
      syncError
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
