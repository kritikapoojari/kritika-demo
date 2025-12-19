import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { universalSearch } from '../services/searchService';
import { trackSearch } from '../services/analyticsService';
import SearchBar from '../components/Search/SearchBar';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    setError(null);
    try {
      const searchResults = await universalSearch(searchQuery);
      setResults(searchResults);
      trackSearch(searchQuery, searchResults.length);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResults = (newResults) => {
    setResults(newResults);
  };

  const getContentTypeLabel = (contentType) => {
    return contentType === 'documentation' ? 'Documentation' : 'FAQ';
  };

  const getContentTypePath = (contentType, uid) => {
    return contentType === 'documentation' 
      ? `/documentation/${uid}` 
      : `/faqs#${uid}`;
  };

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h1>Search Results</h1>
        <div className="search-bar-container">
          <SearchBar 
            onResults={handleSearchResults}
            placeholder="Search documentation and FAQs..."
          />
        </div>
      </div>

      {loading && (
        <div className="loading-container" role="status" aria-live="polite">
          <p>Searching...</p>
        </div>
      )}

      {error && (
        <div className="error-container" role="alert">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {query && (
            <div className="search-info">
              <p>
                Found <strong>{results.length}</strong> result{results.length !== 1 ? 's' : ''} for "
                <strong>{query}</strong>"
              </p>
            </div>
          )}

          {results.length === 0 && query && (
            <div className="no-results">
              <p>No results found for "{query}".</p>
              <p>Try different keywords or browse our documentation and FAQs.</p>
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
                        {result.category.title}
                      </span>
                    )}
                  </div>
                  <h2 className="result-title">
                    <Link
                      to={getContentTypePath(result.contentType, result.uid)}
                      className="result-link"
                    >
                      {result.title || result.question || result.single_line || 'Untitled'}
                    </Link>
                  </h2>
                  {result.single_line && (
                    <p className="result-description" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      {result.single_line}
                    </p>
                  )}
                  {result.multi_line && (
                    <p className="result-description">{result.multi_line}</p>
                  )}
                  {result.description && (
                    <p className="result-description">{result.description}</p>
                  )}
                  {result.answer && (
                    <div
                      className="result-answer"
                      dangerouslySetInnerHTML={{ __html: result.answer }}
                    />
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
    </div>
  );
};

export default SearchResults;

