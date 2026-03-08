# Knowledge Portal — Contentstack DXP

A modern, role-aware Internal Knowledge Portal built with **React 19** and **Contentstack** as the headless CMS backbone. The portal gives teams a single place to browse documentation, search FAQs, submit feedback, and track content analytics — with every page adapting in real time to the signed-in user's role.

---

## Live Features

### 📚 Documentation
- Browse 11 articles across topics: Getting Started, Content Types, Webhooks, Environments, Rich Text Editor, Localisation, Roles & Permissions, GraphQL API, Live Preview, Asset Management
- Click any card to open the full article in the **Documentation Viewer**
- **Read more →** button on each card for quick navigation
- Editor/Admin roles see **Edit** and **Delete** action badges on every card
- Inline **Feedback Form** on each article — submit star ratings and comments

### ❓ FAQs
- 12 categorised FAQs across: Authentication & Tokens, Errors & Troubleshooting, Content Management, Development, Assets & Media
- Expand/collapse accordion with category filter
- Inline feedback form inside each expanded answer (hidden for Guest)
- Editor/Admin see **Edit** and **Delete** badges per FAQ item
- **+ New FAQ** button visible for Editor and Admin

### 🔍 Search
- Full-text search across all documentation and FAQs using **Fuse.js**
- Discovery section when no query is active:
  - **Recent Searches** (persisted in `localStorage`)
  - **Trending Searches** — 18 popular terms
  - **Most Visited** — 16 popular articles and FAQs with view counts
- Clickable chips to launch searches instantly

### 💬 Feedback
- Global feedback page showing overall portal analytics
- Stats strip: total reviews, average rating, satisfaction rate
- Rating distribution bars
- Filterable review list (All / Documentation / FAQ)
- Submit general feedback form — locked with a 🔒 message for Guest
- 21 realistic seed reviews across all content types

### 📊 Analytics *(Editor & Admin only)*
- **KPI cards**: Total Reviews, Average Rating with star display, Satisfaction Rate %
- **Rating Distribution** — gradient progress bars (5→1 stars)
- **By Content Type** — visual bars per type
- **Most Reviewed Content** — top 6 pages with per-page average ratings
- **Recent Activity feed** — last 8 reviews with avatars, comments, stars, relative timestamps
- Date-range filter

---

## Role-Based Access Control

Switch roles using the **role switcher** in the top-right of the header. The entire UI adapts instantly.

| Feature | Guest | Viewer | Editor | Admin |
|---|:---:|:---:|:---:|:---:|
| Browse Documentation | ✅ | ✅ | ✅ | ✅ |
| Browse FAQs | ✅ | ✅ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ |
| Submit Feedback | ❌ | ✅ | ✅ | ✅ |
| View Feedback page | ❌ | ✅ | ✅ | ✅ |
| Edit content badges | ❌ | ❌ | ✅ | ✅ |
| Delete content badges | ❌ | ❌ | ❌ | ✅ |
| Analytics dashboard | ❌ | ❌ | ✅ | ✅ |

**Home page feature cards** are filtered per role — Guest sees 3 cards, Viewer sees 4, Editor/Admin see all 5. The grid reflows automatically with no white gaps.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Routing | React Router v6 |
| CMS | Contentstack SDK v3 |
| Search | Fuse.js v7 |
| Markdown | react-markdown + remark-gfm |
| Date formatting | date-fns v3 |
| HTTP | axios |
| Styling | Plain CSS (no UI framework) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Contentstack account (free tier works)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/kritikapoojari/kritika-demo.git
cd kritika-demo

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
```

Edit `.env` with your Contentstack credentials:

```env
REACT_APP_CONTENTSTACK_API_KEY=your_api_key
REACT_APP_CONTENTSTACK_DELIVERY_TOKEN=your_delivery_token
REACT_APP_CONTENTSTACK_ENVIRONMENT=production

# Optional — region for EU stacks
REACT_APP_CONTENTSTACK_REGION=EU

# Optional — content type UIDs (defaults shown)
REACT_APP_CONTENTSTACK_DOCUMENTATION_UID=documentation
REACT_APP_CONTENTSTACK_FAQ_UID=faq
REACT_APP_CONTENTSTACK_FEEDBACK_UID=feedback

