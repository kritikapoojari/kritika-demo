import React, { useState, useEffect, useCallback } from 'react';
import { getFeedbackAnalytics } from '../../services/feedbackService';
import { getUserRole, hasPermission } from '../../config/roles';
import './AnalyticsDashboard.css';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });
  const userRole = getUserRole();

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getFeedbackAnalytics({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });
      setAnalytics(result);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    if (hasPermission(userRole, 'analytics', true)) {
      fetchAnalytics();
    } else {
      setError('You do not have permission to view analytics.');
      setLoading(false);
    }
  }, [dateRange, userRole, fetchAnalytics]);

  if (!hasPermission(userRole, 'analytics', true)) {
    return (
      <div className="analytics-dashboard">
        <div className="permission-denied" role="alert">
          <h2>Access Denied</h2>
          <p>You do not have permission to view analytics.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-dashboard">
        <div className="loading-container" role="status" aria-live="polite">
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="error-container" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <header className="analytics-header">
        <h1>Analytics Dashboard</h1>
        <div className="date-filters">
          <label htmlFor="start-date">
            Start Date:
            <input
              id="start-date"
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              aria-label="Filter analytics from start date"
            />
          </label>
          <label htmlFor="end-date">
            End Date:
            <input
              id="end-date"
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              aria-label="Filter analytics to end date"
            />
          </label>
        </div>
      </header>

      {analytics && (
        <div className="analytics-content">
          <div className="analytics-card">
            <h2>Feedback Overview</h2>
            <div className="stat">
              <span className="stat-label">Total Feedback:</span>
              <span className="stat-value">{analytics.total}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Average Rating:</span>
              <span className="stat-value">
                {analytics.averageRating.toFixed(2)} / 5.00
              </span>
            </div>
          </div>

          <div className="analytics-card">
            <h2>Rating Distribution</h2>
            <div className="rating-distribution">
              {Object.entries(analytics.ratingDistribution).map(([rating, count]) => (
                <div key={rating} className="rating-bar">
                  <span className="rating-label">{rating} ⭐</span>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{
                        width: `${(count / analytics.total) * 100}%`,
                      }}
                      role="progressbar"
                      aria-valuenow={count}
                      aria-valuemin="0"
                      aria-valuemax={analytics.total}
                      aria-label={`${count} feedbacks with ${rating} star rating`}
                    />
                  </div>
                  <span className="rating-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-card">
            <h2>Feedback by Content Type</h2>
            <div className="content-type-stats">
              {Object.entries(analytics.byContentType).map(([type, count]) => (
                <div key={type} className="content-type-stat">
                  <span className="type-name">{type}</span>
                  <span className="type-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;

