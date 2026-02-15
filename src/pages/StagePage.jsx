import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import {
    GAME_STATES,
    letterMatches,
    findLetterPositions,
    getUniqueNormalizedLetters
} from '../lib/stageConstants';

// --- STYLES & ICONS (Inline to ensure portability) ---
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
            border-radius: 14px;
            font-size: 1.5rem;   
            font-weight: 700;    
            display: grid;
            place-items: center;
            border: 1px solid rgba(255,255,255,0.08); 
            background: linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.15), 0 3px 6px rgba(0,0,0,0.25);
            color: #fff;
            cursor: pointer;
            user-select: none;
            transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
            position: relative;
            z-index: 1;
        }
        .kb-key:active {
            transform: scale(0.96);
            filter: brightness(0.9);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.3);
            background: rgba(255,255,255,0.1);
        }
        .kb-key.correct {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-color: rgba(16, 185, 129, 0.5);
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255,255,255,0.3);
            color: #fff;
            animation: pop-correct 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .kb-key.wrong {
            background: #1f2937;
            border-color: rgba(255,255,255,0.02);
            color: #4b5563;
            box-shadow: none;
            animation: shake-horizontal 0.4s ease-in-out forwards;
            opacity: 0.8;
        }
        @media (max-width: 900px) {
            .kb-key { width: 54px; height: 48px; font-size: 1.35rem; }
        }

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

        /* --- WRONG ANIMATION --- */
        @keyframes wrong-impact {
            0% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.15); filter: brightness(1.5); box-shadow: 0 0 20px rgba(220, 38, 38, 0.6); }
            100% { transform: scale(1); filter: brightness(1.2); }
        }
        @keyframes shake-horizontal {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-6px); }
            40% { transform: translateX(6px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
        }
        .wrong-impact {
            background: #dc2626 !important; /* Red-600 */
            border-color: #f87171 !important;
            color: #fff !important;
            z-index: 50 !important;
            animation: wrong-impact 0.4s ease-out forwards, shake-horizontal 0.4s ease-in-out;
            box-shadow: 0 0 15px rgba(220, 38, 38, 0.5) !important;
        }
        .wrong-hold {
            background: #dc2626 !important;
            border-color: #f87171 !important;
            color: #fff !important;
            opacity: 1 !important;
            filter: brightness(1) !important;
            box-shadow: 0 0 10px rgba(220, 38, 38, 0.3) !important;
            transition: all 0.3s ease;
        }

        /* --- TURN SWITCH PULSE --- */
        @keyframes turn-pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); transform: scale(1); }
            50% { box-shadow: 0 0 20px 0 rgba(255, 255, 255, 0.6); transform: scale(1.02); }
            100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); transform: scale(1); }
        }
        .turn-pulse {
            animation: turn-pulse 0.5s ease-out;
            z-index: 10;
        }

        /* --- QUESTION MODAL STYLES --- */
        .q-modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(16px);
            z-index: 1000;
            display: flex; justify-content: center; alignItems: center;
            padding: 24px;
            animation: fade-in 0.2s ease-out forwards;
        }
        .q-modal-content {
            background: #1e293b;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 32px;
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
        
        .q-step-title { color: #94a3b8; font-size: 1.5rem; font-weight: 700; }
        .q-team-name { font-size: 2.2rem; font-weight: 700; color: #3b82f6; margin-bottom: 8px; }
        
        .q-text-box { font-size: 1.8rem; font-weight: 400; line-height: 1.4; color: #fff; margin: 16px 0; }
        
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

const IconDouble = ({ className, style }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
const IconHole = ({ className, style }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" />
        <path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" fill="currentColor" />
    </svg>
);
const IconGhashni = ({ className, style }) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
        <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        }, 450);
    };
    const handlePointerUp = (e) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setPressed(false);
        if (!disabled && !isLongPress.current && onClick) onClick(e);
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

const PowerCard = ({ type, used, onClick, isActive }) => {
    let Icon = null;
    let label = '';
    let themeColor = '';
    if (type === 'double') { Icon = IconDouble; label = 'ادبل'; themeColor = '#facc15'; }
    if (type === 'hole') { Icon = IconHole; label = 'الحفرة'; themeColor = '#a855f7'; }
    if (type === 'ghashni') { Icon = IconGhashni; label = 'غششني'; themeColor = '#10b981'; }

    // Visual logic: active state for Hole/Double when toggled in modal
    const showActive = isActive && !used;

    return (
        <Pressable
            disabled={used}
            onClick={onClick}
            style={{
                position: 'relative',
                width: 60, height: 64,
                display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                gap: 6,
                background: used ? 'rgba(255,255,255,0.02)' : (showActive ? themeColor : 'rgba(255,255,255,0.08)'),
                backdropFilter: 'blur(12px)',
                borderRadius: 14,
                border: `1px solid ${used ? 'rgba(255,255,255,0.04)' : (showActive ? '#fff' : 'rgba(255,255,255,0.15)')}`,
                color: used ? '#64748b' : (showActive ? '#000' : themeColor),
                overflow: 'hidden',
                transition: 'all 0.2s',
                transform: showActive ? 'scale(1.05)' : 'scale(1)'
            }}
        >
            {!used && !showActive && <div style={{
                position: 'absolute', inset: 0,
                background: themeColor,
                borderRadius: 14,
                animation: 'pulse-glow 4s infinite ease-in-out',
                zIndex: 0
            }} />}
            <Icon className="w-5 h-5" style={{ width: 22, height: 22, zIndex: 1, filter: used ? 'grayscale(1)' : 'none' }} />
            <span style={{
                fontSize: '0.7rem', fontWeight: 700, lineHeight: 1,
                opacity: used ? 0.6 : 0.95, fontFamily: 'inherit', zIndex: 1, color: used ? '#64748b' : (showActive ? '#000' : '#fff')
            }}>{label}</span>
        </Pressable>
    );
};

// --- SIMPLE FIREWORKS COMPONENT ---
const Fireworks = () => {
    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
            {Array.from({ length: 50 }).map((_, i) => {
                const left = Math.random() * 100;
                const delay = Math.random() * 2;
                const duration = 2 + Math.random() * 2;
                const color = ['#f43f5e', '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'][Math.floor(Math.random() * 5)];
                return (
                    <div key={i} style={{
                        position: 'absolute', left: `${left}%`, top: '-10px',
                        width: '8px', height: '8px', borderRadius: '50%',
                        backgroundColor: color,
                        animation: `firework-fall ${duration}s linear ${delay}s infinite`
                    }} />
                );
            })}
            <style>{`
                @keyframes firework-fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

// --- MAIN PAGE COMPONENT ---
export default function StagePage() {
    const { matchId } = useParams();
    const navigate = useNavigate();

    // Data & Logic State
    const [match, setMatch] = useState(null);
    const [matchQuestions, setMatchQuestions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [gameState, setGameState] = useState(GAME_STATES.WAITING);
    const [currentTeam, setCurrentTeam] = useState(1);
    const [selectedLetters, setSelectedLetters] = useState([]);
    const [revealedPositions, setRevealedPositions] = useState([]);
    const [timerSeconds, setTimerSeconds] = useState(0);

    // Scoring & Cards
    const [team1FreeTries, setTeam1FreeTries] = useState(3);
    const [team2FreeTries, setTeam2FreeTries] = useState(3);
    const [team1Score, setTeam1Score] = useState(0);
    const [team2Score, setTeam2Score] = useState(0);
    const [team1Cards, setTeam1Cards] = useState({ ghashni: true, double: true, hole: true });
    const [team2Cards, setTeam2Cards] = useState({ ghashni: true, double: true, hole: true });

    // Ghashni State
    const [ghashniInProgress, setGhashniInProgress] = useState(false);
    const [ghashniAttemptsLeft, setGhashniAttemptsLeft] = useState(0);
    const [ghashniWrongCount, setGhashniWrongCount] = useState(0);
    const [wrongAnimatingLetter, setWrongAnimatingLetter] = useState(null);
    const [turnSwitchAnimating, setTurnSwitchAnimating] = useState(false);

    // Turn Switch Pulse Effect
    useEffect(() => {
        if (gameState !== GAME_STATES.PLAYING) return;
        setTurnSwitchAnimating(true);
        const timer = setTimeout(() => setTurnSwitchAnimating(false), 500);
        return () => clearTimeout(timer);
    }, [currentTeam, gameState]);

    // TIE BREAK STATE
    const [tieBreakWinner, setTieBreakWinner] = useState(null);

    // Modal / Question Flow State
    const [modalState, setModalState] = useState({
        isOpen: false,
        step: 'pre-question' // 'pre-question', 'question', 'answer', 'who'
    });
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [activeHoleActive, setActiveHoleActive] = useState(false);
    const [activeDoubleActive, setActiveDoubleActive] = useState(false);
    const [activeCardTeam, setActiveCardTeam] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [usedQuestionIds, setUsedQuestionIds] = useState(new Set());
    const [hintRevealed, setHintRevealed] = useState(false);

    // Modal Timer State
    const [modalTimerSeconds, setModalTimerSeconds] = useState(0);
    const [modalTimerRunning, setModalTimerRunning] = useState(false);

    // Tie Break Not fully implemented in visual prototype, but logic kept
    const [showTieBreakModal, setShowTieBreakModal] = useState(false);

    // Tie Break Handler
    const handleSelectTieWinner = (teamId) => {
        setTieBreakWinner(teamId);
        // Increment score for the winner to break the tie visually and logically
        if (teamId === 1) setTeam1Score(prev => prev + 1);
        else setTeam2Score(prev => prev + 1);

        // Auto-commit on tie break
        handleCommitMatch();
    };

    // Load Data
    useEffect(() => { loadMatch(); }, [matchId]);

    const loadMatch = async () => {
        if (!matchId) return;
        const { data, error: fetchError } = await supabase.from('matches').select('*').eq('id', matchId).single();
        if (fetchError || !data) { setError('Error loading match'); setLoading(false); return; }

        const { data: questions } = await supabase.from('match_questions').select('*').eq('match_id', matchId);
        const questionsMap = {};
        if (questions) {
            questions.forEach(q => {
                const normalizedKey = q.letter.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[\u064B-\u065F]/g, '');
                const qId = q.original_question_id || q.question_id || q.id;
                questionsMap[normalizedKey] = { id: qId, question: q.question_text, answer: q.answer_text, letter: q.letter };
            });
        }
        setMatchQuestions(questionsMap);
        setMatch(data);
        setLoading(false);
    };

    // Timer (Stage)
    useEffect(() => {
        if (gameState !== GAME_STATES.PLAYING) return;
        const interval = setInterval(() => setTimerSeconds(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [gameState, currentTeam]);

    // Timer (Modal)
    useEffect(() => {
        if (!modalTimerRunning) return;
        const interval = setInterval(() => setModalTimerSeconds(prev => prev + 1), 1000);
        return () => clearInterval(interval);
    }, [modalTimerRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
    };

    const getTimerClass = (seconds = timerSeconds) => {
        if (seconds >= 60) return 'timer-base timer-overtime';
        if (seconds >= 50) return 'timer-base timer-dramatic';
        if (seconds >= 30) return 'timer-base timer-warn';
        return 'timer-base timer-normal';
    };

    // Game Actions
    const startGame = () => {
        setGameState(GAME_STATES.PLAYING);
        setCurrentTeam(1);
        setSelectedLetters([]);
        setRevealedPositions([]);
        setTimerSeconds(0);
    };

    const switchTurn = () => {
        setCurrentTeam(prev => prev === 1 ? 2 : 1);
        setTimerSeconds(0);
    };

    const handleManualSwitchTurn = () => {
        if (gameState === GAME_STATES.FINISHED || processing) return;
        setCurrentTeam(prev => prev === 1 ? 2 : 1);
    };

    // Card Activation
    const handleToggleDouble = () => {
        if (ghashniInProgress) return;
        // Toggle logic for Double in Modal
        // If already active, deactivate. If not, activate.
        // Also check if team has it.
        const team = currentTeam;
        const hasCard = team === 1 ? team1Cards.double : team2Cards.double;
        if (!hasCard) return;

        if (activeDoubleActive) {
            // Deactivate
            setActiveDoubleActive(false);
            setActiveCardTeam(null);
            // Restore card to inventory (visual only until used)
            if (team === 1) setTeam1Cards(prev => ({ ...prev, double: true }));
            else setTeam2Cards(prev => ({ ...prev, double: true }));
        } else {
            // Activate
            if (activeHoleActive) {
                // Cannot have both active? Usually mutually exclusive? 
                // Let's assume for now valid to switch.
                setActiveHoleActive(false);
                if (team === 1) setTeam1Cards(prev => ({ ...prev, hole: true }));
                else setTeam2Cards(prev => ({ ...prev, hole: true }));
            }

            setActiveDoubleActive(true);
            setActiveCardTeam(team);
            // Temporarily mark used in inventory so it doesn't look like double dipping?
            // Actually, we want to show it as "Active".
            // If we mark it used in inventory, it will show disabled but active?
            // Let's keep inventory true, but rely on active state to show visual indication.
            // Wait, logic in handleWhoAnswered checks used state? No, it checks updated state.
            // Let's just set the ACTIVE flags here, and consume ONLY when winner is selected.
            // BUT UI needs to show it as active.
        }
    };

    // CORRECTION: Original logic consumed card immediately on activation.
    // User wants: "In that Pre-Question step, they must appear ACTIVE (clickable) unless they were actually used."
    // and "After using any of them once... it becomes disabled."
    // So distinct states: Indentory vs Active-for-this-turn.

    const togglePreQuestionCard = (type) => { // 'hole' or 'double'
        if (ghashniInProgress) return;
        const team = currentTeam;
        const hasCard = team === 1 ? team1Cards[type] : team2Cards[type];

        if (!hasCard) return; // Already used previously

        if (type === 'hole') {
            if (activeHoleActive) {
                setActiveHoleActive(false);
                setActiveCardTeam(null);
            } else {
                setActiveHoleActive(true);
                setActiveDoubleActive(false); // Mutually exclusive
                setActiveCardTeam(team);
            }
        } else if (type === 'double') {
            if (activeDoubleActive) {
                setActiveDoubleActive(false);
                setActiveCardTeam(null);
            } else {
                setActiveDoubleActive(true);
                setActiveHoleActive(false); // Mutually exclusive
                setActiveCardTeam(team);
            }
        }
    };

    const handleActivateGhashni = () => {
        // This is immediate activation in main UI
        const currentTeamCards = currentTeam === 1 ? team1Cards : team2Cards;
        if (!currentTeamCards.ghashni || ghashniInProgress) return;
        setGhashniInProgress(true);
        setGhashniAttemptsLeft(2);
        setGhashniWrongCount(0);
        // Consume immediately? Or wait? Usually Ghashni is immediate mode.
        // Let's mark used immediately for Ghashni as it changes game mode.
        if (currentTeam === 1) setTeam1Cards(p => ({ ...p, ghashni: false }));
        else setTeam2Cards(p => ({ ...p, ghashni: false }));
    };

    // Derived State: Is Word Complete?
    const isWordComplete = match && (match.shuffled_letters || []).length > 0 && (match.shuffled_letters || []).every((_, i) => revealedPositions.includes(i));

    // Letter Click (Standard)
    const handleLetterClick = (letter) => {
        if (gameState === GAME_STATES.FINISHED || processing || modalState.isOpen || isWordComplete) return;
        if (selectedLetters.find(l => l.letter === letter)) return;

        setProcessing(true); setTimeout(() => setProcessing(false), 300);
        setTimerSeconds(0);

        const currentFreeTries = currentTeam === 1 ? team1FreeTries : team2FreeTries;
        const normalizedLetter = letter.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[\u064B-\u065F]/g, '');
        const positions = findLetterPositions(letter, match.shuffled_letters);

        // Logic: Tries Decrement
        if (currentFreeTries > 0 && !ghashniInProgress) {
            if (currentTeam === 1) setTeam1FreeTries(prev => prev - 1);
            else setTeam2FreeTries(prev => prev - 1);
        }

        // Logic: Ghashni Decrement
        let newAttemptsLeft = ghashniAttemptsLeft;
        if (ghashniInProgress) {
            newAttemptsLeft = ghashniAttemptsLeft - 1;
            setGhashniAttemptsLeft(prev => prev - 1);
        }

        if (positions.length > 0) {
            // CORRECT
            if (currentTeam === 1) setTeam1Score(prev => prev + 1);
            else setTeam2Score(prev => prev + 1);

            setSelectedLetters(prev => [...prev, { letter, status: 'correct' }]);
            setRevealedPositions(prev => [...prev, ...positions]);

            const question = matchQuestions[normalizedLetter];
            if (question) {
                // OPEN QUESTION MODAL (Step 1)
                setCurrentQuestion(question);
                setModalState({ isOpen: true, step: 'pre-question' });
                // Reset active cards for new question
                setActiveHoleActive(false);
                setActiveDoubleActive(false);
                setActiveCardTeam(null);
                // Reset Modal Timer (00:00, Stopped)
                setModalTimerSeconds(0);
                setModalTimerRunning(false);
            } else {
                if (ghashniInProgress) {
                    setGhashniInProgress(false);
                    switchTurn();
                } else {
                    switchTurn();
                }
            }
        } else {
            // WRONG -> ANIMATION SEQUENCE
            setWrongAnimatingLetter(letter); // 1. Trigger Animation
            setProcessing(true); // Lock UI

            // 2. DELAY LOGIC (1200ms)
            setTimeout(() => {
                setProcessing(false);
                setWrongAnimatingLetter(null); // Clear Animation State

                // EXECUTE EXISTING WRONG LOGIC
                setSelectedLetters(prev => [...prev, { letter, status: 'wrong' }]);

                if (ghashniInProgress) {
                    const newWrongCount = ghashniWrongCount + 1;
                    setGhashniWrongCount(prev => prev + 1);
                    if (newAttemptsLeft === 0) {
                        if (newWrongCount === 2) {
                            // Penalty
                            if (currentTeam === 1) setTeam1Score(prev => prev - 1);
                            else setTeam2Score(prev => prev - 1);
                        }
                        setGhashniInProgress(false);
                        switchTurn();
                    }
                } else {
                    if (currentFreeTries === 0) {
                        if (currentTeam === 1) setTeam1Score(prev => prev - 1);
                        else setTeam2Score(prev => prev - 1);
                    }
                    switchTurn();
                }
            }, 1200);
        }
    };

    const handleShowHint = () => {
        if (hintRevealed || processing) return;
        setHintRevealed(true);
    };

    const handleRevealWord = () => {
        setGameState(GAME_STATES.FINISHED);
        // Auto-commit on reveal
        handleCommitMatch();
    };

    // Modal Transitions
    const handleShowQuestion = () => {
        setModalState(prev => ({ ...prev, step: 'question' }));
        // Start Modal Timer
        setModalTimerSeconds(0);
        setModalTimerRunning(true);
    };

    const handleShowAnswer = () => {
        // Logic: Mark question as used
        if (currentQuestion && currentQuestion.id) {
            setUsedQuestionIds(prev => {
                const next = new Set(prev);
                next.add(currentQuestion.id);
                return next;
            });
        }
        setModalState(prev => ({ ...prev, step: 'answer' }));
        // Stop Modal Timer
        setModalTimerRunning(false);
    };

    const handleShowWho = () => setModalState(prev => ({ ...prev, step: 'who' }));

    const handleSelectWinner = (winnerKey) => {
        // winnerKey: 'team1', 'team2', 'none'
        const winningTeam = winnerKey === 'team1' ? 1 : (winnerKey === 'team2' ? 2 : null);

        // CONSUME CARDS NOW if they were active
        if (activeHoleActive && activeCardTeam) {
            if (activeCardTeam === 1) setTeam1Cards(p => ({ ...p, hole: false }));
            else setTeam2Cards(p => ({ ...p, hole: false }));
        }
        if (activeDoubleActive && activeCardTeam) {
            if (activeCardTeam === 1) setTeam1Cards(p => ({ ...p, double: false }));
            else setTeam2Cards(p => ({ ...p, double: false }));
        }

        // Scoring Logic
        if (activeHoleActive) {
            if (winningTeam === activeCardTeam) {
                // Owner wins: +3 / -3
                if (winningTeam === 1) { setTeam1Score(p => p + 3); setTeam2Score(p => p - 3); }
                else { setTeam2Score(p => p + 3); setTeam1Score(p => p - 3); }
            } else if (winningTeam !== null) {
                // Opponent wins: +2
                if (winningTeam === 1) setTeam1Score(p => p + 2);
                else setTeam2Score(p => p + 2);
            }
        } else if (activeDoubleActive) {
            if (winningTeam === activeCardTeam) {
                // Owner wins: +4
                if (winningTeam === 1) setTeam1Score(p => p + 4);
                else setTeam2Score(p => p + 4);
            } else if (winningTeam !== null) {
                // Opponent wins: +2
                if (winningTeam === 1) setTeam1Score(p => p + 2);
                else setTeam2Score(p => p + 2);
            }
        } else {
            // Standard
            if (winningTeam === 1) setTeam1Score(p => p + 2);
            else if (winningTeam === 2) setTeam2Score(p => p + 2);
        }

        // Reset
        setActiveHoleActive(false);
        setActiveDoubleActive(false);
        setActiveCardTeam(null);
        setModalState({ isOpen: false, step: 'pre-question' });
        // Reset Modal Timer
        setModalTimerSeconds(0);
        setModalTimerRunning(false);

        if (ghashniInProgress && ghashniAttemptsLeft > 0) return;
        if (ghashniInProgress) setGhashniInProgress(false);
        switchTurn();
    };


    // MATCH COMMIT LOGIC
    const handleCommitMatch = async () => {
        // High-level guards to prevent double-commit or redundant calls
        if (!matchId || processing || match?.committed_at || match?.status === 'finished') {
            console.log('Commit skipped: Already processing or match already finished.', {
                matchId, processing, status: match?.status, committedAt: match?.committed_at
            });
            return;
        }

        const seasonId = match.season_id;
        setProcessing(true);

        try {
            // Calculate Winner to persist
            let winnerName = null;
            if (tieBreakWinner) {
                winnerName = tieBreakWinner === 1 ? match.team1_name : match.team2_name;
            } else {
                if (team1Score > team2Score) winnerName = match.team1_name;
                else if (team2Score > team1Score) winnerName = match.team2_name;
                else winnerName = 'Tie';
            }

            const updatePayload = {
                status: 'finished',
                winner: winnerName,
                committed_at: new Date().toISOString()
            };

            const { error: statusError } = await supabase
                .from('matches')
                .update(updatePayload)
                .eq('id', matchId);

            if (statusError) throw statusError;

            // 2. Track Used Questions
            const questionIds = Object.values(matchQuestions)
                .map(q => q.id || q.question_id)
                .filter(id => id != null);

            if (seasonId && questionIds.length > 0) {
                const usedQuestionsPayload = questionIds.map(qId => ({
                    season_id: seasonId,
                    question_id: qId,
                    match_id: matchId
                }));

                const { error: usedError } = await supabase
                    .from('season_used_questions')
                    .upsert(usedQuestionsPayload, { onConflict: 'season_id, question_id', ignoreDuplicates: true });

                if (usedError) {
                    console.error('Error inserting used questions details:', {
                        message: usedError.message,
                        details: usedError.details,
                        hint: usedError.hint,
                        code: usedError.code
                    });
                }
            }

            // Sync local state to reflect committed status
            setMatch(prev => ({ ...prev, status: 'finished', committed_at: updatePayload.committed_at }));

        } catch (err) {
            console.error('Error committing match details:', {
                message: err.message,
                details: err.details,
                hint: err.hint,
                code: err.code,
                fullError: err
            });
            alert('حدث خطأ أثناء إنهاء المباراة. الرجاء المحاولة مرة أخرى.');
        } finally {
            setProcessing(false);
        }
    };

    // Rows for Keyboard (fixed layout)
    const row1 = ["ا", "ب", "ت", "ث", "ج", "ح", "خ", "د", "ذ", "ر", "ز", "س", "ش", "ص"];
    const row2 = ["ض", "ط", "ظ", "ع", "غ", "ف", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي"];


    // --- RENDERS ---

    if (loading) return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: '#0F2027', color: '#fff' }}>Loading...</div>;
    if (error) return <div style={{ height: '100vh', display: 'grid', placeItems: 'center', color: 'red' }}>{error}</div>;

    // WAITING SCREEN (Pre-Show Experience)
    if (gameState === GAME_STATES.WAITING) {
        return (
            <div className="font-ibm" style={{
                height: '100vh', width: '100vw',
                background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#fff', overflow: 'hidden', direction: 'rtl'
            }}>
                <FontImport />

                {/* Glass Panel */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)',
                    borderRadius: 32, padding: '48px 64px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    maxWidth: '90%', width: 'min(800px, 90vw)',
                    animation: 'pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                    {/* LOGO (Larger) */}
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" style={{ maxHeight: '180px', width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }} />

                    {/* TEAM NAMES (Animated) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap', justifyContent: 'center', margin: '16px 0' }}>
                        <div style={{ animation: 'float-team 3s ease-in-out infinite' }}>
                            <div style={{
                                fontSize: '2.5rem', fontWeight: 800,
                                background: 'linear-gradient(180deg, #fff 0%, #94a3b8 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                            }}>
                                {match.team1_name}
                            </div>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 300, opacity: 0.6, fontFamily: 'monospace' }}>VS</div>
                        <div style={{ animation: 'float-team 3s ease-in-out infinite 1.5s' }}>
                            <div style={{
                                fontSize: '2.5rem', fontWeight: 800,
                                background: 'linear-gradient(180deg, #fff 0%, #94a3b8 100%)',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                            }}>
                                {match.team2_name}
                            </div>
                        </div>
                    </div>

                    {/* START BUTTON & CREDIT */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
                        <button onClick={startGame} className="font-ibm" style={{
                            width: '100%', maxWidth: '320px', height: '64px',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                            color: '#fff', border: 'none', borderRadius: '16px',
                            fontSize: '24px', fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.5)',
                            transition: 'all 0.2s ease'
                        }}>
                            ابدأ المباراة
                        </button>
                        <div style={{ fontSize: '0.85rem', opacity: 0.5, fontWeight: 400, marginTop: 4 }}>
                            برمجة وابتكار: أ.عبدالله الأنصاري
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes pop-in {
                        0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    @keyframes float-team {
                        0%, 100% { transform: translateY(0); text-shadow: 0 0 0 rgba(255,255,255,0); }
                        50% { transform: translateY(-8px); text-shadow: 0 0 12px rgba(255,255,255,0.3); }
                    }
                `}</style>
            </div>
        );
    }

    // PLAYING SCREEN (New Grid Layout)
    const activeColor = currentTeam === 1 ? '#3b82f6' : '#f59e0b';
    const activeTeamName = currentTeam === 1 ? match.team1_name : match.team2_name;
    // Calculate wordLetters globally for use in Result Screen too
    const wordLetters = (match.shuffled_letters || []).map((char, i) => ({
        char,
        isRevealed: revealedPositions.includes(i) || gameState === GAME_STATES.FINISHED // Always show in finished state
    }));

    // FINISHED SCREEN (Restyled)
    if (gameState === GAME_STATES.FINISHED) {
        // TIE CHECK
        const isTie = team1Score === team2Score;
        const hasDbWinner = !!match.winner;

        // If it's a tie and we haven't selected a winner yet AND no DB winner, SHOW TIE-BREAKER MODAL
        if (isTie && !tieBreakWinner && !hasDbWinner) {
            return (
                <div className="font-ibm" style={{
                    direction: 'rtl', width: '100vw', height: '100vh', overflow: 'hidden',
                    background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
                    color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)',
                        borderRadius: 32, padding: '48px 64px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        maxWidth: '90%', width: 'min(600px, 90vw)',
                        animation: 'pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}>
                        <div style={{ fontSize: '4rem', marginBottom: -16 }}>⚖️</div>
                        <h1 className="font-ibm" style={{ fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', margin: 0 }}>تعادل!</h1>
                        <p style={{ fontSize: '1.5rem', opacity: 0.8, textAlign: 'center', margin: 0 }}>منو حل كلمة السر؟</p>

                        <div style={{ display: 'flex', gap: 16, width: '100%', marginTop: 16 }}>
                            <button onClick={() => handleSelectTieWinner(1)} style={{
                                flex: 1, padding: '24px', borderRadius: 20, border: 'none',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                color: '#fff', fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer',
                                boxShadow: '0 8px 20px -4px rgba(59, 130, 246, 0.5)', transition: 'transform 0.2s'
                            }}>
                                {match.team1_name}
                            </button>
                            <button onClick={() => handleSelectTieWinner(2)} style={{
                                flex: 1, padding: '24px', borderRadius: 20, border: 'none',
                                background: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)',
                                color: '#fff', fontSize: '1.5rem', fontWeight: 700, cursor: 'pointer',
                                boxShadow: '0 8px 20px -4px rgba(245, 158, 11, 0.5)', transition: 'transform 0.2s'
                            }}>
                                {match.team2_name}
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        // DETERMINE WINNER (Score or Tie-Break)
        let finalWinnerTeamId = tieBreakWinner || (team1Score > team2Score ? 1 : 2);

        // If DB has winner, override local calculation
        if (match.winner) {
            if (match.winner === match.team1_name) finalWinnerTeamId = 1;
            else if (match.winner === match.team2_name) finalWinnerTeamId = 2;
        }
        const winnerName = finalWinnerTeamId === 1 ? match.team1_name : match.team2_name;
        // const isTie = team1Score === team2Score; // No longer used for visual output since we forced a winner
        const winnerColor = finalWinnerTeamId === 1 ? '#3b82f6' : '#f59e0b';

        return (
            <div className="font-ibm" style={{
                direction: 'rtl', width: '100vw', height: '100vh', overflow: 'hidden',
                background: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
                color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <Fireworks />
                <FontImport />

                {/* Winner Announcement Card */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)',
                    borderRadius: 32, padding: '48px 64px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    maxWidth: '90%', width: 'min(800px, 90vw)', animation: 'pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}>
                    {/* 1. LOGO */}
                    <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" style={{ maxHeight: '100px', width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))', marginBottom: 8 }} />

                    {/* 2. SECRET WORD (HERO) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.6 }}>كلمة السر</div>
                        <h1 style={{
                            fontSize: '4.5rem', fontWeight: 800, lineHeight: 1.1,
                            background: 'linear-gradient(180deg, #fff 0%, #cbd5e1 100%)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
                            margin: 0, padding: '0 16px', textAlign: 'center'
                        }}>
                            {match.secret_word || match.secret_word_display || (match.shuffled_letters ? "---" : "كلمة السر")}
                        </h1>
                    </div>

                    {/* 3. SCORE & WINNER */}
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {/* Scores */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#94a3b8', marginBottom: 2 }}>{match.team1_name}</div>
                                <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'monospace', color: '#3b82f6' }}>{team1Score * 100}</div>
                            </div>
                            <div style={{ fontSize: '2rem', opacity: 0.2, fontWeight: 300, paddingBottom: 12 }}>-</div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#94a3b8', marginBottom: 2 }}>{match.team2_name}</div>
                                <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'monospace', color: '#f59e0b' }}>{team2Score * 100}</div>
                            </div>
                        </div>

                        {/* Winner Badge */}
                        <div style={{
                            fontSize: '1.5rem', fontWeight: 700,
                            color: winnerColor,
                            background: `${winnerColor}15`,
                            padding: '10px 32px', borderRadius: 99,
                            border: `1px solid ${winnerColor}30`,
                            display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: `0 0 30px ${winnerColor}20`
                        }}>
                            <span>🏆</span>
                            <span>{isTie ? 'تعادل!' : `الفائز: ${winnerName}`}</span>
                        </div>
                    </div>

                    <button onClick={() => navigate('/join')} style={{
                        marginTop: 12, padding: '14px 40px',
                        background: 'rgba(255,255,255,0.05)', color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                        fontSize: '1.1rem', fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s', marginBottom: 8
                    }}>
                        مباراة جديدة
                    </button>
                </div>
            </div>
        );
    }


    // Helper for current team cards in Main UI
    // Ghashni is clickable if owned by current team
    // Hole/Double NOT clickable in Main UI

    // Helper for Modal Cards
    const modalTeamCards = currentTeam === 1 ? team1Cards : team2Cards;

    return (
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

            {/* INNER CONTAINER (FLEX COLUMN) */}
            <div style={{
                width: 'min(1400px, 100vw)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                padding: '1vh 1vw',
            }}>

                {/* ROW 1: HEADER ZONE (Fixed Height) */}
                <div style={{ flex: '0 0 130px', display: 'flex', gap: '16px', alignItems: 'stretch', overflow: 'hidden' }}>
                    {/* Team 1 (Right) */}
                    <div className={`glass-panel team-panel ${currentTeam === 1 ? 'team-active-blue' : ''} ${currentTeam === 1 && turnSwitchAnimating ? 'turn-pulse' : ''}`}
                        style={{ flex: 1, borderRadius: 24, padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{match.team1_name}</span>
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    padding: '4px 12px', borderRadius: 12,
                                    fontSize: '0.85rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    opacity: team1FreeTries > 0 ? 1 : 0.4,
                                    filter: team1FreeTries > 0 ? 'none' : 'grayscale(100%)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <span>❤️</span> {team1FreeTries}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <PowerCard type="double" used={!team1Cards.double || ghashniInProgress} />
                                <PowerCard type="hole" used={!team1Cards.hole || ghashniInProgress} />
                                <PowerCard
                                    type="ghashni"
                                    used={!team1Cards.ghashni || (ghashniInProgress && currentTeam === 2)}
                                    isActive={ghashniInProgress && currentTeam === 1}
                                    onClick={currentTeam === 1 ? handleActivateGhashni : undefined}
                                />
                            </div>
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 700, fontFamily: 'monospace', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{team1Score * 100}</div>
                    </div>

                    {/* Logo (Center) */}
                    <div style={{ width: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" style={{ maxHeight: '110px', width: 'auto', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }} />
                    </div>

                    {/* Team 2 (Left) */}
                    <div className={`glass-panel team-panel ${currentTeam === 2 ? 'team-active-amber' : ''} ${currentTeam === 2 && turnSwitchAnimating ? 'turn-pulse' : ''}`}
                        style={{ flex: 1, borderRadius: 24, padding: '0 24px', display: 'flex', flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexDirection: 'row-reverse' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 700, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{match.team2_name}</span>
                                <div style={{
                                    background: 'rgba(16, 185, 129, 0.2)', color: '#6ee7b7',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    padding: '4px 12px', borderRadius: 12,
                                    fontSize: '0.85rem', fontWeight: 700,
                                    display: 'flex', alignItems: 'center', gap: 4,
                                    opacity: team2FreeTries > 0 ? 1 : 0.4,
                                    filter: team2FreeTries > 0 ? 'none' : 'grayscale(100%)',
                                    transition: 'all 0.3s ease'
                                }}>
                                    <span>❤️</span> {team2FreeTries}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12, flexDirection: 'row-reverse' }}>
                                <PowerCard type="double" used={!team2Cards.double || ghashniInProgress} />
                                <PowerCard type="hole" used={!team2Cards.hole || ghashniInProgress} />
                                <PowerCard
                                    type="ghashni"
                                    used={!team2Cards.ghashni || (ghashniInProgress && currentTeam === 1)}
                                    isActive={ghashniInProgress && currentTeam === 2}
                                    onClick={currentTeam === 2 ? handleActivateGhashni : undefined}
                                />
                            </div>
                        </div>
                        <div style={{ fontSize: '4rem', fontWeight: 700, fontFamily: 'monospace', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>{team2Score * 100}</div>
                    </div>
                </div>

                {/* ROW 2: MIDDLE ZONE (EXPANDS) */}
                <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', paddingTop: '0px' }}>

                    {/* Controls Row */}
                    <div style={{ flex: '0 0 auto', width: '100%', maxWidth: '720px', height: '64px', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '10px', marginBottom: '10px', zIndex: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', minWidth: '120px', justifyContent: 'flex-start' }}>
                            {/* HINT: Disabled until free tries are 0 */}
                            <button className="control-btn control-pressable"
                                disabled={modalState.isOpen || hintRevealed || !match.hint_text || (currentTeam === 1 ? team1FreeTries : team2FreeTries) > 0}
                                onClick={handleShowHint}
                            >
                                <span>💡 تلميح</span>
                            </button>
                        </div>
                        <div className={getTimerClass(timerSeconds)} style={{ backdropFilter: 'blur(4px)', padding: '0 24px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 700, minWidth: '120px', textAlign: 'center' }}>
                            {formatTime(timerSeconds)}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: '120px', justifyContent: 'flex-end' }}>
                            <div className={`control-pressable ${modalState.isOpen ? 'disabled' : ''}`} onClick={handleManualSwitchTurn} style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: `1px solid ${activeColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <IconSwitch style={{ width: 20, height: 20, color: activeColor }} />
                            </div>
                            {/* REVEAL: Disabled until ALL letters are revealed */}
                            <button className="control-btn reveal control-pressable"
                                disabled={modalState.isOpen || revealedPositions.length !== (match.shuffled_letters || []).length}
                                onClick={handleRevealWord}
                                style={{ minWidth: '100px' }}
                            >
                                <span>👁️ كشف</span>
                            </button>
                        </div>
                    </div>

                    {/* Word Tiles */}
                    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                        <div style={{ background: 'rgba(255,255,255,0.96)', color: '#0b1220', borderRadius: 32, padding: '24px 32px', gap: '12px', display: 'flex', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,1)', border: '1px solid rgba(255,255,255,0.4)', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {wordLetters.length > 0 ? wordLetters.map((item, idx) => (
                                <div key={idx} style={{
                                    width: 64, height: 84,
                                    background: item.isRevealed ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' : 'rgba(15, 23, 42, 0.05)',
                                    borderRadius: 16, display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    fontSize: '2.8rem', fontWeight: 700,
                                    color: item.isRevealed ? '#fff' : 'transparent',
                                    boxShadow: item.isRevealed ? '0 4px 12px rgba(37, 99, 235, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)' : 'inset 0 2px 6px rgba(0,0,0,0.06)',
                                    animation: item.isRevealed ? 'reveal-pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) backwards' : 'none'
                                }}>{item.char}</div>
                            )) : (
                                <div>No Letters Loaded</div>
                            )}
                        </div>
                    </div>

                    {/* HINT SLOT (Expands to fill gap) */}
                    <div style={{ flex: '1 1 auto', width: '100%', minHeight: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
                        {hintRevealed && match.hint_text && (
                            <div style={{
                                background: '#111',
                                padding: '16px 24px',
                                borderRadius: 16,
                                border: '1px solid #facc15',
                                color: '#facc15',
                                fontSize: '1.2rem',
                                fontWeight: 600,
                                maxWidth: '90%',
                                textAlign: 'center',
                                boxShadow: '0 10px 30px -5px rgba(0,0,0,0.5)'
                            }}>
                                💡 {match.hint_text}
                            </div>
                        )}
                    </div>

                </div>

                {/* ROW 3: FOOTER / KEYBOARD ZONE (Fixed Height / Bottom) */}
                <div style={{
                    flex: '0 0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', overflow: 'visible', paddingBottom: '16px', gap: '4px',
                    opacity: isWordComplete ? 0.5 : 1,
                    pointerEvents: isWordComplete ? 'none' : 'auto',
                    transition: 'all 0.3s ease'
                }}>
                    {/* KEYBOARD ROW 1 */}
                    <div className="kb-row" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                        {row1.map((char, i) => {
                            const isAnimatingWrong = wrongAnimatingLetter === char;
                            const selected = selectedLetters.find(l => l.letter === char);
                            const status = selected?.status || 'default';
                            let keyClass = 'kb-key';
                            if (status === 'correct') keyClass += ' correct';
                            if (status === 'wrong' && !isAnimatingWrong) keyClass += ' wrong';
                            if (isAnimatingWrong) keyClass += ' wrong-impact';

                            return (
                                <Pressable
                                    key={i}
                                    className={keyClass}
                                    onClick={() => handleLetterClick(char)}
                                    disabled={modalState.isOpen || processing || !!selected || isAnimatingWrong}
                                >
                                    {char}
                                    {isAnimatingWrong && (
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            animation: 'fade-in 0.2s ease-out'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                </Pressable>
                            );
                        })}
                    </div>
                    {/* KEYBOARD ROW 2 */}
                    <div className="kb-row" style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'nowrap' }}>
                        {row2.map((char, i) => {
                            const isAnimatingWrong = wrongAnimatingLetter === char;
                            const selected = selectedLetters.find(l => l.letter === char);
                            const status = selected?.status || 'default';
                            let keyClass = 'kb-key';
                            if (status === 'correct') keyClass += ' correct';
                            if (status === 'wrong' && !isAnimatingWrong) keyClass += ' wrong';
                            if (isAnimatingWrong) keyClass += ' wrong-impact';

                            return (
                                <Pressable
                                    key={i}
                                    className={keyClass}
                                    onClick={() => handleLetterClick(char)}
                                    disabled={modalState.isOpen || processing || !!selected || isAnimatingWrong}
                                >
                                    {char}
                                    {isAnimatingWrong && (
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            animation: 'fade-in 0.2s ease-out'
                                        }}>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                </Pressable>
                            );
                        })}
                    </div>
                </div>

                {/* QUESTION MODAL */}
                {modalState.isOpen && currentQuestion && (
                    <div className="q-modal-overlay">
                        <div className="q-modal-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                            {/* MODAL TIMER (Pre/Question/Answer only) */}
                            {modalState.step !== 'who' && (
                                <div className={getTimerClass(modalTimerSeconds)} style={{
                                    position: 'absolute', top: 24, right: 24, // Top Right corner
                                    padding: '0 16px', height: '36px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 12, fontFamily: 'monospace', fontSize: '1.2rem', fontWeight: 700,
                                    backdropFilter: 'blur(4px)', zIndex: 10
                                }}>
                                    {formatTime(modalTimerSeconds)}
                                </div>
                            )}

                            {/* PRE-QUESTION */}
                            {modalState.step === 'pre-question' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px' }}>
                                    <div className="q-step-title" style={{ width: '100%', textAlign: 'center' }}>سؤال الحرف ({currentQuestion.letter})</div>
                                    <div className="q-team-name" style={{ textAlign: 'center' }}>{activeTeamName}</div>
                                    <div style={{ display: 'flex', flexDirection: 'row', gap: 24, justifyContent: 'center', width: '100%', margin: '16px 0' }}>
                                        <div style={{ textAlign: 'center', opacity: 0.9 }}>
                                            <PowerCard
                                                type="hole"
                                                used={!modalTeamCards.hole || ghashniInProgress}
                                                isActive={activeHoleActive}
                                                onClick={() => togglePreQuestionCard('hole')}
                                            />
                                        </div>
                                        <div style={{ textAlign: 'center', opacity: 0.9 }}>
                                            <PowerCard
                                                type="double"
                                                used={!modalTeamCards.double || ghashniInProgress}
                                                isActive={activeDoubleActive}
                                                onClick={() => togglePreQuestionCard('double')}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ height: '32px' }} />
                                    <button className="q-btn-primary" onClick={handleShowQuestion}>إظهار السؤال</button>
                                </div>
                            )}
                            {/* QUESTION */}
                            {modalState.step === 'question' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px', flex: 1 }}>
                                    <div className="q-step-title">سؤال الحرف ({currentQuestion.letter})</div>
                                    <div className="q-text-box" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                        {currentQuestion.question}
                                    </div>
                                    <button className="q-btn-primary" onClick={handleShowAnswer}>إظهار الإجابة</button>
                                </div>
                            )}
                            {/* ANSWER */}
                            {modalState.step === 'answer' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px', flex: 1 }}>
                                    <div className="q-step-title">سؤال الحرف ({currentQuestion.letter})</div>
                                    <div style={{ fontSize: '1.2rem', opacity: 0.7, margin: '8px 0', lineHeight: 1.4, textAlign: 'center' }}>{currentQuestion.question}</div>
                                    <div className="a-text-box" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '3rem', fontWeight: 800 }}>
                                        {currentQuestion.answer}
                                    </div>
                                    <button className="q-btn-primary q-btn-who" onClick={handleShowWho}>منو جاوب؟</button>
                                </div>
                            )}
                            {/* WHO */}
                            {modalState.step === 'who' && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: '16px', flex: 1 }}>
                                    <div style={{ color: '#94a3b8', fontSize: '1.2rem', fontWeight: 600, marginBottom: 8, textAlign: 'center' }}>
                                        الفريق المُختار: {activeTeamName}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 500, flex: 1, justifyContent: 'center' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <button className="q-btn-choice" onClick={() => handleSelectWinner('team1')}>{match.team1_name}</button>
                                            <button className="q-btn-choice" onClick={() => handleSelectWinner('team2')}>{match.team2_name}</button>
                                        </div>
                                        <button className="q-btn-choice" onClick={() => handleSelectWinner('none')} style={{ background: 'rgba(255,255,255,0.08)' }}>ولا أحد</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
