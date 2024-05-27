import path from "path";
import fs from "fs";
const WaveFile = require("wavefile").WaveFile;

export default async function getMetadataFromFile(
  filename: string
): Promise<any> {
  const filePath = path.join(__dirname, "../uploads", filename);

  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        console.error("Error reading file", err);
        reject("Error reading file");
      }

      try {
        const file = new WaveFile(data);

        const metadata = {
          durationInSeconds: file.duration,
          sampleRate: file.fmt.sampleRate,
          bitDepth: file.bitDepth,
          numChannels: file.fmt.numChannels,
          audioFormat: file.fmt.audioFormat,
          dataSize: file.data.chunkSize,
          byteRate: file.fmt.byteRate,
          blockAlign: file.fmt.blockAlign,
          compressionCode: file.fmt.compressionCode,
          cuePoints: file.cue.chunkSize,
        };

        if (!metadata.durationInSeconds) {
          const dataSize = metadata.dataSize;
          const numChannels = metadata.numChannels;
          const bitDepth = metadata.bitDepth;

          const totalSamples = dataSize / (numChannels * (bitDepth / 8));
          const durationInSeconds = totalSamples / metadata.sampleRate;
          metadata.durationInSeconds = durationInSeconds;
        }

        resolve(metadata);
      } catch (error) {
        console.error("Error parsing WAV file", error);
        reject("Error parsing WAV file");
      }
    });
  });
}
