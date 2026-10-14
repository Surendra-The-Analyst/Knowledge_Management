import React, { useState, useEffect, useRef, createContext, useContext, useMemo, useSyncExternalStore } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation, Link, useSearchParams, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, FilePlus, Undo2, MessageSquare, BookOpen,
  Sun, Moon, Bell, Menu, Search, Plus, ExternalLink, X, Info,
  MoreVertical, Edit3, Trash2, CheckCircle, Eye, Clock, ShieldAlert,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Lock, Filter, Save, Send, RotateCcw, Settings,
  ListChecks, Hash, AlertTriangle
} from 'lucide-react';
import DraftArticleEditor, { BlockRenderer, ReviewerThreadCard } from './DraftArticleEditor.jsx';
import {
  getArticleRoute,
  getNextReviewDisplay,
  getReviewWindowStatus,
  selectFeedbackOverview,
  selectRecentlyPublished,
  selectReviewQueue,
  selectReviewQueueCounts,
  selectReviewQueueTab,
  selectReviewWindowArticles
} from './data/adminSelectors.js';
import { getAdminSettings, subscribeAdminSettings, setAdminSettings, updateAdminCategories, updateAdminSynonyms, updateFeedbackReasons, REVIEW_DUE_SOON_DAYS } from './data/adminSettings.js';

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
  .articles-table .col-title { width: 29%; }
  .articles-table .col-status { width: 14%; }
  .articles-table .col-version { width: 6%; }
  .articles-table .col-edited { width: 10%; }
  .articles-table .col-helpful { width: 8%; }
  .articles-table .col-review { width: 14%; }
  .articles-table .col-action { width: 19%; }
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
  .editor-block { border: 1px solid transparent; border-radius: 12px; padding: 12px 14px; margin: 14px 0; transition: border-color 150ms, background 150ms, box-shadow 150ms; }
  .editor-block:focus-within { border-color: rgba(232, 163, 23, 0.45); background: rgba(252, 243, 220, 0.4); box-shadow: 0 0 0 3px rgba(232, 163, 23, 0.08); }
  .editor-block-label { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px; color: var(--text-muted); font-size: 11px; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
  .article-editor { display: flex; flex-direction: column; gap: 16px; }
  .article-editor .field-shell {
    border: 1px solid transparent; border-radius: 14px; background: rgba(255,255,255,0.22); padding: 12px 14px; transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
  }
  .article-editor .field-shell:focus-within {
    border-color: rgba(232, 163, 23, 0.45); background: rgba(255,255,255,0.48); box-shadow: 0 0 0 3px rgba(232, 163, 23, 0.07);
  }
  .article-editor .field-shell textarea,
  .article-editor .field-shell input,
  .article-editor .field-shell select {
    width: 100%; border: none; background: transparent; box-shadow: none; padding: 0; color: var(--text); font-family: inherit;
  }
  .article-editor .field-shell textarea:focus,
  .article-editor .field-shell input:focus,
  .article-editor .field-shell select:focus {
    outline: none; box-shadow: none;
  }
  .article-editor .input-base {
    border: none; background: transparent; box-shadow: none; padding: 0; border-radius: 0; color: var(--text);
  }
  .article-editor .input-base:focus {
    border: none; background: transparent; box-shadow: none; outline: none;
  }
  .article-editor .title-editor {
    min-height: 60px; font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-size: clamp(2rem, 2.2vw, 3.1rem); line-height: 1.1; font-weight: 600; resize: none; color: var(--text);
  }
  .article-editor .summary-editor {
    min-height: 86px; font-size: 1rem; line-height: 1.65; resize: none; color: var(--text);
  }
  .article-editor .block-editor {
    border: 1px solid transparent; background: rgba(255,255,255,0.18); border-radius: 12px; padding: 10px 12px; transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
  }
  .article-editor .block-editor:focus-within {
    border-color: rgba(232, 163, 23, 0.5); background: rgba(255,255,255,0.4); box-shadow: 0 0 0 3px rgba(232, 163, 23, 0.08);
  }
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
  .feedback-card { background: rgba(255,255,255,0.82); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 8px 20px rgba(11,31,58,0.04); padding: 16px; }
  .feedback-card.open { border-left: 3px solid var(--teal); padding-left: 13px; }
  .feedback-card.dismissed { border-left: 3px solid var(--border-strong); padding-left: 13px; opacity: .78; }
  .dismiss-popover { position: absolute; right: 0; bottom: 100%; margin-bottom: 8px; width: 260px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; box-shadow: var(--shadow-md); padding: 16px; z-index: 70; }

  /* Admin dashboard */
  .admin-dashboard { max-width: 1100px; width: 100%; gap: 20px; }
  .dashboard-section { display: flex; flex-direction: column; gap: 12px; min-width: 0; }
  .dashboard-tiles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
  .dashboard-action-tile { width: 100%; min-height: 132px; align-items: flex-start; justify-content: center; text-align: left; gap: 12px; color: var(--text); }
  .dashboard-panel { padding: 0; overflow: hidden; }
  .dashboard-panel-header { min-height: 60px; padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .dashboard-panel-body { min-width: 0; }
  .dashboard-link { min-height: 44px; padding: 0 8px; color: var(--text); font-weight: 500; }
  .dashboard-link:hover { color: var(--amber-text); text-decoration: underline; }
  .dashboard-table { width: 100%; table-layout: fixed; }
  .dashboard-table th { text-align: left; }
  .dashboard-table td { overflow-wrap: anywhere; }
  .dashboard-table .dashboard-title-cell { width: 30%; }
  .dashboard-row:focus-within { outline: 2px solid var(--amber); outline-offset: -2px; }
  .dashboard-row:focus-visible { outline: 2px solid var(--amber); outline-offset: -2px; }
  .dashboard-row-link { min-height: 44px; display: inline-flex; align-items: center; text-align: left; color: var(--text); }
  .dashboard-row-link:hover { color: var(--amber-text); text-decoration: underline; }
  .dashboard-feedback-row { width: 100%; min-height: 56px; padding: 8px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; text-align: left; border-bottom: 1px solid var(--border); }
  .dashboard-feedback-row:last-child { border-bottom: 0; }
  .dashboard-feedback-row:hover { background: var(--surface-2); }
  .dashboard-empty { padding: 20px; color: var(--text-muted); }
  .review-screen { height: 100%; min-height: 0; display: flex; flex-direction: column; background: var(--bg); }
  .review-screen-header { min-height: 56px; padding: 0 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: var(--surface); border-bottom: 1px solid var(--border); }
  .review-screen-main { display: flex; flex: 1; min-height: 0; position: relative; overflow: hidden; }
  .review-document-scroll { flex: 1; min-width: 0; overflow: auto; display: flex; justify-content: center; padding: 32px 24px; }
  .review-document { --inset: var(--surface-2); --muted: var(--text-muted); --ghost-border: var(--border-strong); --on-fill: var(--on-navy); --success-text: var(--teal-text); --success-tint: var(--teal-soft); --brick-text: var(--red-text); --brick-tint: var(--red-soft); --amber-tint: var(--amber-soft); width: 100%; max-width: 720px; padding: 24px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; align-self: flex-start; }
  .review-document h1 { color: var(--text); font-family: 'Bricolage Grotesque', sans-serif; font-size: 32px; line-height: 1.2; margin: 18px 0 8px; }
  .review-document h2, .review-document h3 { color: var(--text); font-family: 'Bricolage Grotesque', sans-serif; }
  .review-document .bricolage { font-family: 'Bricolage Grotesque', sans-serif; }
  .review-document .serif { color: var(--text); font-family: 'Source Serif 4', Georgia, serif; font-size: 17px; line-height: 1.65; }
  .review-document .block-row { position: relative; display: flex; margin-top: 16px; }
  .review-anchored-block { border-left: 3px solid var(--amber); padding-left: 12px; }
  .review-document .block-content { flex: 1; min-width: 0; outline: none; }
  .review-document .callout-block { padding: 16px; background: var(--surface-2); border-left: 3px solid var(--border); display: flex; gap: 12px; }
  .review-document .callout-info { background: var(--teal-soft); border-left-color: var(--teal); }
  .review-document .callout-warning { background: var(--amber-soft); border-left-color: var(--amber); }
  .review-document .callout-error { background: var(--red-soft); border-left-color: var(--red); }
  .review-document .callout-success { background: var(--teal-soft); border-left-color: var(--teal); }
  .review-document .callout-note { background: var(--surface-2); border-left-color: var(--border-strong); }
  .review-document .code-wrapper, .review-document .table-wrapper { max-width: 100%; overflow-x: auto; }
  .review-document .table-wrapper table { width: 100%; border-collapse: collapse; }
  .review-document .table-wrapper td { border: 1px solid var(--border); padding: 8px; }
  .review-panel { width: 340px; flex-shrink: 0; display: flex; flex-direction: column; background: var(--surface); border-left: 1px solid var(--border); min-height: 0; }
  .review-panel:not(.is-open) { display: none; }
  .review-panel-scrim { display: none; }
  .review-panel-scroll { flex: 1; min-height: 0; overflow-y: auto; padding: 16px; }
  .review-panel-card { padding: 14px; margin-bottom: 16px; }
  .review-panel-card h2 { font-size: 14px; color: var(--text); margin: 0 0 12px; }
  .review-field { display: flex; flex-direction: column; gap: 2px; margin-top: 10px; }
  .review-field-label { color: var(--text-muted); font-size: 11px; text-transform: uppercase; }
  .review-panel-footer { padding: 12px 16px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; background: var(--surface); }
  .review-thread-card { cursor: pointer; }
  .review-thread-heading { display: flex; align-items: center; gap: 8px; }
  .review-thread-avatar { flex: 0 0 28px; height: 28px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--surface-2); color: var(--text); font-size: 10px; font-weight: 600; }
  .review-thread-author { min-width: 0; display: flex; flex-direction: column; }
  .reviewer-role-chip { color: var(--text-muted); font-size: 10px; }
  .review-thread-time { margin-left: auto; color: var(--text-muted); white-space: nowrap; }
  .review-thread-quote { margin: 10px 0; padding-left: 10px; border-left: 3px solid var(--amber); color: var(--text-muted); }
  .review-thread-text { margin: 8px 0; color: var(--text); }
  .review-thread-delete { min-height: 40px; padding: 0 4px; color: var(--red-text); }
  .review-thread-list { display: flex; flex-direction: column; gap: 10px; }
  .review-author-reply { margin: 12px 0 0 28px; padding: 10px 0 0 12px; border-left: 2px solid var(--teal); border-top: 1px solid var(--border); }
  .review-delete-popover { position: relative; z-index: 2; margin: -4px 8px 8px; padding: 12px; display: flex; align-items: center; justify-content: space-between; gap: 8px; background: var(--surface); border: 1px solid var(--border); border-radius: 6px; box-shadow: var(--shadow-md); }
  .review-empty-comments { padding: 16px 12px; color: var(--text-muted); background: var(--surface-2); border-radius: 6px; }
  .review-dialog-summary { display: flex; flex-direction: column; gap: 8px; margin-top: 16px; padding: 12px; background: var(--surface-2); border-radius: 4px; }
  .review-change-note { margin: 22px 0; padding: 14px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 6px; }
  .review-change-note > strong { display: block; margin-bottom: 6px; }
  .review-summary { margin: 20px 0 28px; font-size: 18px; }
  .review-article-meta { padding-bottom: 16px; border-bottom: 1px solid var(--border); margin-bottom: 20px; }
  .review-quote-highlight { background: var(--amber-soft); color: var(--text); }
  .review-comment-form { display: flex; flex-direction: column; gap: 8px; margin: 12px 0; }
  .review-comment-form textarea { width: 100%; min-height: 88px; padding: 10px; color: var(--text); background: var(--surface); border: 1px solid var(--border-strong); border-radius: 6px; font: inherit; resize: vertical; }
  .review-decision-warning { color: var(--amber-text); background: var(--amber-soft); padding: 10px; border-radius: 4px; }
  .review-block-comment { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .review-block-comment button { min-height: 32px; padding: 0 8px; border-radius: 4px; background: var(--amber-soft); color: var(--amber-text); font-size: 11px; }
  .review-block-pulse { animation: reviewPulse 900ms ease-out; }
  .review-selection-pill { position: fixed; z-index: 110; min-height: 44px; padding: 0 14px; background: var(--navy); color: var(--on-navy); border: 1px solid var(--border); border-radius: 6px; box-shadow: var(--shadow-md); transform: translateX(-50%); }
  .review-tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--border); overflow-x: auto; }
  .review-tab { min-height: 44px; padding: 0 14px; white-space: nowrap; border-bottom: 2px solid transparent; color: var(--text-muted); }
  .review-tab[aria-selected="true"] { color: var(--text); border-bottom-color: var(--amber); font-weight: 600; }
  .review-tabpanel:focus { outline: none; }
  .review-queue-filter { max-width: 320px; min-height: 44px; }
  .review-screen-header .btn { height: 44px; min-height: 44px; }
  .review-panel-footer .btn, .review-panel .review-comment-form .btn { height: 44px; min-height: 44px; }
  .review-queue-filter { height: 44px; }
  .review-block-comment button { min-height: 44px; }
  .dialog-overlay:has(.review-decision-dialog) { z-index: 300; }
  .review-decision-dialog .btn { height: 44px; min-height: 44px; }
  .settings-layout { display: grid; grid-template-columns: 200px minmax(0, 760px); align-items: start; gap: 24px; }
  .settings-subnav { display: flex; flex-direction: column; border-left: 1px solid var(--border); }
  .settings-subnav button { min-height: 44px; padding: 8px 12px; border-left: 2px solid transparent; margin-left: -1px; color: var(--text-muted); text-align: left; }
  .settings-subnav button[aria-current="page"] { color: var(--text); border-left-color: var(--amber); font-weight: 600; }
  .settings-content { min-width: 0; display: flex; flex-direction: column; gap: 16px; }
  .settings-card.card { background: var(--surface); border: 1px solid var(--border); box-shadow: none; backdrop-filter: none; }
  .settings-section-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .settings-section-heading p { margin-top: 4px; }
  .settings-card { padding: 0; border-radius: 8px; overflow: hidden; }
  .settings-card-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .settings-card-body { padding: 16px 20px; }
  .settings-category { padding: 16px 20px; border-bottom: 1px solid var(--border); }
  .settings-category:last-child { border-bottom: 0; }
  .settings-category-name { font-family: 'Bricolage Grotesque', sans-serif; font-size: 16px; font-weight: 600; }
  .settings-category-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 44px; }
  .settings-count { margin-left: 12px; }
  .settings-action { width: 44px; height: 44px; }
  .settings-section-row { display: flex; align-items: center; gap: 8px; min-height: 44px; padding-left: 16px; border-top: 1px solid var(--border); }
  .settings-section-label { flex: 1; min-width: 0; }
  .settings-section-actions { margin-left: auto; }
  .settings-add-section { min-height: 44px; margin: 4px 0 0 16px; padding: 0 8px; color: var(--text); font-weight: 500; }
  .settings-add-section:hover { color: var(--amber-text); text-decoration: underline; }
  .settings-add-category { padding: 8px 20px; }
  .settings-role-select { width: auto; min-width: 110px; min-height: 44px; }
  .settings-status { color: var(--teal-text); }
  .feedback-reason-list { margin-top: 12px; display: flex; flex-direction: column; }
  .feedback-reason-row { min-height: 44px; padding: 4px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--border); }
  .feedback-reason-list { margin-top: 12px; display: flex; flex-direction: column; }
  .feedback-reason-row { min-height: 44px; padding: 4px 0; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-top: 1px solid var(--border); }
  .settings-inline-form { display: flex; gap: 8px; padding: 8px 0; }
  .settings-inline-form input { min-width: 0; flex: 1; }
  .settings-inline-error { min-height: 18px; color: var(--red-text); font-size: 12px; }
  .settings-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
  .settings-warning { padding: 12px 14px; color: var(--amber-text); background: var(--amber-soft); border-left: 3px solid var(--amber); border-radius: 0 4px 4px 0; }
  .settings-fixed-window { display: flex; align-items: flex-start; gap: 8px; margin-top: 18px; color: var(--text-muted); }
  .settings-fixed-window svg { flex: 0 0 auto; margin-top: 2px; }
  .settings-table { width: 100%; table-layout: fixed; }
  .settings-table th, .settings-table td { padding: 12px 10px; }
  .settings-table th { color: var(--text-muted); font-size: 12px; font-weight: 500; text-align: left; border-bottom: 1px solid var(--border); }
  .settings-table td { vertical-align: middle; border-bottom: 1px solid var(--border); }
  .settings-table tr:last-child td { border-bottom: 0; }
  .settings-chip-list { display: flex; flex-wrap: wrap; gap: 6px; }
  .settings-chip { display: inline-flex; align-items: center; gap: 4px; min-height: 28px; padding: 2px 8px; border: 1px solid var(--border); border-radius: 4px; background: var(--surface-2); color: var(--text); }
  .settings-chip-remove { width: 24px; height: 24px; color: var(--text-muted); }
  .settings-chip-input { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; min-height: 44px; padding: 6px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--surface); }
  .settings-chip-input input { flex: 1; min-width: 120px; height: 32px; border: 0; padding: 0 6px; box-shadow: none; }
  .settings-chip-input input:focus { outline: none; box-shadow: none; }
  .settings-user { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .settings-avatar { width: 32px; height: 32px; flex: 0 0 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: var(--surface-2); color: var(--text); font-weight: 600; }
  .settings-you { margin-left: 8px; color: var(--text-muted); font-size: 11px; }
  .settings-role-chip { display: inline-flex; min-height: 24px; align-items: center; padding: 2px 8px; border-radius: 4px; background: var(--surface-2); color: var(--text); }
  .settings-dialog:focus-visible { outline: none; }
  .settings-dialog .input-base { min-height: 44px; }
  .settings-icon-actions { display: flex; gap: 2px; }
  @keyframes reviewPulse { 0%, 100% { background: transparent; } 35% { background: var(--amber-soft); } }
  
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
    .articles-table .col-title { width: 34%; }
    .articles-table .col-status { width: 17%; }
    .articles-table .col-review { width: 20%; }
    .articles-table .col-action { width: 20%; }
  }

  @media (max-width: 1023px) {
    .dashboard-tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .review-panel { position: fixed; right: 0; top: 64px; bottom: 0; z-index: 120; transform: translateX(100%); transition: transform 180ms ease; box-shadow: var(--shadow-md); }
    .review-panel.is-open { transform: translateX(0); }
    .review-panel-scrim { display: block; position: fixed; inset: 64px 0 0; z-index: 110; background: color-mix(in srgb, var(--navy) 25%, transparent); }
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
    .dashboard-table, .dashboard-table tbody, .dashboard-table tr, .dashboard-table td { display: block; width: 100%; }
    .dashboard-table thead { display: none; }
    .dashboard-table tr { padding: 14px 16px; border-bottom: 1px solid var(--border); }
    .dashboard-table tr:last-child { border-bottom: 0; }
    .dashboard-table td { padding: 4px 0; border: 0; }
    .dashboard-table td::before { content: attr(data-label); display: block; margin-bottom: 2px; color: var(--text-muted); font-size: 11px; font-weight: 500; }
    .dashboard-table td.dashboard-primary-cell::before { content: none; }
    .dashboard-table td.dashboard-action-cell { padding-top: 8px; }
    .dashboard-action-tile { min-height: 118px; }
    .review-screen-header { padding: 0 8px; }
    .review-document-scroll { padding: 12px 8px 140px; }
    .review-document { padding: 18px 14px; }
    .review-document h1 { font-size: 26px; }
    .review-panel { top: 10%; bottom: 0; width: 100%; transform: translateY(100%); border-radius: 12px 12px 0 0; border-left: 0; border-top: 1px solid var(--border); }
    .review-panel.is-open { transform: translateY(0); }
    .review-panel-scrim { inset: 0; }
    .review-queue-table td::before { content: attr(data-label); display: block; margin-bottom: 2px; color: var(--text-muted); font-size: 11px; font-weight: 500; }
    .review-queue-table td.review-queue-title::before { content: none; }
    .settings-layout { grid-template-columns: minmax(0, 1fr); gap: 16px; }
    .settings-subnav { flex-direction: row; overflow-x: auto; border-left: 0; border-bottom: 1px solid var(--border); }
    .settings-subnav button { flex: 0 0 auto; border-left: 0; border-bottom: 2px solid transparent; margin: 0 0 -1px; }
    .settings-subnav button[aria-current="page"] { border-left-color: transparent; border-bottom-color: var(--amber); }
    .settings-form-grid { grid-template-columns: minmax(0, 1fr); }
    .settings-table, .settings-table tbody, .settings-table tr, .settings-table td { display: block; width: 100%; }
    .settings-table thead { display: none; }
    .settings-table tr { padding: 12px 16px; border-bottom: 1px solid var(--border); }
    .settings-table tr:last-child { border-bottom: 0; }
    .settings-table td { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 6px 0; border: 0; }
    .settings-table td::before { content: attr(data-label); flex: 0 0 34%; color: var(--text-muted); font-size: 11px; }
    .settings-table td[data-label="Name"]::before { content: none; }
    .settings-icon-actions { flex-wrap: wrap; justify-content: flex-end; }
    .settings-category { padding: 14px 12px; }
    .settings-card-header, .settings-card-body { padding-left: 14px; padding-right: 14px; }
    .feedback-reason-row { min-height: 48px; }
  }

  .focus-trap:focus { outline: none; }
