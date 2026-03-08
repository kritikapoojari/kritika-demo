/**
 * Contentstack Helper Utilities
 * Helper functions for working with Contentstack content
 */

import Stack from '../config/contentstack';
import { CONTENT_TYPES } from '../config/contentstack';

// Realistic mock documentation entries used as a fallback when Contentstack
// content types are not yet configured or reachable.
export const MOCK_DOCUMENTATION_ENTRIES = [
  {
    uid: 'blt_doc_getting_started',
    title: 'Getting Started with the Platform',
    single_line: 'Your first steps to set up and go live',
    multi_line:
      'This guide walks you through account setup, creating your first stack, configuring environments, and publishing your first content entry.',
    version: '2.1',
    content:
      '## Prerequisites\n\nBefore you begin, ensure you have:\n- A Contentstack account (sign up at contentstack.com)\n- Node.js 18+ installed\n- Basic familiarity with REST APIs\n\n## Step 1 — Create a Stack\n\nLog in to Contentstack and click **New Stack**. Give it a name and choose your region (EU or US).\n\n## Step 2 — Add a Content Type\n\nNavigate to **Content Types → + New Content Type**. Define fields that match your data model.\n\n## Step 3 — Publish an Entry\n\nCreate an entry under your new content type and click **Publish** to make it live on the `production` environment.',
    created_at: '2026-01-10T08:00:00.000Z',
    updated_at: '2026-02-15T11:30:00.000Z',
  },
  {
    uid: 'blt_doc_content_types',
    title: 'Designing Content Types',
    single_line: 'Model your content schema with fields and modular blocks',
    multi_line:
      'A deep dive into field types, references, modular blocks, and global fields — with practical examples for a documentation portal.',
    version: '1.4',
    content:
      '## Field Types Overview\n\nContentstack supports over 20 field types including:\n- **Single Line** — short text, titles\n- **Multi Line** — descriptions, summaries\n- **Rich Text** — full HTML editor output\n- **Reference** — link entries across content types\n- **Modular Blocks** — flexible, composable content sections\n\n## Modular Blocks Example\n\nModular blocks let authors mix and match layouts. Define a block called `section` with fields `heading` (Single Line) and `body` (Rich Text). Authors can then add multiple sections in any order.\n\n## Global Fields\n\nGlobal fields are reusable field groups. Define `seo_metadata` once (title, description, canonical URL) and embed it in every content type that needs it.',
    created_at: '2026-01-18T09:00:00.000Z',
    updated_at: '2026-02-20T14:00:00.000Z',
  },
  {
    uid: 'blt_doc_webhooks',
    title: 'Webhooks & Event-Driven Workflows',
    single_line: 'Trigger external systems on publish, update, or delete events',
    multi_line:
      'Learn how to configure webhooks, verify payloads, handle retries, and integrate with CI/CD pipelines or third-party services.',
    version: '1.2',
    content:
      '## Creating a Webhook\n\n1. Go to **Settings → Webhooks → + New Webhook**\n2. Enter your endpoint URL\n3. Select the events to listen to (e.g., `entry.publish`)\n4. Save and test with **Send Test**\n\n## Payload Structure\n\n```json\n{\n  "event": "entry.publish",\n  "triggered_at": "2026-03-01T10:00:00.000Z",\n  "data": {\n    "entry": { "uid": "blt…", "title": "My Entry" },\n    "content_type": { "uid": "documentation" },\n    "environment": { "name": "production" }\n  }\n}\n```\n\n## Retry Logic\n\nIf your endpoint returns a non-2xx status, Contentstack retries with exponential backoff: 1 min → 5 min → 30 min → 2 hrs → 8 hrs.',
    created_at: '2026-02-01T10:00:00.000Z',
    updated_at: '2026-03-01T09:00:00.000Z',
  },
  {
    uid: 'blt_doc_environments',
    title: 'Managing Environments',
    single_line: 'Separate development, staging, and production content pipelines',
    multi_line:
      'Environments let you publish different versions of content to different channels. This guide explains aliases, tokens, and CI/CD integration.',
    version: '1.0',
    content:
      '## What is an Environment?\n\nAn environment maps to a deployment target — development, staging, or production. Each environment has its own delivery token.\n\n## Environment Aliases\n\nAliases allow you to point a stable name (e.g., `live`) to different environments without changing your app config. Useful for blue-green deployments.\n\n## CI/CD Integration\n\nSet `REACT_APP_CONTENTSTACK_ENVIRONMENT` in your pipeline secrets per stage:\n- PR builds → `staging`\n- Main branch → `production`\n\nThis ensures content only reaches users after it has been reviewed and approved.',
    created_at: '2026-02-10T12:00:00.000Z',
    updated_at: '2026-02-28T16:00:00.000Z',
  },
  {
    uid: 'blt_doc_rich_text',
    title: 'Working with the Rich Text Editor',
    single_line: 'Parse, render, and extend Contentstack JSON RTE output',
    multi_line:
      'The Rich Text Editor returns a JSON document tree. This article covers rendering strategies in React, embedded asset handling, and custom serializers.',
    version: '2.0',
    content:
      '## JSON vs HTML Output\n\nContentstack RTE can return:\n- **HTML string** — use `dangerouslySetInnerHTML` or a sanitisation library\n- **JSON document** (newer stacks) — traverse nodes and render with a custom renderer\n\n## Rendering HTML in React\n\n```jsx\n<div dangerouslySetInnerHTML={{ __html: entry.body }} />\n```\n\nAlways sanitise HTML with a library like `dompurify` before rendering user-generated content.\n\n## Embedded Assets\n\nWhen an image is embedded in RTE, Contentstack includes an `embedded_items` map. Resolve asset URLs from this map during rendering rather than making extra API calls.',
    created_at: '2026-02-05T08:30:00.000Z',
    updated_at: '2026-03-04T10:00:00.000Z',
  },
  {
    uid: 'blt_doc_localization',
    title: 'Localisation & Multi-language Content',
    single_line: 'Deliver content in multiple languages from a single stack',
    multi_line:
      'Learn how to set up locales, create localised entries, fall back gracefully to the master locale, and query locale-specific content via the Delivery API.',
    version: '1.3',
    content:
      '## Setting Up Locales\n\n1. Go to **Settings → Locales → + Add Locale**\n2. Select the language (e.g., `fr-FR` for French)\n3. Assign it as a fallback locale if needed\n\n## Creating a Localised Entry\n\nOpen any entry and click **Localise** in the top toolbar. You can translate individual fields while inheriting unchanged fields from the master locale.\n\n## Querying by Locale\n\n```js\nStack.ContentType("article").Query()\n  .language("fr-fr")\n  .toJSON()\n  .find()\n```\n\n## Fallback Behaviour\n\nIf a field is not localised, the Delivery API automatically returns the master locale value — no extra code needed.',
    created_at: '2026-02-12T10:00:00.000Z',
    updated_at: '2026-03-02T08:00:00.000Z',
  },
  {
    uid: 'blt_doc_roles_permissions',
    title: 'Roles & Permissions',
    single_line: 'Control who can read, write, and publish content',
    multi_line:
      'Contentstack supports fine-grained role-based access control. This guide covers built-in roles, custom roles, branch-level permissions, and token scoping.',
    version: '1.1',
    content:
      '## Built-in Roles\n\n| Role | Capabilities |\n|---|---|\n| Owner | Full access including billing |\n| Admin | Full stack management |\n| Developer | Content types, entries, assets |\n| Content Manager | Entries and assets only |\n\n## Custom Roles\n\nCreate custom roles under **Settings → Roles → + New Role**. Assign granular permissions per content type — e.g., allow a team to read `documentation` but only write `blog`.\n\n## Token Scoping\n\nManagement API tokens inherit the permissions of the user who created them. Always create tokens with the minimum required role to follow the principle of least privilege.',
    created_at: '2026-02-20T09:00:00.000Z',
    updated_at: '2026-03-05T12:00:00.000Z',
  },
  {
    uid: 'blt_doc_graphql',
    title: 'GraphQL Content Delivery API',
    single_line: 'Query your content with precision using GraphQL',
    multi_line:
      'The Contentstack GraphQL API lets you request exactly the fields you need, reducing over-fetching. This guide covers the endpoint, introspection, fragments, and pagination.',
    version: '1.0',
    content:
      '## Endpoint\n\nAll GraphQL queries are sent as POST requests to:\n```\nhttps://graphql.contentstack.com/stacks/<API_KEY>?environment=production\n```\n\n## Sample Query\n\n```graphql\nquery {\n  all_documentation {\n    items {\n      title\n      version\n      content\n      updated_at\n    }\n  }\n}\n```\n\n## Pagination\n\nUse `skip` and `limit` arguments:\n```graphql\nall_documentation(skip: 10, limit: 5) { items { title } }\n```\n\n## Introspection\n\nRun `{ __schema { types { name } } }` against your endpoint to explore all available types and fields.',
    created_at: '2026-03-01T07:00:00.000Z',
    updated_at: '2026-03-06T11:00:00.000Z',
  },
  {
    uid: 'blt_doc_live_preview',
    title: 'Live Preview & Visual Builder',
    single_line: 'See content changes in real time before publishing',
    multi_line:
      'Live Preview lets editors see exactly how an entry will look in your app without leaving Contentstack. The Visual Builder extends this with drag-and-drop page composition.',
    version: '1.0',
    content:
      '## Enabling Live Preview\n\n1. Install the `@contentstack/live-preview-utils` package\n2. Initialise it in your app root:\n```js\nimport ContentstackLivePreview from "@contentstack/live-preview-utils";\nContentstackLivePreview.init({ stackDetails: { apiKey, environment } });\n```\n3. Wrap each field with `data-cslp` attributes generated by the SDK\n\n## Visual Builder\n\nThe Visual Builder is an overlay that renders on top of your app inside the Contentstack editor. It highlights editable regions — clicking one opens the field inline for editing.\n\n## Benefits\n\n- Eliminates the "publish and refresh" loop\n- Reduces time-to-publish for content teams by up to 60%\n- Works with any React, Next.js, or Nuxt.js frontend',
    created_at: '2026-03-03T09:00:00.000Z',
    updated_at: '2026-03-07T10:00:00.000Z',
  },
  {
    uid: 'blt_doc_assets',
    title: 'Asset Management & Image Delivery',
    single_line: 'Upload, organise, and serve optimised assets at scale',
    multi_line:
      'Contentstack\'s DAM stores all media files and serves them via a global CDN. This guide covers folder structures, metadata, bulk uploads, and real-time image transforms.',
    version: '1.5',
    content:
      '## Uploading Assets\n\nDrag files into **Assets** or use the Management API:\n```js\nstack.asset().create({ upload: fileBlob, title: "Hero image" })\n```\n\n## Folder Organisation\n\nCreate folders by brand, locale, or content type. Folder UIDs can be referenced in content type fields of type **File** to restrict which folder authors can browse.\n\n## Real-time Image Transforms\n\nAppend parameters to any asset URL:\n| Parameter | Example | Effect |\n|---|---|---|\n| `width` | `?width=800` | Resize width |\n| `format` | `?format=webp` | Convert format |\n| `quality` | `?quality=75` | Compress |\n| `crop` | `?crop=400,400,x50,y50` | Crop region |\n\n## Metadata & Alt Text\n\nStore `alt_text`, `caption`, and `copyright` as custom fields on the asset for accessibility and SEO compliance.',
    created_at: '2026-01-25T11:00:00.000Z',
    updated_at: '2026-03-03T15:00:00.000Z',
  },
];

