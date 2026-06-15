import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import Sidebar from '../components/Sidebar';
import { Loading } from '../components/ProtectedRoute';
import { Users, Briefcase, FileText, Trash2, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

const AdminDashboard = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Stats & Analytics
  const [analytics, setAnalytics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'overview') {
        const res = await api.get('/api/admin/analytics');
        setAnalytics(res.data);
      } else if (activeTab === 'users') {
        const query = roleFilter ? `?role=${roleFilter}` : '';
        const res = await api.get(`/api/admin/users${query}`);
        setUsersList(res.data);
      } else if (activeTab === 'jobs') {
        const res = await api.get('/api/admin/jobs');
        setJobsList(res.data);
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load administrative details', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab, roleFilter]);

  const handleJobDelete = async (jobId) => {
    if (window.confirm('WARNING: Are you sure you want to delete this job posting as an Admin? This will remove all matching applicant submissions and saved list states.')) {
      try {
        await api.delete(`/api/admin/jobs/${jobId}`);
        addToast('Job posting moderated and deleted successfully', 'success');
        setJobsList(jobsList.filter((j) => j._id !== jobId));
      } catch (err) {
        addToast('Deletion failed', 'danger');
      }
    }
  };

  // Helper to calculate percentages for indicator progress bars
  const getPercentage = (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  const renderContent = () => {
    if (activeTab === 'users') {
      return (
        <div className="fade-in">
          <div style={subHeaderStyle}>
            <h2 style={{ fontSize: '1.4rem' }}>Manage Registered Users</h2>
            <div style={filterGroup}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter role:</span>
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="form-control" style={selectStyle}>
                <option value="">All Roles</option>
                <option value="Candidate">Candidates</option>
                <option value="Recruiter">Recruiters</option>
                <option value="Admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="glass-panel table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr) => (
                  <tr key={usr._id}>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>{usr.name}</td>
                    <td>
                      <a href={`mailto:${usr.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={12} /> {usr.email}
                      </a>
                    </td>
                    <td>
                      <span className={`badge ${usr.role === 'Admin' ? 'badge-danger' : usr.role === 'Recruiter' ? 'badge-secondary' : 'badge-primary'}`}>
                        {usr.role}
                      </span>
                    </td>
                    <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'jobs') {
      return (
        <div className="fade-in">
          <h2 style={{ fontSize: '1.4rem', marginBottom: '20px' }}>Moderate Active Jobs</h2>
          <div className="glass-panel table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Created Date</th>
                  <th>Moderation Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobsList.map((job) => (
                  <tr key={job._id}>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>{job.title}</td>
                    <td>{job.companyName}</td>
                    <td>
                      <span className="badge badge-primary">{job.jobType}</span>
                    </td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleJobDelete(job._id)}
                        className="btn btn-secondary"
                        style={deleteBtnStyle}
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Default Overview / Aggregated Analytics Panel
    if (!analytics) return null;

    return (
      <div className="fade-in">
        <h2 style={{ fontSize: '1.4rem', marginBottom: '24px' }}>Aggregated Platform Metrics</h2>

        {/* Global overview stats */}
        <div className="stats-grid">
          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ color: 'var(--primary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{analytics.users.total}</div>
              <div className="stat-label">Total Platform Users</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ color: 'var(--secondary)' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">{analytics.jobs.total}</div>
              <div className="stat-label">Total Posted Positions</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ color: 'var(--success)' }}>
              <FileText size={24} />
            </div>
            <div>
              <div className="stat-value">{analytics.applications.total}</div>
              <div className="stat-label">Job Applications Filed</div>
            </div>
          </div>
        </div>

        {/* Dynamic Aggregated Progress Bars grids */}
        <div style={analyticsGrid}>
          {/* Users Distribution */}
          <div className="glass-panel" style={analyticPanelStyle}>
            <h3 style={analyticHeaderStyle}>Users Breakdown</h3>
            <div style={breakdownGroup}>
              {/* Candidates */}
              <div style={barWrapper}>
                <div style={barLabelStyle}>
                  <span>Candidates</span>
                  <span>{analytics.users.Candidate} ({getPercentage(analytics.users.Candidate, analytics.users.total)}%)</span>
                </div>
                <div style={progressContainerStyle}>
                  <div style={progressInnerStyle(getPercentage(analytics.users.Candidate, analytics.users.total), 'var(--primary)')}></div>
                </div>
              </div>

              {/* Recruiters */}
              <div style={barWrapper}>
                <div style={barLabelStyle}>
                  <span>Recruiters</span>
                  <span>{analytics.users.Recruiter} ({getPercentage(analytics.users.Recruiter, analytics.users.total)}%)</span>
                </div>
                <div style={progressContainerStyle}>
                  <div style={progressInnerStyle(getPercentage(analytics.users.Recruiter, analytics.users.total), 'var(--secondary)')}></div>
                </div>
              </div>

              {/* Admins */}
              <div style={barWrapper}>
                <div style={barLabelStyle}>
                  <span>Admins</span>
                  <span>{analytics.users.Admin} ({getPercentage(analytics.users.Admin, analytics.users.total)}%)</span>
                </div>
                <div style={progressContainerStyle}>
                  <div style={progressInnerStyle(getPercentage(analytics.users.Admin, analytics.users.total), 'var(--danger)')}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Applications status Distribution */}
          <div className="glass-panel" style={analyticPanelStyle}>
            <h3 style={analyticHeaderStyle}>Application Flow States</h3>
            <div style={breakdownGroup}>
              {/* Pending */}
              <div style={barWrapper}>
                <div style={barLabelStyle}>
                  <span>Pending Evaluation</span>
                  <span>{analytics.applications.Pending}</span>
                </div>
                <div style={progressContainerStyle}>
                  <div style={progressInnerStyle(getPercentage(analytics.applications.Pending, analytics.applications.total), 'var(--warning)')}></div>
                </div>
              </div>

              {/* Reviewed */}
              <div style={barWrapper}>
                <div style={barLabelStyle}>
                  <span>Reviewed</span>
                  <span>{analytics.applications.Reviewed}</span>
                </div>
                <div style={progressContainerStyle}>
                  <div style={progressInnerStyle(getPercentage(analytics.applications.Reviewed, analytics.applications.total), 'var(--primary)')}></div>
                </div>
              </div>

              {/* Accepted */}
              <div style={barWrapper}>
                <div style={barLabelStyle}>
                  <span>Accepted Offers</span>
                  <span>{analytics.applications.Accepted}</span>
                </div>
                <div style={progressContainerStyle}>
                  <div style={progressInnerStyle(getPercentage(analytics.applications.Accepted, analytics.applications.total), 'var(--success)')}></div>
                </div>
              </div>

              {/* Rejected */}
              <div style={barWrapper}>
                <div style={barLabelStyle}>
                  <span>Rejected Candidates</span>
                  <span>{analytics.applications.Rejected}</span>
                </div>
                <div style={progressContainerStyle}>
                  <div style={progressInnerStyle(getPercentage(analytics.applications.Rejected, analytics.applications.total), 'var(--danger)')}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      <div style={headerStyle}>
        <h1 style={{ fontSize: '2rem' }}>Administration Console</h1>
        <p style={{ color: 'var(--text-muted)' }}>System-wide moderation metrics, users logs, and safety actions</p>
      </div>

      <div className="dashboard-grid">
        <Sidebar role="Admin" activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main style={{ minWidth: 0 }}>
          {loading ? <Loading /> : renderContent()}
        </main>
      </div>
    </div>
  );
};

// Styling settings
const headerStyle = {
  marginBottom: '30px',
};

const subHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '20px',
  flexWrap: 'wrap',
  gap: '12px',
};

const filterGroup = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const selectStyle = {
  padding: '6px 12px',
  width: '160px',
  background: 'var(--bg-input)',
};

const deleteBtnStyle = {
  width: '32px',
  height: '32px',
  padding: 0,
  borderRadius: '6px',
  color: 'var(--danger)',
  borderColor: 'var(--danger-glow)',
};

const analyticsGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
  gap: '24px',
  marginTop: '10px',
};

const analyticPanelStyle = {
  padding: '24px',
};

const analyticHeaderStyle = {
  fontSize: '1.15rem',
  marginBottom: '20px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--border-color)',
};

const breakdownGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const barWrapper = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const barLabelStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
  fontWeight: 500,
  color: '#cbd5e1',
};

const progressContainerStyle = {
  width: '100%',
  height: '8px',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '4px',
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.05)',
};

const progressInnerStyle = (percentage, color) => ({
  width: `${percentage}%`,
  height: '100%',
  background: color,
  borderRadius: '4px',
  boxShadow: `0 0 8px ${color}`,
  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
});

export default AdminDashboard;
export { AdminDashboard };
