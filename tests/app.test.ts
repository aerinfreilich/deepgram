import request from "supertest";
import app, { server } from "../src/index"; // Adjust the import path to your Express app

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
});
