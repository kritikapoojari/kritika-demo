import Fuse from 'fuse.js';
import Stack, { CONTENT_TYPES } from '../config/contentstack';

// Search configuration for Fuse.js
const searchOptions = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'content', weight: 0.5 },
    { name: 'description', weight: 0.6 },
    { name: 'tags', weight: 0.4 },
    { name: 'category.title', weight: 0.3 },
  ],
  threshold: 0.3, // Lower threshold = more strict matching
  includeScore: true,
  minMatchCharLength: 2,
};

/**
 * Search documentation entries
 */
export const searchDocumentation = async (query, filters = {}) => {
  try {
    const Query = Stack.ContentType(CONTENT_TYPES.DOCUMENTATION).Query();
    Query.includeCount();

    if (query) {
      Query.where('title', Stack.Query().regex(query, 'i'));
    }

    // Apply filters
    if (filters.category) {
      Query.where('category', filters.category);
    }
    if (filters.version) {
      Query.where('version', filters.version);
    }

    const result = await Query.toJSON().find();
    const entries = Array.isArray(result) && result.length > 0 ? result[0] : [];
    
    // Use Fuse.js for client-side relevancy scoring
    if (query && entries.length > 0) {
      const fuse = new Fuse(entries, searchOptions);
      const searchResults = fuse.search(query);
      return {
        items: searchResults.map(item => item.item),
        count: searchResults.length,
      };
    }

    return { items: entries, count: entries.length };
  } catch (error) {
    console.error('Error searching documentation:', error);
    throw error;
  }
};

/**
 * Search FAQ entries
 */
export const searchFAQs = async (query, filters = {}) => {
  try {
    const Query = Stack.ContentType('faq').Query();
    Query.includeCount();

    if (query) {
      Query.where('question', Stack.Query().regex(query, 'i'));
    }

    if (filters.category) {
      Query.where('category', filters.category);
    }
    if (filters.tags) {
      Query.where('tags', Stack.Query().in(filters.tags));
    }

    const result = await Query.toJSON().find();
    const entries = Array.isArray(result) && result.length > 0 ? result[0] : [];
    
    if (query && entries.length > 0) {
      const fuse = new Fuse(entries, {
        ...searchOptions,
        keys: [
          { name: 'question', weight: 0.8 },
          { name: 'answer', weight: 0.6 },
          { name: 'tags', weight: 0.4 },
        ],
      });
      const searchResults = fuse.search(query);
      return {
        items: searchResults.map(item => item.item),
        count: searchResults.length,
      };
    }

    return { items: entries, count: entries.length };
  } catch (error) {
    console.error('Error searching FAQs:', error);
    throw error;
  }
};

/**
 * Universal search across all content types
 */
export const universalSearch = async (query, contentTypes = ['documentation', 'faq']) => {
  try {
    const results = await Promise.all(
      contentTypes.map(async (type) => {
        if (type === 'documentation') {
          return searchDocumentation(query);
        } else if (type === 'faq') {
          return searchFAQs(query);
        }
        return { items: [], count: 0 };
      })
    );

    // Combine and sort by relevancy
    const allResults = results.flatMap((result, index) =>
      result.items.map(item => ({
        ...item,
        contentType: contentTypes[index],
      }))
    );

    return allResults;
  } catch (error) {
    console.error('Error in universal search:', error);
    throw error;
  }
};

