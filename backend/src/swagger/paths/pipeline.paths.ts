/**
 * @openapi
 * /pipeline/dashboard:
 *   get:
 *     tags:
 *       - Pipeline
 *     summary: Get Dashboard Summary
 *     description: Returns the overall hiring pipeline dashboard summary.
 *     operationId: getDashboardSummary
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard summary retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardSummaryResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /pipeline/dashboard/company:
 *   get:
 *     tags:
 *       - Pipeline
 *     summary: Get Company Dashboard
 *     description: Returns company-wide hiring metrics.
 *     operationId: getCompanyDashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Company dashboard retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CompanyDashboardResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /pipeline/dashboard/recruiter:
 *   get:
 *     tags:
 *       - Pipeline
 *     summary: Get Recruiter Dashboard
 *     description: Returns recruiter-specific hiring metrics.
 *     operationId: getRecruiterDashboard
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Recruiter dashboard retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecruiterDashboardResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       403:
 *         description: Forbidden.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /pipeline:
 *   post:
 *     tags:
 *       - Pipeline
 *     summary: Create Pipeline
 *     description: Creates a hiring pipeline for an application.
 *     operationId: createPipeline
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePipelineRequest'
 *     responses:
 *       201:
 *         description: Pipeline created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PipelineResponse'
 *       400:
 *         description: Validation failed.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /pipeline:
 *   get:
 *     tags:
 *       - Pipeline
 *     summary: List Pipelines
 *     description: Returns a paginated list of hiring pipelines with filtering and searching support.
 *     operationId: listPipelines
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: currentStage
 *         schema:
 *           type: string
 *           enum:
 *             - APPLIED
 *             - SCREENING
 *             - SHORTLISTED
 *             - HR_INTERVIEW
 *             - TECHNICAL_INTERVIEW
 *             - FINAL_INTERVIEW
 *             - OFFER_PENDING
 *             - OFFER_SENT
 *             - OFFER_ACCEPTED
 *             - HIRED
 *             - REJECTED
 *             - WITHDRAWN
 *       - in: query
 *         name: recruiterId
 *         schema:
 *           type: string
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: jobId
 *         schema:
 *           type: string
 *       - in: query
 *         name: candidateId
 *         schema:
 *           type: string
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: hired
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: rejected
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: withdrawn
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum:
 *             - asc
 *             - desc
 *     responses:
 *       200:
 *         description: Pipelines retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PipelineListResponse'
 *       400:
 *         description: Validation failed.
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
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /pipeline/{id}:
 *   get:
 *     tags:
 *       - Pipeline
 *     summary: Get Pipeline By ID
 *     description: Retrieves complete pipeline details.
 *     operationId: getPipelineById
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pipeline retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PipelineResponse'
 *       404:
 *         description: Pipeline not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /pipeline/{id}:
 *   delete:
 *     tags:
 *       - Pipeline
 *     summary: Soft Delete Pipeline
 *     description: Soft deletes a hiring pipeline.
 *     operationId: softDeletePipeline
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pipeline deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Pipeline not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @openapi
 * /pipeline/{id}/stage:
 *   patch:
 *     tags:
 *       - Pipeline
 *     summary: Move Pipeline Stage
 *     description: Moves a candidate to another pipeline stage. Supports administrator stage overrides.
 *     operationId: movePipelineStage
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pipeline ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovePipelineStageRequest'
 *     responses:
 *       200:
 *         description: Pipeline stage updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PipelineResponse'
 *       400:
 *         description: Validation failed.
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
 *       404:
 *         description: Pipeline not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /pipeline/{id}/notes:
 *   post:
 *     tags:
 *       - Pipeline
 *     summary: Add Pipeline Notes
 *     description: Adds notes to a candidate's pipeline record.
 *     operationId: addPipelineNotes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pipeline ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddPipelineNotesRequest'
 *     responses:
 *       201:
 *         description: Notes added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PipelineResponse'
 *       400:
 *         description: Validation failed.
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
 *       404:
 *         description: Pipeline not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /pipeline/{id}/history:
 *   get:
 *     tags:
 *       - Pipeline
 *     summary: Get Pipeline History
 *     description: Returns the complete stage movement history of a pipeline.
 *     operationId: getPipelineHistory
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pipeline ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pipeline history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: Pipeline not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /pipeline/{id}/timeline:
 *   get:
 *     tags:
 *       - Pipeline
 *     summary: Get Pipeline Timeline
 *     description: Returns the activity timeline for a pipeline.
 *     operationId: getPipelineTimeline
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Pipeline ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pipeline timeline retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: Pipeline not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */