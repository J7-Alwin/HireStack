import multer from "multer";

const storage = multer.memoryStorage();

export const resumeUpload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },

    fileFilter(_req, file, cb) {
        if (file.mimetype !== "application/pdf") {
            return cb(new Error("Only PDF resumes are allowed."));
        }

        cb(null, true);
    },
});