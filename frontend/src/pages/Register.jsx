import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Briefcase, ArrowRight } from 'lucide-react';

const Register = () => {
  const { register, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Candidate');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle auto-redirection if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'Admin') navigate('/admin');
      else if (user.role === 'Recruiter') navigate('/recruiter');
      else navigate('/jobs');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const registeredUser = await register(name, email, password, role);
      addToast(`Account created! Welcome, ${registeredUser.name}`, 'success');

      if (registeredUser.role === 'Recruiter') {
        navigate('/profile'); // Recruiters should configure their company details
      } else {
        navigate('/jobs');
      }
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errMsg);
      addToast(errMsg, 'danger');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={pageStyle}>
      <div className="glass-panel" style={cardStyle}>
        <div style={headerStyle}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join CareerPulse to hire talent or land your dream job</p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        {/* Role Toggle Selector */}
        <div style={roleToggleWrapper}>
          <button
            type="button"
            onClick={() => setRole('Candidate')}
            style={role === 'Candidate' ? roleActiveBtnStyle : roleBtnStyle}
          >
            <User size={16} />
            <span>Candidate</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('Recruiter')}
            style={role === 'Recruiter' ? roleActiveBtnStyle : roleBtnStyle}
          >
            <Briefcase size={16} />
            <span>Recruiter</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={inputWrapperStyle}>
              <User size={18} style={iconStyle} />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '45px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={inputWrapperStyle}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '45px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={inputWrapperStyle}>
              <Lock size={18} style={iconStyle} />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '45px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={btnStyle} disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={footerStyle}>
          Already have an account? <Link to="/login" style={linkStyle}>Log in here</Link>
        </div>
      </div>
    </div>
  );
};

// Layout style objects
const pageStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 150px)',
  padding: '30px 0',
};

const cardStyle = {
  maxWidth: '450px',
  width: '100%',
  padding: '40px 30px',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '24px',
};

const errorStyle = {
  background: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#ef4444',
  borderRadius: '6px',
  padding: '10px 14px',
  fontSize: '0.85rem',
  marginBottom: '20px',
  textAlign: 'center',
};

const roleToggleWrapper = {
  display: 'flex',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '8px',
  padding: '4px',
  marginBottom: '24px',
  gap: '4px',
};

const roleBtnStyle = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '10px 0',
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 500,
  fontSize: '0.9rem',
  transition: 'all 0.2s ease',
};

const roleActiveBtnStyle = {
  ...roleBtnStyle,
  background: 'var(--primary)',
  color: '#ffffff',
  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const inputWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const iconStyle = {
  position: 'absolute',
  left: '16px',
  color: 'var(--text-muted)',
};

const btnStyle = {
  width: '100%',
  padding: '12px',
  marginTop: '10px',
};

const footerStyle = {
  textAlign: 'center',
  marginTop: '24px',
  fontSize: '0.9rem',
  color: 'var(--text-muted)',
};

const linkStyle = {
  color: 'var(--primary)',
  fontWeight: 500,
};

export default Register;
