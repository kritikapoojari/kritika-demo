import React, { useState, useEffect, useCallback } from 'react';
import { getAllFAQs, getAllCategories } from '../../utils/contentstackHelpers';
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
      // Only filter by category if categories are available
      const categoryFilter = (categories.length > 0 && selectedCategory) ? selectedCategory : undefined;
      const entries = await getAllFAQs({ category: categoryFilter });
      setFaqs(Array.isArray(entries) ? entries : []);
      setError(null);
    } catch (err) {
      console.error('Error fetching FAQs:', err);
      console.error('Error details:', {
        message: err.message,
        error_code: err.error_code,
        error_message: err.error_message,
        errors: err.errors
      });
      
      let errorMessage = 'Failed to load FAQs';
      if (err.error_code === 118) {
        // Format the helpful error message for display
        if (err.message && err.message.includes('To fix this:')) {
          errorMessage = err.message;
        } else {
          errorMessage = `Content Type '${err.content_type || 'faq'}' was not found.\n\n` +
            `To fix this:\n` +
            `1. Go to Contentstack → Content Types\n` +
            `2. Find your FAQ content type\n` +
            `3. Check the UID in the URL or settings\n` +
            `4. Add to .env file: REACT_APP_CONTENTSTACK_FAQ_UID=your_actual_uid\n` +
            `5. Restart your development server\n\n` +
            `Common UIDs to try: faqs, faq_entry, question, questions`;
        }
      } else if (err.error_message) {
        errorMessage = err.error_message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, categories.length]);

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
      const entries = await getAllCategories();
      setCategories(Array.isArray(entries) ? entries : []);
    } catch (err) {
      // Categories are optional - if there's an unexpected error, just set empty array
      console.warn('Could not load categories:', err.message || err);
      setCategories([]);
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
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error</h2>
        <div style={{ 
          whiteSpace: 'pre-line', 
          backgroundColor: '#fff5f5', 
          padding: '15px', 
          borderRadius: '4px',
          border: '1px solid #fed7d7',
          marginTop: '10px'
        }}>
          {error}
        </div>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Check the browser console for more details.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>FAQ Entries</h2>
      
      {/* Only show category filter if categories are available */}
      {categories.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="category-filter-faq" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontWeight: 500 }}>
            Category:
            <select
              id="category-filter-faq"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter FAQs by category"
              style={{
                padding: '0.5rem 1rem',
                border: '2px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                backgroundColor: 'white',
                cursor: 'pointer',
                maxWidth: '300px'
              }}
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
      )}

      {faqs.length === 0 ? (
        <p>No FAQs found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {faqs.map((faq) => (
            <div 
              key={faq.uid} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, transform 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              onClick={() => toggleFaq(faq.uid)}
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#2c3e50' }}>
                {faq.title || faq.question || 'Untitled FAQ'}
              </h3>
              
              {faq.single_line && (
                <p style={{ fontWeight: 'bold', marginBottom: '10px', color: '#2c3e50' }}>
                  {faq.single_line}
                </p>
              )}
              
              {faq.multi_line && (
                <p style={{ marginBottom: '10px', color: '#666', lineHeight: '1.5' }}>
                  {faq.multi_line}
                </p>
              )}
              
              {expandedFaq === faq.uid && faq.answer && (
                <div style={{ marginBottom: '10px', color: '#666', lineHeight: '1.5' }}>
                  <div dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </div>
              )}
              
              {faq.category && (
                <div style={{ marginBottom: '10px' }}>
                  <span style={{
                    backgroundColor: '#e8f4f8',
                    color: '#3498db',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}>
                    {typeof faq.category === 'object' && faq.category.title 
                      ? faq.category.title 
                      : typeof faq.category === 'string' 
                        ? faq.category 
                        : 'Category'}
                  </span>
                </div>
              )}
              
              {faq.tags && faq.tags.length > 0 && (
                <div style={{ marginBottom: '10px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {faq.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      style={{
                        backgroundColor: '#f0f0f0',
                        color: '#666',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.875rem'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FAQList;

