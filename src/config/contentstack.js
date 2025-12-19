import Contentstack from 'contentstack';

// Initialize Contentstack Stack
// Using API endpoint instead of CDN
const region = process.env.REACT_APP_CONTENTSTACK_REGION || 'EU';
let host = 'api.contentstack.io';

// Set region-specific API host
if (region === 'EU' || region === 'eu') {
  host = 'api-eu.contentstack.io';
} else if (region === 'AZURE_NA' || region === 'azure_na') {
  host = 'api-azure-na.contentstack.io';
} else if (region === 'AZURE_EU' || region === 'azure_eu') {
  host = 'api-azure-eu.contentstack.io';
}

const Stack = Contentstack.Stack({
  api_key: process.env.REACT_APP_CONTENTSTACK_API_KEY || 'blt9c0c0b9ef13d821a',
  delivery_token: process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN || 'cs55aa661d8359fc22fba337c3',
  environment: process.env.REACT_APP_CONTENTSTACK_ENVIRONMENT || 'production',
  region: Contentstack.Region[region] || Contentstack.Region.EU,
  host: host
});

console.log('🔌 Using Contentstack API endpoint:', host);

export default Stack;

// Content Type UIDs - Only from .env file
export const CONTENT_TYPES = {
  DOCUMENTATION: process.env.REACT_APP_CONTENTSTACK_DOCUMENTATION_UID,
  FAQ: process.env.REACT_APP_CONTENTSTACK_FAQ_UID || 'faqs',
  CATEGORY: process.env.REACT_APP_CONTENTSTACK_CATEGORY_UID,
  FEEDBACK: process.env.REACT_APP_CONTENTSTACK_FEEDBACK_UID || 'feedback',
};

// Log content type UIDs for debugging
console.log('📋 Content Type UIDs:', CONTENT_TYPES);

