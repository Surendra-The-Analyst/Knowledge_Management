import React from 'react';

export default function Sidebar({ activeChat, setActiveChat }) {
  return (
    <aside className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col h-full shrink-0">
      <div className="h-14 flex items-center justify-between px-4 border-b border-slate-200 bg-slate-50 shrink-0">
        <h2 className="font-bold text-slate-800 text-lg tracking-tight">Messages</h2>
        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-600 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-6">
        <div>
          <h3 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Direct Chats</h3>
          <div className="space-y-0.5">
            <button 
              onClick={() => setActiveChat('km')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeChat === 'km' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-200/50'}`}>
              <span className="text-base">📖</span>
              <span className="truncate">Knowledge Management</span>
            </button>
            <button 
              onClick={() => setActiveChat('sarah')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeChat === 'sarah' ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-200/50'}`}>
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold shrink-0">SC</div>
              <span className="truncate">Sarah Chen</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200/50 transition-colors">
              <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold shrink-0">AM</div>
              <span className="truncate">Alex Morgan</span>
            </button>
          </div>
        </div>

        <div>
          <h3 className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Groups</h3>
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200/50 transition-colors">
              <span className="text-slate-400">#</span>
              <span className="truncate">Product & Design Core</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200/50 transition-colors">
              <span className="text-slate-400">#</span>
              <span className="truncate">Engineering Deployment</span>
            </button>
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-200/50 transition-colors">
              <span className="text-slate-400">#</span>
              <span className="truncate">Customer Operations</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
