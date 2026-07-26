import { Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../src/config/prisma";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

const DEFAULT_PASSWORD = "Admin@123";

const COMPANY = {
    name: "HireStack Pvt Ltd",
    description: "Official development company for HireStack ATS.",
    website: "https://hirestack.ai",
    industry: "Information Technology",
    companySize: "11-50",
    contactEmail: "info@hirestack.ai",
    headquarters: "Bengaluru, India",
};

const DEPARTMENT_NAME = "Human Resources";

const USERS = {
    SUPER_ADMIN: {
        email: "alwinjames66@gmail.com",
        name: "Alwin James",
        role: Role.SUPER_ADMIN,
    },

    COMPANY_ADMIN: {
        email: "j7alwin@gmail.com",
        name: "Company Admin",
        role: Role.COMPANY_ADMIN,
    },

    RECRUITER: {
        email: "24mcab08@kristujayanti.com",
        name: "Recruiter",
        role: Role.RECRUITER,
    },
};

/* -------------------------------------------------------------------------- */

async function main() {
    console.log("🌱 Starting database seed...");

    const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    /* ---------------------------------------------------------------------- */
    /* Company                                                                 */
    /* ---------------------------------------------------------------------- */

    const company = await prisma.company.upsert({
        where: {
            name: COMPANY.name,
        },
        update: {
            description: COMPANY.description,
            website: COMPANY.website,
            industry: COMPANY.industry,
            companySize: COMPANY.companySize,
            contactEmail: COMPANY.contactEmail,
            headquarters: COMPANY.headquarters,
            isVerified: true,
            status: AccountStatus.ACTIVE,
        },
        create: {
            name: COMPANY.name,
            description: COMPANY.description,
            website: COMPANY.website,
            industry: COMPANY.industry,
            companySize: COMPANY.companySize,
            contactEmail: COMPANY.contactEmail,
            headquarters: COMPANY.headquarters,
            isVerified: true,
            status: AccountStatus.ACTIVE,
        },
    });

    console.log("✅ Company seeded");

    /* ---------------------------------------------------------------------- */
    /* Department                                                              */
    /* ---------------------------------------------------------------------- */

    const department = await prisma.department.upsert({
        where: {
            companyId_name: {
                companyId: company.id,
                name: DEPARTMENT_NAME,
            },
        },
        update: {
            isActive: true,
        },
        create: {
            companyId: company.id,
            name: DEPARTMENT_NAME,
            isActive: true,
        },
    });

    console.log("✅ Department seeded");

    /* ---------------------------------------------------------------------- */
    /* Super Admin                                                             */
    /* ---------------------------------------------------------------------- */

    await prisma.user.upsert({
        where: {
            email: USERS.SUPER_ADMIN.email,
        },
        update: {
            password: hashedPassword,
            role: USERS.SUPER_ADMIN.role,
            name: USERS.SUPER_ADMIN.name,
            status: AccountStatus.ACTIVE,
            isActive: true,
            isVerified: true,
            mustChangePassword: false,
            companyId: null,
            departmentId: null,
        },
        create: {
            email: USERS.SUPER_ADMIN.email,
            password: hashedPassword,
            role: USERS.SUPER_ADMIN.role,
            name: USERS.SUPER_ADMIN.name,
            status: AccountStatus.ACTIVE,
            isActive: true,
            isVerified: true,
            mustChangePassword: false,
        },
    });

    console.log("✅ Super Admin seeded");

    /* ---------------------------------------------------------------------- */
    /* Company Admin                                                           */
    /* ---------------------------------------------------------------------- */

    await prisma.user.upsert({
        where: {
            email: USERS.COMPANY_ADMIN.email,
        },
        update: {
            password: hashedPassword,
            role: USERS.COMPANY_ADMIN.role,
            name: USERS.COMPANY_ADMIN.name,
            companyId: company.id,
            departmentId: department.id,
            status: AccountStatus.ACTIVE,
            isActive: true,
            isVerified: true,
            mustChangePassword: false,
        },
        create: {
            email: USERS.COMPANY_ADMIN.email,
            password: hashedPassword,
            role: USERS.COMPANY_ADMIN.role,
            name: USERS.COMPANY_ADMIN.name,
            companyId: company.id,
            departmentId: department.id,
            status: AccountStatus.ACTIVE,
            isActive: true,
            isVerified: true,
            mustChangePassword: false,
        },
    });

    console.log("✅ Company Admin seeded");

    /* ---------------------------------------------------------------------- */
    /* Recruiter                                                               */
    /* ---------------------------------------------------------------------- */

    await prisma.user.upsert({
        where: {
            email: USERS.RECRUITER.email,
        },
        update: {
            password: hashedPassword,
            role: USERS.RECRUITER.role,
            name: USERS.RECRUITER.name,
            companyId: company.id,
            departmentId: department.id,
            status: AccountStatus.ACTIVE,
            isActive: true,
            isVerified: true,
            mustChangePassword: false,
        },
        create: {
            email: USERS.RECRUITER.email,
            password: hashedPassword,
            role: USERS.RECRUITER.role,
            name: USERS.RECRUITER.name,
            companyId: company.id,
            departmentId: department.id,
            status: AccountStatus.ACTIVE,
            isActive: true,
            isVerified: true,
            mustChangePassword: false,
        },
    });

    console.log("✅ Recruiter seeded");

    console.log("");
    console.log("🎉 Database seeded successfully!");
    console.log("");
    console.log("Login Accounts");
    console.log("----------------------------------------");
    console.log("Super Admin   :", USERS.SUPER_ADMIN.email);
    console.log("Company Admin :", USERS.COMPANY_ADMIN.email);
    console.log("Recruiter     :", USERS.RECRUITER.email);
    console.log("Password      :", DEFAULT_PASSWORD);
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });