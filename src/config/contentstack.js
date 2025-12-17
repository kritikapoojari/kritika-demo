import Contentstack from 'contentstack';

// Initialize Contentstack Stack
// Replace these with your actual Contentstack credentials
const Stack = Contentstack.Stack({
  api_key: process.env.REACT_APP_CONTENTSTACK_API_KEY || 'blt9c0c0b9ef13d821a',
  delivery_token: process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN || 'cs55aa661d8359fc22fba337c3',
  environment: process.env.REACT_APP_CONTENTSTACK_ENVIRONMENT || 'production',
  region: Contentstack.Region.EU
});

export default Stack;

// Content Type UIDs - Configure these to match your Contentstack content types
// You can override these via environment variables or update them here
// To find your content type UID: Go to Contentstack → Content Types → Click on your content type → Check the URL or UID field
export const CONTENT_TYPES = {
  DOCUMENTATION: process.env.REACT_APP_CONTENTSTACK_DOCUMENTATION_UID || 'documentation',
  FAQ: process.env.REACT_APP_CONTENTSTACK_FAQ_UID || 'faq',
  CATEGORY: process.env.REACT_APP_CONTENTSTACK_CATEGORY_UID || 'category',
  FEEDBACK: process.env.REACT_APP_CONTENTSTACK_FEEDBACK_UID || 'feedback',
  USER_ROLE: process.env.REACT_APP_CONTENTSTACK_USER_ROLE_UID || 'user_role',
};

// Log content type UIDs for debugging
console.log('📋 Content Type UIDs:', CONTENT_TYPES);

// Query helper functions
export const Query = {
  documentation: () => Stack.ContentType(CONTENT_TYPES.DOCUMENTATION).Query(),
  faq: () => Stack.ContentType(CONTENT_TYPES.FAQ).Query(),
  category: () => Stack.ContentType(CONTENT_TYPES.CATEGORY).Query(),
  feedback: () => Stack.ContentType(CONTENT_TYPES.FEEDBACK).Query(),
};

