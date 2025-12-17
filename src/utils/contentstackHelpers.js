/**
 * Contentstack Helper Utilities
 * Helper functions for working with Contentstack content
 * Using direct API calls instead of SDK
 */

import { CONTENT_TYPES } from '../config/contentstack';

/**
 * Get Contentstack API configuration
 */
const getContentstackConfig = () => {
  const region = process.env.REACT_APP_CONTENTSTACK_REGION;
  let host = 'eu-api.contentstack.com';
  
  // Set region-specific API hos
  
  const apiKey = process.env.REACT_APP_CONTENTSTACK_API_KEY;
  const deliveryToken = process.env.REACT_APP_CONTENTSTACK_DELIVERY_TOKEN;
  const environment = process.env.REACT_APP_CONTENTSTACK_ENVIRONMENT || 'production';
  
  if (!apiKey || !deliveryToken) {
    console.warn('⚠️ Contentstack credentials missing from .env file');
  }
  
  return {
    host,
    apiKey,
    deliveryToken,
    environment
  };
};

/**
 * Get all documentation entries using direct API calls
 * @returns {Promise} Array of all entries
 */
export const getAllDocumentation = async () => {
  const contentTypeUID = CONTENT_TYPES.DOCUMENTATION;
  
  if (!contentTypeUID) {
    throw new Error('REACT_APP_CONTENTSTACK_DOCUMENTATION_UID is not set in .env file');
  }
  
  const config = getContentstackConfig();
  const allEntries = [];
  let skip = 0;
  const limit = 100; // Contentstack API limit per request
  let hasMore = true;
  let iteration = 0;
  const maxIterations = 100; // Safety limit to prevent infinite loops

  while (hasMore && iteration < maxIterations) {
    iteration++;
    
    // Build API URL with query parameters (Contentstack API uses query params, not headers)
    const url = new URL(`https://${config.host}/v3/content_types/${contentTypeUID}/entries`);
    url.searchParams.append('environment', config.environment);
    url.searchParams.append('skip', skip.toString());
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('api_key', config.apiKey);
    url.searchParams.append('access_token', config.deliveryToken);
    
    console.log(`📡 Fetching from: ${url.toString().replace(/api_key=[^&]+/, 'api_key=***').replace(/access_token=[^&]+/, 'access_token=***')}`);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error_message || `HTTP ${response.status}: ${response.statusText}`);
        error.error_code = errorData.error_code;
        error.error_message = errorData.error_message;
        error.errors = errorData.errors;
        throw error;
      }
      
      const data = await response.json();
      const entries = data.entries || [];
      
      if (entries.length === 0) {
        hasMore = false;
      } else {
        allEntries.push(...entries);
        skip += limit;
        
        // If we got fewer entries than the limit, we've reached the end
        if (entries.length < limit) {
          hasMore = false;
        }
      }
    } catch (error) {
      console.error('Error fetching entries from Contentstack API:', error);
      throw error;
    }
  }

  return allEntries;
};

/**
 * Get a single documentation entry by UID using direct API call
 * @param {string} uid - Entry UID
 * @param {Object} options - Query options
 * @param {string} options.version - Filter by version
 * @returns {Promise} Contentstack entry or null
 */
export const getDocumentationByUid = async (uid, options = {}) => {
  const contentTypeUID = CONTENT_TYPES.DOCUMENTATION;
  
  if (!contentTypeUID) {
    throw new Error('REACT_APP_CONTENTSTACK_DOCUMENTATION_UID is not set in .env file');
  }
  
  const config = getContentstackConfig();
  
  // Build API URL with query parameters
  const url = new URL(`https://${config.host}/v3/content_types/${contentTypeUID}/entries/${uid}`);
  url.searchParams.append('environment', config.environment);
  url.searchParams.append('api_key', config.apiKey);
  url.searchParams.append('access_token', config.deliveryToken);
  
  // Include references
  url.searchParams.append('include[]', 'category');
  url.searchParams.append('include[]', 'related_docs');
  
  // Apply version filter if provided
  if (options.version) {
    url.searchParams.append('version', options.version);
  }
  
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error_message || `HTTP ${response.status}: ${response.statusText}`);
      error.error_code = errorData.error_code;
      error.error_message = errorData.error_message;
      error.errors = errorData.errors;
      throw error;
    }
    
    const data = await response.json();
    return data.entry || null;
  } catch (error) {
    console.error('Error fetching documentation by UID:', error);
    throw error;
  }
};

/**
 * Render Contentstack Rich Text content
 * Contentstack Rich Text Editor returns HTML, not markdown
 * @param {string} content - Content from Contentstack
 * @returns {JSX.Element} Rendered content
 */
export const renderContentstackContent = (content) => {
  if (!content) {
    return <p>No content available.</p>;
  }

  // Check if content is HTML (from Rich Text Editor)
  if (typeof content === 'string' && (content.includes('<') || content.includes('&'))) {
    return (
      <div 
        className="contentstack-rich-text"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Otherwise treat as plain text or markdown
  return <div className="contentstack-text">{content}</div>;
};

/**
 * Format Contentstack date
 * @param {string} dateString - ISO date string from Contentstack
 * @returns {string} Formatted date
 */
export const formatContentstackDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Get entry URL from Contentstack entry
 * @param {Object} entry - Contentstack entry object
 * @returns {string} Entry URL
 */
export const getEntryUrl = (entry) => {
  if (entry.url) {
    return entry.url;
  }
  
  // Fallback: construct URL from UID
  return `/${entry.uid}`;
};

/**
 * Debug: Log Contentstack entry structure
 * @param {Object} entry - Contentstack entry
 * @param {string} label - Label for logging
 */
export const debugEntry = (entry, label = 'Entry') => {
  console.group(`🔍 ${label} Debug`);
  console.log('Full entry:', entry);
  console.log('UID:', entry?.uid);
  console.log('Title:', entry?.title);
  console.log('Content type:', entry?.content_type);
  console.log('Fields:', Object.keys(entry || {}));
  console.groupEnd();
};

