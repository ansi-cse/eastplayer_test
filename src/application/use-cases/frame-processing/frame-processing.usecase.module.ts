import { Module } from '@nestjs/common';
import { FrameProcessingService } from './frame-processing.usecase';
import { MockOpenAIModule } from '../../../infra/services/openai/mock-openai.service.module';
import { MinioStorageService } from '../../../infra/services/minio/minio-storage.service';
import { IStorageService } from '../../../domain/interfaces/storage.interface';

@Module({
  imports: [MockOpenAIModule],
  providers: [
    FrameProcessingService,
    {
      provide: IStorageService,
      useClass: MinioStorageService,
    },
  ],
  exports: [FrameProcessingService],
})
export class FrameProcessingModule {}
