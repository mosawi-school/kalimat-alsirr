import React, { useState, useEffect, useRef } from 'react';

// IBM Plex Sans Arabic Import & Global Styles
const FontImport = () => (
    <style>
        {`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .font-ibm { font-family: 'IBM Plex Sans Arabic', sans-serif; }
        
        .glass-panel {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        /* Active Team Transitions */
        .team-panel {
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s ease, border-color 0.4s ease, background 0.4s ease;
        }
        .team-active-blue {
            background: linear-gradient(180deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.2) 100%);
            border-bottom: 4px solid #3b82f6;
            box-shadow: 0 10px 40px -10px rgba(59, 130, 246, 0.6), inset 0 0 30px rgba(59, 130, 246, 0.15);
            transform: scale(1.02);
            z-index: 10;
        }
        .team-active-amber {
            background: linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.2) 100%);
            border-bottom: 4px solid #f59e0b;
            box-shadow: 0 10px 40px -10px rgba(245, 158, 11, 0.6), inset 0 0 30px rgba(245, 158, 11, 0.15);
            transform: scale(1.02);
            z-index: 10;
        }

        /* Controls Buttons Styles */
        .control-btn {
            border-radius: 99px;
            background: rgba(255, 255, 255, 0.10);
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: #fff;
            font-weight: 700;
            height: 44px;
            min-width: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.95rem;
        }
        .control-btn:active { transform: scale(0.96); background: rgba(255,255,255,0.15); }
        .control-btn:disabled { opacity: 0.5; cursor: default; transform: none; }
        
        .control-btn.reveal {
            background: rgba(239, 68, 68, 0.22);
            border-color: rgba(239, 68, 68, 0.35);
            color: #ffd1d1;
        }
        .control-btn.reveal:active { background: rgba(239, 68, 68, 0.3); }
        
        .control-pressable {
             cursor: pointer;
             transition: all 0.15s ease-out;
        }
        .control-pressable:active { transform: scale(0.94); filter: brightness(1.1); }
        .control-pressable.disabled { opacity: 0.5; pointer-events: none; }


        /* --- ENHANCED KEYBOARD STYLES --- */
        .kb-key {
            width: 60px;
            height: 52px;
            border-radius: 14px; /* Increased radius */
            font-size: 1.5rem;   /* Increased size */
            font-weight: 700;    /* Increased weight */
            display: grid;
            place-items: center;
            
            /* Base Style (Tactile) */
            border: 1px solid rgba(255,255,255,0.08); /* Subtle border */
            background: linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%); /* Depth gradient */
            box-shadow: 
                inset 0 1px 0 rgba(255,255,255,0.15), /* Inner highlight */
                0 3px 6px rgba(0,0,0,0.25); /* Subtle drop shadow */
            
            color: #fff;
            cursor: pointer;
            user-select: none;
            transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smooth transition */
            position: relative;
            z-index: 1;
        }

        /* Active / Press State */
        .kb-key:active {
            transform: scale(0.96);
            filter: brightness(0.9);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); /* Inset shadow for press */
            background: rgba(255,255,255,0.1); /* Flatten gradient slightly */
        }

        /* Correct State */
        .kb-key.correct {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); /* Vibrant green gradient */
            border-color: rgba(16, 185, 129, 0.5);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.3); /* Outer glow + inner shine */
            color: #fff;
            animation: pop-correct 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Wrong State */
        .kb-key.wrong {
            background: #1f2937; /* Dark matte */
            border-color: rgba(255,255,255,0.02);
            color: #4b5563; /* Muted text */
            box-shadow: none; /* Remove depth */
            animation: shake-horizontal 0.4s ease-in-out forwards;
            opacity: 0.8;
        }
        
        @media (max-width: 900px) {
            .kb-key { width: 54px; height: 48px; font-size: 1.35rem; }
        }

        /* Test Mode Pills Style */
        .test-pill {
            padding: 4px 12px;
            border-radius: 99px;
            font-size: 0.75rem;
            font-weight: 600;
            border: 1px solid rgba(255,255,255,0.1);
            background: rgba(255,255,255,0.05);
            color: rgba(255,255,255,0.6);
            cursor: pointer;
            transition: all 0.2s;
        }
        .test-pill.active {
            background: rgba(255,255,255,0.2);
            color: #fff;
            border-color: rgba(255,255,255,0.3);
            transform: scale(1.05);
        }
        .test-pill:hover { background: rgba(255,255,255,0.1); }

        /* --- TIMER ANIMATIONS --- */
        .timer-base {
            transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
        }
        .timer-normal {
            background: rgba(0,0,0,0.4);
            border: 1px solid rgba(255,255,255,0.15);
            color: #fff;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .timer-warn {
            background: rgba(253, 224, 71, 0.15);
            border: 1px solid rgba(253, 224, 71, 0.4);
            color: #fde047;
            box-shadow: 0 4px 15px rgba(253, 224, 71, 0.2);
            animation: pulse-warn 1.5s infinite ease-in-out;
        }
        .timer-dramatic {
            background: rgba(249, 115, 22, 0.2);
            border: 1px solid rgba(249, 115, 22, 0.6);
            color: #fb923c;
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.4);
            animation: pulse-dramatic 0.8s infinite ease-in-out;
        }
        .timer-overtime {
            background: rgba(220, 38, 38, 0.25);
            border: 1px solid rgba(220, 38, 38, 0.6);
            color: #f87171;
            box-shadow: 0 0 25px rgba(220, 38, 38, 0.5);
            animation: pulse-dramatic 1s infinite ease-in-out; 
        }

        /* --- QUESTION MODAL STYLES --- */
        .q-modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.95); /* Even darker blur for focus */
            backdrop-filter: blur(16px);
            z-index: 1000;
            display: flex; justify-content: center; alignItems: center;
            padding: 24px;
            animation: fade-in 0.2s ease-out forwards;
        }
        /* IMPORTANT: Force Vertical Flex Layout */
        .q-modal-content {
            background: #1e293b;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 32px; /* Extra Large */
            padding: 40px;
            width: min(600px, 90vw);
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            
            /* FORCE VERTICAL STACK */
            display: flex; 
            flex-direction: column; 
            gap: 24px;
            align-items: center; 
            text-align: center;
            
            animation: scale-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .q-step-title {
            color: #94a3b8; font-size: 1.5rem; font-weight: 700;
        }
        .q-team-name {
            font-size: 2.2rem; font-weight: 700; color: #3b82f6; 
            margin-bottom: 8px;
        }
        
        .q-text-box {
            font-size: 1.8rem; font-weight: 400; line-height: 1.4; color: #fff;
            margin: 16px 0;
        }
        
        .a-text-box {
            font-size: 3rem; font-weight: 800; color: #10b981; 
            margin-bottom: 24px;
            animation: reveal-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }

        .q-btn-primary {
            background: #3b82f6; color: #fff;
            padding: 20px 32px; border-radius: 20px;
            font-size: 1.35rem; fontWeight: 700; border: none;
            cursor: pointer; min-width: 240px; width: 100%; max-width: 400px;
            box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
            transition: transform 0.15s, background 0.2s, box-shadow 0.2s;
        }
        .q-btn-primary:active { transform: scale(0.96); background: #2563eb; }
        
        .q-btn-who {
             background: #f59e0b; color: #000;
             box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.4);
        }
        .q-btn-who:active { background: #d97706; }

        .q-btn-choice {
            background: #334155; color: #fff;
            padding: 24px; border-radius: 20px;
            font-size: 1.4rem; fontWeight: 700; border: 1px solid rgba(255,255,255,0.1);
            width: 100%; cursor: pointer;
            transition: all 0.2s;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .q-btn-choice:active { transform: scale(0.97); background: #475569; }

        @keyframes pulse-warn {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.95; }
        }
        @keyframes pulse-dramatic {
            0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(249, 115, 22, 0.4); }
            50% { transform: scale(1.08); box-shadow: 0 0 35px rgba(249, 115, 22, 0.6); }
        }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-up { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }


        /* Keyboard Animations */
        @keyframes pop-correct {
            0% { transform: scale(0.95); opacity: 0.8; }
            60% { transform: scale(1.08); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
        }

        @keyframes shake-horizontal {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-4px); }
            40% { transform: translateX(4px); }
            60% { transform: translateX(-2px); }
            80% { transform: translateX(2px); }
        }


        /* Other Animations */
        @keyframes pulse-glow {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.3; }
        }
        @keyframes reveal-pop {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        `}
    </style>
);


