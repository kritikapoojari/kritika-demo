# How to Find Your Content Type UID

## Error: Content Type 'documentation' was not found (Error Code 118)

This error means the content type UID in your code doesn't match the actual UID in your Contentstack stack.

## Step-by-Step Guide to Find Content Type UID

### Method 1: From Contentstack UI

1. **Log in to Contentstack:**
   - Go to https://app.contentstack.com/
   - Sign in to your account

2. **Navigate to Content Types:**
   - Click on **Content Types** in the left sidebar
   - You'll see a list of all content types

3. **Find Your Content Type:**
   - Look for your documentation content type
   - Click on it to open

4. **Check the UID:**
   - Look at the URL in your browser
   - It will look like: `https://app.contentstack.com/.../content-types/{UID}/...`
   - The UID is the part after `/content-types/`
   
   OR
   
   - In the content type settings, look for the **UID** field
   - This is your content type UID

### Method 2: From Contentstack API

You can also check the UID by looking at an entry's API response or using Developer Tools.

### Method 3: Common Content Type UIDs

Content type UIDs might be:
- `documentation` (default)
- `documentations` (plural)
- `doc` or `docs`
- `knowledge_base` or `kb`
- `article` or `articles`
- Something custom you created

## How to Update Your Code

### Option 1: Update Environment Variables (Recommended)

Add to your `.env` file:

```env
REACT_APP_CONTENTSTACK_DOCUMENTATION_UID=your_actual_content_type_uid
REACT_APP_CONTENTSTACK_FAQ_UID=your_faq_content_type_uid
REACT_APP_CONTENTSTACK_CATEGORY_UID=your_category_content_type_uid
```

Then restart your development server.

### Option 2: Update Config File Directly

Edit `src/config/contentstack.js`:

```javascript
export const CONTENT_TYPES = {
  DOCUMENTATION: 'your_actual_content_type_uid',  // ← Update this
  FAQ: 'your_faq_uid',
  CATEGORY: 'your_category_uid',
  // ...
};
```

### Option 3: Use Browser Console Helper

Open browser console and run:

```javascript
// Import the helper (if available)
import { verifyContentType } from './src/utils/contentTypeHelper';

// Test different UIDs
await verifyContentType('documentation');
await verifyContentType('documentations');
await verifyContentType('doc');
// etc.
```

## Quick Test

1. **Find your content type UID** using Method 1 above

2. **Update your `.env` file:**
   ```env
   REACT_APP_CONTENTSTACK_DOCUMENTATION_UID=your_found_uid
   ```

3. **Restart your server:**
   ```bash
   npm start
   ```

4. **Check browser console:**
   - Look for: `📋 Content Type UIDs: { DOCUMENTATION: 'your_uid', ... }`
   - This confirms the UID is being used

## Example

If your content type UID is `knowledge_base` instead of `documentation`:

**Update `.env`:**
```env
REACT_APP_CONTENTSTACK_DOCUMENTATION_UID=knowledge_base
```

**Or update `src/config/contentstack.js`:**
```javascript
export const CONTENT_TYPES = {
  DOCUMENTATION: 'knowledge_base',  // ← Changed from 'documentation'
  // ...
};
```

## Verify It's Working

After updating, check the browser console. You should see:
- No error code 118
- Content fetching successfully
- Entries displaying on the page

## Still Having Issues?

1. **Double-check the UID:**
   - Make sure there are no typos
   - UIDs are case-sensitive
   - No extra spaces

2. **Check Contentstack:**
   - Verify the content type exists
   - Check it's in the correct stack
   - Ensure entries are published

3. **Check Environment:**
   - Make sure you're using the correct environment name
   - Verify API key and delivery token are correct

4. **Use Developer Tools:**
   - Open browser DevTools (F12)
   - Check Console for detailed error messages
   - Look for the exact error code and message