/**
 * Get all documentation entries
 * @returns {Promise} Contentstack query response
 */
export const getAllDocumentation = async () => {
  const contentTypeUID = CONTENT_TYPES.DOCUMENTATION;

  try {
    console.log('Fetching entries for content type:', contentTypeUID);
    const Query = Stack.ContentType(contentTypeUID).Query();
    const result = await Query.toJSON().find();
    console.log('Raw result:', result);
    return result;
  } catch (error) {
    if (
      error.error_code === 118 ||
      (error.error_message && error.error_message.includes('not found'))
    ) {
      console.warn(
        `⚠️ Content type "${contentTypeUID}" not found in Contentstack. Using mock documentation data.`
      );
      return [MOCK_DOCUMENTATION_ENTRIES, MOCK_DOCUMENTATION_ENTRIES.length];
    }

    console.error('Error in getAllDocumentation:', {
      error_code: error.error_code,
      error_message: error.error_message,
      errors: error.errors,
      content_type: contentTypeUID,
    });
    throw error;
  }
};

/**
 * Get a single documentation entry by UID
 * @param {string} uid - Entry UID
 * @param {Object} options - Query options
 * @param {string} options.version - Filter by version
 * @returns {Promise} Contentstack entry
 */
export const getDocumentationByUid = async (uid, options = {}) => {
  try {
    const Query = Stack.ContentType(CONTENT_TYPES.DOCUMENTATION).Query();
    Query.where('uid', uid);
    Query.includeReference(['category', 'related_docs']);

    if (options.version) {
      Query.where('version', options.version);
    }

    const result = await Query.find();

    let entries = [];
    if (Array.isArray(result) && result.length > 0) {
      entries = result[0] || [];
    } else if (result && result.items) {
      entries = result.items;
    } else if (Array.isArray(result)) {
      entries = result;
    }

    if (entries.length > 0) {
      return entries[0];
    }

    return null;
  } catch (error) {
    if (
      error.error_code === 118 ||
      (error.error_message && error.error_message.includes('not found'))
    ) {
      console.warn(
        `⚠️ Content type not found in Contentstack. Falling back to mock data for uid: "${uid}"`
      );
      const mockEntry = MOCK_DOCUMENTATION_ENTRIES.find((e) => e.uid === uid);
      return mockEntry || MOCK_DOCUMENTATION_ENTRIES[0];
    }

    console.error('Error fetching documentation by UID:', error);
    throw error;
  }
};

