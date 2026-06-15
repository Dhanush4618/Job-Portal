import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, MapPin, Briefcase, TrendingUp, Users, ShieldCheck, ArrowRight } from 'lucide-react';

const Home = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = [];
    if (keyword) queryParams.push(`search=${encodeURIComponent(keyword)}`);
    if (location) queryParams.push(`location=${encodeURIComponent(location)}`);
    const queryStr = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    navigate(`/jobs${queryStr}`);
  };

  const handleQuickTagClick = (tag, type = 'search') => {
    navigate(`/jobs?${type}=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="fade-in" style={homeContainerStyle}>
      {/* Hero Section */}
      <section style={heroSectionStyle}>
        <div style={heroContentStyle}>
          <div style={badgeWrapperStyle}>
            <span style={heroBadgeStyle}>🚀 Next-Gen MERN Job Board</span>
          </div>
          <h1 style={heroTitleStyle}>
            Discover Your Next <span style={highlightTextStyle}>Career Leap</span>
          </h1>
          <p style={heroSubStyle}>
            Browse, bookmark, and apply to premium software engineering roles. Track your application status live from submission to offer.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="glass-panel" style={searchBoxStyle}>
            <div style={searchFieldStyle}>
              <Search size={20} color="var(--primary)" style={{ marginLeft: '12px' }} />
              <input
                type="text"
                placeholder="Job title, skills, keywords..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            <div style={dividerLineStyle}></div>
            <div style={searchFieldStyle}>
              <MapPin size={20} color="var(--primary)" style={{ marginLeft: '12px' }} />
              <input
                type="text"
                placeholder="City, remote, state..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={searchBtnStyle}>
              Find Jobs
            </button>
          </form>

          {/* Quick Tags */}
          <div style={quickTagsStyle}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Popular:</span>
            <button onClick={() => handleQuickTagClick('React')} style={quickTagBtnStyle}>React</button>
            <button onClick={() => handleQuickTagClick('Node.js')} style={quickTagBtnStyle}>Node.js</button>
            <button onClick={() => handleQuickTagClick('Remote', 'jobType')} style={quickTagBtnStyle}>Remote</button>
            <button onClick={() => handleQuickTagClick('Kubernetes')} style={quickTagBtnStyle}>Kubernetes</button>
            <button onClick={() => handleQuickTagClick('Internship', 'jobType')} style={quickTagBtnStyle}>Internship</button>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section style={statsSectionStyle}>
        <div className="stats-grid">
          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ color: 'var(--primary)' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">1,240+</div>
              <div className="stat-label">Active Listings</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ color: 'var(--secondary)' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">98%</div>
              <div className="stat-label">Response Rate</div>
            </div>
          </div>

          <div className="glass-panel stat-card">
            <div className="stat-icon" style={{ color: 'var(--success)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="stat-value">100%</div>
              <div className="stat-label">Verified Hirers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section style={featureSectionStyle}>
        <h2 style={sectionTitleStyle}>Designed for the Modern Ecosystem</h2>
        <div style={featureGridStyle}>
          <div className="glass-panel" style={featureCardStyle}>
            <div style={featureIconWrapper('#6366f1')}>
              <TrendingUp size={20} />
            </div>
            <h3 style={featureTitleStyle}>Live Job Analytics</h3>
            <p style={featureBodyStyle}>
              Admin interfaces gather aggregations across user volumes and job categories using optimized MongoDB aggregation frameworks.
            </p>
          </div>

          <div className="glass-panel" style={featureCardStyle}>
            <div style={featureIconWrapper('#a855f7')}>
              <Briefcase size={20} />
            </div>
            <h3 style={featureTitleStyle}>Triple-Role Engine</h3>
            <p style={featureBodyStyle}>
              Integrated dashboards with customized viewports mapped dynamically to candidates, recruiters, and administrative moderator accounts.
            </p>
          </div>

          <div className="glass-panel" style={featureCardStyle}>
            <div style={featureIconWrapper('#10b981')}>
              <Users size={20} />
            </div>
            <h3 style={featureTitleStyle}>Status Tracking & Alerts</h3>
            <p style={featureBodyStyle}>
              Submit applications, track real-time hiring updates, and receive automated HTML notifications utilizing Nodemailer.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="glass-panel" style={ctaSectionStyle}>
        <div>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Ready to launch your search?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Create a candidate profile, upload your resume, and start applying today.</p>
        </div>
        <Link to="/register" className="btn btn-primary" style={{ padding: '12px 28px' }}>
          Get Started <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
};

// Inline Layout Styles
const homeContainerStyle = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '40px 20px',
};

const heroSectionStyle = {
  padding: '60px 0 40px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const heroContentStyle = {
  maxWidth: '800px',
};

const badgeWrapperStyle = {
  marginBottom: '20px',
};

const heroBadgeStyle = {
  background: 'rgba(99, 102, 241, 0.1)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  color: 'var(--primary)',
  padding: '6px 14px',
  borderRadius: '20px',
  fontSize: '0.85rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const heroTitleStyle = {
  fontSize: '3.5rem',
  lineHeight: '1.1',
  marginBottom: '20px',
  fontFamily: "'Outfit', sans-serif",
  fontWeight: '800',
  '@media (max-width: 640px)': {
    fontSize: '2.5rem',
  },
};

const highlightTextStyle = {
  background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

const heroSubStyle = {
  fontSize: '1.2rem',
  color: 'var(--text-muted)',
  marginBottom: '40px',
  lineHeight: '1.5',
};

const searchBoxStyle = {
  display: 'flex',
  alignItems: 'center',
  padding: '8px',
  width: '100%',
  background: 'rgba(17, 24, 39, 0.85)',
  gap: '8px',
  '@media (max-width: 768px)': {
    flexDirection: 'column',
    padding: '16px',
  },
};

const searchFieldStyle = {
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  width: '100%',
};

const searchInputStyle = {
  width: '100%',
  padding: '12px 14px',
  background: 'none',
  border: 'none',
  outline: 'none',
  color: '#ffffff',
  fontSize: '0.95rem',
};

const dividerLineStyle = {
  width: '1px',
  height: '30px',
  background: 'rgba(255, 255, 255, 0.08)',
  '@media (max-width: 768px)': {
    display: 'none',
  },
};

const searchBtnStyle = {
  padding: '12px 24px',
  fontSize: '0.95rem',
  '@media (max-width: 768px)': {
    width: '100%',
  },
};

const quickTagsStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '20px',
};

const quickTagBtnStyle = {
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '4px',
  color: 'var(--text-muted)',
  padding: '4px 10px',
  fontSize: '0.8rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  ':hover': {
    color: '#ffffff',
    borderColor: 'var(--primary)',
  },
};

const statsSectionStyle = {
  margin: '40px 0 60px 0',
};

const featureSectionStyle = {
  margin: '60px 0',
  textAlign: 'center',
};

const sectionTitleStyle = {
  fontSize: '2rem',
  marginBottom: '40px',
};

const featureGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '24px',
};

const featureCardStyle = {
  padding: '30px',
  textAlign: 'left',
  height: '100%',
};

const featureIconWrapper = (color) => ({
  width: '42px',
  height: '42px',
  borderRadius: '8px',
  background: `rgba(${color === '#6366f1' ? '99, 102, 241' : color === '#a855f7' ? '168, 85, 247' : '16, 185, 129'}, 0.15)`,
  color: color,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
  border: `1px solid rgba(${color === '#6366f1' ? '99, 102, 241' : color === '#a855f7' ? '168, 85, 247' : '16, 185, 129'}, 0.25)`,
});

const featureTitleStyle = {
  fontSize: '1.25rem',
  marginBottom: '10px',
};

const featureBodyStyle = {
  color: 'var(--text-muted)',
  fontSize: '0.9rem',
};

const ctaSectionStyle = {
  padding: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '20px',
  marginTop: '40px',
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
};

export default Home;
