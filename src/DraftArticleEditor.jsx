import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from 'react';
import * as Icons from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const adminMaxCycle = 90;
const versions = ["v5.0", "v5.1", "v5.2", "v5.3"];
const categories = [
  { name: "Getting Started", sections: ["Basics", "Account Setup"] },
  { name: "Messaging & Chats", sections: ["Sending & Formatting", "Threads & Replies", "Hands-Free & Transcription"] },
  { name: "Collaboration Groups", sections: ["Groups & Modes", "Membership & Access", "General"] },
  { name: "Calls & Meetings", sections: ["Voice Calls", "Video Meetings"] },
  { name: "Files & Sharing", sections: ["Sharing Files", "Storage & Limits"] },
  { name: "Security & Privacy", sections: ["Sign-in & Devices", "Data Controls"] },
  { name: "Admin Console", sections: ["Workspace Settings", "Users & Roles"] },
  { name: "Integrations & Bots", sections: ["Connect Apps", "Bots & Automation"] }
];

const mockArticles = [
  { id: "enable-airtime-mode-for-this-group", title: "Enable Airtime Mode for this Group", category: "Collaboration Groups", section: "Groups & Modes", keywords: ["airtime", "voice", "audio"], order: 1 },
  { id: "create-regular-group", title: "Create Regular Group", category: "Collaboration Groups", section: "Groups & Modes", keywords: ["create group", "regular group"], order: 2 },
  { id: "airtime-vs-standard-messaging-mode", title: "Airtime vs Standard Messaging Mode", category: "Collaboration Groups", section: "Groups & Modes", keywords: ["airtime", "compare"], order: 3 },
  { id: "auto-populated-groups-membership", title: "Auto-populated Groups Membership", category: "Collaboration Groups", section: "Membership & Access", keywords: ["dynamic group", "rules"], order: 1 },
  { id: "set-chat-history-access", title: "Set Chat History Access", category: "Collaboration Groups", section: "Membership & Access", keywords: ["history", "retention"], order: 2 },
  { id: "leaving-a-group", title: "Leaving a Group", category: "Collaboration Groups", section: "General", keywords: ["leave", "exit"], order: 1 },
  { id: "group-size-limits", title: "Group Size Limits and Capacity", category: "Collaboration Groups", section: "General", keywords: ["limits", "capacity"], order: 2 },
  { id: "archive-inactive-groups", title: "Archive Inactive Groups", category: "Collaboration Groups", section: "General", keywords: ["archive", "hide"], order: 3 },
  { id: "deleting-a-group", title: "Deleting a Group", category: "Collaboration Groups", section: "General", keywords: ["delete", "remove"], order: 4 },
  { id: "promoting-member-admin", title: "Promoting a Member to Group Admin", category: "Collaboration Groups", section: "General", keywords: ["admin", "promote"], order: 5 },
  { id: "voice-typing-basics", title: "Voice Typing Basics", category: "Messaging & Chats", section: "Hands-Free & Transcription", keywords: ["voice", "typing"], order: 1 },
  { id: "hands-free-mode-overview", title: "Hands-Free Mode Overview", category: "Messaging & Chats", section: "Hands-Free & Transcription", keywords: ["hands-free", "overview"], order: 2 },
  { id: "transcribe-voice-message", title: "Transcribe a Voice Message", category: "Messaging & Chats", section: "Hands-Free & Transcription", keywords: ["transcribe", "text"], order: 3 },
  { id: "voice-playback-speed", title: "Voice Message Playback Speed", category: "Messaging & Chats", section: "Hands-Free & Transcription", keywords: ["speed", "playback"], order: 4 },
  { id: "format-messages", title: "Format Messages", category: "Messaging & Chats", section: "Sending & Formatting", keywords: ["format", "bold", "italic"], order: 1 },
  { id: "edit-delete-messages", title: "Edit and Delete Messages", category: "Messaging & Chats", section: "Sending & Formatting", keywords: ["edit", "delete"], order: 2 },
  { id: "schedule-message", title: "Schedule a Message", category: "Messaging & Chats", section: "Sending & Formatting", keywords: ["schedule", "later"], order: 3 },
  { id: "reply-in-thread", title: "Reply in a Thread", category: "Messaging & Chats", section: "Threads & Replies", keywords: ["reply", "thread"], order: 1 },
  { id: "pin-a-message", title: "Pin a Message", category: "Messaging & Chats", section: "Threads & Replies", keywords: ["pin", "save"], order: 2 }
];

// Generate extra articles to hit 100+
for (let i = 0; i < 85; i++) {
  const cat = categories[i % categories.length];
  const sec = cat.sections[i % cat.sections.length];
  mockArticles.push({ id: `gen-${i}`, title: `Using ${sec} Feature ${i + 1}`, category: cat.name, section: sec, keywords: ["feature", "guide", "setup"], order: 10 + i });
}

const keywordVocabulary = ["voice message", "voice note", "microphone", "record", "browser", "permissions", "audio", "send"];
const synonymMap = {
  "voice message": ["voice note", "audio message", "voice memo"],
  "microphone": ["mic", "audio input"],
  "record": ["capture"]
};

const blockSamples = {
  paragraph: { type: 'paragraph', html: 'Enter text here...' },
  heading2: { type: 'heading', level: 2, html: 'New Section' },
  heading3: { type: 'heading', level: 3, html: 'Subsection' },
  bullet: { type: 'list', variant: 'bullet', items: [{ id: generateId(), html: 'List item' }] },
  numbered: { type: 'list', variant: 'numbered', items: [{ id: generateId(), html: 'First step' }] },
  steps: { type: 'steps', items: [{ id: generateId(), html: 'Step 1 description' }, { id: generateId(), html: 'Step 2 description' }, { id: generateId(), html: 'Step 3 description' }] },
  table: { type: 'table', rows: [['Header 1', 'Header 2', 'Header 3'], ['Cell', 'Cell', 'Cell'], ['Cell', 'Cell', 'Cell']] },
  code: { type: 'code', lang: 'javascript', html: 'console.log("Hello world");', caption: '' },
  screenshot: { type: 'screenshot', alt: '', caption: '' },
  quote: { type: 'quote', html: 'Enter quote text here' },
  faq: { type: 'faq', items: [{ id: generateId(), q: 'Question 1?', a: 'Answer here.' }, { id: generateId(), q: 'Question 2?', a: 'Answer here.' }] },
  calloutInfo: { type: 'callout', variant: 'info', html: 'Add informational context here.' },
  calloutNote: { type: 'callout', variant: 'note', html: 'Add a helpful note here.' },
  calloutSuccess: { type: 'callout', variant: 'success', html: 'Add success criteria here.' },
  calloutWarning: { type: 'callout', variant: 'warning', html: 'Add a warning here.' },
  calloutError: { type: 'callout', variant: 'error', html: 'Add error states or critical alerts here.' }
};

const initialArticle = {
  id: "voice-message-recording",
  title: "Voice Message Recording in Browser",
  category: "Messaging & Chats",
  section: "Hands-Free & Transcription",
  status: "draft",
  author: "Priya Menon",
  summary: "",
  keywords: [],
  synonyms: [],
  changeType: "New",
  changeNote: "",
  availableFromVersion: "v5.2",
  relatedIds: [],
  positionAfterId: "voice-playback-speed",
  reviewCycle: 90,
  content: [
    { id: generateId(), type: 'heading', level: 2, html: 'Overview' },
    { id: generateId(), type: 'paragraph', html: 'Record and send voice notes straight from the Troop Messenger web app.' },
    { id: generateId(), type: 'heading', level: 2, html: 'Before you begin' },
    { id: generateId(), type: 'list', variant: 'bullet', items: [
      { id: generateId(), html: 'Use a supported browser (Chrome, Edge or Firefox).' },
      { id: generateId(), html: 'Allow microphone access when prompted.' },
      { id: generateId(), html: 'Make sure your microphone is working and not muted.' }
    ]},
    { id: generateId(), type: 'callout', variant: 'info', html: 'Voice messages need a microphone and a supported browser.' },
    { id: generateId(), type: 'heading', level: 2, html: 'Record and send a voice message' },
    { id: generateId(), type: 'heading', level: 3, html: 'Grant microphone access' },
    { id: generateId(), type: 'paragraph', html: 'When prompted by your browser, ensure you grant the necessary permissions.' },
    { id: generateId(), type: 'heading', level: 3, html: 'Record, pause or cancel' },
    { id: generateId(), type: 'steps', items: [
      { id: generateId(), html: '<b>Allow the microphone</b> - When prompted, click Allow to give the browser access to your microphone.' },
      { id: generateId(), html: '<b>Press Record</b> - Click the Record button to start recording your voice message.' }
    ]},
    { id: generateId(), type: 'screenshot', alt: '', caption: '' },
    { id: generateId(), type: 'steps', items: [
      { id: generateId(), html: '<b>Pause if needed</b> - Click Pause to temporarily stop and continue recording.' },
      { id: generateId(), html: '<b>Cancel or keep</b> - You can cancel the recording or keep the current recording.' },
      { id: generateId(), html: '<b>Send</b> - Click Send to share the voice message in the chat.' }
    ]},
    { id: generateId(), type: 'heading', level: 3, html: 'Send' },
    { id: generateId(), type: 'paragraph', html: 'The message will appear in the chat thread immediately.' },
    { id: generateId(), type: 'callout', variant: 'warning', html: 'If the browser blocks the microphone, the Record button will not appear.' },
    { id: generateId(), type: 'heading', level: 2, html: 'Limits and supported browsers' },
    { id: generateId(), type: 'table', rows: [['Feature', 'Limit'], ['Maximum length', '5 min'], ['File format', 'WebM'], ['Browsers', 'Chrome, Edge, Firefox']] },
    { id: generateId(), type: 'code', lang: 'javascript', html: "navigator.permissions.query({ name: 'microphone' })", caption: "Check microphone permission" },
    { id: generateId(), type: 'callout', variant: 'success', html: 'Your message is sent when the waveform turns solid.' },
    { id: generateId(), type: 'callout', variant: 'note', html: 'Recordings are not saved on the device.' },
    { id: generateId(), type: 'callout', variant: 'error', html: 'Recording stopped. Check your connection and try again.' },
    { id: generateId(), type: 'quote', html: 'Tip: You can also press the mic key on supported keyboards.' },
    { id: generateId(), type: 'heading', level: 2, html: 'Troubleshooting' },
    { id: generateId(), type: 'paragraph', html: 'If recording does not start, check the browser\'s site settings for microphone access.' },
    { id: generateId(), type: 'heading', level: 2, html: 'Common questions' },
    { id: generateId(), type: 'faq', items: [
      { id: generateId(), q: 'Why can\'t I see the Record button?', a: 'The browser has blocked microphone access. Allow it in the site settings and reload.' },
      { id: generateId(), q: 'How long can a voice message be?', a: 'Up to 5 minutes.' }
    ]}
  ]
};

const SEED = {
  adminMaxCycle, versions, categories, articles: mockArticles, keywordVocabulary, synonymMap, blockSamples, initialArticle
};

