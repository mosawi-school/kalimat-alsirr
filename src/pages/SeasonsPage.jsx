import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AdminLayout from '../components/AdminLayout';

export default function SeasonsPage() {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newSeasonName, setNewSeasonName] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        loadSeasons();
    }, []);

    const loadSeasons = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('seasons')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('❌ Load Seasons Error:', error);
            setError(`خطأ في تحميل المواسم: ${error.message}`);
        } else if (data) {
            setSeasons(data);
            setError('');
        }
        setLoading(false);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newSeasonName.trim()) return;

        console.log('🔵 Creating season:', newSeasonName.trim());
        const { data, error } = await supabase
            .from('seasons')
            .insert([{ name: newSeasonName.trim() }])
            .select();

        if (error) {
            console.error('❌ Create Season Error:', error);
            setError(`خطأ في إضافة الموسم: ${error.message} (${error.code || 'unknown'})`);
        } else {
            console.log('✅ Season created:', data);
            setNewSeasonName('');
            setError('');
            loadSeasons();
        }
    };

    const handleStartEdit = (season) => {
        setEditingId(season.id);
        setEditName(season.name);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const handleSaveEdit = async (id) => {
        if (!editName.trim()) return;

        const { error } = await supabase
            .from('seasons')
            .update({ name: editName.trim() })
            .eq('id', id);

        if (error) {
            console.error('❌ Update Season Error:', error);
            setError(`خطأ في تحديث الموسم: ${error.message}`);
        } else {
            setEditingId(null);
            setEditName('');
            setError('');
            loadSeasons();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا الموسم؟ سيتم حذف جميع المباريات المرتبطة به.')) {
            return;
        }

        const { error } = await supabase
            .from('seasons')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('❌ Delete Season Error:', error);
            setError(`خطأ في حذف الموسم: ${error.message}`);
        } else {
            setError('');
            loadSeasons();
        }
    };

    return (
        <AdminLayout>
            <div>
                <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 24 }}>المواسم</h1>

                {/* Error Display */}
                {error && (
                    <div style={{
                        padding: '14px 18px',
                        marginBottom: 24,
                        background: '#dc2626',
                        color: '#fff',
                        borderRadius: 8,
                        fontSize: 14,
                        wordBreak: 'break-word'
                    }}>
                        {error}
                    </div>
                )}

                {/* Create Season Form */}
                <form onSubmit={handleCreate} style={{
                    padding: 24,
                    background: '#111',
                    borderRadius: 12,
                    border: '1px solid #333',
                    marginBottom: 32
                }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>إضافة موسم جديد</h2>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input
                            type="text"
                            value={newSeasonName}
                            onChange={(e) => setNewSeasonName(e.target.value)}
                            placeholder="اسم الموسم (مثال: موسم 2026)"
                            style={{
                                flex: 1,
                                padding: '10px 14px',
                                fontSize: 16,
                                borderRadius: 8,
                                background: '#1a1a1a',
                                color: '#eee',
                                border: '1px solid #333',
                                outline: 'none'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '10px 20px',
                                fontSize: 16,
                                fontWeight: 600,
                                borderRadius: 8,
                                background: '#6ee7b7',
                                color: '#111',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            إضافة
                        </button>
                    </div>
                </form>

                {/* Seasons List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, fontSize: 18, opacity: 0.7 }}>
                        جارٍ التحميل...
                    </div>
                ) : seasons.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 60,
                        background: '#111',
                        borderRadius: 12,
                        border: '1px solid #333'
                    }}>
                        <p style={{ fontSize: 18, opacity: 0.7, margin: 0 }}>لا توجد مواسم بعد. أضف موسمك الأول!</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 16 }}>
                        {seasons.map((season) => (
                            <div
                                key={season.id}
                                style={{
                                    padding: 20,
                                    background: '#111',
                                    borderRadius: 12,
                                    border: '1px solid #333',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}
                            >
                                {editingId === season.id ? (
                                    <div style={{ flex: 1, display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            style={{
                                                flex: 1,
                                                padding: '8px 12px',
                                                fontSize: 16,
                                                borderRadius: 8,
                                                background: '#1a1a1a',
                                                color: '#eee',
                                                border: '1px solid #6ee7b7',
                                                outline: 'none'
                                            }}
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleSaveEdit(season.id)}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: 8,
                                                background: '#6ee7b7',
                                                color: '#111',
                                                border: 'none',
                                                cursor: 'pointer',
                                                fontWeight: 600
                                            }}
                                        >
                                            حفظ
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            style={{
                                                padding: '8px 16px',
                                                borderRadius: 8,
                                                background: '#333',
                                                color: '#eee',
                                                border: 'none',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px 0' }}>
                                                {season.name}
                                            </h3>
                                            <p style={{ margin: 0, fontSize: 14, opacity: 0.6 }}>
                                                تاريخ الإنشاء: {new Date(season.created_at).toLocaleDateString('ar')}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <button
                                                onClick={() => handleStartEdit(season)}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: 8,
                                                    background: '#2b2b2b',
                                                    color: '#6ee7b7',
                                                    border: '1px solid #6ee7b7',
                                                    cursor: 'pointer',
                                                    fontWeight: 600
                                                }}
                                            >
                                                تعديل
                                            </button>
                                            <button
                                                onClick={() => handleDelete(season.id)}
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
                                                حذف
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
