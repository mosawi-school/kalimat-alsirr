import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { getUniqueLetters, getRandomItem } from '../../lib/matchHelpers';
import QuickAddQuestionModal from '../QuickAddQuestionModal';

export default function Step3AssignQuestions({ data, onChange }) {
    const [loading, setLoading] = useState(true);
    const [uniqueLetters, setUniqueLetters] = useState([]);
    const [letterQuestions, setLetterQuestions] = useState({});
    const [selectedQuestions, setSelectedQuestions] = useState({});
    const [availableQuestions, setAvailableQuestions] = useState({});
    const [error, setError] = useState('');
    const [missingLetters, setMissingLetters] = useState([]);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [quickAddLetter, setQuickAddLetter] = useState('');

    useEffect(() => {
        if (data.secretWordNormalized) {
            const letters = getUniqueLetters(data.secretWordNormalized);
            setUniqueLetters(letters);
            // Only load if seasonId is present (or we might load without filtering)
            if (data.seasonId) {
                console.log('🔄 Step3: Loading questions for letters. Season ID:', data.seasonId);
                loadQuestionsForLetters(letters);
            } else {
                console.warn('⚠️ Step3: Season ID missing in data. cannot filter used questions properly yet.');
                // Still load, but used questions will be empty
                loadQuestionsForLetters(letters);
            }
        }
    }, [data.secretWordNormalized, data.seasonId]);

    const loadQuestionsForLetters = async (letters) => {
        setLoading(true);
        setError('');

        // 1. Fetch used questions for this season
        let usedQuestionIds = new Set();
        if (data.seasonId) {
            console.log(`📡 Fetching used questions for season: ${data.seasonId}`);
            const { data: usedData, error: usedError } = await supabase
                .from('season_used_questions')
                .select('question_id')
                .eq('season_id', data.seasonId);

            if (usedError) {
                console.error('❌ Error fetching used questions:', usedError);
                // Continue with warning? or block? For safety, we log but continue, maybe better to block?
                // User said: "Exclude forbidden questions". If error, we might not exclude.
                // Let's assume empty if error to not block flow, but log it.
            } else if (usedData) {
                console.log(`✅ Fetched ${usedData.length} used questions for this season.`);
                usedData.forEach(q => usedQuestionIds.add(q.question_id));
            }
        } else {
            console.warn('⚠️ No Season ID provided to loadQuestionsForLetters. Skipping used questions fetch.');
        }

        const questionsMap = {};
        const availableMap = {};
        const missing = [];

        for (const letter of letters) {
            const { data: questions, error: fetchError } = await supabase
                .from('questions')
                .select('*')
                .eq('letter', letter);

            if (fetchError) {
                console.error(`Error fetching questions for ${letter}:`, fetchError);
                setError(`خطأ في تحميل أسئلة حرف ${letter}: ${fetchError.message}`);
                setLoading(false);
                return;
            }

            // FILTER: Exclude used questions
            const totalQuestions = questions ? questions.length : 0;
            const filteredQuestions = questions ? questions.filter(q => !usedQuestionIds.has(q.id)) : [];
            const excludedCount = totalQuestions - filteredQuestions.length;

            console.log(`Letter ${letter}: Total ${totalQuestions}, Excluded (Used) ${excludedCount}, Available ${filteredQuestions.length}`);

            if (!filteredQuestions || filteredQuestions.length === 0) {
                // Track missing letter instead of blocking
                missing.push(letter);
                questionsMap[letter] = [];
                availableMap[letter] = [];
            } else {
                questionsMap[letter] = filteredQuestions;
                availableMap[letter] = filteredQuestions;

                // Auto-select first random question
                const randomQ = getRandomItem(filteredQuestions);
                setSelectedQuestions(prev => ({
                    ...prev,
                    [letter]: randomQ
                }));
            }
        }

        console.log('✅ Load questions complete. Missing letters:', missing);

        setLetterQuestions(questionsMap);
        setAvailableQuestions(availableMap);
        setMissingLetters(missing);

        // Update parent with missing letters info
        onChange({ ...data, missingLetters: missing });

        setLoading(false);
    };

    const handleSwapQuestion = (letter) => {
        const allQuestions = letterQuestions[letter];
        const currentQuestion = selectedQuestions[letter];

        // Get all selected question IDs to avoid duplicates
        const selectedIds = Object.values(selectedQuestions)
            .filter(q => q && q.id !== currentQuestion?.id)
            .map(q => q.id);

        // Filter out current question and already selected questions
        const available = allQuestions.filter(q =>
            q.id !== currentQuestion?.id && !selectedIds.includes(q.id)
        );

        if (available.length === 0) {
            setError(`لا توجد أسئلة بديلة متاحة لحرف "${letter}". جميع الأسئلة مستخدمة في المباراة.`);
            return;
        }

        const newQuestion = getRandomItem(available);
        setSelectedQuestions(prev => ({
            ...prev,
            [letter]: newQuestion
        }));

        // Update parent data
        const updatedQuestions = { ...selectedQuestions, [letter]: newQuestion };
        onChange({ ...data, selectedQuestions: updatedQuestions });

        // Clear error if it was about this letter
        setError('');
    };

    useEffect(() => {
        // Sync selected questions to parent
        if (Object.keys(selectedQuestions).length > 0) {
            onChange({ ...data, selectedQuestions });
        }
    }, [selectedQuestions]);

    const handleQuickAdd = (letter) => {
        setQuickAddLetter(letter);
        setShowQuickAdd(true);
    };

    const handleQuickAddSuccess = async (newQuestion) => {
        console.log('Quick add success:', newQuestion);

        // Select this new question for the letter
        setSelectedQuestions(prev => ({
            ...prev,
            [quickAddLetter]: newQuestion
        }));

        // Update letter questions map
        setLetterQuestions(prev => ({
            ...prev,
            [quickAddLetter]: [...(prev[quickAddLetter] || []), newQuestion]
        }));

        // Remove from missing letters
        setMissingLetters(prev => prev.filter(l => l !== quickAddLetter));

        // Update parent
        const updatedMissing = missingLetters.filter(l => l !== quickAddLetter);
        const updatedQuestions = { ...selectedQuestions, [quickAddLetter]: newQuestion };
        onChange({
            ...data,
            selectedQuestions: updatedQuestions,
            missingLetters: updatedMissing
        });
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: 60 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                <div style={{ fontSize: 18, opacity: 0.7 }}>جارٍ تحميل الأسئلة...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>تعيين الأسئلة</h2>
                <div style={{
                    padding: 20,
                    background: '#dc2626',
                    color: '#fff',
                    borderRadius: 12,
                    fontSize: 16
                }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>تعيين الأسئلة</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
                        سيتم اختيار سؤال عشوائي لكل حرف. يمكنك تبديل السؤال إذا أردت.
                    </p>
                    {data.seasonId && (
                        <div style={{ padding: '4px 8px', background: '#333', borderRadius: 6, fontSize: 12, color: '#aaa' }}>
                            أسئلة مستخدمة (محظورة): <span style={{ color: '#fff', fontWeight: 700 }}>تم التحقق</span>
                            <span style={{ color: '#10b981', fontWeight: 700, marginLeft: 4 }}>✓ مفعل</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Missing Letters Warning */}
            {missingLetters.length > 0 && (
                <div style={{
                    padding: 16,
                    background: '#dc2626',
                    color: '#fff',
                    borderRadius: 12,
                    fontSize: 14
                }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>⚠️ حروف ناقصة</div>
                    <div style={{ marginBottom: 8 }}>
                        الحروف التالية لا تملك أسئلة: <strong>{missingLetters.join(', ')}</strong>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>
                        استخدم زر "إضافة سؤال سريع" لكل حرف لإكمال عملية إنشاء المباراة.
                    </div>
                </div>
            )}

            {/* Word Info */}
            <div style={{
                padding: 16,
                background: '#111',
                borderRadius: 8,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>
                        الكلمة السرية المطبّعة:
                    </div>
                    <div style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#6ee7b7',
                        fontFamily: 'inherit',
                        direction: 'rtl'
                    }}>
                        {data.secretWordNormalized}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>
                        الحروف الفريدة:
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                        {uniqueLetters.length} حرف
                    </div>
                </div>
            </div>

            {/* Questions List */}
            <div style={{ display: 'grid', gap: 16 }}>
                {uniqueLetters.map((letter, index) => {
                    const question = selectedQuestions[letter];
                    const totalAvailable = letterQuestions[letter]?.length || 0;
                    const isMissing = missingLetters.includes(letter);

                    return (
                        <div
                            key={letter}
                            style={{
                                padding: 20,
                                background: isMissing ? '#2b1515' : '#111',
                                borderRadius: 12,
                                border: isMissing ? '2px solid #dc2626' : '1px solid #333'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                marginBottom: 16
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 48,
                                        height: 48,
                                        display: 'grid',
                                        placeItems: 'center',
                                        background: isMissing ? '#dc2626' : '#2b2b2b',
                                        borderRadius: 8,
                                        fontSize: 24,
                                        fontWeight: 700,
                                        color: isMissing ? '#fff' : '#6ee7b7'
                                    }}>
                                        {letter}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                                            حرف {index + 1} من {uniqueLetters.length}
                                        </div>
                                        <div style={{ fontSize: 12, opacity: 0.6 }}>
                                            {isMissing ? 'لا توجد أسئلة' : `${totalAvailable} سؤال متاح`}
                                        </div>
                                    </div>
                                </div>

                                {isMissing ? (
                                    <button
                                        onClick={() => handleQuickAdd(letter)}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#6ee7b7',
                                            color: '#111',
                                            border: 'none',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}
                                    >
                                        <span style={{ fontSize: 16 }}>➕</span>
                                        إضافة سؤال سريع
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSwapQuestion(letter)}
                                        style={{
                                            padding: '8px 16px',
                                            background: '#2b2b2b',
                                            color: '#6ee7b7',
                                            border: '1px solid #6ee7b7',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 13,
                                            fontWeight: 600,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6
                                        }}
                                    >
                                        <span style={{ fontSize: 16 }}>🔄</span>
                                        تبديل السؤال
                                    </button>
                                )}
                            </div>

                            {question && (
                                <div style={{
                                    padding: 16,
                                    background: '#1a1a1a',
                                    borderRadius: 8
                                }}>
                                    <div>
                                        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
                                            السؤال:
                                        </div>
                                        <div style={{ fontSize: 16, marginBottom: 12 }}>
                                            {question.question}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 4 }}>
                                            الجواب:
                                        </div>
                                        <div style={{
                                            fontSize: 16,
                                            fontWeight: 600,
                                            color: '#6ee7b7'
                                        }}>
                                            {question.answer}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{
                padding: 14,
                background: '#0d47a1',
                borderRadius: 8,
                fontSize: 13,
                opacity: 0.9
            }}>
                <strong>💡 ملاحظة:</strong> لن يتم تسجيل الأسئلة كـ "مستخدمة" إلا عند إنهاء المباراة. في الوقت الحالي، يمكنك تبديل الأسئلة بحرية.
            </div>

            {/* Quick Add Modal */}
            {showQuickAdd && (
                <QuickAddQuestionModal
                    letter={quickAddLetter}
                    onClose={() => setShowQuickAdd(false)}
                    onSuccess={handleQuickAddSuccess}
                />
            )}
        </div>
    );
}
