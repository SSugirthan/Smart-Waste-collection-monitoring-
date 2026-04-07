import { useState, useEffect, useRef, useCallback } from 'react';
import { Truck, MapPin, Clock, Activity, Package } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const ICON_BASE = {
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
};

const truckIcon = new L.Icon({ ...ICON_BASE, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png' });
const redIcon   = new L.Icon({ ...ICON_BASE, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png' });
const greenIcon = new L.Icon({ ...ICON_BASE, iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png' });

const getIcon = (status) => {
  if (status === 'Charging') return greenIcon;
  if (status === 'Maintenance') return redIcon;
  return truckIcon;
};

const INITIAL_FLEET = [
  { id: 'T-01', driver: 'John Doe', status: 'On Route', location: 'Downtown Dist.', battery: 85, lat: 40.7128, lng: -74.0060 },
  { id: 'T-02', driver: 'Sarah Lee', status: 'Charging', location: 'HQ Garage', battery: 15, lat: 40.7200, lng: -74.0100 },
  { id: 'T-03', driver: 'Mike Smith', status: 'On Route', location: 'University Zone', battery: 62, lat: 40.7160, lng: -74.0080 },
  { id: 'T-04', driver: 'Emily Chen', status: 'Maintenance', location: 'Repair Bay Alpha', battery: 100, lat: 40.7250, lng: -74.0150 },
];

function PureLeafletMap({ fleet, activeTruck, getAssignedTasks }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersGroup = useRef(null);

  useEffect(() => {
    if (!mapInstance.current && mapRef.current) {
      // Direct raw Leaflet instantiation absolutely bypassing all React Context limitations!
      mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView([activeTruck.lat, activeTruck.lng], 15);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO'
      }).addTo(mapInstance.current);
      
      markersGroup.current = L.layerGroup().addTo(mapInstance.current);
    }
  }, []);

  // Soft pan updates natively ignoring React DOM render bounds
  useEffect(() => {
    if (mapInstance.current && activeTruck) {
      mapInstance.current.flyTo([activeTruck.lat, activeTruck.lng], 15, { animate: true, duration: 0.8 });
    }
  }, [activeTruck]);

  // Synchronize pure fleet markers
  useEffect(() => {
    if (!mapInstance.current || !markersGroup.current) return;
    
    markersGroup.current.clearLayers();

    fleet.forEach(t => {
      const activeTasksCount = getAssignedTasks(t.id).length;
      const marker = L.marker([t.lat, t.lng], { icon: getIcon(t.status) });
      const popupContent = `
        <strong style="color: #000; font-size: 1rem">${t.id} - ${t.driver}</strong><br/>
        <span style="color: #555; font-weight: bold">${t.status}</span><br/>
        <span style="color: #888">Tasks: ${activeTasksCount} Active Nodes</span>
      `;
      marker.bindPopup(popupContent);
      markersGroup.current.addLayer(marker);
    });
  }, [fleet, getAssignedTasks]);

  return <div ref={mapRef} style={{ height: '650px', width: '100%', background: '#1e1e1e', borderRadius: '12px' }}></div>;
}

function Fleet() {
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [activeTruck, setActiveTruck] = useState(INITIAL_FLEET[0]);
  
  const [bins, setBins] = useState([]); 
  
  useEffect(() => {
     const checkBins = () => {
         const cached = localStorage.getItem('cached_bins');
         if (cached) {
            try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) setBins(parsed);
            } catch(e) {}
         }
     };
     checkBins();
     const interval = setInterval(checkBins, 1000); 
     return () => clearInterval(interval);
  }, []);

  // UseCallback prevents dependency loop crashes
  const getAssignedTasks = useCallback((truckId) => {
    if (!Array.isArray(bins)) return [];
    return bins.filter(b => b?.assignedTruck && b.assignedTruck.includes(truckId));
  }, [bins]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFleet(prev => prev.map(truck => {
        if (truck.status === 'On Route') {
          return {
            ...truck,
            lat: truck.lat + (Math.random() - 0.5) * 0.0008,
            lng: truck.lng + (Math.random() - 0.5) * 0.0008
          };
        }
        return truck;
      }));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setActiveTruck(prev => fleet.find(t => t.id === prev.id) || prev);
  }, [fleet]);

  return (
    <div className="fleet-page">
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px'}}>
         <div>
            <h1 className="page-title" style={{marginBottom: '8px'}}>Live Fleet Tracking</h1>
            <p style={{color: 'var(--text-muted)'}}>Monitor exact operational GPS coordinates, tracking logs, and diagnostics.</p>
         </div>
         <div style={{display: 'flex', gap: '16px', background: 'var(--panel-bg)', padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border)'}}>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#2b82cb'}}></div> <span style={{color:'var(--text-main)', fontSize: '0.85rem', fontWeight: 600}}>Active Routing</span></div>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#2aad27'}}></div> <span style={{color:'var(--text-main)', fontSize: '0.85rem', fontWeight: 600}}>Charging</span></div>
            <div style={{display:'flex', alignItems:'center', gap:'8px'}}><div style={{width:'12px', height:'12px', borderRadius:'50%', background:'#cb2b3e'}}></div> <span style={{color:'var(--text-main)', fontSize: '0.85rem', fontWeight: 600}}>Offline / Maint.</span></div>
         </div>
      </div>
      
      <div style={{display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 400px', gap: '24px', minHeight: '650px'}}>
        
        {/* NATIVE LEAFLET WRAPPER EXPLICITLY BYPASSING REACT-LEAFLET CRASHES ENTIRELY */}
        <div className="glass-panel" style={{padding: 0, overflow: 'hidden', minHeight: '650px', position: 'relative', border: '1px solid var(--border)'}}>
           <PureLeafletMap fleet={fleet} activeTruck={activeTruck} getAssignedTasks={getAssignedTasks} />
        </div>

        {/* SIDE TRUCK DIAGNOSTIC TARGET LIST UI */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '650px', maxHeight: '650px', overflowY: 'auto', paddingRight: '8px'}}>
          
          <div className="glass-panel" style={{background: 'rgba(59, 130, 246, 0.05)', border: '1px solid var(--primary)', padding: '16px'}}>
             <h3 style={{fontSize: '0.95rem', color: 'var(--primary)', marginBottom: '12px', display:'flex', justifyContent: 'space-between'}}>
                 <span>Active Feed: {activeTruck.id}</span>
                 {getAssignedTasks(activeTruck.id).length > 0 && (
                     <span className="badge critical" style={{fontSize: '0.65rem'}}>{getAssignedTasks(activeTruck.id).length} Dispatch Targets</span>
                 )}
             </h3>
             
             {getAssignedTasks(activeTruck.id).length > 0 ? (
                 <div style={{marginBottom: '16px'}}>
                   <span style={{fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-main)', textTransform:'uppercase'}}>DISPATCHED TARGETS:</span>
                   {getAssignedTasks(activeTruck.id).map(task => (
                       <div key={task._id} style={{display:'flex', alignItems:'center', gap:'8px', marginTop: '8px', background:'rgba(0,0,0,0.2)', padding:'8px', borderRadius:'6px', borderLeft:`3px solid ${task?.status === 'Critical' ? 'var(--danger)' : 'var(--warning)'}`}}>
                         <Package size={14} color="var(--primary)" />
                         <div style={{flex: 1}}>
                            <strong style={{fontSize: '0.8rem', color: '#fff', display:'block'}}>{task?.locationName}</strong>
                            <span style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>Lat: {Number(task?.latitude || 0).toFixed(3)} | Lng: {Number(task?.longitude || 0).toFixed(3)}</span>
                         </div>
                         <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: task?.status === 'Critical' ? 'var(--danger)' : 'var(--warning)'}}>{task?.fillLevel}%</span>
                       </div>
                   ))}
                 </div>
             ) : (
                 <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '8px 0'}}>
                   Awaiting operational network dispatch. No targets explicitly assigned.
                 </p>
             )}
          </div>

          {fleet.map(d => {
             const activeTasks = getAssignedTasks(d.id);
             return (
                 <div 
                   key={d.id} 
                   onClick={() => setActiveTruck(d)}
                   className="glass-panel" 
                   style={{
                     padding: '20px', 
                     cursor: 'pointer', 
                     border: activeTruck.id === d.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                     transition: '0.2s',
                     background: activeTruck.id === d.id ? 'rgba(59, 130, 246, 0.1)' : 'var(--panel-bg)'
                   }}
                 >
                   <div style={{display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '16px'}}>
                      <div className={`stat-icon ${d.status === 'Maintenance' ? 'red' : d.status === 'Charging' ? 'green' : 'blue'}`} style={{width: '48px', height: '48px'}}>
                        <Truck size={24} />
                      </div>
                      <div>
                        <h3 style={{fontSize: '1.1rem', marginBottom: '4px'}}>{d.id} - {d.driver}</h3>
                        <span className={`badge ${d.status === 'On Route' ? 'normal' : d.status === 'Charging' ? 'normal' : 'warning'}`}>{d.status}</span>
                      </div>
                   </div>

                   <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                     <div>
                       <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display:'flex', alignItems:'center', gap:'4px'}}><Clock size={12}/> Target Node</p>
                       <p style={{fontSize: '0.85rem', fontWeight: 600, color: activeTasks.length > 0 ? 'var(--primary)' : 'var(--text-main)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>
                          {activeTasks.length > 0 ? activeTasks[0].locationName : 'Awaiting Request'}
                       </p>
                     </div>
                     <div>
                       <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display:'flex', alignItems:'center', gap:'4px'}}><Activity size={12}/> Est Payload</p>
                       <p style={{fontSize: '0.85rem', fontWeight: 600, color: activeTasks.length > 0 ? 'var(--danger)' : 'var(--text-main)'}}>
                          {activeTasks.length > 0 ? `+${activeTasks[0].fillLevel}%` : '0%'}
                       </p>
                     </div>
                     <div style={{gridColumn: 'span 2', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid var(--border)'}}>
                       <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px'}}>EV System Battery Level</p>
                       <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                           <div className="fill-bar-bg" style={{flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)'}}>
                              <div className="fill-bar" style={{ width: `${d.battery}%`, background: d.battery > 20 ? 'var(--success)' : 'var(--danger)' }}></div>
                           </div>
                           <span style={{fontSize: '0.8rem', color: d.battery > 20 ? 'var(--success)' : 'var(--danger)', fontWeight: 700}}>{d.battery}%</span>
                       </div>
                     </div>
                     <div style={{gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)'}}>
                        <MapPin size={14} /> <span style={{fontSize: '0.7rem', fontWeight: 'bold'}}>Lat:</span> <span style={{fontSize: '0.7rem', fontFamily: 'monospace'}}>{Number(d.lat).toFixed(5)}</span>
                        <span style={{fontSize: '0.7rem', fontWeight: 'bold', marginLeft: '6px'}}>Lng:</span> <span style={{fontSize: '0.7rem', fontFamily: 'monospace'}}>{Number(d.lng).toFixed(5)}</span>
                     </div>
                   </div>
                 </div>
             );
          })}
        </div>
      </div>
    </div>
  );
}

export default Fleet;
