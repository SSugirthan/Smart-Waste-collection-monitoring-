import { AlertCircle, FileText, Download } from 'lucide-react';

function Reports() {
  return (
    <div className="reports-page">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <h1 className="page-title" style={{margin: 0}}>Analytics Reports</h1>
        <button className="login-btn" style={{margin: 0, padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center'}}>
          <Download size={18} /> Export CSV
        </button>
      </div>
      
      <div className="stat-grid">
         <div className="glass-panel stat-card">
          <div className="stat-icon blue"><FileText /></div>
          <div className="stat-info"><h3>Monthly Collections</h3><p>4,281 Tons</p></div>
        </div>
        <div className="glass-panel stat-card">
          <div className="stat-icon green"><AlertCircle /></div>
          <div className="stat-info"><h3>Efficiency Rating</h3><p>94.2%</p></div>
        </div>
      </div>

      <div className="glass-panel" style={{minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
         <div style={{textAlign: 'center', color: 'var(--text-muted)'}}>
            <FileText size={64} style={{marginBottom: '16px', opacity: 0.5}} />
            <h2>Historical Data Generation</h2>
            <p>Select a date range from the top filter to process and view historical waste accumulation graphical trends.</p>
         </div>
      </div>
    </div>
  );
}

export default Reports;
