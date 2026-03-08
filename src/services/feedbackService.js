import Stack, { CONTENT_TYPES } from '../config/contentstack';
import axios from 'axios';

// Realistic seed feedback entries that mirror what would exist in Contentstack
const MOCK_FEEDBACK_ENTRIES = [
  {
    uid: 'blt1a2b3c4d5e6f7a8b',
    content_uid: 'blt_doc_getting_started',
    content_type: 'documentation',
    rating: 5,
    comment: 'Very clear step-by-step instructions. Got my stack set up in under 10 minutes.',
    user_email: 'james.thornton@acmecorp.com',
    user_role: 'developer',
    created_at: '2026-02-18T09:14:22.000Z',
  },
  {
    uid: 'blt2b3c4d5e6f7a8b9c',
    content_uid: 'blt_doc_getting_started',
    content_type: 'documentation',
    rating: 4,
    comment: 'Good overview, but the SDK version numbers in the code samples are slightly out of date.',
    user_email: 'priya.mehta@techstart.io',
    user_role: 'developer',
    created_at: '2026-02-20T14:03:55.000Z',
  },
  {
    uid: 'blt3c4d5e6f7a8b9c0d',
    content_uid: 'blt_doc_content_types',
    content_type: 'documentation',
    rating: 3,
    comment: 'The explanation of modular blocks is confusing. Could use a visual diagram.',
    user_email: 'carlos.rodriguez@brightmedia.com',
    user_role: 'content_manager',
    created_at: '2026-02-22T10:45:00.000Z',
  },
  {
    uid: 'blt4d5e6f7a8b9c0d1e',
    content_uid: 'blt_doc_webhooks',
    content_type: 'documentation',
    rating: 5,
    comment: 'Exactly what I needed. The webhook payload examples saved me hours of debugging.',
    user_email: 'sarah.okonkwo@devops.io',
    user_role: 'developer',
    created_at: '2026-02-25T08:30:11.000Z',
  },
  {
    uid: 'blt5e6f7a8b9c0d1e2f',
    content_uid: 'blt_doc_webhooks',
    content_type: 'documentation',
    rating: 4,
    comment: 'Webhook retry logic section was helpful. Would appreciate more error code details.',
    user_email: 'liam.chen@fintech-labs.com',
    user_role: 'developer',
    created_at: '2026-02-26T16:12:44.000Z',
  },
  {
    uid: 'blt6f7a8b9c0d1e2f3a',
    content_uid: 'blt_faq_delivery_token',
    content_type: 'faq',
    rating: 2,
    comment: "The answer doesn't address the EU region difference for delivery tokens.",
    user_email: 'nadia.voss@eurotech.de',
    user_role: 'developer',
    created_at: '2026-03-01T11:22:07.000Z',
  },
  {
    uid: 'blt7a8b9c0d1e2f3a4b',
    content_uid: 'blt_faq_delivery_token',
    content_type: 'faq',
    rating: 5,
    comment: 'Solved my issue immediately. Thank you!',
    user_email: 'anonymous@example.com',
    user_role: 'viewer',
    created_at: '2026-03-02T09:05:30.000Z',
  },
  {
    uid: 'blt8b9c0d1e2f3a4b5c',
    content_uid: 'blt_doc_rich_text',
    content_type: 'documentation',
    rating: 4,
    comment: 'Rich text editor JSON structure explained well, though embedded asset handling deserves its own page.',
    user_email: 'tom.nakamura@pixelcraft.studio',
    user_role: 'content_manager',
    created_at: '2026-03-03T13:48:19.000Z',
  },
  {
    uid: 'blt9c0d1e2f3a4b5c6d',
    content_uid: 'blt_doc_environments',
    content_type: 'documentation',
    rating: 3,
    comment: 'I wish there were examples showing environment aliases in a CI/CD pipeline context.',
    user_email: 'elena.petrov@cloudnine.io',
    user_role: 'developer',
    created_at: '2026-03-04T07:59:02.000Z',
  },
  {
    uid: 'blt0d1e2f3a4b5c6d7e',
    content_uid: 'blt_doc_environments',
    content_type: 'documentation',
    rating: 5,
    comment: 'Comprehensive and accurate. Bookmarked for the whole team.',
    user_email: 'marcus.osei@groveanalytics.com',
    user_role: 'admin',
    created_at: '2026-03-05T15:34:56.000Z',
  },
  {
    uid: 'bltA1b2c3d4e5f6a7b8',
    content_uid: 'blt_doc_localization',
    content_type: 'documentation',
    rating: 5,
    comment: 'The fallback locale behaviour is well documented. Saved us a lot of edge-case handling.',
    user_email: 'sophie.laurent@globepress.fr',
    user_role: 'developer',
    created_at: '2026-03-05T09:22:00.000Z',
  },
  {
    uid: 'bltB2c3d4e5f6a7b8c9',
    content_uid: 'blt_doc_localization',
    content_type: 'documentation',
    rating: 4,
    comment: 'Would appreciate a table showing which field types support localisation out of the box.',
    user_email: 'yuki.tanaka@shibuya.dev',
    user_role: 'developer',
    created_at: '2026-03-06T07:15:33.000Z',
  },
  {
    uid: 'bltC3d4e5f6a7b8c9d0',
    content_uid: 'blt_doc_graphql',
    content_type: 'documentation',
    rating: 5,
    comment: 'Finally a clear comparison with the REST API. GraphQL pagination examples are spot on.',
    user_email: 'amit.sharma@stackventures.in',
    user_role: 'developer',
    created_at: '2026-03-06T11:40:18.000Z',
  },
  {
    uid: 'bltD4e5f6a7b8c9d0e1',
    content_uid: 'blt_doc_graphql',
    content_type: 'documentation',
    rating: 3,
    comment: 'Introspection example is helpful but the doc is missing mutation examples.',
    user_email: 'rodrigo.alves@codelab.br',
    user_role: 'developer',
    created_at: '2026-03-07T08:05:44.000Z',
  },
  {
    uid: 'bltE5f6a7b8c9d0e1f2',
    content_uid: 'blt_doc_roles_permissions',
    content_type: 'documentation',
    rating: 4,
    comment: 'Custom roles section is exactly what our enterprise setup needed. Clear and concise.',
    user_email: 'heidi.bergmann@enterprisehub.de',
    user_role: 'admin',
    created_at: '2026-03-06T14:50:00.000Z',
  },
  {
    uid: 'bltF6a7b8c9d0e1f2a3',
    content_uid: 'blt_doc_live_preview',
    content_type: 'documentation',
    rating: 5,
    comment: 'Reduced our editorial review cycle from 2 days to a few hours. Game changer.',
    user_email: 'olivia.james@contentfirst.io',
    user_role: 'content_manager',
    created_at: '2026-03-07T10:30:00.000Z',
  },
  {
    uid: 'bltG7b8c9d0e1f2a3b4',
    content_uid: 'blt_doc_assets',
    content_type: 'documentation',
    rating: 4,
    comment: 'The image transform table is very handy. Would like a live demo tool for parameters.',
    user_email: 'chen.wei@pixellab.cn',
    user_role: 'developer',
    created_at: '2026-03-06T16:00:00.000Z',
  },
  {
    uid: 'bltH8c9d0e1f2a3b4c5',
    content_uid: 'blt_faq_graphql',
    content_type: 'faq',
    rating: 5,
    comment: 'Short, direct answer. Exactly what I needed before switching our API strategy.',
    user_email: 'felix.dubois@techconseil.fr',
    user_role: 'developer',
    created_at: '2026-03-07T07:45:00.000Z',
  },
  {
    uid: 'bltI9d0e1f2a3b4c5d6',
    content_uid: 'blt_faq_rate_limits',
    content_type: 'faq',
    rating: 3,
    comment: 'Useful baseline info. Would appreciate specifics on how to request an increase.',
    user_email: 'natasha.ivanova@scaleworks.io',
    user_role: 'developer',
    created_at: '2026-03-07T12:10:00.000Z',
  },
  {
    uid: 'bltJ0e1f2a3b4c5d6e7',
    content_uid: 'blt_faq_management_token',
    content_type: 'faq',
    rating: 5,
    comment: 'Clear distinction. I was accidentally exposing a management token in my frontend — this saved us.',
    user_email: 'anonymous@example.com',
    user_role: 'viewer',
    created_at: '2026-03-07T15:00:00.000Z',
  },
];

