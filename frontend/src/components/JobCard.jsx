import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Briefcase, Award, Bookmark, BookmarkCheck, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const JobCard = ({ job, isSaved, onSaveToggle, onDelete }) => {
  const { user } = useAuth();
  const isCandidate = user && user.role === 'Candidate';
  const isAdmin = user && user.role === 'Admin';
  const isOwner = user && job.recruiter && (job.recruiter._id === user._id || job.recruiter === user._id);

  const getCompanyInitial = () => {
    return job.companyName ? job.companyName.charAt(0).toUpperCase() : 'J';
  };

  const getJobTypeBadgeClass = (type) => {
    switch (type) {
      case 'Full-time': return 'badge-primary';
      case 'Part-time': return 'badge-secondary';
      case 'Internship': return 'badge-warning';
      case 'Remote': return 'badge-success';
      default: return 'badge-primary';
    }
  };

  return (
    <div className="glass-panel fade-in" style={cardStyle}>
      {/* Top Header */}
      <div style={cardHeaderStyle}>
        <div style={avatarStyle}>
          {getCompanyInitial()}
        </div>
        <div style={headerTextGroup}>
          <h3 style={titleStyle}>{job.title}</h3>
          <p style={companyStyle}>{job.companyName}</p>
        </div>

        {/* Action icons (Bookmark/Trash) */}
        {isCandidate && onSaveToggle && (
          <button onClick={() => onSaveToggle(job._id)} style={bookmarkBtnStyle} title={isSaved ? "Unsave Job" : "Save Job"}>
            {isSaved ? <BookmarkCheck size={20} color="var(--primary)" /> : <Bookmark size={20} color="var(--text-muted)" />}
          </button>
        )}

        {(isAdmin || isOwner) && onDelete && (
          <button onClick={() => onDelete(job._id)} style={deleteBtnStyle} title="Delete Job">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Middle Specs */}
      <div style={specsContainer}>
        <div style={specItemStyle}>
          <MapPin size={15} color="var(--text-muted)" />
          <span style={specTextStyle}>{job.location}</span>
        </div>
        <div style={specItemStyle}>
          <DollarSign size={15} color="var(--text-muted)" />
          <span style={specTextStyle}>{job.salaryRange}</span>
        </div>
      </div>

      {/* Badges */}
      <div style={badgesContainer}>
        <span className={`badge ${getJobTypeBadgeClass(job.jobType)}`}>
          <Briefcase size={12} style={{ marginRight: '4px' }} />
          {job.jobType}
        </span>
        <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-main)' }}>
          <Award size={12} style={{ marginRight: '4px' }} />
          {job.experienceLevel}
        </span>
      </div>

      {/* Skills tags */}
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div style={skillsContainer}>
          {job.requiredSkills.slice(0, 3).map((skill, index) => (
            <span key={index} style={skillTagStyle}>
              {skill}
            </span>
          ))}
          {job.requiredSkills.length > 3 && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>
              +{job.requiredSkills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer link */}
      <div style={cardFooterStyle}>
        <Link to={`/jobs/${job._id}`} className="btn btn-secondary" style={viewBtnStyle}>
          View Details
        </Link>
      </div>
    </div>
  );
};

// Styling for premium JobCard panels
const cardStyle = {
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  position: 'relative',
};

const cardHeaderStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '16px',
  marginBottom: '16px',
};

const avatarStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: '800',
  fontSize: '1.2rem',
  border: '1px solid rgba(255, 255, 255, 0.08)',
};

const headerTextGroup = {
  flex: 1,
  minWidth: 0, // Prevents text overflow blowouts
};

const titleStyle = {
  fontSize: '1.15rem',
  color: '#ffffff',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const companyStyle = {
  fontSize: '0.9rem',
  color: 'var(--text-muted)',
};

const bookmarkBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.2s ease',
};

const deleteBtnStyle = {
  background: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.15)',
  color: '#ef4444',
  width: '32px',
  height: '32px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
};

const specsContainer = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '16px',
  marginBottom: '16px',
};

const specItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
};

const specTextStyle = {
  fontSize: '0.85rem',
  color: 'var(--text-muted)',
};

const badgesContainer = {
  display: 'flex',
  gap: '8px',
  marginBottom: '16px',
};

const skillsContainer = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  marginBottom: '24px',
};

const skillTagStyle = {
  fontSize: '0.75rem',
  padding: '3px 8px',
  borderRadius: '4px',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  color: 'var(--text-muted)',
};

const cardFooterStyle = {
  marginTop: 'auto',
  width: '100%',
};

const viewBtnStyle = {
  width: '100%',
  fontSize: '0.85rem',
  padding: '8px 16px',
};

export default JobCard;
