import React, { useState } from 'react';
import axios from 'axios';

const API_LOGIN = 'https://bekidtracker-backend.onrender.com/auth/login';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(API_LOGIN, { email, password });
            if (
                res.data &&
                res.data.data &&
                res.data.data.accesstoken &&
                res.data.data.role === 'admin'
            ) {
                localStorage.setItem('token', res.data.data.accesstoken);
                localStorage.setItem('user', JSON.stringify(res.data.data));
                onLogin();
            } else if (
                res.data &&
                res.data.data &&
                res.data.data.accesstoken &&
                res.data.data.role !== 'admin'
            ) {
                setError('Chỉ tài khoản admin mới được truy cập dashboard!');
            } else {
                setError('Sai tài khoản hoặc mật khẩu!');
            }
        } catch (err) {
            setError('Sai tài khoản hoặc mật khẩu!');
        }
        setLoading(false);
    };

    return (
        <div style={{
            maxWidth: 380,
            margin: '80px auto',
            padding: 36,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #e0e7ff 0%, #fdf2f8 100%)',
            boxShadow: '0 8px 32px 0 rgba(99,102,241,0.18)',
            border: 'none',
        }}>
            <h2 style={{
                textAlign: 'center',
                marginBottom: 28,
                color: '#6366f1',
                fontWeight: 700,
                fontSize: 32,
                letterSpacing: 1
            }}>Đăng nhập</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 8,
                        fontWeight: 600,
                        color: '#6366f1',
                        fontSize: 16
                    }}>Email</label>
                    <input
                        type="email"
                        placeholder="Nhập email..."
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px 14px',
                            fontSize: 17,
                            borderRadius: 10,
                            border: '1.5px solid #c7d2fe',
                            background: '#f8fafc',
                            outline: 'none',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                        onBlur={e => e.target.style.border = '1.5px solid #c7d2fe'}
                    />
                </div>
                <div style={{ marginBottom: 20 }}>
                    <label style={{
                        display: 'block',
                        marginBottom: 8,
                        fontWeight: 600,
                        color: '#6366f1',
                        fontSize: 16
                    }}>Mật khẩu</label>
                    <input
                        type="password"
                        placeholder="Nhập mật khẩu..."
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '12px 14px',
                            fontSize: 17,
                            borderRadius: 10,
                            border: '1.5px solid #c7d2fe',
                            background: '#f8fafc',
                            outline: 'none',
                            transition: 'border 0.2s',
                            boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.border = '1.5px solid #6366f1'}
                        onBlur={e => e.target.style.border = '1.5px solid #c7d2fe'}
                    />
                </div>
                {error && <div style={{ color: '#ef4444', marginBottom: 16, textAlign: 'center', fontWeight: 500 }}>{error}</div>}
                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '13px 0',
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#fff',
                        background: 'linear-gradient(90deg, #6366f1 0%, #f472b6 100%)',
                        border: 'none',
                        borderRadius: 10,
                        boxShadow: '0 2px 8px rgba(99,102,241,0.10)',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s',
                        marginTop: 8
                    }}
                    disabled={loading}
                >
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>
        </div>
    );
}