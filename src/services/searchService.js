import Fuse from 'fuse.js';
import Stack, { CONTENT_TYPES } from '../config/contentstack';
import { MOCK_DOCUMENTATION_ENTRIES } from '../utils/contentstackHelpers';

const MOCK_FAQS = [
  {
    uid: 'blt_faq_delivery_token',
    question: 'What is a Delivery Token and where do I find it?',
    answer: 'A Delivery Token is a read-only credential that authorises your app to fetch published content from a specific environment.',
    category: { uid: 'blt_cat_auth', title: 'Authentication & Tokens' },
    tags: ['delivery token', 'authentication', 'eu region', 'credentials'],
  },
  {
    uid: 'blt_faq_content_type_118',
    question: 'I am getting error code 118 — Content Type not found. What does this mean?',
    answer: 'Error 118 means the content type UID you are querying does not exist in your stack or the entry has not been published to the targeted environment.',
    category: { uid: 'blt_cat_errors', title: 'Errors & Troubleshooting' },
    tags: ['error 118', 'content type', 'not found', 'debugging'],
  },
  {
    uid: 'blt_faq_publish_entry',
    question: 'Why is my entry not showing up in the app even though I saved it?',
    answer: 'Saving creates a draft. You must publish the entry to an environment for it to appear via the Delivery API.',
    category: { uid: 'blt_cat_content', title: 'Content Management' },
    tags: ['publish', 'draft', 'entry', 'environment'],
  },
  {
    uid: 'blt_faq_webhook_retry',
    question: 'My webhook endpoint missed some events. Will Contentstack retry them?',
    answer: 'Yes. Contentstack retries with exponential backoff up to 5 times before marking a delivery as failed.',
    category: { uid: 'blt_cat_integrations', title: 'Integrations & Webhooks' },
    tags: ['webhook', 'retry', 'failed delivery', 'logs'],
  },
  {
    uid: 'blt_faq_modular_blocks',
    question: 'How do I render Modular Blocks in React?',
    answer: 'Modular Blocks are returned as an array of objects. Each object has a single key matching the block type with the block fields as its value.',
    category: { uid: 'blt_cat_development', title: 'Development' },
    tags: ['modular blocks', 'react', 'rendering', 'components'],
  },
  {
    uid: 'blt_faq_image_optimisation',
    question: "Can I resize or optimise images served from Contentstack's CDN?",
    answer: 'Yes — append Image Delivery API parameters to asset URLs, e.g. ?width=800&format=webp&quality=80.',
    category: { uid: 'blt_cat_assets', title: 'Assets & Media' },
    tags: ['images', 'cdn', 'optimisation', 'webp', 'resize'],
  },
];

// Search configuration for Fuse.js
const docSearchOptions = {
  keys: [
    { name: 'title', weight: 0.7 },
    { name: 'content', weight: 0.5 },
    { name: 'multi_line', weight: 0.6 },
    { name: 'single_line', weight: 0.5 },
    { name: 'tags', weight: 0.4 },
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
};

const faqSearchOptions = {
  keys: [
    { name: 'question', weight: 0.8 },
    { name: 'answer', weight: 0.6 },
    { name: 'tags', weight: 0.4 },
  ],
  threshold: 0.3,
  includeScore: true,
  minMatchCharLength: 2,
};

/**
 * Search documentation entries
 */
export const searchDocumentation = async (query, filters = {}) => {
  try {
    const Query = Stack.ContentType(CONTENT_TYPES.DOCUMENTATION).Query();
    Query.includeReference(['category']);

    if (filters.category) {
      Query.where('category.uid', filters.category);
    }
    if (filters.version) {
      Query.where('version', filters.version);
    }

    const result = await Query.toJSON().find();

    const entries =
      Array.isArray(result) && result.length > 0
        ? Array.isArray(result[0])
          ? result[0]
          : result
        : [];

    if (query && entries.length > 0) {
      const fuse = new Fuse(entries, docSearchOptions);
      const hits = fuse.search(query);
      return { items: hits.map((h) => h.item), count: hits.length };
    }

    return { items: entries, count: entries.length };
  } catch (error) {
    console.warn('Contentstack documentation search failed, using mock data:', error.message);

    let entries = MOCK_DOCUMENTATION_ENTRIES || [];
    if (filters.category) {
      entries = entries.filter((e) => e.category?.uid === filters.category);
    }

    if (query) {
      const fuse = new Fuse(entries, docSearchOptions);
      const hits = fuse.search(query);
      return { items: hits.map((h) => h.item), count: hits.length };
    }

    return { items: entries, count: entries.length };
  }
};

/**
 * Search FAQ entries
 */
export const searchFAQs = async (query, filters = {}) => {
  try {
    const Query = Stack.ContentType(CONTENT_TYPES.FAQ).Query();
    Query.includeReference(['category']);

    if (filters.category) {
      Query.where('category.uid', filters.category);
    }

    const result = await Query.toJSON().find();

    const entries =
      Array.isArray(result) && result.length > 0
        ? Array.isArray(result[0])
          ? result[0]
          : result
        : [];

    if (query && entries.length > 0) {
      const fuse = new Fuse(entries, faqSearchOptions);
      const hits = fuse.search(query);
      return { items: hits.map((h) => h.item), count: hits.length };
    }

    return { items: entries, count: entries.length };
  } catch (error) {
    console.warn('Contentstack FAQ search failed, using mock data:', error.message);

    let entries = MOCK_FAQS;
    if (filters.category) {
      entries = entries.filter((f) => f.category?.uid === filters.category);
    }

    if (query) {
      const fuse = new Fuse(entries, faqSearchOptions);
      const hits = fuse.search(query);
      return { items: hits.map((h) => h.item), count: hits.length };
    }

    return { items: entries, count: entries.length };
  }
};

/**
 * Universal search across all content types
 */
export const universalSearch = async (query, contentTypes = ['documentation', 'faq']) => {
  try {
    const results = await Promise.all(
      contentTypes.map(async (type) => {
        if (type === 'documentation') return searchDocumentation(query);
        if (type === 'faq') return searchFAQs(query);
        return { items: [], count: 0 };
      })
    );

    const allResults = results.flatMap((result, index) =>
      result.items.map((item) => ({ ...item, contentType: contentTypes[index] }))
    );

    return allResults;
  } catch (error) {
    console.error('Error in universal search:', error);
    throw error;
  }
};

