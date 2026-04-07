import { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DUMMY_BINS = [
  { _id: '1', locationName: 'Downtown Plaza', latitude: 40.7128, longitude: -74.0060, fillLevel: 45, status: 'Normal', lastUpdated: new Date() },
  { _id: '2', locationName: 'City Square East', latitude: 40.7142, longitude: -74.0064, fillLevel: 92, status: 'Critical', lastUpdated: new Date() },
  { _id: '3', locationName: 'Main Street Mall', latitude: 40.7155, longitude: -74.0040, fillLevel: 10, status: 'Normal', lastUpdated: new Date() },
  { _id: '4', locationName: 'University Campus', latitude: 40.7160, longitude: -74.0080, fillLevel: 78, status: 'Full', lastUpdated: new Date() },
];

function Dashboard() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = localStorage.getItem('role') || 'user';
  const username = localStorage.getItem('username') || 'General User';

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bins');
        if (res.data && res.data.length > 0) {
           setBins(res.data);
           localStorage.setItem('cached_bins', JSON.stringify(res.data));
        } else {
           setBins([]);
        }
      } catch (err) {
        console.error('Backend DB offline, utilizing local persistent caching.');
        const cached = localStorage.getItem('cached_bins');
        if (cached) {
            setBins(JSON.parse(cached));
        } else {
            setBins(DUMMY_BINS);
            localStorage.setItem('cached_bins', JSON.stringify(DUMMY_BINS));
        }
      } finally {
        setLoading(false);
      }
    };
    fetchBins();
    const interval = setInterval(fetchBins, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalBins = bins.length;
  const criticalBins = bins.filter(b => b.status === 'Critical').length;
  const normalBins = bins.filter(b => b.status === 'Normal' || b.status === 'Maintenance').length;

  const chartData = bins.map(b => ({
    name: b.locationName.split(' ')[0], 
    fillLevel: b.fillLevel,
    status: b.status
  }));

  const getBarColor = (status) => {
    if (status === 'Critical') return 'var(--danger)';
    if (status === 'Full') return 'var(--warning)';
    return 'var(--success)';
  };

  if (loading) return <div>Loading dashboard parameters...</div>;

  return (
    <div className="dashboard">
      <div style={{marginBottom: '32px'}}>
        <h1 className="page-title" style={{marginBottom: '8px'}}>Monitoring Dashboard</h1>
        <p style={{color: 'var(--text-muted)'}}>
            Welcome back, <strong>{username}</strong>! You represent a 
            <span style={{color: role === 'admin' ? 'var(--primary)' : 'var(--success)'}}> {role.toUpperCase()} </span> 
            level access configuration to this framework.
        </p>
      </div>
      
      <div className="stat-grid">
        <div className="glass-panel stat-card">
          <div className="stat-icon blue"><Package /></div>
          <div className="stat-info"><h3>Total Bins Supported</h3><p>{totalBins}</p></div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon red"><AlertTriangle /></div>
          <div className="stat-info"><h3>Urgent Actions Required</h3><p>{criticalBins}</p></div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon green"><CheckCircle /></div>
          <div className="stat-info"><h3>System Normal Status</h3><p>{normalBins}</p></div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px'}}>
        
        {/* Dynamic Chart only rendered if Admin, User gets a completely targeted generalized user view layout specifically mapping new requirements */}
        {role === 'admin' ? (
          <div className="glass-panel" style={{minHeight: '350px'}}>
            <h2 style={{fontSize: '1.25rem', marginBottom: '16px'}}>Live Fill Levels Overview</h2>
            <div style={{height: '250px', width: '100%'}}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                    contentStyle={{backgroundColor: 'var(--panel-bg)', borderColor: 'var(--border)', borderRadius: '8px', color: '#fff'}} 
                  />
                  <Bar dataKey="fillLevel" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--success)'}}>
             <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: 'var(--success)'}}>User Operations Focus</h2>
             <p style={{color: 'var(--text-main)', lineHeight: 1.5}}>
               Welcome to your User Interface. You now have complete access permissions to navigate directly into the <strong>Waste Registry</strong> to log incoming data, clear routing node information, and add new waste payload data tracking points immediately!
             </p>
          </div>
        )}
        
        <div className="glass-panel" style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
           <h2 style={{fontSize: '1.25rem'}}>{role === 'admin' ? 'Network Intelligence' : 'Status Variables'}</h2>
           
           <div style={{padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: '12px', border: '1px solid rgba(59,130,246,0.2)'}}>
             <h3 style={{color: 'var(--primary)', marginBottom: '8px', fontSize: '1rem'}}>Weather Optimization</h3>
             <p style={{fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4}}>
                Clear conditions detected. Scheduled collection routing is operating at peak efficiency. No delays expected in downtown districts.
             </p>
           </div>
           
           {role === 'admin' && (
               <div style={{padding: '16px', background: 'rgba(16,185,129,0.1)', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.2)'}}>
                 <h3 style={{color: 'var(--success)', marginBottom: '8px', fontSize: '1rem'}}>Active Sub-vehicles</h3>
                 <p style={{fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4}}>
                   <strong>4 automated waste trucks</strong> are currently responsive on natively optimized GPS grids locally targeting your coordinates.
                 </p>
               </div>
           )}
        </div>
      </div>

      <div className="glass-panel">
        <h2 style={{fontSize: '1.25rem', marginBottom: '16px'}}>Recent Urgent Alerts</h2>
        {criticalBins === 0 ? (
           <p style={{color: 'var(--success)'}}>No critical alerts currently active in system.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr><th>Target Sector / Location</th><th>Current Fill Level</th><th>Status</th></tr>
            </thead>
            <tbody>
              {bins.filter(b => b.status === 'Critical' || (role === 'user' && b.status === 'Full')).map(bin => (
                <tr key={bin._id} className="table-row-animate">
                  <td>{bin.locationName}</td>
                  <td style={{width: '30%'}}>
                    <div className="fill-bar-bg">
                      <div className="fill-bar" style={{ width: `${bin.fillLevel}%`, backgroundColor: bin.status === 'Critical' ? 'var(--danger)' : 'var(--warning)' }}></div>
                    </div>
                    <span style={{fontSize: '0.75rem', marginTop: '4px', display:'block'}}>{bin.fillLevel}% Full Memory</span>
                  </td>
                  <td><span className={`badge ${bin.status.toLowerCase()}`}>{bin.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
