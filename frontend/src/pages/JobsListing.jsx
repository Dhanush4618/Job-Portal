import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import JobCard from '../components/JobCard';
import { Loading } from '../components/ProtectedRoute';
import { Search, MapPin, SlidersHorizontal, RefreshCw, X, ChevronLeft, ChevronRight } from 'lucide-react';

const JobsListing = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const locationState = useLocation();

  // Search parameters
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [jobType, setJobType] = useState('');
  const [skills, setSkills] = useState('');

  // Results & Pagination
  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);

  // Bookmarks tracked locally
  const [savedJobIds, setSavedJobIds] = useState([]);

  // Fetch URL query parameters on load
  useEffect(() => {
    const params = new URLSearchParams(locationState.search);
    const searchParam = params.get('search');
    const locationParam = params.get('location');
    const typeParam = params.get('jobType');
    const skillsParam = params.get('skills');

    if (searchParam) setSearch(searchParam);
    if (locationParam) setLocation(locationParam);
    if (typeParam) setJobType(typeParam);
    if (skillsParam) setSkills(skillsParam);

    setPage(1);
  }, [locationState.search]);

  // Fetch Saved Job IDs for candidates
  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (user && user.role === 'Candidate') {
        try {
          const res = await api.get('/api/applications/savedjobs');
          setSavedJobIds(res.data.map((item) => item.job._id));
        } catch (err) {
          console.error('Error fetching bookmarked jobs:', err.message);
        }
      }
    };
    fetchSavedJobs();
  }, [user]);

  // Fetch Jobs function
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const queryParams = [];
      queryParams.push(`page=${page}`);
      queryParams.push(`limit=6`);
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);
      if (location) queryParams.push(`location=${encodeURIComponent(location)}`);
      if (experienceLevel) queryParams.push(`experienceLevel=${encodeURIComponent(experienceLevel)}`);
      if (jobType) queryParams.push(`jobType=${encodeURIComponent(jobType)}`);
      if (skills) queryParams.push(`skills=${encodeURIComponent(skills)}`);

      const queryStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await api.get(`/api/jobs${queryStr}`);
      
      setJobs(res.data.jobs);
      setTotalPages(res.data.pages);
      setTotalJobs(res.data.total);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch job listings', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, experienceLevel, jobType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setExperienceLevel('');
    setJobType('');
    setSkills('');
    setPage(1);
  };

  // Toggle Bookmark logic
  const handleSaveToggle = async (jobId) => {
    if (!user) {
      addToast('Please login to bookmark jobs', 'warning');
      return;
    }

    const isCurrentlySaved = savedJobIds.includes(jobId);

    try {
      if (isCurrentlySaved) {
        await api.delete(`/api/applications/save/${jobId}`);
        setSavedJobIds(savedJobIds.filter((id) => id !== jobId));
        addToast('Job removed from saved list', 'info');
      } else {
        await api.post(`/api/applications/save/${jobId}`);
        setSavedJobIds([...savedJobIds, jobId]);
        addToast('Job saved for later', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating bookmarks', 'danger');
    }
  };

  const handleJobDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await api.delete(`/api/jobs/${jobId}`);
        addToast('Job posting successfully deleted', 'success');
        fetchJobs(); // Reload jobs list
      } catch (err) {
        addToast(err.response?.data?.message || 'Deletion failed', 'danger');
      }
    }
  };

  return (
    <div className="main-content fade-in">
      <div style={headerStyle}>
        <div>
          <h1 style={{ fontSize: '2rem' }}>Explore Opportunities</h1>
          <p style={{ color: 'var(--text-muted)' }}>Found {totalJobs} active careers matching your criteria</p>
        </div>
        <button onClick={clearFilters} className="btn btn-secondary" style={{ display: 'flex', gap: '8px' }}>
          <RefreshCw size={16} /> Reset Filters
        </button>
      </div>

      <div style={layoutGridStyle}>
        {/* Left Side: Sticky Filters Panel */}
        <aside className="glass-panel" style={filtersPanelStyle}>
          <div style={filterHeaderStyle}>
            <SlidersHorizontal size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>Search Filters</h3>
          </div>

          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Keyword Search</label>
              <div style={inputWrapperStyle}>
                <Search size={16} style={iconStyle} />
                <input
                  type="text"
                  placeholder="Title, Company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Location</label>
              <div style={inputWrapperStyle}>
                <MapPin size={16} style={iconStyle} />
                <input
                  type="text"
                  placeholder="City or Remote..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-control"
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Skills (comma separated)</label>
              <input
                type="text"
                placeholder="React, AWS..."
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="form-control"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="form-control"
                style={{ background: 'var(--bg-input)' }}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Internship">Internship</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="form-control"
              >
                <option value="">All Levels</option>
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead Level</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              Apply Filters
            </button>
          </form>
        </aside>

        {/* Right Side: Job Cards Grid */}
        <main style={{ flex: 1 }}>
          {loading ? (
            <Loading />
          ) : jobs.length === 0 ? (
            <div className="glass-panel" style={emptyStateStyle}>
              <X size={48} color="var(--danger)" style={{ marginBottom: '16px' }} />
              <h3>No Jobs Found</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>We couldn't find any job posts matching your criteria. Try adjusting your filters.</p>
            </div>
          ) : (
            <>
              <div style={cardsGridStyle}>
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    isSaved={savedJobIds.includes(job._id)}
                    onSaveToggle={handleSaveToggle}
                    onDelete={handleJobDelete}
                  />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div style={paginationContainerStyle}>
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary"
                    style={pagBtnStyle}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={pageIndicatorStyle}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary"
                    style={pagBtnStyle}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

// Styles for listings page
const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '30px',
  flexWrap: 'wrap',
  gap: '15px',
};

const layoutGridStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '30px',
  flexWrap: 'wrap',
};

const filtersPanelStyle = {
  width: '300px',
  padding: '24px',
  position: 'sticky',
  top: '94px',
  flexShrink: 0,
  '@media (max-width: 900px)': {
    width: '100%',
    position: 'static',
  },
};

const filterHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid var(--border-color)',
};

const inputWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const iconStyle = {
  position: 'absolute',
  left: '14px',
  color: 'var(--text-muted)',
};

const cardsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
  gap: '20px',
  width: '100%',
};

const emptyStateStyle = {
  padding: '60px 40px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const paginationContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '16px',
  marginTop: '40px',
};

const pagBtnStyle = {
  width: '40px',
  height: '40px',
  padding: 0,
  borderRadius: '50%',
};

const pageIndicatorStyle = {
  fontSize: '0.95rem',
  fontWeight: 500,
  color: 'var(--text-muted)',
};

export default JobsListing;