const GLOBAL_STYLES = `
  :root {
    --page: #FBFAF7; --card: #FFFFFF; --inset: #F4F2EC; --input: #FFFFFF;
    --text: #2C2C2A; --muted: #6E6E68; --border: #E6E3DC; --ghost-border: #CFCBC2;
    --heading: #0A1D3B; --link: #0F2A52;
    --amber: #E3A008; --amber-hover: #CC9006; --amber-text: #8A6200; --amber-tint: #FBEFD2; --on-amber: #0A1D3B;
    --teal: #12777D; --teal-tint: #E2EEEE; --teal-text: #0B4F53;
    --brick: #A3382F; --brick-tint: rgba(163,56,47,.10); --brick-text: #A3382F;
    --success: #2F7D4F; --success-tint: rgba(47,125,79,.10); --success-text: #256640;
    --on-fill: #FFFFFF; --navy: #0F2A52; --hover: #F4F2EC; --skel: #EFEDE8;
    --shadow: 0 1px 2px rgba(10,29,59,.06);
  }
  [data-theme="dark"] {
    --page: #101822; --card: #18222E; --inset: #141D28; --input: #101822;
    --text: #E7E4DC; --muted: #9A968C; --border: #2A3644; --ghost-border: #46515F;
    --heading: #E7E4DC; --link: #DCE5F2;
    --amber: #F0B428; --amber-hover: #F5C451; --amber-text: #F0B428; --amber-tint: #3A2E12; --on-amber: #05101F;
    --teal: #12777D; --teal-tint: #10302F; --teal-text: #7FC9CC;
    --brick: #C4564A; --brick-tint: rgba(196,86,74,.16); --brick-text: #D0776C;
    --success: #4DAA73; --success-tint: rgba(77,170,115,.16); --success-text: #7CCB9A;
    --on-fill: #F4F2EC; --navy: #0F2A52; --hover: #1F2A37; --skel: #222D3A;
    --shadow: none;
  }
  
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: 'Inter', sans-serif; background: var(--page); color: var(--text); font-size: 13px; line-height: 1.5; overflow: hidden; }
  
  h1, h2, h3, .bricolage { font-family: 'Bricolage Grotesque', sans-serif; font-weight: 600; color: var(--heading); margin: 0; }
  h1 { font-size: 36px; line-height: 1.15; margin-bottom: 16px; }
  h2 { font-size: 24px; margin-top: 40px; margin-bottom: 16px; }
  h3 { font-size: 18px; margin-top: 24px; margin-bottom: 12px; }
  .serif { font-family: 'Source Serif 4', serif; font-size: 17px; line-height: 1.65; color: var(--text); }
  .mono { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
  
  :focus-visible { outline: none; box-shadow: 0 0 0 2px var(--page), 0 0 0 4px var(--amber) !important; border-radius: inherit; }
  
  button { font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; border: none; background: transparent; padding: 0; display: inline-flex; align-items: center; justify-content: center; transition: 120ms ease; color: var(--text); }
  button:disabled { opacity: 0.4; pointer-events: none; }
  
  input, textarea, select { font-family: inherit; font-size: 13px; background: var(--input); border: 1px solid var(--border); color: var(--text); border-radius: 6px; padding: 0 12px; transition: 120ms ease; width: 100%; outline: none; }
  input:focus, textarea:focus, select:focus { border-color: var(--amber); box-shadow: 0 0 0 2px var(--page), 0 0 0 4px var(--amber); }
  textarea { padding: 8px 12px; resize: vertical; line-height: 1.5; }
  
  .btn { height: 34px; padding: 0 14px; border-radius: 6px; gap: 6px; }
  .btn-primary { background: var(--amber); color: var(--on-amber); }
  .btn-primary:hover { background: var(--amber-hover); }
  .btn-ghost { border: 1px solid var(--ghost-border); }
  .btn-ghost:hover { background: var(--hover); border-color: var(--muted); }
  .btn-text { color: var(--link); padding: 0 8px; font-weight: 500; }
  .btn-text:hover { text-decoration: underline; background: var(--hover); }
  .status-pill { height: 22px; border-radius: 11px; padding: 0 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; display: inline-flex; align-items: center; flex-shrink: 0; border: 1px solid var(--ghost-border); color: var(--muted); }
  .status-pill-review { background: var(--teal-tint); border-color: var(--teal); color: var(--teal-text); }
  .status-pill-returned { background: var(--brick-tint); border-color: var(--brick); color: var(--brick-text); }
  .status-pill-revision { background: var(--amber-tint); border-color: var(--amber); color: var(--amber-text); }
  .status-pill-published { background: var(--teal); border-color: var(--teal); color: var(--on-fill); }
  .back-link { height: 34px; padding: 0 10px; border-radius: 6px; gap: 6px; color: var(--link); }
  .back-link:hover { background: var(--hover); }
  .submission-banner { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 24px; padding: 14px 16px; border: 1px solid var(--teal); border-left-width: 3px; border-radius: 8px; background: var(--teal-tint); color: var(--teal-text); }
  .returned-banner { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 24px; padding: 14px 16px; border: 1px solid var(--brick); border-left-width: 3px; border-radius: 8px; background: var(--brick-tint); color: var(--brick-text); }
  .published-banner { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 24px; padding: 14px 16px; border: 1px solid var(--teal); border-left-width: 3px; border-radius: 8px; background: var(--teal-tint); color: var(--teal-text); }
  .revision-banner { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 24px; padding: 14px 16px; border: 1px solid var(--amber); border-left-width: 3px; border-radius: 8px; background: var(--amber-tint); color: var(--amber-text); }
  .comment-card { border: 1px solid var(--border); border-left: 3px solid var(--amber); border-radius: 8px; padding: 12px; background: var(--card); }
  .comment-card.resolved { opacity: .72; border-left-color: var(--success); background: var(--inset); }
  .comment-reply { border-left: 2px solid var(--border); padding-left: 10px; color: var(--muted); }
  .read-only [contenteditable="false"] { cursor: default; }
  .read-only .block-row:hover .block-gutter { opacity: 0; }
  
  .layout-shell { display: flex; flex-direction: column; height: 100vh; }
  .fake-top-bar { height: 56px; background: var(--card); border-bottom: 1px solid var(--border); flex-shrink: 0; display: flex; align-items: center; padding: 0 16px; gap: 16px; }
  .main-columns { display: flex; flex: 1; overflow: hidden; position: relative; }
  
  .editor-bar { height: 56px; background: var(--card); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 10; flex-shrink: 0; position: sticky; top: 0; }
  .slim-toolbar { height: 40px; background: var(--card); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 16px; gap: 4px; z-index: 9; flex-shrink: 0; position: sticky; top: 56px; }
  
  .toolbar-btn { width: 32px; height: 32px; border-radius: 6px; }
  .toolbar-btn:hover { background: var(--hover); }
  .toolbar-divider { width: 1px; height: 20px; background: var(--border); margin: 0 4px; }
  
  .col-outline { width: 220px; background: var(--card); border-right: 1px solid var(--border); overflow-y: auto; transition: width 180ms ease, opacity 180ms ease; display: flex; flex-direction: column; flex-shrink: 0; }
  .col-canvas { flex: 1; background: var(--page); overflow-y: auto; display: flex; justify-content: center; scroll-behavior: smooth; position: relative; }
  .col-panel { width: 340px; background: var(--card); border-left: 1px solid var(--border); overflow-y: auto; transition: width 180ms ease, opacity 180ms ease; display: flex; flex-direction: column; flex-shrink: 0; }
  .col-closed { width: 0 !important; opacity: 0; overflow: hidden; border: none; padding: 0; margin: 0; }
  
  .canvas-inner { width: 100%; max-width: 720px; padding: 40px 24px 120px; position: relative; }
  
  .outline-item { padding: 8px 16px; cursor: pointer; color: var(--muted); border-left: 2px solid transparent; transition: 120ms; line-height: 1.4; display: block; text-decoration: none;}
  .outline-item:hover { background: var(--hover); color: var(--text); }
  .outline-item.active { border-left-color: var(--amber); color: var(--text); font-weight: 500; background: var(--hover); }
  
  .block-row { position: relative; display: flex; margin-top: 16px; }
  .block-gutter { width: 32px; margin-left: -36px; opacity: 0; display: flex; justify-content: flex-end; padding-top: 2px; transition: opacity 120ms; position: absolute; }
  .block-row:hover .block-gutter { opacity: 1; }
  .block-content { flex: 1; min-width: 0; outline: none; }
  .block-content[contenteditable="true"]:empty::before { content: attr(placeholder); color: var(--muted); pointer-events: none; display: block; }
  
  .callout-block { padding: 16px; background: var(--inset); border-left: 3px solid var(--border); display: flex; gap: 12px; }
  .callout-info { background: var(--teal-tint); border-left-color: var(--teal); }
  .callout-note { background: var(--inset); border-left-color: var(--ghost-border); }
  .callout-success { background: var(--success-tint); border-left-color: var(--success); }
  .callout-warning { background: var(--amber-tint); border-left-color: var(--amber); }
  .callout-error { background: var(--brick-tint); border-left-color: var(--brick); }
  
  .code-wrapper { background: var(--inset); padding: 16px; border-radius: 6px; border: 1px solid var(--border); overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 13px; position: relative; }
  .table-wrapper table { width: 100%; border-collapse: collapse; }
  .table-wrapper th, .table-wrapper td { border: 1px solid var(--border); padding: 8px; text-align: left; }
  
  .floating-pill { position: fixed; background: var(--card); border: 1px solid var(--border); border-radius: 8px; height: 36px; padding: 4px; display: flex; align-items: center; gap: 2px; box-shadow: var(--shadow); z-index: 50; animation: rise 120ms ease-out forwards; pointer-events: auto; transform: translateX(-50%); }
  @keyframes rise { from { opacity: 0; margin-top: 4px; } to { opacity: 1; margin-top: 0; } }
  .selection-pill { background: var(--navy); color: var(--on-fill); }
  [data-theme="dark"] .selection-pill { background: var(--card); border: 1px solid var(--border); color: var(--text); }
  
  .tab-list { display: flex; border-bottom: 1px solid var(--border); overflow-x: auto; flex-shrink: 0; }
  .tab-btn { flex: 1; min-width: max-content; padding: 0 12px; height: 40px; color: var(--muted); border-bottom: 2px solid transparent; font-weight: 500; border-radius: 0; }
  .tab-btn.active { color: var(--text); border-bottom-color: var(--amber); }
  .tab-btn:hover:not(.active) { background: var(--hover); }
  
  .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--navy); color: var(--on-fill); padding: 12px 16px; border-radius: 6px; box-shadow: var(--shadow); z-index: 1000; animation: rise 120ms ease-out; display: flex; align-items: center; gap: 12px; font-weight: 500;}
  
  .scrim { position: fixed; inset: 0; background: rgba(10,29,59,0.4); z-index: 100; animation: fade 150ms ease; }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  dialog, .drawer { margin: auto; background: var(--card); color: var(--text); border: 1px solid var(--border); border-radius: 8px; box-shadow: var(--shadow); padding: 24px; z-index: 101; }
  option { background: var(--card); color: var(--text); }
  
  .mobile-only { display: none; }
  
  @media (max-width: 1279px) {
    .col-outline { position: fixed; left: 0; top: 56px; bottom: 0; z-index: 110; width: 280px; transform: translateX(-100%); transition: transform 180ms ease; border-right: 1px solid var(--border); }
    .col-outline.is-open { transform: translateX(0); }
    .col-panel { width: 340px; }
  }
  @media (max-width: 1023px) {
    .col-panel { position: fixed; right: 0; top: 56px; bottom: 0; z-index: 110; width: 360px; transform: translateX(100%); transition: transform 180ms ease; border-left: 1px solid var(--border); }
    .col-panel.is-open { transform: translateX(0); }
  }
  @media (max-width: 767px) {
    .col-panel { top: 10%; bottom: 0; width: 100%; transform: translateY(100%); border-radius: 12px 12px 0 0; border-left: none; border-top: 1px solid var(--border); }
    .col-panel.is-open { transform: translateY(0); }
    .slim-toolbar .hide-mobile { display: none; }
    .editor-bar .hide-mobile { display: none; }
    .mobile-only { display: flex; }
    .floating-pill { padding: 4px; height: 44px; }
    .floating-pill .toolbar-btn { width: 36px; height: 36px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  }
`;

const ToastContext = createContext();
const EditorContext = createContext();
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, actionLabel, onAction) => {
    setToast({ msg, actionLabel, onAction });
    setTimeout(() => setToast(null), 4000);
  }, []);
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div className="toast">
          <span>{toast.msg}</span>
          {toast.actionLabel && (
            <button className="btn-text" style={{ padding: 0, color: 'var(--amber)' }} onClick={() => { toast.onAction?.(); setToast(null); }}>
              {toast.actionLabel}
            </button>
          )}
        </div>
      )}
    </ToastContext.Provider>
  );
};

const PANEL_TABS_BY_STATUS = {
  "draft": ["checklist", "details", "search"],
  "in-review": ["details", "search"],
  "changes-requested": ["comments", "details", "search"],
  "under-revision": ["checklist", "details", "search"],
  "published": ["details", "search"]
};

const STATUS_LABELS = {
  "draft": "Draft",
  "in-review": "In review",
  "changes-requested": "Changes requested",
  "under-revision": "Under revision",
  "published": "Published"
};

const getComparableArticle = (article) => ({
  title: article.title,
  category: article.category,
  section: article.section,
  summary: article.summary,
  keywords: article.keywords || [],
  synonyms: article.synonyms || [],
  changeType: article.changeType,
  changeNote: article.changeNote,
  availableFromVersion: article.availableFromVersion,
  relatedIds: article.relatedIds || [],
  reviewCycle: article.reviewCycle,
  content: article.content || []
});

const hasChangedFromPublished = (article) => {
  if (!article?.publishedSnapshot) return true;
  return JSON.stringify(getComparableArticle(article)) !== JSON.stringify(getComparableArticle(article.publishedSnapshot));
};

const createReturnedArticleContent = () => {
  const step3Id = "auto-step-confirm";
  const stepsBlockId = "auto-steps";
  return {
    summary: 'Auto-populated groups add and remove members automatically based on rules you define.',
    keywords: ['auto-populated group', 'membership rules', 'directory sync'],
    synonyms: [],
    changeType: 'Updated',
    changeNote: 'Added the rule preview step and Basic user limits.',
    availableFromVersion: 'v5.2',
    relatedIds: ['set-chat-history-access'],
    reviewCycle: 90,
    content: [
      { id: "auto-h-overview", type: 'heading', level: 2, html: 'Overview' },
      { id: "auto-p-overview", type: 'paragraph', html: 'Auto-populated groups add and remove members automatically based on membership rules.' },
      { id: "auto-h-before", type: 'heading', level: 2, html: 'Before you begin' },
      { id: "auto-list-before", type: 'list', variant: 'bullet', items: [{ id: "auto-list-admin", html: 'You must be a Group Admin.' }] },
      { id: "auto-h-setup", type: 'heading', level: 2, html: 'Set up auto-populated membership' },
      { id: stepsBlockId, type: 'steps', items: [
        { id: "auto-step-open", html: 'Open Group Settings' },
        { id: "auto-step-choose", html: 'Choose Auto-populated membership' },
        { id: step3Id, html: '<b>Review the member rules</b> - Check the rule preview, then confirm to apply it.' },
        { id: "auto-step-preview", html: 'Preview the member list' },
        { id: "auto-step-save", html: 'Save' }
      ]},
      { id: "auto-callout-warning", type: 'callout', variant: 'warning', html: 'Changing a rule updates the member list immediately.' },
      { id: "auto-h-rule-types", type: 'heading', level: 2, html: 'Rule types' },
      { id: "auto-table-rules", type: 'table', rows: [['Rule type', 'Based on', 'Example'], ['Rule-based', 'Department', 'Engineering']] },
      { id: "auto-h-faq", type: 'heading', level: 2, html: 'Common questions' },
      { id: "auto-faq", type: 'faq', items: [{ id: "auto-faq-owner", q: "Who can edit rules?", a: "Only the group owner." }] }
    ],
    comments: [
      { id: "c1", blockId: null, itemId: null, quotedText: "", authorName: "Arjun Rao", authorRole: "reviewer", text: "Add where the Airtime option appears for Basic users.", createdAt: "2026-10-10T10:12:00Z", resolved: false, replies: [] },
      { id: "c2", blockId: stepsBlockId, itemId: step3Id, quotedText: "Review the member rules", authorName: "Arjun Rao", authorRole: "reviewer", text: "Fix this heading. It says Review but the step is Confirm.", createdAt: "2026-10-10T10:14:00Z", resolved: false, replies: [] }
    ]
  };
};

const createSetChatHistoryPublishedContent = () => ({
  summary: 'Choose how much past chat new members can see when they join a group.',
  keywords: ['chat history', 'history access', 'new members', 'group settings'],
  synonyms: ['old messages', 'message history'],
  changeType: 'Updated',
  changeNote: '',
  availableFromVersion: 'v5.0',
  relatedIds: ['auto-populated-groups-membership'],
  positionAfterId: 'auto-populated-groups-membership',
  reviewCycle: 90,
  hasPublishedVersion: true,
  liveVersion: 'v5.0',
  lastPublished: '2026-09-10T08:00:00Z',
  content: [
    { id: 'history-h-overview', type: 'heading', level: 2, html: 'Overview' },
    { id: 'history-p-overview', type: 'paragraph', html: 'Chat history access controls whether new group members can read earlier messages after they join.' },
    { id: 'history-h-before', type: 'heading', level: 2, html: 'Before you begin' },
    { id: 'history-list-before', type: 'list', variant: 'bullet', items: [
      { id: 'history-list-owner', html: 'You must be the Group Owner or a Group Admin.' },
      { id: 'history-list-policy', html: 'Workspace retention policies can limit how much history is available.' }
    ]},
    { id: 'history-h-steps', type: 'heading', level: 2, html: 'Set chat history access' },
    { id: 'history-steps', type: 'steps', items: [
      { id: 'history-step-open', html: '<b>Open Group Settings</b> - Select the group, then open Settings.' },
      { id: 'history-step-access', html: '<b>Choose Chat History Access</b> - Open the Membership & Access section.' },
      { id: 'history-step-option', html: '<b>Select an access option</b> - Allow all history, recent history, or messages from join date.' },
      { id: 'history-step-save', html: '<b>Save changes</b> - New members follow the updated setting.' }
    ]},
    { id: 'history-callout', type: 'callout', variant: 'warning', html: 'Changing access affects new members immediately. Existing member visibility does not change.' },
    { id: 'history-h-options', type: 'heading', level: 2, html: 'Access options' },
    { id: 'history-table', type: 'table', rows: [
      ['Option', 'What new members can see'],
      ['All history', 'Messages from before they joined'],
      ['From join date', 'Only messages sent after they joined']
    ]}
  ],
  comments: []
});

const hydratePublishedSnapshot = (articleRecord, defaults) => {
  const source = articleRecord?.publishedSnapshot || articleRecord || {};
  return {
    ...SEED.initialArticle,
    ...defaults,
    ...source,
    id: source.id || articleRecord?.id,
    title: source.title || articleRecord?.title || defaults.title,
    category: source.category || articleRecord?.category || defaults.category,
    section: source.section || articleRecord?.section || defaults.section,
    status: 'published',
    summary: source.summary ?? articleRecord?.summary ?? defaults.summary,
    keywords: source.keywords || articleRecord?.keywords || defaults.keywords,
    synonyms: source.synonyms || articleRecord?.synonyms || defaults.synonyms,
    changeType: source.changeType || articleRecord?.changeType || defaults.changeType,
    changeNote: source.changeNote ?? articleRecord?.changeNote ?? defaults.changeNote,
    availableFromVersion: source.availableFromVersion || articleRecord?.availableFromVersion || defaults.availableFromVersion,
    relatedIds: source.relatedIds || articleRecord?.relatedIds || defaults.relatedIds,
    reviewCycle: source.reviewCycle || articleRecord?.reviewCycle || articleRecord?.reviewCycleDays || defaults.reviewCycle,
    content: source.content || articleRecord?.content || defaults.content,
    author: source.authorName || source.author || articleRecord?.authorName || articleRecord?.author || SEED.initialArticle.author,
    hasPublishedVersion: true,
    hasRevision: false,
    liveVersion: source.liveVersion || articleRecord?.liveVersion || articleRecord?.version || defaults.liveVersion,
    publishedSnapshot: undefined
  };
};

const createReviewerComments = (articleRecord) => {
  if (articleRecord?.comments) return articleRecord.comments;
  if (articleRecord?.editorComments) {
    return articleRecord.editorComments.map(comment => ({
      id: comment.id,
      blockId: comment.blockId || null,
      itemId: comment.itemId || null,
      quotedText: comment.quotedText || '',
      authorName: comment.authorName || comment.author || articleRecord.reviewerName || 'Reviewer',
      authorRole: comment.authorRole || 'reviewer',
      text: comment.text,
      createdAt: comment.createdAt || articleRecord.updatedAt || new Date().toISOString(),
      resolved: !!comment.resolved,
      replies: comment.replies || []
    }));
  }
  if (!articleRecord?.reviewerComment) return [];
  const parts = articleRecord.reviewerComment.split(/,\s+and\s+|;\s*/).filter(Boolean);
  return parts.map((text, index) => ({
    id: `${articleRecord.id}-comment-${index + 1}`,
    blockId: index === 1 ? "auto-steps" : null,
    itemId: index === 1 ? "auto-step-confirm" : null,
    quotedText: index === 1 ? "Review the member rules" : "",
    authorName: articleRecord.reviewerName || "Reviewer",
    authorRole: "reviewer",
    text,
    createdAt: articleRecord.updatedAt || new Date().toISOString(),
    resolved: false,
    replies: []
  }));
};

const createEditorArticle = (articleRecord) => {
  const returnedDefaults = articleRecord?.title === "Auto-populated Groups Membership"
    ? createReturnedArticleContent()
    : {};
  const publishedDefaults = articleRecord?.title === "Set Chat History Access"
    ? createSetChatHistoryPublishedContent()
    : {};
  const seedDefaults = { ...returnedDefaults, ...publishedDefaults };
  const snapshotSource = ['published', 'under-revision', 'in-review', 'changes-requested'].includes(articleRecord?.status) && (articleRecord?.hasPublishedVersion || articleRecord?.hasRevision || Object.keys(publishedDefaults).length)
    ? hydratePublishedSnapshot(articleRecord, publishedDefaults)
    : null;

  return {
    ...SEED.initialArticle,
    ...seedDefaults,
    ...(articleRecord?.content ? { content: articleRecord.content } : {}),
    id: articleRecord?.id || SEED.initialArticle.id,
    title: articleRecord?.title || SEED.initialArticle.title,
    category: articleRecord?.category || SEED.initialArticle.category,
    section: articleRecord?.section || SEED.initialArticle.section,
    status: articleRecord?.status || SEED.initialArticle.status,
    summary: articleRecord?.summary ?? seedDefaults.summary ?? SEED.initialArticle.summary,
    keywords: articleRecord?.keywords || seedDefaults.keywords || SEED.initialArticle.keywords,
    synonyms: articleRecord?.synonyms || seedDefaults.synonyms || SEED.initialArticle.synonyms,
    changeType: articleRecord?.changeType || seedDefaults.changeType || SEED.initialArticle.changeType,
    changeNote: articleRecord?.changeNote ?? seedDefaults.changeNote ?? SEED.initialArticle.changeNote,
    availableFromVersion: articleRecord?.availableFromVersion || seedDefaults.availableFromVersion || SEED.initialArticle.availableFromVersion,
    relatedIds: articleRecord?.relatedIds || seedDefaults.relatedIds || SEED.initialArticle.relatedIds,
    positionAfterId: articleRecord?.positionAfterId || seedDefaults.positionAfterId || SEED.initialArticle.positionAfterId,
    reviewCycle: articleRecord?.reviewCycle || articleRecord?.reviewCycleDays || seedDefaults.reviewCycle || SEED.initialArticle.reviewCycle,
    hasPublishedVersion: articleRecord?.hasPublishedVersion ?? seedDefaults.hasPublishedVersion ?? !!articleRecord?.publishedAt,
    hasRevision: articleRecord?.hasRevision || articleRecord?.status === 'under-revision',
    liveVersion: articleRecord?.liveVersion || articleRecord?.version || seedDefaults.liveVersion,
    lastPublished: articleRecord?.lastPublished || articleRecord?.publishedAt || seedDefaults.lastPublished,
    publishedSnapshot: snapshotSource,
    author: articleRecord?.authorName || articleRecord?.author || SEED.initialArticle.author,
    submittedAt: articleRecord?.submittedAt,
    reviewerNote: articleRecord?.reviewerNote,
    returnedBy: articleRecord?.returnedBy || articleRecord?.reviewerName,
    returnedAt: articleRecord?.returnedAt || articleRecord?.updatedAt,
    returnedEditedAt: articleRecord?.returnedEditedAt,
    comments: (() => {
      const comments = createReviewerComments(articleRecord);
      return comments.length ? comments : seedDefaults.comments || [];
    })()
  };
};

