/**
 * Match Helper Functions
 * Handles normalization, shuffling, and question selection for matches
 */

/**
 * Normalize Arabic text by:
 * - Removing diacritics (tashkeel)
 * - Normalizing Alef variations (أ/إ/آ → ا)
 * - Normalizing Yaa (ى → ي)
 * - Normalizing Taa Marbuta (ة → ه)
 * - Trimming whitespace
 */
export const normalizeSecretWord = (word) => {
    if (!word) return '';

    return word
        .trim()
        // Remove Arabic diacritics (U+064B to U+065F)
        .replace(/[\u064B-\u065F]/g, '')
        // Normalize Alef variations
        .replace(/[أإآ]/g, 'ا')
        // Normalize Taa Marbuta
        .replace(/ة/g, 'ه');
};

/**
 * Shuffle an array using Fisher-Yates algorithm
 * Returns a new shuffled array without modifying the original
 */
export const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

/**
 * Extract unique letters from a normalized word
 * Returns array of unique letters in order of first appearance
 */
export const getUniqueLetters = (normalizedWord) => {
    if (!normalizedWord) return [];

    const letters = normalizedWord.split('');
    const unique = [];
    const seen = new Set();

    for (const letter of letters) {
        // Skip spaces and non-Arabic characters
        if (letter === ' ' || !/[\u0600-\u06FF]/.test(letter)) continue;

        if (!seen.has(letter)) {
            seen.add(letter);
            unique.push(letter);
        }
    }

    return unique;
};

/**
 * Get a random item from an array
 */
export const getRandomItem = (array) => {
    if (!array || array.length === 0) return null;
    return array[Math.floor(Math.random() * array.length)];
};

/**
 * Swap two elements in an array
 * Returns a new array with swapped elements
 */
export const swapArrayElements = (array, indexA, indexB) => {
    if (!array || indexA < 0 || indexB < 0 || indexA >= array.length || indexB >= array.length) {
        return array;
    }

    const arr = [...array];
    [arr[indexA], arr[indexB]] = [arr[indexB], arr[indexA]];
    return arr;
};

/**
 * Validate Arabic text (contains at least one Arabic character)
 */
export const isArabicText = (text) => {
    if (!text) return false;
    return /[\u0600-\u06FF]/.test(text);
};

/**
 * Generate a unique 4-digit stage code
 * @param {Function} checkExists - Async function to check if code exists
 * @returns {Promise<string>} 4-digit code
 */
export const generateStageCode = async (checkExists) => {
    const MAX_ATTEMPTS = 20;

    for (let i = 0; i < MAX_ATTEMPTS; i++) {
        // Generate random 4-digit code (1000-9999)
        const code = Math.floor(1000 + Math.random() * 9000).toString();

        // Check if it exists
        const exists = await checkExists(code);
        if (!exists) {
            return code;
        }
    }

    // Fallback: if all random attempts fail, use timestamp-based
    return (Date.now() % 10000).toString().padStart(4, '0');
};

/**
 * Generate stage URL for a match using stage code
 */
export const generateStageUrl = (stageCode) => {
    return `${window.location.origin}/#/s/${stageCode}`;
};
