import React, { useState, useEffect, useCallback } from 'react';
import { getAllFeedback } from '../../utils/contentstackHelpers';
import './FeedbackList.css';

const FeedbackList = () => {
  const [feedbackEntries, setFeedbackEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [contentTypeFilter, setContentTypeFilter] = useState('');

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true);
      const options = contentTypeFilter ? { contentType: contentTypeFilter } : {};
      const entries = await getAllFeedback(options);
      setFeedbackEntries(Array.isArray(entries) ? entries : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      console.error('Error details:', {
        message: err.message,
        error_code: err.error_code,
        error_message: err.error_message,
        errors: err.errors
      });
      
      let errorMessage = 'Failed to load feedback';
      if (err.error_code === 118) {
        if (err.message && err.message.includes('To fix this:')) {
          errorMessage = err.message;
        } else {
          errorMessage = `Content Type '${err.content_type || 'feedback'}' was not found.\n\n` +
            `To fix this:\n` +
            `1. Go to Contentstack → Content Types\n` +
            `2. Find your Feedback content type\n` +
            `3. Check the UID in the URL or settings\n` +
            `4. Add to .env file: REACT_APP_CONTENTSTACK_FEEDBACK_UID=your_actual_uid\n` +
            `5. Restart your development server\n\n` +
            `Common UIDs to try: feedbacks, feedback_entry`;
        }
      } else if (err.error_message) {
        errorMessage = err.error_message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [contentTypeFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const getRatingStars = (rating) => {
    return '⭐'.repeat(rating || 0);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error</h2>
        <div style={{ 
          whiteSpace: 'pre-line', 
          backgroundColor: '#fff5f5', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid #fed7d7',
          marginTop: '10px'
        }}>
          {error}
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Check the browser console for more details.
        </p>
      </div>
    );
  }

  // Get unique content types for filter
  const contentTypes = [...new Set(feedbackEntries.map(f => f.content_type).filter(Boolean))];

  return (
    <div style={{ padding: '20px' }}>
      <h2>Feedback Entries</h2>
      
      {contentTypes.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="content-type-filter" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 500 }}>
            Filter by Content Type:
            <select
              id="content-type-filter"
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value)}
              aria-label="Filter feedback by content type"
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                maxWidth: '300px'
              }}
            >
              <option value="">All Content Types</option>
              {contentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {feedbackEntries.length === 0 ? (
        <p>No feedback entries found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {feedbackEntries.map((feedback) => (
            <div 
              key={feedback.uid} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>
                {feedback.title || 'Untitled Feedback'}
              </h3>
              
              {feedback.rating && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#2c3e50' }}>
                    Rating: {feedback.rating}/5
                  </div>
                </div>
              )}
              
              {feedback.single_line && (
                <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#2c3e50' }}>
                  {feedback.single_line}
                </p>
              )}
              
              {feedback.file && feedback.file.url && (
                <div style={{ marginBottom: '10px' }}>
                  <img 
                    src={feedback.file.url} 
                    alt={feedback.file.title || 'Feedback image'}
                    style={{ maxWidth: '300px', height: 'auto', borderRadius: '4px' }}
                  />
                </div>
              )}
              
              {feedback.comment && (
                <div style={{ marginBottom: '10px', color: '#666', lineHeight: '1.5' }}>
                  <strong>Comment:</strong> {feedback.comment}
                </div>
              )}
              
              <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                {feedback.content_uid && (
                  <div>Content UID: {feedback.content_uid}</div>
                )}
                {feedback.content_type && (
                  <div>Content Type: {feedback.content_type}</div>
                )}
                {feedback.user_email && (
                  <div>Email: {feedback.user_email}</div>
                )}
                {feedback.user_role && (
                  <div>Role: {feedback.user_role}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackList;

