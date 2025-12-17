import React, { useState, useEffect } from 'react';
import { getAllDocumentation } from '../../utils/contentstackHelpers';
const DocumentationList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const entries = await getAllDocumentation();
        console.log('Contentstack response:', entries);
        
        setEntries(Array.isArray(entries) ? entries : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching entries:', err);
        console.error('Error details:', {
          message: err.message,
          error_code: err.error_code,
          error_message: err.error_message,
          errors: err.errors
        });
        
        let errorMessage = 'Failed to load entries';
        if (err.error_code === 118) {
          errorMessage = `Content Type '${err.content_type || 'documentation'}' not found. Please check your Contentstack configuration.`;
        } else if (err.error_message) {
          errorMessage = err.error_message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);
  if (loading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
          Check the browser console for more details.
        </p>
      </div>
    );
  }
  return (
    <div style={{ padding: '20px' }}>
      <h2>Documentation Entries</h2>
      {entries.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {entries.map((entry) => (
            <div 
              key={entry.uid} 
              style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: '10px' }}>
                {entry.title || entry.single_line || 'Untitled'}
              </h3>
              
              {entry.single_line && (
                <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                  {entry.single_line}
                </p>
              )}
              
              {entry.multi_line && (
                <p style={{ marginBottom: '10px', color: '#666' }}>
                  {entry.multi_line}
                </p>
              )}
              
              {entry.file && entry.file.url && (
                <div style={{ marginBottom: '10px' }}>
                  <img 
                    src={entry.file.url} 
                    alt={entry.file.title || 'Document image'}
                    style={{ maxWidth: '300px', height: 'auto', borderRadius: '4px' }}
                  />
                </div>
              )}
              
              {entry.link && entry.link.href && (
                <div style={{ marginBottom: '10px' }}>
                  <a 
                    href={entry.link.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#0066cc', textDecoration: 'none' }}
                  >
                    {entry.link.title || entry.link.href}
                  </a>
                </div>
              )}
              
              <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                <div>UID: {entry.uid}</div>
                {entry.created_at && (
                  <div>Created: {new Date(entry.created_at).toLocaleString()}</div>
                )}
                {entry.updated_at && (
                  <div>Updated: {new Date(entry.updated_at).toLocaleString()}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default DocumentationList;
