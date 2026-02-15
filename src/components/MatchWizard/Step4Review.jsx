import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { generateStageUrl, generateStageCode } from '../../lib/matchHelpers';

export default function Step4Review({ data, seasons }) {
    const [creating, setCreating] = useState(false);
    const [created, setCreated] = useState(false);
    const [stageCode, setStageCode] = useState(null);
    const [error, setError] = useState('');

    const season = seasons.find(s => s.id === data.seasonId);
    const questionCount = data.selectedQuestions ? Object.keys(data.selectedQuestions).length : 0;
    const missingLetters = data.missingLetters || [];
    const hasMissingLetters = missingLetters.length > 0;

    const handleCreate = async () => {
        setCreating(true);
        setError('');

        try {
            // 1. Generate unique stage code
            const code = await generateStageCode(async (testCode) => {
                const { data } = await supabase
                    .from('matches')
                    .select('id')
                    .eq('stage_code', testCode)
                    .maybeSingle();
                return !!data;
            });

            console.log('Generated stage code:', code);

            // 2. Insert match
            const { data: match, error: matchError } = await supabase
                .from('matches')
                .insert({
                    season_id: data.seasonId,
                    team1_name: data.team1Name.trim(),
                    team2_name: data.team2Name.trim(),
                    secret_word_display: data.secretWordDisplay.trim(),
                    secret_word_normalized: data.secretWordNormalized,
                    shuffled_letters: data.shuffledLetters || [],
                    stage_code: code,
                    status: 'draft',
                    hint_text: data.hintText || null
                })
                .select()
                .single();

            if (matchError) {
                console.error('Match creation error:', matchError);
                throw new Error(`فشل إنشاء المباراة: ${matchError.message}`);
            }

            console.log('✅ Match created:', match);

            // 3. Insert match_questions (batch)
            const matchQuestions = Object.entries(data.selectedQuestions).map(([letter, question]) => ({
                match_id: match.id,
                original_question_id: question.id,
                question_text: question.question,
                answer_text: question.answer,
                letter: letter
            }));

            const { error: questionsError } = await supabase
                .from('match_questions')
                .insert(matchQuestions);

            if (questionsError) {
                console.error('Match questions error:', questionsError);
                // Try to delete the match if questions insertion failed
                await supabase.from('matches').delete().eq('id', match.id);
                throw new Error(`فشل إضافة الأسئلة: ${questionsError.message}`);
            }

            console.log('✅ Match questions created');

            // Success!
            setStageCode(code);
            setCreated(true);

        } catch (err) {
            console.error('Creation error:', err);
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    if (created && stageCode) {
        const stageUrl = generateStageUrl(stageCode);

        return (
            <div style={{ display: 'grid', gap: 24 }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                    <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
                        تم إنشاء المباراة بنجاح!
                    </h2>
                    <p style={{ fontSize: 14, opacity: 0.7 }}>
                        يمكنك الآن مشاركة رابط المسرح مع المتسابقين
                    </p>
                </div>

                {/* Stage Code & URL */}
                <div style={{
                    padding: 24,
                    background: '#111',
                    borderRadius: 12,
                    border: '2px solid #6ee7b7',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#fbbf24' }}>
                        رمز المباراة
                    </div>

                    {/* Large Code */}
                    <div style={{
                        fontSize: 80,
                        fontWeight: 900,
                        marginBottom: 24,
                        color: '#fff',
                        letterSpacing: 12,
                        fontFamily: 'monospace',
                        direction: 'ltr'
                    }}>
                        {stageCode}
                    </div>

                    {/* Copy Code Button */}
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(stageCode);
                            alert('تم نسخ الرمز: ' + stageCode);
                        }}
                        style={{
                            padding: '16px 32px',
                            background: '#fbbf24',
                            color: '#111',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            fontSize: 20,
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 12,
                            marginBottom: 32,
                            minWidth: 200
                        }}
                    >
                        <span>📋</span>
                        نسخ الرمز
                    </button>

                    <div style={{ borderTop: '1px solid #333', paddingTop: 24 }}>
                        <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 8 }}>
                            رابط المسرح المباشر:
                        </div>
                        <div style={{
                            padding: 12,
                            background: '#1a1a1a',
                            borderRadius: 6,
                            fontSize: 13,
                            marginBottom: 8,
                            wordBreak: 'break-all',
                            direction: 'ltr',
                            color: '#6ee7b7',
                            fontFamily: 'monospace'
                        }}>
                            {stageUrl}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <button
                        onClick={() => window.location.href = '/#/matches'}
                        style={{
                            padding: '12px 20px',
                            background: '#2b2b2b',
                            color: '#eee',
                            border: '1px solid #333',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 14
                        }}
                    >
                        قائمة المباريات
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '12px 20px',
                            background: '#2b2b2b',
                            color: '#6ee7b7',
                            border: '1px solid #6ee7b7',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 14,
                            fontWeight: 600
                        }}
                    >
                        إنشاء مباراة جديدة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>المراجعة والإنشاء</h2>
                <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
                    راجع البيانات قبل إنشاء المباراة
                </p>
            </div>

            {/* Missing Letters Blocker */}
            {hasMissingLetters && (
                <div style={{
                    padding: 20,
                    background: '#dc2626',
                    color: '#fff',
                    borderRadius: 12,
                    fontSize: 14
                }}>
                    <div style={{ fontSize: 28, marginBottom: 12 }}>⚠️</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                        لا يمكن إنشاء المباراة
                    </div>
                    <div style={{ marginBottom: 8 }}>
                        الحروف التالية لا تملك أسئلة معينة: <strong>{missingLetters.join(', ')}</strong>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.9 }}>
                        الرجاء العودة إلى الخطوة السابقة وإضافة أسئلة لجميع الحروف أولاً.
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div style={{
                    padding: 16,
                    background: '#dc2626',
                    color: '#fff',
                    borderRadius: 8,
                    fontSize: 14
                }}>
                    {error}
                </div>
            )}

            {/* Summary Cards */}
            <div style={{ display: 'grid', gap: 16 }}>
                {/* Basic Info */}
                <div style={{
                    padding: 20,
                    background: '#111',
                    borderRadius: 12,
                    border: '1px solid #333'
                }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                        المعلومات الأساسية
                    </div>
                    <div style={{ display: 'grid', gap: 8, fontSize: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.7 }}>الموسم:</span>
                            <span style={{ fontWeight: 600 }}>{season?.name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.7 }}>الفريق الأول:</span>
                            <span style={{ fontWeight: 600 }}>{data.team1Name}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ opacity: 0.7 }}>الفريق الثاني:</span>
                            <span style={{ fontWeight: 600 }}>{data.team2Name}</span>
                        </div>
                        {data.hintText && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: 8 }}>
                                <span style={{ opacity: 0.7 }}>المساعدة:</span>
                                <span style={{ fontWeight: 600, color: '#fbbf24' }}>{data.hintText}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secret Word */}
                <div style={{
                    padding: 20,
                    background: '#111',
                    borderRadius: 12,
                    border: '1px solid #6ee7b7'
                }}>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                        كلمة السر
                    </div>
                    <div style={{ display: 'grid', gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                                للعرض (مع التشكيل):
                            </div>
                            <div style={{
                                fontSize: 24,
                                fontWeight: 700,
                                fontFamily: 'inherit',
                                direction: 'rtl',
                                color: '#6ee7b7'
                            }}>
                                {data.secretWordDisplay}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                                المطبّعة (للأسئلة):
                            </div>
                            <div style={{
                                fontSize: 20,
                                fontWeight: 600,
                                fontFamily: 'inherit',
                                direction: 'rtl'
                            }}>
                                {data.secretWordNormalized}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                                الحروف المبعثرة:
                            </div>
                            <div style={{
                                fontSize: 20,
                                fontWeight: 600,
                                fontFamily: 'inherit',
                                direction: 'rtl',
                                letterSpacing: 4
                            }}>
                                {data.shuffledLetters?.join('') || data.secretWordDisplay}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions */}
                <div style={{
                    padding: 20,
                    background: '#111',
                    borderRadius: 12,
                    border: '1px solid #333'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12
                    }}>
                        <div style={{ fontSize: 16, fontWeight: 600 }}>
                            الأسئلة المعينة
                        </div>
                        <div style={{
                            padding: '4px 12px',
                            background: '#6ee7b7',
                            color: '#111',
                            borderRadius: 6,
                            fontSize: 14,
                            fontWeight: 700
                        }}>
                            {questionCount} سؤال
                        </div>
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>
                        سيتم تخزين {questionCount} سؤال مرتبط بالمباراة
                    </div>
                </div>
            </div>

            {/* Create Button */}
            <button
                onClick={handleCreate}
                disabled={creating || hasMissingLetters}
                style={{
                    padding: '16px 24px',
                    background: (creating || hasMissingLetters) ? '#333' : '#6ee7b7',
                    color: (creating || hasMissingLetters) ? '#666' : '#111',
                    border: 'none',
                    borderRadius: 8,
                    cursor: (creating || hasMissingLetters) ? 'not-allowed' : 'pointer',
                    fontSize: 18,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    opacity: hasMissingLetters ? 0.5 : 1
                }}
            >
                {creating ? (
                    <>
                        <span style={{ fontSize: 24 }}>⏳</span>
                        جارٍ الإنشاء...
                    </>
                ) : (
                    <>
                        <span style={{ fontSize: 24 }}>🎯</span>
                        إنشاء المباراة
                    </>
                )}
            </button>

            <div style={{
                padding: 14,
                background: '#0d47a1',
                borderRadius: 8,
                fontSize: 13,
                opacity: 0.9
            }}>
                <strong>💡 ملاحظة:</strong> سيتم حفظ المباراة والأسئلة فقط. لن يتم تسجيل الأسئلة كـ "مستخدمة في الموسم" إلا عند إنهاء المباراة.
            </div>
        </div>
    );
}
