export interface ResumeEducation {
    institution: string;
    degree: string;
    field: string;
    startYear?: string;
    endYear?: string;
}

export interface ResumeExperience {
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    currentlyWorking?: boolean;
    description?: string;
}

export interface ResumeProject {
    title: string;
    description?: string;
    technologies: string[];
}

export interface ResumeCertification {
    name: string;
    issuer?: string;
    year?: string;
}

export interface ResumeSkill {
    name: string;
    level?: string;
}

export interface ResumeData {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;

    summary: string | null;

    skills: ResumeSkill[];

    education: ResumeEducation[];

    experience: ResumeExperience[];

    certifications: ResumeCertification[];

    projects: ResumeProject[];

    languages: string[];

    rawText: string;
}