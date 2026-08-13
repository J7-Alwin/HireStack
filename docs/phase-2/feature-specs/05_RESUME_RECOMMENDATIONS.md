# HireStack AI Resume Recommendations

## Phase 2 – Stage 5

Version: 1.0.0

Status: Planned

---

# 1. Overview

The AI Resume Recommendation Engine analyzes a candidate's resume and provides actionable recommendations to improve resume quality, clarity, relevance, and ATS compatibility.

The feature supports two recommendation modes:

1. **General Resume Review**
2. **Job-Specific Resume Optimization**

General Resume Review evaluates the resume independently of a particular job.

Job-Specific Resume Optimization compares the candidate's resume against a selected job and identifies improvements that can increase relevance and alignment with that job.

The system uses the existing HireStack AI infrastructure and local AI evaluation architecture.

Resume recommendations must be evidence-based and must not invent candidate experience, skills, qualifications, projects, certifications, or achievements.

---

# 2. Objectives

The Resume Recommendation Engine aims to:

- Improve resume quality
- Improve resume readability
- Improve ATS compatibility
- Identify missing or weak resume information
- Provide actionable improvement suggestions
- Improve alignment between a resume and a selected job
- Help candidates present existing qualifications more effectively
- Reuse the existing HireStack AI infrastructure
- Preserve recommendation history

---

# 3. User Roles

## Candidate

Can:

- Generate a general resume review
- Generate job-specific resume recommendations
- View recommendation results
- View previous recommendation results
- Regenerate recommendations

---

## Recruiter

Can:

- View resume recommendation results where permitted by the existing candidate/job access rules
- Generate job-specific recommendations for candidates associated with jobs they are authorized to access
- View recommendation history

---

## Company Admin

Can:

- Generate resume recommendations
- View recommendation results
- View recommendation history

---

# 4. Feature Modes

The Resume Recommendation Engine provides two modes.

## 4.1 General Resume Review

Evaluates the resume without requiring a job.

The review focuses on:

- Resume structure
- Professional summary
- Skills presentation
- Experience descriptions
- Education
- Projects
- Certifications
- Achievements
- Keywords
- ATS compatibility
- Clarity
- Consistency
- Formatting-related content issues

The system provides actionable recommendations based only on information available in the resume.

---

## 4.2 Job-Specific Resume Optimization

Evaluates a resume against a selected job.

The system considers:

- Job title
- Job description
- Job requirements
- Responsibilities
- Required skills
- Experience requirements
- Education requirements
- Relevant projects
- Relevant certifications
- Relevant resume keywords

The system identifies:

- Relevant strengths already present
- Important job requirements represented weakly in the resume
- Missing or insufficiently represented skills
- Missing relevant keywords
- Experience alignment issues
- Areas requiring stronger descriptions
- Sections that could be improved for the selected job

The system must not recommend adding a qualification unless evidence for that qualification exists in the candidate's available information.

---

# 5. Evidence-Based Recommendation Rules

Resume recommendations must be grounded in the candidate's actual information.

The AI must:

- Use only information available in the candidate's resume and associated verified candidate data
- Distinguish between information that exists and information that is missing
- Avoid inventing experience
- Avoid inventing skills
- Avoid inventing certifications
- Avoid inventing projects
- Avoid inventing achievements
- Avoid inventing job titles
- Avoid inventing employers
- Avoid inventing education
- Avoid recommending false claims

If a job requires a skill that is not present in the candidate's available information, the system must identify it as a gap rather than instructing the candidate to falsely claim the skill.

Recommendations should explain **how existing information can be improved or presented more effectively**.

---

# 6. Recommendation Categories

Recommendations may cover the following categories:

## Summary

Suggestions for improving the professional summary.

## Experience

Suggestions for improving experience descriptions, responsibilities, achievements, and measurable impact.

## Skills

Suggestions for better organization and presentation of existing skills.

## Education

