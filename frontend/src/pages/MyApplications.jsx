import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Loading } from '../components/ProtectedRoute';
import { FileText, Calendar, Download, Briefcase, ExternalLink } from 'lucide-react';

const MyApplications = () => {
  const { addToast } = useToast();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/applications/myapplications');
        setApplications(res.data);
      } catch (err) {
        console.error(err);
        addToast('Failed to retrieve applications', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Accepted':
        return <span className="badge badge-success">{status}</span>;
      case 'Rejected':
        return <span className="badge badge-danger">{status}</span>;
      case 'Reviewed':
        return <span className="badge badge-primary">{status}</span>;
      default:
        return <span className="badge badge-warning">{status}</span>;
    }
  };

  const getResumeName = (resumePath) => {
    if (!resumePath) return 'N/A';
    return resumePath.split('/').pop();
  };

  const handleDownload = async (resumePath) => {
    if (!resumePath) return;
    const filename = resumePath.split('/').pop();
    try {
      addToast('Downloading resume...', 'info');
      const response = await api.get(`/api/applications/resume/download/${filename}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('Resume downloaded successfully', 'success');
    } catch (err) {
      console.error(err);
      addToast('Download failed', 'danger');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="main-content fade-in">
      <div style={headerStyle}>
        <h1 style={{ fontSize: '2rem' }}>My Applications</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and track the progress of your active applications</p>
      </div>

      {applications.length === 0 ? (
        <div className="glass-panel" style={emptyStateStyle}>
          <Briefcase size={48} color="var(--primary)" style={{ marginBottom: '16px', opacity: 0.7 }} />
          <h3>No Applications Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>
            You haven't applied to any job listings yet. Start exploring active listings today.
          </p>
          <Link to="/jobs" className="btn btn-primary">
            Explore Active Jobs
          </Link>
        </div>
      ) : (
        <div className="glass-panel table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Job & Company</th>
                <th>Applied Date</th>
                <th>Resume Submitted</th>
                <th>Application Status</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}>
                  {/* Job/Company info */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Link to={`/jobs/${app.job._id}`} style={jobLinkStyle}>
                        {app.job.title} <ExternalLink size={12} style={{ marginLeft: '4px' }} />
                      </Link>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {app.job.companyName}
                      </span>
                    </div>
                  </td>
                  
                  {/* Applied Date */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      <Calendar size={14} />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </div>
                  </td>

                  {/* Resume path / Download */}
                  <td>
                    <button
                      onClick={() => handleDownload(app.resumePath)}
                      style={downloadBtnStyle}
                      title="Download resume"
                    >
                      <FileText size={16} />
                      <span style={resumeNameStyle}>{getResumeName(app.resumePath)}</span>
                      <Download size={14} />
                    </button>
                  </td>

                  {/* Status Badge */}
                  <td>
                    {getStatusBadge(app.status)}
                  </td>

                  {/* Action link */}
                  <td>
                    <Link to={`/jobs/${app.job._id}`} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      View Job
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

// Styles for applications table list
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

const jobLinkStyle = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#ffffff',
  display: 'inline-flex',
  alignItems: 'center',
  ':hover': {
    color: 'var(--primary)',
  },
};

const downloadBtnStyle = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  padding: '6px 12px',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
  ':hover': {
    borderColor: 'var(--primary)',
    color: '#ffffff',
  },
};

const resumeNameStyle = {
  fontSize: '0.85rem',
  maxWidth: '120px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

export default MyApplications;
export { MyApplications };