# Optional — analytics/feedback webhooks
REACT_APP_WEBHOOK_URL=https://your-backend.com/feedback
REACT_APP_ANALYTICS_WEBHOOK_URL=https://your-backend.com/analytics
```

```bash
# 4. Start the development server
npm start
# → http://localhost:3000
```

> **No Contentstack account?** The app ships with realistic mock data for all content types and falls back to it automatically when the API is unreachable. Everything works out of the box.

---

## Project Structure

```
src/
├── components/
│   ├── Analytics/
│   │   ├── AnalyticsDashboard.js   # KPIs, rating bars, activity feed
│   │   └── AnalyticsDashboard.css
│   ├── Documentation/
│   │   ├── DocumentationList.js    # Card grid with role-aware Edit/Delete
│   │   └── DocumentationViewer.js  # Full article + inline feedback
│   ├── FAQ/
│   │   ├── FAQList.js              # Accordion with category filter
│   │   └── FAQList.css
│   ├── Feedback/
│   │   ├── FeedbackForm.js         # Inline star-rating form per article
│   │   ├── FeedbackForm.css
│   │   ├── FeedbackList.js         # Standalone feedback list component
│   │   └── FeedbackList.css
│   ├── Layout/
│   │   ├── Header.js               # Sticky header with custom role switcher
│   │   └── Header.css
│   └── Search/
│       └── SearchBar.js            # Reusable search input
├── config/
│   ├── contentstack.js             # SDK init + CONTENT_TYPES constants
│   └── roles.js                    # RBAC: ROLES, PERMISSIONS, hasPermission
├── pages/
│   ├── Home.js                     # Hero + dynamic feature card grid
│   ├── Home.css
│   ├── SearchResults.js            # Search + discovery sections
│   ├── SearchResults.css
│   ├── FeedbackPage.js             # Global feedback + analytics overview
│   └── FeedbackPage.css
├── services/
│   ├── analyticsService.js         # Webhook-based analytics tracking
│   ├── feedbackService.js          # Feedback CRUD + mock seed data
│   └── searchService.js            # Fuse.js search across docs + FAQs
├── utils/
│   ├── contentstackHelpers.js      # getAllDocumentation, getDocumentationByUid + 11 mock entries
│   ├── contentTypeHelper.js        # Content type utilities
│   └── qaTests.js                  # QA test utilities
└── App.js                          # Routes + layout shell
```

---

## Contentstack Setup

### Content Types

Follow `CONTENT_TYPES.md` for full field schemas. Create these content types in Contentstack:

| UID | Purpose |
|---|---|
| `documentation` | Articles — title, body (RTE), version, category |
| `faq` | Q&A — question, answer (RTE), category (ref), tags |
| `category` | Taxonomy for docs and FAQs |
| `feedback` | Ratings + comments per content item |

### Custom Roles

Create these roles in **Settings → Roles**:

| Role | Permissions |
|---|---|
| `admin` | Read + Write + Delete on all types, analytics |
| `editor` | Read + Write on all types, analytics |
| `viewer` | Read on all types, write feedback |
| `guest` | Read docs + FAQs only |

### Webhooks *(optional)*

Configure in **Settings → Webhooks** to post to:
- `REACT_APP_WEBHOOK_URL` — feedback submissions
- `REACT_APP_ANALYTICS_WEBHOOK_URL` — content view tracking

---

## Mock / Offline Mode

The app includes built-in mock data so it works fully without a Contentstack connection:

| Data | Count |
|---|---|
| Documentation articles | 11 |
| FAQs | 12 |
| Feedback entries | 21 |
| Trending search terms | 18 |
| Popular content cards | 16 |

When Contentstack returns error 118 (content type not found) or any network error, the app automatically falls back to this data with a `console.warn` — no error screen shown to the user.

---

## Environment Variables

| Variable | Description | Required |
|---|---|:---:|
| `REACT_APP_CONTENTSTACK_API_KEY` | Stack API key | ✅ |
| `REACT_APP_CONTENTSTACK_DELIVERY_TOKEN` | Delivery token | ✅ |
| `REACT_APP_CONTENTSTACK_ENVIRONMENT` | Environment name (e.g. `production`) | ✅ |
| `REACT_APP_CONTENTSTACK_REGION` | `EU` or `US` (default: US) | ❌ |
| `REACT_APP_CONTENTSTACK_DOCUMENTATION_UID` | Docs content type UID | ❌ |
| `REACT_APP_CONTENTSTACK_FAQ_UID` | FAQ content type UID | ❌ |
| `REACT_APP_CONTENTSTACK_FEEDBACK_UID` | Feedback content type UID | ❌ |
| `REACT_APP_WEBHOOK_URL` | Feedback webhook endpoint | ❌ |
| `REACT_APP_ANALYTICS_WEBHOOK_URL` | Analytics webhook endpoint | ❌ |

---

## Scripts

```bash
npm start        # Start dev server at http://localhost:3000
npm run build    # Production build → /build
npm test         # Run test suite
npm run eject    # Eject from Create React App (irreversible)
```

---

## Accessibility

- Semantic HTML throughout (`<header>`, `<main>`, `<footer>`, `<article>`, `<nav>`)
- ARIA labels on all interactive elements
- `role="alert"` on error and success messages
- `role="listbox"` / `role="option"` on the custom role switcher
- Keyboard-navigable FAQ accordion
- Sufficient colour contrast on all role badge colours

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome | Latest ✅ |
| Firefox | Latest ✅ |
| Safari | Latest ✅ |
| Edge | Latest ✅ |

---

## Roadmap

- [ ] Real authentication (replace role switcher with login)
- [ ] Advanced search filters (by category, date, rating)
- [ ] Content recommendations ("You might also like")
- [ ] Multi-language / locale support
- [ ] Content approval workflow
- [ ] Export analytics to CSV
- [ ] Dark mode

---

## Support

- Contentstack docs: [contentstack.com/docs](https://www.contentstack.com/docs)
- Content type schemas: [`CONTENT_TYPES.md`](./CONTENT_TYPES.md)
- GitHub: [github.com/kritikapoojari/kritika-demo](https://github.com/kritikapoojari/kritika-demo)

---

## License

MIT
