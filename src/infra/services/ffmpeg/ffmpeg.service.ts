import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import { IVideoFrameExtractor } from '../../../domain/interfaces/frame-extractor.interface';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

@Injectable()
export class FfmpegService implements IVideoFrameExtractor {
  async extractFrames(
    input: string | Readable,
    intervalSeconds: number,
    outputDir: string,
  ): Promise<string[]> {
    const sessionId = uuidv4();
    const outputTemplate = path.join(outputDir, `frame-${sessionId}-%04d.png`);

    let frameCount = 0;

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      ffmpeg(input)
        .outputOptions([`-vf fps=1/${intervalSeconds}`])
        .on('start', (commandLine) => {
          console.log('[FFmpeg] Start:', commandLine);
        })
        .on('filenames', (filenames) => {
          console.log(filenames);
        })
        .on('stderr', (stderrLine) => {
          if (stderrLine.includes('frame=')) {
            frameCount++;
            console.log(`[FFmpeg] Frames processed: ${frameCount}`);
          }
        })
        .on('end', () => {
          console.log(`[FFmpeg] Finished. Total frames: ${frameCount}`);
          const files = fs
            .readdirSync(outputDir)
            .filter((file) => file.endsWith('.png'))
            .map((file) => path.join(outputDir, file));
          resolve(files);
        })
        .on('error', (err) => {
          console.error('[FFmpeg] Error:', err);
          reject(err);
        })
        .save(outputTemplate);
    });
  }
}
