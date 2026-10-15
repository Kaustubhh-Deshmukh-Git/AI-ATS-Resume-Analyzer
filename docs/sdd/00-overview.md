# SDD 00 — Overview
| Field | Value |
|---|---|
| Project | Resume ATS Analyzer (ResumeIQ) |
| Version | 1.0.0 (draft) |
| Author | Kaustubh |
| Date | 2026-10-15 |
| Status | Approved for implementation |

## Problem
Applicants are filtered by Applicant Tracking Systems before a human reads their resume. Existing tools (Jobscan, Resume Worded, etc.) are paywalled or opaque. Students need a free, explainable analyzer.

## Goals
G1 Explainable ATS score against a pasted JD · G2 AI suggestions (missing skills, tips, bullet rewrites) · G3 Secure accounts and private history · G4 Graceful degradation when AI is down.

## Non-goals (v1)
DOCX parsing, OCR for scanned PDFs, resume builder/editor, payments, multi-tenant orgs, real ATS vendor emulation.

## Personas
- **Student/fresher (primary):** one resume, many JDs, wants fast actionable gaps.
- **Career switcher:** needs missing-skill identification.

## Success metrics
Analysis p95 latency < 12s (incl. AI) · parse success on text PDFs ≥ 98% · zero plaintext secrets/passwords · ≥80% server test coverage.

## Glossary
ATS, JD, JWT, taxonomy (curated skills list), degraded mode (score without AI).
