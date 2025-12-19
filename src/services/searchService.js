import Fuse from 'fuse.js';
import { getAllDocumentation, getAllFAQs } from '../utils/contentstackHelpers';
import { CONTENT_TYPES } from '../config/contentstack';

// Search configuration for Fuse.js
const searchOptions = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'single_line', weight: 0.6 },
    { name: 'multi_line', weight: 0.5 },
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
    // Get all documentation entries
    const allEntries = await getAllDocumentation();
    
    // Apply filters first
    let filteredEntries = allEntries;
    if (filters.category && allEntries.length > 0) {
      filteredEntries = allEntries.filter(entry => {
        if (entry.category) {
          const categoryUid = typeof entry.category === 'string' 
            ? entry.category 
            : entry.category.uid;
          return categoryUid === filters.category;
        }
        return false;
      });
    }
    if (filters.version && filteredEntries.length > 0) {
      filteredEntries = filteredEntries.filter(entry => entry.version === filters.version);
    }
    
    // Use Fuse.js for client-side search
    if (query && filteredEntries.length > 0) {
      const fuse = new Fuse(filteredEntries, searchOptions);
      const searchResults = fuse.search(query);
      return {
        items: searchResults.map(item => item.item),
        count: searchResults.length,
      };
    }

    return { items: filteredEntries, count: filteredEntries.length };
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
    // Get all FAQ entries
    const options = filters.category ? { category: filters.category } : {};
    const allEntries = await getAllFAQs(options);
    
    // Apply additional filters
    let filteredEntries = allEntries;
    if (filters.tags && filteredEntries.length > 0) {
      filteredEntries = filteredEntries.filter(entry => 
        entry.tags && entry.tags.some(tag => filters.tags.includes(tag))
      );
    }
    
    // Use Fuse.js for client-side search
    if (query && filteredEntries.length > 0) {
      const fuse = new Fuse(filteredEntries, {
        ...searchOptions,
        keys: [
          { name: 'title', weight: 0.8 },
          { name: 'question', weight: 0.8 },
          { name: 'single_line', weight: 0.6 },
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

    return { items: filteredEntries, count: filteredEntries.length };
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
        try {
          if (type === 'documentation' || type === CONTENT_TYPES.DOCUMENTATION) {
            const result = await searchDocumentation(query);
            return { ...result, contentType: 'documentation' };
          } else if (type === 'faq' || type === CONTENT_TYPES.FAQ) {
            const result = await searchFAQs(query);
            return { ...result, contentType: 'faq' };
          }
          return { items: [], count: 0, contentType: type };
        } catch (err) {
          // If one content type fails, continue with others
          console.warn(`Search failed for ${type}:`, err);
          return { items: [], count: 0, contentType: type };
        }
      })
    );

    // Combine results with content type information
    const allResults = results.flatMap((result) =>
      result.items.map(item => ({
        ...item,
        contentType: result.contentType,
      }))
    );

    // Sort by relevancy if we have search scores (from Fuse.js)
    if (query && allResults.length > 0) {
      // Fuse.js adds a _score property, but we'll sort by a simple relevance
      // You could enhance this by preserving Fuse.js scores
      return allResults;
    }

    return allResults;
  } catch (error) {
    console.error('Error in universal search:', error);
    throw error;
  }
};

