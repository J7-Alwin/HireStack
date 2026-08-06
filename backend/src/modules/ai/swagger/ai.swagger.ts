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
export const aiSwaggerPaths = {};