// --- CUSTOM ICONS (eSports Style, 100% Inline SVG) ---
const IconDouble = ({ className, style }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const IconHole = ({ className, style }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
            stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" />
        <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
            fill="currentColor" />
    </svg>
);

const IconGhashni = ({ className, style }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
    </svg>
);

const IconSwitch = ({ className, style }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 3v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 21h5v-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);


// --- PRESSABLE INTERACTIVE COMPONENT (Touch + Mouse) ---
const Pressable = ({ children, className, style, onClick, onLongPress, disabled, activeScale = 0.94 }) => {
    const [pressed, setPressed] = useState(false);
    const timerRef = useRef(null);
    const isLongPress = useRef(false);

    const handlePointerDown = (e) => {
        if (disabled) return;
        setPressed(true);
        isLongPress.current = false;
        timerRef.current = setTimeout(() => {
            isLongPress.current = true;
            if (onLongPress) onLongPress();
        }, 450); // 450ms long press
    };

    const handlePointerUp = (e) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setPressed(false);
        if (!disabled && !isLongPress.current && onClick) {
            onClick(e);
        }
    };

    const handleCancel = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setPressed(false);
    };

    return (
        <div
            className={`${className} ${disabled ? 'disabled' : ''}`}
            style={{
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.35 : 1,
                touchAction: 'manipulation',
                userSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
                transition: pressed ? 'transform 120ms ease-out, filter 120ms ease-out' : 'transform 150ms ease-out, filter 150ms ease-out',
                transform: pressed && !disabled ? `scale(${activeScale})` : 'scale(1)',
                filter: pressed && !disabled ? 'brightness(1.08)' : 'brightness(1)',
                ...style
            }}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handleCancel}
            onPointerCancel={handleCancel}
        >
            {children}
        </div>
    );
};


