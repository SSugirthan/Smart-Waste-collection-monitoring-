import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, User, ShieldCheck } from 'lucide-react';
import axios from 'axios';

function Login() {
  const [loginType, setLoginType] = useState('admin'); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (loginType === 'admin' && username === 'Sugirthan' && password === 'sugir1192006') {
         localStorage.setItem('token', 'mock_verified_admin');
         localStorage.setItem('username', 'Sugirthan');
         localStorage.setItem('role', 'admin');
         navigate('/');
         return;
      }
      
      if (loginType === 'user' && password === '1234') {
         localStorage.setItem('token', 'mock_verified_user');
         localStorage.setItem('username', username || 'General User');
         localStorage.setItem('role', 'user');
         navigate('/');
         return;
      }
      
      const res = await axios.post('http://localhost:5000/api/auth/login', { username, password, loginType });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', res.data.username);
      localStorage.setItem('role', res.data.role); 
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || (loginType === 'admin' ? `Admin login failed. Try checking your passcode.` : `User login failed. Ensure correct password (1234).`));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      
      <div className="login-card glass-panel" style={{zIndex: 10, position: 'relative'}}>
        
        {/* Toggle Admin vs User */}
        <div style={{display: 'flex', gap: '8px', marginBottom: '24px', background: 'rgba(0,0,0,0.2)', padding:'4px', borderRadius:'12px'}}>
           <button 
             onClick={() => { setLoginType('admin'); setError(''); }}
             style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: loginType === 'admin' ? 'var(--primary)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 600, transition: '0.3s'}}
           >
             <ShieldCheck size={18} /> Admin Portal
           </button>
           <button 
             onClick={() => { setLoginType('user'); setError(''); }}
             style={{flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: loginType === 'user' ? 'var(--success)' : 'transparent', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', fontWeight: 600, transition: '0.3s'}}
           >
             <User size={18} /> General User
           </button>
        </div>

        <div className="login-header">
          <div className="login-logo">
            <Leaf size={48} color={loginType === 'admin' ? 'var(--primary)' : 'var(--success)'} style={{transition: '0.3s'}}/>
          </div>
          <h2>Smart Waste Platform</h2>
          <p>Login to your {loginType === 'admin' ? 'Management System' : 'User Interface'} dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          {error && <div className="login-error">{error}</div>}
          
          <div className="form-group">
            <label>Provider Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              placeholder={loginType === 'admin' ? "e.g. Sugirthan" : "e.g. Any User Name"}
              autoComplete="username"
              required 
            />
          </div>
          <div className="form-group">
            <label>Passcode Auth</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••"
              autoComplete="current-password"
              required 
            />
          </div>
          
          <button type="submit" className="login-btn" style={{background: loginType === 'admin' ? 'var(--primary)' : 'var(--success)'}} disabled={loading}>
            {loading ? 'Authenticating...' : `Enter securely as ${loginType === 'admin' ? 'System Admin' : 'Standard User'}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
