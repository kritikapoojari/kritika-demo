/**
 * Contentstack Helper Utilities
 * Helper functions for working with Contentstack content
 */

import Stack from '../config/contentstack';
import { CONTENT_TYPES } from '../config/contentstack';

/**
 * Get all documentation entries
 * According to Contentstack JavaScript SDK documentation
 * @param {Object} options - Query options
 * @param {string} options.category - Filter by category UID
 * @param {string} options.version - Filter by version
 * @param {string} options.searchQuery - Search query string
 * @returns {Promise} Contentstack query result
 */
export const getAllDocumentation = async (options = {}) => {
  try {
    // Create query instance - Contentstack SDK v3 syntax
    // Use configurable content type UID
    const Query = Stack.ContentType(CONTENT_TYPES.DOCUMENTATION).Query();
    
    // Include references
    Query.includeReference(['category', 'related_docs']);
    
    // Include count
    Query.includeCount();
    
    // Apply filters - Contentstack query syntax
    if (options.category) {
      // For reference fields, query by the reference field UID
      Query.where('category', options.category);
    }

    if (options.version) {
      Query.where('version', options.version);
    }

    if (options.searchQuery) {
      // Contentstack search - use regex for case-insensitive search
      // Search in title field
      Query.where('title', Stack.Query().regex(options.searchQuery, 'i'));
    }

    // Execute query - Contentstack returns result[0] as array or {items: [], count: number}
    const result = await Query.find();
    
    // Handle both response formats
    // Format 1: result[0] = array of entries (older SDK)
    // Format 2: result.items = array, result.count = number (newer SDK)
    if (Array.isArray(result) && result.length > 0) {
      return {
        items: result[0] || [],
        count: result[0]?.length || 0
      };
    } else if (result && result.items) {
      return result;
    } else {
      return {
        items: [],
        count: 0
      };
    }
  } catch (error) {
    console.error('Error fetching documentation:', error);
    throw error;
  }
};

/**
 * Get a single documentation entry by UID
 * According to Contentstack JavaScript SDK documentation
 * @param {string} uid - Entry UID
 * @param {Object} options - Query options
 * @param {string} options.version - Filter by version
 * @returns {Promise} Contentstack entry
 */
export const getDocumentationByUid = async (uid, options = {}) => {
  try {
    // Create query instance - Contentstack SDK v3 syntax
    // Use configurable content type UID
    const Query = Stack.ContentType(CONTENT_TYPES.DOCUMENTATION).Query();
    
    // Filter by UID
    Query.where('uid', uid);
    
    // Include references
    Query.includeReference(['category', 'related_docs']);

    // Apply version filter if provided
    if (options.version) {
      Query.where('version', options.version);
    }

    // Execute query
    const result = await Query.find();
    
    // Handle both response formats
    // Format 1: result[0] = array of entries (older SDK)
    // Format 2: result.items = array, result.count = number (newer SDK)
    let entries = [];
    if (Array.isArray(result) && result.length > 0) {
      entries = result[0] || [];
    } else if (result && result.items) {
      entries = result.items;
    } else if (Array.isArray(result)) {
      entries = result;
    }
    
    if (entries.length > 0) {
      return entries[0];
    }
    
    return null;
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

