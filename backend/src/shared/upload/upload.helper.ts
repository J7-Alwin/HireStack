
export const uploadHelper = {
  isValidSize: (fileSize: number, maxSize: number): boolean => {
    return fileSize <= maxSize;
  },

  isValidMime: (mimeType: string, allowedMimes: string[]): boolean => {
    return allowedMimes.includes(mimeType);
  },

  isValidExtension: (filename: string, allowedExtensions: string[]): boolean => {
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
    return allowedExtensions.includes(ext);
  },

  validateFile: (
    file: { originalname: string; mimetype: string; size: number },
    options: { maxSize: number; allowedMimes: string[]; allowedExtensions: string[] }
  ): { valid: boolean; error?: string } => {
    if (!uploadHelper.isValidSize(file.size, options.maxSize)) {
      return {
        valid: false,
        error: `File size exceeds the limit of ${(options.maxSize / (1024 * 1024)).toFixed(1)}MB`,
      };
    }

    if (!uploadHelper.isValidMime(file.mimetype, options.allowedMimes)) {
      return {
        valid: false,
        error: "File MIME type is not allowed",
      };
    }

    if (!uploadHelper.isValidExtension(file.originalname, options.allowedExtensions)) {
      return {
        valid: false,
        error: "File extension is not allowed",
      };
    }

    return { valid: true };
  },
};
