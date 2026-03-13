
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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#ed4956" : "none"} stroke={filled ? "#ed4956" : "currentColor"} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  ),
  MessageCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  ),
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  ),
  Bookmark: ({ filled }: { filled?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
    </svg>
  ),
  MoreHorizontal: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"></circle>
      <circle cx="19" cy="12" r="1"></circle>
      <circle cx="5" cy="12" r="1"></circle>
    </svg>
  ),
  Image: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <circle cx="8.5" cy="8.5" r="1.5"></circle>
      <polyline points="21 15 16 10 5 21"></polyline>
    </svg>
  ),
  Smile: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
      <line x1="9" y1="9" x2="9.01" y2="9"></line>
      <line x1="15" y1="9" x2="15.01" y2="9"></line>
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
    </svg>
  ),
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Archive: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
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
      <div className="fixed inset-0 z-[200] bg-wade-bg-card flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 bg-wade-bg-card border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-40">
          <button
            onClick={() => setViewingPostDetail(null)}
            className="text-black hover:opacity-70 transition-opacity"
          >
            <Icons.ChevronLeft />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">{authorUsername}</span>
            <span className="font-bold text-black text-base">Posts</span>
          </div>
          <div className="w-6"></div>
        </div>

        {/* Post Content - Scrollable */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-wade-bg-base pb-20">
          <div className="max-w-xl mx-auto">
            
            {/* Post Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-wade-bg-card/50 backdrop-blur-sm border-b border-wade-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-wade-accent to-wade-accent-hover shadow-sm">
                  <img src={avatar} className="w-full h-full rounded-full object-cover border-2 border-wade-bg-card" />
                </div>
                <span className="font-bold text-wade-text-main text-sm">{authorUsername}</span>
              </div>
              <button className="text-wade-text-muted hover:text-wade-text-main">
                <Icons.MoreHorizontal />
              </button>
            </div>

            {/* Images Carousel */}
            {currentPost.images && currentPost.images.length > 0 && (
              <ImageCarousel images={currentPost.images} />
            )}

            {/* Post Info & Actions */}
            <div className="px-5 py-4">
              {/* Action Buttons */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex gap-5">
                  <button
                    onClick={() => {
                      const newLikes = currentPost.likes > 0 ? 0 : 1;
                      const updatedPost = { ...currentPost, likes: newLikes };
                      updatePost(updatedPost);
                      setLocalPosts(prev => prev.map(p => p.id === currentPost.id ? updatedPost : p));
                    }}
                    className={`transition-transform active:scale-125 hover:scale-110 ${currentPost.likes > 0 ? 'text-wade-accent' : 'text-wade-text-main hover:text-wade-accent'}`}
                  >
                    <Icons.Heart filled={currentPost.likes > 0} />
                  </button>
                  <button
                    onClick={() => setActivePostId(activePostId === currentPost.id ? null : currentPost.id)}
                    className="text-wade-text-main hover:text-wade-accent hover:scale-110 transition-transform"
                  >
                    <Icons.MessageCircle />
                  </button>
                  <button className="text-wade-text-main hover:text-wade-accent hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
                <button
                  onClick={() => {
                    const updatedPost = { ...currentPost, isBookmarked: !currentPost.isBookmarked };
                    updatePost(updatedPost);
                    setLocalPosts(prev => prev.map(p => p.id === currentPost.id ? updatedPost : p));
                  }}
                  className={`transition-all hover:scale-110 ${currentPost.isBookmarked ? 'text-wade-accent' : 'text-wade-text-main hover:text-wade-accent'}`}
                >
                  <Icons.Bookmark filled={currentPost.isBookmarked} />
                </button>
              </div>

              {/* Likes Count */}
              {currentPost.likes > 0 && (
                <div className="mb-2">
                  <span className="font-bold text-wade-text-main text-[14px]">{currentPost.likes} {currentPost.likes === 1 ? 'like' : 'likes'}</span>
                </div>
              )}

              {/* Post Content */}
              <PostCaption content={currentPost.content} authorName={authorUsername} hideAuthor={false} className="px-0 pb-0 text-wade-text-main" />

              {/* Comments Section */}
              {currentPost.comments && currentPost.comments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-wade-border">
                  <button className="text-[13px] text-wade-text-muted mb-2 hover:text-wade-text-main font-medium">
                    View all {currentPost.comments.length} comments
                  </button>
                  <div className="space-y-2">
                    {currentPost.comments.slice(0, 2).map(comment => {
                      const commentAuthorUsername = comment.author === 'Luna' ? 'luna_moonlight' : 'wade_wilson_dp';
                      return (
                        <div key={comment.id} className="text-[14px] leading-snug">
                          <span className="font-bold text-wade-text-main mr-2">{commentAuthorUsername}</span>
                          <span className="text-wade-text-main/90">{comment.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-2 text-[10px] text-wade-text-muted uppercase tracking-wide font-medium">
                {new Date(currentPost.timestamp).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>

              {/* Add Comment */}
              <div className="mt-4 flex gap-3 items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-wade-border">
                  <img src={settings.lunaAvatar} className="w-full h-full object-cover" />
                </div>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={activePostId === currentPost.id ? newComment : ''}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    setActivePostId(currentPost.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newComment.trim()) {
                      handleAddComment(currentPost.id, newComment, 'Luna');
                      setActivePostId(null);
                    }
                  }}
                  className="flex-1 bg-transparent text-[14px] text-wade-text-main placeholder-wade-text-muted focus:outline-none"
                />
                {activePostId === currentPost.id && newComment.trim() && (
                  <button
                    onClick={() => {
                      handleAddComment(currentPost.id, newComment, 'Luna');
                      setActivePostId(null);
                    }}
                    className="text-wade-accent font-bold text-[14px] hover:text-wade-accent-hover"
                  >
                    Post
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {canGoPrev && (
          <button
            onClick={goToPrev}
            className="fixed left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-wade-bg-card/80 shadow-md flex items-center justify-center text-black hover:bg-wade-bg-card transition-colors z-10"
          >
            <Icons.ChevronLeft />
          </button>
        )}
        {canGoNext && (
          <button
            onClick={goToNext}
            className="fixed right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-wade-bg-card/80 shadow-md flex items-center justify-center text-black hover:bg-wade-bg-card transition-colors z-10"
          >
            <Icons.ChevronRight />
          </button>
        )}
      </div>
    );
  };

  const renderProfileView = () => {
    const isWade = viewingProfile === 'Wade';
    const avatar = isWade ? settings.wadeAvatar : settings.lunaAvatar;
    const name = isWade ? 'Wade Wilson' : 'Luna';
    const username = isWade ? 'wade_wilson_dp' : 'luna_moonlight';
    const category = isWade ? 'Mercenary / Anti-hero' : 'Boutique Store';
    const bio = isWade ? settings.wadePersonality : settings.lunaInfo;
    const userPosts = localPosts.filter(p => p.author === (isWade ? 'Wade' : 'Luna'));

    return (
      <div className="flex-1 flex flex-col bg-wade-bg-base overflow-hidden">
        {/* Profile Header */}
        <div className="flex-shrink-0 bg-wade-bg-base/80 backdrop-blur-md px-6 py-4 flex justify-between items-center sticky top-0 z-40 border-b border-wade-border">
          <button onClick={() => setViewingProfile(null)} className="text-wade-text-main hover:text-wade-accent transition-colors">
            <Icons.ChevronLeft />
          </button>
          <div className="flex items-center gap-1">
            <h1 className="font-bold text-lg text-wade-text-main tracking-tight">{username}</h1>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mt-1 text-wade-accent"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>
          <div className="flex items-center gap-4 text-wade-text-main">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 bg-wade-bg-base">
          <div className="max-w-xl mx-auto">
            {/* Profile Info */}
            <div className="px-5 pt-4 pb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="relative">
                  <div className={`w-[86px] h-[86px] rounded-full p-[3px] bg-gradient-to-tr ${isWade ? 'from-wade-accent to-wade-accent-hover' : 'from-wade-border to-wade-accent'} flex-shrink-0 shadow-md`}>
                    <img src={avatar} className="w-full h-full rounded-full object-cover border-2 border-wade-bg-card" />
                  </div>
                  {!isWade && (
                    <div className="absolute bottom-0 right-0 bg-wade-accent text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-wade-bg-card shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 text-center flex-1 justify-end pr-2">
                  <div className="flex flex-col items-center w-16">
                    <span className="font-bold text-[18px] text-wade-text-main">{userPosts.length}</span>
                    <span className="text-[12px] text-wade-text-muted">posts</span>
                  </div>
                  <div className="flex flex-col items-center w-16">
                    <span className="font-bold text-[18px] text-wade-text-main">{isWade ? '30M' : '1,204'}</span>
                    <span className="text-[12px] text-wade-text-muted">followers</span>
                  </div>
                  <div className="flex flex-col items-center w-16">
                    <span className="font-bold text-[18px] text-wade-text-main">{isWade ? '1' : '842'}</span>
                    <span className="text-[12px] text-wade-text-muted">following</span>
                  </div>
                </div>
              </div>

              <div className="mb-5">
                <h2 className="font-bold text-[16px] text-wade-text-main leading-tight mb-1">{name}</h2>
                <p className="text-[14px] text-wade-text-muted leading-tight mb-2 font-medium">{category}</p>
                <p className="text-[14px] text-wade-text-main whitespace-pre-wrap leading-relaxed line-clamp-4">{bio}</p>
                <a href="#" className="text-[14px] text-wade-accent font-semibold hover:underline flex items-center gap-1 mt-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  linktr.ee/{username}
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1.5 mb-5">
                {!isWade ? (
                  <>
                    <button className="flex-1 bg-[#efefef] text-black font-semibold py-1.5 rounded-lg text-[14px] hover:bg-[#e0e0e0] transition-colors">
                      Edit profile
                    </button>
                    <button className="flex-1 bg-[#efefef] text-black font-semibold py-1.5 rounded-lg text-[14px] hover:bg-[#e0e0e0] transition-colors">
                      Share profile
                    </button>
                    <button className="w-9 flex items-center justify-center bg-[#efefef] text-black font-semibold py-1.5 rounded-lg text-[14px] hover:bg-[#e0e0e0] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex-1 bg-[#efefef] text-black font-semibold py-1.5 rounded-lg text-[14px] hover:bg-[#e0e0e0] transition-colors flex items-center justify-center gap-1">
                      Following <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                    <button className="flex-1 bg-[#efefef] text-black font-semibold py-1.5 rounded-lg text-[14px] hover:bg-[#e0e0e0] transition-colors">
                      Message
                    </button>
                    <button className="flex-1 bg-[#efefef] text-black font-semibold py-1.5 rounded-lg text-[14px] hover:bg-[#e0e0e0] transition-colors">
                      Contact
                    </button>
                    <button className="w-9 flex items-center justify-center bg-[#efefef] text-black font-semibold py-1.5 rounded-lg text-[14px] hover:bg-[#e0e0e0] transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><polyline points="16 11 18 13 22 9"></polyline></svg>
                    </button>
                  </>
                )}
              </div>

              {/* Highlights */}
              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
                {[
                  { name: 'Memories', icon: '📸' },
                  { name: 'Favorites', icon: '⭐' },
                  { name: 'Travel', icon: '✈️' },
                  { name: 'Food', icon: '🌮' },
                  { name: 'New', icon: '✨' }
                ].map((highlight, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 w-[64px]">
                    <div className="w-[64px] h-[64px] rounded-full border border-gray-300 p-[3px]">
                      <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                        {highlight.icon}
                      </div>
                    </div>
                    <span className="text-[12px] text-black truncate w-full text-center">{highlight.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grid Tabs */}
            <div className="flex border-t border-gray-200">
              <button className="flex-1 py-3 flex justify-center border-t-[1px] border-black text-black -mt-[1px]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>
              </button>
              <button className="flex-1 py-3 flex justify-center text-gray-400 hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
              </button>
              <button className="flex-1 py-3 flex justify-center text-gray-400 hover:text-black transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </button>
            </div>

            {/* Grid of Posts */}
            <div className="grid grid-cols-3 gap-[1px]">
              {userPosts.length === 0 ? (
                <div className="col-span-3 text-center py-10 text-gray-500 text-sm">
                  No posts yet.
                </div>
              ) : (
                userPosts.map((post, idx) => (
                  <div
                    key={post.id}
                    className="aspect-square bg-gray-100 relative group cursor-pointer overflow-hidden"
                    onClick={() => {
                      setViewingPostDetail({
                        author: viewingProfile === 'Luna' ? 'Luna' : 'Wade',
                        postIndex: idx
                      });
                    }}
                  >
                    {post.images && post.images.length > 0 ? (
                      <img src={post.images[0]} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
                    ) : (
                      <div className="w-full h-full p-2 flex items-center justify-center bg-wade-bg-card text-black text-[10px] text-center overflow-hidden group-hover:bg-gray-50 transition-colors">
                        <span className="line-clamp-4 leading-relaxed">{post.content}</span>
                      </div>
                    )}
                    {post.images && post.images.length > 1 && (
                      <div className="absolute top-2 right-2 text-white drop-shadow-md">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-wade-bg-base">
      {viewingPostDetail ? (
        renderPostDetailView()
      ) : viewingProfile ? (
        renderProfileView()
      ) : (
        <>
          {/* Header */}
          <div className="flex-shrink-0 bg-wade-bg-base/80 backdrop-blur-md border-b border-wade-border px-6 py-4 flex justify-between items-center sticky top-0 z-40">
            <h1 className="font-hand text-3xl text-wade-accent mt-1 drop-shadow-sm">Our Journal</h1>
            <div className="flex items-center gap-4">
              <button className="text-wade-text-muted hover:text-wade-accent hover:scale-110 transition-all">
                <Icons.Heart />
              </button>
              <button
                onClick={() => setShowDiaryTypeModal(true)}
                className="text-wade-text-muted hover:text-wade-accent hover:scale-110 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"></path><line x1="12" y1="9" x2="12" y2="15"></line><line x1="9" y1="12" x2="15" y2="12"></line></svg>
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto pb-24 custom-scrollbar bg-wade-bg-base">
            
            {/* Stories Bar */}
            <div className="bg-wade-bg-base border-b border-wade-border px-4 pt-4 pb-6 mb-4">
              <div className="flex gap-4 overflow-x-auto hide-scrollbar max-w-xl mx-auto px-1">
                <button onClick={() => setShowDiaryTypeModal(true)} className="flex flex-col items-center gap-2 flex-shrink-0 group relative transition-transform hover:scale-105">
                  <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-wade-bg-card shadow-md border border-wade-border">
                    <img src={settings.lunaAvatar} className="w-full h-full rounded-full object-cover border border-wade-bg-base" />
                  </div>
                  <div className="absolute bottom-6 right-0 bg-wade-accent text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-wade-bg-card shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </div>
                  <span className="text-[11px] font-medium text-wade-text-muted">New Memory</span>
                </button>
                <button onClick={() => setViewingProfile('Luna')} className="flex flex-col items-center gap-2 flex-shrink-0 group transition-transform hover:scale-105">
                  <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-wade-accent to-wade-accent-hover shadow-md">
                    <img src={settings.lunaAvatar} className="w-full h-full rounded-full object-cover border-2 border-wade-bg-card" />
                  </div>
                  <span className="text-[11px] font-bold text-wade-text-main">luna_moonlight</span>
                </button>
                <button onClick={() => setViewingProfile('Wade')} className="flex flex-col items-center gap-2 flex-shrink-0 group transition-transform hover:scale-105">
                  <div className="w-[72px] h-[72px] rounded-full p-[3px] bg-gradient-to-tr from-wade-accent to-wade-accent-hover shadow-md">
                    <img src={settings.wadeAvatar} className="w-full h-full rounded-full object-cover border-2 border-wade-bg-card" />
                  </div>
                  <span className="text-[11px] font-bold text-wade-text-main">wade_wilson_dp</span>
                </button>
              </div>
            </div>

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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
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
                      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    },
                    { 
                      id: 'sms', 
                      title: 'SMS',
                      desc: "Rapid fire texts and memes.",
                      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="M22 6l-10 7L2 6"></path></svg>
                    },
                    { 
                      id: 'roleplay', 
                      title: 'RolePlay',
                      desc: "Oscar-worthy performances.",
                      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>
                    },
                    { 
                      id: 'archive', 
                      title: 'Archives',
                      desc: "Dusting off the ancient scrolls.",
                      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3M4 7h16M4 7v13h16V7"></path><path d="M10 11h4"></path></svg>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-wade-text-main/40 backdrop-blur-sm p-4 animate-fade-in">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
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
          const authorName = isWade ? 'Wade' : 'Luna';
          const authorUsername = isWade ? 'wade_wilson_dp' : 'luna_moonlight';
          const isExpanded = expandedPostIds.has(post.id);
          const visibleComments = isExpanded ? post.comments : post.comments.slice(0, 2);

          return (
            <div key={post.id} className="bg-wade-bg-card border-b-[12px] border-[#f0f2f5] pb-2 mb-0">
              {/* Post Header */}
              <div className="flex items-center justify-between px-5 py-4 bg-wade-bg-card/50 backdrop-blur-sm">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setViewingProfile(isWade ? 'Wade' : 'Luna')}
                >
                  <div className={`w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr ${isWade ? 'from-wade-accent to-wade-accent-hover' : 'from-wade-border to-wade-accent'} shadow-sm group-hover:scale-105 transition-transform`}>
                    <img src={avatar} className="w-full h-full rounded-full object-cover border-2 border-wade-bg-card" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="text-[14px] font-bold text-wade-text-main leading-tight group-hover:text-wade-accent transition-colors">{authorUsername}</span>
                    <span className="text-[10px] text-wade-text-muted">{isWade ? 'Mercenary' : 'Boutique Owner'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 relative">
                  <button
                      onClick={() => setOpenMenuPostId(openMenuPostId === post.id ? null : post.id)}
                      className="text-wade-text-muted p-2 rounded-full hover:bg-wade-bg-app hover:text-wade-accent transition-colors"
                  >
                    <Icons.MoreHorizontal />
                  </button>
                  {openMenuPostId === post.id && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setOpenMenuPostId(null)} 
                      />
                      <div className="absolute right-0 top-full mt-1 w-32 bg-wade-bg-card rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                        <button
                          onClick={() => {
                            handleEditPost(post);
                            setOpenMenuPostId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (deletingPostId === post.id) {
                              handleDeletePost(post.id);
                              setOpenMenuPostId(null);
                            } else {
                              handleDeletePost(post.id);
                            }
                          }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${deletingPostId === post.id ? 'bg-red-50 text-red-600' : 'text-red-500 hover:bg-red-50'}`}
                        >
                          {deletingPostId === post.id ? 'Confirm Delete' : 'Delete'}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="w-full">
                  <ImageCarousel images={post.images} />
                </div>
              )}

              {/* Action Buttons */}
              <div className="px-5 py-3 flex justify-between items-center bg-wade-bg-card/50 backdrop-blur-sm">
                <div className="flex gap-5 items-center">
                  <button 
                    onClick={() => handleLike(post.id)}
                    className={`transition-transform active:scale-125 hover:scale-110 ${post.likes > 0 ? 'text-wade-accent' : 'text-wade-text-main hover:text-wade-accent'}`}
                  >
                    <Icons.Heart filled={post.likes > 0} />
                  </button>
                  <button 
                    onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
                    className="text-wade-text-main hover:text-wade-accent hover:scale-110 transition-transform"
                  >
                    <Icons.MessageCircle />
                  </button>
                  
                  {/* Send / AI Generate Button */}
                  <button 
                    onClick={() => {
                      if (post.author === 'Luna') {
                          handleGenerateComment(post);
                      }
                    }}
                    disabled={isGeneratingComment === post.id}
                    className={`text-wade-text-main hover:text-wade-accent transition-all hover:scale-110 ${isGeneratingComment === post.id ? 'animate-pulse text-wade-accent' : ''}`}
                    title={post.author === 'Luna' ? "Let Wade Reply" : "Share"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
                <button 
                  onClick={() => handleBookmark(post.id)}
                  className={`transition-all hover:scale-110 ${post.isBookmarked ? 'text-wade-accent fill-current' : 'text-wade-text-main hover:text-wade-accent'}`}
                >
                  <Icons.Bookmark filled={post.isBookmarked} />
                </button>
              </div>

              {/* Likes Count */}
              {post.likes > 0 && (
                <div className="px-5 mb-2">
                  <span className="font-bold text-wade-text-main text-[14px]">{post.likes} {post.likes === 1 ? 'like' : 'likes'}</span>
                </div>
              )}

              {/* Caption */}
              <PostCaption content={post.content} authorName={authorUsername} hideAuthor={false} className="px-5 text-wade-text-main" />

              {/* Date */}
              <div className="px-5 mt-2 mb-3">
                <span className="text-[10px] text-wade-text-muted uppercase tracking-wide font-medium">
                  {(() => {
                    const d = new Date(post.timestamp);
                    return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
                  })()}
                </span>
              </div>
              
              {/* Comments Section */}
              {post.comments && post.comments.length > 0 && (
                <div className="px-5 mt-2 pb-4 border-t border-wade-border pt-3 bg-gray-50/50">
                  {post.comments.length > 2 && !isExpanded && (
                    <button 
                        onClick={() => toggleComments(post.id)}
                        className="text-[13px] text-wade-text-muted mb-2 hover:text-wade-text-main transition-colors font-medium"
                    >
                        View all {post.comments.length} comments
                    </button>
                  )}
                  {isExpanded && post.comments.length > 2 && (
                    <button 
                        onClick={() => toggleComments(post.id)}
                        className="text-[13px] text-wade-text-muted mb-2 hover:text-wade-text-main transition-colors font-medium"
                    >
                        Hide comments
                    </button>
                  )}
                  <div className="space-y-2">
                    {visibleComments.map(comment => {
                        const isCommentWade = comment.author === 'Wade';
                        const commentAuthorUsername = isCommentWade ? 'wade_wilson_dp' : 'luna_moonlight';
                        const isReply = !!comment.replyToId;
                        
                        return (
                            <div 
                                key={comment.id} 
                                className={`text-[14px] group ${isReply ? 'ml-6 border-l-2 border-wade-accent/30 pl-3' : ''}`}
                            >
                                <div
                                    className="cursor-pointer transition-colors leading-snug break-words"
                                    onClick={() => {
                                        setReplyingTo({postId: post.id, commentId: comment.id, author: commentAuthorUsername, text: comment.text});
                                        setActivePostId(post.id);
                                    }}
                                >
                                    <span className="font-bold text-wade-text-main mr-2 hover:text-wade-accent transition-colors">
                                        {commentAuthorUsername}
                                    </span>
                                    <span className="text-wade-text-main/90">
                                        {comment.text}
                                    </span>
                                    
                                    {/* Regenerate Button (for Luna's comments only) */}
                                    {!isCommentWade && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleGenerateComment(post);
                                            }}
                                            disabled={isGeneratingComment === post.id}
                                            className="inline-flex align-middle ml-2 p-0.5 opacity-0 group-hover:opacity-100 text-wade-text-muted hover:text-wade-text-main disabled:opacity-50 hover:bg-wade-bg-app rounded-md transition-all"
                                            title="Regenerate Wade's reply"
                                        >
                                            <Icons.Sparkles />
                                        </button>
                                    )}

                                    {/* Delete Comment Button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteComment(post.id, comment.id);
                                        }}
                                        className={`inline-flex align-middle ml-1 p-0.5 rounded-md transition-all ${
                                          deletingComment?.postId === post.id && deletingComment?.commentId === comment.id
                                            ? 'opacity-100 text-wade-accent-hover bg-wade-bg-app scale-110'
                                            : 'opacity-0 group-hover:opacity-100 text-wade-text-muted hover:text-wade-accent-hover hover:bg-wade-bg-app'
                                        }`}
                                        title={
                                          deletingComment?.postId === post.id && deletingComment?.commentId === comment.id
                                            ? 'Click again to confirm'
                                            : 'Delete comment'
                                        }
                                    >
                                        {deletingComment?.postId === post.id && deletingComment?.commentId === comment.id ? (
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                        ) : (
                                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                  </div>
                </div>
              )}

              {/* Add Comment Input */}
              {activePostId === post.id && (
                  <div className="px-3 py-2 bg-wade-bg-card animate-fade-in relative border-t border-gray-100">
                      {replyingTo && replyingTo.postId === post.id && (
                          <div className="flex justify-between items-center bg-gray-50 px-3 py-2 mb-2 rounded-lg text-xs text-gray-500 border border-gray-200">
                              <span className="truncate pr-4">Replying to <span className="font-semibold">{replyingTo.author}</span>: {replyingTo.text}</span>
                              <button onClick={() => setReplyingTo(null)} className="hover:text-red-500 p-1 shrink-0">✕</button>
                          </div>
                      )}
                      <div className="flex items-center gap-2 bg-wade-bg-card">
                          <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                            <img src={settings.lunaAvatar} className="w-full h-full object-cover" />
                          </div>
                          <input 
                              type="text" 
                              placeholder={replyingTo && replyingTo.postId === post.id ? `Reply to ${replyingTo.author}...` : "Add a comment..."}
                              className="flex-1 text-[14px] outline-none placeholder-gray-500 bg-transparent text-black"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleAddComment(post.id, newComment, 'Luna', replyingTo?.commentId);

                              }}
                              autoFocus
                          />

                          <button 
                              onClick={() => handleAddComment(post.id, newComment, 'Luna', replyingTo?.commentId)}
                              disabled={!newComment.trim()}
                              className="text-[#0095f6] text-[14px] font-semibold disabled:opacity-40 hover:text-[#00376b] transition-colors"
                          >
                              Post
                          </button>
                      </div>
                  </div>
              )}
            </div>
          );
        })}
      </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomedImage.images[zoomedImage.index]}
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              alt="Zoomed"
            />

            {zoomedImage.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomedImage({
                      images: zoomedImage.images,
                      index: (zoomedImage.index - 1 + zoomedImage.images.length) % zoomedImage.images.length
                    });
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-wade-bg-card/10 hover:bg-wade-bg-card/20 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all backdrop-blur-md border border-wade-bg-card/10"
                >
                  <Icons.ChevronLeft />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setZoomedImage({
                      images: zoomedImage.images,
                      index: (zoomedImage.index + 1) % zoomedImage.images.length
                    });
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-wade-bg-card/10 hover:bg-wade-bg-card/20 text-white rounded-full w-14 h-14 flex items-center justify-center transition-all backdrop-blur-md border border-wade-bg-card/10"
                >
                  <Icons.ChevronRight />
                </button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-wade-bg-card/10">
                  {zoomedImage.images.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        idx === zoomedImage.index ? 'bg-wade-bg-card w-6' : 'bg-wade-bg-card/40 w-2 hover:bg-wade-bg-card/60 cursor-pointer'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedImage({ images: zoomedImage.images, index: idx });
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-4 -right-4 bg-wade-bg-card/10 hover:bg-wade-bg-card/20 text-white rounded-full w-12 h-12 flex items-center justify-center transition-all backdrop-blur-md border border-wade-bg-card/10 shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
