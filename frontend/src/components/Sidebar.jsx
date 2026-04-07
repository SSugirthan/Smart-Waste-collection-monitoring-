import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trash2, FileText, Truck, LogOut, Check, ShieldAlert, User } from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  
  const role = localStorage.getItem('role') || 'user';
  const username = localStorage.getItem('username') || 'User';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '4px', paddingBottom: '16px'}}>
         <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
           <Trash2 color="var(--primary)" /> Smart Waste
         </div>
         <span style={{fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap:'6px', marginTop:'8px'}}>
           {role === 'admin' ? <ShieldAlert size={14} color="var(--primary)" /> : <User size={14} color="var(--success)" />}
           Logged in: <strong style={{color: 'var(--text-main)', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis'}}>{username}</strong> ({role.toUpperCase()})
         </span>
      </div>
      
      <nav className="nav-links">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <LayoutDashboard size={20} /> Dashboard Overview
        </Link>
        <Link to="/bins" className={`nav-item ${location.pathname === '/bins' ? 'active' : ''}`}>
          <Trash2 size={20} /> Waste Registry
        </Link>
        
        {/* Conditionally Rendered Links specifically retaining Admin routing isolation completely securely! */}
        {role === 'admin' && (
           <>
            <div style={{fontSize: '0.75rem', fontWeight: 700, margin: '16px 0 8px', color: 'var(--text-muted)'}}>ADMIN CONTROLS</div>
            <Link to="/fleet" className={`nav-item ${location.pathname === '/fleet' ? 'active' : ''}`}>
              <Truck size={20} /> Fleet System
            </Link>
            <Link to="/reports" className={`nav-item ${location.pathname === '/reports' ? 'active' : ''}`}>
              <FileText size={20} /> Full Analytics
            </Link>
          </>
        )}
      </nav>

      {/* Theme Toggles */}
      <div className="theme-selector">
        <button 
          title="Dark Theme"
          className={`theme-btn t-dark ${theme === 'dark' ? 'active' : ''}`} 
          onClick={() => setTheme('dark')}
        >
           {theme === 'dark' && <Check size={14} color="#fff" style={{margin: 'auto'}}/>}
        </button>
        <button 
          title="Light Theme"
          className={`theme-btn t-light ${theme === 'light' ? 'active' : ''}`} 
          onClick={() => setTheme('light')} 
        >
           {theme === 'light' && <Check size={14} color="#000" style={{margin: 'auto'}}/>}
        </button>
        <button 
          title="Eco Theme"
          className={`theme-btn t-eco ${theme === 'eco' ? 'active' : ''}`} 
          onClick={() => setTheme('eco')} 
        >
           {theme === 'eco' && <Check size={14} color="#fff" style={{margin: 'auto'}}/>}
        </button>
      </div>
      
      <div style={{padding: '20px'}}>
        <button onClick={onLogout} style={{width: '100%', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', fontWeight: 600}}>
          <LogOut size={18} /> Sign Out Safe
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
