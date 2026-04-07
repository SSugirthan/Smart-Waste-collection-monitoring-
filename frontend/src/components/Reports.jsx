import { useState, useEffect } from 'react';
import { 
  FileText, Download, Search, Filter, 
  TrendingUp, BarChart3, PieChart as PieIcon, 
  MapPin, Calendar, Layers 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import axios from 'axios';

const DUMMY_BINS = [
  { _id: '1', locationName: 'Downtown Plaza', latitude: 40.7128, longitude: -74.0060, fillLevel: 45, status: 'Normal', lastUpdated: new Date() },
  { _id: '2', locationName: 'City Square East', latitude: 40.7142, longitude: -74.0064, fillLevel: 92, status: 'Critical', lastUpdated: new Date() },
  { _id: '3', locationName: 'Main Street Mall', latitude: 40.7155, longitude: -74.0040, fillLevel: 10, status: 'Normal', lastUpdated: new Date() },
  { _id: '4', locationName: 'University Campus', latitude: 40.7160, longitude: -74.0080, fillLevel: 78, status: 'Full', lastUpdated: new Date() },
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

function Reports() {
  const [bins, setBins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/bins');
        if (res.data && res.data.length > 0) {
          setBins(res.data);
          localStorage.setItem('cached_bins', JSON.stringify(res.data));
        } else {
          const cached = localStorage.getItem('cached_bins');
          setBins(cached ? JSON.parse(cached) : DUMMY_BINS);
        }
      } catch (err) {
        const cached = localStorage.getItem('cached_bins');
        setBins(cached ? JSON.parse(cached) : DUMMY_BINS);
      } finally {
        setLoading(false);
      }
    };
    fetchBins();
  }, []);

  const filteredBins = bins.filter(bin => {
    const matchesSearch = bin.locationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || bin.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const avgFill = bins.length ? (bins.reduce((acc, b) => acc + b.fillLevel, 0) / bins.length).toFixed(1) : 0;
  const criticalCount = bins.filter(b => b.status === 'Critical').length;
  
  const statusData = [
    { name: 'Normal', value: bins.filter(b => b.status === 'Normal').length },
    { name: 'Full', value: bins.filter(b => b.status === 'Full').length },
    { name: 'Critical', value: bins.filter(b => b.status === 'Critical').length },
    { name: 'Maintenance', value: bins.filter(b => b.status === 'Maintenance').length },
  ].filter(d => d.value > 0);

  const fillTrendData = filteredBins.map(b => ({
    name: b.locationName.split(' ')[0],
    level: b.fillLevel
  }));

  const exportCSV = () => {
    const headers = ['ID', 'Location', 'Fill Level', 'Status', 'Lat', 'Lng', 'Last Updated'];
    const rows = bins.map(b => [
      b._id, b.locationName, `${b.fillLevel}%`, b.status, b.latitude, b.longitude, new Date(b.lastUpdated).toLocaleString()
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `waste_analytics_report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  if (loading) return <div className="loading-overlay">Loading analytical engine...</div>;

  return (
    <div className="reports-page" style={{padding: '24px'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px'}}>
        <div>
          <h1 className="page-title" style={{marginBottom: '8px'}}>Comprehensive Waste Analytics</h1>
          <p style={{color: 'var(--text-muted)'}}>Full visibility into network hardware status and historical volume registers.</p>
        </div>
        <button onClick={exportCSV} className="login-btn" style={{margin: 0, padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center', background: 'var(--primary)'}}>
          <Download size={18} /> Export Full Data (CSV)
        </button>
      </div>

      {/* Analytics Overview Cards */}
      <div className="stat-grid" style={{marginBottom: '32px'}}>
        <div className="glass-panel stat-card">
          <div className="stat-icon blue"><Layers /></div>
          <div className="stat-info"><h3>Total Registers</h3><p>{bins.length}</p></div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon green"><TrendingUp /></div>
          <div className="stat-info"><h3>Average Fill Vol</h3><p>{avgFill}%</p></div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon red"><BarChart3 /></div>
          <div className="stat-info"><h3>Anoms Detected</h3><p>{criticalCount} Nodes</p></div>
        </div>
      </div>

      {/* Graphical Analytics Section */}
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px'}}>
        <div className="glass-panel">
          <h2 style={{fontSize: '1.25rem', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px'}}><PieIcon size={20} color="var(--primary)"/> Status Distribution Analysis</h2>
          <div style={{height: '300px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{background:'var(--panel-bg)', borderColor:'var(--border)', borderRadius:'8px'}} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel">
          <h2 style={{fontSize: '1.25rem', marginBottom: '20px', display:'flex', alignItems:'center', gap:'10px'}}><BarChart3 size={20} color="var(--success)"/> Load Intensity Mapping</h2>
          <div style={{height: '300px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={fillTrendData}>
                <defs>
                  <linearGradient id="colorLevel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--success)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--success)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{background:'var(--panel-bg)', borderColor:'var(--border)', borderRadius:'8px'}} />
                <Area type="monotone" dataKey="level" stroke="var(--success)" fillOpacity={1} fill="url(#colorLevel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advanced Filterable Data Table */}
      <div className="glass-panel">
         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
           <h2 style={{fontSize: '1.25rem', margin: 0}}>Master Audit Log</h2>
           <div style={{display: 'flex', gap: '12px'}}>
             <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
               <Search size={16} style={{position: 'absolute', left: '12px', color: 'var(--text-muted)'}} />
               <input 
                 type="text" 
                 placeholder="Search nodes..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 style={{padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none', width: '250px'}}
               />
             </div>
             <select 
               value={statusFilter}
               onChange={e => setStatusFilter(e.target.value)}
               style={{padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)', color: '#fff', outline: 'none'}}
             >
               <option value="All">All Statuses</option>
               <option value="Normal">Normal</option>
               <option value="Full">Full</option>
               <option value="Critical">Critical</option>
               <option value="Maintenance">Maintenance</option>
             </select>
           </div>
         </div>

         <div style={{overflowX: 'auto'}}>
            <table className="data-table">
               <thead>
                  <tr>
                    <th>Register ID</th>
                    <th>Location Node</th>
                    <th>Fill Complexity</th>
                    <th>Audit Status</th>
                    <th>GPS Logic</th>
                    <th>Timestamp</th>
                  </tr>
               </thead>
               <tbody>
                  {filteredBins.map(bin => (
                    <tr key={bin._id} className="table-row-animate">
                      <td style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace'}}>#{bin._id.substring(0,8)}</td>
                      <td style={{fontWeight: 600, color: 'var(--text-main)'}}>{bin.locationName}</td>
                      <td style={{width: '200px'}}>
                         <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                            <div className="fill-bar-bg" style={{flex: 1, background: 'rgba(255,255,255,0.05)'}}>
                               <div className="fill-bar" style={{ width: `${bin.fillLevel}%`, background: bin.fillLevel > 80 ? 'var(--danger)' : bin.fillLevel > 50 ? 'var(--warning)' : 'var(--success)' }}></div>
                            </div>
                            <span style={{fontSize: '0.75rem', fontWeight: 700}}>{bin.fillLevel}%</span>
                         </div>
                      </td>
                      <td>
                         <span className={`badge ${bin.status.toLowerCase()}`}>{bin.status}</span>
                      </td>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize: '0.75rem', color:'var(--text-muted)'}}>
                           <MapPin size={12} /> {Number(bin.latitude).toFixed(3)}, {Number(bin.longitude).toFixed(3)}
                        </div>
                      </td>
                      <td style={{fontSize: '0.85rem'}}>
                         <div style={{display:'flex', alignItems:'center', gap:'6px', color:'var(--text-muted)'}}>
                            <Calendar size={12} /> {new Date(bin.lastUpdated).toLocaleDateString()}
                         </div>
                        <div style={{fontSize: '0.7rem', opacity: 0.7, paddingLeft: '18px'}}>
                           {new Date(bin.lastUpdated).toLocaleTimeString()}
                        </div>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         {filteredBins.length === 0 && <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>No analytical registers match the current filter criteria.</div>}
      </div>
    </div>
  );
}

export default Reports;