`;

// Reference Date: Monday, October 12, 2026 at 5:46 PM
const CURRENT_DATE = new Date('2026-10-14T17:46:00Z');

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

const getReviewContent = (article) => {
  const sourceContent = article.content || getArticleDraft(article).content;
  return sourceContent.map((block, index) => {
    if (block.type === 'heading') return { ...block, level: block.level || 2, html: block.html || block.text || `Section ${index + 1}` };
    if (block.type === 'paragraph') return { ...block, html: block.html || block.text || '' };
    if (block.type === 'bullet') return { id: block.id, type: 'list', variant: 'bullet', items: [{ id: `${block.id}-item`, html: block.text || '' }] };
    if (block.type === 'steps') return {
      id: article.id === 'a3' ? 'auto-steps' : block.id,
      type: 'steps',
      items: (block.items || block.steps || []).map((item, itemIndex) => {
        if (typeof item !== 'string') return item;
        const isReturnedAnchor = article.id === 'a3' && itemIndex === 2;
        return {
          id: isReturnedAnchor ? 'auto-step-confirm' : `${block.id}-item-${itemIndex}`,
          html: isReturnedAnchor ? '<b>Review the member rules</b> - Check the rule preview, then confirm to apply it.' : item
        };
      })
    };
    if (block.type === 'callout') return { ...block, variant: block.variant || 'info', html: block.html || block.text || '' };
    return { ...block, html: block.html || block.text || '' };
  });
};

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
  currentAdmin: { id: "admin-1", name: "Arjun Rao", role: "admin", initials: "AR" },
  articles: [
    { id: "a1", title: "Voice Message Recording in Browser", category: "Messaging & Chats", section: "Hands-Free & Transcription", status: "draft", hasRevision: false, ownerId: "u1", updatedAt: "2026-10-11T10:00:00Z", version: null, publishedAt: null, helpfulPercent: null, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a2", title: "Composer Settings", category: "Messaging & Chats", section: "Composer", status: "draft", hasRevision: false, ownerId: "u1", updatedAt: "2026-10-09T14:30:00Z", version: null, publishedAt: null, helpfulPercent: null, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a3", title: "Auto-populated Groups Membership", category: "Collaboration Groups", section: "Membership & Access", status: "changes-requested", hasRevision: false, ownerId: "u1", updatedAt: "2026-10-10T09:15:00Z", returnedAt: "2026-10-10T10:00:00Z", returnedBy: "Arjun Rao", version: "5.2", publishedAt: null, helpfulPercent: null, openFeedbackCount: 0, reviewerName: "Arjun Rao", reviewerComment: "Add where the Airtime option appears for Basic users, and fix the heading in step 3.", reviewerCommentCount: 2, authorName: "Priya Menon", comments: [{ id: "a3-comment-1", blockId: null, itemId: null, quotedText: "", authorName: "Arjun Rao", authorRole: "reviewer", text: "Add where the Airtime option appears for Basic users.", createdAt: "2026-10-10T10:12:00Z", resolved: false, replies: [{ id: "a3-reply-1", authorName: "Priya Menon", authorRole: "author", text: "I added the Airtime setting location and clarified where Basic users will see it.", createdAt: "2026-10-11T08:30:00Z" }] }, { id: "a3-comment-2", blockId: "auto-steps", itemId: "auto-step-confirm", quotedText: "Review the member rules", authorName: "Arjun Rao", authorRole: "reviewer", text: "Fix this heading. It says Review but the step is Confirm.", createdAt: "2026-10-10T10:14:00Z", resolved: false, replies: [{ id: "a3-reply-2", authorName: "Priya Menon", authorRole: "author", text: "Updated the step title to match the confirmation action.", createdAt: "2026-10-11T08:34:00Z" }] }] },
    { id: "a4", title: "Enable Airtime Mode for this Group", category: "Collaboration Groups", section: "Groups & Modes", status: "in-review", hasRevision: false, ownerId: "u1", updatedAt: "2026-10-10T17:18:00Z", version: "5.2", publishedAt: null, helpfulPercent: null, openFeedbackCount: 3, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0, submittedAt: "2026-10-12T17:46:00Z", changeType: "Updated", authorName: "Priya Menon", hasPublishedVersion: true, liveVersion: "5.2", nextVersion: "5.3", lastPublished: "2026-10-08T10:00:00Z", changeNote: "Rewrote the steps for the new Airtime checkbox.", reviewerNote: "Please check the screenshot placeholder." },
    { id: "a5", title: "Read Receipts Access", category: "Messaging & Chats", section: "Privacy", status: "published", hasRevision: false, ownerId: "u1", updatedAt: "2026-08-20T09:45:00Z", lastReviewedAt: "2026-08-20T09:45:00Z", nextReviewAt: "2026-12-14T17:46:00Z", reviewCycleDays: 90, reviewState: "recheck-pending", recheckRequestedAt: "2026-10-13T17:46:00Z", version: "4.9", publishedAt: "2026-08-20T09:45:00Z", helpfulPercent: 79, openFeedbackCount: 1, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0, lastPublished: "2026-08-20T09:45:00Z" },
    { id: "a6", title: "Create Regular Group", category: "Collaboration Groups", section: "Creation", status: "published", hasRevision: false, ownerId: "u1", updatedAt: "2026-09-24T11:00:00Z", lastReviewedAt: "2026-09-24T11:00:00Z", nextReviewAt: "2026-10-26T17:46:00Z", reviewCycleDays: 30, reviewState: "ok", version: "5.1", publishedAt: "2026-09-24T11:00:00Z", helpfulPercent: 91, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0, lastPublished: "2026-09-24T11:00:00Z" },
    { id: "a7", title: "Schedule Message Delivery", category: "Messaging & Chats", section: "Advanced", status: "published", hasRevision: false, ownerId: "u1", updatedAt: "2026-09-02T13:20:00Z", lastReviewedAt: "2026-09-02T13:20:00Z", nextReviewAt: "2026-12-14T17:46:00Z", reviewCycleDays: 90, reviewState: "recheck-pending", recheckRequestedAt: "2026-10-12T17:46:00Z", version: "5.0", publishedAt: "2026-09-02T13:20:00Z", helpfulPercent: 88, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0, lastPublished: "2026-09-02T13:20:00Z" },
    { id: "a8", title: "Set Chat History Access", category: "Collaboration Groups", section: "Membership & Access", status: "published", hasPublishedVersion: true, hasRevision: false, ownerId: "u1", updatedAt: "2026-09-10T08:00:00Z", lastReviewedAt: "2026-09-10T08:00:00Z", nextReviewAt: "2026-12-14T17:46:00Z", reviewCycleDays: 90, reviewState: "ok", version: "5.0", liveVersion: "5.0", publishedAt: "2026-09-10T08:00:00Z", lastPublished: "2026-09-10T08:00:00Z", helpfulPercent: 84, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a9", title: "Group Roles and Permissions", category: "Collaboration Groups", section: "Permissions", status: "under-revision", hasRevision: true, ownerId: "u1", updatedAt: "2026-10-11T14:00:00Z", lastReviewedAt: "2026-09-03T08:00:00Z", nextReviewAt: "2026-12-02T08:00:00Z", reviewCycleDays: 90, reviewState: "ok", version: "5.0", publishedAt: "2026-09-03T08:00:00Z", helpfulPercent: 86, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0, lastPublished: "2026-09-03T08:00:00Z" },
    { id: "a10", title: "Set Chat History Access", category: "Collaboration Groups", section: "Membership & Access", status: "in-review", hasRevision: false, hasPublishedVersion: true, ownerId: "u1", updatedAt: "2026-10-10T17:46:00Z", submittedAt: "2026-10-10T17:46:00Z", version: "5.0", liveVersion: "5.0", nextVersion: "5.1", publishedAt: "2026-09-10T08:00:00Z", lastPublished: "2026-09-10T08:00:00Z", changeType: "Updated", helpfulPercent: 84, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a11", title: "Set Workspace IP Restrictions", category: "Security & Workspace Restrictions", section: "Access Rules", status: "published", hasRevision: false, ownerId: "u1", updatedAt: "2026-08-20T12:00:00Z", lastReviewedAt: "2026-08-20T12:00:00Z", nextReviewAt: "2026-09-21T17:46:00Z", reviewCycleDays: 30, reviewState: "overdue", version: "5.1", publishedAt: "2026-08-20T12:00:00Z", lastPublished: "2026-08-20T12:00:00Z", helpfulPercent: 82, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a12", title: "Transcribe a Voice Message", category: "Messaging & Chats", section: "Hands-Free & Transcription", status: "in-review", hasRevision: false, ownerId: "u2", authorName: "Meera Joshi", updatedAt: "2026-10-13T17:46:00Z", submittedAt: "2026-10-13T17:17:00Z", version: null, publishedAt: null, changeType: "New", summary: "Turn a voice message into searchable text.", changeNote: "Introduces voice message transcription.", reviewerNote: "", reviewCycleDays: 90, reviewState: null, helpfulPercent: null, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a13", title: "Configure Team Availability", category: "Messaging & Chats", section: "Direct & 1:1 Messaging", status: "in-review", hasRevision: false, ownerId: "admin-1", authorName: "Arjun Rao", updatedAt: "2026-10-13T09:00:00Z", submittedAt: "2026-10-13T09:00:00Z", version: null, publishedAt: null, changeType: "New", summary: "Set availability details for your team.", changeNote: "Adds team availability settings.", reviewCycleDays: 90, helpfulPercent: null, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a14", title: "Read Receipts Access", category: "Messaging & Chats", section: "Privacy", status: "published", hasRevision: false, ownerId: "u1", authorName: "Priya Menon", updatedAt: "2026-08-20T09:45:00Z", lastReviewedAt: "2026-08-20T09:45:00Z", nextReviewAt: "2026-12-14T17:46:00Z", reviewCycleDays: 90, reviewState: "ok", version: "4.9", publishedAt: "2026-08-20T09:45:00Z", lastPublished: "2026-08-20T09:45:00Z", helpfulPercent: 79, openFeedbackCount: 1, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 },
    { id: "a15", title: "Auto-delete for Groups", category: "Collaboration Groups", section: "Groups & Modes", status: "published", hasRevision: false, ownerId: "u2", authorName: "Meera Joshi", updatedAt: "2026-10-02T10:00:00Z", lastReviewedAt: "2026-10-02T10:00:00Z", nextReviewAt: "2027-01-01T10:00:00Z", reviewCycleDays: 90, reviewState: "ok", version: "5.2", publishedAt: "2026-10-02T10:00:00Z", lastPublished: "2026-10-02T10:00:00Z", helpfulPercent: 93, openFeedbackCount: 0, reviewerName: null, reviewerComment: null, reviewerCommentCount: 0 }
  ],
  feedback: [
    { id: "f1", articleId: "a4", articleTitle: "Enable Airtime Mode for this Group", reason: "Out of date", text: "Screenshot shows the old group settings screen.", createdAt: "2026-10-11T12:00:00Z", status: "new" },
    { id: "f2", articleId: "a4", articleTitle: "Enable Airtime Mode for this Group", reason: "Incomplete", text: "Does not say how to turn it on for an existing group.", createdAt: "2026-10-11T14:30:00Z", status: "new" },
    { id: "f3", articleId: "a4", articleTitle: "Enable Airtime Mode for this Group", reason: "Hard to follow", text: "Too many group types in the overview.", createdAt: "2026-10-12T09:00:00Z", status: "new" },
    { id: "f4", articleId: "a5", articleTitle: "Read Receipts Access", reason: "Hard to follow", text: "Not clear who can see my read receipts after I turn them off.", createdAt: "2026-09-30T10:00:00Z", status: "new", version: "4.8" }
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
    { id: 'feedback', label: 'Reader feedback', icon: MessageSquare, path: '/admin/feedback', badgeKey: 'feedbackCount' },
    { id: 'browse', label: 'Browse all articles', icon: BookOpen, path: '/admin/browse' }
  ],
  admin: [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard-admin' },
    { id: 'review-queue', label: 'Review queue', icon: ListChecks, path: '/admin/review', badgeKey: 'reviewQueueCount' },
    { id: 'feedback', label: 'Reader feedback', icon: MessageSquare, path: '/admin/feedback', badgeKey: 'feedbackCount' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ]
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

const isFeedbackOpen = (feedback) => !feedback.dismissed && feedback.status !== 'dismissed';
const getFeedbackDate = (feedback) => feedback.date || feedback.createdAt;
const getFeedbackVersion = (feedback, article) => feedback.version || (article?.version ? `v${article.version}` : '-');

const AppContext = createContext();

const useAdminSettings = () => useSyncExternalStore(subscribeAdminSettings, getAdminSettings, getAdminSettings);

const AppProvider = ({ children, initialRole = 'Author', onModeChange }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('tm-admin-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('tm-admin-theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const [role, setRoleState] = useState(initialRole);
  const settings = useAdminSettings();
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
  const reviewCounts = selectReviewQueueCounts(data.articles);
  const reviewWindow = selectReviewWindowArticles(data.articles, CURRENT_DATE, REVIEW_DUE_SOON_DAYS);
  const inReviewCount = data.articles.filter(a => a.status === 'in-review').length;
  const overdueCount = reviewWindow.filter(item => item.timing.status === 'overdue').length;
  const dueSoonCount = reviewWindow.filter(item => item.timing.status === 'due-soon').length;
  const needsActionCount = returnedCount + overdueCount;
  const feedbackCount = selectFeedbackOverview(data.feedback, data.articles).total;

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

  const updateFeedback = (id, updates) => {
    setData(prev => ({
      ...prev,
      feedback: prev.feedback.map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };

  const value = {
    theme, toggleTheme, role, setRole, data, settings, showToast, toastMsg,
    addArticle, updateArticle, deleteArticle, updateFeedback,
    badges: { needsActionCount, returnedCount, feedbackCount, draftCount, inReviewCount, reviewQueueCount: reviewCounts.awaiting + reviewCounts.recheck, overdueCount, dueSoonCount }
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

const StatusPill = ({ status, label }) => {
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
      {label || styleConf.label}
    </span>
  );
};

const ReasonChip = ({ reason }) => {
  const isWarning = reason === 'Out of date' || reason === 'Incorrect';
  return <span className={isWarning ? 'chip-amber' : 'chip-reason'}>{reason}</span>;
};

const Card = ({ as: Component = 'div', children, className = '', clickable, ...props }) => (
  <Component className={`card ${clickable ? 'card-clickable' : ''} ${className}`} {...props}>{children}</Component>
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

const ReaderFeedbackPage = () => {
  const { data, settings, updateFeedback, showToast, role } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filterMode, setFilterMode] = useState('open');
  const [filterArticle, setFilterArticle] = useState(() => searchParams.get('article') || 'all');
  const [filterReason, setFilterReason] = useState('all');
  const [dismissTarget, setDismissTarget] = useState(null);
  const [dismissReason, setDismissReason] = useState('');

  const articlesWithFeedback = useMemo(() => {
    const ids = [...new Set(data.feedback.map(item => item.articleId))];
    return ids.map(id => data.articles.find(article => article.id === id)).filter(Boolean);
  }, [data.feedback, data.articles]);

  const reasons = settings.feedbackReasons;
  const openCount = data.feedback.filter(isFeedbackOpen).length;
  const dismissedCount = data.feedback.length - openCount;

  const filtered = useMemo(() => (
    data.feedback
      .filter(item => filterMode === 'open' ? isFeedbackOpen(item) : !isFeedbackOpen(item))
      .filter(item => filterArticle === 'all' || item.articleId === filterArticle)
      .filter(item => filterReason === 'all' || item.reason === filterReason)
      .sort((a, b) => new Date(getFeedbackDate(b)) - new Date(getFeedbackDate(a)))
  ), [data.feedback, filterMode, filterArticle, filterReason]);

  const clearDismiss = () => {
    setDismissTarget(null);
    setDismissReason('');
  };

  const handleDismiss = () => {
    if (!dismissTarget || !dismissReason) return;
    updateFeedback(dismissTarget, { dismissed: true, status: 'dismissed', dismissReason });
    clearDismiss();
    showToast('Feedback dismissed');
  };

  const handleRestore = (id) => {
    updateFeedback(id, { dismissed: false, status: 'new', dismissReason: '' });
    showToast('Feedback restored');
  };

  return (
    <div className="page-container" style={{ maxWidth: 980, paddingBottom: 64 }}>
      <div className="flex justify-between items-end gap-16 flex-wrap">
        <div>
          <h1 className="text-display text-text">Reader feedback</h1>
          <p className="text-muted">Review comments sent from the Help Center, then open the article or dismiss with a reason.</p>
        </div>
        <div className="text-meta text-muted" aria-live="polite">{openCount} open</div>
      </div>

      <Card className="gap-16" style={{ padding: 16 }}>
        <div className="flex gap-16 flex-wrap items-center">
          <div className="flex gap-4" style={{ background: 'var(--surface-2)', padding: 4, borderRadius: 8, border: '1px solid var(--border)' }}>
            <button className={`btn ${filterMode === 'open' ? 'btn-primary' : 'btn-text'}`} onClick={() => setFilterMode('open')} aria-pressed={filterMode === 'open'}>Open ({openCount})</button>
            <button className={`btn ${filterMode === 'dismissed' ? 'btn-primary' : 'btn-text'}`} onClick={() => setFilterMode('dismissed')} aria-pressed={filterMode === 'dismissed'}>Dismissed ({dismissedCount})</button>
          </div>
          <select className="input-base" style={{ width: 260 }} value={filterArticle} onChange={event => setFilterArticle(event.target.value)}>
            <option value="all">All articles</option>
            {articlesWithFeedback.map(article => <option key={article.id} value={article.id}>{article.title}</option>)}
          </select>
          <select className="input-base" style={{ width: 210 }} value={filterReason} onChange={event => setFilterReason(event.target.value)}>
            <option value="all">All reasons</option>
            {reasons.map(reason => <option key={reason} value={reason}>{reason}</option>)}
          </select>
          {(filterArticle !== 'all' || filterReason !== 'all') && (
            <Button variant="text" onClick={() => { setFilterArticle('all'); setFilterReason('all'); }}>Clear filters</Button>
          )}
        </div>
      </Card>

      <div className="flex-col gap-12">
        {filtered.length === 0 ? (
          <Card>
            <EmptyState
              icon={MessageSquare}
              title={filterArticle !== 'all' || filterReason !== 'all' ? 'No feedback matches these filters' : filterMode === 'open' ? 'No open reader feedback' : 'Nothing dismissed'}
              description={filterArticle !== 'all' || filterReason !== 'all' ? 'Clear filters to see all feedback.' : filterMode === 'open' ? 'New feedback from readers will appear here.' : 'Dismissed feedback can be restored from here.'}
              action={(filterArticle !== 'all' || filterReason !== 'all') ? <Button variant="ghost" onClick={() => { setFilterArticle('all'); setFilterReason('all'); }}>Clear filters</Button> : null}
            />
          </Card>
        ) : filtered.map(item => {
          const article = data.articles.find(a => a.id === item.articleId);
          const itemVersion = getFeedbackVersion(item, article);
          const liveVersion = article?.liveVersion || (article?.version ? `v${article.version}` : null);
          const isOlder = liveVersion && itemVersion !== '-' && itemVersion !== liveVersion;

          return (
            <div key={item.id} className={`feedback-card ${isFeedbackOpen(item) ? 'open' : 'dismissed'}`}>
              <div className="flex justify-between items-start gap-16">
                <div style={{ minWidth: 0 }}>
                  <div className="text-ui-label text-text truncate">
                    {item.articleTitle}
                    <span className="text-meta text-muted"> · {itemVersion}</span>
                    {isOlder && <span className="chip-reason" style={{ marginLeft: 8 }}>older version</span>}
                  </div>
                  <div className="text-meta text-muted" style={{ marginTop: 4 }}>
                    {article?.category || item.category || 'Article'} &gt; {article?.section || item.section || 'Section'}
                  </div>
                </div>
                <span className="text-meta text-muted">{formatDate(getFeedbackDate(item))}</span>
              </div>

              <div className="flex items-center gap-8" style={{ marginTop: 14 }}>
                <ReasonChip reason={item.reason} />
              </div>
              <p className="text-body text-text" style={{ marginTop: 12, fontSize: 15, lineHeight: 1.6 }}>{item.text}</p>

              {!isFeedbackOpen(item) && item.dismissReason && (
                <div className="text-meta text-muted" style={{ marginTop: 12 }}>Dismissed: {item.dismissReason}</div>
              )}

              <div className="flex justify-end gap-8 relative" style={{ marginTop: 16 }}>
                <Button variant="ghost" onClick={() => navigate(getArticleRoute(article, role))}>Open article</Button>
                {isFeedbackOpen(item) ? (
                  <>
                    <Button variant="ghost" onClick={() => setDismissTarget(item.id)}>Dismiss</Button>
                    {dismissTarget === item.id && (
                      <>
                        <div style={{ position: 'fixed', inset: 0, zIndex: 60 }} onClick={clearDismiss} />
                        <div className="dismiss-popover">
                          <div className="text-ui-label text-text mb-16">Why dismiss?</div>
                          <div className="flex-col gap-12 mb-16">
                            {['Not actionable', 'Duplicate', 'Already fixed'].map(reason => (
                              <label key={reason} className="flex items-center gap-8 text-body" style={{ cursor: 'pointer' }}>
                                <input type="radio" name="dismiss-reason" checked={dismissReason === reason} onChange={() => setDismissReason(reason)} />
                                {reason}
                              </label>
                            ))}
                          </div>
                          <div className="flex justify-end gap-8">
                            <Button variant="text" onClick={clearDismiss}>Cancel</Button>
                            <Button onClick={handleDismiss} disabled={!dismissReason}>Dismiss</Button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <Button variant="text" onClick={() => handleRestore(item.id)}>Restore</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dialog = ({ isOpen, onClose, title, subtitle, children, trapFocus = false }) => {
  const overlayRef = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeRef.current();
      if (!trapFocus || e.key !== 'Tab') return;
      const focusables = [...(overlayRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])') || [])];
      if (!focusables.length) return;
      if (e.shiftKey && document.activeElement === focusables[0]) { e.preventDefault(); focusables.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === focusables.at(-1)) { e.preventDefault(); focusables[0].focus(); }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
      if (trapFocus) requestAnimationFrame(() => overlayRef.current?.querySelector('button:not([disabled])')?.focus());
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = previousOverflow;
      if (isOpen && trapFocus && previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen, trapFocus]);

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
            <button key={i} className="dropdown-item" disabled={item.disabled} title={item.tooltip} onClick={(e) => { e.stopPropagation(); if (item.disabled) return; const triggerButton = containerRef.current?.querySelector('button'); setIsOpen(false); item.onClick(triggerButton); }} style={item.destructive ? { color: 'var(--red-text)' } : {}}>
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
  const handleRoleChange = (nextRole) => {
    setRole(nextRole);
    if (nextRole === 'Author') navigate('/admin/dashboard');
    if (nextRole === 'Admin/Reviewer') navigate('/admin/dashboard-admin');
  };

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
          <select value={role} onChange={e => handleRoleChange(e.target.value)} style={{ background: 'transparent', color: 'inherit', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }} className="hide-mobile" aria-label="Role">
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
  const { badges, data, role, showToast } = useApp();
  const menu = role === 'Author' ? MENU_CONFIG.author : MENU_CONFIG.admin;

  return (
    <>
      <div className={`mobile-overlay ${isOpen ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <nav className={`sidebar ${isOpen ? 'open' : ''}`} aria-label="Admin">
        <div className="flex flex-col" style={{ flex: 1, padding: '16px 0' }}>
          {menu.map((item) => {
            // Precise active matching
            let isActive = false;
            if (role === 'Author' && item.path === '/admin/dashboard' && (location.pathname === '/admin/dashboard' || location.pathname === '/admin' || location.pathname === '/')) { isActive = true; }
            else if (role === 'Author' && item.path === '/admin/articles' && location.pathname === '/admin/articles' && !location.search.includes('status=changes-requested')) { isActive = true; }
            else if (role === 'Author' && item.path.includes('status=changes-requested') && location.pathname === '/admin/articles' && location.search.includes('status=changes-requested')) { isActive = true; }
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
            <div className="article-editor">
              <div className="editor-field">
                <div className="field-shell">
                  <textarea id="editor-title" className="title-editor" value={article.title} maxLength={120} onChange={e => patchArticle({ title: e.target.value })} placeholder="Untitled article" />
                </div>
              </div>
              <div className="editor-field">
                <div className="field-shell">
                  <textarea id="editor-summary" className="summary-editor" rows={3} value={article.summary || ''} placeholder="Add a concise summary for readers" onChange={e => patchArticle({ summary: e.target.value })} />
                </div>
              </div>
              {(isRevision || article.changeNote) && (
                <div className="editor-field">
                  <label className="label-base" htmlFor="editor-change-note">Change note</label>
                  <div className="field-shell">
                    <textarea id="editor-change-note" className="summary-editor" rows={2} maxLength={160} value={article.changeNote || ''} placeholder="What changed in this version?" onChange={e => patchArticle({ changeNote: e.target.value })} />
                  </div>
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
                          <div className="field-shell" style={{ flex: 1 }}>
                            <input className="input-base" value={step} onChange={e => patchStep(block.id, stepIndex, e.target.value)} />
                          </div>
                        </div>
                      ))}
                      <Button variant="ghost" icon={Plus} onClick={() => patchBlock(block.id, { steps: [...(block.steps || []), ''] })}>Add step</Button>
                    </div>
                  ) : (
                    <div className="block-editor">
                      <textarea className="input-base" rows={block.type === 'heading' ? 1 : 3} value={block.text || ''} onChange={e => patchBlock(block.id, { text: e.target.value })} />
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-8 flex-wrap mt-16">
                <Button variant="ghost" icon={Plus} onClick={() => patchArticle({ content: [...article.content, { id: `${article.id}-p-${Date.now()}`, type: 'paragraph', text: '' }] })}>Paragraph</Button>
                <Button variant="ghost" icon={Plus} onClick={() => patchArticle({ content: [...article.content, { id: `${article.id}-h-${Date.now()}`, type: 'heading', text: '' }] })}>Heading</Button>
                <Button variant="ghost" icon={Plus} onClick={() => patchArticle({ content: [...article.content, { id: `${article.id}-s-${Date.now()}`, type: 'steps', steps: [''] }] })}>Steps</Button>
                <Button variant="ghost" icon={Plus} onClick={() => patchArticle({ content: [...article.content, { id: `${article.id}-c-${Date.now()}`, type: 'callout', text: '' }] })}>Callout</Button>
              </div>
            </div>
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

const createBlankDraftRecord = (articles, currentUser) => {
  const template = articles.find(article => article.title === 'Create Regular Group') || articles.find(article => article.status === 'published') || articles[0];
  return {
    id: `a${Date.now()}`,
    title: 'Untitled article',
    category: template?.category || 'Collaboration Groups',
    section: template?.section || 'Groups & Modes',
    status: 'draft',
    hasRevision: false,
    ownerId: currentUser.id,
    authorName: currentUser.name,
    updatedAt: CURRENT_DATE.toISOString(),
    version: null,
    publishedAt: null,
    helpfulPercent: null,
    openFeedbackCount: 0,
    reviewerName: null,
    reviewerComment: null,
    reviewerCommentCount: 0
  };
};

const createAndOpenBlankDraft = ({ data, addArticle, showToast, navigate }) => {
  const article = createBlankDraftRecord(data.articles, data.currentUser);
  addArticle(article);
  showToast('Draft created');
  navigate(`/admin/articles/${article.id}`);
};

const MyArticles = () => {
  const { data, showToast, updateArticle, deleteArticle, addArticle } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile filter sheet
  const [recheckTarget, setRecheckTarget] = useState(null);
  const recheckTriggerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

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
    const reviewWindowById = new Map(selectReviewWindowArticles(data.articles, CURRENT_DATE, REVIEW_DUE_SOON_DAYS).map(item => [item.article.id, item.timing]));
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
    if (dueOnly) result = result.filter(a => reviewWindowById.has(a.id));
    
    // Sort
    result = [...result].sort((a, b) => {
      if (sortFilter === 'needs-attention') {
        const order = { 'changes-requested': 1, 'draft': 5, 'in-review': 4, 'under-revision': 6, 'published': 6 };
        let aVal = order[a.status]; let bVal = order[b.status];
        if (reviewWindowById.get(a.id)?.status === 'overdue') aVal = 2;
        if (reviewWindowById.get(a.id)?.status === 'due-soon') aVal = 3;
        if (reviewWindowById.get(b.id)?.status === 'overdue') bVal = 2;
        if (reviewWindowById.get(b.id)?.status === 'due-soon') bVal = 3;
        if (aVal !== bVal) return aVal - bVal;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
      if (sortFilter === 'last-edited') return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (sortFilter === 'title-a-z') return a.title.localeCompare(b.title);
      return 0;
    });
    return result;
  }, [data.articles, statusTab, query, categoryFilter, sortFilter, dueOnly]);

  const totalPages = Math.ceil(filteredArticles.length / perPage);
  const paginatedArticles = filteredArticles.slice((page - 1) * perPage, page * perPage);
  const reviewTimingById = new Map(selectReviewWindowArticles(data.articles, CURRENT_DATE, REVIEW_DUE_SOON_DAYS).map(item => [item.article.id, item.timing]));
  const nextReviewById = new Map(data.articles.map(article => [article.id, getNextReviewDisplay(article, CURRENT_DATE, REVIEW_DUE_SOON_DAYS)]));

  const availableCategories = ['All', ...Array.from(new Set(data.articles.map(a => a.category)))];
  const hasActiveFilters = query || categoryFilter !== 'All' || sortFilter !== 'needs-attention' || dueOnly;

  // Actions
  const closeRecheckDialog = () => {
    setRecheckTarget(null);
    requestAnimationFrame(() => recheckTriggerRef.current?.focus());
  };
  const handleConfirmAccurate = (article) => {
    updateArticle(article.id, { reviewState: 'recheck-pending', recheckRequestedAt: CURRENT_DATE.toISOString() });
    setRecheckTarget(null);
    showToast('Re-check request sent');
    requestAnimationFrame(() => recheckTriggerRef.current?.focus());
  };
  const startNewArticle = () => {
    createAndOpenBlankDraft({ data, addArticle, showToast, navigate });
  };
  const handleDeleteDraft = (a) => {
    if (window.confirm("Are you sure you want to delete this draft?")) {
      deleteArticle(a.id);
      showToast("Draft deleted");
    }
  };
  const handleDiscardRevision = (a) => {
    if (window.confirm("Discard revision? The published version will remain live.")) {
      updateArticle(a.id, {
        ...(a.publishedSnapshot || {}),
        id: a.id,
        hasRevision: false,
        hasPublishedVersion: true,
        status: 'published',
        liveVersion: a.liveVersion || a.version,
        publishedSnapshot: a.publishedSnapshot
      });
      showToast("Revision discarded");
    }
  };
  const handleEdit = (a) => {
    updateArticle(a.id, { hasRevision: true, hasPublishedVersion: true, status: 'under-revision', liveVersion: a.liveVersion || a.version, publishedSnapshot: { ...a }, updatedAt: CURRENT_DATE.toISOString() });
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
          <Button icon={Plus} onClick={startNewArticle}>New article</Button>
        </div>
        <Card className="flex-1 min-h-[500px]">
          <EmptyState title="No articles yet. Start your first one." action={<Button icon={Plus} onClick={startNewArticle}>New article</Button>} />
        </Card>
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
        <Button icon={Plus} onClick={startNewArticle}>New article</Button>
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
                  <th className="col-review">Next review</th>
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
                  let menuItems = [{ label: 'Open', icon: Eye, onClick: () => navigate(`/admin/articles/${a.id}`) }];
                  
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
                    if (a.reviewState === 'recheck-pending') {
                      menuItems.push({ label: 'Recheck requested', icon: CheckCircle, disabled: true, tooltip: 'Recheck requested' });
                    } else if (reviewTimingById.has(a.id)) {
                      menuItems.push({ label: 'Confirm still accurate', icon: CheckCircle, onClick: trigger => { recheckTriggerRef.current = trigger; setRecheckTarget(a); } });
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
                        {(a.hasPublishedVersion || a.hasRevision) && (a.status === 'under-revision' || a.status === 'in-review') && (
                          <div className="text-meta" style={{ color: 'var(--amber-text)', marginTop: 6 }}>
                            Live {a.liveVersion || a.version} stays online
                          </div>
                        )}
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
                      <td className="col-review">
                        {a.status !== 'published' ? <span className="text-faint">-</span> : (() => {
                          const nextReview = nextReviewById.get(a.id);
                          if (nextReview?.status === 'recheck-pending') return <span className="chip-reason">Recheck requested</span>;
                          if (nextReview?.status === 'overdue') return <Tooltip text={`Next review ${formatDate(nextReview.date)}`}><span className="chip-red">Overdue {nextReview.days} days</span></Tooltip>;
                          if (nextReview?.status === 'due-soon') return <Tooltip text={`Next review ${formatDate(nextReview.date)}`}><span className="chip-amber">Due in {nextReview.days} days</span></Tooltip>;
                          return <span className="text-meta text-muted">{nextReview?.date ? formatDate(nextReview.date) : '-'}</span>;
                        })()}
                      </td>
                      <td className="col-action" style={{ textAlign: 'right' }}>
                        <div className="action-wrap" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" onClick={mainAction.onClick}>{mainAction.label}</Button>
                          <DropdownMenu trigger={<Button variant="ghost" aria-label={`Actions for ${a.title}`} style={{ padding: 0, width: 44, height: 44 }}><MoreVertical size={16} /></Button>} items={menuItems} />
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
      
      <Dialog isOpen={Boolean(recheckTarget)} trapFocus onClose={closeRecheckDialog} title="Send a re-check request to the admin?">
        <p className="text-body text-muted">The article stays live until it is approved.</p>
        <div className="flex justify-between gap-8" style={{ marginTop: 24 }}>
          <Button variant="ghost" onClick={closeRecheckDialog}>Cancel</Button>
          <Button onClick={() => recheckTarget && handleConfirmAccurate(recheckTarget)}>Send request</Button>
        </div>
      </Dialog>
    </div>
  );
};


const Dashboard = () => {
  const { data, badges, showToast, addArticle } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const drafts = data.articles.filter(a => a.status === 'draft');
  const inReview = data.articles.filter(a => a.status === 'in-review');
  const returned = data.articles.filter(a => a.status === 'changes-requested');
  const dueForReview = selectReviewWindowArticles(data.articles, CURRENT_DATE).map(item => item.article);

  const continueList = [...returned, ...drafts, ...inReview]
    .sort((a, b) => {
      const order = { 'changes-requested': 1, 'draft': 2, 'in-review': 3 };
      if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    })
    .slice(0, 6);
  const startNewArticle = () => createAndOpenBlankDraft({ data, addArticle, showToast, navigate });

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
        <Button icon={Plus} onClick={startNewArticle}>New article</Button>
      </div>

      <div className="attention-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
        <Card clickable onClick={() => navigate('/admin/articles?status=draft')} className="gap-12">
          <div style={{ width: 40, height: 40, background: 'var(--surface-2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} className="text-muted" /></div>
          <div className="text-big-num text-text">{drafts.length}</div>
          <div><div className="text-ui-label text-text">My drafts</div><div className="text-meta text-muted">Not submitted yet</div></div>
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
                        {(a.hasPublishedVersion || a.hasRevision) && (a.status === 'under-revision' || a.status === 'in-review') && (
                          <div className="text-meta" style={{ color: 'var(--amber-text)' }}>Live {a.liveVersion || a.version} stays online</div>
                        )}
                    </div>
                  </div>
                  <div className="flex items-center gap-24 flex-shrink-0">
                    <Tooltip text={formatDate(a.updatedAt)}><span className="text-meta text-faint hide-mobile">Edited {getRelativeTime(a.updatedAt)}</span></Tooltip>
                    <Button variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/admin/articles/${a.id}`); }}>{a.status === 'draft' ? 'Continue' : a.status === 'changes-requested' ? 'Fix' : 'View'}</Button>
                  </div>
                </div>
              </div>
            )) : <EmptyState icon={FileText} title="No drafts or returned articles" description="Start a new article to build the knowledge base." action={<Button icon={Plus} onClick={startNewArticle}>New article</Button>} />}
          </div>
        </Card>

        <div className="flex flex-col gap-24" style={{ flex: 1 }}>
          <Card style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}><h2 className="text-panel-title text-text">Reader feedback</h2></div>
            <div className="flex-col">
              {data.feedback.filter(isFeedbackOpen).length > 0 ? data.feedback.filter(isFeedbackOpen).slice(0, 5).map((f, i) => (
                <div key={f.id} className="flex-col gap-8" style={{ padding: '16px 20px', borderBottom: i < data.feedback.filter(isFeedbackOpen).slice(0, 5).length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div className="flex justify-between items-start gap-12">
                    <div className="text-ui-label text-text truncate">{f.articleTitle}</div>
                    <span className="text-meta text-muted">{getRelativeTime(getFeedbackDate(f))}</span>
                  </div>
                  <div className="flex items-start gap-8 flex-col"><ReasonChip reason={f.reason} /><p className="text-body text-muted line-clamp-2">"{f.text}"</p></div>
                </div>
              )) : <div style={{ padding: 32 }}><EmptyState icon={MessageSquare} title="No feedback waiting." description="Readers are happy." /></div>}
            </div>
            {data.feedback.filter(isFeedbackOpen).length > 0 && (
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
                  const timing = getReviewWindowStatus(a, CURRENT_DATE);
                  const isOverdue = timing?.status === 'overdue';
                  const text = isOverdue ? `Overdue ${timing.days} days` : `Due in ${timing.days} days`;
                  
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

const AdminDashboard = () => {
  const { data, role } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const reviewQueue = selectReviewQueue(data.articles);
  const reviewWindow = selectReviewWindowArticles(data.articles, CURRENT_DATE, REVIEW_DUE_SOON_DAYS);
  const reviewCounts = selectReviewQueueCounts(data.articles);
  const overdue = reviewWindow.filter(item => item.timing.status === 'overdue');
  const dueSoon = reviewWindow.filter(item => item.timing.status === 'due-soon');
  const feedback = selectFeedbackOverview(data.feedback, data.articles);
  const recentlyPublished = selectRecentlyPublished(data.articles);
  const waitingText = (article) => {
    const submittedAt = new Date(article.recheckRequestedAt || article.submittedAt || article.updatedAt);
    const elapsed = CURRENT_DATE.getTime() - submittedAt.getTime();
    const days = Math.floor(elapsed / (1000 * 60 * 60 * 24));
    if (days > 0) return `${days} days ago`;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    return hours > 0 ? `${hours} hour${hours === 1 ? '' : 's'} ago` : 'Just now';
  };
  const reviewType = (article) => article.reviewState === 'recheck-pending'
    ? 'Recheck'
    : article.changeType || (article.hasPublishedVersion || article.liveVersion || article.version ? 'Updated' : 'New');
  const articlePath = (article) => `${article.category} > ${article.section}`;
  const articleOwner = (article) => article.authorName || article.author || data.currentUser.name;
  const attentionTiles = [
    { label: 'Awaiting review', count: reviewCounts.awaiting, tone: 'amber', tab: 'awaiting' },
    { label: 'Recheck requests', count: reviewCounts.recheck, tone: 'amber', tab: 'recheck' },
    { label: 'Overdue for review', count: overdue.length, tone: 'brick', tab: 'published' },
    { label: 'Due in 14 days', count: dueSoon.length, tone: 'amber', tab: 'published' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="page-container admin-dashboard" aria-busy="true">
        <div className="dashboard-section"><Skeleton style={{ width: 220, height: 34 }} /><Skeleton style={{ width: 260, height: 20 }} /></div>
        <div className="dashboard-section"><Skeleton style={{ width: 160, height: 18 }} /><div className="dashboard-tiles">{attentionTiles.map(tile => <Skeleton key={tile.label} style={{ height: 132 }} />)}</div></div>
        <Skeleton style={{ height: 250 }} />
        <Skeleton style={{ height: 220 }} />
        <Skeleton style={{ height: 190 }} />
        <Skeleton style={{ height: 220 }} />
      </div>
    );
  }

  return (
    <div className="page-container admin-dashboard">
      <header>
        <h1 className="text-display text-text">Dashboard</h1>
        <p className="text-muted">What needs your attention</p>
      </header>

      <section className="dashboard-section" aria-labelledby="admin-needs-action">
        <h2 id="admin-needs-action" className="text-panel-title text-text">Needs your action</h2>
        <div className="dashboard-tiles" aria-live="polite">
          {attentionTiles.map(tile => {
            const articleWord = tile.count === 1 ? 'article' : 'articles';
            const countColor = tile.count === 0 ? 'var(--text-muted)' : tile.tone === 'brick' ? 'var(--red-text)' : 'var(--amber-text)';
            return (
              <Tooltip key={tile.label} text="Opens the review queue">
                <Card
                  as="button"
                  type="button"
                  clickable
                  className="dashboard-action-tile"
                  aria-label={`${tile.label}, ${tile.count} ${articleWord}`}
                  onClick={() => navigate(`/admin/review?tab=${tile.tab}`)}
                >
                  <span className="text-big-num" style={{ color: countColor }}>{tile.count}</span>
                  <span className="text-ui-label text-text">{tile.label}</span>
                </Card>
              </Tooltip>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section" aria-labelledby="admin-review-queue">
        <Card className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 id="admin-review-queue" className="text-panel-title text-text">Review queue</h2>
            <button className="dashboard-link" onClick={() => navigate('/admin/review?tab=awaiting')}>View all</button>
          </div>
          {reviewQueue.length ? (
            <table className="table dashboard-table">
              <thead><tr><th scope="col">Title</th><th scope="col">Author</th><th scope="col">Type</th><th scope="col">Waiting</th><th scope="col">Action</th></tr></thead>
              <tbody>
                {reviewQueue.slice(0, 5).map(article => {
                  const elapsedDays = Math.floor((CURRENT_DATE.getTime() - new Date(article.recheckRequestedAt || article.submittedAt || article.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr className="dashboard-row" key={article.id}>
                      <td className="dashboard-title-cell dashboard-primary-cell" data-label="Title">
                        <div className="text-ui-label text-text">{article.title}</div>
                        <div className="text-meta text-muted">{articlePath(article)}</div>
                      </td>
                      <td data-label="Author">{articleOwner(article)}</td>
                      <td data-label="Type"><span className="chip-reason">{reviewType(article)}</span></td>
                      <td data-label="Waiting"><span className={elapsedDays >= 3 ? 'text-amber' : 'text-muted'}>{waitingText(article)}</span></td>
                      <td className="dashboard-action-cell" data-label="Action"><Button variant="ghost" style={{ minHeight: 44 }} aria-label={`Review ${article.title}`} onClick={() => navigate(getArticleRoute(article, role))}>Review</Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <div className="dashboard-empty"><EmptyState title="Nothing waiting for review." /></div>}
        </Card>
      </section>

      <section className="dashboard-section" aria-labelledby="admin-review-window">
        <Card className="dashboard-panel">
          <div className="dashboard-panel-header"><h2 id="admin-review-window" className="text-panel-title text-text">Overdue and due soon</h2></div>
          {reviewWindow.length ? (
            <table className="table dashboard-table">
              <thead><tr><th scope="col">Title</th><th scope="col">Owner</th><th scope="col">Review date</th><th scope="col">Action</th></tr></thead>
              <tbody>
                {reviewWindow.slice(0, 5).map(({ article, timing }) => (
                  <tr className="dashboard-row" key={article.id}>
                    <td className="dashboard-title-cell dashboard-primary-cell" data-label="Title">
                      <div className="text-ui-label text-text">{article.title}</div>
                      <div className="text-meta text-muted">{articlePath(article)}</div>
                    </td>
                    <td data-label="Owner">{articleOwner(article)}</td>
                    <td data-label="Review date"><span className={timing.status === 'overdue' ? 'chip-red' : 'chip-amber'}>{timing.status === 'overdue' ? `Overdue ${timing.days} days` : `Due in ${timing.days} days`}</span></td>
                    <td className="dashboard-action-cell" data-label="Action"><Button variant="ghost" style={{ minHeight: 44 }} aria-label={`Open ${article.title}`} onClick={() => navigate(getArticleRoute(article, role))}>Open</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="dashboard-empty"><EmptyState title="Every article is inside its review window." /></div>}
        </Card>
      </section>

      <section className="dashboard-section" aria-labelledby="admin-reader-feedback">
        <Card className="dashboard-panel">
          <div className="dashboard-panel-header">
            <h2 id="admin-reader-feedback" className="text-panel-title text-text">Reader feedback</h2>
            <div className="flex items-center gap-8">
              <span className="text-meta text-muted" aria-live="polite">{feedback.total} open</span>
              <button className="dashboard-link" onClick={() => navigate('/admin/feedback')}>View all</button>
            </div>
          </div>
          {feedback.rows.length ? (
            <div className="dashboard-panel-body">
              {feedback.rows.slice(0, 3).map(({ article, count }) => (
                <button className="dashboard-feedback-row" key={article.id} onClick={() => navigate(`/admin/feedback?article=${encodeURIComponent(article.id)}`)}>
                  <span className="text-ui-label text-text truncate">{article.title}</span>
                  <span className="text-meta text-muted">{count} open</span>
                </button>
              ))}
            </div>
          ) : <div className="dashboard-empty"><EmptyState title="No open reader feedback." /></div>}
        </Card>
      </section>

      <section className="dashboard-section" aria-labelledby="admin-recently-published">
        <Card className="dashboard-panel">
          <div className="dashboard-panel-header"><h2 id="admin-recently-published" className="text-panel-title text-text">Recently published</h2></div>
          {recentlyPublished.length ? (
            <table className="table dashboard-table">
              <thead><tr><th scope="col">Title</th><th scope="col">Version</th><th scope="col">Date</th><th scope="col">Author</th></tr></thead>
              <tbody>
                {recentlyPublished.slice(0, 3).map(article => (
                  <tr className="dashboard-row" key={article.id}>
                    <td className="dashboard-title-cell dashboard-primary-cell" data-label="Title">
                      <div className="text-ui-label text-text">{article.title}</div>
                      <div className="text-meta text-muted">{articlePath(article)}</div>
                    </td>
                    <td className="text-meta text-text" data-label="Version">{article.version ? `v${article.version}` : '-'}</td>
                    <td className="text-meta text-text" data-label="Date">{formatDate(article.lastPublished || article.publishedAt)}</td>
                    <td data-label="Author">{articleOwner(article)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <div className="dashboard-empty"><EmptyState title="Nothing published yet." /></div>}
        </Card>
      </section>
    </div>
  );
};

const AdminPlaceholder = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container" style={{ maxWidth: 1100 }}>
      <Card><EmptyState title="Coming soon" description="This page is part of the next release." action={<Button onClick={() => navigate('/admin/dashboard-admin')}>Back to Dashboard</Button>} /></Card>
    </div>
  );
};

const SettingsDialog = ({ title, onClose, children }) => {
  const rootRef = useRef(null);
  const returnFocus = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);
  useEffect(() => {
    const previousFocus = document.activeElement;
    returnFocus.current = previousFocus;
    rootRef.current?.querySelector('input, button:not([disabled])')?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = event => {
      if (event.key === 'Escape') closeRef.current();
      if (event.key !== 'Tab') return;
      const focusables = [...(rootRef.current?.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled])') || [])];
      if (!focusables.length) return;
      if (event.shiftKey && document.activeElement === focusables[0]) { event.preventDefault(); focusables.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === focusables.at(-1)) { event.preventDefault(); focusables[0].focus(); }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, []);
  return <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-dialog-title" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="dialog-content settings-dialog focus-trap" ref={rootRef} tabIndex="-1">
      <div className="flex justify-between items-start mb-16"><h2 id="settings-dialog-title" className="text-panel-title text-text">{title}</h2><button className="btn-icon" aria-label="Close dialog" onClick={onClose}><X size={18} /></button></div>
      {children}
    </div>
  </div>;
};

const ReviewCycleSettings = ({ data, settings, showToast }) => {
  const [draftMax, setDraftMax] = useState(settings.reviewCycle.max);
  const [savedMax, setSavedMax] = useState(settings.reviewCycle.max);
  useEffect(() => { setDraftMax(settings.reviewCycle.max); setSavedMax(settings.reviewCycle.max); }, [settings.reviewCycle.max]);
  const dirty = Number(draftMax) !== Number(savedMax);
  const longerCount = data.articles.filter(article => (article.reviewCycleDays || article.reviewCycle || 0) > Number(draftMax)).length;
  const save = () => {
    setAdminSettings({ reviewCycle: { max: Number(draftMax), default: Number(draftMax), dueSoonDays: REVIEW_DUE_SOON_DAYS } });
    setSavedMax(Number(draftMax));
    showToast('Review cycle saved');
  };
  const reset = () => setDraftMax(settings.reviewCycle.max);
  const cycles = [30, 60, 90, 180];
  return <>
    <div><h2 className="text-panel-title text-text">Review cycle</h2></div>
    <Card className="settings-card"><div className="settings-card-body settings-review-form">
      <div className="settings-form-grid">
        <div><label className="label-base" htmlFor="settings-review-max">Maximum days between reviews</label><select id="settings-review-max" className="input-base" value={draftMax} onChange={event => setDraftMax(Number(event.target.value))}>{cycles.map(day => <option key={day} value={day}>{day} days</option>)}</select><p className="text-muted" style={{ marginTop: 6 }}>Authors can choose a shorter cycle for fast-changing features.</p></div>
      </div>
      <div className="settings-fixed-window"><Info size={16} /><span>Articles show as Due soon 14 days before their review date. This window is fixed for now.</span></div>
      {longerCount > 0 && <div className="settings-warning">{longerCount} articles use a longer cycle. They keep it until their next review.</div>}
      <div className="flex gap-8" style={{ marginTop: 20 }}><Button onClick={save} disabled={!dirty}>Save changes</Button><Button variant="ghost" onClick={reset} disabled={!dirty}>Reset</Button></div>
    </div></Card>
  </>;
};

const CategorySettings = ({ data, settings, showToast }) => {
  const [editing, setEditing] = useState(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [removeTarget, setRemoveTarget] = useState(null);
  const start = (kind, categoryId = null, sectionId = null, initial = '') => { setEditing({ kind, categoryId, sectionId }); setValue(initial); setError(''); };
  const cancel = () => { setEditing(null); setValue(''); setError(''); };
  const countCategory = category => data.articles.filter(article => article.category === category.name).length;
  const countSection = (category, section) => data.articles.filter(article => article.category === category.name && article.section === section.name).length;
  const save = event => {
    event.preventDefault();
    const name = value.trim();
    if (!name) { setError('A name is required.'); return; }
    const isCategory = editing.kind.includes('category');
    const siblings = isCategory
      ? settings.categories.filter(category => category.id !== editing.categoryId).map(category => category.name)
      : settings.categories.find(category => category.id === editing.categoryId)?.sections.filter(section => section.id !== editing.sectionId).map(section => section.name) || [];
    if (siblings.some(item => item.toLocaleLowerCase() === name.toLocaleLowerCase())) { setError('That name is already used.'); return; }
    if (editing.kind === 'add-category') {
      updateAdminCategories([...settings.categories, { id: `cat-${Date.now()}`, name, sections: [] }]); showToast('Category added');
    } else if (editing.kind === 'rename-category') {
      updateAdminCategories(settings.categories.map(category => category.id === editing.categoryId ? { ...category, name } : category)); showToast('Renamed');
    } else if (editing.kind === 'add-section') {
      updateAdminCategories(settings.categories.map(category => category.id === editing.categoryId ? { ...category, sections: [...category.sections, { id: `sec-${Date.now()}`, name }] } : category)); showToast('Section added');
    } else {
      updateAdminCategories(settings.categories.map(category => category.id === editing.categoryId ? { ...category, sections: category.sections.map(section => section.id === editing.sectionId ? { ...section, name } : section) } : category)); showToast('Renamed');
    }
    cancel();
  };
  const moveCategory = (id, direction) => {
    const index = settings.categories.findIndex(category => category.id === id);
    const target = index + direction;
    if (target < 0 || target >= settings.categories.length) return;
    const next = [...settings.categories]; [next[index], next[target]] = [next[target], next[index]];
    updateAdminCategories(next); showToast('Order updated');
  };
  const moveSection = (categoryId, sectionId, direction) => {
    updateAdminCategories(settings.categories.map(category => {
      if (category.id !== categoryId) return category;
      const index = category.sections.findIndex(section => section.id === sectionId);
      const target = index + direction;
      if (target < 0 || target >= category.sections.length) return category;
      const sections = [...category.sections]; [sections[index], sections[target]] = [sections[target], sections[index]];
      return { ...category, sections };
    }));
    showToast('Order updated');
  };
  const remove = () => {
    const next = removeTarget.sectionId
      ? settings.categories.map(category => category.id === removeTarget.categoryId ? { ...category, sections: category.sections.filter(section => section.id !== removeTarget.sectionId) } : category)
      : settings.categories.filter(category => category.id !== removeTarget.categoryId);
    updateAdminCategories(next);
    setRemoveTarget(null); showToast('Removed');
  };
  const inlineForm = (label, errorId) => <form className="settings-inline-form" onSubmit={save}>
    <input className="input-base" aria-label={label} aria-describedby={errorId} maxLength={40} value={value} onChange={event => { setValue(event.target.value); setError(''); }} onKeyDown={event => { if (event.key === 'Escape') cancel(); }} />
    <Button type="submit">Save</Button><Button type="button" variant="ghost" onClick={cancel}>Cancel</Button><span id={errorId} className="settings-inline-error">{error}</span>
  </form>;
  const moveButtons = (name, index, length, move) => <>
    <Tooltip text={`Move up ${name}`}><span><Button variant="text" className="settings-action" aria-label={`Move up ${name}`} disabled={index === 0} onClick={() => move(-1)}><ChevronUp size={16} /></Button></span></Tooltip>
    <Tooltip text={`Move down ${name}`}><span><Button variant="text" className="settings-action" aria-label={`Move down ${name}`} disabled={index === length - 1} onClick={() => move(1)}><ChevronDown size={16} /></Button></span></Tooltip>
  </>;
  return <>
    <div className="settings-section-heading"><div><h2 className="text-panel-title text-text">Categories and sections</h2><p className="text-muted">These are Admin-managed category records.</p></div><Button onClick={() => start('add-category')}>Add category</Button></div>
    {editing?.kind === 'add-category' && <Card className="settings-card"><div className="settings-card-body">{inlineForm('New category name', 'settings-new-category-error')}</div></Card>}
    <Card className="settings-card">
      {settings.categories.map((category, categoryIndex) => <section className="settings-category" key={category.id}>
        <div className="settings-category-top">
          {editing?.kind === 'rename-category' && editing.categoryId === category.id ? inlineForm(`Rename ${category.name}`, `settings-category-error-${category.id}`) : <>
            <div><strong className="settings-category-name">{category.name}</strong><span className="text-meta settings-count">{countCategory(category)} articles</span></div>
            <div className="settings-icon-actions">
              <Tooltip text={`Rename ${category.name}`}><Button variant="text" className="settings-action" aria-label={`Rename ${category.name}`} onClick={() => start('rename-category', category.id, null, category.name)}><Edit3 size={16} /></Button></Tooltip>
              {moveButtons(category.name, categoryIndex, settings.categories.length, direction => moveCategory(category.id, direction))}
              <Tooltip text={countCategory(category) ? 'Move or retire its articles first' : `Remove ${category.name}`}><span><Button variant="text" className="settings-action" aria-label={`Remove ${category.name}`} disabled={countCategory(category) > 0} onClick={() => setRemoveTarget({ categoryId: category.id, name: category.name })}><Trash2 size={16} /></Button></span></Tooltip>
            </div>
          </>}
        </div>
        {category.sections.map((section, sectionIndex) => <div className="settings-section-row" key={section.id}>
          {editing?.kind === 'rename-section' && editing.sectionId === section.id ? inlineForm(`Rename ${section.name}`, `settings-section-error-${section.id}`) : <>
            <span className="settings-section-label">{section.name}</span><span className="text-meta">{countSection(category, section)} articles</span><div className="settings-icon-actions settings-section-actions">
              <Tooltip text={`Rename ${section.name}`}><Button variant="text" className="settings-action" aria-label={`Rename ${section.name}`} onClick={() => start('rename-section', category.id, section.id, section.name)}><Edit3 size={15} /></Button></Tooltip>
              {moveButtons(section.name, sectionIndex, category.sections.length, direction => moveSection(category.id, section.id, direction))}
              <Tooltip text={countSection(category, section) ? 'Move or retire its articles first' : `Remove ${section.name}`}><span><Button variant="text" className="settings-action" aria-label={`Remove ${section.name}`} disabled={countSection(category, section) > 0} onClick={() => setRemoveTarget({ categoryId: category.id, sectionId: section.id, name: section.name })}><Trash2 size={15} /></Button></span></Tooltip>
            </div>
          </>}
        </div>)}
        {editing?.kind === 'add-section' && editing.categoryId === category.id && <div className="settings-section-row">{inlineForm(`New section in ${category.name}`, `settings-add-section-error-${category.id}`)}</div>}
        <button className="settings-add-section" onClick={() => start('add-section', category.id)}>Add section</button>
      </section>)}
    </Card>
    {removeTarget && <SettingsDialog title={`Remove ${removeTarget.name}? This can't be undone.`} onClose={() => setRemoveTarget(null)}><div className="flex justify-between gap-8" style={{ marginTop: 24 }}><Button variant="ghost" onClick={() => setRemoveTarget(null)}>Cancel</Button><Button className="btn-destructive" onClick={remove}>Remove</Button></div></SettingsDialog>}
  </>;
};

const SynonymSettings = ({ settings, showToast }) => {
  const [filter, setFilter] = useState('');
  const [dialog, setDialog] = useState(null);
  const [term, setTerm] = useState('');
  const [chips, setChips] = useState([]);
  const [chipInput, setChipInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const visible = settings.synonyms.filter(item => `${item.term} ${item.synonyms.join(' ')}`.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
  const openEditor = item => { setDialog(item ? { mode: 'edit', id: item.id } : { mode: 'add' }); setTerm(item?.term || ''); setChips(item ? [...item.synonyms] : []); setChipInput(''); };
  const addChip = rawValue => {
    const value = rawValue.trim().replace(/,$/, '').trim();
    if (!value || chips.length >= 12 || chips.some(chip => chip.toLocaleLowerCase() === value.toLocaleLowerCase())) return;
    setChips(current => [...current, value]);
    setChipInput('');
  };
  const duplicate = dialog && settings.synonyms.some(item => item.id !== dialog.id && item.term.toLocaleLowerCase() === term.trim().toLocaleLowerCase());
  const save = () => {
    if (!term.trim() || !chips.length || duplicate) return;
    const item = { id: dialog.id || `syn-${Date.now()}`, term: term.trim(), synonyms: chips };
    updateAdminSynonyms(dialog.mode === 'edit' ? settings.synonyms.map(existing => existing.id === item.id ? item : existing) : [...settings.synonyms, item]);
    setDialog(null);
    showToast(dialog.mode === 'edit' ? 'Synonym set updated' : 'Synonym set added');
  };
  const remove = () => { updateAdminSynonyms(settings.synonyms.filter(item => item.id !== deleteTarget.id)); setDeleteTarget(null); showToast('Synonym set deleted'); };
  return <>
    <div className="settings-section-heading"><div><h2 className="text-panel-title text-text">Keywords &amp; synonyms</h2><p className="text-muted">Add a keyword and the alternate terms readers may use to find it.</p></div><Button onClick={() => openEditor()}>Add keyword &amp; synonyms</Button></div>
    <input className="input-base" aria-label="Filter terms" placeholder="Filter terms..." value={filter} onChange={event => setFilter(event.target.value)} />
    {visible.length ? <Card className="settings-card"><table className="settings-table"><thead><tr><th scope="col">Keyword</th><th scope="col">Also searched as</th><th scope="col">Actions</th></tr></thead><tbody>{visible.map(item => <tr key={item.id}>
      <td className="text-meta" data-label="Keyword">{item.term}</td><td data-label="Also searched as"><div className="settings-chip-list">{item.synonyms.map(chip => <span className="settings-chip" key={chip}>{chip}</span>)}</div></td>
      <td data-label="Actions"><div className="settings-icon-actions"><Button variant="ghost" onClick={() => openEditor(item)}>Edit</Button><Button variant="text" aria-label={`Delete ${item.term} synonym set`} onClick={() => setDeleteTarget(item)}>Delete</Button></div></td>
    </tr>)}</tbody></table></Card> : <Card><EmptyState title="No synonyms yet. Add one so readers find articles with other words." /></Card>}
    {dialog && <SettingsDialog title={dialog.mode === 'edit' ? 'Edit keyword & synonyms' : 'Add keyword & synonyms'} onClose={() => setDialog(null)}>
      <label className="label-base" htmlFor="settings-synonym-term">Keyword</label><input id="settings-synonym-term" className="input-base" maxLength={40} value={term} onChange={event => setTerm(event.target.value)} aria-invalid={Boolean(duplicate)} aria-describedby="settings-synonym-error" />
      <div id="settings-synonym-error" className="settings-inline-error" role="alert">{duplicate ? 'That term is already used.' : ''}</div>
      <label className="label-base" style={{ marginTop: 12 }}>Also searched as</label>
      <div className="settings-chip-input" onClick={() => document.getElementById('settings-synonym-chip')?.focus()}>{chips.map((chip, index) => <span className="settings-chip" key={`${chip}-${index}`}>{chip}<button type="button" className="settings-chip-remove" aria-label={`Remove ${chip}`} onClick={() => setChips(items => items.filter((_, itemIndex) => index !== itemIndex))}><X size={13} /></button></span>)}<input id="settings-synonym-chip" aria-label="Add synonym" value={chipInput} disabled={chips.length >= 12} onChange={event => setChipInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ',') { event.preventDefault(); addChip(chipInput); } else if (event.key === 'Backspace' && !chipInput && chips.length) setChips(items => items.slice(0, -1)); }} onBlur={() => chipInput.trim() && addChip(chipInput)} /></div>
      <p className="text-meta" style={{ marginTop: 6 }}>{chips.length}/12</p>
      <div className="flex justify-between gap-8" style={{ marginTop: 24 }}><Button variant="ghost" onClick={() => setDialog(null)}>Cancel</Button><Button disabled={!term.trim() || !chips.length || duplicate} onClick={save}>Save</Button></div>
    </SettingsDialog>}
    {deleteTarget && <SettingsDialog title="Delete this synonym set?" onClose={() => setDeleteTarget(null)}><p className="text-body text-muted">{deleteTarget.term}</p><div className="flex justify-between gap-8" style={{ marginTop: 24 }}><Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button className="btn-destructive" onClick={remove}>Delete</Button></div></SettingsDialog>}
  </>;
};

const UserSettings = ({ settings, currentAdmin, showToast }) => <>
  <div className="settings-section-heading"><div><h2 className="text-panel-title text-text">Users and roles</h2><p className="text-muted">Two roles: Authors write and submit. Admins also review, publish and manage settings.</p></div><Button onClick={() => showToast('Coming soon')}>Add user</Button></div>
  <Card className="settings-card"><table className="settings-table"><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th></tr></thead><tbody>{settings.users.map(user => <tr key={user.id}>
    <td data-label="Name"><div className="settings-user"><span className="settings-avatar">{user.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}</span><span>{user.name}</span>{user.id === currentAdmin.id && <span className="settings-you">You</span>}</div></td>
    <td className="text-meta" data-label="Email">{user.email}</td><td data-label="Role"><select className="input-base settings-role-select" value={user.role} aria-label={`${user.name} role`} onChange={() => showToast('Coming soon')}><option>Author</option><option>Admin</option></select></td>
    <td data-label="Status"><span className="settings-status">{user.status}</span></td>
  </tr>)}</tbody></table></Card>
</>;

const FeedbackReasonSettings = ({ settings, showToast }) => {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const addReason = event => {
    event.preventDefault();
    const reason = draft.trim();
    if (!reason) { setError('Enter a feedback reason.'); return; }
    if (settings.feedbackReasons.some(item => item.toLocaleLowerCase() === reason.toLocaleLowerCase())) { setError('That reason already exists.'); return; }
    updateFeedbackReasons([...settings.feedbackReasons.filter(item => item !== 'Other'), reason, 'Other']);
    setDraft('');
    setError('');
    showToast('Feedback reason added');
  };
  const removeReason = reason => {
    if (reason === 'Other') return;
    updateFeedbackReasons(settings.feedbackReasons.filter(item => item !== reason));
    showToast('Feedback reason removed');
  };
  return <>
    <div className="settings-section-heading"><div><h2 className="text-panel-title text-text">Feedback reasons</h2><p className="text-muted">Reasons shown when readers report that an article was not helpful.</p></div></div>
    <Card className="settings-card"><div className="settings-card-body">
      <form className="settings-inline-form" onSubmit={addReason}>
        <input className="input-base" aria-label="New feedback reason" aria-describedby="feedback-reason-error" maxLength={40} placeholder="Add a feedback reason" value={draft} onChange={event => { setDraft(event.target.value); setError(''); }} />
        <Button type="submit">Add reason</Button>
      </form>
      <div id="feedback-reason-error" className="settings-inline-error" role="alert">{error}</div>
      <div className="feedback-reason-list">{settings.feedbackReasons.map((reason, index) => <div className="feedback-reason-row" key={`${reason}-${index}`}>
        <span>{reason}</span>
        {reason === 'Other' ? <span className="text-meta text-muted">Custom response</span> : <Button variant="text" aria-label={`Remove ${reason}`} onClick={() => removeReason(reason)}><Trash2 size={15} /></Button>}
      </div>)}</div>
    </div></Card>
  </>;
};

const AdminSettingsPage = () => {
  const { data, settings, showToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const sections = [
    { id: 'categories', label: 'Categories and sections' },
    { id: 'review', label: 'Review cycle' },
    { id: 'synonyms', label: 'Keywords & synonyms' },
    { id: 'users', label: 'Users and roles' },
    { id: 'feedback-reasons', label: 'Feedback reasons' }
  ];
  const requested = searchParams.get('section');
  const active = sections.some(section => section.id === requested) ? requested : 'categories';
  useEffect(() => { const timer = setTimeout(() => setLoading(false), 400); return () => clearTimeout(timer); }, []);
  if (loading) return <div className="page-container"><Skeleton style={{ width: 220, height: 40 }} /><Skeleton style={{ height: 48 }} /><Skeleton style={{ height: 360 }} /></div>;
  return <div className="page-container" style={{ maxWidth: 1040 }}>
    <header><h1 className="text-display text-text">Settings</h1></header>
    <div className="settings-layout">
      <nav className="settings-subnav" aria-label="Settings sections">{sections.map(section => <button key={section.id} aria-current={active === section.id ? 'page' : undefined} onClick={() => setSearchParams(new URLSearchParams({ section: section.id }))}>{section.label}</button>)}</nav>
      <div className="settings-content">
        {active === 'categories' && <CategorySettings data={data} settings={settings} showToast={showToast} />}
        {active === 'review' && <ReviewCycleSettings data={data} settings={settings} showToast={showToast} />}
        {active === 'synonyms' && <SynonymSettings settings={settings} showToast={showToast} />}
        {active === 'users' && <UserSettings settings={settings} currentAdmin={data.currentAdmin} showToast={showToast} />}
        {active === 'feedback-reasons' && <FeedbackReasonSettings settings={settings} showToast={showToast} />}
      </div>
    </div>
  </div>;
};

const AdminReviewQueue = () => {
  const { data, role } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState('All categories');
  const [loading, setLoading] = useState(true);
  const tabs = [
    { id: 'awaiting', label: 'Awaiting review' },
    { id: 'recheck', label: 'Recheck requests' },
    { id: 'returned', label: 'Returned' },
    { id: 'published', label: 'Published' }
  ];
  const requestedTab = searchParams.get('tab');
  const activeTab = tabs.some(tab => tab.id === requestedTab) ? requestedTab : 'awaiting';
  const counts = selectReviewQueueCounts(data.articles);
  const queueRows = selectReviewQueueTab(data.articles, activeTab, CURRENT_DATE)
    .filter(article => category === 'All categories' || article.category === category);
  const categories = [...new Set(data.articles.map(article => article.category))].sort();
  const emptyText = {
    awaiting: 'Nothing waiting for review.',
    recheck: 'No recheck requests.',
    returned: 'Nothing returned to authors.',
    published: 'Nothing published in the last 30 days.'
  }[activeTab];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const changeTab = (tab) => setSearchParams(new URLSearchParams({ tab }));
  const handleTabKeyDown = (event, index) => {
    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = tabs.length - 1;
    else return;
    event.preventDefault();
    changeTab(tabs[nextIndex].id);
    document.getElementById(`review-tab-${tabs[nextIndex].id}`)?.focus();
  };
  const articleType = (article) => article.reviewState === 'recheck-pending'
    ? 'Recheck'
    : article.changeType || (article.hasPublishedVersion || article.liveVersion || article.version ? 'Updated' : 'New');
  const authorName = (article) => article.authorName || article.author || data.currentUser.name;
  const relativeAge = (date) => {
    const days = Math.floor((CURRENT_DATE.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (days < 1) return getRelativeTime(date);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };
  const relativeStyle = (date) => Math.floor((CURRENT_DATE.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)) >= 3 ? 'text-amber' : 'text-muted';
  if (loading) return <div className="page-container"><Skeleton style={{ width: 260, height: 40 }} /><Skeleton style={{ height: 50 }} /><Skeleton style={{ height: 360 }} /></div>;

  return (
    <div className="page-container" style={{ maxWidth: 1180 }}>
      <header>
        <h1 className="text-display text-text">Review queue</h1>
      </header>
      <div className="review-tabs" role="tablist" aria-label="Review queue status">
        {tabs.map((tab, index) => {
          const count = tab.id === 'awaiting' ? counts.awaiting : tab.id === 'recheck' ? counts.recheck : tab.id === 'returned' ? counts.returned : null;
          const label = count === null ? tab.label : `${tab.label} (${count})`;
          return <button key={tab.id} id={`review-tab-${tab.id}`} className="review-tab" role="tab" aria-selected={activeTab === tab.id} aria-controls="review-queue-panel" tabIndex={activeTab === tab.id ? 0 : -1} onClick={() => changeTab(tab.id)} onKeyDown={event => handleTabKeyDown(event, index)}>{label}</button>;
        })}
      </div>
      <div className="review-tabpanel" id="review-queue-panel" role="tabpanel" aria-labelledby={`review-tab-${activeTab}`} tabIndex="0">
        <div style={{ padding: '16px 0' }}>
          <select className="input-base review-queue-filter" aria-label="Filter by category" value={category} onChange={event => setCategory(event.target.value)}>
            <option>All categories</option>
            {categories.map(item => <option key={item}>{item}</option>)}
          </select>
        </div>
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {queueRows.length ? (
            <table className="table table-responsive review-queue-table" aria-live="polite">
              <thead>
                {activeTab === 'published' ? <tr><th scope="col">Title</th><th scope="col">Author</th><th scope="col">Version</th><th scope="col">Published</th><th scope="col">Action</th></tr> : <tr><th scope="col">Title</th><th scope="col">Author</th><th scope="col">Type</th><th scope="col">{activeTab === 'returned' ? 'Returned' : 'Submitted'}</th><th scope="col">Action</th></tr>}
              </thead>
              <tbody>
                {queueRows.map(article => {
                  const timestamp = activeTab === 'returned' ? article.returnedAt || article.updatedAt : activeTab === 'recheck' ? article.recheckRequestedAt || article.submittedAt || article.updatedAt : article.submittedAt || article.updatedAt;
                  const publishedAt = article.lastConfirmed && new Date(article.lastConfirmed) > new Date(article.lastPublished || 0) ? article.lastConfirmed : article.lastPublished || article.publishedAt;
                  const isRechecked = article.reviewState === 'ok' && article.lastConfirmed && article.lastConfirmed === publishedAt;
                  return (
                    <tr className="dashboard-row" key={article.id}>
                      <td className="dashboard-title-cell dashboard-primary-cell review-queue-title" data-label="Title">
                        <div className="text-ui-label text-text">{article.title}</div>
                        <div className="text-meta text-muted">{article.category} &gt; {article.section}</div>
                      </td>
                      <td data-label="Author">{authorName(article)}</td>
                      {activeTab === 'published' ? (
                        <>
                          <td className="text-meta text-text" data-label="Version">{isRechecked ? 'Rechecked' : `v${article.version || article.liveVersion || '-'}`}</td>
                          <td className="text-meta text-text" data-label="Published">{formatDate(publishedAt)}</td>
                        </>
                      ) : (
                        <>
                          <td data-label="Type"><span className="chip-reason">{articleType(article)}</span></td>
                          <td data-label={activeTab === 'returned' ? 'Returned' : 'Submitted'}><span className={activeTab === 'returned' ? 'text-muted' : relativeStyle(timestamp)}>{relativeAge(timestamp)}</span></td>
                        </>
                      )}
                      <td className="dashboard-action-cell" data-label="Action">
                        <Button variant="ghost" style={{ minHeight: 44 }} aria-label={`${activeTab === 'returned' || activeTab === 'published' ? 'View' : 'Review'} ${article.title}`} onClick={() => navigate(getArticleRoute(article, role), { state: { fromQueue: true, tab: activeTab } })}>{activeTab === 'returned' || activeTab === 'published' ? 'View' : 'Review'}</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : <div style={{ padding: 24 }}><EmptyState title={emptyText} /></div>}
        </Card>
      </div>
    </div>
  );
};

const ReviewDecisionDialogContent = ({ kind, article, commentCount, onCancel, onConfirm }) => {
  const dialogRef = useRef(null);
  useEffect(() => {
    dialogRef.current?.querySelector('button:not([disabled])')?.focus();
  }, []);
  const trapTab = (event) => {
    if (event.key !== 'Tab') return;
    const items = [...(dialogRef.current?.querySelectorAll('button:not([disabled])') || [])];
    if (!items.length) return;
    if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items[items.length - 1].focus(); }
    else if (!event.shiftKey && document.activeElement === items[items.length - 1]) { event.preventDefault(); items[0].focus(); }
  };
  const liveVersion = String(article.liveVersion || article.version || '').replace(/^v/i, '');
  const nextVersion = kind === 'publish-new' ? '1.0' : String(article.nextVersion || `${liveVersion.split('.')[0]}.${Number(liveVersion.split('.')[1] || 0) + 1}`).replace(/^v/i, '');
  const hasLive = Boolean(article.hasPublishedVersion || article.liveVersion || (article.status === 'published' && article.publishedAt));
  return (
    <div ref={dialogRef} className="review-decision-dialog" onKeyDown={trapTab}>
      {kind === 'send-back' && <p className="text-body text-muted">They will see your {commentCount} comments and can edit and resubmit.{hasLive ? ' The live version stays online.' : ''}</p>}
      {kind === 'publish-new' && <p className="text-body text-muted">{article.title} goes live in the Help Center now as v{nextVersion}. Readers can find it in {article.category} &gt; {article.section}.</p>}
      {kind === 'publish-update' && <>
        <p className="text-body text-muted">v{liveVersion} is live now. Publishing replaces it with v{nextVersion}. Readers see the new version immediately.</p>
        <div className="review-dialog-summary"><div>Live now: v{liveVersion} · {formatDate(article.lastPublished || article.publishedAt)}</div><div>Publishing: v{nextVersion} · Today</div></div>
      </>}
      {kind === 'confirm-recheck' && <p className="text-body text-muted">The next review date resets to {formatDate(new Date(CURRENT_DATE.getTime() + (article.reviewCycleDays || article.reviewCycle || 90) * 24 * 60 * 60 * 1000).toISOString())}. The content does not change.</p>}
      {commentCount > 0 && kind.startsWith('publish-') && <p className="review-decision-warning" style={{ marginTop: 16 }}>{commentCount} comments are still attached. Publishing will clear them.</p>}
      <div className="flex justify-between gap-8" style={{ marginTop: 24 }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button className={kind === 'send-back' ? 'btn-destructive' : ''} onClick={onConfirm}>
          {kind === 'send-back' ? 'Send back' : kind === 'publish-new' ? 'Publish' : kind === 'publish-update' ? 'Replace and publish' : 'Confirm'}
        </Button>
      </div>
    </div>
  );
};

const AdminReviewScreen = () => {
  const { id } = useParams();
  const { data, settings, updateArticle, showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const articleRecord = data.articles.find(item => item.id === id);
  const article = useMemo(() => {
    if (!articleRecord) return null;
    const draft = getArticleDraft(articleRecord);
    return {
      ...draft,
      ...articleRecord,
      author: articleRecord.authorName || articleRecord.author || data.currentUser.name,
      summary: articleRecord.summary ?? draft.summary,
      content: getReviewContent(articleRecord),
      hasPublishedVersion: articleRecord.hasPublishedVersion ?? Boolean(articleRecord.liveVersion),
      liveVersion: articleRecord.liveVersion || (articleRecord.status === 'published' ? articleRecord.version : null),
      version: articleRecord.version || null,
      changeType: articleRecord.changeType || (articleRecord.hasPublishedVersion || articleRecord.version ? 'Updated' : 'New'),
      comments: articleRecord.comments || []
    };
  }, [articleRecord, data.currentUser.name]);
  const [panelOpen, setPanelOpen] = useState(window.innerWidth >= 1024);
  const [commentText, setCommentText] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [commentAnchor, setCommentAnchor] = useState(null);
  const [selectionPill, setSelectionPill] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [dialogKind, setDialogKind] = useState(null);
  const [pulseBlockId, setPulseBlockId] = useState(null);
  const dialogReturnFocus = useRef(null);
  const composerRef = useRef(null);
  const documentRef = useRef(null);
  const reviewComments = article?.comments || [];
  const decisionMode = article?.status === 'in-review' || article?.reviewState === 'recheck-pending';
  const recheckMode = article?.reviewState === 'recheck-pending';
  const isSelfApproval = article?.ownerId === data.currentAdmin.id || (article?.authorName || article?.author) === data.currentAdmin.name;
  const authorName = article?.authorName || article?.author || data.currentUser.name;
  const liveVersion = String(article?.liveVersion || article?.version || '').replace(/^v/i, '');
  const version = String(article?.version || article?.liveVersion || '').replace(/^v/i, '');
  const nowIso = CURRENT_DATE.toISOString();

  const closeDialog = () => setDialogKind(null);
  const openDialog = (kind) => {
    dialogReturnFocus.current = document.activeElement;
    setDialogKind(kind);
  };
  useEffect(() => {
    if (dialogKind) return undefined;
    const previous = dialogReturnFocus.current;
    if (previous?.isConnected) previous.focus();
    dialogReturnFocus.current = null;
    return undefined;
  }, [dialogKind]);

  useEffect(() => {
    if (!article || !documentRef.current) return;
    documentRef.current.querySelectorAll('.review-quote-highlight').forEach(mark => {
      const parent = mark.parentNode;
      if (parent) { parent.replaceChild(document.createTextNode(mark.textContent || ''), mark); parent.normalize(); }
    });
    reviewComments.filter(comment => comment.blockId && comment.quotedText).forEach(comment => {
      const row = documentRef.current.querySelector(`[data-block-id="${CSS.escape(comment.blockId)}"]`);
      const scope = comment.itemId ? row?.querySelector(`[data-item-id="${CSS.escape(comment.itemId)}"]`) : row;
      if (!scope) return;
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const position = node.textContent.indexOf(comment.quotedText);
        if (position < 0) continue;
        const range = document.createRange();
        range.setStart(node, position);
        range.setEnd(node, position + comment.quotedText.length);
        const mark = document.createElement('mark');
        mark.className = 'review-quote-highlight';
        mark.dataset.threadId = comment.id;
        range.surroundContents(mark);
        break;
      }
    });
  }, [article, reviewComments]);

  if (!articleRecord || !article) return <div className="page-container"><EmptyState title="Article not found" action={<Button onClick={() => navigate('/admin/review')}>Back to Review queue</Button>} /></div>;

  const commentsInDocumentOrder = [...reviewComments].sort((first, second) => {
    if (!first.blockId && second.blockId) return -1;
    if (first.blockId && !second.blockId) return 1;
    const firstBlock = article.content.findIndex(block => block.id === first.blockId);
    const secondBlock = article.content.findIndex(block => block.id === second.blockId);
    if (firstBlock !== secondBlock) return firstBlock - secondBlock;
    const block = article.content[firstBlock];
    const firstItem = block?.items?.findIndex(item => item.id === first.itemId) ?? -1;
    const secondItem = block?.items?.findIndex(item => item.id === second.itemId) ?? -1;
    return firstItem - secondItem;
  });
  const handleSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (!selectedText || !selection.rangeCount || !documentRef.current?.contains(selection.anchorNode)) { setSelectionPill(null); return; }
    const range = selection.getRangeAt(0);
    const startElement = selection.anchorNode.nodeType === Node.ELEMENT_NODE ? selection.anchorNode : selection.anchorNode.parentElement;
    const blockElement = startElement?.closest('[data-block-id]');
    if (!blockElement) { setSelectionPill(null); return; }
    const itemElement = startElement?.closest('[data-item-id]');
    const rect = range.getBoundingClientRect();
    setCommentAnchor({ blockId: blockElement.dataset.blockId, itemId: itemElement?.dataset.itemId || null, quotedText: selectedText.slice(0, 200) });
    setSelectionPill({ left: rect.left + rect.width / 2, top: Math.max(64, rect.top - 48) });
  };
  const beginGeneralComment = () => {
    setCommentAnchor(null);
    setComposerOpen(true);
    setSelectionPill(null);
    requestAnimationFrame(() => composerRef.current?.focus());
  };
  const beginAnchoredComment = () => {
    setComposerOpen(true);
    setPanelOpen(true);
    setSelectionPill(null);
    requestAnimationFrame(() => composerRef.current?.focus());
  };
  const addComment = () => {
    const text = commentText.trim();
    if (!text) return;
    const comment = {
      id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      blockId: commentAnchor?.blockId || null,
      itemId: commentAnchor?.itemId || null,
      quotedText: commentAnchor?.quotedText || '',
      authorName: data.currentAdmin.name,
      authorRole: 'reviewer',
      text,
      createdAt: CURRENT_DATE.toISOString(),
      resolved: false,
      replies: []
    };
    updateArticle(article.id, { comments: [...reviewComments, comment], reviewerCommentCount: reviewComments.length + 1 });
    setCommentText('');
    setComposerOpen(false);
    setCommentAnchor(null);
    window.getSelection()?.removeAllRanges();
  };
  const focusThread = (comment) => {
    if (comment.blockId) {
      setPulseBlockId(comment.blockId);
      document.querySelector(`[data-block-id="${CSS.escape(comment.blockId)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => setPulseBlockId(null), 1000);
    }
    document.getElementById(`review-thread-${comment.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };
  const handleDocumentClick = (event) => {
    const commentMark = event.target.closest?.('.review-quote-highlight');
    if (commentMark) {
      const comment = reviewComments.find(item => item.id === commentMark.dataset.threadId);
      if (comment) focusThread(comment);
    }
  };
  const deleteComment = () => {
    const remaining = reviewComments.filter(comment => comment.id !== deleteTarget);
    updateArticle(article.id, { comments: remaining, reviewerCommentCount: remaining.length });
    setDeleteTarget(null);
  };
  const submitBack = () => {
    const returnedAt = CURRENT_DATE.toISOString();
    updateArticle(article.id, {
      status: 'changes-requested',
      returnedBy: data.currentAdmin.name,
      returnedAt,
      comments: reviewComments.map(comment => ({ ...comment, authorRole: 'reviewer', resolved: false, replies: [] })),
      reviewerCommentCount: reviewComments.length
    });
    closeDialog();
    showToast(`Sent back to ${authorName}`);
    navigate('/admin/review?tab=returned');
  };
  const approve = () => {
    const nextVersion = article.hasPublishedVersion || article.liveVersion ? String(article.nextVersion || `${liveVersion.split('.')[0]}.${Number(liveVersion.split('.')[1] || 0) + 1}`).replace(/^v/i, '') : '1.0';
    const snapshot = structuredClone({ ...article, status: 'published', version: nextVersion, liveVersion: nextVersion, lastPublished: nowIso });
    const reviewCycle = article.reviewCycleDays || article.reviewCycle || settings.reviewCycle.max;
    updateArticle(article.id, {
      publishedSnapshot: snapshot,
      liveVersion: nextVersion,
      version: nextVersion,
      lastPublished: nowIso,
      publishedAt: nowIso,
      updatedAt: nowIso,
      hasPublishedVersion: true,
      hasRevision: false,
      status: 'published',
      reviewState: 'ok',
      nextReviewAt: new Date(CURRENT_DATE.getTime() + reviewCycle * 24 * 60 * 60 * 1000).toISOString(),
      comments: [],
      reviewerCommentCount: 0
    });
    closeDialog();
    showToast(`${article.title} v${nextVersion} is now live`);
    navigate('/admin/review?tab=published');
  };
  const confirmRecheck = () => {
    const reviewCycle = article.reviewCycleDays || article.reviewCycle || settings.reviewCycle.max;
    updateArticle(article.id, { reviewState: 'ok', lastConfirmed: nowIso, nextReviewAt: new Date(CURRENT_DATE.getTime() + reviewCycle * 24 * 60 * 60 * 1000).toISOString() });
    closeDialog();
    showToast('Review date reset');
    navigate('/admin/review?tab=published');
  };
  const subtitle = decisionMode ? `Submitted by ${authorName} ${getRelativeTime(article.recheckRequestedAt || article.submittedAt || article.updatedAt)}` : article.status === 'changes-requested' ? `Waiting on ${authorName}.` : article.status === 'published' ? `Published v${version} on ${formatDate(article.lastPublished || article.publishedAt)}.` : '';
  const articleType = recheckMode ? 'Recheck' : article.changeType || (article.hasPublishedVersion || article.liveVersion || article.version ? 'Updated' : 'New');
  const hasLiveVersion = Boolean(article.hasPublishedVersion || article.liveVersion || (article.status === 'published' && article.publishedAt));
  const returnToQueue = () => navigate(`/admin/review?tab=${location.state?.tab || 'awaiting'}`);

  return (
    <div className="review-screen">
      <header className="review-screen-header">
        <div className="flex items-center gap-8" style={{ minWidth: 0 }}>
          <Tooltip text={location.state?.fromQueue ? 'Back to Review queue' : 'Back'}><Button variant="text" icon={ChevronLeft} aria-label={location.state?.fromQueue ? 'Back to Review queue' : 'Back'} onClick={location.state?.fromQueue ? returnToQueue : () => navigate(-1)} /></Tooltip>
          <div style={{ minWidth: 0 }}>
            <div className="flex items-center gap-8" style={{ minWidth: 0 }}><strong className="truncate">{article.title}</strong><StatusPill status={recheckMode ? 'in-review' : article.status} label={recheckMode ? 'Recheck request' : article.status === 'in-review' ? 'With reviewer' : article.status === 'changes-requested' ? 'Changes requested' : article.status === 'published' ? `Published v${version}` : undefined} /></div>
            <div className="text-meta text-muted truncate">{subtitle}</div>
          </div>
        </div>
        <Button variant="text" icon={panelOpen ? X : Info} aria-label={panelOpen ? 'Hide review panel' : 'Show review panel'} aria-expanded={panelOpen} onClick={() => setPanelOpen(open => !open)} />
      </header>
      <div className={`review-screen-main ${panelOpen ? 'panel-open' : ''}`}>
        {panelOpen && <button type="button" className="review-panel-scrim" aria-label="Close review panel" onClick={() => setPanelOpen(false)} />}
        <main className="review-document-scroll" onMouseUp={decisionMode ? handleSelection : undefined}>
          <article className="review-document" ref={documentRef} onClick={handleDocumentClick}>
            {decisionMode && recheckMode && <div className="submission-banner">Recheck request. The content has not changed.</div>}
            {decisionMode && !recheckMode && hasLiveVersion && <div className="submission-banner">Live version v{liveVersion} is online. Approving replaces it.</div>}
            <div className="text-meta text-muted">{article.category} &gt; {article.section}</div>
            <h1>{article.title}</h1>
            <div className="text-meta text-muted review-article-meta">By {authorName} · {article.availableFromVersion || (article.version ? `v${article.version}` : 'New article')}</div>
            {article.changeNote && <div className="review-change-note"><strong>What changed</strong><div className="serif">{article.changeNote}</div></div>}
            {article.summary && <p className="review-summary serif">{article.summary}</p>}
            {article.content.map((block, index) => {
              const anchoredComments = commentsInDocumentOrder.filter(comment => comment.blockId === block.id);
              return <div key={block.id} className={`${anchoredComments.length ? 'review-anchored-block ' : ''}${pulseBlockId === block.id ? 'review-block-pulse' : ''}`}>
                <BlockRenderer block={block} index={index} readOnly isFocused={false} onFocus={() => {}} onUpdate={() => {}} onKeyDown={() => {}} onInsertClick={() => {}} />
                {anchoredComments.length > 0 && <div className="review-block-comment">{anchoredComments.map(comment => <button key={comment.id} type="button" aria-label={`Open comment by ${comment.authorName || 'Reviewer'}`} onClick={() => focusThread(comment)}>{comment.authorName || 'Reviewer'}</button>)}</div>}
              </div>;
            })}
          </article>
        </main>
        <aside className={`review-panel ${panelOpen ? 'is-open' : ''}`} aria-label="Review details and comments">
          <div className="review-panel-scroll">
            <Card className="review-panel-card">
              <h2>Submission</h2>
              <div className="review-field"><span className="review-field-label">Author</span><span>{authorName}</span></div>
              <div className="review-field"><span className="review-field-label">Type</span><span>{articleType}</span></div>
              <div className="review-field"><span className="review-field-label">Version</span><span>{hasLiveVersion ? `v${liveVersion} live${article.status === 'in-review' ? `, v${String(article.nextVersion || version).replace(/^v/i, '')} next` : ''}` : 'New article'}</span></div>
              {article.changeNote && <div className="review-field"><span className="review-field-label">Change note</span><span>{article.changeNote}</span></div>}
              {(decisionMode || article.reviewerNote) && <div className="review-field"><span className="review-field-label">Note to reviewer</span><span>{article.reviewerNote || 'No note.'}</span></div>}
              <div className="review-field"><span className="review-field-label">Category &gt; Section</span><span className="text-meta">{article.category} &gt; {article.section}</span></div>
            </Card>
            <section aria-labelledby="review-comments-heading">
              <div className="flex items-center justify-between gap-8" style={{ marginBottom: 12 }}><h2 id="review-comments-heading" className="text-panel-title text-text">Comments</h2><span className="text-meta text-muted" aria-live="polite">{reviewComments.length} comments</span></div>
              {decisionMode && !composerOpen && <Button variant="ghost" style={{ width: '100%', minHeight: 44, marginBottom: 12 }} onClick={beginGeneralComment}>Add general comment</Button>}
              {decisionMode && composerOpen && <form className="review-comment-form" onSubmit={event => { event.preventDefault(); addComment(); }} onKeyDown={event => { if (event.key === 'Escape') { setComposerOpen(false); setCommentText(''); setCommentAnchor(null); } if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') { event.preventDefault(); addComment(); } }}>
                {commentAnchor?.quotedText && <blockquote className="review-thread-quote">“{commentAnchor.quotedText}”</blockquote>}
                <textarea ref={composerRef} aria-label="Comment" value={commentText} onChange={event => setCommentText(event.target.value)} />
                <div className="flex justify-between gap-8"><Button type="button" variant="text" onClick={() => { setComposerOpen(false); setCommentText(''); setCommentAnchor(null); }}>Cancel</Button><Button type="submit" disabled={!commentText.trim()}>Comment</Button></div>
              </form>}
              {reviewComments.length === 0 ? <div className="review-empty-comments">{decisionMode ? 'No comments yet. Select text to comment, or add a general comment.' : 'No comments.'}</div>
                : <div className="review-thread-list">{commentsInDocumentOrder.map(comment => <div id={`review-thread-${comment.id}`} key={comment.id}>
                  <ReviewerThreadCard comment={comment} relativeTime={getRelativeTime(comment.createdAt || article.updatedAt)} formatRelativeTime={getRelativeTime} onSelect={() => focusThread(comment)} onDelete={decisionMode ? () => setDeleteTarget(comment.id) : undefined} />
                  {deleteTarget === comment.id && <div className="review-delete-popover" role="group" aria-label="Delete comment confirmation"><strong>Delete this comment?</strong><div className="flex gap-8"><Button variant="text" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button className="btn-destructive" onClick={deleteComment}>Delete</Button></div></div>}
                </div>)}</div>}
            </section>
          </div>
          {decisionMode ? <footer className="review-panel-footer">
            {recheckMode ? <Tooltip text={isSelfApproval ? "You can't approve your own article." : ''}><span><Button disabled={isSelfApproval} onClick={() => openDialog('confirm-recheck')}>Confirm still accurate</Button></span></Tooltip> : <Tooltip text={isSelfApproval ? "You can't approve your own article." : ''}><span><Button disabled={isSelfApproval} onClick={() => openDialog(article.hasPublishedVersion || article.liveVersion ? 'publish-update' : 'publish-new')}>Approve and publish</Button></span></Tooltip>}
            <Tooltip text={reviewComments.length === 0 ? 'Add at least one comment first' : ''}><span><Button variant="ghost" disabled={reviewComments.length === 0} onClick={() => openDialog('send-back')}>Send back</Button></span></Tooltip>
          </footer> : <footer className="review-panel-footer"><p className="text-muted">{subtitle}</p></footer>}
        </aside>
      </div>
      {selectionPill && decisionMode && <button type="button" className="review-selection-pill" style={{ left: selectionPill.left, top: selectionPill.top }} aria-label="Comment on selected text" onMouseDown={event => event.preventDefault()} onClick={beginAnchoredComment}>Comment</button>}
      {dialogKind && <Dialog isOpen onClose={closeDialog} title={dialogKind === 'send-back' ? `Send back to ${authorName}?` : dialogKind === 'publish-new' ? 'Publish this article?' : dialogKind === 'publish-update' ? 'Replace the live version?' : 'Confirm this article is still accurate?'}>
        <ReviewDecisionDialogContent kind={dialogKind} article={article} commentCount={reviewComments.length} onCancel={closeDialog} onConfirm={dialogKind === 'send-back' ? submitBack : dialogKind === 'confirm-recheck' ? confirmRecheck : approve} />
      </Dialog>}
    </div>
  );
};

const RoleDashboardRoute = ({ admin }) => {
  const { role } = useApp();
  const isAdmin = role !== 'Author';
  if (isAdmin !== admin) return <Navigate to={isAdmin ? '/admin/dashboard-admin' : '/admin/dashboard'} replace />;
  return admin ? <AdminDashboard /> : <Dashboard />;
};

const AdminOnlyRoute = ({ children }) => {
  const { role } = useApp();
  return role === 'Author' ? <Navigate to="/admin/dashboard" replace /> : children;
};

const RoleRootRoute = () => {
  const { role } = useApp();
  return <Navigate to={role === 'Author' ? '/admin/dashboard' : '/admin/dashboard-admin'} replace />;
};

const Shell = ({ children }) => {
  const { role, toastMsg } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isArticleEditorRoute = /^\/admin\/articles\/[^/]+$/.test(location.pathname);

  if (role === 'Author' && isArticleEditorRoute) {
    return (
      <div className="shell">
        {children}
        {toastMsg && <div className="toast-container"><div className="toast"><Info size={16} className="text-amber" />{toastMsg}</div></div>}
      </div>
    );
  }

  return (
    <div className="shell">
      <Topbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="body-area">
        <Sidebar isOpen={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="main-content focus-trap" tabIndex="-1">
          {children}
        </main>
      </div>
      {toastMsg && <div className="toast-container"><div className="toast"><Info size={16} className="text-amber" />{toastMsg}</div></div>}
    </div>
  );
};

const DraftArticleEditorRoute = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data, updateArticle } = useApp();
  const sourceArticle = data.articles.find(article => article.id === id);

  const handleSubmitted = (submittedArticle) => {
    updateArticle(id, {
      status: 'in-review',
      hasRevision: submittedArticle.hasRevision || submittedArticle.hasPublishedVersion,
      hasPublishedVersion: submittedArticle.hasPublishedVersion,
      liveVersion: submittedArticle.liveVersion,
      publishedSnapshot: submittedArticle.publishedSnapshot,
      submittedAt: submittedArticle.submittedAt,
      reviewerNote: submittedArticle.reviewerNote,
      summary: submittedArticle.summary,
      keywords: submittedArticle.keywords,
      synonyms: submittedArticle.synonyms,
      changeType: submittedArticle.changeType,
      changeNote: submittedArticle.changeNote,
      availableFromVersion: submittedArticle.availableFromVersion,
      relatedIds: submittedArticle.relatedIds,
      reviewCycle: submittedArticle.reviewCycle,
      returnedEditedAt: submittedArticle.returnedEditedAt,
      comments: submittedArticle.comments,
      reviewerCommentCount: 0,
      content: submittedArticle.content
    });
  };

  const handleSaved = (savedArticle) => {
    updateArticle(id, {
      title: savedArticle.title,
      category: savedArticle.category,
      section: savedArticle.section,
      status: savedArticle.status,
      hasRevision: savedArticle.hasRevision,
      hasPublishedVersion: savedArticle.hasPublishedVersion,
      liveVersion: savedArticle.liveVersion,
      publishedSnapshot: savedArticle.publishedSnapshot,
      summary: savedArticle.summary,
      keywords: savedArticle.keywords,
      synonyms: savedArticle.synonyms,
      changeType: savedArticle.changeType,
      changeNote: savedArticle.changeNote,
      availableFromVersion: savedArticle.availableFromVersion,
      relatedIds: savedArticle.relatedIds,
      reviewCycle: savedArticle.reviewCycle,
      returnedEditedAt: savedArticle.returnedEditedAt,
      comments: savedArticle.comments,
      reviewerCommentCount: (savedArticle.comments || []).filter(comment => !comment.resolved).length,
      content: savedArticle.content
    });
  };

  return <DraftArticleEditor articleId={id} articleRecord={sourceArticle} onBack={() => navigate('/admin/articles')} onSaved={handleSaved} onSubmitted={handleSubmitted} />;
};

export default function AdminApp({ initialRole = 'Author', onModeChange }) {
  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <AppProvider initialRole={initialRole} onModeChange={onModeChange}>
        <HashRouter>
          <Shell>
            <Routes>
              <Route path="/" element={<RoleRootRoute />} />
              <Route path="/admin" element={<RoleRootRoute />} />
              <Route path="/admin/dashboard" element={<RoleDashboardRoute admin={false} />} />
              <Route path="/admin/dashboard-admin" element={<RoleDashboardRoute admin />} />
              <Route path="/admin/settings" element={<AdminOnlyRoute><AdminSettingsPage /></AdminOnlyRoute>} />
              <Route path="/admin/review-queue" element={<Navigate to="/admin/review?tab=awaiting" replace />} />
              <Route path="/admin/review" element={<AdminOnlyRoute><AdminReviewQueue /></AdminOnlyRoute>} />
              <Route path="/admin/review/:id" element={<AdminOnlyRoute><AdminReviewScreen /></AdminOnlyRoute>} />
              <Route path="/admin/articles" element={<MyArticles />} />
              <Route path="/admin/articles/:id" element={<DraftArticleEditorRoute />} />
              <Route path="/admin/feedback" element={<ReaderFeedbackPage />} />
              <Route path="/admin/*" element={<ComingNext />} />
            </Routes>
          </Shell>
        </HashRouter>
      </AppProvider>
    </>
  );
}
