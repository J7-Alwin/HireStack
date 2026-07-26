const offerSchemas = {
    Offer: {
        type: "object",
        properties: {
            id: {
                type: "string",
                example: "offer_123456",
            },
            applicationId: {
                type: "string",
                example: "app_123456",
            },
            salary: {
                type: "number",
                example: 850000,
            },
            currency: {
                type: "string",
                enum: [
                    "INR",
                    "USD",
                    "EUR",
                    "GBP",
                    "AED",
                    "SGD",
                ],
                example: "INR",
            },
            employmentType: {
                type: "string",
                enum: [
                    "FULL_TIME",
                    "PART_TIME",
                    "CONTRACT",
                    "INTERN",
                    "TEMPORARY",
                    "FREELANCE",
                ],
                example: "FULL_TIME",
            },
            status: {
                type: "string",
                enum: [
                    "DRAFT",
                    "PENDING_APPROVAL",
                    "APPROVED",
                    "SENT",
                    "VIEWED",
                    "ACCEPTED",
                    "DECLINED",
                    "EXPIRED",
                    "WITHDRAWN",
                ],
                example: "DRAFT",
            },
            joiningDate: {
                type: "string",
                format: "date-time",
            },
            expiryDate: {
                type: "string",
                format: "date-time",
            },
            benefits: {
                type: "string",
                nullable: true,
            },
            notes: {
                type: "string",
                nullable: true,
            },
            offerLetterUrl: {
                type: "string",
                nullable: true,
                example: "https://storage.company.com/offers/offer.pdf",
            },
            offerLetterFileName: {
                type: "string",
                nullable: true,
                example: "Offer_Letter.pdf",
            },
            createdAt: {
                type: "string",
                format: "date-time",
            },
            updatedAt: {
                type: "string",
                format: "date-time",
            },
        },
    },

    OfferResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                $ref: "#/components/schemas/Offer",
            },
        },
    },

    OfferListResponse: {
        type: "object",
        properties: {
            success: {
                type: "boolean",
                example: true,
            },
            data: {
                type: "array",
                items: {
                    $ref: "#/components/schemas/Offer",
                },
            },
            pagination: {
                type: "object",
                properties: {
                    page: {
                        type: "integer",
                        example: 1,
                    },
                    limit: {
                        type: "integer",
                        example: 10,
                    },
                    total: {
                        type: "integer",
                        example: 56,
                    },
                    totalPages: {
                        type: "integer",
                        example: 6,
                    },
                },
            },
        },
    },

    CreateOfferRequest: {
        type: "object",
        required: [
            "applicationId",
            "salary",
            "currency",
            "employmentType",
            "joiningDate",
            "expiryDate",
        ],
        properties: {
            applicationId: {
                type: "string",
            },
            salary: {
                type: "number",
                example: 850000,
            },
            currency: {
                type: "string",
                enum: [
                    "INR",
                    "USD",
                    "EUR",
                    "GBP",
                    "AED",
                    "SGD",
                ],
            },
            employmentType: {
                type: "string",
                enum: [
                    "FULL_TIME",
                    "PART_TIME",
                    "CONTRACT",
                    "INTERN",
                    "TEMPORARY",
                    "FREELANCE",
                ],
            },
            joiningDate: {
                type: "string",
                format: "date-time",
            },
            expiryDate: {
                type: "string",
                format: "date-time",
            },
            benefits: {
                type: "string",
            },
            notes: {
                type: "string",
            },
            offerLetterUrl: {
                type: "string",
            },
            offerLetterFileName: {
                type: "string",
            },
        },
    },

    UpdateOfferRequest: {
        type: "object",
        properties: {
            salary: {
                type: "number",
            },
            currency: {
                type: "string",
                enum: [
                    "INR",
                    "USD",
                    "EUR",
                    "GBP",
                    "AED",
                    "SGD",
                ],
            },
            employmentType: {
                type: "string",
                enum: [
                    "FULL_TIME",
                    "PART_TIME",
                    "CONTRACT",
                    "INTERN",
                    "TEMPORARY",
                    "FREELANCE",
                ],
            },
            joiningDate: {
                type: "string",
                format: "date-time",
            },
            expiryDate: {
                type: "string",
                format: "date-time",
            },
            benefits: {
                type: "string",
            },
            notes: {
                type: "string",
            },
            offerLetterUrl: {
                type: "string",
            },
            offerLetterFileName: {
                type: "string",
            },
        },
    },
};

export default offerSchemas;