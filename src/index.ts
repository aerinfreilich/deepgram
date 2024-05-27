import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// POST endpoint for file upload
app.post("/upload", upload.single("audio"), (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  console.log("File uploaded:", req.file);
  res.send("File uploaded successfully");
});

app.get("/download/:filename", (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "uploads", filename);

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(404).send("File not found");
    }
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
export { server };
