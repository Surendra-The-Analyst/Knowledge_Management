import React, { useState, useEffect, useRef, useMemo, useSyncExternalStore } from 'react';
import { 
    Moon, Sun, Menu, Search, User, UserPlus, MessageSquare, 
    Users, FileText, Settings, Video, Shield, CreditCard, 
    ArrowRight, Clock, HelpCircle, X, Compass, ArrowUpRight,
    ArrowLeft, ChevronRight, BookOpen, AlertCircle, Sparkles,
    Filter, ChevronLeft, ChevronDown, Check, SlidersHorizontal,
    Tag, CornerDownLeft, Copy, ThumbsUp, ThumbsDown, CheckCircle2,
    Printer, Download, List, Info, ChevronUp, File
} from 'lucide-react';
import AdminApp from './AdminApp.jsx';
import { getAdminSettings, subscribeAdminSettings } from './data/adminSettings.js';

const globalStyles = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400&display=swap');

:root {
    --bg: #FAF8F4;
    --surface: #FFFFFF;
    --border: #E7E2D8;
    --text: #0B1F3A;
    --text-muted: #5B6678;
    --navy: #0B1F3A;
    --navy-text: #FFFFFF;
    --amber: #E8A317;
    --amber-soft: #FDF3DF;
    --amber-hover: #D4920F;
    --teal: #1F7A7A;
    --teal-soft: #E3F0EF;
}

:root[data-theme="dark"] {
    --bg: #0E1726;
    --surface: #152033;
    --border: #26344A;
    --text: #EAF0F8;
    --text-muted: #9AA7BA;
    --navy: #0A1220;
    --navy-text: #EAF0F8;
    --amber: #F2B636;
    --amber-soft: #3B2A0F;
    --amber-hover: #D4920F; 
    --teal: #4FB3B0;
    --teal-soft: #1C333D; 
}

body {
    background-color: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    margin: 0;
    -webkit-font-smoothing: antialiased;
}

.font-heading { font-family: 'Bricolage Grotesque', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }
.font-serif { font-family: 'Source Serif 4', Georgia, serif; }

*:focus-visible {
    outline: 2px solid var(--amber);
    outline-offset: 1px;
    border-radius: 2px;
}

.no-focus-outline:focus-visible { outline: none !important; }
.search-focus-ring:focus-within {
    border-color: var(--amber) !important;
    outline: none;
}

.theme-transition * {
    transition-property: background-color, border-color, color, fill, stroke, box-shadow;
    transition-duration: 150ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
    .theme-transition * { transition-duration: 0.01ms !important; }
    html { scroll-behavior: auto !important; }
}

html { scroll-behavior: smooth; }

