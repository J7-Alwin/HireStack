import { REGEX_PATTERNS } from "../constants/regex.constants";
import { randomBytes } from "crypto";

export const passwordHelper = {
  generateTemporaryPassword: (length = 12): string => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "@$!%*?&";
    const all = uppercase + lowercase + numbers + special;

    const getSecureChar = (charSet: string) => {
      const randomIdx = randomBytes(1)[0] % charSet.length;
      return charSet[randomIdx];
    };

    let password = "";
    password += getSecureChar(uppercase);
    password += getSecureChar(lowercase);
    password += getSecureChar(numbers);
    password += getSecureChar(special);

    for (let i = 4; i < length; i++) {
      password += getSecureChar(all);
    }

    const arr = password.split("");
    for (let i = arr.length - 1; i > 0; i--) {
      const j = randomBytes(1)[0] % (i + 1);
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }

    return arr.join("");
  },
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
