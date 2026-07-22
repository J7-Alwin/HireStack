export const UPLOAD_LIMITS = {
  RESUME_SIZE: 10 * 1024 * 1024, // 10MB
  PROFILE_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  COMPANY_LOGO_SIZE: 5 * 1024 * 1024, // 5MB
  COMPANY_BANNER_SIZE: 10 * 1024 * 1024, // 10MB
  ATTACHMENT_SIZE: 25 * 1024 * 1024, // 25MB
} as const;

export const ALLOWED_EXTENSIONS = {
  DOCUMENTS: [".pdf"],
  IMAGES: [".jpg", ".jpeg", ".png", ".webp"],
} as const;
