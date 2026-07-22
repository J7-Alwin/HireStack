export const REGEX_PATTERNS = {
  // ISO Phone standard or generic phone number format
  PHONE: /^\+?[1-9]\d{1,14}$/,
  
  // Strong password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  
  // UUID validation
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  
  // CUID validation (starts with 'c', followed by alphanumeric)
  CUID: /^c[a-z0-9]{24}$/i,
} as const;
