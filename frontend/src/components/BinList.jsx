import { useEffect, useState } from 'react';
import axios from 'axios';
import { Plus, Trash2, CheckCircle, PenTool, Truck, X } from 'lucide-react';

const DUMMY_BINS = [
  { _id: '1', locationName: 'Downtown Plaza', latitude: 40.7128, longitude: -74.0060, fillLevel: 45, status: 'Normal', assignedTruck: null, lastUpdated: new Date() },
  { _id: '2', locationName: 'City Square East', latitude: 40.7142, longitude: -74.0064, fillLevel: 92, status: 'Critical', assignedTruck: null, lastUpdated: new Date() },
  { _id: '3', locationName: 'Main Street Mall', latitude: 40.7155, longitude: -74.0040, fillLevel: 10, status: 'Normal', assignedTruck: null, lastUpdated: new Date() },
  { _id: '4', locationName: 'University Campus', latitude: 40.7160, longitude: -74.0080, fillLevel: 78, status: 'Full', assignedTruck: null, lastUpdated: new Date() },
];

function BinList() {
  const [bins, setBins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [assigningBin, setAssigningBin] = useState(null); // Tracks which bin is getting an interactive truck assignment
  
  const role = localStorage.getItem('role') || 'user';
  
  const [newBin, setNewBin] = useState({ locationName: '', fillLevel: 0, latitude: 40.7, longitude: -74.0 });

  useEffect(() => {
    fetchBins();
  }, []);

  const syncLocalBins = (updatedBins) => {
    setBins(updatedBins);
    localStorage.setItem('cached_bins', JSON.stringify(updatedBins));
  };

  const fetchBins = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bins');
      if (res.data && res.data.length > 0) {
          syncLocalBins(res.data);
      } else {
          setBins([]);
      }
    } catch (err) {
      console.error('Backend DB offline, utilizing local presentation data.');
      const cached = localStorage.getItem('cached_bins');
      if (cached) {
          setBins(JSON.parse(cached));
      } else {
          syncLocalBins(DUMMY_BINS);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Normal': return 'var(--success)';
      case 'Full': return 'var(--warning)';
      case 'Critical': return 'var(--danger)';
      case 'Maintenance': return 'var(--text-muted)';
      default: return 'var(--text-muted)';
    }
  };

  const handleAddBin = async (e) => {
    e.preventDefault();
    const binPayload = { 
      ...newBin, 
      fillLevel: Number(newBin.fillLevel),
      status: newBin.fillLevel >= 90 ? 'Critical' : newBin.fillLevel >= 75 ? 'Full' : 'Normal', 
      lastUpdated: new Date(),
      assignedTruck: null
    };
    
    try {
      const res = await axios.post('http://localhost:5000/api/bins', binPayload);
      syncLocalBins([...bins, res.data]);
    } catch (err) {
       const mockAdd = { ...binPayload, _id: Math.random().toString(36).substr(2, 9) };
       syncLocalBins([...bins, mockAdd]);
    }
    setShowAddForm(false);
    setNewBin({ locationName: '', fillLevel: 0, latitude: 40.7, longitude: -74.0 });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to decommission this hardware node?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/bins/${id}`);
      syncLocalBins(bins.filter(b => b._id !== id));
    } catch (err) {
      syncLocalBins(bins.filter(b => b._id !== id));
    }
  };

  // Standard empty action automatically strips any linked active trucks to finalize routing
  const handleEmptyBin = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/bins/${id}`, { fillLevel: 0, status: 'Normal', assignedTruck: null });
      syncLocalBins(bins.map(b => b._id === id ? { ...b, fillLevel: 0, status: 'Normal', assignedTruck: null, lastUpdated: new Date() } : b));
    } catch (err) {
      syncLocalBins(bins.map(b => b._id === id ? { ...b, fillLevel: 0, status: 'Normal', assignedTruck: null, lastUpdated: new Date() } : b));
    }
  };

  const handleAssignTruck = async (id, truckId) => {
    try {
      await axios.patch(`http://localhost:5000/api/bins/${id}`, { assignedTruck: truckId });
      syncLocalBins(bins.map(b => b._id === id ? { ...b, assignedTruck: truckId } : b));
    } catch (err) {
      syncLocalBins(bins.map(b => b._id === id ? { ...b, assignedTruck: truckId } : b));
    }
  };

  if (loading) return <div>Loading registry modules...</div>;

  return (
    <div className="bin-list-page">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 className="page-title" style={{margin: 0}}>{role === 'admin' ? 'Bin Configuration & Dispatch Tools' : 'Waste Data Tracking Registry'}</h1>
        
        <button 
          className="login-btn" 
          style={{margin: 0, padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center', background: showAddForm ? 'var(--text-muted)' : (role === 'admin' ? 'var(--primary)' : 'var(--success)')}}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Cancel Creation' : <><Plus size={18}/> {role === 'admin' ? 'Deploy Hardware' : 'Add Waste Node'}</>}
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel" style={{marginBottom: '24px', animation: 'fadeIn 0.3s', borderLeft: `4px solid ${role === 'admin' ? 'var(--primary)' : 'var(--success)'}`}}>
          <h2 style={{fontSize: '1.1rem', marginBottom: '16px', color: role === 'admin' ? 'var(--primary)' : 'var(--success)', display:'flex', gap:'8px', alignItems:'center'}}>
            <PenTool size={18}/> {role === 'admin' ? 'Management Creation Interface' : 'New Waste Data Registration'}
          </h2>
          <form onSubmit={handleAddBin} style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end'}}>
            <div className="form-group">
              <label>Location Parameter</label>
              <input type="text" value={newBin.locationName} onChange={e => setNewBin({...newBin, locationName: e.target.value})} required placeholder="Sector 7 Market" style={{background: 'rgba(0,0,0,0.2)'}}/>
            </div>
            <div className="form-group">
              <label>Target Volume Level (%)</label>
              <input type="number" value={newBin.fillLevel} onChange={e => setNewBin({...newBin, fillLevel: e.target.value})} required min="0" max="100" style={{background: 'rgba(0,0,0,0.2)'}}/>
            </div>
            <div className="form-group">
              <label>GPS Coordinates Latitude</label>
              <input type="number" step="any" value={newBin.latitude} onChange={e => setNewBin({...newBin, latitude: e.target.value})} style={{background: 'rgba(0,0,0,0.2)'}}/>
            </div>
            <button type="submit" className="login-btn" style={{margin: 0, padding: '12px', background: role === 'admin' ? 'var(--primary)' : 'var(--success)'}}>Log Data</button>
          </form>
        </div>
      )}
      
      <div className="glass-panel">
        <div style={{overflowX: 'auto'}}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Location Node</th>
                <th>Geo Tracking Coordinates</th>
                <th>Volume Analysis Level</th>
                <th>Diagnostic Protocol</th>
                <th>System Interaction Matrix</th>
              </tr>
            </thead>
            <tbody>
              {bins.map(bin => (
                <tr key={bin._id} className="table-row-animate">
                  <td style={{fontWeight: 500, color: 'var(--text-main)'}}>
                     {bin.locationName}
                     <span style={{fontSize: '0.75rem', display: 'block', marginTop: '4px', color: 'var(--text-muted)'}}>{new Date(bin.lastUpdated).toLocaleTimeString()}</span>
                  </td>
                  <td style={{color: 'var(--text-muted)', fontSize: '0.85rem'}}>
                    {Number(bin.latitude).toFixed(4)}, {Number(bin.longitude).toFixed(4)}
                  </td>
                  <td style={{width: '25%'}}>
                    <div className="fill-bar-bg" style={{background: 'rgba(255,255,255,0.05)'}}>
                      <div 
                        className="fill-bar" 
                        style={{ 
                          width: `${bin.fillLevel}%`, 
                          backgroundColor: getStatusColor(bin.status) 
                        }}
                      ></div>
                    </div>
                    <span style={{fontSize: '0.75rem', marginTop: '4px', display:'block', color: 'var(--text-muted)'}}>{bin.fillLevel}% Memory</span>
                  </td>
                  <td>
                    <span className={`badge ${bin.status.toLowerCase()}`}>{bin.status}</span>
                    {/* Badge indicating a truck has been successfully targeted here */}
                    {bin.assignedTruck && (
                      <div style={{marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600}}>
                        <Truck size={14} /> Dispatch: {bin.assignedTruck}
                      </div>
                    )}
                  </td>
                  
                  <td>
                     {/* Conditionally render assign workflow dropdown if Admin targets this row */}
                     {assigningBin === bin._id && role === 'admin' ? (
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center', animation: 'fadeIn 0.2s'}}>
                           <select 
                             id={`select-${bin._id}`} 
                             style={{padding: '8px', borderRadius: '6px', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', border: '1px solid var(--primary)', outline: 'none', fontSize: '0.85rem'}}
                           >
                             <option value="T-01 (John Doe)">T-01 (John Doe)</option>
                             <option value="T-02 (Sarah Lee)">T-02 (Sarah Lee)</option>
                             <option value="T-03 (Mike Smith)">T-03 (Mike Smith)</option>
                           </select>
                           <button 
                             onClick={() => {
                               const val = document.getElementById(`select-${bin._id}`).value;
                               handleAssignTruck(bin._id, val);
                               setAssigningBin(null);
                             }} 
                             style={{background: 'var(--primary)', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem'}}
                           >
                             SEND
                           </button>
                           <button onClick={() => setAssigningBin(null)} style={{background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer'}}><X size={20}/></button>
                        </div>
                     ) : (
                        <div style={{display: 'flex', gap: '10px'}}>
                          {/* Admin Only Dispatch Assign Action */}
                          {role === 'admin' && !bin.assignedTruck && (
                            <button 
                              onClick={() => setAssigningBin(bin._id)}
                              title="Assign Fleet Dispatch"
                              style={{background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s'}}
                            >
                              <Truck size={16} />
                            </button>
                          )}
                          
                          {/* Emulate Task Completion globally for everyone */}
                          <button 
                            onClick={() => handleEmptyBin(bin._id)}
                            title={bin.assignedTruck ? "Complete Dispatch Route!" : "Clear Storage Data (Reset)"}
                            style={{background: bin.assignedTruck ? 'var(--success)' : 'rgba(16, 185, 129, 0.1)', color: bin.assignedTruck ? '#fff' : 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s'}}
                          >
                            <CheckCircle size={16} />
                          </button>
                          
                          {/* Admin Only Root Override */}
                          {role === 'admin' && (
                            <button 
                              onClick={() => handleDelete(bin._id)}
                              title="Decommission Hardware (Delete)"
                              style={{background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s'}}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                     )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {bins.length === 0 && <div style={{padding: '24px', textAlign: 'center', color: 'var(--text-muted)'}}>No active bins deployed in network.</div>}
        </div>
      </div>
    </div>
  );
}

export default BinList;
