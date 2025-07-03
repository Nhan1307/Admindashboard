import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import React, { useEffect, useState } from 'react';
import { getAllTransactions } from './api';
import Login from './Login';
import { FaMoneyBillWave, FaSignOutAlt } from 'react-icons/fa';
import { ImSpinner2 } from 'react-icons/im';
import axios from 'axios';
const API_BASE = 'https://bekidtracker-1.onrender.com';

function App() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('users');
const [users, setUsers] = useState([]);
const [reviews, setReviews] = useState([]);
  const rowsPerPage = 10;
const [stats, setStats] = useState({
  totalUsers: 0,
  totalTransactions: 0,
  totalEvaluations: 0,
  revenue: 0
});
const fetchStats = async () => {
  try {
    const res = await axios.get('https://bekidtracker-1.onrender.com/api/admin/dashboard-stats');
    setStats(res.data);
  } catch (err) {
    console.error('Lỗi khi lấy thống kê:', err);
  }
};
  const checkAuth = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      setIsAdmin(true);
      fetchTransactions();
    } else {
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuth();
    fetchStats();
    
    // eslint-disable-next-line
  }, []);
useEffect(() => {
  if (activeTab === 'users') {
    axios.get(`${API_BASE}/api/children/`, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
    }).then(res => setUsers(res.data));
  }
}, [activeTab]);
useEffect(() => {
  if (activeTab === 'reviews') {
    axios.get(`${API_BASE}/api/evaluation/all`).then(res => setReviews(res.data));
  }
}, [activeTab]);
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (error) {
      alert('Lỗi khi lấy dữ liệu giao dịch!');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAdmin(false);
  };

  // Lọc dữ liệu theo ngày và chỉ lấy giao dịch có user rõ ràng
  const filteredTransactions = transactions.filter(t => {
    if (!t.createdAt) return false;
    const date = new Date(t.createdAt);
    if (startDate && date < startDate) return false;
    if (endDate && date > endDate) return false;
    // Lọc user rõ ràng
    if (!t.userId) return false;
    if (typeof t.userId === 'object') {
      if (!(t.userId.fullname || t.userId.email || t.userId._id)) return false;
    } else {
      if (typeof t.userId !== 'string' || t.userId.trim() === '') return false;
    }
    return true;
  });

  // PHÂN TRANG
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Tổng doanh thu và dữ liệu Pie Chart
  const totalAmount = filteredTransactions.filter(t => t.status === 'success').reduce((sum, t) => sum + (t.amount || 0), 0);
  const statusData = [
    { name: 'Success', value: filteredTransactions.filter(t => t.status === 'success').length },
    { name: 'Pending', value: filteredTransactions.filter(t => t.status === 'pending').length },
    { name: 'Failed', value: filteredTransactions.filter(t => t.status === 'failed').length },
  ];
  const COLORS = ['#16a34a', '#fbbf24', '#ef4444'];

  if (!isAdmin) {
    return <Login onLogin={checkAuth} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      padding: 0,
      margin: 0
    }}>
      {/* Header */}
      <header style={{
        width: '100%',
        background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
        padding: '18px 0',
        marginBottom: 32,
        boxShadow: '0 2px 12px rgba(99,102,241,0.10)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: 1200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <FaMoneyBillWave size={36} color="#fff" style={{ marginRight: 8 }} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 28, letterSpacing: 1 }}>
              Dashboard Doanh Thu
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 24px',
              background: '#fff',
              color: '#6366f1',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
            onMouseOut={e => e.currentTarget.style.background = '#fff'}
          >
            <FaSignOutAlt size={18} /> Đăng xuất
          </button>
        </div>
      </header>
      <main style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 16px 32px 16px'
      }}>
        <div style={{ display: 'flex', gap: 24, marginBottom: 24, justifyContent: 'center' }}>
  <button className={activeTab === 'users' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('users')}>Người dùng</button>
  <button className={activeTab === 'transactions' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('transactions')}>Giao dịch</button>
  <button className={activeTab === 'reviews' ? 'tab-active' : 'tab'} onClick={() => setActiveTab('reviews')}>Đánh giá</button>
</div>
        {/* Thống kê tổng quan */}
<div style={{ display: 'flex', gap: 32, marginBottom: 32, justifyContent: 'center' }}>
  <div className="stat-card">
    <h3 style={{ color: '#6366f1', marginBottom: 8 }}>Người dùng</h3>
    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22223b' }}>{stats.totalUsers}</p>
  </div>
  <div className="stat-card">
    <h3 style={{ color: '#6366f1', marginBottom: 8 }}>Giao dịch</h3>
    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22223b' }}>{stats.totalTransactions}</p>
  </div>
  <div className="stat-card">
    <h3 style={{ color: '#6366f1', marginBottom: 8 }}>Đánh giá</h3>
    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#22223b' }}>{stats.totalEvaluations}</p>
  </div>
  <div className="stat-card">
    <h3 style={{ color: '#6366f1', marginBottom: 8 }}>Doanh thu</h3>
    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a' }}>{stats.revenue.toLocaleString('vi-VN')} đ</p>
  </div>
