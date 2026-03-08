import React, { useState, useEffect, useCallback } from 'react';
import Stack, { CONTENT_TYPES } from '../../config/contentstack';
import { trackContentView } from '../../services/analyticsService';
import { format } from 'date-fns';
import FeedbackForm from '../Feedback/FeedbackForm';
import { getUserRole, ROLES, hasPermission } from '../../config/roles';
import './FAQList.css';

const MOCK_FAQS = [
  {
    uid: 'blt_faq_delivery_token',
    question: 'What is a Delivery Token and where do I find it?',
    answer:
      '<p>A <strong>Delivery Token</strong> is a read-only credential that authorises your app to fetch published content from a specific environment. To find yours:</p><ol><li>Go to <strong>Settings → Tokens → Delivery Tokens</strong></li><li>Select the environment (e.g., <em>production</em>)</li><li>Copy the token and add it to your <code>.env</code> file as <code>REACT_APP_CONTENTSTACK_DELIVERY_TOKEN</code></li></ol><p><strong>Note for EU region:</strong> Ensure your stack is initialised with <code>region: Contentstack.Region.EU</code>, otherwise requests will be routed to the US endpoint and return 401 errors.</p>',
    category: { uid: 'blt_cat_auth', title: 'Authentication & Tokens' },
    tags: ['delivery token', 'authentication', 'eu region', 'credentials'],
    updated_at: '2026-03-01T10:00:00.000Z',
  },
  {
    uid: 'blt_faq_content_type_118',
    question: 'I am getting error code 118 — Content Type not found. What does this mean?',
    answer:
      '<p>Error <strong>118</strong> means the content type UID you are querying does not exist in your stack, or the entry has not been published to the environment you are targeting.</p><p>Steps to resolve:</p><ul><li>Go to <strong>Content Types</strong> in Contentstack and verify the exact UID (it is case-sensitive)</li><li>Set the correct UID in your <code>.env</code> file, e.g. <code>REACT_APP_CONTENTSTACK_DOCUMENTATION_UID=my_docs</code></li><li>Confirm the entry is published to the <code>production</code> environment</li></ul>',
    category: { uid: 'blt_cat_errors', title: 'Errors & Troubleshooting' },
    tags: ['error 118', 'content type', 'not found', 'debugging'],
    updated_at: '2026-02-25T14:30:00.000Z',
  },
  {
    uid: 'blt_faq_publish_entry',
    question: 'Why is my entry not showing up in the app even though I saved it?',
    answer:
      '<p>Saving an entry in Contentstack creates a <em>draft</em>. To make it available via the Delivery API, you must <strong>publish</strong> it to an environment.</p><p>To publish:</p><ol><li>Open the entry</li><li>Click the <strong>Publish</strong> button in the top-right corner</li><li>Select the environment (e.g., <em>production</em>) and locale</li><li>Click <strong>Publish</strong> to confirm</li></ol><p>The entry will appear in your app within a few seconds.</p>',
    category: { uid: 'blt_cat_content', title: 'Content Management' },
    tags: ['publish', 'draft', 'entry', 'environment'],
    updated_at: '2026-02-18T09:00:00.000Z',
  },
  {
    uid: 'blt_faq_webhook_retry',
    question: 'My webhook endpoint missed some events. Will Contentstack retry them?',
    answer:
      '<p>Yes. If your endpoint returns a non-2xx HTTP status, Contentstack retries the webhook with <strong>exponential backoff</strong>:</p><ul><li>1 minute after first failure</li><li>5 minutes after second failure</li><li>30 minutes, then 2 hours, then 8 hours</li></ul><p>After 5 failed attempts the webhook is marked as <em>failed</em> and no further retries are made. You can manually re-trigger failed deliveries from <strong>Settings → Webhooks → Logs</strong>.</p>',
    category: { uid: 'blt_cat_integrations', title: 'Integrations & Webhooks' },
    tags: ['webhook', 'retry', 'failed delivery', 'logs'],
    updated_at: '2026-03-02T11:15:00.000Z',
  },
  {
    uid: 'blt_faq_modular_blocks',
    question: 'How do I render Modular Blocks in React?',
    answer:
      '<p>Modular Blocks are returned as an array of objects. Each object has a single key matching the block type, containing the block\'s fields.</p><pre><code>entry.sections.map((block) => {\n  const type = Object.keys(block)[0];\n  const data = block[type];\n  if (type === \'hero\') return &lt;Hero key={data.uid} {...data} /&gt;;\n  if (type === \'text_section\') return &lt;TextSection key={data.uid} {...data} /&gt;;\n  return null;\n});</code></pre><p>This pattern keeps your renderer flexible — add a new block type in Contentstack and handle it here without changing any other code.</p>',
    category: { uid: 'blt_cat_development', title: 'Development' },
    tags: ['modular blocks', 'react', 'rendering', 'components'],
    updated_at: '2026-02-28T16:45:00.000Z',
  },
  {
    uid: 'blt_faq_image_optimisation',
    question: 'Can I resize or optimise images served from Contentstack\'s CDN?',
    answer:
      '<p>Yes — Contentstack uses <strong>Image Delivery API</strong> parameters appended to asset URLs. Common transforms:</p><ul><li><code>?width=800</code> — resize to 800 px wide</li><li><code>?format=webp</code> — convert to WebP</li><li><code>?quality=75</code> — set JPEG/WebP quality</li><li><code>?auto=webp</code> — serve WebP automatically when the browser supports it</li></ul><p>Combine them: <code>https://images.contentstack.io/v3/assets/.../photo.jpg?width=800&amp;format=webp&amp;quality=80</code></p>',
    category: { uid: 'blt_cat_assets', title: 'Assets & Media' },
    tags: ['images', 'cdn', 'optimisation', 'webp', 'resize'],
    updated_at: '2026-03-04T08:00:00.000Z',
  },
  {
    uid: 'blt_faq_graphql',
    question: 'Does Contentstack support GraphQL?',
    answer:
      '<p>Yes. Contentstack provides a <strong>GraphQL Content Delivery API</strong> alongside the REST API. Send POST requests to:</p><pre><code>https://graphql.contentstack.com/stacks/&lt;API_KEY&gt;?environment=production</code></pre><p>A sample query:</p><pre><code>query {\n  all_documentation {\n    items { title version updated_at }\n  }\n}</code></pre><p>Use the <code>skip</code> and <code>limit</code> arguments for pagination. Introspect your schema with <code>{ __schema { types { name } } }</code>.</p>',
    category: { uid: 'blt_cat_development', title: 'Development' },
    tags: ['graphql', 'api', 'query', 'pagination'],
    updated_at: '2026-03-06T09:00:00.000Z',
  },
  {
    uid: 'blt_faq_live_preview',
    question: 'How do I set up Live Preview in my React app?',
    answer:
      '<p>Install the SDK and initialise it in your app root:</p><pre><code>npm install @contentstack/live-preview-utils\n\nimport ContentstackLivePreview from "@contentstack/live-preview-utils";\nContentstackLivePreview.init({\n  stackDetails: { apiKey: "...", environment: "production" }\n});</code></pre><p>Then add <code>data-cslp</code> attributes (generated by the SDK) to each editable DOM element. Editors will see a click-to-edit overlay when viewing your app inside Contentstack.</p>',
    category: { uid: 'blt_cat_development', title: 'Development' },
    tags: ['live preview', 'visual builder', 'react', 'editor experience'],
    updated_at: '2026-03-05T14:00:00.000Z',
  },
  {
    uid: 'blt_faq_locales',
    question: 'How do I fetch content in a specific language?',
    answer:
      '<p>Pass the <code>.language()</code> method to your query before calling <code>.find()</code>:</p><pre><code>Stack.ContentType("article")\n  .Query()\n  .language("fr-fr")\n  .toJSON()\n  .find()</code></pre><p>If a field has not been localised, Contentstack automatically falls back to the <strong>master locale</strong> value — no extra handling needed in your code.</p><p>To set up a new locale go to <strong>Settings → Locales → + Add Locale</strong> and choose a fallback locale.</p>',
    category: { uid: 'blt_cat_content', title: 'Content Management' },
    tags: ['localization', 'locale', 'multilingual', 'fallback'],
    updated_at: '2026-03-03T11:00:00.000Z',
  },
  {
    uid: 'blt_faq_management_token',
    question: 'What is the difference between a Management Token and a Delivery Token?',
    answer:
      '<p><strong>Delivery Token</strong> — read-only, environment-scoped. Used in frontend apps to fetch <em>published</em> content. Safe to embed in client-side code.</p><p><strong>Management Token</strong> — read/write, stack-scoped. Used server-side to create, update, or delete entries via the Management API. <strong>Never expose this in browser code.</strong></p><p>To create a Management Token go to <strong>Settings → Tokens → Management Tokens → + New Token</strong> and assign the minimum required role.</p>',
    category: { uid: 'blt_cat_auth', title: 'Authentication & Tokens' },
    tags: ['management token', 'delivery token', 'api', 'security'],
    updated_at: '2026-03-04T16:00:00.000Z',
  },
  {
    uid: 'blt_faq_rate_limits',
    question: 'Are there rate limits on the Delivery API?',
    answer:
      '<p>Yes. The default limits per stack are:</p><ul><li><strong>10 requests/second</strong> on the REST Delivery API</li><li><strong>3 requests/second</strong> on the GraphQL API</li></ul><p>If you exceed these limits you will receive a <code>429 Too Many Requests</code> response. Best practices:</p><ul><li>Use <strong>CDN caching</strong> — responses are cached at the edge for up to 60 seconds by default</li><li>Implement <strong>client-side caching</strong> with SWR or React Query</li><li>Contact Contentstack support to request a rate limit increase for high-traffic stacks</li></ul>',
    category: { uid: 'blt_cat_errors', title: 'Errors & Troubleshooting' },
    tags: ['rate limit', '429', 'performance', 'caching'],
    updated_at: '2026-03-07T09:00:00.000Z',
  },
];

