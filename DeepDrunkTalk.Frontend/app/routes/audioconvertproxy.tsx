import { ActionFunction, json } from "@remix-run/node";
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { Readable } from 'stream';
import { writeFile, readFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import os from 'os';

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
} else {
  throw new Error('FFmpeg path not found');
}

async function convertAudio(audioFile: File): Promise<string> {
  const outputFileName = `${uuidv4()}.mp3`;
  const outputFilePath = path.join(os.tmpdir(), outputFileName);

  const audioArrayBuffer = await audioFile.arrayBuffer();
  const audioBuffer = Buffer.from(audioArrayBuffer);

  const readableStream = new Readable();
  readableStream._read = () => {};
  readableStream.push(audioBuffer);
  readableStream.push(null);

  const mimeType = audioFile.type;
  let inputFormat = mimeType.split('/')[1];

  if (mimeType === 'audio/mp4' || mimeType === 'audio/aac') {
    inputFormat = 'aac';
  }

  console.log(`Converting audio file with MIME type: ${mimeType} and input format: ${inputFormat}`);
  console.log(`Audio file size: ${audioFile.size} bytes`);

  return new Promise((resolve, reject) => {
    ffmpeg(readableStream)
      .inputFormat(inputFormat)
      .toFormat('mp3')
      .on('start', (commandLine) => {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('progress', (progress) => {
        console.log('Processing: ' + (progress.percent ? progress.percent : 'unknown') + '% done');
      })
      .on('error', (err) => {
        console.error('Error: ' + err.message);
        reject(err);
      })
      .on('end', () => {
        console.log('Conversion finished');
        resolve(outputFilePath);
      })
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
    console.log(`Received audio file with name: ${(audioFile as File).name} and type: ${(audioFile as File).type}`);
    const outputFilePath = await convertAudio(audioFile as File);
    const audioBuffer = await readFile(outputFilePath);
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mp3',
        'Content-Disposition': `attachment; filename="${path.basename(outputFilePath)}"`,
      },
    });
  } catch (error) {
    console.error('Conversion error:', error);
    return json({ error: error.message }, { status: 500 });
  }
};
