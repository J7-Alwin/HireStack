import "dotenv/config";
import { prisma } from "../src/config/prisma";
import { Role } from "@prisma/client";
import { AccountStatus } from "../src/shared/enums/status.enum";
import { generateAccessToken } from "../src/shared/jwt/access-token";
import app from "../src/app";

interface DepartmentOption {
  id: string;
  name: string;
}

interface SuccessResponse {
  success: boolean;
  message: string;
  data: DepartmentOption[];
}

interface ErrorDetails {
  field?: string;
  message: string;
}

interface FailureResponse {
  success: boolean;
  message: string;
  errors?: ErrorDetails[];
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runTests() {
  console.log("🚀 Starting Departments Module Integration Tests...\n");

  console.log("📦 Seeding test database entities...");
  const companyA = await prisma.company.create({
    data: { name: `Test Dept Company A ${Date.now()}` },
  });
  const companyB = await prisma.company.create({
    data: { name: `Test Dept Company B ${Date.now()}` },
  });
  const companyC = await prisma.company.create({
    data: { name: `Test Dept Company C ${Date.now()}` },
  });

  // Seed Departments in Company A
  // We need at least 3 active departments, 1 inactive, 1 deleted
  const deptA1 = await prisma.department.create({
    data: { name: "Engineering A", companyId: companyA.id, isActive: true },
  });
  const deptA2 = await prisma.department.create({
    data: { name: "HR A", companyId: companyA.id, isActive: true },
  });
  const deptA3 = await prisma.department.create({
    data: { name: "Finance A", companyId: companyA.id, isActive: true },
  });
  const deptAInactive = await prisma.department.create({
    data: { name: "Old Sales A", companyId: companyA.id, isActive: false },
  });
  const deptADeleted = await prisma.department.create({
    data: { name: "Archived R&D A", companyId: companyA.id, isActive: true, deletedAt: new Date() },
  });

  // Seed active Department in Company B
  const deptB1 = await prisma.department.create({
    data: { name: "Engineering B", companyId: companyB.id, isActive: true },
  });

  // Company C has no departments

  // Create Users
  const superAdminUser = await prisma.user.create({
    data: {
      email: `dept-super-${Date.now()}@test.com`,
      password: "password123",
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });

  const adminAUser = await prisma.user.create({
    data: {
      email: `dept-adminA-${Date.now()}@test.com`,
      password: "password123",
      role: Role.COMPANY_ADMIN,
      companyId: companyA.id,
      isActive: true,
    },
  });

  const recruiterAUser = await prisma.user.create({
    data: {
      email: `dept-recA-${Date.now()}@test.com`,
      password: "password123",
      role: Role.RECRUITER,
      companyId: companyA.id,
      isActive: true,
    },
  });

  const adminCUser = await prisma.user.create({
    data: {
      email: `dept-adminC-${Date.now()}@test.com`,
      password: "password123",
      role: Role.COMPANY_ADMIN,
      companyId: companyC.id,
      isActive: true,
    },
  });

  // Generate Tokens
  const tokenSuper = generateAccessToken({
    id: superAdminUser.id,
    email: superAdminUser.email,
    role: Role.SUPER_ADMIN,
    status: AccountStatus.ACTIVE,
  });

  const tokenAdminA = generateAccessToken({
    id: adminAUser.id,
    email: adminAUser.email,
    role: Role.COMPANY_ADMIN,
    status: AccountStatus.ACTIVE,
    companyId: companyA.id,
  });

  const tokenRecruiterA = generateAccessToken({
    id: recruiterAUser.id,
    email: recruiterAUser.email,
    role: Role.RECRUITER,
    status: AccountStatus.ACTIVE,
    companyId: companyA.id,
  });

  const tokenAdminC = generateAccessToken({
    id: adminCUser.id,
    email: adminCUser.email,
    role: Role.COMPANY_ADMIN,
    status: AccountStatus.ACTIVE,
    companyId: companyC.id,
  });

  console.log("⚡ Starting local server on ephemeral port...");
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === "string" ? address : address?.port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`📡 Server running at ${baseUrl}`);

  try {
    // 1. SUPER_ADMIN success - without companyId
    console.log("🧪 Test 1: SUPER_ADMIN success without companyId...");
    const res1 = await fetch(`${baseUrl}/departments/options`, {
      headers: { Authorization: `Bearer ${tokenSuper}` },
    });
    assert(res1.status === 200, `Expected status 200, got ${res1.status}`);
    const body1 = (await res1.json()) as SuccessResponse;
    assert(body1.success === true, "Expected success to be true");
    assert(
      body1.message === "Department options retrieved successfully",
      "Expected standard message"
    );
    const data1 = body1.data;
    assert(Array.isArray(data1), "Expected data to be an array");
    // Filter to only our seeded active department IDs to make test robust against existing DB data
    const seededIds = [deptA1.id, deptA2.id, deptA3.id, deptB1.id];
    const ourDepts = data1.filter((d: DepartmentOption) => seededIds.includes(d.id));
    assert(ourDepts.length === 4, `Expected 4 of our active departments, got ${ourDepts.length}`);
    assert(
      ourDepts[0].name === "Engineering A",
      `Expected first to be Engineering A, got ${ourDepts[0].name}`
    );
    assert(
      ourDepts[1].name === "Engineering B",
      `Expected second to be Engineering B, got ${ourDepts[1].name}`
    );
    assert(
      ourDepts[2].name === "Finance A",
      `Expected third to be Finance A, got ${ourDepts[2].name}`
    );
    assert(ourDepts[3].name === "HR A", `Expected fourth to be HR A, got ${ourDepts[3].name}`);
    // Check fields for all returned departments
    for (const item of data1) {
      assert(typeof item.id === "string", "Expected string id");
      assert(typeof item.name === "string", "Expected string name");
      assert(
        Object.keys(item).length === 2,
        `Expected exactly 2 keys (id, name), got keys: ${Object.keys(item)}`
      );
    }
    console.log("   -> Success!");

    // 2. SUPER_ADMIN success - with companyId
    console.log("🧪 Test 2: SUPER_ADMIN success with companyId...");
    const res2 = await fetch(`${baseUrl}/departments/options?companyId=${companyA.id}`, {
      headers: { Authorization: `Bearer ${tokenSuper}` },
    });
    assert(res2.status === 200, `Expected status 200, got ${res2.status}`);
    const body2 = (await res2.json()) as SuccessResponse;
    assert(body2.success === true, "Expected success to be true");
    const data2 = body2.data;
    assert(data2.length === 3, `Expected 3 active departments for Company A, got ${data2.length}`);
    assert(data2[0].name === "Engineering A", "Expected Engineering A");
    assert(data2[1].name === "Finance A", "Expected Finance A");
    assert(data2[2].name === "HR A", "Expected HR A");
    console.log("   -> Success!");

    // 3. COMPANY_ADMIN success - own company, ignore companyId in query
    console.log("🧪 Test 3: COMPANY_ADMIN success own company, ignore companyId...");
    const res3 = await fetch(`${baseUrl}/departments/options?companyId=${companyB.id}`, {
      headers: { Authorization: `Bearer ${tokenAdminA}` },
    });
    assert(res3.status === 200, `Expected status 200, got ${res3.status}`);
    const body3 = (await res3.json()) as SuccessResponse;
    assert(body3.success === true, "Expected success to be true");
    const data3 = body3.data;
    // Should ignore companyB.id in query and return Company A's departments
    assert(
      data3.length === 3,
      `Expected 3 active departments for own company, got ${data3.length}`
    );
    assert(data3[0].name === "Engineering A", "Expected Engineering A");
    console.log("   -> Success!");

    // 4. RECRUITER success - own company, ignore companyId in query
    console.log("🧪 Test 4: RECRUITER success own company, ignore companyId...");
    const res4 = await fetch(`${baseUrl}/departments/options?companyId=${companyB.id}`, {
      headers: { Authorization: `Bearer ${tokenRecruiterA}` },
    });
    assert(res4.status === 200, `Expected status 200, got ${res4.status}`);
    const body4 = (await res4.json()) as SuccessResponse;
    assert(body4.success === true, "Expected success to be true");
    const data4 = body4.data;
    // Should ignore companyB.id in query and return Company A's departments
    assert(
      data4.length === 3,
      `Expected 3 active departments for own company, got ${data4.length}`
    );
    assert(data4[0].name === "Engineering A", "Expected Engineering A");
    console.log("   -> Success!");

    // 5. Invalid Token - 401
    console.log("🧪 Test 5: Invalid Token returns 401...");
    const res5 = await fetch(`${baseUrl}/departments/options`, {
      headers: { Authorization: `Bearer invalid-token-string` },
    });
    assert(res5.status === 401, `Expected status 401, got ${res5.status}`);
    const body5 = (await res5.json()) as FailureResponse;
    assert(body5.success === false, "Expected success to be false");
    console.log("   -> Success!");

    // 6. Invalid companyId - 400
    console.log("🧪 Test 6: Invalid companyId returns 400...");
    const res6 = await fetch(`${baseUrl}/departments/options?companyId=not-a-cuid-format`, {
      headers: { Authorization: `Bearer ${tokenSuper}` },
    });
    assert(res6.status === 400, `Expected status 400, got ${res6.status}`);
    const body6 = (await res6.json()) as FailureResponse;
    assert(body6.success === false, "Expected success to be false");
    assert(body6.message === "Validation failed", "Expected Validation failed message");
    console.log("   -> Success!");

    // 7. Company with no departments - 200, Empty array
    console.log("🧪 Test 7: Company with no departments returns 200 and empty array...");
    const res7 = await fetch(`${baseUrl}/departments/options`, {
      headers: { Authorization: `Bearer ${tokenAdminC}` },
    });
    assert(res7.status === 200, `Expected status 200, got ${res7.status}`);
    const body7 = (await res7.json()) as SuccessResponse;
    assert(body7.success === true, "Expected success to be true");
    const data7 = body7.data;
    assert(Array.isArray(data7), "Expected data to be an array");
    assert(data7.length === 0, `Expected 0 departments, got ${data7.length}`);
    console.log("   -> Success!");

    console.log("\n🎉 All Departments module integration tests passed successfully!\n");
  } finally {
    console.log("🧹 Cleaning up seeded test database records...");

    // Delete Users
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [superAdminUser.id, adminAUser.id, recruiterAUser.id, adminCUser.id],
        },
      },
    });

    // Delete Departments
    await prisma.department.deleteMany({
      where: {
        id: {
          in: [deptA1.id, deptA2.id, deptA3.id, deptAInactive.id, deptADeleted.id, deptB1.id],
        },
      },
    });

    // Delete Companies
    await prisma.company.deleteMany({
      where: {
        id: {
          in: [companyA.id, companyB.id, companyC.id],
        },
      },
    });

    console.log("🛑 Stopping local server...");
    server.close();
    console.log("🧹 Cleanup Complete.");
  }
}

runTests().catch((error) => {
  console.error("❌ Test run failed with error:", error);
  process.exit(1);
});