const FAQList = ({ searchQuery = '' }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');

  const userRole = getUserRole();
  const canWrite = hasPermission(userRole, 'faq', 'write');
  const canDelete = hasPermission(userRole, 'faq', 'delete');

  const categories = [
    ...new Map(
      MOCK_FAQS.filter((f) => f.category).map((f) => [f.category.uid, f.category])
    ).values(),
  ];

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);

      const Query = Stack.ContentType(CONTENT_TYPES.FAQ).Query();
      Query.includeReference(['category']);

      if (selectedCategory) {
        Query.where('category.uid', selectedCategory);
      }

      const result = await Query.toJSON().find();

      // Contentstack SDK v3 returns [[entries], count]
      const entries =
        Array.isArray(result) && result.length > 0
          ? Array.isArray(result[0])
            ? result[0]
            : result
          : [];

      setFaqs(entries);
      setError(null);
    } catch (err) {
      console.warn('Contentstack FAQ query failed, using mock data:', err.message);

      const filtered = selectedCategory
        ? MOCK_FAQS.filter((f) => f.category?.uid === selectedCategory)
        : MOCK_FAQS;
      setFaqs(filtered);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const handleSearch = useCallback(
    (query) => {
      const lower = query.toLowerCase();
      const filtered = MOCK_FAQS.filter(
        (f) =>
          f.question.toLowerCase().includes(lower) ||
          (f.answer && f.answer.toLowerCase().includes(lower)) ||
          (f.tags && f.tags.some((t) => t.toLowerCase().includes(lower)))
      );
      setFaqs(
        selectedCategory ? filtered.filter((f) => f.category?.uid === selectedCategory) : filtered
      );
    },
    [selectedCategory]
  );

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
      setLoading(false);
    } else {
      fetchFAQs();
    }
  }, [selectedCategory, searchQuery, fetchFAQs, handleSearch]);

  const toggleFaq = (faqUid) => {
    setExpandedFaq((prev) => (prev === faqUid ? null : faqUid));
    trackContentView(faqUid, 'faq');
  };

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <p>Loading FAQs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="faq-list">
      {/* Role access notice */}
      {userRole === ROLES.GUEST && (
        <div style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#64748b' }}>
          👤 <strong>Guest</strong> — Read-only access. Sign in to submit feedback on FAQs.
        </div>
      )}
      {userRole === ROLES.VIEWER && (
        <div style={{ background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#0891b2' }}>
          👁️ <strong>Viewer</strong> — You can read FAQs and submit feedback.
        </div>
      )}
      {userRole === ROLES.EDITOR && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#059669' }}>
          ✏️ <strong>Editor</strong> — You can read and edit FAQs.
        </div>
      )}
      {userRole === ROLES.ADMIN && (
        <div style={{ background: '#fdf2f8', border: '1px solid #f9a8d4', borderRadius: '6px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#db2777' }}>
          🛡️ <strong>Admin</strong> — Full access: read, edit, and delete FAQs.
        </div>
      )}

      <div className="filters">
        <label htmlFor="category-filter-faq">
          Category:
          <select
            id="category-filter-faq"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter FAQs by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.uid} value={cat.uid}>
                {cat.title}
              </option>
            ))}
          </select>
        </label>
        {canWrite && (
          <button
            style={{ marginLeft: 'auto', padding: '7px 16px', background: '#0891b2', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
            onClick={() => alert('Add new FAQ (Editor/Admin only)')}
          >
            + New FAQ
          </button>
        )}
      </div>

      {faqs.length === 0 ? (
        <div className="no-results">
          <p>No FAQs found. Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="faqs-container" role="list">
          {faqs.map((faq) => (
            <article
              key={faq.uid}
              className={`faq-item ${expandedFaq === faq.uid ? 'expanded' : ''}`}
              role="listitem"
            >
              <button
                className="faq-question"
                onClick={() => toggleFaq(faq.uid)}
                aria-expanded={expandedFaq === faq.uid}
                aria-controls={`faq-answer-${faq.uid}`}
              >
                <h3 className="faq-question-text">{faq.question}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {canWrite && (
                    <span
                      onClick={(e) => { e.stopPropagation(); alert(`Edit FAQ: ${faq.question}`); }}
                      style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '700', background: '#ecfdf5', color: '#059669', borderRadius: '4px', border: '1px solid #6ee7b7' }}
                    >✏️ Edit</span>
                  )}
                  {canDelete && (
                    <span
                      onClick={(e) => { e.stopPropagation(); alert(`Delete FAQ: ${faq.question}`); }}
                      style={{ padding: '2px 8px', fontSize: '11px', fontWeight: '700', background: '#fef2f2', color: '#dc2626', borderRadius: '4px', border: '1px solid #fca5a5', cursor: 'pointer' }}
                    >🗑 Delete</span>
                  )}
                  <span className="faq-toggle" aria-hidden="true">
                    {expandedFaq === faq.uid ? '−' : '+'}
                  </span>
                </div>
              </button>

              {expandedFaq === faq.uid && (
                <div
                  id={`faq-answer-${faq.uid}`}
                  className="faq-answer"
                  role="region"
                  aria-labelledby={`faq-question-${faq.uid}`}
                >
                  <div className="faq-answer-content">
                    {faq.answer ? (
                      <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                    ) : (
                      <p>No answer available.</p>
                    )}
                  </div>

                  <div className="faq-meta">
                    {faq.category && (
                      <span className="faq-category">{faq.category.title}</span>
                    )}
                    {faq.tags && faq.tags.length > 0 && (
                      <div className="faq-tags">
                        {faq.tags.map((tag, index) => (
                          <span key={index} className="faq-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {faq.updated_at && (
                      <time className="faq-date" dateTime={faq.updated_at}>
                        Updated: {format(new Date(faq.updated_at), 'MMM d, yyyy')}
                      </time>
                    )}
                  </div>

                  {userRole !== ROLES.GUEST && (
                    <FeedbackForm
                      contentUid={faq.uid}
                      contentType="faq"
                      contentTitle={faq.question}
                    />
                  )}
                  {userRole === ROLES.GUEST && (
                    <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '12px', fontStyle: 'italic' }}>
                      Sign in to submit feedback on this FAQ.
                    </p>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQList;