Suggestions for improving clarity and completeness of education information.

## Projects

Suggestions for presenting relevant projects more effectively.

## Certifications

Suggestions for improving certification presentation.

## Keywords

Suggestions for relevant keywords based on the candidate's existing information and, when applicable, the selected job.

## ATS Optimization

Suggestions for improving ATS readability and keyword alignment without keyword stuffing or false claims.

## Formatting and Structure

Suggestions for improving resume organization, consistency, clarity, and readability based on the available resume content.

---

# 7. Recommendation Priority

Each recommendation should have a priority.

Supported priorities:

- `HIGH`
- `MEDIUM`
- `LOW`

### HIGH

Important improvement that may significantly affect resume quality, ATS compatibility, or job alignment.

### MEDIUM

Useful improvement that can strengthen the resume.

### LOW

Minor improvement that improves clarity, presentation, or polish.

---

# 8. Recommendation Output

Each recommendation should provide:

- Category
- Priority
- Current issue
- Recommendation
- Reason
- Evidence from the resume when applicable
- Expected improvement

For job-specific recommendations, the output should additionally identify the relevant job requirement or job area connected to the recommendation.

Recommendations must be actionable and understandable to the user.

---

# 9. General Review Requirements

A general resume review should evaluate the resume as a standalone document.

The system should identify:

- Strong areas
- Weak areas
- Missing information
- Content clarity issues
- Structural issues
- ATS-related issues
- Keyword issues
- Improvement opportunities

The system should provide practical recommendations rather than rewriting the entire resume automatically.

---

# 10. Job-Specific Review Requirements

A job-specific review must compare the candidate's resume with the selected job.

The system should evaluate:

- Skill alignment
- Experience alignment
- Education alignment
- Project relevance
- Certification relevance
- Keyword alignment
- Requirement coverage
- Responsibility alignment

The system should identify:

- Strong matches
- Weak matches
- Missing requirements
- Missing keywords
- Areas where existing experience should be emphasized
- Areas where the resume should be clarified

The recommendation engine must not treat a missing keyword as proof that the candidate lacks the underlying skill.

A keyword gap should be presented as a resume representation issue unless the candidate information confirms that the skill itself is missing.
# 11. API Specification

The Resume Recommendation Engine shall expose APIs through the existing AI module.

All endpoints must follow the existing HireStack API conventions for:

- Authentication
- Authorization
- Request validation
- Response formatting
- Error handling
- HTTP status codes

---

## 11.1 Generate General Resume Recommendations

### Method

POST

### Endpoint

/api/v1/ai/resume-recommendations

### Purpose

Generate a general review of a candidate's resume without comparing it against a specific job.

### Request

{
  "candidateId": "candidate_123"
}

### Response

{
  "candidateId": "candidate_123",
  "mode": "GENERAL",
  "overallSummary": "The resume has a strong technical foundation but can be improved in experience descriptions and ATS keyword usage.",
  "recommendations": [
    {
      "category": "EXPERIENCE",
      "priority": "HIGH",
      "currentIssue": "Experience descriptions focus mainly on responsibilities.",
      "recommendation": "Highlight measurable outcomes and technical contributions where the candidate has evidence for them.",
      "reason": "Achievement-oriented descriptions make experience easier to understand.",
      "evidence": "Backend development responsibilities are listed without measurable outcomes.",
      "expectedImprovement": "Improves clarity and communicates professional impact more effectively."
    }
  ]
}

---

## 11.2 Generate Job-Specific Resume Recommendations

### Method

POST

### Endpoint

/api/v1/ai/resume-recommendations/job

### Purpose

Compare a candidate's resume against a selected job and generate targeted recommendations.

### Request

{
  "candidateId": "candidate_123",
  "jobId": "job_123"
}

### Response

