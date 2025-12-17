import React, { useState, useEffect, useCallback } from 'react';
import Stack, { Query } from '../../config/contentstack';
import { searchFAQs } from '../../services/searchService';
import { trackContentView } from '../../services/analyticsService';
import { format } from 'date-fns';
import './FAQList.css';

const FAQList = ({ searchQuery = '' }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const fetchFAQs = useCallback(async () => {
    try {
      setLoading(true);
      const query = Query.faq()
        .includeCount()
        .includeReference(['category'])
        .toJSON();

      if (selectedCategory) {
        query.query.category = { $in_query: { uid: selectedCategory } };
      }

      const result = await Stack.ContentType('faq').Query(query.query).find();
      setFaqs(result.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      setError('Failed to load FAQs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const handleSearch = useCallback(async (query) => {
    try {
      setLoading(true);
      const result = await searchFAQs(query, { category: selectedCategory });
      setFaqs(result.items || []);
      setError(null);
    } catch (err) {
      console.error('Error searching FAQs:', err);
      setError('Failed to search FAQs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const result = await Query.category().includeCount().find();
      setCategories(result.items || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch(searchQuery);
    } else {
      fetchFAQs();
    }
    fetchCategories();
  }, [selectedCategory, searchQuery, fetchFAQs, handleSearch, fetchCategories]);

  const toggleFaq = (faqUid) => {
    if (expandedFaq === faqUid) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(faqUid);
      trackContentView(faqUid, 'faq');
    }
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
                <span className="faq-toggle" aria-hidden="true">
                  {expandedFaq === faq.uid ? '−' : '+'}
                </span>
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

