import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Layout/Header';
import Home from './pages/Home';
import DocumentationList from './components/Documentation/DocumentationList';
import DocumentationViewer from './components/Documentation/DocumentationViewer';
import FAQList from './components/FAQ/FAQList';
import SearchResults from './pages/SearchResults';
import AnalyticsDashboard from './components/Analytics/AnalyticsDashboard';
import FeedbackList from './components/Feedback/FeedbackList';
import './App.css';

function App() {
  return (
    <Router>
    <div className="App">
        <Header />
        <main className="main-content" role="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/documentation" element={<DocumentationList />} />
            <Route path="/documentation/:uid" element={<DocumentationViewer />} />
            <Route path="/faqs" element={<FAQList />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/feedback" element={<FeedbackList />} />
          </Routes>
        </main>
        <footer className="app-footer" role="contentinfo">
          <p>&copy; 2024 Knowledge Portal. Built with Contentstack.</p>
        </footer>
    </div>
    </Router>
  );
}

export default App;