// --- POWER CARD (Help Card) ---
const PowerCard = ({ type, used }) => {
    let Icon = null;
    let label = '';
    let themeColor = '';

    if (type === 'double') { Icon = IconDouble; label = 'ادبل'; themeColor = '#facc15'; }
    if (type === 'hole') { Icon = IconHole; label = 'الحفرة'; themeColor = '#a855f7'; }
    if (type === 'ghashni') { Icon = IconGhashni; label = 'غششني'; themeColor = '#10b981'; }

    return (
        <Pressable
            disabled={used}
            style={{
                position: 'relative',
                width: 60, height: 64, // Touch friendly size
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                gap: 6,
                background: used ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                borderRadius: 14,
                border: `1px solid ${used ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.15)'}`,
                color: used ? '#64748b' : themeColor,
                overflow: 'hidden'
            }}
        >
            {/* Subtle Pulse for Available Cards */}
            {!used && <div style={{
                position: 'absolute', inset: 0,
                background: themeColor,
                borderRadius: 14,
                animation: 'pulse-glow 4s infinite ease-in-out',
                zIndex: 0
            }} />}

            <Icon className="w-5 h-5" style={{ width: 22, height: 22, zIndex: 1, filter: used ? 'grayscale(1)' : 'none' }} />
            <span style={{
                fontSize: '0.7rem',
                fontWeight: 700,
                lineHeight: 1,
                opacity: used ? 0.6 : 0.95,
                fontFamily: 'inherit',
                zIndex: 1,
                color: used ? '#64748b' : '#fff'
            }}>{label}</span>
        </Pressable>
    );
};


