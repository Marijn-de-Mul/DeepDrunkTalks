import { json, type ActionFunction } from "@remix-run/node";
import fetch from "node-fetch";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { Readable } from 'stream';

const BASE_URL = process.env.NODE_ENV === "production"
  ? "http://ddt_backend:8079"
  : process.env.NODE_ENV === "test"
    ? "http://ddt_backend_staging:8079"
    : "http://localhost:8079";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  throw new Error('ffmpeg path not found');
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const endpoint = formData.get("endpoint");
  const authorization = formData.get("authorization");
  const audio = formData.get("audio");

  if (!endpoint || !authorization || !audio) {
    return json({ error: "Missing required parameters" }, { status: 400 });
  }

  const targetUrl = `${BASE_URL}${endpoint}`;
  
  try {
    console.log('Audio is Blob:', typeof Blob !== 'undefined' && audio instanceof Blob);
    console.log('Audio is Buffer:', Buffer.isBuffer(audio));
    console.log('Audio size:', Buffer.isBuffer(audio) ? (audio as Buffer).length : 'N/A');

    let mp3Buffer: Buffer;

    if (typeof Blob !== 'undefined' && audio instanceof Blob) {
      const buffer = Buffer.from(await audio.arrayBuffer());
      mp3Buffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const readableStream = Readable.from(buffer);
        
        ffmpeg(readableStream)
          .toFormat('mp3')
          .on('error', reject)
          .on('end', () => resolve(Buffer.concat(chunks)))
          .pipe()
          .on('data', (chunk) => chunks.push(chunk));
      });
    } else if (Buffer.isBuffer(audio)) {
      mp3Buffer = await new Promise<Buffer>((resolve, reject) => {
        const chunks: Buffer[] = [];
        const readableStream = new Readable();
        readableStream.push(audio);
        readableStream.push(null);
        
        ffmpeg(readableStream)
          .toFormat('mp3')
          .on('error', reject)
          .on('end', () => resolve(Buffer.concat(chunks)))
          .pipe()
          .on('data', (chunk) => chunks.push(chunk));
      });
    } else {
      throw new Error("Invalid audio format");
    }

    const proxyFormData = new FormData();
    proxyFormData.append("audio", new Blob([mp3Buffer]), "audio.mp3");

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authorization}`,
      },
      body: proxyFormData
    });

    if (!response.ok) {
      console.error('Upload failed:', response.status);
      return json({ error: "Failed to upload audio" }, { status: response.status });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Audio upload error:", error);
    return json({ error: String(error) }, { status: 500 });
  }
};
