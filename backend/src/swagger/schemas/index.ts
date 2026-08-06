import commonSchemas from "./common.schema";
import authSchemas from "./auth.schema";
import userSchemas from "./user.schema";
import companySchemas from "./company.schema";
import departmentSchemas from "./department.schema";
import recruiterSchemas from "./recruiter.schema";
import candidateSchemas from "./candidate.schema";
import jobSchemas from "./job.schema";
import applicationSchemas from "./application.schema";
import interviewSchemas from "./interview.schema";
import offerSchemas from "./offer.schema";
import pipelineSchemas from "./pipeline.schema";
import { aiSwaggerSchemas } from "../../modules/ai/swagger/ai.schemas";


const schemas = {
    ...commonSchemas,
    ...authSchemas,
    ...userSchemas,
    ...companySchemas,
    ...departmentSchemas,
    ...recruiterSchemas,
    ...candidateSchemas,
    ...jobSchemas,
    ...applicationSchemas,
    ...interviewSchemas,
    ...offerSchemas,
    ...pipelineSchemas,
    ...aiSwaggerSchemas,
};

export default schemas;