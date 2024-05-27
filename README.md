# File Upload and Metadata API

## Overview

This project is a file upload and metadata extraction API built using Node.js, Express, TypeScript, and Jest.
I just wanted to provide a simple to upload WAV audio files, get metadata, and perform basic operations such as filtering and downloading the files.
The use case I'm imagining for now is if I want to store my own well named audio wav files for personal use i.e. there's only one user.

## Choices and Justifications

### Technology Stack

- **Node.js**, **Express**, **TypeScript**, **Jest**: These together formed a stack I was familiar with that seemed appropriate for the job.
  I wanted the ability to add types later for things like file types, filters based on query params and etc. I deprioritized this in the time I worked on this though.
- **Multer**: This is middleware for handling file uploads. This seemed like a tool with a good reputation and kept the complexity of this project manageable.

### File Format and Metadata

- **WAV Files**: Limited to WAV files to keep the problem scope manageable while still being interesting. I was avoiding the complexity of handling multiple audio formats but to make this more practically useful I'd want to support more file formats like MP3s.
- **Metadata Extraction**: Extracts basic metadata like duration, sample rate, bit depth, etc. This is not exhaustive but provides a foundation. In a production scenario, I'd want to do more research here since I'm not so familiar with what would be most useful.

### Filtering and Storage

- **Filtering**: Implemented filtering based on max and min duration and name to demonstrate the capability. In a production scenario, I'd want to do more research here too.
- **Local Storage**: Files are stored locally as per the project prompt. In a production environment, I would probably want to integrate with AWS/S3.

### Endpoints

- **POST /upload**: Uploads a file. It will overwrite a file with the same name. This decision is suitable for a single-user scenario but would need to be addressed in a multi-user environment.
- **GET /files**: Lists all uploaded files, with optional filtering based on query parameters. One can filter based on maxduration (inclusive), minduration (also inclusive) or a single name value.
- **GET /metadata/:filename**: Returns metadata for a specified file. I return these fields: durationInSeconds, sampleRate, bitDepth, numChannels, audioFormat, dataSize (in bytes), byteRate, blockAlign, cuePoints. The bitdepth is a string for reasons I'm not clear on and would resolve with more time. Which fields are included in this list are mostly arbitrary.
- **GET /download/:filename**: Downloads a specified file.
- **DELETE /file/:filename**: Deletes a specified file.
- **DELETE /files**: Deletes all files. This seems like a potentially risky endpoint to have and make available depending on the use case but was useful for testing. Could be useful for personal use as a "start over" tool but might make it too easy to "shoot yourself in the foot" so to speak.

## Commands

npm install
npm run build
npm run start

npm test

CURL commands:
upload: curl -F "audio=@/path/to/your/file.wav" http://localhost:3000/upload
list files: curl http://localhost:3000/files
get metadata: curl http://localhost:3000/metadata/yourfile.wav
download a file: curl http://localhost:3000/download/yourfile.wav --output yourfile.wav
delete a single file: curl -X DELETE http://localhost:3000/file/yourfile.wav
delete all files: curl -X DELETE http://localhost:3000/files
