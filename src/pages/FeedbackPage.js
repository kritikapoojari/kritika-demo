import React, { useState, useEffect } from 'react';
import { getFeedbackAnalytics, submitFeedback } from '../services/feedbackService';
import { trackFeedback } from '../services/analyticsService';
import { getUserRole, ROLES, hasPermission } from '../config/roles';
import './FeedbackPage.css';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const CONTENT_TYPE_LABELS = { documentation: 'Documentation', faq: 'FAQ', unknown: 'General' };
const CONTENT_TITLES = {
  blt_doc_getting_started: 'Getting Started with the Platform',
  blt_doc_content_types: 'Designing Content Types',
  blt_doc_webhooks: 'Webhooks & Event-Driven Workflows',
  blt_doc_rich_text: 'Working with the Rich Text Editor',
  blt_doc_environments: 'Managing Environments',
  blt_faq_delivery_token: 'What is a Delivery Token?',
  blt_faq_content_type_118: 'Error 118 — Content Type not found',
  blt_faq_publish_entry: 'Why is my entry not showing up?',
  blt_faq_webhook_retry: 'Will Contentstack retry missed webhooks?',
  blt_faq_modular_blocks: 'How do I render Modular Blocks in React?',
  blt_faq_image_optimisation: 'Can I resize images from the CDN?',
};

