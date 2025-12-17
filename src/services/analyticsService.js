import axios from 'axios';

/**
 * Track content view analytics
 */
export const trackContentView = async (contentUid, contentType, metadata = {}) => {
  try {
    const webhookUrl = process.env.REACT_APP_ANALYTICS_WEBHOOK_URL || '/api/webhooks/analytics';
    
    const payload = {
      event_type: 'content_view',
      content_uid: contentUid,
      content_type: contentType,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      referrer: document.referrer,
      ...metadata,
    };

    // Send to analytics webhook (non-blocking)
    axios.post(webhookUrl, payload).catch(err => {
      console.error('Analytics tracking error:', err);
    });
  } catch (error) {
    console.error('Error tracking content view:', error);
  }
};

/**
 * Track search analytics
 */
export const trackSearch = async (query, resultsCount, filters = {}) => {
  try {
    const webhookUrl = process.env.REACT_APP_ANALYTICS_WEBHOOK_URL || '/api/webhooks/analytics';
    
    const payload = {
      event_type: 'search',
      query: query,
      results_count: resultsCount,
      filters: filters,
      timestamp: new Date().toISOString(),
    };

    axios.post(webhookUrl, payload).catch(err => {
      console.error('Analytics tracking error:', err);
    });
  } catch (error) {
    console.error('Error tracking search:', error);
  }
};

/**
 * Track feedback submission
 */
export const trackFeedback = async (contentUid, rating, contentType) => {
  try {
    const webhookUrl = process.env.REACT_APP_ANALYTICS_WEBHOOK_URL || '/api/webhooks/analytics';
    
    const payload = {
      event_type: 'feedback_submitted',
      content_uid: contentUid,
      rating: rating,
      content_type: contentType,
      timestamp: new Date().toISOString(),
    };

    axios.post(webhookUrl, payload).catch(err => {
      console.error('Analytics tracking error:', err);
    });
  } catch (error) {
    console.error('Error tracking feedback:', error);
  }
};

