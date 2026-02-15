import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import AdminLayout from '../components/AdminLayout';
import Step1BasicInfo from '../components/MatchWizard/Step1BasicInfo';
import Step2ShuffleLetters from '../components/MatchWizard/Step2ShuffleLetters';
import Step3AssignQuestions from '../components/MatchWizard/Step3AssignQuestions';
import Step4Review from '../components/MatchWizard/Step4Review';

export default function CreateMatchPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState({
        seasonId: '',
        team1Name: '',
        team2Name: '',
        secretWordDisplay: '',
        secretWordNormalized: '',
        shuffledLetters: [],
        selectedQuestions: {}
    });

    useEffect(() => {
        loadSeasons();
    }, []);

    const loadSeasons = async () => {
        const { data, error } = await supabase
            .from('seasons')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setSeasons(data);
        }
        setLoading(false);
    };

    const handleNext = () => {
        // Validate current step before proceeding
        if (currentStep === 1) {
            const isValid = Step1BasicInfo.validate(matchData);
            if (!isValid) {
                return;
            }
        }

        // Block Step 3 if missing letters exist
        if (currentStep === 3 && matchData.missingLetters && matchData.missingLetters.length > 0) {
            alert(`لا يمكن المتابعة. الحروف التالية لا تملك أسئلة: ${matchData.missingLetters.join(', ')}`);
            return;
        }

        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleCancel = () => {
        if (confirm('هل أنت متأكد من إلغاء إنشاء المباراة؟ سيتم فقدان جميع البيانات المدخلة.')) {
            navigate('/matches');
        }
    };

    const steps = [
        { number: 1, title: 'المعلومات الأساسية', icon: '📝' },
        { number: 2, title: 'ترتيب الحروف', icon: '🔀' },
        { number: 3, title: 'تعيين الأسئلة', icon: '❓' },
        { number: 4, title: 'المراجعة والإنشاء', icon: '✅' }
    ];

    if (loading) {
        return (
            <AdminLayout>
                <div style={{ textAlign: 'center', padding: 60 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                    <div style={{ fontSize: 18, opacity: 0.7 }}>جارٍ التحميل...</div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: 32 }}>
                    <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
                        إنشاء مباراة جديدة
                    </h1>
                    <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
                        اتبع الخطوات لإنشاء مباراة جديدة
                    </p>
                </div>

                {/* Progress Steps */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 8,
                    marginBottom: 32
                }}>
                    {steps.map(step => (
                        <div
                            key={step.number}
                            style={{
                                padding: '12px 16px',
                                background: currentStep === step.number ? '#6ee7b7' : currentStep > step.number ? '#2b2b2b' : '#111',
                                color: currentStep === step.number ? '#111' : '#eee',
                                borderRadius: 8,
                                border: currentStep === step.number ? 'none' : '1px solid #333',
                                textAlign: 'center',
                                cursor: 'default'
                            }}
                        >
                            <div style={{ fontSize: 24, marginBottom: 4 }}>
                                {currentStep > step.number ? '✓' : step.icon}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>
                                {step.title}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div style={{
                    padding: 32,
                    background: '#1a1a1a',
                    borderRadius: 16,
                    border: '1px solid #333',
                    marginBottom: 24
                }}>
                    {currentStep === 1 && (
                        <Step1BasicInfo
                            data={matchData}
                            onChange={setMatchData}
                            seasons={seasons}
                        />
                    )}

                    {currentStep === 2 && (
                        <Step2ShuffleLetters
                            data={matchData}
                            onChange={setMatchData}
                        />
                    )}

                    {currentStep === 3 && (
                        <Step3AssignQuestions
                            data={matchData}
                            onChange={setMatchData}
                        />
                    )}

                    {currentStep === 4 && (
                        <Step4Review
                            data={matchData}
                            seasons={seasons}
                        />
                    )}
                </div>

                {/* Navigation Buttons */}
                {currentStep < 4 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12
                    }}>
                        {/* Step 1: Cancel button | Steps 2-3: Cancel + Back */}
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: '12px 24px',
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600
                            }}
                        >
                            إلغاء
                        </button>

                        <div style={{ display: 'flex', gap: 12 }}>
                            {currentStep > 1 && (
                                <button
                                    onClick={handleBack}
                                    style={{
                                        padding: '12px 24px',
                                        background: '#333',
                                        color: '#eee',
                                        border: '1px solid #6ee7b7',
                                        borderRadius: 8,
                                        cursor: 'pointer',
                                        fontSize: 14
                                    }}
                                >
                                    رجوع
                                </button>
                            )}

                            <button
                                onClick={handleNext}
                                disabled={currentStep === 3 && matchData.missingLetters && matchData.missingLetters.length > 0}
                                style={{
                                    padding: '12px 24px',
                                    background: (currentStep === 3 && matchData.missingLetters && matchData.missingLetters.length > 0) ? '#333' : '#6ee7b7',
                                    color: (currentStep === 3 && matchData.missingLetters && matchData.missingLetters.length > 0) ? '#666' : '#111',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: (currentStep === 3 && matchData.missingLetters && matchData.missingLetters.length > 0) ? 'not-allowed' : 'pointer',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    minWidth: 100,
                                    opacity: (currentStep === 3 && matchData.missingLetters && matchData.missingLetters.length > 0) ? 0.5 : 1
                                }}
                            >
                                {currentStep === 3 ? 'إلى المراجعة' : 'التالي'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4 Navigation */}
                {currentStep === 4 && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}>
                        <button
                            onClick={handleCancel}
                            style={{
                                padding: '12px 24px',
                                background: '#dc2626',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600
                            }}
                        >
                            إلغاء
                        </button>

                        <button
                            onClick={handleBack}
                            style={{
                                padding: '12px 24px',
                                background: '#333',
                                color: '#eee',
                                border: '1px solid #6ee7b7',
                                borderRadius: 8,
                                cursor: 'pointer',
                                fontSize: 14
                            }}
                        >
                            رجوع
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
