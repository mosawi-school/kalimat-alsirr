# CSV/XLSX Import Feature

## Overview
Client-side import functionality for bulk question uploads supporting CSV (UTF-8) and XLSX formats.

## Features Implemented

### A) UI Flow
- ✅ Import button in Questions Library header
- ✅ Modal with multi-step workflow:
  1. **Upload** - File selection with format validation
  2. **Preview** - Display first 20 rows with validation status
  3. **Import** - Progress tracking with batch processing
  4. **Report** - Final counts and error details

### B) File Parsing
- ✅ **CSV**: papaparse library with UTF-8 encoding
- ✅ **XLSX/XLS**: SheetJS (xlsx) library
- ✅ Empty rows automatically skipped
- ✅ Header row detection

### C) Supported Columns

#### Required
- `letter` - Single Arabic character
- `question` - Question text
- `answer` - Answer text

#### Optional
- `category` - Question category
- `difficulty` - Easy/Medium/Hard (سهل/متوسط/صعب)
- `choices` - Multiple choices (A|B|C|D format)
- `correct_choice` - Correct answer (A/B/C/D or 1-4)
- `source` - Question source
- `tags` - Comma-separated tags

### D) Validation & Normalization

✅ **Implemented:**
- Trim whitespace from all fields
- Single Arabic letter validation for `letter` field
- Arabic normalization: أ/إ/آ → ا, ى → ي, ة → ه
- Required field validation (letter, question, answer)
- Difficulty mapping: سهل→easy, متوسط→medium, صعب→hard
- Choices/correct_choice cross-validation
- Duplicate detection within file (letter + question)

### E) Supabase Operations

✅ **Add Mode:**
- Insert new questions only
- Duplicates will fail

✅ **Upsert Mode:**
- Insert new questions
- Update existing questions (matched by letter + question)
- Uses `{ onConflict: 'letter,question' }`

✅ **Performance:**
- Batch processing: 200 questions per chunk
- Progress tracking with percentage display
- Graceful error handling per chunk

✅ **Reporting:**
- Total processed count
- Success count
- Failed count
- Detailed error list with row numbers

### F) Templates

✅ **Download Options:**
- CSV template with UTF-8 BOM
- XLSX template
- Includes sample row with all columns

### G) Database Constraint

**Required SQL Migration:**
```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_questions_letter_question 
ON questions(letter, question);
```

**Location:** `migrations/add-questions-unique-constraint.sql`

**Action Required:** Run this SQL in Supabase SQL Editor before using upsert mode.

## Usage

1. Click "استيراد CSV/XLSX" button in Questions Library
2. Download template (optional)
3. Upload your CSV/XLSX file
4. Review preview and validation errors
5. Select mode (Add only / Upsert)
6. Click import and monitor progress
7. Review final report

## Security Notes

⚠️ **Current Setup:** Questions table has RLS disabled for MVP.

⚠️ **Production TODO:** 
- Enable RLS on questions table
- Add proper authentication checks
- Limit import to authenticated admins only
- Consider rate limiting for large imports

## Files Modified

- [`src/components/ImportQuestionsModal.jsx`](file:///C:/Users/abdullah/Desktop/kalimat-alsirr/kalimat-alsirr/src/components/ImportQuestionsModal.jsx) - Main modal component
- [`src/pages/QuestionsPage.jsx`](file:///C:/Users/abdullah/Desktop/kalimat-alsirr/kalimat-alsirr/src/pages/QuestionsPage.jsx) - Added import button and modal integration
- [`migrations/add-questions-unique-constraint.sql`](file:///C:/Users/abdullah/Desktop/kalimat-alsirr/kalimat-alsirr/migrations/add-questions-unique-constraint.sql) - Database constraint

## Dependencies Added

```json
{
  "papaparse": "^5.x.x",
  "xlsx": "^0.18.x"
}
```
