"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        console.log("dest", { req, file });
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = (0, multer_1.default)({ storage: storage });
const app = (0, express_1.default)();
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "uploads")));
// POST endpoint for file upload
app.post("/upload", upload.single("audio"), (req, res) => {
    console.log({ file: req.file });
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    console.log("File uploaded:", req.file);
    res.send("File uploaded successfully");
});
app.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path_1.default.join(__dirname, "uploads", filename);
    res.download(filePath, filename, (err) => {
        if (err) {
            console.error("Error downloading file:", err);
            res.status(404).send("File not found");
        }
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
