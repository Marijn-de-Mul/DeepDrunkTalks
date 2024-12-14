import { ActionFunction, json } from "@remix-run/node";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { Readable } from 'stream';
import { writeFile, readFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import os from 'os';

ffmpeg.setFfmpegPath(ffmpegPath);

async function convertAudio(audioFile: File): Promise<string> {
  const outputFileName = `${uuidv4()}.mp3`;
  const outputFilePath = path.join(os.tmpdir(), outputFileName);

  const audioArrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = Buffer.from(audioArrayBuffer);

  const readableStream = new Readable();
  readableStream._read = () => {};
  readableStream.push(audioBuffer);
  readableStream.push(null);

  const inputFormat = audioFile.type.split('/')[1]; 

  return new Promise((resolve, reject) => {
    ffmpeg(readableStream)
      .inputFormat(inputFormat) 
      .toFormat('mp3')
      .on('error', (err) => reject(err))
      .on('end', () => resolve(outputFilePath))
      .save(outputFilePath);
  });
}

export let action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const audioFile = formData.get("audioFile");

  if (!audioFile || typeof audioFile !== "object") {
    return json({ error: "Invalid audio file" }, { status: 400 });
  }

  try {
    const outputFilePath = await convertAudio(audioFile as File);
    const audioBuffer = await readFile(outputFilePath);
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mp3',
        'Content-Disposition': `attachment; filename="${path.basename(outputFilePath)}"`,
      },
    });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
};
