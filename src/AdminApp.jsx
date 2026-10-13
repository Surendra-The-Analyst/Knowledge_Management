import React, { useState, useEffect, useRef, createContext, useContext, useMemo } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, FilePlus, Undo2, MessageSquare, BookOpen,
  Sun, Moon, Bell, Menu, Search, Plus, ExternalLink, X, Info,
  MoreVertical, Edit3, Trash2, CheckCircle, Eye, Clock, ShieldAlert,
  ChevronLeft, ChevronRight, Lock, Filter, Save, Send, RotateCcw,
  ListChecks, Hash, AlertTriangle
} from 'lucide-react';

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap');

  :root[data-theme="light"] {
    --bg: #FAF8F4; --surface: #FFFFFF; --surface-2: #F3F0E9; --border: #E7E2D8; --border-strong: #D5CFC2;
    --text: #0B1F3A; --text-muted: #5B6678; --text-faint: #8A93A3;
    --navy: #0B1F3A; --on-navy: #FFFFFF; --header-bg: #0B1F3A;
    --amber: #E8A317; --amber-hover: #D4920F; --amber-soft: #FCF3DC; --amber-text: #8A5A00;
    --teal: #1F7A7A; --teal-soft: #E3F0EF; --teal-text: #1F7A7A;
    --red: #A93226; --red-soft: #F6E3E0; --red-text: #A93226;
    --shadow-sm: 0 1px 2px rgba(11,31,58,.06); --shadow-md: 0 6px 18px rgba(11,31,58,.10);
    --ring: rgba(232, 163, 23, 0.25);
    --pill-approved-bg: var(--navy);
    --pill-published-bg: var(--teal);
  }

  :root[data-theme="dark"] {
    --bg: #0E1726; --surface: #152033; --surface-2: #1B2A42; --border: #26344A; --border-strong: #34455F;
    --text: #EAF0F8; --text-muted: #9AA7BA; --text-faint: #6F7C90;
    --navy: #0A1220; --on-navy: #EAF0F8; --header-bg: #0A1220;
    --amber: #F2B636; --amber-hover: #F7C65A; --amber-soft: #3A2E12; --amber-text: #F2B636;
    --teal: #4FB3B0; --teal-soft: #12302F; --teal-text: #4FB3B0;
    --red: #E0675A; --red-soft: #3A1B19; --red-text: #E0675A;
    --shadow-sm: 0 1px 2px rgba(0,0,0,.4); --shadow-md: 0 8px 22px rgba(0,0,0,.5);
    --ring: rgba(242, 182, 54, 0.25);
    --pill-approved-bg: #22407A;
    --pill-published-bg: #1F7A7A;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    background: linear-gradient(180deg, rgba(250,248,244,0.98) 0%, rgba(250,248,244,0.98) 100%);
    color: var(--text);
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 13.5px; line-height: 1.5; -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4, h5, h6, .font-heading { font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-weight: 600; }
  .font-mono { font-family: 'JetBrains Mono', monospace; font-weight: 400; }

  ::selection { background: rgba(232, 163, 23, 0.22); }

  /* Transitions */
  body, .transition-colors, .card, .btn, .sidebar, .topbar { transition-property: background-color, color, border-color; transition-duration: 150ms; transition-timing-function: ease-in-out; }

  /* Typography Scale */
  .text-display { font-size: 28px; line-height: 1.2; font-family: 'Bricolage Grotesque'; font-weight: 600; }
  .text-panel-title { font-size: 16px; line-height: 1.3; font-family: 'Bricolage Grotesque'; font-weight: 600; }
  .text-ui-label { font-size: 13px; font-weight: 500; }
  .text-body { font-size: 13.5px; font-weight: 400; line-height: 1.5; }
  .text-meta { font-size: 12px; font-family: 'JetBrains Mono'; font-weight: 400; color: var(--text-muted); }
  .text-big-num { font-size: 32px; font-family: 'Bricolage Grotesque'; font-weight: 600; line-height: 1; }
  .text-muted { color: var(--text-muted); }
  .text-faint { color: var(--text-faint); }
  .text-amber { color: var(--amber-text); }

  /* Layout Utilities */
  .flex { display: flex; } .flex-col { display: flex; flex-direction: column; }
  .items-center { align-items: center; } .items-start { align-items: flex-start; } .justify-between { justify-content: space-between; } .justify-center { justify-content: center; }
  .gap-4 { gap: 4px; } .gap-8 { gap: 8px; } .gap-12 { gap: 12px; } .gap-16 { gap: 16px; } .gap-24 { gap: 24px; } .gap-32 { gap: 32px; }
  .w-full { width: 100%; } .h-full { height: 100%; } .flex-1 { flex: 1; }
  .relative { position: relative; } .absolute { position: absolute; }
  .truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

  /* Buttons */
  button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; }
  button:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px;
    height: 36px; padding: 0 14px; border-radius: 6px;
    font-family: 'Inter'; font-weight: 600; font-size: 13px;
    transition: all 150ms; text-decoration: none;
  }
  .btn:focus-visible { outline: 2px solid var(--amber); outline-offset: 2px; }
  .btn:active:not(:disabled) { transform: translateY(1px); }
  .btn-primary { background: var(--amber); color: var(--navy); }
  :root[data-theme="dark"] .btn-primary { color: #0A1220; }
  .btn-primary:hover:not(:disabled) { background: var(--amber-hover); }
  .btn-ghost { background: var(--surface); border: 1px solid var(--border-strong); color: var(--text); }
  .btn-ghost:hover:not(:disabled) { background: var(--surface-2); }
  .btn-text { color: var(--text); padding: 0 8px; }
  .btn-text:hover:not(:disabled) { text-decoration: underline; background: var(--surface-2); }
  .btn-destructive { background: var(--red); color: #FFF; border: 1px solid var(--red); }
  .btn-destructive:hover:not(:disabled) { background: color-mix(in srgb, var(--red) 92%, black); }
  .btn-icon { width: 36px; height: 36px; padding: 0; border-radius: 6px; color: var(--text); background: transparent; display: inline-flex; align-items: center; justify-content: center;}
  .btn-icon:hover:not(:disabled) { background: var(--surface-2); }

  /* Forms */
  .input-base {
    height: 36px; background: var(--surface); border: 1px solid var(--border-strong);
    border-radius: 8px; padding: 0 12px; color: var(--text); font-family: 'Inter'; font-size: 13px;
    outline: none; transition: all 150ms; width: 100%;
  }
  select.input-base { appearance: none; padding-right: 32px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A93A3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 8px center; }
  .input-base::placeholder { color: var(--text-faint); }
  .input-base:focus { border-color: var(--amber); box-shadow: 0 0 0 3px var(--ring); }
  .input-base.error { border-color: var(--red); }
  .input-base.error:focus { box-shadow: 0 0 0 3px rgba(169, 50, 38, 0.2); }
  .label-base { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; color: var(--text); }
  .error-text { color: var(--red-text); font-size: 12px; margin-top: 4px; display: block; }

  /* Cards & Badges */
  .card { background: rgba(255,255,255,0.82); border: 1px solid var(--border); border-radius: 18px; box-shadow: 0 8px 20px rgba(11,31,58,0.04); padding: 20px; display: flex; flex-direction: column; backdrop-filter: blur(2px); }
  .card-clickable { cursor: pointer; transition: transform 150ms, border-color 150ms, box-shadow 150ms; }
  .card-clickable:hover { transform: translateY(-1px); border-color: var(--amber); box-shadow: 0 12px 22px rgba(11,31,58,0.06); }
  .badge { background: var(--amber); color: var(--navy); font-weight: 600; font-size: 11px; min-width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 0 6px; }
  :root[data-theme="dark"] .badge { color: #0A1220; }
  
  /* Status Chips */
  .chip-reason { background: var(--surface-2); color: var(--text-muted); border: 1px solid var(--border); font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 4px; display: inline-flex; align-items: center; white-space: nowrap; }
  .chip-amber { background: var(--amber-soft); color: var(--amber-text); border: 1px solid var(--amber); font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 4px; display: inline-flex; align-items: center; white-space: nowrap; }
  .chip-red { background: var(--red-soft); color: var(--red-text); border: 1px solid var(--red-text); font-size: 12px; font-weight: 500; padding: 2px 8px; border-radius: 4px; display: inline-flex; align-items: center; white-space: nowrap; }

  /* Layout Shell */
  .shell { display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: linear-gradient(180deg, rgba(250,248,244,0.98), rgba(250,248,244,0.98)); }
  .topbar { height: 64px; background: var(--header-bg); color: var(--on-navy); display: flex; align-items: center; padding: 0 24px; justify-content: space-between; flex-shrink: 0; z-index: 40; position: relative; box-shadow: 0 2px 8px rgba(11,31,58,0.08); }
  .body-area { display: flex; flex: 1; overflow: hidden; position: relative; }
  .sidebar { width: 240px; background: rgba(255,255,255,0.72); border-right: 1px solid var(--border); display: flex; flex-direction: column; flex-shrink: 0; transition: width 150ms; backdrop-filter: blur(2px); }
  .main-content { flex: 1; overflow-y: auto; background: transparent; position: relative; }
  .page-container { max-width: 1280px; margin: 0 auto; padding: 32px; display: flex; flex-direction: column; gap: 24px; }
  
  .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; margin: 4px 12px; border-radius: 10px; color: var(--text-muted); text-decoration: none; font-weight: 500; transition: all 150ms; border-left: 3px solid transparent; }
  .nav-item:hover { background: rgba(243,240,233,0.8); color: var(--text); }
  .nav-item.active { color: var(--text); font-weight: 600; background: linear-gradient(90deg, rgba(232,163,23,0.18), rgba(232,163,23,0.08)); border-left-color: var(--amber); border-radius: 0 10px 10px 0; }
  :root[data-theme="dark"] .nav-item.active { background: rgba(242,182,54,0.12); }

  /* Tabs */
  .tabs-list { display: flex; gap: 24px; border-bottom: 1px solid var(--border); padding: 0 16px; overflow-x: auto; scrollbar-width: none; }
  .tabs-list::-webkit-scrollbar { display: none; }
  .tab-item { padding: 12px 0; color: var(--text-muted); font-weight: 500; cursor: pointer; border-bottom: 2px solid transparent; white-space: nowrap; transition: color 150ms; position: relative; }
  .tab-item:hover { color: var(--text); }
  .tab-item.active { color: var(--text); font-weight: 600; border-bottom-color: var(--amber); }

  /* Tables */
  .table { width: 100%; border-collapse: collapse; text-align: left; }
  .table th { padding: 12px 10px; border-bottom: 1px solid var(--border); font-weight: 500; color: var(--text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.04em; }
  .table td { padding: 16px 10px; border-bottom: 1px solid var(--border); font-size: 13.5px; vertical-align: top; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: rgba(243,240,233,0.35); }
  .table-row-clickable { cursor: pointer; }
  .articles-table { table-layout: fixed; min-width: 0; }
  .articles-table .col-title { width: 32%; }
  .articles-table .col-status { width: 15%; }
  .articles-table .col-version { width: 6%; }
  .articles-table .col-edited { width: 10%; }
  .articles-table .col-helpful { width: 7%; }
  .articles-table .col-feedback { width: 8%; }
  .articles-table .col-review { width: 10%; }
  .articles-table .col-action { width: 12%; }
  .articles-table .action-wrap { display: flex; align-items: center; justify-content: flex-end; gap: 4px; min-width: 0; }

  /* Dialog & Overlays */
  .dialog-overlay { position: fixed; inset: 0; background: rgba(11,31,58,0.28); z-index: 100; display: flex; align-items: center; justify-content: center; animation: fadeIn 200ms ease-out; }
  .dialog-content { background: rgba(255,255,255,0.96); border: 1px solid var(--border); border-radius: 20px; width: 480px; max-width: 90vw; padding: 24px; box-shadow: 0 18px 38px rgba(11,31,58,0.12); position: relative; animation: slideUpDialog 200ms ease-out; max-height: 90vh; overflow-y: auto; }
  .dropdown-menu { position: absolute; right: 0; top: 100%; margin-top: 4px; background: var(--surface); border: 1px solid var(--border); box-shadow: var(--shadow-md); border-radius: 8px; width: 180px; z-index: 50; padding: 4px 0; }
  .dropdown-item { width: 100%; text-align: left; padding: 8px 16px; font-size: 13px; color: var(--text); display: flex; align-items: center; gap: 8px; background: none; border: none; cursor: pointer; }
  .dropdown-item:hover { background: var(--surface-2); }

  /* Tooltip and Toast */
  .tooltip-bubble { position: absolute; background: var(--navy); color: var(--on-navy); padding: 6px 10px; border-radius: 4px; font-size: 12px; font-weight: 500; pointer-events: none; z-index: 100; white-space: nowrap; box-shadow: var(--shadow-sm); }
  .toast-container { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 200; }
  .toast { background: var(--surface); color: var(--text); border: 1px solid var(--border); padding: 12px 24px; border-radius: 8px; box-shadow: var(--shadow-md); display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 14px; animation: slideUp 0.3s ease-out; }

  /* Article editor */
  .editor-shell { min-height: 100%; display: flex; flex-direction: column; }
  .editor-header { position: sticky; top: 0; z-index: 20; background: rgba(255,255,255,0.9); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); padding: 14px 24px; box-shadow: 0 4px 12px rgba(11,31,58,0.04); }
  .editor-grid { flex: 1; display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; padding: 24px; max-width: 1440px; width: 100%; margin: 0 auto; }
  .editor-canvas { background: rgba(255,255,255,0.78); border: 1px solid var(--border); border-radius: 18px; box-shadow: 0 12px 22px rgba(11,31,58,0.04); padding: 32px; min-width: 0; }
  .editor-panel { position: sticky; top: 88px; align-self: start; max-height: calc(100vh - 112px); overflow-y: auto; background: rgba(255,255,255,0.78); border: 1px solid var(--border); border-radius: 18px; box-shadow: 0 12px 22px rgba(11,31,58,0.04); }
  .editor-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
  .editor-title-input { min-height: 54px; height: auto; padding: 10px 12px; font-family: 'Bricolage Grotesque'; font-size: 30px; line-height: 1.15; font-weight: 600; color: var(--text); }
  .editor-block { border: 1px solid transparent; border-radius: 8px; padding: 10px 12px; margin: 10px -12px; transition: border-color 150ms, background 150ms; }
  .editor-block:focus-within { border-color: var(--amber); background: var(--amber-soft); }
  .editor-block-label { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
  .article-preview { color: var(--text); font-size: 15px; line-height: 1.65; }
  .article-preview h2 { font-family: 'Bricolage Grotesque'; font-size: 22px; line-height: 1.25; margin: 28px 0 10px; color: var(--text); }
  .article-preview p { margin: 0 0 14px; color: var(--text-muted); }
  .article-preview ol, .article-preview ul { padding-left: 22px; margin: 0 0 18px; color: var(--text-muted); }
  .article-preview li { margin-bottom: 8px; }
  .article-callout { border-left: 3px solid var(--amber); background: var(--amber-soft); color: var(--amber-text); border-radius: 0 8px 8px 0; padding: 12px 14px; margin: 16px 0; font-weight: 500; }
  .editor-tabs { display: flex; border-bottom: 1px solid var(--border); }
  .editor-tab { flex: 1; height: 42px; border-bottom: 2px solid transparent; color: var(--text-muted); font-weight: 600; text-transform: capitalize; }
  .editor-tab.active { color: var(--text); border-bottom-color: var(--amber); }
  .panel-section { padding: 18px; border-bottom: 1px solid var(--border); }
  .comment-card { border: 1px solid var(--border); border-left: 3px solid var(--amber); border-radius: 8px; padding: 12px; margin-top: 12px; background: var(--surface); }
  .comment-card.resolved { opacity: .65; border-left-color: var(--teal); background: var(--surface-2); }
  .chip-list { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip-edit { display: inline-flex; align-items: center; gap: 6px; min-height: 26px; padding: 3px 8px; border-radius: 999px; background: var(--surface-2); border: 1px solid var(--border); font-size: 12px; font-weight: 500; }
  
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUpDialog { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

  /* Skeleton */
  @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
  .skeleton { background: linear-gradient(90deg, var(--surface-2) 25%, var(--border) 50%, var(--surface-2) 75%); background-size: 1000px 100%; border-radius: 4px; animation: shimmer 2s infinite linear; }
  @media (prefers-reduced-motion: reduce) { .skeleton, .dialog-overlay, .dialog-content, .toast { animation: none; transition: none; } .skeleton { background: var(--surface-2); } }

  /* Responsive Rules */
  @media (min-width: 768px) {
    .mobile-only { display: none !important; }
  }

  @media (max-width: 1199px) and (min-width: 768px) {
    .sidebar { width: 72px; }
    .sidebar .nav-label, .sidebar .badge, .sidebar-footer-text { display: none; }
    .nav-item { justify-content: center; margin: 4px 8px; padding: 10px; border-radius: 6px; }
    .nav-item.active { border-radius: 6px; border-left: none; box-shadow: inset 3px 0 0 var(--amber); }
    .two-col-layout { flex-direction: column; }
    .hide-tablet { display: none !important; }
    .table th.col-hide-tablet, .table td.col-hide-tablet { display: none; }
    .articles-table .col-title { width: 40%; }
    .articles-table .col-status { width: 20%; }
    .articles-table .col-action { width: 16%; }
  }

  @media (max-width: 767px) {
    .sidebar { position: fixed; left: -240px; top: 56px; bottom: 0; z-index: 50; width: 240px; box-shadow: var(--shadow-md); transition: left 0.3s ease; }
    .sidebar.open { left: 0; }
    .page-container { padding: 16px; }
    .attention-grid { grid-template-columns: 1fr !important; }
    .two-col-layout { flex-direction: column; }
    .btn-icon { width: 44px; height: 44px; }
    .topbar { padding: 0 16px; }
    .mobile-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 45; display: none; }
    .mobile-overlay.open { display: block; }
    .hide-mobile { display: none !important; }
    
    /* Responsive Table to Cards */
    .table-responsive thead { display: none; }
    .table-responsive, .table-responsive tbody, .table-responsive tr, .table-responsive td { display: block; width: 100%; }
    .table-responsive tr { margin-bottom: 16px; border: 1px solid var(--border); border-radius: 8px; padding: 16px; background: var(--surface); box-shadow: var(--shadow-sm); }
    .table-responsive td { padding: 0; border: none; margin-bottom: 8px; }
    .table-responsive td:last-child { margin-bottom: 0; margin-top: 16px; display: flex; justify-content: flex-start; }
    
    /* Dialog to Bottom Sheet */
    .dialog-content { width: 100%; border-radius: 16px 16px 0 0; align-self: flex-end; padding-bottom: max(24px, env(safe-area-inset-bottom)); border-bottom: none; animation: slideUp 300ms cubic-bezier(0.16, 1, 0.3, 1); }
    .editor-grid { grid-template-columns: 1fr; padding: 16px; }
    .editor-canvas { padding: 20px; }
    .editor-panel { position: static; max-height: none; }
    .editor-title-input { font-size: 24px; }
  }

  .focus-trap:focus { outline: none; }
`;

// Reference Date: Monday, October 12, 2026 at 5:46 PM
const CURRENT_DATE = new Date('2026-10-12T17:46:00Z');

const KNOWLEDGE_CONFIG = {
  adminDefaultReviewCycleDays: 90,
  authorMaxCycleDays: 90,
  dueSoonWindowDays: 14
};

const CATEGORIES = {
  'Collaboration Groups': ['Groups & Modes', 'Membership & Access'],
  'Messaging & Chats': ['Direct & 1:1 Messaging', 'Hands-Free & Transcription', 'Drafts Schedules & Outbox', 'Composer'],
  'User Onboarding & Directories': ['Adding Users', 'Directory Sync'],
  'Files & Attachments': ['Limits & Types'],
  'Security & Workspace Restrictions': ['Access Rules'],
  'Billing & Plan Subscriptions': ['Plans & Licenses'],
  'Organizational Units & Rules': ['Units & Rules'],
  'Voice, Video & Screen Sharing': ['Calls']
};

const ARTICLE_BODY_TEMPLATES = {
  a1: {
    summary: "Record and send voice messages from the browser without switching to the desktop app.",
    keywords: ["voice message", "record", "microphone"],
    changeNote: "",
    content: [
      { id: "a1-b1", type: "heading", text: "Overview" },
      { id: "a1-b2", type: "paragraph", text: "Voice message recording lets team members send short audio updates directly from Troop Messenger on the web." },
      { id: "a1-b3", type: "heading", text: "Before you begin" },
      { id: "a1-b4", type: "bullet", text: "Use a supported browser with microphone permissions enabled." },
      { id: "a1-b5", type: "steps", steps: ["Open a chat or group.", "Select the microphone button in the composer.", "Allow microphone access when prompted.", "Record, preview, and send the message."] },
      { id: "a1-b6", type: "callout", text: "If microphone access is blocked, the record button may not appear." }
    ]
  },
  a2: {
    summary: "Control formatting, mentions, and send behavior in the message composer.",
    keywords: ["composer", "formatting", "mentions"],
    changeNote: "",
    content: [
      { id: "a2-b1", type: "heading", text: "Overview" },
      { id: "a2-b2", type: "paragraph", text: "Composer settings help users tailor how they write and send messages." },
      { id: "a2-b3", type: "steps", steps: ["Open Settings.", "Choose Messaging.", "Update the composer preferences.", "Save your changes."] }
    ]
  },
  a3: {
    summary: "Auto-populated groups add and remove members automatically based on rules you define.",
    keywords: ["auto-populated group", "membership rules", "directory sync"],
    changeNote: "Added the rule preview step and Basic user limits.",
    content: [
      { id: "a3-b1", type: "heading", text: "Overview" },
      { id: "a3-b2", type: "paragraph", text: "Auto-populated groups manage their own membership lists from company, department, location, or directory rules." },
      { id: "a3-b3", type: "steps", steps: ["Open Group Settings.", "Choose Auto-populated membership.", "Confirm the member rules.", "Save the group."] },
      { id: "a3-b4", type: "callout", text: "Rule changes take effect immediately after saving." }
    ]
  },
  a4: {
    summary: "Turn a group into a broadcast channel where only owners and moderators can send messages.",
    keywords: ["airtime", "broadcast group", "view-only group"],
    changeNote: "Rewrote the steps for the new Airtime checkbox.",
    content: [
      { id: "a4-b1", type: "heading", text: "Overview" },
      { id: "a4-b2", type: "paragraph", text: "Airtime mode makes a group receive-only for standard members while owners and moderators can continue to send messages." },
      { id: "a4-b3", type: "heading", text: "Before you begin" },
      { id: "a4-b4", type: "bullet", text: "You must be a Group Owner or Group Moderator." },
      { id: "a4-b5", type: "steps", steps: ["Open the group chat.", "Select the group name to open Group Info.", "Open Messaging mode and turn Airtime on.", "Save the group settings."] },
      { id: "a4-b6", type: "callout", text: "Airtime availability depends on workspace admin settings." }
    ]
  },
  a6: {
    summary: "Create a group manually, choose its messaging mode, and assign member roles.",
    keywords: ["create group", "regular group", "group roles"],
    changeNote: "",
    content: [
      { id: "a6-b1", type: "heading", text: "Overview" },
      { id: "a6-b2", type: "paragraph", text: "Regular groups are shared spaces for project collaboration, departments, and recurring team conversations." },
      { id: "a6-b3", type: "steps", steps: ["Click the plus icon in the sidebar.", "Select Create Group.", "Enter the group name and optional description.", "Select members and assign roles.", "Click Create Group."] },
      { id: "a6-b4", type: "callout", text: "Only a Group Owner can change some group settings after creation." }
    ]
  },
  a9: {
    summary: "Understand the different roles available within a group.",
    keywords: ["roles", "permissions", "admin"],
    changeNote: "Added details on moderator permissions.",
    content: [
      { id: "a9-b1", type: "heading", text: "Overview" },
      { id: "a9-b2", type: "paragraph", text: "Group permissions determine who can manage members, update settings, and moderate conversations." },
      { id: "a9-b3", type: "bullet", text: "Group Owners can manage the group and delete it." },
      { id: "a9-b4", type: "bullet", text: "Group Moderators can manage members and everyday settings." },
      { id: "a9-b5", type: "bullet", text: "Standard Members can participate according to the group's messaging mode." }
    ]
  }
};

const makeDefaultArticleBody = (article) => ({
  summary: article.summary || article.reviewerComment || "",
  keywords: article.keywords || article.title.toLowerCase().split(/\s+/).filter(word => word.length > 3).slice(0, 3),
  changeNote: article.changeNote || "",
  content: [
    { id: `${article.id}-overview`, type: "heading", text: "Overview" },
    { id: `${article.id}-intro`, type: "paragraph", text: article.title ? `${article.title} helps readers complete this workflow in Troop Messenger.` : "" },
    { id: `${article.id}-steps`, type: "steps", steps: ["Open the relevant settings area.", "Review the available options.", "Save your changes."] }
  ]
});

const getArticleDraft = (article) => ({ ...makeDefaultArticleBody(article), ...ARTICLE_BODY_TEMPLATES[article.id], ...article });

const makeReviewerComments = (article) => {
  if (article.editorComments) return article.editorComments;
  if (!article.reviewerComment) return [];
  const parts = article.reviewerComment.split(/,\s+and\s+|;\s*/).filter(Boolean);
  return parts.map((text, index) => ({
    id: `${article.id}-comment-${index + 1}`,
    author: article.reviewerName || "Reviewer",
    text,
    blockId: index === 1 ? `${article.id}-b3` : null,
    resolved: false
  }));
};

const getMissingArticleRequirements = (article) => {
  const missing = [];
  if (!article.title?.trim()) missing.push("Title");
  if (!article.summary?.trim()) missing.push("Summary");
  if (!article.category || !article.section) missing.push("Category and section");
  if ((article.keywords || []).length < 3) missing.push("At least 3 keywords");
  if ((article.status === "under-revision" || article.hasRevision) && !article.changeNote?.trim()) missing.push("Change note");
  return missing;
};

const INITIAL_MOCK_DATA = {
  currentUser: { id: "u1", name: "Priya Menon", role: "author", initials: "PM" },
  articles: [
    { id: "a1", title: "Voice Message Recording in Browser", category: "Messaging & Chats", section: "Hands-Free & Transcription", status: "draft", hasRevision: false, ownerId: "u1", updatedAt: "2026-10-11T10:00:00Z", version: null, publishedAt: null, helpfulPercent: null, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a2", title: "Composer Settings", category: "Messaging & Chats", section: "Composer", status: "draft", hasRevision: false, ownerId: "u1", updatedAt: "2026-10-09T14:30:00Z", version: null, publishedAt: null, helpfulPercent: null, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a3", title: "Auto-populated Groups Membership", category: "Collaboration Groups", section: "Membership & Access", status: "changes-requested", hasRevision: false, ownerId: "u1", updatedAt: "2026-10-10T09:15:00Z", version: "3.2", publishedAt: null, helpfulPercent: null, openFeedbackCount: 0, reviewerName: "Arjun Rao", reviewerComment: "Add where the Airtime option appears for Basic users, and fix the heading in step 3.", reviewerCommentCount: 1 },
    { id: "a4", title: "Enable Airtime Mode for this Group", category: "Collaboration Groups", section: "Groups & Modes", status: "in-review", hasRevision: false, ownerId: "u1", updatedAt: "2026-10-10T17:18:00Z", version: "5.2", publishedAt: null, helpfulPercent: null, openFeedbackCount: 3, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a5", title: "Read Receipts Access", category: "Messaging & Chats", section: "Privacy", status: "published", hasRevision: false, ownerId: "u1", updatedAt: "2026-08-20T09:45:00Z", lastReviewedAt: "2026-08-20T09:45:00Z", nextReviewAt: "2026-09-19T09:45:00Z", reviewCycleDays: 30, reviewState: "overdue", version: "4.9", publishedAt: "2026-08-20T09:45:00Z", helpfulPercent: 79, openFeedbackCount: 1, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a6", title: "Create Regular Group", category: "Collaboration Groups", section: "Creation", status: "published", hasRevision: false, ownerId: "u1", updatedAt: "2026-09-24T11:00:00Z", lastReviewedAt: "2026-09-24T11:00:00Z", nextReviewAt: "2026-10-24T11:00:00Z", reviewCycleDays: 30, reviewState: "due-soon", version: "5.1", publishedAt: "2026-09-24T11:00:00Z", helpfulPercent: 91, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a7", title: "Schedule Message Delivery", category: "Messaging & Chats", section: "Advanced", status: "published", hasRevision: false, ownerId: "u1", updatedAt: "2026-09-02T13:20:00Z", lastReviewedAt: "2026-09-02T13:20:00Z", nextReviewAt: "2026-10-02T13:20:00Z", reviewCycleDays: 30, reviewState: "recheck-pending", version: "5.0", publishedAt: "2026-09-02T13:20:00Z", helpfulPercent: 88, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a8", title: "Set Chat History Access", category: "Admin Settings", section: "History", status: "published", hasRevision: false, ownerId: "u1", updatedAt: "2026-09-10T08:00:00Z", lastReviewedAt: "2026-09-10T08:00:00Z", nextReviewAt: "2026-12-09T08:00:00Z", reviewCycleDays: 90, reviewState: "ok", version: "5.0", publishedAt: "2026-09-10T08:00:00Z", helpfulPercent: 84, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a9", title: "Group Roles and Permissions", category: "Collaboration Groups", section: "Permissions", status: "under-revision", hasRevision: true, ownerId: "u1", updatedAt: "2026-10-11T14:00:00Z", lastReviewedAt: "2026-09-03T08:00:00Z", nextReviewAt: "2026-12-02T08:00:00Z", reviewCycleDays: 90, reviewState: "ok", version: "5.0", publishedAt: "2026-09-03T08:00:00Z", helpfulPercent: 86, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 }
  ],
  feedback: [
    { id: "f1", articleId: "a4", articleTitle: "Enable Airtime Mode for this Group", reason: "Out of date", text: "Screenshot shows the old group settings screen.", createdAt: "2026-10-11T12:00:00Z", status: "new" },
    { id: "f2", articleId: "a4", articleTitle: "Enable Airtime Mode for this Group", reason: "Incomplete", text: "Does not say how to turn it on for an existing group.", createdAt: "2026-10-11T14:30:00Z", status: "new" },
    { id: "f3", articleId: "a4", articleTitle: "Enable Airtime Mode for this Group", reason: "Hard to follow", text: "Too many group types in the overview.", createdAt: "2026-10-12T09:00:00Z", status: "new" }
  ],
  notifications: [
    { id: "n1", text: "Arjun Rao returned 'Auto-populated Groups Membership' with comments", createdAt: "2026-10-10T09:15:00Z", read: false },
    { id: "n2", text: "'Enable Airtime Mode for this Group' is now in review", createdAt: "2026-10-10T17:18:00Z", read: false },
    { id: "n3", text: "3 new feedback items on 'Enable Airtime Mode for this Group'", createdAt: "2026-10-12T09:05:00Z", read: false },
    { id: "n4", text: "Your re-check of 'Schedule Message Delivery' is waiting for admin approval", createdAt: "2026-10-11T16:00:00Z", read: false }
  ]
};

const MENU_CONFIG = {
  author: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'articles', label: 'My articles', icon: FileText, path: '/admin/articles', badgeKey: 'needsActionCount' },
    { id: 'returned', label: 'Returned by reviewer', icon: Undo2, path: '/admin/articles?status=changes-requested', badgeKey: 'returnedCount' },
    { id: 'feedback', label: 'Reader feedback', icon: MessageSquare, path: '/admin/feedback', badgeKey: 'feedbackCount' },
    { id: 'browse', label: 'Browse all articles', icon: BookOpen, path: '/admin/browse' }
  ],
  admin: []
};

const formatDate = (dateString) => {
  const d = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate().toString().padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const diffMs = CURRENT_DATE.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours > 0 ? `${diffHours} hour${diffHours > 1 ? 's' : ''} ago` : 'Just now';
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(dateString);
};

const AppContext = createContext();

const AppProvider = ({ children, initialRole = 'Author', onModeChange }) => {
  const [theme, setTheme] = useState('light');
  useEffect(() => {
    const saved = localStorage.getItem('tm-admin-theme');
    if (saved) { setTheme(saved); } 
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { setTheme('dark'); }
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tm-admin-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [role, setRoleState] = useState(initialRole);
  const setRole = (nextRole) => {
    if (nextRole === 'Reader') {
      onModeChange?.('reader');
      return;
    }
    setRoleState(nextRole);
  };
  const [data, setData] = useState(INITIAL_MOCK_DATA);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Shared computed counts
  const returnedCount = data.articles.filter(a => a.status === 'changes-requested').length;
  const draftCount = data.articles.filter(a => a.status === 'draft').length;
  const inReviewCount = data.articles.filter(a => a.status === 'in-review').length;
  const overdueCount = data.articles.filter(a => (a.status === 'published' || a.hasRevision) && a.reviewState === 'overdue').length;
  const needsActionCount = returnedCount + overdueCount;
  const feedbackCount = data.feedback.length;

  const addArticle = (newArticle) => {
    setData(prev => ({ ...prev, articles: [newArticle, ...prev.articles] }));
  };
  
  const updateArticle = (id, updates) => {
    setData(prev => ({
      ...prev,
      articles: prev.articles.map(a => a.id === id ? { ...a, ...updates, updatedAt: CURRENT_DATE.toISOString() } : a)
    }));
  };

  const deleteArticle = (id) => {
    setData(prev => ({ ...prev, articles: prev.articles.filter(a => a.id !== id) }));
  };

  const value = {
    theme, toggleTheme, role, setRole, data, showToast, toastMsg,
    addArticle, updateArticle, deleteArticle,
    badges: { needsActionCount, returnedCount, feedbackCount, draftCount, inReviewCount }
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
const useApp = () => useContext(AppContext);

const Button = React.forwardRef(({ variant = 'primary', size, icon: Icon, children, className = '', ...props }, ref) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const iconClass = children ? '' : 'btn-icon';
  return (
    <button ref={ref} className={`${baseClass} ${variantClass} ${iconClass} ${className}`} {...props}>
      {Icon && <Icon size={16} strokeWidth={1.75} />}
      {children}
    </button>
  );
});

const StatusPill = ({ status }) => {
  const config = {
    'draft': { label: 'DRAFT', bg: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-strong)' },
    'in-review': { label: 'IN REVIEW', bg: 'var(--teal-soft)', color: 'var(--teal-text)' },
    'changes-requested': { label: 'CHANGES REQUESTED', bg: 'var(--red-soft)', color: 'var(--red-text)' },
    'approved': { label: 'APPROVED', bg: 'var(--pill-approved-bg)', color: '#FFF' }, 
    'published': { label: 'PUBLISHED', bg: 'var(--pill-published-bg)', color: '#FFF' },
    'under-revision': { label: 'UNDER REVISION', bg: 'transparent', color: 'var(--amber-text)', border: '1px solid var(--amber)' },
    'retired': { label: 'RETIRED', bg: 'var(--surface-2)', color: 'var(--text-faint)' }
  };
  
  const styleConf = config[status] || config['draft'];
  
  return (
    <span style={{ background: styleConf.bg, color: styleConf.color, border: styleConf.border || 'none', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px', display: 'inline-block', lineHeight: 1, whiteSpace: 'nowrap' }}>
      {styleConf.label}
    </span>
  );
};

const ReasonChip = ({ reason }) => {
  const isWarning = reason === 'Out of date' || reason === 'Incorrect';
  return <span className={isWarning ? 'chip-amber' : 'chip-reason'}>{reason}</span>;
};

const ReviewChip = ({ state, dateStr, cycleDays }) => {
  if (state === 'ok') return <span className="text-meta text-text">{formatDate(dateStr)}</span>;
  if (state === 'recheck-pending') return <Tooltip text={`Reviewed every ${cycleDays} days`}><span className="chip-reason">Re-check pending</span></Tooltip>;
  
  const diffMs = new Date(dateStr).getTime() - CURRENT_DATE.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  const className = state === 'overdue' ? 'chip-red' : 'chip-amber';
  const text = state === 'overdue' ? `Overdue ${Math.abs(diffDays)} days` : `Due in ${diffDays} days`;

  return (
    <Tooltip text={`Reviewed every ${cycleDays} days`}>
      <span className={className}>{text}</span>
    </Tooltip>
  );
};

const Card = ({ children, className = '', clickable, ...props }) => (
  <div className={`card ${clickable ? 'card-clickable' : ''} ${className}`} {...props}>{children}</div>
);

const Badge = ({ count }) => count > 0 ? <span className="badge" aria-label={`${count} items`}>{count}</span> : null;

const Tooltip = ({ children, text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show && <div className="tooltip-bubble" style={{ bottom: '100%', marginBottom: '8px' }}>{text}</div>}
    </div>
  );
};

const Skeleton = ({ className = '', style }) => <div className={`skeleton ${className}`} style={style} />;

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-32 text-center" style={{ height: '100%', width: '100%' }}>
    {Icon && (
      <div style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
        <Icon size={24} color="var(--text-muted)" strokeWidth={1.5} />
      </div>
    )}
    <h3 className="text-panel-title text-text mb-4">{title}</h3>
    <p className="text-muted mb-16">{description}</p>
    {action && <div>{action}</div>}
  </div>
);

const Dialog = ({ isOpen, onClose, title, subtitle, children }) => {
  const overlayRef = useRef(null);
  
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="dialog-overlay" 
      ref={overlayRef} 
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog" aria-modal="true" aria-labelledby="dialog-title"
    >
      <div className="dialog-content focus-trap" tabIndex="-1">
        <div className="flex justify-between items-start mb-16">
          <div>
            <h2 id="dialog-title" className="text-panel-title text-text mb-4">{title}</h2>
            {subtitle && <p className="text-muted">{subtitle}</p>}
          </div>
          <button className="btn-icon" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

const DropdownMenu = ({ trigger, items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
        {trigger}
      </div>
      {isOpen && (
        <div className="dropdown-menu">
          {items.map((item, i) => item ? (
            <button key={i} className="dropdown-item" onClick={(e) => { e.stopPropagation(); setIsOpen(false); item.onClick(); }} style={item.destructive ? { color: 'var(--red-text)' } : {}}>
              {item.icon && <item.icon size={16} strokeWidth={1.75} />}
              {item.label}
            </button>
          ) : null)}
        </div>
      )}
    </div>
  );
};

const Topbar = ({ onMenuClick }) => {
  const { theme, toggleTheme, role, setRole, data } = useApp();
  const [search, setSearch] = useState('');
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const searchResults = useMemo(() => {
    if (!search) return [];
    return data.articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
  }, [search, data.articles]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) { e.preventDefault(); searchInputRef.current?.focus(); }
      if (e.key === 'Escape') { setShowSearchDrop(false); setShowNotifs(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && search) {
      navigate(`/admin/articles?q=${encodeURIComponent(search)}`);
      setShowSearchDrop(false); setSearch('');
    }
  };

  const unreadNotifs = data.notifications.filter(n => !n.read).length;

  return (
    <header className="topbar" aria-label="Global Header">
      <div className="flex items-center gap-16">
        <button className="hide-desktop" style={{ color: 'inherit' }} onClick={onMenuClick} aria-label="Menu"><Menu size={20} /></button>
        <div className="flex items-center gap-12">
          <div style={{ width: 28, height: 28, background: 'var(--amber)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--navy)', fontWeight: 'bold' }}>T</div>
          <span className="font-heading hide-mobile" style={{ fontSize: 16 }}>Troop Messenger</span>
          <div className="hide-mobile" style={{ width: 1, height: 16, background: 'var(--border-strong)', opacity: 0.5 }} />
          <span className="font-heading text-faint hide-mobile" style={{ fontSize: 14 }}>Knowledge Admin</span>
        </div>
      </div>

      <div className="flex items-center gap-16">
        <div className="relative hide-mobile" style={{ width: 240 }}>
          <Search size={14} className="absolute" style={{ left: 10, top: 11, color: 'rgba(255,255,255,0.6)' }} />
          <input ref={searchInputRef} type="text" className="input-base" style={{ paddingLeft: 32, paddingRight: 24, background: 'rgba(255,255,255,0.1)', color: '#FFF', borderColor: 'transparent' }} placeholder="Search my articles..." value={search} onChange={(e) => { setSearch(e.target.value); setShowSearchDrop(true); }} onFocus={() => setShowSearchDrop(true)} onBlur={() => setTimeout(() => setShowSearchDrop(false), 200)} onKeyDown={handleSearchSubmit} />
          <span className="absolute" style={{ right: 8, top: 10, fontSize: 10, border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '0 4px', borderRadius: 4 }}>/</span>
          {showSearchDrop && search && (
            <div className="absolute" style={{ top: '100%', left: 0, right: 0, marginTop: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', zIndex: 100 }}>
              {searchResults.length > 0 ? searchResults.map(res => (
                <div key={res.id} className="flex flex-col gap-4" style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }} onClick={() => navigate(`/admin/articles/${res.id}`)}>
                  <div className="text-ui-label text-text truncate">{res.title}</div>
                  <div><StatusPill status={res.status} hasRevision={res.hasRevision} /></div>
                </div>
              )) : <div style={{ padding: '12px', color: 'var(--text-muted)' }}>No matches</div>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-8">
          <select value={role} onChange={e => setRole(e.target.value)} style={{ background: 'transparent', color: 'inherit', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }} className="hide-mobile" aria-label="Role">
            <option value="Reader" style={{color:'black'}}>Reader Mode</option>
            <option value="Author" style={{color:'black'}}>Author Mode</option>
            <option value="Admin/Reviewer" style={{color:'black'}}>Admin/Reviewer Mode</option>
          </select>
          <Tooltip text={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}>
            <button className="btn-icon" onClick={toggleTheme} style={{ color: 'inherit' }} aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}>
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </Tooltip>
          <div className="relative">
            <button className="btn-icon" style={{ color: 'inherit' }} onClick={() => setShowNotifs(!showNotifs)}>
              <Bell size={18} />
              {unreadNotifs > 0 && <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: 'var(--amber)', borderRadius: '50%' }} />}
            </button>
            {showNotifs && (
              <div className="absolute" style={{ top: '100%', right: 0, width: 300, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)', zIndex: 100, marginTop: 4 }}>
                <div className="flex justify-between items-center" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                  <span className="text-panel-title text-text">Notifications</span>
                  <button className="btn-text text-amber" style={{ fontSize: 12 }}>Mark all read</button>
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {data.notifications.map(n => (
                    <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'var(--surface-2)' }}>
                      <p className="text-body text-text mb-4" style={{ fontSize: 13 }}>{n.text}</p>
                      <p className="text-meta text-faint">{getRelativeTime(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-8 ml-8">
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--surface)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{data.currentUser.initials}</div>
            <span className="text-ui-label hide-mobile text-on-navy">{data.currentUser.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const Sidebar = ({ isOpen, setOpen }) => {
  const location = useLocation();
  const { badges, data, showToast } = useApp();

  return (
    <>
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <nav className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Admin">
        <div className="flex flex-col" style={{ flex: 1, padding: '16px 0' }}>
          {MENU_CONFIG.author.map((item) => {
            // Precise active matching
            let isActive = false;
            if (item.path === '/admin/dashboard' && (location.pathname === '/admin/dashboard' || location.pathname === '/admin' || location.pathname === '/')) { isActive = true; }
            else if (item.path === '/admin/articles' && location.pathname === '/admin/articles' && !location.search.includes('status=changes-requested')) { isActive = true; }
            else if (item.path.includes('status=changes-requested') && location.pathname === '/admin/articles' && location.search.includes('status=changes-requested')) { isActive = true; }
            else if (item.path === location.pathname && !item.path.includes('articles')) { isActive = true; }

            return (
              <Link key={item.id} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`} aria-current={isActive ? 'page' : undefined} onClick={() => setOpen(false)}>
                <item.icon size={18} strokeWidth={isActive ? 2 : 1.75} style={{ flexShrink: 0 }} />
                <span className="nav-label truncate" style={{ flex: 1 }}>{item.label}</span>
                {item.badgeKey && badges[item.badgeKey] > 0 && <Badge count={badges[item.badgeKey]} />}
              </Link>
            );
          })}
        </div>
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost w-full justify-between" onClick={() => showToast("Public Help Center opens in the live site")}>
            <span className="nav-label text-text">Help Center</span>
            <ExternalLink size={14} className="text-faint" />
          </button>
          <div className="mt-16 flex flex-col gap-4 sidebar-footer-text">
            <span className="text-ui-label text-text">{data.currentUser.name}</span>
            <span className="text-meta text-faint uppercase" style={{ fontSize: 11 }}>{data.currentUser.role}</span>
          </div>
        </div>
      </nav>
    </>
  );
};

