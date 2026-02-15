import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import AdminLayout from '../components/AdminLayout';
import { generateStageUrl } from '../lib/matchHelpers';

export default function MatchesPage() {
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSeasonId, setSelectedSeasonId] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadMatches();
    }, [selectedSeasonId]);

    const loadData = async () => {
        // Load seasons
        const { data: seasonsData, error: seasonsError } = await supabase
            .from('seasons')
            .select('*')
            .order('created_at', { ascending: false });

        if (seasonsError) {
            console.error('Seasons error:', seasonsError);
            setError('خطأ في تحميل المواسم');
        } else {
            setSeasons(seasonsData || []);
        }

        loadMatches();
    };

    const loadMatches = async () => {
        setLoading(true);

        let query = supabase
            .from('matches')
            .select('*, seasons(name)')
            .order('created_at', { ascending: false });

        if (selectedSeasonId) {
            query = query.eq('season_id', selectedSeasonId);
        }

        const { data, error: matchesError } = await query;

        if (matchesError) {
            console.error('Matches error:', matchesError);
            setError('خطأ في تحميل المباريات');
        } else {
            setMatches(data || []);
        }

        setLoading(false);
    };

    const handleDelete = async (matchId) => {
        if (!confirm('هل أنت متأكد من حذف هذه المباراة؟ سيتم حذف جميع الأسئلة المرتبطة بها.')) {
            return;
        }

        const { error } = await supabase
            .from('matches')
            .delete()
            .eq('id', matchId);

        if (error) {
            console.error('Delete error:', error);
            alert(`خطأ في الحذف: ${error.message}`);
        } else {
            loadMatches();
        }
    };

    const handleCopyCode = (match) => {
        if (!match.stage_code) {
            alert('هذه المباراة لا تملك رمز مسرح. الرجاء إنشاء مباراة جديدة.');
            return;
        }
        navigator.clipboard.writeText(match.stage_code);
        alert('تم نسخ رمز المباراة: ' + match.stage_code);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'draft': { text: 'مسودة', color: '#6b7280' },
            'ready': { text: 'جاهز', color: '#6ee7b7' },
            'live': { text: 'مباشر', color: '#f59e0b' },
            'finished': { text: 'منتهي', color: '#dc2626' }
        };

        const config = statusMap[status] || statusMap['draft'];

        return (
            <span style={{
                padding: '4px 12px',
                background: config.color,
                color: status === 'draft' ? '#fff' : '#111',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600
            }}>
                {config.text}
            </span>
        );
    };

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24
                }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>المباريات</h1>
                    <button
                        onClick={() => navigate('/matches/create')}
                        style={{
                            padding: '12px 20px',
                            background: '#6ee7b7',
                            color: '#111',
                            border: 'none',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        <span style={{ fontSize: 18 }}>➕</span>
                        إنشاء مباراة جديدة
                    </button>
                </div>

                {/* Error Display */}
                {error && (
                    <div style={{
                        padding: 16,
                        background: '#dc2626',
                        color: '#fff',
                        borderRadius: 8,
                        marginBottom: 24,
                        fontSize: 14
                    }}>
                        {error}
                    </div>
                )}

                {/* Filter */}
                <div style={{ marginBottom: 24 }}>
                    <label style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 8
                    }}>
                        فلترة بالموسم:
                    </label>
                    <select
                        value={selectedSeasonId}
                        onChange={(e) => setSelectedSeasonId(e.target.value)}
                        style={{
                            padding: '10px 16px',
                            background: '#1a1a1a',
                            color: '#eee',
                            border: '1px solid #333',
                            borderRadius: 8,
                            fontSize: 14,
                            cursor: 'pointer',
                            minWidth: 250
                        }}
                    >
                        <option value="">جميع المواسم</option>
                        {seasons.map(season => (
                            <option key={season.id} value={season.id}>
                                {season.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Loading */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                        <div style={{ fontSize: 18, opacity: 0.7 }}>جارٍ التحميل...</div>
                    </div>
                ) : matches.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 60,
                        background: '#1a1a1a',
                        borderRadius: 12,
                        border: '1px dashed #333'
                    }}>
                        <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
                        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                            لا توجد مباريات
                        </div>
                        <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 24 }}>
                            {selectedSeasonId ? 'لا توجد مباريات في هذا الموسم' : 'ابدأ بإنشاء مباراة جديدة'}
                        </div>
                        <button
                            onClick={() => navigate('/matches/create')}
                            style={{
                                padding: '12px 24px',
                                background: '#6ee7b7',
                                color: '#111',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600
                            }}
                        >
                            إنشاء مباراة جديدة
                        </button>
                    </div>
                ) : (
                    /* Matches Table */
                    <div style={{
                        background: '#1a1a1a',
                        borderRadius: 12,
                        border: '1px solid #333',
                        overflow: 'hidden'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#2b2b2b' }}>
                                <tr>
                                    <th style={{
                                        padding: '14px 16px',
                                        textAlign: 'right',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        borderBottom: '1px solid #333'
                                    }}>
                                        المباراة
                                    </th>
                                    <th style={{
                                        padding: '14px 16px',
                                        textAlign: 'right',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        borderBottom: '1px solid #333'
                                    }}>
                                        الموسم
                                    </th>
                                    <th style={{
                                        padding: '14px 16px',
                                        textAlign: 'right',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        borderBottom: '1px solid #333'
                                    }}>
                                        كلمة السر
                                    </th>
                                    <th style={{
                                        padding: '14px 16px',
                                        textAlign: 'center',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        borderBottom: '1px solid #333'
                                    }}>
                                        الحالة
                                    </th>
                                    <th style={{
                                        padding: '14px 16px',
                                        textAlign: 'right',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        borderBottom: '1px solid #333'
                                    }}>
                                        تاريخ الإنشاء
                                    </th>
                                    <th style={{
                                        padding: '14px 16px',
                                        textAlign: 'center',
                                        fontSize: 13,
                                        fontWeight: 600,
                                        borderBottom: '1px solid #333'
                                    }}>
                                        الإجراءات
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {matches.map(match => (
                                    <tr key={match.id} style={{ borderBottom: '1px solid #333' }}>
                                        <td style={{ padding: '16px', fontSize: 14 }}>
                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                                {match.team1_name} 🆚 {match.team2_name}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px', fontSize: 14 }}>
                                            {match.seasons?.name || 'غير محدد'}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: 16, fontWeight: 600, fontFamily: 'inherit', direction: 'rtl' }}>
                                            {match.secret_word_display}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            {getStatusBadge(match.status)}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: 13, opacity: 0.7 }}>
                                            {formatDate(match.created_at)}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                                <button
                                                    onClick={() => handleCopyCode(match)}
                                                    title="نسخ رمز المباراة"
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#2b2b2b',
                                                        color: '#6ee7b7',
                                                        border: '1px solid #6ee7b7',
                                                        borderRadius: 6,
                                                        cursor: 'pointer',
                                                        fontSize: 13,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    📋 {match.stage_code || '---'}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(match.id)}
                                                    title="حذف المباراة"
                                                    style={{
                                                        padding: '6px 12px',
                                                        background: '#dc2626',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: 6,
                                                        cursor: 'pointer',
                                                        fontSize: 13,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    🗑️ حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Stats */}
                {!loading && matches.length > 0 && (
                    <div style={{
                        marginTop: 16,
                        padding: 12,
                        background: '#111',
                        borderRadius: 8,
                        fontSize: 13,
                        opacity: 0.8,
                        textAlign: 'center'
                    }}>
                        إجمالي المباريات: <strong>{matches.length}</strong>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
