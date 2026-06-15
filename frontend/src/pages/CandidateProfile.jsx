import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Briefcase, FileText, Globe, Upload, Save, HelpCircle } from 'lucide-react';
import api from '../services/api';

const CandidateProfile = () => {
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [resume, setResume] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recruiter fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');

  // Sync profile details to form when user state loads
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setBio(user.bio || '');
      setSkills(user.skills ? user.skills.join(', ') : '');
      setCompanyName(user.companyName || '');
      setCompanyWebsite(user.companyWebsite || '');
      setCompanyDescription(user.companyDescription || '');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        addToast('Only PDF files are accepted!', 'danger');
        e.target.value = null;
        setResume(null);
      } else {
        setResume(file);
      }
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      addToast('Name is required', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('name', name);

      if (user.role === 'Candidate') {
        formData.append('bio', bio);
        formData.append('skills', skills);
        if (resume) {
          formData.append('resume', resume);
        }
      }

      if (user.role === 'Recruiter') {
        formData.append('companyName', companyName);
        formData.append('companyWebsite', companyWebsite);
        formData.append('companyDescription', companyDescription);
      }

      const updatedUser = await updateProfile(formData);
      addToast('Profile updated successfully!', 'success');
      setResume(null); // Reset file upload input
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Error updating profile', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div className="main-content">Please login to view this page.</div>;

  return (
    <div className="main-content fade-in">
      <div style={headerStyle}>
        <h1 style={{ fontSize: '2rem' }}>Manage Profile</h1>
        <p style={{ color: 'var(--text-muted)' }}>Keep your credentials and preferences updated</p>
      </div>

      <div style={gridStyle}>
        
        {/* Left Card: Account Card Overview */}
        <div className="glass-panel" style={infoCardStyle}>
          <div style={avatarStyle}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.25rem', marginTop: '16px', textAlign: 'center' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>{user.email}</p>
          <span className="badge badge-primary" style={badgeStyle}>
            {user.role}
          </span>

          <hr style={{ borderColor: 'var(--border-color)', margin: '20px 0', width: '100%' }} />

          {/* Details based on Role */}
          {user.role === 'Candidate' ? (
            <div style={metaGroupStyle}>
              <div style={metaRowStyle}>
                <FileText size={16} color="var(--primary)" />
                <div>
                  <span style={metaLabel}>Resume</span>
                  {user.resumePath ? (
                    <a
                      href={user.resumePath.startsWith('http') ? user.resumePath : `${import.meta.env.VITE_API_URL || ''}${user.resumePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={resumeLinkStyle}
                    >
                      View Resume (PDF)
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.85rem', color: 'var(--warning)' }}>No resume uploaded</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div style={metaGroupStyle}>
              {user.companyName && (
                <div style={metaRowStyle}>
                  <Briefcase size={16} color="var(--primary)" />
                  <div>
                    <span style={metaLabel}>Company</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{user.companyName}</span>
                  </div>
                </div>
              )}
              {user.companyWebsite && (
                <div style={metaRowStyle}>
                  <Globe size={16} color="var(--primary)" />
                  <div>
                    <span style={metaLabel}>Website</span>
                    <a href={user.companyWebsite.startsWith('http') ? user.companyWebsite : `https://${user.companyWebsite}`} target="_blank" rel="noopener noreferrer" style={webLinkStyle}>
                      {user.companyWebsite}
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Card: Editor Form */}
        <div className="glass-panel" style={formPanelStyle}>
          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <h3 style={{ fontSize: '1.2rem', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
              Edit Personal Info
            </h3>

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                required
              />
            </div>

            {/* Candidate Form Fields */}
            {user.role === 'Candidate' && (
              <>
                <div className="form-group">
                  <label className="form-label">Professional Bio</label>
                  <textarea
                    placeholder="Tell recruiters about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="form-control"
                  ></textarea>
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, Mongoose, JavaScript"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="form-control"
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Type your skills separated by commas (e.g. React, Node.js, Python)
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Upload New Resume (PDF only)</label>
                  <div style={fileUploadWrapperStyle}>
                    <Upload size={18} color="var(--text-muted)" />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="form-control"
                      style={{ border: 'none', background: 'transparent', padding: 0 }}
                    />
                  </div>
                  {resume && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--success)', marginTop: '6px' }}>
                      Ready to upload: {resume.name}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Recruiter Form Fields */}
            {user.role === 'Recruiter' && (
              <>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    placeholder="Enter Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Website URL</label>
                  <input
                    type="text"
                    placeholder="e.g. google.com"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Company Description</label>
                  <textarea
                    placeholder="Brief overview of your company..."
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    className="form-control"
                  ></textarea>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={saveBtnStyle} disabled={isSubmitting}>
              <Save size={16} />
              {isSubmitting ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

// Layout style templates
const headerStyle = {
  marginBottom: '30px',
};

const gridStyle = {
  display: 'flex',
  gap: '30px',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
};

const infoCardStyle = {
  width: '320px',
  padding: '30px 24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flexShrink: 0,
  '@media (max-width: 768px)': {
    width: '100%',
  },
};

const avatarStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '2.5rem',
  fontWeight: '800',
  boxShadow: '0 8px 24px rgba(99, 102, 241, 0.25)',
  border: '2px solid rgba(255, 255, 255, 0.1)',
};

const badgeStyle = {
  marginTop: '12px',
  padding: '6px 14px',
  fontSize: '0.75rem',
};

const metaGroupStyle = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
};

const metaRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const metaLabel = {
  display: 'block',
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: 600,
};

const resumeLinkStyle = {
  fontSize: '0.85rem',
  color: 'var(--primary)',
  textDecoration: 'underline',
  fontWeight: 500,
};

const webLinkStyle = {
  fontSize: '0.85rem',
  color: 'var(--primary)',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  display: 'block',
  maxWidth: '220px',
};

const formPanelStyle = {
  flex: 1,
  padding: '30px',
  minWidth: '320px',
};

const fileUploadWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 16px',
  background: 'var(--bg-input)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
};

const saveBtnStyle = {
  alignSelf: 'flex-start',
  padding: '12px 24px',
};

export default CandidateProfile;
export { CandidateProfile };
