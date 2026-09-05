import React, { useState, useEffect, useRef } from 'react';
import { searchKnowledgeBase, KNOWLEDGE_BASE } from '../data/mockData';

export default function MainChat({ activeChat, openHelpCenter, openArticle }) {
  const [kmMessages, setKmMessages] = useState([]);
  const [sarahMessages, setSarahMessages] = useState([]);
  const [kmInput, setKmInput] = useState('');
  const [sarahInput, setSarahInput] = useState('');
  
  const kmEndRef = useRef(null);
  const sarahEndRef = useRef(null);

  useEffect(() => {
    kmEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [kmMessages]);

  useEffect(() => {
    sarahEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sarahMessages]);

  const submitKmQuery = (query) => {
    if (!query.trim()) return;
    setKmMessages(prev => [...prev, { id: Date.now(), type: 'user', text: query }]);
    
    setTimeout(() => {
      const results = searchKnowledgeBase(query);
      const article = results.length > 0 ? results[0] : KNOWLEDGE_BASE[0];
      setKmMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', article }]);
    }, 500);
  };

  const handleKmSubmit = (e) => {
    e.preventDefault();
    submitKmQuery(kmInput);
    setKmInput('');
  };

  const handleSarahSubmit = (e) => {
    e.preventDefault();
    if (!sarahInput.trim()) return;
    setSarahMessages(prev => [...prev, { id: Date.now(), text: sarahInput }]);
    setSarahInput('');
  };

  if (activeChat === 'sarah') {
    return (
      <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] relative">
        <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-32">
          <div className="flex flex-col items-center my-6">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-full">Today</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-bold shrink-0 mt-1">SC</div>
            <div>
              <div className="flex items-baseline gap-2 ml-1 mb-1">
                <span className="text-sm font-semibold text-slate-900">Sarah Chen</span>
                <span className="text-[10px] text-slate-400">10:42 AM</span>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2 text-sm text-slate-800">
                Hey! Are we still on track for the staging deployment this afternoon?
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-1">ME</div>
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-2 mr-1 mb-1 flex-row-reverse">
                <span className="text-sm font-semibold text-slate-900">You</span>
                <span className="text-[10px] text-slate-400">10:45 AM</span>
              </div>
              <div className="bg-blue-600 border border-blue-700 rounded-2xl rounded-tr-none px-4 py-2 text-sm text-white">
                Yes, all automated tests passed. I'm just reviewing the final release notes now.
              </div>
            </div>
          </div>
          
          {sarahMessages.map(msg => (
            <div key={msg.id} className="flex items-start gap-3 flex-row-reverse fade-in">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-1">ME</div>
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-2 mr-1 mb-1 flex-row-reverse">
                  <span className="text-sm font-semibold text-slate-900">You</span>
                  <span className="text-[10px] text-slate-400">Just now</span>
                </div>
                <div className="bg-blue-600 border border-blue-700 rounded-2xl rounded-tr-none px-4 py-2 text-sm text-white">
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          <div ref={sarahEndRef} />
        </div>
        <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t border-slate-100">
          <form onSubmit={handleSarahSubmit} className="max-w-4xl mx-auto relative flex items-center">
            <input type="text" value={sarahInput} onChange={e => setSarahInput(e.target.value)} placeholder="Message Sarah Chen..." className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm" />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] relative">
      <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-32">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-base shadow-sm mt-1">📖</div>
          <div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-sm text-slate-700 max-w-xl">
              <p className="font-medium text-slate-900 mb-1">Hi there! I'm your Knowledge Management assistant.</p>
              <p>I can help answer questions about Troop Messenger features, settings, and billing using our official documentation.</p>
              <p className="text-xs text-slate-500 mt-3 font-medium">Try asking one of these common questions:</p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={() => submitKmQuery('How do I create a group?')} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg transition shadow-sm">
                  How do I create a group?
                </button>
                <button onClick={() => submitKmQuery('How do I set auto-delete in a group?')} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg transition shadow-sm">
                  How do I set auto-delete in a group?
                </button>
                <button onClick={() => submitKmQuery("Why can't I see the full chat history in a group?")} className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs px-3 py-1.5 rounded-lg transition shadow-sm">
                  Why can't I see full chat history?
                </button>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-1.5 ml-1 block">Powered by Troop Knowledge Base</span>
          </div>
        </div>

        {kmMessages.map(msg => {
          if (msg.type === 'user') {
            return (
              <div key={msg.id} className="flex items-start gap-3 flex-row-reverse fade-in">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-1">ME</div>
                <div className="flex flex-col items-end">
                  <div className="bg-blue-600 border border-blue-700 rounded-2xl rounded-tr-none px-4 py-2.5 text-sm text-white max-w-xl">
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          } else {
            const article = msg.article;
            return (
              <div key={msg.id} className="flex items-start gap-3 fade-in mt-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-base shadow-sm mt-1">📖</div>
                <div className="max-w-xl w-full">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3 tracking-tight">{article.questionTitle}</h3>
                    
                    {article.formatType === 'reasons' && article.reasons && (
                      <>
                        <p className="text-xs text-slate-700 font-medium mb-2">{article.leadIn}</p>
                        <ul className="space-y-1.5 text-xs text-slate-700 pl-1">
                          {article.reasons.map((r, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0"></span>
                              <span className="leading-relaxed" dangerouslySetInnerHTML={{ __html: r }}></span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {article.formatType === 'steps' && article.stepsSummary && (
                      <>
                        <p className="text-xs text-slate-700 font-medium mb-2">{article.leadIn}</p>
                        <ol className="space-y-2 text-xs text-slate-700">
                          {article.stepsSummary.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="w-[18px] h-[18px] rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                              <span className="leading-relaxed pt-0.5" dangerouslySetInnerHTML={{ __html: step }}></span>
                            </li>
                          ))}
                        </ol>
                      </>
                    )}

                    {article.permissionNote && (
                      <div className="bg-amber-50 border-l-2 border-amber-400 rounded-r-lg px-3 py-2 text-[11px] text-slate-700 mt-3 leading-snug">
                        <strong className="font-semibold text-slate-900">Note:</strong> {article.permissionNote}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button onClick={() => openArticle(article)} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group transition">
                        Read full guide <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        })}
        <div ref={kmEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t border-slate-100">
        <form onSubmit={handleKmSubmit} className="max-w-4xl mx-auto relative flex items-center">
          <input type="text" value={kmInput} onChange={e => setKmInput(e.target.value)} placeholder="Message Knowledge Management..." className="w-full bg-slate-50 border border-slate-300 text-slate-900 text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm" />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
          </button>
        </form>
      </div>
    </div>
  );
}
