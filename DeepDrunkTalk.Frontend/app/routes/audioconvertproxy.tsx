import { json, type ActionFunction, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler } from "@remix-run/node";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { writeFile, unlink, readFile } from "fs/promises";

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

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await unstable_parseMultipartFormData(
      request,
      unstable_createMemoryUploadHandler()
    );

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uniqueId = uuidv4();
    const tempFilePath = path.join(os.tmpdir(), `${uniqueId}-${file.name}`);

    await writeFile(tempFilePath, buffer);

    const outputPath = path.join(os.tmpdir(), `${uniqueId}.mp3`);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempFilePath)
        .toFormat("mp3")
        .save(outputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    const convertedBuffer = await readFile(outputPath);

    await unlink(tempFilePath);
    await unlink(outputPath);

    return new Response(convertedBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${uniqueId}.mp3"`,
      },
    });
  } catch (error: any) {
    console.error("Audio conversion error:", error);
    return json({ error: error.message }, { status: 500 });
  }
};
