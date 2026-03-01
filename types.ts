

export type ChatMode = 'deep' | 'sms' | 'roleplay' | 'archive'; // Added 'archive' for UI routing

export interface UserPersona {
  id: string;
  name: string;
  description: string; // The "Luna" profile or Roleplay profile
  avatar?: string;
}

export interface ChatSession {
  id: string;
  mode: ChatMode;
  title: string;
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
  customLlmId?: string;
  customPrompt?: string;
}

export interface Message {
  id: string;
  sessionId?: string; // Link to specific chat session
  role: 'Luna' | 'Wade'; // Changed from 'user' | 'model'
  text: string; // The currently displayed text
  timestamp: number;
  audioData?: string; // Base64 audio if TTS was generated
  isFavorite?: boolean;
  mode: ChatMode;
  image?: string; // For image uploads
  audioCache?: string; // 参谋加的：装录音带的抽屉
  
  // New Version Control Fields
  variants?: string[]; // Array of all generated versions
  // NEW: Store "Thinking Process" for each variant
  variantsThinking?: (string | null)[]; 
  selectedIndex?: number; // Index of the currently shown version
  
  // UI State (Transient)
  isRegenerating?: boolean; 
}

export interface SocialPost {
  id: string;
  author: 'User' | 'Wade';
  content: string;
  images?: string[]; // Changed from image?: string to support multiple
  timestamp: number;
  comments: SocialComment[];
  likes: number;
  isBookmarked?: boolean;
}

export interface SocialComment {
  id: string;
  author: 'User' | 'Wade';
  text: string;
  replyToId?: string;
}

export interface TimeCapsuleItem {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  unlockDate: number; // Timestamp
  isLocked: boolean;
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  type: 'promise' | 'code' | 'note';
}

export interface Recommendation {
  id: string;
  type: 'book' | 'movie' | 'music';
  title: string;
  creator?: string; // Author, Director, or Artist
  releaseDate?: string;
  synopsis?: string;
  comment: string; // Wade's comment
  coverUrl?: string;
  lunaReview?: string;
  lunaRating?: number; // 1-5
  wadeReply?: string;
}

// --- NEW MEMORY & ARCHIVE TYPES ---

export interface CoreMemory {
  id: string;
  title?: string; // NEW: Title for the memory
  content: string;
  category: 'fact' | 'promise' | 'preference' | 'general';
  isActive: boolean;
  createdAt: number;
}

export interface ChatArchive {
  id: string;
  title: string;
  importedAt: number;
}

export interface ArchiveMessage {
  id: string;
  archiveId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isFavorite?: boolean;
}

// --- NEW API PRESET TYPES ---

export interface LlmPreset {
  id: string;
  provider: string; // 'Gemini' | 'Claude' | 'OpenAI' | 'DeepSeek' | 'OpenRouter' | 'Custom'
  name: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  apiPath: string;
  temperature?: number; // 0.0 - 2.0
  topP?: number; // 0.0 - 1.0
  topK?: number;
  frequencyPenalty?: number; // -2.0 to 2.0
  presencePenalty?: number; // -2.0 to 2.0
}

export interface TtsPreset {
  id: string;
  name: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  voiceId: string;
  emotion?: string;
  speed: number;
  vol?: number; // Volume (0-10)
  pitch?: number; // Pitch (-12 to 12)
  sampleRate?: number; // 8000, 16000, 22050, 24000, 32000, 44100
  bitrate?: number; // 32000, 64000, 128000, 256000
  format?: string; // mp3, pcm, flac, wav
  channel?: number; // 1 or 2
}

export interface AppSettings {
  // Active Preset IDs
  activeLlmId?: string;
  activeTtsId?: string;

  themeColor: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // Wade's Side
  wadePersonality: string; // Core System instruction
  wadeDiaryPersona: string; // NEW: Persona for non-dialogue modes (diary comments)
  wadeAvatar: string;
  exampleDialogue: string; // Few-shot examples
  
  // Luna's Side
  lunaInfo: string; // Context about the user
  lunaAvatar: string;

  ttsEnabled: boolean;
  autoReplyInterval: number;
}

// Global State Context Interface
export interface GlobalState {
  currentTab: string;
  setTab: (tab: string) => void;
  
  settings: AppSettings;
  updateSettings: (s: Partial<AppSettings>) => void;
  
  // Preset Management
  llmPresets: LlmPreset[];
  addLlmPreset: (p: Omit<LlmPreset, 'id'>) => Promise<void>;
  updateLlmPreset: (id: string, p: Partial<LlmPreset>) => Promise<void>;
  deleteLlmPreset: (id: string) => Promise<void>;
  
  ttsPresets: TtsPreset[];
  addTtsPreset: (p: Omit<TtsPreset, 'id'>) => Promise<void>;
  updateTtsPreset: (id: string, p: Partial<TtsPreset>) => Promise<void>;
  deleteTtsPreset: (id: string) => Promise<void>;

  // Chat & Session Management
  sessions: ChatSession[];
  createSession: (mode: ChatMode) => Promise<string>; // Returns new session ID
  updateSession: (id: string, updates: Partial<ChatSession>) => void;
  updateSessionTitle: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  toggleSessionPin: (id: string) => void;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;

  messages: Message[];
  addMessage: (m: Message) => void;
  updateMessage: (id: string, newText: string) => void; // Standard edit
  updateMessageAudioCache: (id: string, base64Audio: string) => void;
  
  // Updated for Thinking Process
  addVariantToMessage: (id: string, newText: string, thinking?: string) => void; 
  selectMessageVariant: (id: string, index: number) => void; 
  deleteMessage: (id: string) => void;
  
  // New: Set Regenerating State
  setRegenerating: (id: string, isRegenerating: boolean) => void;
  // NEW: Rewind/Backtrack
  rewindConversation: (targetMsgId: string) => Promise<void>;
  // NEW: Fork/Branch
  forkSession: (targetMsgId: string) => Promise<void>;

  toggleFavorite: (id: string) => void;
  
  socialPosts: SocialPost[];
  addPost: (p: SocialPost) => void;
  updatePost: (p: SocialPost) => void;
  deletePost: (id: string) => Promise<void>;
  memos: Memo[];
  addMemo: (m: Memo) => void;
  capsules: TimeCapsuleItem[];
  addCapsule: (c: TimeCapsuleItem) => void;
  recommendations: Recommendation[];
  addRecommendation: (r: Omit<Recommendation, 'id'>) => Promise<void>;
  updateRecommendation: (id: string, r: Partial<Recommendation>) => Promise<void>;
  deleteRecommendation: (id: string) => Promise<void>;
  
  // --- NEW MEMORY ACTIONS ---
  coreMemories: CoreMemory[];
  addCoreMemory: (title: string, content: string, category?: CoreMemory['category']) => Promise<void>;
  updateCoreMemory: (id: string, title: string, content: string) => Promise<void>;
  deleteCoreMemory: (id: string) => Promise<void>;
  chatArchives: ChatArchive[];
  importArchive: (title: string, fileContent: string) => Promise<number>;
  loadArchiveMessages: (archiveId: string) => Promise<ArchiveMessage[]>;
  updateArchiveMessage: (id: string, newContent: string) => Promise<void>;
  deleteArchive: (id: string) => Promise<void>;
  deleteArchiveMessage: (id: string, archiveId: string) => Promise<void>;
  toggleArchiveFavorite: (id: string, archiveId: string) => Promise<void>;

  activeMode: ChatMode;
  setMode: (m: ChatMode) => void;

  // UI Control
  isNavHidden: boolean;
  setNavHidden: (hidden: boolean) => void;

  // Debugging
  syncError: string | null;
}
