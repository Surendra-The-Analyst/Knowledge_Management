import React, { useState } from 'react';
import { HELP_CATEGORIES, POPULAR_ARTICLES } from '../data/mockData';
import CategoryView from './CategoryView';
import FullArticleView from './FullArticleView';

export default function HelpCenter({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState('home'); // 'home', 'category-messaging', 'article-groups'

  if (!isOpen) return null;

  if (currentView === 'article-groups') {
    return (
      <FullArticleView 
        onClose={onClose} 
        onBack={() => setCurrentView('home')} 
      />
    );
  }

  if (currentView === 'category-messaging') {
    return (
      <CategoryView 
        onClose={onClose} 
        onBack={() => setCurrentView('home')} 
        onArticleClick={(articleTitle) => {
          if (articleTitle === "Create Regular Group") {
            setCurrentView('article-groups');
          }
        }}
      />
    );
  }

  // Client-side filtering for topics
  const filteredCategories = HELP_CATEGORIES.filter(cat => 
    cat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArticles = POPULAR_ARTICLES.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col overflow-y-auto font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header (Sticky Frosted Glass) */}
      <header className="sticky top-0 z-20 h-16 px-6 flex items-center justify-between shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition" title="Close Help Center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#1a56db] text-white flex items-center justify-center font-bold text-xs shadow-sm">T</div>
            <span className="font-semibold text-slate-900">Troop Messenger</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 font-medium">Help Center</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="text-sm font-semibold text-slate-600 hover:text-[#1a56db] transition">Contact Support</button>
          <button className="text-slate-400 hover:text-slate-700 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </button>
        </div>
      </header>

      {/* Hero Search Section with Gradient */}
      <div className="bg-gradient-to-b from-indigo-50/80 to-slate-50 pt-20 pb-16 px-6 border-b border-indigo-50/50">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-8">How can we help you?</h1>
          <div className="relative max-w-2xl mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
            <svg className="w-6 h-6 text-indigo-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input 
              type="text" 
              placeholder="Search articles, guides, or topics..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 text-slate-900 text-lg rounded-2xl pl-14 pr-4 py-4 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 md:py-16">
        
        {/* Browse Topics */}
        <div className="mb-20">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Browse Topics</h2>
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((cat, idx) => {
                const isMessaging = cat.title === "Messaging & Chats";
                const Wrapper = isMessaging ? 'a' : 'div';
                const wrapperProps = isMessaging ? { href: '/help/messaging', onClick: (e) => {
                  e.preventDefault();
                  setCurrentView('category-messaging');
                } } : {};

                // Use slightly varied pastel colors for icons to add visual interest
                const colors = [
                  'bg-blue-50 text-blue-600 group-hover:bg-blue-100 group-hover:border-blue-200',
                  'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 group-hover:border-indigo-200',
                  'bg-violet-50 text-violet-600 group-hover:bg-violet-100 group-hover:border-violet-200',
                  'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:border-emerald-200',
                  'bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:border-amber-200',
                  'bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-hover:border-rose-200'
                ];
                const colorClass = colors[idx % colors.length];

                return (
                  <Wrapper 
                    key={cat.id} 
                    {...wrapperProps}
                    className={`group bg-white border border-slate-200/80 p-6 rounded-2xl flex flex-col items-start gap-4 transition-all duration-200 shadow-sm ${isMessaging ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md hover:-translate-y-1' : 'cursor-default'}`}
                  >
                    <div className={`w-12 h-12 rounded-xl border border-transparent flex items-center justify-center shrink-0 transition-colors ${colorClass}`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={cat.icon}></path></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-900 mb-2 text-lg group-hover:text-indigo-600 transition-colors">{cat.title}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{cat.description}</p>
                    </div>
                  </Wrapper>
                );
              })}
            </div>
          ) : (
             <div className="text-slate-500 py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-white">No topics found matching "{searchQuery}"</div>
          )}
        </div>

        {/* Bottom Section: Popular Articles & Still Need Help */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Popular Articles</h2>
            {filteredArticles.length > 0 ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
                {filteredArticles.map((art, idx) => {
                  return (
                    <div key={art.id} className={`flex items-center justify-between p-5 hover:bg-slate-50 transition-colors group cursor-default ${idx !== filteredArticles.length - 1 ? 'border-b border-slate-100' : ''}`}>
                      <div className="flex items-center gap-4 flex-1">
                        <span className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-slate-500 flex items-center justify-center text-sm font-medium group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors shrink-0">{idx + 1}</span>
                        <span className="font-medium text-slate-700 text-base group-hover:text-indigo-600 transition-colors">{art.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400 shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        {art.views}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
               <div className="text-slate-500 py-8 text-center border border-dashed border-slate-200 rounded-2xl bg-white">No articles found matching "{searchQuery}"</div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-indigo-50/50 border border-indigo-100 p-8 rounded-2xl h-full flex flex-col justify-center text-center items-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm border border-indigo-100 mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Still need help?</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">Our support team is available 24/7 to assist you with any questions or technical issues.</p>
              <button className="w-full py-2.5 bg-white border border-slate-200 rounded-xl text-indigo-600 font-semibold shadow-sm hover:border-indigo-300 hover:shadow transition-all">Contact Support</button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-6 text-sm text-slate-500 text-center flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 bg-white mt-auto">
        <a href="#" className="hover:text-slate-900 transition font-medium">Status Page</a>
        <span className="hidden md:inline text-slate-300">·</span>
        <a href="#" className="hover:text-slate-900 transition font-medium">Community</a>
        <span className="hidden md:inline text-slate-300">·</span>
        <a href="#" className="hover:text-slate-900 transition font-medium">API Docs</a>
        <span className="hidden md:inline text-slate-300">·</span>
        <a href="#" className="hover:text-slate-900 transition font-medium">Privacy</a>
      </footer>

    </div>
  );
}
