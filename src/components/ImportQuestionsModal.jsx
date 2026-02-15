import { useState } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabaseClient';

const DIFFICULTY_MAP = {
    'سهل': 'easy',
    'easy': 'easy',
    'متوسط': 'medium',
    'medium': 'medium',
    'صعب': 'hard',
    'hard': 'hard'
};

export default function ImportQuestionsModal({ isOpen, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [validRows, setValidRows] = useState([]);
    const [invalidRows, setInvalidRows] = useState([]);
    const [step, setStep] = useState('upload'); // upload, preview, importing, done
    const [mode, setMode] = useState('add'); // add, upsert
    const [progress, setProgress] = useState(0);
    const [importReport, setImportReport] = useState(null);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        const ext = selectedFile.name.split('.').pop().toLowerCase();
        if (!['csv', 'xlsx', 'xls'].includes(ext)) {
            setError('الرجاء اختيار ملف CSV أو XLSX');
            return;
        }

        setFile(selectedFile);
        setError('');
        parseFile(selectedFile);
    };

    const parseFile = (file) => {
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'csv') {
            Papa.parse(file, {
                header: true,
                encoding: 'UTF-8',
                skipEmptyLines: true,
                complete: (results) => {
                    processData(results.data);
                },
                error: (err) => {
                    setError(`خطأ في قراءة الملف: ${err.message}`);
                }
            });
        } else {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
                    processData(json);
                } catch (err) {
                    setError(`خطأ في قراءة الملف: ${err.message}`);
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const normalizeArabicLetter = (letter) => {
        if (!letter) return '';
        // Normalize: أ/إ/آ → ا
        return letter.trim()
            .replace(/[أإآ]/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه');
    };

    const validateRow = (row, index) => {
        const errors = [];
        const normalized = {
            letter: row.letter?.toString().trim() || '',
            question: row.question?.toString().trim() || '',
            answer: row.answer?.toString().trim() || '',
            category: row.category?.toString().trim() || null,
            difficulty: row.difficulty?.toString().trim().toLowerCase() || null,
            choices: row.choices?.toString().trim() || null,
            correct_choice: row.correct_choice?.toString().trim() || null,
            source: row.source?.toString().trim() || null,
            tags: row.tags?.toString().trim() || null,
            rowIndex: index + 1
        };

        // Required fields
        if (!normalized.letter) {
            errors.push('الحرف مطلوب');
        } else if (normalized.letter.length !== 1) {
            errors.push('الحرف يجب أن يكون حرفاً واحداً فقط');
        } else if (!/[\u0600-\u06FF]/.test(normalized.letter)) {
            errors.push('الحرف يجب أن يكون حرفاً عربياً');
        }

        if (!normalized.question) {
            errors.push('السؤال مطلوب');
        }

        if (!normalized.answer) {
            errors.push('الجواب مطلوب');
        }

        // Normalize letter
        if (normalized.letter) {
            normalized.letter = normalizeArabicLetter(normalized.letter);
        }

        // Difficulty mapping
        if (normalized.difficulty) {
            const mapped = DIFFICULTY_MAP[normalized.difficulty];
            if (!mapped) {
                errors.push('الصعوبة يجب أن تكون: سهل/متوسط/صعب أو easy/medium/hard');
            } else {
                normalized.difficulty = mapped;
            }
        }

        // Choices validation
        if (normalized.choices || normalized.correct_choice) {
            if (!normalized.choices) {
                errors.push('إذا كان correct_choice موجود، يجب أن تكون choices موجودة');
            }
            if (!normalized.correct_choice) {
                errors.push('إذا كانت choices موجودة، يجب أن يكون correct_choice موجود');
            }

            if (normalized.choices && normalized.correct_choice) {
                const choicesList = normalized.choices.split('|').map(c => c.trim());
                const choiceIndex = ['A', 'B', 'C', 'D'].indexOf(normalized.correct_choice.toUpperCase());
                const choiceNumber = parseInt(normalized.correct_choice);

                if (choiceIndex === -1 && (isNaN(choiceNumber) || choiceNumber < 1 || choiceNumber > choicesList.length)) {
                    errors.push('الجواب الصحيح يجب أن يكون A/B/C/D أو رقم من 1-4');
                }
            }
        }

        return {
            ...normalized,
            errors,
            isValid: errors.length === 0
        };
    };

    const processData = (data) => {
        const processed = data.map((row, index) => validateRow(row, index));

        // Check for duplicates within file
        const seen = new Set();
        processed.forEach(row => {
            if (row.isValid) {
                const key = `${row.letter}:${row.question}`;
                if (seen.has(key)) {
                    row.errors.push('سؤال مكرر في الملف');
                    row.isValid = false;
                } else {
                    seen.add(key);
                }
            }
        });

        const valid = processed.filter(r => r.isValid);
        const invalid = processed.filter(r => !r.isValid);

        setParsedData(processed);
        setValidRows(valid);
        setInvalidRows(invalid);
        setStep('preview');
    };

    const handleImport = async () => {
        setStep('importing');
        setProgress(0);

        const CHUNK_SIZE = 200;
        const chunks = [];
        for (let i = 0; i < validRows.length; i += CHUNK_SIZE) {
            chunks.push(validRows.slice(i, i + CHUNK_SIZE));
        }

        let inserted = 0;
        let updated = 0;
        let failed = 0;
        const failedRows = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const questions = chunk.map(row => ({
                letter: row.letter,
                question: row.question,
                answer: row.answer
            }));

            try {
                if (mode === 'add') {
                    const { data, error } = await supabase
                        .from('questions')
                        .insert(questions)
                        .select();

                    if (error) {
                        console.error('Insert error:', error);
                        failedRows.push(...chunk.map(r => ({ ...r, error: error.message })));
                        failed += chunk.length;
                    } else {
                        inserted += data.length;
                    }
                } else {
                    // Upsert mode
                    const { data, error } = await supabase
                        .from('questions')
                        .upsert(questions, { onConflict: 'letter,question' })
                        .select();

                    if (error) {
                        console.error('Upsert error:', error);
                        failedRows.push(...chunk.map(r => ({ ...r, error: error.message })));
                        failed += chunk.length;
                    } else {
                        // Upsert doesn't tell us how many were inserted vs updated
                        // So we count all as "inserted/updated"
                        inserted += data.length;
                    }
                }
            } catch (err) {
                console.error('Chunk error:', err);
                failedRows.push(...chunk.map(r => ({ ...r, error: err.message })));
                failed += chunk.length;
            }

            setProgress(Math.round(((i + 1) / chunks.length) * 100));
        }

        setImportReport({
            total: validRows.length,
            inserted,
            updated,
            failed,
            failedRows
        });

        setStep('done');
        if (onSuccess) onSuccess();
    };

    const downloadTemplate = (format) => {
        const templateData = [
            {
                letter: 'أ',
                question: 'ما هو أول حرف في الأبجدية العربية؟',
                answer: 'ألف',
                category: 'لغة',
                difficulty: 'سهل',
                choices: 'ألف|باء|تاء|ثاء',
                correct_choice: 'A',
                source: 'كتاب اللغة',
                tags: 'حروف,أساسيات'
            }
        ];

        if (format === 'csv') {
            const csv = Papa.unparse(templateData, { encoding: 'UTF-8' });
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'questions_template.csv';
            link.click();
        } else {
            const ws = XLSX.utils.json_to_sheet(templateData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Questions');
            XLSX.writeFile(wb, 'questions_template.xlsx');
        }
    };

    const handleClose = () => {
        setFile(null);
        setParsedData([]);
        setValidRows([]);
        setInvalidRows([]);
        setStep('upload');
        setProgress(0);
        setImportReport(null);
        setError('');
        onClose();
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 9999,
            padding: 20
        }}>
            <div style={{
                width: 'min(900px, 100%)',
                maxHeight: '90vh',
                background: '#1a1a1a',
                borderRadius: 16,
                border: '1px solid #333',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px',
                    borderBottom: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>استيراد الأسئلة</h2>
                    <button
                        onClick={handleClose}
                        style={{
                            padding: '8px 12px',
                            background: '#333',
                            border: 'none',
                            borderRadius: 6,
                            color: '#eee',
                            cursor: 'pointer',
                            fontSize: 18
                        }}
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
                    {/* Error Display */}
                    {error && (
                        <div style={{
                            padding: '12px 16px',
                            background: '#dc2626',
                            color: '#fff',
                            borderRadius: 8,
                            marginBottom: 16,
                            fontSize: 14
                        }}>
                            {error}
                        </div>
                    )}

                    {step === 'upload' && (
                        <div>
                            {/* Download Templates */}
                            <div style={{
                                padding: 16,
                                background: '#111',
                                borderRadius: 8,
                                marginBottom: 24
                            }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>تحميل القالب</h3>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={() => downloadTemplate('csv')}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#2b2b2b',
                                            color: '#6ee7b7',
                                            border: '1px solid #6ee7b7',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            fontWeight: 600
                                        }}
                                    >
                                        📄 تحميل CSV
                                    </button>
                                    <button
                                        onClick={() => downloadTemplate('xlsx')}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#2b2b2b',
                                            color: '#6ee7b7',
                                            border: '1px solid #6ee7b7',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            fontWeight: 600
                                        }}
                                    >
                                        📊 تحميل XLSX
                                    </button>
                                </div>
                            </div>

                            {/* Upload */}
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>رفع الملف</h3>
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
                                    onChange={handleFileChange}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: 12,
                                        background: '#111',
                                        border: '2px dashed #6ee7b7',
                                        borderRadius: 8,
                                        color: '#eee',
                                        cursor: 'pointer',
                                        fontSize: 14
                                    }}
                                />
                                <p style={{ fontSize: 13, opacity: 0.6, marginTop: 8 }}>
                                    الصيغ المدعومة: CSV (UTF-8), XLSX, XLS
                                </p>
                            </div>

                            {/* Column Info */}
                            <div style={{
                                marginTop: 24,
                                padding: 16,
                                background: '#111',
                                borderRadius: 8,
                                fontSize: 13
                            }}>
                                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>الأعمدة المطلوبة:</h4>
                                <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                                    <li><strong>letter</strong> - الحرف (مطلوب)</li>
                                    <li><strong>question</strong> - السؤال (مطلوب)</li>
                                    <li><strong>answer</strong> - الجواب (مطلوب)</li>
                                </ul>
                                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, marginTop: 16 }}>الأعمدة الاختيارية:</h4>
                                <ul style={{ margin: '8px 0', paddingRight: 20 }}>
                                    <li><strong>category</strong> - التصنيف</li>
                                    <li><strong>difficulty</strong> - الصعوبة (سهل/متوسط/صعب)</li>
                                    <li><strong>choices</strong> - الخيارات (مفصولة بـ |)</li>
                                    <li><strong>correct_choice</strong> - الجواب الصحيح (A/B/C/D أو 1-4)</li>
                                    <li><strong>source</strong> - المصدر</li>
                                    <li><strong>tags</strong> - الوسوم (مفصولة بـ ,)</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
                                <div style={{ padding: 16, background: '#111', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: '#6ee7b7' }}>{validRows.length}</div>
                                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>صالح</div>
                                </div>
                                <div style={{ padding: 16, background: '#111', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>{invalidRows.length}</div>
                                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>خطأ</div>
                                </div>
                                <div style={{ padding: 16, background: '#111', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700 }}>{parsedData.length}</div>
                                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>إجمالي</div>
                                </div>
                            </div>

                            {/* Mode Selection */}
                            <div style={{ marginBottom: 24, padding: 16, background: '#111', borderRadius: 8 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>وضع الاستيراد</h3>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button
                                        onClick={() => setMode('add')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            background: mode === 'add' ? '#6ee7b7' : '#2b2b2b',
                                            color: mode === 'add' ? '#111' : '#eee',
                                            border: mode === 'add' ? 'none' : '1px solid #333',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            fontWeight: 600
                                        }}
                                    >
                                        إضافة فقط
                                    </button>
                                    <button
                                        onClick={() => setMode('upsert')}
                                        style={{
                                            flex: 1,
                                            padding: '10px 16px',
                                            background: mode === 'upsert' ? '#6ee7b7' : '#2b2b2b',
                                            color: mode === 'upsert' ? '#111' : '#eee',
                                            border: mode === 'upsert' ? 'none' : '1px solid #333',
                                            borderRadius: 6,
                                            cursor: 'pointer',
                                            fontSize: 14,
                                            fontWeight: 600
                                        }}
                                    >
                                        إضافة/تحديث (Upsert)
                                    </button>
                                </div>
                                <p style={{ fontSize: 12, opacity: 0.6, marginTop: 8 }}>
                                    {mode === 'add'
                                        ? 'سيتم إضافة الأسئلة الجديدة فقط. الأسئلة المكررة ستفشل.'
                                        : 'سيتم إضافة الأسئلة الجديدة وتحديث الموجودة (حسب letter + question).'}
                                </p>
                            </div>

                            {/* Preview Table */}
                            <div>
                                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
                                    معاينة (أول 20 صف)
                                </h3>
                                <div style={{ maxHeight: 400, overflow: 'auto', border: '1px solid #333', borderRadius: 8 }}>
                                    <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                                        <thead style={{ position: 'sticky', top: 0, background: '#2b2b2b' }}>
                                            <tr>
                                                <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #333' }}>#</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #333' }}>الحرف</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #333' }}>السؤال</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #333' }}>الجواب</th>
                                                <th style={{ padding: '10px 12px', textAlign: 'right', borderBottom: '1px solid #333' }}>الحالة</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.slice(0, 20).map((row, i) => (
                                                <tr key={i} style={{ background: row.isValid ? 'transparent' : 'rgba(220, 38, 38, 0.1)' }}>
                                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>{row.rowIndex}</td>
                                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>{row.letter}</td>
                                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #333', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {row.question}
                                                    </td>
                                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #333', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {row.answer}
                                                    </td>
                                                    <td style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>
                                                        {row.isValid ? (
                                                            <span style={{ color: '#6ee7b7' }}>✓</span>
                                                        ) : (
                                                            <span style={{ color: '#dc2626', fontSize: 11 }}>
                                                                {row.errors.join(', ')}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'importing' && (
                        <div style={{ textAlign: 'center', padding: 40 }}>
                            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
                            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>جارٍ الاستيراد...</h3>
                            <div style={{
                                width: '100%',
                                height: 8,
                                background: '#333',
                                borderRadius: 4,
                                overflow: 'hidden',
                                marginBottom: 8
                            }}>
                                <div style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: '#6ee7b7',
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                            <div style={{ fontSize: 14, opacity: 0.7 }}>{progress}%</div>
                        </div>
                    )}

                    {step === 'done' && importReport && (
                        <div>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                                <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>اكتمل الاستيراد</h3>
                            </div>

                            {/* Report Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
                                <div style={{ padding: 16, background: '#111', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: '#6ee7b7' }}>{importReport.inserted}</div>
                                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>نجح</div>
                                </div>
                                <div style={{ padding: 16, background: '#111', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>{importReport.failed}</div>
                                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>فشل</div>
                                </div>
                                <div style={{ padding: 16, background: '#111', borderRadius: 8, textAlign: 'center' }}>
                                    <div style={{ fontSize: 28, fontWeight: 700 }}>{importReport.total}</div>
                                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>إجمالي</div>
                                </div>
                            </div>

                            {/* Failed Rows */}
                            {importReport.failedRows.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: '#dc2626' }}>
                                        الصفوف الفاشلة ({importReport.failedRows.length})
                                    </h4>
                                    <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #333', borderRadius: 8 }}>
                                        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                                            <thead style={{ position: 'sticky', top: 0, background: '#2b2b2b' }}>
                                                <tr>
                                                    <th style={{ padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid #333' }}>#</th>
                                                    <th style={{ padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid #333' }}>السؤال</th>
                                                    <th style={{ padding: '8px 10px', textAlign: 'right', borderBottom: '1px solid #333' }}>السبب</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importReport.failedRows.map((row, i) => (
                                                    <tr key={i}>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #333' }}>{row.rowIndex}</td>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #333', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {row.question}
                                                        </td>
                                                        <td style={{ padding: '8px 10px', borderBottom: '1px solid #333', color: '#dc2626' }}>
                                                            {row.error}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #333',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12
                }}>
                    {step === 'preview' && (
                        <>
                            <button
                                onClick={() => setStep('upload')}
                                style={{
                                    padding: '10px 20px',
                                    background: '#333',
                                    color: '#eee',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 14
                                }}
                            >
                                رجوع
                            </button>
                            <button
                                onClick={handleImport}
                                disabled={validRows.length === 0}
                                style={{
                                    padding: '10px 20px',
                                    background: validRows.length > 0 ? '#6ee7b7' : '#333',
                                    color: validRows.length > 0 ? '#111' : '#666',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: validRows.length > 0 ? 'pointer' : 'not-allowed',
                                    fontSize: 14,
                                    fontWeight: 600
                                }}
                            >
                                استيراد {validRows.length} سؤال
                            </button>
                        </>
                    )}
                    {step === 'done' && (
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '10px 20px',
                                background: '#6ee7b7',
                                color: '#111',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 600
                            }}
                        >
                            إغلاق
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
