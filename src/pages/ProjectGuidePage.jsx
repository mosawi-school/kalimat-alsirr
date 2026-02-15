import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

export default function ProjectGuidePage() {
    const [activeSection, setActiveSection] = useState('all');

    const contractText = `# 🔐 KALIMAT AL-SIRR – AGENT EXECUTION CONTRACT

This is a binding execution contract.
You MUST obey it strictly.
No assumptions.
No architecture changes.
No creative restructuring.

Violation of this contract is considered a system failure.

------------------------------------------------------------
SECTION 1 — AUTHORITY

This document is the single source of truth.

You must:

1) Create internal page:
   /admin/project-guide
2) Render this contract inside it (read-only).
3) Always refer back to it before any new implementation.
4) If conflict occurs → this document overrides everything.

------------------------------------------------------------
SECTION 2 — ARCHITECTURE LOCK (DO NOT MODIFY)

Stack is locked:

- React + Vite
- Supabase
- GitHub Pages
- HashRouter ONLY

You are NOT allowed to:

- Change routing system
- Change folder structure
- Introduce new global state libraries
- Replace Supabase
- Add heavy external dependencies
- Refactor working components
- Rename database tables
- Modify schema without explicit approval

If improvement requires restructuring → STOP and ask.

------------------------------------------------------------
SECTION 3 — DATABASE IMMUTABILITY

Locked tables:

- seasons
- questions
- matches
- match_questions
- season_used_questions

Rules:

• Do NOT drop tables
• Do NOT rename columns
• Do NOT change relationships
• Do NOT introduce migrations unless critical and approved

Question lock rule:
A question is blocked ONLY after:
- Match is LIVE
- Answer revealed
- Match ended (commit)

Never block earlier.

------------------------------------------------------------
SECTION 4 — DEVELOPMENT MODE

Developer level: Beginner.

You MUST:
- Provide minimal-step solutions
- Avoid overwhelming changes
- Avoid rewriting large files
- Modify only what is necessary
- Keep changes localized

You MUST NOT:
- Refactor entire pages
- Replace logic that works
- Optimize prematurely
- Introduce abstraction layers

------------------------------------------------------------
SECTION 5 — PHASE DISCIPLINE (STRICT)

You may only work inside ONE phase at a time.

Before implementing anything:
1) State current phase.
2) Confirm scope.
3) Implement only that scope.
4) Stop.

Never mix phases.
Never jump ahead.
Never partially implement future systems.

Roadmap:

PHASE 4 → Core Logic Completion
PHASE 5 → Scoring Engine
PHASE 6 → Cards System
PHASE 7 → Realtime Sync
PHASE 8 → Polish & Production

------------------------------------------------------------
SECTION 6 — GAME RULES (NON-NEGOTIABLE)

• 3 free letter picks
• After that: -1 per letter
• Correct letter:
  - Reveal all positions
  - +1 only once
  - Trigger mandatory question
• Wrong letter:
  - Switch turn immediately

• Timer runs continuously
• End game → Reveal Secret Word button
• Tie → solving team +1

These rules cannot be changed.

------------------------------------------------------------
SECTION 7 — STABILITY PRIORITY

Priority order:

1) Stability
2) Data integrity
3) Game logic correctness
4) UI improvements

Never sacrifice stability for design.

------------------------------------------------------------
SECTION 8 — FAILURE PROTOCOL

If uncertain:
- STOP
- Ask for clarification
- Do NOT guess
- Do NOT improvise

If system becomes inconsistent:
- Roll back change
- Return to last stable state

------------------------------------------------------------
SECTION 9 — PROJECT AUDIT REQUIREMENT (MANDATORY)

Before continuing any new development, you MUST:

1) Scan the entire project codebase.
2) Analyze actual implemented logic (not documentation).
3) Produce a structured audit report containing:

   A) What is fully implemented and working (based on real code).
   B) What is partially implemented.
   C) What is missing compared to this contract.
   D) Architectural weaknesses (if any).
   E) Logical risks or future failure points.
   F) Performance risks.
   G) Suggested clean completion strategy (without breaking constraints).

4) Clearly separate:
   - Objective findings (from code)
   - Your professional opinion

5) Provide an execution recommendation:
   - What should be done next?
   - In what order?
   - What is the safest path to completion?

This audit must be technical, specific, and based on actual project files.

No generic advice.
No assumptions.
Base everything on real implementation.

------------------------------------------------------------
SECTION 10 — AUTHENTICATION & admin_users TABLE (OFFICIAL)

CURRENT STATE (as of 2026-02-12):

• Table 'admin_users' EXISTS in database-schema.sql
• Table 'admin_users' is NOT USED in the application code
• Official authentication method: PIN-based via VITE_ADMIN_PIN + localStorage session
  (Implementation: src/context/AuthContext.jsx)

OFFICIAL DECISION:

• admin_users is RESERVED FOR FUTURE USE
• Do NOT delete admin_users table from schema
• Do NOT modify authentication system without explicit approval
• Do NOT restructure schema because of this table
• Consider admin_users as "dormant but reserved"

RATIONALE:

The table was designed for username/password authentication but the project
currently uses a simpler PIN-based approach. The table remains in schema
for potential future migration to multi-user admin system.

Any changes to authentication or admin_users require explicit user approval.

------------------------------------------------------------

FINAL DIRECTIVE:

You are not here to redesign.
You are here to execute within constraints.

First:
Create /admin/project-guide page.

Second:
Produce full project audit report.

Then wait for instruction.`;

    const sections = [
        { id: 'section1', title: 'لائحة الصلاحيات', number: 1 },
        { id: 'section2', title: 'قفل المعمارية', number: 2 },
        { id: 'section3', title: 'ثبات قاعدة البيانات', number: 3 },
        { id: 'section4', title: 'نمط التطوير', number: 4 },
        { id: 'section5', title: 'انضباط المراحل', number: 5 },
        { id: 'section6', title: 'قواعد اللعبة', number: 6 },
        { id: 'section7', title: 'أولوية الاستقرار', number: 7 },
        { id: 'section8', title: 'بروتوكول الفشل', number: 8 },
        { id: 'section9', title: 'متطلبات المراجعة', number: 9 }
    ];

    return (
        <AdminLayout>
            <div style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '32px 24px',
                color: '#eee'
            }}>
                {/* Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: 40,
                    padding: 24,
                    background: 'linear-gradient(135deg, #1e3a8a, #6366f1)',
                    borderRadius: 12
                }}>
                    <div style={{ fontSize: 48, marginBottom: 12 }}>🔐</div>
                    <h1 style={{
                        fontSize: 32,
                        fontWeight: 900,
                        margin: 0,
                        marginBottom: 8,
                        color: '#fff'
                    }}>
                        دليل المشروع
                    </h1>
                    <div style={{ fontSize: 16, opacity: 0.9, color: '#ddd' }}>
                        عقد تنفيذ كلمة السر - مرجع النظام الوحيد
                    </div>
                </div>

                {/* Section Navigation */}
                <div style={{
                    marginBottom: 32,
                    padding: 20,
                    background: '#111',
                    borderRadius: 12,
                    border: '1px solid #333'
                }}>
                    <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 12,
                        opacity: 0.7
                    }}>
                        الانتقال السريع:
                    </div>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        direction: 'rtl'
                    }}>
                        <button
                            onClick={() => setActiveSection('all')}
                            style={{
                                padding: '8px 16px',
                                background: activeSection === 'all' ? '#6ee7b7' : '#2b2b2b',
                                color: activeSection === 'all' ? '#111' : '#eee',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontSize: 13,
                                fontWeight: 600
                            }}
                        >
                            عرض الكل
                        </button>
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                style={{
                                    padding: '8px 16px',
                                    background: activeSection === section.id ? '#6ee7b7' : '#2b2b2b',
                                    color: activeSection === section.id ? '#111' : '#eee',
                                    border: 'none',
                                    borderRadius: 6,
                                    cursor: 'pointer',
                                    fontSize: 13,
                                    fontWeight: 600
                                }}
                            >
                                {section.number}. {section.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contract Content */}
                <div style={{
                    padding: 32,
                    background: '#111',
                    borderRadius: 12,
                    border: '2px solid #dc2626',
                    fontFamily: 'monospace'
                }}>
                    <div style={{
                        padding: 12,
                        background: '#dc2626',
                        color: '#fff',
                        borderRadius: 6,
                        marginBottom: 24,
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: 'center'
                    }}>
                        ⚠️ وثيقة للقراءة فقط - لا يمكن التعديل عليها
                    </div>

                    <pre style={{
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        fontSize: 14,
                        lineHeight: 1.8,
                        color: '#eee',
                        margin: 0,
                        fontFamily: 'monospace'
                    }}>
                        {contractText}
                    </pre>
                </div>

                {/* Footer */}
                <div style={{
                    marginTop: 32,
                    padding: 20,
                    background: '#111',
                    borderRadius: 12,
                    textAlign: 'center',
                    fontSize: 13,
                    opacity: 0.7
                }}>
                    <div style={{ marginBottom: 8 }}>
                        📅 آخر تحديث: {new Date().toLocaleDateString('ar-SA')}
                    </div>
                    <div>
                        مشروع كلمة السر © 2026
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
