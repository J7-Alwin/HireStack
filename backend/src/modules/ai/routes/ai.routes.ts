import { Router } from "express";

import { asyncHandler } from "../../../middleware/async.middleware";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { Role } from "../../../shared/enums/role.enum";

import { aiController } from "../controllers/ai.controller";
import { resumeUpload } from "../utils/upload";

const router = Router();

router.use(authMiddleware);

router.get(
    "/health",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    asyncHandler(aiController.healthCheck)
);

router.post(
    "/resume/parse",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    resumeUpload.single("resume"),
    asyncHandler(aiController.parseResume)
);

router.post(
    "/ats-score",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    asyncHandler(aiController.atsScore)
);

router.post(
    "/job-matching",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    asyncHandler(aiController.generateJobMatching)
);

router.get(
    "/job-matching/:jobId",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    asyncHandler(aiController.getJobMatchingHistory)
);

router.get(
    "/job-matching/:jobId/:candidateId",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    asyncHandler(aiController.getCandidateMatchDetails)
);

// Resume Recommendations Endpoints
router.post(
    "/resume-recommendations",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER, Role.CANDIDATE),
    asyncHandler(aiController.generateGeneralRecommendations)
);

router.post(
    "/resume-recommendations/job",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER, Role.CANDIDATE),
    asyncHandler(aiController.generateJobRecommendations)
);

router.get(
    "/resume-recommendations/history/:candidateId",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER, Role.CANDIDATE),
    asyncHandler(aiController.getRecommendationsHistory)
);

router.get(
    "/resume-recommendations/:id",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER, Role.CANDIDATE),
    asyncHandler(aiController.getRecommendationDetails)
);

// AI Interview Assistant Endpoints
router.post(
    "/interview",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER, Role.CANDIDATE),
    asyncHandler(aiController.generateGeneralInterview)
);

router.post(
    "/interview/job",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER, Role.CANDIDATE),
    asyncHandler(aiController.generateJobInterview)
);

router.get(
    "/interview/history/:candidateId",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER, Role.CANDIDATE),
    asyncHandler(aiController.getInterviewHistory)
);

router.get(
    "/interview/:id",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER, Role.CANDIDATE),
    asyncHandler(aiController.getInterviewDetails)
);

// AI Insights Endpoints
router.post(
    "/insights",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    asyncHandler(aiController.generateInsights)
);

router.get(
    "/insights/history/:candidateId",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    asyncHandler(aiController.getInsightsHistory)
);

router.get(
    "/insights/:id",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    asyncHandler(aiController.getInsightsDetails)
);

export default router;