// --- QUESTION MODAL COMPONENT ---
const QuestionModal = ({ isOpen, step, questionData, teamName, char, onShowQuestion, onShowAnswer, onShowWho, onSelectWinner, teams }) => {
    if (!isOpen) return null;

    return (
        <div className="q-modal-overlay">
            {/* Note: Using inline strict styles to guarantee vertical layout, overriding any Tailwind or implicit defaults */}
            <div className="q-modal-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* STEP 1: PRE-QUESTION */}
                {step === 'pre-question' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px' }}>

                        {/* 1. Title */}
                        <div className="q-step-title" style={{ width: '100%', textAlign: 'center' }}>سؤال الحرف ({char})</div>

                        {/* 2. Team Name */}
                        <div className="q-team-name" style={{ textAlign: 'center' }}>{teamName}</div>

                        {/* 3. Assist Cards Row (Hole + Double ONLY) */}
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 24, justifyContent: 'center', width: '100%', margin: '16px 0' }}>
                            <div style={{ textAlign: 'center', opacity: 0.9 }}>
                                <PowerCard type="hole" used={false} />
                            </div>
                            <div style={{ textAlign: 'center', opacity: 0.9 }}>
                                <PowerCard type="double" used={false} />
                            </div>
                        </div>

                        {/* Spacer */}
                        <div style={{ height: '32px' }} />

                        {/* 4. Button */}
                        <button className="q-btn-primary" onClick={onShowQuestion}>
                            إظهار السؤال
                        </button>
                    </div>
                )}

                {/* STEP 2: QUESTION */}
                {step === 'question' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px', flex: 1 }}>
                        <div className="q-step-title">سؤال الحرف ({char})</div>

                        {/* Question Text */}
                        <div className="q-text-box" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                            {questionData.question}
                        </div>

                        <button className="q-btn-primary" onClick={onShowAnswer}>
                            إظهار الإجابة
                        </button>
                    </div>
                )}

                {/* STEP 3: ANSWER */}
                {step === 'answer' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px', flex: 1 }}>
                        <div className="q-step-title">سؤال الحرف ({char})</div>

                        {/* Question Text (Visible but subtle) */}
                        <div style={{ fontSize: '1.2rem', opacity: 0.7, margin: '8px 0', lineHeight: 1.4, textAlign: 'center' }}>
                            {questionData.question}
                        </div>

                        {/* Answer Text: BOLD & LARGE */}
                        <div className="a-text-box" style={{
                            flex: 1, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', textAlign: 'center',
                            fontSize: '3rem', fontWeight: 800
                        }}>
                            {questionData.answer}
                        </div>

                        {/* Button: Who Answered (Different Color) */}
                        <button className="q-btn-primary q-btn-who" onClick={onShowWho}>
                            منو جاوب؟
                        </button>
                    </div>
                )}

                {/* STEP 4: WHO ANSWERED? */}
                {step === 'who' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px', flex: 1 }}>
                        <div style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
                            الفريق المُختار: {teamName}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 500, flex: 1, justifyContent: 'center' }}>

                            {/* Two Big Buttons Side-By-Side */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <button className="q-btn-choice" onClick={() => onSelectWinner('team1')}>{teams.team1}</button>
                                <button className="q-btn-choice" onClick={() => onSelectWinner('team2')}>{teams.team2}</button>
                            </div>

                            {/* Bottom Centered Button: None */}
                            <button className="q-btn-choice" onClick={() => onSelectWinner('none')} style={{ background: 'rgba(255,255,255,0.08)' }}>
                                ولا أحد
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


const StageVisualPrototype = () => {
    const [activeTeam, setActiveTeam] = useState(1);

    // Test Mode State
    const [selectedStatus, setSelectedStatus] = useState('default'); // 'default' | 'correct' | 'wrong'
    const [keyStates, setKeyStates] = useState({});

    // Question Modal State
    const [modalState, setModalState] = useState({
        isOpen: false,
        step: 'pre-question', // 'pre-question' | 'question' | 'answer' | 'who'
        char: ''
    });
    const mockQuestion = { question: "ما هو الحيوان الذي يُلقب بسفينة الصحراء؟", answer: "الجمل" };

    // Timer Logic
    const [timer, setTimer] = useState(0);
    const timerInterval = useRef(null);

    useEffect(() => {
        timerInterval.current = setInterval(() => {
            setTimer(prev => prev + 1);
        }, 1000);

        return () => {
            if (timerInterval.current) clearInterval(timerInterval.current);
        };
    }, []);

    const formatTime = (time) => {
        const mins = Math.floor(time / 60);
        const secs = time % 60;
        return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    };

    // Determine Timer Styling Class
    const getTimerClass = () => {
        if (timer >= 60) return 'timer-base timer-overtime';
        if (timer >= 50) return 'timer-base timer-dramatic';
        if (timer >= 30) return 'timer-base timer-warn';
        return 'timer-base timer-normal';
    };

    // Hardcoded Data
    const team1 = { name: "الفرسان", score: 14, cards: { double: true, hole: false, ghashni: true } };
    const team2 = { name: "الصقور", score: 9, cards: { double: true, hole: true, ghashni: false } };

    const wordLetters = [
        { char: "م", status: "correct" },
        { char: "س", status: "hidden" },
        { char: "ت", status: "correct" },
        { char: "ق", status: "hidden" },
        { char: "ب", status: "hidden" },
        { char: "ل", status: "correct" },
    ];

    // EXACTLY 2 ROWS Arrays
    const row1 = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص"];
    const row2 = ["ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"];

    const activeColor = activeTeam === 1 ? '#3b82f6' : '#f59e0b';
    const activeGlow = activeTeam === 1 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(245, 158, 11, 0.5)';

    // Switch Button rotation state
    const [rotateSwitch, setRotateSwitch] = useState(false);
    const handleSwitch = () => {
        setRotateSwitch(prev => !prev);
    };

    // Keyboard handlers
    const handleKeyClick = (char) => {
        if (modalState.isOpen) return; // Block input if modal is open

        // Check if user INTENDS correct (via test mode) OR if key is intrinsically correct (hardcoded mock)
        // For the prototype, we prioritize the manual 'Correct' pill trigger as requested.
        const isTriggeringCorrect = selectedStatus === 'correct';

        setKeyStates(prev => {
            const current = prev[char] || 'default';
            if (selectedStatus === 'default') {
                const newState = { ...prev };
                delete newState[char];
                return newState;
            }
            return { ...prev, [char]: selectedStatus };
        });

        // Trigger Question Modal ONLY on Correct
        if (isTriggeringCorrect) {
            // Small delay to let the key animation start
            setTimeout(() => {
                setModalState({ isOpen: true, step: 'pre-question', char: char });
            }, 300);
        }
    };

    const handleKeyReset = (char) => {
        if (modalState.isOpen) return;
        setKeyStates(prev => {
            const newState = { ...prev };
            delete newState[char];
            return newState;
        });
    };

    const handleResetAll = () => {
        setKeyStates({});
    };

    // Modal Actions
    const handleShowQuestion = () => setModalState(prev => ({ ...prev, step: 'question' }));
    const handleShowAnswer = () => setModalState(prev => ({ ...prev, step: 'answer' }));
    const handleShowWho = () => setModalState(prev => ({ ...prev, step: 'who' }));
    const handleSelectWinner = (winner) => {
        console.log("Selected Winner:", winner);
        setModalState({ isOpen: false, step: 'question', char: '' }); // Reset to initial state
    };

    return (
        /* Root Wrapper */
        <div className="font-ibm" style={{
            direction: 'rtl',
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
            color: '#fff',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start'
        }}>
            <FontImport />

            {/* INNER CONTAINER (CSS Grid) */}
            <div style={{
                width: 'min(1400px, 100vw)',
                height: '100%',
                display: 'grid',
                // Row 1: Header (130px)
                // Row 2: Controls + Word (Auto)
                // Row 3: Keyboard (MinMax 260px - 34vh)
                gridTemplateRows: '130px auto minmax(260px, 34vh)',
                gap: '6px',
                padding: '1vh 1vw',
            }}>

                {/* ROW 1: HEADER ZONE */}
                <div style={{
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'stretch',
                    overflow: 'hidden'
                }}>

                    {/* Team 1 (Right) */}
                    <div className={`glass-panel team-panel ${activeTeam === 1 ? 'team-active-blue' : ''}`} style={{
                        flex: 1, borderRadius: 24, padding: '0 24px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer'
                    }} onClick={() => setActiveTeam(1)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{team1.name}</span>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <PowerCard type="double" used={!team1.cards.double} />
                                <PowerCard type="hole" used={!team1.cards.hole} />
                                <PowerCard type="ghashni" used={!team1.cards.ghashni} />
                            </div>
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 700, fontFamily: 'monospace', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{team1.score}</div>
                    </div>

                    {/* Logo (Center) */}
                    <div style={{
                        width: '240px', // Matches center space
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" style={{
                            maxHeight: '110px',
                            width: 'auto',
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))'
                        }} />
                    </div>

                    {/* Team 2 (Left) */}
                    <div className={`glass-panel team-panel ${activeTeam === 2 ? 'team-active-amber' : ''}`} style={{
                        flex: 1, borderRadius: 24, padding: '0 24px',
                        display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center',
                        cursor: 'pointer',
                    }} onClick={() => setActiveTeam(2)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                            <span style={{ fontSize: '1.8rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{team2.name}</span>
                            <div style={{ display: 'flex', gap: 12, flexDirection: 'row-reverse' }}>
                                <PowerCard type="double" used={!team2.cards.double} />
                                <PowerCard type="hole" used={!team2.cards.hole} />
                                <PowerCard type="ghashni" used={!team2.cards.ghashni} />
                            </div>
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 700, fontFamily: 'monospace', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{team2.score}</div>
                    </div>

                </div>

                {/* ROW 2: MIDDLE ZONE (Content Wrapper) */}
                <div style={{
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start', // Start from top
                    paddingTop: '0px',
                    paddingBottom: '0px'
                }}>

                    {/* Part A: UNIFIED CONTROLS ROW (RTL Layout) */}
                    {/* Visual Order: [Reveal][Switch]  [Timer]  [Hint] */}
                    <div style={{
                        flex: '0 0 auto',
                        width: '100%',
                        maxWidth: '720px',
                        height: '64px',
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        marginTop: '10px',
                        marginBottom: '10px',
                        zIndex: 20
                    }}>
                        {/* RIGHT GROUP (RTL Start): Hint */}
                        <div style={{ display: 'flex', alignItems: 'center', minWidth: '120px', justifyContent: 'flex-start' }}>
                            <button className="control-btn control-pressable" disabled={modalState.isOpen}>
                                <span>💡 تلميح</span>
                            </button>
                        </div>

                        {/* CENTER: Timer */}
                        <div className={getTimerClass()} style={{
                            backdropFilter: 'blur(4px)',
                            padding: '0 24px',
                            height: '44px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 16,
                            fontFamily: 'monospace',
                            fontSize: '1.5rem',
                            fontWeight: 700,
                            minWidth: '120px',
                            textAlign: 'center',
                        }}>
                            {formatTime(timer)}
                        </div>

                        {/* LEFT GROUP (RTL End): Switch + Reveal */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: '120px', justifyContent: 'flex-end' }}>
                            <div className={`control-pressable ${modalState.isOpen ? 'disabled' : ''}`} onClick={handleSwitch} style={{
                                width: 44, height: 44, borderRadius: '50%',
                                background: 'rgba(255,255,255,0.1)', border: `1px solid ${activeColor}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <IconSwitch style={{
                                    width: 20, height: 20, color: activeColor,
                                    transform: rotateSwitch ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }} />
                            </div>
                            <button className="control-btn reveal control-pressable" disabled={modalState.isOpen} style={{ minWidth: '100px' }}>
                                <span>👁️ كشف</span>
                            </button>
                        </div>
                    </div>

                    {/* Part B: Word Tiles */}
                    <div style={{
                        flex: '1 1 auto', // Allow growing if needed but usually compact
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.96)',
                            color: '#0b1220',
                            borderRadius: 32,
                            padding: '24px 32px',
                            gap: '12px',
                            display: 'flex',
                            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,1)',
                            border: '1px solid rgba(255,255,255,0.4)',
                        }}>
                            {wordLetters.map((item, idx) => (
                                <div key={idx} style={{
                                    width: 64, height: 84, // Slightly larger
                                    background: item.status === 'correct'
                                        ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)'
                                        : 'rgba(15, 23, 42, 0.05)',
                                    borderRadius: 16,
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontSize: '2.8rem', fontWeight: 700,
                                    color: item.status === 'correct' ? '#fff' : 'transparent',
                                    boxShadow: item.status === 'correct'
                                        ? '0 4px 12px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                                        : 'inset 0 2px 6px rgba(0,0,0,0.06)',
                                    animation: item.status === 'correct' ? 'reveal-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) backwards' : 'none'
                                }}>{item.char}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ROW 3: FOOTER / KEYBOARD ZONE (Flex 1 1 auto + Bottom Anchor) */}
                <div style={{
                    flex: '1 1 auto',
                    height: '100%',
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end', // Anchor bottom
                    alignItems: 'center',
                    overflow: 'visible',
                    paddingBottom: '16px',
                    gap: '4px' // Small gap between Test Controls and Keys
                }}>

                    {/* TEST CONTROLS (Compact) */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8, opacity: 0.8, scale: '0.9' }}>
                        <div
                            className={`test-pill ${selectedStatus === 'default' ? 'active' : ''}`}
                            onClick={() => setSelectedStatus('default')}
                        >Default</div>
                        <div
                            className={`test-pill ${selectedStatus === 'correct' ? 'active' : ''}`}
                            onClick={() => setSelectedStatus('correct')}
                            style={{ color: selectedStatus === 'correct' ? '#10b981' : undefined }}
                        >Correct</div>
                        <div
                            className={`test-pill ${selectedStatus === 'wrong' ? 'active' : ''}`}
                            onClick={() => setSelectedStatus('wrong')}
                            style={{ color: selectedStatus === 'wrong' ? '#ef4444' : undefined }}
                        >Wrong</div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
                        <div className="test-pill" onClick={handleResetAll}>Reset All</div>
                    </div>

                    {/* KEYBOARD ROW 1 */}
                    <div className="kb-row" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                        {row1.map((char, i) => {
                            const displayStatus = keyStates[char] !== undefined
                                ? keyStates[char]
                                : (['م', 'ت', 'ل'].includes(char) ? 'correct' : ['ش', 'خ', 'ز'].includes(char) ? 'wrong' : 'default');

                            let keyClass = 'kb-key';
                            if (displayStatus === 'correct') keyClass += ' correct';
                            if (displayStatus === 'wrong') keyClass += ' wrong';

                            return (
                                <Pressable
                                    key={i}
                                    className={keyClass}
                                    onClick={() => handleKeyClick(char)}
                                    onLongPress={() => handleKeyReset(char)}
                                    disabled={modalState.isOpen}
                                >
                                    {char}
                                </Pressable>
                            );
                        })}
                    </div>

                    {/* KEYBOARD ROW 2 */}
                    <div className="kb-row" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                        {row2.map((char, i) => {
                            const displayStatus = keyStates[char] !== undefined
                                ? keyStates[char]
                                : (['م', 'ت', 'ل'].includes(char) ? 'correct' : ['ش', 'خ', 'ز'].includes(char) ? 'wrong' : 'default');

                            let keyClass = 'kb-key';
                            if (displayStatus === 'correct') keyClass += ' correct';
                            if (displayStatus === 'wrong') keyClass += ' wrong';

                            return (
                                <Pressable
                                    key={i}
                                    className={keyClass}
                                    onClick={() => handleKeyClick(char)}
                                    onLongPress={() => handleKeyReset(char)}
                                    disabled={modalState.isOpen}
                                >
                                    {char}
                                </Pressable>
                            );
                        })}
                    </div>
                </div>

                {/* QUESTION MODAL (Triggered by Correct Answer) */}
                <QuestionModal
                    isOpen={modalState.isOpen}
                    step={modalState.step}
                    char={modalState.char}
                    questionData={mockQuestion}
                    teamName={activeTeam === 1 ? team1.name : team2.name}
                    teams={{ team1: team1.name, team2: team2.name }}
                    onShowQuestion={handleShowQuestion}
                    onShowAnswer={handleShowAnswer}
                    onShowWho={handleShowWho}
                    onSelectWinner={handleSelectWinner}
                />

            </div>
        </div>
    );
};

export default StageVisualPrototype;