.custom-scrollbar::-webkit-scrollbar { height: 8px; width: 8px; }
.custom-scrollbar::-webkit-scrollbar-track { background: var(--bg); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
`;

window.AdminLogs = window.AdminLogs || { zeroResults: [], searchClicks: [], feedback: [] };
const logZeroResult = (query) => window.AdminLogs.zeroResults.push({ query, timestamp: new Date().toISOString() });
const logSearchClick = (query, articleId, position) => window.AdminLogs.searchClicks.push({ query, articleId, position, timestamp: new Date().toISOString() });
const logFeedback = (data) => window.AdminLogs.feedback.push({ ...data, timestamp: new Date().toISOString() });
const useFeedbackReasons = () => useSyncExternalStore(subscribeAdminSettings, () => getAdminSettings().feedbackReasons, () => getAdminSettings().feedbackReasons);

const CURRENT_DATE = new Date('2026-10-12');
const isWithin30Days = (dateStr) => {
    if (!dateStr) return false;
    const diffDays = Math.ceil(Math.abs(CURRENT_DATE - new Date(dateStr)) / (1000 * 60 * 60 * 24)); 
    return diffDays <= 30;
};

const slugify = (text) => text.toString().toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '');

const MOCK_DATA = {
    whatsNew: [
        { id: 'wn1', badge: 'new', title: 'Auto-delete for groups', description: 'Schedule messages in a group to be removed automatically.', version: 'v5.2', date: '08 Oct 2026' },
        { id: 'wn2', badge: 'new', title: 'Voice message recording in browser', description: 'Record and send voice notes from the web app.', version: 'v5.2', date: '02 Oct 2026' },
        { id: 'wn3', badge: 'updated', title: 'Composer settings', description: 'Control formatting, mentions and sending options in the composer.', version: 'v5.1', date: '24 Sep 2026' }
    ],
    topics: [
        { id: 't1', icon: 'UserPlus', title: 'User Onboarding & Directories', description: 'Add users, bulk upload, SSO sync, profile setup.', count: 14 },
        { id: 't2', icon: 'MessageSquare', title: 'Messaging & Chats', description: 'Direct chats, formatting, read receipts, voice and video messages.', count: 18 },
        { id: 't3', icon: 'Users', title: 'Collaboration Groups', description: 'Create and manage regular or auto-populated groups and modes.', count: 12 },
        { id: 't4', icon: 'FileText', title: 'Files & Attachments', description: 'Size limits, allowed file types, upload permissions, batch uploads.', count: 9 },
        { id: 't5', icon: 'Settings', title: 'Organizational Units & Rules', description: 'Segment employees into units with access rules and leader overrides.', count: 8 },
        { id: 't6', icon: 'Video', title: 'Voice, Video & Screen Sharing', description: 'Audio and video calls and screen sharing sessions.', count: 11 },
        { id: 't7', icon: 'Shield', title: 'Security & Workspace Restrictions', description: 'IP blacklists, platform limits, screenshot restrictions.', count: 10 },
        { id: 't8', icon: 'CreditCard', title: 'Billing & Plan Subscriptions', description: 'Trial days, payments, auto-renewal, license top-ups.', count: 6 }
    ],
    popular: [
        { id: 'ag2', title: 'Create Regular Group', description: 'Create a group manually, choose its messaging mode and assign roles.', author: 'Troop Team', version: 'v5.1', date: '24 Sep 2026', views: '24.8K', badge: null, category: 'Collaboration Groups', section: 'Groups & Modes' },
        { id: 'ag1', title: 'Enable Airtime Mode for this Group', description: 'Turn a group into a broadcast channel where only owners and moderators can send messages.', author: 'Troop Team', version: 'v5.2', date: '08 Oct 2026', views: '18.3K', badge: 'updated', category: 'Collaboration Groups', section: 'Groups & Modes' },
        { id: 'ag4', title: "Set Chat History Access", description: 'Choose how much past chat new members can see.', author: 'Support', version: 'v5.0', date: '10 Sep 2026', views: '15.1K', badge: null, category: 'Collaboration Groups', section: 'Membership & Access' },
        { id: 'p4', title: 'Burnout Ephemeral Sessions', description: 'Quick, untraceable sessions designed for high security.', author: 'Security', version: 'v5.1', date: '15 Sep 2026', views: '12.4K', badge: null, category: 'Security & Workspace Restrictions' },
        { id: 'p5', title: 'Schedule Message Delivery', description: 'Write now, send later across timezones.', author: 'Troop Team', version: 'v5.0', date: '01 Aug 2026', views: '9.2K', badge: null, category: 'Messaging & Chats' },
        { id: 'p6', title: 'Speech to Text (STT) Transcription', description: 'Automatically generate readable transcripts from voice notes.', author: 'Troop Team', version: 'v5.0', date: '20 Jul 2026', views: '8.7K', badge: null, category: 'Messaging & Chats' }
    ],
    recentlyUpdated: [
        { id: 'ag1', title: 'Enable Airtime Mode for this Group', description: 'Turn a group into a broadcast channel where only owners and moderators can send messages.', author: 'Troop Team', version: 'v5.2', date: '08 Oct 2026', badge: 'updated', category: 'Collaboration Groups', section: 'Groups & Modes' },
        { id: 'ag3', title: 'Airtime vs Standard Messaging Mode', description: 'Compare who can send and view in each messaging mode.', author: 'Troop Team', version: 'v5.2', date: '02 Oct 2026', badge: 'new', category: 'Collaboration Groups', section: 'Groups & Modes' },
        { id: 'r3', title: 'Composer Settings', description: 'Format your text effectively using the rich text composer.', author: 'Support', version: 'v5.1', date: '24 Sep 2026', badge: 'updated', category: 'Messaging & Chats' },
        { id: 'ag5', title: 'Auto-populated Groups Membership', description: 'How members join and leave groups managed by company, department, location or directory rules.', author: 'Admin Team', version: 'v5.1', date: '24 Sep 2026', badge: null, category: 'Collaboration Groups', section: 'Membership & Access' },
        { id: 'ag2', title: 'Create Regular Group', description: 'Create a group manually, choose its messaging mode and assign roles.', author: 'Troop Team', version: 'v5.1', date: '24 Sep 2026', badge: null, category: 'Collaboration Groups', section: 'Groups & Modes' },
        { id: 'ag4', title: 'Set Chat History Access', description: 'Choose how much past chat new members can see.', author: 'Support', version: 'v5.0', date: '10 Sep 2026', badge: null, category: 'Collaboration Groups', section: 'Membership & Access' }
    ],
    searchIndex: [
        { 
            id: 'ag1', title: 'Enable Airtime Mode for this Group', 
            keywords: ['airtime', 'airtime group', 'airtime mode', 'broadcast group', 'view-only group', 'receive-only', 'announcement group', 'group messaging mode'],
            synonyms: { 'broadcast': 'airtime', 'announcement': 'airtime', 'read only group': 'airtime', 'view only': 'airtime' },
            summary: 'Turn a group into a broadcast channel where only owners and moderators can send messages.',
            headings: [
                { text: 'Overview', body: 'A group in Airtime Mode works like an announcement channel. Group Owners and Group Moderators can send text, media, attachments, voice and video messages. Other members have receive-only access. Airtime used to be a separate group type. It is now a messaging mode, so you can switch it on or off for any group type: Regular, Organization-wide, Rule-based and Directory-synced groups.' },
                { text: 'Before you begin', body: 'Airtime Mode must be allowed by your workspace administrator in Admin Console > Settings > Group Controls. If it is switched off, the option is hidden when you create or edit a group.' },
                { text: 'Enable Airtime Mode', body: 'You can switch Airtime Mode on while creating a group, or later while editing it. Open group creation or editing. Tick the Airtime checkbox. Tooltip text: Only Group Owners and Group Moderators can send messages. Other members can view messages and shared content but cannot send messages.' },
                { text: 'Standard vs Airtime', body: 'In Standard mode, all members can send. In Airtime mode, only Group Owners and Moderators can send messages. Buzz + Fanout cannot be combined in an Airtime group unless you are its Group Owner or a Group Moderator.' },
                { text: 'Group ID and tags', body: 'Every group gets an automatic Group ID. For Airtime groups the ID includes the AT marker so you can recognise them quickly. To see only Airtime groups in your chat list, open the Side Panel and choose Filters > Groups > Airtime Groups.' },
                { text: 'Common questions', body: 'Why can\'t I send messages in this group? The group is in Airtime Mode. Why don\'t I see the Airtime checkbox? Your administrator may have switched Airtime Mode off. Can I turn Airtime Mode on for an auto-populated group? Yes. Can Basic users send messages in an Airtime group? No.' }
            ],
            body: 'Airtime Mode turns a group into a broadcast channel. Only Group Owners and Group Moderators can send messages. Everyone else can read messages, play media and download shared files, but cannot send.',
            path: 'Help Center > Collaboration Groups > Groups & Modes', category: 'Collaboration Groups', section: 'Groups & Modes', author: 'Troop Team', version: 'v5.2', updatedInVersion: 'v5.2', availableFromVersion: 'v5.2', updatedAt: '08 Oct 2026', views: 18300, status: 'published', badge: 'updated', readTime: '4 min read',
            changeNote: 'Airtime is now a messaging mode you can switch on for any group type, instead of a separate group type.'
        },
        { 
            id: 'ag2', title: 'Create Regular Group', 
            keywords: ['new group', 'add group', 'create group'],
            summary: 'Create a group manually, choose its messaging mode and assign roles.',
            headings: [], body: 'To create a regular group, click the plus icon. You can choose the messaging mode, if available. Group roles include Group Owner, Group Moderator, and Standard Member.',
            path: 'Help Center > Collaboration Groups > Groups & Modes', category: 'Collaboration Groups', section: 'Groups & Modes', author: 'Troop Team', version: 'v5.1', updatedInVersion: 'v5.1', availableFromVersion: 'v5.0', updatedAt: '24 Sep 2026', views: 24800, status: 'published', readTime: '3 min read'
        },
        { 
            id: 'ag3', title: 'Airtime vs Standard Messaging Mode', 
            keywords: ['compare', 'difference', 'broadcast vs standard'],
            summary: 'Compare who can send and view in each messaging mode.',
            headings: [], body: 'Standard mode is for team discussion. Airtime is for announcements and one-way updates.',
            path: 'Help Center > Collaboration Groups > Groups & Modes', category: 'Collaboration Groups', section: 'Groups & Modes', author: 'Troop Team', version: 'v5.2', updatedInVersion: 'v5.2', availableFromVersion: 'v5.2', updatedAt: '02 Oct 2026', views: 4200, status: 'published', badge: 'new', readTime: '2 min read'
        },
        { 
            id: 'ag5', title: 'Auto-populated Groups Membership', 
            keywords: ['dynamic group', 'auto group', 'directory sync'],
            summary: 'How members join and leave groups managed by company, department, location or directory rules.',
            headings: [], body: 'These groups automatically add or remove users based on their Active Directory department tags. You cannot manually add a user to this group.',
            path: 'Help Center > Collaboration Groups > Membership & Access', category: 'Collaboration Groups', section: 'Membership & Access', author: 'Admin Team', version: 'v5.1', updatedInVersion: 'v5.1', availableFromVersion: 'v5.0', updatedAt: '24 Sep 2026', views: 1100, status: 'published', readTime: '5 min read'
        },
        { 
            id: 'ag4', title: 'Set Chat History Access', 
            keywords: ['history', 'old messages', 'chat history'],
            summary: 'Choose how much past chat new members can see.',
            headings: [], body: 'Admins can change group settings to allow new joins to read all historical chat data, or keep it restricted.',
            path: 'Help Center > Collaboration Groups > Membership & Access', category: 'Collaboration Groups', section: 'Membership & Access', author: 'Support', version: 'v5.0', updatedInVersion: 'v5.0', availableFromVersion: 'v5.0', updatedAt: '10 Sep 2026', views: 15100, status: 'published', readTime: '2 min read'
        },
        { id: 'p4', title: 'Burnout Ephemeral Sessions', keywords: ['burnout', 'disappearing', 'ephemeral', 'privacy'], summary: 'Quick, untraceable sessions designed for high security.', headings: [], body: 'Burnout sessions do not log history. Once the window is closed, all messages are permanently destroyed.', path: 'Help Center > Security & Workspace Restrictions > Chat Policies', category: 'Security & Workspace Restrictions', author: 'Security Team', version: 'v5.1', updatedInVersion: 'v5.1', availableFromVersion: 'v5.1', updatedAt: '15 Sep 2026', views: 12400, status: 'published' },
        { id: 'f1', title: 'Managing Group Notifications', keywords: ['mute', 'alerts'], summary: 'Mute, unmute, and customize alerts for specific groups.', body: 'You can mute a group for 1 hour, 8 hours, or indefinitely.', path: 'Help Center > Messaging & Chats > Alerts', category: 'Messaging & Chats', author: 'Troop Team', version: 'v5.1', updatedInVersion: 'v5.1', availableFromVersion: 'v5.0', updatedAt: '20 Sep 2026', views: 5000, status: 'published' },
        { id: 'f2', title: 'Leaving a Group', keywords: ['exit', 'quit'], summary: 'How to exit a group chat gracefully.', body: 'Click the exit button in the top right. You can be re-invited later.', path: 'Help Center > Collaboration Groups > Membership', category: 'Collaboration Groups', author: 'Support', version: 'v5.0', updatedInVersion: 'v5.0', availableFromVersion: 'v5.0', updatedAt: '12 Jul 2026', views: 2000, status: 'published' },
        { id: 'f3', title: 'Adding External Guests to a Group', keywords: ['vendor', 'client', 'guest'], summary: 'Invite vendors and clients to collaborate in isolated groups.', body: 'Guest accounts have limited access and cannot see the main directory.', path: 'Help Center > Security & Workspace Restrictions > Guests', category: 'Security & Workspace Restrictions', author: 'Security Team', version: 'v5.2', updatedInVersion: 'v5.2', availableFromVersion: 'v5.1', updatedAt: '09 Oct 2026', views: 1500, status: 'published' },
        { id: 'f4', title: 'Group Size Limits and Capacity', keywords: ['limit', 'max', 'size'], summary: 'Understand how many users can join a single regular group.', body: 'A standard group supports up to 10,000 members.', path: 'Help Center > Collaboration Groups > Guidelines', category: 'Collaboration Groups', author: 'Admin Team', version: 'v5.0', updatedInVersion: 'v5.0', availableFromVersion: 'v5.0', updatedAt: '14 May 2026', views: 800, status: 'published' },
        { id: 'f5', title: 'Archive Inactive Groups', keywords: ['archive', 'hide', 'clean'], summary: 'Clean up your sidebar by archiving stale groups.', body: 'Archiving a group hides it from your view but preserves history.', path: 'Help Center > Collaboration Groups > Guidelines', category: 'Collaboration Groups', author: 'Support', version: 'v5.1', updatedInVersion: 'v5.1', availableFromVersion: 'v5.0', updatedAt: '30 Aug 2026', views: 3200, status: 'published' },
        { id: 'f6', title: 'Group File Storage Quotas', keywords: ['storage', 'quota', 'files'], summary: 'Manage the total size of attachments shared within a group.', body: 'Each group has a 50GB limit by default.', path: 'Help Center > Files & Attachments > Storage', category: 'Files & Attachments', author: 'Admin Team', version: 'v5.1', updatedInVersion: 'v5.1', availableFromVersion: 'v5.0', updatedAt: '22 Sep 2026', views: 600, status: 'published' },
        { id: 'f7', title: 'Deleting a Group', keywords: ['delete', 'remove', 'destroy'], summary: 'Permanently remove a group and its history.', body: 'This action cannot be undone. All files and chat logs are wiped.', path: 'Help Center > Collaboration Groups > Admin', category: 'Collaboration Groups', author: 'Admin Team', version: 'v5.0', updatedInVersion: 'v5.0', availableFromVersion: 'v5.0', updatedAt: '05 Jun 2026', views: 1200, status: 'published' },
        { id: 'f8', title: 'Group Video Calling', keywords: ['video', 'call', 'meeting'], summary: 'Start a synchronous video meeting with all group members.', body: 'Click the camera icon to ring all active members in the group.', path: 'Help Center > Voice, Video & Screen Sharing > Calls', category: 'Voice, Video & Screen Sharing', author: 'Troop Team', version: 'v5.1', updatedInVersion: 'v5.1', availableFromVersion: 'v5.0', updatedAt: '01 Oct 2026', views: 9000, status: 'published' },
        { id: 'f9', title: 'Screen Sharing in Group Calls', keywords: ['screen', 'share', 'present'], summary: 'Present your screen to multiple participants in a group.', body: 'You can share a specific window or your entire desktop during a group call.', path: 'Help Center > Voice, Video & Screen Sharing > Calls', category: 'Voice, Video & Screen Sharing', author: 'Support', version: 'v5.1', updatedInVersion: 'v5.1', availableFromVersion: 'v5.0', updatedAt: '28 Sep 2026', views: 7500, status: 'published' },
        { id: 'f10', title: 'Group Analytics and Activity', keywords: ['analytics', 'stats', 'activity'], summary: 'Track engagement and message volume across groups.', body: 'Admins can view daily message counts and active user ratios for any group.', path: 'Help Center > Settings > Reporting', category: 'Settings', author: 'Admin Team', version: 'v5.0', updatedInVersion: 'v5.0', availableFromVersion: 'v5.0', updatedAt: '11 Apr 2026', views: 400, status: 'published' },
        { id: 'f11', title: 'Promoting a Member to Group Admin', keywords: ['promote', 'admin', 'role'], summary: 'Delegate management tasks to other users in your group.', body: 'Right click a user in the sidebar and select Make Admin.', path: 'Help Center > Collaboration Groups > Roles', category: 'Collaboration Groups', author: 'Support', version: 'v5.0', updatedInVersion: 'v5.0', availableFromVersion: 'v5.0', updatedAt: '25 Jul 2026', views: 2200, status: 'published' },
        { id: 'f12', title: 'Group Mentions (@all vs @here)', keywords: ['mention', 'tag', 'all', 'here'], summary: 'Learn when to notify everyone versus only active members.', body: 'Using @all pushes a notification to everyone. @here only pings those currently online.', path: 'Help Center > Messaging & Chats > Mentions', category: 'Messaging & Chats', author: 'Troop Team', version: 'v5.2', updatedInVersion: 'v5.2', availableFromVersion: 'v5.2', updatedAt: '06 Oct 2026', views: 15000, status: 'published' }
    ],
    historyMap: {
        'ag1': [
            { version: 'v5.2', date: '08 Oct 2026', author: 'Troop Team', note: 'Airtime is now a messaging mode for all group types. Added Group ID and Side Panel filter details.' },
            { version: 'v5.1', date: '24 Sep 2026', author: 'Troop Team', note: 'Clarified who can change the messaging mode.' },
            { version: 'v5.0', date: '10 Sep 2026', author: 'Troop Team', note: 'First published.' }
        ]
    }
};

const STOP_WORDS = new Set(['the', 'a', 'an', 'how', 'to', 'in', 'on', 'of', 'for', 'is', 'can', 'and', 'with', 'this', 'that', 'it', 'at', 'by', 'are']);

function getEditDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator);
        }
    }
    return matrix[b.length][a.length];
}

function isMatch(qWord, docWord) {
    if (!docWord) return false;
    if (docWord.startsWith(qWord)) return true;
    const len = qWord.length;
    if (len >= 4) {
        const dist = getEditDistance(qWord, docWord);
        if (len >= 8 && dist <= 2) return true;
        if (len >= 4 && dist <= 1) return true;
    }
    return false;
}

function tokenize(text) {
    if (!text) return [];
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(w => w.length > 0 && !STOP_WORDS.has(w)).map(w => w.replace(/(es|s)$/, ''));
}

const corpusTermFreq = {};
MOCK_DATA.searchIndex.forEach(doc => {
    let rawText = `${doc.title} ${doc.summary} ${doc.body} ${(doc.keywords||[]).join(' ')}`;
    if (doc.headings) rawText += ' ' + doc.headings.map(h => `${h.text} ${h.body}`).join(' ');
    const tokens = new Set(tokenize(rawText));
    tokens.forEach(t => { corpusTermFreq[t] = (corpusTermFreq[t] || 0) + 1; });
});
const totalDocs = MOCK_DATA.searchIndex.length;
const getIDF = (word) => Math.max(1, Math.log10(totalDocs / (corpusTermFreq[word] || 1)));

const searchEngine = (queryStr) => {
    if (!queryStr || queryStr.trim().length < 2) return { results: [], maxScore: 0 };
    
    let qWordsRaw = tokenize(queryStr);
    let maxScore = 0;
    
    const scoredDocs = MOCK_DATA.searchIndex.map(doc => {
        let score = 0;
        let matchedFields = [];
        let bestSnippet = doc.summary;
        let allTermsMatched = true;

        const qWords = qWordsRaw.map(w => (doc.synonyms && doc.synonyms[w]) ? doc.synonyms[w] : w);
        const docTitleTokens = tokenize(doc.title);
        const fullRawText = `${doc.title} ${doc.summary} ${doc.body} ${doc.headings ? doc.headings.map(h=>h.text+' '+h.body).join(' ') : ''}`.toLowerCase();

        qWords.forEach(qw => {
            let termMatched = false;
            let termScore = 0;
            const idf = getIDF(qw);

            if (docTitleTokens.some(dw => isMatch(qw, dw))) { termScore += 10 * idf; matchedFields.push('Title'); termMatched = true; }
            if (doc.keywords && doc.keywords.some(kw => tokenize(kw).some(dw => isMatch(qw, dw)))) { termScore += 8 * idf; matchedFields.push('Keyword'); termMatched = true; }
            
            if (doc.headings) {
                doc.headings.forEach(h => {
                    if (tokenize(h.text).some(dw => isMatch(qw, dw))) {
                        termScore += 5 * idf; matchedFields.push('Heading'); termMatched = true;
                        if (!matchedFields.includes('Title')) bestSnippet = h.body;
                    } else if (tokenize(h.body).some(dw => isMatch(qw, dw))) {
                        termScore += 1 * idf; matchedFields.push('Content'); termMatched = true;
                        if (!matchedFields.includes('Title') && !matchedFields.includes('Heading') && !matchedFields.includes('Keyword')) bestSnippet = h.body;
                    }
                });
            }
            if (tokenize(doc.summary).some(dw => isMatch(qw, dw))) { termScore += 3 * idf; matchedFields.push('Content'); termMatched = true; }
            if (tokenize(doc.body).some(dw => isMatch(qw, dw))) { 
                termScore += 1 * idf; matchedFields.push('Content'); termMatched = true; 
                if (matchedFields.length === 1 && matchedFields[0] === 'Content') bestSnippet = doc.body;
            }

            if (!termMatched) allTermsMatched = false;
            score += termScore;
        });

        if (score === 0) return null;

        if (allTermsMatched && qWords.length > 1) score *= 1.5;
        const qRaw = queryStr.toLowerCase().trim();
        if (fullRawText.includes(qRaw)) score += 15;
        
        if (doc.badge === 'new' || doc.badge === 'updated') score *= 1.1;
        if (doc.views > 10000) score *= 1.05;
        if (doc.status === 'retired') score *= 0.5;

        if (score > maxScore) maxScore = score;

        let bestTag = 'Content';
        if (matchedFields.includes('Title')) bestTag = 'Title';
        else if (matchedFields.includes('Keyword')) bestTag = 'Keyword';
        else if (matchedFields.includes('Heading')) bestTag = 'Heading';

        return { ...doc, _score: score, _tag: bestTag, snippet: bestSnippet };
    }).filter(Boolean);

    const threshold = maxScore * 0.25;
    const finalResults = scoredDocs.filter(d => d._score >= threshold).sort((a, b) => b._score - a._score);
    return { results: finalResults, maxScore };
};

const delay = (ms) => new Promise(res => setTimeout(res, ms));

const executeSearch = async (query, categories = [], sort = 'relevance', page = 1, isDropdown = false) => {
    await delay(300);
    const q = query.trim().toLowerCase();
    
    if (q === 'error') throw new Error('Search is unavailable right now.');
    if (q === 'airtime billing') return { articles: [], totalArticles: 0, unfilteredTotal: 0, totalPages: 0, categoryCounts: {}, didYouMean: 'airtime group', completions: [], topics: [] };

    const searchResponse = searchEngine(q);
    let allMatches = searchResponse.results.map(a => ({...a, badge: isWithin30Days(a.updatedAt) ? a.badge : null}));

    let filteredMatches = categories.length > 0 ? allMatches.filter(a => categories.includes(a.category)) : allMatches;

    if (sort === 'updated') filteredMatches.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    const categoryCounts = allMatches.reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
    }, {});

    let dropdownMatches = filteredMatches;
    let strongHitsCount = 0;
    if (isDropdown) {
        const strongHits = filteredMatches.filter(a => a._tag !== 'Content');
        const bodyHits = filteredMatches.filter(a => a._tag === 'Content');
        dropdownMatches = [...strongHits, ...bodyHits.slice(0, 1)];
        strongHitsCount = strongHits.length;
    }

    const limit = isDropdown ? 5 : 10;
    const finalResultsToPaginate = isDropdown ? dropdownMatches : filteredMatches;
    const totalPages = Math.ceil(finalResultsToPaginate.length / limit);
    const startIndex = (page - 1) * limit;
    const paginatedResults = finalResultsToPaginate.slice(startIndex, startIndex + limit);

    let completions = [];
    if (q.startsWith('air')) completions = ['airtime group', 'airtime settings'];
    else if (allMatches.length > 0 && q.length > 2) completions = [`${q} settings`, `${q} guide`];
    if (isDropdown && strongHitsCount >= 3) completions = [];

    const topics = MOCK_DATA.topics.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));

    return {
        articles: paginatedResults,
        totalArticles: filteredMatches.length,
        unfilteredTotal: allMatches.length,
        totalPages,
        categoryCounts,
        didYouMean: null,
        completions: isDropdown ? completions.slice(0,3) : [],
        topics: isDropdown ? topics.slice(0,2) : []
    };
};

const getIconComponent = (iconName) => {
    const icons = { UserPlus, MessageSquare, Users, FileText, Settings, Video, Shield, CreditCard };
    const Icon = icons[iconName] || HelpCircle;
    return <Icon size={20} strokeWidth={2} className="text-[var(--teal)]" />;
};

const Badge = ({ type }) => {
    if (!type) return null;
    if (type === 'retired') return <span className="uppercase font-mono text-[10px] tracking-wider font-semibold px-2 py-0.5 rounded bg-gray-500/20 text-gray-500 inline-flex items-center justify-center leading-none">RETIRED</span>;
    const isNew = type === 'new';
    const classes = isNew ? 'bg-[var(--teal-soft)] text-[var(--teal)]' : 'bg-[var(--amber-soft)] text-[var(--amber)]';
    return (
        <span className={`uppercase font-mono text-[10px] tracking-wider font-semibold px-2 py-0.5 rounded ${classes} inline-flex items-center justify-center leading-none`}>
            {type}
        </span>
    );
};

function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

const HighlightText = ({ text, query }) => {
    if (!query || !text) return <>{text}</>;
    const words = tokenize(query);
    if (words.length === 0) return <>{text}</>;
    const pattern = new RegExp(`(${words.join('|')})[a-z]*`, 'gi');
    const parts = text.split(pattern);
    return (
        <>
            {parts.map((part, i) => {
                const isMatch = words.some(w => part.toLowerCase().startsWith(w.toLowerCase()));
                return isMatch ? (
                    <mark key={i} className="bg-[var(--amber-soft)] text-[var(--text)] rounded-sm px-0.5 bg-opacity-80 dark:bg-opacity-30">{part}</mark>
                ) : <span key={i}>{part}</span>;
            })}
        </>
    );
};

const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text);
    } else {
        let textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { document.execCommand('copy'); } catch (error) { console.error(error); }
        textArea.remove();
    }
};

const Toast = ({ message, visible }) => (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-[var(--text)] text-[var(--bg)] px-4 py-2.5 rounded-lg shadow-xl font-medium text-sm transition-all duration-300 flex items-center gap-2 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <CheckCircle2 size={16} className="text-[var(--amber)]" /> {message}
    </div>
);

const Header = ({ theme, toggleTheme, currentRoute, navigate, activeMode, setActiveMode }) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [roleMenuOpen, setRoleMenuOpen] = useState(false);
    const isInnerPage = currentRoute.path !== '/';
    const roleOptions = [
        { id: 'reader', label: 'Reader' },
        { id: 'author', label: 'Author' },
        { id: 'admin-reviewer', label: 'Admin/Reviewer' }
    ];
    const currentRoleLabel = roleOptions.find(option => option.id === activeMode)?.label || 'Reader';
    const selectRole = (mode) => {
        setActiveMode(mode);
        setRoleMenuOpen(false);
        setMobileMenuOpen(false);
    };
    
    return (
        <header className="sticky top-0 z-[100] bg-[var(--navy)] text-[var(--navy-text)] shadow-md">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 cursor-pointer shrink-0 group" onClick={() => navigate('/')}>
                    <div className="w-8 h-8 bg-[var(--amber)] rounded flex items-center justify-center text-[var(--navy)] font-bold text-xl leading-none group-hover:bg-[var(--amber-hover)] transition-colors">
                        T
                    </div>
                    <span className="font-heading font-semibold text-lg tracking-tight hidden lg:block group-hover:text-[var(--amber)] transition-colors">
                        Troop Messenger <span className="opacity-50 mx-1">|</span> Help Center
                    </span>
                    <span className="font-heading font-semibold text-lg tracking-tight hidden sm:block lg:hidden">
                        Help Center
                    </span>
                </div>

                {isInnerPage && (
                    <div className="flex-1 max-w-xl mx-auto hidden sm:block">
                        <SearchBox variant="compact" initialQuery={currentRoute.searchParams.get('q') || ''} navigate={navigate} />
                    </div>
                )}

                <nav className="hidden md:flex items-center gap-6 shrink-0">
                    <a href="#" className="text-sm font-medium hover:text-[var(--amber)] transition-colors">Contact support</a>
                    <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--amber)]" aria-label={theme === 'dark' ? "Switch to light theme" : "Switch to dark theme"}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <a href="#" className="bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-[var(--navy)] font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
                        Open Troop Messenger
                    </a>
                    <div className="relative">
                        <button
                            onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
                            aria-label={`Switch role, current mode ${currentRoleLabel}`}
                            aria-expanded={roleMenuOpen}
                        >
                            <User size={20} />
                        </button>
                        {roleMenuOpen && (
                            <div className="absolute right-0 top-full mt-2 w-44 bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden z-[120]">
                                <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">Mode</div>
                                {roleOptions.map(option => (
                                    <button
                                        key={option.id}
                                        onClick={() => selectRole(option.id)}
                                        className={`w-full px-3 py-2.5 text-left text-sm font-medium hover:bg-[var(--bg)] transition-colors ${activeMode === option.id ? 'text-[var(--amber)]' : 'text-[var(--text)]'}`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>

                <div className="flex items-center gap-2 md:hidden shrink-0">
                    {isInnerPage && (
                        <button onClick={() => setMobileMenuOpen(true)} className="w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 transition-colors" aria-label="Open search">
                            <Search size={20} />
                        </button>
                    )}
                    <button onClick={toggleTheme} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[var(--amber)]">
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="w-10 h-10 flex items-center justify-center rounded hover:bg-white/10 transition-colors" aria-label="Toggle navigation menu">
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
            {mobileMenuOpen && (
                <div className="md:hidden bg-[var(--surface)] text-[var(--text)] border-b border-[var(--border)] shadow-lg absolute w-full left-0 z-50">
                    <div className="px-4 py-4 flex flex-col gap-4">
                        {isInnerPage && <SearchBox variant="compact" initialQuery={currentRoute.searchParams.get('q') || ''} navigate={navigate} />}
                        <a href="#" className="font-medium hover:text-[var(--amber)] transition-colors">Contact support</a>
                        <a href="#" className="bg-[var(--amber)] text-[var(--navy)] font-semibold text-center py-3 rounded-lg transition-colors w-full">
                            Open Troop Messenger
                        </a>
                        <div className="grid grid-cols-2 gap-2">
                            {roleOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => selectRole(option.id)}
                                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${activeMode === option.id ? 'bg-[var(--amber)] border-[var(--amber)] text-[var(--navy)]' : 'border-[var(--border)] text-[var(--text)] hover:border-[var(--amber)]'}`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

const Footer = () => (
    <footer className="bg-[var(--navy)] text-[var(--navy-text)] py-12 mt-auto">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div>
                    <h3 className="font-heading font-semibold text-lg mb-4 text-white">Help Center</h3>
                    <ul className="space-y-3 text-sm opacity-80">
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Getting Started</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Video Tutorials</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Community Forum</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Release Notes</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading font-semibold text-lg mb-4 text-white">Product</h3>
                    <ul className="space-y-3 text-sm opacity-80">
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Download Apps</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Pricing & Plans</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Security Features</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Integrations</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading font-semibold text-lg mb-4 text-white">Developers</h3>
                    <ul className="space-y-3 text-sm opacity-80">
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">API Documentation</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Webhooks</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Developer Portal</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">App Directory</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="font-heading font-semibold text-lg mb-4 text-white">Company</h3>
                    <ul className="space-y-3 text-sm opacity-80">
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Contact</a></li>
                        <li><a href="#" className="hover:text-[var(--amber)] hover:opacity-100 transition-colors">Blog</a></li>
                    </ul>
                </div>
            </div>
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm opacity-70">
                <p>&copy; 2026 Troop Messenger. All rights reserved.</p>
                <div className="flex items-center gap-6">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </div>
    </footer>
);

const SearchBox = ({ variant = 'hero', initialQuery = '', navigate }) => {
    const [query, setQuery] = useState(initialQuery);
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [recentSearches, setRecentSearches] = useState(() => {
        try { return JSON.parse(localStorage.getItem('recentSearches')) || ['Burnout sessions']; } catch { return []; }
    });
    
    const [navItems, setNavItems] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    
    const containerRef = useRef(null);
    const inputRef = useRef(null);
    const listboxRef = useRef(null);
    const debouncedQuery = useDebounce(query, 200);

    const isCompact = variant === 'compact';

    useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/' && document.activeElement !== inputRef.current && !isFocused) {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocused]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsFocused(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!isFocused) return;
        if (debouncedQuery.length >= 2) {
            setIsLoading(true); setError(null);
            executeSearch(debouncedQuery, [], 'relevance', 1, true)
                .then(res => setResults({ ...res, query: debouncedQuery }))
                .catch(err => { setError(err.message); setResults(null); })
                .finally(() => setIsLoading(false));
        } else {
            setResults(null); setError(null); setIsLoading(false);
        }
    }, [debouncedQuery, isFocused]);

    useEffect(() => {
        if (!isFocused) return;
        let items = [];
        const strongHitsCount = results?.articles?.filter(a => a._tag !== 'Content').length || 0;
        const hideCompletions = strongHitsCount >= 3;

        if (query.length >= 2 && results) {
            if (!hideCompletions && results.completions?.length > 0) items.push(...results.completions.map((c, i) => ({ type: 'completion', id: `comp-${i}`, data: c })));
            if (results.articles?.length > 0) items.push(...results.articles.map(a => ({ type: 'article', id: `art-${a.id}`, data: a })));
            if (results.topics?.length > 0) items.push(...results.topics.map(t => ({ type: 'topic', id: `top-${t.id}`, data: t })));
            if (results.totalArticles > 0) items.push({ type: 'see-all', id: 'see-all', data: debouncedQuery });
        }
        setNavItems(items);
        const firstArticleIndex = items.findIndex(item => item.type === 'article');
        setSelectedIndex(firstArticleIndex >= 0 ? firstArticleIndex : (items.length > 0 ? 0 : -1));
    }, [results, isFocused, query, debouncedQuery]);

    useEffect(() => {
        if (selectedIndex >= 0 && listboxRef.current) {
            const el = listboxRef.current.querySelector(`[aria-selected="true"]`);
            if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }, [selectedIndex]);

    const submitSearch = (searchTerm) => {
        if(!searchTerm) return;
        const updated = [searchTerm, ...recentSearches.filter(t => t !== searchTerm)].slice(0, 3);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        setIsFocused(false);
        inputRef.current?.blur();
        navigate('/search', { q: searchTerm });
    };

    const handleArticleClick = (article) => {
        logSearchClick(query, article.id, navItems.findIndex(i => i.id === `art-${article.id}`));
        submitSearch(article.title);
        navigate(`/article/${slugify(article.title)}`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            if (query) setQuery(''); else { setIsFocused(false); inputRef.current?.blur(); }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault(); setSelectedIndex(prev => prev < navItems.length - 1 ? prev + 1 : 0);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault(); setSelectedIndex(prev => prev > 0 ? prev - 1 : navItems.length - 1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < navItems.length) {
                const selected = navItems[selectedIndex];
                if (selected.type === 'completion' || selected.type === 'see-all') submitSearch(selected.data);
                else if (selected.type === 'article') handleArticleClick(selected.data);
                else if (selected.type === 'topic') { navigate('/search', { q: query, category: selected.data.title }); setIsFocused(false); }
            } else if (query.trim().length > 0) submitSearch(query.trim());
        } else if (e.key === 'Tab') setIsFocused(false);
    };

    const showEmptyState = isFocused && (!query || query.length < 2);
    const showResults = isFocused && !showEmptyState && !isLoading && !error && results;

    const inputClasses = isCompact
        ? "flex-1 w-full py-2 px-3 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] no-focus-outline border-none"
        : "flex-1 w-full py-4 px-3 bg-transparent text-lg text-[var(--text)] placeholder:text-[var(--text-muted)] no-focus-outline border-none";

    const containerClasses = isCompact
        ? `flex items-center bg-[var(--surface)] rounded-lg transition-colors border ${isFocused ? 'border-[var(--amber)]' : 'border-transparent hover:border-[var(--amber)]'}`
        : `flex items-center bg-[var(--surface)] transition-all border ${isFocused ? 'border-[var(--amber)] rounded-none md:rounded-xl border-b-[var(--border)] md:border-[var(--amber)]' : 'border-[var(--border)] rounded-xl shadow-sm hover:border-[var(--amber)]'}`;

    return (
        <div className={`w-full mx-auto transition-all duration-200 ${!isCompact && isFocused ? 'fixed inset-0 z-[100] bg-[var(--bg)] flex flex-col md:relative md:inset-auto md:block md:z-50 md:bg-transparent max-w-3xl' : 'relative z-50 w-full'}`} ref={containerRef}>
            {!isCompact && isFocused && <div className="hidden md:block fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]" onClick={() => setIsFocused(false)} />} 
            <div className={`relative z-50 flex flex-col w-full ${!isCompact && isFocused ? 'h-full md:h-auto' : ''}`}>
                <div className={containerClasses} style={isFocused && !isCompact ? {boxShadow: '0 0 0 1px rgba(232,163,23,0.3)'} : {}}>
                    {!isCompact && isFocused ? (
                        <button onClick={() => setIsFocused(false)} className="md:hidden p-4 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors focus:outline-none">
                            <ArrowLeft size={24} />
                        </button>
                    ) : (
                        <div className={`pl-3 text-[var(--text-muted)] pointer-events-none ${isCompact ? 'py-2' : 'py-4'}`}>
                            <Search size={isCompact ? 16 : 24} />
                        </div>
                    )}
                    <input 
                        ref={inputRef} role="combobox" aria-expanded={isFocused} aria-controls={isFocused ? "search-listbox" : undefined} aria-activedescendant={selectedIndex >= 0 ? navItems[selectedIndex]?.id : undefined}
                        type="text" className={inputClasses} placeholder="Search articles, guides, or topics..."
                        value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setIsFocused(true)} onKeyDown={handleKeyDown}
                    />
                    {query ? (
                        <button onClick={() => { setQuery(''); inputRef.current?.focus(); }} className={`pr-3 text-[var(--text-muted)] hover:text-[var(--text)] transition-colors ${isCompact ? 'py-2' : 'py-4'}`}>
                            <X size={isCompact ? 14 : 20} />
                        </button>
                    ) : !isFocused && !isCompact && (
                        <div className="pr-4 hidden sm:flex items-center pointer-events-none">
                            <kbd className="font-mono text-sm px-2 py-1 bg-[var(--bg)] border border-[var(--border)] rounded text-[var(--text-muted)] shadow-sm">/</kbd>
                        </div>
                    )}
                </div>

                {isFocused && (
                    <div onMouseDown={(e) => e.preventDefault()} className={`flex-1 overflow-y-auto bg-[var(--bg)] md:absolute md:top-full md:mt-2 md:left-0 md:w-full md:max-h-[70vh] md:bg-[var(--surface)] md:border md:border-[var(--border)] md:rounded-xl md:shadow-xl md:z-50 flex flex-col custom-scrollbar ${isCompact ? 'max-h-[70vh] rounded-xl border border-[var(--border)] shadow-xl mt-2 absolute top-full left-0 w-full z-50 text-left' : ''}`}>
                        
                        {showEmptyState && (
                            <div className="p-4 md:p-6 text-left">
                                {recentSearches.length > 0 && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">Recent searches</span>
                                            <button onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches'); }} className="text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors font-medium">Clear</button>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            {recentSearches.map((rs, i) => (
                                                <div key={i} className="group flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--bg)] cursor-pointer text-sm transition-colors">
                                                    <div className="flex items-center gap-3 text-[var(--text)] font-medium flex-1" onClick={() => submitSearch(rs)}><Clock size={16} className="text-[var(--text-muted)]" /> {rs}</div>
                                                    <button onClick={(e) => { e.stopPropagation(); setRecentSearches(prev => { const upd = prev.filter(t=>t!==rs); localStorage.setItem('recentSearches', JSON.stringify(upd)); return upd; }); }} className="opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--text)] transition-all"><X size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="mb-6">
                                     <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-3 block">Popular searches</span>
                                     <div className="flex flex-wrap gap-2">
                                         {["Auto-delete", "Schedule message", "Burnout", "Airtime mode"].map(chip => (
                                             <button key={chip} onClick={() => submitSearch(chip)} className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-full text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--amber)] transition-colors shadow-sm">{chip}</button>
                                         ))}
                                     </div>
                                </div>
                                {!isCompact && (
                                    <div>
                                        <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-3 block">Quick Links</span>
                                        <div className="flex flex-col gap-1">
                                            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg)] cursor-pointer text-sm font-medium text-[var(--text)] transition-colors text-left"><Sparkles size={16} className="text-[var(--amber)]" /> What's new in this release</button>
                                            <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg)] cursor-pointer text-sm font-medium text-[var(--text)] transition-colors text-left"><HelpCircle size={16} className="text-[var(--teal)]" /> Contact technical support</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {isLoading && (
                            <div className="p-4 md:p-6 text-left">
                                 <div className="animate-pulse space-y-4">
                                     <div className="h-3 bg-[var(--border)] rounded w-1/4 mb-2"></div>
                                     {[1,2].map(i => (<div key={i} className="flex flex-col gap-2"><div className="h-4 bg-[var(--border)] rounded w-3/4"></div><div className="h-3 bg-[var(--border)] rounded w-1/2"></div></div>))}
                                 </div>
                            </div>
                        )}

                        {showResults && results.totalArticles === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                                <h3 className="text-lg font-medium text-[var(--text)] mb-2">No results for "{query}"</h3>
                                <p className="text-sm text-[var(--text-muted)] mb-6">Try using fewer or broader words, and check your spelling.</p>
                                {results.didYouMean && (
                                    <div className="mb-6">
                                        <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2 block">Did you mean?</span>
                                        <button onClick={() => submitSearch(results.didYouMean)} className="px-4 py-2 bg-[var(--amber-soft)] text-[var(--amber)] rounded-full text-sm font-semibold hover:bg-[var(--amber)] hover:text-[var(--navy)] transition-colors">{results.didYouMean}</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {showResults && results.totalArticles > 0 && (
                            <div className="flex flex-col text-left" role="listbox" id="search-listbox" ref={listboxRef}>
                                <div className="sticky top-0 bg-[var(--surface)] px-4 py-2 border-b border-[var(--border)] z-10 font-medium text-[var(--text)] text-xs shadow-sm flex items-center justify-between">
                                    <span>{results.totalArticles} articles</span>
                                </div>

                                {results.completions && results.completions.length > 0 && results.articles.filter(a => a._tag !== 'Content').length < 3 && (
                                    <div className="border-b border-[var(--border)] py-1">
                                        <div className="px-4 mt-1 mb-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Suggestions</div>
                                        {results.completions.map((comp, i) => {
                                            const id = `comp-${i}`;
                                            const isSelected = navItems[selectedIndex]?.id === id;
                                            return (
                                                <div key={id} id={id} aria-selected={isSelected} role="option" className={`flex items-center gap-3 px-4 py-2 cursor-pointer text-sm transition-colors border-l-[3px] ${isSelected ? 'border-[var(--amber)] bg-[var(--amber-soft)]' : 'border-transparent hover:bg-[var(--bg)]'}`} onClick={() => submitSearch(comp)}>
                                                    <Search size={14} className="text-[var(--text-muted)] ml-1 shrink-0" />
                                                    <span className="text-[var(--text)] font-medium"><HighlightText text={comp} query={debouncedQuery} /></span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {results.articles && results.articles.length > 0 && (
                                    <div className="py-2 border-b border-[var(--border)]">
                                        <div className="px-4 mb-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Articles</div>
                                        {results.articles.map(article => {
                                            const id = `art-${article.id}`;
                                            const isSelected = navItems[selectedIndex]?.id === id;
                                            return (
                                                <div key={id} id={id} aria-selected={isSelected} role="option" className={`flex gap-4 px-4 py-3 cursor-pointer transition-colors border-l-[3px] ${isSelected ? 'border-[var(--amber)] bg-[var(--amber-soft)]' : 'border-transparent hover:bg-[var(--bg)]'}`} onClick={() => handleArticleClick(article)}>
                                                    <div className="w-10 h-10 rounded-lg bg-[var(--teal-soft)] flex items-center justify-center shrink-0 ml-1">
                                                        <FileText size={20} className="text-[var(--teal)]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-[11px] font-mono text-[var(--text-muted)] truncate mb-0.5">{article.path}</div>
                                                        <div className="font-bold text-[var(--text)] text-sm truncate mb-1"><HighlightText text={article.title} query={debouncedQuery} /></div>
                                                        <div className="text-[13px] text-[var(--text-muted)] truncate mb-2 max-w-full leading-relaxed"><HighlightText text={article.snippet} query={debouncedQuery} /></div>
                                                        <div className="flex flex-wrap gap-y-1 items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                                                            <span>{article.author} &middot; {article.version} &middot; {article.updatedAt}</span>
                                                            <span className="flex items-center gap-1.5 shrink-0">{article.badge && article.status !== 'retired' && <Badge type={article.badge} />}{article.status === 'retired' && <Badge type="retired" />}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {results.topics && results.topics.length > 0 && (
                                    <div className="py-2 border-b border-[var(--border)]">
                                        <div className="px-4 mb-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">Topics</div>
                                        {results.topics.map(topic => {
                                            const id = `top-${topic.id}`;
                                            const isSelected = navItems[selectedIndex]?.id === id;
                                            return (
                                                <div key={id} id={id} aria-selected={isSelected} role="option" className={`flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors border-l-[3px] ${isSelected ? 'border-[var(--amber)] bg-[var(--amber-soft)]' : 'border-transparent hover:bg-[var(--bg)]'}`} onClick={() => { navigate('/search', { q: debouncedQuery, category: topic.title }); setIsFocused(false); }}>
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--teal-soft)] flex items-center justify-center shrink-0 ml-1">{getIconComponent(topic.icon)}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[var(--text)] font-medium text-sm mb-0.5 truncate"><HighlightText text={topic.title} query={debouncedQuery} /></h4>
                                                        <p className="text-[10px] font-mono text-[var(--text-muted)]">{topic.count} articles</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div id="see-all" aria-selected={navItems[selectedIndex]?.id === 'see-all'} role="option" onClick={() => submitSearch(debouncedQuery)} className={`flex items-center justify-between p-3 cursor-pointer text-sm font-semibold text-[var(--amber)] hover:text-[var(--amber-hover)] transition-colors bg-[var(--surface)] sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] border-l-[3px] ${navItems[selectedIndex]?.id === 'see-all' ? 'border-[var(--amber)] bg-[var(--amber-soft)]' : 'border-transparent hover:bg-[var(--bg)]'}`}>
                                    <span>See all {results.totalArticles} results</span>
                                    <span className="text-[10px] font-mono text-[var(--text-muted)] flex items-center gap-1 opacity-70 border border-[var(--border)] rounded px-1.5 py-0.5 bg-[var(--bg)]"><CornerDownLeft size={10} /> Enter</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const FeedbackWidget = ({ articleId, version }) => {
    const feedbackReasons = useFeedbackReasons();
    const [state, setState] = useState('initial');
    const [reason, setReason] = useState(null);
    const [text, setText] = useState('');

    const handleSubmit = (type, feedbackReason = null, feedbackText = '') => {
        logFeedback({ articleId, version, type, reason: feedbackReason, text: feedbackText });
        setState('submitted');
    };

    if (state === 'submitted') {
        return (
            <div className="bg-[var(--teal-soft)] border border-[var(--teal)]/30 rounded-xl p-6 text-center text-[var(--teal)] font-medium flex flex-col items-center gap-2 transition-all">
                <CheckCircle2 size={32} />
                Thank you for your feedback!
            </div>
        );
    }

    if (state === 'no') {
        return (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 transition-all shadow-sm">
                <h4 className="font-semibold mb-4 text-[var(--text)]">How can we improve this article?</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                    {feedbackReasons.map(r => (
                        <button key={r} aria-pressed={reason === r} onClick={() => setReason(r)} className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${reason === r ? 'bg-[var(--amber)] border-[var(--amber)] text-[var(--navy)]' : 'bg-[var(--bg)] border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--amber)]'}`}>
                            {r}
                        </button>
                    ))}
                </div>
                {reason && <textarea
                    aria-label={reason === 'Other' ? 'Describe the other reason' : 'Additional feedback'}
                    placeholder={reason === 'Other' ? 'Tell us what went wrong (required)' : 'Tell us more (optional)'}
                    value={text} onChange={(e) => setText(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] mb-4 focus:ring-1 focus:ring-[var(--amber)] focus:border-[var(--amber)] no-focus-outline resize-none"
                    rows={3}
                />}
                <div className="flex justify-end gap-3">
                    <button onClick={() => setState('initial')} className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">Cancel</button>
                    <button onClick={() => handleSubmit('no', reason, text)} disabled={!reason || (reason === 'Other' && !text.trim())} className="px-4 py-2 bg-[var(--amber)] text-[var(--navy)] rounded-lg text-sm font-semibold hover:bg-[var(--amber-hover)] disabled:opacity-50 disabled:pointer-events-none transition-colors shadow-sm">Send feedback</button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <h4 className="font-semibold text-lg text-[var(--text)]">Was this helpful?</h4>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={() => handleSubmit('yes')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors">
                    <ThumbsUp size={16} /> Yes
                </button>
                <button onClick={() => setState('no')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-sm font-medium text-[var(--text)] hover:border-[var(--amber)] hover:text-[var(--amber)] transition-colors">
                    <ThumbsDown size={16} /> No
                </button>
            </div>
        </div>
    );
};

const VersionHistoryDrawer = ({ isOpen, onClose, articleId }) => {
    if (!isOpen) return null;
    const history = (MOCK_DATA.historyMap[articleId] || []).slice(0, 5);

    return (
        <div className="fixed inset-0 z-[200] flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className="relative w-full max-w-md bg-[var(--surface)] h-full shadow-2xl flex flex-col transition-transform animate-slide-in-right">
                <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
                    <h2 className="font-heading font-semibold text-xl text-[var(--text)]">Version history</h2>
                    <button onClick={onClose} className="p-2 text-[var(--text-muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--bg)] transition-colors"><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="relative border-l-2 border-[var(--border)] ml-3 space-y-8 pb-8">
                        {history.map((entry, idx) => (
                            <div key={idx} className="relative pl-6">
                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-[var(--surface)] ${idx === 0 ? 'bg-[var(--amber)]' : 'bg-[var(--border)]'}`} />
                                <div className="flex items-center gap-2 mb-2 font-mono text-xs">
                                    <span className={`font-bold ${idx === 0 ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{entry.version}</span>
                                    <span className="text-[var(--text-muted)] opacity-50">&middot;</span>
                                    <span className="text-[var(--text-muted)]">{entry.date}</span>
                                    {idx === 0 && <span className="bg-[var(--amber-soft)] text-[var(--amber)] px-1.5 py-0.5 rounded ml-2">Current</span>}
                                </div>
                                <div className="text-[var(--text-muted)] text-sm mb-2">by {entry.author}</div>
                                <p className="text-sm text-[var(--text)] leading-relaxed">{entry.note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Accordion = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="border border-[var(--border)] rounded-xl bg-[var(--surface)] overflow-hidden mb-4 transition-colors hover:border-[var(--amber)]">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-4 text-left font-semibold text-[var(--text)] focus:outline-none focus-visible:bg-[var(--bg)] transition-colors">
                {title}
                <ChevronDown size={20} className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="p-4 pt-0 text-[var(--text)] border-t border-[var(--border)] bg-[var(--bg)]">{children}</div>}
        </div>
    );
};

const ArticleRow = ({ article, navigate }) => (
    <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/article/${slugify(article.title)}`); }} className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:-translate-y-0.5 hover:shadow-card hover:border-[var(--amber)] transition-all duration-200 gap-4 flex-1 min-w-0">
        <div className="flex-1 min-w-0 pr-0 sm:pr-4">
            <h4 className="font-medium text-base mb-1 group-hover:text-[var(--amber)] transition-colors flex items-center gap-2">
                <span className="truncate" title={article.title}>{article.title}</span>
                {article.badge && <span className="flex-shrink-0"><Badge type={article.badge} /></span>}
            </h4>
            <p className="text-sm text-[var(--text-muted)] truncate" title={article.description}>{article.description}</p>
        </div>
        <div className="flex-shrink-0 font-mono text-xs text-[var(--text-muted)] flex flex-wrap sm:flex-col sm:items-end gap-2 sm:gap-1 mt-2 sm:mt-0 opacity-80 whitespace-nowrap">
            <span>{article.author} &middot; {article.version}</span>
            <span>{article.views ? `${article.views} views` : article.date}</span>
        </div>
    </a>
);

const SearchResultCard = ({ result, isFirstRelevance, query, navigate }) => (
    <div className={`group bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:-translate-y-1 hover:shadow-md hover:border-[var(--amber)] transition-all duration-200 flex flex-col gap-3 ${isFirstRelevance ? 'border-l-4 border-l-[var(--amber)]' : ''}`}>
        <div className="flex items-center justify-between">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
                {result.path} <span className="opacity-40">|</span> <span className="flex items-center gap-1 opacity-70"><Tag size={10}/> Matched in: {result._tag}</span>
            </div>
        </div>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/article/${slugify(result.title)}`); }} className="font-heading font-semibold text-xl text-[var(--text)] group-hover:text-[var(--amber)] transition-colors flex items-center gap-2">
            <HighlightText text={result.title} query={query} />
            {result.status === 'retired' && <Badge type="retired" />}
            {result.badge && result.status !== 'retired' && <Badge type={result.badge} />}
        </a>
        <p className="text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed"><HighlightText text={result.snippet} query={query} /></p>
        <div className="flex flex-wrap items-center justify-between gap-4 mt-2 border-t border-[var(--border)] pt-4">
            <div className="flex items-center gap-3 font-mono text-[11px] text-[var(--text-muted)]">
                <span className="font-medium text-[var(--text)] opacity-80">{result.author}</span><span className="opacity-50">&middot;</span><span>{result.version}</span><span className="opacity-50">&middot;</span><span>{result.updatedAt}</span>
            </div>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/article/${slugify(result.title)}`); }} className="text-sm font-medium text-[var(--amber)] group-hover:text-[var(--amber-hover)] transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-visible:opacity-100">
                Read article <ArrowRight size={16} />
            </a>
        </div>
    </div>
);

const Hero = ({ navigate }) => (
    <section className="pt-16 pb-12 text-center w-full max-w-3xl mx-auto flex flex-col items-center">
        <h1 className="font-heading text-4xl md:text-5xl font-semibold mb-8 text-[var(--text)]">How can we help you?</h1>
        <SearchBox variant="hero" navigate={navigate} />
    </section>
);

const HelpBanner = () => (
    <section className="bg-[var(--surface)] border border-[var(--border)] border-l-4 border-l-[var(--amber)] rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
            <h2 className="font-heading text-2xl font-semibold mb-2">Still need help?</h2>
            <p className="text-[var(--text-muted)]">Our support team is available 24/7 to assist you with any questions.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
            <a href="#" className="flex-1 sm:flex-none flex justify-center items-center gap-2 bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-[var(--navy)] font-semibold px-6 py-3 rounded-lg transition-colors">
                Contact support <ArrowUpRight size={18} />
            </a>
        </div>
    </section>
);

const HomePage = ({ navigate }) => (
    <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-16">
        <Hero navigate={navigate} />
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-semibold flex items-center gap-2"><Compass className="text-[var(--teal)]" size={24} /> What's new</h2>
                <a href="#" className="text-sm font-medium text-[var(--amber)] hover:text-[var(--amber-hover)] flex items-center gap-1 transition-colors">View all updates <ArrowRight size={16} /></a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_DATA.whatsNew.map(item => (
                    <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/article/${slugify(item.title)}`); }} key={item.id} className="group block bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:-translate-y-1 hover:shadow-md hover:border-[var(--amber)] transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                            <Badge type={item.badge} />
                            <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--text-muted)]">
                                <span className="px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)]">{item.version}</span>
                                <span>{item.date}</span>
                            </div>
                        </div>
                        <h3 className="font-semibold text-lg mb-2 group-hover:text-[var(--amber)] transition-colors">{item.title}</h3>
                        <p className="text-sm text-[var(--text-muted)] line-clamp-2">{item.description}</p>
                    </a>
                ))}
            </div>
        </section>
        <section className="space-y-6">
            <h2 className="font-heading text-2xl font-semibold">Browse topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_DATA.topics.map(topic => (
                    <a href="#" key={topic.id} onClick={(e) => { e.preventDefault(); navigate(`/category/${slugify(topic.title)}`); }} className="group flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 hover:-translate-y-1 hover:shadow-md hover:border-[var(--amber)] transition-all duration-200 h-full">
                        <div className="w-12 h-12 rounded-lg bg-[var(--teal-soft)] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">{getIconComponent(topic.icon)}</div>
                        <h3 className="font-semibold text-base mb-2 group-hover:text-[var(--amber)] transition-colors">{topic.title}</h3>
                        <p className="text-sm text-[var(--text-muted)] mb-6 flex-grow line-clamp-2">{topic.description}</p>
                        <div className="mt-auto font-mono text-xs text-[var(--text-muted)] flex items-center gap-1.5 pt-4 border-t border-[var(--border)] transition-colors"><FileText size={14} className="opacity-70" /> {topic.count} articles</div>
                    </a>
                ))}
            </div>
        </section>
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            <div className="space-y-5">
                <h2 className="font-heading text-2xl font-semibold flex items-center gap-2">Popular articles</h2>
                <div className="space-y-3">
                    {MOCK_DATA.popular.map((article, index) => (
                        <div key={article.id} className="relative flex items-stretch">
                            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center font-mono text-[10px] font-bold z-10 text-[var(--text-muted)]">{index + 1}</div>
                            <ArticleRow article={article} navigate={navigate} />
                        </div>
                    ))}
                </div>
            </div>
            <div className="space-y-5">
                <h2 className="font-heading text-2xl font-semibold flex items-center gap-2">Recently updated</h2>
                <div className="space-y-3 flex flex-col">
                    {MOCK_DATA.recentlyUpdated.map(article => (
                        <div key={article.id} className="flex items-stretch"><ArticleRow article={article} navigate={navigate} /></div>
                    ))}
                </div>
            </div>
        </section>
        <HelpBanner />
    </main>
);

const SearchPage = ({ currentRoute, navigate }) => {
    const query = currentRoute.searchParams.get('q') || '';
    const selectedCategories = currentRoute.searchParams.get('category') ? currentRoute.searchParams.get('category').split(',') : [];
    const sort = currentRoute.searchParams.get('sort') || 'relevance';
    const page = parseInt(currentRoute.searchParams.get('page') || '1', 10);

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [requested, setRequested] = useState(false);
    const [isFilterMobileOpen, setIsFilterMobileOpen] = useState(false);

    useEffect(() => {
        setIsLoading(true); setError(null);
        executeSearch(query, selectedCategories, sort, page, false)
            .then(res => { setData(res); window.scrollTo({ top: 0, behavior: 'smooth' }); })
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [query, selectedCategories.join(','), sort, page]);

    const handleCategoryToggle = (cat) => {
        const newCats = selectedCategories.includes(cat) ? selectedCategories.filter(c => c !== cat) : [...selectedCategories, cat];
        const newParams = { q: query, sort, page: 1 };
        if (newCats.length > 0) newParams.category = newCats.join(',');
        navigate('/search', newParams);
    };

    const handleSortChange = (e) => navigate('/search', { q: query, category: currentRoute.searchParams.get('category'), page: 1, sort: e.target.value });
    const handlePageChange = (newPage) => navigate('/search', { q: query, category: currentRoute.searchParams.get('category'), sort, page: newPage });
    const clearFilters = () => navigate('/search', { q: query, sort, page: 1 });
    const handleRequestArticle = () => { logZeroResult(query); setRequested(true); setTimeout(() => setRequested(false), 3000); };

    if (error) {
        return (
            <div className="flex-grow flex items-center justify-center p-8">
                <div className="text-center text-[var(--text-muted)] flex flex-col items-center">
                    <AlertCircle size={48} className="mb-4 text-[var(--text-muted)] opacity-50" />
                    <h2 className="text-xl font-heading font-semibold text-[var(--text)] mb-2">{error}</h2>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                        <button onClick={() => navigate('/search', { q: query })} className="px-5 py-2.5 bg-[var(--amber)] text-[var(--navy)] rounded-lg text-sm font-semibold hover:bg-[var(--amber-hover)] transition-colors shadow-sm">Retry Search</button>
                        <button onClick={() => navigate('/')} className="px-5 py-2.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg text-sm font-medium hover:border-[var(--amber)] transition-colors shadow-sm">Browse topics</button>
                    </div>
                </div>
            </div>
        );
    }

    const hasNoResults = data && data.unfilteredTotal === 0;
    const hasFilteredEmpty = data && data.unfilteredTotal > 0 && data.totalArticles === 0;

    return (
        <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-[var(--border)]">
                <div>
                    <h1 className="font-heading text-3xl font-semibold text-[var(--text)] flex flex-wrap items-center gap-2" aria-live="polite">
                        {isLoading ? <div className="h-9 bg-[var(--border)] rounded animate-pulse w-48"></div> : hasNoResults ? `No results for '${query}'` : <><span className="text-[var(--text)]">{data.totalArticles} results for</span> <span className="bg-[var(--amber-soft)] text-[var(--text)] px-2 rounded font-semibold">{query}</span></>}
                    </h1>
                </div>
                {!hasNoResults && (
                    <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                        <label htmlFor="sort-select" className="text-sm font-medium text-[var(--text-muted)]">Sort by:</label>
                        <div className="relative">
                            <select id="sort-select" value={sort} onChange={handleSortChange} className="appearance-none bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] text-sm rounded-lg pl-4 pr-10 py-2.5 outline-none focus:border-[var(--amber)] focus:ring-1 focus:ring-[var(--amber)] transition-colors cursor-pointer shadow-sm font-medium">
                                <option value="relevance">Most relevant</option>
                                <option value="updated">Recently updated</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                        </div>
                    </div>
                )}
            </div>

            {hasNoResults ? (
                <div className="flex flex-col items-center justify-center py-16 text-center max-w-lg mx-auto">
                    <p className="text-[var(--text-muted)] mb-8 text-lg">Try using fewer or broader words, and check your spelling.</p>
                    {data.didYouMean && (
                        <div className="mb-10 w-full">
                            <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-3 block">Did you mean?</span>
                            <button onClick={() => navigate('/search', { q: data.didYouMean })} className="px-6 py-2.5 bg-[var(--amber-soft)] text-[var(--amber)] rounded-full text-base font-semibold hover:bg-[var(--amber)] hover:text-[var(--navy)] transition-colors shadow-sm">{data.didYouMean}</button>
                        </div>
                    )}
                    <div className="w-full mb-10">
                         <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-4 block text-center">Suggested Topics</span>
                         <div className="flex flex-col gap-3 text-left">
                             {MOCK_DATA.topics.slice(0, 2).map(t => (
                                 <button key={t.id} onClick={() => navigate(`/category/${slugify(t.title)}`)} className="flex items-center gap-4 p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--amber)] hover:-translate-y-0.5 hover:shadow-md transition-all">
                                     <div className="w-10 h-10 rounded-lg bg-[var(--teal-soft)] flex items-center justify-center text-[var(--teal)] shrink-0">{getIconComponent(t.icon)}</div>
                                     <div className="text-left"><h4 className="text-sm font-medium text-[var(--text)] mb-0.5">{t.title}</h4><p className="text-xs text-[var(--text-muted)] font-mono">{t.count} articles</p></div>
                                 </button>
                             ))}
                         </div>
                     </div>
                     <div className="flex flex-col sm:flex-row gap-4 w-full">
                         <button className="flex-1 flex items-center justify-center gap-2 bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-[var(--navy)] px-4 py-3 rounded-lg transition-colors text-sm font-semibold shadow-sm"><HelpCircle size={18}/> Contact support</button>
                         <button onClick={handleRequestArticle} disabled={requested} className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors text-sm font-medium shadow-sm border ${requested ? 'bg-[var(--teal-soft)] border-[var(--teal-soft)] text-[var(--teal)]' : 'bg-[var(--surface)] border-[var(--border)] hover:border-[var(--amber)] text-[var(--text)]'}`}>
                             <BookOpen size={18}/> {requested ? 'Request Sent' : 'Request article'}
                         </button>
                     </div>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <button className="lg:hidden flex items-center justify-center gap-2 w-full py-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl font-medium text-[var(--text)] shadow-sm" onClick={() => setIsFilterMobileOpen(true)}>
                        <Filter size={18} /> Filters {selectedCategories.length > 0 && <span className="bg-[var(--amber)] text-[var(--navy)] text-xs px-2 py-0.5 rounded-full">{selectedCategories.length}</span>}
                    </button>
                    <div className={`fixed inset-0 z-[200] bg-[var(--bg)] p-6 lg:p-0 flex flex-col lg:static lg:bg-transparent lg:w-[260px] lg:flex-shrink-0 transition-transform ${isFilterMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
                        <div className="flex items-center justify-between mb-6 lg:mb-4 pb-4 lg:pb-0 border-b lg:border-0 border-[var(--border)]">
                            <h2 className="font-heading font-semibold text-lg flex items-center gap-2"><SlidersHorizontal size={20} className="text-[var(--text-muted)] lg:hidden" /> Category</h2>
                            <div className="flex items-center gap-4">
                                {selectedCategories.length > 0 && <button onClick={clearFilters} className="text-sm font-medium text-[var(--text-muted)] hover:text-[var(--amber)] transition-colors">Clear all</button>}
                                <button className="lg:hidden text-[var(--text-muted)]" onClick={() => setIsFilterMobileOpen(false)}><X size={24} /></button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto lg:overflow-visible">
                            <div className="flex flex-col gap-3">
                                {isLoading ? (
                                    [1,2,3,4,5].map(i => <div key={i} className="h-5 bg-[var(--border)] rounded animate-pulse w-full"></div>)
                                ) : (
                                    MOCK_DATA.topics.map(topic => {
                                        const count = data?.categoryCounts?.[topic.title] || 0;
                                        const isChecked = selectedCategories.includes(topic.title);
                                        const isDisabled = count === 0 && !isChecked;
                                        return (
                                            <label key={topic.id} className={`flex items-start gap-3 cursor-pointer group ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                <div className={`w-5 h-5 rounded mt-0.5 flex items-center justify-center border transition-colors shrink-0 ${isChecked ? 'bg-[var(--amber)] border-[var(--amber)] text-[var(--navy)]' : 'bg-[var(--surface)] border-[var(--border)] group-hover:border-[var(--amber)]'}`}>
                                                    {isChecked && <Check size={14} strokeWidth={3} />}
                                                </div>
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span className={`text-sm ${isChecked ? 'font-medium text-[var(--text)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text)]'}`}>{topic.title}</span>
                                                    <span className="font-mono text-xs text-[var(--text-muted)]">{count}</span>
                                                </div>
                                                <input type="checkbox" className="sr-only" checked={isChecked} disabled={isDisabled} onChange={() => handleCategoryToggle(topic.title)} />
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                        <div className="mt-auto pt-6 lg:hidden">
                             <button onClick={() => setIsFilterMobileOpen(false)} className="w-full bg-[var(--amber)] text-[var(--navy)] font-semibold py-3 rounded-xl shadow-sm">Show {data?.totalArticles || 0} results</button>
                        </div>
                    </div>
                    
                    <div className="flex-1 max-w-[960px]">
                        {selectedCategories.length > 0 && !hasFilteredEmpty && (
                            <div className="flex flex-wrap gap-2 mb-6 hidden lg:flex">
                                {selectedCategories.map(cat => (
                                    <button key={cat} onClick={() => handleCategoryToggle(cat)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--amber)] rounded-full text-xs font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors shadow-sm">
                                        {cat} <X size={14} className="text-[var(--text-muted)]" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {isLoading ? (
                            <div className="space-y-6">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 animate-pulse">
                                        <div className="h-3 bg-[var(--border)] rounded w-1/4 mb-4"></div><div className="h-6 bg-[var(--border)] rounded w-3/4 mb-3"></div><div className="h-4 bg-[var(--border)] rounded w-full mb-2"></div><div className="h-4 bg-[var(--border)] rounded w-5/6 mb-6"></div><div className="h-3 bg-[var(--border)] rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : hasFilteredEmpty ? (
                            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-8 text-center">
                                <Filter size={40} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
                                <h3 className="text-lg font-medium text-[var(--text)] mb-2">No results in {selectedCategories.join(', ')}</h3>
                                <p className="text-sm text-[var(--text-muted)] mb-6">We found {data.unfilteredTotal} results in other categories for '{query}'.</p>
                                <button onClick={clearFilters} className="px-5 py-2.5 bg-[var(--amber)] text-[var(--navy)] rounded-lg text-sm font-semibold hover:bg-[var(--amber-hover)] transition-colors shadow-sm">Clear filters</button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {data.articles.map((res, index) => {
                                    const isFirstRelevance = index === 0 && sort === 'relevance' && page === 1;
                                    const card = <SearchResultCard key={res.id} result={res} isFirstRelevance={isFirstRelevance} query={query} navigate={navigate} />;
                                    if (index === 2) {
                                        const relatedTopicMatch = MOCK_DATA.topics.find(t => t.title.toLowerCase().includes(query.toLowerCase()));
                                        if (relatedTopicMatch) {
                                            return (
                                                <React.Fragment key={res.id}>
                                                    {card}
                                                    <div className="bg-[var(--teal-soft)] border border-[var(--teal)]/30 rounded-xl p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/category/${slugify(relatedTopicMatch.title)}`)}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-lg bg-[var(--surface)] flex items-center justify-center shrink-0">{getIconComponent(relatedTopicMatch.icon)}</div>
                                                            <div><div className="text-xs font-mono uppercase tracking-wider text-[var(--teal)] font-semibold mb-0.5">Related Topic</div><div className="font-medium text-[var(--text)]">{relatedTopicMatch.title}</div></div>
                                                        </div>
                                                        <div className="font-mono text-xs text-[var(--teal)] font-medium flex items-center gap-1 bg-[var(--surface)] px-2 py-1 rounded"><FileText size={14} /> {relatedTopicMatch.count}</div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        }
                                    }
                                    return card;
                                })}
                            </div>
                        )}
                        
                        {!isLoading && data?.totalPages > 1 && (
                            <div className="mt-10 flex items-center justify-center gap-2 border-t border-[var(--border)] pt-8">
                                <button disabled={page === 1} onClick={() => handlePageChange(page - 1)} className="p-2 border border-[var(--border)] rounded hover:border-[var(--amber)] hover:text-[var(--amber)] disabled:opacity-50 disabled:pointer-events-none transition-colors"><ChevronLeft size={18} /></button>
                                <div className="flex items-center gap-1 font-mono text-sm">
                                    {[...Array(data.totalPages)].map((_, i) => (
                                        <button key={i+1} onClick={() => handlePageChange(i+1)} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${i+1 === page ? 'bg-[var(--amber)] text-[var(--navy)] font-bold' : 'hover:bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'}`}>{i+1}</button>
                                    ))}
                                </div>
                                <button disabled={page === data.totalPages} onClick={() => handlePageChange(page + 1)} className="p-2 border border-[var(--border)] rounded hover:border-[var(--amber)] hover:text-[var(--amber)] disabled:opacity-50 disabled:pointer-events-none transition-colors"><ChevronRight size={18} /></button>
                            </div>
                        )}

                        {!isLoading && !hasNoResults && (
                            <div className="mt-12 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                                <div><h3 className="font-heading text-xl font-semibold mb-2">Didn't find what you need?</h3><p className="text-sm text-[var(--text-muted)]">Reach out to our support team or request a new article.</p></div>
                                <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
                                    <button className="flex-1 sm:flex-none px-5 py-2.5 bg-[var(--amber)] text-[var(--navy)] rounded-lg text-sm font-semibold hover:bg-[var(--amber-hover)] transition-colors shadow-sm">Contact support</button>
                                    <button onClick={handleRequestArticle} disabled={requested} className={`flex-1 sm:flex-none px-5 py-2.5 border rounded-lg text-sm font-medium transition-colors shadow-sm ${requested ? 'bg-[var(--teal-soft)] border-[var(--teal-soft)] text-[var(--teal)]' : 'bg-transparent border-[var(--border)] text-[var(--text)] hover:border-[var(--amber)]'}`}>
                                        {requested ? 'Request Sent' : 'Request article'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
};

const CategoryPage = ({ currentRoute, navigate }) => {
    const slug = currentRoute.path.replace('/category/', '');
    const topic = MOCK_DATA.topics.find(t => slugify(t.title) === slug);
    const articles = MOCK_DATA.searchIndex.filter(a => a.category === topic?.title);
    
    const grouped = articles.reduce((acc, article) => {
        const sec = article.section || 'General';
        if (!acc[sec]) acc[sec] = [];
        acc[sec].push(article);
        return acc;
    }, {});

    if (!topic) return <StubPage currentRoute={currentRoute} navigate={navigate} />;

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-10">
                <aside className="w-full md:w-[260px] flex-shrink-0 hidden md:block">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-4 pl-3">Categories</h3>
                    <nav className="flex flex-col gap-1 border-l-2 border-[var(--border)] ml-3">
                        {MOCK_DATA.topics.map(t => {
                            const isActive = slugify(t.title) === slug;
                            return (
                                <button key={t.id} onClick={() => navigate(`/category/${slugify(t.title)}`)} className={`text-left px-4 py-2 text-sm font-medium transition-colors relative ${isActive ? 'text-[var(--text)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                                    {isActive && <div className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-[var(--amber)]" />}
                                    {t.title}
                                </button>
                            );
                        })}
                    </nav>
                </aside>
                
                <div className="flex-1 max-w-[1040px]">
                    {/* Breadcrumbs inside main column */}
                    <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-[var(--text-muted)]">
                        <ol className="flex items-center gap-2 flex-wrap">
                            <li><button onClick={() => navigate('/')} className="hover:text-[var(--amber)] hover:underline">Help Center</button></li>
                            <li className="flex items-center gap-2"><ChevronRight size={14} className="opacity-50" /><span className="text-[var(--text)] font-medium">{topic.title}</span></li>
                        </ol>
                    </nav>

                    <div className="mb-10 pb-10 border-b border-[var(--border)]">
                        <div className="w-16 h-16 rounded-xl bg-[var(--teal-soft)] flex items-center justify-center mb-6">
                            {getIconComponent(topic.icon)}
                        </div>
                        <h1 className="font-heading text-4xl font-semibold text-[var(--text)] mb-4">{topic.title}</h1>
                        <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                            {topic.title === 'Collaboration Groups' ? 'Create, manage and moderate Regular or Auto-populated groups under Standard or Airtime messaging modes.' : topic.description}
                        </p>
                    </div>

                    <div className="space-y-12">
                        {Object.entries(grouped).map(([section, arts]) => (
                            <section key={section}>
                                <h2 className="font-heading text-2xl font-semibold text-[var(--text)] mb-6">{section}</h2>
                                <div className="flex flex-col border border-[var(--border)] rounded-xl overflow-hidden bg-[var(--surface)]">
                                    {arts.map((article, i) => (
                                        <div key={article.id} className={`${i !== 0 ? 'border-t border-[var(--border)]' : ''}`}>
                                            <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/article/${slugify(article.title)}`); }} className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-[var(--bg)] transition-colors gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-base mb-1 group-hover:text-[var(--amber)] transition-colors flex items-center gap-2">
                                                        {article.title}
                                                        {article.badge && isWithin30Days(article.updatedAt) && <Badge type={article.badge} />}
                                                    </h4>
                                                    <p className="text-sm text-[var(--text-muted)] truncate">{article.summary}</p>
                                                </div>
                                                <div className="flex-shrink-0 font-mono text-xs text-[var(--text-muted)] opacity-80 sm:text-right">
                                                    <div>{article.author} &middot; {article.version}</div>
                                                    <div className="mt-1">{article.updatedAt}</div>
                                                </div>
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

const StubPage = ({ currentRoute, navigate }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex items-center justify-center p-8">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-xl bg-[var(--teal-soft)] flex items-center justify-center mx-auto mb-6 text-[var(--teal)]"><File size={32} /></div>
                    <h1 className="font-heading text-2xl font-semibold mb-4 text-[var(--text)]">Demo Placeholder</h1>
                    <p className="text-[var(--text-muted)] mb-8">This article route ({currentRoute.path}) is rendering the shared stub template. The content for this article was not provided in the demo scope.</p>
                    <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-lg text-sm font-medium hover:border-[var(--amber)] transition-colors shadow-sm">Go Back</button>
                </div>
            </main>
        </div>
    );
};

const ArticlePage = ({ currentRoute, navigate }) => {
    const slug = currentRoute.path.replace('/article/', '');
    const article = MOCK_DATA.searchIndex.find(a => slugify(a.title) === slug);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [activeHeading, setActiveHeading] = useState('overview');
    const [toastMsg, setToastMsg] = useState('');
    
    useEffect(() => { window.scrollTo(0, 0); }, [slug]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => { if (entry.isIntersecting) setActiveHeading(entry.target.id); });
        }, { rootMargin: '-100px 0px -60% 0px' });
        
        document.querySelectorAll('h2[id]').forEach(h2 => observer.observe(h2));
        return () => observer.disconnect();
    }, [slug]);

    const handleCopyLink = () => {
        copyToClipboard(window.location.href);
        setToastMsg('Link copied to clipboard');
        setTimeout(() => setToastMsg(''), 3000);
    };

    if (!article || article.id !== 'ag1') return <StubPage currentRoute={currentRoute} navigate={navigate} />;

    const categoryArticles = MOCK_DATA.searchIndex.filter(a => a.category === article.category);
    const grouped = categoryArticles.reduce((acc, a) => { const sec = a.section || 'General'; if (!acc[sec]) acc[sec] = []; acc[sec].push(a); return acc; }, {});

    const related = [
        MOCK_DATA.searchIndex.find(a => a.id === 'ag3'),
        MOCK_DATA.searchIndex.find(a => a.id === 'ag2'),
        MOCK_DATA.searchIndex.find(a => a.id === 'ag4')
    ].filter(Boolean);

    const showWhatsChanged = article.badge && isWithin30Days(article.updatedAt);

    return (
        <div className="flex flex-col min-h-screen relative">
            <main className="flex-grow w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12 relative">
                
                {/* Left Nav */}
                <aside className="w-full md:w-[260px] flex-shrink-0 hidden md:block">
                    <div className="sticky top-24">
                        <button onClick={() => navigate(`/category/${slugify(article.category)}`)} className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--amber)] transition-colors mb-6">
                            <ChevronLeft size={16} /> All categories
                        </button>
                        <h3 className="font-heading font-semibold text-lg text-[var(--text)] mb-6 px-3">{article.category}</h3>
                        
                        <nav className="flex flex-col gap-6">
                            {Object.entries(grouped).map(([section, arts]) => (
                                <div key={section}>
                                    <div className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-3 px-3">{section}</div>
                                    <div className="flex flex-col gap-1 border-l-2 border-[var(--border)] ml-3">
                                        {arts.map(a => {
                                            const isActive = a.id === article.id;
                                            return (
                                                <button key={a.id} onClick={() => navigate(`/article/${slugify(a.title)}`)} className={`text-left px-4 py-2 text-sm transition-colors relative ${isActive ? 'font-semibold text-[var(--navy)] bg-[var(--amber-soft)]' : 'font-medium text-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                                                    {isActive && <div className="absolute left-[-2px] top-0 bottom-0 w-[2px] bg-[var(--amber)]" />}
                                                    {a.title}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <article className="flex-1 max-w-[1040px] min-w-0">
                    <div className="md:hidden mb-6 border border-[var(--border)] rounded-lg bg-[var(--surface)] p-3">
                        <select onChange={(e) => navigate(e.target.value)} value={currentRoute.path} className="w-full bg-transparent text-sm font-medium text-[var(--text)] outline-none border-none">
                            {categoryArticles.map(a => <option key={a.id} value={`/article/${slugify(a.title)}`}>{a.title}</option>)}
                        </select>
                    </div>

                    {/* Breadcrumb inside main column */}
                    <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-[var(--text-muted)]">
                        <ol className="flex items-center gap-2 flex-wrap">
                            <li><button onClick={() => navigate('/')} className="hover:text-[var(--amber)] hover:underline">Help Center</button></li>
                            <li className="flex items-center gap-2"><ChevronRight size={14} className="opacity-50" /><button onClick={() => navigate(`/category/${slugify(article.category)}`)} className="hover:text-[var(--amber)] hover:underline">{article.category}</button></li>
                            <li className="flex items-center gap-2"><ChevronRight size={14} className="opacity-50" /><span className="hover:text-[var(--amber)] hover:underline">{article.section}</span></li>
                            <li className="flex items-center gap-2"><ChevronRight size={14} className="opacity-50" /><span className="text-[var(--text)] font-medium truncate max-w-[200px] sm:max-w-none" title={article.title}>{article.title}</span></li>
                        </ol>
                    </nav>

                    <h1 className="font-heading text-3xl md:text-4xl font-semibold text-[var(--text)] mb-4 leading-tight">{article.title}</h1>
                    
                    {/* Metadata strip */}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-[var(--text-muted)] mb-8 pb-8 border-b border-[var(--border)]">
                        <span>By {article.author}</span>
                        <span>&middot;</span>
                        <span>Last updated {article.updatedAt} (<span className="font-mono text-xs">{article.updatedInVersion}</span>)</span>
                        <span className="relative group cursor-help text-[var(--text-muted)] border-b border-dotted border-[var(--text-muted)]" title="Version in which this article was last updated">ⓘ</span>
                        <span>&middot;</span>
                        <span>Available from <span className="font-mono text-xs">{article.availableFromVersion}</span></span>
                        <span className="relative group cursor-help text-[var(--text-muted)] border-b border-dotted border-[var(--text-muted)]" title="First Troop Messenger version with this feature">ⓘ</span>
                        <span>&middot;</span>
                        <span>{article.readTime}</span>
                    </div>

                    {showWhatsChanged && (
                        <div className="bg-[var(--teal-soft)] border-l-4 border-l-[var(--teal)] rounded-r-xl p-4 md:p-5 mb-8 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div><span className="font-semibold text-[var(--text)]">Updated in {article.updatedInVersion}:</span> <span className="text-[var(--text-muted)]">{article.changeNote}</span></div>
                            <button onClick={() => setDrawerOpen(true)} className="whitespace-nowrap font-medium text-[var(--teal)] hover:underline">View version history</button>
                        </div>
                    )}

                    <div className="font-serif text-lg md:text-xl text-[var(--text)] leading-relaxed border-l-4 border-[var(--border)] pl-5 md:pl-6 mb-12 italic opacity-90">
                        "Airtime Mode turns a group into a broadcast channel. Only Group Owners and Group Moderators can send messages. Everyone else can read messages, play media and download shared files, but cannot send."
                    </div>

                    <div className="prose prose-sm sm:prose-base max-w-none text-[var(--text)] space-y-8 pb-12 border-b border-[var(--border)]">
                        
                        <h2 id="overview" className="font-heading text-2xl font-semibold mt-10 mb-4 scroll-mt-24">Overview</h2>
                        <p className="leading-relaxed">A group in Airtime Mode works like an announcement channel. Group Owners and Group Moderators can send text, media, attachments, voice and video messages. Other members have receive-only access.</p>
                        <p className="leading-relaxed">Airtime used to be a separate group type. It is now a messaging mode, so you can switch it on or off for any group type: Regular, Organization-wide, Rule-based and Directory-synced groups.</p>
                        
                        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 my-6 shadow-sm">
                            <h3 className="font-semibold text-lg mb-3">What members can still do</h3>
                            <ul className="list-disc pl-5 space-y-2 text-[var(--text-muted)]">
                                <li>View messages and play media</li>
                                <li>Download shared files</li>
                                <li>Use their personal settings</li>
                                <li>Leave the group, if leaving is allowed for that group</li>
                            </ul>
                        </div>

                        <h2 id="before-you-begin" className="font-heading text-2xl font-semibold mt-10 mb-4 scroll-mt-24">Before you begin</h2>
                        <ul className="list-disc pl-5 space-y-3 text-[var(--text-muted)] marker:text-[var(--amber)]">
                            <li>Airtime Mode must be allowed by your workspace administrator in <span className="font-mono text-xs bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text)]">Admin Console &gt; Settings &gt; Group Controls</span>. If it is switched off, the option is hidden when you create or edit a group.</li>
                            <li>Your administrator must have given your user cluster permission to create groups in Airtime Mode.</li>
                            <li>Full users and Plus users can create or enable Airtime groups when permitted. Basic and Basic Plus users cannot create groups or send messages.</li>
                            <li>To change an existing group, you must be its Group Owner.</li>
                        </ul>
                        
                        <div className="bg-[var(--amber-soft)] border-l-4 border-l-[var(--amber)] rounded-r-xl p-5 my-8">
                            <div className="flex items-center gap-2 font-bold text-[var(--text)] mb-1"><AlertCircle size={18} className="text-[var(--amber)]" /> Important</div>
                            <p className="text-sm text-[var(--text-muted)]">If you do not see Enable Airtime Mode for this Group, your administrator has switched Airtime Mode off or has not given you permission to create Airtime groups.</p>
                        </div>

                        <h2 id="enable-airtime-mode" className="font-heading text-2xl font-semibold mt-10 mb-4 scroll-mt-24">Enable Airtime Mode</h2>
                        <p className="mb-6">You can switch Airtime Mode on while creating a group, or later while editing it.</p>
                        
                        <div className="space-y-6">
                            {[
                                { t: 'Open group creation or editing', d: 'Click Create Group, or open an existing group and choose Edit Group.' },
                                { t: 'Fill in the group details', d: 'Enter the group name and, optionally, a description and profile image.' },
                                { t: 'Tick the Airtime checkbox', d: 'Check Enable Airtime Mode for this Group. It is unchecked by default. Hover the info icon to read the tooltip.', hasImage: true },
                                { t: 'Add members and moderators', d: 'Select members, then assign Group Moderators who should also be able to send messages.' },
                                { t: 'Save', d: 'Click Create Group, or Save changes if you are editing.' },
                                { t: 'Confirm the mode tag', d: 'Open Group Details > Info. The group shows its full mode tag, for example Regular Group – Airtime.' }
                            ].map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--navy)] text-white flex items-center justify-center font-bold text-sm">{i+1}</div>
                                    <div className="pt-1.5">
                                        <div className="font-bold text-[var(--text)] mb-1">{step.t}</div>
                                        <div className="text-[var(--text-muted)]">{step.d}</div>
                                        {step.hasImage && (
                                            <div className="mt-4 mb-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg p-2 text-center text-[var(--text-muted)] text-sm italic py-12 flex flex-col items-center justify-center gap-2">
                                                <div className="w-10 h-10 bg-[var(--bg)] rounded flex items-center justify-center"><Info size={20} className="opacity-50" /></div>
                                                Screenshot placeholder
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 border-l-[3px] border-[var(--border)] pl-4 text-sm text-[var(--text-muted)] italic">
                            <strong className="text-[var(--text)] not-italic block mb-1">Tooltip text</strong>
                            Only Group Owners and Group Moderators can send messages. Other members can view messages and shared content but cannot send messages.
                        </div>

                        <h2 id="standard-vs-airtime" className="font-heading text-2xl font-semibold mt-10 mb-4 scroll-mt-24">Standard vs Airtime</h2>
                        <div className="overflow-x-auto custom-scrollbar border border-[var(--border)] rounded-xl my-6 bg-[var(--surface)]">
                            <table className="w-full text-left border-collapse min-w-[720px]">
                                <thead>
                                    <tr className="bg-[var(--bg)] border-b border-[var(--border)]">
                                        <th className="p-4 font-semibold text-sm w-1/3">Behavior</th>
                                        <th className="p-4 font-semibold text-sm w-1/3 border-l border-[var(--border)]">Standard mode</th>
                                        <th className="p-4 font-semibold text-sm w-1/3 border-l border-[var(--border)]">Airtime mode</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    <tr className="border-b border-[var(--border)]">
                                        <td className="p-4 text-[var(--text-muted)] font-medium">Who can send messages</td>
                                        <td className="p-4 border-l border-[var(--border)]">All members</td>
                                        <td className="p-4 border-l border-[var(--border)]">Group Owners and Group Moderators only</td>
                                    </tr>
                                    <tr className="border-b border-[var(--border)]">
                                        <td className="p-4 text-[var(--text-muted)] font-medium">What members can do</td>
                                        <td className="p-4 border-l border-[var(--border)]">Send, view, play and download</td>
                                        <td className="p-4 border-l border-[var(--border)]">View, play and download only</td>
                                    </tr>
                                    <tr className="border-b border-[var(--border)]">
                                        <td className="p-4 text-[var(--text-muted)] font-medium">Best for</td>
                                        <td className="p-4 border-l border-[var(--border)]">Team discussion and collaboration</td>
                                        <td className="p-4 border-l border-[var(--border)]">Announcements and one-way updates</td>
                                    </tr>
                                    <tr className="border-b border-[var(--border)]">
                                        <td className="p-4 text-[var(--text-muted)] font-medium">Who can change the mode</td>
                                        <td className="p-4 border-l border-[var(--border)]">Group Owner</td>
                                        <td className="p-4 border-l border-[var(--border)]">Group Owner</td>
                                    </tr>
                                    <tr className="border-b border-[var(--border)]">
                                        <td className="p-4 text-[var(--text-muted)] font-medium">Message enhancements (Urgent, Buzz)</td>
                                        <td className="p-4 border-l border-[var(--border)]">Available to members as permitted</td>
                                        <td className="p-4 border-l border-[var(--border)]">Available to Group Owners and Moderators</td>
                                    </tr>
                                    <tr>
                                        <td className="p-4 text-[var(--text-muted)] font-medium">Group Details tag</td>
                                        <td className="p-4 border-l border-[var(--border)]"><span className="font-mono text-xs bg-[var(--bg)] px-1.5 py-0.5 border rounded">Regular Group</span></td>
                                        <td className="p-4 border-l border-[var(--border)]"><span className="font-mono text-xs bg-[var(--bg)] px-1.5 py-0.5 border rounded">Regular Group – Airtime</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-[var(--amber-soft)] border-l-4 border-l-[var(--amber)] rounded-r-xl p-5 my-8">
                            <div className="flex items-center gap-2 font-bold text-[var(--text)] mb-1"><AlertCircle size={18} className="text-[var(--amber)]" /> Important</div>
                            <p className="text-sm text-[var(--text-muted)]">Buzz + Fanout cannot be combined in an Airtime group unless you are its Group Owner or a Group Moderator.</p>
                        </div>

                        <h2 id="group-id-and-tags" className="font-heading text-2xl font-semibold mt-10 mb-4 scroll-mt-24">Group ID and tags</h2>
                        <p>Every group gets an automatic Group ID. For Airtime groups the ID includes the <code>AT</code> marker so you can recognise them quickly.</p>
                        
                        <div className="my-6">
                            <div className="flex items-center justify-between bg-[var(--navy)] text-[var(--navy-text)] px-4 py-2 rounded-t-xl">
                                <span className="text-xs font-mono">Example Group IDs (dummy format)</span>
                                <button onClick={() => { copyToClipboard('Regular group, Airtime    GRP-RG-AT-000123'); setToastMsg('Code copied'); setTimeout(() => setToastMsg(''), 2000); }} className="text-[var(--text-muted)] hover:text-white transition-colors" aria-label="Copy code">
                                    <Copy size={16} />
                                </button>
                            </div>
                            <div className="bg-[#152033] rounded-b-xl p-4 overflow-x-auto custom-scrollbar">
                                <pre className="text-sm font-mono text-[#EAF0F8] m-0"><code className="whitespace-pre">
{`Regular group, Airtime            GRP-RG-AT-000123
Organization-wide group, Airtime  GRP-OW-AT-000456
Rule-based group, Airtime         GRP-RB-AT-000789
Directory-synced group, Airtime   GRP-DS-AT-001011`}
                                </code></pre>
                            </div>
                        </div>

                        <p>To see only Airtime groups in your chat list, open the Side Panel and choose <span className="font-mono text-xs bg-[var(--surface)] border border-[var(--border)] px-1.5 py-0.5 rounded text-[var(--text)]">Filters &gt; Groups &gt; Airtime Groups</span>. This option appears only when you belong to at least one Airtime group.</p>

                        <h2 id="common-questions" className="font-heading text-2xl font-semibold mt-10 mb-6 scroll-mt-24">Common questions</h2>
                        <Accordion title="Why can't I send messages in this group?" defaultOpen={true}>
                            The group is in Airtime Mode. Only Group Owners and Group Moderators can send. Ask a Group Owner to make you a Moderator if you need to post.
                        </Accordion>
                        <Accordion title="Why don't I see the Airtime checkbox?">
                            Your administrator may have switched Airtime Mode off, or your account may not be allowed to create Airtime groups. Contact your administrator.
                        </Accordion>
                        <Accordion title="Can I turn Airtime Mode on for an auto-populated group?">
                            Yes. Airtime Mode works with Organization-wide, Rule-based and Directory-synced groups as well as Regular groups, if your administrator allows it.
                        </Accordion>
                        <Accordion title="Can Basic users send messages in an Airtime group?">
                            No. Basic and Basic Plus users cannot create groups or send messages in any group.
                        </Accordion>
                        <Accordion title="Can members still leave an Airtime group?">
                            Yes, if leaving is allowed for that group. Auto-populated groups managed by your organization may not allow it.
                        </Accordion>
                    </div>

                    <div className="py-12 border-b border-[var(--border)]">
                        <FeedbackWidget articleId={article.id} version={article.version} />
                    </div>

                    <div className="py-12">
                        <h3 className="font-heading text-xl font-semibold mb-6">Related articles</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {related.map(r => (
                                <a href="#" key={r.id} onClick={(e) => { e.preventDefault(); navigate(`/article/${slugify(r.title)}`); }} className="group p-5 bg-[var(--surface)] border border-[var(--border)] rounded-xl hover:border-[var(--amber)] hover:shadow-md transition-all">
                                    <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] mb-2">{r.section || r.category}</div>
                                    <h4 className="font-medium text-[var(--text)] mb-2 group-hover:text-[var(--amber)] transition-colors">{r.title}</h4>
                                    <p className="text-xs text-[var(--text-muted)] line-clamp-1">{r.summary}</p>
                                </a>
                            ))}
                        </div>
                    </div>
                </article>

                {/* Right Rail (TOC) */}
                <aside className="w-full md:w-[220px] flex-shrink-0 hidden lg:block">
                    <div className="sticky top-24 space-y-10">
                        <div>
                            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] mb-4">On this page</h3>
                            <nav className="flex flex-col gap-2 relative">
                                {[
                                    { id: 'overview', label: 'Overview' },
                                    { id: 'before-you-begin', label: 'Before you begin' },
                                    { id: 'enable-airtime-mode', label: 'Enable Airtime Mode' },
                                    { id: 'standard-vs-airtime', label: 'Standard vs Airtime' },
                                    { id: 'group-id-and-tags', label: 'Group ID and tags' },
                                    { id: 'common-questions', label: 'Common questions' }
                                ].map((heading) => {
                                    const isActive = activeHeading === heading.id;
                                    return (
                                        <a href={`#${heading.id}`} key={heading.id} className={`text-sm py-1 pl-4 transition-colors relative border-l-2 ${isActive ? 'font-semibold text-[var(--text)] border-[var(--amber)]' : 'font-medium text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--text-muted)] hover:text-[var(--text)]'}`}>
                                            {isActive && <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[var(--amber)]" />}
                                            {heading.label}
                                        </a>
                                    );
                                })}
                            </nav>
                        </div>
                        <div className="pt-8 border-t border-[var(--border)] flex flex-col gap-3">
                            <button className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><Printer size={16} /> Print article</button>
                            <button onClick={() => { setToastMsg('PDF export coming soon'); setTimeout(() => setToastMsg(''), 3000); }} className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><Download size={16} /> Download PDF</button>
                            <button onClick={handleCopyLink} className="flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"><Copy size={16} /> Copy link</button>
                        </div>
                    </div>
                </aside>

            </main>

            <VersionHistoryDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} articleId={article.id} />
            <Toast message={toastMsg} visible={!!toastMsg} />
        </div>
    );
};

export default function App() {
    const basePath = import.meta.env.BASE_URL || '/';
    const normalizedBasePath = basePath === './' ? '/' : basePath.replace(/\/$/, '');

    const toAppPath = (path) => {
        const normalizedPath = path || '/';
        if (!normalizedBasePath || normalizedBasePath === '/') return normalizedPath;
        if (normalizedPath === normalizedBasePath) return '/';
        if (normalizedPath.startsWith(`${normalizedBasePath}/`)) return normalizedPath.slice(normalizedBasePath.length) || '/';
        return normalizedPath;
    };
    const toBrowserPath = (path) => {
        if (typeof path === 'number') return path;
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        if (!normalizedBasePath || normalizedBasePath === '/') return normalizedPath;
        if (normalizedPath === '/') return `${normalizedBasePath}/`;
        return `${normalizedBasePath}${normalizedPath}`;
    };
    const [activeMode, setActiveMode] = useState(() => {
        const storedMode = localStorage.getItem('km-active-mode') || 'reader';
        if (storedMode === 'admin' || storedMode === 'reviewer') return 'admin-reviewer';
        return storedMode;
    });
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    });
    const [currentRoute, setCurrentRoute] = useState({
        path: toAppPath(window.location.pathname),
        searchParams: new URLSearchParams(window.location.search || '')
    });

    useEffect(() => {
        const handlePopState = () => setCurrentRoute({ path: toAppPath(window.location.pathname), searchParams: new URLSearchParams(window.location.search) });
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    useEffect(() => { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('theme', theme); }, [theme]);
    useEffect(() => { localStorage.setItem('km-active-mode', activeMode); }, [activeMode]);
    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    const navigate = (path, params = {}) => {
        if (typeof path === 'number') { window.history.go(path); return; }
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') search.set(key, value); });
        const searchStr = search.toString() ? `?${search.toString()}` : '';
        const appPath = path.startsWith('/') ? path : `/${path}`;
        const newUrl = `${toBrowserPath(appPath)}${searchStr}`;
        try { window.history.pushState({}, '', newUrl); } catch (e) { console.warn("pushState fallback"); }
        setCurrentRoute({ path: appPath, searchParams: search });
    };

    let PageComponent = HomePage;
    if (currentRoute.path === '/search') PageComponent = SearchPage;
    else if (currentRoute.path.startsWith('/category/')) PageComponent = CategoryPage;
    else if (currentRoute.path.startsWith('/article/')) PageComponent = ArticlePage;

    if (activeMode !== 'reader') {
        const adminRole = activeMode === 'admin-reviewer' ? 'Admin/Reviewer' : 'Author';
        return <AdminApp initialRole={adminRole} onModeChange={setActiveMode} />;
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
            <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] theme-transition flex flex-col">
                <Header theme={theme} toggleTheme={toggleTheme} currentRoute={currentRoute} navigate={navigate} activeMode={activeMode} setActiveMode={setActiveMode} />
                <PageComponent currentRoute={currentRoute} navigate={navigate} />
                <Footer />
            </div>
        </>
    );
}
