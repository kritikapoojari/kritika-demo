import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { universalSearch } from '../services/searchService';
import { trackSearch } from '../services/analyticsService';
import SearchBar from '../components/Search/SearchBar';
import './SearchResults.css';

const TRENDING_SEARCHES = [
  'getting started',
  'delivery token',
  'content type not found',
  'publish entry',
  'webhook retry',
  'modular blocks',
  'rich text editor',
  'environments',
  'image optimisation',
  'error 118',
  'graphql api',
  'live preview',
  'localization',
  'management token',
  'rate limits',
  'roles permissions',
  'asset management',
  'environment aliases',
];

const POPULAR_CONTENT = [
  {
    uid: 'blt_doc_getting_started',
    contentType: 'documentation',
    title: 'Getting Started with the Platform',
    description: 'Account setup, your first stack, configuring environments, and publishing your first entry.',
    category: 'Onboarding',
    views: 4821,
  },
  {
    uid: 'blt_faq_delivery_token',
    contentType: 'faq',
    title: 'What is a Delivery Token and where do I find it?',
    description: 'A read-only credential that authorises your app to fetch published content from a specific environment.',
    category: 'Authentication & Tokens',
    views: 3540,
  },
  {
    uid: 'blt_faq_content_type_118',
    contentType: 'faq',
    title: 'Error 118 — Content Type not found',
    description: 'Resolve the most common setup error: mismatched UIDs, unpublished entries, and wrong environments.',
    category: 'Errors & Troubleshooting',
    views: 3102,
  },
  {
    uid: 'blt_doc_webhooks',
    contentType: 'documentation',
    title: 'Webhooks & Event-Driven Workflows',
    description: 'Configure webhooks, verify payloads, handle retries, and integrate with CI/CD pipelines.',
    category: 'Integrations',
    views: 2870,
  },
  {
    uid: 'blt_doc_content_types',
    contentType: 'documentation',
    title: 'Designing Content Types',
    description: 'Field types, references, modular blocks, and global fields — with practical examples.',
    category: 'Content Modelling',
    views: 2644,
  },
  {
    uid: 'blt_faq_publish_entry',
    contentType: 'faq',
    title: 'Why is my entry not showing up in the app?',
    description: 'Saving creates a draft. Learn how to publish to an environment so content reaches your app.',
    category: 'Content Management',
    views: 2391,
  },
  {
    uid: 'blt_doc_rich_text',
    contentType: 'documentation',
    title: 'Working with the Rich Text Editor',
    description: 'Parse, render, and extend Contentstack JSON RTE output in React.',
    category: 'Development',
    views: 2105,
  },
  {
    uid: 'blt_faq_modular_blocks',
    contentType: 'faq',
    title: 'How do I render Modular Blocks in React?',
    description: 'Each block object has a single key matching the block type — here is the pattern to follow.',
    category: 'Development',
    views: 1988,
  },
  {
    uid: 'blt_doc_localization',
    contentType: 'documentation',
    title: 'Localisation & Multi-language Content',
    description: 'Set up locales, create localised entries, and fall back gracefully to the master locale.',
    category: 'Internationalisation',
    views: 1754,
  },
  {
    uid: 'blt_doc_roles_permissions',
    contentType: 'documentation',
    title: 'Roles & Permissions',
    description: 'Built-in roles, custom roles, branch-level permissions, and token scoping.',
    category: 'Security',
    views: 1623,
  },
  {
    uid: 'blt_faq_graphql',
    contentType: 'faq',
    title: 'Does Contentstack support GraphQL?',
    description: 'Yes — send queries to the GraphQL endpoint with pagination, filtering, and introspection.',
    category: 'Development',
    views: 1540,
  },
  {
    uid: 'blt_doc_live_preview',
    contentType: 'documentation',
    title: 'Live Preview & Visual Builder',
    description: 'See content changes in real time before publishing with a click-to-edit overlay.',
    category: 'Editor Experience',
    views: 1412,
  },
  {
    uid: 'blt_faq_management_token',
    contentType: 'faq',
    title: 'Management Token vs Delivery Token',
    description: 'Delivery tokens are read-only and client-safe. Management tokens are write-capable and server-only.',
    category: 'Authentication & Tokens',
    views: 1380,
  },
  {
    uid: 'blt_doc_assets',
    contentType: 'documentation',
    title: 'Asset Management & Image Delivery',
    description: 'Upload, organise, and serve optimised assets via the global CDN with real-time transforms.',
    category: 'Assets & Media',
    views: 1295,
  },
  {
    uid: 'blt_faq_rate_limits',
    contentType: 'faq',
    title: 'Are there rate limits on the Delivery API?',
    description: '10 req/s on REST, 3 req/s on GraphQL. Use CDN and client-side caching to stay within limits.',
    category: 'Errors & Troubleshooting',
    views: 1187,
  },
];

const MAX_RECENT = 8;

