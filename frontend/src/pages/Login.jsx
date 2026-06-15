import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, ArrowRight, Info } from 'lucide-react';

const Login = () => {
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const loggedUser = await login(email, password);
      addToast(`Welcome back, ${loggedUser.name}!`, 'success');
      
      // Redirect based on role
      if (loggedUser.role === 'Admin') navigate('/admin');
      else if (loggedUser.role === 'Recruiter') navigate('/recruiter');
      else navigate('/jobs');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
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
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log in to access your jobs and applications</p>
        </div>

        {/* Demo Accounts Info */}
        <div style={demoBoxStyle}>
          <div style={{ display: 'flex', gap: '8px', color: 'var(--primary)' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Demo Credentials</span>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Candidate: <strong>alice@candidate.com</strong> / password123 <br />
            Recruiter: <strong>sarah@google.com</strong> / password123 <br />
            Admin: <strong>admin@jobportal.com</strong> / password123
          </p>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={formStyle}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={inputWrapperStyle}>
              <Mail size={18} style={iconStyle} />
              <input
                type="email"
                placeholder="name@company.com"
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '45px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={btnStyle} disabled={isSubmitting}>
            {isSubmitting ? 'Logging in...' : 'Log In'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={footerStyle}>
          Don't have an account? <Link to="/register" style={linkStyle}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

// Styles for login page
const pageStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 'calc(100vh - 150px)',
  padding: '20px 0',
};

const cardStyle = {
  maxWidth: '420px',
  width: '100%',
  padding: '40px 30px',
};

const headerStyle = {
  textAlign: 'center',
  marginBottom: '24px',
};

const demoBoxStyle = {
  background: 'rgba(99, 102, 241, 0.06)',
  border: '1px solid rgba(99, 102, 241, 0.15)',
  borderRadius: '8px',
  padding: '12px 16px',
  marginBottom: '20px',
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

export default Login;
