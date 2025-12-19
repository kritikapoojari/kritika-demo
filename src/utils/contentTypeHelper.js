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

/**
 * Try to find FAQ content type UID by testing common alternatives
 * @returns {Promise} Object with found UID or list of tried UIDs
 */
export const findFAQContentTypeUID = async () => {
  const commonFAQUIDs = [
    'faq',
    'faqs',
    'faq_entry',
    'faq_entries',
    'question',
    'questions',
    'frequently_asked_question',
    'frequently_asked_questions',
  ];
  
  console.log('🔍 Trying to find FAQ content type UID...');
  console.log('Testing common UIDs:', commonFAQUIDs);
  
  for (const uid of commonFAQUIDs) {
    try {
      const Query = Stack.ContentType(uid).Query();
      Query.limit(1);
      const result = await Query.toJSON().find();
      
      // Check if we got a valid response (not an error)
      if (result && (Array.isArray(result) ? result.length > 0 : true)) {
        console.log(`✅ Found FAQ content type: "${uid}"`);
        return { found: true, uid: uid };
      }
    } catch (err) {
      // Content type doesn't exist or error occurred, continue
      if (err.error_code !== 118) {
        // If it's not a "not found" error, log it
        console.warn(`⚠️ Error testing "${uid}":`, err.error_message || err.message);
      }
    }
  }
  
  console.log('❌ Could not find FAQ content type with common UIDs');
  console.log('\n📋 To find your FAQ content type UID:');
  console.log('1. Go to Contentstack → Content Types');
  console.log('2. Find your FAQ content type');
  console.log('3. Check the UID in the URL or settings');
  console.log('4. Add to .env file: REACT_APP_CONTENTSTACK_FAQ_UID=your_actual_uid');
  
  return { 
    found: false, 
    tried: commonFAQUIDs,
    message: 'Please check your FAQ content type UID in Contentstack' 
  };
};

/**
 * Try to find Category content type UID by testing common alternatives
 * @returns {Promise} Object with found UID or list of tried UIDs
 */
export const findCategoryContentTypeUID = async () => {
  const commonCategoryUIDs = [
    'category',
    'categories',
    'category_entry',
    'category_entries',
    'tag',
    'tags',
    'taxonomy',
    'taxonomies',
  ];
  
  console.log('🔍 Trying to find Category content type UID...');
  console.log('Testing common UIDs:', commonCategoryUIDs);
  
  for (const uid of commonCategoryUIDs) {
    try {
      const Query = Stack.ContentType(uid).Query();
      Query.limit(1);
      const result = await Query.toJSON().find();
      
      // Check if we got a valid response (not an error)
      if (result && (Array.isArray(result) ? result.length > 0 : true)) {
        console.log(`✅ Found Category content type: "${uid}"`);
        return { found: true, uid: uid };
      }
    } catch (err) {
      // Content type doesn't exist or error occurred, continue
      if (err.error_code !== 118) {
        // If it's not a "not found" error, log it
        console.warn(`⚠️ Error testing "${uid}":`, err.error_message || err.message);
      }
    }
  }
  
  console.log('❌ Could not find Category content type with common UIDs');
  console.log('\n📋 To find your Category content type UID:');
  console.log('1. Go to Contentstack → Content Types');
  console.log('2. Find your Category content type');
  console.log('3. Check the UID in the URL or settings');
  console.log('4. Add to .env file: REACT_APP_CONTENTSTACK_CATEGORY_UID=your_actual_uid');
  
  return { 
    found: false, 
    tried: commonCategoryUIDs,
    message: 'Please check your Category content type UID in Contentstack' 
  };
};