/**
 * Render Contentstack Rich Text content
 * Contentstack Rich Text Editor returns HTML, not markdown
 * @param {string} content - Content from Contentstack
 * @returns {JSX.Element} Rendered content
 */
export const renderContentstackContent = (content) => {
  if (!content) {
    return <p>No content available.</p>;
  }

  // Check if content is HTML (from Rich Text Editor)
  if (typeof content === 'string' && (content.includes('<') || content.includes('&'))) {
    return (
      <div 
        className="contentstack-rich-text"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Otherwise treat as plain text or markdown
  return <div className="contentstack-text">{content}</div>;
};

/**
 * Format Contentstack date
 * @param {string} dateString - ISO date string from Contentstack
 * @returns {string} Formatted date
 */
export const formatContentstackDate = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Get entry URL from Contentstack entry
 * @param {Object} entry - Contentstack entry object
 * @returns {string} Entry URL
 */
export const getEntryUrl = (entry) => {
  if (entry.url) {
    return entry.url;
  }
  
  // Fallback: construct URL from UID
  return `/${entry.uid}`;
};

/**
 * Debug: Log Contentstack entry structure
 * @param {Object} entry - Contentstack entry
 * @param {string} label - Label for logging
 */
export const debugEntry = (entry, label = 'Entry') => {
  console.group(`🔍 ${label} Debug`);
  console.log('Full entry:', entry);
  console.log('UID:', entry?.uid);
  console.log('Title:', entry?.title);
  console.log('Content type:', entry?.content_type);
  console.log('Fields:', Object.keys(entry || {}));
  console.groupEnd();
};