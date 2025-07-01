import { Inject, Injectable } from '@nestjs/common';
import { IVideoFrameExtractor } from '../../../domain/interfaces/frame-extractor.interface';
import { IStorageService } from '../../../domain/interfaces/storage.interface';
import * as fs from 'fs/promises';
import { Readable } from 'stream';
import * as path from 'path';
import {
  FRAME_BUCKET,
  VIDEO_BUCKET,
} from 'src/infra/constants/bucket.constant';

@Injectable()
export class SplitVideoUseCase {
  constructor(
    @Inject(IVideoFrameExtractor)
    private readonly extractor: IVideoFrameExtractor,
    @Inject(IStorageService)
    private readonly storage: IStorageService,
  ) {}

  async execute(
    key: string,
    interval: number = 10,
    outputDir: string = './frames',
  ): Promise<string[]> {
    const input = await this.storage.getSignedUrl(VIDEO_BUCKET, key, 3600);
    const frameFiles = await this.extractor.extractFrames(
      input,
      interval,
      outputDir,
    );

    for (const filePath of frameFiles) {
      const fileBuffer = await fs.readFile(filePath);
      const stream = Readable.from(fileBuffer);
      const fileName = path.basename(filePath);
      await this.storage.uploadStream(
        FRAME_BUCKET,
        `${key}/${fileName}`,
        stream,
      );
      await fs.unlink(filePath);
    }

    return frameFiles;
  }
}
