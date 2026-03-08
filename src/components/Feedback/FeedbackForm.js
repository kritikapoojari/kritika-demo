import React, { useState, useEffect } from 'react';
import { submitFeedback, getFeedback } from '../../services/feedbackService';
import { trackFeedback } from '../../services/analyticsService';
import { getUserRole } from '../../config/roles';
import './FeedbackForm.css';

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

const StarDisplay = ({ rating }) => (
  <span className="review-stars" aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span key={s} className={s <= rating ? 'star filled' : 'star'}>
        ★
      </span>
    ))}
  </span>
);

const FeedbackForm = ({ contentUid, contentType, contentTitle }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReview, setNewReview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setReviewsLoading(true);
      try {
        const result = await getFeedback(contentUid);
        if (!cancelled) setReviews(result.items || []);
      } catch {
        // silently ignore — reviews are supplementary
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [contentUid]);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

    const optimisticReview = {
      uid: `local_${Date.now()}`,
      content_uid: contentUid,
      content_type: contentType,
      rating,
      comment,
      user_email: userEmail || 'anonymous@example.com',
      user_role: getUserRole(),
      created_at: new Date().toISOString(),
    };

    try {
      await submitFeedback({
        contentUid,
        contentType,
        rating,
        comment,
        userEmail: userEmail || 'anonymous@example.com',
        userRole: getUserRole(),
      });

      trackFeedback(contentUid, rating, contentType);
      setNewReview(optimisticReview);
      setReviews((prev) => [optimisticReview, ...prev]);
      setSubmitted(true);
      setRating(0);
      setComment('');
      setUserEmail('');

      setTimeout(() => {
        setSubmitted(false);
        setNewReview(null);
      }, 5000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      // Still show the review locally even if the webhook fails
      setNewReview(optimisticReview);
      setReviews((prev) => [optimisticReview, ...prev]);
      setSubmitted(true);
      setRating(0);
      setComment('');
      setUserEmail('');
      setTimeout(() => {
        setSubmitted(false);
        setNewReview(null);
      }, 5000);
    } finally {
      setSubmitting(false);
    }
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
    if (days < 30) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="feedback-form-container">
      {/* ── Summary bar ── */}
      {!reviewsLoading && reviews.length > 0 && (
        <div className="feedback-summary">
          <span className="feedback-summary-score">{averageRating}</span>
          <StarDisplay rating={Math.round(averageRating)} />
          <span className="feedback-summary-count">
            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            {contentTitle && <> for <strong>{contentTitle}</strong></>}
          </span>
        </div>
      )}

      <h2 className="feedback-title">Was this helpful?</h2>

      {submitted && (
        <div className="feedback-success" role="alert">
          <p>Thank you for your feedback!</p>
        </div>
      )}

      {error && (
        <div className="feedback-error" role="alert">
          <p>{error}</p>
        </div>
      )}

      <form className="feedback-form" onSubmit={handleSubmit}>
        <div className="rating-section">
          <span className="rating-label">Rating:</span>
          <div className="rating-buttons" role="radiogroup" aria-label="Rate this content">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`rating-button ${rating === value ? 'selected' : ''}`}
                onClick={() => setRating(value)}
                aria-label={`Rate ${value} out of 5 — ${STAR_LABELS[value]}`}
                aria-pressed={rating === value}
              >
                {value} ⭐
                {rating === value && (
                  <span className="rating-button-label">{STAR_LABELS[value]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor={`user-email-${contentUid}`}>
            Email (optional):
            <input
              id={`user-email-${contentUid}`}
              type="email"
              className="form-input"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="your.email@example.com"
              aria-label="Your email address (optional)"
            />
          </label>
        </div>

        <div className="form-group">
          <label htmlFor={`comment-${contentUid}`}>
            Comments (optional):
            <textarea
              id={`comment-${contentUid}`}
              className="form-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts…"
              rows="4"
              aria-label="Feedback comments"
            />
          </label>
        </div>

        <button
          type="submit"
          className="submit-button"
          disabled={submitting || rating === 0}
          aria-label="Submit feedback"
        >
          {submitting ? 'Submitting…' : 'Submit Feedback'}
        </button>
      </form>

      {/* ── Existing reviews ── */}
      {!reviewsLoading && reviews.length > 0 && (
        <div className="reviews-section">
          <h3 className="reviews-heading">
            What others are saying
            <span className="reviews-count">{reviews.length}</span>
          </h3>
          <div className="reviews-list">
            {reviews.map((review) => (
              <div
                key={review.uid}
                className={`review-card${review.uid === newReview?.uid ? ' review-card--new' : ''}`}
              >
                <div className="review-header">
                  <div className="review-avatar">
                    {displayName(review.user_email).charAt(0)}
                  </div>
                  <div className="review-meta">
                    <span className="review-author">{displayName(review.user_email)}</span>
                    {review.user_role && review.user_role !== 'viewer' && (
                      <span className="review-role">{review.user_role.replace('_', ' ')}</span>
                    )}
                    <time className="review-time" dateTime={review.created_at}>
                      {timeAgo(review.created_at)}
                    </time>
                  </div>
                  <div className="review-rating-badge">
                    <StarDisplay rating={review.rating} />
                  </div>
                </div>
                {review.comment && (
                  <p className="review-comment">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackForm;

