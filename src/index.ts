import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

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

app.get("/files", (req: Request, res: Response) => {
  // gets a list of files available for download
  // TODO: accept filters in query parameters
  const directoryPath = path.join(__dirname, "../uploads");

  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.log({ err });
      return res.status(500).send("Unable to scan files");
    }

    // TODO: apply filtering logic here using req.query

    console.log({ files });
    res.json({ files });
  });
});

app.get("/metadata/:filename", (req: Request, res: Response) => {
  // gets metadata for a specified file, accepts filters in query parameters
  const query = req.query;
  console.log({ query });
  return res.status(500).send("Endpoint not yet implemented");
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
