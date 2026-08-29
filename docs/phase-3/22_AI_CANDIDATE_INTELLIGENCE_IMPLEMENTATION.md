# Stage 8C: AI Candidate Intelligence Integration

## 1. Executive Summary
Stage 8C integrates verified AI candidate capabilities into the existing Candidates workflow of HireStack ATS. Utilizing the reusable AI foundation established in Stage 8B, this stage provides ATS Candidate Scoring, General and Role-Targeted Resume Recommendations, and Recruiter AI Insights directly within Candidate Detail views, as well as AI Resume Parsing within the Candidate creation workflow. All AI capabilities are non-destructive, strictly advisory, and require explicit user action.

---

## 2. Stage Scope
- **Candidate Detail Page (`/app/candidates/:candidateId`)**: Integrated `CandidateAiSection` containing ATS Compatibility Score, Resume Recommendations, and Recruiter AI Insights.
- **Candidates List Page (`/app/candidates`)**: Integrated `ResumeUploadParserModal` triggered via "Import / Parse Resume" button.
- **Exclusions**: Job Applicant Matching and Interview Assistant remain deferred to subsequent stages. Job Description AI, Offer AI, and Pipeline AI are not implemented as they do not exist in the backend.

---

## 3. AI Capabilities Integrated
1. **Resume Parsing (`POST /v1/ai/resume/parse`)**: PDF resume extraction creating structured candidate profiles.
2. **ATS Candidate Scoring (`POST /v1/ai/ats-score`)**: 6-factor candidate qualification and keyword evaluation against a selected job requisition.
3. **Resume Recommendations (`POST /v1/ai/resume-recommendations` & `POST /v1/ai/resume-recommendations/job`)**: Actionable recommendations for resume improvement in general or role-specific mode, with audit history.
4. **Recruiter AI Insights (`POST /v1/ai/insights`)**: Holistic candidate evaluation covering hiring confidence, core strengths, hiring risks, and recruiter focus probes.

---

## 4. Candidate AI Architecture
```
frontend/src/features/candidates/
├── components/
│   ├── CandidateAiSection.tsx          # Unifying tabbed container for Candidate Detail
│   ├── CandidateAtsScore.tsx           # Job selection + ATS scoring trigger + AtsScoreCard
│   ├── CandidateResumeRecommendations.tsx # General/Job modes + history + ResumeRecommendationList
│   ├── CandidateAiInsights.tsx         # Job selection + history + AiInsightSummaryCard
│   ├── CandidateSummary.tsx            # Existing profile summary
│   ├── CandidateNotes.tsx              # Existing notes manager
│   ├── CandidateTags.tsx               # Existing tags manager
│   └── CandidateResume.tsx             # Existing resume documents viewer
└── pages/
    ├── CandidateDetailPage.tsx         # Composes existing sections + CandidateAiSection
    └── CandidatesPage.tsx              # Candidates list + Resume parser modal trigger
```

---

## 5. ATS Scoring
- **Workflow**: Recruiter navigates to Candidate Detail $\rightarrow$ opens "ATS Compatibility Score" tab $\rightarrow$ selects target job requisition from active open jobs $\rightarrow$ clicks "Calculate ATS Score".
- **Presentation**: Renders `AtsScoreCard` displaying overall compatibility percentage, 5 dimension meters (Skills, Experience, Education, Keywords, Certifications), strengths, missing required skills, and advisory hiring recommendation.
- **Explicit Trigger**: Scoring is never automatically invoked on page load.

---

## 6. Resume Parsing
- **Workflow**: Recruiter on Candidates list page clicks "Import / Parse Resume" $\rightarrow$ `ResumeUploadParserModal` opens $\rightarrow$ PDF file validation (max 10MB) $\rightarrow$ multi-part form upload $\rightarrow$ candidate profile creation $\rightarrow$ navigation to new candidate profile.
- **Transparency**: Clear modal messaging informs the user that parsing creates a new candidate record in the workspace.

---

## 7. Resume Recommendations
- **Modes**:
  - **General Resume Review**: Analyzes structure, phrasing, impact metrics, and clarity without requiring a job context.
  - **Role-Targeted Optimization**: Evaluates candidate credentials against a selected job requisition, highlighting qualification gaps and missing domain keywords.
- **Audit History**: Displays historical reviews generated for the candidate, enabling recruiters to review past optimizations without re-triggering inference.

---

## 8. Recruiter Insights
- **Workflow**: Recruiter selects a target requisition and clicks "Generate Recruiter Insights".
- **Presentation**: Renders `AiInsightSummaryCard` displaying executive summary, hiring confidence score (0–100%), core strengths, hiring risks and caveats, recruiter follow-up areas, and skill gaps.
- **History**: Previous insight evaluations are cached and selectable via quick-pick buttons.

---

## 9. API Integration
Reuses `aiService` in `src/features/ai/services/ai.service.ts`:
- `aiService.parseResume(file)`
- `aiService.createAtsScore(input)`
- `aiService.createResumeRecommendations(input)`
- `aiService.createJobResumeRecommendations(input)`
- `aiService.getResumeRecommendationHistory(candidateId)`
- `aiService.getResumeRecommendation(id)`
- `aiService.createAiInsights(input)`
- `aiService.getAiInsightHistory(candidateId)`
- `aiService.getAiInsight(id)`

