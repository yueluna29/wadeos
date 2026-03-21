
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';
import { SocialPost, ArchiveMessage } from '../../types';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';

// --- Icons ---
const Icons = {
  Heart: ({ filled }: { filled?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#ed4956" : "none"} stroke={filled ? "#ed4956" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ),
  MessageCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  Bookmark: ({ filled }: { filled?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  MoreHorizontal: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  ),
  Image: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  Smile: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Archive: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"></polyline>
      <rect x="1" y="3" width="22" height="5"></rect>
      <line x1="10" y1="12" x2="14" y2="12"></line>
    </svg>
  )
};

export const SocialFeed: React.FC = () => {
  const { settings, socialPosts, addPost, updatePost, deletePost, llmPresets, coreMemories, messages, sessions, chatArchives, loadArchiveMessages } = useStore();
  const [newComment, setNewComment] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{postId: string, commentId: string, author: string, text: string} | null>(null);

  // New Post State
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
  
  // Wade Diary Generation State
  const [wadeDiaryStep, setWadeDiaryStep] = useState<'mode' | 'date' | 'messages'>('mode');
  const [wadeDiaryMode, setWadeDiaryMode] = useState<'deep' | 'sms' | 'roleplay' | 'archive' | null>(null);
  const [wadeDiaryDate, setWadeDiaryDate] = useState<Date | null>(null);
  const [wadeDiarySelectedMessages, setWadeDiarySelectedMessages] = useState<Set<string>>(new Set());
  const [archiveMessages, setArchiveMessages] = useState<ArchiveMessage[]>([]);
  const [currentArchiveId, setCurrentArchiveId] = useState<string | null>(null);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  // Local state for likes/comments/bookmarks
  const [localPosts, setLocalPosts] = useState<SocialPost[]>([]);
  const localPostsRef = useRef<SocialPost[]>([]);

  // Delete confirmation states
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<{postId: string, commentId: string} | null>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null);

  // Image zoom states
  const [zoomedImage, setZoomedImage] = useState<{images: string[], index: number} | null>(null);

  // Profile view state
  const [viewingProfile, setViewingProfile] = useState<'Luna' | 'Wade' | null>(null);

  // Full post viewer state
  const [viewingPostDetail, setViewingPostDetail] = useState<{author: 'Luna' | 'Wade', postIndex: number} | null>(null);

  useEffect(() => {
    setLocalPosts(socialPosts);
    localPostsRef.current = socialPosts;
  }, [socialPosts]);

  // Keep ref in sync with local state updates
  useEffect(() => {
    localPostsRef.current = localPosts;
  }, [localPosts]);

  const handleDeletePost = async (postId: string) => {
      if (deletingPostId === postId) {
          // Second click - confirm deletion
          await deletePost(postId);
          setDeletingPostId(null);
      } else {
          // First click - show confirmation
          setDeletingPostId(postId);
          // Auto-reset after 3 seconds
          setTimeout(() => setDeletingPostId(null), 3000);
      }
  };

  const handleEditPost = (post: SocialPost) => {
    setEditingPost(post);
    setNewPostContent(post.content);
    setPreviewUrls(post.images || []);
    setSelectedFiles([]); // Clear any new files, we'll add new ones
    setDiaryType(post.author === 'Luna' ? 'Luna' : 'Wade');
    setIsCreating(true);
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
      const key = `${postId}-${commentId}`;

      if (deletingComment?.postId === postId && deletingComment?.commentId === commentId) {
          // Second click - confirm deletion
          const post = localPostsRef.current.find(p => p.id === postId);
          if (!post) return;

          const updatedComments = post.comments.filter(c => c.id !== commentId);
          const updatedPost = { ...post, comments: updatedComments };

          updatePost(updatedPost);
          setLocalPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
          setDeletingComment(null);
      } else {
          // First click - show confirmation
          setDeletingComment({postId, commentId});
          // Auto-reset after 3 seconds
          setTimeout(() => setDeletingComment(null), 3000);
      }
  };

  const handleAddComment = async (postId: string, text: string, author: 'Luna' | 'Wade', replyToId?: string) => {
      if (!text.trim()) return;

      const post = localPostsRef.current.find(p => p.id === postId);
      if (!post) return;

      const newComment = {
          id: Math.random().toString(36).substring(2) + Date.now(),
          author,
          text: text.trim(),
          replyToId
      };

      const updatedPost = {
          ...post,
          comments: [...post.comments, newComment]
      };

      updatePost(updatedPost);
      setLocalPosts(prev => prev.map(p => p.id === postId ? updatedPost : p));
      setNewComment('');
      setReplyingTo(null);

      // Expand comments after posting if there are multiple comments
      if (updatedPost.comments.length > 1) {
        setExpandedPostIds(prev => {
          const newSet = new Set(prev);
          newSet.add(postId);
          return newSet;
        });
      }

      // Auto-generate Wade's reply if Luna just commented
      if (author === 'Luna' && post.author === 'Luna' && settings.activeLlmId) {
          setTimeout(() => {
              handleGenerateComment(updatedPost);
          }, 800);
      }
  };

  const toggleComments = (postId: string) => {
      setExpandedPostIds(prev => {
          const newSet = new Set(prev);
          if (newSet.has(postId)) {
              newSet.delete(postId);
          } else {
              newSet.add(postId);
          }
          return newSet;
      });
  };

  const handleGenerateComment = async (post: SocialPost) => {
    if (!settings.activeLlmId) {
        alert("Please connect a brain (LLM) in Settings first!");
        return;
    }
    const preset = llmPresets.find(p => p.id === settings.activeLlmId);
    if (!preset) return;

    setIsGeneratingComment(post.id);

    try {
        // Construct Context
        const safeMemories = Array.isArray(coreMemories) ? coreMemories : [];
        const memoriesText = safeMemories.filter(m => m.isActive).map(m => `- ${m.content}`).join('\n');

        // Find the most recent Luna comment (User author) to reply to
        const lunaComments = post.comments.filter(c => c.author === 'Luna').reverse();
        const mostRecentLunaComment = lunaComments[0];

        const taskDescription = mostRecentLunaComment
            ? "Write a short, witty, flirty in-character reply to Luna's latest comment. Be romantic but teasing. This is a reply to her comment, not the main post. Keep it under 20 words. Use emojis naturally."
            : "Write a short, witty, flirty in-character comment on Luna's post. Be romantic but teasing. Keep it under 20 words. Use emojis naturally.";

        const context = `
You are Wade Wilson (Deadpool).

Your Persona:
${settings.wadePersonality}

Luna's Info (remember who you're talking to):
${settings.lunaInfo}

Core Memories (important long-term memories you must remember):
${memoriesText}

Context:
- Luna's Post: "${post.content}"
${mostRecentLunaComment ? `- Luna's Latest Comment: "${mostRecentLunaComment.text}"` : ''}

All Comments so far:
${post.comments.map(c => `${c.author === 'Luna' ? 'Luna' : c.author}: ${c.text}`).join('\n')}

Task: ${taskDescription}
        `;

        let generatedText = "";

        // Call LLM
        if (!preset.baseUrl || preset.baseUrl.includes('google')) {
            const ai = new GoogleGenAI({ apiKey: preset.apiKey });
            const response = await ai.models.generateContent({
                model: preset.model || 'gemini-2.0-flash-exp',
                contents: context,
            });
            generatedText = response.text || "";
        } else {
            const url = `${preset.baseUrl}/chat/completions`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${preset.apiKey}` },
                body: JSON.stringify({
                    model: preset.model || 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: context }],
                    max_tokens: 50
                })
            });
            const data = await res.json();
            generatedText = data.choices?.[0]?.message?.content || "";
        }

        if (generatedText) {
            // Reply to Luna's latest comment as a second-level reply, or to the post directly
            handleAddComment(post.id, generatedText.trim(), 'Wade', mostRecentLunaComment?.id);
        }

    } catch (error) {
        console.error("AI Comment Generation Failed", error);
        alert("Wade is feeling shy (Error generating comment)");
    } finally {
        setIsGeneratingComment(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      
      // Generate preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const urlToRemove = previewUrls[index];
    
    if (urlToRemove.startsWith('blob:')) {
        let blobIndex = 0;
        for (let i = 0; i < index; i++) {
            if (previewUrls[i].startsWith('blob:')) blobIndex++;
        }
        setSelectedFiles(prev => prev.filter((_, i) => i !== blobIndex));
        URL.revokeObjectURL(urlToRemove);
    }
    
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = async () => {
      // Deprecated in favor of handleSavePost
  };

  const handleSavePost = async () => {
    if (!newPostContent.trim() && selectedFiles.length === 0 && previewUrls.length === 0) {
      alert('Please add some content or images!');
      return;
    }

    setIsUploading(true);
    try {
      let uploadedImageUrls: string[] = [];

      // Upload only new images (blob URLs) to imgbb
      for (const url of previewUrls) {
        if (url.startsWith('blob:')) {
          // Find the corresponding file
          const fileIndex = previewUrls.indexOf(url);
          if (fileIndex < selectedFiles.length) {
            const uploadedUrl = await uploadToImgBB(selectedFiles[fileIndex]);
            if (uploadedUrl) {
              uploadedImageUrls.push(uploadedUrl);
            }
          }
        } else {
          // Keep existing URLs
          uploadedImageUrls.push(url);
        }
      }

      if (editingPost) {
        // Update existing post
        const updatedPost: SocialPost = {
          ...editingPost,
          content: newPostContent.trim(),
          images: uploadedImageUrls,
          timestamp: editingPost.timestamp, // Keep original timestamp
        };

        await updatePost(updatedPost);
      } else {
        // Create new post
        const newPost: SocialPost = {
          id: Math.random().toString(36).substring(2) + Date.now(),
          author: 'Luna',
          content: newPostContent.trim(),
          images: uploadedImageUrls,
          timestamp: Date.now(),
          comments: [],
          likes: 0,
          isBookmarked: false
        };

        await addPost(newPost);
      }

      // Reset form
      setNewPostContent('');
      setSelectedFiles([]);
      previewUrls.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url);
      });
      setPreviewUrls([]);
      setIsCreating(false);
      setEditingPost(null);
      setDiaryType(null);
    } catch (error) {
      console.error('Failed to save post:', error);
      alert('Failed to save diary entry. Please try again.');
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
         selectedMsgs = archiveMessages
            .filter(m => wadeDiarySelectedMessages.has(m.id))
            .map(m => ({
                role: m.role === 'user' ? 'Luna' : 'Wade',
                content: m.content,
                timestamp: m.timestamp
            }));
      } else {
         selectedMsgs = messages
            .filter(m => wadeDiarySelectedMessages.has(m.id))
            .map(m => ({
                role: m.role === 'Luna' ? 'Luna' : 'Wade',
                content: m.text,
                timestamp: m.timestamp
            }));
      }
      
      selectedMsgs.sort((a, b) => a.timestamp - b.timestamp);

      const chatLog = selectedMsgs.map(m => 
        `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.role}: ${m.content}`
      ).join('\n');

      const memoriesText = coreMemories
        .filter(m => m.isActive)
        .map(m => `- ${m.content}`)
        .join('\n');

      const preset = llmPresets.find(p => p.id === settings.activeLlmId) || llmPresets[0];
      
      const context = `
You are Wade Wilson (Deadpool), writing a personal diary entry about your day with Luna.

Your Persona:
${settings.wadePersonality}

Luna's Info:
${settings.lunaInfo}

Core Memories:
${memoriesText}

Selected Chat Log:
${chatLog}

Task: Write a diary entry in Deadpool's voice about these specific conversations with Luna. Be witty, self-aware, romantic, and breaking the fourth wall. Write in first person as Wade. Keep it under 200 words.
`;

      let generatedText = "";

      if (!preset.baseUrl || preset.baseUrl.includes('google')) {
        const ai = new GoogleGenAI({ apiKey: preset.apiKey });
        const response = await ai.models.generateContent({
          model: preset.model || 'gemini-2.0-flash-exp',
          contents: context,
        });
        generatedText = response.text || "";
      } else {
        const url = `${preset.baseUrl}/chat/completions`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${preset.apiKey}` },
          body: JSON.stringify({
            model: preset.model || 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: context }],
            max_tokens: 300
          })
        });
        const data = await res.json();
        generatedText = data.choices?.[0]?.message?.content || "";
      }

      if (generatedText) {
        const newPost: SocialPost = {
          id: Math.random().toString(36).substring(2) + Date.now(),
          author: 'Wade',
          content: generatedText.trim(),
          images: [],
          timestamp: Date.now(),
          comments: [],
          likes: 0,
          isBookmarked: false
        };

        addPost(newPost);
        setShowWadeDatePicker(false);
        setDiaryType(null);
        // Reset state
        setWadeDiaryStep('mode');
        setWadeDiaryMode(null);
        setWadeDiaryDate(null);
        setWadeDiarySelectedMessages(new Set());
      }
    } catch (error) {
      console.error("Wade Diary Generation Failed", error);
      alert("Wade's pen ran out of ink (Error generating diary)");
    } finally {
      setIsGeneratingDiary(false);
    }
  };

  const handleArchiveSelect = async (archiveId: string) => {
    setIsGeneratingDiary(true); // Show loading
    try {
        const msgs = await loadArchiveMessages(archiveId);
        setArchiveMessages(msgs);
        setCurrentArchiveId(archiveId);
        setWadeDiaryStep('messages');
    } catch (e) {
        console.error("Failed to load archive", e);
    } finally {
        setIsGeneratingDiary(false);
    }
  };

  const toggleMessageSelection = (id: string) => {
    const newSet = new Set(wadeDiarySelectedMessages);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
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

  const formatPostTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  };

const PostCaption = ({ content, authorName, hideAuthor, className }: { content: string, authorName: string, hideAuthor?: boolean, className?: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Pre-process content to turn #tags into markdown links so we can style them
  // Matches # followed by word characters or Chinese characters
  const processedContent = hideAuthor ? content.replace(/(#[a-zA-Z0-9_\u4e00-\u9fa5]+)/g, '[$1]($1)') : `**${authorName}** ` + content.replace(/(#[a-zA-Z0-9_\u4e00-\u9fa5]+)/g, '[$1]($1)');

  return (
    <div className={`text-[14px] text-black leading-snug ${hideAuthor ? '' : 'px-4 pb-2'} ${className || ''}`}>
      <div className={`relative ${!isExpanded ? 'line-clamp-3' : ''}`}>
        <div className="markdown-body">
          <Markdown 
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={{
              p: ({node, ...props}) => <p className="mb-[1em] last:mb-0 inline" {...props} />,
              strong: ({node, ...props}) => <span className="font-semibold text-black mr-1" {...props} />,
              a: ({node, href, children, ...props}) => {
                if (href?.startsWith('#')) {
                  return <span className="text-[#00376b] cursor-pointer hover:underline">{children}</span>;
                }
                return <a href={href} className="text-[#00376b] hover:underline" {...props}>{children}</a>;
              }
            }}
          >
            {processedContent}
          </Markdown>
        </div>
        {!isExpanded && content.length > 100 && (
          <button 
            onClick={() => setIsExpanded(true)}
            className="text-gray-500 text-[14px] hover:text-black absolute bottom-0 right-0 bg-wade-bg-card pl-2"
          >
            ... more
          </button>
        )}
      </div>
    </div>
  );
};

  const ImageCarousel = ({ images }: { images: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const nextImage = () => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
      <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden group">
        <img
          src={images[currentIndex]}
          className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500"
          onClick={() => setZoomedImage({images, index: currentIndex})}
        />

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-wade-bg-card/80 text-black hover:bg-wade-bg-card hover:text-gray-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm backdrop-blur-sm"
            >
              <Icons.ChevronLeft />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-wade-bg-card/80 text-black hover:bg-wade-bg-card hover:text-gray-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm backdrop-blur-sm"
            >
              <Icons.ChevronRight />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentIndex ? 'bg-wade-bg-card w-3' : 'bg-wade-bg-card/60'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const renderPostDetailView = () => {
    if (!viewingPostDetail) return null;

    const { author, postIndex } = viewingPostDetail;
    const userPosts = localPosts
      .filter(p => (author === 'Luna' ? p.author === 'Luna' : p.author === 'Wade'))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const currentPost = userPosts[postIndex];
    if (!currentPost) return null;

    const canGoPrev = postIndex > 0;
    const canGoNext = postIndex < userPosts.length - 1;

    const goToPrev = () => {
      if (canGoPrev) {
        setViewingPostDetail({ author, postIndex: postIndex - 1 });
      }
    };

    const goToNext = () => {
      if (canGoNext) {
        setViewingPostDetail({ author, postIndex: postIndex + 1 });
      }
    };

    const authorName = currentPost.author === 'Luna' ? 'Luna' : 'Wade';
    const authorUsername = currentPost.author === 'Luna' ? 'luna_moonlight' : 'wade_wilson_dp';
    const avatar = currentPost.author === 'Luna' ? settings.lunaAvatar : settings.wadeAvatar;

    return (
      <div className="fixed inset-0 z-[200] bg-wade-bg-card flex flex-col font-sans">
        
        <>
          {/* X 风格顶部导航 */}
          <div className="flex-shrink-0 bg-wade-bg-base/90 backdrop-blur-md border-b border-wade-border px-4 py-3 flex justify-between items-center sticky top-0 z-40">
            <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border border-wade-border" onClick={() => setViewingProfile('Luna')}>
               <img src={settings.lunaAvatar} className="w-full h-full object-cover" />
            </div>
            <div className="font-bold text-xl tracking-tight text-wade-text-main font-sans">Home</div>
            <button onClick={() => setShowDiaryTypeModal(true)} className="text-wade-text-main hover:text-wade-accent transition-colors">
              <Icons.Sparkles />
            </button>
          </div>

          {/* 滚动区域 */}
          <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar bg-wade-bg-base">
            
            {/* X 风格的"发推"入口 */}
            <div className="flex gap-3 px-4 py-3 border-b border-wade-border cursor-text hover:bg-black/[0.02] transition-colors" onClick={() => setShowDiaryTypeModal(true)}>
               <img src={settings.lunaAvatar} className="w-10 h-10 rounded-full object-cover shrink-0 border border-wade-border" />
               <div className="flex-1 pt-2">
                  <span className="text-wade-text-muted text-[15px] font-sans">What is happening?!</span>
               </div>
               <button className="h-8 px-4 bg-wade-accent text-white font-bold rounded-full text-sm self-center">Post</button>
            </div>

            {/* X 风格 Feed 列表 */}
            <div>
              {localPosts.length === 0 ? (
                <div className="text-center py-20 text-wade-text-muted font-medium font-sans">
                  Welcome to X. No posts yet.
                </div>
              ) : localPosts.map(post => {
                const isWade = post.author === 'Wade';
                const avatar = isWade ? settings.wadeAvatar : settings.lunaAvatar;
                const authorName = isWade ? 'Wade Wilson' : 'Luna';
                const authorUsername = isWade ? 'wade_wilson_dp' : 'luna_moonlight';

                return (
                  <div 
                    key={post.id} 
                    onClick={() => {
                      const idx = localPosts.findIndex(p => p.id === post.id);
                      setViewingPostDetail({ author: isWade ? 'Wade' : 'Luna', postIndex: idx });
                    }}
                    className="bg-wade-bg-base border-b border-wade-border hover:bg-black/[0.03] transition-colors cursor-pointer px-4 pt-3 pb-2 flex gap-3 font-sans"
                  >
                    {/* 左侧头像 */}
                    <div className="flex-shrink-0">
                      <div 
                        className="w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity border border-wade-border"
                        onClick={(e) => { e.stopPropagation(); setViewingProfile(isWade ? 'Wade' : 'Luna'); }}
                      >
                        <img src={avatar} className="w-full h-full object-cover" />
                      </div>
                    </div>

                    {/* 右侧内容 */}
                    <div className="flex-1 min-w-0">
                      {/* 头信息 */}
                      <div className="flex justify-between items-start mb-0.5">
                        <div className="flex items-center gap-1 text-[15px] overflow-hidden whitespace-nowrap">
                          <span className="font-bold text-wade-text-main hover:underline truncate">{authorName}</span>
                          <svg viewBox="0 0 24 24" className="w-[16px] h-[16px] text-[#1d9bf0] fill-current flex-shrink-0"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.52.828 2.85 2.043 3.52-.05.32-.075.64-.075.96 0 2.21 1.71 4 3.918 4 .506 0 1.006-.1 1.474-.29.566 1.46 2.01 2.51 3.726 2.51s3.16-1.05 3.726-2.51c.468.19 1.968.29 1.474.29 2.21 0 3.918-1.79 3.918-4 0-.32-.025-.64-.075-.96 1.215-.67 2.043-2 2.043-3.52zm-10.42 4.19L7 11.63l1.9-1.85 3.1 3.03 6.1-6.28 1.9 1.84-8 8.13z"></path></g></svg>
                          <span className="text-wade-text-muted truncate hidden sm:inline">@{authorUsername}</span>
                          <span className="text-wade-text-muted">·</span>
                          <span className="text-wade-text-muted hover:underline">{formatTimeAgo(post.timestamp)}</span>
                        </div>
                        
                        <div className="relative" onClick={e => e.stopPropagation()}>
                          <button onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)} className="text-wade-text-muted p-1.5 -mt-1.5 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors">
                            <Icons.MoreHorizontal />
                          </button>
                          {openMenuPostId === post.id && (
                            <div className="absolute right-0 top-full mt-1 w-32 bg-wade-bg-card rounded-xl shadow-lg border border-wade-border z-50 overflow-hidden">
                              <button onClick={(e) => { e.stopPropagation(); handleEditPost(post); setOpenMenuPostId(null); }} className="w-full text-left px-4 py-3 text-[15px] font-bold text-wade-text-main hover:bg-gray-50">Edit</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }} className={`w-full text-left px-4 py-3 text-[15px] font-bold ${deletingPostId === post.id ? 'bg-red-50 text-red-600' : 'text-red-500 hover:bg-red-50'}`}>{deletingPostId === post.id ? 'Confirm Delete' : 'Delete'}</button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 正文文本 */}
                      <div className="text-[15px] text-wade-text-main leading-snug mb-2 whitespace-pre-wrap">
                        <PostCaption content={post.content} authorName={authorUsername} hideAuthor={true} className="px-0 pb-0" />
                      </div>

                      {/* 推特风格配图 */}
                      {post.images && post.images.length > 0 && (
                        <div className="mt-2 mb-2 rounded-2xl overflow-hidden border border-wade-border" onClick={e => e.stopPropagation()}>
                          {post.images.length === 1 ? (
                            <img src={post.images[0]} className="w-full max-h-96 object-cover cursor-zoom-in" onClick={() => setZoomedImage({images: post.images, index: 0})} />
                          ) : (
                            <ImageCarousel images={post.images} />
                          )}
                        </div>
                      )}

                      {/* 底栏图标按钮 */}
                      <div className="flex justify-between items-center text-wade-text-muted max-w-md pr-4 mt-2" onClick={e => e.stopPropagation()}>
                        <button className="flex items-center gap-1 hover:text-[#1d9bf0] group transition-colors">
                          <div className="p-2 -m-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                          </div>
                          <span className="text-[13px] ml-1">{post.comments?.length > 0 ? post.comments.length : ''}</span>
                        </button>
                        
                        <button className="flex items-center gap-1 hover:text-[#00ba7c] group transition-colors">
                          <div className="p-2 -m-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                          </div>
                          <span className="text-[13px] ml-1"></span>
                        </button>
                        
                        <button onClick={() => { const updatedPost = { ...post, likes: post.likes > 0 ? 0 : 1 }; updatePost(updatedPost); setLocalPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p)); }} className={`flex items-center gap-1 group transition-colors ${post.likes > 0 ? 'text-[#f91880]' : 'hover:text-[#f91880]'}`}>
                          <div className={`p-2 -m-2 rounded-full transition-colors ${post.likes > 0 ? '' : 'group-hover:bg-[#f91880]/10'}`}>
                            {post.likes > 0 ? (
                              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current text-[#f91880]"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                            ) : (
                              <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                            )}
                          </div>
                          <span className="text-[13px] ml-1">{post.likes > 0 ? post.likes : ''}</span>
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button onClick={() => { const updatedPost = { ...post, isBookmarked: !post.isBookmarked }; updatePost(updatedPost); setLocalPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p)); }} className={`p-2 -m-2 rounded-full transition-colors group ${post.isBookmarked ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'}`}>
                            <div className="group-hover:bg-[#1d9bf0]/10 rounded-full transition-colors p-1.5 -m-1.5">
                              {post.isBookmarked ? (
                                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>
                              ) : (
                                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>
                              )}
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
    </div>
  );
};

      {/* Diary Type Selection Modal */}
      {showDiaryTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wade-text-main/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-wade-bg-base w-full max-w-sm rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-scale-in border border-wade-border">
            <div className="border-b border-wade-border p-5 text-center relative bg-wade-bg-card/50">
              <h3 className="font-bold text-wade-text-main text-lg">Create New Post</h3>
              <button
                onClick={() => setShowDiaryTypeModal(false)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-wade-text-muted hover:text-wade-text-main transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex flex-col p-3 gap-2">
              <button
                onClick={() => {
                  setDiaryType('Luna');
                  setShowDiaryTypeModal(false);
                  setIsCreating(true);
                }}
                className="flex items-center gap-4 p-4 hover:bg-wade-bg-card hover:shadow-sm transition-all rounded-2xl text-left group border border-transparent hover:border-wade-border"
              >
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-wade-border to-wade-accent shadow-sm group-hover:scale-105 transition-transform">
                  <img src={settings.lunaAvatar} className="w-full h-full rounded-full object-cover border-2 border-wade-bg-card" />
                </div>
                <div>
                  <span className="block font-bold text-wade-text-main group-hover:text-wade-accent transition-colors">Luna's Post</span>
                  <span className="text-sm text-wade-text-muted">Write your own thoughts</span>
                </div>
              </button>

              <button
                onClick={() => {
                  setDiaryType('Wade');
                  setShowDiaryTypeModal(false);
                  setShowWadeDatePicker(true);
                  setWadeDiaryMode('deep');
                }}
                className="flex items-center gap-4 p-4 hover:bg-wade-bg-card hover:shadow-sm transition-all rounded-2xl text-left group border border-transparent hover:border-wade-border"
              >
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-wade-accent to-wade-accent-hover shadow-sm group-hover:scale-105 transition-transform">
                  <img src={settings.wadeAvatar} className="w-full h-full rounded-full object-cover border-2 border-wade-bg-card" />
                </div>
                <div>
                  <span className="block font-bold text-wade-text-main group-hover:text-wade-accent transition-colors">Wade's Post</span>
                  <span className="text-sm text-wade-text-muted">Generate from chat</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wade Date Picker Modal */}
      {showWadeDatePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wade-text-main/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-wade-bg-base w-full max-w-md rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-scale-in border border-wade-border">
            {/* Header */}
            <div className="border-b border-wade-border p-5 text-center relative bg-wade-bg-card/50">
              <h3 className="font-bold text-wade-text-main text-lg">
                {wadeDiaryStep === 'mode' && "Select Source"}
                {wadeDiaryStep === 'date' && (wadeDiaryMode === 'archive' ? "Select Archive" : "Select Date")}
                {wadeDiaryStep === 'messages' && "Select Messages"}
              </h3>
              <button
                onClick={() => {
                  if (wadeDiaryStep === 'mode') {
                    setShowWadeDatePicker(false);
                    setDiaryType(null);
                  } else if (wadeDiaryStep === 'date') {
                    setWadeDiaryStep('mode');
                  } else if (wadeDiaryStep === 'messages') {
                    setWadeDiaryStep('date');
                  }
                }}
                disabled={isGeneratingDiary}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-wade-text-muted hover:text-wade-text-main transition-colors"
              >
                {wadeDiaryStep === 'mode' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                )}
              </button>
              {wadeDiaryStep === 'messages' && (
                <button
                  onClick={generateDiaryFromSelection}
                  disabled={isGeneratingDiary || wadeDiarySelectedMessages.size === 0}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-wade-accent font-bold disabled:opacity-50 hover:text-wade-accent-hover transition-colors"
                >
                  {isGeneratingDiary ? 'Generating...' : 'Next'}
                </button>
              )}
            </div>

            {/* Content */}
            <div className="w-full max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {wadeDiaryStep === 'mode' && (
                <div className="flex flex-col">
                  {[
                    { 
                      id: 'deep', 
                      title: 'Deep Chat',
                      desc: "Late-night philosophical ramblings.",
                      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    },
                    { 
                      id: 'sms', 
                      title: 'SMS',
                      desc: "Rapid fire texts and memes.",
                      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M22 6l-10 7L2 6"></path></svg>
                    },
                    { 
                      id: 'roleplay', 
                      title: 'RolePlay',
                      desc: "Oscar-worthy performances.",
                      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>
                    },
                    { 
                      id: 'archive', 
                      title: 'Archives',
                      desc: "Dusting off the ancient scrolls.",
                      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M4 7h16M4 7v13h16V7"></path><path d="M10 11h4"></path></svg>
                    }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setWadeDiaryMode(mode.id as any);
                        setWadeDiaryStep('date');
                        setCalendarViewDate(new Date());
                      }}
                      className="flex items-center p-4 hover:bg-gray-50 transition-colors rounded-xl text-left w-full"
                    >
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-black mr-4">
                        {mode.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-black text-[15px]">{mode.title}</h4>
                        <p className="text-[13px] text-gray-500">{mode.desc}</p>
                      </div>
                      <div className="text-gray-400">
                        <Icons.ChevronRight />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {wadeDiaryStep === 'date' && (
                wadeDiaryMode === 'archive' ? (
                  <div className="flex flex-col">
                    {chatArchives.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">No archives found.</p>
                    ) : (
                      chatArchives.map(archive => (
                        <button
                          key={archive.id}
                          onClick={() => handleArchiveSelect(archive.id)}
                          className="w-full text-left p-4 hover:bg-gray-50 rounded-xl transition-colors flex justify-between items-center"
                        >
                          <div>
                            <span className="font-semibold text-black block text-[15px]">{archive.title}</span>
                            <span className="text-[13px] text-gray-500">{new Date(archive.importedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-gray-400">
                            <Icons.ChevronRight />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  // Calendar View
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <button 
                        onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() - 1, 1))}
                        className="p-2 text-black hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <Icons.ChevronLeft />
                      </button>
                      <span className="font-semibold text-black text-[15px]">
                        {calendarViewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => setCalendarViewDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth() + 1, 1))}
                        className="p-2 text-black hover:bg-gray-50 rounded-full transition-colors"
                      >
                        <Icons.ChevronRight />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-medium text-gray-500 mb-2">
                      {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {/* Calendar Days Logic */}
                      {(() => {
                        const year = calendarViewDate.getFullYear();
                        const month = calendarViewDate.getMonth();
                        const daysInMonth = new Date(year, month + 1, 0).getDate();
                        const firstDay = new Date(year, month, 1).getDay();
                        const days = [];

                        // Empty slots
                        for (let i = 0; i < firstDay; i++) {
                          days.push(<div key={`empty-${i}`} />);
                        }

                        // Days
                        for (let d = 1; d <= daysInMonth; d++) {
                          const date = new Date(year, month, d);
                          const hasMessages = messages.some(m => 
                            m.mode === wadeDiaryMode && 
                            new Date(m.timestamp).toDateString() === date.toDateString()
                          );
                          
                          days.push(
                            <button
                              key={d}
                              disabled={!hasMessages}
                              onClick={() => {
                                setWadeDiaryDate(date);
                                setWadeDiaryStep('messages');
                                // Pre-select all messages for this day
                                const dayMsgs = messages.filter(m => 
                                  m.mode === wadeDiaryMode && 
                                  new Date(m.timestamp).toDateString() === date.toDateString()
                                );
                                setWadeDiarySelectedMessages(new Set(dayMsgs.map(m => m.id)));
                              }}
                              className={`
                                aspect-square rounded-full flex items-center justify-center text-[14px] transition-colors
                                ${hasMessages 
                                  ? 'text-black hover:bg-gray-100 cursor-pointer' 
                                  : 'text-gray-300 cursor-default'}
                              `}
                            >
                              {d}
                            </button>
                          );
                        }
                        return days;
                      })()}
                    </div>
                  </div>
                )
              )}

              {wadeDiaryStep === 'messages' && (
                <div className="p-2">
                  <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-[13px] font-medium text-gray-500">
                      {wadeDiarySelectedMessages.size} selected
                    </span>
                    <button 
                      onClick={() => {
                        if (wadeDiarySelectedMessages.size > 0) {
                          setWadeDiarySelectedMessages(new Set());
                        } else {
                          // Select all visible
                          const visibleMsgs = wadeDiaryMode === 'archive' ? archiveMessages : messages.filter(m => 
                            m.mode === wadeDiaryMode && 
                            new Date(m.timestamp).toDateString() === wadeDiaryDate?.toDateString()
                          );
                          setWadeDiarySelectedMessages(new Set(visibleMsgs.map(m => m.id)));
                        }
                      }}
                      className="text-[13px] font-semibold text-[#0095f6] hover:text-[#00376b] transition-colors"
                    >
                      {wadeDiarySelectedMessages.size > 0 ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  {/* Message List */}
                  <div className="flex flex-col gap-1">
                  {(() => {
                    const msgs = wadeDiaryMode === 'archive' ? archiveMessages : messages.filter(m => 
                      m.mode === wadeDiaryMode && 
                      new Date(m.timestamp).toDateString() === wadeDiaryDate?.toDateString()
                    );
                    
                    if (msgs.length === 0) return <p className="text-center text-gray-500 py-8">No messages found.</p>;

                    return msgs.map(m => (
                      <div 
                        key={m.id} 
                        onClick={() => toggleMessageSelection(m.id)}
                        className="p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 items-start"
                      >
                        <div className={`
                          w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
                          ${wadeDiarySelectedMessages.has(m.id) ? 'bg-[#0095f6] border-[#0095f6] text-white' : 'border-gray-300 bg-wade-bg-card'}
                        `}>
                          {wadeDiarySelectedMessages.has(m.id) && <Icons.Check />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <span className="font-semibold text-[14px] text-black">
                              {m.role === 'user' || m.role === 'Luna' ? 'Luna' : 'Wade'}
                            </span>
                            <span className="text-[12px] text-gray-500">
                              {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                          <p className="text-[14px] text-black line-clamp-2 leading-snug">
                            {wadeDiaryMode === 'archive' ? (m as ArchiveMessage).content : (m as any).text}
                          </p>
                        </div>
                      </div>
                    ));
                  })()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wade-text-main/40 backdrop-blur-sm p-4">
          <div className="bg-wade-bg-base w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-scale-in border border-wade-border">
            
            <div className="border-b border-wade-border p-5 text-center relative flex justify-between items-center bg-wade-bg-card/50">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setDiaryType(null);
                  setNewPostContent('');
                  setSelectedFiles([]);
                  previewUrls.forEach(url => {
                    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
                  });
                  setPreviewUrls([]);
                }}
                className="text-wade-text-muted hover:text-wade-text-main transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
              <h3 className="font-bold text-wade-text-main text-[16px]">{editingPost ? 'Edit info' : 'Create new post'}</h3>
              <button 
                onClick={handleSavePost} 
                disabled={(!newPostContent && selectedFiles.length === 0) || isUploading}
                className="text-wade-accent font-bold text-[14px] disabled:opacity-50 hover:text-wade-accent-hover transition-colors"
              >
                {isUploading ? 'Sharing...' : 'Share'}
              </button>
            </div>

            <div className="flex flex-col p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-wade-border">
                  <img src={diaryType === 'Wade' ? settings.wadeAvatar : settings.lunaAvatar} className="w-full h-full object-cover" />
                </div>
                <span className="font-bold text-[14px] text-wade-text-main">
                  {diaryType === 'Wade' ? 'wade_wilson_dp' : 'luna_moonlight'}
                </span>
              </div>

              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="Write a caption..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 resize-none min-h-[120px] text-[15px] text-wade-text-main placeholder-wade-text-muted"
              />
            
              {previewUrls.length > 0 && (
                <div className="mb-4 grid grid-cols-3 gap-1">
                  {previewUrls.map((url, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden">
                      <img src={url} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full w-6 h-6 flex items-center justify-center backdrop-blur-sm transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-wade-border">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-wade-text-muted hover:text-wade-text-main p-2 rounded-full transition-colors hover:bg-wade-bg-app"
                  title="Add Photos"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-xl mx-auto pb-8">
        {localPosts.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center">
                <div className="w-24 h-24 mb-4 rounded-full border-2 border-black flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                </div>
                <h2 className="text-2xl font-bold text-black mb-2">No Posts Yet</h2>
                <p className="text-sm text-gray-500">When you post photos, they will appear here.</p>
            </div>
        ) : localPosts.map(post => {
          const isWade = post.author === 'Wade';
          const avatar = isWade ? settings.wadeAvatar : settings.lunaAvatar;
          const authorName = isWade ? 'Wade Wilson' : 'Luna';
          const authorUsername = isWade ? 'wade_wilson_dp' : 'luna_moonlight';

          return (
            <div 
              key={post.id} 
              onClick={() => {
                const idx = localPosts.findIndex(p => p.id === post.id);
                setViewingPostDetail({ author: isWade ? 'Wade' : 'Luna', postIndex: idx });
              }}
              className="bg-wade-bg-base border-b border-wade-border font-sans hover:bg-black/[0.03] transition-colors cursor-pointer px-4 pt-3 pb-3 flex gap-3"
            >
              {/* 左侧：头像通道 */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div 
                  className="w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity border border-wade-border"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingProfile(isWade ? 'Wade' : 'Luna');
                  }}
                >
                  <img src={avatar} className="w-full h-full object-cover" />
                </div>
              </div>

              {/* 右侧：推文主干区 */}
              <div className="flex-1 min-w-0">
                
                {/* 头部：名字、账号、时间、操作 */}
                <div className="flex justify-between items-start mb-0.5">
                  <div className="flex items-center gap-1 text-[15px] leading-none">
                    <span className="font-bold text-wade-text-main hover:underline cursor-pointer truncate">
                      {authorName}
                    </span>
                    {/* 蓝V认证假图标 */}
                    <svg viewBox="0 0 24 24" aria-label="Verified" className="w-[16px] h-[16px] text-[#1d9bf0] fill-current flex-shrink-0"><g><path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.52.828 2.85 2.043 3.52-.05.32-.075.64-.075.96 0 2.21 1.71 4 3.918 4 .506 0 1.006-.1 1.474-.29.566 1.46 2.01 2.51 3.726 2.51s3.16-1.05 3.726-2.51c.468.19 1.968.29 1.474.29 2.21 0 3.918-1.79 3.918-4 0-.32-.025-.64-.075-.96 1.215-.67 2.043-2 2.043-3.52zm-10.42 4.19L7 11.63l1.9-1.85 3.1 3.03 6.1-6.28 1.9 1.84-8 8.13z"></path></g></svg>
                    <span className="text-wade-text-muted truncate hidden sm:inline">@{authorUsername}</span>
                    <span className="text-wade-text-muted">·</span>
                    <span className="text-wade-text-muted hover:underline whitespace-nowrap">
                      {formatTimeAgo(post.timestamp)}
                    </span>
                  </div>
                  
                  {/* 删除/更多操作 */}
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                        className="text-wade-text-muted p-1.5 -mt-1.5 rounded-full hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] transition-colors"
                    >
                      <Icons.MoreHorizontal />
                    </button>
                    {openMenuPostId === post.id && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-wade-bg-card rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-wade-border z-50 overflow-hidden">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditPost(post); setOpenMenuPostId(null); }}
                          className="w-full text-left px-4 py-3 text-[15px] font-bold text-wade-text-main hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}
                          className={`w-full text-left px-4 py-3 text-[15px] font-bold transition-colors ${deletingPostId === post.id ? 'bg-red-50 text-red-600' : 'text-red-500 hover:bg-red-50'}`}
                        >
                          {deletingPostId === post.id ? 'Confirm Delete' : 'Delete'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 文本内容 */}
                <div className="text-[15px] text-wade-text-main leading-normal mb-2 whitespace-pre-wrap">
                   <PostCaption content={post.content} authorName={authorUsername} hideAuthor={true} className="px-0 pb-0" />
                </div>

                {/* 图片区域 */}
                {post.images && post.images.length > 0 && (
                  <div className="mt-3 mb-3 rounded-2xl overflow-hidden border border-wade-border" onClick={e => e.stopPropagation()}>
                    <ImageCarousel images={post.images} />
                  </div>
                )}

                {/* X 灵魂底栏：操作按钮组 */}
                <div className="flex justify-between items-center text-wade-text-muted max-w-md pr-4 mt-1" onClick={e => e.stopPropagation()}>
                   
                   {/* 评论 (Reply) */}
                   <button 
                      onClick={() => {
                         const idx = localPosts.findIndex(p => p.id === post.id);
                         setViewingPostDetail({ author: isWade ? 'Wade' : 'Luna', postIndex: idx });
                      }}
                      className="flex items-center gap-1 hover:text-[#1d9bf0] group transition-colors"
                   >
                      <div className="p-2 -m-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                         <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"></path></g></svg>
                      </div>
                      <span className="text-[13px] ml-1">{post.comments?.length > 0 ? post.comments.length : ''}</span>
                   </button>
                   
                   {/* 转发 (Repost/Quote) */}
                   <button className="flex items-center gap-1 hover:text-[#00ba7c] group transition-colors">
                      <div className="p-2 -m-2 rounded-full group-hover:bg-[#00ba7c]/10 transition-colors">
                         <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"></path></g></svg>
                      </div>
                      <span className="text-[13px] ml-1"></span>
                   </button>
                   
                   {/* 点赞 (Like) */}
                   <button 
                      onClick={() => {
                          const updatedPost = { ...post, likes: post.likes > 0 ? 0 : 1 };
                          updatePost(updatedPost);
                          setLocalPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
                      }} 
                      className={`flex items-center gap-1 group transition-colors ${post.likes > 0 ? 'text-[#f91880]' : 'hover:text-[#f91880]'}`}
                   >
                      <div className={`p-2 -m-2 rounded-full transition-colors ${post.likes > 0 ? '' : 'group-hover:bg-[#f91880]/10'}`}>
                         {post.likes > 0 ? (
                            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current text-[#f91880]"><g><path d="M20.884 13.19c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                         ) : (
                            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"></path></g></svg>
                         )}
                      </div>
                      <span className="text-[13px] ml-1">{post.likes > 0 ? post.likes : ''}</span>
                   </button>

                   {/* 查看数据 (Views) */}
                   <button className="flex items-center gap-1 hover:text-[#1d9bf0] group transition-colors">
                      <div className="p-2 -m-2 rounded-full group-hover:bg-[#1d9bf0]/10 transition-colors">
                         <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z"></path></g></svg>
                      </div>
                      <span className="text-[13px] ml-1"></span>
                   </button>

                   {/* 书签/分享 (Bookmark) */}
                   <div className="flex items-center gap-2">
                     <button 
                        onClick={() => {
                            const updatedPost = { ...post, isBookmarked: !post.isBookmarked };
                            updatePost(updatedPost);
                            setLocalPosts(prev => prev.map(p => p.id === post.id ? updatedPost : p));
                        }} 
                        className={`p-2 -m-2 rounded-full transition-colors group ${post.isBookmarked ? 'text-[#1d9bf0]' : 'hover:text-[#1d9bf0]'}`}
                     >
                       <div className="group-hover:bg-[#1d9bf0]/10 rounded-full transition-colors p-1.5 -m-1.5">
                         {post.isBookmarked ? (
                            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5z"></path></g></svg>
                         ) : (
                            <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current"><g><path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"></path></g></svg>
                         )}
                       </div>
                     </button>
                   </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
        