const computeAnalytics = (entries) => {
  const analytics = {
    total: entries.length,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    byContentType: {},
  };

  if (entries.length === 0) return analytics;

  let totalRating = 0;
  entries.forEach((item) => {
    const rating = item.rating || 0;
    totalRating += rating;
    analytics.ratingDistribution[rating] = (analytics.ratingDistribution[rating] || 0) + 1;
    const contentType = item.content_type || 'unknown';
    analytics.byContentType[contentType] = (analytics.byContentType[contentType] || 0) + 1;
  });
  analytics.averageRating = parseFloat((totalRating / entries.length).toFixed(2));

  return analytics;
};

/**
 * Submit feedback for content
 */
export const submitFeedback = async (feedbackData) => {
  try {
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

    const response = await axios.post(webhookUrl, payload);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

/**
 * Get all feedback entries (used by the Feedback page)
 */
export const getAllFeedback = async () => {
  try {
    const Query = Stack.ContentType(CONTENT_TYPES.FEEDBACK).Query();
    const result = await Query.includeCount().find();
    const entries =
      Array.isArray(result) && result.length > 0
        ? Array.isArray(result[0])
          ? result[0]
          : result
        : result.items || [];
    return entries;
  } catch (error) {
    console.warn('Contentstack feedback unavailable, using seed data:', error.message);
    return MOCK_FEEDBACK_ENTRIES;
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
    console.warn('Contentstack feedback unavailable, using seed data:', error.message);

    const filtered = MOCK_FEEDBACK_ENTRIES.filter((e) => e.content_uid === contentUid);
    return { items: filtered, count: filtered.length };
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

    const analytics = computeAnalytics(result.items || []);
    analytics.total = result.count ?? analytics.total;
    return analytics;
  } catch (error) {
    console.warn('Contentstack analytics unavailable, using seed data:', error.message);

    let entries = MOCK_FEEDBACK_ENTRIES;

    if (filters.startDate && filters.endDate) {
      const from = new Date(filters.startDate).getTime();
      const to = new Date(filters.endDate).getTime();
      entries = entries.filter((e) => {
        const ts = new Date(e.created_at).getTime();
        return ts >= from && ts <= to;
      });
    }

    return computeAnalytics(entries);
  }
};

