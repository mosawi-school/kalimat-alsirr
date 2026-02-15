import { useState, useEffect } from 'react';
import { normalizeSecretWord, isArabicText } from '../../lib/matchHelpers';

export default function Step1BasicInfo({ data, onChange, seasons }) {
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Auto-normalize secret word when it changes
        if (data.secretWordDisplay) {
            const normalized = normalizeSecretWord(data.secretWordDisplay);
            if (normalized !== data.secretWordNormalized) {
                onChange({ ...data, secretWordNormalized: normalized });
            }
        }
    }, [data.secretWordDisplay]);

    const validate = () => {
        const newErrors = {};

        if (!data.seasonId) {
            newErrors.seasonId = 'الموسم مطلوب';
        }

        if (!data.team1Name || !data.team1Name.trim()) {
            newErrors.team1Name = 'اسم الفريق الأول مطلوب';
        }

        if (!data.team2Name || !data.team2Name.trim()) {
            newErrors.team2Name = 'اسم الفريق الثاني مطلوب';
        }

        if (!data.secretWordDisplay || !data.secretWordDisplay.trim()) {
            newErrors.secretWordDisplay = 'كلمة السر مطلوبة';
        } else if (data.secretWordDisplay.trim().length < 3) {
            newErrors.secretWordDisplay = 'كلمة السر يجب أن تكون 3 أحرف على الأقل';
        } else if (!isArabicText(data.secretWordDisplay)) {
            newErrors.secretWordDisplay = 'كلمة السر يجب أن تحتوي على أحرف عربية';
        } else if (data.secretWordDisplay.includes('ى')) {
            newErrors.secretWordDisplay = 'ممنوع استخدام حرف (ى) في كلمة السر. استخدم (ي) بدلاً منه';
        }

        if (!data.hintText || !data.hintText.trim()) {
            newErrors.hintText = 'تلميح المساعدة مطلوب';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value });
        // Clear error for this field
        if (errors[field]) {
            setErrors({ ...errors, [field]: undefined });
        }
    };

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>المعلومات الأساسية</h2>
                <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
                    اختر الموسم وأدخل أسماء الفريقين وكلمة السر
                </p>
            </div>

            {/* Season Selection */}
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    الموسم *
                </label>
                <select
                    value={data.seasonId || ''}
                    onChange={(e) => handleChange('seasonId', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: 16,
                        borderRadius: 8,
                        background: '#1a1a1a',
                        color: '#eee',
                        border: errors.seasonId ? '1px solid #dc2626' : '1px solid #333',
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <option value="">-- اختر الموسم --</option>
                    {seasons.map(season => (
                        <option key={season.id} value={season.id}>
                            {season.name}
                        </option>
                    ))}
                </select>
                {errors.seasonId && (
                    <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>
                        {errors.seasonId}
                    </div>
                )}
            </div>

            {/* Teams */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                        الفريق الأول *
                    </label>
                    <input
                        type="text"
                        value={data.team1Name || ''}
                        onChange={(e) => handleChange('team1Name', e.target.value)}
                        placeholder="مثال: النجوم"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: 16,
                            borderRadius: 8,
                            background: '#1a1a1a',
                            color: '#eee',
                            border: errors.team1Name ? '1px solid #dc2626' : '1px solid #333',
                            outline: 'none'
                        }}
                    />
                    {errors.team1Name && (
                        <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>
                            {errors.team1Name}
                        </div>
                    )}
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                        الفريق الثاني *
                    </label>
                    <input
                        type="text"
                        value={data.team2Name || ''}
                        onChange={(e) => handleChange('team2Name', e.target.value)}
                        placeholder="مثال: الأبطال"
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            fontSize: 16,
                            borderRadius: 8,
                            background: '#1a1a1a',
                            color: '#eee',
                            border: errors.team2Name ? '1px solid #dc2626' : '1px solid #333',
                            outline: 'none'
                        }}
                    />
                    {errors.team2Name && (
                        <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>
                            {errors.team2Name}
                        </div>
                    )}
                </div>
            </div>

            {/* Secret Word */}
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    كلمة السر (للعرض) *
                </label>
                <input
                    type="text"
                    value={data.secretWordDisplay || ''}
                    onChange={(e) => handleChange('secretWordDisplay', e.target.value)}
                    placeholder="مثال: كلمة السِّرّ"
                    dir="rtl"
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: 18,
                        borderRadius: 8,
                        background: '#1a1a1a',
                        color: '#eee',
                        border: errors.secretWordDisplay ? '1px solid #dc2626' : '1px solid #333',
                        outline: 'none',
                        fontFamily: 'inherit'
                    }}
                />
                {errors.secretWordDisplay && (
                    <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>
                        {errors.secretWordDisplay}
                    </div>
                )}
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                    ستظهر كما هي على الشاشة (مع التشكيل والشدة)
                </div>
            </div>

            {/* Hint Text */}
            <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 14 }}>
                    المساعدة *
                </label>
                <input
                    type="text"
                    value={data.hintText || ''}
                    onChange={(e) => handleChange('hintText', e.target.value)}
                    placeholder="مثال: عاصمة دولة أوروبية"
                    dir="rtl"
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: 16,
                        borderRadius: 8,
                        background: '#1a1a1a',
                        color: '#eee',
                        border: errors.hintText ? '1px solid #dc2626' : '1px solid #333',
                        outline: 'none',
                        fontFamily: 'inherit'
                    }}
                />
                {errors.hintText && (
                    <div style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>
                        {errors.hintText}
                    </div>
                )}
                <div style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>
                    تلميح يظهر عند استنفاد المحاولات (مثل التصنيف أو المنطقة)
                </div>
            </div>

            {/* Normalized Preview */}
            {data.secretWordNormalized && (
                <div style={{
                    padding: 16,
                    background: '#111',
                    borderRadius: 8,
                    border: '1px solid #6ee7b7'
                }}>
                    <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>
                        كلمة السر المطبّعة (للأسئلة):
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
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
                        تم إزالة التشكيل وتطبيع الأحرف (أ/إ/آ → ا، ة → ه)
                    </div>
                </div>
            )}

            {/* Validation trigger */}

        </div>
    );
}

// Export validate function for parent component
Step1BasicInfo.validate = function (data, setErrors) {
    const newErrors = {};

    if (!data.seasonId) {
        newErrors.seasonId = 'الموسم مطلوب';
    }

    if (!data.team1Name || !data.team1Name.trim()) {
        newErrors.team1Name = 'اسم الفريق الأول مطلوب';
    }

    if (!data.team2Name || !data.team2Name.trim()) {
        newErrors.team2Name = 'اسم الفريق الثاني مطلوب';
    }

    if (!data.secretWordDisplay || !data.secretWordDisplay.trim()) {
        newErrors.secretWordDisplay = 'كلمة السر مطلوبة';
    } else if (data.secretWordDisplay.trim().length < 3) {
        newErrors.secretWordDisplay = 'كلمة السر يجب أن تكون 3 أحرف على الأقل';
    } else if (!isArabicText(data.secretWordDisplay)) {
        newErrors.secretWordDisplay = 'كلمة السر يجب أن تحتوي على أحرف عربية';
    } else if (data.secretWordDisplay.includes('ى')) {
        newErrors.secretWordDisplay = 'ممنوع استخدام حرف (ى) في كلمة السر. استخدم (ي) بدلاً منه';
    }

    if (!data.hintText || !data.hintText.trim()) {
        newErrors.hintText = 'تلميح المساعدة مطلوب';
    }

    if (setErrors) setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
