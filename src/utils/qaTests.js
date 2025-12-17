/**
 * QA Testing Utilities
 * 
 * These utilities help test:
 * - Permission testing
 * - Search relevancy
 * - Broken reference validation
 * - Accessibility (WCAG)
 * - Content migration testing
 */

import Stack, { Query, CONTENT_TYPES } from '../config/contentstack';
import { hasPermission, ROLES } from '../config/roles';

/**
 * Test role-based permissions
 */
export const testPermissions = async (contentType, action) => {
  const results = {
    passed: [],
    failed: [],
  };

  Object.values(ROLES).forEach((role) => {
    const hasAccess = hasPermission(role, contentType, action);
    const testResult = {
      role,
      contentType,
      action,
      hasAccess,
    };

    if (hasAccess) {
      results.passed.push(testResult);
    } else {
      results.failed.push(testResult);
    }
  });

  return results;
};

/**
 * Test search relevancy
 * Returns search results with relevancy scores
 */
export const testSearchRelevancy = async (query, expectedResults = []) => {
  try {
    const Query = Stack.ContentType(CONTENT_TYPES.DOCUMENTATION).Query();
    const result = await Query
      .query({ $regex: query, $options: 'i' })
      .includeCount()
      .find();

    const relevancyResults = {
      query,
      totalResults: result.count,
      results: result.items.map((item, index) => ({
        uid: item.uid,
        title: item.title,
        score: calculateRelevancyScore(item, query),
        rank: index + 1,
      })),
      expectedResults,
      matchesExpected: expectedResults.every((expected) =>
        result.items.some((item) => item.uid === expected)
      ),
    };

    return relevancyResults;
  } catch (error) {
    console.error('Search relevancy test error:', error);
    throw error;
  }
};

/**
 * Calculate relevancy score for a content item
 */
const calculateRelevancyScore = (item, query) => {
  const queryLower = query.toLowerCase();
  let score = 0;

  // Title match (highest weight)
  if (item.title && item.title.toLowerCase().includes(queryLower)) {
    score += 50;
  }

  // Description match
  if (item.description && item.description.toLowerCase().includes(queryLower)) {
    score += 30;
  }

  // Content match
  if (item.content && item.content.toLowerCase().includes(queryLower)) {
    score += 20;
  }

  // Tag match
  if (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(queryLower))) {
    score += 10;
  }

  return score;
};

/**
 * Validate broken references
 * Checks if referenced content exists
 */
export const validateReferences = async (contentType, entryUid) => {
  try {
    const Query = Stack.ContentType(contentType).Query();
    const result = await Query.where('uid', entryUid).includeReference(['*']).find();

    if (!result.items || result.items.length === 0) {
      return {
        valid: false,
        error: 'Entry not found',
      };
    }

    const entry = result.items[0];
    const brokenRefs = [];

    // Check category reference
    if (entry.category && !entry.category.uid) {
      brokenRefs.push({
        field: 'category',
        type: 'broken_reference',
      });
    }

    // Check related_docs references
    if (entry.related_docs && Array.isArray(entry.related_docs)) {
      entry.related_docs.forEach((doc, index) => {
        if (!doc.uid) {
          brokenRefs.push({
            field: `related_docs[${index}]`,
            type: 'broken_reference',
          });
        }
      });
    }

    return {
      valid: brokenRefs.length === 0,
      brokenRefs,
      entryUid,
    };
  } catch (error) {
    console.error('Reference validation error:', error);
    return {
      valid: false,
      error: error.message,
    };
  }
};

/**
 * Validate all references in a content type
 */
export const validateAllReferences = async (contentType) => {
  try {
    const Query = Stack.ContentType(contentType).Query();
    const result = await Query.includeCount().includeReference(['*']).find();

    const validationResults = {
      contentType,
      totalEntries: result.count,
      validEntries: 0,
      invalidEntries: 0,
      brokenReferences: [],
    };

    for (const entry of result.items) {
      const validation = await validateReferences(contentType, entry.uid);
      if (validation.valid) {
        validationResults.validEntries++;
      } else {
        validationResults.invalidEntries++;
        validationResults.brokenReferences.push({
          entryUid: entry.uid,
          entryTitle: entry.title,
          brokenRefs: validation.brokenRefs || [],
          error: validation.error,
        });
      }
    }

    return validationResults;
  } catch (error) {
    console.error('Bulk reference validation error:', error);
    throw error;
  }
};

