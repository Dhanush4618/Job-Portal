import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import { Loading } from '../components/ProtectedRoute';
import PostJob from './PostJob';
import ManageJobs from './ManageJobs';
import { Briefcase, Users, PlusCircle, UserCheck } from 'lucide-react';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const [jobs, setJobs] = useState([]);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRecruiterData = async () => {
    try {
      setLoading(true);
      const jobsRes = await api.get('/api/jobs/recruiter/myjobs');
      setJobs(jobsRes.data);

      // Fetch applicants count across all jobs
      let totalApps = 0;
      for (const job of jobsRes.data) {
        try {
          const appsRes = await api.get(`/api/applications/job/${job._id}`);
          totalApps += appsRes.data.length;
        } catch (appErr) {
          console.error(`Error loading applicants for job ${job._id}:`, appErr.message);
        }
      }
      setApplicationsCount(totalApps);
    } catch (err) {
      console.error(err);
      addToast('Failed to load dashboard metrics', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchRecruiterData();
    }
  }, [activeTab]);

  const handleJobDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job post?')) {
      try {
        await api.delete(`/api/jobs/${jobId}`);
        addToast('Job posting successfully deleted', 'success');
        setJobs(jobs.filter((j) => j._id !== jobId));
      } catch (err) {
        addToast('Deletion failed', 'danger');
      }
    }
  };

  const renderContent = () => {
    if (activeTab === 'post') {
      return <PostJob onCompleted={() => setActiveTab('overview')} />;
    }
    if (activeTab === 'manage') {
      return <ManageJobs jobs={jobs} onDelete={handleJobDelete} />;
    }

    // Default Overview Panel
    return (
      <div className="fade-in">
        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>Overview Dashboard</h2>

        {/* Recruiter Stats */}
        <div className="stats-grid">
          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ color: 'var(--primary)' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">{jobs.length}</div>
              <div className="stat-label">Active Job Posts</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ color: 'var(--secondary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{applicationsCount}</div>
              <div className="stat-label">Total Applicants</div>
            </div>
          </div>

          <div className="glass-panel stat-card" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('post')}>
            <div className="stat-icon" style={{ color: 'var(--success)' }}>
              <PlusCircle size={24} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.3rem', color: '#ffffff' }}>Post Job</div>
              <div className="stat-label">Create new listing</div>
            </div>
          </div>
        </div>

        {/* Recent Job Posts Table */}
        <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Recently Posted Jobs</h3>
        {jobs.length === 0 ? (
          <div className="glass-panel" style={emptyStateStyle}>
            <Briefcase size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h4>No Job Listings Yet</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px', marginBottom: '16px' }}>
              You haven't posted any jobs under this account.
            </p>
            <button onClick={() => setActiveTab('post')} className="btn btn-primary btn-primary">
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="glass-panel table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Job Type</th>
                  <th>Date Created</th>
                  <th>Manage Candidates</th>
                </tr>
              </thead>
              <tbody>
                {jobs.slice(0, 5).map((job) => (
                  <tr key={job._id}>
                    <td>
                      <Link to={`/jobs/${job._id}`} style={{ fontWeight: 600, color: '#ffffff' }}>
                        {job.title}
                      </Link>
                    </td>
                    <td>{job.location}</td>
                    <td>
                      <span className="badge badge-primary">{job.jobType}</span>
                    </td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Link
                        to={`/jobs/${job._id}/applicants`}
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'inline-flex', gap: '6px' }}
                      >
                        <UserCheck size={14} /> View Applicants
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="main-content">
      <div style={headerStyle}>
        <h1 style={{ fontSize: '2rem' }}>Recruiter Space</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome, {user.name} | {user.companyName || 'Manage Hiring'}</p>
      </div>

      <div className="dashboard-grid">
        <Sidebar role="Recruiter" activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{ minWidth: 0 }}>
          {loading ? <Loading /> : renderContent()}
        </main>
      </div>
    </div>
  );
};

// Styling structures
const headerStyle = {
  marginBottom: '30px',
};

const emptyStateStyle = {
  padding: '40px 20px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export default RecruiterDashboard;
export { RecruiterDashboard };
