import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDocumentation } from '../../utils/contentstackHelpers';
import { getUserRole, ROLES, hasPermission } from '../../config/roles';

const DocumentationList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userRole = getUserRole();
  const canWrite = hasPermission(userRole, 'documentation', 'write');
  const canDelete = hasPermission(userRole, 'documentation', 'delete');

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const result = await getAllDocumentation();
        console.log('Contentstack response:', result);

        const entriesArray =
          Array.isArray(result) && result.length > 0
            ? Array.isArray(result[0])
              ? result[0]
              : result
            : [];

        setEntries(entriesArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching entries:', err);

        let errorMessage = 'Failed to load entries';
        if (err.error_message) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Documentation</h2>
        {canWrite && (
          <button
            style={{
              padding: '8px 18px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
            }}
            onClick={() => alert('Create new documentation entry (Admin/Editor only)')}
          >
            + New Article
          </button>
        )}
      </div>

      {/* Role access notice */}
      {userRole === ROLES.GUEST && (
        <div style={{
          background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px',
          padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#64748b',
        }}>
          👤 You are browsing as a <strong>Guest</strong>. Sign in to submit feedback on articles.
        </div>
      )}
      {userRole === ROLES.VIEWER && (
        <div style={{
          background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '6px',
          padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#0891b2',
        }}>
          👁️ <strong>Viewer</strong> — Read-only access. You can submit feedback on articles.
        </div>
      )}
      {userRole === ROLES.EDITOR && (
        <div style={{
          background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '6px',
          padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#059669',
        }}>
          ✏️ <strong>Editor</strong> — You can read and edit articles.
        </div>
      )}
      {userRole === ROLES.ADMIN && (
        <div style={{
          background: '#fdf2f8', border: '1px solid #f9a8d4', borderRadius: '6px',
          padding: '10px 14px', marginBottom: '16px', fontSize: '13px', color: '#db2777',
        }}>
          🛡️ <strong>Admin</strong> — Full access: read, edit, and delete articles.
        </div>
      )}

      {entries.length === 0 ? (
        <p>No entries found.</p>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {entries.map((entry) => (
            <div
              key={entry.uid}
              onClick={() => navigate(`/documentation/${entry.uid}`)}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '10px', flex: 1 }}>
                  {entry.title || entry.single_line || 'Untitled'}
                </h3>
                {canWrite && (
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                    <span style={{
                      padding: '3px 10px', fontSize: '11px', fontWeight: '700',
                      background: '#ecfdf5', color: '#059669', borderRadius: '4px', border: '1px solid #6ee7b7',
                    }}>✏️ Edit</span>
                    {canDelete && (
                      <span style={{
                        padding: '3px 10px', fontSize: '11px', fontWeight: '700',
                        background: '#fef2f2', color: '#dc2626', borderRadius: '4px', border: '1px solid #fca5a5',
                        cursor: 'pointer',
                      }}>🗑 Delete</span>
                    )}
                  </div>
                )}
              </div>

              {entry.single_line && entry.title !== entry.single_line && (
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
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: '#0066cc', textDecoration: 'none' }}
                  >
                    {entry.link.title || entry.link.href}
                  </a>
                </div>
              )}

              <div style={{ marginTop: '14px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/documentation/${entry.uid}`);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#6366f1',
                    background: 'transparent',
                    border: '1.5px solid #6366f1',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background 0.18s, color 0.18s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#6366f1';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6366f1';
                  }}
                >
                  Read more →
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentationList;