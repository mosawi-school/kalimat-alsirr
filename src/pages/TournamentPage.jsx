import React, { useState } from 'react';

const TournamentPage = () => {
    // 14 slots for the entire bracket:
    // 0-7: Quarterfinals
    // 8-11: Semifinals
    // 12-13: Finals
    const [slots, setSlots] = useState(Array(14).fill(""));

    // Edit Modal State
    const [editSlot, setEditSlot] = useState(null); // { index, value, placeholder }

    const updateSlot = (index, value) => {
        const newSlots = [...slots];
        newSlots[index] = value;
        setSlots(newSlots);
    };

    const handleReset = () => {
        if (window.confirm("هل أنت متأكد من مسح جميع الأسماء؟")) {
            setSlots(Array(14).fill(""));
        }
    };

    const openEditModal = (index, placeholder) => {
        setEditSlot({ index, value: slots[index], placeholder });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        updateSlot(editSlot.index, Object.is(editSlot.value, undefined) ? "" : editSlot.value);
        setEditSlot(null);
    };

    // Basic Visual Match Card (Click to Edit)
    const MatchCard = ({ matchNumber, idx1, idx2, ph1 = "فريق 1", ph2 = "فريق 2" }) => (
        <div className="relative p-2 rounded-[1rem] bg-white/5 backdrop-blur-md border border-white/10 shadow-xl w-[140px] xl:w-[150px] transition-all hover:bg-white/10">
            <div className="flex flex-col gap-1.5">
                <div
                    onClick={() => openEditModal(idx1, ph1)}
                    className="flex justify-center items-center bg-black/40 px-2 py-1.5 rounded-lg border border-white/5 overflow-hidden cursor-pointer hover:bg-white/20 hover:border-white/20 transition-all group"
                >
                    <span className="text-xs font-bold text-white/90 truncate group-hover:text-white transition-colors">
                        {slots[idx1] || <span className="text-white/40">{ph1}</span>}
                    </span>
                </div>
                <div
                    onClick={() => openEditModal(idx2, ph2)}
                    className="flex justify-center items-center bg-black/40 px-2 py-1.5 rounded-lg border border-white/5 overflow-hidden cursor-pointer hover:bg-white/20 hover:border-white/20 transition-all group"
                >
                    <span className="text-xs font-bold text-white/90 truncate group-hover:text-white transition-colors">
                        {slots[idx2] || <span className="text-white/40">{ph2}</span>}
                    </span>
                </div>
            </div>
            {matchNumber && (
                <div className="absolute -top-2.5 -right-2 bg-gradient-to-r from-blue-700 to-blue-500 text-[9px] font-bold px-1.5 py-0.5 rounded-md border border-blue-400/50 uppercase tracking-widest shadow-md text-white pointer-events-none">
                    مباراة {matchNumber}
                </div>
            )}
        </div>
    );

    // Side-by-Side Final Match Card (Click to Edit)
    const FinalCard = ({ idx1, idx2, ph1 = "متأهل 1", ph2 = "متأهل 2" }) => (
        <div className="relative p-3 rounded-2xl border-2 border-yellow-400/50 shadow-[0_0_30px_rgba(250,204,21,0.25)] bg-gradient-to-b from-yellow-500/20 to-black/60 w-full max-w-[300px] flex flex-col items-center backdrop-blur-xl z-20">
            <h3 className="text-yellow-400 text-[12px] font-bold uppercase tracking-[0.1em] mb-2 drop-shadow-md text-center pointer-events-none">
                النهائـــي
            </h3>
            <div className="flex items-center justify-between w-full gap-2">
                <div
                    onClick={() => openEditModal(idx1, ph1)}
                    className="flex-1 bg-black/60 px-2 py-2 rounded-xl border border-yellow-400/30 text-center shadow-inner overflow-hidden cursor-pointer hover:bg-yellow-500/20 hover:border-yellow-400/60 transition-all group"
                >
                    <span className="text-sm font-bold text-yellow-400 drop-shadow-md truncate block group-hover:text-yellow-300 transition-colors">
                        {slots[idx1] || <span className="text-yellow-400/40">{ph1}</span>}
                    </span>
                </div>
                <div className="text-base font-bold text-white/60 px-1 italic drop-shadow-md pointer-events-none">VS</div>
                <div
                    onClick={() => openEditModal(idx2, ph2)}
                    className="flex-1 bg-black/60 px-2 py-2 rounded-xl border border-yellow-400/30 text-center shadow-inner overflow-hidden cursor-pointer hover:bg-yellow-500/20 hover:border-yellow-400/60 transition-all group"
                >
                    <span className="text-sm font-bold text-yellow-400 drop-shadow-md truncate block group-hover:text-yellow-300 transition-colors">
                        {slots[idx2] || <span className="text-yellow-400/40">{ph2}</span>}
                    </span>
                </div>
            </div>
        </div>
    );

    const ColumnTitle = ({ title, colorClass = "text-white/40" }) => (
        <h3 className={`text-center ${colorClass} text-[10px] xl:text-[11px] font-bold uppercase tracking-[0.1em] mb-2 pointer-events-none`}>
            {title}
        </h3>
    );

    return (
        <div className="h-screen w-full font-ibm bg-[linear-gradient(135deg,#0F2027_0%,#203A43_50%,#2C5364_100%)] text-white relative flex flex-col overflow-hidden" dir="rtl">
            <style>
                {`
                .font-ibm { font-family: 'IBM Plex Sans Arabic', sans-serif; }
                `}
            </style>

            {/* Click-to-Edit Modal */}
            {editSlot && (
                <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-200">
                    <div className="bg-[#1a1a2e] border border-white/10 p-6 rounded-2xl w-full max-w-[320px] shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <h2 className="text-lg font-bold text-white mb-4 text-center">اسم الفريق</h2>
                        <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                            <input
                                type="text"
                                value={editSlot.value}
                                onChange={(e) => setEditSlot({ ...editSlot, value: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
                                placeholder={editSlot.placeholder}
                                autoFocus
                                dir="rtl"
                            />
                            <div className="flex gap-3 mt-2">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition shadow-lg">
                                    حفظ
                                </button>
                                <button type="button" onClick={() => setEditSlot(null)} className="flex-1 bg-white/10 hover:bg-white/20 text-white text-sm font-bold py-2.5 rounded-xl transition border border-white/10">
                                    إلغاء
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Simple Reset Button */}
            <div className="absolute top-4 left-4 z-50">
                <button
                    onClick={handleReset}
                    className="bg-white/10 hover:bg-white/20 text-white/80 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-white/10 hover:border-white/30 flex items-center gap-2 backdrop-blur-sm shadow-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                    إعادة ضبط
                </button>
            </div>

            {/* Main Wrapper (Strict Rule of Thirds: 1/3 Logo, 2/3 Bracket) */}
            <div className="w-full h-full max-w-[1400px] mx-auto grid grid-rows-[1fr_2fr] px-2">

                {/* Row 1: Header Section (Top 1/3) */}
                <div className="flex flex-col items-center justify-center z-20 w-full h-full p-4">
                    <img
                        src={`${import.meta.env.BASE_URL}password-logo-wide.png`}
                        alt="Logo"
                        className="w-auto max-w-[520px] max-h-[22vh] object-contain drop-shadow-[0_4px_15px_rgba(0,0,0,0.4)] pointer-events-none"
                    />
                </div>

                {/* Row 2: Bracket Grid Area (Bottom 2/3) */}
                <div className="relative w-full h-full flex flex-col items-center justify-center pb-6">

                    {/* Large Subtle Background Trophy */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.04] mix-blend-overlay mt-[-40px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 22V18" />
                            <path d="M14 22V18" />
                            <path d="M18 4H6v7a6 6 0 0 0 12 0V4Z" />
                        </svg>
                    </div>

                    <div className="grid grid-cols-3 w-full gap-2 xl:gap-8 items-stretch relative z-10 max-w-5xl h-full pb-4">

                        {/* Column RIGHT: QF(1,2) + SF(1) layout via flex */}
                        <div className="flex items-stretch justify-center relative">
                            {/* Quarterfinals Top/Bottom */}
                            <div className="flex flex-col justify-between py-4 z-10 w-[140px] xl:w-[150px]">
                                <div className="flex flex-col items-center">
                                    <ColumnTitle title="ربع النهائي" />
                                    <MatchCard
                                        matchNumber="1"
                                        idx1={0} idx2={1}
                                        ph1="فريق 1" ph2="فريق 2"
                                    />
                                </div>
                                <div className="flex flex-col items-center">
                                    <MatchCard
                                        matchNumber="2"
                                        idx1={2} idx2={3}
                                        ph1="فريق 3" ph2="فريق 4"
                                    />
                                </div>
                            </div>

                            {/* Connecting Lines (RTL: drawn towards left) */}
                            <div className="w-8 relative my-[36px] border-y-2 border-l-2 border-white/20 rounded-l-xl mx-2 pointer-events-none">
                            </div>

                            {/* Semifinal Centered */}
                            <div className="flex flex-col justify-center z-10 w-[140px] xl:w-[150px]">
                                <ColumnTitle title="نصف النهائي" />
                                <MatchCard
                                    matchNumber="5"
                                    idx1={8} idx2={9}
                                    ph1="فائز 1" ph2="فائز 2"
                                />
                            </div>
                        </div>

                        {/* Column CENTER: Final */}
                        <div className="flex flex-col items-center justify-center relative px-2">
                            {/* Connecting Line from SFs to Final */}
                            <div className="absolute right-0 top-[52%] w-[calc(50%-150px)] border-t-2 border-white/20 -z-10 xl:w-[calc(50%-160px)]"></div>
                            <div className="absolute left-0 top-[52%] w-[calc(50%-150px)] border-t-2 border-white/20 -z-10 xl:w-[calc(50%-160px)]"></div>

                            <div className="w-full flex justify-center mt-2 relative z-20">
                                {/* Tight yellow highlight behind final only */}
                                <div className="absolute -inset-4 bg-yellow-500/15 blur-2xl rounded-full z-0 pointer-events-none"></div>
                                <FinalCard idx1={12} idx2={13} ph1="متأهل 1" ph2="متأهل 2" />
                            </div>
                        </div>

                        {/* Column LEFT: SF(2) + QF(3,4) layout via flex-row-reverse for physical left alignment */}
                        <div className="flex flex-row-reverse items-stretch justify-center relative">
                            {/* Quarterfinals Top/Bottom (Appears on physical left) */}
                            <div className="flex flex-col justify-between py-4 z-10 w-[140px] xl:w-[150px]">
                                <div className="flex flex-col items-center">
                                    <ColumnTitle title="ربع النهائي" />
                                    <MatchCard
                                        matchNumber="3"
                                        idx1={4} idx2={5}
                                        ph1="فريق 5" ph2="فريق 6"
                                    />
                                </div>
                                <div className="flex flex-col items-center">
                                    <MatchCard
                                        matchNumber="4"
                                        idx1={6} idx2={7}
                                        ph1="فريق 7" ph2="فريق 8"
                                    />
                                </div>
                            </div>

                            {/* Connecting Lines (RTL: drawn towards right) */}
                            <div className="w-8 relative my-[36px] border-y-2 border-r-2 border-white/20 rounded-r-xl mx-2 pointer-events-none">
                            </div>

                            {/* Semifinal Centered (Appears on physical right, closer to center) */}
                            <div className="flex flex-col justify-center z-10 w-[140px] xl:w-[150px]">
                                <ColumnTitle title="نصف النهائي" />
                                <MatchCard
                                    matchNumber="6"
                                    idx1={10} idx2={11}
                                    ph1="فائز 3" ph2="فائز 4"
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default TournamentPage;
