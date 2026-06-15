import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Save, PlusCircle, ArrowLeft } from 'lucide-react';

const PostJob = ({ onCompleted }) => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate company name from recruiter profile on mount
  useEffect(() => {
    if (user && user.companyName) {
      setCompanyName(user.companyName);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !companyName || !location || !description || !salaryRange) {
      addToast('Please fill in all required fields', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const postData = {
        title,
        companyName,
        location,
        description,
        requiredSkills, // Handled as string (comma separated) by backend controller
        experienceLevel,
        salaryRange,
        jobType,
      };

      await api.post('/api/jobs', postData);
      addToast('Job listing posted successfully!', 'success');

      // Call callback or redirect
      if (onCompleted) {
        onCompleted();
      } else {
        navigate('/recruiter');
      }
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || 'Failed to post job listing', 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel fade-in" style={formContainerStyle}>
      {/* Standalone Back header (shows only if loaded outside dashboard tab) */}
      {!onCompleted && (
        <button onClick={() => navigate('/recruiter')} style={backBtnStyle}>
          <ArrowLeft size={16} /> Back to dashboard
        </button>
      )}

      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PlusCircle size={22} color="var(--primary)" /> Post New Job Posting
      </h2>

      <form onSubmit={handleSubmit} style={formGrid}>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Job Title *</label>
          <input
            type="text"
            placeholder="e.g. Senior Full Stack Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Company Name *</label>
          <input
            type="text"
            placeholder="e.g. Google"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Location *</label>
          <input
            type="text"
            placeholder="e.g. Remote / Mountain View, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Job Type *</label>
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="form-control"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Experience Level *</label>
          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="form-control"
          >
            <option value="Entry">Entry Level</option>
            <option value="Mid">Mid Level</option>
            <option value="Senior">Senior Level</option>
            <option value="Lead">Lead Level</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Salary Range *</label>
          <input
            type="text"
            placeholder="e.g. $120,000 - $150,000"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Required Skills (comma separated)</label>
          <input
            type="text"
            placeholder="React, Node.js, AWS, CSS"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            className="form-control"
          />
        </div>

        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">Job Description *</label>
          <textarea
            placeholder="Outline job responsibilities, candidate specifications, and benefit summaries..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control"
            required
          ></textarea>
        </div>

        <div style={actionsRowStyle}>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={submitBtnStyle}>
            <Save size={16} /> {isSubmitting ? 'Posting...' : 'Create Job Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Styles for post job form panel
const formContainerStyle = {
  padding: '30px',
};

const formGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
};

const backBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '20px',
  fontSize: '0.9rem',
};

const actionsRowStyle = {
  gridColumn: 'span 2',
  display: 'flex',
  justifyContent: 'flex-start',
  marginTop: '10px',
};

const submitBtnStyle = {
  padding: '12px 24px',
};

export default PostJob;
export { PostJob };
