import { Module } from '@nestjs/common';
import { VideoProcessorController } from './video-processor.controller';
import { FrameProcessingModule } from '../../../application/use-cases/frame-processing/frame-processing.usecase.module';
import { SplitVideoUseCaseModule } from '../../../application/use-cases/split-video/split-video.usecase.module';
import { SplitVideoProcessorModule } from 'src/presentation/processors/split-video/split-video.processor.module';
@Module({
  imports: [
    FrameProcessingModule,
    SplitVideoUseCaseModule,
    SplitVideoProcessorModule,
  ],
  controllers: [VideoProcessorController],
})
export class VideoProcessorModule {}
