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
    const { getAllFeedback } = await import('../utils/contentstackHelpers');
    const allFeedback = await getAllFeedback();
    
    // Filter by date range if provided
    let filteredFeedback = allFeedback;
    if (filters.startDate && filters.endDate) {
      filteredFeedback = allFeedback.filter(item => {
        const createdAt = new Date(item.created_at);
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        return createdAt >= startDate && createdAt <= endDate;
      });
    }
    
    // Calculate analytics
    const analytics = {
      total: filteredFeedback.length,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      byContentType: {},
    };

    if (filteredFeedback.length > 0) {
      let totalRating = 0;
      filteredFeedback.forEach((item) => {
        const rating = item.rating || 0;
        totalRating += rating;
        analytics.ratingDistribution[rating] = (analytics.ratingDistribution[rating] || 0) + 1;
        
        const contentType = item.content_type || 'unknown';
        analytics.byContentType[contentType] = (analytics.byContentType[contentType] || 0) + 1;
      });
      analytics.averageRating = totalRating / filteredFeedback.length;
    }

    return analytics;
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    throw error;
  }
};

/**
 * Get data consumption analytics
 * Calculates total data consumed from all content types
 */
export const getDataConsumptionAnalytics = async () => {
  try {
    const { getAllDocumentation, getAllFAQs, getAllFeedback } = await import('../utils/contentstackHelpers');
    
    // Fetch all content to calculate data consumption
    const [documentation, faqs, feedback] = await Promise.allSettled([
      getAllDocumentation().catch(() => []),
      getAllFAQs().catch(() => []),
      getAllFeedback().catch(() => []),
    ]);

    const docEntries = documentation.status === 'fulfilled' ? documentation.value : [];
    const faqEntries = faqs.status === 'fulfilled' ? faqs.value : [];
    const feedbackEntries = feedback.status === 'fulfilled' ? feedback.value : [];

    // Calculate data size (approximate JSON size)
    const calculateSize = (entries) => {
      return JSON.stringify(entries).length;
    };

    const docSize = calculateSize(docEntries);
    const faqSize = calculateSize(faqEntries);
    const feedbackSize = calculateSize(feedbackEntries);
    const totalSize = docSize + faqSize + feedbackSize;

    // Format bytes to human readable
    const formatBytes = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    return {
      totalEntries: docEntries.length + faqEntries.length + feedbackEntries.length,
      totalSize: totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      byContentType: {
        documentation: {
          count: docEntries.length,
          size: docSize,
          sizeFormatted: formatBytes(docSize),
        },
        faq: {
          count: faqEntries.length,
          size: faqSize,
          sizeFormatted: formatBytes(faqSize),
        },
        feedback: {
          count: feedbackEntries.length,
          size: feedbackSize,
          sizeFormatted: formatBytes(feedbackSize),
        },
      },
      apiCalls: {
        documentation: Math.ceil(docEntries.length / 100), // Assuming 100 entries per API call
        faq: Math.ceil(faqEntries.length / 100),
        feedback: Math.ceil(feedbackEntries.length / 100),
        total: Math.ceil(docEntries.length / 100) + Math.ceil(faqEntries.length / 100) + Math.ceil(feedbackEntries.length / 100),
      },
    };
  } catch (error) {
    console.error('Error calculating data consumption:', error);
    throw error;
  }
};

