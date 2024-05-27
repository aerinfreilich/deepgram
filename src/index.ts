import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import getMetadataFromFile from "./getMetadataFromFile";
import { getFileFilterFromQuery } from "./getFileFilterFromQuery";
import { deleteFile } from "./deleteFile";

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

// Middleware
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Route Handlers
app.post(
  "/upload",
  upload.single("audio"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }
      console.log("File uploaded:", req.file);
      res.send("File uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).send("Error uploading file");
    }
  }
);

app.get("/files", async (req: Request, res: Response) => {
  try {
    const directoryPath = path.join(__dirname, "../uploads");
    const files = await fs.promises.readdir(directoryPath);

    if (req.query) {
      const fileFilter = getFileFilterFromQuery(req.query);
      const filteredFiles = await Promise.all(
        files.map(async (file) => {
          const shouldInclude = await fileFilter(file);
          return { file, shouldInclude };
        })
      );
      const includedFiles = filteredFiles
        .filter(({ shouldInclude }) => shouldInclude)
        .map(({ file }) => file);
      res.json({ files: includedFiles });
      return;
    }

    res.json({ files });
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).send("Error retrieving files");
  }
});

app.get("/metadata/:filename", async (req: Request, res: Response) => {
  // gets metadata for a specified file, accepts filters in query parameters
  try {
    const filename = req.params.filename;
    const metadata = await getMetadataFromFile(filename);
    res.json({ metadata });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/download/:filename", (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads", filename);
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(404).send("File not found");
      }
    });
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send("Error downloading file");
  }
});

// DELETE endpoint to delete a specific file
app.delete("/files/:filename", async (req: Request, res: Response) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "../uploads", filename);

  try {
    await deleteFile(filePath);
    res.json({ message: `File ${filename} deleted successfully` });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).send("Error deleting file");
  }
});

// DELETE endpoint to delete all files
app.delete("/files", async (req: Request, res: Response) => {
  const directoryPath = path.join(__dirname, "../uploads");

  try {
    // Read the contents of the directory
    const files = await fs.promises.readdir(directoryPath);

    // Delete each file in the directory
    await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(directoryPath, filename);
        await deleteFile(filePath);
      })
    );

    res.json({ message: "All files deleted successfully" });
  } catch (error) {
    console.error("Error deleting files:", error);
    res.status(500).send("Error deleting files");
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
export { server };
