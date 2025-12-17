import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Stack, { CONTENT_TYPES } from '../../config/contentstack';
import { getDocumentationByUid, renderContentstackContent, debugEntry } from '../../utils/contentstackHelpers';
import { trackContentView } from '../../services/analyticsService';
import { format } from 'date-fns';
import FeedbackForm from '../Feedback/FeedbackForm';
import './DocumentationViewer.css';

const DocumentationViewer = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [versions, setVersions] = useState([]);

  const fetchDocumentation = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use helper function to fetch documentation by UID
      const docData = await getDocumentationByUid(uid, { version: selectedVersion });
      
      console.log('Documentation fetch result:', docData);
      debugEntry(docData, 'Documentation Entry');
      
      if (docData) {
        setDoc(docData);
        
        // Track view
        trackContentView(docData.uid, 'documentation', {
          title: docData.title,
          version: docData.version,
        });

        // Fetch available versions - get all versions of this documentation
        try {
          const Query = Stack.ContentType(CONTENT_TYPES.DOCUMENTATION).Query();
          Query.where('title', docData.title);
          Query.only(['version', 'uid']);
          
          const versionsResult = await Query.find();
          
          // Handle both response formats
          let entries = [];
          if (Array.isArray(versionsResult) && versionsResult.length > 0) {
            entries = versionsResult[0] || [];
          } else if (versionsResult && versionsResult.items) {
            entries = versionsResult.items;
          } else if (Array.isArray(versionsResult)) {
            entries = versionsResult;
          }
          
          if (entries.length > 0) {
            const uniqueVersions = [...new Set(entries.map(item => item.version).filter(Boolean))];
            setVersions(uniqueVersions.length > 0 ? uniqueVersions : (docData.version ? [docData.version] : ['1.0']));
          } else {
            setVersions(docData.version ? [docData.version] : ['1.0']);
          }
        } catch (versionErr) {
          console.warn('Could not fetch versions:', versionErr);
          setVersions(docData.version ? [docData.version] : ['1.0']);
        }
      } else {
        setError(`Documentation with UID "${uid}" not found. Please ensure it is published in the production environment.`);
      }
    } catch (err) {
      console.error('Error fetching documentation:', err);
      console.error('Error details:', {
        message: err.message,
        error_code: err.error_code,
        error_message: err.error_message,
        errors: err.errors,
        stack: err.stack,
        uid: uid,
      });
      
      // Handle specific Contentstack errors
      if (err.error_code === 109) {
        setError('Invalid Contentstack API Key. Please check your .env file and ensure REACT_APP_CONTENTSTACK_API_KEY is set correctly.');
      } else if (err.error_message && err.error_message.includes('api_key')) {
        setError('Contentstack API Key is not valid. Please verify your credentials in the .env file.');
      } else if (err.error_message) {
        setError(`Contentstack Error: ${err.error_message}`);
      } else {
        setError(`Failed to load documentation: ${err.message || 'Please check your Contentstack configuration and ensure the entry is published.'}`);
      }
    } finally {
      setLoading(false);
    }
  }, [uid, selectedVersion]);

  useEffect(() => {
    fetchDocumentation();
  }, [fetchDocumentation]);

  const handleVersionChange = (version) => {
    setSelectedVersion(version);
  };

  if (loading) {
    return (
      <div className="loading-container" role="status" aria-live="polite">
        <p>Loading documentation...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="error-container" role="alert">
        <p>{error || 'Documentation not found'}</p>
        <button onClick={() => navigate('/documentation')} className="back-button">
          Back to Documentation
        </button>
      </div>
    );
  }

  return (
    <div className="documentation-viewer">
      <button
        onClick={() => navigate('/documentation')}
        className="back-button"
        aria-label="Back to documentation list"
      >
        ← Back
      </button>

      <article className="doc-content">
        <header className="doc-header">
          <h1 className="doc-title">{doc.title}</h1>
          
          <div className="doc-meta">
            {doc.category && (
              <span className="doc-category">{doc.category.title}</span>
            )}
            {doc.version && (
              <span className="doc-version">Version {doc.version}</span>
            )}
            {doc.updated_at && (
              <time className="doc-date" dateTime={doc.updated_at}>
                Last updated: {format(new Date(doc.updated_at), 'MMMM d, yyyy')}
              </time>
            )}
          </div>

          {versions.length > 1 && (
            <div className="version-selector">
              <label htmlFor="version-select">
                View version:
                <select
                  id="version-select"
                  value={selectedVersion || doc.version}
                  onChange={(e) => handleVersionChange(e.target.value)}
                  aria-label="Select documentation version"
                >
                  {versions.map((version) => (
                    <option key={version} value={version}>
                      Version {version}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </header>

        <div className="doc-body">
          {doc.content ? (
            typeof doc.content === 'string' && (doc.content.includes('<') || doc.content.includes('&lt;')) ? (
              // Contentstack Rich Text Editor returns HTML
              <div 
                className="markdown-content contentstack-rich-text"
                dangerouslySetInnerHTML={{ __html: doc.content }}
              />
            ) : (
              // Plain text or markdown content
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="markdown-content"
              >
                {doc.content}
              </ReactMarkdown>
            )
          ) : (
            <p>No content available for this documentation entry.</p>
          )}
        </div>

        {doc.related_docs && doc.related_docs.length > 0 && (
          <aside className="related-docs" aria-label="Related documentation">
            <h2>Related Documentation</h2>
            <ul>
              {doc.related_docs.map((relatedDoc) => (
                <li key={relatedDoc.uid}>
                  <a
                    href={`/documentation/${relatedDoc.uid}`}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(`/documentation/${relatedDoc.uid}`);
                    }}
                  >
                    {relatedDoc.title}
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </article>

      <div className="doc-feedback">
        <FeedbackForm
          contentUid={doc.uid}
          contentType="documentation"
          contentTitle={doc.title}
        />
      </div>
    </div>
  );
};

export default DocumentationViewer;

