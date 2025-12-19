import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/Search/SearchBar';
import './Home.css';

const Home = () => {
  const handleSearchResults = (results) => {
    // Search results are handled by the SearchResults page
    console.log('Search results:', results);
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1 className="hero-title">Welcome to the Knowledge Portal</h1>
        <p className="hero-subtitle">
          Find answers, explore documentation, and get help when you need it.
        </p>
        <div className="hero-search">
          <SearchBar onResults={handleSearchResults} />
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">What can you do here?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Documentation</h3>
            <p>
              Browse comprehensive, versioned documentation covering all aspects
              of our platform and services.
            </p>
            <Link to="/documentation" className="feature-link">
              Explore Documentation →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">❓</div>
            <h3>FAQs</h3>
            <p>
              Find quick answers to frequently asked questions. Search by topic,
              category, or keyword.
            </p>
            <Link to="/faqs" className="feature-link">
              Browse FAQs →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>Search</h3>
            <p>
              Powerful search functionality to find exactly what you're looking
              for across all content.
            </p>
            <Link to="/search" className="feature-link">
              Start Searching →
            </Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Feedback</h3>
            <p>
              Help us improve by providing feedback on documentation and FAQs.
              Your input matters!
            </p>
            <Link to="/feedback" className="feature-link">
              View Feedback →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