const SafeEditable = React.forwardRef(({ html, tagName, className, placeholder, onUpdate, onKeyDown, onFocus, onBlur, style, id, isMultiLine, readOnly = false }, ref) => {
  const innerRef = useRef(null);
  const isComposing = useRef(false);

  React.useImperativeHandle(ref, () => ({
    focus: () => innerRef.current?.focus(),
    getHtml: () => innerRef.current?.innerHTML,
    el: innerRef.current
  }));

  useEffect(() => {
    if (innerRef.current && document.activeElement !== innerRef.current) {
      innerRef.current.innerHTML = html || '';
    }
  }, [html]);

  const handleInput = useCallback(() => {
    if (readOnly) return;
    if (isComposing.current) return;
    const currentHtml = innerRef.current.innerHTML;
    if (currentHtml !== html) onUpdate?.(currentHtml);
  }, [html, onUpdate, readOnly]);

  const handlePaste = useCallback((e) => {
    if (readOnly) return;
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, [readOnly]);

  const handleKeyDownLocal = (e) => {
    if (readOnly) return;
    if (!isMultiLine && e.key === 'Enter') {
      e.preventDefault();
    }
    onKeyDown?.(e, id);
  };

  const Tag = tagName || 'div';
  return (
    <Tag
      ref={innerRef}
      className={className}
      contentEditable={!readOnly}
      suppressContentEditableWarning={true}
      placeholder={placeholder}
      style={style}
      onInput={handleInput}
      onBlur={(e) => { handleInput(); onBlur?.(e); }}
      onFocus={(e) => onFocus?.(e, id)}
      onKeyDown={handleKeyDownLocal}
      onPaste={handlePaste}
      onCompositionStart={() => isComposing.current = true}
      onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
    />
  );
});

export const BlockRenderer = ({ block, index, isFocused, onFocus, onUpdate, onKeyDown, onInsertClick, readOnly = false }) => {
  const blockRef = useRef(null);

  useEffect(() => {
    if (isFocused && blockRef.current) {
      blockRef.current.focus();
    }
  }, [isFocused]);

  const handleChange = (newHtml) => {
    if (!readOnly) onUpdate(block.id, { html: newHtml });
  };

  const sharedProps = {
    ref: blockRef, id: block.id, onFocus, onUpdate: handleChange, onKeyDown, className: "block-content", placeholder: "Type / for blocks", readOnly
  };

  let content = null;
  switch (block.type) {
    case 'heading':
      content = <SafeEditable {...sharedProps} tagName={`h${block.level}`} html={block.html} placeholder={`Heading ${block.level}`} className="block-content bricolage" style={{outline:'none'}} />;
      break;
    case 'list':
      content = (
        <div onClick={() => onFocus(null, block.id)}>
          {(block.items || []).map((item, i) => (
            <div key={item.id} data-item-id={item.id} style={{ display: 'flex', gap: 8, marginBottom: 8 }} className="serif">
              <div style={{ userSelect: 'none', color: 'var(--muted)', width: 24, textAlign: 'right' }}>{block.variant === 'bullet' ? '•' : `${i + 1}.`}</div>
              <SafeEditable id={block.id} html={item.html} readOnly={readOnly} onFocus={onFocus} onUpdate={(val) => { const newItems = [...block.items]; newItems[i] = { ...newItems[i], html: val }; onUpdate(block.id, { items: newItems }); }} onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const newItems = [...block.items];
                  newItems.splice(i + 1, 0, { id: generateId(), html: '' });
                  onUpdate(block.id, { items: newItems });
                } else if (e.key === 'Backspace' && !item.html && block.items.length > 1) {
                  e.preventDefault();
                  const newItems = block.items.filter((_, idx) => idx !== i);
                  onUpdate(block.id, { items: newItems });
                } else { onKeyDown(e, block.id); }
              }} tagName="div" className="block-content serif" style={{outline:'none'}} />
            </div>
          ))}
        </div>
      );
      break;
    case 'steps':
      content = (
        <div onClick={() => onFocus(null, block.id)}>
          {(block.items || []).map((st, i) => (
            <div key={st.id} data-item-id={st.id} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: 'var(--navy)', color: 'var(--on-fill)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <SafeEditable id={block.id} html={st.html} readOnly={readOnly} onFocus={onFocus} onUpdate={(val) => { const newItems = [...block.items]; newItems[i] = { ...newItems[i], html: val }; onUpdate(block.id, { items: newItems }); }} tagName="div" className="block-content serif" style={{outline:'none'}} />
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                   {!readOnly && <button className="btn-text" style={{fontSize:11, padding:0}} onClick={() => {
                     const newItems = [...block.items];
                     newItems.splice(i + 1, 0, { id: generateId(), html: 'New step' });
                     onUpdate(block.id, { items: newItems });
                   }}>+ Add step</button>}
                   {!readOnly && block.items.length > 1 && <button className="btn-text" style={{fontSize:11, padding:0, color:'var(--muted)'}} onClick={() => {
                     const newItems = block.items.filter((_, idx) => idx !== i);
                     onUpdate(block.id, { items: newItems });
                   }}>Remove</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      );
      break;
    case 'callout':
      const ic = { info: <Icons.Info size={16} color="var(--teal-text)" />, note: <Icons.Pencil size={16} color="var(--muted)" />, success: <Icons.CheckCircle size={16} color="var(--success-text)" />, warning: <Icons.AlertTriangle size={16} color="var(--amber-text)" />, error: <Icons.XCircle size={16} color="var(--brick-text)" /> };
      const lc = { info: 'var(--teal-text)', note: 'var(--muted)', success: 'var(--success-text)', warning: 'var(--amber-text)', error: 'var(--brick-text)' };
      content = (
        <div className={`callout-block callout-${block.variant}`} onClick={() => onFocus(null, block.id)}>
          <div style={{ flexShrink: 0 }}>{ic[block.variant]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color: lc[block.variant], marginBottom: 4, fontFamily: 'Inter' }}>{block.variant}</div>
            <SafeEditable {...sharedProps} tagName="div" className="block-content serif" html={block.html} style={{outline:'none'}} />
          </div>
        </div>
      );
      break;
    case 'table':
      content = (
        <div className="table-wrapper" onClick={() => onFocus(null, block.id)}>
          <table>
            <tbody>
              {(block.rows || []).map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ background: rIdx === 0 ? 'var(--inset)' : 'transparent', fontWeight: rIdx === 0 ? 500 : 400 }}>
                       <SafeEditable onFocus={onFocus} id={block.id} html={cell} readOnly={readOnly} onUpdate={(val) => { const newRows = [...block.rows]; newRows[rIdx][cIdx] = val; onUpdate(block.id, { rows: newRows }); }} tagName="div" className="block-content" style={{outline:'none'}} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {!readOnly && <button className="btn-text" style={{ fontSize: 11, padding: 0 }} onClick={() => { const newRows = [...block.rows, new Array(block.rows[0].length).fill('')]; onUpdate(block.id, { rows: newRows }); }}>+ Row</button>}
            {!readOnly && <button className="btn-text" style={{ fontSize: 11, padding: 0 }} onClick={() => { const newRows = block.rows.map(r => [...r, '']); onUpdate(block.id, { rows: newRows }); }}>+ Column</button>}
          </div>
        </div>
      );
      break;
    case 'code':
      content = (
        <div className="code-wrapper" onClick={() => onFocus(null, block.id)}>
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
            <select value={block.lang || 'javascript'} disabled={readOnly} onChange={e => onUpdate(block.id, {lang: e.target.value})} style={{height: 24, padding: '0 8px', fontSize: 10, textTransform:'uppercase', border:'none', background:'transparent', color:'var(--muted)'}}>
              <option value="javascript">JS</option>
              <option value="json">JSON</option>
              <option value="bash">BASH</option>
              <option value="plain">PLAIN</option>
            </select>
            <button className="toolbar-btn" style={{ width: 24, height: 24, color:'var(--muted)' }} onClick={()=>alert('Copied')}><Icons.Copy size={12} /></button>
          </div>
          <SafeEditable {...sharedProps} tagName="div" html={block.html} style={{ whiteSpace: 'pre-wrap', outline:'none', marginTop: 16 }} />
          <input value={block.caption || ''} disabled={readOnly} onChange={e=>onUpdate(block.id, {caption: e.target.value})} placeholder="Code caption..." className="mono" style={{ marginTop: 8, color: 'var(--muted)', fontSize: 11, border:'none', background:'transparent', padding:0, height:20 }} />
        </div>
      );
      break;
    case 'screenshot':
      content = (
        <div onClick={() => onFocus(null, block.id)} style={{ margin: '16px 0' }}>
           <div style={{ height: 160, border: '2px dashed var(--ghost-border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', background: 'var(--inset)', marginBottom: 8 }}>
             <Icons.Image size={24} style={{marginRight: 8}}/> Screenshot placeholder
           </div>
           <input id={`alt-${block.id}`} placeholder="Describe the screenshot for screen readers" value={block.alt || ''} disabled={readOnly} onChange={e => onUpdate(block.id, { alt: e.target.value })} style={{ marginBottom: 4, height: 32, border: !block.alt ? '1px solid var(--amber)' : '1px solid var(--border)' }} />
           <input placeholder="Caption (optional)" value={block.caption || ''} disabled={readOnly} onChange={e => onUpdate(block.id, { caption: e.target.value })} style={{ border:'none', background:'transparent', height: 24, padding: '0 4px', fontSize: 11 }} className="mono" />
        </div>
      );
      break;
    case 'quote':
      content = (
        <div style={{ borderLeft: '3px solid var(--border)', paddingLeft: 16, margin: '16px 0' }}>
          <SafeEditable {...sharedProps} tagName="div" className="block-content serif" html={block.html} style={{ fontStyle: 'italic', outline:'none' }} />
        </div>
      );
      break;
    case 'faq':
      content = (
        <div onClick={() => onFocus(null, block.id)}>
          {(block.items || []).map((it, i) => (
            <div key={it.id} data-item-id={it.id} style={{ border: '1px solid var(--border)', borderRadius: 6, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ background: 'var(--inset)', padding: '12px 16px', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                <Icons.ChevronDown size={16} style={{ marginRight: 8, color: 'var(--muted)' }} />
                <SafeEditable id={block.id} html={it.q} readOnly={readOnly} onFocus={onFocus} onUpdate={val => { const items = [...block.items]; items[i].q = val; onUpdate(block.id, {items}); }} tagName="div" className="block-content" style={{outline:'none'}} />
              </div>
              <div style={{ padding: '12px 16px', background: 'var(--card)' }}>
                 <SafeEditable id={block.id} html={it.a} readOnly={readOnly} onFocus={onFocus} onUpdate={val => { const items = [...block.items]; items[i].a = val; onUpdate(block.id, {items}); }} tagName="div" className="block-content serif" style={{outline:'none'}} />
              </div>
            </div>
          ))}
          {!readOnly && <button className="btn-text" style={{fontSize:12, padding:0}} onClick={()=>{
             const newItems = [...block.items, {id: generateId(), q:'New question?', a:'Answer here.'}];
             onUpdate(block.id, {items: newItems});
          }}>+ Add question</button>}
        </div>
      );
      break;
    default:
      content = <SafeEditable {...sharedProps} tagName="p" className="block-content serif" html={block.html} style={{outline:'none'}} />;
  }

  return (
    <div className="block-row" data-block-id={block.id}>
      {!readOnly && <div className="block-gutter">
        <button className="toolbar-btn" style={{ width: 24, height: 24, color: 'var(--muted)' }} onClick={(e) => onInsertClick(e, index, block.id)}>
          <Icons.Plus size={16} />
        </button>
      </div>}
      <div style={{ flex: 1, minWidth: 0 }}>{content}</div>
    </div>
  );
};

export const ReviewerThreadCard = ({ comment, relativeTime, formatRelativeTime, onSelect, onDelete }) => {
  const authorName = comment.authorName || 'Reviewer';
  const initials = authorName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <article className="comment-card review-thread-card" onClick={onSelect}>
      <div className="review-thread-heading">
        <span className="review-thread-avatar" aria-hidden="true">{initials}</span>
        <div className="review-thread-author">
          <strong>{authorName}</strong>
          <span className="reviewer-role-chip">Reviewer</span>
        </div>
        <time className="mono review-thread-time" dateTime={comment.createdAt}>{relativeTime}</time>
      </div>
      {comment.quotedText && <blockquote className="review-thread-quote">“{comment.quotedText}”</blockquote>}
      <p className="review-thread-text">{comment.text}</p>
      {(comment.replies || []).map(reply => (
        <div className="review-author-reply" key={reply.id}>
          <div className="review-thread-heading">
            <span className="review-thread-avatar" aria-hidden="true">{(reply.authorName || 'Author').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}</span>
            <div className="review-thread-author">
              <strong>{reply.authorName || 'Author'}</strong>
              <span className="reviewer-role-chip">{reply.authorRole === 'author' ? 'Author' : 'Reviewer'}</span>
            </div>
            <time className="mono review-thread-time" dateTime={reply.createdAt}>{formatRelativeTime?.(reply.createdAt) || ''}</time>
          </div>
          <p className="review-thread-text">{reply.text}</p>
        </div>
      ))}
      {onDelete && <button type="button" className="btn-text review-thread-delete" onClick={event => { event.stopPropagation(); onDelete(); }}>Delete</button>}
    </article>
  );
};

const BlockPill = ({ activeBlock, pos, onUpdate, onCopy, onDelete }) => {
  if (!activeBlock || !pos) return null;
  const isCallout = activeBlock.type === 'callout';
  return (
    <div className="floating-pill" style={{ left: pos.left, top: pos.top - 44 }}>
      {isCallout && (
        <>
          {['info', 'note', 'success', 'warning', 'error'].map(v => (
            <button key={v} className="toolbar-btn" style={{ width: 28, height: 28, color: `var(--${v==='note'?'muted':v==='info'?'teal-text':v==='warning'?'amber-text':v==='success'?'success-text':'brick-text'})`, background: activeBlock.variant === v ? 'var(--hover)' : 'transparent', borderBottom: activeBlock.variant === v ? '2px solid currentColor' : 'none', borderRadius: activeBlock.variant === v ? '4px 4px 0 0' : 4 }} onClick={() => onUpdate(activeBlock.id, { variant: v })} title={v}>
              {v==='info'?<Icons.Info size={14}/>:v==='note'?<Icons.Pencil size={14}/>:v==='success'?<Icons.CheckCircle size={14}/>:v==='warning'?<Icons.AlertTriangle size={14}/>:<Icons.XCircle size={14}/>}
            </button>
          ))}
          <div className="toolbar-divider" style={{ margin: '0 4px', height: 16 }} />
        </>
      )}
      <button className="toolbar-btn" style={{ width: 28, height: 28 }} onClick={() => onCopy(activeBlock.id)} title="Copy"><Icons.Copy size={14}/></button>
      <button className="toolbar-btn" style={{ width: 28, height: 28 }} onClick={() => onDelete(activeBlock.id)} title="Delete"><Icons.Trash2 size={14}/></button>
    </div>
  );
};

const SelectionPill = ({ pos }) => {
  if (!pos) return null;
  const exec = (cmd, val=null) => { document.execCommand(cmd, false, val); };
  return (
    <div className="floating-pill selection-pill" style={{ left: pos.left, top: pos.top - 44 }}>
      <button className="toolbar-btn" style={{ width: 28, height: 28, color: 'inherit' }} onMouseDown={e => { e.preventDefault(); exec('bold'); }}><Icons.Bold size={14}/></button>
      <button className="toolbar-btn" style={{ width: 28, height: 28, color: 'inherit' }} onMouseDown={e => { e.preventDefault(); exec('italic'); }}><Icons.Italic size={14}/></button>
      <button className="toolbar-btn" style={{ width: 28, height: 28, color: 'inherit' }} onMouseDown={e => { e.preventDefault(); exec('underline'); }}><Icons.Underline size={14}/></button>
      <div className="toolbar-divider" style={{ margin: '0 4px', height: 16, background: 'currentColor', opacity: 0.3 }} />
      <button className="toolbar-btn" style={{ width: 28, height: 28, color: 'inherit' }} onMouseDown={e => { e.preventDefault(); exec('insertHTML', `<code>${window.getSelection().toString()}</code>`); }}><Icons.Code size={14}/></button>
      <button className="toolbar-btn" style={{ width: 28, height: 28, color: 'inherit' }} onMouseDown={e => { e.preventDefault(); const url = prompt('Link URL:'); if (url) exec('createLink', url); }}><Icons.Link size={14}/></button>
    </div>
  );
};

const SlashMenu = ({ pos, onClose, onSelect }) => {
  const [filter, setFilter] = useState('');
  if (!pos) return null;
  const items = [
    { label: 'Text', opts: [{ id: 'h2', icon: <Icons.Heading2 size={16}/>, label: 'Heading 2', template: blockSamples.heading2 }, { id: 'h3', icon: <Icons.Heading3 size={16}/>, label: 'Heading 3', template: blockSamples.heading3 }, { id: 'bullet', icon: <Icons.List size={16}/>, label: 'Bullet list', template: blockSamples.bullet }, { id: 'num', icon: <Icons.ListOrdered size={16}/>, label: 'Numbered list', template: blockSamples.numbered }] },
    { label: 'Blocks', opts: [{ id: 'steps', icon: <Icons.ListChecks size={16}/>, label: 'Steps', template: blockSamples.steps }, { id: 'table', icon: <Icons.Table size={16}/>, label: 'Table', template: blockSamples.table }, { id: 'code', icon: <Icons.Code2 size={16}/>, label: 'Code', template: blockSamples.code }, { id: 'img', icon: <Icons.Image size={16}/>, label: 'Screenshot', template: blockSamples.screenshot }, { id: 'quote', icon: <Icons.Quote size={16}/>, label: 'Quote', template: blockSamples.quote }, { id: 'faq', icon: <Icons.HelpCircle size={16}/>, label: 'FAQ', template: blockSamples.faq }] },
    { label: 'Callouts', opts: [{ id: 'c-info', icon: <Icons.Info size={16} color="var(--teal-text)"/>, label: 'Info', template: blockSamples.calloutInfo }, { id: 'c-note', icon: <Icons.Pencil size={16}/>, label: 'Note', template: blockSamples.calloutNote }, { id: 'c-success', icon: <Icons.CheckCircle size={16} color="var(--success-text)"/>, label: 'Success', template: blockSamples.calloutSuccess }, { id: 'c-warning', icon: <Icons.AlertTriangle size={16} color="var(--amber-text)"/>, label: 'Warning', template: blockSamples.calloutWarning }, { id: 'c-error', icon: <Icons.XCircle size={16} color="var(--brick-text)"/>, label: 'Error', template: blockSamples.calloutError }] }
  ];
  const filtered = items.map(g => ({ ...g, opts: g.opts.filter(o => o.label.toLowerCase().includes(filter.toLowerCase())) })).filter(g => g.opts.length > 0);
  
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 100 }} onClick={onClose} onContextMenu={e=>{e.preventDefault(); onClose();}} />
      <div role="listbox" style={{ position: 'fixed', left: pos.left, top: pos.top + 20, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow)', zIndex: 101, width: 320, maxHeight: 400, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
          <input autoFocus placeholder="Search blocks..." value={filter} onChange={e => setFilter(e.target.value)} onKeyDown={e => { if(e.key==='Escape') onClose(); }} style={{ border: 'none', background: 'transparent', height: 28, padding: 0, boxShadow: 'none' }} />
        </div>
        <div style={{ overflowY: 'auto', padding: '8px 0', flex: 1 }}>
          {filtered.length === 0 ? <div style={{ padding: 16, color: 'var(--muted)', textAlign: 'center' }}>No results</div> : 
            filtered.map((g, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ padding: '0 16px', fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{g.label}</div>
                {g.opts.map(opt => (
                  <div key={opt.id} onClick={() => onSelect(opt.template)} style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', gap: 12, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--inset)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{opt.icon}</div>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{opt.label}</div>
                  </div>
                ))}
              </div>
            ))
          }
        </div>
      </div>
    </>
  );
};

const SubmitReadinessDialog = ({ isOpen, onClose, onSubmit, onBack }) => {
  const { article, jumpToField } = useContext(EditorContext);
  const showToast = useContext(ToastContext);
  const [note, setNote] = useState('');
  const dialogRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      triggerRef.current = document.activeElement;
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (dialog.open) dialog.close();
    triggerRef.current?.focus?.();
  }, [isOpen]);

  const reqs = [
    { id: 'title', label: 'Title added', done: !!article.title },
    { id: 'summary', label: 'Summary added', done: !!article.summary },
    { id: 'category', label: 'Category and section chosen', sub: article.category ? `${article.category} > ${article.section}` : '', done: !!article.category && !!article.section },
    { id: 'keywords', label: 'At least 3 keywords', sub: `${article.keywords.length} of 3`, done: article.keywords.length >= 3 }
  ];
  if ((article.status === 'under-revision' || article.hasPublishedVersion) && article.changeType !== 'None') {
    reqs.push({ id: 'changeNote', label: 'Change note added', sub: 'Required for updates to a published article.', done: !!article.changeNote?.trim() });
  }
  const commentsNeedingResponse = article.status === 'changes-requested'
    ? (article.comments || []).filter(comment => !comment.resolved && !(comment.replies || []).length)
    : [];
  if (article.status === 'changes-requested') {
    reqs.push({
      id: 'comments',
      label: 'Reviewer comments answered',
      sub: commentsNeedingResponse.length ? `${commentsNeedingResponse.length} open comment${commentsNeedingResponse.length === 1 ? '' : 's'} need a reply or resolution.` : 'Every open comment has a reply or is resolved.',
      done: commentsNeedingResponse.length === 0
    });
  }
  const missingReqs = reqs.filter(r => !r.done);
  const canSubmit = missingReqs.length === 0;

  const warnings = [];
  if (article.relatedIds.length === 0) warnings.push('No related articles');
  if (article.content.some(b => b.type === 'screenshot' && !b.alt)) warnings.push('Screenshot has no alt text');
  else if (!article.content.some(b => b.type === 'screenshot')) warnings.push('No screenshot added');
  if (article.content.filter(b => b.type === 'heading').length < 3) warnings.push('Fewer than 3 headings');

  const handleFixClick = (id) => {
    onClose();
    setTimeout(() => {
      if (id === 'comments') jumpToField('comments');
      else jumpToField(id);
    }, 100);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const wasReturned = article.status === 'changes-requested';
    onSubmit(note);
    showToast(wasReturned ? 'Resubmitted for review' : 'Submitted for review', 'Back to My articles', onBack);
    setNote('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit();
  };

  const title = article.status === 'changes-requested'
    ? 'Resubmit for review'
    : article.status === 'under-revision'
      ? 'Submit update for review'
      : 'Submit for review';

  return (
    <dialog ref={dialogRef} style={{ width: 520, maxWidth: 'calc(100vw - 32px)', padding: 0 }} aria-labelledby="submit-dialog-title" onCancel={onClose} onKeyDown={handleKeyDown}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 24px 16px' }}>
        <h2 id="submit-dialog-title" style={{ margin: 0, fontSize: 18 }}>{title}</h2>
        <button className="toolbar-btn" onClick={onClose} style={{ width: 32, height: 32 }}><Icons.X size={20}/></button>
      </div>

      <div style={{ padding: '0 24px 24px', maxHeight: '60vh', overflowY: 'auto' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
          Required <span style={{ textTransform: 'none', fontWeight: 400, marginLeft: 8 }}>Fix these before you can submit</span>
        </div>

        {reqs.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)', background: r.done ? 'transparent' : 'var(--amber-tint)', marginLeft: r.done ? 0 : -24, marginRight: r.done ? 0 : -24, paddingLeft: r.done ? 0 : 24, paddingRight: r.done ? 0 : 24 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', minWidth: 0 }}>
              <div style={{ flexShrink: 0 }}>{r.done ? <Icons.CheckCircle2 size={18} color="var(--success-text)" /> : <div style={{ width: 16, height: 16, borderRadius: 8, border: '2px solid var(--amber)' }} />}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{r.label}</div>
                {r.sub && <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{r.sub}</div>}
              </div>
            </div>
            {!r.done && <button className="btn-text" style={{ padding: 0, fontSize: 13 }} onClick={() => handleFixClick(r.id)}>Fix</button>}
          </div>
        ))}

        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', marginTop: 24, marginBottom: 8 }}>
          Warnings <span style={{ textTransform: 'none', fontWeight: 400, marginLeft: 8 }}>You can submit anyway</span>
        </div>
        {warnings.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No warnings.</div>
        ) : (
          warnings.map((warning, index) => (
            <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', color: 'var(--amber-text)' }}>
              <Icons.AlertTriangle size={16} /> <span style={{ fontSize: 13, fontWeight: 500 }}>{warning}</span>
            </div>
          ))
        )}

        <div style={{ marginTop: 24 }}>
          <label style={{ display: 'block', fontWeight: 600, marginBottom: 8, fontSize: 13 }}>Note to reviewer (optional)</label>
          <textarea autoFocus placeholder="Anything the reviewer should know" value={note} onChange={e => setNote(e.target.value.substring(0, 280))} style={{ height: 80, resize: 'none' }} />
          <div className="mono" style={{ textAlign: 'right', fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{note.length} / 280</div>
        </div>
      </div>

      <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 12, background: 'var(--inset)' }}>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!canSubmit} title={!canSubmit ? "Finish the required items" : ""}>{title}</button>
      </div>
    </dialog>
  );
};

