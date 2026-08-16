import "dotenv/config";
import { z } from "zod";
import {
    AiFeatureType,
    AiExecutionStatus,
    AiErrorCategory,
} from "../src/modules/ai/types/optimization.types";
import {
    classifyAiError,
    isAiErrorRetryable,
    getRetryDecision,
} from "../src/modules/ai/infrastructure/error-classifier";
import {
    AiCacheManager,
} from "../src/modules/ai/infrastructure/ai-cache";
import {
    AiRequestDeduplicator,
} from "../src/modules/ai/infrastructure/ai-deduplicator";
import {
    AiExecutor,
} from "../src/modules/ai/infrastructure/ai-executor";
import {
    AiOptimizationService,
} from "../src/modules/ai/services/ai-optimization.service";
import {
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
} from "../src/shared/errors";
import { SafeCandidate } from "../src/modules/candidates/candidate.types";
import { SafeJob } from "../src/modules/jobs/job.types";
import { prisma } from "../src/config/prisma";
import { JobStatus } from "@prisma/client";

// Test assertion helper
function assert(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(`Assertion Failed: ${message}`);
    }
}

async function assertThrows(
    fn: () => Promise<unknown>,
    expectedErrorType?: unknown,
    messageContains?: string
): Promise<void> {
    try {
        await fn();
        throw new Error("Expected function to throw, but it succeeded.");
    } catch (error: unknown) {
        if (expectedErrorType) {
            if (typeof expectedErrorType === "function") {
                const constructorFn = expectedErrorType as new (...args: unknown[]) => Error;
                assert(
                    error instanceof constructorFn,
                    `Expected error of type ${constructorFn.name}, got ${(error as Error)?.name || error}`
                );
            }
        }
        if (messageContains) {
            const actualMsg = (error as Error)?.message || String(error);
            assert(
                actualMsg.toLowerCase().includes(messageContains.toLowerCase()),
                `Expected error message to contain "${messageContains}", got "${actualMsg}"`
            );
        }
    }
}

