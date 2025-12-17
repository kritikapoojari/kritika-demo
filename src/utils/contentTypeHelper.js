/**
 * Content Type Helper Utilities
 * Helps find and verify content type UIDs in Contentstack
 */

import Stack from '../config/contentstack';

/**
 * List all available content types in your stack
 * Use this to find the correct content type UID
 * @returns {Promise} Array of content types
 */
export const listContentTypes = async () => {
  try {
    // Note: Contentstack Management API is needed to list content types
    // For now, we'll try to fetch entries and see what content types exist
    console.log('📋 To find your content type UID:');
    console.log('1. Go to Contentstack → Content Types');
    console.log('2. Click on your content type');
    console.log('3. Check the URL - it will show the UID');
    console.log('4. Or check the "UID" field in the content type settings');
    
    // Try common content type UIDs
    const commonUIDs = [
      'documentation',
      'documentations',
      'doc',
      'docs',
      'knowledge_base',
      'kb',
      'article',
      'articles',
    ];
    
    console.log('\n🔍 Trying common content type UIDs...');
    
    for (const uid of commonUIDs) {
      try {
        const Query = Stack.ContentType(uid).Query();
        Query.limit(1);
        const result = await Query.find();
        
        if (result && (result.items?.length > 0 || (Array.isArray(result) && result.length > 0))) {
          console.log(`✅ Found content type: "${uid}"`);
          return { found: true, uid: uid };
        }
      } catch (err) {
        // Content type doesn't exist, continue
      }
    }
    
    console.log('❌ Could not find content type with common UIDs');
    return { found: false, message: 'Please check your content type UID in Contentstack' };
  } catch (error) {
    console.error('Error listing content types:', error);
    throw error;
  }
};

/**
 * Verify if a content type exists
 * @param {string} contentTypeUID - Content type UID to verify
 * @returns {Promise} Verification result
 */
export const verifyContentType = async (contentTypeUID) => {
  try {
    const Query = Stack.ContentType(contentTypeUID).Query();
    Query.limit(1);
    const result = await Query.find();
    
    return {
      exists: true,
      uid: contentTypeUID,
      message: `Content type "${contentTypeUID}" exists`,
    };
  } catch (error) {
    if (error.error_code === 118) {
      return {
        exists: false,
        uid: contentTypeUID,
        message: `Content type "${contentTypeUID}" was not found. Error: ${error.error_message}`,
        error: error,
      };
    }
    throw error;
  }
};

/**
 * Get content type UID from Contentstack entry
 * This can help identify the correct UID
 */
export const getContentTypeFromEntry = async (entryUid) => {
  try {
    // Try different content types to find which one contains this entry
    const contentTypes = [
      'documentation',
      'documentations',
      'doc',
      'docs',
      'knowledge_base',
      'kb',
      'article',
      'articles',
    ];
    
    for (const contentType of contentTypes) {
      try {
        const Query = Stack.ContentType(contentType).Query();
        Query.where('uid', entryUid);
        const result = await Query.find();
        
        if (result && (result.items?.length > 0 || (Array.isArray(result) && result.length > 0))) {
          return {
            found: true,
            contentTypeUID: contentType,
            entry: Array.isArray(result) ? result[0]?.[0] : result.items?.[0],
          };
        }
      } catch (err) {
        // Continue searching
      }
    }
    
    return { found: false, message: 'Entry not found in any common content types' };
  } catch (error) {
    console.error('Error finding content type:', error);
    throw error;
  }
};

