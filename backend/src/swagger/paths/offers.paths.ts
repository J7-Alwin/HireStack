/**
 * @openapi
 * /offers:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Create Offer
 *     description: Creates a new offer in DRAFT status for an application.
 *     operationId: createOffer
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOfferRequest'
 *     responses:
 *       201:
 *         description: Offer created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
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
 * /offers:
 *   get:
 *     tags:
 *       - Offers
 *     summary: List Offers
 *     description: Returns a paginated list of offers with filtering, searching and sorting support.
 *     operationId: listOffers
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
 *           enum:
 *             - DRAFT
 *             - PENDING_APPROVAL
 *             - APPROVED
 *             - SENT
 *             - VIEWED
 *             - ACCEPTED
 *             - DECLINED
 *             - EXPIRED
 *             - WITHDRAWN
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           enum:
 *             - INR
 *             - USD
 *             - EUR
 *             - GBP
 *             - AED
 *             - SGD
 *       - in: query
 *         name: employmentType
 *         schema:
 *           type: string
 *           enum:
 *             - FULL_TIME
 *             - PART_TIME
 *             - CONTRACT
 *             - INTERN
 *             - TEMPORARY
 *             - FREELANCE
 *       - in: query
 *         name: recruiterId
 *         schema:
 *           type: string
 *       - in: query
 *         name: joiningDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: expiryDate
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
 *         description: Offers retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferListResponse'
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
 * /offers/{id}:
 *   get:
 *     tags:
 *       - Offers
 *     summary: Get Offer By ID
 *     description: Retrieves complete details of an offer.
 *     operationId: getOfferById
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedError'
 *       404:
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /offers/{id}:
 *   put:
 *     tags:
 *       - Offers
 *     summary: Update Draft Offer
 *     description: Updates an existing draft offer.
 *     operationId: updateDraftOffer
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOfferRequest'
 *     responses:
 *       200:
 *         description: Offer updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
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
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /offers/{id}:
 *   delete:
 *     tags:
 *       - Offers
 *     summary: Soft Delete Offer
 *     description: Soft deletes an offer.
 *     operationId: softDeleteOffer
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer deleted successfully.
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
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @openapi
 * /offers/{id}/submit:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Submit Offer for Approval
 *     description: Submits a draft offer for approval.
 *     operationId: submitOfferForApproval
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /offers/{id}/approve:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Approve Offer
 *     description: Approves a submitted offer.
 *     operationId: approveOffer
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer approved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /offers/{id}/send:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Send Offer
 *     description: Sends an approved offer to the candidate.
 *     operationId: sendOffer
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /offers/{id}/view:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Mark Offer Viewed
 *     description: Marks an offer as viewed by the candidate.
 *     operationId: markOfferViewed
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer marked as viewed.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /offers/{id}/accept:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Accept Offer
 *     description: Records candidate acceptance of the offer.
 *     operationId: acceptOffer
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer accepted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /offers/{id}/decline:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Decline Offer
 *     description: Records candidate rejection of the offer.
 *     operationId: declineOffer
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer declined successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /offers/{id}/withdraw:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Withdraw Offer
 *     description: Withdraws an active offer.
 *     operationId: withdrawOffer
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer withdrawn successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /offers/{id}/revision:
 *   post:
 *     tags:
 *       - Offers
 *     summary: Create Offer Revision
 *     description: Creates a revised version of an existing offer.
 *     operationId: createOfferRevision
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Offer ID
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Offer revision created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OfferResponse'
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Offer not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */