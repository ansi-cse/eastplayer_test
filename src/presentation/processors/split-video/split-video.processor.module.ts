import { Module } from '@nestjs/common';
import { SplitVideoProcessor } from './split-video.processor';
import { SplitVideoUseCaseModule } from 'src/application/use-cases/split-video/split-video.usecase.module';

@Module({
  providers: [SplitVideoProcessor],
  imports: [SplitVideoUseCaseModule],
  exports: [SplitVideoProcessor],
})
export class SplitVideoProcessorModule {}
