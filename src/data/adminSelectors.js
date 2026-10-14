import { REVIEW_DUE_SOON_DAYS } from './adminSettings.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getReviewWindowStatus(article, asOf, windowDays = REVIEW_DUE_SOON_DAYS) {
  if (article.status !== 'published' || article.reviewState === 'recheck-pending' || !article.nextReviewAt) return null;

  const difference = new Date(article.nextReviewAt).getTime() - asOf.getTime();
  if (difference < 0) return { status: 'overdue', days: Math.floor(Math.abs(difference) / DAY_MS) };

  const days = Math.ceil(difference / DAY_MS);
  return days <= windowDays ? { status: 'due-soon', days } : null;
}

export function getNextReviewDisplay(article, asOf, windowDays = REVIEW_DUE_SOON_DAYS) {
  if (article.status !== 'published') return null;
  if (article.reviewState === 'recheck-pending') return { status: 'recheck-pending', date: article.nextReviewAt || null, days: null };
  const timing = getReviewWindowStatus(article, asOf, windowDays);
  if (timing) return { ...timing, date: article.nextReviewAt };
  return { status: 'scheduled', date: article.nextReviewAt || null, days: null };
}

export function selectReviewQueue(articles) {
  return articles
    .filter(article => article.status === 'in-review' || article.reviewState === 'recheck-pending')
    .sort((a, b) => {
      const firstDate = a.reviewState === 'recheck-pending' ? a.recheckRequestedAt || a.submittedAt || a.updatedAt : a.submittedAt || a.updatedAt;
      const secondDate = b.reviewState === 'recheck-pending' ? b.recheckRequestedAt || b.submittedAt || b.updatedAt : b.submittedAt || b.updatedAt;
      return new Date(firstDate) - new Date(secondDate);
    });
}

export function getArticleRoute(article, role) {
  return role === 'Author' ? `/admin/articles/${article.id}` : `/admin/review/${article.id}`;
}

export function selectReviewQueueTab(articles, tab, asOf, publishedDays = 30) {
  if (tab === 'awaiting') {
    return articles
      .filter(article => article.status === 'in-review' && article.reviewState !== 'recheck-pending')
      .sort((a, b) => new Date(a.submittedAt || a.updatedAt) - new Date(b.submittedAt || b.updatedAt));
  }
  if (tab === 'recheck') {
    return articles
      .filter(article => article.reviewState === 'recheck-pending')
      .sort((a, b) => new Date(a.recheckRequestedAt || a.submittedAt || a.updatedAt) - new Date(b.recheckRequestedAt || b.submittedAt || b.updatedAt));
  }
  if (tab === 'returned') {
    return articles
      .filter(article => article.status === 'changes-requested')
      .sort((a, b) => new Date(a.returnedAt || a.updatedAt) - new Date(b.returnedAt || b.updatedAt));
  }
  if (tab === 'published') {
    const threshold = asOf.getTime() - publishedDays * DAY_MS;
    return articles
      .filter(article => article.status === 'published' && Math.max(new Date(article.lastPublished || 0).getTime(), new Date(article.lastConfirmed || 0).getTime()) >= threshold)
      .sort((a, b) => Math.max(new Date(b.lastPublished || 0).getTime(), new Date(b.lastConfirmed || 0).getTime()) - Math.max(new Date(a.lastPublished || 0).getTime(), new Date(a.lastConfirmed || 0).getTime()));
  }
  return [];
}

export function selectReviewQueueCounts(articles) {
  return {
    awaiting: articles.filter(article => article.status === 'in-review' && article.reviewState !== 'recheck-pending').length,
    recheck: articles.filter(article => article.reviewState === 'recheck-pending').length,
    returned: articles.filter(article => article.status === 'changes-requested').length
  };
}

export function selectReviewWindowArticles(articles, asOf, windowDays = REVIEW_DUE_SOON_DAYS) {
  return articles
    .map(article => ({ article, timing: getReviewWindowStatus(article, asOf, windowDays) }))
    .filter(item => item.timing)
    .sort((a, b) => {
      if (a.timing.status !== b.timing.status) return a.timing.status === 'overdue' ? -1 : 1;
      if (a.timing.status === 'overdue') return new Date(a.article.nextReviewAt) - new Date(b.article.nextReviewAt);
      return new Date(a.article.nextReviewAt) - new Date(b.article.nextReviewAt);
    });
}

export function selectFeedbackOverview(feedback, articles) {
  const openFeedback = feedback.filter(item => !item.dismissed && item.status !== 'dismissed');
  const articleCounts = new Map();

  openFeedback.forEach(item => {
    articleCounts.set(item.articleId, (articleCounts.get(item.articleId) || 0) + 1);
  });

  const rows = [...articleCounts.entries()]
    .map(([articleId, count]) => {
      const article = articles.find(item => item.id === articleId);
      return article ? { article, count } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.count - a.count || a.article.title.localeCompare(b.article.title));

  return { total: openFeedback.length, rows };
}

export function selectRecentlyPublished(articles) {
  return articles
    .filter(article => article.status === 'published')
    .sort((a, b) => new Date(b.lastPublished || b.publishedAt) - new Date(a.lastPublished || a.publishedAt));
}