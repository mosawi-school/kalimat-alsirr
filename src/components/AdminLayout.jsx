import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#1f1f1f', color: '#eee', direction: 'rtl' }}>
            {/* Navigation Bar */}
            <nav style={{
                background: '#111',
                borderBottom: '1px solid #333',
                padding: '16px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>كلمة السر — لوحة التحكم</h2>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <NavLink
                            to="/seasons"
                            style={({ isActive }) => ({
                                padding: '8px 16px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                background: isActive ? '#2b2b2b' : 'transparent',
                                color: isActive ? '#6ee7b7' : '#eee',
                                border: isActive ? '1px solid #6ee7b7' : '1px solid transparent',
                                transition: 'all 0.2s'
                            })}
                        >
                            المواسم
                        </NavLink>
                        <NavLink
                            to="/questions"
                            style={({ isActive }) => ({
                                padding: '8px 16px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                background: isActive ? '#2b2b2b' : 'transparent',
                                color: isActive ? '#6ee7b7' : '#eee',
                                border: isActive ? '1px solid #6ee7b7' : '1px solid transparent',
                                transition: 'all 0.2s'
                            })}
                        >
                            مكتبة الأسئلة
                        </NavLink>
                        <NavLink
                            to="/matches"
                            style={({ isActive }) => ({
                                padding: '8px 16px',
                                borderRadius: 8,
                                textDecoration: 'none',
                                background: isActive ? '#2b2b2b' : 'transparent',
                                color: isActive ? '#6ee7b7' : '#eee',
                                border: isActive ? '1px solid #6ee7b7' : '1px solid transparent',
                                transition: 'all 0.2s'
                            })}
                        >
                            المباريات
                        </NavLink>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600
                    }}
                >
                    تسجيل خروج
                </button>
            </nav>

            {/* Main Content */}
            <main style={{ padding: 32, maxWidth: 1400, margin: '0 auto' }}>
                {children}
            </main>
        </div>
    );
}
