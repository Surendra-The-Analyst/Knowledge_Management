import React from 'react';
import { MESSAGING_SUBCATEGORIES } from '../data/mockData';

export default function CategoryView({ onClose, onBack, onArticleClick }) {
  return (
    <div className="fixed inset-0 bg-slate-50 z-50 flex flex-col overflow-y-auto font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header (Sticky Frosted Glass) */}
      <header className="sticky top-0 z-20 h-16 px-6 flex items-center justify-between shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-md shadow-sm">
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

      {/* Breadcrumb & Main Layout */}
      <div className="flex-1 w-full max-w-[90rem] mx-auto px-6 flex flex-col md:flex-row gap-12 lg:gap-20 py-10">
        
        {/* Left Sidebar - Categories Navigation */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-24">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-3">Categories</h4>
            <nav className="flex flex-col gap-1 text-sm font-medium">
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">User Onboarding</a>
              <a href="#" className="px-3 py-2.5 text-indigo-700 bg-indigo-50 rounded-lg transition-colors shadow-sm border border-indigo-100">Messaging & Chats</a>
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Collaboration Groups</a>
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Voice & Video Calls</a>
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">File Sharing</a>
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Integrations</a>
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Security Settings</a>
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Billing & Licenses</a>
            </nav>
          </div>
        </aside>

        {/* Main Content - Capped width to prevent scattering */}
        <main className="flex-1 max-w-3xl">
          
          <div className="flex items-center gap-2 text-sm mb-8 text-slate-500 font-medium">
            <button onClick={onBack} className="hover:text-indigo-600 transition">Help Center</button>
            <span className="text-slate-300">&gt;</span>
            <span className="text-slate-900">Messaging & Chats</span>
          </div>

          {/* Category Header */}
          <div className="mb-14">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6">Messaging & Chats</h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
              Master one-on-one direct chats, customize text formatting, read receipts, and utilize voice and video messaging.
            </p>
          </div>

          {/* Browse Articles */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 shadow-sm">
            <div className="flex flex-col gap-10">
              {MESSAGING_SUBCATEGORIES.map((sub, idx) => (
                <div key={sub.id} className={`pb-10 ${idx !== MESSAGING_SUBCATEGORIES.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{sub.title}</h3>
                  <p className="text-slate-600 mb-6 text-base leading-relaxed">{sub.description}</p>
                  
                  <ul className="flex flex-col gap-4">
                    {sub.articles.map(art => {
                      const isTargetArticle = art.title === "Create Regular Group";
                      const isOtherFunctional = art.title === "Speech to Text (STT) Transcription" || art.title === "Schedule Message Delivery";
                      const isClickable = isTargetArticle || isOtherFunctional;
                      
                      return (
                        <li key={art.id} className="flex items-start group">
                          <span className="mr-3 mt-1 select-none transition-colors text-indigo-400 group-hover:text-indigo-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                          </span>
                          <a 
                            href={isClickable ? `/help/messaging/${art.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : "#"}
                            onClick={(e) => {
                              if (isTargetArticle) {
                                e.preventDefault();
                                onArticleClick(art.title);
                              } else {
                                e.preventDefault();
                              }
                            }}
                            className="text-base font-medium transition-all text-indigo-600 hover:text-indigo-800 hover:underline"
                          >
                            {art.title}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-10 px-6 text-sm text-slate-500 text-center flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 bg-white">
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
