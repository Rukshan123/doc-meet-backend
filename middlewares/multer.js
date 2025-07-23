import multer from "multer";

// This middleware is used to handle file uploads in the backend
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    },
});

const upload = multer({ storage });

export default upload;
