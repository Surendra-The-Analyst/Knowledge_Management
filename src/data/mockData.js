export const KNOWLEDGE_BASE = [
  {
    id: "kb-01",
    questionTitle: "How do I create a group?",
    title: "How to Create and Manage a Group",
    formatType: "steps",
    leadIn: "",
    stepsSummary: [
      "Click the <strong>+</strong> icon in the sidebar.",
      "Select <strong>Create Group</strong>.",
      "Enter a group name. You can also add a description and profile image.",
      "Check <strong>Auto-populate Groups</strong>, if available.",
      "Select members and assign roles such as <strong>Owner</strong> or <strong>Moderator</strong>.",
      "Click <strong>Create Group</strong>. You’ll be redirected to the new group chat."
    ],
    permissionNote: "Admin permission is required to create groups or auto-populated groups.",
    topic: "Groups",
    updatedDate: "05 Sep 2026",
    version: "Version 3.2",
    views: "14.2k",
    keywords: ["create group", "new group", "group setup", "make a group", "how do i create a group"],
    content: `
      <p class="text-slate-600 text-base leading-relaxed mb-4">Groups in Troop Messenger allow you to organize your colleagues into dedicated collaborative spaces for departments, projects, or social interests.</p>
      <h3 class="text-lg font-bold text-slate-900 mt-8 mb-3">Step-by-Step Guide</h3>
      <ol class="list-decimal pl-5 space-y-3 text-slate-700 mb-6">
        <li>Click the <strong>+</strong> icon in the sidebar.</li>
        <li>Select <strong>Create Group</strong>.</li>
        <li>Enter a group name. You can also add a description and profile image.</li>
        <li>Check <strong>Auto-populate Groups</strong>, if available.</li>
        <li>Select members and assign roles such as <strong>Owner</strong> or <strong>Moderator</strong>.</li>
        <li>Click <strong>Create Group</strong>. You’ll be redirected to the new group chat.</li>
      </ol>
    `
  },
  {
    id: "kb-02",
    questionTitle: "How do I set auto-delete in a group?",
    title: "Configuring Scheduled Auto-Deletion",
    formatType: "steps",
    leadIn: "",
    stepsSummary: [
      "Open the group chat.",
      "Click the <strong>Group Name</strong> or Avatar and open <strong>Settings</strong>.",
      "Under Everyone, select <strong>Scheduled Content Auto-Deletion</strong>.",
      "Choose what to delete: Messages, Files, or Everything.",
      "Select the frequency and deletion time.",
      "Click <strong>Save</strong>."
    ],
    permissionNote: "Admin permission may be required.",
    topic: "Account & Security",
    updatedDate: "22 Aug 2026",
    version: "Version 2.5",
    views: "8.1k",
    keywords: ["auto-delete", "delete messages", "timer", "scheduled deletion", "remove history", "how do i set auto-delete in a group"],
    content: `
      <p class="text-slate-600 text-base leading-relaxed mb-4">To maintain privacy and reduce storage usage, you can configure your groups to automatically delete content after a specified period.</p>
      <h3 class="text-lg font-bold text-slate-900 mt-8 mb-3">Setup Instructions</h3>
      <ol class="list-decimal pl-5 space-y-3 text-slate-700 mb-6">
        <li>Open the group chat.</li>
        <li>Click the <strong>Group Name</strong> or Avatar and open <strong>Settings</strong>.</li>
        <li>Under Everyone, select <strong>Scheduled Content Auto-Deletion</strong>.</li>
        <li>Choose what to delete: Messages, Files, or Everything.</li>
        <li>Select the frequency and deletion time.</li>
        <li>Click <strong>Save</strong>.</li>
      </ol>
      <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mt-6">
        <h4 class="font-bold text-slate-800 text-sm mb-1">Permission Required</h4>
        <p class="text-sm text-slate-600">Depending on your workspace settings, admin permission may be required to enable scheduled deletion features.</p>
      </div>
    `
  },
  {
    id: "kb-03",
    questionTitle: "Why can't I see the full chat history in a group?",
    title: "Understanding Group Chat History Limits",
    formatType: "reasons",
    leadIn: "You may not see older messages because:",
    reasons: [
      "Your chat history access is restricted.",
      "The <strong>Group Owner</strong> or <strong>Moderator</strong> limited the history period.",
      "Older messages or files were deleted.",
      "Scheduled <strong>Auto-Deletion</strong> removed older content."
    ],
    permissionNote: "Contact your Group Owner, Moderator, or administrator if you need access to older messages.",
    topic: "Messaging & Chats",
    updatedDate: "12 Aug 2026",
    version: "Version 2.3",
    views: "15.4k",
    keywords: ["history", "chat history", "why can't i see the full chat history", "older messages", "missing messages"],
    content: `
      <p class="text-slate-600 text-base leading-relaxed mb-4">Troop Messenger offers flexible retention settings for group conversations to ensure privacy and manage data storage. If you are unable to view older messages in a group, it is typically due to one of several configured policies.</p>
      <h3 class="text-lg font-bold text-slate-900 mt-8 mb-3">Common Reasons for Hidden History</h3>
      <ul class="list-disc pl-5 space-y-2 text-slate-700 mb-6">
        <li><strong>Restricted Member Access:</strong> When new members are added to a group, the Group Owner can choose to hide past history to maintain the confidentiality of prior discussions.</li>
        <li><strong>Retention Limits:</strong> Workspace Admins can set global limits (e.g., 30 days, 90 days) on how long messages are kept before being archived.</li>
        <li><strong>Auto-Deletion:</strong> Specific highly-sensitive groups may have an auto-delete timer enabled, which permanently removes messages after a set duration.</li>
      </ul>
      <div class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mt-6">
        <h4 class="font-bold text-slate-800 text-sm mb-1">Administrator Required</h4>
        <p class="text-sm text-slate-600">Contact your Group Owner, Moderator, or administrator if you need access to older messages.</p>
      </div>
    `
  }
];

