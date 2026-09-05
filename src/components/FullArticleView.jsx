import React from 'react';

export default function FullArticleView({ onClose, onBack }) {
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

      {/* Main 3-Column Layout */}
      <div className="flex-1 w-full max-w-[85rem] mx-auto px-6 flex flex-col md:flex-row gap-10 lg:gap-16 py-10">
        
        {/* Left Sidebar - Article Navigation */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-24">
            <button onClick={onBack} className="text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition text-sm font-medium mb-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
              Messaging & Chats
            </button>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 px-3">Articles</h4>
            <nav className="flex flex-col gap-1 text-sm font-medium">
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Burnout Ephemeral Sessions</a>
              <a href="#" className="px-3 py-2.5 text-indigo-700 bg-indigo-50 rounded-lg transition-colors shadow-sm border border-indigo-100">Create Regular Group</a>
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Schedule Message Delivery</a>
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Speech to Text (STT) Transcription</a>
              <a href="#" className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Auto-populated Groups</a>
            </nav>
          </div>
        </aside>

        {/* Central Content Column */}
        <main className="flex-1 max-w-3xl">
          
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
            {/* Article Header */}
            <div className="bg-gradient-to-b from-indigo-50/50 to-white px-8 md:px-12 pt-12 pb-10 border-b border-slate-100">
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-6 font-medium">
                <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">Groups</span>
                <span>•</span>
                <span>How-to Guide</span>
                <span>•</span>
                <span>3 min read</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">Create Regular Group</h1>
            </div>

            {/* Article Body - Custom Premium Styling */}
            <div className="px-8 md:px-12 py-10 text-[1.05rem] text-slate-700 leading-relaxed space-y-12">
              
              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight" id="overview">Overview</h3>
                <p>
                  Groups are used for project collaboration, department communication, and company-wide announcements.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight" id="types">Types of Groups</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                    <h4 className="font-semibold text-slate-900 mb-1.5 text-base">Custom Groups</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">Groups created manually for projects, topics, or regular collaboration.</p>
                  </div>
                  <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50">
                    <h4 className="font-semibold text-slate-900 mb-1.5 text-base">Dynamic Groups</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">Managed automatically based on company, department, location, or directory settings.</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-5 tracking-tight" id="create">How to Create a Custom Group</h3>
                <div className="space-y-3">
                  {[
                    "Click the + icon in the sidebar.",
                    "Select Create Group.",
                    "Enter a Group Name.",
                    "Optionally add a Description and Profile Image.",
                    "Check Auto-populate Groups, if available.",
                    "Choose the messaging mode, if available.",
                    "Select members.",
                    "Assign roles such as Group Owner or Group Moderator.",
                    "Click Create Group."
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3.5 border border-slate-100 rounded-2xl hover:border-indigo-100 hover:bg-indigo-50/40 transition-colors bg-white shadow-sm">
                      <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">{idx + 1}</span>
                      <span className="pt-0.5 font-medium text-slate-800 text-sm">{step}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight" id="roles">Group Roles</h3>
                <ul className="space-y-3.5">
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span><strong className="text-slate-900 font-semibold">Group Owner</strong>: Can manage group settings, members, and group deletion.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span><strong className="text-slate-900 font-semibold">Group Moderator</strong>: Can manage members and basic group details.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span><strong className="text-slate-900 font-semibold">Standard Member</strong>: Can participate in the group according to the group’s messaging settings.</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-4 tracking-tight" id="dynamic">Dynamic Groups</h3>
                <div className="bg-amber-50/80 border border-amber-200/60 p-6 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-400"></div>
                  <p className="text-amber-900 mb-3 text-sm leading-relaxed">
                    Dynamic Groups are managed automatically by the organization. Members may be added or removed based on company, department, location, or directory rules.
                  </p>
                  <p className="text-amber-900 font-semibold text-sm">
                    Manual member management and leaving the group may be unavailable for Dynamic Groups.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold text-slate-900 mb-5 tracking-tight" id="faq">Common Questions</h3>
                <div className="space-y-4">
                  <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50">
                    <strong className="text-slate-900 block mb-1.5">Why can’t I create a group?</strong>
                    <p className="text-sm text-slate-600 leading-relaxed">Group creation may be disabled by your administrator or unavailable for your account type.</p>
                  </div>
                  <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50">
                    <strong className="text-slate-900 block mb-1.5">Why can’t I leave a group?</strong>
                    <p className="text-sm text-slate-600 leading-relaxed">You may be the only Group Owner, or the group may be a Dynamic Group managed by your organization.</p>
                  </div>
                  <div className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50">
                    <strong className="text-slate-900 block mb-1.5">Why can’t I see the full chat history?</strong>
                    <p className="text-sm text-slate-600 leading-relaxed">Your access may be limited by group history settings, administrator policy, deleted content, or scheduled auto-deletion.</p>
                  </div>
                </div>
              </section>

            </div>
          </div>

          {/* Feedback & Related Articles */}
          <div className="mt-12 space-y-10">
            {/* Feedback */}
            <div className="flex items-center gap-4">
              <span className="text-slate-600 font-medium">Was this article helpful?</span>
              <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all text-sm font-semibold">Yes</button>
              <button className="px-5 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all text-sm font-semibold">No</button>
            </div>

            {/* Related Articles */}
            <div className="bg-indigo-50/30 p-8 rounded-3xl border border-indigo-100/50">
              <h3 className="text-lg font-bold text-slate-900 mb-5">Related articles</h3>
              <ul className="flex flex-col gap-3">
                <li className="flex items-center group">
                  <span className="text-indigo-300 mr-3 select-none group-hover:text-indigo-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </span>
                  <a href="#" className="text-base font-medium text-slate-700 hover:text-indigo-700 transition-colors">How to Set Auto-Delete in a Group</a>
                </li>
                <li className="flex items-center group">
                  <span className="text-indigo-300 mr-3 select-none group-hover:text-indigo-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
                  </span>
                  <a href="#" className="text-base font-medium text-slate-700 hover:text-indigo-700 transition-colors">Why Can’t I See the Full Group Chat History?</a>
                </li>
              </ul>
            </div>
          </div>

        </main>

        {/* Right Sidebar - On this page */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">On this page</h4>
            <nav className="flex flex-col gap-2.5 text-sm text-slate-600 font-medium">
              <a href="#overview" className="hover:text-indigo-600 transition-colors border-l-2 border-transparent hover:border-indigo-400 pl-3 -ml-3">Overview</a>
              <a href="#types" className="hover:text-indigo-600 transition-colors border-l-2 border-transparent hover:border-indigo-400 pl-3 -ml-3">Types of Groups</a>
              <a href="#create" className="hover:text-indigo-600 transition-colors border-l-2 border-transparent hover:border-indigo-400 pl-3 -ml-3">How to Create a Custom Group</a>
              <a href="#roles" className="hover:text-indigo-600 transition-colors border-l-2 border-transparent hover:border-indigo-400 pl-3 -ml-3">Group Roles</a>
              <a href="#dynamic" className="hover:text-indigo-600 transition-colors border-l-2 border-transparent hover:border-indigo-400 pl-3 -ml-3">Dynamic Groups</a>
              <a href="#faq" className="hover:text-indigo-600 transition-colors border-l-2 border-transparent hover:border-indigo-400 pl-3 -ml-3">Common Questions</a>
            </nav>
            
            {/* Contextual Box - Article Info */}
            <div className="mt-12">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Article Info</h4>
              <div className="bg-white border border-slate-200/80 p-4 rounded-xl shadow-sm text-sm">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Last Updated</span>
                    <span className="font-medium text-slate-800">2 days ago</span>
                  </div>
                  <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                    <span className="text-slate-500">Author</span>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold">TM</div>
                      <span className="font-medium text-slate-800">Troop Team</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

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
