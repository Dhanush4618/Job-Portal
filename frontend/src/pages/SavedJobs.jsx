import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Loading } from '../components/ProtectedRoute';
import JobCard from '../components/JobCard';
import { Bookmark, Search } from 'lucide-react';

const SavedJobs = () => {
  const { addToast } = useToast();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/applications/savedjobs');
      setSavedJobs(res.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch bookmarked jobs', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/api/applications/save/${jobId}`);
      // Remove from list state locally
      setSavedJobs(savedJobs.filter((item) => item.job._id !== jobId));
      addToast('Job removed from saved list', 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating bookmarks', 'danger');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="main-content fade-in">
      <div style={headerStyle}>
        <h1 style={{ fontSize: '2rem' }}>Saved Jobs</h1>
        <p style={{ color: 'var(--text-muted)' }}>Keep track of job listings you want to apply to later</p>
      </div>

      {savedJobs.length === 0 ? (
        <div className="glass-panel" style={emptyStateStyle}>
          <Bookmark size={48} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.7 }} />
          <h3>No Saved Jobs</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
            You haven't bookmarked any jobs yet. Check out the latest listings!
          </p>
          <Link to="/jobs" className="btn btn-primary" style={{ display: 'flex', gap: '8px' }}>
            <Search size={16} /> Browse Listings
          </Link>
        </div>
      ) : (
        <div style={gridStyle}>
          {savedJobs.map((item) => (
            <JobCard
              key={item._id}
              job={item.job}
              isSaved={true}
              onSaveToggle={() => handleUnsave(item.job._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Styling variables
const headerStyle = {
  marginBottom: '30px',
};

const emptyStateStyle = {
  padding: '60px 40px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '500px',
  margin: '40px auto 0 auto',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '20px',
};

export default SavedJobs;
export { SavedJobs };
