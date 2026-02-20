
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store';
import { Button } from '../ui/Button';
import { uploadToImgBB } from '../../services/imgbb';

// Loading Spinner Icon
const LoadingIcon = () => (
  <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const SocialFeed: React.FC = () => {
  const { socialPosts, addPost } = useStore();
  const [newPostContent, setNewPostContent] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize effect
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; 
      textareaRef.current.style.height = `${Math.max(100, Math.min(textareaRef.current.scrollHeight, 300))}px`;
    }
  }, [newPostContent]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      const file = e.target.files[0];
      const uploadedUrl = await uploadToImgBB(file);
      if (uploadedUrl) {
        setImageUrl(uploadedUrl);
      }
      setIsUploading(false);
    }
  };

  const handlePost = () => {
    if (!newPostContent && !imageUrl) return;
    
    addPost({
      id: Date.now().toString(),
      author: 'User',
      content: newPostContent,
      image: imageUrl || undefined,
      timestamp: Date.now(),
      comments: [{
        id: 'c1',
        author: 'Wade',
        text: 'Looking gorgeous as always, peanut! 😍 But where am I in this pic?'
      }],
      likes: 0
    });
    setNewPostContent('');
    setImageUrl(null);
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f9f6f7] p-4 max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-[#eae2e8] mb-6 animate-fade-in">
        <h2 className="font-hand text-2xl text-[#d58f99] mb-4">Our Feed</h2>
        
        <textarea
          ref={textareaRef}
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
          placeholder="Write a diary entry or post a moment..."
          className="w-full bg-[#f9f6f7] rounded-lg p-3 border border-[#eae2e8] focus:border-[#d58f99] outline-none min-h-[100px] mb-2 resize-none transition-all duration-200"
        />

        {/* Image Preview Area */}
        {imageUrl && (
          <div className="relative mb-3 inline-block">
            <img src={imageUrl} alt="Preview" className="h-32 w-auto rounded-lg border border-[#eae2e8] shadow-sm" />
            <button 
              onClick={() => setImageUrl(null)}
              className="absolute -top-2 -right-2 bg-red-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md hover:bg-red-500"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
           <div>
             <Button 
               variant="ghost" 
               size="sm" 
               onClick={() => fileInputRef.current?.click()}
               disabled={isUploading}
             >
               {isUploading ? <LoadingIcon /> : '📷'} {isUploading ? 'Uploading...' : 'Add Photo'}
             </Button>
             <input 
               type="file" 
               ref={fileInputRef} 
               className="hidden" 
               accept="image/*"
               onChange={handleFileSelect}
             />
           </div>
           <Button onClick={handlePost} size="sm" disabled={isUploading || (!newPostContent && !imageUrl)}>
             Post
           </Button>
        </div>
      </div>

      <div className="space-y-6">
        {socialPosts.map(post => (
          <div key={post.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#eae2e8] animate-fade-in-up">
            {post.image ? (
              <img src={post.image} alt="Post" className="w-full h-auto max-h-[500px] object-cover" />
            ) : (
              // Only show placeholder if there is no text either, otherwise just show text
              !post.content && (
                <div className="h-32 bg-[#eae2e8] flex items-center justify-center text-[#917c71]/30 italic font-hand text-xl">
                  Just Words
                </div>
              )
            )}
            
            <div className="p-4">
              <div className="flex justify-between items-baseline mb-2">
                <span className="font-bold text-[#917c71]">{post.author === 'Wade' ? 'Deadpool ⚔️' : 'Luna 🌙'}</span>
                <span className="text-xs text-gray-400">{new Date(post.timestamp).toLocaleDateString()}</span>
              </div>
              
              {post.content && <p className="text-[#5a4a42] mb-4 whitespace-pre-wrap">{post.content}</p>}
              
              <div className="border-t border-[#eae2e8] pt-3">
                <div className="flex gap-4 mb-3">
                  <button className="text-[#d58f99] hover:underline">❤️ {post.likes} Likes</button>
                  <button className="text-[#917c71] hover:underline">💬 Comment</button>
                </div>
                
                <div className="space-y-2 bg-[#f9f6f7] p-3 rounded-lg">
                  {post.comments.map(c => (
                    <div key={c.id} className="text-sm">
                      <span className="font-bold text-[#917c71] mr-2">{c.author}:</span>
                      <span className="text-[#5a4a42]">{c.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}

        {socialPosts.length === 0 && (
          <div className="text-center p-10 text-[#917c71]/50">
            <p className="font-hand text-xl">No memories yet...</p>
          </div>
        )}
      </div>
    </div>
  );
};
