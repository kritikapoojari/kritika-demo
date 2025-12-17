import React, { useState } from 'react';
import { submitFeedback } from '../../services/feedbackService';
import { trackFeedback } from '../../services/analyticsService';
import { getUserRole } from '../../config/roles';
import './FeedbackForm.css';

const FeedbackForm = ({ contentUid, contentType, contentTitle }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setSubmitting(true);
    setError(null);

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
      setSubmitted(true);
      setRating(0);
      setComment('');
      setUserEmail('');
      
      // Reset submitted state after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="feedback-form-container">
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
          <label htmlFor="rating" className="rating-label">
            Rating:
          </label>
          <div className="rating-buttons" role="radiogroup" aria-label="Rate this content">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                className={`rating-button ${rating === value ? 'selected' : ''}`}
                onClick={() => setRating(value)}
                aria-label={`Rate ${value} out of 5`}
                aria-pressed={rating === value}
              >
                {value} ⭐
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="user-email">
            Email (optional):
            <input
              id="user-email"
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
          <label htmlFor="comment">
            Comments (optional):
            <textarea
              id="comment"
              className="form-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts..."
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
          {submitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;

