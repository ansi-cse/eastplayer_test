import { Module } from '@nestjs/common';
import { UploadFileUseCase } from './upload-file.usecase';
import { MinioStorageService } from '../../../infra/services/minio/minio-storage.service';
import { IStorageService } from 'src/domain/interfaces/storage.interface';
@Module({
  providers: [
    UploadFileUseCase,
    {
      provide: IStorageService,
      useClass: MinioStorageService,
    },
  ],
  exports: [UploadFileUseCase],
})
export class UploadFileUseCaseModule {}
