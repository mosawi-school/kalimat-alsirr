// Arabic letters for keyboard
export const ARABIC_LETTERS = [
    'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ',
    'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص',
    'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق',
    'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'
];

// Game configuration
export const INITIAL_TIMER_SECONDS = 60;

export const GAME_STATES = {
    WAITING: 'waiting',
    PLAYING: 'playing',
    FINISHED: 'finished'
};

/**
 * Normalize a single letter for comparison
 * Same rules as normalizeSecretWord but for individual letters
 */
export const normalizeLetter = (letter) => {
    if (!letter) return '';

    return letter
        .trim()
        // Remove diacritics
        .replace(/[\u064B-\u065F]/g, '')
        // Normalize Alef variations
        .replace(/[أإآ]/g, 'ا')
        // Normalize Taa Marbuta
        .replace(/ة/g, 'ه');
};

/**
 * Check if selected letter matches a position in shuffled letters
 * Both are normalized before comparison
 */
export const letterMatches = (selectedLetter, boxLetter) => {
    return normalizeLetter(selectedLetter) === normalizeLetter(boxLetter);
};

/**
 * Find all positions where selected letter appears (after normalization)
 */
export const findLetterPositions = (selectedLetter, shuffledLetters) => {
    const positions = [];
    shuffledLetters.forEach((boxLetter, index) => {
        if (letterMatches(selectedLetter, boxLetter)) {
            positions.push(index);
        }
    });
    return positions;
};

/**
 * Get all unique normalized letters from shuffled letters
 */
export const getUniqueNormalizedLetters = (shuffledLetters) => {
    const normalized = shuffledLetters.map(l => normalizeLetter(l));
    return [...new Set(normalized)];
};
