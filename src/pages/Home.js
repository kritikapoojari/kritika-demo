import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/Search/SearchBar';
import { getUserRole, ROLES, hasPermission } from '../config/roles';
import './Home.css';

const ALL_FEATURES = [
  {
    icon: '📚',
    title: 'Documentation',
    description:
      'Browse comprehensive, versioned documentation covering all aspects of our platform and services.',
    to: '/documentation',
    cta: 'Explore Docs',
    accent: '#6366f1',
    roles: [ROLES.GUEST, ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
  },
  {
    icon: '❓',
    title: 'FAQs',
    description:
      'Find quick answers to frequently asked questions. Search by topic, category, or keyword.',
    to: '/faqs',
    cta: 'Browse FAQs',
    accent: '#0891b2',
    roles: [ROLES.GUEST, ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
  },
  {
    icon: '🔍',
    title: 'Search',
    description:
      'Powerful search across all content — with trending queries and most-visited pages ready to go.',
    to: '/search',
    cta: 'Start Searching',
    accent: '#059669',
    roles: [ROLES.GUEST, ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
  },
  {
    icon: '💬',
    title: 'Feedback',
    description:
      'See what the community is saying and share your own experience to help us improve.',
    to: '/feedback',
    cta: 'View Feedback',
    accent: '#d97706',
    roles: [ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN],
    guestNote: 'Sign in to submit feedback',
  },
  {
    icon: '📊',
    title: 'Analytics',
    description:
      'Track feedback trends, rating distributions, and content engagement across the portal.',
    to: '/analytics',
    cta: 'View Analytics',
    accent: '#db2777',
    roles: [ROLES.EDITOR, ROLES.ADMIN],
  },
];

const ROLE_CARD_THEME = {
  [ROLES.GUEST]:  { badge: null,                badgeBg: null,      badgeColor: null },
  [ROLES.VIEWER]: { badge: null,                badgeBg: null,      badgeColor: null },
  [ROLES.EDITOR]: { badge: '✏️ Editor access', badgeBg: '#ecfdf5', badgeColor: '#059669' },
  [ROLES.ADMIN]:  { badge: '🛡️ Admin access',  badgeBg: '#fdf2f8', badgeColor: '#db2777' },
};

const Home = () => {
  const userRole = getUserRole();
  const FEATURES = ALL_FEATURES.filter((f) => f.roles.includes(userRole));
  const cardTheme = ROLE_CARD_THEME[userRole] || ROLE_CARD_THEME[ROLES.GUEST];

  return (
    <div className="home-page">
      {/* ── Hero ── */}
      <section className="hero-section">
        <div className="hero-inner">
          <div className="hero-badge">Knowledge Portal</div>
          <h1 className="hero-title">
            Find answers,<br />faster than ever.
          </h1>
          <p className="hero-subtitle">
            Search our documentation, FAQs, and community feedback — all in one place.
          </p>
          <div className="hero-search">
            <SearchBar onResults={() => {}} placeholder="Search documentation, FAQs…" />
          </div>
          <div className="hero-links">
            <Link to="/documentation" className="hero-cta hero-cta--primary">
              Browse Docs
            </Link>
            <Link to="/faqs" className="hero-cta hero-cta--ghost">
              View FAQs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <h2 className="section-title">Everything you need</h2>
        <p className="section-subtitle">
          One portal, always up to date with Contentstack.
        </p>
        <div
          className="features-grid"
          style={{ '--card-count': FEATURES.length }}
        >
          {FEATURES.map(({ icon, title, description, to, cta, accent }) => (
            <div
              className="feature-card"
              key={to}
              style={{ '--accent': accent }}
            >
              {cardTheme.badge && (
                <span
                  className="feature-role-badge"
                  style={{ background: cardTheme.badgeBg, color: cardTheme.badgeColor }}
                >
                  {cardTheme.badge}
                </span>
              )}
              <div className="feature-icon-wrap" style={{ background: `${accent}18` }}>
                <span className="feature-icon" role="img" aria-hidden="true">{icon}</span>
              </div>
              <h3 className="feature-title">{title}</h3>
              <p className="feature-desc">{description}</p>
              <Link to={to} className="feature-btn">
                {cta} <span aria-hidden="true">→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;

