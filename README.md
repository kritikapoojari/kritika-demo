# Knowledge Portal / Help Center - Contentstack DXP

A comprehensive Internal Knowledge Portal and Help Center built with Contentstack as a Digital Experience Platform (DXP).

## Features

### Core Features
- ✅ **Versioned Documentation** - Manage and display multiple versions of documentation
- ✅ **Searchable FAQs** - Powerful search functionality with relevancy scoring
- ✅ **Role-Based Access Control** - Custom roles with granular permissions
- ✅ **Feedback Loop** - Collect and analyze user feedback on content

### Contentstack Concepts Implemented
- ✅ **Rich Text Editor** - For documentation and FAQ content
- ✅ **References** - Link related documentation and categories
- ✅ **Custom Roles** - Admin, Editor, Viewer, Guest roles
- ✅ **Webhooks** - Analytics tracking and feedback submission

### QA Features
- ✅ **Permission Testing** - Test role-based access controls
- ✅ **Search Relevancy** - Validate search result quality
- ✅ **Broken Reference Validation** - Detect and report broken content references
- ✅ **Accessibility (WCAG)** - ARIA labels, keyboard navigation, color contrast
- ✅ **Content Migration Testing** - Validate content structure after migration

## Getting Started

### Prerequisites
- Node.js 14+ and npm
- Contentstack account with API credentials
- (Optional) Backend server for webhooks

### Installation

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Contentstack:**
   - Copy `.env.example` to `.env`
   - Add your Contentstack credentials:
     ```
     REACT_APP_CONTENTSTACK_API_KEY=your_api_key
     REACT_APP_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
     REACT_APP_CONTENTSTACK_ENVIRONMENT=production
     ```

3. **Set up Content Types in Contentstack:**
   - See `CONTENT_TYPES.md` for detailed schema
   - Create the following content types:
     - `documentation`
     - `faq`
     - `category`
     - `feedback`
     - (Optional) `user_role`

4. **Start the development server:**
   ```bash
   npm start
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:3000`

## Project Structure

```
src/
├── components/
│   ├── Analytics/          # Analytics dashboard
│   ├── Documentation/      # Documentation viewer and list
│   ├── FAQ/                # FAQ list component
│   ├── Feedback/           # Feedback form
│   ├── Layout/             # Header, Footer
│   └── Search/             # Search bar component
├── config/
│   ├── contentstack.js     # Contentstack SDK configuration
│   └── roles.js            # Role-based access control
├── pages/
│   ├── Home.js             # Landing page
│   └── SearchResults.js    # Search results page
├── services/
│   ├── analyticsService.js # Analytics tracking
│   ├── feedbackService.js  # Feedback submission
│   └── searchService.js    # Search functionality
├── utils/
│   ├── qaTests.js          # QA testing utilities
│   └── webhooks.js         # Webhook configuration
└── App.js                  # Main application component
```

## Contentstack Setup

### 1. Create Content Types

Follow the schemas in `CONTENT_TYPES.md` to create:
- Documentation
- FAQ
- Category
- Feedback

### 2. Configure Roles

In Contentstack, create custom roles matching:
- Admin
- Editor
- Viewer
- Guest

### 3. Set Up Webhooks

Configure webhooks in Contentstack for:
- Entry publish/unpublish
- Entry delete
- Entry update

Point them to your backend endpoints (see `src/utils/webhooks.js` for examples).

## Usage

### Role-Based Access

Switch roles using the dropdown in the header:
- **Guest**: Can view documentation and FAQs, submit feedback
- **Viewer**: Can view all content, submit feedback
- **Editor**: Can view and edit content, view analytics
- **Admin**: Full access including analytics and content management

### Search

- Use the search bar on any page
- Search across documentation and FAQs
- Results are ranked by relevancy

### Documentation

- Browse documentation by category and version
- View version history
- See related documentation
- Submit feedback on each article

### FAQs

- Browse FAQs by category
- Expand/collapse FAQ items
- Search within FAQs
- View tags and metadata

### Analytics

- View feedback analytics (Admin/Editor only)
- See rating distribution
- Filter by date range
- View feedback by content type

## QA Testing

Use the utilities in `src/utils/qaTests.js`:

```javascript
import { runAllQATests, validateReferences, testSearchRelevancy } from './utils/qaTests';

// Run all QA tests
const results = await runAllQATests();

// Validate references for a specific entry
const validation = await validateReferences('documentation', 'entry_uid');

// Test search relevancy
const searchResults = await testSearchRelevancy('query', ['expected_uid_1', 'expected_uid_2']);
```

## Accessibility

The application follows WCAG 2.1 guidelines:
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators
- Screen reader support
- Color contrast compliance

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_CONTENTSTACK_API_KEY` | Contentstack API key | Yes |
| `REACT_APP_CONTENTSTACK_DELIVERY_TOKEN` | Contentstack delivery token | Yes |
| `REACT_APP_CONTENTSTACK_ENVIRONMENT` | Contentstack environment | Yes |
| `REACT_APP_WEBHOOK_URL` | Feedback webhook URL | No |
| `REACT_APP_ANALYTICS_WEBHOOK_URL` | Analytics webhook URL | No |

## Building for Production

```bash
npm run build
```

The build folder will contain the optimized production build.

## Testing

```bash
npm test
```

## Deployment

1. Build the application: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Configure environment variables in your hosting platform
4. Set up webhook endpoints on your backend server

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues and questions:
- Check Contentstack documentation: https://www.contentstack.com/docs
- Review `CONTENT_TYPES.md` for content type setup
- See `src/utils/webhooks.js` for webhook examples

## Roadmap

- [ ] Advanced search filters
- [ ] Content recommendations
- [ ] User authentication integration
- [ ] Multi-language support
- [ ] Content versioning UI
- [ ] Advanced analytics dashboard
- [ ] Export functionality
- [ ] Content approval workflow
