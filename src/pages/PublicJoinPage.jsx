import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PublicJoinPage() {
    const [code, setCode] = useState('');
    const navigate = useNavigate();

    const handleJoin = (e) => {
        e.preventDefault();
        if (code.trim()) {
            navigate(`/s/${code.trim()}`);
        }
    };

    return (
        <div className="font-ibm" style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
            color: '#fff', overflow: 'hidden', direction: 'rtl'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)',
                borderRadius: 32, padding: '48px 32px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxWidth: '90%', width: 'min(400px, 90vw)',
                animation: 'pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                {/* LOGO */}
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" style={{ maxHeight: '140px', width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }} />

                <form onSubmit={handleJoin} style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
                    <input
                        className="font-ibm"
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="أدخل رمز المباراة"
                        style={{
                            width: '100%', height: '64px', padding: '0 24px',
                            fontSize: '20px', textAlign: 'center', fontWeight: 600,
                            borderRadius: '16px', border: '2px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.3)', color: '#fff',
                            outline: 'none', appearance: 'none',
                            fontFamily: 'inherit',
                            boxSizing: 'border-box'
                        }}
                    />
                    <button
                        className="font-ibm"
                        type="submit"
                        disabled={!code.trim()}
                        style={{
                            width: '100%', height: '64px',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', // RICH ROYAL BLUE (Refined "Al-Sirr" Blue)
                            color: '#fff', border: 'none', borderRadius: '16px',
                            fontSize: '20px', fontWeight: 700,
                            cursor: code.trim() ? 'pointer' : 'not-allowed',
                            opacity: code.trim() ? 1 : 0.6,
                            boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.5)',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit'
                        }}
                    >
                        دخول للمباراة
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes pop-in {
                    0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