const StarDisplay = ({ rating }) => (
  <span className="fp-stars" aria-label={`${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= rating ? 'fp-star fp-star--filled' : 'fp-star'}>★</span>
    ))}
  </span>
);

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
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const FeedbackPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [allReviews, setAllReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const userRole = getUserRole();
  const canSubmit = hasPermission(userRole, 'feedback', 'write');

  // General feedback form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [topic, setTopic] = useState('general');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const result = await getFeedbackAnalytics();
        setAnalytics(result);
        // getFeedbackAnalytics falls back to MOCK_FEEDBACK_ENTRIES; grab the full list from the service
        const { getAllFeedback } = await import('../services/feedbackService');
        const entries = await getAllFeedback();
        setAllReviews(entries);
      } catch (err) {
        console.warn('Could not load feedback:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setFormError('Please select a rating.'); return; }

    setSubmitting(true);
    setFormError(null);

    const optimistic = {
      uid: `local_${Date.now()}`,
      content_uid: `general_${topic}`,
      content_type: topic,
      rating,
      comment,
      user_email: userEmail || 'anonymous@example.com',
      user_role: getUserRole(),
      created_at: new Date().toISOString(),
    };

    try {
      await submitFeedback({
        contentUid: `general_${topic}`,
        contentType: topic,
        rating,
        comment,
        userEmail: userEmail || 'anonymous@example.com',
        userRole: getUserRole(),
      });
      trackFeedback(`general_${topic}`, rating, topic);
    } catch {
      // show optimistically regardless
    }

    setAllReviews((prev) => [optimistic, ...prev]);
    setAnalytics((prev) => {
      if (!prev) return prev;
      const newTotal = prev.total + 1;
      const newAvg = parseFloat(((prev.averageRating * prev.total + rating) / newTotal).toFixed(2));
      return {
        ...prev,
        total: newTotal,
        averageRating: newAvg,
        ratingDistribution: {
          ...prev.ratingDistribution,
          [rating]: (prev.ratingDistribution[rating] || 0) + 1,
        },
        byContentType: {
          ...prev.byContentType,
          [topic]: (prev.byContentType[topic] || 0) + 1,
        },
      };
    });

    setSubmitted(true);
    setRating(0);
    setComment('');
    setUserEmail('');
    setTopic('general');
    setSubmitting(false);

    setTimeout(() => setSubmitted(false), 5000);
  };

  const filteredReviews =
    activeFilter === 'all'
      ? allReviews
      : allReviews.filter((r) => r.content_type === activeFilter);

  const contentTypeFilters = ['all', 'documentation', 'faq'];

  if (loading) {
    return (
      <div className="fp-page">
        <div className="fp-loading" role="status">Loading feedback…</div>
      </div>
    );
  }

  return (
    <div className="fp-page">
      <header className="fp-header">
        <h1 className="fp-heading">Feedback</h1>
        <p className="fp-subheading">
          See what the community is saying and share your own experience.
        </p>
      </header>

      {/* ── Stats strip ── */}
      {analytics && (
        <div className="fp-stats-strip">
          <div className="fp-stat">
            <span className="fp-stat-value">{analytics.total}</span>
            <span className="fp-stat-label">Total reviews</span>
          </div>
          <div className="fp-stat">
            <span className="fp-stat-value">{analytics.averageRating.toFixed(1)}</span>
            <span className="fp-stat-label">Average rating</span>
          </div>
          {Object.entries(analytics.byContentType).map(([type, count]) => (
            <div className="fp-stat" key={type}>
              <span className="fp-stat-value">{count}</span>
              <span className="fp-stat-label">{CONTENT_TYPE_LABELS[type] || type}</span>
            </div>
          ))}
          <div className="fp-rating-bars">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = analytics.ratingDistribution[star] || 0;
              const pct = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
              return (
                <div className="fp-bar-row" key={star}>
                  <span className="fp-bar-label">{star}★</span>
                  <div className="fp-bar-track">
                    <div className="fp-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="fp-bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="fp-body">
        {/* ── Left: reviews list ── */}
        <section className="fp-reviews-section" aria-label="All feedback reviews">
          <div className="fp-filter-tabs" role="tablist">
            {contentTypeFilters.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={activeFilter === f}
                className={`fp-tab${activeFilter === f ? ' fp-tab--active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f === 'all' ? 'All' : CONTENT_TYPE_LABELS[f]}
                <span className="fp-tab-count">
                  {f === 'all'
                    ? allReviews.length
                    : allReviews.filter((r) => r.content_type === f).length}
                </span>
              </button>
            ))}
          </div>

          {filteredReviews.length === 0 ? (
            <p className="fp-empty">No feedback yet for this category.</p>
          ) : (
            <div className="fp-reviews-list">
              {filteredReviews.map((review) => (
                <div className="fp-review-card" key={review.uid}>
                  <div className="fp-review-top">
                    <div className="fp-avatar">
                      {displayName(review.user_email).charAt(0)}
                    </div>
                    <div className="fp-review-meta">
                      <span className="fp-review-author">{displayName(review.user_email)}</span>
                      {review.user_role && review.user_role !== 'viewer' && (
                        <span className="fp-review-role">{review.user_role.replace('_', ' ')}</span>
                      )}
                      <time className="fp-review-time" dateTime={review.created_at}>
                        {timeAgo(review.created_at)}
                      </time>
                    </div>
                    <div className="fp-review-right">
                      <StarDisplay rating={review.rating} />
                      <span className={`fp-type-badge fp-type-badge--${review.content_type}`}>
                        {CONTENT_TYPE_LABELS[review.content_type] || review.content_type}
                      </span>
                    </div>
                  </div>
                  {CONTENT_TITLES[review.content_uid] && (
                    <p className="fp-review-source">
                      Re: <em>{CONTENT_TITLES[review.content_uid]}</em>
                    </p>
                  )}
                  {review.comment && (
                    <p className="fp-review-comment">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── Right: submit form ── */}
        <aside className="fp-form-aside">
          <div className="fp-form-card">
            <h2 className="fp-form-title">Share your feedback</h2>
            <p className="fp-form-subtitle">
              Your opinion helps us improve the Knowledge Portal.
            </p>

            {!canSubmit ? (
              <div style={{
                textAlign: 'center', padding: '2rem 1rem',
                background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1',
                color: '#64748b',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Guests cannot submit feedback</p>
                <p style={{ fontSize: '0.8rem', margin: 0 }}>Switch to Viewer, Editor, or Admin role to leave a review.</p>
              </div>
            ) : (
              <>
                {submitted && (
                  <div className="fp-form-success" role="alert">
                    Thank you! Your feedback has been recorded.
                  </div>
                )}
                {formError && (
                  <div className="fp-form-error" role="alert">{formError}</div>
                )}

                <form className="fp-form" onSubmit={handleSubmit}>
                  <div className="fp-form-group">
                    <label htmlFor="fp-topic" className="fp-form-label">Topic</label>
                    <select
                      id="fp-topic"
                      className="fp-form-select"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    >
                      <option value="documentation">Documentation</option>
                      <option value="faq">FAQ</option>
                      <option value="general">General</option>
                    </select>
              </div>

              <div className="fp-form-group">
                <span className="fp-form-label">Rating</span>
                <div className="fp-rating-row" role="radiogroup" aria-label="Select rating">
                  {[1, 2, 3, 4, 5].map((v) => (
                    <button
                      key={v}
                      type="button"
                      className={`fp-rating-btn${rating === v ? ' fp-rating-btn--active' : ''}`}
                      onClick={() => setRating(v)}
                      aria-label={`${v} — ${STAR_LABELS[v]}`}
                      aria-pressed={rating === v}
                    >
                      <span className="fp-rating-btn-star">★</span>
                      <span className="fp-rating-btn-num">{v}</span>
                      {rating === v && (
                        <span className="fp-rating-btn-label">{STAR_LABELS[v]}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fp-form-group">
                <label htmlFor="fp-email" className="fp-form-label">Email (optional)</label>
                <input
                  id="fp-email"
                  type="email"
                  className="fp-form-input"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>

              <div className="fp-form-group">
                <label htmlFor="fp-comment" className="fp-form-label">Comments (optional)</label>
                <textarea
                  id="fp-comment"
                  className="fp-form-textarea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="fp-submit-btn"
                disabled={submitting || rating === 0}
              >
                {submitting ? 'Submitting…' : 'Submit Feedback'}
              </button>
            </form>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FeedbackPage;
