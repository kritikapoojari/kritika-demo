# Contentstack Setup Guide

## Quick Setup Checklist

### 1. Environment Variables

Create a `.env` file in the root directory with your Contentstack credentials:

```env
REACT_APP_CONTENTSTACK_API_KEY=your_api_key_here
REACT_APP_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token_here
REACT_APP_CONTENTSTACK_ENVIRONMENT=production
```

### 2. Verify Your Contentstack Entry

Make sure your documentation entry:
- ✅ Is published in the `production` environment
- ✅ Has the content type UID: `documentation`
- ✅ Has required fields filled:
  - `title` (required)
  - `content` (required - Rich Text Editor content)
  - `category` (reference to category entry)
  - `version` (optional, e.g., "1.0")

### 3. Test the Integration

1. **Start the development server:**
   ```bash
   npm start
   ```

2. **Navigate to Documentation page:**
   - Go to `http://localhost:3000/documentation`
   - You should see your published entry(s)

3. **View a specific entry:**
   - Click on any documentation entry
   - Or navigate directly: `http://localhost:3000/documentation/{entry_uid}`

### 4. Debugging

If entries don't appear, check the browser console for:

- **API Errors:** Check if credentials are correct
- **Empty Results:** Verify entries are published in the correct environment
- **Field Errors:** Ensure field names match (title, content, category, version)

### 5. Common Issues

#### Issue: "Failed to load documentation"
**Solution:**
- Verify `.env` file has correct credentials
- Check that entries are published in `production` environment
- Ensure content type UID is exactly `documentation`

#### Issue: "No documentation found"
**Solution:**
- Check browser console for detailed error messages
- Verify entry is published (not just saved as draft)
- Check that the entry has a `title` field

#### Issue: Content not displaying
**Solution:**
- Contentstack Rich Text Editor returns HTML
- The app automatically detects and renders HTML content
- If content is plain text, it will be rendered as-is

### 6. Field Mapping

The app expects these fields in your `documentation` content type:

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `title` | Text | Yes | Documentation title |
| `content` | Rich Text | Yes | Main content (HTML from Rich Text Editor) |
| `description` | Text | No | Short description |
| `category` | Reference | No | Reference to category entry |
| `version` | Text | No | Version number (e.g., "1.0") |
| `related_docs` | Reference (Multiple) | No | Related documentation entries |
| `tags` | Tags | No | Tags for categorization |

### 7. Testing with Your Entry

To test with your specific entry:

1. **Get your entry UID:**
   - In Contentstack, open your documentation entry
   - Copy the UID from the URL or entry details

2. **Test direct access:**
   ```
   http://localhost:3000/documentation/{your_entry_uid}
   ```

3. **Check console logs:**
   - Open browser DevTools (F12)
   - Check Console tab for:
     - "Documentation fetch result:" - Shows the fetched data
     - "Entry Debug" - Shows entry structure
     - Any error messages

### 8. Contentstack Query Examples

The app uses these Contentstack queries:

**Get all documentation:**
```javascript
Stack.ContentType('documentation')
  .Query()
  .includeCount()
  .includeReference(['category'])
  .find()
```

**Get by UID:**
```javascript
Stack.ContentType('documentation')
  .Query()
  .where('uid', 'your_entry_uid')
  .includeReference(['category', 'related_docs'])
  .find()
```

**Filter by category:**
```javascript
Stack.ContentType('documentation')
  .Query()
  .where('category', 'category_uid')
  .find()
```

### 9. Next Steps

Once your entry is displaying:

1. ✅ Add more documentation entries
2. ✅ Create category entries and link them
3. ✅ Add related documentation references
4. ✅ Test version filtering
5. ✅ Test search functionality

### 10. Support

If you encounter issues:

1. Check browser console for errors
2. Verify Contentstack credentials in `.env`
3. Ensure entries are published in the correct environment
4. Check that field names match exactly (case-sensitive)
5. Review the `contentstackHelpers.js` utility functions

## Quick Test Command

Run this to verify your Contentstack connection:

```bash
# Start the app
npm start

# Then check browser console at:
# http://localhost:3000/documentation
```

Look for console logs showing:
- "Documentation fetch result:" with your entries
- "Number of entries:" showing count > 0
- "Entries:" array with your documentation data

