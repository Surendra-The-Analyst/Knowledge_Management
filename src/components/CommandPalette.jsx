import React, { useState, useEffect } from 'react';
import { searchKnowledgeBase } from '../data/mockData';

export default function CommandPalette({ isOpen, onClose, openArticle }) {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const results = searchKnowledgeBase(query);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-center items-start pt-[15vh]" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 slide-up" onClick={e => e.stopPropagation()}>
        <div className="px-4 py-4 flex items-center gap-3 border-b border-slate-100">
          <span className="text-xl">📖</span>
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Knowledge Management... (e.g. How does billing work?)" 
            className="flex-1 bg-transparent border-none text-slate-900 text-lg focus:outline-none placeholder:text-slate-400" 
          />
          <button onClick={onClose} className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded border border-slate-200 hover:bg-slate-200 transition">ESC</button>
        </div>
        <div className="bg-slate-50 min-h-[100px] max-h-[60vh] overflow-y-auto">
          {query === '' ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Start typing to search across all knowledge articles, guides, and policies.
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((item) => (
                <li key={item.id}>
                  <button 
                    onClick={() => {
                      openArticle(item);
                      onClose();
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-100 flex flex-col">
                    <span className="font-semibold text-slate-800">{item.title}</span>
                    <span className="text-xs text-slate-500">{item.topic}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-slate-400 text-sm">
              No results found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
