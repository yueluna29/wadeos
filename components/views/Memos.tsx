import React from 'react';
import { useStore } from '../../store';

export const Memos: React.FC = () => {
  const { memos, messages } = useStore();
  const favoriteMessages = messages.filter(m => m.isFavorite);

  return (
    <div className="h-full overflow-y-auto bg-[#f9f6f7] p-6">
      <h2 className="font-hand text-3xl text-[#d58f99] mb-2">Our Collection</h2>
      <p className="text-[#917c71] text-sm mb-6 opacity-70">Promises kept and words remembered.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Promises / Memos Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-[#eae2e8]">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-2xl">🤙</span>
             <h3 className="font-bold text-[#5a4a42] text-xl">Promises & Codes</h3>
          </div>
          <div className="space-y-3">
             <div className="bg-[#fff0f3] p-4 rounded-xl border-l-4 border-[#d58f99] text-sm text-[#5a4a42] italic">
                "I promise to always make you laugh when you're crying."
             </div>
             {memos.map(memo => (
                <div key={memo.id} className="bg-[#f9f6f7] p-4 rounded-xl text-sm text-[#5a4a42] border border-[#eae2e8]">
                   <div className="font-bold text-[#d58f99] text-xs uppercase tracking-wide mb-1">{memo.type}</div>
                   {memo.content}
                </div>
             ))}
             {memos.length === 0 && (
                <div className="text-center text-xs text-gray-400 mt-4 italic">Add a memo via chat to see it here.</div>
             )}
          </div>
        </div>

        {/* Favorite Messages Section */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-[#eae2e8]">
          <div className="flex items-center gap-2 mb-4">
             <span className="text-2xl">❤️</span>
             <h3 className="font-bold text-[#5a4a42] text-xl">Saved Words</h3>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {favoriteMessages.length === 0 ? (
                 <div className="text-center text-[#917c71]/50 py-10 italic">
                    Heart a message in chat to save it forever.
                 </div>
            ) : (
                favoriteMessages.map(msg => (
                  <div key={msg.id} className="relative bg-[#fff0f3] p-4 rounded-xl rounded-tl-none border border-[#d58f99]/20">
                    <div className="absolute -top-2 left-0 bg-[#d58f99] text-white text-[10px] px-2 py-0.5 rounded-full rounded-bl-none">
                        {new Date(msg.timestamp).toLocaleDateString()}
                    </div>
                    <p className="text-[#5a4a42] text-sm mt-2">{msg.text}</p>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};