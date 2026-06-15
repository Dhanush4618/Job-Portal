import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Loading } from '../components/ProtectedRoute';
import { FileText, Download, Mail, ArrowLeft, User, HelpCircle, Check, Clock } from 'lucide-react';

const ApplicantsList = () => {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [applicants, setApplicants] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      // Fetch job title
      const jobRes = await api.get(`/api/jobs/${jobId}`);
      setJob(jobRes.data);

      // Fetch applicants
      const appsRes = await api.get(`/api/applications/job/${jobId}`);
      setApplicants(appsRes.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load applicants', 'danger');
      navigate('/recruiter');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      setStatusUpdatingId(appId);
      await api.put(`/api/applications/${appId}/status`, { status: newStatus });
      addToast(`Applicant status set to ${newStatus}`, 'success');
      
      // Update local state list
      setApplicants(
        applicants.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
      );
    } catch (err) {
      addToast('Failed to update status', 'danger');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDownloadResume = async (resumePath) => {
    if (!resumePath) return;
    const filename = resumePath.split('/').pop();
    try {
      addToast('Downloading candidate resume...', 'info');
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
  if (!job) return <div className="main-content">Job post not found.</div>;

  return (
    <div className="main-content fade-in">
      {/* Back button */}
      <Link to="/recruiter" style={backBtnStyle}>
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div style={headerStyle}>
        <h1 style={{ fontSize: '2rem' }}>Candidate Applications</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Reviewing {applicants.length} candidates for <strong>{job.title}</strong>
        </p>
      </div>

      {applicants.length === 0 ? (
        <div className="glass-panel" style={emptyStateStyle}>
          <User size={48} color="var(--text-muted)" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3>No Applicants Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
            No candidates have applied to this position. Share your listing to invite applicants.
          </p>
        </div>
      ) : (
        <div style={candidatesGridStyle}>
          {applicants.map((app) => (
            <div key={app._id} className="glass-panel fade-in" style={candidateCardStyle}>
              {/* Top Row: Info */}
              <div style={cardHeaderStyle}>
                <div style={avatarStyle}>
                  {app.candidate.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={nameStyle}>{app.candidate.name}</h3>
                  <a href={`mailto:${app.candidate.email}`} style={emailLinkStyle}>
                    <Mail size={12} /> {app.candidate.email}
                  </a>
                </div>
              </div>

              {/* Bio */}
              {app.candidate.bio ? (
                <p style={bioStyle}>"{app.candidate.bio}"</p>
              ) : (
                <p style={{ ...bioStyle, fontStyle: 'italic', color: 'rgba(255,255,255,0.2)' }}>
                  No bio summary provided.
                </p>
              )}

              {/* Cover Letter */}
              {app.coverLetter && (
                <div style={coverLetterBlock}>
                  <span style={blockLabelStyle}>Pitch / Cover Letter</span>
                  <p style={coverLetterStyle}>{app.coverLetter}</p>
                </div>
              )}

              {/* Skills */}
              {app.candidate.skills && app.candidate.skills.length > 0 && (
                <div style={skillsGroupStyle}>
                  {app.candidate.skills.map((skill, i) => (
                    <span key={i} style={skillTagStyle}>
                      {skill}
                    </span>
                  ))}
                </div>
              )}

              <hr style={{ borderColor: 'var(--border-color)', margin: '16px 0' }} />

              {/* Footer Panel: Resume and Status selection */}
              <div style={cardFooterStyle}>
                {/* Resume download */}
                <button
                  onClick={() => handleDownloadResume(app.resumePath)}
                  className="btn btn-secondary"
                  style={resumeBtnStyle}
                  title="Download Resume"
                >
                  <FileText size={16} />
                  <span>Resume.pdf</span>
                  <Download size={14} />
                </button>

                {/* Status selection */}
                <div style={statusSelectWrapper}>
                  <span style={statusLabelStyle}>Status:</span>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    disabled={statusUpdatingId === app._id}
                    style={{
                      ...selectControlStyle,
                      borderLeftColor:
                        app.status === 'Accepted'
                          ? 'var(--success)'
                          : app.status === 'Rejected'
                          ? 'var(--danger)'
                          : app.status === 'Reviewed'
                          ? 'var(--primary)'
                          : 'var(--warning)',
                    }}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Reviewed">Reviewed</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Styles for candidate applications list
const backBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--text-muted)',
  marginBottom: '24px',
};

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

const candidatesGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
  gap: '24px',
  '@media (max-width: 640px)': {
    gridTemplateColumns: '1fr',
  },
};

const candidateCardStyle = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  marginBottom: '16px',
};

const avatarStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '1.2rem',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const nameStyle = {
  fontSize: '1.1rem',
  color: '#ffffff',
};

const emailLinkStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  marginTop: '2px',
  ':hover': {
    color: 'var(--primary)',
  },
};

const bioStyle = {
  fontSize: '0.85rem',
  color: '#cbd5e1',
  background: 'rgba(255,255,255,0.02)',
  padding: '10px 14px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.03)',
  marginBottom: '16px',
  lineHeight: '1.4',
};

const coverLetterBlock = {
  marginBottom: '16px',
};

const blockLabelStyle = {
  display: 'block',
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: 600,
  marginBottom: '4px',
};

const coverLetterStyle = {
  fontSize: '0.85rem',
  color: '#e2e8f0',
  lineHeight: '1.4',
};

const skillsGroupStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  marginBottom: '16px',
  marginTop: 'auto', // Pushes to the bottom
};

const skillTagStyle = {
  fontSize: '0.75rem',
  padding: '2px 8px',
  borderRadius: '4px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-muted)',
};

const cardFooterStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '12px',
};

const resumeBtnStyle = {
  fontSize: '0.8rem',
  padding: '6px 12px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const statusSelectWrapper = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const statusLabelStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
};

const selectControlStyle = {
  padding: '6px 10px',
  background: 'var(--bg-input)',
  border: '1px solid var(--border-color)',
  borderLeftWidth: '4px',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '0.85rem',
  outline: 'none',
  cursor: 'pointer',
};

export default ApplicantsList;
export { ApplicantsList };