/**
 * Accessibility testing utilities
 * These should be used with tools like axe-core or pa11y
 */

/**
 * Check if element has proper ARIA labels
 */
export const checkAriaLabels = (element) => {
  const issues = [];

  // Check for images without alt text
  const images = element.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.alt && !img.getAttribute('aria-label')) {
      issues.push({
        type: 'missing_alt',
        element: img,
        message: 'Image missing alt text or aria-label',
      });
    }
  });

  // Check for buttons without labels
  const buttons = element.querySelectorAll('button');
  buttons.forEach((button) => {
    if (!button.textContent.trim() && !button.getAttribute('aria-label')) {
      issues.push({
        type: 'missing_label',
        element: button,
        message: 'Button missing text content or aria-label',
      });
    }
  });

  // Check for form inputs without labels
  const inputs = element.querySelectorAll('input, textarea, select');
  inputs.forEach((input) => {
    const id = input.id;
    const label = id ? element.querySelector(`label[for="${id}"]`) : null;
    if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
      issues.push({
        type: 'missing_label',
        element: input,
        message: 'Form input missing label or aria-label',
      });
    }
  });

  return {
    passed: issues.length === 0,
    issues,
  };
};

/**
 * Check color contrast (basic check)
 * Returns true if contrast ratio meets WCAG AA standards
 */
export const checkColorContrast = (foreground, background) => {
  // Simplified contrast check - use a proper library like 'color-contrast-checker' in production
  const getLuminance = (color) => {
    // Convert hex to RGB
    const rgb = color.match(/\w\w/g).map((x) => parseInt(x, 16) / 255);
    const [r, g, b] = rgb.map((val) => {
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  return ratio >= 4.5;
};

/**
 * Content migration testing
 * Validates content structure after migration
 */
export const testContentMigration = async (contentType, expectedFields = []) => {
  try {
    const Query = Stack.ContentType(contentType).Query();
    const result = await Query.includeCount().find();

    const migrationResults = {
      contentType,
      totalEntries: result.count,
      entriesWithAllFields: 0,
      entriesMissingFields: [],
      fieldCoverage: {},
    };

    // Initialize field coverage
    expectedFields.forEach((field) => {
      migrationResults.fieldCoverage[field] = 0;
    });

    result.items.forEach((entry) => {
      const missingFields = expectedFields.filter((field) => !entry[field]);
      
      if (missingFields.length === 0) {
        migrationResults.entriesWithAllFields++;
      } else {
        migrationResults.entriesMissingFields.push({
          uid: entry.uid,
          title: entry.title,
          missingFields,
        });
      }

      // Track field coverage
      expectedFields.forEach((field) => {
        if (entry[field]) {
          migrationResults.fieldCoverage[field]++;
        }
      });
    });

    // Calculate coverage percentage
    Object.keys(migrationResults.fieldCoverage).forEach((field) => {
      migrationResults.fieldCoverage[field] = {
        count: migrationResults.fieldCoverage[field],
        percentage: (migrationResults.fieldCoverage[field] / result.count) * 100,
      };
    });

    return migrationResults;
  } catch (error) {
    console.error('Content migration test error:', error);
    throw error;
  }
};

/**
 * Run all QA tests
 */
export const runAllQATests = async () => {
  const results = {
    permissions: {},
    searchRelevancy: {},
    brokenReferences: {},
    accessibility: {},
    migration: {},
  };

  // Test permissions
  results.permissions.documentation = await testPermissions('documentation', 'read');
  results.permissions.faq = await testPermissions('faq', 'read');

  // Test search relevancy
  results.searchRelevancy = await testSearchRelevancy('getting started', []);

  // Validate references
  results.brokenReferences.documentation = await validateAllReferences('documentation');
  results.brokenReferences.faq = await validateAllReferences('faq');

  // Test content migration
  results.migration.documentation = await testContentMigration('documentation', [
    'title',
    'content',
    'category',
    'version',
  ]);
  results.migration.faq = await testContentMigration('faq', ['question', 'answer', 'category']);

  return results;
};

