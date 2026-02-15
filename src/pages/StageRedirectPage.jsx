import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function StageRedirectPage() {
    const { code } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const loadMatchByCode = async () => {
            if (!code) {
                alert('رمز غير صالح');
                navigate('/');
                return;
            }

            const { data: match, error } = await supabase
                .from('matches')
                .select('id')
                .eq('stage_code', code)
                .maybeSingle();

            if (error) {
                console.error('Error loading match:', error);
                alert('خطأ في تحميل المباراة');
                navigate('/');
                return;
            }

            if (!match) {
                alert('لم يتم العثور على مباراة بهذا الرمز');
                navigate('/');
                return;
            }

            // Redirect to actual stage page (will be created in Phase 3)
            navigate(`/stage/${match.id}`);
        };

        loadMatchByCode();
    }, [code, navigate]);

    return (
        <div className="font-ibm" style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
            color: '#fff', overflow: 'hidden', direction: 'rtl'
        }}>
            <div style={{
                background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)',
                borderRadius: 32, padding: '48px 64px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxWidth: '90%', width: 'min(500px, 90vw)',
                animation: 'pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}>
                {/* LOGO */}
                <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" style={{ maxHeight: '120px', width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }} />

                {/* SPINNER */}
                <div style={{
                    width: 48, height: 48,
                    border: '4px solid rgba(255,255,255,0.1)',
                    borderTopColor: '#3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }} />

                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>جارٍ البحث عن المباراة...</div>
                    <div style={{ fontSize: '1.1rem', opacity: 0.7, fontFamily: 'monospace', letterSpacing: 2 }}>
                        الرمز: <strong>{code}</strong>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes pop-in {
                    0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
