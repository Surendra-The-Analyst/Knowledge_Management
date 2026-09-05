import React from 'react';

export default function Navigation() {
  return (
    <nav className="w-[76px] bg-slate-900 flex flex-col items-center py-4 justify-between h-full shrink-0 z-20">
      <div className="flex flex-col gap-6 items-center w-full">
        {/* App Logo */}
        <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl mb-2 shadow-sm cursor-pointer hover:bg-blue-500 transition">
          T
        </div>
        
        {/* Nav Items */}
        <div className="flex flex-col gap-3 w-full px-2">
          <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition group">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center text-white bg-slate-800 transition group shadow-sm">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
            <span className="text-[10px] font-medium">Chats</span>
          </button>
          <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition group">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
            <span className="text-[10px] font-medium">Calls</span>
          </button>
          <button className="w-full aspect-square rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition group">
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
            <span className="text-[10px] font-medium">Folder</span>
          </button>
        </div>
      </div>

      {/* Bottom Profile Area */}
      <div className="flex flex-col items-center gap-1.5 mt-auto pb-2 cursor-pointer group">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white flex items-center justify-center text-sm font-bold border-2 border-slate-700 group-hover:border-slate-400 transition shadow-sm overflow-hidden">
          JD
        </div>
        <span className="text-[10px] text-slate-300 font-medium group-hover:text-white transition">John Doe</span>
      </div>
    </nav>
  );
}
