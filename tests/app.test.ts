import request from "supertest";
const path = require("path");
import app, { server } from "../src/index";

describe("file upload server endpoints", () => {
  afterEach(async () => {
    await request(app).delete("/files");
  });

  afterAll((done) => {
    server.close(done);
  });

  describe("POST /upload", () => {
    it("should upload a file successfully", async () => {
      const response = await request(app)
        .post("/upload")
        .attach("audio", "test1.wav");

      expect(response.status).toBe(200);
      expect(response.text).toBe("File uploaded successfully");
    });

    it("should return an error if no file is uploaded", async () => {
      const response = await request(app).post("/upload");

      expect(response.status).toBe(400);
      expect(response.text).toBe("No file uploaded.");
    });
  });

  describe("DELETE /file", () => {
    it("should delete a file successfully", async () => {
      await request(app).post("/upload").attach("audio", "test1.wav");

      const deleteResponse = await request(app).delete("/file/test1.wav");

      expect(deleteResponse.status).toBe(200);

      const getResponse = await request(app).get("/files");
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.files).not.toContain("test1.wav");
    });
  });

  describe("DELETE /files", () => {
    it("should delete all files successfully", async () => {
      await request(app)
        .post("/upload")
        .attach("audio", path.join(__dirname, "testFiles", "test1.wav"));

      await request(app)
        .post("/upload")
        .attach("audio", path.join(__dirname, "testFiles", "test2.wav"));

      const deleteResponse = await request(app).delete("/files");

      expect(deleteResponse.status).toBe(200);

      const response = await request(app).get("/files");

      expect(response.status).toBe(200);

      expect(response.body.files).not.toContain("test1.wav");
      expect(response.body.files).not.toContain("test2.wav");
    });
  });

  describe("GET /files", () => {
    it("should return a list of uploaded files", async () => {
      await request(app)
        .post("/upload")
        .attach("audio", path.join(__dirname, "testFiles", "test1.wav"));

      await request(app)
        .post("/upload")
        .attach("audio", path.join(__dirname, "testFiles", "test2.wav"));

      const response = await request(app).get("/files");

      expect(response.status).toBe(200);

      expect(response.body.files).toContain("test1.wav");
      expect(response.body.files).toContain("test2.wav");
    });

    it("should filter based on maxduration", async () => {
      await request(app)
        .post("/upload")
        .attach(
          "audio",
          path.join(__dirname, "testFiles", "PinkPanther30.wav")
        );

      await request(app)
        .post("/upload")
        .attach(
          "audio",
          path.join(__dirname, "testFiles", "PinkPanther60.wav")
        );

      const filterMaxDuration29Response = await request(app).get(
        "/files?maxduration=29"
      );
      const filterMaxDuration30Response = await request(app).get(
        "/files?maxduration=30"
      );
      const filterMaxDuration60Response = await request(app).get(
        "/files?maxduration=60"
      );

      const filesLessThan29 = filterMaxDuration29Response.body.files;
      const filesLessThan30 = filterMaxDuration30Response.body.files;
      const filesLessThan60 = filterMaxDuration60Response.body.files;

      expect(filesLessThan29).not.toContain("PinkPanther30.wav");
      expect(filesLessThan29).not.toContain("PinkPanther60.wav");
      expect(filesLessThan30).toContain("PinkPanther30.wav");
      expect(filesLessThan30).not.toContain("PinkPanther60.wav");
      expect(filesLessThan60).toContain("PinkPanther30.wav");
      expect(filesLessThan60).toContain("PinkPanther60.wav");
    });

    it("should jointly filter based on maxduration and minduration", async () => {
      await request(app)
        .post("/upload")
        .attach("audio", path.join(__dirname, "testFiles", "CantinaBand3.wav"));

      await request(app)
        .post("/upload")
        .attach(
          "audio",
          path.join(__dirname, "testFiles", "PinkPanther30.wav")
        );

      await request(app)
        .post("/upload")
        .attach(
          "audio",
          path.join(__dirname, "testFiles", "PinkPanther60.wav")
        );

      const filesExactly30Response = await request(app).get(
        "/files?maxduration=30&minduration=30"
      );

      const filesExactly30 = filesExactly30Response.body.files;

      expect(filesExactly30).toContain("PinkPanther30.wav");
      expect(filesExactly30).not.toContain("PinkPanther60.wav");
      expect(filesExactly30).not.toContain("CantinaBand3.wav");
    });
  });

  describe("GET /metadata", () => {
    it("should return metadata of uploaded files", async () => {
      const response = await request(app)
        .post("/upload")
        .attach("audio", path.join(__dirname, "testFiles", "test1.wav"));

      expect(response.status).toBe(200);

      const metadataResponse = await request(app).get("/metadata/test1.wav");
      const metadata = metadataResponse.body.metadata;

      expect(metadata).toStrictEqual({
        durationInSeconds: 3,
        sampleRate: 22050,
        bitDepth: "16", // TODO: investigate why this is a string
        numChannels: 1,
        audioFormat: 1,
        dataSize: 132300,
        byteRate: 44100,
        blockAlign: 2,
        cuePoints: 0,
      });
    });
  });

  describe("GET /download", () => {
    it("should download a file", async () => {
      const filename = "test1.wav";
      await request(app)
        .post("/upload")
        .attach("audio", path.join(__dirname, "testFiles", filename));

      const response = await request(app).get(`/download/${filename}`);

      expect(response.headers["content-disposition"]).toContain(filename);
      expect(response.type).toBe("audio/wav");
    });

    it("should return a 404 error if the file does not exist", async () => {
      const filename = "nonexistent-file.wav";
      const response = await request(app).get(`/download/${filename}`);

      expect(response.status).toBe(404);
    });
  });
});
