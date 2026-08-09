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
export const aiSwaggerPaths = {};
