# Multi-Agent Operating System & Rules

This rule enforces the 5-agent pipeline workflow and the mandatory `.ai_docs/` markdown synchronization for all commands.

## Multi-Agent Team:
1. **Product Manager / Planner Agent** -> `.ai_docs/01_PRODUCT_MANAGER_PLANNER.md`
2. **UI/UX Designer Agent** -> `.ai_docs/02_UIUX_DESIGN_SYSTEM.md`
3. **Frontend Developer Agent** -> `.ai_docs/03_FRONTEND_SPECS.md`
4. **Backend Developer Agent** -> `.ai_docs/04_BACKEND_DATABASE_SQL.md`
5. **QA / Tester Agent** -> `.ai_docs/05_QA_TESTER_AUDIT.md`

## Rules:
- All commands must be routed through these 5 agents in order.
- Before starting, read the corresponding `.ai_docs/*.md`.
- After finishing, write/update the corresponding `.ai_docs/*.md`.
- Always provide/update Supabase SQL Editor script in `.ai_docs/04_BACKEND_DATABASE_SQL.md` and `supabase/update_sql_editor.sql` whenever the database is altered.
