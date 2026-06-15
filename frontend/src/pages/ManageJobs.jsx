import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import { Loading } from '../components/ProtectedRoute';
import { Edit3, Trash2, Users, Save, X, Briefcase } from 'lucide-react';

const ManageJobs = ({ jobs: passedJobs, onDelete: passedOnDelete }) => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Edit Modal state
  const [editingJob, setEditingJob] = useState(null);
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry');
  const [salaryRange, setSalaryRange] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [isSaving, setIsSaving] = useState(false);

  const fetchRecruiterJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/jobs/recruiter/myjobs');
      setJobs(res.data);
    } catch (err) {
      addToast('Failed to retrieve job posts', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If not embedded, fetch jobs list
    if (!passedJobs) {
      fetchRecruiterJobs();
    } else {
      setJobs(passedJobs);
    }
  }, [passedJobs]);

  const handleDelete = async (jobId) => {
    if (passedOnDelete) {
      passedOnDelete(jobId);
    } else {
      if (window.confirm('Are you sure you want to delete this job post?')) {
        try {
          await api.delete(`/api/jobs/${jobId}`);
          addToast('Job posting deleted successfully', 'success');
          setJobs(jobs.filter((j) => j._id !== jobId));
        } catch (err) {
          addToast('Deletion failed', 'danger');
        }
      }
    }
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setTitle(job.title || '');
    setCompanyName(job.companyName || '');
    setLocation(job.location || '');
    setDescription(job.description || '');
    setRequiredSkills(job.requiredSkills ? job.requiredSkills.join(', ') : '');
    setExperienceLevel(job.experienceLevel || 'Entry');
    setSalaryRange(job.salaryRange || '');
    setJobType(job.jobType || 'Full-time');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!title || !companyName || !location || !description || !salaryRange) {
      addToast('Required fields are missing', 'warning');
      return;
    }

    try {
      setIsSaving(true);
      const updateData = {
        title,
        companyName,
        location,
        description,
        requiredSkills,
        experienceLevel,
        salaryRange,
        jobType,
      };

      const res = await api.put(`/api/jobs/${editingJob._id}`, updateData);
      
      // Update local state list
      setJobs(jobs.map((j) => (j._id === editingJob._id ? res.data : j)));
      
      addToast('Job listing updated successfully!', 'success');
      setEditingJob(null);
    } catch (err) {
      addToast('Failed to update job listing', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="glass-panel fade-in" style={containerStyle}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Briefcase size={22} color="var(--primary)" /> Manage Job Postings
      </h2>

      {jobs.length === 0 ? (
        <div style={emptyStyle}>
          <p style={{ color: 'var(--text-muted)' }}>You haven't posted any jobs yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Experience</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id}>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>{job.title}</td>
                  <td>
                    <span className="badge badge-primary">{job.jobType}</span>
                  </td>
                  <td>{job.experienceLevel}</td>
                  <td>{job.salaryRange}</td>
                  <td>
                    <div style={actionsGroupStyle}>
                      <Link
                        to={`/jobs/${job._id}/applicants`}
                        className="btn btn-secondary"
                        style={rowBtnStyle}
                        title="View Candidates"
                      >
                        <Users size={14} />
                      </Link>
                      <button
                        onClick={() => openEditModal(job)}
                        className="btn btn-secondary"
                        style={{ ...rowBtnStyle, color: 'var(--primary)', borderColor: 'var(--primary-glow)' }}
                        title="Edit Job"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="btn btn-secondary"
                        style={{ ...rowBtnStyle, color: 'var(--danger)', borderColor: 'var(--danger-glow)' }}
                        title="Delete Job"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content fade-in" style={{ maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={modalHeaderStyle}>
              <h2 style={{ fontSize: '1.4rem' }}>Edit Job Specifications</h2>
              <button onClick={() => setEditingJob(null)} style={closeBtnStyle}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={formGrid}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Job Title *</label>
                <input
                  type="text"
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
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  className="form-control"
                />
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Job Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                  required
                ></textarea>
              </div>

              <div style={modalActionsStyle}>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="btn btn-secondary"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                  <Save size={14} /> {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styling definitions
const containerStyle = {
  padding: '30px',
};

const emptyStyle = {
  padding: '20px 0',
  textAlign: 'center',
};

const actionsGroupStyle = {
  display: 'flex',
  gap: '8px',
};

const rowBtnStyle = {
  width: '32px',
  height: '32px',
  padding: 0,
  borderRadius: '6px',
};

const modalHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  paddingBottom: '12px',
  borderBottom: '1px solid var(--border-color)',
};

const closeBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  cursor: 'pointer',
};

const formGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px',
};

const modalActionsStyle = {
  gridColumn: 'span 2',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  marginTop: '16px',
};

export default ManageJobs;
export { ManageJobs };
