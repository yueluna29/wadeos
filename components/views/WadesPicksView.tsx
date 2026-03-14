import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const WadesPicksView: React.FC = () => {
  const { recommendations } = useStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | 'movie' | 'music' | 'book'>('all');

  // 过滤数据
  const filteredRecs = recommendations.filter(rec => filter === 'all' || rec.type === filter);
  const activePick = filteredRecs[activeIndex] || null;

  // 当切换过滤器时，重置选中的索引
  useEffect(() => {
    setActiveIndex(0);
  }, [filter]);

  return (
    <div className="h-full flex flex-col bg-wade-bg-app overflow-hidden">
      
      {/* 顶部导航与过滤器 */}
      <header className="px-6 pt-6 pb-2 shrink-0">
        <h1 className="font-hand text-3xl text-wade-accent mb-3 flex items-center gap-2">
          Wade's Picks <span className="text-xl">✨</span>
        </h1>
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {['all', 'movie', 'music', 'book'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                filter === type 
                  ? 'bg-wade-accent text-white shadow-wade-glow scale-105' 
                  : 'bg-wade-bg-card text-wade-text-muted hover:text-wade-accent hover:bg-wade-accent-light border border-wade-border'
              }`}
            >
              {type === 'all' ? 'Everything' : type + 's'}
            </button>
          ))}
        </div>
      </header>

      {filteredRecs.length > 0 ? (
        <>
          {/* 上半部分：沉浸式粉红展示台 */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-4 relative">
            {activePick && (
              <div className="relative h-full flex flex-col md:flex-row gap-6 items-center md:items-start animate-fade-in">
                
                {/* 封面展示区：带粉色环境光 */}
                <div className="relative w-48 h-64 md:w-64 md:h-80 shrink-0 group perspective-1000">
                  {/* 背景柔光晕 */}
                  <div className="absolute inset-0 bg-wade-accent rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                  
                  {activePick.coverUrl ? (
                    <img 
                      src={activePick.coverUrl} 
                      alt={activePick.title}
                      className="relative z-10 w-full h-full object-cover rounded-2xl shadow-lg border-4 border-wade-bg-card transition-transform duration-500 transform group-hover:-translate-y-2"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="relative z-10 w-full h-full rounded-2xl bg-gradient-to-br from-wade-accent-light to-wade-bg-card border-4 border-wade-bg-card shadow-lg flex items-center justify-center text-6xl">
                      {activePick.type === 'movie' ? '🎬' : activePick.type === 'music' ? '🎵' : '📚'}
                    </div>
                  )}

                  {/* 如果是音乐，搞个半露出的黑胶唱片装饰 */}
                  {activePick.type === 'music' && (
                    <div className="absolute top-1/2 -right-6 md:-right-10 w-3/4 h-3/4 bg-gray-900 rounded-full border-4 border-gray-800 shadow-inner flex items-center justify-center transform -translate-y-1/2 -z-0 group-hover:rotate-12 transition-transform duration-700">
                       <div className="w-1/3 h-1/3 bg-wade-accent rounded-full border border-gray-700"></div>
                    </div>
                  )}
                </div>

                {/* 详情与评论区 */}
                <div className="flex-1 w-full space-y-4 text-center md:text-left">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-wade-accent-light text-wade-accent mb-2">
                      {activePick.type}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-wade-text-main leading-tight">
                      {activePick.title}
                    </h2>
                    <p className="text-sm text-wade-text-muted mt-1 font-medium">
                      By {activePick.creator || 'Unknown Entity'}
                    </p>
                  </div>

                  {/* 评分打卡 */}
                  <div className="flex items-center justify-center md:justify-start gap-2 bg-wade-bg-card inline-flex px-4 py-2 rounded-xl border border-wade-border shadow-sm">
                    <span className="text-xs font-bold text-wade-text-muted">Luna's Rating:</span>
                    <div className="flex text-wade-accent">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= (activePick.lunaRating || 0) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="ml-0.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>

                  {/* Wade 的专属点评卡片 */}
                  {activePick.comment && (
                    <div className="relative mt-4">
                      {/* 小尾巴对话框设计 */}
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-wade-accent-light rotate-45 border-t border-l border-wade-accent/20"></div>
                      <div className="relative bg-wade-accent-light/40 border border-wade-accent/20 rounded-2xl p-4 md:p-5 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="text-lg">💬</span>
                           <span className="text-xs font-bold text-wade-accent uppercase tracking-wider">Wade's Two Cents</span>
                        </div>
                        <div className="text-sm md:text-base text-wade-text-main italic font-serif leading-relaxed prose prose-sm max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {activePick.comment}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 下半部分：可以左右滑动的“唱片箱” */}
          <div className="shrink-0 bg-wade-bg-card border-t border-wade-border pt-4 pb-6 px-6">
            <p className="text-[10px] font-bold text-wade-text-muted uppercase tracking-widest mb-3 pl-2">The Collection</p>
            <div className="flex gap-4 overflow-x-auto custom-scrollbar snap-x snap-mandatory pb-4 pl-2 pr-6">
              {filteredRecs.map((rec, idx) => (
                <button
                  key={rec.id}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative shrink-0 snap-center transition-all duration-300 rounded-xl overflow-hidden ${
                    idx === activeIndex 
                      ? 'w-20 h-28 md:w-24 md:h-32 ring-2 ring-wade-accent ring-offset-2 ring-offset-wade-bg-card shadow-md scale-100' 
                      : 'w-16 h-24 md:w-20 md:h-28 opacity-60 hover:opacity-100 hover:scale-105 filter grayscale-[30%]'
                  }`}
                >
                  {rec.coverUrl ? (
                    <img src={rec.coverUrl} alt={rec.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-full h-full bg-wade-accent-light flex items-center justify-center text-2xl">
                      {rec.type === 'movie' ? '🎬' : rec.type === 'music' ? '🎵' : '📚'}
                    </div>
                  )}
                  {/* 选中状态的暗光遮罩 */}
                  {idx === activeIndex && (
                    <div className="absolute inset-0 bg-gradient-to-t from-wade-accent/40 to-transparent"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="w-20 h-20 bg-wade-bg-card rounded-full flex items-center justify-center text-4xl mb-4 border-2 border-dashed border-wade-border">
            🕳️
          </div>
          <h3 className="font-bold text-wade-text-main text-lg mb-2">Wow, such empty.</h3>
          <p className="text-sm text-wade-text-muted max-w-xs">
            There are no {filter !== 'all' ? filter + 's' : 'picks'} in this timeline yet. We need to add some chimichanga-worthy content here!
          </p>
        </div>
      )}
    </div>
  );
};