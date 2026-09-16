# Knowledge Atlas maintenance

- Record knowledge beginning September 2026. Do not invent or backfill older learning history.
- Exclude STAT4205 unless the owner explicitly changes this decision.
- Use knowledge concepts as the primary units. No lecture pages, assignment management, grading information, or duplicated course repositories.
- Keep five domains; cross-domain concepts have one canonical record and secondary domain tags.
- Keep course and self-study sources distinct from domains and mastery.
- Never infer mastery or completed learning from a syllabus, date, repository existence, or generated summary. Preserve unassessed mastery unless the owner confirms it.
- Source records link to existing course repositories. Do not copy private PDFs, slides, assignments, answers, tokens, enrollment codes, or personal scheduling/grades into this repository.
- After content changes run `pnpm check`. Run `pnpm build` after application changes.
- Preserve the package manager and Sites project ID. The main public deployment target is GitHub Pages; preserve the configured project base path there.

- Keep concepts and sources as independent JSON records in `content/concepts/` and `content/sources/`. Never edit or commit `.generated/`.
- Reuse an existing concept when a new source covers it. Keep source types, terms, and counts data-driven.
- Run `pnpm test` after catalog, schema, or creation-command changes.
