import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import AdminLayout from '../components/AdminLayout';
import ImportQuestionsModal from '../components/ImportQuestionsModal';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statistics, setStatistics] = useState({ total: 0, byLetter: {} });

    // Form state
    const [newQuestion, setNewQuestion] = useState({ letter: '', question: '', answer: '' });
    const [formError, setFormError] = useState('');

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ letter: '', question: '', answer: '' });

    // Filter & Search state
    const [selectedLetter, setSelectedLetter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [availableLetters, setAvailableLetters] = useState([]);

    // Statistics display state
    const [showAllLetters, setShowAllLetters] = useState(false);

    // Import modal state
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        loadQuestions();
    }, [selectedLetter, searchTerm]);

    const loadQuestions = async () => {
        setLoading(true);

        let query = supabase.from('questions').select('*');

        // Apply letter filter
        if (selectedLetter !== 'all') {
            query = query.eq('letter', selectedLetter);
        }

        // Apply search
        if (searchTerm.trim()) {
            query = query.or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('❌ Load Questions Error:', error);
            setFormError(`خطأ في تحميل الأسئلة: ${error.message}`);
        } else if (data) {
            setQuestions(data);
        }

        // Load statistics
        await loadStatistics();

        setLoading(false);
    };

    const loadStatistics = async () => {
        const { data, error } = await supabase.from('questions').select('letter');

        if (!error && data) {
            const total = data.length;
            const byLetter = {};
            const letters = new Set();

            data.forEach((q) => {
                const letter = q.letter;
                letters.add(letter);
                byLetter[letter] = (byLetter[letter] || 0) + 1;
            });

            setStatistics({ total, byLetter });
            setAvailableLetters(Array.from(letters).sort((a, b) => a.localeCompare(b, 'ar')));
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setFormError('');

        const { letter, question, answer } = newQuestion;

        // Validation
        if (!letter.trim() || !question.trim() || !answer.trim()) {
            setFormError('جميع الحقول مطلوبة');
            return;
        }

        if (letter.trim().length !== 1) {
            setFormError('الحرف يجب أن يكون حرفاً واحداً فقط');
            return;
        }

        console.log('🔵 Creating question:', { letter: letter.trim(), question: question.trim(), answer: answer.trim() });
        const { data, error } = await supabase.from('questions').insert([{
            letter: letter.trim(),
            question: question.trim(),
            answer: answer.trim()
        }]).select();

        if (error) {
            console.error('❌ Create Question Error:', error);
            setFormError(`خطأ في إضافة السؤال: ${error.message} (${error.code || 'unknown'})`);
        } else {
            console.log('✅ Question created:', data);
            setNewQuestion({ letter: '', question: '', answer: '' });
            setFormError('');
            loadQuestions();
        }
    };

    const handleStartEdit = (question) => {
        setEditingId(question.id);
        setEditData({
            letter: question.letter,
            question: question.question,
            answer: question.answer
        });
        setFormError('');
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditData({ letter: '', question: '', answer: '' });
        setFormError('');
    };

    const handleSaveEdit = async (id) => {
        const { letter, question, answer } = editData;

        // Validation
        if (!letter.trim() || !question.trim() || !answer.trim()) {
            setFormError('جميع الحقول مطلوبة');
            return;
        }

        if (letter.trim().length !== 1) {
            setFormError('الحرف يجب أن يكون حرفاً واحداً فقط');
            return;
        }

        const { error } = await supabase
            .from('questions')
            .update({
                letter: letter.trim(),
                question: question.trim(),
                answer: answer.trim()
            })
            .eq('id', id);

        if (error) {
            console.error('❌ Update Question Error:', error);
            setFormError(`خطأ في تحديث السؤال: ${error.message}`);
        } else {
            setEditingId(null);
            setEditData({ letter: '', question: '', answer: '' });
            setFormError('');
            loadQuestions();
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('هل أنت متأكد من حذف هذا السؤال؟')) {
            return;
        }

        const { error } = await supabase.from('questions').delete().eq('id', id);

        if (error) {
            console.error('❌ Delete Question Error:', error);
            setFormError(`خطأ في حذف السؤال: ${error.message}`);
        } else {
            setFormError('');
            loadQuestions();
        }
    };

    // Get letters to display (first 6 or all)
    const lettersToShow = showAllLetters ? availableLetters : availableLetters.slice(0, 6);
    const hasMoreLetters = availableLetters.length > 6;

    return (
        <AdminLayout>
            <div>
                {/* Header with Import Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0 }}>مكتبة الأسئلة</h1>
                    <button
                        onClick={() => setShowImportModal(true)}
                        style={{
                            padding: '12px 20px',
                            background: '#2b2b2b',
                            color: '#6ee7b7',
                            border: '2px solid #6ee7b7',
                            borderRadius: 8,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        <span style={{ fontSize: 18 }}>📥</span>
                        استيراد CSV/XLSX
                    </button>
                </div>

                {/* Statistics - Compact Grid */}
                <div style={{ marginBottom: 32 }}>
                    {/* Total Card */}
                    <div style={{
                        padding: 20,
                        background: '#111',
                        borderRadius: 12,
                        border: '2px solid #6ee7b7',
                        marginBottom: 16,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 4 }}>إجمالي الأسئلة</div>
                            <div style={{ fontSize: 32, fontWeight: 900, color: '#6ee7b7' }}>{statistics.total}</div>
                        </div>
                        <div style={{ fontSize: 48, opacity: 0.3 }}>📚</div>
                    </div>

                    {/* Letters Grid - Compact */}
                    {availableLetters.length > 0 && (
                        <>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                                gap: 12
                            }}>
                                {lettersToShow.map((letter) => (
                                    <div
                                        key={letter}
                                        onClick={() => setSelectedLetter(letter)}
                                        style={{
                                            padding: '12px 16px',
                                            background: selectedLetter === letter ? '#2b2b2b' : '#111',
                                            borderRadius: 8,
                                            border: selectedLetter === letter ? '1px solid #6ee7b7' : '1px solid #333',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ fontSize: 20, fontWeight: 700, color: '#6ee7b7' }}>{letter}</div>
                                        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>
                                            {statistics.byLetter[letter]} سؤال
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Show More/Less Button */}
                            {hasMoreLetters && (
                                <button
                                    onClick={() => setShowAllLetters(!showAllLetters)}
                                    style={{
                                        marginTop: 12,
                                        padding: '8px 16px',
                                        background: '#2b2b2b',
                                        color: '#6ee7b7',
                                        border: '1px solid #6ee7b7',
                                        borderRadius: 6,
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        width: '100%'
                                    }}
                                >
                                    {showAllLetters
                                        ? `إخفاء (${availableLetters.length - 6} حرف)`
                                        : `عرض كل الحروف (${availableLetters.length - 6}+ حرف)`
                                    }
                                </button>
                            )}
                        </>
                    )}
                </div>

                {/* Error Display */}
                {formError && (
                    <div style={{
                        padding: '14px 18px',
                        marginBottom: 24,
                        background: '#dc2626',
                        color: '#fff',
                        borderRadius: 8,
                        fontSize: 14,
                        wordBreak: 'break-word'
                    }}>
                        {formError}
                    </div>
                )}

                {/* Add Question Form */}
                <form onSubmit={handleCreate} style={{
                    padding: 24,
                    background: '#111',
                    borderRadius: 12,
                    border: '1px solid #333',
                    marginBottom: 32
                }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>إضافة سؤال جديد</h2>

                    <div style={{ display: 'grid', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                                الحرف (حرف واحد فقط)
                            </label>
                            <input
                                type="text"
                                value={newQuestion.letter}
                                onChange={(e) => setNewQuestion({ ...newQuestion, letter: e.target.value })}
                                placeholder="مثال: أ"
                                maxLength={1}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    fontSize: 16,
                                    borderRadius: 8,
                                    background: '#1a1a1a',
                                    color: '#eee',
                                    border: '1px solid #333',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                                السؤال
                            </label>
                            <textarea
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                placeholder="أدخل السؤال هنا..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    fontSize: 16,
                                    borderRadius: 8,
                                    background: '#1a1a1a',
                                    color: '#eee',
                                    border: '1px solid #333',
                                    outline: 'none',
                                    resize: 'vertical',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                                الجواب
                            </label>
                            <input
                                type="text"
                                value={newQuestion.answer}
                                onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                                placeholder="مثال: ألف"
                                style={{
                                    width: '100%',
                                    padding: '10px 14px',
                                    fontSize: 16,
                                    borderRadius: 8,
                                    background: '#1a1a1a',
                                    color: '#eee',
                                    border: '1px solid #333',
                                    outline: 'none'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                padding: '12px 20px',
                                fontSize: 16,
                                fontWeight: 600,
                                borderRadius: 8,
                                background: '#6ee7b7',
                                color: '#111',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            إضافة السؤال
                        </button>
                    </div>
                </form>

                {/* Filter & Search */}
                <div style={{
                    padding: 20,
                    background: '#111',
                    borderRadius: 12,
                    border: '1px solid #333',
                    marginBottom: 24,
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap'
                }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                            فلترة بالحرف
                        </label>
                        <select
                            value={selectedLetter}
                            onChange={(e) => setSelectedLetter(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                fontSize: 16,
                                borderRadius: 8,
                                background: '#1a1a1a',
                                color: '#eee',
                                border: '1px solid #333',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="all">الكل</option>
                            {availableLetters.map((letter) => (
                                <option key={letter} value={letter}>
                                    {letter} ({statistics.byLetter[letter]})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ flex: '2 1 300px' }}>
                        <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                            بحث في الأسئلة والأجوبة
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="ابحث عن كلمة..."
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                fontSize: 16,
                                borderRadius: 8,
                                background: '#1a1a1a',
                                color: '#eee',
                                border: '1px solid #333',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40, fontSize: 18, opacity: 0.7 }}>
                        جارٍ التحميل...
                    </div>
                ) : questions.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: 60,
                        background: '#111',
                        borderRadius: 12,
                        border: '1px solid #333'
                    }}>
                        <p style={{ fontSize: 18, opacity: 0.7, margin: 0 }}>
                            {searchTerm || selectedLetter !== 'all'
                                ? 'لا توجد نتائج تطابق البحث'
                                : 'لا توجد أسئلة بعد. أضف سؤالك الأول!'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: 16 }}>
                        {questions.map((q) => (
                            <div
                                key={q.id}
                                style={{
                                    padding: 20,
                                    background: '#111',
                                    borderRadius: 12,
                                    border: editingId === q.id ? '1px solid #6ee7b7' : '1px solid #333',
                                    display: 'grid',
                                    gap: 12
                                }}
                            >
                                {editingId === q.id ? (
                                    // Edit Mode
                                    <>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                                                الحرف
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.letter}
                                                onChange={(e) => setEditData({ ...editData, letter: e.target.value })}
                                                maxLength={1}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    fontSize: 16,
                                                    borderRadius: 8,
                                                    background: '#1a1a1a',
                                                    color: '#eee',
                                                    border: '1px solid #6ee7b7',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                                                السؤال
                                            </label>
                                            <textarea
                                                value={editData.question}
                                                onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                                                rows={3}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    fontSize: 16,
                                                    borderRadius: 8,
                                                    background: '#1a1a1a',
                                                    color: '#eee',
                                                    border: '1px solid #6ee7b7',
                                                    outline: 'none',
                                                    resize: 'vertical',
                                                    fontFamily: 'inherit'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
                                                الجواب
                                            </label>
                                            <input
                                                type="text"
                                                value={editData.answer}
                                                onChange={(e) => setEditData({ ...editData, answer: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    fontSize: 16,
                                                    borderRadius: 8,
                                                    background: '#1a1a1a',
                                                    color: '#eee',
                                                    border: '1px solid #6ee7b7',
                                                    outline: 'none'
                                                }}
                                            />
                                        </div>
                                        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                            <button
                                                onClick={() => handleSaveEdit(q.id)}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 16px',
                                                    borderRadius: 8,
                                                    background: '#6ee7b7',
                                                    color: '#111',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontWeight: 600,
                                                    fontSize: 14
                                                }}
                                            >
                                                حفظ
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px 16px',
                                                    borderRadius: 8,
                                                    background: '#333',
                                                    color: '#eee',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: 14
                                                }}
                                            >
                                                إلغاء
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    // View Mode
                                    <>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{
                                                display: 'inline-block',
                                                padding: '6px 12px',
                                                background: '#2b2b2b',
                                                color: '#6ee7b7',
                                                borderRadius: 6,
                                                fontWeight: 700,
                                                fontSize: 18
                                            }}>
                                                {q.letter}
                                            </div>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    onClick={() => handleStartEdit(q)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: 6,
                                                        background: '#2b2b2b',
                                                        color: '#6ee7b7',
                                                        border: '1px solid #6ee7b7',
                                                        cursor: 'pointer',
                                                        fontSize: 14,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(q.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: 6,
                                                        background: '#dc2626',
                                                        color: '#fff',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: 14,
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 4 }}>السؤال:</div>
                                            <div style={{ fontSize: 16 }}>{q.question}</div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: 14, opacity: 0.6, marginBottom: 4 }}>الجواب:</div>
                                            <div style={{ fontSize: 16, fontWeight: 600, color: '#6ee7b7' }}>{q.answer}</div>
                                        </div>

                                        <div style={{ fontSize: 12, opacity: 0.5 }}>
                                            تاريخ الإضافة: {new Date(q.created_at).toLocaleString('ar')}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Import Modal */}
                <ImportQuestionsModal
                    isOpen={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => {
                        setShowImportModal(false);
                        loadQuestions();
                    }}
                />
            </div>
        </AdminLayout>
    );
}
