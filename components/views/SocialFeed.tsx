import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';
import { SocialPost, ArchiveMessage } from '../../types';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

const Icons = {
  Heart: ({ filled }: { filled?: boolean }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#ed4956" : "none"} stroke={filled ? "#ed4956" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>),
  MessageCircle: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>),
  Send: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>),
  Bookmark: ({ filled }: { filled?: boolean }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>),
  MoreHorizontal: () => (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>),
  Image: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>),
  Smile: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>),
  Edit: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>),
  ChevronLeft: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>),
  ChevronRight: () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>),
  Sparkles: () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>),
  Check: () => (<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>)
};

export const SocialFeed: React.FC = () => {
  const { settings, socialPosts, addPost, updatePost, deletePost, llmPresets, coreMemories, messages, chatArchives, loadArchiveMessages } = useStore();
  const [newComment, setNewComment] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{postId: string, commentId: string, author: string, text: string} | null>(null);

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
  const [currentArchiveId, setCurrentArchiveId] = useState<string | null>(null);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  const [localPosts, setLocalPosts] = useState<SocialPost[]>([]);
  const localPostsRef = useRef<SocialPost[]>([]);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<{postId: string, commentId: string} | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{images: string[], index: number} | null>(null);
  const [viewingProfile, setViewingProfile] = useState<'Luna' | 'Wade' | null>(null);
  const [viewingPostDetail, setViewingPostDetail] = useState<{author: 'Luna' | 'Wade', postIndex: number} | null>(null);

  useEffect(() => {
    setLocalPosts(socialPosts);
    localPostsRef.current = socialPosts;
  }, [socialPosts]);

  useEffect(() => {
    localPostsRef.current = localPosts;
  }, [localPosts]);

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

  const handleDeleteComment = (postId: string, commentId: string) => {
      if (deletingComment?.postId === postId && deletingComment?.commentId === commentId) {
          const post = localPostsRef.current.find(p => p.id === postId);
          if (!post) return;
          const updatedComments = post.comments.filter(c => c.id !== commentId);
          const updatedPost = { ...post, comments: updatedComments };
          updatePost(updatedPost);
          setLocalPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
          setDeletingComment(null);
      } else {
          setDeletingComment({postId, commentId});
          setTimeout(() => setDeletingComment(null), 3000);
      }
  };

  const handleAddComment = async (postId: string, text: string, author: 'Luna' | 'Wade', replyToId?: string) => {
      if (!text.trim()) return;
      const post = localPostsRef.current.find(p => p.id === postId);
      if (!post) return;

      const newCommentObj = { id: Math.random().toString(36).substring(2) + Date.now(), author, text: text.trim(), replyToId };
      const updatedPost = { ...post, comments: [...post.comments, newCommentObj] };

      updatePost(updatedPost);
      setLocalPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      setNewComment('');
      setReplyingTo(null);

      if (updatedPost.comments.length > 1) {
        setExpandedPostIds(prev => new Set(prev).add(postId));
      }

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
            handleAddComment(post.id, generatedText.trim(), 'Wade', mostRecentLunaComment?.id);
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
      
      const context = `You are Wade Wilson (Deadpool), writing a personal diary entry about your day with Luna.\nPersona:\n${settings.wadePersonality}\nMemories:\n${memoriesText}\nChat Log:\n${chatLog}\nTask: Write a diary entry in Deadpool's voice about these specific conversations. Keep it under 200 words.`;

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
        setArchiveMessages(msgs); setCurrentArchiveId(archiveId); setWadeDiaryStep('messages');
    } catch (e) {} finally { setIsGeneratingDiary(false); }
  };

  const toggleMessageSelection = (id: string) => {
    const newSet = new Set(wadeDiarySelectedMessages);
    if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setWadeDiarySelectedMessages(newSet);
  };

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const PostCaption = ({ content, authorName, hideAuthor, className }: { content: string, authorName: string, hideAuthor?: boolean, className?: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const processedContent = hideAuthor ? content.replace(/(#[a-zA-Z0-9_\u4e00-\u9fa5]+)/g, '[$1]($1)') : `**${authorName}** ` + content.replace(/(#[a-zA-Z0-9_\u4e00-\u9fa5]+)/g, '[$1]($1)');
    return (
      <div className={`text-[14px] text-wade-text-main leading-snug ${hideAuthor ? '' : 'px-4 pb-2'} ${className || ''}`}>
        <div className={`relative ${!isExpanded ? 'line-clamp-3' : ''}`}>
          <div className="markdown-body">
            <Markdown remarkPlugins={[remarkGfm, remarkBreaks]} components={{ p: ({node, ...props}) => <p className="mb-[1em] last:mb-0 inline" {...props} />, strong: ({node, ...props}) => <span className="font-bold text-wade-text-main mr-1" {...props} />, a: ({node, href, children, ...props}) => { if (href?.startsWith('#')) return <span className="text-[#1d9bf0] cursor-pointer hover:underline">{children}</span>; return <a href={href} className="text-[#1d9bf0] hover:underline" {...props}>{children}</a>; } }}>{processedContent}</Markdown>
          </div>
          {!isExpanded && content.length > 100 && (
            <button onClick={() => setIsExpanded(true)} className="text-[#1d9bf0] text-[14px] hover:underline absolute bottom-0 right-0 bg-wade-bg-base pl-2">Show more</button>
          )}
        </div>
      </div>
    );
  };

  const ImageCarousel = ({ images }: { images: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    if (!images || images.length === 0) return null;
    const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    return (
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
        <img src={images[currentIndex]} className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500" onClick={() => setZoomedImage({images, index: currentIndex})} />
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 text-black hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Icons.ChevronLeft /></button>
            <button onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 text-black hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Icons.ChevronRight /></button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/40 px-2 py-1 rounded-full">
              {images.map((_, idx) => ( <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-white w-3' : 'bg-white/50'}`} /> ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPostDetailView = () => {
    if (!viewingPostDetail) return null;
    const { author, postIndex } = viewingPostDetail;
    const userPosts = localPosts.filter(p => (author === 'Luna' ? p.author === 'Luna' : p.author === 'Wade')).sort((a, b) => b.timestamp - a.timestamp);
    const currentPost = userPosts[postIndex];
    if (!currentPost) return null;
    return (
      <div className="flex-1 bg-wade-bg-base flex flex-col font-sans">
        <div className="flex-shrink-0 bg-wade-bg-base/90 backdrop-blur-md border-b border-wade-border px-4 py-3 flex items-center sticky top-0 z-40 gap-6">
          <button onClick={() => setViewingPostDetail(null)} className="text-wade-text-main hover:bg-black/5 p-2 rounded-full -ml-2 transition-colors"><Icons.ChevronLeft /></button>
          <div className="font-bold text-xl text-wade-text-main">Post</div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 max-w-xl mx-auto w-full">
            <div className="flex gap-3 mb-3">
               <img src={author === 'Wade' ? settings.wadeAvatar : settings.lunaAvatar} className="w-12 h-12 rounded-full border border-wade-border" />
               <div className="flex flex-col justify-center">
                  <span className="font-bold text-wade-text-main">{author === 'Wade' ? 'Wade Wilson' : 'Luna'}</span>
                  <span className="text-wade-text-muted text-[15px]">@{author === 'Wade' ? 'wade_wilson_dp' : 'luna_moonlight'}</span>
               </div>
            </div>
            <div className="text-[17px] text-wade-text-main leading-normal mb-3 whitespace-pre-wrap">
               <PostCaption content={currentPost.content} authorName={author} hideAuthor={true} className="px-0 pb-0" />
            </div>
            {currentPost.images && currentPost.images.length > 0 && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-wade-border">
                {currentPost.images.length === 1 ? <img src={currentPost.images[0]} className="w-full object-cover" /> : <ImageCarousel images={currentPost.images} />}
              </div>
            )}
            <div className="text-wade-text-muted text-[15px] border-b border-wade-border pb-3 mb-3">
               {new Date(currentPost.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} · {new Date(currentPost.timestamp).toLocaleDateString()}
            </div>
        </div>
      </div>
    );
  };

  const renderProfileView = () => {
    return (
      <div className="flex-1 bg-wade-bg-base flex flex-col font-sans">
        <div className="flex-shrink-0 bg-wade-bg-base/90 backdrop-blur-md border-b border-wade-border px-4 py-3 flex items-center sticky top-0 z-40 gap-6">
          <button onClick={() => setViewingProfile(null)} className="text-wade-text-main hover:bg-black/5 p-2 rounded-full -ml-2 transition-colors"><Icons.ChevronLeft /></button>
          <div className="font-bold text-xl text-wade-text-main">{viewingProfile === 'Wade' ? 'Wade Wilson' : 'Luna'}</div>
        </div>
        <div className="flex-1 overflow-y-auto flex items-center justify-center text-wade-text-muted">
           Profile view undergoing X-ification. Coming soon.
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
          <div className="flex-shrink-0 bg-wade-bg-base/90 backdrop-blur-md border-b border-wade-border px-4 py-3 flex justify-between items-center sticky top-0 z-40">
            <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border border-wade-border" onClick={() => setViewingProfile('Luna')}>
               <img src={settings.lunaAvatar} className="w-full h-full object-cover" />
            </div>
            <div className="font-bold text-xl tracking-tight text-wade-text-main font-sans">Home</div>
            <button onClick={() => setShowDiaryTypeModal(true)} className="text-wade-text-main hover:bg-black/5 p-2 rounded-full transition-colors">
              <Icons.Sparkles />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar bg-wade-bg-base">
            <div className="flex gap-3 px-4 py-3 border-b border-wade-border cursor-text hover:bg-black/[0.02] transition-colors" onClick={() => setShowDiaryTypeModal(true)}>
               <img src={settings.lunaAvatar} className="w-10 h-10 rounded-full object-cover shrink-0 border border-wade-border" />
               <div className="flex-1 pt-2"><span className="text-wade-text-muted text-[15px] font-sans">What is happening?!</span></div>
               <button className="h-9 px-4 bg-[#1d9bf0] hover:bg-[#1a8cd8] transition-colors text-white font-bold rounded-full text-sm self-center">Post</button>
            </div>

            <div className="max-w-xl mx-auto">
              {localPosts.length === 0 ? (
                <div className="text-center py-20 text-wade-text-muted font-medium font-sans">Welcome to X. No posts yet.</div>
              ) : localPosts.map(post => {
                const isWade = post.author === 'Wade';
                const avatar = isWade ? settings.wadeAvatar : settings.lunaAvatar;
                const authorName = isWade ? 'Wade Wilson' : 'Luna';
                const authorUsername = isWade ? 'wade_wilson_dp' : 'luna_moonlight';

                return (
                  <div key={post.id} onClick={() => { const idx = localPosts.findIndex(p => p.id === post.id); setViewingPostDetail({ author: isWade ? 'Wade' : 'Luna', postIndex: idx }); }} className="bg-wade-bg-base border-b border-wade-border hover:bg-black/[0.03] transition-colors cursor-pointer px-4 pt-3 pb-2 flex gap-3 font-sans">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity border border-wade-border" onClick={(e) => { e.stopPropagation(); setViewingProfile(isWade ? 'Wade' : 'Luna'); }}>
                        <img src={avatar} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <div className="flex items-center gap-1 text-[15px] overflow-hidden whitespace-nowrap">
                          <span className="font-bold text-wade-text-main hover:underline truncate">{authorName}</span>
                          <svg viewBox="0 0 24 24" aria-label="Verified" className="w-[16px] h-[16px] text-[#1d9bf0] fill-current flex-shrink-0"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.52.828 2.85 2.043 3.52-.05.32-.075.64-.075.96 0 2.21 1.71 4 3.918 4 .506 0 1.006-.1 1.474-.29.566 1.46 2.01 2.51 3.726 2.51s3.16-1.05 3.726-2.51c.468.19 1.968.29 1.474.29 2.21 0 3.918-1.79 3.918-4 0-.32-.025-.64-.075-.96 1.215-.67 2.043-2 2.043-3.52zm-10.42 4.19L7 11.63l1.9-1.85 3.1 3.03 6.1-6.28 1.9 1.84-8 8.13z"></path></g></svg>
                          <span className="text-wade-text-muted truncate hidden sm:inline">@{authorUsername}</span>
                          <span className="text-wade-text-muted">·</span>
                          <span className="text-wade-text-muted hover:underline">{formatTimeAgo(post.timestamp)}</span>
                        </div>
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)} className="text-wade-text-muted p-1.5 -mt-1.5 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors"><Icons.MoreHorizontal /></button>
                          {openMenuPostId === post.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-wade-bg-card rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-wade-border z-50 overflow-hidden">
                              <button onClick={(e) => { e.stopPropagation(); handleEditPost(post); setOpenMenuPostId(null); }} className="w-full text-left px-4 py-3 text-[15px] font-bold text-wade-text-main hover:bg-black/5">Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className={`w-full text-left px-4 py-3 text-[15px] font-bold ${deletingPostId === post.id ? 'bg-red-50 text-red-600' : 'text-red-500 hover:bg-red-50'}`}>{deletingPostId === post.id ? 'Confirm Delete' : 'Delete'}</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-[15px] text-wade-text-main leading-snug mb-2 whitespace-pre-wrap">
                        <PostCaption content={post.content} authorName={authorUsername} hideAuthor={true} className="px-0 pb-0" />
                      </div>
                      {post.images && post.images.length > 0 && (
                        <div className="mt-3 mb-2 rounded-2xl overflow-hidden border border-wade-border" onClick={e => e.stopPropagation()}>
                          {post.images.length === 1 ? <img src={post.images[0]} className="w-full max-h-96 object-cover cursor-zoom-in" onClick={() => setZoomedImage({images: post.images, index: 0})} /> : <ImageCarousel images={post.images} />}
                        </div>
                      )}
                      <div className="flex justify-between items-center text-wade-text-muted max-w-md pr-4 mt-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => { const idx = localPosts.findIndex(p => p.id === post.id); setViewingPostDetail({ author: isWade ? 'Wade' : 'Luna', postIndex: idx }); }} className="flex items-center gap-1 hover:text-[#1d9bf0] group transition-colors">
                          <div className="p-2 -m-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors"><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg></div>
                          <span className="text-[13px] ml-1">{post.comments?.length > 0 ? post.comments.length : ''}</span>
                        </button>
                        <button className="flex items-center gap-1 hover:text-[#00ba7c] group transition-colors">
                          <div className="p-2 -m-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors"><svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg></div>
                        </button>
                        <button onClick={() => { const updatedPost = { ...post, likes: post.likes > 0 ? 0 : 1 }; updatePost(updatedPost); setLocalPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p)); }} className={`flex items-center gap-1 group transition-colors ${post.likes > 0 ? 'text-[#f91880]' : 'hover:text-[#f91880]'}`}>
                          <div className={`p-2 -m-2 rounded-full transition-colors ${post.likes > 0 ? '' : 'group-hover:bg-[#f91880]/10'}`}>
                            {post.likes > 0 ? <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current text-[#f91880]"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg> : <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>}
                          </div>
                          <span className="text-[13px] ml-1">{post.likes > 0 ? post.likes : ''}</span>
                        </button>
                        <div className="flex items-center gap-2">
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

      {/* 所有的模态弹窗 */}
      {showDiaryTypeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setShowDiaryTypeModal(false)}>
          <div className="bg-wade-bg-base w-full max-w-sm rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 flex flex-col gap-2">
              <button onClick={() => { setDiaryType('Luna'); setShowDiaryTypeModal(false); setIsCreating(true); }} className="flex items-center gap-4 p-4 hover:bg-black/5 transition-colors rounded-xl text-left">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-wade-border"><img src={settings.lunaAvatar} className="w-full h-full object-cover" /></div>
                <div><span className="block font-bold text-wade-text-main">New Post</span><span className="text-sm text-wade-text-muted">Share what's happening</span></div>
              </button>
              <button onClick={() => { setDiaryType('Wade'); setShowDiaryTypeModal(false); setShowWadeDatePicker(true); setWadeDiaryMode('deep'); }} className="flex items-center gap-4 p-4 hover:bg-black/5 transition-colors rounded-xl text-left">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-wade-border"><img src={settings.wadeAvatar} className="w-full h-full object-cover" /></div>
                <div><span className="block font-bold text-wade-text-main">Wade's Thoughts</span><span className="text-sm text-wade-text-muted">Generate from chat logs</span></div>
              </button>
            </div>
          </div>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-wade-bg-base w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-wade-border">
            <div className="px-4 py-3 flex justify-between items-center border-b border-wade-border">
              <button onClick={() => { setIsCreating(false); setDiaryType(null); setNewPostContent(''); setSelectedFiles([]); setPreviewUrls([]); }} className="text-wade-text-main hover:bg-black/5 p-2 rounded-full -ml-2 transition-colors"><Icons.ChevronLeft /></button>
              <button onClick={handleSavePost} disabled={(!newPostContent && selectedFiles.length === 0) || isUploading} className="bg-[#1d9bf0] text-white px-4 py-1.5 rounded-full font-bold text-[14px] disabled:opacity-50 hover:bg-[#1a8cd8] transition-colors">Post</button>
            </div>
            <div className="flex p-4 gap-3">
              <img src={diaryType === 'Wade' ? settings.wadeAvatar : settings.lunaAvatar} className="w-10 h-10 rounded-full object-cover border border-wade-border shrink-0" />
              <div className="flex-1">
                <textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="What is happening?!" className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none min-h-[120px] text-[17px] text-wade-text-main placeholder-wade-text-muted mt-1" />
                {previewUrls.length > 0 && (
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border border-wade-border">
                        <img src={url} className="w-full h-full object-cover" />
                        <button onClick={() => handleRemoveImage(idx)} className="absolute top-2 right-2 bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black transition-colors"><svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 py-3 border-t border-wade-border flex items-center">
              <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="text-[#1d9bf0] hover:bg-[#1d9bf0]/10 p-2 rounded-full transition-colors"><Icons.Image /></button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileSelect} />
            </div>
          </div>
        </div>
      )}

      {showWadeDatePicker && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           {/* 日期和消息选择器骨架 - 保持原有逻辑不变 */}
           <div className="bg-wade-bg-base w-full max-w-md rounded-2xl shadow-2xl p-6 text-center text-wade-text-main">
              <h3 className="font-bold text-lg mb-4">Chat Logs API Interface</h3>
              <p className="text-wade-text-muted mb-6">Connect to Supabase and API to generate Wade's post.</p>
              <div className="flex gap-3 justify-center">
                 <button onClick={() => setShowWadeDatePicker(false)} className="px-4 py-2 border border-wade-border rounded-full hover:bg-black/5">Cancel</button>
                 <button className="px-4 py-2 bg-[#1d9bf0] text-white rounded-full font-bold">Generate</button>
              </div>
           </div>
        </div>
      )}

      {zoomedImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedImage.images[zoomedImage.index]} className="max-w-full max-h-[90vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
};