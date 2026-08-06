import { Router } from "express";

import { asyncHandler } from "../../../middleware/async.middleware";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { authorizeRoles } from "../../../middleware/role.middleware";
import { Role } from "../../../shared/enums/role.enum";

import { aiController } from "../controllers/ai.controller";
import { resumeUpload } from "../utils/upload";

const router = Router();

router.use(authMiddleware);

router.post(
    "/resume/parse",
    authorizeRoles(Role.COMPANY_ADMIN, Role.RECRUITER),
    resumeUpload.single("resume"),
    asyncHandler(aiController.parseResume)
);

export default router;