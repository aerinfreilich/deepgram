import getMetadataFromFile from "./getMetadataFromFile";
import { ParsedQs } from "qs";

export function getFileFilterFromQuery(query: ParsedQs) {
  return async (file: string) => {
    const metadata = await getMetadataFromFile(file);
    const durationInSeconds = metadata.durationInSeconds;

    const notRejected = Object.keys(query).every((key) => {
      if (key === "maxduration") {
        if (typeof query.maxduration != "string") {
          // if this query is malformed, reject everything
          return false;
        }
        if (
          durationInSeconds &&
          durationInSeconds > parseInt(query.maxduration)
        ) {
          // this is where we reject files based on having length above the max duration
          return false;
        }
      }
      if (key === "minduration") {
        if (typeof query.minduration != "string") {
          // if this query is malformed, reject everything
          return false;
        }
        if (
          durationInSeconds &&
          durationInSeconds < parseInt(query.minduration)
        ) {
          // this is where we reject files based on having length below the min duration
          return false;
        }
      }
      return true;
    });

    return notRejected;
  };
}