const ChecklistTab = () => {
  const { article, jumpToField, setSaveStatus } = useContext(EditorContext);
  const showToast = useContext(ToastContext);
  
  const missing = [];
  if (!article.title) missing.push({field:'title', label:'Title added'});
  if (!article.summary) missing.push({field:'summary', label:'Summary added', sub:'Missing. Shown as the intro and search snippet.'});
  if (!article.category || !article.section) missing.push({field:'category', label:'Category and section chosen', sub: article.category ? `${article.category} > ${article.section}` : ''});
  if (article.keywords.length < 3) missing.push({field:'keywords', label:'At least 3 keywords', sub:`${article.keywords.length} of 3`});
  if ((article.status === 'under-revision' || article.hasPublishedVersion) && article.changeType !== 'None' && !article.changeNote?.trim()) {
    missing.push({ field: 'changeNote', label: 'Change note added', sub: 'Required before submitting an update.' });
  }

  const totalRequired = 4 + (((article.status === 'under-revision' || article.hasPublishedVersion) && article.changeType !== 'None') ? 1 : 0);
  const ready = totalRequired - missing.length;
  const isMissing = (field) => missing.some(r => r.field === field);

  const Row = ({ label, field, sub, done }) => (
    <div onClick={() => !done && jumpToField(field)} style={{ display: 'flex', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: !done ? 'pointer' : 'default', background: !done ? 'var(--amber-tint)' : 'transparent' }}>
      <div style={{ flexShrink: 0, marginTop: 2 }}>{done ? <Icons.CheckCircle2 size={18} color="var(--success-text)" /> : <div style={{ width: 16, height: 16, borderRadius: 8, border: '2px solid var(--amber)' }} />}</div>
      <div>
        <div style={{ fontWeight: 500 }}>{label}</div>
        {!done && sub && <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '24px 0', flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '0 24px' }}>
          <h3 className="bricolage" style={{ margin: '0 0 8px 0', fontSize: 16 }}>Ready to submit?</h3>
          <div className="mono" style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 8 }} aria-live="polite">{ready} of {totalRequired} ready</div>
          <div style={{ height: 4, background: 'var(--skel)', borderRadius: 2, marginBottom: 24, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(ready/totalRequired)*100}%`, background: 'var(--amber)', transition: 'width 300ms ease' }} />
          </div>
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', padding: '0 24px', marginBottom: 8 }}>Required</div>
        <Row label="Title added" field="title" done={!isMissing('title')} />
        <Row label="Summary added" field="summary" sub="Missing. Shown as the intro and search snippet." done={!isMissing('summary')} />
        <Row label="Category and section chosen" field="category" sub={article.category ? `${article.category} > ${article.section}` : ''} done={!isMissing('category')} />
        <Row label="At least 3 keywords" field="keywords" sub={`${article.keywords.length} of 3`} done={!isMissing('keywords')} />
        {((article.status === 'under-revision' || article.hasPublishedVersion) && article.changeType !== 'None') && (
          <Row label="Change note added" field="changeNote" sub="Required before submitting an update." done={!isMissing('changeNote')} />
        )}
        
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', padding: '0 24px', marginTop: 24, marginBottom: 8 }}>Warnings (Won't block submit)</div>
        {article.relatedIds.length === 0 ? (
          <div onClick={() => jumpToField('related')} style={{ padding: '12px 24px', display: 'flex', gap: 12, color: 'var(--amber-text)', cursor: 'pointer', alignItems: 'center' }}>
            <Icons.AlertTriangle size={16} /> <span style={{ fontSize: 13, fontWeight: 500 }}>No related articles</span>
          </div>
        ) : null}
        {article.content.some(b => b.type === 'screenshot' && !b.alt) ? (
          <div onClick={() => jumpToField('screenshot-alt')} style={{ padding: '12px 24px', display: 'flex', gap: 12, color: 'var(--amber-text)', cursor: 'pointer', alignItems: 'center' }}>
            <Icons.AlertTriangle size={16} /> <span style={{ fontSize: 13, fontWeight: 500 }}>Screenshot has no alt text</span>
          </div>
        ) : null}
        {article.relatedIds.length > 0 && !article.content.some(b => b.type === 'screenshot' && !b.alt) && (
          <div style={{ padding: '0 24px', color: 'var(--muted)' }}>No warnings.</div>
        )}
      </div>
      <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
         <button className="btn btn-ghost" style={{ width: '100%' }} onClick={() => { setSaveStatus('Saved'); showToast('Draft saved'); }}>Save draft</button>
      </div>
    </div>
  );
};

const CommentsTab = () => {
  const { article, setArticle, jumpToField } = useContext(EditorContext);
  const [filter, setFilter] = useState('open');
  const [replyText, setReplyText] = useState({});
  const comments = article.comments || [];
  const displayedComments = comments.filter(comment => filter === 'open' ? !comment.resolved : comment.resolved);
  const openCount = comments.filter(comment => !comment.resolved).length;

  const updateComment = (commentId, updater) => {
    setArticle(prev => ({
      ...prev,
      returnedEditedAt: prev.status === 'changes-requested' ? new Date().toISOString() : prev.returnedEditedAt,
      comments: (prev.comments || []).map(comment => comment.id === commentId ? updater(comment) : comment)
    }));
  };

  const handleReply = (commentId) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;
    const reply = { id: generateId(), authorName: 'Priya Menon', authorRole: 'author', text, createdAt: new Date().toISOString() };
    updateComment(commentId, comment => ({ ...comment, replies: [...(comment.replies || []), reply] }));
    setReplyText(prev => {
      const next = { ...prev };
      delete next[commentId];
      return next;
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h3 className="bricolage" style={{ fontSize: 16, margin: 0 }}>Reviewer comments</h3>
          <div className="mono" style={{ color: 'var(--muted)', marginTop: 4 }}>{openCount} open of {comments.length}</div>
        </div>
        <div style={{ display: 'flex', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }}>
          {['open', 'resolved'].map(item => (
            <button key={item} className="btn-text" style={{ height: 26, textTransform: 'capitalize', background: filter === item ? 'var(--hover)' : 'transparent' }} onClick={() => setFilter(item)}>{item}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayedComments.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', background: 'var(--inset)', borderRadius: 8 }}>
            {filter === 'open' ? 'No open comments. You can resubmit.' : 'No resolved comments yet.'}
          </div>
        ) : displayedComments.map(comment => (
          <div key={comment.id} id={`comment-${comment.id}`} className={`comment-card ${comment.resolved ? 'resolved' : ''}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{comment.authorName || 'Reviewer'}</div>
                <div className="mono" style={{ color: 'var(--muted)', marginTop: 2 }}>{comment.quotedText ? `"${comment.quotedText}"` : 'General note'}</div>
              </div>
              <span style={{ height: 22, borderRadius: 11, padding: '0 8px', fontSize: 11, display: 'inline-flex', alignItems: 'center', background: comment.resolved ? 'var(--success-tint)' : 'var(--amber-tint)', color: comment.resolved ? 'var(--success-text)' : 'var(--amber-text)', flexShrink: 0 }}>
                {comment.resolved ? 'Resolved' : 'Open'}
              </span>
            </div>
            <div style={{ marginBottom: 12 }}>{comment.text}</div>
            {comment.replies?.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {comment.replies.map(reply => (
                  <div key={reply.id} className="comment-reply">
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{reply.authorName}</div>
                    <div>{reply.text}</div>
                  </div>
                ))}
              </div>
            )}
            {replyText[comment.id] !== undefined && (
              <div style={{ marginBottom: 12 }}>
                <textarea autoFocus value={replyText[comment.id]} onChange={e => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))} placeholder="Type a reply..." style={{ height: 62, resize: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                  <button className="btn btn-ghost" onClick={() => setReplyText(prev => { const next = { ...prev }; delete next[comment.id]; return next; })}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => handleReply(comment.id)}>Reply</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {comment.blockId && <button className="btn btn-ghost" onClick={() => jumpToField(comment.blockId)}>Go to section</button>}
              <button className="btn btn-ghost" onClick={() => setReplyText(prev => ({ ...prev, [comment.id]: prev[comment.id] ?? '' }))}>Reply</button>
              <button className="btn btn-ghost" onClick={() => updateComment(comment.id, c => ({ ...c, resolved: !c.resolved }))}>
                {comment.resolved ? 'Reopen' : 'Resolve'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DetailsTab = () => {
  const { article, setArticle, isReadOnly } = useContext(EditorContext);
  const [relOpen, setRelOpen] = useState(false);
  const [relSearch, setRelSearch] = useState('');
  const [relTab, setRelTab] = useState('same');

  const sections = SEED.categories.find(c => c.name === article.category)?.sections || [];
  const peers = SEED.articles.filter(a => a.category === article.category && a.section === article.section && a.id !== article.id).sort((a,b) => a.order - b.order);

  const relResults = useMemo(() => {
    let pool = SEED.articles.filter(a => a.id !== article.id);
    if (relSearch) { pool = pool.filter(a => a.title.toLowerCase().includes(relSearch.toLowerCase()) || a.keywords.some(k => k.toLowerCase().includes(relSearch.toLowerCase()))); }
    else {
      if (relTab === 'same') pool = pool.filter(a => a.section === article.section);
      if (relTab === 'suggested') pool = pool.filter(a => a.keywords.some(k => article.keywords.includes(k))).slice(0, 6);
    }
    return pool.slice(0, 8);
  }, [relSearch, relTab, article.section, article.keywords, article.id]);

  const readTime = Math.max(1, Math.ceil(article.content.reduce((acc, b) => acc + (b.html ? b.html.split(/\s+/).length : 0), 0) / 200));
  const statusLabel = STATUS_LABELS[article.status] || 'Draft';

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Category</label>
        <select id="details-category" value={article.category} disabled={isReadOnly} onChange={e => { const cat = e.target.value; setArticle(p => ({...p, category: cat, section: SEED.categories.find(c=>c.name===cat).sections[0], positionAfterId: 'last'})); }}>
          {SEED.categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Section</label>
        <select id="details-section" value={article.section} disabled={isReadOnly} onChange={e => setArticle(p => ({...p, section: e.target.value, positionAfterId: 'last'}))}>
          {sections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Place after</label>
        <select value={article.positionAfterId} disabled={isReadOnly} onChange={e => setArticle(p => ({...p, positionAfterId: e.target.value}))}>
          <option value="first">First in this section</option>
          {peers.map(p => <option key={p.id} value={p.id}>Place after: {p.title}</option>)}
          <option value="last">Last in this section</option>
        </select>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Controls the order in the reader left nav.</div>
        <div style={{ marginTop: 12, background: 'var(--inset)', padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)' }}>
          {peers.slice(0, 2).map(p => <div key={p.id} style={{ padding: '4px 0', color: 'var(--muted)', fontSize: 12 }}>{p.title}</div>)}
          <div style={{ padding: '4px 0', paddingLeft: 8, borderLeft: '2px solid var(--amber)', color: 'var(--text)', fontWeight: 500, fontSize: 12 }}>{article.title || 'Untitled'}</div>
        </div>
      </div>
      
      <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />
      
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Change type</label>
        <div style={{ display: 'flex', background: 'var(--input)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }}>
          {['New', 'Updated', 'Deprecated', 'None'].map(t => (
            <div key={t} onClick={() => !isReadOnly && setArticle(prev => ({ ...prev, changeType: t }))} style={{ flex: 1, textAlign: 'center', padding: '6px 0', fontSize: 12, fontWeight: 500, cursor: isReadOnly ? 'default' : 'pointer', borderRadius: 4, background: article.changeType === t ? 'var(--navy)' : 'transparent', color: article.changeType === t ? 'var(--on-fill)' : 'var(--text)' }}>{t}</div>
          ))}
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
          {article.changeType==='New'?"Readers see a New box and a NEW badge for 30 days.":article.changeType==='Updated'?"Readers see an Updated box with your note and an UPDATED badge for 30 days.":article.changeType==='Deprecated'?"Readers see a warning box with your note.":"No box and no badge. Use for typo fixes."}
        </div>
      </div>
      
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Change note</label>
        <textarea id="details-changeNote" value={article.changeNote} onChange={e => setArticle(p => ({...p, changeNote: e.target.value.substring(0, 160)}))} disabled={isReadOnly || article.changeType === 'None'} rows={3} placeholder="Describe changes..." />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Shown in the What changed box.</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{article.changeNote.length} / 160</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Available from version</label>
        <select value={article.availableFromVersion} disabled={isReadOnly} onChange={e => setArticle(p => ({...p, availableFromVersion: e.target.value}))}>
          {SEED.versions.map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '24px 0' }} />

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 500, color: 'var(--muted)', fontSize: 12 }}>Related articles</label>
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{article.relatedIds.length} of 3</span>
        </div>
        {article.relatedIds.map(rid => {
          const r = SEED.articles.find(a => a.id === rid);
          return r ? (
            <div key={rid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</div>
              {!isReadOnly && <button className="toolbar-btn" style={{ width: 24, height: 24 }} onClick={() => setArticle(p => ({...p, relatedIds: p.relatedIds.filter(id => id !== rid)}))}><Icons.X size={14}/></button>}
            </div>
          ) : null;
        })}
        {!isReadOnly && article.relatedIds.length < 3 && <button id="details-related" className="btn btn-ghost" style={{ width: '100%' }} onClick={() => setRelOpen(true)}>+ Add related</button>}
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>These are the only cross-links. Body text has no inline links.</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--muted)', fontSize: 12, marginBottom: 8 }}>Review cycle (days)</label>
        <select value={article.reviewCycle} disabled={isReadOnly} onChange={e => setArticle(p => ({...p, reviewCycle: parseInt(e.target.value)}))}>
          {[30, 60, 90, 180, 365].map(d => <option key={d} value={d} disabled={d > SEED.adminMaxCycle} title={d > SEED.adminMaxCycle ? "Set by your admin" : ""}>{d} days</option>)}
        </select>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Admin sets the maximum. Choose shorter for fast-changing features.</div>
      </div>

      <div className="mono" style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, background: 'var(--inset)', borderRadius: 6, fontSize: 11 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Author</span><span>{article.author}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Status</span><span>{statusLabel}</span></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--muted)' }}>Read time</span><span>{readTime} min</span></div>
      </div>

      {relOpen && (
        <>
          <div className="scrim" onClick={() => setRelOpen(false)} style={{ zIndex: 200 }} />
          <dialog open style={{ position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)', zIndex: 201, margin: 0, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Add related articles</h3>
              <button className="toolbar-btn" onClick={() => setRelOpen(false)}><Icons.X size={20}/></button>
            </div>
            <input placeholder="Search 100+ articles..." value={relSearch} onChange={e => setRelSearch(e.target.value)} style={{ marginBottom: 16 }} />
            {!relSearch && (
              <div className="tab-list" style={{ marginBottom: 16 }}>
                <button className={`tab-btn ${relTab==='same'?'active':''}`} onClick={() => setRelTab('same')}>Same section</button>
                <button className={`tab-btn ${relTab==='suggested'?'active':''}`} onClick={() => setRelTab('suggested')}>Suggested</button>
                <button className={`tab-btn ${relTab==='all'?'active':''}`} onClick={() => setRelTab('all')}>All</button>
              </div>
            )}
            {relTab === 'suggested' && !relSearch && <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Matches: microphone, voice</div>}
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {relResults.length === 0 ? <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>No articles match</div> : 
                relResults.map(r => {
                  const isAdded = article.relatedIds.includes(r.id);
                  const isFull = article.relatedIds.length >= 3;
                  return (
                    <div key={r.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ minWidth: 0, paddingRight: 16 }}>
                        <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{r.category} &gt; {r.section}</div>
                      </div>
                      <button className="btn btn-ghost" style={{ height: 28, fontSize: 11, padding: '0 10px', color: isAdded ? 'var(--teal-text)' : 'var(--text)', borderColor: isAdded ? 'transparent' : 'var(--border)' }} disabled={isAdded || (isFull && !isAdded)} title={isFull && !isAdded ? "Maximum 3" : ""} onClick={() => setArticle(p => ({...p, relatedIds: [...p.relatedIds, r.id]}))}>
                        {isAdded ? 'Added' : '+ Add'}
                      </button>
                    </div>
                  );
                })
              }
            </div>
          </dialog>
        </>
      )}
    </div>
  );
};

const SearchTab = () => {
  const { article, setArticle, isReadOnly } = useContext(EditorContext);
  const [kwIn, setKwIn] = useState('');
  const [synIn, setSynIn] = useState('');

  const suggestions = useMemo(() => {
    const fromTitle = article.title.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const fromContent = article.content.filter(b => b.type === 'heading').map(b => b.html.replace(/<[^>]+>/g, '').toLowerCase());
    const combined = [...new Set([...fromTitle, ...fromContent, ...SEED.keywordVocabulary])];
    return combined.filter(s => !article.keywords.includes(s)).slice(0, 5);
  }, [article.title, article.content, article.keywords]);

  const synSuggestions = useMemo(() => {
    let syns = [];
    article.keywords.forEach(k => { if (SEED.synonymMap[k]) syns = [...syns, ...SEED.synonymMap[k]]; });
    return [...new Set(syns)].filter(s => !article.synonyms.includes(s));
  }, [article.keywords, article.synonyms]);

  const addChip = (field, val, max) => {
    const t = val.trim().toLowerCase();
    if (t && !article[field].includes(t) && article[field].length < max) {
      setArticle(prev => ({ ...prev, [field]: [...prev[field], t] }));
    }
  };
  const removeChip = (field, idx) => {
    setArticle(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== idx) }));
  };

  const previewTerm = article.keywords[0] || article.title.split(' ')[0] || 'term';
  const previewPattern = previewTerm.trim() ? new RegExp(`(${escapeRegExp(previewTerm)})`, 'gi') : null;
  const titleParts = previewPattern ? article.title.split(previewPattern) : [article.title || 'Untitled article'];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 500, color: 'var(--muted)', fontSize: 12 }}>Keywords</label>
          <span className="mono" style={{ fontSize: 11, color: article.keywords.length >= 3 ? 'var(--success-text)' : 'var(--amber-text)' }}>{article.keywords.length} of 3 recommended minimum</span>
        </div>
        {article.keywords.length < 3 && (
          <div style={{ background: 'var(--amber-tint)', padding: '8px 12px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12, color: 'var(--amber-text)' }}>
            <Icons.AlertTriangle size={14} /> Add at least 3 keywords so readers can find this.
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--input)', minHeight: 40 }}>
          {article.keywords.map((k, i) => (
            <div key={i} style={{ background: 'var(--inset)', border: '1px solid var(--border)', borderRadius: 12, padding: '2px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              {k} {!isReadOnly && <Icons.X size={12} style={{ cursor: 'pointer', color: 'var(--muted)' }} onClick={() => removeChip('keywords', i)} />}
            </div>
          ))}
          {!isReadOnly && <input id="search-keywords-input" value={kwIn} onChange={e => setKwIn(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addChip('keywords', kwIn, 12); setKwIn(''); } else if (e.key === 'Backspace' && !kwIn && article.keywords.length > 0) { removeChip('keywords', article.keywords.length - 1); } }} placeholder={article.keywords.length < 12 ? "Type and press Enter..." : "Max 12 reached"} disabled={article.keywords.length >= 12} style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 120, padding: 0, height: 24, boxShadow: 'none' }} />}
        </div>
        {suggestions.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Suggestions</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {!isReadOnly && suggestions.map((s, i) => <div key={i} onClick={() => addChip('keywords', s, 12)} style={{ border: '1px dashed var(--ghost-border)', borderRadius: 12, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: 'var(--muted)' }}>+ {s}</div>)}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <label style={{ fontWeight: 500, color: 'var(--muted)', fontSize: 12 }}>Synonyms</label>
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{article.synonyms.length} of 8</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 8, border: '1px solid var(--border)', borderRadius: 6, background: 'var(--input)', minHeight: 40 }}>
          {article.synonyms.map((s, i) => (
            <div key={i} style={{ background: 'var(--inset)', border: '1px solid var(--border)', borderRadius: 12, padding: '2px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
              {s} {!isReadOnly && <Icons.X size={12} style={{ cursor: 'pointer', color: 'var(--muted)' }} onClick={() => removeChip('synonyms', i)} />}
            </div>
          ))}
          {!isReadOnly && <input value={synIn} onChange={e => setSynIn(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addChip('synonyms', synIn, 8); setSynIn(''); } else if (e.key === 'Backspace' && !synIn && article.synonyms.length > 0) { removeChip('synonyms', article.synonyms.length - 1); } }} placeholder={article.synonyms.length < 8 ? "Type and press Enter..." : "Max 8 reached"} disabled={article.synonyms.length >= 8} style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 120, padding: 0, height: 24, boxShadow: 'none' }} />}
        </div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>The global synonym list is managed by the admin.</div>
        {synSuggestions.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {!isReadOnly && synSuggestions.map((s, i) => <div key={i} onClick={() => addChip('synonyms', s, 8)} style={{ border: '1px dashed var(--ghost-border)', borderRadius: 12, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: 'var(--muted)' }}>+ {s}</div>)}
          </div>
        )}
      </div>

      <div>
        <label style={{ display: 'block', fontWeight: 500, color: 'var(--muted)', fontSize: 12, marginBottom: 12 }}>Search Preview</label>
        <div style={{ fontSize: 12, marginBottom: 8, display: 'flex', alignItems:'center', gap: 8, color: 'var(--muted)' }}><Icons.Search size={14} /> Preview as search for: <span style={{fontWeight:600, color: 'var(--text)'}}>{previewTerm}</span></div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <div style={{ padding: '16px', borderLeft: '3px solid var(--teal)' }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>{article.category} &gt; {article.section}</div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--link)', marginBottom: 4 }}>
               {titleParts.map((part, i) => part.toLowerCase() === previewTerm.toLowerCase() ? <span key={i} style={{ background: 'var(--amber-tint)', color: 'var(--text)', borderRadius: 3, padding: '0 2px' }}>{part}</span> : part)}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {article.summary || <span style={{ color: 'var(--muted)' }}>No summary yet. Add one in the article.</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>{article.author} · {article.availableFromVersion} · Today</div>
              {article.changeType === 'New' && <div style={{ fontSize: 9, fontWeight: 600, background: 'var(--teal-tint)', color: 'var(--teal-text)', padding: '2px 6px', borderRadius: 4 }}>NEW</div>}
              {article.changeType === 'Updated' && <div style={{ fontSize: 9, fontWeight: 600, background: 'var(--teal-tint)', color: 'var(--teal-text)', padding: '2px 6px', borderRadius: 4 }}>UPDATED</div>}
              {article.changeType === 'Deprecated' && <div style={{ fontSize: 9, fontWeight: 600, background: 'var(--brick-tint)', color: 'var(--brick-text)', padding: '2px 6px', borderRadius: 4 }}>DEPRECATED</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ArticleEditor({ articleId: _articleId = "voice-message-recording", articleRecord, onBack = () => alert("Back to My Articles"), onSaved, onSubmitted }) {
  const editorArticle = useMemo(() => createEditorArticle(articleRecord), [articleRecord]);
  const [article, setArticle] = useState(editorArticle);
  
  const [leftOpen, setLeftOpen] = useState(window.innerWidth >= 1280);
  const [rightOpen, setRightOpen] = useState(window.innerWidth >= 1280);
  const [activeTab, setActiveTab] = useState('checklist');
  const [saveStatus, setSaveStatus] = useState('Saved');
  const [activeBlockId, setActiveBlockId] = useState(null);
  const [slashMenu, setSlashMenu] = useState(null);
  const [importModal, setImportModal] = useState(false);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [activeH2, setActiveH2] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [pillPos, setPillPos] = useState(null);
  const [selPos, setSelPos] = useState(null);
  
  const canvasRef = useRef(null);
  const isReadOnly = article.status === 'in-review';
  const isReturned = article.status === 'changes-requested';
  const isPublished = article.status === 'published';
  const isUnderRevision = article.status === 'under-revision';
  const panelTabs = PANEL_TABS_BY_STATUS[article.status] || PANEL_TABS_BY_STATUS.draft;
  const statusLabel = STATUS_LABELS[article.status] || 'Draft';
  const submittedAtLabel = article.submittedAt ? new Date(article.submittedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : null;
  const openComments = (article.comments || []).filter(comment => !comment.resolved);
  const returnedProgress = `${(article.comments || []).length - openComments.length} of ${(article.comments || []).length} comments resolved`;
  const disableSubmit = isPublished && !hasChangedFromPublished(article);

  useEffect(() => {
    setArticle(editorArticle);
    setSubmitDialogOpen(false);
    setActiveTab((PANEL_TABS_BY_STATUS[editorArticle.status] || PANEL_TABS_BY_STATUS.draft)[0]);
    setActiveBlockId(null);
    setSlashMenu(null);
    setSelPos(null);
    setSaveStatus(editorArticle.status === 'in-review' ? 'Submitted' : 'Saved');
  }, [editorArticle]);
  
  const handleSave = useCallback(() => {
    setSaveStatus('Saving...');
    setTimeout(() => {
      setSaveStatus(`Saved ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);
    }, 800);
  }, []);

  const markReturnedEdit = (next) => (
    next.status === 'changes-requested' && !next.returnedEditedAt
      ? { ...next, returnedEditedAt: new Date().toISOString() }
      : next.status === 'changes-requested'
        ? { ...next, returnedEditedAt: new Date().toISOString() }
        : next
  );

  const markArticleEdit = useCallback((prev, next) => {
    const returnedMarked = markReturnedEdit(next);
    if (prev.status === 'published' && hasChangedFromPublished(returnedMarked)) {
      return {
        ...returnedMarked,
        status: 'under-revision',
        hasRevision: true,
        hasPublishedVersion: true,
        liveVersion: returnedMarked.liveVersion || returnedMarked.version || prev.liveVersion
      };
    }
    return returnedMarked;
  }, []);

  const updateArticleState = useCallback((updater) => {
    setArticle(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return markArticleEdit(prev, next);
    });
  }, [markArticleEdit]);

  const persistCurrentArticle = useCallback((nextArticle = article) => {
    onSaved?.(nextArticle);
  }, [article, onSaved]);

  const handleBack = () => {
    persistCurrentArticle(article);
    onBack();
  };

  useEffect(() => {
    if (isReadOnly) return;
    const t = setTimeout(handleSave, 1500);
    return () => clearTimeout(t);
  }, [article, handleSave, isReadOnly]);

  useEffect(() => {
    if (!panelTabs.includes(activeTab)) setActiveTab(panelTabs[0]);
  }, [activeTab, panelTabs]);

  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        if (e.key.toLowerCase() === 'l') { e.preventDefault(); setLeftOpen(o=>!o); }
        if (e.key.toLowerCase() === 'r') { e.preventDefault(); setRightOpen(o=>!o); }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { 
        e.preventDefault(); 
        setSaveStatus('Saved');
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (selPos) { setPillPos(null); return; }
    const updatePos = () => {
      if (activeBlockId && canvasRef.current) {
        const el = document.querySelector(`[data-block-id="${activeBlockId}"]`);
        if (el) { 
          const rect = el.getBoundingClientRect(); 
          let topPos = rect.top;
          if (topPos < 60) topPos = rect.bottom + 50; 
          setPillPos({ top: topPos, left: rect.left + rect.width / 2 }); 
        }
      } else setPillPos(null);
    };
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => { window.removeEventListener('scroll', updatePos, true); window.removeEventListener('resize', updatePos); };
  }, [activeBlockId, selPos, article.content]);

  useEffect(() => {
    const handleSelection = () => {
      const sel = window.getSelection();
      if (sel.rangeCount > 0 && !sel.isCollapsed && canvasRef.current?.contains(sel.anchorNode)) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setSelPos({ top: rect.top, left: rect.left + rect.width / 2 });
      } else setSelPos(null);
    };
    document.addEventListener('selectionchange', handleSelection);
    return () => document.removeEventListener('selectionchange', handleSelection);
  }, []);

  useEffect(() => {
    const headings = Array.from(document.querySelectorAll('h2[data-block-id]'));
    if (!headings.length) return;
    const ob = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) setActiveH2(entry.target.getAttribute('data-block-id')); });
    }, { rootMargin: '-100px 0px -60% 0px' });
    headings.forEach(h => ob.observe(h));
    return () => ob.disconnect();
  }, [article.content]);

  const updateBlock = useCallback((id, changes) => {
    if (isReadOnly) return;
    updateArticleState(prev => ({ ...prev, content: prev.content.map(b => b.id === id ? { ...b, ...changes } : b) }));
  }, [isReadOnly, updateArticleState]);

  const deleteBlock = useCallback((id) => {
    if (isReadOnly) return;
    setArticle(prev => {
      const idx = prev.content.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const next = prev.content.filter(b => b.id !== id);
      setActiveBlockId(next[Math.max(0, idx - 1)]?.id || null);
      return markArticleEdit(prev, { ...prev, content: next });
    });
  }, [isReadOnly, markArticleEdit]);

  const copyBlock = useCallback((id) => {
    if (isReadOnly) return;
    setArticle(prev => {
      const idx = prev.content.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const newBlock = JSON.parse(JSON.stringify(prev.content[idx]));
      newBlock.id = generateId();
      const next = [...prev.content];
      next.splice(idx + 1, 0, newBlock);
      setActiveBlockId(newBlock.id);
      return markArticleEdit(prev, { ...prev, content: next });
    });
  }, [isReadOnly, markArticleEdit]);

  const handleBlockKeyDown = useCallback((e, id) => {
    if (isReadOnly) return;
    const idx = article.content.findIndex(b => b.id === id);
    if (e.key === 'Enter' && !e.shiftKey && article.content[idx].type === 'paragraph') {
      e.preventDefault();
      const newId = generateId();
      setArticle(prev => {
        const next = [...prev.content];
        next.splice(idx + 1, 0, { id: newId, type: 'paragraph', html: '' });
        return markArticleEdit(prev, { ...prev, content: next });
      });
      setActiveBlockId(newId);
    } else if (e.key === 'Backspace') {
      const block = article.content[idx];
      if (!block.html || block.html === '<br>') { e.preventDefault(); deleteBlock(id); }
    } else if (e.key === '/') {
      const sel = window.getSelection();
      if (sel.rangeCount > 0) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        setSlashMenu({ pos: { left: rect.left, top: rect.bottom }, index: idx, replaceId: id });
      }
    } else if (e.key === 'Escape') {
      setActiveBlockId(id);
    } else if (e.ctrlKey || e.metaKey) {
      if (e.key === 'd') { e.preventDefault(); copyBlock(id); }
    }
  }, [article.content, deleteBlock, copyBlock, isReadOnly, markArticleEdit]);

  const insertBlockTemplate = (template, index, replaceId) => {
    if (isReadOnly) return;
    const newBlock = { ...template, id: generateId() };
    setArticle(prev => {
      const next = [...prev.content];
      if (replaceId) { const i = next.findIndex(b => b.id === replaceId); if (i > -1) next[i] = newBlock; } 
      else { next.splice(index + 1, 0, newBlock); }
      return markArticleEdit(prev, { ...prev, content: next });
    });
    setSlashMenu(null);
    setActiveBlockId(newBlock.id);
  };

  const jumpToField = (field) => {
    if (field === 'title' || field === 'summary' || field === 'changeNote' || field === 'screenshot-alt') {
      if (field === 'screenshot-alt') {
        const el = document.querySelector('input[id^="alt-"]');
        if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      } else {
        document.getElementById(`canvas-${field}`)?.focus();
        document.getElementById(`canvas-${field}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (window.innerWidth < 1024) setRightOpen(false);
    } else if (field === 'category' || field === 'section' || field === 'related') {
      setActiveTab('details');
      setRightOpen(true);
      setTimeout(() => document.getElementById(`details-${field}`)?.focus(), 100);
    } else if (field === 'keywords') {
      setActiveTab('search');
      setRightOpen(true);
      setTimeout(() => document.getElementById('search-keywords-input')?.focus(), 100);
    } else if (field === 'comments') {
      setActiveTab('comments');
      setRightOpen(true);
    } else {
      const block = document.querySelector(`[data-block-id="${field}"]`);
      block?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (window.innerWidth < 1024) setRightOpen(false);
    }
  };

  const wordCount = useMemo(() => article.content.reduce((acc, b) => acc + (b.html ? b.html.split(/\s+/).length : 0), 0) + (article.summary ? article.summary.split(/\s+/).length : 0), [article]);
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const handleRevertToPublished = () => {
    if (!article.publishedSnapshot) return;
    if (!window.confirm('Revert this update to the last published version? The live article will stay unchanged.')) return;
    const reverted = {
      ...article.publishedSnapshot,
      id: article.id,
      status: 'published',
      hasRevision: false,
      hasPublishedVersion: true,
      liveVersion: article.liveVersion,
      publishedSnapshot: article.publishedSnapshot,
      comments: []
    };
    setArticle(reverted);
    setActiveTab('details');
    setSaveStatus('Reverted to published version');
    onSaved?.(reverted);
  };
  const handleExecuteSubmit = (note) => {
    const submittedArticle = { ...article, status: 'in-review', submittedAt: new Date().toISOString(), reviewerNote: note };
    setArticle(submittedArticle);
    setSubmitDialogOpen(false);
    setActiveTab('details');
    setActiveBlockId(null);
    setSlashMenu(null);
    setSelPos(null);
    setSaveStatus('Submitted');
    onSubmitted?.(submittedArticle);
  };
  const submitBtnLabel = isReturned ? 'Resubmit for review' : isUnderRevision ? 'Submit update for review' : 'Submit for review';
  const statusPillClass = isReadOnly ? 'status-pill-review' : isReturned ? 'status-pill-returned' : isUnderRevision ? 'status-pill-revision' : isPublished ? 'status-pill-published' : '';

  return (
    <ToastProvider>
      <EditorContext.Provider value={{ article, setArticle: updateArticleState, handleSave, jumpToField, setSaveStatus, isReadOnly }}>
        <style>{GLOBAL_STYLES}</style>
        <div className={`layout-shell ${isReadOnly ? 'read-only' : ''}`}>
          
          <div className="fake-top-bar hide-mobile"><Icons.Menu size={20} color="var(--muted)" /><div className="bricolage" style={{ fontSize: 16 }}>Knowledge Admin</div></div>

          {/* EDITOR BAR */}
          <header className="editor-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
              <button className="toolbar-btn" onClick={() => setLeftOpen(!leftOpen)} title={leftOpen ? "Hide outline" : "Show outline"} aria-expanded={leftOpen}><Icons.PanelLeft size={18} /></button>
              <button className="back-link" onClick={handleBack} title="Back to My articles"><Icons.ArrowLeft size={18} /><span className="hide-mobile">My articles</span></button>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                   <div style={{ fontWeight: 600, fontSize: 14, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{article.title || 'Untitled article'}</div>
                   <div className={`status-pill ${statusPillClass}`} title={isReturned ? returnedProgress : undefined}>{statusLabel}</div>
                 </div>
                 {isReadOnly && submittedAtLabel && <div className="mono" style={{ color: 'var(--muted)', fontSize: 10 }}>Submitted {submittedAtLabel}</div>}
                 {isReturned && <div className="mono" style={{ color: 'var(--brick-text)', fontSize: 10 }}>{returnedProgress}</div>}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div className="mono hide-mobile" aria-live="polite" style={{ color: 'var(--muted)' }}>{saveStatus}</div>
              
              <div className="hide-mobile" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {!isReadOnly && <button className="btn btn-ghost" onClick={() => setImportModal(true)}><Icons.UploadCloud size={14} /> Upload doc</button>}
                {isUnderRevision && article.publishedSnapshot && <button className="btn btn-ghost" onClick={handleRevertToPublished}><Icons.RotateCcw size={14} /> Revert to published</button>}
                <ToastContext.Consumer>
                  {() => (
                    isReadOnly
                      ? <button className="btn btn-ghost" onClick={handleBack}><Icons.ArrowLeft size={14} /> Back to list</button>
                      : <button className="btn btn-primary" onClick={() => setSubmitDialogOpen(true)} disabled={disableSubmit} title={disableSubmit ? 'Make a change to start an update first' : ''}><Icons.Send size={14} /> {submitBtnLabel}</button>
                  )}
                </ToastContext.Consumer>
              </div>
              
              <div className="mobile-only" style={{ position: 'relative' }}>
                <button className="toolbar-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><Icons.MoreVertical size={18}/></button>
                {mobileMenuOpen && (
                  <div style={{ position: 'absolute', right: 0, top: 40, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow)', zIndex: 100, minWidth: 200, padding: 8 }}>
                     {!isReadOnly && <button className="btn-ghost" style={{ width: '100%', marginBottom: 8, border: 'none', justifyContent: 'flex-start' }} onClick={() => { setImportModal(true); setMobileMenuOpen(false); }}><Icons.UploadCloud size={14} /> Upload doc</button>}
                     {isUnderRevision && article.publishedSnapshot && <button className="btn-ghost" style={{ width: '100%', marginBottom: 8, border: 'none', justifyContent: 'flex-start' }} onClick={() => { setMobileMenuOpen(false); handleRevertToPublished(); }}><Icons.RotateCcw size={14} /> Revert to published</button>}
                     <ToastContext.Consumer>
                        {() => (
                           isReadOnly
                            ? <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setMobileMenuOpen(false); handleBack(); }}>Back to list</button>
                            : <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { setSubmitDialogOpen(true); setMobileMenuOpen(false); }} disabled={disableSubmit}>{submitBtnLabel}</button>
                        )}
                     </ToastContext.Consumer>
                  </div>
                )}
              </div>
              
              <button className="toolbar-btn" onClick={() => setRightOpen(!rightOpen)} title={rightOpen ? "Hide panel" : "Show panel"} aria-expanded={rightOpen}><Icons.PanelRight size={18} /></button>
            </div>
          </header>

          {/* SLIM TOOLBAR */}
          <div className="slim-toolbar" role="toolbar">
            <button className="toolbar-btn" disabled={isReadOnly}><Icons.Undo size={16}/></button>
            <button className="toolbar-btn" disabled={isReadOnly}><Icons.Redo size={16}/></button>
            <div className="toolbar-divider" />
            <select disabled={isReadOnly} style={{ width: 'auto', border: 'none', background: 'transparent', fontWeight: 500, cursor: 'pointer', padding: '0 8px', boxShadow: 'none' }} className="hide-mobile">
              <option>Paragraph</option>
              <option>Heading 2</option>
              <option>Heading 3</option>
            </select>
            <div className="toolbar-divider hide-mobile" />
            <button className="toolbar-btn" disabled={isReadOnly} onMouseDown={e => { e.preventDefault(); document.execCommand('bold'); }}><Icons.Bold size={16}/></button>
            <button className="toolbar-btn" disabled={isReadOnly} onMouseDown={e => { e.preventDefault(); document.execCommand('italic'); }}><Icons.Italic size={16}/></button>
            <button className="toolbar-btn" disabled={isReadOnly} onMouseDown={e => { e.preventDefault(); document.execCommand('underline'); }}><Icons.Underline size={16}/></button>
            <button className="toolbar-btn hide-mobile" disabled={isReadOnly} onMouseDown={e => { e.preventDefault(); document.execCommand('insertHTML', false, `<code>${window.getSelection().toString()}</code>`); }}><Icons.Code size={16}/></button>
            <button className="toolbar-btn hide-mobile" disabled={isReadOnly} onMouseDown={e => { e.preventDefault(); const url = prompt('Link URL:'); if (url) document.execCommand('createLink', false, url); }}><Icons.Link size={16}/></button>
            <div className="toolbar-divider" />
            <button className="toolbar-btn" disabled={isReadOnly} onMouseDown={e => { e.preventDefault(); document.execCommand('insertUnorderedList'); }}><Icons.List size={16}/></button>
            <button className="toolbar-btn" disabled={isReadOnly} onMouseDown={e => { e.preventDefault(); document.execCommand('insertOrderedList'); }}><Icons.ListOrdered size={16}/></button>
            <div className="toolbar-divider hide-mobile" />
            {!isReadOnly && <button className="btn-text hide-mobile" style={{ fontSize: 12 }} onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              setSlashMenu({ pos: { left: rect.left, top: rect.bottom + 4 }, index: article.content.length - 1, replaceId: null });
            }}>+ Insert</button>}
            <div style={{ flex: 1 }} />
            <div className="mono" style={{ color: 'var(--muted)' }}>{wordCount} words &middot; {readTime} min read</div>
          </div>

          <div className="main-columns">
            {/* OUTLINE */}
            <aside className={`col-outline ${leftOpen ? 'is-open' : 'col-closed'}`}>
               <div style={{ padding: '16px 16px 8px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--heading)' }} className="bricolage">On this page</div>
               <div style={{ flex: 1, overflowY: 'auto' }}>
                 {article.content.filter(b => b.type === 'heading').length === 0 ? (
                   <div style={{ padding: 16, color: 'var(--muted)', fontSize: 12 }}>No headings yet. Add a Heading 2 to see it here.</div>
                 ) : (
                   article.content.filter(b => b.type === 'heading').map((h) => (
                     <div key={h.id} className={`outline-item ${activeH2 === h.id ? 'active' : ''}`} style={{ paddingLeft: h.level === 3 ? 28 : 16 }} onClick={() => document.querySelector(`[data-block-id="${h.id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                       {h.html.replace(/<[^>]+>/g, '') || `Heading ${h.level}`}
                     </div>
                   ))
                 )}
               </div>
               <div className="mono" style={{ padding: 16, borderTop: '1px solid var(--border)', color: 'var(--muted)', fontSize: 10 }}>{article.content.filter(b => b.type === 'heading' && b.level === 2).length} headings indexed</div>
            </aside>

            {/* CANVAS */}
            <main className="col-canvas" ref={canvasRef} onClick={(e) => { if (e.target === canvasRef.current || e.target.classList.contains('canvas-inner')) setActiveBlockId(null); }}>
              <div className="canvas-inner" role="article">
                {isReadOnly && (
                  <div className="submission-banner">
                    <Icons.Lock size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>Locked while with the reviewer</div>
	                      <div className="mono" style={{ marginTop: 4, color: 'inherit' }}>
                          {submittedAtLabel ? `Submitted ${submittedAtLabel}. ` : ''}
                          {article.hasPublishedVersion ? `Live ${article.liveVersion || article.availableFromVersion} stays online while this update is reviewed.` : 'Use My articles to return to the list.'}
                        </div>
                    </div>
                  </div>
                )}
                {isPublished && (
                  <div className="published-banner">
                    <Icons.CheckCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>Live article</div>
                      <div className="mono" style={{ marginTop: 4, color: 'inherit' }}>Live {article.liveVersion || article.availableFromVersion}. Your first edit starts an update; readers keep seeing the current published version.</div>
                    </div>
                  </div>
                )}
                {isUnderRevision && (
                  <div className="revision-banner">
                    <Icons.Edit3 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>Updating published article</div>
                      <div className="mono" style={{ marginTop: 4, color: 'inherit' }}>Live {article.liveVersion || article.availableFromVersion} stays online until this update is reviewed and approved.</div>
                    </div>
                  </div>
                )}
                {isReturned && (
                  <div className="returned-banner">
                    <Icons.Undo2 size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>Changes requested by {article.returnedBy || 'the reviewer'}</div>
                      <div className="mono" style={{ marginTop: 4, color: 'inherit' }}>
                        {article.returnedAt ? `Returned ${new Date(article.returnedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}. ` : ''}
                        {openComments.length === 0 ? 'All comments resolved. Ready to resubmit.' : returnedProgress}
                      </div>
                      <button className="btn-text" style={{ marginTop: 8, padding: 0, color: 'inherit' }} onClick={() => { setActiveTab('comments'); setRightOpen(true); }}>
                        Show comments
                      </button>
                    </div>
                  </div>
                )}
                <div className="mono" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted)', marginBottom: 16 }}>{article.category || 'Category'} &gt; {article.section || 'Section'} &gt; {article.title || 'Untitled'}</div>
                <SafeEditable id="canvas-title" tagName="h1" className="bricolage" html={article.title} readOnly={isReadOnly} onUpdate={val => updateArticleState(prev => ({...prev, title: val}))} placeholder="Untitled article" style={{ outline: 'none' }} />
                <div className="mono" style={{ paddingBottom: 24, borderBottom: '1px solid var(--border)', marginBottom: 24, color: 'var(--muted)' }}>By {article.author} &middot; Last updated Today &middot; Available from {article.availableFromVersion} &middot; {readTime} min read</div>

                {(article.changeType === 'New' || article.changeType === 'Updated') && (
                  <div id="canvas-changeNote-box" style={{ background: 'var(--inset)', border: '1px solid var(--border)', borderRadius: 8, padding: 16, marginBottom: 32 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>New in this version:</div>
                    <SafeEditable id="canvas-changeNote" tagName="div" className="serif" html={article.changeNote} readOnly={isReadOnly} onUpdate={val => updateArticleState(prev => ({...prev, changeNote: val}))} placeholder="Describe changes..." style={{ color: article.changeNote ? 'var(--text)' : 'var(--muted)', outline: 'none' }} />
                  </div>
                )}

                <div style={{ fontSize: 20, marginBottom: 32 }}>
                   <SafeEditable id="canvas-summary" tagName="div" className="serif" html={article.summary} readOnly={isReadOnly} onUpdate={val => updateArticleState(prev => ({...prev, summary: val}))} placeholder="Add a short summary for readers..." style={{ outline: 'none', borderLeft: '3px solid var(--border)', paddingLeft: 16 }} isMultiLine={true} />
                </div>

                {article.content.map((b, i) => (
                  <BlockRenderer key={b.id} block={b} index={i} readOnly={isReadOnly} isFocused={activeBlockId === b.id} onFocus={(e, id) => setActiveBlockId(id)} onUpdate={updateBlock} onKeyDown={handleBlockKeyDown} onInsertClick={(e, idx, _rep) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setSlashMenu({ pos: { left: rect.right + 8, top: rect.top }, index: idx, replaceId: null });
                  }} />
                ))}
                
                <div style={{ height: 100 }} />
                
                {/* Related Articles Footer */}
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
                  <h2 style={{ fontSize: 18, marginTop: 0 }}>Related articles</h2>
                  {article.relatedIds.length === 0 ? (
                    <div style={{ color: 'var(--muted)' }}>No related articles yet. Add up to 3 in Details.</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                       {article.relatedIds.map(rid => {
                         const r = SEED.articles.find(a => a.id === rid);
                         if (!r) return null;
                         return (
                           <div key={rid} style={{ background: 'var(--inset)', borderLeft: '3px solid var(--amber)', borderRadius: '0 8px 8px 0', padding: 16 }}>
                             <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.category} &gt; {r.section}</div>
                             <div style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</div>
                           </div>
                         );
                       })}
                    </div>
                  )}
                </div>
              </div>
            </main>

            {/* RIGHT PANEL */}
            <aside className={`col-panel ${rightOpen ? 'is-open' : 'col-closed'}`}>
               <div className="tab-list" role="tablist">
                 {panelTabs.map(tab => (
                   <button key={tab} className={`tab-btn ${activeTab===tab?'active':''}`} onClick={()=>setActiveTab(tab)}>{tab === 'search' ? 'Search & keywords' : tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
                 ))}
                 <button className="toolbar-btn" style={{ width: 40, height: 40, borderRadius: 0, marginLeft: 'auto' }} onClick={() => setRightOpen(false)}><Icons.X size={18}/></button>
               </div>
               <div style={{ flex: 1, overflowY: 'auto' }}>
                 {activeTab === 'checklist' && <ChecklistTab />}
                 {activeTab === 'comments' && <CommentsTab />}
                 {activeTab === 'details' && <DetailsTab />}
                 {activeTab === 'search' && <SearchTab />}
               </div>
            </aside>
          </div>
        </div>

        {/* PORTALS & OVERLAYS */}
        {!isReadOnly && !selPos && <BlockPill activeBlock={article.content.find(b => b.id === activeBlockId)} pos={pillPos} onUpdate={updateBlock} onCopy={copyBlock} onDelete={deleteBlock} />}
        {!isReadOnly && <SelectionPill pos={selPos} />}
        {!isReadOnly && slashMenu && <SlashMenu pos={slashMenu.pos} onClose={() => setSlashMenu(null)} onSelect={(temp) => insertBlockTemplate(temp, slashMenu.index, slashMenu.replaceId)} />}

        {(leftOpen && window.innerWidth < 1280) && <div className="scrim" onClick={() => setLeftOpen(false)} style={{ zIndex: 109 }} />}
        {(rightOpen && window.innerWidth < 1024) && <div className="scrim" onClick={() => setRightOpen(false)} style={{ zIndex: 109 }} />}

        {/* DIALOGS */}
        <SubmitReadinessDialog isOpen={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)} onSubmit={handleExecuteSubmit} onBack={handleBack} />

        {importModal && (
          <>
            <div className="scrim" style={{ zIndex: 200 }} onClick={() => setImportModal(false)} />
            <dialog open style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', zIndex: 201 }}>
              <h2 style={{ marginTop: 0 }}>Import Document</h2>
              <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Best for one article's worth of content. For long documents, import one section at a time.</p>
              <div style={{ border: '2px dashed var(--ghost-border)', borderRadius: 8, padding: 40, textAlign: 'center', marginBottom: 24, background: 'var(--inset)' }}>
                 <Icons.UploadCloud size={32} color="var(--muted)" style={{ marginBottom: 12, margin: '0 auto' }} />
                 <div style={{ fontWeight: 500 }}>Drop a .docx, .md or .txt file, or browse</div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}><input type="radio" name="importMode" defaultChecked /> Add at the end</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="radio" name="importMode" /> Replace all content</label>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button className="btn btn-ghost" onClick={() => setImportModal(false)}>Cancel</button>
                <ToastContext.Consumer>
                  {showToast => (
                    <button className="btn-primary" onClick={() => {
                      updateArticleState(prev => ({ ...prev, content: [...prev.content, { id: generateId(), type: 'paragraph', html: 'Imported paragraph text...' }] }));
                      setImportModal(false);
                      showToast('Imported blocks. Check headings and callouts.');
                    }}>Import</button>
                  )}
                </ToastContext.Consumer>
              </div>
            </dialog>
          </>
        )}
      </EditorContext.Provider>
    </ToastProvider>
  );
}