async function runOptimizationTests() {
    console.log("\n=======================================================");
    console.log("🚀 STARTING HIRESTACK AI OPTIMIZATION INTEGRATION TEST SUITE");
    console.log("=======================================================\n");

    const cacheManager = new AiCacheManager();
    const deduplicator = new AiRequestDeduplicator();
    const executor = new AiExecutor();
    const optimizationService = new AiOptimizationService();

    // -------------------------------------------------------------
    // TEST SUITE 1: ERROR CLASSIFICATION & RETRY POLICY
    // -------------------------------------------------------------
    console.log("--- TEST SUITE 1: ERROR CLASSIFICATION & RETRY POLICY ---");

    console.log("TEST 1.1: Error classification mapping");
    // Timeout
    const timeoutErr = new Error("Request timed out after 60000ms");
    timeoutErr.name = "TimeoutError";
    assert(classifyAiError(timeoutErr) === AiErrorCategory.TIMEOUT, "Timeout error classified as TIMEOUT");
    assert(isAiErrorRetryable(AiErrorCategory.TIMEOUT), "TIMEOUT is retryable");

    // Connection failures
    const connErr = new Error("connect ECONNREFUSED 127.0.0.1:11434");
    assert(classifyAiError(connErr) === AiErrorCategory.CONNECTION_FAILURE, "ECONNREFUSED classified as CONNECTION_FAILURE");
    assert(isAiErrorRetryable(AiErrorCategory.CONNECTION_FAILURE), "CONNECTION_FAILURE is retryable");

    const fetchErr = new Error("fetch failed: network error");
    assert(classifyAiError(fetchErr) === AiErrorCategory.CONNECTION_FAILURE, "Fetch failed classified as CONNECTION_FAILURE");

    // Service unavailable (503)
    const svcErr = new Error("503 Service Unavailable");
    assert(classifyAiError(svcErr) === AiErrorCategory.SERVICE_UNAVAILABLE, "503 classified as SERVICE_UNAVAILABLE");
    assert(isAiErrorRetryable(AiErrorCategory.SERVICE_UNAVAILABLE), "SERVICE_UNAVAILABLE is retryable");

    // Rate limit (429)
    const rateErr = new Error("429 Too Many Requests");
    assert(classifyAiError(rateErr) === AiErrorCategory.RATE_LIMIT, "429 classified as RATE_LIMIT");
    assert(isAiErrorRetryable(AiErrorCategory.RATE_LIMIT), "RATE_LIMIT is retryable");

    // Invalid JSON
    const jsonErr = new ValidationError("Failed to parse response from AI model as valid JSON.");
    assert(classifyAiError(jsonErr) === AiErrorCategory.INVALID_JSON, "JSON error classified as INVALID_JSON");
    assert(!isAiErrorRetryable(AiErrorCategory.INVALID_JSON), "INVALID_JSON is non-retryable");

    const syntaxErr = new SyntaxError("Unexpected token in JSON");
    assert(classifyAiError(syntaxErr) === AiErrorCategory.INVALID_JSON, "SyntaxError classified as INVALID_JSON");

    // Schema validation failure
    const zodSchema = z.object({ requiredField: z.string() });
    try {
        zodSchema.parse({});
    } catch (zodErr) {
        assert(classifyAiError(zodErr) === AiErrorCategory.SCHEMA_VALIDATION_FAILURE, "ZodError classified as SCHEMA_VALIDATION_FAILURE");
        assert(!isAiErrorRetryable(AiErrorCategory.SCHEMA_VALIDATION_FAILURE), "SCHEMA_VALIDATION_FAILURE is non-retryable");
    }

    // Authorization failures
    const authErr = new ForbiddenError("You do not have permission to perform this action");
    assert(classifyAiError(authErr) === AiErrorCategory.AUTHORIZATION_FAILURE, "ForbiddenError classified as AUTHORIZATION_FAILURE");
    assert(!isAiErrorRetryable(AiErrorCategory.AUTHORIZATION_FAILURE), "AUTHORIZATION_FAILURE is non-retryable");

    const unauthErr = new UnauthorizedError("Unauthorized access token");
    assert(classifyAiError(unauthErr) === AiErrorCategory.AUTHORIZATION_FAILURE, "UnauthorizedError classified as AUTHORIZATION_FAILURE");

    // Input validation & not found
    const valErr = new ValidationError("Resume text is required");
    assert(classifyAiError(valErr) === AiErrorCategory.INPUT_VALIDATION_FAILURE, "ValidationError classified as INPUT_VALIDATION_FAILURE");
    assert(!isAiErrorRetryable(AiErrorCategory.INPUT_VALIDATION_FAILURE), "INPUT_VALIDATION_FAILURE is non-retryable");

    const notFoundErr = new NotFoundError("Candidate not found");
    assert(classifyAiError(notFoundErr) === AiErrorCategory.INPUT_VALIDATION_FAILURE, "NotFoundError classified as INPUT_VALIDATION_FAILURE");

    // Unknown error
    const genericErr = new Error("Something strange happened");
    assert(classifyAiError(genericErr) === AiErrorCategory.UNKNOWN, "Generic error classified as UNKNOWN");
    assert(!isAiErrorRetryable(AiErrorCategory.UNKNOWN), "UNKNOWN is non-retryable");
    console.log("   ✅ Error classification and retry eligibility strictly verified.");

    console.log("TEST 1.2: Retry decision calculation & bounded backoff");
    // Transient error on attempt 1 of 3
    const dec1 = getRetryDecision(connErr, 1, 3, 500);
    assert(dec1.shouldRetry === true, "Transient error on attempt 1 should retry");
    assert(dec1.attempt === 1, "Attempt must be 1");
    assert(dec1.backoffMs === 500, "Backoff on attempt 1 should be baseBackoff (500ms)");

    // Transient error on attempt 2 of 3 (exponential increase)
    const dec2 = getRetryDecision(connErr, 2, 3, 500);
    assert(dec2.shouldRetry === true, "Transient error on attempt 2 should retry");
    assert(dec2.backoffMs === 1000, "Backoff on attempt 2 should be 1000ms (500 * 2^1)");

    // Transient error on attempt 3 of 3 (exhaustion)
    const dec3 = getRetryDecision(connErr, 3, 3, 500);
    assert(dec3.shouldRetry === false, "Transient error on attempt 3 (max=3) must NOT retry");
    assert(dec3.backoffMs === 0, "Exhausted backoff must be 0");

    // Permanent error on attempt 1
    const decPerm = getRetryDecision(jsonErr, 1, 3, 500);
    assert(decPerm.shouldRetry === false, "Permanent error must NOT retry");
    assert(decPerm.backoffMs === 0, "Permanent error backoff must be 0");

    // maxRetries = 0
    const decZero = getRetryDecision(connErr, 1, 0, 500);
    assert(decZero.shouldRetry === false, "maxRetries = 0 must NOT retry");
    console.log("   ✅ Retry decision and backoff boundaries verified.");

    // -------------------------------------------------------------
    // TEST SUITE 2: AI EXECUTOR (TIMEOUT, RETRY, TIMER CLEANUP)
    // -------------------------------------------------------------
    console.log("\n--- TEST SUITE 2: AI EXECUTOR (TIMEOUT, RETRY, BACKOFF, CLEANUP) ---");

    console.log("TEST 2.1: Successful execution on first attempt");
    const successResult = await executor.executeWithRetry(
        async () => "AI_RESPONSE_CONTENT_OK",
        {
            feature: AiFeatureType.ATS_SCORE,
            model: "llama3.2",
            promptVersion: "1.0.0",
            timeoutMs: 5000,
            maxRetries: 2,
            retryBackoffMs: 50,
        }
    );
    assert(successResult.result === "AI_RESPONSE_CONTENT_OK", "Must return correct result");
    assert(successResult.metadata.retryCount === 0, "Retry count must be 0");
    assert(successResult.metadata.status === AiExecutionStatus.SUCCESS, "Status must be SUCCESS");
    console.log("   ✅ First attempt success verified.");

    console.log("TEST 2.2: Transient retryable failure then success");
    let attemptsCount = 0;
    const retryThenSuccess = await executor.executeWithRetry(
        async (attempt) => {
            attemptsCount++;
            if (attempt === 1) {
                throw new Error("connect ECONNREFUSED 127.0.0.1:11434");
            }
            return "RETRY_SUCCESS_RESULT";
        },
        {
            feature: AiFeatureType.JOB_MATCHING,
            model: "llama3.2",
            promptVersion: "1.0.0",
            timeoutMs: 5000,
            maxRetries: 2,
            retryBackoffMs: 10,
        }
    );
    assert(attemptsCount === 2, "Must have executed 2 attempts");
    assert(retryThenSuccess.result === "RETRY_SUCCESS_RESULT", "Must return result after retry");
    assert(retryThenSuccess.metadata.retryCount === 1, "Retry count must be 1");
    assert(retryThenSuccess.metadata.status === AiExecutionStatus.SUCCESS, "Status must be SUCCESS");
    console.log("   ✅ Transient failure recovery via retry verified.");

    console.log("TEST 2.3: Retryable failure until exhaustion");
    let exhaustionAttempts = 0;
    await assertThrows(
        () =>
            executor.executeWithRetry(
                async () => {
                    exhaustionAttempts++;
                    throw new Error("503 Service Unavailable");
                },
                {
                    feature: AiFeatureType.AI_INSIGHTS,
                    model: "llama3.2",
                    promptVersion: "1.0.0",
                    timeoutMs: 5000,
                    maxRetries: 2,
                    retryBackoffMs: 10,
                }
            ),
        Error,
        "503 Service Unavailable"
    );
    assert(exhaustionAttempts === 3, `Expected 3 total attempts (1 initial + 2 retries), got ${exhaustionAttempts}`);
    console.log("   ✅ Retry exhaustion boundary strictly enforced.");

    console.log("TEST 2.4: Permanent non-retryable failure (fails immediately with 0 retries)");
    let permAttempts = 0;
    await assertThrows(
        () =>
            executor.executeWithRetry(
                async () => {
                    permAttempts++;
                    throw new ValidationError("Failed to parse response from AI model as valid JSON.");
                },
                {
                    feature: AiFeatureType.RESUME_RECOMMENDATIONS,
                    model: "llama3.2",
                    promptVersion: "1.0.0",
                    timeoutMs: 5000,
                    maxRetries: 2,
                    retryBackoffMs: 10,
                }
            ),
        ValidationError
    );
    assert(permAttempts === 1, `Permanent failure must only execute 1 attempt, got ${permAttempts}`);
    console.log("   ✅ Permanent failure fast-exit verified.");

    console.log("TEST 2.5: Timeout execution and timer cleanup");
    const timeoutStart = Date.now();
    await assertThrows(
        () =>
            executor.executeWithTimeout(
                () => new Promise((resolve) => setTimeout(() => resolve("NEVER"), 1000)),
                50,
                "AI execution timed out after 50ms"
            ),
        Error,
        "timed out after 50ms"
    );
    const timeoutElapsed = Date.now() - timeoutStart;
    assert(timeoutElapsed < 500, `Timeout should resolve near 50ms, elapsed: ${timeoutElapsed}ms`);
    console.log("   ✅ Timeout enforcement and cleanup verified.");

    // -------------------------------------------------------------
    // TEST SUITE 3: AI CACHE MANAGER (DETERMINISTIC KEYS, TTL, EVICTION, ISOLATION)
    // -------------------------------------------------------------
    console.log("\n--- TEST SUITE 3: AI CACHE MANAGER ---");

    console.log("TEST 3.1: Cache miss, write, and read");
    cacheManager.clear();
    assert(cacheManager.get("non-existent-key") === null, "Cache miss must return null");

    const sampleMetadata = {
        feature: AiFeatureType.ATS_SCORE,
        model: "llama3.2",
        promptVersion: "1.0.0",
        durationMs: 150,
        retryCount: 0,
        cacheHit: false,
        status: AiExecutionStatus.SUCCESS,
    };

    cacheManager.set("test-key-1", { score: 95 }, 60, sampleMetadata);
    const readEntry = cacheManager.get<{ score: number }>("test-key-1");
    assert(readEntry !== null, "Entry must exist in cache");
    assert(readEntry!.data.score === 95, "Cached data must match");
    assert(readEntry!.metadata.cacheHit === true, "Retrieved metadata cacheHit must be true");
    console.log("   ✅ Cache write and read verified.");

    console.log("TEST 3.2: Cache TTL expiration & eviction");
    // Store with 0 second TTL (immediately expired)
    cacheManager.set("expired-key", { score: 50 }, -1, sampleMetadata);
    assert(cacheManager.get("expired-key") === null, "Expired cache entry must return null and be evicted");
    console.log("   ✅ Cache TTL expiration verified.");

    console.log("TEST 3.3: Deterministic Cache Key Generation & Configuration Separation");
    const inputHashA = cacheManager.generateInputHash("Candidate Resume Text Profile A");
    const inputHashB = cacheManager.generateInputHash("Candidate Resume Text Profile B");

    // Test A — Identical components -> Identical key
    const key1 = cacheManager.buildCacheKey({
        feature: AiFeatureType.ATS_SCORE,
        companyId: "clcompany0001",
        candidateId: "clcandidate0001",
        jobId: "cljob0001",
        promptVersion: "1.0.0",
        model: "llama3.2",
        temperature: 0.2,
        inputHash: inputHashA,
    });

    const key1Duplicate = cacheManager.buildCacheKey({
        feature: AiFeatureType.ATS_SCORE,
        companyId: "clcompany0001",
        candidateId: "clcandidate0001",
        jobId: "cljob0001",
        promptVersion: "1.0.0",
        model: "llama3.2",
        temperature: 0.2,
        inputHash: inputHashA,
    });
    assert(key1 === key1Duplicate, "Test A: Identical components must generate identical cache key");

    // Test B — Temperature separation (0.2 vs 0.8)
    const keyDiffTemp = cacheManager.buildCacheKey({
        feature: AiFeatureType.ATS_SCORE,
        companyId: "clcompany0001",
        candidateId: "clcandidate0001",
        jobId: "cljob0001",
        promptVersion: "1.0.0",
        model: "llama3.2",
        temperature: 0.8,
        inputHash: inputHashA,
    });
    assert(key1 !== keyDiffTemp, "Test B: Different temperatures (0.2 vs 0.8) must generate different keys");

    // Test C — Model separation
    const keyDiffModel = cacheManager.buildCacheKey({
        feature: AiFeatureType.ATS_SCORE,
        companyId: "clcompany0001",
        candidateId: "clcandidate0001",
        jobId: "cljob0001",
        promptVersion: "1.0.0",
        model: "llama3.3-70b",
        temperature: 0.2,
        inputHash: inputHashA,
    });
    assert(key1 !== keyDiffModel, "Test C: Different AI models must generate different keys");

    // Test D — Prompt version separation
    const keyDiffVersion = cacheManager.buildCacheKey({
        feature: AiFeatureType.ATS_SCORE,
        companyId: "clcompany0001",
        candidateId: "clcandidate0001",
        jobId: "cljob0001",
        promptVersion: "1.1.0",
        model: "llama3.2",
        temperature: 0.2,
        inputHash: inputHashA,
    });
    assert(key1 !== keyDiffVersion, "Test D: Different prompt versions (1.0.0 vs 1.1.0) must generate different keys");

    // Test E — Tenant separation
    const keyDiffTenant = cacheManager.buildCacheKey({
        feature: AiFeatureType.ATS_SCORE,
        companyId: "clcompany0002",
        candidateId: "clcandidate0001",
        jobId: "cljob0001",
        promptVersion: "1.0.0",
        model: "llama3.2",
        temperature: 0.2,
        inputHash: inputHashA,
    });
    assert(key1 !== keyDiffTenant, "Test E: Different tenants must generate different keys");

    // Test F — Job separation
    const keyDiffJob = cacheManager.buildCacheKey({
        feature: AiFeatureType.ATS_SCORE,
        companyId: "clcompany0001",
        candidateId: "clcandidate0001",
        jobId: "cljob0002",
        promptVersion: "1.0.0",
        model: "llama3.2",
        temperature: 0.2,
        inputHash: inputHashA,
    });
    assert(key1 !== keyDiffJob, "Test F: Different jobs must generate different keys");

    // Test G — Input separation
    const keyDiffInput = cacheManager.buildCacheKey({
        feature: AiFeatureType.ATS_SCORE,
        companyId: "clcompany0001",
        candidateId: "clcandidate0001",
        jobId: "cljob0001",
        promptVersion: "1.0.0",
        model: "llama3.2",
        temperature: 0.2,
        inputHash: inputHashB,
    });
    assert(key1 !== keyDiffInput, "Test G: Different input hashes must generate different cache keys");

    // Feature separation
    const keyDiffFeature = cacheManager.buildCacheKey({
        feature: AiFeatureType.JOB_MATCHING,
        companyId: "clcompany0001",
        candidateId: "clcandidate0001",
        jobId: "cljob0001",
        promptVersion: "1.0.0",
        model: "llama3.2",
        temperature: 0.2,
        inputHash: inputHashA,
    });
    assert(key1 !== keyDiffFeature, "Different AI features must generate different keys");
    console.log("   ✅ Cache key determinism and component separation across all 7 dimensions verified.");

    console.log("TEST 3.4: Real Cache Isolation Under Temperature Changes");
    cacheManager.clear();
    cacheManager.set(key1, { evaluation: "TEMP_0.2_EVAL" }, 300, sampleMetadata);

    // Query with temp 0.8 key -> Cache Miss
    assert(cacheManager.get(keyDiffTemp) === null, "Temperature 0.8 lookup must be a cache miss when 0.2 is stored");

    // Store temp 0.8 result
    cacheManager.set(keyDiffTemp, { evaluation: "TEMP_0.8_EVAL" }, 300, sampleMetadata);

    // Both coexist independently
    const res02 = cacheManager.get<{ evaluation: string }>(key1);
    const res08 = cacheManager.get<{ evaluation: string }>(keyDiffTemp);
    assert(res02 !== null && res02.data.evaluation === "TEMP_0.2_EVAL", "Temp 0.2 returns its own cached output");
    assert(res08 !== null && res08.data.evaluation === "TEMP_0.8_EVAL", "Temp 0.8 returns its own cached output");
    console.log("   ✅ Real cache behavior with temperature separation verified.");

    // -------------------------------------------------------------
    // TEST SUITE 4: MULTI-TENANT ISOLATION
    // -------------------------------------------------------------
    console.log("\n--- TEST SUITE 4: MULTI-TENANT ISOLATION ---");

    console.log("TEST 4.1: Cross-tenant company boundary separation");
    const keyCompanyA = cacheManager.buildCacheKey({
        feature: AiFeatureType.AI_INSIGHTS,
        companyId: "clcomp000000000000000000a",
        candidateId: "clcand000000000000000000x",
        jobId: "cljob00000000000000000000y",
        promptVersion: "1.0.0",
        model: "llama3.2",
        temperature: 0.2,
        inputHash: inputHashA,
    });

    const keyCompanyB = cacheManager.buildCacheKey({
        feature: AiFeatureType.AI_INSIGHTS,
        companyId: "clcomp000000000000000000b",
        candidateId: "clcand000000000000000000x",
        jobId: "cljob00000000000000000000y",
        promptVersion: "1.0.0",
        model: "llama3.2",
        temperature: 0.2,
        inputHash: inputHashA,
    });

    assert(keyCompanyA !== keyCompanyB, "Company A and Company B must generate strictly different cache keys");

    // Store Company A data in cache
    cacheManager.set(keyCompanyA, { insight: "Company A candidate insight" }, 300, sampleMetadata);

    // Query Company B key
    const compBRead = cacheManager.get(keyCompanyB);
    assert(compBRead === null, "Company B must NOT access cached evaluation of Company A");

    const compARead = cacheManager.get<{ insight: string }>(keyCompanyA);
    assert(compARead !== null && compARead.data.insight === "Company A candidate insight", "Company A must receive its own cache");
    console.log("   ✅ Multi-tenant company cache boundary strictly verified.");

    // -------------------------------------------------------------
    // TEST SUITE 5: REQUEST DEDUPLICATOR
    // -------------------------------------------------------------
    console.log("\n--- TEST SUITE 5: REQUEST DEDUPLICATOR ---");

    console.log("TEST 5.1: Concurrent identical requests deduplication");
    deduplicator.clear();
    let factoryExecutions = 0;

    const slowFactory = async () => {
        factoryExecutions++;
        await new Promise((resolve) => setTimeout(resolve, 50));
        return { evaluation: "SHARED_RESULT" };
    };

    // Trigger 3 concurrent requests simultaneously with identical key
    const [req1, req2, req3] = await Promise.all([
        deduplicator.executeOrDeduplicate("dedup-key-1", slowFactory),
        deduplicator.executeOrDeduplicate("dedup-key-1", slowFactory),
        deduplicator.executeOrDeduplicate("dedup-key-1", slowFactory),
    ]);

    assert(factoryExecutions === 1, `Factory must only execute ONCE for 3 concurrent requests, ran ${factoryExecutions} times`);
    assert(req1.result.evaluation === "SHARED_RESULT", "Req 1 must receive shared result");
    assert(req2.result.evaluation === "SHARED_RESULT", "Req 2 must receive shared result");
    assert(req3.result.evaluation === "SHARED_RESULT", "Req 3 must receive shared result");
    assert(!req1.deduplicated, "First request is the primary execution");
    assert(req2.deduplicated, "Second request joined in-flight execution");
    assert(req3.deduplicated, "Third request joined in-flight execution");
    assert(deduplicator.getInFlightCount() === 0, "In-flight lock must be cleared after resolution");
    console.log("   ✅ Concurrent request deduplication verified.");

    console.log("TEST 5.2: In-flight lock release after failure");
    let failureExecutions = 0;
    const failingFactory = async () => {
        failureExecutions++;
        await new Promise((resolve) => setTimeout(resolve, 20));
        throw new Error("AI Execution Simulated Failure");
    };

    await assertThrows(
        () =>
            Promise.all([
                deduplicator.executeOrDeduplicate("dedup-fail-key", failingFactory),
                deduplicator.executeOrDeduplicate("dedup-fail-key", failingFactory),
            ]),
        Error,
        "AI Execution Simulated Failure"
    );

    assert(deduplicator.getInFlightCount() === 0, "In-flight lock must be cleared even after rejection");
    assert(failureExecutions === 1 || failureExecutions === 2, "Failing factory must have executed");

    // Subsequent request must be able to execute normally
    const subsequent = await deduplicator.executeOrDeduplicate("dedup-fail-key", async () => "SUBSEQUENT_OK");
    assert(subsequent.result === "SUBSEQUENT_OK", "Subsequent request after failure must execute normally");
    console.log("   ✅ In-flight lock release after failure verified.");

    console.log("TEST 5.3: Context separation in deduplication (different jobs / companies run independently)");
    let execCountJob1 = 0;
    let execCountJob2 = 0;
    const [resJob1, resJob2] = await Promise.all([
        deduplicator.executeOrDeduplicate("ai:ATS:compA:candX:job1:1.0:llama3.2:hash", async () => {
            execCountJob1++;
            return "JOB_1_EVAL";
        }),
        deduplicator.executeOrDeduplicate("ai:ATS:compA:candX:job2:1.0:llama3.2:hash", async () => {
            execCountJob2++;
            return "JOB_2_EVAL";
        }),
    ]);
    assert(execCountJob1 === 1 && execCountJob2 === 1, "Different jobs must execute independently");
    assert(resJob1.result === "JOB_1_EVAL" && resJob2.result === "JOB_2_EVAL", "Results must match respective jobs");

    let execCountCompA = 0;
    let execCountCompB = 0;
    const [resCompA, resCompB] = await Promise.all([
        deduplicator.executeOrDeduplicate("ai:MATCH:compA:candX:job1:1.0:llama3.2:hash", async () => {
            execCountCompA++;
            return "COMP_A_EVAL";
        }),
        deduplicator.executeOrDeduplicate("ai:MATCH:compB:candX:job1:1.0:llama3.2:hash", async () => {
            execCountCompB++;
            return "COMP_B_EVAL";
        }),
    ]);
    assert(execCountCompA === 1 && execCountCompB === 1, "Different companies must execute independently");
    assert(resCompA.result === "COMP_A_EVAL" && resCompB.result === "COMP_B_EVAL", "Results must match respective companies");
    console.log("   ✅ Deduplication context separation verified.");

    // -------------------------------------------------------------
    // TEST SUITE 6: AI OPTIMIZATION SERVICE ORCHESTRATION
    // -------------------------------------------------------------
    console.log("\n--- TEST SUITE 6: AI OPTIMIZATION SERVICE ORCHESTRATION ---");

    const mockCandidate: SafeCandidate = {
        id: "clcand1234567890abcdef01",
        companyId: "clcomp1234567890abcdef01",
        candidateCode: "CAN-001",
        firstName: "Optimization",
        lastName: "Candidate",
        email: "opt-test@example.com",
        isActive: true,
        createdBy: "cluser1234567890abcdef01",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockJob: SafeJob = {
        id: "cljob1234567890abcdef01",
        companyId: "clcomp1234567890abcdef01",
        jobCode: "JOB-001",
        title: "Staff Systems Engineer",
        description: "Systems job description",
        status: JobStatus.PUBLISHED,
        isActive: true,
        createdBy: "cluser1234567890abcdef01",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockPromptConfig = {
        name: "ats-score-prompt",
        version: "1.0.0",
        template: "Evaluate candidate against job",
    };

    const testSchema = z.object({
        overallScore: z.number(),
        summary: z.string(),
    });

    console.log("TEST 6.1: Full optimization evaluation lifecycle with caching enabled");
    let aiCalls = 0;
    const testEvaluator = async () => {
        aiCalls++;
        return {
            overallScore: 88,
            summary: "Strong distributed systems background",
        };
    };

    // First call: executes AI, populates cache
    const eval1 = await optimizationService.optimizeEvaluation({
        candidate: mockCandidate,
        job: mockJob,
        promptConfig: mockPromptConfig,
        userPrompt: "User prompt payload for test",
        schema: testSchema,
        executeAi: testEvaluator,
        customConfig: {
            enableCaching: true,
            cacheTtlSeconds: 60,
            enableDeduplication: true,
        },
    });

    assert(eval1.overallScore === 88, "First call returned score 88");
    assert(aiCalls === 1, "First call executed AI evaluator");

    // Second call with same candidate/job: cache hit, zero new AI calls
    const eval2 = await optimizationService.optimizeEvaluation({
        candidate: mockCandidate,
        job: mockJob,
        promptConfig: mockPromptConfig,
        userPrompt: "User prompt payload for test",
        schema: testSchema,
        executeAi: testEvaluator,
        customConfig: {
            enableCaching: true,
            cacheTtlSeconds: 60,
            enableDeduplication: true,
        },
    });

    assert(eval2.overallScore === 88, "Second call returned cached score 88");
    assert(aiCalls === 1, `Second call must reuse cache without executing AI again (aiCalls: ${aiCalls})`);
    console.log("   ✅ AI optimization caching lifecycle verified.");

    console.log("TEST 6.2: Disabled cache bypasses storage and lookup");
    let disabledAiCalls = 0;
    const evalDisabled1 = await optimizationService.optimizeEvaluation({
        candidate: mockCandidate,
        job: mockJob,
        promptConfig: { ...mockPromptConfig, name: "job-matching-prompt" },
        userPrompt: "Disabled cache test prompt",
        schema: testSchema,
        executeAi: async () => {
            disabledAiCalls++;
            return { overallScore: 75, summary: "No-cache eval" };
        },
        customConfig: {
            enableCaching: false,
        },
    });
    assert(evalDisabled1.overallScore === 75, "Disabled cache call 1 succeeded");
    assert(disabledAiCalls === 1, "Disabled cache call 1 executed AI");

    const evalDisabled2 = await optimizationService.optimizeEvaluation({
        candidate: mockCandidate,
        job: mockJob,
        promptConfig: { ...mockPromptConfig, name: "job-matching-prompt" },
        userPrompt: "Disabled cache test prompt",
        schema: testSchema,
        executeAi: async () => {
            disabledAiCalls++;
            return { overallScore: 75, summary: "No-cache eval" };
        },
        customConfig: {
            enableCaching: false,
        },
    });
    assert(evalDisabled2.overallScore === 75, "Disabled cache call 2 succeeded");
    assert(disabledAiCalls === 2, "Disabled cache call 2 executed AI independently");
    console.log("   ✅ Cache bypass verified.");

    // -------------------------------------------------------------
    // TEST SUITE 7: DATABASE PERSISTENCE SAFETY
    // -------------------------------------------------------------
    console.log("\n--- TEST SUITE 7: DATABASE PERSISTENCE SAFETY ---");

    console.log("TEST 7.1: AI evaluation failure prevents dirty database persistence");
    const preATSCount = await prisma.aTSScore.count();
    const preInsightsCount = await prisma.aiInsight.count();

    await assertThrows(
        () =>
            optimizationService.optimizeEvaluation({
                candidate: mockCandidate,
                job: mockJob,
                promptConfig: mockPromptConfig,
                userPrompt: "Fail test prompt",
                schema: testSchema,
                executeAi: async () => {
                    throw new ValidationError("Failed to parse response from AI model as valid JSON.");
                },
                customConfig: {
                    enableCaching: false,
                },
            }),
        ValidationError
    );

    const postATSCount = await prisma.aTSScore.count();
    const postInsightsCount = await prisma.aiInsight.count();

    assert(preATSCount === postATSCount, "ATS Score database count must remain unchanged after AI failure");
    assert(preInsightsCount === postInsightsCount, "AI Insights database count must remain unchanged after AI failure");
    console.log("   ✅ Database persistence safety on failure verified.");

    console.log("\n=======================================================");
    console.log("🎉 ALL AI OPTIMIZATION INTEGRATION TESTS PASSED SUCCESSFULLY!");
    console.log("=======================================================\n");
}

if (require.main === module) {
    runOptimizationTests()
        .then(() => {
            console.log("AI Optimization test run completed.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("❌ AI Optimization test failed:", err);
            process.exit(1);
        });
}

export { runOptimizationTests };
