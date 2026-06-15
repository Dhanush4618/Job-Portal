import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Loading } from '../components/ProtectedRoute';
import { MapPin, DollarSign, Briefcase, Award, Calendar, Link as LinkIcon, User, Send, FileText, CheckCircle } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Application state
  const [hasApplied, setHasApplied] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [useProfileResume, setUseProfileResume] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/jobs/${id}`);
        setJob(res.data);

        // Check if candidate already applied
        if (user && user.role === 'Candidate') {
          const appsRes = await api.get('/api/applications/myapplications');
          const alreadyApplied = appsRes.data.some((app) => app.job._id === id);
          setHasApplied(alreadyApplied);
        }
      } catch (err) {
        console.error(err);
        addToast('Job details not found', 'danger');
        navigate('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id, user, navigate]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    
    // Validate resume choice
    if (!useProfileResume && !resume) {
      addToast('Please upload a resume file (PDF only)', 'warning');
      return;
    }

    if (useProfileResume && !user.resumePath) {
      addToast('You do not have a resume saved on your profile. Please upload one here.', 'warning');
      setUseProfileResume(false);
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('coverLetter', coverLetter);
      
      if (!useProfileResume && resume) {
        formData.append('resume', resume);
      }

      await api.post(`/api/applications/apply/${job._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      addToast('Application submitted successfully! Confirmation email dispatched.', 'success');
      setHasApplied(true);
      setIsApplyModalOpen(false);
      
      // Cleanup inputs
      setCoverLetter('');
      setResume(null);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit application', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        addToast('Only PDF files are accepted!', 'danger');
        e.target.value = null; // Clear input
        setResume(null);
      } else {
        setResume(file);
      }
    }
  };

  if (loading) return <Loading />;
  if (!job) return <div className="main-content">Job post not found.</div>;

  const isCandidate = user && user.role === 'Candidate';
  const isOwner = user && job.recruiter && (job.recruiter._id === user._id || job.recruiter === user._id);
  const isAdmin = user && user.role === 'Admin';

  return (
    <div className="main-content fade-in">
      {/* Back button */}
      <Link to="/jobs" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--text-muted)' }}>
        ← Back to all listings
      </Link>

      {/* Main Container */}
      <div style={detailsGridStyle}>
        
        {/* Left Column: Job Description details */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-panel" style={panelStyle}>
            <div style={headerBlockStyle}>
              <div style={initialLogoStyle}>
                {job.companyName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '1.8rem' }}>{job.title}</h1>
                <p style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '1.1rem', marginTop: '4px' }}>{job.companyName}</p>
              </div>
            </div>

            <div style={metaGridStyle}>
              <div style={metaItemStyle}>
                <MapPin size={18} color="var(--primary)" />
                <div>
                  <span style={metaLabelStyle}>Location</span>
                  <span style={metaValueStyle}>{job.location}</span>
                </div>
              </div>
              <div style={metaItemStyle}>
                <DollarSign size={18} color="var(--primary)" />
                <div>
                  <span style={metaLabelStyle}>Salary Range</span>
                  <span style={metaValueStyle}>{job.salaryRange}</span>
                </div>
              </div>
              <div style={metaItemStyle}>
                <Briefcase size={18} color="var(--primary)" />
                <div>
                  <span style={metaLabelStyle}>Job Type</span>
                  <span style={metaValueStyle}>{job.jobType}</span>
                </div>
              </div>
              <div style={metaItemStyle}>
                <Award size={18} color="var(--primary)" />
                <div>
                  <span style={metaLabelStyle}>Experience Level</span>
                  <span style={metaValueStyle}>{job.experienceLevel}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel" style={panelStyle}>
            <h2 style={sectionTitleStyle}>Job Description</h2>
            <div style={descriptionContentStyle}>
              {job.description.split('\n').map((para, i) => (
                <p key={i} style={{ marginBottom: '14px' }}>{para}</p>
              ))}
            </div>
          </div>

          {/* Skills Required */}
          <div className="glass-panel" style={panelStyle}>
            <h2 style={sectionTitleStyle}>Required Skills & Technologies</h2>
            <div style={skillsGridStyle}>
              {job.requiredSkills.map((skill, index) => (
                <span key={index} style={skillBadgeStyle}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Actions and Recruiter Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '300px' }}>
          
          {/* Action Box */}
          <div className="glass-panel" style={actionBoxStyle}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>Application Summary</h3>
            
            {hasApplied ? (
              <div style={appliedBannerStyle}>
                <CheckCircle size={20} color="var(--success)" />
                <span>You have applied to this job</span>
              </div>
            ) : isCandidate ? (
              <button onClick={() => setIsApplyModalOpen(true)} className="btn btn-primary" style={{ width: '100%' }}>
                Apply For Job
              </button>
            ) : user ? (
              // Recruiter / Admin Actions
              (isOwner || isAdmin) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                  <Link to={`/jobs/${job._id}/applicants`} className="btn btn-primary" style={{ width: '100%' }}>
                    View Applicants
                  </Link>
                  <Link to="/manage-jobs" className="btn btn-secondary" style={{ width: '100%' }}>
                    Manage Posting
                  </Link>
                </div>
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                  Logged in as a {user.role}. Application forms are restricted to Candidates.
                </div>
              )
            ) : (
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Login to Apply
              </Link>
            )}
            
            <div style={summarySpecsStyle}>
              <div style={summaryRowStyle}>
                <span>Date Posted</span>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div style={summaryRowStyle}>
                <span>Status</span>
                <span className="badge badge-success">Active</span>
              </div>
            </div>
          </div>

          {/* Recruiter Details */}
          {job.recruiter && (
            <div className="glass-panel" style={panelStyle}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>About the Recruiter</h3>
              <div style={recruiterBlockStyle}>
                <div style={recAvatarStyle}>
                  <User size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem' }}>{job.recruiter.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.recruiter.companyName || 'Verified Recruiter'}</p>
                </div>
              </div>
              
              {job.recruiter.companyDescription && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '12px', lineHeight: '1.4' }}>
                  {job.recruiter.companyDescription}
                </p>
              )}

              {job.recruiter.companyWebsite && (
                <a
                  href={job.recruiter.companyWebsite.startsWith('http') ? job.recruiter.companyWebsite : `https://${job.recruiter.companyWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={websiteLinkStyle}
                >
                  <LinkIcon size={14} /> Visit Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Application Modal Popup */}
      {isApplyModalOpen && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content fade-in">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Job Application</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Applying for <strong>{job.title}</strong> at <strong>{job.companyName}</strong>
            </p>

            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label className="form-label">Cover Letter / Pitch</label>
                <textarea
                  placeholder="Introduce yourself to the recruiter and highlight your skills..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="form-control"
                  required
                ></textarea>
              </div>

              {/* Resume selection toggle */}
              <div className="form-group">
                <label className="form-label">Resume Document</label>
                
                {user.resumePath ? (
                  <div style={resumeToggleStyle}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={useProfileResume}
                        onChange={(e) => setUseProfileResume(e.target.checked)}
                      />
                      <span style={{ fontSize: '0.9rem' }}>Use resume on file in profile</span>
                    </label>
                    {useProfileResume && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '4px', paddingLeft: '22px' }}>
                        Linked resume: {user.resumePath.split('/').pop()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--warning)', marginBottom: '10px' }}>
                    No resume found in profile. Please upload one below.
                  </div>
                )}

                {(!useProfileResume || !user.resumePath) && (
                  <div style={{ marginTop: '10px' }}>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="form-control"
                      style={{ padding: '8px 12px' }}
                      required={!useProfileResume || !user.resumePath}
                    />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      Accepts PDF formats only (Max size 10MB)
                    </span>
                  </div>
                )}
              </div>

              <div style={modalActionsStyle}>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'} <Send size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styling for page details
const detailsGridStyle = {
  display: 'flex',
  gap: '30px',
  flexWrap: 'wrap',
};

const panelStyle = {
  padding: '30px',
};

const headerBlockStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '24px',
};

const initialLogoStyle = {
  width: '60px',
  height: '60px',
  borderRadius: '12px',
  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.8rem',
  fontWeight: '800',
  boxShadow: '0 8px 16px rgba(99,102,241,0.2)',
};

const metaGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '20px',
  paddingTop: '20px',
  borderTop: '1px solid var(--border-color)',
};

const metaItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const metaLabelStyle = {
  display: 'block',
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const metaValueStyle = {
  fontSize: '0.95rem',
  fontWeight: 500,
  color: '#ffffff',
};

const sectionTitleStyle = {
  fontSize: '1.25rem',
  marginBottom: '16px',
};

const descriptionContentStyle = {
  fontSize: '0.95rem',
  color: '#e5e7eb',
  lineHeight: '1.7',
};

const skillsGridStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
};

const skillBadgeStyle = {
  padding: '6px 14px',
  borderRadius: '6px',
  background: 'rgba(99, 102, 241, 0.08)',
  border: '1px solid rgba(99, 102, 241, 0.15)',
  color: 'var(--primary)',
  fontSize: '0.85rem',
  fontWeight: 500,
};

const actionBoxStyle = {
  padding: '24px',
};

const appliedBannerStyle = {
  background: 'var(--success-glow)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  color: 'var(--success)',
  borderRadius: '8px',
  padding: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  fontSize: '0.9rem',
  fontWeight: 500,
};

const summarySpecsStyle = {
  marginTop: '20px',
  paddingTop: '16px',
  borderTop: '1px solid var(--border-color)',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const summaryRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
};

const recruiterBlockStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const recAvatarStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--border-color)',
  color: 'var(--text-main)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const websiteLinkStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  color: 'var(--primary)',
  fontSize: '0.85rem',
  marginTop: '16px',
  fontWeight: 500,
};

const resumeToggleStyle = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid var(--border-color)',
  borderRadius: '6px',
  padding: '12px',
};

const modalActionsStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '12px',
  marginTop: '24px',
};

export default JobDetails;
