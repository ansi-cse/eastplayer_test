import { Controller, HttpStatus, Param, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as Busboy from 'busboy';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';

import { UploadFileUseCase } from '../../../application/use-cases/upload-file/upload-file.usecase';
import { UploadType } from '../../../domain/enum/upload-type.enum';
import { QUEUE_JOB, QUEUE_NAME } from '../../../infra/constants/queue.constant';
import FailedResponseDto, {
  SuccessResponseDto,
} from 'src/shared/utils/api-response';
import { ConfigService } from '@nestjs/config';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadFileUseCase: UploadFileUseCase,
    @InjectQueue(QUEUE_NAME.SPLIT_VIDEO)
    private readonly splitVideoQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

  @Post(':type(video|image)')
  async upload(
    @Param('type') type: UploadType,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const bucket = type;
    const busboy = Busboy({ headers: req.headers });

    let uploadPromise: Promise<any>;

    busboy.on('file', (_, fileStream, filename) => {
      const uniqueName = uuidv4() + '_' + filename.filename;
      uploadPromise = this.uploadFileUseCase
        .execute(bucket, {
          filename: uniqueName,
          stream: fileStream,
        })
        .catch((err) => {
          return res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json(
              new FailedResponseDto(
                1,
                HttpStatus.INTERNAL_SERVER_ERROR,
                'Upload Failed',
                err.message,
              ),
            );
        });
    });

    busboy.on('finish', async () => {
      try {
        const videoId = await uploadPromise;

        if (type === UploadType.VIDEO) {
          const frameInterval =
            Number(this.configService.get('video.frameInterval')) || 10;
          await this.splitVideoQueue.add(QUEUE_JOB.SPLIT_VIDEO, {
            key: videoId,
            frameInterval: frameInterval,
          });
        }

        return res
          .status(HttpStatus.OK)
          .json(
            new SuccessResponseDto(
              0,
              HttpStatus.OK,
              'Upload successful and your video is splitting',
              { id: videoId },
            ),
          );
      } catch (err) {
        console.error('Upload error:', err);
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(
            new FailedResponseDto(
              1,
              HttpStatus.INTERNAL_SERVER_ERROR,
              'Upload failed',
              err?.message || String(err),
            ),
          );
      }
    });

    busboy.on('error', (err: any) => {
      console.error('Busboy error:', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(
          new FailedResponseDto(
            1,
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Busboy error',
            err?.message || String(err),
          ),
        );
    });

    try {
      req.pipe(busboy);
    } catch (err) {
      console.error('Pipe error:', err);
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(
          new FailedResponseDto(
            1,
            HttpStatus.INTERNAL_SERVER_ERROR,
            'Pipe failed',
            err?.message || String(err),
          ),
        );
    }
  }
}
