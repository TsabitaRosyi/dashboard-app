import React, { useEffect, useState } from 'react';
import API from './services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function App() {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({});
  const [siteName, setSiteName] = useState('');
  const [revenue, setRevenue] = useState('');
  const [user, setUser] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Data dari API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRecords, resStats] = await Promise.all([
        API.get('/records?limit=100'),
        API.get('/stats')
      ]);
      setRecords(resRecords.data || []);
      setStats(resStats.data || {});
    } catch (err) {
      if (err.response?.status === 429) {
        toast.warning('Batas laju terlampaui (429). Silakan tunggu beberapa detik.');
      } else {
        toast.error('Gagal mengambil data dari server');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handler Tambah Record
  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post('/records', {
        site_name: siteName,
        revenue: parseFloat(revenue) || 0,
        user: user,
        payload: "{}"
      });
      toast.success('Record baru berhasil ditambahkan!');
      setSiteName('');
      setRevenue('');
      setUser('');
      fetchData();
    } catch (err) {
      if (err.response?.status === 429) {
        toast.warning('Batas laju terlampaui (429). Permintaan dibatasi.');
      } else {
        toast.error('Gagal menambah record: ' + (err.response?.data?.message || err.message));
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Seed Data
  const handleSeed = async () => {
    setActionLoading(true);
    try {
      await API.post('/seed?count=5');
      toast.info('5 Data dummy berhasil di-generate!');
      fetchData();
    } catch (err) {
      if (err.response?.status === 429) {
        toast.warning('Batas laju terlampaui (429).');
      } else {
        toast.error('Gagal melakukan seed data');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Handler Hapus Record
  const handleDelete = async (id) => {
    if (!window.confirm(`Hapus record ID #${id}?`)) return;
    setActionLoading(true);
    try {
      await API.delete(`/records/${id}`);
      toast.success(`Record #${id} berhasil dihapus!`);
      fetchData();
    } catch (err) {
      if (err.response?.status === 429) {
        toast.warning('Batas laju terlampaui (429).');
      } else {
        toast.error('Gagal menghapus record');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Data Records
  const filteredRecords = records.filter(r => 
    r.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.user?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Data Grafik Bar Chart (Revenue per Site)
  const siteRevenueMap = records.reduce((acc, curr) => {
    acc[curr.site_name] = (acc[curr.site_name] || 0) + (curr.revenue || 0);
    return acc;
  }, {});

  const barChartData = {
    labels: Object.keys(siteRevenueMap),
    datasets: [{
      label: 'Revenue ($)',
      data: Object.values(siteRevenueMap),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(37, 99, 235, 1)',
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  // Data Grafik Doughnut Chart (Records per User)
  const userRecordMap = records.reduce((acc, curr) => {
    acc[curr.user] = (acc[curr.user] || 0) + 1;
    return acc;
  }, {});

  const doughnutChartData = {
    labels: Object.keys(userRecordMap),
    datasets: [{
      data: Object.values(userRecordMap),
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
    }]
  };

  return (
    <div style={styles.container}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1F2937' }}>Dashboard Analytics</h1>
          <p style={{ margin: '4px 0 0 0', color: '#6B7280', fontSize: '14px' }}>
            Monitoring & Management Panel (Port 7016)
          </p>
        </div>
        <button style={styles.btnSecondary} onClick={fetchData} disabled={loading}>
          {loading ? 'Refreshing...' : '🔄 Refresh Data'}
        </button>
      </header>

      {/* Summary Stat Cards */}
      <div style={styles.grid3}>
        <div style={styles.card}>
          <span style={styles.cardLabel}>TOTAL RECORDS</span>
          <div style={styles.cardValue}>{stats.total_records ?? records.length}</div>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>TOTAL REVENUE</span>
          <div style={styles.cardValue}>
            ${(stats.total_revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div style={styles.card}>
          <span style={styles.cardLabel}>ALLOC MEMORY</span>
          <div style={styles.cardValue}>
            {stats.alloc_memory_mb ? Number(stats.alloc_memory_mb).toFixed(2) : '0.00'} MB
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={styles.grid2}>
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Revenue per Site</h3>
          <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div style={styles.card}>
          <h3 style={styles.sectionTitle}>Records per User</h3>
          <Doughnut data={doughnutChartData} options={{ responsive: true }} />
        </div>
      </div>

      {/* Form Tambah Record */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Tambah Record Baru</h3>
        <form onSubmit={handleCreate} style={styles.formGrid}>
          <input 
            style={styles.input} 
            placeholder="Site Name (misal: alpha-hub.io)" 
            value={siteName} 
            onChange={(e) => setSiteName(e.target.value)} 
            required 
          />
          <input 
            style={styles.input} 
            placeholder="Revenue (misal: 1500)" 
            type="number" 
            value={revenue} 
            onChange={(e) => setRevenue(e.target.value)} 
            required 
          />
          <input 
            style={styles.input} 
            placeholder="User (misal: alice_dev)" 
            value={user} 
            onChange={(e) => setUser(e.target.value)} 
            required 
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={styles.btnPrimary} type="submit" disabled={actionLoading}>
              {actionLoading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button style={styles.btnSeed} type="button" onClick={handleSeed} disabled={actionLoading}>
              ⚡ Generate Seed Data
            </button>
          </div>
        </form>
      </div>

      {/* Table Section with Search */}
      <div style={styles.card}>
        <div style={styles.tableHeader}>
          <h3 style={{ ...styles.sectionTitle, margin: 0 }}>Data Records</h3>
          <input 
            style={{ ...styles.input, width: '260px' }} 
            placeholder="🔍 Cari Site Name / User..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Memuat data...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Site Name</th>
                  <th style={styles.th}>Revenue</th>
                  <th style={styles.th}>User</th>
                  <th style={styles.th}>Created At</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#9CA3AF' }}>
                      Tidak ada data yang ditemukan.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((r) => (
                    <tr key={r.id} style={styles.tr}>
                      <td style={styles.td}>#{r.id}</td>
                      <td style={{ ...styles.td, fontWeight: '600', color: '#1F2937' }}>{r.site_name}</td>
                      <td style={{ ...styles.td, color: '#059669', fontWeight: '600' }}>
                        ${Number(r.revenue).toLocaleString()}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge}>{r.user}</span>
                      </td>
                      <td style={{ ...styles.td, color: '#6B7280', fontSize: '13px' }}>{r.created_at}</td>
                      <td style={styles.td}>
                        <button style={styles.btnDelete} onClick={() => handleDelete(r.id)} disabled={actionLoading}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Styling CSS In JS
const styles = {
  container: { padding: '32px 24px', fontFamily: 'Inter, system-ui, sans-serif', backgroundColor: '#F9FAFB', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '24px' },
  card: { backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB', marginBottom: '24px' },
  cardLabel: { fontSize: '12px', fontWeight: '700', color: '#6B7280', letterSpacing: '0.05em' },
  cardValue: { fontSize: '28px', fontWeight: '800', color: '#111827', marginTop: '8px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#1F2937', marginBottom: '16px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', alignItems: 'center' },
  input: { padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '14px', outline: 'none' },
  btnPrimary: { backgroundColor: '#2563EB', color: '#FFF', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  btnSecondary: { backgroundColor: '#FFFFFF', color: '#374151', border: '1px solid #D1D5DB', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  btnSeed: { backgroundColor: '#F59E0B', color: '#FFF', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  btnDelete: { backgroundColor: '#FEE2E2', color: '#DC2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' },
  tableHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px 16px', backgroundColor: '#F3F4F6', color: '#374151', fontSize: '13px', fontWeight: '700', borderBottom: '1px solid #E5E7EB' },
  td: { padding: '14px 16px', borderBottom: '1px solid #F3F4F6', fontSize: '14px' },
  tr: { transition: 'background-color 0.15s' },
  badge: { backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' }
};

export default App;

