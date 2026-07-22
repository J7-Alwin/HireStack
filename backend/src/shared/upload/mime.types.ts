export const MIME_TYPES = {
  PDF: "application/pdf",
  JPEG: "image/jpeg",
  JPG: "image/jpeg",
  PNG: "image/png",
  WEBP: "image/webp",
} as const;

export const ALLOWED_MIME_TYPES = {
  DOCUMENTS: [MIME_TYPES.PDF],
  IMAGES: [MIME_TYPES.JPEG, MIME_TYPES.PNG, MIME_TYPES.WEBP],
} as const;
