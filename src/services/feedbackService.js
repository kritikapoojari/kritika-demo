import Stack, { CONTENT_TYPES } from '../config/contentstack';
import axios from 'axios';

/**
 * Submit feedback for content
 */
export const submitFeedback = async (feedbackData) => {
  try {
    // In a real implementation, you would use Contentstack Management API
    // For now, we'll simulate with a webhook endpoint
    const webhookUrl = process.env.REACT_APP_WEBHOOK_URL || '/api/webhooks/feedback';
    
    const payload = {
      content_uid: feedbackData.contentUid,
      content_type: feedbackData.contentType,
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      user_email: feedbackData.userEmail,
      user_role: feedbackData.userRole,
      timestamp: new Date().toISOString(),
    };

    // Send to webhook endpoint (which will create entry in Contentstack)
    const response = await axios.post(webhookUrl, payload);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

/**
 * Get feedback for specific content
 */
export const getFeedback = async (contentUid) => {
  try {
    const Query = Stack.ContentType(CONTENT_TYPES.FEEDBACK).Query();
    const result = await Query
      .where('content_uid', contentUid)
      .includeCount()
      .find();
    
    return result;
  } catch (error) {
    console.error('Error fetching feedback:', error);
    throw error;
  }
};

/**
 * Get feedback analytics
 */
export const getFeedbackAnalytics = async (filters = {}) => {
  try {
    const Query = Stack.ContentType(CONTENT_TYPES.FEEDBACK).Query();
    let query = Query.includeCount();

    if (filters.startDate && filters.endDate) {
      query = query.where('created_at', {
        $gte: filters.startDate,
        $lte: filters.endDate,
      });
    }

    const result = await query.find();
    
    // Calculate analytics
    const analytics = {
      total: result.count,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      byContentType: {},
    };

    if (result.items.length > 0) {
      let totalRating = 0;
      result.items.forEach((item) => {
        const rating = item.rating || 0;
        totalRating += rating;
        analytics.ratingDistribution[rating] = (analytics.ratingDistribution[rating] || 0) + 1;
        
        const contentType = item.content_type || 'unknown';
        analytics.byContentType[contentType] = (analytics.byContentType[contentType] || 0) + 1;
      });
      analytics.averageRating = totalRating / result.items.length;
    }

    return analytics;
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    throw error;
  }
};

