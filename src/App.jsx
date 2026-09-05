import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import MainChat from './components/MainChat';
import CommandPalette from './components/CommandPalette';
import HelpCenter from './components/HelpCenter';

export default function App() {
  const [activeChat, setActiveChat] = useState('km');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openArticle = (article) => {
    setActiveArticle(article);
    setIsHelpCenterOpen(true);
  };

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden">
        <Navigation />
        <Sidebar activeChat={activeChat} setActiveChat={setActiveChat} />
        
        <main className="flex-1 flex flex-col bg-white relative h-full">
          <header className="h-14 border-b border-slate-200 px-5 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-3">
              {activeChat === 'km' ? (
                <>
                  <span className="text-xl">📖</span>
                  <h1 className="font-semibold text-slate-800">Knowledge Management</h1>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">SC</div>
                  <h1 className="font-semibold text-slate-800">Sarah Chen</h1>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200 hidden sm:block">
                Press <kbd className="font-mono font-medium text-slate-600">Ctrl+K</kbd> to ask a question
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <button 
                onClick={() => setIsHelpCenterOpen(true)}
                className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Help Center
              </button>
            </div>
          </header>

          <MainChat 
            activeChat={activeChat} 
            openHelpCenter={() => setIsHelpCenterOpen(true)} 
            openArticle={openArticle}
          />
        </main>
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)}
        openArticle={openArticle}
      />
      
      <HelpCenter 
        isOpen={isHelpCenterOpen} 
        onClose={() => {
          setIsHelpCenterOpen(false);
          setActiveArticle(null);
        }}
        activeArticle={activeArticle}
        setActiveArticle={setActiveArticle}
      />
    </>
  );
}
