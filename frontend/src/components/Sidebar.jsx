import React from 'react';
import { LayoutDashboard, PlusSquare, Briefcase, Users, FileText, Settings } from 'lucide-react';

const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const getRecruiterLinks = () => [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'post', name: 'Post Job', icon: <PlusSquare size={18} /> },
    { id: 'manage', name: 'Manage Jobs', icon: <Briefcase size={18} /> },
  ];

  const getAdminLinks = () => [
    { id: 'overview', name: 'Analytics', icon: <LayoutDashboard size={18} /> },
    { id: 'users', name: 'All Users', icon: <Users size={18} /> },
    { id: 'jobs', name: 'All Jobs', icon: <Briefcase size={18} /> },
  ];

  const links = role === 'Admin' ? getAdminLinks() : getRecruiterLinks();

  return (
    <aside className="glass-panel" style={sidebarStyle}>
      <div style={headerStyle}>
        <div style={avatarStyle}>
          {role[0]}
        </div>
        <div>
          <h4 style={{ fontSize: '1rem', color: '#ffffff' }}>Control Center</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{role} Panel</p>
        </div>
      </div>
      
      <nav style={navStyle}>
        {links.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              style={isActive ? activeItemStyle : itemStyle}
            >
              {link.icon}
              <span>{link.name}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

// Styles for custom dashboard sidebar
const sidebarStyle = {
  padding: '24px 16px',
  height: 'fit-content',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  position: 'sticky',
  top: '94px', // Below navbar + spacing
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  paddingBottom: '16px',
  borderBottom: '1px solid var(--border-color)',
};

const avatarStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
  color: '#ffffff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '1rem',
};

const navStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
};

const itemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 16px',
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  borderRadius: '8px',
  cursor: 'pointer',
  textAlign: 'left',
  width: '100%',
  fontWeight: 500,
  fontSize: '0.95rem',
  transition: 'all 0.2s ease',
};

const activeItemStyle = {
  ...itemStyle,
  background: 'var(--primary-glow)',
  color: '#ffffff',
  borderLeft: '3px solid var(--primary)',
  paddingLeft: '13px', // Keep alignment
};

export default Sidebar;
