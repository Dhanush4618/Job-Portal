import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Briefcase, LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addToast('Successfully logged out', 'info');
      navigate('/login');
    } catch (err) {
      addToast('Logout failed', 'danger');
    }
  };

  const activeStyle = ({ isActive }) => ({
    color: isActive ? '#ffffff' : '#9ca3af',
    borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
    paddingBottom: '4px',
    fontWeight: isActive ? '600' : '400',
  });

  return (
    <nav style={navStyle}>
      <div style={containerStyle}>

        {/* Logo */}
        <Link to="/" style={logoStyle}>
          <div style={logoIconStyle}>
            <Briefcase size={22} color="#ffffff" />
          </div>
          <span style={logoTextStyle}>
            Career<span style={{ color: '#a855f7' }}>Pulse</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div style={desktopLinksStyle}>
          <NavLink to="/jobs" style={activeStyle}>
            Jobs
          </NavLink>

          {user?.role === 'Candidate' && (
            <>
              <NavLink to="/applications" style={activeStyle}>
                My Applications
              </NavLink>

              <NavLink to="/saved" style={activeStyle}>
                Saved Jobs
              </NavLink>
            </>
          )}

          {user?.role === 'Recruiter' && (
            <>
              <NavLink to="/recruiter" style={activeStyle}>
                Dashboard
              </NavLink>
            </>
          )}

          {user?.role === 'Admin' && (
            <NavLink to="/admin" style={activeStyle}>
              Admin Panel
            </NavLink>
          )}
        </div>

        {/* User Actions */}
        <div style={actionsStyle}>
          {user ? (
            <div style={profileGroupStyle}>
              <Link to="/profile" style={profileBtnStyle}>
                <User size={16} />
                <span style={profileNameStyle}>
                  {user.name.split(' ')[0]}
                </span>
                <span style={roleBadgeStyle}>
                  {user.role}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                style={logoutBtnStyle}
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={authButtonsStyle}>
              <Link to="/login" style={loginBtnStyle}>
                Login
              </Link>

              <Link to="/register" style={registerBtnStyle}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

const navStyle = {
  background: 'rgba(3, 7, 18, 0.75)',
  backdropFilter: 'blur(16px)',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  width: '100%',
};

const containerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '0 20px',
  height: '70px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontWeight: '800',
  fontSize: '1.4rem',
  letterSpacing: '-0.03em',
};

const logoIconStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const logoTextStyle = {
  color: '#ffffff',
};

const desktopLinksStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '30px',
  marginRight: 'auto',
  marginLeft: '40px',
};

const actionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const profileGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const profileBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '20px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  fontSize: '0.9rem',
};

const profileNameStyle = {
  fontWeight: 500,
  color: '#ffffff',
};

const roleBadgeStyle = {
  fontSize: '0.7rem',
  padding: '2px 8px',
  borderRadius: '12px',
  background: 'rgba(168, 85, 247, 0.15)',
  color: '#a855f7',
  fontWeight: 'bold',
  textTransform: 'uppercase',
};

const logoutBtnStyle = {
  background: 'rgba(239,68,68,0.1)',
  border: '1px solid rgba(239,68,68,0.15)',
  color: '#ef4444',
  width: '34px',
  height: '34px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

const authButtonsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
};

const loginBtnStyle = {
  fontSize: '0.95rem',
  color: '#9ca3af',
  padding: '8px 16px',
};

const registerBtnStyle = {
  fontSize: '0.95rem',
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  color: '#ffffff',
  padding: '8px 18px',
  borderRadius: '8px',
  fontWeight: 500,
};

export default Navbar;