const getRecentSearches = () => {
  try {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]');
  } catch {
    return [];
  }
};

const saveRecentSearch = (term) => {
  try {
    const existing = getRecentSearches().filter((t) => t.toLowerCase() !== term.toLowerCase());
    const updated = [term, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  } catch {
    // ignore
  }
};

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentSearches, setRecentSearches] = useState(getRecentSearches);

  const performSearch = useCallback(async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await universalSearch(searchQuery);
      setResults(searchResults);
      trackSearch(searchQuery, searchResults.length);
      saveRecentSearch(searchQuery);
      setRecentSearches(getRecentSearches());
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setResults([]);
    }
  }, [query, performSearch]);

  const handleSearchResults = (newResults) => {
    setResults(newResults);
  };

  const handleChipClick = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  const clearRecentSearches = () => {
    localStorage.removeItem('recentSearches');
    setRecentSearches([]);
  };

  const getContentTypeLabel = (contentType) =>
    contentType === 'documentation' ? 'Documentation' : 'FAQ';

  const getContentTypePath = (contentType, uid) =>
    contentType === 'documentation' ? `/documentation/${uid}` : `/faqs#${uid}`;

  const formatViews = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n);

  const showDiscovery = !query && !loading;

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h1>Search</h1>
        <div className="search-bar-container">
          <SearchBar
            onResults={handleSearchResults}
            placeholder="Search documentation and FAQs…"
          />
        </div>
      </div>

      {loading && (
        <div className="loading-container" role="status" aria-live="polite">
          <p>Searching…</p>
        </div>
      )}

      {error && (
        <div className="error-container" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && query && (
        <>
          <div className="search-info">
            <p>
              Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "
              <strong>{query}</strong>"
            </p>
          </div>

          {results.length === 0 && (
            <div className="no-results">
              <p>No results found for "{query}".</p>
              <p>Try different keywords or browse the suggestions below.</p>
              <div className="no-results-chips">
                {TRENDING_SEARCHES.slice(0, 5).map((term) => (
                  <button
                    key={term}
                    className="chip chip--outline"
                    onClick={() => handleChipClick(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="results-list" role="list">
              {results.map((result, index) => (
                <article
                  key={`${result.contentType}-${result.uid}-${index}`}
                  className="result-item"
                  role="listitem"
                >
                  <div className="result-header">
                    <span className="result-type">
                      {getContentTypeLabel(result.contentType)}
                    </span>
                    {result.category && (
                      <span className="result-category">
                        {typeof result.category === 'object'
                          ? result.category.title
                          : result.category}
                      </span>
                    )}
                  </div>
                  <h2 className="result-title">
                    <Link
                      to={getContentTypePath(result.contentType, result.uid)}
                      className="result-link"
                    >
                      {result.title || result.question}
                    </Link>
                  </h2>
                  {(result.description || result.multi_line) && (
                    <p className="result-description">
                      {result.description || result.multi_line}
                    </p>
                  )}
                  {result.version && (
                    <span className="result-version">Version {result.version}</span>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Discovery state: shown when no active query ── */}
      {showDiscovery && (
        <div className="search-discovery">

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <section className="discovery-section" aria-label="Recent searches">
              <div className="discovery-section-header">
                <h2 className="discovery-heading">
                  <span className="discovery-icon">🕐</span> Recent Searches
                </h2>
                <button
                  className="discovery-clear-btn"
                  onClick={clearRecentSearches}
                  aria-label="Clear recent searches"
                >
                  Clear
                </button>
              </div>
              <div className="chips-row">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    className="chip chip--recent"
                    onClick={() => handleChipClick(term)}
                  >
                    <span className="chip-icon">↩</span> {term}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Trending searches */}
          <section className="discovery-section" aria-label="Trending searches">
            <h2 className="discovery-heading">
              <span className="discovery-icon">🔥</span> Trending Searches
            </h2>
            <div className="chips-row">
              {TRENDING_SEARCHES.map((term) => (
                <button
                  key={term}
                  className="chip chip--trending"
                  onClick={() => handleChipClick(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </section>

          {/* Popular content */}
          <section className="discovery-section" aria-label="Popular content">
            <h2 className="discovery-heading">
              <span className="discovery-icon">⭐</span> Most Visited
            </h2>
            <div className="popular-grid">
              {POPULAR_CONTENT.map((item) => (
                <Link
                  key={item.uid}
                  to={getContentTypePath(item.contentType, item.uid)}
                  className="popular-card"
                >
                  <div className="popular-card-top">
                    <span
                      className={`popular-type-badge popular-type-badge--${item.contentType}`}
                    >
                      {getContentTypeLabel(item.contentType)}
                    </span>
                    <span className="popular-views">
                      {formatViews(item.views)} views
                    </span>
                  </div>
                  <h3 className="popular-card-title">{item.title}</h3>
                  <p className="popular-card-desc">{item.description}</p>
                  <span className="popular-card-category">{item.category}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default SearchResults;