const ComingNext = () => {
  const { role, setRole } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  if (role !== 'Author') {
    return (
      <div className="page-container">
        <h1 className="text-display text-text">Mode: {role}</h1>
        <Card className="flex-col items-center justify-center text-center py-48">
          <Info size={32} className="text-amber mb-16" />
          <h2 className="text-panel-title text-text mb-8">This view is built in a later step.</h2>
          <p className="text-muted mb-24">Only the Author role dashboard is implemented currently.</p>
          <Button onClick={() => { setRole('Author'); navigate('/admin/dashboard'); }}>Switch back to Author</Button>
        </Card>
      </div>
    );
  }
  const routeName = location.pathname.split('/').pop().replace('-', ' ');
  return (
    <div className="page-container">
      <h1 className="text-display text-text" style={{ textTransform: 'capitalize' }}>{routeName}</h1>
      <Card className="mt-16"><EmptyState icon={LayoutDashboard} title="This page is built in the next step" description={`The ${routeName} view is part of an upcoming release.`} action={<Button onClick={() => navigate('/admin/dashboard')}>Back to dashboard</Button>} /></Card>
    </div>
  );
};

const renderArticleBlock = (block) => {
  if (block.type === "heading") return <h2 key={block.id}>{block.text}</h2>;
  if (block.type === "bullet") return <ul key={block.id}><li>{block.text}</li></ul>;
  if (block.type === "steps") return <ol key={block.id}>{(block.steps || []).map((step, i) => <li key={i}>{step}</li>)}</ol>;
  if (block.type === "callout") return <div key={block.id} className="article-callout">{block.text}</div>;
  return <p key={block.id}>{block.text}</p>;
};