</div>
        {/* Tổng doanh thu */}
        <div style={{
          marginBottom: 28,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(99,102,241,0.10)',
          padding: '28px 0',
          textAlign: 'center',
          fontSize: 32,
          fontWeight: 700,
          color: '#16a34a',
          letterSpacing: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16
        }}>
          <FaMoneyBillWave size={36} style={{ marginRight: 8 }} />
          Tổng doanh thu: {totalAmount.toLocaleString()} VNĐ
        </div>
        {/* Bộ lọc ngày */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 28,
          gap: 24,
          flexWrap: 'wrap',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
          padding: '18px 24px'
        }}>
          <span style={{ fontWeight: 600, fontSize: 20, color: '#6366f1' }}>Từ ngày:</span>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Bắt đầu"
            isClearable
            className="custom-date-picker"
            popperClassName="big-datepicker"
            maxDate={endDate || undefined}
            popperPlacement="bottom"
          />
          <span style={{ fontWeight: 600, fontSize: 20, color: '#6366f1' }}>Đến ngày:</span>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Kết thúc"
            isClearable
            className="custom-date-picker"
            popperClassName="big-datepicker"
            minDate={startDate || undefined}
            popperPlacement="bottom"
          />
        </div>
        {/* Biểu đồ hình tròn Pie Chart to hơn */}
        <div style={{
          width: '100%',
          maxWidth: 700,
          height: 420,
          margin: '0 auto 36px auto',
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(99,102,241,0.10)',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ color: '#6366f1', fontWeight: 700, fontSize: 24, marginBottom: 12 }}>Tỉ lệ trạng thái giao dịch</h2>
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={140}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
       {/* Bảng dữ liệu theo tab */}
<div style={{
  overflowX: 'auto',
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
  padding: 20,
  marginBottom: 32
}}>
  {activeTab === 'users' && (
    <table className="dashboard-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>Họ tên</th>
          <th>Email</th>
          <th>Ngày tạo</th>
        </tr>
      </thead>
      <tbody>
         {Array.isArray(users) && users.map((u, idx) => (
          <tr key={u._id}>
            <td>{idx + 1}</td>
            <td>{u.fullname}</td>
            <td>{u.email}</td>
            <td>{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
  {activeTab === 'transactions' && (
    <>
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>STT</th>
            <th>ID</th>
            <th>User</th>
            <th>Số tiền</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
          </tr>
        </thead>
        <tbody>
           {Array.isArray(paginatedTransactions) && paginatedTransactions.map((t, idx) => (
            <tr key={t._id || idx}>
              <td>{(currentPage - 1) * rowsPerPage + idx + 1}</td>
              <td>{t.transactionId || t._id || '-'}</td>
              <td>
                {t.userId
                  ? (typeof t.userId === 'object'
                      ? (t.userId.email || t.userId.fullname || t.userId._id || 'Không rõ')
                      : t.userId)
                  : 'Không rõ'}
              </td>
              <td>{t.amount ? t.amount.toLocaleString() : '-'}</td>
              <td>{t.status || '-'}</td>
              <td>{t.createdAt ? new Date(t.createdAt).toLocaleString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              margin: '0 4px',
              padding: '8px 16px',
              borderRadius: '50%',
              border: 'none',
              background: currentPage === 1 ? '#e5e7eb' : '#6366f1',
              color: currentPage === 1 ? '#94a3b8' : '#fff',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: 16,
              transition: 'background 0.2s'
            }}
          >‹</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                margin: '0 4px',
                padding: '8px 16px',
                borderRadius: '50%',
                border: 'none',
                background: currentPage === i + 1 ? '#6366f1' : '#e0e7ff',
                color: currentPage === i + 1 ? '#fff' : '#6366f1',
                fontWeight: currentPage === i + 1 ? 700 : 500,
                fontSize: 16,
                cursor: 'pointer',
                boxShadow: currentPage === i + 1 ? '0 2px 8px rgba(99,102,241,0.15)' : 'none',
                transition: 'background 0.2s'
              }}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              margin: '0 4px',
              padding: '8px 16px',
              borderRadius: '50%',
              border: 'none',
              background: currentPage === totalPages ? '#e5e7eb' : '#6366f1',
              color: currentPage === totalPages ? '#94a3b8' : '#fff',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontWeight: 700,
              fontSize: 16,
              transition: 'background 0.2s'
            }}
          >›</button>
        </div>
      )}
    </>
  )}
  {activeTab === 'reviews' && (
    <table className="dashboard-table">
      <thead>
        <tr>
          <th>STT</th>
          <th>User</th>
          <th>Ngày</th>
          <th>Nội dung</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(reviews) && reviews.map((r, idx) => (
          <tr key={r._id}>
            <td>{idx + 1}</td>
            <td>{r.user?.fullname || r.user?.email || '-'}</td>
            <td>{r.date || '-'}</td>
            <td>{r.content || '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
</div>
      </main>
    </div>
  );
}

const thStyle = {
  padding: '12px 8px',
  fontWeight: 700,
  color: '#334155',
  borderBottom: '2px solid #e5e7eb',
  textAlign: 'center',
  background: '#f1f5f9',
  position: 'sticky',
  top: 0,
  zIndex: 2
};

const tdStyle = {
  padding: '10px 8px',
  borderBottom: '1px solid #e5e7eb',
  textAlign: 'center',
  background: '#fff',
  fontWeight: 500
};

export default App;