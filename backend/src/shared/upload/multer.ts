import multer from "multer";
import { UPLOAD_LIMITS, ALLOWED_EXTENSIONS } from "../constants/upload.constants";
import { ALLOWED_MIME_TYPES } from "./mime.types";

// Standard memory storage configuration
const storage = multer.memoryStorage();

// File filter checking extensions and MIME types
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  const mimeAllowed = ([
    ...ALLOWED_MIME_TYPES.DOCUMENTS,
    ...ALLOWED_MIME_TYPES.IMAGES,
  ] as string[]).includes(file.mimetype);

  const ext = file.originalname.substring(file.originalname.lastIndexOf(".")).toLowerCase();
  const extAllowed = ([
    ...ALLOWED_EXTENSIONS.DOCUMENTS,
    ...ALLOWED_EXTENSIONS.IMAGES,
  ] as string[]).includes(ext);

  if (mimeAllowed && extAllowed) {
    callback(null, true);
  } else {
    callback(new Error("File format or extension not allowed"));
  }
};

export const uploadConfig = multer({
  storage,
  fileFilter,
  limits: {
    // default to maximum possible size across attachments
    fileSize: UPLOAD_LIMITS.ATTACHMENT_SIZE,
  },
});
