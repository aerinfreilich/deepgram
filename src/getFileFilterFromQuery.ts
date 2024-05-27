import getMetadataFromFile from "./getMetadataFromFile";
import { ParsedQs } from "qs";

export function getFileFilterFromQuery(query: ParsedQs) {
  return async (file: string) => {
    try {
      const metadata = await getMetadataFromFile(file);
      const durationInSeconds = metadata.durationInSeconds;

      if (
        typeof query.maxduration !== "string" ||
        typeof query.minduration !== "string"
      ) {
        throw new Error("Query parameters are malformed");
      }

      const maxDuration = parseInt(query.maxduration);
      const minDuration = parseInt(query.minduration);

      if (
        !isNaN(maxDuration) &&
        durationInSeconds &&
        durationInSeconds > maxDuration
      ) {
        return false;
      }

      if (
        !isNaN(minDuration) &&
        durationInSeconds &&
        durationInSeconds < minDuration
      ) {
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error filtering file:", error);
      return false;
    }
  };
}
