# HireStack AI API Specification
## Phase 2 – Artificial Intelligence APIs

Version: 2.0.0

Status: Planned / In Development

---

# Base URL

/api/v1/ai

Authentication

JWT Required

Roles

- Company Admin
- Recruiter

---

# 1. AI Health Check

GET /health

Description

Checks AI server availability and model status.

Response

200 OK

{
    "success": true,
    "data": {
        "provider": "ollama",
        "model": "llama3.2",
        "status": "healthy",
        "responseTime": 1245
    }
}

---

# 2. Parse Resume

POST /resume/parse

Description

Uploads a PDF resume and extracts structured candidate information.

Content-Type

multipart/form-data

Request

resume : PDF File

Response

{
    "success": true,
    "data": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+91XXXXXXXXXX",
        "skills": [
            "Java",
            "Spring Boot",
            "React"
        ],
        "education": [],
        "experience": [],
        "projects": [],
        "certifications": []
    }
}

---

# 3. ATS Score

POST /ats-score

Description

Calculates ATS compatibility between a resume and a job.

Request

{
    "candidateId": "...",
    "jobId": "..."
}

Response

{
    "success": true,
    "data": {
        "overallScore": 87,
        "skillScore": 91,
        "experienceScore": 82,
        "educationScore": 90,
        "missingSkills": [],
        "strengths": [],
        "recommendations": []
    }
}

---

# 4. Job Matching

POST /job-match

Description

Matches a candidate with a job.

Request

{
    "candidateId": "...",
    "jobId": "..."
}

Response

{
    "success": true,
    "data": {
        "matchPercentage": 89,
        "matchedSkills": [],
        "missingSkills": [],
        "recommendation": "Recommended"
    }
}

---

# 5. Resume Recommendations

POST /resume/recommend

Description

Generates AI suggestions for improving a resume.

Request

{
    "candidateId": "..."
}

Response

{
    "success": true,
    "data": {
        "summary": [],
        "missingSkills": [],
        "formattingSuggestions": [],
        "keywordSuggestions": []
    }
}

---

# 6. Interview Question Generator

POST /interview/questions

Description

Generates interview questions for a candidate.

Request

{
    "candidateId": "...",
    "jobId": "..."
}

Response

{
    "success": true,
    "data": {
        "technical": [],
        "hr": [],
        "behavioral": [],
        "coding": [],
        "project": []
    }
}

---

# 7. AI Insights

GET /candidate/:candidateId/insights

Description

Returns AI-generated recruiter insights.

Response

{
    "success": true,
    "data": {
        "strengths": [],
        "risks": [],
        "careerGrowth": "",
        "hiringConfidence": 93
    }
}

---

# Common Error Responses

400 Bad Request

{
    "success": false,
    "message": "Validation failed"
}

401 Unauthorized

{
    "success": false,
    "message": "Unauthorized"
}

403 Forbidden

{
    "success": false,
    "message": "Access denied"
}

404 Not Found

{
    "success": false,
    "message": "Resource not found"
}

500 Internal Server Error

{
    "success": false,
    "message": "AI processing failed"
}

503 Service Unavailable

{
    "success": false,
    "message": "Ollama server unavailable"
}

---

# API Development Status

| Endpoint | Status |
|----------|--------|
| GET /health | ✅ Completed |
| POST /resume/parse | ⏳ Planned |
| POST /ats-score | ⏳ Planned |
| POST /job-match | ⏳ Planned |
| POST /resume/recommend | ⏳ Planned |
| POST /interview/questions | ⏳ Planned |
| GET /candidate/:candidateId/insights | ⏳ Planned |