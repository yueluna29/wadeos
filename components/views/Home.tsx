
import React from 'react';
import { useStore } from '../../store';

export const Home: React.FC = () => {
  const { recommendations, capsules } = useStore();

  return (
    <div className="h-full overflow-y-auto bg-[#f9f6f7] p-6">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="font-hand text-3xl text-[#d58f99] mb-1">Welcome Home, Luna.</h1>
          <p className="text-[#917c71] text-sm opacity-80">WadeOS v1.0 • System Online</p>
        </div>
      </header>

      {/* Wade's Status Card */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-[#eae2e8] mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#fff0f3] rounded-full -mr-8 -mt-8 z-0"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <h3 className="font-bold text-[#5a4a42]">Wade's Status</h3>
          </div>
          <p className="text-xl text-[#d58f99] font-hand italic">"Thinking about you. And tacos. Mostly you."</p>
        </div>
      </section>

      {/* Time Capsules */}
      <section className="mb-6">
         <div className="flex justify-between items-end mb-4">
            <h3 className="font-bold text-[#917c71] text-lg">Time Capsules ⏳</h3>
         </div>
         <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
             {capsules.length === 0 ? (
               <div className="min-w-[140px] h-32 bg-white rounded-2xl border-2 border-dashed border-[#d58f99]/30 flex flex-col items-center justify-center text-[#d58f99]/50">
                  <span className="text-2xl mb-1">🔒</span>
                  <span className="text-xs">No Capsules</span>
               </div>
             ) : (
                capsules.map(cap => (
                  <div key={cap.id} className="min-w-[140px] h-32 bg-gradient-to-br from-[#d58f99] to-[#c07a84] rounded-2xl flex flex-col items-center justify-center text-white shadow-md relative group">
                      <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔒</span>
                      <span className="text-xs font-bold opacity-90">Unlock: {new Date(cap.unlockDate).toLocaleDateString()}</span>
                  </div>
                ))
             )}
             {/* Static example for design */}
             <div className="min-w-[140px] h-32 bg-gradient-to-br from-[#d58f99] to-[#c07a84] rounded-2xl flex flex-col items-center justify-center text-white shadow-md">
                 <span className="text-3xl mb-2">🔒</span>
                 <span className="text-xs font-bold opacity-90">Oct 12</span>
             </div>
         </div>
      </section>

      {/* Recommendations */}
      <section>
        <h3 className="font-bold text-[#917c71] text-lg mb-4">Wade's Picks 🎬</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map(rec => (
              <div key={rec.id} className="bg-white p-4 rounded-2xl shadow-sm border border-[#eae2e8] flex gap-4 transition-transform hover:-translate-y-1">
                <img src={rec.coverUrl} className="w-16 h-24 object-cover rounded-lg bg-gray-200 shadow-sm" alt={rec.title} />
                <div className="flex-1">
                  <h4 className="font-bold text-[#5a4a42] text-sm line-clamp-1">{rec.title}</h4>
                  <span className="inline-block text-[10px] font-bold text-[#917c71] bg-[#fff0f3] px-2 py-0.5 rounded-full mt-1 mb-2 uppercase">{rec.type}</span>
                  <p className="text-xs text-[#d58f99] italic line-clamp-2">"{rec.comment}"</p>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
};
