import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadFileUseCaseModule } from '../../../application/use-cases/upload-file/upload-file.usecase.module';
import { BullModule } from '@nestjs/bull';
import { QUEUE_NAME } from 'src/infra/constants/queue.constant';
@Module({
  imports: [
    UploadFileUseCaseModule,
    BullModule.registerQueue({
      name: QUEUE_NAME.SPLIT_VIDEO,
    }),
  ],
  controllers: [UploadController],
})
export class UploadModule {}
