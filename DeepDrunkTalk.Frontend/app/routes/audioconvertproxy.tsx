import { json, type ActionFunction, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { writeFile, unlink } from "fs/promises";
import { readFile } from 'fs/promises';

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  throw new Error("FFmpeg path not found");
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = async (req: Request) => {
  const parseForm = async (request: Request) => {
    const uploadHandler = unstable_createMemoryUploadHandler();
    const formData = await unstable_parseMultipartFormData(request, uploadHandler);

    return {
      fields: {
        authorization: formData.get("authorization"),
      },
      files: {
        audio: formData.get("audio"),
      },
    };
  };

  const action: ActionFunction = async ({ request }) => {
    try {
      const { fields, files } = await parseForm(request);

      const authorization = fields.authorization;
      const audioFile = files.audio;

      if (!authorization || !audioFile) {
        return json({ error: "Missing required parameters" }, { status: 400 });
      }

      if (
        !(audioFile instanceof File) ||
        !audioFile.name ||
        !audioFile.type
      ) {
        return json({ error: "Invalid audio file upload" }, { status: 400 });
      }

      const tempDir = os.tmpdir();
      const uniqueId = uuidv4();

      const mimeTypeMap: { [key: string]: string } = {
        "audio/webm": "webm",
        "audio/mp4": "mp4",
        "audio/aac": "aac",
        "audio/mpeg": "mp3",
      };

      const inputExtension = mimeTypeMap[audioFile.type] || "webm";
      const inputFileName = `input_${uniqueId}.${inputExtension}`;
      const inputFilePath = path.join(tempDir, inputFileName);

      const outputFileName = `output_${uniqueId}.mp3`;
      const outputFilePath = path.join(tempDir, outputFileName);

      const buffer = Buffer.from(await audioFile.arrayBuffer());
      await writeFile(inputFilePath, buffer);

      console.log(`Saved uploaded audio to ${inputFilePath}`);

      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputFilePath)
          .inputFormat(inputExtension)
          .toFormat("mp3")
          .audioCodec("libmp3lame")
          .audioBitrate(192)
          .on("start", (commandLine) => {
            console.log("Spawned FFmpeg with command:", commandLine);
          })
          .on("progress", (progress) => {
            console.log(`Processing: ${progress.percent ? progress.percent.toFixed(2) : "0.00"}% done`);
          })
          .on("error", (err, stdout, stderr) => {
            console.error("FFmpeg error:", err.message);
            console.error("FFmpeg stderr:", stderr);
            reject(err);
          })
          .on("end", () => {
            console.log("FFmpeg conversion finished");
            resolve();
          })
          .save(outputFilePath);
      });

      await unlink(inputFilePath);
      await unlink(outputFilePath);

      console.log("Audio chunk converted and uploaded successfully");

      return json({ success: true });
    } catch (error) {
      console.error("Audio conversion error:", error);
      return json({ error: "Audio conversion failed" }, { status: 500 });
    }
  };

  async function fsReadFile(filepath: string) {
    return await readFile(filepath);
  };
} 
