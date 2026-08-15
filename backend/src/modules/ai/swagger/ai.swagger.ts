/**
 * @openapi
 * /v1/ai/health:
 *   get:
 *     tags:
 *       - AI
 *     summary: Verify AI availability
 *     description: Checks the status of the local AI provider and model.
 *     operationId: healthCheckAI
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI service health checked successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIHealthCheckResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/resume/parse:
 *   post:
 *     tags:
 *       - AI
 *     summary: Parse uploaded resumes
 *     description: Uploads a PDF resume, parses its content using local AI, and creates a Candidate in the database.
 *     operationId: parseResume
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               resume:
 *                 type: string
 *                 format: binary
 *                 description: PDF file containing candidate resume (max 10MB)
 *     responses:
 *       200:
 *         description: Resume parsed and candidate created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Resume parsed and candidate created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Candidate'
 *       400:
 *         description: Bad request (missing file or invalid format).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict (Candidate already exists with same email or phone).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/ats-score:
 *   post:
 *     tags:
 *       - AI
 *     summary: Evaluate Candidate ATS Score
 *     description: Evaluates candidate resume compatibility against a selected job description using local AI.
 *     operationId: calculateATSScore
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ATSScoreRequest'
 *     responses:
 *       200:
 *         description: ATS score generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ATSScoreResponse'
 *       400:
 *         description: Bad request (validation errors).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate or Job not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Unprocessable entity (missing resume or job description).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/job-matching:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate job matching ranks
 *     description: Loops through all candidate applications for a selected job, computes AI match scores, saves the results, and returns candidates ranked by match percentage.
 *     operationId: generateJobMatching
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobMatchingRequest'
 *     responses:
 *       200:
 *         description: Job matching generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobMatchingResponse'
 *       400:
 *         description: Bad request (validation errors).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Unprocessable entity (missing parameters or description).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/job-matching/{jobId}:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get Job Matching History
 *     description: Retrieves the list of historical AI evaluations generated for a selected job.
 *     operationId: getJobMatchingHistory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID of the Job
 *     responses:
 *       200:
 *         description: Job matching history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobMatchHistoryResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/job-matching/{jobId}/{candidateId}:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get Candidate Match Details
 *     description: Retrieves the detailed AI evaluation for the selected candidate and job.
 *     operationId: getCandidateMatchDetails
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID of the Job
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID of the Candidate
 *     responses:
 *       200:
 *         description: Candidate match details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/JobMatchDetailsResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Job, candidate, or match details not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/resume-recommendations:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate General Resume Recommendations
 *     description: Analyzes candidate resume text and details and suggests professional quality and formatting improvements.
 *     operationId: generateGeneralRecommendations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResumeRecommendationRequest'
 *     responses:
 *       200:
 *         description: Resume recommendations generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumeRecommendationResponse'
 *       400:
 *         description: Bad request (validation errors).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role or unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Unprocessable entity (missing resume or insufficient details).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/resume-recommendations/job:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate Job-Specific Resume Recommendations
 *     description: Compares candidate resume and details against a selected job description to identify alignment gaps and keyword optimization improvements.
 *     operationId: generateJobRecommendations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobSpecificResumeRecommendationRequest'
 *     responses:
 *       200:
 *         description: Job-specific resume recommendations generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumeRecommendationResponse'
 *       400:
 *         description: Bad request (validation errors).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role or unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate or Job not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       422:
 *         description: Unprocessable entity.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/resume-recommendations/history/{candidateId}:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get Resume Recommendations History
 *     description: Retrieves the list of historical AI resume recommendation reviews generated for a candidate.
 *     operationId: getRecommendationsHistory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID of the Candidate
 *     responses:
 *       200:
 *         description: Resume recommendations history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumeRecommendationHistoryResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role or unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/resume-recommendations/{id}:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get Resume Recommendation Details
 *     description: Retrieves the detailed recommendations list and overall summary for a specific historical evaluation ID.
 *     operationId: getRecommendationDetails
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID of the Resume Recommendation record
 *     responses:
 *       200:
 *         description: Resume recommendation details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResumeRecommendationResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role or unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Recommendation details not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/interview:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate General Interview Kit
 *     description: Generates a structured, evidence-grounded interview kit and tailored questions based on candidate profile and resume without requiring a job context.
 *     operationId: generateGeneralInterview
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InterviewRequest'
 *     responses:
 *       200:
 *         description: General interview kit generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
 *       400:
 *         description: Validation error or invalid input format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role or cross-company access denied.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error or AI evaluation failure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/interview/job:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate Job-Specific Interview Kit
 *     description: Generates a tailored interview kit and questions evaluating candidate suitability and role alignment for a specific job.
 *     operationId: generateJobInterview
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/JobSpecificInterviewRequest'
 *     responses:
 *       200:
 *         description: Job-specific interview kit generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
 *       400:
 *         description: Validation error or invalid input format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role, recruiter not assigned, or cross-company access denied.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate or Job not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error or AI evaluation failure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/interview/history/{candidateId}:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get Interview History
 *     description: Retrieves the list of historical interview kits generated for a candidate.
 *     operationId: getInterviewHistory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID of the Candidate
 *     responses:
 *       200:
 *         description: Interview history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewHistoryResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role or unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/interview/{id}:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get Interview Kit Details
 *     description: Retrieves the detailed interview kit including all questions and overall summary for a specific historical evaluation ID.
 *     operationId: getInterviewDetails
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID of the Interview Assistant record
 *     responses:
 *       200:
 *         description: Interview kit details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role or unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Interview kit not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/insights:
 *   post:
 *     tags:
 *       - AI
 *     summary: Generate AI Insights
 *     description: Generates comprehensive, evidence-grounded recruiter insights evaluating a candidate against a job opening. In Version 1.0, AI Insights is strictly Job-Specific and requires both candidateId and jobId, synthesizing candidate background, job requirements, and available AI evaluations.
 *     operationId: generateAiInsights
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateAiInsightsRequest'
 *     responses:
 *       200:
 *         description: AI insights generated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AiInsightDetailsResponse'
 *       400:
 *         description: Validation error or invalid input format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role, cross-company access, or unassigned recruiter job.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate or job not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error or AI evaluation failure.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/insights/history/{candidateId}:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get AI Insights History
 *     description: Retrieves the list of historical AI Insight evaluations generated for a specific candidate in reverse chronological order. For recruiters, results are strictly filtered to only include insights for active jobs assigned to them.
 *     operationId: getInsightsHistory
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: candidateId
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID of the candidate
 *     responses:
 *       200:
 *         description: AI insights history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AiInsightHistoryResponse'
 *       400:
 *         description: Invalid candidate ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role or unauthorized access.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Candidate not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /v1/ai/insights/{id}:
 *   get:
 *     tags:
 *       - AI
 *     summary: Get AI Insight Details
 *     description: Retrieves the complete detailed AI Insight evaluation report for a specific evaluation ID. For recruiters, access requires an active assignment to the job associated with the insight (access to insights of deleted jobs is restricted to Company Admins).
 *     operationId: getInsightsDetails
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CUID of the AI Insight record
 *     responses:
 *       200:
 *         description: AI insight details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AiInsightDetailsResponse'
 *       400:
 *         description: Invalid insight ID format.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden role, cross-company access, unassigned recruiter job, or recruiter access to deleted job insight.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: AI Insight record not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export const aiSwaggerPaths = {};
