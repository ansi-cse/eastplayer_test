import { Module } from '@nestjs/common';
import { FfmpegService } from '../../../infra/services/ffmpeg/ffmpeg.service';
import { SplitVideoUseCase } from './split-video.usecase';
import { MinioStorageService } from '../../../infra/services/minio/minio-storage.service';
import { IVideoFrameExtractor } from '../../../domain/interfaces/frame-extractor.interface';
import { IStorageService } from '../../../domain/interfaces/storage.interface';

@Module({
  providers: [
    SplitVideoUseCase,
    {
      provide: IVideoFrameExtractor,
      useClass: FfmpegService,
    },
    {
      provide: IStorageService,
      useClass: MinioStorageService,
    },
  ],
  exports: [SplitVideoUseCase],
})
export class SplitVideoUseCaseModule {}
