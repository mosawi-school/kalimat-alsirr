import { useState, useEffect } from 'react';
import { shuffleArray, swapArrayElements } from '../../lib/matchHelpers';

export default function Step2ShuffleLetters({ data, onChange }) {
    const [shuffled, setShuffled] = useState([]);

    useEffect(() => {
        // Auto-shuffle on mount or when secret word changes
        if (data.secretWordDisplay && shuffled.length === 0) {
            const letters = data.secretWordDisplay.split('').filter(char => char.trim() !== '');
            const shuffledLetters = shuffleArray(letters);
            setShuffled(shuffledLetters);
            onChange({ ...data, shuffledLetters: shuffledLetters });
        }
    }, [data.secretWordDisplay]);

    const handleShuffle = () => {
        const letters = data.secretWordDisplay.split('').filter(char => char.trim() !== '');
        const shuffledLetters = shuffleArray(letters);
        setShuffled(shuffledLetters);
        onChange({ ...data, shuffledLetters: shuffledLetters });
    };

    const handleSwap = (indexA, indexB) => {
        const newShuffled = swapArrayElements(shuffled, indexA, indexB);
        setShuffled(newShuffled);
        onChange({ ...data, shuffledLetters: newShuffled });
    };

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>ترتيب الحروف المبعثر</h2>
                <p style={{ fontSize: 14, opacity: 0.7, margin: 0 }}>
                    رتّب الحروف بشكل عشوائي أو يدوي
                </p>
            </div>

            {/* Original Word */}
            <div style={{
                padding: 20,
                background: '#111',
                borderRadius: 12,
                border: '1px solid #333'
            }}>
                <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
                    الكلمة الأصلية:
                </div>
                <div style={{
                    fontSize: 32,
                    fontWeight: 700,
                    fontFamily: 'inherit',
                    direction: 'rtl',
                    textAlign: 'center',
                    color: '#6ee7b7'
                }}>
                    {data.secretWordDisplay}
                </div>
            </div>

            {/* Shuffle Button */}
            <button
                onClick={handleShuffle}
                style={{
                    padding: '12px 24px',
                    background: '#2b2b2b',
                    color: '#6ee7b7',
                    border: '2px solid #6ee7b7',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 16,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8
                }}
            >
                <span style={{ fontSize: 20 }}>🔀</span>
                بعثرة عشوائية
            </button>

            {/* Shuffled Letters Display */}
            {shuffled.length > 0 && (
                <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                        الترتيب المبعثر:
                    </div>
                    <div style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        padding: 24,
                        background: '#111',
                        borderRadius: 12,
                        border: '2px solid #6ee7b7'
                    }}>
                        {shuffled.map((letter, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <div style={{
                                    width: 64,
                                    height: 64,
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: '#2b2b2b',
                                    borderRadius: 8,
                                    fontSize: 32,
                                    fontWeight: 700,
                                    fontFamily: 'inherit',
                                    color: '#6ee7b7'
                                }}>
                                    {letter}
                                </div>
                                {index < shuffled.length - 1 && (
                                    <button
                                        onClick={() => handleSwap(index, index + 1)}
                                        title="تبديل مع التالي"
                                        style={{
                                            padding: '4px 8px',
                                            background: '#333',
                                            border: '1px solid #6ee7b7',
                                            borderRadius: 4,
                                            color: '#6ee7b7',
                                            cursor: 'pointer',
                                            fontSize: 16
                                        }}
                                    >
                                        ⇄
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Preview */}
                    <div style={{
                        marginTop: 16,
                        padding: 16,
                        background: '#1a1a1a',
                        borderRadius: 8,
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>
                            معاينة:
                        </div>
                        <div style={{
                            fontSize: 28,
                            fontWeight: 700,
                            fontFamily: 'inherit',
                            direction: 'rtl',
                            color: '#eee',
                            letterSpacing: 4
                        }}>
                            {shuffled.join('')}
                        </div>
                    </div>
                </div>
            )}

            <div style={{
                padding: 14,
                background: '#0d47a1',
                borderRadius: 8,
                fontSize: 13,
                opacity: 0.9
            }}>
                <strong>💡 ملاحظة:</strong> يمكنك استخدام زر "بعثرة عشوائية" لترتيب جديد، أو استخدام الأسهم (⇄) للتبديل بين الحروف المجاورة يدوياً.
            </div>
        </div>
    );
}
