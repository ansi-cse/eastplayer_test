import { Inject, Injectable } from '@nestjs/common';
import { IStorageService } from '../../../domain/interfaces/storage.interface';
import { Readable } from 'stream';

@Injectable()
export class UploadFileUseCase {
  constructor(
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    bucket: string,
    file: { filename: string; stream: Readable },
  ): Promise<string> {
    return await this.storageService.uploadStream(
      bucket,
      file.filename,
      file.stream,
    );
  }
}
