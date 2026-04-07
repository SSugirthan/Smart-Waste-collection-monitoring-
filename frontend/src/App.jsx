import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BinList from './components/BinList';
import Login from './components/Login';
import Reports from './components/Reports';
import Fleet from './components/Fleet';

function RequireAuth({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  if (!token) return <Navigate to="/login" replace />;
  
  // Explicit route guarding using user roles!
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; // Kick standard users back to Dashboard
  }
  
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Standard User & Admin views */}
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/bins" element={<RequireAuth><BinList /></RequireAuth>} />
        
        {/* Admin Explicit Route Views */}
        <Route path="/reports" element={
          <RequireAuth allowedRoles={['admin']}><Reports /></RequireAuth>
        } />
        <Route path="/fleet" element={
          <RequireAuth allowedRoles={['admin']}><Fleet /></RequireAuth>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
