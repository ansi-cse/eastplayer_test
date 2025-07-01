import { Readable } from 'stream';

export const IVideoFrameExtractor = Symbol('IVideoFrameExtractor');

export interface IVideoFrameExtractor {
  extractFrames(
    input: string | Readable,
    intervalSeconds: number,
    outputDir: string,
  ): Promise<string[]>;
}
