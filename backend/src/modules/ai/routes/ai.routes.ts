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

export default router;