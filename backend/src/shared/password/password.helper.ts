import { REGEX_PATTERNS } from "../constants/regex.constants";

export const passwordHelper = {
  isValidStrength: (password: string): boolean => {
    return REGEX_PATTERNS.STRONG_PASSWORD.test(password);
  },

  checkStrengthScore: (password: string): { score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("Password must be at least 8 characters long");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Password must contain at least one uppercase letter");
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Password must contain at least one lowercase letter");
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push("Password must contain at least one number");
    }

    if (/[@$!%*?&]/.test(password)) {
      score += 1;
    } else {
      feedback.push("Password must contain at least one special character (@$!%*?&)");
    }

    return { score, feedback };
  },
};
