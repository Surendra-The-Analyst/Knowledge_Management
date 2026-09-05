import React from 'react';

export default function ArticleView({ article, onBack }) {
  if (!article) return null;

  return (
    <div className="w-full pb-20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <button onClick={onBack} className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1.5 mb-8 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back
        </button>
        
        <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-4 font-mono uppercase tracking-wider">
          Help Center / {article.topic}
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-6">{article.title}</h1>
        
        <div className="prose prose-slate max-w-none mb-12" dangerouslySetInnerHTML={{ __html: article.content }}></div>

        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-700">Was this article helpful?</span>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition shadow-sm bg-white">👍 Yes</button>
              <button className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition shadow-sm bg-white">👎 No</button>
            </div>
          </div>
          <button className="text-sm font-medium text-slate-500 hover:text-slate-800 underline transition">
            Report an issue with this article
          </button>
        </div>
      </div>
    </div>
  );
}