{
  "candidateId": "candidate_123",
  "jobId": "job_123",
  "mode": "JOB_SPECIFIC",
  "overallSummary": "The resume aligns well with the backend development requirements but should better emphasize TypeScript and API development experience.",
  "recommendations": [
    {
      "category": "KEYWORDS",
      "priority": "HIGH",
      "currentIssue": "The resume does not clearly present terminology used in the selected job.",
      "recommendation": "Where the candidate has genuine experience, make relevant API and TypeScript experience more explicit.",
      "reason": "Clear representation can improve alignment with the job requirements.",
      "evidence": "Existing backend project experience is present in the candidate information.",
      "expectedImprovement": "Improves job-specific relevance and keyword alignment.",
      "jobRequirement": "Backend API development"
    }
  ]
}

---

# 12. Recommendation History

Every recommendation generation must be preserved as a historical record.

The system must not overwrite previous recommendation results.

A new recommendation request creates a new evaluation record.

History must allow the system to distinguish between:

- General resume reviews
- Job-specific reviews
- Different recommendation generations
- Different prompt versions
- Different AI model versions
- Different timestamps

Historical results may be used to compare how recommendations change over time.

---

## 12.1 Get Recommendation History

### Method

GET

### Endpoint

/api/v1/ai/resume-recommendations/history/:candidateId

### Purpose

Return previous resume recommendation evaluations for a candidate.

The response should provide sufficient information to identify:

- Recommendation ID
- Candidate ID
- Job ID when applicable
- Recommendation mode
- Overall summary
- AI model
- Prompt version
- Generation timestamp

---

## 12.2 Get Recommendation Details

### Method

GET

### Endpoint

/api/v1/ai/resume-recommendations/:id

### Purpose

Return the complete recommendation result for a specific historical evaluation.

---

# 13. Recommendation Regeneration

Authorized users may regenerate recommendations.

Regeneration must:

- Create a new recommendation record
- Preserve previous results
- Use the current resume information
- Use the current job information when job-specific mode is selected
- Use the current AI configuration
- Record the AI model and prompt version

Regeneration must never modify or delete previous recommendation history.

---

# 14. General Recommendation Behavior

General resume recommendations should focus on the quality of the candidate's resume independent of a specific job.

The system should consider:

- Content completeness
- Professional presentation
- Clarity
- Consistency
- Skills organization
- Experience descriptions
- Project descriptions
- Education presentation
- Certification presentation
- Keyword usage
- ATS compatibility

The system should prioritize recommendations that provide meaningful improvement.

The system should avoid producing unnecessary recommendations when the resume already handles an area adequately.

---

# 15. Job-Specific Recommendation Behavior

Job-specific recommendations must use the selected job as the evaluation context.

The system should consider:

- Job title
- Description
- Requirements
- Responsibilities
- Required skills
- Experience requirements
- Education requirements
- Relevant projects
- Relevant certifications
- Relevant terminology

The system should determine how well the resume represents the candidate's existing qualifications for the selected job.

Recommendations should focus on improving representation and relevance rather than encouraging false claims.

---

# 16. ATS Optimization Rules

The Resume Recommendation Engine may provide ATS optimization recommendations.

These may include:

- Improving keyword representation
- Improving section clarity
- Removing ambiguous wording
- Improving consistency
- Making relevant skills easier to identify
- Improving experience descriptions
- Improving resume structure
- Avoiding unnecessary keyword repetition

The system must not recommend:

- Keyword stuffing
- False qualifications
- Fabricated experience
- Fabricated achievements
- Fabricated certifications
- Misleading job titles
- Unsupported technical skills

ATS recommendations must remain evidence-based.

---

# 17. Security and Authorization

The Resume Recommendation Engine must follow the existing HireStack authentication and authorization architecture.

### Authentication

JWT authentication is required.

### Authorization

Access must be restricted according to the user's existing role and resource permissions.

Supported roles include:

- Candidate
- Recruiter
- Company Admin

Recruiters must only access candidates and jobs that they are authorized to access.

