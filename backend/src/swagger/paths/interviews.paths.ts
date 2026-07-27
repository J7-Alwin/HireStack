/**
 * @openapi
 * /interviews:
 *   post:
 *     tags:
 *       - Interviews
 *     summary: Schedule Interview
 *     description: Schedules a new interview for an application.
 *     operationId: scheduleInterview
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleInterviewRequest'
 *     responses:
 *       201:
 *         description: Interview scheduled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
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
 * /interviews:
 *   get:
 *     tags:
 *       - Interviews
 *     summary: List Interviews
 *     description: Returns a paginated list of interviews with filtering, searching and sorting support.
 *     operationId: listInterviews
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
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: interviewType
 *         schema:
 *           type: string
 *           enum:
 *             - INTERNAL
 *             - CLIENT
 *             - CAMPUS
 *             - WALK_IN
 *             - OTHER
 *       - in: query
 *         name: round
 *         schema:
 *           type: string
 *           enum:
 *             - SCREENING
 *             - TECHNICAL
 *             - MANAGERIAL
 *             - HR
 *             - FINAL
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum:
 *             - SCHEDULED
 *             - CONFIRMED
 *             - IN_PROGRESS
 *             - COMPLETED
 *             - CANCELLED
 *             - NO_SHOW
 *       - in: query
 *         name: outcome
 *         schema:
 *           type: string
 *           enum:
 *             - PASS
 *             - FAIL
 *             - ON_HOLD
 *             - RECOMMENDED
 *             - STRONG_RECOMMEND
 *             - NOT_RECOMMENDED
 *       - in: query
 *         name: mode
 *         schema:
 *           type: string
 *           enum:
 *             - ONLINE
 *             - ONSITE
 *             - PHONE
 *       - in: query
 *         name: recruiterId
 *         schema:
 *           type: string
 *       - in: query
 *         name: interviewerId
 *         schema:
 *           type: string
 *       - in: query
 *         name: scheduledDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: createdAt
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
 *         description: Interviews retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewListResponse'
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
 * /interviews/{id}:
 *   get:
 *     tags:
 *       - Interviews
 *     summary: Get Interview By ID
 *     description: Retrieves complete details of an interview.
 *     operationId: getInterviewById
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview retrieved successfully.
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
 *       404:
 *         description: Interview not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /interviews/{id}:
 *   patch:
 *     tags:
 *       - Interviews
 *     summary: Update Interview
 *     description: Updates editable interview information.
 *     operationId: updateInterview
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInterviewRequest'
 *     responses:
 *       200:
 *         description: Interview updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
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
 *         description: Interview not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /interviews/{id}:
 *   delete:
 *     tags:
 *       - Interviews
 *     summary: Soft Delete Interview
 *     description: Soft deletes an interview.
 *     operationId: softDeleteInterview
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Interview deleted successfully.
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
 *         description: Interview not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @openapi
 * /interviews/{id}/status:
 *   patch:
 *     tags:
 *       - Interviews
 *     summary: Update Interview Status
 *     description: Updates the current status of an interview.
 *     operationId: updateInterviewStatus
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateInterviewStatusRequest'
 *     responses:
 *       200:
 *         description: Interview status updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
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
 *         description: Interview not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /interviews/{id}/reschedule:
 *   patch:
 *     tags:
 *       - Interviews
 *     summary: Reschedule Interview
 *     description: Updates the scheduled date, time and location/meeting details of an interview.
 *     operationId: rescheduleInterview
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RescheduleInterviewRequest'
 *     responses:
 *       200:
 *         description: Interview rescheduled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
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
 *         description: Interview not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /interviews/{id}/outcome:
 *   patch:
 *     tags:
 *       - Interviews
 *     summary: Record Interview Outcome
 *     description: Records the interview outcome and recruiter result notes.
 *     operationId: recordInterviewOutcome
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecordInterviewOutcomeRequest'
 *     responses:
 *       200:
 *         description: Interview outcome recorded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
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
 *         description: Interview not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /interviews/{id}/cancel:
 *   patch:
 *     tags:
 *       - Interviews
 *     summary: Cancel Interview
 *     description: Cancels a scheduled interview and stores the cancellation reason.
 *     operationId: cancelInterview
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelInterviewRequest'
 *     responses:
 *       200:
 *         description: Interview cancelled successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
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
 *         description: Interview not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /interviews/{id}/interviewers:
 *   patch:
 *     tags:
 *       - Interviews
 *     summary: Assign Interviewers
 *     description: Assigns or updates the interviewers for an interview.
 *     operationId: assignInterviewers
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Interview ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignInterviewersRequest'
 *     responses:
 *       200:
 *         description: Interviewers updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InterviewResponse'
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
 *         description: Interview not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */