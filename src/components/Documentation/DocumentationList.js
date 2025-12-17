import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Stack, { Query } from '../../config/contentstack';
import { getAllDocumentation } from '../../utils/contentstackHelpers';
import { trackContentView } from '../../services/analyticsService';
import { format } from 'date-fns';
import './DocumentationList.css';

const DocumentationList = ({ searchQuery = '' }) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');

  const fetchDocumentation = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use helper function to fetch documentation
      const result = await getAllDocumentation({
        category: selectedCategory,
        version: selectedVersion,
        searchQuery: searchQuery,
      });
      
      console.log('Documentation fetch result:', result);
      console.log('Number of entries:', result.count);
      console.log('Entries:', result.items);
      
      setDocs(result.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching documentation:', err);
      console.error('Error details:', {
        message: err.message,
        error_code: err.error_code,
        error_message: err.error_message,
        errors: err.errors,
        stack: err.stack,
      });
      
      // Handle specific Contentstack errors
      if (err.error_code === 109) {
        setError('Invalid Contentstack API Key. Please check your .env file and ensure REACT_APP_CONTENTSTACK_API_KEY is set correctly.');
      } else if (err.error_message && err.error_message.includes('api_key')) {
        setError('Contentstack API Key is not valid. Please verify your credentials in the .env file.');
      } else if (err.error_message) {
        setError(`Contentstack Error: ${err.error_message}`);
      } else {
        setError(`Failed to load documentation: ${err.message || 'Please check your Contentstack configuration and ensure entries are published.'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedVersion, searchQuery]);

  const fetchCategories = useCallback(async () => {
    try {
      const Query = Stack.ContentType('category').Query();
      Query.includeCount();
      const result = await Query.find();
      
      // Handle both response formats
      let categories = [];
      if (Array.isArray(result) && result.length > 0) {
        categories = result[0] || [];
      } else if (result && result.items) {
        categories = result.items;
      } else if (Array.isArray(result)) {
        categories = result;
      }
      
      setCategories(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchDocumentation();
    fetchCategories();
  }, [fetchDocumentation, fetchCategories]);

  const handleDocClick = (doc) => {
    trackContentView(doc.uid, 'documentation', {
      title: doc.title,
      category: doc.category?.title,
    });
  };

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <p>Loading documentation...</p>
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
    <div className="documentation-list">
      <div className="filters">
        <label htmlFor="category-filter">
          Category:
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.uid} value={cat.uid}>
                {cat.title}
              </option>
            ))}
          </select>
        </label>

        <label htmlFor="version-filter">
          Version:
          <select
            id="version-filter"
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            aria-label="Filter by version"
          >
            <option value="">All Versions</option>
            <option value="1.0">Version 1.0</option>
            <option value="2.0">Version 2.0</option>
            <option value="3.0">Version 3.0</option>
          </select>
        </label>
      </div>

      {docs.length === 0 ? (
        <div className="no-results">
          <p>No documentation found. Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="docs-grid" role="list">
          {docs.map((doc) => (
            <article
              key={doc.uid}
              className="doc-card"
              role="listitem"
            >
              <Link
                to={`/documentation/${doc.uid}`}
                onClick={() => handleDocClick(doc)}
                className="doc-link"
              >
                <h3 className="doc-title">{doc.title}</h3>
                {doc.description && (
                  <p className="doc-description">{doc.description}</p>
                )}
                <div className="doc-meta">
                  {doc.category && (
                    <span className="doc-category">{doc.category.title}</span>
                  )}
                  {doc.version && (
                    <span className="doc-version">v{doc.version}</span>
                  )}
                  {doc.updated_at && (
                    <time className="doc-date" dateTime={doc.updated_at}>
                      {format(new Date(doc.updated_at), 'MMM d, yyyy')}
                    </time>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentationList;

