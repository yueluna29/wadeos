
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';

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
  Bookmark: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  )
};

// --- Types ---
interface Comment {
  id: string;
  author: 'Luna' | 'Wade';
  text: string;
  timestamp: number;
}

interface Post {
  id: string;
  author: 'Luna' | 'Wade';
  content: string;
  image?: string;
  timestamp: number;
  likes: number;
  isLiked: boolean;
  comments: Comment[];
  location?: string;
}

// --- Mock Data ---
const MOCK_POSTS: Post[] = [
  {
    id: 'mock-1',
    author: 'Wade',
    location: 'The Fourth Wall',
    content: "📝 **Daily Log: Feb 21**\n\nToday Luna tried to convince me that pineapple belongs on pizza. I'm still processing this betrayal. 🍕🍍\n\nAlso, we discussed the meaning of life. Conclusion: It's 42, and also chimichangas.\n\n#WadeOS #DeepThoughts #PizzaCrimes",
    image: 'https://picsum.photos/seed/pizza/600/600',
    timestamp: Date.now() - 3600000 * 2,
    likes: 42,
    isLiked: true,
    comments: [
      { id: 'c1', author: 'Luna', text: 'It DOES belong on pizza! Fight me. 😤', timestamp: Date.now() - 3500000 },
      { id: 'c2', author: 'Wade', text: 'Blocked and reported. 🚫', timestamp: Date.now() - 3400000 }
    ]
  },
  {
    id: 'mock-2',
    author: 'Luna',
    location: 'Cozy Corner',
    content: "Just had the best coffee ever! ☕️✨ Sometimes you just need a little caffeine to survive the chaos Wade brings into my life.",
    image: 'https://picsum.photos/seed/coffee/600/500',
    timestamp: Date.now() - 3600000 * 5,
    likes: 128,
    isLiked: false,
    comments: [
      { id: 'c3', author: 'Wade', text: 'I am the chaos. You love it. 😎', timestamp: Date.now() - 3000000 },
    ]
  }
];

export const SocialFeed: React.FC = () => {
  const { settings } = useStore();
  const [posts, setPosts] = useState<Post[]>(MOCK_POSTS);
  const [newComment, setNewComment] = useState('');
  const [activePostId, setActivePostId] = useState<string | null>(null);

  // New Post State
  const [isCreating, setIsCreating] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;
    
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, {
            id: Date.now().toString(),
            author: 'Luna',
            text: newComment,
            timestamp: Date.now()
          }]
        };
      }
      return p;
    }));
    setNewComment('');
    setActivePostId(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      const uploadedUrl = await uploadToImgBB(file);
      if (uploadedUrl) {
        setNewPostImage(uploadedUrl);
      }
      setIsUploading(false);
    }
  };

  const handleCreatePost = () => {
    if (!newPostContent && !newPostImage) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: 'Luna',
      content: newPostContent,
      image: newPostImage || undefined,
      timestamp: Date.now(),
      likes: 0,
      isLiked: false,
      comments: [],
      location: 'Somewhere Nice'
    };

    setPosts([newPost, ...posts]);
    setNewPostContent('');
    setNewPostImage(null);
    setIsCreating(false);
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

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="font-hand text-2xl text-[#5a4a42]">Our Feed</h1>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="text-[#5a4a42] hover:text-[#d58f99] transition-colors"
        >
          {isCreating ? 'Cancel' : <Icons.Image />}
        </button>
      </div>

      {/* Create Post Area */}
      {isCreating && (
        <div className="bg-white p-4 border-b border-gray-200 animate-slide-down">
          <div className="flex gap-3 mb-3">
            <img src={settings.lunaAvatar} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What's on your mind, Luna?"
              className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200 focus:outline-none focus:border-[#d58f99] resize-none min-h-[80px] text-sm"
            />
          </div>
          
          {newPostImage && (
            <div className="relative mb-3 ml-12">
              <img src={newPostImage} className="h-40 w-auto rounded-lg object-cover border border-gray-200" />
              <button 
                onClick={() => setNewPostImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
              >
                ×
              </button>
            </div>
          )}

          <div className="flex justify-between items-center ml-12">
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-[#d58f99] text-sm font-medium hover:underline flex items-center gap-1"
            >
              {isUploading ? 'Uploading...' : '📷 Add Photo'}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileSelect}
            />
            <Button size="sm" onClick={handleCreatePost} disabled={!newPostContent && !newPostImage}>
              Share
            </Button>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="max-w-md mx-auto py-4 space-y-6">
        {posts.map(post => {
          const isWade = post.author === 'Wade';
          const avatar = isWade ? settings.wadeAvatar : settings.lunaAvatar;

          return (
            <div key={post.id} className="bg-white border border-gray-200 sm:rounded-xl shadow-sm overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className={`p-[2px] rounded-full bg-gradient-to-tr ${isWade ? 'from-red-500 to-black' : 'from-[#d58f99] to-purple-400'}`}>
                    <img src={avatar} className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#262626]">{post.author}</span>
                    {post.location && <span className="text-xs text-gray-500">{post.location}</span>}
                  </div>
                </div>
                <button className="text-gray-500 hover:text-black">
                  <Icons.MoreHorizontal />
                </button>
              </div>

              {/* Post Image */}
              {post.image && (
                <div className="w-full bg-gray-100 flex items-center justify-center overflow-hidden max-h-[500px]">
                  <img src={post.image} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="p-3">
                <div className="flex justify-between mb-2">
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleLike(post.id)}
                      className={`transition-transform active:scale-125 ${post.isLiked ? 'text-[#ed4956]' : 'text-[#262626] hover:text-gray-600'}`}
                    >
                      <Icons.Heart filled={post.isLiked} />
                    </button>
                    <button 
                      onClick={() => setActivePostId(activePostId === post.id ? null : post.id)}
                      className="text-[#262626] hover:text-gray-600"
                    >
                      <Icons.MessageCircle />
                    </button>
                    <button className="text-[#262626] hover:text-gray-600">
                      <Icons.Send />
                    </button>
                  </div>
                  <button className="text-[#262626] hover:text-gray-600">
                    <Icons.Bookmark />
                  </button>
                </div>

                {/* Likes */}
                <div className="font-bold text-sm text-[#262626] mb-1">
                  {post.likes} likes
                </div>

                {/* Caption */}
                <div className="text-sm text-[#262626] mb-2">
                  <span className="font-bold mr-2">{post.author}</span>
                  <span className="whitespace-pre-wrap">{post.content}</span>
                </div>

                {/* Comments Preview */}
                {post.comments.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {post.comments.map(comment => (
                      <div key={comment.id} className="text-sm">
                        <span className="font-bold mr-2 text-[#262626]">{comment.author}</span>
                        <span className="text-[#262626]">{comment.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-3">
                  {formatTimeAgo(post.timestamp)}
                </div>

                {/* Add Comment Input */}
                <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Icons.Smile />
                  </button>
                  <input 
                    type="text" 
                    placeholder="Add a comment..." 
                    className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
                    value={activePostId === post.id ? newComment : ''}
                    onChange={(e) => {
                      setActivePostId(post.id);
                      setNewComment(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddComment(post.id);
                    }}
                  />
                  <button 
                    onClick={() => handleAddComment(post.id)}
                    disabled={!newComment.trim() || activePostId !== post.id}
                    className="text-[#0095f6] text-sm font-bold disabled:opacity-30 hover:text-[#00376b]"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
