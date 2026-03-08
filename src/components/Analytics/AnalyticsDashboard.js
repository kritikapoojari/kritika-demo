import React, { useState, useEffect, useCallback } from 'react';
import { getFeedbackAnalytics, getAllFeedback } from '../../services/feedbackService';
import { getUserRole, hasPermission } from '../../config/roles';
import './AnalyticsDashboard.css';

const CONTENT_TITLE_MAP = {
  blt_doc_getting_started: 'Getting Started',
  blt_doc_content_types: 'Designing Content Types',
  blt_doc_webhooks: 'Webhooks & Event-Driven Workflows',
  blt_doc_environments: 'Managing Environments',
  blt_doc_rich_text: 'Working with the Rich Text Editor',
  blt_doc_localization: 'Localisation & Multi-language Content',
  blt_doc_roles_permissions: 'Roles & Permissions',
  blt_doc_graphql: 'GraphQL Content Delivery API',
  blt_doc_live_preview: 'Live Preview & Visual Builder',
  blt_doc_assets: 'Asset Management & Image Delivery',
  blt_faq_delivery_token: 'What is a Delivery Token?',
  blt_faq_content_type_118: 'Error 118 — Content Type not found',
  blt_faq_publish_entry: 'Why is my entry not showing up?',
  blt_faq_webhook_retry: 'Will Contentstack retry missed webhooks?',
  blt_faq_modular_blocks: 'How do I render Modular Blocks?',
  blt_faq_image_optimisation: 'Can I resize images from the CDN?',
  blt_faq_graphql: 'Does Contentstack support GraphQL?',
  blt_faq_live_preview: 'How do I set up Live Preview?',
  blt_faq_locales: 'How do I fetch content in a specific language?',
  blt_faq_management_token: 'Management Token vs Delivery Token',
  blt_faq_rate_limits: 'Are there rate limits on the Delivery API?',
};

const displayName = (email) => {
  if (!email || email === 'anonymous@example.com') return 'Anonymous';
  return email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
};

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const userRole = getUserRole();

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const [result, entries] = await Promise.all([
        getFeedbackAnalytics({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
        getAllFeedback(),
      ]);
      setAnalytics(result);
      setAllFeedback(entries);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (hasPermission(userRole, 'analytics', true)) {
      fetchAnalytics();
    } else {
      setError('You do not have permission to view analytics.');
      setLoading(false);
    }
  }, [dateRange, userRole, fetchAnalytics]);

  // Derive top-rated and most-reviewed content from feedback entries
  const topContentMap = {};
  allFeedback.forEach((fb) => {
    const key = fb.content_uid;
    if (!topContentMap[key]) {
      topContentMap[key] = { uid: key, type: fb.content_type, total: 0, ratingSum: 0 };
    }
    topContentMap[key].total += 1;
    topContentMap[key].ratingSum += fb.rating || 0;
  });
  const topContent = Object.values(topContentMap)
    .map((c) => ({ ...c, avg: parseFloat((c.ratingSum / c.total).toFixed(1)) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const recentActivity = [...allFeedback]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  if (!hasPermission(userRole, 'analytics', true)) {
    return (
      <div className="analytics-dashboard">
        <div className="permission-denied" role="alert">
          <h2>Access Denied</h2>
          <p>You do not have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-container" role="status" aria-live="polite">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="error-container" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <header className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="date-filters">
          <label htmlFor="start-date">
            Start Date:
            <input
              id="start-date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              aria-label="Filter analytics from start date"
            />
          </label>
          <label htmlFor="end-date">
            End Date:
            <input
              id="end-date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              aria-label="Filter analytics to end date"
            />
          </label>
        </div>
      </header>

      {analytics && (
        <div className="analytics-content">

          {/* ── Row 1: KPI cards ── */}
          <div className="analytics-card kpi-card">
            <h2>Total Reviews</h2>
            <div className="kpi-value">{analytics.total}</div>
            <p className="kpi-label">feedback submissions</p>
          </div>

          <div className="analytics-card kpi-card">
            <h2>Average Rating</h2>
            <div className="kpi-value">{analytics.averageRating.toFixed(1)}<span className="kpi-unit"> / 5</span></div>
            <div className="kpi-stars">
              {[1,2,3,4,5].map((s) => (
                <span key={s} className={s <= Math.round(analytics.averageRating) ? 'kpi-star filled' : 'kpi-star'}>★</span>
              ))}
            </div>
          </div>

          <div className="analytics-card kpi-card">
            <h2>Satisfaction Rate</h2>
            <div className="kpi-value">
              {analytics.total > 0
                ? Math.round(((analytics.ratingDistribution[4] + analytics.ratingDistribution[5]) / analytics.total) * 100)
                : 0}
              <span className="kpi-unit">%</span>
            </div>
            <p className="kpi-label">rated 4 or 5 stars</p>
          </div>

          {/* ── Rating distribution ── */}
          <div className="analytics-card">
            <h2>Rating Distribution</h2>
            <div className="rating-distribution">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = analytics.ratingDistribution[rating] || 0;
                const pct = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                return (
                  <div key={rating} className="rating-bar">
                    <span className="rating-label">{rating} ⭐</span>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${pct}%` }}
                        role="progressbar"
                        aria-valuenow={count}
                        aria-valuemin="0"
                        aria-valuemax={analytics.total}
                        aria-label={`${count} reviews with ${rating} stars`}
                      />
                    </div>
                    <span className="rating-count">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Feedback by content type ── */}
          <div className="analytics-card">
            <h2>By Content Type</h2>
            <div className="content-type-stats">
              {Object.entries(analytics.byContentType).map(([type, count]) => (
                <div key={type} className="content-type-stat">
                  <span className={`type-badge type-badge--${type}`}>{type}</span>
                  <div className="type-bar-track">
                    <div
                      className="type-bar-fill"
                      style={{ width: `${(count / analytics.total) * 100}%` }}
                    />
                  </div>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Top reviewed content ── */}
          <div className="analytics-card analytics-card--wide">
            <h2>Most Reviewed Content</h2>
            <div className="top-content-grid">
              {topContent.map((item) => (
                <div key={item.uid} className="top-content-item">
                  <div className="top-content-header">
                    <span className={`type-badge type-badge--${item.type}`}>{item.type}</span>
                    <span className="top-content-avg">
                      {item.avg} <span className="star-filled">★</span>
                    </span>
                  </div>
                  <p className="top-content-title">
                    {CONTENT_TITLE_MAP[item.uid] || item.uid}
                  </p>
                  <p className="top-content-count">{item.total} review{item.total !== 1 ? 's' : ''}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Recent activity ── */}
          <div className="analytics-card analytics-card--wide">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {recentActivity.map((fb) => (
                <div key={fb.uid} className="activity-row">
                  <div className="activity-avatar">
                    {displayName(fb.user_email).charAt(0)}
                  </div>
                  <div className="activity-body">
                    <span className="activity-author">{displayName(fb.user_email)}</span>
                    {' '}reviewed{' '}
                    <span className="activity-content">
                      {CONTENT_TITLE_MAP[fb.content_uid] || fb.content_uid}
                    </span>
                    {fb.comment && (
                      <p className="activity-comment">"{fb.comment}"</p>
                    )}
                  </div>
                  <div className="activity-right">
                    <span className="activity-rating">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={s <= fb.rating ? 'star-filled' : 'star-empty'}>★</span>
                      ))}
                    </span>
                    <time className="activity-time">{timeAgo(fb.created_at)}</time>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

