import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!pin.trim()) {
            setError('الرجاء إدخال رمز PIN');
            return;
        }

        const success = login(pin);
        if (success) {
            navigate('/seasons');
        } else {
            setError('رمز PIN غير صحيح');
            setPin('');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: '#1f1f1f',
            color: '#eee',
            display: 'grid',
            placeItems: 'center',
            direction: 'rtl'
        }}>
            <div style={{
                width: '100%',
                maxWidth: 420,
                padding: 32,
                background: '#111',
                borderRadius: 16,
                border: '1px solid #333'
            }}>
                <h1 style={{ fontSize: 32, fontWeight: 900, textAlign: 'center', marginBottom: 8 }}>
                    كلمة السر
                </h1>
                <p style={{ textAlign: 'center', opacity: 0.7, marginBottom: 32 }}>
                    لوحة التحكم الإدارية
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
                            رمز PIN
                        </label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            placeholder="أدخل رمز PIN"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                fontSize: 16,
                                borderRadius: 8,
                                background: '#1a1a1a',
                                color: '#eee',
                                border: '1px solid #333',
                                outline: 'none'
                            }}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '10px 14px',
                            marginBottom: 16,
                            background: '#dc2626',
                            color: '#fff',
                            borderRadius: 8,
                            fontSize: 14
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: 16,
                            fontWeight: 700,
                            borderRadius: 8,
                            background: '#6ee7b7',
                            color: '#111',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        دخول
                    </button>
                </form>
            </div>
        </div>
    );
}
