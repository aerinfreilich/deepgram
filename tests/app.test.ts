import request from "supertest";
const path = require("path");
import app, { server } from "../src/index";

describe("POST /upload", () => {
  afterAll((done) => {
    server.close(done);
  });

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

  it("should return metadata of uploaded files", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("audio", "test1.wav");

    expect(response.status).toBe(200);

    const metadataResponse = await request(app).get("/metadata/test1.wav");
    const metadata = metadataResponse.body.metadata;
    expect(metadata).toStrictEqual({
      sampleRate: 22050,
      bitDepth: "16",
      numChannels: 1,
      audioFormat: 1,
      dataSize: 132300,
      byteRate: 44100,
      blockAlign: 2,
      cuePoints: 0,
    });
  });
});
