/**
 * @openapi
 * /api/candidates:
 *   post:
 *     tags:
 *       - Candidates
 *     summary: Create Candidate
 *     description: Creates a new candidate profile.
 *     operationId: createCandidate
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCandidateRequest'
 *     responses:
 *       201:
 *         description: Candidate created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateResponse'
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
 * /api/candidates:
 *   get:
 *     tags:
 *       - Candidates
 *     summary: List Candidates
 *     description: Returns a paginated list of candidates with optional filtering and searching.
 *     operationId: listCandidates
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
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *       - in: query
 *         name: recruiterId
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
 *       - in: query
 *         name: showDeleted
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Candidates retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateListResponse'
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
 * /api/candidates/{id}:
 *   get:
 *     tags:
 *       - Candidates
 *     summary: Get Candidate By ID
 *     description: Retrieves a candidate profile by its ID.
 *     operationId: getCandidateById
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateResponse'
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
 *       404:
 *         description: Candidate not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/candidates/{id}:
 *   patch:
 *     tags:
 *       - Candidates
 *     summary: Update Candidate
 *     description: Updates an existing candidate profile.
 *     operationId: updateCandidate
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCandidateRequest'
 *     responses:
 *       200:
 *         description: Candidate updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CandidateResponse'
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
 *       404:
 *         description: Candidate not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/candidates/{id}:
 *   delete:
 *     tags:
 *       - Candidates
 *     summary: Soft Delete Candidate
 *     description: Soft deletes a candidate profile.
 *     operationId: softDeleteCandidate
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate deleted successfully.
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
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Candidate not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/candidates/{id}/restore:
 *   patch:
 *     tags:
 *       - Candidates
 *     summary: Restore Candidate
 *     description: Restores a previously soft-deleted candidate.
 *     operationId: restoreCandidate
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Candidate restored successfully.
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
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Candidate not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/candidates/{id}/skills:
 *   post:
 *     tags:
 *       - Candidate Skills
 *     summary: Add Skill
 *     description: Adds a new skill to a candidate profile.
 *     operationId: addCandidateSkill
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddSkillRequest'
 *     responses:
 *       201:
 *         description: Skill added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Candidate not found.
 */

/**
 * @openapi
 * /api/candidates/{id}/skills/{skillId}:
 *   patch:
 *     tags:
 *       - Candidate Skills
 *     summary: Update Skill
 *     description: Updates an existing candidate skill.
 *     operationId: updateCandidateSkill
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSkillRequest'
 *     responses:
 *       200:
 *         description: Skill updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Candidate or skill not found.
 */

/**
 * @openapi
 * /api/candidates/{id}/skills/{skillId}:
 *   delete:
 *     tags:
 *       - Candidate Skills
 *     summary: Delete Skill
 *     description: Removes a skill from a candidate profile.
 *     operationId: deleteCandidateSkill
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Candidate or skill not found.
 */

/**
 * @openapi
 * /api/candidates/{id}/education:
 *   post:
 *     tags:
 *       - Candidate Education
 *     summary: Add Education
 *     description: Adds an education record to a candidate.
 *     operationId: addCandidateEducation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddEducationRequest'
 *     responses:
 *       201:
 *         description: Education added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Candidate not found.
 */

/**
 * @openapi
 * /api/candidates/{id}/education/{educationId}:
 *   patch:
 *     tags:
 *       - Candidate Education
 *     summary: Update Education
 *     description: Updates an education record.
 *     operationId: updateCandidateEducation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: educationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEducationRequest'
 *     responses:
 *       200:
 *         description: Education updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Candidate or education record not found.
 */

/**
 * @openapi
 * /api/candidates/{id}/education/{educationId}:
 *   delete:
 *     tags:
 *       - Candidate Education
 *     summary: Delete Education
 *     description: Deletes an education record from a candidate.
 *     operationId: deleteCandidateEducation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: educationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Education deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Candidate or education record not found.
 */

