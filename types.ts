

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
  image?: string;
  timestamp: number;
  comments: SocialComment[];
  likes: number;
}

export interface SocialComment {
  id: string;
  author: 'User' | 'Wade';
  text: string;
}

export interface TimeCapsuleItem {
  id: string;
  content: string;
  createdWidth: number;
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
  comment: string; // Wade's comment
  coverUrl?: string;
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
  name: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  apiPath: string;
}

export interface TtsPreset {
  id: string;
  name: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  voiceId: string;
  emotion: string;
  speed: number;
}

export interface AppSettings {
  // Active Preset IDs
  activeLlmId?: string;
  activeTtsId?: string;

  themeColor: string;
  fontSize: 'small' | 'medium' | 'large';
  
  // Wade's Side
  wadePersonality: string; // Core System instruction
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
  updateSessionTitle: (id: string, title: string) => void;
  deleteSession: (id: string) => void;
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;

  messages: Message[];
  addMessage: (m: Message) => void;
  updateMessage: (id: string, newText: string) => void; // Standard edit
  
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
  memos: Memo[];
  addMemo: (m: Memo) => void;
  capsules: TimeCapsuleItem[];
  addCapsule: (c: TimeCapsuleItem) => void;
  recommendations: Recommendation[];
  
  // --- NEW MEMORY ACTIONS ---
  coreMemories: CoreMemory[];
  addCoreMemory: (title: string, content: string, category?: CoreMemory['category']) => Promise<void>;
  deleteCoreMemory: (id: string) => Promise<void>;
  chatArchives: ChatArchive[];
  importArchive: (title: string, fileContent: string) => Promise<number>;
  loadArchiveMessages: (archiveId: string) => Promise<ArchiveMessage[]>;
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