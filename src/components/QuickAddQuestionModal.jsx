import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function QuickAddQuestionModal({ letter, onClose, onSuccess }) {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [category, setCategory] = useState('');
    const [difficulty, setDifficulty] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSave = async () => {
        // Validation
        if (!question.trim() || !answer.trim()) {
            setError('السؤال والجواب مطلوبان');
            return;
        }

        setSaving(true);
        setError('');

        try {
            const { data, error: insertError } = await supabase
                .from('questions')
                .insert({
                    letter,
                    question: question.trim(),
                    answer: answer.trim(),
                    ...(category && { category: category.trim() }),
                    ...(difficulty && { difficulty })
                })
                .select()
                .single();

            if (insertError) {
                console.error('Insert error:', insertError);
                throw new Error(`فشل إضافة السؤال: ${insertError.message}`);
            }

            console.log('✅ Quick question added:', data);

            // Call success callback with new question
            if (onSuccess) {
                onSuccess(data);
            }

            onClose();
        } catch (err) {
            console.error('Save error:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 10000,
            padding: 20
        }}>
            <div style={{
                width: 'min(600px, 100%)',
                background: '#1a1a1a',
                borderRadius: 16,
                border: '1px solid #333',
                overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
                        إضافة سؤال سريع
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '6px 10px',
                            background: '#333',
                            border: 'none',
                            borderRadius: 6,
                            color: '#eee',
                            cursor: 'pointer',
                            fontSize: 18
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: 24 }}>
                    {error && (
                        <div style={{
                            padding: 12,
                            background: '#dc2626',
                            color: '#fff',
                            borderRadius: 8,
                            marginBottom: 16,
                            fontSize: 14
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gap: 16 }}>
                        {/* Letter (readonly) */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                                الحرف
                            </label>
                            <div style={{
                                padding: '12px 16px',
                                background: '#111',
                                borderRadius: 8,
                                fontSize: 24,
                                fontWeight: 700,
                                color: '#6ee7b7',
                                textAlign: 'center'
                            }}>
                                {letter}
                            </div>
                        </div>

                        {/* Question */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                                السؤال *
                            </label>
                            <textarea
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="أدخل نص السؤال..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: 15,
                                    borderRadius: 8,
                                    background: '#111',
                                    color: '#eee',
                                    border: '1px solid #333',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Answer */}
                        <div>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                                الجواب *
                            </label>
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="أدخل الجواب..."
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: 15,
                                    borderRadius: 8,
                                    background: '#111',
                                    color: '#eee',
                                    border: '1px solid #333',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Optional fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13, opacity: 0.8 }}>
                                    التصنيف (اختياري)
                                </label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    placeholder="مثلاً: علوم"
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        fontSize: 14,
                                        borderRadius: 8,
                                        background: '#111',
                                        color: '#eee',
                                        border: '1px solid #333',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13, opacity: 0.8 }}>
                                    الصعوبة (اختياري)
                                </label>
                                <select
                                    value={difficulty}
                                    onChange={(e) => setDifficulty(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 14px',
                                        fontSize: 14,
                                        borderRadius: 8,
                                        background: '#111',
                                        color: '#eee',
                                        border: '1px solid #333',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">-- اختر --</option>
                                    <option value="easy">سهل</option>
                                    <option value="medium">متوسط</option>
                                    <option value="hard">صعب</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12
                }}>
                    <button
                        onClick={onClose}
                        disabled={saving}
                        style={{
                            padding: '10px 20px',
                            background: '#333',
                            color: '#eee',
                            border: 'none',
                            borderRadius: 6,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: 14
                        }}
                    >
                        إلغاء
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            padding: '10px 20px',
                            background: saving ? '#333' : '#6ee7b7',
                            color: saving ? '#666' : '#111',
                            border: 'none',
                            borderRadius: 6,
                            cursor: saving ? 'not-allowed' : 'pointer',
                            fontSize: 14,
                            fontWeight: 600
                        }}
                    >
                        {saving ? 'جارٍ الحفظ...' : 'حفظ'}
                    </button>
                </div>
            </div>
        </div>
    );
}
