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
 * Get all FAQ entries using direct API calls
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category UID
 * @returns {Promise} Array of all FAQ entries
 */
export const getAllFAQs = async (options = {}) => {
  const contentTypeUID = CONTENT_TYPES.FAQ || 'faqs';
  
  if (!contentTypeUID) {
    throw new Error('FAQ content type UID is not configured');
  }
  
  const config = getContentstackConfig();
  const allEntries = [];
  let skip = 0;
  const limit = 100;
  let hasMore = true;
  let iteration = 0;
  const maxIterations = 100;
  let includeCategory = CONTENT_TYPES.CATEGORY ? true : false; // Track if we should include categories

  while (hasMore && iteration < maxIterations) {
    iteration++;
    
    const url = new URL(`https://${config.host}/v3/content_types/${contentTypeUID}/entries`);
    url.searchParams.append('environment', config.environment);
    url.searchParams.append('skip', skip.toString());
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('api_key', config.apiKey);
    url.searchParams.append('access_token', config.deliveryToken);
    
    // Only include category references if category content type is configured and we haven't had errors
    if (includeCategory) {
      url.searchParams.append('include[]', 'category');
    }
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If error is about invalid category reference, try again without including category
        if (errorData.error_code === 141 && errorData.errors?.category && includeCategory) {
          console.info('ℹ️ Category reference is invalid. Fetching FAQs without category references.');
          // Disable category includes for future requests
          includeCategory = false;
          // Remove category include and retry
          url.searchParams.delete('include[]');
          const retryResponse = await fetch(url.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!retryResponse.ok) {
            const retryErrorData = await retryResponse.json().catch(() => ({}));
            const error = new Error(retryErrorData.error_message || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`);
            error.error_code = retryErrorData.error_code;
            error.error_message = retryErrorData.error_message;
            error.errors = retryErrorData.errors;
            error.content_type = contentTypeUID;
            throw error;
          }
          
          // Use the retry response
          const retryData = await retryResponse.json();
          const entries = retryData.entries || [];
          
          if (entries.length === 0) {
            hasMore = false;
          } else {
            allEntries.push(...entries);
            skip += limit;
            
            if (entries.length < limit) {
              hasMore = false;
            }
          }
          continue; // Continue to next iteration
        }
        
        const error = new Error(errorData.error_message || `HTTP ${response.status}: ${response.statusText}`);
        error.error_code = errorData.error_code;
        error.error_message = errorData.error_message;
        error.errors = errorData.errors;
        error.content_type = contentTypeUID;
        throw error;
      }
      
      const data = await response.json();
      const entries = data.entries || [];
      
      if (entries.length === 0) {
        hasMore = false;
      } else {
        allEntries.push(...entries);
        skip += limit;
        
        if (entries.length < limit) {
          hasMore = false;
        }
      }
    } catch (error) {
      console.error('Error fetching FAQs from Contentstack API:', error);
      
      // If content type not found, provide helpful error message
      if (error.error_code === 118) {
        const helpfulError = new Error(
          `Content Type '${contentTypeUID}' was not found.\n\n` +
          `To fix this:\n` +
          `1. Go to Contentstack → Content Types\n` +
          `2. Find your FAQ content type\n` +
          `3. Check the UID in the URL or settings\n` +
          `4. Add to .env file: REACT_APP_CONTENTSTACK_FAQ_UID=your_actual_uid\n` +
          `5. Or try common UIDs: faqs, faq_entry, question, questions\n\n` +
          `Current UID being used: '${contentTypeUID}'`
        );
        helpfulError.error_code = error.error_code;
        helpfulError.error_message = error.error_message;
        helpfulError.errors = error.errors;
        helpfulError.content_type = contentTypeUID;
        throw helpfulError;
      }
      
      throw error;
    }
  }

  // Filter by category if provided and category content type exists
  if (options.category && allEntries.length > 0 && CONTENT_TYPES.CATEGORY) {
    return allEntries.filter(entry => {
      // Handle both direct UID reference and full reference object
      if (entry.category) {
        const categoryUid = typeof entry.category === 'string' 
          ? entry.category 
          : entry.category.uid || entry.category._content_type_uid;
        return categoryUid === options.category;
      }
      return false;
    });
  }

  return allEntries;
};

/**
 * Get all category entries using direct API calls
 * Returns empty array if category content type doesn't exist (categories are optional)
 * @returns {Promise} Array of all category entries, or empty array if not found
 */
export const getAllCategories = async () => {
  const contentTypeUID = CONTENT_TYPES.CATEGORY || 'category';
  
  // If no category UID is configured, return empty array (categories are optional)
  if (!CONTENT_TYPES.CATEGORY) {
    console.info('ℹ️ Category content type UID not configured. Categories are optional.');
    return [];
  }
  
  const config = getContentstackConfig();
  const allEntries = [];
  let skip = 0;
  const limit = 100;
  let hasMore = true;
  let iteration = 0;
  const maxIterations = 100;

  while (hasMore && iteration < maxIterations) {
    iteration++;
    
    const url = new URL(`https://${config.host}/v3/content_types/${contentTypeUID}/entries`);
    url.searchParams.append('environment', config.environment);
    url.searchParams.append('skip', skip.toString());
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('api_key', config.apiKey);
    url.searchParams.append('access_token', config.deliveryToken);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If content type not found, provide helpful error message
        if (errorData.error_code === 118) {
          const helpfulError = new Error(
            `Content Type '${contentTypeUID}' was not found.\n\n` +
            `To fix this:\n` +
            `1. Go to Contentstack → Content Types\n` +
            `2. Find your Category content type\n` +
            `3. Check the UID in the URL or settings\n` +
            `4. Add to .env file: REACT_APP_CONTENTSTACK_CATEGORY_UID=your_actual_uid\n` +
            `5. Or try common UIDs: categories, category_entry, tag, tags\n\n` +
            `Current UID being used: '${contentTypeUID}'`
          );
          helpfulError.error_code = errorData.error_code;
          helpfulError.error_message = errorData.error_message;
          helpfulError.errors = errorData.errors;
          helpfulError.content_type = contentTypeUID;
          throw helpfulError;
        }
        
        const error = new Error(errorData.error_message || `HTTP ${response.status}: ${response.statusText}`);
        error.error_code = errorData.error_code;
        error.error_message = errorData.error_message;
        error.errors = errorData.errors;
        error.content_type = contentTypeUID;
        throw error;
      }
      
      const data = await response.json();
      const entries = data.entries || [];
      
      if (entries.length === 0) {
        hasMore = false;
      } else {
        allEntries.push(...entries);
        skip += limit;
        
        if (entries.length < limit) {
          hasMore = false;
        }
      }
    } catch (error) {
      // If content type not found (error 118), return empty array (categories are optional)
      if (error.error_code === 118) {
        console.info('ℹ️ Category content type not found. Categories are optional - continuing without category filtering.');
        return [];
      }
      
      console.error('Error fetching categories from Contentstack API:', error);
      // For other errors, still return empty array to prevent breaking the app
      return [];
    }
  }

  return allEntries;
};

/**
 * Get all feedback entries using direct API calls
 * @param {Object} options - Query options
 * @param {string} options.contentUid - Filter by content UID
 * @param {string} options.contentType - Filter by content type
 * @returns {Promise} Array of all feedback entries
 */
export const getAllFeedback = async (options = {}) => {
  const contentTypeUID = CONTENT_TYPES.FEEDBACK || 'feedback';
  
  if (!contentTypeUID) {
    throw new Error('Feedback content type UID is not configured');
  }
  
  const config = getContentstackConfig();
  const allEntries = [];
  let skip = 0;
  const limit = 100;
  let hasMore = true;
  let iteration = 0;
  const maxIterations = 100;

  while (hasMore && iteration < maxIterations) {
    iteration++;
    
    const url = new URL(`https://${config.host}/v3/content_types/${contentTypeUID}/entries`);
    url.searchParams.append('environment', config.environment);
    url.searchParams.append('skip', skip.toString());
    url.searchParams.append('limit', limit.toString());
    url.searchParams.append('api_key', config.apiKey);
    url.searchParams.append('access_token', config.deliveryToken);
    
    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If content type not found, provide helpful error message
        if (errorData.error_code === 118) {
          const helpfulError = new Error(
            `Content Type '${contentTypeUID}' was not found.\n\n` +
            `To fix this:\n` +
            `1. Go to Contentstack → Content Types\n` +
            `2. Find your Feedback content type\n` +
            `3. Check the UID in the URL or settings\n` +
            `4. Add to .env file: REACT_APP_CONTENTSTACK_FEEDBACK_UID=your_actual_uid\n\n` +
            `Current UID being used: '${contentTypeUID}'`
          );
          helpfulError.error_code = errorData.error_code;
          helpfulError.error_message = errorData.error_message;
          helpfulError.errors = errorData.errors;
          helpfulError.content_type = contentTypeUID;
          throw helpfulError;
        }
        
        const error = new Error(errorData.error_message || `HTTP ${response.status}: ${response.statusText}`);
        error.error_code = errorData.error_code;
        error.error_message = errorData.error_message;
        error.errors = errorData.errors;
        error.content_type = contentTypeUID;
        throw error;
      }
      
      const data = await response.json();
      const entries = data.entries || [];
      
      if (entries.length === 0) {
        hasMore = false;
      } else {
        allEntries.push(...entries);
        skip += limit;
        
        if (entries.length < limit) {
          hasMore = false;
        }
      }
    } catch (error) {
      console.error('Error fetching feedback from Contentstack API:', error);
      throw error;
    }
  }

  // Filter by contentUid or contentType if provided
  if (options.contentUid && allEntries.length > 0) {
    return allEntries.filter(entry => entry.content_uid === options.contentUid);
  }
  
  if (options.contentType && allEntries.length > 0) {
    return allEntries.filter(entry => entry.content_type === options.contentType);
  }

  return allEntries;
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

