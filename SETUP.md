# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the root directory with:
   ```
   REACT_APP_CONTENTSTACK_API_KEY=your_api_key_here
   REACT_APP_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token_here
   REACT_APP_CONTENTSTACK_ENVIRONMENT=production
   ```

3. **Set Up Contentstack Content Types**
   
   Follow the instructions in `CONTENT_TYPES.md` to create:
   - Documentation
   - FAQ
   - Category
   - Feedback

4. **Start Development Server**
   ```bash
   npm start
   ```

## Contentstack Configuration Steps

### Step 1: Get Your API Credentials

1. Log in to Contentstack
2. Go to Settings → Stack
3. Copy your:
   - API Key
   - Delivery Token
   - Environment name (usually "production" or "development")

### Step 2: Create Content Types

1. Go to Content Types → Create New
2. For each content type listed in `CONTENT_TYPES.md`:
   - Create the content type with the specified UID
   - Add all fields as described
   - Set up references between content types
   - Configure entry title patterns

### Step 3: Create Sample Content

1. Create at least one Category entry
2. Create a few Documentation entries
3. Create a few FAQ entries
4. Link them using references

### Step 4: Configure Roles (Optional)

1. Go to Settings → Roles
2. Create roles matching:
   - Admin
   - Editor
   - Viewer
   - Guest

## Testing the Application

1. **Test Role Switching**
   - Use the role selector in the header
   - Verify that Analytics is only visible for Admin/Editor roles

2. **Test Search**
   - Enter a search query
   - Verify results appear
   - Check that results link correctly

3. **Test Documentation**
   - Browse documentation list
   - Filter by category and version
   - View a documentation entry
   - Check version selector (if multiple versions exist)

4. **Test FAQs**
   - Browse FAQ list
   - Expand/collapse FAQ items
   - Filter by category

5. **Test Feedback**
   - Submit feedback on a documentation entry
   - Verify feedback form works

## Troubleshooting

### Content Not Loading

- Check your `.env` file has correct credentials
- Verify content types exist in Contentstack
- Check browser console for errors
- Ensure content entries are published

### Search Not Working

- Verify Fuse.js is installed: `npm list fuse.js`
- Check search service configuration
- Verify content has searchable fields

### Role-Based Access Not Working

- Check `src/config/roles.js` configuration
- Verify localStorage is enabled
- Check role selector in header

### Webhooks Not Working

- Webhooks require a backend server
- See `src/utils/webhooks.js` for implementation examples
- Set webhook URLs in `.env` file

## Next Steps

- Set up webhook endpoints on your backend
- Configure analytics (Google Analytics, etc.)
- Customize styling to match your brand
- Add authentication integration
- Set up content approval workflows