export function searchKnowledgeBase(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  return KNOWLEDGE_BASE.filter(item => {
    return item.title.toLowerCase().includes(q) || 
           item.questionTitle.toLowerCase().includes(q) ||
           item.topic.toLowerCase().includes(q) ||
           item.keywords.some(k => k.includes(q));
  });
}

export const HELP_CATEGORIES = [
  {
    id: "cat-1",
    title: "User Onboarding & Directories",
    description: "Learn how to add users manually, perform bulk uploads, sync LDAP/SAML SSO, and configure employee profile locations or departments.",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
  },
  {
    id: "cat-2",
    title: "Messaging & Chats",
    description: "Master one-on-one direct chats, customize text formatting, read receipts, and utilize voice and video messaging.",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
  },
  {
    id: "cat-3",
    title: "Collaboration Groups",
    description: "Create, manage, and moderate Regular or Auto-Populated groups operating under standard or Airtime modes.",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
  },
  {
    id: "cat-4",
    title: "Files & Attachments",
    description: "Understand size limit guidelines, file type whitelists, upload permission hierarchies, and multi-file batch uploads.",
    icon: "M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
  },
  {
    id: "cat-5",
    title: "Organizational Units & Rules",
    description: "Learn how to segment employees into Units with custom communication access rules and Leader overrides.",
    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
  },
  {
    id: "cat-6",
    title: "Voice, Video & Screen Sharing",
    description: "Initiate high-definition direct or group audio/video calls and establish remote screen-sharing sessions.",
    icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
  },
  {
    id: "cat-7",
    title: "Security & Workspace Restrictions",
    description: "Protect organization data by enforcing IP blacklists, platform limitations, and mobile screenshot restrictions.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  },
  {
    id: "cat-8",
    title: "Billing & Plan Subscriptions",
    description: "Track remaining trial days, update payment receipts, configure auto-renewal, and top-up user licenses.",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
  }
];

export const POPULAR_ARTICLES = [
  { id: "art-1", title: "Getting Started with Groups", views: "24.8K views" },
  { id: "art-2", title: "How to Set Auto-Delete in a Group", views: "18.2K views" },
  { id: "art-3", title: "Why Can’t I See the Full Group Chat History?", views: "16.7K views" }
];

export const MESSAGING_SUBCATEGORIES = [
  {
    id: "sub-1",
    title: "Direct & 1:1 Messaging",
    description: "Learn how to initiate private, direct conversations and manage standard text, media, and chat metadata settings.",
    articles: [
      { id: "art-1-1", title: "1:1 Chat Availability" },
      { id: "art-1-2", title: "Text Message Permissions" },
      { id: "art-1-3", title: "Read Receipts Access" },
      { id: "art-1-4", title: "Message Info Metadata" }
    ]
  },
  {
    id: "sub-2",
    title: "Collaborative Groups & Modes",
    description: "Establish manual or automatic group chats and set communication flows using standard or Airtime messaging modes.",
    articles: [
      { id: "art-2-1", title: "Create Regular Group" },
      { id: "art-2-2", title: "Enable Airtime Mode for this Group" },
      { id: "art-2-3", title: "Auto-populated Groups Membership" },
      { id: "art-2-4", title: "Set Chat History Access" }
    ]
  },
  {
    id: "sub-3",
    title: "Advanced Messaging Tools",
    description: "Take control of priority communications with specialized features like Forkout broadcasts, Burnout ephemeral sessions, and Trumpet buzz alerts.",
    articles: [
      { id: "art-3-1", title: "Forkout Broadcast Messaging" },
      { id: "art-3-2", title: "Burnout Ephemeral Sessions" },
      { id: "art-3-3", title: "Trumpet Buzz Alerts" },
      { id: "art-3-4", title: "Location Message Sharing" }
    ]
  },
  {
    id: "sub-4",
    title: "Hands-Free & Transcription",
    description: "Compose messages without typing using integrated Speech to Text (STT) and voice transcription tools.",
    articles: [
      { id: "art-4-1", title: "Speech to Text (STT) Transcription" },
      { id: "art-4-2", title: "Record and Send Voice Messages" },
      { id: "art-4-3", title: "Record and Send Video Messages" }
    ]
  },
  {
    id: "sub-5",
    title: "Drafts, Schedules & Outbox",
    description: "Write now to send later, save your unfinished progress as drafts, and track pending dispatches via the system Outbox.",
    articles: [
      { id: "art-5-1", title: "Manual Save as Draft" },
      { id: "art-5-2", title: "Schedule Message Delivery" },
      { id: "art-5-3", title: "Managing Outbox Items" },
      { id: "art-5-4", title: "Move to Draft from Outbox" },
      { id: "art-5-5", title: "Draft Reopen Validation" }
    ]
  }
];