const ArticleEditor = () => {
  const { data, updateArticle, showToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.pathname.split('/').pop();
  const sourceArticle = data.articles.find(a => a.id === id);
  const [activeTab, setActiveTab] = useState('checklist');
  const [keywordInput, setKeywordInput] = useState('');

  const initialDraft = useMemo(() => {
    if (!sourceArticle) return null;
    const draft = getArticleDraft(sourceArticle);
    return {
      ...draft,
      editorComments: makeReviewerComments(sourceArticle),
      readerFeedback: data.feedback.filter(f => f.articleId === sourceArticle.id)
    };
  }, [sourceArticle, data.feedback]);

  const [article, setArticle] = useState(initialDraft);

  useEffect(() => {
    setArticle(initialDraft);
  }, [initialDraft]);

  if (!article) return <div className="page-container"><EmptyState title="Article not found" action={<Button onClick={() => navigate('/admin/articles')}>Back to My articles</Button>} /></div>;

  const isReadOnly = article.status === 'in-review' || article.status === 'published';
  const isReturned = article.status === 'changes-requested';
  const isRevision = article.status === 'under-revision' || article.hasRevision;
  const missing = getMissingArticleRequirements(article);
  const openComments = (article.editorComments || []).filter(c => !c.resolved);

  const patchArticle = (updates) => setArticle(prev => ({ ...prev, ...updates }));
  const patchBlock = (blockId, updates) => {
    patchArticle({ content: article.content.map(block => block.id === blockId ? { ...block, ...updates } : block) });
  };
  const patchStep = (blockId, index, value) => {
    patchArticle({
      content: article.content.map(block => {
        if (block.id !== blockId) return block;
        const steps = [...(block.steps || [])];
        steps[index] = value;
        return { ...block, steps };
      })
    });
  };

  const persistArticle = (updates = {}) => {
    const next = { ...article, ...updates };
    setArticle(next);
    updateArticle(article.id, {
      title: next.title,
      category: next.category,
      section: next.section,
      status: next.status,
      hasRevision: next.hasRevision,
      summary: next.summary,
      keywords: next.keywords,
      changeNote: next.changeNote,
      content: next.content,
      editorComments: next.editorComments,
      submittedAt: next.submittedAt
    });
    return next;
  };

  const handleSave = () => {
    persistArticle();
    showToast(isRevision ? 'Revision saved' : 'Draft saved');
  };

  const handleSubmit = () => {
    if (missing.length > 0) {
      setActiveTab(isReturned ? 'comments' : 'checklist');
      showToast('Finish required items before submitting');
      return;
    }
    if (openComments.length > 0 && !window.confirm(`${openComments.length} reviewer comment${openComments.length > 1 ? 's are' : ' is'} still open. Submit anyway?`)) return;
    persistArticle({ status: 'in-review', submittedAt: CURRENT_DATE.toISOString() });
    showToast(isReturned ? 'Fixes sent back to reviewer' : 'Submitted for review');
  };

  const handleStartRevision = () => {
    persistArticle({ status: 'under-revision', hasRevision: true, changeNote: article.changeNote || 'Updated this article for the current product flow.' });
    showToast('Revision started. The live article stays online.');
  };

  const handleDiscardRevision = () => {
    if (!window.confirm('Discard this revision? The published article stays live.')) return;
    persistArticle({ status: 'published', hasRevision: false });
    showToast('Revision discarded');
  };

  const addKeyword = () => {
    const value = keywordInput.trim().toLowerCase();
    if (!value || article.keywords.includes(value)) return;
    patchArticle({ keywords: [...article.keywords, value] });
    setKeywordInput('');
  };

  const toggleComment = (commentId) => {
    patchArticle({
      editorComments: article.editorComments.map(comment => (
        comment.id === commentId ? { ...comment, resolved: !comment.resolved } : comment
      ))
    });
  };

  return (
    <div className="editor-shell">
      <header className="editor-header">
        <div className="flex items-center justify-between gap-16 flex-wrap">
          <div className="flex items-center gap-16" style={{ minWidth: 0 }}>
            <button onClick={() => { persistArticle(); navigate('/admin/articles'); }} className="btn-text flex items-center gap-8" style={{ padding: 0 }}>
              <ChevronLeft size={16} /> My articles
            </button>
            <div className="flex-col gap-4" style={{ minWidth: 0 }}>
              <div className="flex items-center gap-12 flex-wrap">
                <h1 className="text-panel-title text-text truncate">{article.title || 'Untitled article'}</h1>
                <StatusPill status={article.status} />
                {article.status === 'in-review' && <span className="chip-reason flex items-center gap-4"><Lock size={12}/> Read-only</span>}
              </div>
              <span className="text-meta text-muted truncate">{article.category} &gt; {article.section}</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            {isReadOnly && article.status === 'published' && <Button variant="ghost" icon={Edit3} onClick={handleStartRevision}>Edit</Button>}
            {!isReadOnly && <Button variant="ghost" icon={Save} onClick={handleSave}>Save</Button>}
            {!isReadOnly && isRevision && <Button variant="ghost" icon={RotateCcw} onClick={handleDiscardRevision}>Discard</Button>}
            {!isReadOnly && <Button icon={Send} onClick={handleSubmit}>{isReturned ? 'Resubmit' : 'Submit for review'}</Button>}
          </div>
        </div>
      </header>

      <div className="editor-grid">
        <main className="editor-canvas">
          {isReturned && (
            <div className="article-callout" style={{ marginTop: 0 }}>
              <div className="flex items-center gap-8" style={{ color: 'var(--amber-text)' }}>
                <AlertTriangle size={16} />
                <strong>{article.reviewerName || 'Reviewer'} requested changes</strong>
              </div>
              <div style={{ marginTop: 6 }}>{openComments.length} open comment{openComments.length === 1 ? '' : 's'} remaining.</div>
            </div>
          )}

          {article.status === 'in-review' && (
            <div className="article-callout" style={{ marginTop: 0, borderLeftColor: 'var(--teal)', background: 'var(--teal-soft)', color: 'var(--teal-text)' }}>
              This article is locked while it is with the reviewer. You can view the draft, but editing is disabled.
            </div>
          )}

          {article.status === 'published' && (
            <div className="article-callout" style={{ marginTop: 0, borderLeftColor: 'var(--teal)', background: 'var(--teal-soft)', color: 'var(--teal-text)' }}>
              You are viewing the live article. Click Edit to start a revision.
            </div>
          )}

          {isReadOnly ? (
            <>
              <div className="text-meta text-muted mb-8">{article.category} &gt; {article.section}</div>
              <h1 className="text-display text-text mb-16">{article.title}</h1>
              <p className="text-muted mb-24" style={{ fontSize: 16, lineHeight: 1.6 }}>{article.summary}</p>
              {article.changeNote && <div className="article-callout"><strong>Changed:</strong> {article.changeNote}</div>}
              <div className="article-preview">{article.content.map(renderArticleBlock)}</div>
            </>
          ) : (
            <>
              <div className="editor-field">
                <label className="label-base" htmlFor="editor-title">Title</label>
                <textarea id="editor-title" className="input-base editor-title-input" value={article.title} maxLength={120} onChange={e => patchArticle({ title: e.target.value })} />
              </div>
              <div className="editor-field">
                <label className="label-base" htmlFor="editor-summary">Summary</label>
                <textarea id="editor-summary" className="input-base" rows={3} value={article.summary || ''} placeholder="Short reader-facing summary" onChange={e => patchArticle({ summary: e.target.value })} />
              </div>
              {(isRevision || article.changeNote) && (
                <div className="editor-field">
                  <label className="label-base" htmlFor="editor-change-note">Change note</label>
                  <textarea id="editor-change-note" className="input-base" rows={2} maxLength={160} value={article.changeNote || ''} placeholder="What changed in this version?" onChange={e => patchArticle({ changeNote: e.target.value })} />
                </div>
              )}
              {article.content.map((block, blockIndex) => (
                <div key={block.id} className="editor-block">
                  <div className="editor-block-label">
                    <span>{block.type === 'steps' ? 'Steps' : block.type}</span>
                    {block.type !== 'heading' && block.type !== 'steps' && <button className="btn-text" onClick={() => patchArticle({ content: article.content.filter(item => item.id !== block.id) })}>Remove</button>}
                  </div>
                  {block.type === 'steps' ? (
                    <div className="flex-col gap-8">
                      {(block.steps || []).map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-8">
                          <span className="chip-reason">{stepIndex + 1}</span>
                          <input className="input-base" value={step} onChange={e => patchStep(block.id, stepIndex, e.target.value)} />
                        </div>
                      ))}
                      <Button variant="ghost" icon={Plus} onClick={() => patchBlock(block.id, { steps: [...(block.steps || []), ''] })}>Add step</Button>
                    </div>
                  ) : (
                    <textarea className="input-base" rows={block.type === 'heading' ? 1 : 3} value={block.text || ''} onChange={e => patchBlock(block.id, { text: e.target.value })} />
                  )}
                </div>
              ))}
              <div className="flex gap-8 flex-wrap mt-16">
                <Button variant="ghost" icon={Plus} onClick={() => patchArticle({ content: [...article.content, { id: `${article.id}-p-${Date.now()}`, type: 'paragraph', text: '' }] })}>Paragraph</Button>
                <Button variant="ghost" icon={Plus} onClick={() => patchArticle({ content: [...article.content, { id: `${article.id}-h-${Date.now()}`, type: 'heading', text: '' }] })}>Heading</Button>
                <Button variant="ghost" icon={Plus} onClick={() => patchArticle({ content: [...article.content, { id: `${article.id}-s-${Date.now()}`, type: 'steps', steps: [''] }] })}>Steps</Button>
                <Button variant="ghost" icon={Plus} onClick={() => patchArticle({ content: [...article.content, { id: `${article.id}-c-${Date.now()}`, type: 'callout', text: '' }] })}>Callout</Button>
              </div>
            </>
          )}
        </main>

        <aside className="editor-panel">
          <div className="editor-tabs">
            {['checklist', 'details', 'search', 'comments'].map(tab => (
              <button key={tab} className={`editor-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>
          {activeTab === 'checklist' && (
            <div className="panel-section">
              <div className="flex items-center gap-8 mb-12"><ListChecks size={16} /><h2 className="text-panel-title text-text">Ready to submit</h2></div>
              {missing.length === 0 ? <p className="text-muted">All required fields are complete.</p> : missing.map(item => (
                <div key={item} className="flex items-center gap-8 mb-8 text-amber"><AlertTriangle size={14} />{item} is required</div>
              ))}
            </div>
          )}
          {activeTab === 'details' && (
            <div className="panel-section">
              <div className="editor-field">
                <label className="label-base">Category</label>
                <select className="input-base" value={article.category} disabled={isReadOnly} onChange={e => patchArticle({ category: e.target.value, section: CATEGORIES[e.target.value]?.[0] || '' })}>
                  {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="editor-field">
                <label className="label-base">Section</label>
                <select className="input-base" value={article.section} disabled={isReadOnly} onChange={e => patchArticle({ section: e.target.value })}>
                  {(CATEGORIES[article.category] || [article.section]).map(section => <option key={section} value={section}>{section}</option>)}
                </select>
              </div>
              <div className="editor-field">
                <label className="label-base">Version</label>
                <input className="input-base" value={article.version || 'Unpublished'} disabled />
              </div>
            </div>
          )}
          {activeTab === 'search' && (
            <div className="panel-section">
              <div className="flex items-center gap-8 mb-12"><Hash size={16} /><h2 className="text-panel-title text-text">Keywords</h2></div>
              <div className="chip-list mb-12">
                {(article.keywords || []).map(keyword => (
                  <span key={keyword} className="chip-edit">
                    {keyword}
                    {!isReadOnly && <button onClick={() => patchArticle({ keywords: article.keywords.filter(k => k !== keyword) })} aria-label={`Remove ${keyword}`}><X size={12} /></button>}
                  </span>
                ))}
              </div>
              {!isReadOnly && (
                <div className="flex gap-8">
                  <input className="input-base" value={keywordInput} placeholder="Add keyword" onChange={e => setKeywordInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addKeyword(); }} />
                  <Button variant="ghost" onClick={addKeyword}>Add</Button>
                </div>
              )}
              <div className="mt-16">
                <div className="text-meta text-muted mb-4">Search preview</div>
                <div className="comment-card" style={{ borderLeftColor: 'var(--teal)' }}>
                  <div className="text-ui-label text-text">{article.title}</div>
                  <p className="text-muted line-clamp-2">{article.summary || 'No summary yet.'}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'comments' && (
            <div className="panel-section">
              <div className="flex items-center gap-8 mb-12"><MessageSquare size={16} /><h2 className="text-panel-title text-text">Reviewer comments</h2></div>
              {article.editorComments?.length ? article.editorComments.map(comment => (
                <div key={comment.id} className={`comment-card ${comment.resolved ? 'resolved' : ''}`}>
                  <div className="flex justify-between items-center mb-8">
                    <strong>{comment.author}</strong>
                    <span className={comment.resolved ? 'chip-reason' : 'chip-amber'}>{comment.resolved ? 'Resolved' : 'Open'}</span>
                  </div>
                  <p className="text-muted mb-12">{comment.text}</p>
                  {!isReadOnly && <Button variant="ghost" onClick={() => toggleComment(comment.id)}>{comment.resolved ? 'Reopen' : 'Resolve'}</Button>}
                </div>
              )) : <p className="text-muted">No reviewer comments.</p>}
            </div>
          )}
          {article.readerFeedback?.length > 0 && (
            <div className="panel-section">
              <h2 className="text-panel-title text-text mb-12">Reader feedback</h2>
              {article.readerFeedback.map(item => (
                <div key={item.id} className="comment-card">
                  <span className="chip-reason">{item.reason}</span>
                  <p className="text-muted mt-8">"{item.text}"</p>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

const NewArticleDialog = ({ isOpen, onClose }) => {
  const { data, addArticle, showToast } = useApp();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [section, setSection] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) { setTitle(''); setCategory(''); setSection(''); setErrors({}); }
  }, [isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Enter a title";
    else if (data.articles.some(a => a.title.toLowerCase() === title.trim().toLowerCase() && a.category === category && a.section === section)) {
      newErrors.title = "An article with this title already exists in this section";
    }
    if (!category) newErrors.category = "Choose a category";
    if (!section) newErrors.section = "Choose a section";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;
    const newId = `a${Date.now()}`;
    addArticle({
      id: newId, title: title.trim(), category, section, status: "draft", hasRevision: false,
      ownerId: "u1", updatedAt: CURRENT_DATE.toISOString(), version: null, publishedAt: null,
      helpfulPercent: null, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0
    });
    onClose();
    showToast("Draft created");
    navigate(`/admin/articles/${newId}`);
  };

  const isValid = title.trim() && category && section;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="New article" subtitle="Start with the basics. You can change everything later.">
      <div className="flex flex-col gap-24 mt-16">
        <div>
          <label className="label-base" htmlFor="articleTitle">Title</label>
          <input id="articleTitle" type="text" className={`input-base ${errors.title ? 'error' : ''}`} placeholder="E.g., How to schedule messages" maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => { if(title) validate(); }} autoFocus />
          <div className="flex justify-between items-center mt-4">
            {errors.title ? <span className="error-text">{errors.title}</span> : <span></span>}
            <span className="text-meta" style={{ color: title.length === 120 ? 'var(--amber-text)' : 'var(--text-faint)' }}>{title.length}/120</span>
          </div>
        </div>
        <div>
          <label className="label-base" htmlFor="articleCategory">Category</label>
          <select id="articleCategory" className={`input-base ${errors.category ? 'error' : ''}`} value={category} onChange={(e) => { setCategory(e.target.value); setSection(''); }} onBlur={() => { if(category) validate(); }}>
            <option value="" disabled>Select category</option>
            {Object.keys(CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>
        <div>
          <label className="label-base" htmlFor="articleSection">Section</label>
          <select id="articleSection" className={`input-base ${errors.section ? 'error' : ''}`} value={section} onChange={(e) => setSection(e.target.value)} disabled={!category} onBlur={() => { if(section) validate(); }}>
            <option value="" disabled>Select section</option>
            {category && CATEGORIES[category].map(sec => <option key={sec} value={sec}>{sec}</option>)}
          </select>
          {errors.section && <span className="error-text">{errors.section}</span>}
        </div>
        <div className="flex justify-end gap-12 mt-8">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!isValid}>Create draft</Button>
        </div>
      </div>
    </Dialog>
  );
};

const MyArticles = () => {
  const { data, showToast, updateArticle, deleteArticle } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile filter sheet

  useEffect(() => {
    if (searchParams.get('new') === 'true') { setIsNewDialogOpen(true); searchParams.delete('new'); setSearchParams(searchParams, {replace:true}); }
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [searchParams]);

  // URL State
  const statusTab = searchParams.get('status') || 'all';
  const query = searchParams.get('q') || '';
  const categoryFilter = searchParams.get('category') || 'All';
  const sortFilter = searchParams.get('sort') || 'needs-attention';
  const dueOnly = searchParams.get('due') === '1';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const perPage = 10;

  const setParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value); else newParams.delete(key);
    newParams.delete('page'); // Reset page on filter change
    setSearchParams(newParams);
  };
  const clearFilters = () => setSearchParams(new URLSearchParams({ status: statusTab }));

  // Tab counts (unfiltered by search/category)
  const tabCounts = useMemo(() => {
    const c = { all: data.articles.length, drafts: 0, returned: 0, inReview: 0, published: 0, underRevision: 0 };
    data.articles.forEach(a => {
      if (a.status === 'draft') c.drafts++;
      if (a.status === 'changes-requested') c.returned++;
      if (a.status === 'in-review') c.inReview++;
      if (a.status === 'published') {
        c.published++;
      }
      if (a.status === 'under-revision' || a.hasRevision) c.underRevision++;
    });
    return c;
  }, [data.articles]);

  // Derived filtering
  const filteredArticles = useMemo(() => {
    let result = data.articles;
    // Status Filter
    if (statusTab !== 'all') {
      if (statusTab === 'draft') result = result.filter(a => a.status === 'draft');
      else if (statusTab === 'changes-requested') result = result.filter(a => a.status === 'changes-requested');
      else if (statusTab === 'in-review') result = result.filter(a => a.status === 'in-review');
      else if (statusTab === 'published') result = result.filter(a => a.status === 'published');
      else if (statusTab === 'under-revision') result = result.filter(a => a.status === 'under-revision' || a.hasRevision);
    }
    // Search & Category
    if (query) result = result.filter(a => a.title.toLowerCase().includes(query.toLowerCase()));
    if (categoryFilter !== 'All') result = result.filter(a => a.category === categoryFilter);
    // Due only
    if (dueOnly) result = result.filter(a => a.reviewState === 'due-soon' || a.reviewState === 'overdue');
    
    // Sort
    result = [...result].sort((a, b) => {
      if (sortFilter === 'needs-attention') {
        const order = { 'changes-requested': 1, 'draft': 5, 'in-review': 4, 'under-revision': 6, 'published': 6 };
        let aVal = order[a.status]; let bVal = order[b.status];
        if ((a.status === 'published' || a.hasRevision) && a.reviewState === 'overdue') aVal = 2;
        if ((a.status === 'published' || a.hasRevision) && a.reviewState === 'due-soon') aVal = 3;
        if ((b.status === 'published' || b.hasRevision) && b.reviewState === 'overdue') bVal = 2;
        if ((b.status === 'published' || b.hasRevision) && b.reviewState === 'due-soon') bVal = 3;
        if (aVal !== bVal) return aVal - bVal;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      if (sortFilter === 'last-edited') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortFilter === 'title-a-z') return a.title.localeCompare(b.title);
      if (sortFilter === 'next-review') {
        if (!a.nextReviewAt && !b.nextReviewAt) return 0;
        if (!a.nextReviewAt) return 1; if (!b.nextReviewAt) return -1;
        return new Date(a.nextReviewAt) - new Date(b.nextReviewAt);
      }
      return 0;
    });
    return result;
  }, [data.articles, statusTab, query, categoryFilter, sortFilter, dueOnly]);

  const totalPages = Math.ceil(filteredArticles.length / perPage);
  const paginatedArticles = filteredArticles.slice((page - 1) * perPage, page * perPage);

  const availableCategories = ['All', ...Array.from(new Set(data.articles.map(a => a.category)))];
  const hasActiveFilters = query || categoryFilter !== 'All' || sortFilter !== 'needs-attention' || dueOnly;

  // Actions
  const handleConfirmAccurate = (a) => {
    if (window.confirm("Send a re-check request to the admin? The article stays live until it is approved.")) {
      updateArticle(a.id, { reviewState: 'recheck-pending' });
      showToast("Re-check sent to admin");
    }
  };
  const handleDeleteDraft = (a) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      deleteArticle(a.id);
      showToast("Draft deleted");
    }
  };
  const handleDiscardRevision = (a) => {
    if (window.confirm("Discard revision? The published version will remain live.")) {
      updateArticle(a.id, { hasRevision: false, status: 'published' });
      showToast("Revision discarded");
    }
  };
  const handleEdit = (a) => {
    updateArticle(a.id, { hasRevision: true, status: 'under-revision', updatedAt: CURRENT_DATE.toISOString() });
    navigate(`/admin/articles/${a.id}`);
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Drafts', count: tabCounts.drafts },
    { id: 'changes-requested', label: 'Returned', count: tabCounts.returned, isWarning: tabCounts.returned > 0 },
    { id: 'in-review', label: 'In review', count: tabCounts.inReview },
    { id: 'published', label: 'Published', count: tabCounts.published },
    { id: 'under-revision', label: 'Under revision', count: tabCounts.underRevision }
  ];

  if (data.articles.length === 0 && !loading) {
    return (
      <div className="page-container">
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-display text-text">My articles</h1>
          <Button icon={Plus} onClick={() => setIsNewDialogOpen(true)}>New article</Button>
        </div>
        <Card className="flex-1 min-h-[500px]">
          <EmptyState title="No articles yet. Start your first one." action={<Button icon={Plus} onClick={() => setIsNewDialogOpen(true)}>New article</Button>} />
        </Card>
        <NewArticleDialog isOpen={isNewDialogOpen} onClose={() => setIsNewDialogOpen(false)} />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 gap-16 flex-wrap">
        <div>
          <h1 className="text-display text-text">My articles</h1>
          <span className="text-muted">{data.articles.length} total articles</span>
        </div>
        <Button icon={Plus} onClick={() => setIsNewDialogOpen(true)}>New article</Button>
      </div>

      <Card style={{ padding: 0 }} className="flex-1">
        {/* Tabs */}
        <div className="tabs-list" role="tablist">
          {tabs.map(t => (
            <div key={t.id} role="tab" aria-selected={statusTab === t.id} className={`tab-item ${statusTab === t.id ? 'active' : ''}`} onClick={() => setParam('status', t.id === 'all' ? '' : t.id)}>
              {t.label}
              {t.count !== undefined && (
                <span style={{ marginLeft: 8, background: t.isWarning ? 'var(--amber)' : 'var(--surface-2)', color: t.isWarning ? 'var(--navy)' : 'var(--text-muted)', padding: '2px 6px', borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{t.count}</span>
              )}
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex justify-between items-center gap-16 flex-wrap hide-mobile" style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center gap-16 flex-wrap w-full">
            <div className="relative flex-1" style={{ minWidth: 280, maxWidth: 400 }}>
              <Search size={14} className="absolute text-muted" style={{ left: 10, top: 11 }} />
              <input type="text" className="input-base" style={{ paddingLeft: 32 }} placeholder="Search by title or keyword" value={query} onChange={(e) => setParam('q', e.target.value)} />
            </div>
            <select className="input-base" style={{ width: 180 }} value={categoryFilter} onChange={(e) => setParam('category', e.target.value)}>
              {availableCategories.map(c => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
            </select>
            <select className="input-base" style={{ width: 180 }} value={sortFilter} onChange={(e) => setParam('sort', e.target.value)}>
              <option value="needs-attention">Needs attention first</option>
              <option value="last-edited">Last edited</option>
              <option value="title-a-z">Title A-Z</option>
              <option value="next-review">Next review soonest</option>
            </select>
            <label className="flex items-center gap-8 cursor-pointer text-ui-label whitespace-nowrap">
              <input type="checkbox" checked={dueOnly} onChange={(e) => setParam('due', e.target.checked ? '1' : '')} style={{ accentColor: 'var(--amber)' }}/> Due for review only
            </label>
            {hasActiveFilters && <Button variant="text" onClick={clearFilters} className="ml-auto">Clear filters</Button>}
          </div>
        </div>

        {/* Mobile Toolbar Toggle */}
        <div className="mobile-only" style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
          <Button variant="ghost" className="w-full justify-between" onClick={() => setIsFilterOpen(true)}>
            <div className="flex gap-8"><Filter size={16} /> Filters & Sort {hasActiveFilters && <Badge count={1} />}</div>
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Mobile Filter Bottom Sheet */}
        {isFilterOpen && (
          <Dialog isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="Filters & Sort">
             <div className="flex flex-col gap-16">
              <label className="label-base">Search</label>
              <input type="text" className="input-base mb-8" placeholder="Title or keyword" value={query} onChange={(e) => setParam('q', e.target.value)} />
              <label className="label-base">Category</label>
              <select className="input-base mb-8" value={categoryFilter} onChange={(e) => setParam('category', e.target.value)}>
                {availableCategories.map(c => <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>)}
              </select>
              <label className="label-base">Sort by</label>
              <select className="input-base mb-8" value={sortFilter} onChange={(e) => setParam('sort', e.target.value)}>
                <option value="needs-attention">Needs attention first</option>
                <option value="last-edited">Last edited</option>
                <option value="title-a-z">Title A-Z</option>
                <option value="next-review">Next review soonest</option>
              </select>
              <label className="flex items-center gap-8 cursor-pointer text-ui-label mb-16">
                <input type="checkbox" checked={dueOnly} onChange={(e) => setParam('due', e.target.checked ? '1' : '')} style={{ accentColor: 'var(--amber)' }}/> Due for review only
              </label>
              <div className="flex justify-between gap-12 mt-16 pt-16" style={{ borderTop: '1px solid var(--border)' }}>
                 <Button variant="text" onClick={() => { clearFilters(); setIsFilterOpen(false); }}>Clear</Button>
                 <Button variant="primary" onClick={() => setIsFilterOpen(false)}>Apply</Button>
              </div>
             </div>
          </Dialog>
        )}

        {/* Table / List */}
        <div style={{ flex: 1, padding: '16px', width: '100%' }} aria-live="polite">
          {loading ? (
            <div className="flex flex-col gap-16">{[...Array(6)].map((_,i) => <Skeleton key={i} style={{ height: 64, width: '100%' }} />)}</div>
          ) : filteredArticles.length === 0 ? (
            <EmptyState title="No articles match your filters." action={<Button variant="ghost" onClick={clearFilters}>Clear filters</Button>} />
          ) : (
            <table className="table table-responsive articles-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th className="col-title">Title</th>
                  <th className="col-status">Status</th>
                  <th className="col-version col-hide-tablet">Version</th>
                  <th className="col-edited col-hide-tablet">Last edited</th>
                  <th className="col-helpful">Helpful %</th>
                  <th className="col-feedback">Feedback</th>
                  <th className="col-review" style={{ whiteSpace: 'nowrap' }}>Next review</th>
                  <th className="col-action" style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedArticles.map(a => {
                  const isDraft = a.status === 'draft';
                  const isReturned = a.status === 'changes-requested';
                  const isInReview = a.status === 'in-review';
                  const isPublished = a.status === 'published' || a.hasRevision;
                  const isUnderRevision = a.status === 'under-revision' || a.hasRevision;

                  // Actions config
                  let mainAction = { label: 'View', onClick: () => navigate(`/admin/articles/${a.id}`) };
                  let menuItems = [{ label: 'Preview', icon: Eye, onClick: () => showToast('Available in a later step') }];
                  
                  if (isDraft) {
                    mainAction = { label: 'Continue', onClick: () => navigate(`/admin/articles/${a.id}`) };
                    menuItems.push({ label: 'Delete draft', icon: Trash2, destructive: true, onClick: () => handleDeleteDraft(a) });
                  } else if (isReturned) {
                    mainAction = { label: 'Fix', onClick: () => navigate(`/admin/articles/${a.id}`) };
                    menuItems.push({ label: 'View reviewer comments', icon: MessageSquare, onClick: () => navigate(`/admin/articles/${a.id}`) });
                  } else if (isInReview) {
                    // Just View + Preview
                  } else if (isUnderRevision && a.status === 'under-revision') { // Dedicated revision draft
                    mainAction = { label: 'Continue', onClick: () => navigate(`/admin/articles/${a.id}`) };
                    menuItems.push({ label: 'View live version', icon: ExternalLink, onClick: () => showToast('Available in a later step') });
                    menuItems.push({ label: 'Discard revision', icon: Trash2, destructive: true, onClick: () => handleDiscardRevision(a) });
                  } else if (isPublished) {
                    mainAction = { label: 'Edit', onClick: () => handleEdit(a) };
                    if (a.reviewState === 'due-soon' || a.reviewState === 'overdue') {
                      menuItems.unshift({ label: 'Confirm still accurate', icon: CheckCircle, onClick: () => handleConfirmAccurate(a) });
                    }
                    menuItems.push({ label: 'View live', icon: ExternalLink, onClick: () => showToast('Available in a later step') });
                    menuItems.push({ label: 'Version history', icon: Clock, onClick: () => showToast('Available in a later step') });
                  }

                  return (
                    <tr key={a.id} className="table-row-clickable" onClick={() => navigate(`/admin/articles/${a.id}`)}>
                      <td className="col-title">
                        <div className="flex-col gap-4">
                          <span className="text-ui-label text-text line-clamp-2" style={{ lineHeight: 1.3 }}>{a.title}</span>
                          <span className="text-meta text-muted truncate">{a.category} &gt; {a.section}</span>
                          <div className="hide-desktop hide-tablet text-meta mt-4 flex gap-8">
                             {a.version && <span>v{a.version}</span>} <span>{getRelativeTime(a.updatedAt)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="col-status">
                        <div className="flex items-center gap-8 flex-wrap">
                          <StatusPill status={a.status} />
                          {isInReview && <Tooltip text="Locked while with the reviewer"><Lock size={14} className="text-faint" /></Tooltip>}
                        </div>
                      </td>
                      <td className="col-version col-hide-tablet text-meta text-text">{a.version || '-'}</td>
                      <td className="col-edited col-hide-tablet"><Tooltip text={formatDate(a.updatedAt)}><span className="text-text">{getRelativeTime(a.updatedAt)}</span></Tooltip></td>
                      <td className="col-helpful">
                        {isPublished && !isUnderRevision ? (
                          <Tooltip text={`${Math.round(a.helpfulPercent * 1.5)} readers marked this helpful`}>
                            <span className="text-text" style={{ cursor: 'help', borderBottom: '1px dotted var(--text-muted)' }}>{a.helpfulPercent}%</span>
                          </Tooltip>
                        ) : <span className="text-faint">-</span>}
                      </td>
                      <td className="col-feedback">
                        {isPublished && !isUnderRevision ? (
                           a.openFeedbackCount > 0 ? <span className="chip-amber">{a.openFeedbackCount}</span> : <span className="text-text">0</span>
                        ) : <span className="text-faint">-</span>}
                      </td>
                      <td className="col-review" style={{ whiteSpace: 'nowrap' }}>
                        {isPublished && !isUnderRevision ? <ReviewChip state={a.reviewState} dateStr={a.nextReviewAt} cycleDays={a.reviewCycleDays} /> : <span className="text-faint">-</span>}
                      </td>
                      <td className="col-action" style={{ textAlign: 'right' }}>
                        <div className="action-wrap" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" onClick={mainAction.onClick}>{mainAction.label}</Button>
                          <DropdownMenu trigger={<Button variant="ghost" style={{ padding: 0, width: 36 }}><MoreVertical size={16} /></Button>} items={menuItems} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center" style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
            <span className="text-meta text-muted">Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filteredArticles.length)} of {filteredArticles.length}</span>
            <div className="flex gap-4">
              <Button variant="ghost" disabled={page === 1} onClick={() => setParam('page', page - 1)}>Previous</Button>
              <Button variant="ghost" disabled={page === totalPages} onClick={() => setParam('page', page + 1)}>Next</Button>
            </div>
          </div>
        )}
      </Card>
      
      <NewArticleDialog isOpen={isNewDialogOpen} onClose={() => setIsNewDialogOpen(false)} />
    </div>
  );
};


const Dashboard = () => {
  const { data, badges, showToast } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const drafts = data.articles.filter(a => a.status === 'draft');
  const inReview = data.articles.filter(a => a.status === 'in-review');
  const returned = data.articles.filter(a => a.status === 'changes-requested');
  const published = data.articles.filter(a => a.status === 'published' || a.hasRevision);
  
  const dueForReview = published
    .filter(a => a.reviewState === 'due-soon' || a.reviewState === 'overdue')
    .sort((a, b) => {
       if (a.reviewState === 'overdue' && b.reviewState !== 'overdue') return -1;
       if (b.reviewState === 'overdue' && a.reviewState !== 'overdue') return 1;
       return new Date(a.nextReviewAt) - new Date(b.nextReviewAt);
    });

  const continueList = [...returned, ...drafts, ...inReview]
    .sort((a, b) => {
      const order = { 'changes-requested': 1, 'draft': 2, 'in-review': 3 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    })
    .slice(0, 6);

  if (loading) return (
    <div className="page-container">
      <div className="flex justify-between mb-32"><Skeleton style={{ width: 300, height: 48 }} /><Skeleton style={{ width: 120, height: 36 }} /></div>
      <div className="flex gap-24 mb-32 attention-grid"><Skeleton style={{ flex: 1, height: 120 }} /><Skeleton style={{ flex: 1, height: 120 }} /><Skeleton style={{ flex: 1, height: 120 }} /><Skeleton style={{ flex: 1, height: 120 }} /></div>
      <div className="flex gap-24 two-col-layout"><Skeleton style={{ flex: 2, height: 400 }} /><Skeleton style={{ flex: 1, height: 400 }} /></div>
    </div>
  );

  return (
    <div className="page-container" style={{ paddingBottom: 64 }}>
      <div className="flex justify-between items-end gap-16 flex-wrap">
        <div>
          <h1 className="text-display text-text mb-4">Good morning, {data.currentUser.name.split(' ')[0]}</h1>
          <p className="text-muted">Here is what needs your attention today.</p>
        </div>
        <Button icon={Plus} onClick={() => navigate('/admin/articles?new=true')}>New article</Button>
      </div>

      <div className="attention-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        <Card clickable onClick={() => navigate('/admin/articles?status=draft')} className="gap-12">
          <div style={{ width: 40, height: 40, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} className="text-muted" /></div>
          <div className="text-big-num text-text">{drafts.length}</div>
          <div><div className="text-ui-label text-text">My drafts</div><div className="text-meta text-muted">Not submitted yet</div></div>
        </Card>
        
        <Card clickable onClick={() => navigate('/admin/articles?status=changes-requested')} className="gap-12" style={{ background: 'var(--amber-soft)', borderColor: 'var(--amber)' }}>
          <div style={{ width: 40, height: 40, background: 'var(--surface)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Undo2 size={20} className="text-amber" /></div>
          <div className="text-big-num text-amber">{badges.returnedCount}</div>
          <div><div className="text-ui-label text-amber">Returned by reviewer</div><div className="text-meta text-amber">Reviewer left comments</div></div>
        </Card>

        <Card clickable onClick={() => navigate('/admin/articles?status=in-review')} className="gap-12">
          <div style={{ width: 40, height: 40, background: 'var(--teal-soft)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ShieldAlert size={20} className="text-teal" /></div>
          <div className="text-big-num text-text">{inReview.length}</div>
          <div><div className="text-ui-label text-text">Waiting in review</div><div className="text-meta text-muted">With reviewers</div></div>
        </Card>

        <Card clickable onClick={() => navigate('/admin/feedback')} className="gap-12">
          <div style={{ width: 40, height: 40, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={20} className="text-muted" /></div>
          <div className="text-big-num text-text">{badges.feedbackCount}</div>
          <div><div className="text-ui-label text-text">Reader feedback</div><div className="text-meta text-muted">From Help Center readers</div></div>
        </Card>
      </div>

      <div className="flex gap-24 two-col-layout items-start">
        <Card className="flex-col h-full" style={{ flex: 2, padding: 0 }}>
          <div className="flex justify-between items-center" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 className="text-panel-title text-text">Continue where you left off</h2>
            <Button variant="text" onClick={() => navigate('/admin/articles')}>View all my articles</Button>
          </div>
          <div className="flex-col">
            {continueList.length > 0 ? continueList.map((a, i) => (
              <div key={a.id} className="flex-col" style={{ borderBottom: i < continueList.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex items-center justify-between gap-16" style={{ padding: '16px 24px', cursor: 'pointer' }} onClick={() => navigate(`/admin/articles/${a.id}`)}>
                  <div className="flex items-center gap-16" style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ width: 140 }}><StatusPill status={a.status} hasRevision={a.hasRevision} /></div>
                    <div className="flex-col gap-4 truncate" style={{ flex: 1 }}>
                      <div className="flex items-center gap-8 truncate">
                        <span className="text-ui-label text-text truncate">{a.title}</span>
                        {a.status === 'changes-requested' && a.reviewerCommentCount > 0 && <span className="chip-amber">1 reviewer comment</span>}
                      </div>
                      <div className="text-meta text-muted truncate">{a.category} &gt; {a.section}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-24 flex-shrink-0">
                    <Tooltip text={formatDate(a.updatedAt)}><span className="text-meta text-faint hide-mobile">Edited {getRelativeTime(a.updatedAt)}</span></Tooltip>
                    <Button variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/admin/articles/${a.id}`); }}>{a.status === 'draft' ? 'Continue' : a.status === 'changes-requested' ? 'Fix' : 'View'}</Button>
                  </div>
                </div>
              </div>
            )) : <EmptyState icon={FileText} title="No drafts or returned articles" description="Start a new article to build the knowledge base." action={<Button icon={Plus} onClick={() => navigate('/admin/articles?new=true')}>New article</Button>} />}
          </div>
        </Card>

        <div className="flex flex-col gap-24" style={{ flex: 1 }}>
          <Card style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}><h2 className="text-panel-title text-text">Reader feedback</h2></div>
            <div className="flex-col">
              {data.feedback.length > 0 ? data.feedback.slice(0, 5).map((f, i) => (
                <div key={f.id} className="flex-col gap-8" style={{ padding: '16px 20px', borderBottom: i < data.feedback.slice(0, 5).length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="flex justify-between items-start gap-12">
                    <div className="text-ui-label text-text truncate">{f.articleTitle}</div>
                    <span className="text-meta text-muted">{getRelativeTime(f.createdAt)}</span>
                  </div>
                  <div className="flex items-start gap-8 flex-col"><ReasonChip reason={f.reason} /><p className="text-body text-muted line-clamp-2">"{f.text}"</p></div>
                </div>
              )) : <div style={{ padding: 32 }}><EmptyState icon={MessageSquare} title="No feedback waiting." description="Readers are happy." /></div>}
            </div>
            {data.feedback.length > 0 && (
              <div style={{ padding: '12px 20px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                <button className="btn-text w-full text-ui-label" onClick={() => navigate('/admin/feedback')}>Open all feedback</button>
              </div>
            )}
          </Card>

          {dueForReview.length > 0 && (
            <Card style={{ padding: 0 }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}><h2 className="text-panel-title text-text">Due for review</h2></div>
              <div className="flex-col">
                {dueForReview.slice(0,3).map((a, i) => {
                  const isOverdue = a.reviewState === 'overdue';
                  const diffMs = new Date(a.nextReviewAt).getTime() - CURRENT_DATE.getTime();
                  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                  const text = isOverdue ? `Overdue ${Math.abs(diffDays)} days` : `Due in ${diffDays} days`;
                  
                  return (
                    <div key={a.id} className="flex items-center justify-between gap-12" style={{ padding: '16px 20px', borderBottom: i < Math.min(3, dueForReview.length) - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div className="flex-col gap-4 truncate">
                        <div className="text-ui-label text-text truncate">{a.title}</div>
                        <div className="text-meta" style={{ color: isOverdue ? 'var(--red-text)' : 'var(--amber-text)' }}>{text}</div>
                      </div>
                      <Button variant="ghost" onClick={() => navigate(`/admin/articles/${a.id}`)}>Review now</Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const Shell = ({ children }) => {
  const { role, toastMsg } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="shell">
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="body-area">
        <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="main-content focus-trap" tabIndex="-1">
          {role === 'Author' ? children : <ComingNext />}
        </main>
      </div>
      {toastMsg && <div className="toast-container"><div className="toast"><Info size={16} className="text-amber" />{toastMsg}</div></div>}
    </div>
  );
};

export default function AdminApp({ initialRole = 'Author', onModeChange }) {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <AppProvider initialRole={initialRole} onModeChange={onModeChange}>
        <HashRouter>
          <Shell>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/articles" element={<MyArticles />} />
              <Route path="/admin/articles/:id" element={<ArticleEditor />} />
              <Route path="/admin/*" element={<ComingNext />} />
            </Routes>
          </Shell>
        </HashRouter>
      </AppProvider>
    </>
  );
}
