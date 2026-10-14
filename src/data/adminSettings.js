const categories = [
  { id: 'cat-collaboration-groups', name: 'Collaboration Groups', order: 0, sections: [
    { id: 'sec-groups-modes', name: 'Groups & Modes', order: 0 },
    { id: 'sec-membership-access', name: 'Membership & Access', order: 1 }
  ] },
  { id: 'cat-messaging-chats', name: 'Messaging & Chats', order: 1, sections: [
    { id: 'sec-direct-messaging', name: 'Direct & 1:1 Messaging', order: 0 },
    { id: 'sec-hands-free', name: 'Hands-Free & Transcription', order: 1 },
    { id: 'sec-drafts-schedules', name: 'Drafts Schedules & Outbox', order: 2 },
    { id: 'sec-composer', name: 'Composer', order: 3 }
  ] },
  { id: 'cat-user-onboarding', name: 'User Onboarding & Directories', order: 2, sections: [
    { id: 'sec-adding-users', name: 'Adding Users', order: 0 },
    { id: 'sec-directory-sync', name: 'Directory Sync', order: 1 }
  ] },
  { id: 'cat-files-attachments', name: 'Files & Attachments', order: 3, sections: [
    { id: 'sec-limits-types', name: 'Limits & Types', order: 0 }
  ] },
  { id: 'cat-security-restrictions', name: 'Security & Workspace Restrictions', order: 4, sections: [
    { id: 'sec-access-rules', name: 'Access Rules', order: 0 }
  ] },
  { id: 'cat-billing-subscriptions', name: 'Billing & Plan Subscriptions', order: 5, sections: [
    { id: 'sec-plans-licenses', name: 'Plans & Licenses', order: 0 }
  ] },
  { id: 'cat-organizational-units', name: 'Organizational Units & Rules', order: 6, sections: [
    { id: 'sec-units-rules', name: 'Units & Rules', order: 0 }
  ] },
  { id: 'cat-voice-video', name: 'Voice, Video & Screen Sharing', order: 7, sections: [
    { id: 'sec-calls', name: 'Calls', order: 0 }
  ] }
];

export const REVIEW_DUE_SOON_DAYS = 14;

let settings = {
  categories,
  reviewCycle: { default: 90, max: 90, dueSoonDays: REVIEW_DUE_SOON_DAYS },
  synonyms: [
    { id: 'syn-voice-message', term: 'voice message', synonyms: ['voice note', 'audio message', 'voice memo'] },
    { id: 'syn-microphone', term: 'microphone', synonyms: ['mic', 'audio input'] },
    { id: 'syn-airtime', term: 'airtime', synonyms: ['broadcast', 'announcement mode'] },
    { id: 'syn-group', term: 'group', synonyms: ['team chat', 'channel'] },
    { id: 'syn-read-receipts', term: 'read receipts', synonyms: ['seen', 'delivered ticks'] }
  ],
  feedbackReasons: ['Missing information', 'Incomplete', 'Hard to follow', 'Out of date', 'Incorrect', 'Other'],
  users: [
    { id: 'u1', name: 'Priya Menon', email: 'priya.menon@troopmessenger.com', role: 'Author', status: 'Active' },
    { id: 'u2', name: 'Meera Joshi', email: 'meera.joshi@troopmessenger.com', role: 'Author', status: 'Active' },
    { id: 'admin-1', name: 'Arjun Rao', email: 'arjun.rao@troopmessenger.com', role: 'Admin', status: 'Active' }
  ]
};

const listeners = new Set();

export function getAdminSettings() {
  return settings;
}

export function subscribeAdminSettings(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setAdminSettings(updater) {
  const next = typeof updater === 'function' ? updater(settings) : updater;
  settings = {
    ...settings,
    ...next,
    reviewCycle: next.reviewCycle ? { ...settings.reviewCycle, ...next.reviewCycle, dueSoonDays: REVIEW_DUE_SOON_DAYS } : settings.reviewCycle
  };
  listeners.forEach(listener => listener());
  return settings;
}

export function updateAdminCategories(categoriesList) {
  return setAdminSettings({ categories: categoriesList.map((category, index) => ({
    ...category,
    order: index,
    sections: category.sections.map((section, sectionIndex) => ({ ...section, order: sectionIndex }))
  })) });
}

export function updateAdminSynonyms(synonyms) {
  return setAdminSettings({ synonyms });
}

export function updateFeedbackReasons(feedbackReasons) {
  return setAdminSettings({ feedbackReasons });
}

export function updateAdminUsers(users) {
  return setAdminSettings({ users });
}
