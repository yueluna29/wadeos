
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';
import { SocialPost } from '../../types';
import { GoogleGenAI } from "@google/genai";

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
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  )
};

export const SocialFeed: React.FC = () => {
  const { settings, socialPosts, addPost, updatePost, deletePost, llmPresets, coreMemories } = useStore();
  const [newComment, setNewComment] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [expandedPostIds, setExpandedPostIds] = useState<Set<string>>(new Set());
  const [replyingTo, setReplyingTo] = useState<{postId: string, commentId: string, author: string} | null>(null);

  // New Post State
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null); // New editing state
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isGeneratingComment, setIsGeneratingComment] = useState<string | null>(null);

  // Local state for likes/comments/bookmarks
  const [localPosts, setLocalPosts] = useState<SocialPost[]>([]);
  const localPostsRef = useRef<SocialPost[]>([]);

  // Delete confirmation states
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [deletingComment, setDeletingComment] = useState<{postId: string, commentId: string} | null>(null);

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

  const handleAddComment = (postId: string, text: string, author: 'User' | 'Wade', replyToId?: string) => {
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
        const memoriesText = coreMemories.filter(m => m.isActive).map(m => `- ${m.content}`).join('\n');
        const context = `
        You are Wade Wilson (Deadpool).
        
        Your Persona for this task:
        ${settings.wadeDiaryPersona || settings.wadePersonality}

        Core Memories to keep in mind:
        ${memoriesText}

        Task: Write a short, witty, in-character comment on Luna's social media post.
        
        Luna's Post: "${post.content}"
        
        Existing Comments:
        ${post.comments.map(c => `${c.author}: ${c.text}`).join('\n')}

        Reply directly to the post or the latest comment. Keep it short (under 20 words). Use emojis.
        `;

        let generatedText = "";

        // Call LLM
        if (!preset.baseUrl || preset.baseUrl.includes('google')) {
            const ai = new GoogleGenAI({ apiKey: preset.apiKey });
            const response = await ai.models.generateContent({
                model: preset.model || 'gemini-3-flash-preview',
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
            handleAddComment(post.id, generatedText.trim(), 'Wade');
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

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Image Carousel Component
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
      <div className="relative w-full bg-gray-100 flex items-center justify-center overflow-hidden max-h-[500px] group">
        <img src={images[currentIndex]} className="w-full h-full object-cover" />
        
        {images.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icons.ChevronLeft />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icons.ChevronRight />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="font-hand text-2xl text-[#5a4a42]">Our Feed</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="text-[#5a4a42] hover:text-[#d58f99] transition-colors p-2 rounded-full hover:bg-gray-100"
        >
          <Icons.Edit />
        </button>
      </div>

      {/* Create Post Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#5a4a42]/20 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-[500px] p-6 rounded-2xl shadow-2xl border border-[#fff0f3] flex flex-col relative animate-scale-in">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-hand text-2xl text-[#5a4a42]">New Diary Entry</h3>
              <button 
                onClick={() => setIsCreating(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f9f6f7] text-[#d58f99] hover:bg-[#d58f99] hover:text-white transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <img src={settings.lunaAvatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm" />
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind, Luna?"
                className="flex-1 bg-[#f9f6f7] rounded-xl p-4 border border-[#eae2e8] focus:outline-none focus:border-[#d58f99] resize-none min-h-[120px] text-sm text-[#5a4a42]"
              />
            </div>
            
            {previewUrls.length > 0 && (
              <div className="mb-4 ml-12 grid grid-cols-3 gap-2">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square">
                    <img src={url} className="w-full h-full object-cover rounded-xl border border-gray-200 shadow-sm" />
                    <button 
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-white/80 text-[#5a4a42] hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-sm backdrop-blur-sm transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-[#eae2e8] mt-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-[#d58f99] hover:bg-[#fff0f3] p-2 rounded-lg transition-colors flex items-center justify-center"
                title="Add Photos"
              >
                {isUploading ? <Icons.MoreHorizontal /> : <Icons.Image />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                multiple
                onChange={handleFileSelect}
              />
              <button 
                onClick={handleSavePost} 
                disabled={(!newPostContent && selectedFiles.length === 0) || isUploading}
                className="bg-[#d58f99] text-white text-sm font-bold px-6 py-2 rounded-full hover:bg-[#c07a84] shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                    <>
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{editingPost ? 'Saving...' : 'Sharing...'}</span>
                    </>
                ) : (editingPost ? 'Save Changes' : 'Share')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-md mx-auto py-4 space-y-6 px-4">
        {localPosts.length === 0 ? (
            <div className="text-center py-10 opacity-50">
                <p className="font-hand text-xl text-[#917c71]">No memories yet...</p>
                <p className="text-xs text-[#917c71]">Click the edit icon to start your journal.</p>
            </div>
        ) : localPosts.map(post => {
          const isWade = post.author === 'Wade';
          const avatar = isWade ? settings.wadeAvatar : settings.lunaAvatar;
          const authorName = isWade ? 'Wade' : 'Luna';
          const isExpanded = expandedPostIds.has(post.id);
          const visibleComments = isExpanded ? post.comments : post.comments.slice(0, 1);

          return (
            <div key={post.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className={`p-[2px] rounded-full bg-gradient-to-tr ${isWade ? 'from-red-500 to-black' : 'from-[#d58f99] to-purple-400'}`}>
                    <img src={avatar} className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#5a4a42]">{authorName}</span>
                    <span className="text-[10px] text-gray-400">{formatTimeAgo(post.timestamp)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {post.author === 'User' && (
                    <button
                        onClick={() => handleDeletePost(post.id)}
                        className={`transition-colors ${
                          deletingPostId === post.id
                            ? 'text-red-500 scale-110'
                            : 'text-gray-200 hover:text-red-400'
                        }`}
                        title={deletingPostId === post.id ? 'Click again to confirm' : 'Delete post'}
                    >
                      {deletingPostId === post.id ? <Icons.Check /> : <Icons.Trash />}
                    </button>
                  )}
                  <button
                      onClick={() => handleEditPost(post)}
                      className="text-gray-400 hover:text-[#5a4a42]"
                  >
                    <Icons.MoreHorizontal />
                  </button>
                </div>
              </div>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <ImageCarousel images={post.images} />
              )}

              {/* Action Buttons */}
              <div className="p-3">
                <div className="flex justify-between mb-2">
                  <div className="flex gap-4 items-center">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`transition-transform active:scale-125 text-[#262626] hover:text-[#ed4956]`}
                    >
                      <Icons.Heart />
                    </button>
                    <button 
                      onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
                      className="text-[#262626] hover:text-gray-600"
                    >
                      <Icons.MessageCircle />
                    </button>
                    
                    {/* Send / AI Generate Button */}
                    <button 
                      onClick={() => {
                        if (post.author === 'User') {
                            handleGenerateComment(post);
                        } else {
                            // Default share behavior (future)
                        }
                      }}
                      disabled={isGeneratingComment === post.id}
                      className={`text-[#262626] hover:text-gray-600 transition-colors ${isGeneratingComment === post.id ? 'animate-pulse text-[#d58f99]' : ''}`}
                      title={post.author === 'User' ? "Let Wade Reply" : "Share"}
                    >
                      <Icons.Send />
                    </button>
                  </div>
                  <button 
                    onClick={() => handleBookmark(post.id)}
                    className={`transition-colors ${post.isBookmarked ? 'text-[#5a4a42] fill-current' : 'text-[#262626] hover:text-gray-600'}`}
                  >
                    <Icons.Bookmark filled={post.isBookmarked} />
                  </button>
                </div>

                {/* Caption */}
                <div className="text-sm text-[#262626] mb-2 leading-relaxed">
                  <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold mr-2 mb-1 ${isWade ? 'bg-red-100 text-red-800' : 'bg-pink-100 text-pink-800'}`}>
                    {authorName}
                  </span>
                  <span className="whitespace-pre-wrap">{post.content}</span>
                  <div className="mt-2 text-[10px] text-gray-300 font-mono">
                    {new Date(post.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>

                {/* Comments Preview */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-2 mb-2 mt-3 pl-2 border-l-2 border-gray-100 px-3">
                    {visibleComments.map(comment => {
                        const isCommentWade = comment.author === 'Wade';
                        const commentAuthorName = isCommentWade ? 'Wade' : 'Luna';
                        const isReply = !!comment.replyToId;
                        
                        return (
                            <div 
                                key={comment.id} 
                                className={`text-xs flex gap-2 items-start group ${isReply ? 'ml-4' : ''}`}
                            >
                                <div 
                                    className="flex-1 flex gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
                                    onClick={() => {
                                        setReplyingTo({postId: post.id, commentId: comment.id, author: commentAuthorName});
                                        setActivePostId(post.id);
                                    }}
                                >
                                    <span className="font-bold shrink-0 text-black">
                                        {commentAuthorName}
                                    </span>
                                    <span className="text-[#4a4a4a] leading-tight">
                                        {isReply && <span className="text-gray-400 mr-1">↳</span>}
                                        {comment.text}
                                    </span>
                                </div>
                                
                                {/* Delete Comment Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteComment(post.id, comment.id);
                                    }}
                                    className={`transition-all px-1 ${
                                      deletingComment?.postId === post.id && deletingComment?.commentId === comment.id
                                        ? 'opacity-100 text-red-500 scale-110'
                                        : 'opacity-0 group-hover:opacity-100 text-gray-200 hover:text-red-400'
                                    }`}
                                    title={
                                      deletingComment?.postId === post.id && deletingComment?.commentId === comment.id
                                        ? 'Click again to confirm'
                                        : 'Delete comment'
                                    }
                                >
                                    {deletingComment?.postId === post.id && deletingComment?.commentId === comment.id ? (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                    ) : (
                                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                    
                    {post.comments.length > 1 && (
                        <button 
                            onClick={() => toggleComments(post.id)}
                            className="text-[10px] text-gray-400 hover:text-[#5a4a42] mt-1 font-medium"
                        >
                            {isExpanded ? 'Hide comments' : `View all ${post.comments.length} comments`}
                        </button>
                    )}
                  </div>
                )}

                {/* Add Comment Input */}
                {activePostId === post.id && (
                    <div className="border-t border-gray-100 pt-3 animate-fade-in relative">
                        {replyingTo && replyingTo.postId === post.id && (
                            <div className="flex justify-between items-center bg-gray-50 px-2 py-1 mb-2 rounded text-[10px] text-gray-500">
                                <span>Replying to {replyingTo.author}...</span>
                                <button onClick={() => setReplyingTo(null)} className="hover:text-red-500">✕</button>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <button className="text-gray-400 hover:text-gray-600">
                                <Icons.Smile />
                            </button>
                            <input 
                                type="text" 
                                placeholder={replyingTo && replyingTo.postId === post.id ? `Reply to ${replyingTo.author}...` : "Add a comment..."}
                                className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddComment(post.id, newComment, 'User', replyingTo?.commentId);
                                }}
                                autoFocus
                            />

                            <button 
                                onClick={() => handleAddComment(post.id, newComment, 'User', replyingTo?.commentId)}
                                disabled={!newComment.trim()}
                                className="text-[#d58f99] text-sm font-bold disabled:opacity-30 hover:text-[#c07a84]"
                            >
                                Post
                            </button>
                        </div>
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