---

## 10. React Query Integration
Hooks utilized:
- `useAtsScore`
- `useCreateResumeRecommendations`, `useCreateJobResumeRecommendations`, `useResumeRecommendationHistory`, `useResumeRecommendation`
- `useCreateAiInsights`, `useAiInsightHistory`, `useAiInsight`
- `useJobs` (for requisition selectors)
- `useParseResume` (for resume upload)

---

## 11. Cache Strategy
Targeted cache invalidation ensures fresh data:
- Parsing resumes invalidates `['candidates']`.
- ATS scoring invalidates `aiKeys.jobMatches(jobId)` and `aiKeys.jobMatchDetail(jobId, candidateId)`.
- Resume recommendations invalidate `aiKeys.resumeRecommendationHistory(candidateId)`.
- AI insights invalidate `aiKeys.insightHistory(candidateId)`.
- Requisition list queries are cached for 30s.

---

## 12. RBAC
- `COMPANY_ADMIN` & `RECRUITER`: Full access to ATS scoring, resume recommendations, recruiter insights, and resume parsing.
- `CANDIDATE`: Restricted strictly to Resume Recommendations for their own profile. ATS scoring and Recruiter Insights tabs are not rendered.
- `SUPER_ADMIN`: Forbidden from tenant AI endpoints (`CandidateAiSection` renders null).

---

## 13. Tenant Isolation
Tenant scoping is derived strictly from verified JWT tokens on the backend. No tenant or company IDs are passed in client parameters.

---

## 14. Privacy
- No candidate resume text, PII, or LLM prompts are stored in `localStorage`, `sessionStorage`, or URL search parameters.
- Console logging of resume content is strictly avoided.

---

## 15. AI Trust Model
- Every AI section incorporates `AiBadge` and `AiDisclaimer`.
- Output is explicitly designated as **advisory decision support**.
- AI evaluations never automatically reject candidates, change stage statuses, or send offers.

---

## 16. Error Handling
- Graceful error display using `AiErrorState`.
- Contextual retry triggers on network or model timeout.
- User-friendly error messaging for 400, 401, 403, 404, 409, 422, and 500 error responses.

---

## 17. Loading States
Informative `AiLoadingState` components with spinners and contextual status descriptions provide clarity during multi-second LLM evaluations.

---

## 18. Responsive Design
All candidate AI controls, tab bars, meters, and recommendation cards adapt cleanly across 320px, 768px, 1024px, and 1280px+ breakpoints with no horizontal layout overflow.

---

## 19. Accessibility
- Semantic `<button>`, `<select>`, and `<table>` elements.
- Accessible ARIA attributes for tabs (`role="tab"`, `role="tabpanel"`, `aria-selected`).
- Visible focus rings and screen-reader-friendly status alerts.

---

## 20. Performance
- No automatic generation on page mount.
- On-demand execution triggered solely by user interaction.
- TanStack Query deduplication and caching.

---

## 21. Testing
Created 5 dedicated test suites in `frontend/tests/candidates/ai/` with 15 tests:
- `CandidateAtsScore.test.tsx`: Empty state, requisition selection, score calculation, loading, error retry, and disclaimer.
- `CandidateResumeRecommendations.test.tsx`: General & role-specific modes, job selection, history switching, and recommendation display.
- `CandidateAiInsights.test.tsx`: Job selection, insight generation, confidence score display, history switching, and error handling.
- `CandidateAiSection.test.tsx`: Tab rendering, tab switching, and role-based access control (Admin, Recruiter, Candidate, Super Admin).
- `CandidateResumeParser.test.tsx`: Candidates list page trigger, PDF upload validation, and profile creation redirect.

---

## 22. Files Created
1. `frontend/src/features/candidates/components/CandidateAtsScore.tsx`
2. `frontend/src/features/candidates/components/CandidateResumeRecommendations.tsx`
3. `frontend/src/features/candidates/components/CandidateAiInsights.tsx`
4. `frontend/src/features/candidates/components/CandidateAiSection.tsx`
5. `frontend/tests/candidates/ai/CandidateAtsScore.test.tsx`
6. `frontend/tests/candidates/ai/CandidateResumeRecommendations.test.tsx`
7. `frontend/tests/candidates/ai/CandidateAiInsights.test.tsx`
8. `frontend/tests/candidates/ai/CandidateAiSection.test.tsx`
9. `frontend/tests/candidates/ai/CandidateResumeParser.test.tsx`
10. `docs/phase-3/22_AI_CANDIDATE_INTELLIGENCE_IMPLEMENTATION.md`

---

## 23. Files Modified
1. `frontend/src/features/candidates/components/index.ts`
2. `frontend/src/features/candidates/pages/CandidateDetailPage.tsx`
3. `frontend/src/features/candidates/pages/CandidatesPage.tsx`

---

## 24. Dependencies
No new dependencies added.

---

## 25. Backend Modification Confirmation
The backend was untouched. No backend files, Prisma models, migrations, routes, or controllers were modified.

---

## 26. Scope Confirmation
Stage 8C implemented only candidate-level AI integration (ATS Scoring, Resume Recommendations, Recruiter Insights, and Resume Parsing) without touching Job Matching, Interview Assistant, or unbacked AI features.
