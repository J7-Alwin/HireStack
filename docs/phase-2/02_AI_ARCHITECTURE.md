# HireStack AI Architecture
## Phase 2 – AI System Architecture

Version: 2.0.0

Status: In Development

---

# 1. Overview

The HireStack AI Module is designed as a modular, reusable, and locally hosted Artificial Intelligence system.

Unlike cloud-based AI services, HireStack performs all inference locally using Ollama and Llama 3.2 to ensure:

- Data Privacy
- Zero API Cost
- Low Latency
- Full Customization

---

# 2. High Level Architecture

                                Recruiter
                    │
                    ▼
           Express REST API
                    │
                    ▼
             AI Controller
                    │
                    ▼
            Feature Services
                    │
                    ▼
      ┌──────────────────────────────┐
      │ Resume Parser Service        │
      │ ATS Score Service            │
      │ Job Matching Service         │
      │ Recommendation Service       │
      │ Interview Service            │
      │ AI Insights Service          │
      └──────────────────────────────┘
                    │
                    ▼
       Shared AI Evaluation Service
                    │
                    ▼
               Prompt Builder
                    │
                    ▼
                 AiService
                    │
                    ▼
               Ollama Client
                    │
                    ▼
                 LangChain
                    │
                    ▼
               Ollama Server
                    │
                    ▼
               Llama 3.2 Model
---

# 3. AI Module Structure

src/modules/ai

clients/
- ollama.client.ts
- index.ts

config/
- ai.config.ts
- index.ts

constants/
- ai.constants.ts

controllers/
- ai.controller.ts

dto/

hooks/
- ai.hooks.ts

prompts/
- resume.prompt.ts
- ats-score.prompt.ts
- job-matching.prompt.ts
- interview.prompt.ts

routes/
- ai.routes.ts

schemas/
- resume.schema.ts

services/
- ai.service.ts
- resume-parser.service.ts
- ats-score.service.ts
- job-matching.service.ts
- interview.service.ts

swagger/

types/
- resume.types.ts
- ats.types.ts
- matching.types.ts

utils/
- pdf-extractor.ts
- json-parser.ts
- prompt-builder.ts
- upload.ts

validation/

index.ts

src/modules/ai

controller/
- ai.controller.ts

service/
- ai.service.ts
- ai-evaluation.service.ts  
- resume-parser.service.ts
- ats-score.service.ts
- job-matching.service.ts
- interview.service.ts

routes/
- ai.routes.ts

prompts/
- resume.prompt.ts
- ats-score.prompt.ts
- job-matching.prompt.ts
- interview.prompt.ts

utils/
- pdf-extractor.ts
- json-parser.ts
- prompt-builder.ts

types/
- resume.types.ts
- ats.types.ts
- matching.types.ts

schemas/
- resume.schema.ts

constants/
- ai.constants.ts

hooks/
- ai.hooks.ts



index.ts

---

# 4. AI Request Lifecycle

Client Request

↓

AI Route

↓

AI Controller

↓

Feature Service

↓

AI Evaluation Service

↓

Prompt Builder

↓

AiService

↓

Ollama Client

↓

LangChain

↓

Ollama

↓

Llama 3.2

↓

JSON Parser

↓

Schema Validation

↓

Business Logic

↓

Response

---

# 5. Resume Parsing Workflow

PDF Upload

↓

Extract Text

↓

Clean Text

↓

Resume Prompt

↓

Llama 3.2

↓

Extract JSON

↓

ResumeSchema Validation

↓

Reuse Candidate Service

↓

Create Candidate

↓

Store Resume Metadata

↓

Return Candidate

---

# 6. ATS Score Workflow

Candidate Resume

+

Job

↓

ATS Score Service

↓

AI Evaluation Service

↓

Persist ATS Score

↓

Return ATS Report

---

# 7. Job Matching Workflow

Recruiter Selects Job

↓

Load Applications

↓

Loop Candidates

↓

ATS Score Service

↓

AI Evaluation Service

↓

Create JobMatch

↓

Repeat

↓

Sort By Match Percentage

↓

Return Ranked Candidates

# Shared AI Evaluation Service

The Shared AI Evaluation Service centralizes all AI communication within the HireStack platform.

Responsibilities

- Build prompts
- Call AiService
- Parse JSON
- Validate AI responses
- Return structured evaluation objects

This service is reused by:

- ATS Score
- Job Matching
- Resume Recommendations (future)
- AI Insights (future)

The goal is to maintain a single AI evaluation implementation across the platform.

# 8. Interview Assistant Workflow

Resume

+

Job

↓

Generate Questions

↓

Categorize Questions

↓

Technical

HR

Behavioral

Project

Coding

↓

Return Interview Kit

---

# 9. Error Handling

Every AI response follows:

LLM Response

↓

JSON Extraction

↓

Schema Validation

↓

Business Validation

↓

API Response

Failures

- Invalid JSON
- Timeout
- Empty Response
- Invalid Resume
- Missing Skills
- Unsupported File

---

# 10. Security

Authentication

JWT Required

Authorization

Role Based

Recruiter

Company Admin

Local AI

No Resume Sent Outside Server

File Validation

PDF Only

Maximum File Size

Configurable

---

# 11. Scalability

Designed to support

- Multiple Recruiters
- Multiple Companies
- Concurrent Resume Parsing
- AI Queue Processing
- Background Jobs

---

# 12. Future AI Expansion

The architecture supports future integration of

- OCR
- Vision Models
- RAG
- Embeddings
- Vector Database
- Semantic Search
- Voice Assistant
- AI Copilot
- Multi-Agent Workflows

without changing the existing AI module.