Company Admin users may access recommendation functionality according to company-level permissions.

Candidates may access recommendations associated with their own profile.

Unauthorized users must receive the existing standardized authorization error response.

---

# 18. Data Privacy

Resume information may contain sensitive personal and professional information.

The system must protect candidate data throughout the recommendation process.

Requirements:

- Resume data must remain within the HireStack server environment.
- Resume content must not be sent to external AI APIs.
- AI inference must use the existing local AI infrastructure.
- Recommendation results must follow existing access controls.
- Historical recommendations must not be exposed to unauthorized users.
- Logs must not unnecessarily contain complete resume contents or sensitive candidate information.

---

# 19. AI Requirements

The Resume Recommendation Engine must use the existing HireStack AI infrastructure.

The implementation must:

- Reuse the existing AI service
- Reuse the existing AI evaluation architecture
- Use the configured local AI model
- Use the existing prompt-building mechanism
- Validate structured AI responses
- Reject malformed AI responses
- Prevent unsupported claims from being returned as valid recommendations

The recommendation feature must not introduce a separate AI client or duplicate AI infrastructure.

The AI model and configuration must be controlled by the existing AI configuration system.

---

# 20. Error Handling

The system must handle failures gracefully.

Possible failures include:

- Candidate not found
- Job not found
- Resume not found
- Invalid request
- Unauthorized access
- Missing resume information
- Missing job information
- Unsupported resume data
- AI timeout
- Empty AI response
- Invalid JSON response
- Schema validation failure
- Database failure

All errors must use the existing HireStack error-handling architecture.

The API must return standardized error responses.

The system must not return raw AI errors or internal implementation details to clients.

---

# 21. Performance Requirements

The recommendation engine should provide reasonable response times for individual resume evaluations.

Performance should be measured for:

- Resume preparation
- AI evaluation
- Response parsing
- Schema validation
- Database persistence
- API response

The implementation should avoid unnecessary repeated processing.

Future versions may support background processing for large-scale recommendation generation.

---

# 22. Future Enhancements

Future versions may include:

- Automatic resume rewriting
- Resume section-by-section editing
- Multiple resume versions
- Job-specific resume versions
- Resume improvement scoring
- Before-and-after comparison
- Recruiter resume feedback
- Candidate resume quality dashboard
- Semantic job matching
- Embedding-based recommendations
- Multi-language resume recommendations
- OCR-based recommendations
- AI-powered resume editor
- Resume version history
- Personalized career recommendations

Future enhancements must reuse the existing HireStack AI architecture wherever practical.

---

# 23. Success Criteria

The Resume Recommendation Engine will be considered successful when:

- Users can generate general resume recommendations.
- Users can generate job-specific resume recommendations.
- Recommendations are structured and actionable.
- Recommendations are based on available candidate information.
- The system does not fabricate candidate qualifications.
- Job-specific recommendations use the selected job as evaluation context.
- Recommendation history is preserved.
- Previous evaluations are not overwritten.
- Unauthorized users cannot access recommendation results.
- AI responses are validated before being returned.
- The feature uses the existing local AI infrastructure.
- The feature follows existing HireStack API and error-handling conventions.

---

# 24. Summary

The AI Resume Recommendation Engine provides evidence-based guidance for improving candidate resumes.

It supports both general resume review and job-specific optimization.

The system builds upon HireStack's existing AI infrastructure and evaluation architecture rather than introducing duplicate AI components.

Recommendations are structured, prioritized, explainable, and grounded in available candidate information.

Job-specific recommendations use the selected job as additional evaluation context.

All generated recommendations are preserved as historical evaluations so that previous results remain available.

The feature is designed to help candidates improve how their existing qualifications are represented while helping recruiters evaluate resume quality and job relevance.

This document defines the functional requirements for the Resume Recommendation Engine.

Technical implementation details are defined separately in:

`05_RESUME_RECOMMENDATIONS_IMPLEMENTATION.md`