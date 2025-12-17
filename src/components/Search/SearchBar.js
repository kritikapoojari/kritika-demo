import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { universalSearch } from '../../services/searchService';
import { trackSearch } from '../../services/analyticsService';
import './SearchBar.css';

const SearchBar = ({ onResults, placeholder = 'Search documentation and FAQs...' }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      onResults?.([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await universalSearch(searchQuery);
      onResults?.(results);
      trackSearch(searchQuery, results.length);
    } catch (error) {
      console.error('Search error:', error);
      onResults?.([]);
    } finally {
      setIsSearching(false);
    }
  }, [onResults]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounced search (optional - for real-time search)
    if (value.trim().length >= 3) {
      const timeoutId = setTimeout(() => {
        handleSearch(value);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <div className="search-input-wrapper">
        <input
          id="search-input"
          type="search"
          className="search-input"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          aria-label="Search documentation and FAQs"
          aria-describedby="search-description"
        />
        <button
          type="submit"
          className="search-button"
          aria-label="Submit search"
          disabled={isSearching}
        >
          {isSearching ? (
            <span className="search-spinner" aria-hidden="true">⏳</span>
          ) : (
            <span aria-hidden="true">🔍</span>
          )}
        </button>
      </div>
      <span id="search-description" className="sr-only">
        Search through documentation and frequently asked questions
      </span>
    </form>
  );
};

export default SearchBar;

