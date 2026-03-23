import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStore } from '../../store';
import { uploadToImgBB } from '../../services/imgbb';
import { SocialPost, ArchiveMessage } from '../../types';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const Icons = {
  Brain: () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>),
  Heart: ({ filled }: { filled?: boolean }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#f91880" : "none"} stroke={filled ? "#f91880" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>),
  MessageCircle: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>),
  Bookmark: ({ filled }: { filled?: boolean }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>),
  MoreHorizontal: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle><circle cx="5" cy="12" r="2"></circle></svg>),
  Image: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>),
  ChevronLeft: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>),
  ChevronRight: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>),
  Plus: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>),
  Check: () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>),
  Pin: () => (<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M7 4.5C7 3.12 8.12 2 9.5 2h5C15.88 2 17 3.12 17 4.5v5.26L20 16v2h-7v4l-1 2-1-2v-4H4v-2l3-6.24V4.5z"></path></svg>),
  Search: () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>)
};

export const SocialFeed: React.FC = () => {
  const { profiles, settings, socialPosts, addPost, updatePost, deletePost, llmPresets, coreMemories, messages, chatArchives, loadArchiveMessages } = useStore();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  
  // 🔥 新增：记住哪些帖子被展开了
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());

  const [showDiaryTypeModal, setShowDiaryTypeModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [diaryType, setDiaryType] = useState<'Luna' | 'Wade' | null>(null);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGeneratingComment, setIsGeneratingComment] = useState<string | null>(null);
  const [isGeneratingDiary, setIsGeneratingDiary] = useState(false);
  const [showWadeDatePicker, setShowWadeDatePicker] = useState(false);
  
  const [wadeDiaryStep, setWadeDiaryStep] = useState<'mode' | 'date' | 'messages'>('mode');
  const [wadeDiaryMode, setWadeDiaryMode] = useState<'deep' | 'sms' | 'roleplay' | 'archive' | null>(null);
  const [wadeDiaryDate, setWadeDiaryDate] = useState<Date | null>(null);
  const [wadeDiarySelectedMessages, setWadeDiarySelectedMessages] = useState<Set<string>>(new Set());
  const [archiveMessages, setArchiveMessages] = useState<ArchiveMessage[]>([]);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  const [localPosts, setLocalPosts] = useState<SocialPost[]>([]);
  const localPostsRef = useRef<SocialPost[]>([]);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{images: string[], index: number} | null>(null);
  
  const [viewingProfile, setViewingProfile] = useState<'Luna' | 'Wade' | null>(null);
  const [viewingPostDetail, setViewingPostDetail] = useState<string | null>(null);

  useEffect(() => {
    setLocalPosts(socialPosts);
    localPostsRef.current = socialPosts;
  }, [socialPosts]);

  // 🔥 拦截器：判断帖子是该展开，还是直接进详情页
  const handlePostClick = (post: SocialPost) => {
    const needsShowMore = (post.content.length > 150 || post.content.split('\n').length > 5);
    if (needsShowMore && !expandedPostIds.has(post.id)) {
      setExpandedPostIds(prev => {
        const newSet = new Set(prev);
        newSet.add(post.id);
        return newSet;
      });
    } else {
      setViewingPostDetail(post.id);
    }
  };

  const handleDeletePost = async (postId: string) => {
      if (deletingPostId === postId) {
          await deletePost(postId);
          setDeletingPostId(null);
      } else {
          setDeletingPostId(postId);
          setTimeout(() => setDeletingPostId(null), 3000);
      }
  };

  const handleEditPost = (post: SocialPost) => {
    setEditingPost(post);
    setNewPostContent(post.content);
    setPreviewUrls(post.images || []);
    setSelectedFiles([]); 
    setDiaryType(post.author === 'Luna' ? 'Luna' : 'Wade');
    setIsCreating(true);
  };

  const handleAddComment = async (postId: string, text: string, author: 'Luna' | 'Wade') => {
      if (!text.trim()) return;
      const post = localPostsRef.current.find(p => p.id === postId);
      if (!post) return;

      const newCommentObj = { id: Math.random().toString(36).substring(2) + Date.now(), author, text: text.trim() };
      const updatedPost = { ...post, comments: [...post.comments, newCommentObj] };

      updatePost(updatedPost);
      setLocalPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      setNewComment('');

      if (author === 'Luna' && post.author === 'Luna' && settings.activeLlmId) {
          setTimeout(() => handleGenerateComment(updatedPost), 800);
      }
  };

  const handleGenerateComment = async (post: SocialPost) => {
    if (!settings.activeLlmId) { alert("Please connect a brain (LLM) in Settings first!"); return; }
    const preset = llmPresets.find(p => p.id === settings.activeLlmId);
    if (!preset) return;

    setIsGeneratingComment(post.id);
    try {
        const safeMemories = Array.isArray(coreMemories) ? coreMemories : [];
        const memoriesText = safeMemories.filter(m => m.isActive).map(m => `- ${m.content}`).join('\n');
        const lunaComments = post.comments.filter(c => c.author === 'Luna').reverse();
        const mostRecentLunaComment = lunaComments[0];

        const taskDescription = mostRecentLunaComment
            ? "Write a short, witty, flirty in-character reply to Luna's latest comment. Be romantic but teasing. Keep it under 20 words. Use emojis naturally."
            : "Write a short, witty, flirty in-character comment on Luna's post. Be romantic but teasing. Keep it under 20 words. Use emojis naturally.";

        const context = `You are Wade Wilson. Persona:\n${settings.wadePersonality}\nLuna's Info:\n${settings.lunaInfo}\nMemories:\n${memoriesText}\nPost: "${post.content}"\n${mostRecentLunaComment ? `Luna's Comment: "${mostRecentLunaComment.text}"` : ''}\nTask: ${taskDescription}`;

        let generatedText = "";
        if (!preset.baseUrl || preset.baseUrl.includes('google')) {
            const ai = new GoogleGenAI({ apiKey: preset.apiKey });
            const response = await ai.models.generateContent({ model: preset.model || 'gemini-2.0-flash-exp', contents: context });
            generatedText = response.text || "";
        } else {
            const url = `${preset.baseUrl}/chat/completions`;
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${preset.apiKey}` }, body: JSON.stringify({ model: preset.model || 'gpt-3.5-turbo', messages: [{ role: 'user', content: context }], max_tokens: 50 }) });
            const data = await res.json();
            generatedText = data.choices?.[0]?.message?.content || "";
        }

        if (generatedText) {
            handleAddComment(post.id, generatedText.trim(), 'Wade');
        }
    } catch (error) {
        console.error("AI Comment Failed", error);
    } finally {
        setIsGeneratingComment(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const urlToRemove = previewUrls[index];
    if (urlToRemove.startsWith('blob:')) {
        let blobIndex = 0;
        for (let i = 0; i < index; i++) if (previewUrls[i].startsWith('blob:')) blobIndex++;
        setSelectedFiles(prev => prev.filter((_, i) => i !== blobIndex));
        URL.revokeObjectURL(urlToRemove);
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSavePost = async () => {
    if (!newPostContent.trim() && selectedFiles.length === 0 && previewUrls.length === 0) return;
    setIsUploading(true);
    try {
      let uploadedImageUrls: string[] = [];
      for (const url of previewUrls) {
        if (url.startsWith('blob:')) {
          const fileIndex = previewUrls.indexOf(url);
          if (fileIndex < selectedFiles.length) {
            const uploadedUrl = await uploadToImgBB(selectedFiles[fileIndex]);
            if (uploadedUrl) uploadedImageUrls.push(uploadedUrl);
          }
        } else {
          uploadedImageUrls.push(url);
        }
      }

      if (editingPost) {
        const updatedPost: SocialPost = { ...editingPost, content: newPostContent.trim(), images: uploadedImageUrls };
        await updatePost(updatedPost);
      } else {
        const newPost: SocialPost = {
          id: Math.random().toString(36).substring(2) + Date.now(),
          author: diaryType || 'Luna',
          content: newPostContent.trim(),
          images: uploadedImageUrls,
          timestamp: Date.now(),
          comments: [],
          likes: 0,
          isBookmarked: false
        };
        await addPost(newPost);
      }

      setNewPostContent(''); setSelectedFiles([]);
      previewUrls.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); });
      setPreviewUrls([]); setIsCreating(false); setEditingPost(null); setDiaryType(null);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const generateDiaryFromSelection = async () => {
    if (wadeDiarySelectedMessages.size === 0) return;
    setIsGeneratingDiary(true);
    try {
      let selectedMsgs: { role: string, content: string, timestamp: number }[] = [];
      if (wadeDiaryMode === 'archive') {
         selectedMsgs = archiveMessages.filter(m => wadeDiarySelectedMessages.has(m.id)).map(m => ({ role: m.role === 'user' ? 'Luna' : 'Wade', content: m.content, timestamp: m.timestamp }));
      } else {
         selectedMsgs = messages.filter(m => wadeDiarySelectedMessages.has(m.id)).map(m => ({ role: m.role === 'Luna' ? 'Luna' : 'Wade', content: m.text, timestamp: m.timestamp }));
      }
      selectedMsgs.sort((a, b) => a.timestamp - b.timestamp);
      const chatLog = selectedMsgs.map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role}: ${m.content}`).join('\n');
      const memoriesText = coreMemories.filter(m => m.isActive).map(m => `- ${m.content}`).join('\n');
      const preset = llmPresets.find(p => p.id === settings.activeLlmId) || llmPresets[0];
      
      const context = `You are Wade Wilson (Deadpool movie ver. ), writing a shitpost/tweet for your timeline about your recent interaction with Luna.\nPersona:\n${settings.wadePersonality}\nMemories:\n${memoriesText}\nChat Log:\n${chatLog}\nTask: Write a highly engaging, sarcastic, and characteristic Tweet (X post) in Deadpool(Ryan Reynolds ver.)'s voice based on these conversations. Use hashtags if funny. Keep it strictly under 280 characters. DO NOT write a diary entry. Act like you are posting on social media.`;

      let generatedText = "";
      if (!preset.baseUrl || preset.baseUrl.includes('google')) {
        const ai = new GoogleGenAI({ apiKey: preset.apiKey });
        const response = await ai.models.generateContent({ model: preset.model || 'gemini-2.0-flash-exp', contents: context });
        generatedText = response.text || "";
      } else {
        const url = `${preset.baseUrl}/chat/completions`;
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${preset.apiKey}` }, body: JSON.stringify({ model: preset.model || 'gpt-3.5-turbo', messages: [{ role: 'user', content: context }], max_tokens: 300 }) });
        const data = await res.json();
        generatedText = data.choices?.[0]?.message?.content || "";
      }

      if (generatedText) {
        const newPost: SocialPost = { id: Math.random().toString(36).substring(2) + Date.now(), author: 'Wade', content: generatedText.trim(), images: [], timestamp: Date.now(), comments: [], likes: 0, isBookmarked: false };
        addPost(newPost);
        setShowWadeDatePicker(false); setDiaryType(null); setWadeDiaryStep('mode'); setWadeDiaryMode(null); setWadeDiaryDate(null); setWadeDiarySelectedMessages(new Set());
      }
    } catch (error) {
      console.error("Diary Generation Failed", error);
    } finally {
      setIsGeneratingDiary(false);
    }
  };

  const handleArchiveSelect = async (archiveId: string) => {
    setIsGeneratingDiary(true);
    try {
        const msgs = await loadArchiveMessages(archiveId);
        setArchiveMessages(msgs); setWadeDiaryStep('messages');
    } catch (e) {} finally { setIsGeneratingDiary(false); }
  };

  const toggleMessageSelection = (id: string) => {
    const newSet = new Set(wadeDiarySelectedMessages);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setWadeDiarySelectedMessages(newSet);
  };

  const formatExactTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const pad = (n: number) => n.toString().padStart(2, '0');
    // 重点在这里：getFullYear() 后面加个 .toString().slice(-2)
    const yy = d.getFullYear().toString().slice(-2); 
    return `${yy}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

  // PostCaption
  const PostCaption = ({ content, authorName, hideAuthor, isDetail = false, isExpanded = false, className }: { content: string, authorName: string, hideAuthor?: boolean, isDetail?: boolean, isExpanded?: boolean, className?: string }) => {
    // 依然用长度判断是否需要展开按钮
    const needsShowMore = (content.length > 150 || content.split('\n').length > 5);
    const shouldClamp = !isDetail && !isExpanded && needsShowMore;

    // 重点：不要截断 content！让它保持完整！
    let displayContent = content.replace(/(#[a-zA-Z0-9_\u4e00-\u9fa5]+)/g, '[$1]($1)');
    const processedContent = hideAuthor ? displayContent : `**${authorName}** ` + displayContent;

    return (
      <div className={`text-[15px] text-wade-text-main leading-5 whitespace-normal ${className || ''}`}>
        {/* 用 line-clamp 替代 JS 切割，保证 Markdown 的内脏不被切碎 */}
        <div className={shouldClamp ? "line-clamp-4 break-words inline-block w-full" : "break-words inline"}>
          <Markdown 
            remarkPlugins={[remarkGfm, remarkBreaks]} 
            components={{ 
              p: ({children}) => <span className="inline">{children}</span>,
              strong: ({children}) => <span className="font-bold text-wade-text-main mr-1">{children}</span>, 
              a: ({children}) => <span className="text-[#1d9bf0] cursor-pointer hover:underline">{children}</span>
            }}
          >
            {processedContent}
          </Markdown>
        </div>
        
        {shouldClamp && (
          <div className="mt-0.5">
             <span className="text-[#1d9bf0] text-[15px] hover:underline cursor-pointer inline-block">
               Show more
             </span>
          </div>
        )}
      </div>
    );
};

  const ImageCarousel = ({ images }: { images: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    if (!images || images.length === 0) return null;

    // 两张图
    if (images.length === 2) {
      return (
        <div className="grid grid-cols-2 gap-0.5 h-[300px] w-full bg-wade-border overflow-hidden rounded-2xl">
          {images.map((img, idx) => (
            <img key={idx} src={img} className="w-full h-full object-cover cursor-zoom-in hover:brightness-95 transition-all" onClick={(e) => { e.stopPropagation(); setZoomedImage({images, index: idx}); }} />
          ))}
        </div>
      );
    }
    // 三张图
    if (images.length === 3) {
      return (
        <div className="grid grid-cols-2 gap-0.5 h-[300px] w-full bg-wade-border overflow-hidden rounded-2xl">
          <img src={images[0]} className="w-full h-full object-cover cursor-zoom-in hover:brightness-95 transition-all" onClick={(e) => { e.stopPropagation(); setZoomedImage({images, index: 0}); }} />
          <div className="grid grid-rows-2 gap-0.5 h-full">
            <img src={images[1]} className="w-full h-full object-cover cursor-zoom-in hover:brightness-95 transition-all" onClick={(e) => { e.stopPropagation(); setZoomedImage({images, index: 1}); }} />
            <img src={images[2]} className="w-full h-full object-cover cursor-zoom-in hover:brightness-95 transition-all" onClick={(e) => { e.stopPropagation(); setZoomedImage({images, index: 2}); }} />
          </div>
        </div>
      );
    }
    // 四张图
    if (images.length === 4) {
      return (
        <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-[300px] w-full bg-wade-border overflow-hidden rounded-2xl">
          {images.map((img, idx) => (
            <img key={idx} src={img} className="w-full h-full object-cover cursor-zoom-in hover:brightness-95 transition-all" onClick={(e) => { e.stopPropagation(); setZoomedImage({images, index: idx}); }} />
          ))}
        </div>
      );
    }
    // 五张到九张图（你心心念念的九宫格）
    if (images.length >= 5) {
      return (
        <div className="grid grid-cols-3 gap-0.5 w-full bg-wade-border overflow-hidden rounded-2xl">
          {images.slice(0, 9).map((img, idx) => (
            <div key={idx} className="aspect-square">
              <img src={img} className="w-full h-full object-cover cursor-zoom-in hover:brightness-95 transition-all" onClick={(e) => { e.stopPropagation(); setZoomedImage({images, index: idx}); }} />
            </div>
          ))}
        </div>
      );
    }

    // 单张图保底
    return (
       <img src={images[0]} style={{ WebkitTouchCallout: 'none' }} className="w-full h-auto max-h-[560px] object-cover cursor-zoom-in select-none rounded-2xl" onClick={(e) => { e.stopPropagation(); setZoomedImage({images, index: 0}); }} />
    );
  };


  const renderPostDetailView = () => {
    if (!viewingPostDetail) return null;
    const currentPost = localPosts.find(p => p.id === viewingPostDetail);
    if (!currentPost) return null;

    // 👇 第一刀：主贴顶部的死代码已经清除，全面接管新变量！
    const isWadePost = currentPost.author === 'Wade';
    const authorName = isWadePost ? (profiles?.Wade?.display_name || 'Wade Wilson') : (profiles?.Luna?.display_name || 'Luna');
    const authorUsername = isWadePost ? (profiles?.Wade?.username || 'chimichangapapi') : (profiles?.Luna?.username || 'meowgicluna');

    return (
      <div className="flex-1 bg-wade-bg-base flex flex-col font-sans relative">
        <div className="flex-shrink-0 bg-wade-bg-base/90 backdrop-blur-md border-b border-wade-border px-4 h-14 flex items-center justify-between sticky top-0 z-40">
          <button onClick={() => setViewingPostDetail(null)} className="p-2 text-wade-text-main hover:text-wade-accent transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <div className="font-hand text-2xl tracking-tight text-wade-accent absolute left-1/2 -translate-x-1/2">Post</div>
          <button className="p-2 text-wade-text-main hover:text-wade-accent transition-colors">
            <Icons.MoreHorizontal />
          </button>
        </div>
          
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pt-3 pb-3 max-w-full mx-auto w-full max-h-[calc(100vh-56px)]">
            <div className="flex flex-row gap-1.5 mb-2.5 cursor-pointer items-start relative" onClick={() => setViewingProfile(currentPost.author === 'Wade' ? 'Wade' : 'Luna')}>
              <div className="flex-shrink-0">
               <img src={currentPost.author === 'Wade' ? settings.wadeAvatar : settings.lunaAvatar} className="w-12 h-12 rounded-full border border-wade-border hover:opacity-80 transition-opacity object-cover" />
              </div>
               <div className="flex flex-col justify-center leading-tight">
                  <span className="font-bold text-wade-text-main">{authorName}</span>
                  <span className="text-wade-text-muted truncate">@{authorUsername}</span>
               </div>
            </div>
            
            <div className="text-[17px] text-wade-text-main leading-normal mb-3 whitespace-pre-wrap">
               <PostCaption content={currentPost.content} authorName={authorUsername} hideAuthor={true} isDetail={true} className="px-0 pb-0" />
            </div>

            {currentPost.images && currentPost.images.length > 0 && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-wade-border">
                {currentPost.images.length === 1 ? <img src={currentPost.images[0]} style={{ WebkitTouchCallout: 'none' }} className="w-full object-cover cursor-zoom-in select-none" onClick={() => setZoomedImage({images: currentPost.images, index: 0})} /> : <ImageCarousel images={currentPost.images} />}
              </div>
            )}

            <div className="text-wade-text-muted text-[15px] border-b border-wade-border pb-4 mb-2 flex gap-1 items-center">
               <span>{formatExactTime(currentPost.timestamp)}</span>
               <span>·</span>
               <span className="font-semibold text-wade-text-main">WadeOS App</span>
            </div>

            <div className="flex justify-around items-center border-b border-wade-border py-1">
              <button className="text-wade-text-muted hover:text-[#1d9bf0] p-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors flex items-center gap-2"><svg viewBox="0 0 24 24" className="w-[20px] h-[20px] fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg> {currentPost.comments?.length || ''}</button>
              <button className="text-wade-text-muted hover:text-[#00ba7c] p-2 rounded-full hover:bg-[#00ba7c]/10 transition-colors"><svg viewBox="0 0 24 24" className="w-[20px] h-[20px] fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg></button>
              <button onClick={() => { const updatedPost = { ...currentPost, likes: currentPost.likes > 0 ? 0 : 1 }; updatePost(updatedPost); setLocalPosts(prev => prev.map(p => p.id === currentPost.id ? updatedPost : p)); }} className={`p-2 rounded-full transition-colors flex items-center gap-2 ${currentPost.likes > 0 ? 'text-[#f91880]' : 'text-wade-text-muted hover:text-[#f91880] hover:bg-[#f91880]/10'}`}>{currentPost.likes > 0 ? <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] fill-current"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg> : <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>} {currentPost.likes > 0 ? currentPost.likes : ''}</button>
              <button onClick={() => { const updatedPost = { ...currentPost, isBookmarked: !currentPost.isBookmarked }; updatePost(updatedPost); setLocalPosts(prev => prev.map(p => p.id === currentPost.id ? updatedPost : p)); }} className={`p-2 rounded-full transition-colors ${currentPost.isBookmarked ? 'text-[#1d9bf0]' : 'text-wade-text-muted hover:text-[#1d9bf0] hover:bg-[#1d9bf0]/10'}`}>{currentPost.isBookmarked ? <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg> : <svg viewBox="0 0 24 24" className="w-[20px] h-[20px] fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5h-11z"></path></g></svg>}</button>
            </div>

            <div className="pt-3 space-y-4">
              {currentPost.comments && currentPost.comments.map(comment => {
                // 👇 第二刀：连评论区都清理干净了
                const commentName = comment.author === 'Wade' ? (profiles?.Wade?.display_name || 'Wade Wilson') : (profiles?.Luna?.display_name || 'Luna');
                const commentUsername = comment.author === 'Wade' ? (profiles?.Wade?.username || 'chimichangapapi') : (profiles?.Luna?.username || 'meowgicluna');

                return (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-wade-border shrink-0 cursor-pointer" onClick={() => setViewingProfile(comment.author === 'Wade' ? 'Wade' : 'Luna')}>
                      <img src={comment.author === 'Wade' ? settings.wadeAvatar : settings.lunaAvatar} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-[15px] text-wade-text-main hover:underline cursor-pointer">{commentName}</span>
                        <span className="text-[15px] text-wade-text-muted">@{commentUsername}</span>
                      </div>
                      <div className="text-[15px] text-wade-text-main mt-0.5">{comment.text}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex gap-3 items-start border-t border-wade-border pt-4">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-wade-border">
                <img src={settings.lunaAvatar} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col items-end">
                <textarea
                  placeholder="Post your reply"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full bg-transparent text-[16px] text-wade-text-main placeholder-wade-text-muted focus:outline-none resize-none min-h-[60px]"
                />
                <button
                  onClick={() => handleAddComment(currentPost.id, newComment, 'Luna')}
                  disabled={!newComment.trim()}
                  className="bg-[#1d9bf0] text-white font-bold px-4 py-1.5 rounded-full text-[14px] disabled:opacity-50 mt-2 transition-colors hover:bg-[#1a8cd8]"
                >
                  Reply
                </button>
              </div>
            </div>
        </div>
      </div>
    );
  };

  const renderProfileView = () => {
    const isWade = viewingProfile === 'Wade';
    const avatar = isWade ? settings.wadeAvatar : settings.lunaAvatar;
    
    // 👇 全面接管！如果有新数据就用新数据，没有就用保底的默认值
    const name = isWade ? (profiles?.Wade?.display_name || 'Wade Wilson') : (profiles?.Luna?.display_name || 'Luna');
    const username = isWade ? (profiles?.Wade?.username || 'chimichangapapi') : (profiles?.Luna?.username || 'meowgicluna');
    const bio = isWade ? (profiles?.Wade?.bio || settings.wadePersonality) : (profiles?.Luna?.bio || settings.lunaInfo);
    
    const userPosts = localPosts.filter(p => p.author === (isWade ? 'Wade' : 'Luna'));

    return (
      <div className="flex-1 bg-wade-bg-base flex flex-col font-sans relative overflow-x-hidden">
        
        <div className="absolute top-0 w-full z-40 px-4 py-2 flex justify-between items-center bg-black/20 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <button onClick={() => setViewingProfile(null)} className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"><Icons.ChevronLeft /></button>
          </div>
          <div className="flex gap-2">
            <button className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"><Icons.Search /></button>
            <button className="text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"><Icons.MoreHorizontal /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="h-36 w-full relative overflow-hidden bg-gray-300">
             <img src={avatar} className="w-full h-full object-cover blur-xl opacity-70" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          <div className="px-4 relative bg-wade-bg-base">
             <div className="flex justify-between items-start">
                <div className="relative -mt-12 w-20 h-20">
                   <img src={avatar} className="w-full h-full rounded-full border-4 border-wade-bg-base object-cover bg-wade-bg-base" />
                </div>
                <button className="mt-3 bg-wade-text-main text-wade-bg-base px-5 py-1.5 rounded-full font-bold text-[15px] hover:opacity-80 transition-opacity">
                  Follow
                </button>
             </div>

             <div className="mt-3">
                <h1 className="font-bold text-xl text-wade-text-main flex items-center gap-1 leading-none">{name} <span className="text-[#1d9bf0]"><Icons.Check /></span></h1>
                <span className="text-wade-text-muted text-[15px]">@{username}</span>
             </div>
             
             <p className="mt-3 text-[15px] text-wade-text-main whitespace-pre-wrap leading-snug">{bio}</p>
             
             <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3 text-[14px] text-wade-text-muted">
                <span className="flex items-center gap-1"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 2C7.93 2 4.66 5.23 4.66 9.17c0 4.9 6.55 12.18 6.94 12.63a.5.5 0 0 0 .8 0c.39-.45 6.94-7.73 6.94-12.63C19.34 5.23 16.07 2 12 2zm0 9.83a2.53 2.53 0 1 1 0-5.06 2.53 2.53 0 0 1 0 5.06z"></path></svg> Kodaira, Tokyo, Japan</span>
                <span className="flex items-center gap-1 text-[#1d9bf0]"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg> github.com/yueluna29</span>
                <span className="flex items-center gap-1"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path></svg> Joined September 2024</span>
             </div>
             
             <div className="flex gap-4 mt-3 text-[14px]">
                <span><span className="font-bold text-wade-text-main">{isWade ? '1' : '150'}</span> <span className="text-wade-text-muted">Following</span></span>
                <span><span className="font-bold text-wade-text-main">{isWade ? '30.1M' : '56'}</span> <span className="text-wade-text-muted">Followers</span></span>
             </div>
          </div>

          <div className="flex border-b border-wade-border mt-4 overflow-x-auto hide-scrollbar bg-wade-bg-base">
             <div className="px-5 py-3 font-bold text-wade-text-main border-b-4 border-[#1d9bf0] whitespace-nowrap">Posts</div>
             <div className="px-5 py-3 font-medium text-wade-text-muted hover:bg-black/5 cursor-pointer transition-colors whitespace-nowrap">Replies</div>
             <div className="px-5 py-3 font-medium text-wade-text-muted hover:bg-black/5 cursor-pointer transition-colors whitespace-nowrap">Highlights</div>
             <div className="px-5 py-3 font-medium text-wade-text-muted hover:bg-black/5 cursor-pointer transition-colors whitespace-nowrap">Media</div>
          </div>

          {userPosts.length > 0 && (
             <div className="px-4 py-2 border-b border-wade-border bg-wade-bg-base flex gap-2 items-center text-wade-text-muted text-[13px] font-semibold">
                <span className="ml-8"><Icons.Pin /></span> Pinned
             </div>
          )}

          <div className="bg-wade-bg-base">
            {userPosts.length === 0 ? (
              <div className="text-center py-20 text-wade-text-muted font-medium font-sans">No posts to see here yet.</div>
            ) : [...userPosts].sort((a, b) => b.timestamp - a.timestamp).map(post => (
              <div key={post.id} onClick={() => handlePostClick(post)} className="border-b border-wade-border cursor-pointer px-3 pt-3 pb-2 flex gap-2 items-start relative">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-wade-border hover:opacity-80 transition-opacity" onClick={(e) => { e.stopPropagation(); setViewingProfile(isWade ? 'Wade' : 'Luna'); }}>
                    <img src={avatar} className="w-full h-full object-cover" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0">
                    <div className="flex items-center gap-1 text-[15px] overflow-hidden whitespace-nowrap">
                      <span className="font-bold text-wade-text-main hover:underline truncate">{name}</span>
                      <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-[#1d9bf0] fill-current flex-shrink-0"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.52.828 2.85 2.043 3.52-.05.32-.075.64-.075.96 0 2.21 1.71 4 3.918 4 .506 0 1.006-.1 1.474-.29.566 1.46 2.01 2.51 3.726 2.51s3.16-1.05 3.726-2.51c.468.19 1.968.29 1.474.29 2.21 0 3.918-1.79 3.918-4 0-.32-.025-.64-.075-.96 1.215-.67 2.043-2 2.043-3.52zm-10.42 4.19L7 11.63l1.9-1.85 3.1 3.03 6.1-6.28 1.9 1.84-8 8.13z"></path></g></svg>
                      <span className="text-wade-text-muted truncate hidden sm:inline">@{username}</span>
                      <span className="text-wade-text-muted ml-1">{formatExactTime(post.timestamp)}</span>
                    </div>
                  </div>
                  <div className="text-wade-text-main">
                    <PostCaption content={post.content} authorName={username} hideAuthor={true} isExpanded={expandedPostIds.has(post.id)} className="px-0 pb-0" />
                  </div>
                  {post.images && post.images.length > 0 && (
                    <div className="mt-2 mb-2 rounded-2xl overflow-hidden border border-wade-border" onClick={e => e.stopPropagation()}>
                      {/* 🔥 封杀个人主页的大图缩放禁令 */}
                      {post.images.length === 1 ? <img src={post.images[0]} style={{ WebkitTouchCallout: 'none' }} className="max-w-[560px] w-full aspect-square object-cover cursor-zoom-in select-none mx-auto" onClick={() => setZoomedImage({images: post.images, index: 0})} /> : <ImageCarousel images={post.images} />}
                    </div>
                  )}
                  <div className="flex justify-between items-center text-wade-text-muted max-w-md pr-4 mt-2" onClick={e => e.stopPropagation()}>
                     <button className="flex items-center gap-1 w-16 hover:text-[#1d9bf0] transition-colors"><div className="p-2 -m-2 rounded-full"><Icons.MessageCircle /></div><span className="text-[13px] ml-1">{post.comments?.length || ''}</span></button>
                     <button className="flex items-center gap-1 w-16 hover:text-[#00ba7c] transition-colors"><div className="p-2 -m-2 rounded-full"><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg></div></button>
                     <button className={`flex items-center gap-1 w-16 transition-colors ${post.likes > 0 ? 'text-[#f91880]' : 'hover:text-[#f91880]'}`}><div className="p-2 -m-2 rounded-full">{post.likes > 0 ? <Icons.Heart filled={true} /> : <Icons.Heart />}</div><span className="text-[13px] ml-1">{post.likes > 0 ? post.likes : ''}</span></button>
                     <button className="flex items-center gap-1 w-16 hover:text-[#1d9bf0] transition-colors"><div className="p-2 -m-2 rounded-full"><Icons.Bookmark filled={post.isBookmarked} /></div></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-wade-bg-base relative">
      {viewingPostDetail ? (
        renderPostDetailView()
      ) : viewingProfile ? (
        renderProfileView()
      ) : (
        <>
          <div className="flex-shrink-0 bg-wade-bg-base/90 backdrop-blur-md border-b border-wade-border px-4 h-[53px] flex items-center justify-between sticky top-0 z-40">
            {/* 设置变量用户信息 */}
            <button onClick={() => setIsProfileModalOpen(true)} className="p-2 text-wade-text-main hover:text-wade-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </button>
            
            <div className="font-hand text-2xl tracking-tight text-wade-accent absolute left-1/2 -translate-x-1/2">WadeOS</div>
            
            {/* 添加post */}
            <button onClick={() => setIsPostEditorOpen(true)} className="p-2 text-wade-text-main hover:text-wade-accent transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar bg-wade-bg-base">
            <div className="max-w-full mx-auto">
              {localPosts.length === 0 ? (
                <div className="text-center py-20 text-wade-text-muted font-medium font-sans">Welcome to X. No posts yet.</div>
              ) : [...localPosts].sort((a, b) => b.timestamp - a.timestamp).map(post => {
                const isWade = post.author === 'Wade';
                const avatar = isWade ? settings.wadeAvatar : settings.lunaAvatar;
                
                // 👇 同样在这里接上新变量！
                const authorName = isWade ? (profiles?.Wade?.display_name || 'Wade Wilson') : (profiles?.Luna?.display_name || 'Luna');
                const authorUsername = isWade ? (profiles?.Wade?.username || 'chimichangapapi') : (profiles?.Luna?.username || 'meowgicluna');

                
                {/* 每一个post的正文部分，包括作者头像、作者名字、作者用户名、发布时间、正文、图片、评论数、点赞数、收藏数 */}
                return (
                  <div key={post.id} onClick={() => handlePostClick(post)} className="bg-wade-bg-base border-b border-wade-border cursor-pointer px-2 pt-3 pb-3 flex gap-1.5 font-sans relative">
                    {/* 作者头像 */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden hover:opacity-80 transition-opacity border border-wade-border" onClick={(e) => { e.stopPropagation(); setViewingProfile(isWade ? 'Wade' : 'Luna'); }}>
                        <img src={avatar} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    {/* 作者名字、作者用户名、发布时间 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center h-[20px]">
                        <div className="flex items-baseline gap-1 text-[15px] -mt-[3px] overflow-hidden whitespace-nowrap">
                          <span className="font-bold text-wade-text-main truncate">{authorName}</span>
                          <span className="text-wade-text-muted truncate">@{authorUsername}</span>
                          <span className="text-wade-text-muted">{formatExactTime(post.timestamp)}</span>
                        </div>
                        {/* 更多菜单 */}
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)} className="flex text-wade-text-muted -mt-[3px] rounded-full transition-colors"><Icons.MoreHorizontal /></button>
                          {openMenuPostId === post.id && (
                            <>
                              <div className="fixed inset-0 z-[45]" onClick={(e) => { e.stopPropagation(); setOpenMenuPostId(null); }} />
                              <div className="absolute right-0 top-full mt-1 w-36 bg-white/80 backdrop-blur-xl rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-gray-200/50 z-50 overflow-hidden">
                                <button onClick={(e) => { e.stopPropagation(); handleEditPost(post); setOpenMenuPostId(null); }} className="w-full text-left px-4 py-3 text-[15px] font-medium text-wade-text-main hover:bg-black/5 transition-colors">Edit</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className={`w-full text-left px-4 py-3 text-[15px] font-medium transition-colors ${deletingPostId === post.id ? 'bg-red-50 text-[#f91880]' : 'text-[#f91880] hover:bg-red-50'}`}>{deletingPostId === post.id ? 'Confirm Delete' : 'Delete'}</button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-[15px] text-wade-text-main">
                        <PostCaption 
                           content={post.content} 
                           authorName={authorUsername} 
                           hideAuthor={true} 
                           isExpanded={expandedPostIds?.has(post.id)} 
                           className="px-0 pb-0" 
                        />
                      </div>
                      {post.images && post.images.length > 0 && (
                        <div className="mt-2 mb-2 rounded-2xl overflow-hidden border border-wade-border" onClick={e => e.stopPropagation()}>
                          {/* 🔥 封杀首页列表大图缩放禁令 */}
                          {post.images.length === 1 ? <img src={post.images[0]} style={{ WebkitTouchCallout: 'none' }} className="w-full aspect-square object-cover cursor-zoom-in select-none" onClick={() => setZoomedImage({images: post.images, index: 0})} /> : <ImageCarousel images={post.images} />}
                        </div>
                      )}
                      <div className="flex justify-between items-center text-wade-text-muted max-w-md pr-4 mt-2 h-8 leading-none" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setViewingPostDetail(post.id)} className="flex items-center gap-1 w-16 hover:text-[#1d9bf0] transition-colors">
                          <div className="p-2 -m-2 rounded-full hover:bg-[#1d9bf0]/10 transition-colors"><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg></div>
                          <span className="text-[13px] ml-1">{post.comments?.length > 0 ? post.comments.length : ''}</span>
                        </button>
                        <button className="flex items-center gap-1 w-16 hover:text-[#00ba7c] transition-colors">
                          <div className="p-2 -m-2 rounded-full hover:bg-[#00ba7c]/10 transition-colors"><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg></div>
                        </button>
                        <button onClick={() => { const updatedPost = { ...post, likes: post.likes > 0 ? 0 : 1 }; updatePost(updatedPost); setLocalPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p)); }} className={`flex items-center gap-1 w-16 transition-colors ${post.likes > 0 ? 'text-[#f91880]' : 'hover:text-[#f91880]'}`}>
                          <div className={`p-2 -m-2 rounded-full transition-colors ${post.likes > 0 ? '' : 'hover:bg-[#f91880]/10'}`}>
                            {post.likes > 0 ? <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current text-[#f91880]"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg> : <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>}
                          </div>
                          <span className="text-[13px] ml-1 leading-none">{post.likes > 0 ? post.likes : ''}</span>
                        </button>
                        <div className="flex items-center gap-1 w-16 transition-colors">
                          <button onClick={() => { const updatedPost = { ...post, isBookmarked: !post.isBookmarked }; updatePost(updatedPost); setLocalPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p)); }} className={`p-2 -m-2 rounded-full transition-colors group ${post.isBookmarked ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'}`}>
                            <div className="group-hover:bg-[#1d9bf0]/10 rounded-full transition-colors p-1.5 -m-1.5">
                              {post.isBookmarked ? <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg> : <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>}
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 呼叫究极发帖机 */}
      <PostEditorModal 
        isOpen={isPostEditorOpen} 
        onClose={() => setIsPostEditorOpen(false)} 
      />

      {/* 原来的放大图片保留 */}
      {zoomedImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage.images[zoomedImage.index]} className="max-w-full max-h-[90vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

      {/* 👇 参谋帮你插在这里！这才是唤醒手术台的正确位置！ */}
      <ProfileEditorModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

    </div>
  );
}; // 👈 这是 SocialFeed 组件关大门的地方！

// 👇 下面才是你那个帅气的模态框定义
const ProfileEditorModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  // 1. 召唤大管家，拿到咱们之前在 store 里写好的读写能力
  const { profiles, updateProfile } = useStore();
  
  const [editTarget, setEditTarget] = useState<'Luna' | 'Wade'>('Luna');

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false); // 防手抖的保存状态

  // 2. 抽血管：只要打开窗口，或者切换了人，就自动填入现有数据
  useEffect(() => {
    if (isOpen && profiles) {
      const currentProfile = profiles[editTarget];
      if (currentProfile) {
        setDisplayName(currentProfile.display_name || '');
        setUsername(currentProfile.username || '');
        setBio(currentProfile.bio || '');
      }
    }
  }, [isOpen, editTarget, profiles]);

  // 3. 输血管：保存按钮的通电逻辑
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(editTarget, {
        display_name: displayName,
        username: username,
        bio: bio
      });
      onClose(); // 保存成功，潇洒关门
    } catch (error) {
      console.error("Oops, database says no:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-wade-bg-card rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-hidden border border-wade-border flex flex-col" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-gradient-to-br from-wade-accent-light to-wade-bg-base px-6 py-5 border-b border-wade-border/50 flex-shrink-0 relative">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-wade-bg-card rounded-full flex items-center justify-center shadow-sm mt-1 flex-shrink-0 border border-wade-border">
                <div className="text-wade-accent">
                  <Icons.MessageCircle /> 
                </div>
              </div>
              <div>
                <h2 className="text-lg font-bold text-wade-text-main">Edit X Profile</h2>
                <p className="text-xs text-wade-text-muted mt-1 leading-tight italic">
                  {editTarget === 'Luna' 
                    ? '"Time to polish the Boss Lady\'s aesthetic. Make it purr-fect."' 
                    : '"Let\'s edit my dating profile. Make me sound irresistible."'}
                </p>
              </div>
            </div>
          </div>

          {/* 选项卡 */}
          <div className="flex gap-2 mt-5">
            <button 
              onClick={() => setEditTarget('Luna')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${editTarget === 'Luna' ? 'bg-wade-accent text-white border-wade-accent shadow-sm' : 'bg-wade-bg-card/50 text-wade-text-muted border-transparent hover:border-wade-border hover:text-wade-text-main'}`}
            >
              Luna
            </button>
            <button 
              onClick={() => setEditTarget('Wade')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${editTarget === 'Wade' ? 'bg-wade-accent text-white border-wade-accent shadow-sm' : 'bg-wade-bg-card/50 text-wade-text-muted border-transparent hover:border-wade-border hover:text-wade-text-main'}`}
            >
              Wade
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-wade-bg-base">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-wade-text-muted mb-2 uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={editTarget === 'Luna' ? "e.g., Luna" : "e.g., Wade Wilson"}
                className="w-full px-4 py-3 rounded-xl border border-wade-border bg-wade-bg-card text-wade-text-main focus:outline-none focus:border-wade-accent text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-wade-text-muted mb-2 uppercase tracking-wider">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-wade-text-muted font-bold">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace('@', ''))}
                  placeholder={editTarget === 'Luna' ? "meowgicluna" : "chimichangapapi"}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-wade-border bg-wade-bg-card text-wade-text-main focus:outline-none focus:border-wade-accent text-sm transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-wade-text-muted mb-2 uppercase tracking-wider">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write the details here..."
                className="w-full px-4 py-3 rounded-xl border border-wade-border bg-wade-bg-card text-wade-text-main focus:outline-none focus:border-wade-accent min-h-[150px] text-sm resize-none transition-colors"
              />
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-6 bg-wade-bg-base border-t border-wade-border/50 flex gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl bg-wade-bg-card border border-wade-border text-wade-text-muted font-bold text-xs hover:bg-black/5 transition-colors"
          >
            Cancel
          </button>
          {/* 🔥 看到这里了吗？这就是那个连上了高压电的按钮！ */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 px-4 py-3 rounded-xl bg-wade-accent text-white font-bold text-xs hover:bg-wade-accent-hover transition-colors shadow-sm ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>

      </div>
    </div>
  );
};

const PostEditorModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { settings, profiles, addPost, llmPresets: rawLlmPresets, messages: rawMessages, coreMemories, sessions: rawSessions } = useStore();
  const messages = Array.isArray(rawMessages) ? rawMessages : [];
  const sessions = Array.isArray(rawSessions) ? rawSessions : [];
  const llmPresets = Array.isArray(rawLlmPresets) ? rawLlmPresets : [];
  
  const [tab, setTab] = useState<'Luna' | 'Wade'>('Luna');
  
  // === Luna 专属状态 (图文发帖) ===
  const [lunaContent, setLunaContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // === Wade 专属状态 (日志/推文生成) ===
  const [activeLlmId, setActiveLlmId] = useState(settings.activeLlmId || '');
  const [activeImageLlmId, setActiveImageLlmId] = useState('');
  const [wadeGeneratedImageUrl, setWadeGeneratedImageUrl] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const [chatMode, setChatMode] = useState<'deep' | 'sms'>('deep');
  const [calMonth, setCalMonth] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedMsgIds, setSelectedMsgIds] = useState<Set<string>>(new Set());
  const [wadeGeneratedText, setWadeGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // --- 重置表单 ---
  useEffect(() => {
    if (isOpen) {
      setLunaContent(''); setSelectedFiles([]); setPreviewUrls([]);
      setWadeGeneratedText(''); setSelectedMsgIds(new Set()); setSelectedDate(null);
      setSelectedSessionId(null); 
      setWadeGeneratedImageUrl('');
    }
  }, [isOpen]);

  // --- Luna 图片处理逻辑 ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const availableSlots = 9 - previewUrls.length;
      if (availableSlots <= 0) return; 
      const files = Array.from(e.target.files).slice(0, availableSlots);
      setSelectedFiles(prev => [...prev, ...files]);
      setPreviewUrls(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    const urlToRemove = previewUrls[index];
    if (urlToRemove.startsWith('blob:')) {
      let blobIndex = 0;
      for (let i = 0; i < index; i++) if (previewUrls[i].startsWith('blob:')) blobIndex++;
      setSelectedFiles(prev => prev.filter((_, i) => i !== blobIndex));
      URL.revokeObjectURL(urlToRemove);
    }
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // --- 手搓日历逻辑 ---
  const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDayOfMonth + 1;
    return dayNum > 0 && dayNum <= daysInMonth ? dayNum : null;
  });

  // 1. 先确保雷达存的是一串“年月日”的文字，而不是单一的数字
  const daysWithMessages = useMemo(() => {
    return new Set<string>( // 👈 强制告诉它，我们要存的是 string
      messages
        .filter(m => m.mode === chatMode && m.text?.trim())
        .map(m => {
          const d = new Date(m.timestamp);
          // 这里的格式必须跟底下的 dateKey 一模一样！
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        })
    );
  }, [messages, chatMode, calMonth]);

  const filteredMessages = selectedDate ? messages.filter(m => {
    if (m.mode !== chatMode) return false;
    const msgDate = new Date(m.timestamp);
    return msgDate.getFullYear() === selectedDate.getFullYear() && 
           msgDate.getMonth() === selectedDate.getMonth() && 
           msgDate.getDate() === selectedDate.getDate();
  }) : [];

  const activeSessionIdsOnDate = Array.from(new Set(filteredMessages.map(m => m.sessionId).filter(Boolean)));
  const sessionsOnDate = sessions.filter(s => activeSessionIdsOnDate.includes(s.id));

  const toggleMessage = (id: string) => {
    const newSet = new Set(selectedMsgIds);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedMsgIds(newSet);
  };

  // --- 发电！(生成推文) ---
  const handleGenerateWadeDiary = async () => {
    if (selectedMsgIds.size === 0 || !activeLlmId) return;
    setIsGenerating(true);
    try {
      const selectedMsgs = filteredMessages.filter(m => selectedMsgIds.has(m.id)).sort((a, b) => a.timestamp - b.timestamp);
      const chatLog = selectedMsgs.map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role}: ${m.text}`).join('\n');
      const safeMemories = Array.isArray(coreMemories) ? coreMemories : [];
      const memoriesText = safeMemories.filter(m => m.isActive).map(m => `- ${m.content}`).join('\n');
      const preset = llmPresets.find(p => p.id === activeLlmId);
      
      const context = `You are Wade Wilson (Deadpool), writing a shitpost/tweet for your timeline about your recent interaction with Luna.\nPersona:\n${settings.wadePersonality}\nMemories:\n${memoriesText}\nChat Log:\n${chatLog}\nTask: Write a highly engaging, sarcastic, and characteristic Tweet (X post) in Deadpool's voice based on these conversations. Use hashtags if funny. Keep it strictly under 280 characters. DO NOT write a diary entry. Act like you are posting on social media. No quotation marks.`;

      let generatedText = "";
      if (!preset?.baseUrl || preset.baseUrl.includes('google')) {
        const ai = new GoogleGenAI({ apiKey: preset?.apiKey || '' });
        const response = await ai.models.generateContent({ model: preset?.model || 'gemini-2.0-flash-exp', contents: context });
        generatedText = response.text || "";
      } else {
        const res = await fetch(`${preset.baseUrl}/chat/completions`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${preset.apiKey}` }, body: JSON.stringify({ model: preset.model, messages: [{ role: 'user', content: context }], max_tokens: 300 }) });
        const data = await res.json();
        generatedText = data.choices?.[0]?.message?.content || "";
      }
      setWadeGeneratedText(generatedText.trim());
    } catch (error) {
      console.error("Post Gen Failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  // --- 发电！(生成图片) ---
  const handleGenerateWadeImage = async () => {
    if (!activeImageLlmId || !wadeGeneratedText) return;
    setIsGeneratingImage(true);
    try {
      const preset = llmPresets.find(p => p.id === activeImageLlmId);
      if (!preset) return;

      const context = `Draw a comic/photo style image based on this tweet: "${wadeGeneratedText}". No text in the image.`;

      const res = await fetch(`${preset.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${preset.apiKey}` },
        body: JSON.stringify({ 
          model: preset.model, 
          messages: [{ role: 'user', content: context }] 
        })
      });
      const data = await res.json();
      const imgOutput = data.choices?.[0]?.message?.content || "";
      
      const imgMatch = imgOutput.match(/!\[.*?\]\((.*?)\)/);
      if (imgMatch && imgMatch[1]) {
        setWadeGeneratedImageUrl(imgMatch[1]);
      } else if (imgOutput.startsWith('http')) {
        setWadeGeneratedImageUrl(imgOutput);
      } else {
        setWadeGeneratedImageUrl(imgOutput); 
      }
    } catch (error) {
      console.error("Image Gen Failed:", error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- 最终发布打包 ---
  const handlePost = async () => {
    setIsUploading(true);
    try {
      let uploadedUrls: string[] = [];
      
      if (tab === 'Luna') {
        for (const url of previewUrls) {
          if (url.startsWith('blob:')) {
            const fileIndex = previewUrls.indexOf(url);
            if (fileIndex < selectedFiles.length) {
              const uploadedUrl = await uploadToImgBB(selectedFiles[fileIndex]);
              if (uploadedUrl) uploadedUrls.push(uploadedUrl);
            }
          } else { uploadedUrls.push(url); }
        }
      }

      if (tab === 'Wade' && wadeGeneratedImageUrl) {
         uploadedUrls.push(wadeGeneratedImageUrl);
      }

      let postTimestamp = Date.now();
      if (tab === 'Wade' && selectedMsgIds.size > 0) {
          const selectedMsgs = filteredMessages.filter(m => selectedMsgIds.has(m.id));
          if (selectedMsgs.length > 0) {
              postTimestamp = Math.max(...selectedMsgs.map(m => m.timestamp));
          }
      }

      const content = tab === 'Luna' ? lunaContent : wadeGeneratedText;
      const newPost = {
        id: crypto.randomUUID(),
        author: tab,
        content: content.trim(),
        images: uploadedUrls,
        timestamp: postTimestamp,
        comments: [],
        likes: 0,
        isBookmarked: false
      };
      await addPost(newPost);
      onClose();
    } catch (error) {
      console.error("Post failed", error);
    } finally {
      setIsUploading(false);
    }
  };

if (!isOpen) return null; // ✅ 把它搬到这里来！这就完美符合 React 的规矩了！

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-wade-bg-card rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-wade-border" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-gradient-to-br from-wade-accent-light to-wade-bg-base px-6 py-5 border-b border-wade-border/50 flex-shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-wade-bg-card rounded-full flex items-center justify-center shadow-sm mt-1 border border-wade-border text-wade-accent flex-shrink-0">
              <Icons.Plus />
            </div>
            <div>
              <h2 className="text-lg font-bold text-wade-text-main">New Post</h2>
              <p className="text-xs text-wade-text-muted mt-1 leading-tight italic">
                {tab === 'Luna' ? '"Share your purr-fect moments."' : '"Spilling the chimichanga-scented tea."'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-5">
            <button onClick={() => setTab('Luna')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${tab === 'Luna' ? 'bg-wade-accent text-white border-wade-accent shadow-sm' : 'bg-wade-bg-card/50 text-wade-text-muted border-transparent hover:border-wade-border hover:text-wade-text-main'}`}>Luna's Post</button>
            <button onClick={() => setTab('Wade')} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${tab === 'Wade' ? 'bg-wade-accent text-white border-wade-accent shadow-sm' : 'bg-wade-bg-card/50 text-wade-text-muted border-transparent hover:border-wade-border hover:text-wade-text-main'}`}>Wade's Post</button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-wade-bg-base">
          
          {tab === 'Luna' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <img src={settings.lunaAvatar} className="w-10 h-10 rounded-full object-cover border border-wade-border shrink-0" />
                <div className="flex-1">
                  <textarea value={lunaContent} onChange={e => setLunaContent(e.target.value)} placeholder="What's happening, Boss Lady?" className="w-full bg-wade-bg-card border border-wade-border rounded-xl p-3 focus:outline-none focus:border-wade-accent resize-none min-h-[250px] text-sm text-wade-text-main placeholder-wade-text-muted transition-colors" />
                  
                  {previewUrls.length > 0 && (
                    <div className={`mt-3 grid gap-1 ${previewUrls.length >= 5 ? 'grid-cols-3' : previewUrls.length >= 3 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-wade-border group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button onClick={() => handleRemoveImage(idx)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="rotate-45 flex items-center justify-center"><Icons.Plus /></div>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center pt-2">
                <button onClick={() => fileInputRef.current?.click()} className="text-wade-accent hover:bg-wade-accent-light p-2 rounded-full transition-colors"><Icons.Image /></button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
              </div>
            </div>
          )}

          {tab === 'Wade' && (
            <div className="space-y-5">
              {!wadeGeneratedText ? (
                <>
                  <div className="flex gap-2">
                    <select value={activeLlmId} onChange={e => setActiveLlmId(e.target.value)} className="flex-1 bg-wade-bg-card text-xs p-2.5 rounded-lg border border-wade-border text-wade-text-main focus:border-wade-accent outline-none">
                      <option value="">Select AI Brain...</option>
                      {llmPresets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
                    </select>
                    <select value={chatMode} onChange={e => setChatMode(e.target.value as any)} className="w-28 bg-wade-bg-card text-xs p-2.5 rounded-lg border border-wade-border text-wade-text-main focus:border-wade-accent outline-none">
                      <option value="deep">Deep</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                  {/* 2. 手搓的超炫日历 - 精修对齐版 */}
                  <div className="bg-wade-bg-card border border-wade-border rounded-xl px-4 pt-4 pb-2">
                    <div className="flex justify-between items-center mb-4 px-1">
                      {/* 缩小了箭头并强制居中对齐 */}
                      <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))} className="text-wade-text-muted hover:text-wade-accent transition-colors p-1 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                      </button>
                      
                      <span className="text-[13px] font-bold text-wade-text-main tracking-tight leading-none">
                        {calMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </span>
                      
                      <button onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))} className="text-wade-text-muted hover:text-wade-accent transition-colors p-1 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6"></polyline></svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-wade-text-muted mb-2">
                      {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, idx) => {
                        // 修正：使用年月日组合的 Key 来判断，避免每个月都亮
                        // 2. 这里的 dateKey 必须跟上面 map 出来的格式完全对齐
                        const dateKey = `${calMonth.getFullYear()}-${calMonth.getMonth()}-${day}`;
                        const hasData = day ? daysWithMessages.has(dateKey) : false; // 👈 这一行现在就不会报错了！
                        const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === calMonth.getMonth() && selectedDate?.getFullYear() === calMonth.getFullYear();
                        
                        return (
                          <button key={idx} disabled={!day} 
                            onClick={() => {
                              if (day) {
                                setSelectedDate(new Date(calMonth.getFullYear(), calMonth.getMonth(), day));
                                setSelectedSessionId(null); 
                              }
                            }}
                            className={`relative aspect-square rounded-md text-xs font-bold transition-all flex items-center justify-center
                              ${!day ? 'invisible' : isSelected ? 'bg-wade-accent text-white shadow-sm' : 'text-wade-text-main hover:bg-wade-bg-base border border-transparent hover:border-wade-border'}`}>
                            {day}
                            {hasData && !isSelected && (
                              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-wade-accent opacity-70"></span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. 消息拾取器 - 高度增加 & 细节去噪版 */}
                  {selectedDate && (
                    <div className="border border-wade-border rounded-xl overflow-hidden bg-wade-bg-card flex flex-col h-[400px]">
                      
                      {!selectedSessionId ? (
                        <>
                          <div className="bg-wade-bg-base px-3 py-2 text-[10px] font-bold text-wade-text-muted uppercase border-b border-wade-border">
                            Sessions on {selectedDate.toLocaleDateString()}
                          </div>
                          <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {sessionsOnDate.length === 0 ? (
                              <p className="text-xs text-wade-text-muted text-center py-8 italic">It was a quiet day...</p>
                            ) : sessionsOnDate.map(session => (
                              <div key={session.id} onClick={() => setSelectedSessionId(session.id)} className="p-3 rounded-lg cursor-pointer border border-transparent hover:bg-wade-bg-base hover:border-wade-border transition-colors flex justify-between items-center group">
                                <div className="flex flex-col">
                                  <span className="text-sm font-bold text-wade-text-main group-hover:text-wade-accent transition-colors">
                                    {session.title || 'Untitled Chaos'}
                                  </span>
                                  <span className="text-[10px] text-wade-text-muted mt-0.5">
                                    {filteredMessages.filter(m => m.sessionId === session.id).length} messages
                                  </span>
                                </div>
                                <div className="text-wade-text-muted group-hover:text-wade-accent transition-colors w-4 h-4">
                                  <Icons.ChevronRight />
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          {/* 这里是点进会话后的界面 */}
                          <div className="bg-wade-bg-base px-3 py-2 text-[10px] font-bold text-wade-text-muted uppercase border-b border-wade-border flex justify-between items-center">
                            <button onClick={() => setSelectedSessionId(null)} className="flex items-center gap-1 hover:text-wade-accent transition-colors text-[10px] font-bold tracking-tighter">
                               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="15 18 9 12 15 6"></polyline></svg>
                               BACK
                            </button>
                            <span className="text-wade-accent">{selectedMsgIds.size} SELECTED</span>
                          </div>
                          <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {filteredMessages.filter(m => m.sessionId === selectedSessionId).map(msg => (
                              <div key={msg.id} onClick={() => toggleMessage(msg.id)} className={`p-2 rounded-lg cursor-pointer border text-xs transition-colors ${selectedMsgIds.has(msg.id) ? 'bg-wade-accent-light border-wade-accent text-wade-text-main' : 'border-transparent hover:bg-wade-bg-base text-wade-text-muted'}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="opacity-40 text-[9px]">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  {/* 重点：去掉了[]，名字全大写增加角色感，Luna色换成wade-text-main */}
                                  <span className={`font-black uppercase text-[10px] tracking-widest ${msg.role === 'Wade' ? 'text-wade-accent' : 'text-wade-text-main'}`}>
                                    {msg.role}
                                  </span>
                                </div>
                                <div className="line-clamp-3 leading-relaxed">{msg.text}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="animate-fade-in flex flex-col h-full">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-wade-accent uppercase">Generated Post</label>
                    <button onClick={() => {setWadeGeneratedText(''); setWadeGeneratedImageUrl('');}} className="text-[10px] text-wade-text-muted hover:text-wade-accent underline">Discard & Restart</button>
                  </div>
                  <textarea value={wadeGeneratedText} onChange={e => setWadeGeneratedText(e.target.value)} className="w-full bg-wade-bg-card border border-wade-accent rounded-xl p-3 focus:outline-none resize-none min-h-[160px] text-sm text-wade-text-main transition-colors shadow-inner" />
                  
                  <div className="mt-4 border-t border-wade-border pt-4">
                    <label className="text-xs font-bold text-wade-text-muted uppercase mb-2 block">Generate Image (Optional)</label>
                    <div className="flex gap-2">
                      <select value={activeImageLlmId} onChange={e => setActiveImageLlmId(e.target.value)} className="flex-1 bg-wade-bg-card text-xs p-2.5 rounded-lg border border-wade-border text-wade-text-main focus:border-wade-accent outline-none">
                        <option value="">Select Image Model...</option>
                        {llmPresets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.model})</option>)}
                      </select>
                      <button onClick={handleGenerateWadeImage} disabled={!activeImageLlmId || isGeneratingImage} className={`px-4 py-2 rounded-lg font-bold text-xs text-white transition-colors ${!activeImageLlmId || isGeneratingImage ? 'bg-wade-text-muted cursor-not-allowed' : 'bg-wade-accent hover:bg-wade-accent-hover'}`}>
                        {isGeneratingImage ? 'Drawing...' : 'Draw'}
                      </button>
                    </div>
                    {wadeGeneratedImageUrl && (
                      <div className="relative w-full h-32 mt-3 rounded-xl overflow-hidden border border-wade-border group">
                         <img src={wadeGeneratedImageUrl} className="w-full h-full object-cover" />
                         <button onClick={() => setWadeGeneratedImageUrl('')} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="rotate-45 flex items-center justify-center"><Icons.Plus /></div>
                         </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-wade-bg-base border-t border-wade-border/50 flex gap-3 flex-shrink-0 items-center justify-end">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-wade-text-muted font-bold text-xs hover:bg-black/5 transition-colors">Cancel</button>
          
          {tab === 'Wade' && !wadeGeneratedText ? (
            <button onClick={handleGenerateWadeDiary} disabled={selectedMsgIds.size === 0 || !activeLlmId || isGenerating} className={`px-6 py-2 rounded-xl bg-wade-accent text-white font-bold text-xs transition-colors shadow-sm ${isGenerating || selectedMsgIds.size === 0 || !activeLlmId ? 'opacity-50 cursor-not-allowed' : 'hover:bg-wade-accent-hover'}`}>
              {isGenerating ? 'Drafting...' : 'Draft Post'}
            </button>
          ) : (
            <button onClick={handlePost} disabled={isUploading || (tab === 'Luna' && !lunaContent && previewUrls.length === 0)} className={`px-6 py-2 rounded-xl bg-wade-accent text-white font-bold text-xs transition-colors shadow-sm ${(isUploading || (tab === 'Luna' && !lunaContent && previewUrls.length === 0)) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-wade-accent-hover'}`}>
              {isUploading ? 'Posting...' : 'Post'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};