/**
 * @openapi
 * /api/candidates/{id}/experience:
 *   post:
 *     tags:
 *       - Candidate Experience
 *     summary: Add Experience
 *     description: Adds a work experience record to a candidate.
 *     operationId: addCandidateExperience
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddExperienceRequest'
 *     responses:
 *       201:
 *         description: Experience added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Candidate not found.
 */

/**
 * @openapi
 * /api/candidates/{id}/experience/{experienceId}:
 *   patch:
 *     tags:
 *       - Candidate Experience
 *     summary: Update Experience
 *     description: Updates a candidate experience record.
 *     operationId: updateCandidateExperience
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: experienceId
 *         required: true
 *         description: Experience ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateExperienceRequest'
 *     responses:
 *       200:
 *         description: Experience updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation failed.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Candidate or experience record not found.
 */

/**
 * @openapi
 * /api/candidates/{id}/experience/{experienceId}:
 *   delete:
 *     tags:
 *       - Candidate Experience
 *     summary: Delete Experience
 *     description: Deletes a work experience record from a candidate.
 *     operationId: deleteCandidateExperience
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: experienceId
 *         required: true
 *         description: Experience ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Experience deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Candidate or experience record not found.
 */
/**
 * @openapi
 * /api/candidates/{id}/documents:
 *   post:
 *     tags:
 *       - Candidate Documents
 *     summary: Upload Candidate Document
 *     description: Adds a document to a candidate profile.
 *     operationId: addCandidateDocument
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddDocumentRequest'
 *     responses:
 *       201:
 *         description: Document uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *         description: Candidate not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/candidates/{id}/documents/{documentId}:
 *   delete:
 *     tags:
 *       - Candidate Documents
 *     summary: Delete Candidate Document
 *     description: Deletes a document from a candidate profile.
 *     operationId: deleteCandidateDocument
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: documentId
 *         required: true
 *         description: Document ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Document deleted successfully.
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
 *         description: Candidate or document not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @openapi
 * /api/candidates/{id}/notes:
 *   post:
 *     tags:
 *       - Candidate Notes
 *     summary: Add Candidate Note
 *     description: Adds a note to a candidate profile.
 *     operationId: addCandidateNote
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddNoteRequest'
 *     responses:
 *       201:
 *         description: Note added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *         description: Candidate not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/candidates/{id}/notes/{noteId}:
 *   patch:
 *     tags:
 *       - Candidate Notes
 *     summary: Update Candidate Note
 *     description: Updates an existing candidate note.
 *     operationId: updateCandidateNote
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
 *         required: true
 *         description: Note ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNoteRequest'
 *     responses:
 *       200:
 *         description: Note updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *         description: Candidate or note not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/candidates/{id}/notes/{noteId}:
 *   delete:
 *     tags:
 *       - Candidate Notes
 *     summary: Delete Candidate Note
 *     description: Deletes a note from a candidate profile.
 *     operationId: deleteCandidateNote
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: noteId
 *         required: true
 *         description: Note ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Note deleted successfully.
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
 *         description: Candidate or note not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/candidates/{id}/tags:
 *   post:
 *     tags:
 *       - Candidate Tags
 *     summary: Add Candidate Tag
 *     description: Assigns a tag to a candidate.
 *     operationId: addCandidateTag
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTagRequest'
 *     responses:
 *       201:
 *         description: Tag assigned successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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
 *         description: Candidate not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/candidates/{id}/tags/{tagId}:
 *   delete:
 *     tags:
 *       - Candidate Tags
 *     summary: Remove Candidate Tag
 *     description: Removes a tag from a candidate.
 *     operationId: removeCandidateTag
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Candidate ID
 *         schema:
 *           type: string
 *       - in: path
 *         name: tagId
 *         required: true
 *         description: Tag ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag removed successfully.
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
 *         description: Candidate or tag not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */