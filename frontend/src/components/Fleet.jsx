import { Truck, MapPin, Battery } from 'lucide-react';

function Fleet() {
  const drivers = [
    { id: 'T-01', driver: 'John Doe', status: 'On Route', location: 'Downtown Dist.', battery: 85 },
    { id: 'T-02', driver: 'Sarah Lee', status: 'Charging', location: 'HQ Garage', battery: 15 },
    { id: 'T-03', driver: 'Mike Smith', status: 'On Route', location: 'University Zone', battery: 62 },
    { id: 'T-04', driver: 'Emily Chen', status: 'Maintenance', location: 'Repair Bay Alpha', battery: 100 },
  ];

  return (
    <div className="fleet-page">
      <h1 className="page-title">Fleet Tracking Dashboard</h1>
      
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px'}}>
        {drivers.map(d => (
           <div key={d.id} className="glass-panel" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 32px'}}>
             <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
                <div className={`stat-icon ${d.status === 'Maintenance' ? 'red' : d.status === 'Charging' ? 'green' : 'blue'}`} style={{width: '64px', height: '64px'}}>
                  <Truck size={32} />
                </div>
                <div>
                  <h3 style={{fontSize: '1.25rem', marginBottom: '4px'}}>{d.id} - {d.driver}</h3>
                  <p style={{color: 'var(--text-muted)', display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.9rem'}}>
                    <MapPin size={16} /> {d.location}
                  </p>
                </div>
             </div>
             
             <div style={{display: 'flex', gap: '32px', alignItems: 'center'}}>
               <div style={{textAlign: 'right'}}>
                 <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>Status</p>
                 <span className={`badge ${d.status === 'On Route' ? 'normal' : d.status === 'Charging' ? 'normal' : 'warning'}`}>{d.status}</span>
               </div>
               <div style={{textAlign: 'right'}}>
                 <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px'}}>EV Battery</p>
                 <span style={{display: 'flex', gap: '6px', alignItems: 'center', color: d.battery > 20 ? 'var(--success)' : 'var(--danger)', fontWeight: 600}}>
                   <Battery size={20} /> {d.battery}%
                 </span>
               </div>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
}

export default Fleet;
