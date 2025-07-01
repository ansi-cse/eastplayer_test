import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  S3,
} from '@aws-sdk/client-s3';
import { IStorageService } from '../../../domain/interfaces/storage.interface';
import { ConfigService } from '@nestjs/config';
import { PassThrough, Readable } from 'stream';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class MinioStorageService implements IStorageService {
  private readonly s3: S3;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.endpoint = `http://${configService.get<string>('minio.endpoint')}:${configService.get<string>('minio.port')}`;
    const accessKeyId = configService.get<string>('minio.accessKey');
    const secretAccessKey = configService.get<string>('minio.secretKey');

    if (!accessKeyId || !secretAccessKey) {
      throw new Error(
        'MinIO access key or secret key is not defined in configuration',
      );
    }

    this.s3 = new S3({
      endpoint: this.endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
      region: 'us-east-1',
    });
  }

  private async ensureBucketExists(bucket: string) {
    try {
      await this.s3.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch (error: any) {
      if (
        error.name === 'NotFound' ||
        error.$metadata?.httpStatusCode === 404
      ) {
        await this.s3.send(new CreateBucketCommand({ Bucket: bucket }));
      } else {
        throw new Error(`Failed to check/create bucket: ${error.message}`);
      }
    }
  }

  async uploadStream(
    bucket: string,
    filename: string,
    stream: Readable,
  ): Promise<string> {
    await this.ensureBucketExists(bucket);
    try {
      const upload = new Upload({
        client: this.s3,
        params: {
          Bucket: bucket,
          Key: filename,
          Body: stream,
        },
      });

      await upload.done();
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new InternalServerErrorException('Failed to upload file');
    }

    return `${filename}`;
  }

  async readStream(bucket: string, key: string): Promise<Readable> {
    const response = await this.s3.getObject({
      Bucket: bucket,
      Key: key,
    });
    if (!response.Body || !(response.Body instanceof Readable)) {
      throw new InternalServerErrorException(
        'Invalid response body from MinIO',
      );
    }
    const pass = new PassThrough();
    response.Body.pipe(pass);
    return pass;
  }
  async getSignedUrl(
    bucket: string,
    key: string,
    expiresInSeconds = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3, command, {
        expiresIn: expiresInSeconds,
      });

      return url;
    } catch (error) {
      console.error('Failed to generate signed URL:', error);
      throw new InternalServerErrorException('Failed to generate signed URL');
    }
  }

  async getAllFrames(bucket: string, videoIdPrefix: string): Promise<string[]> {
    try {
      const result = await this.s3.send(
        new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: videoIdPrefix + '/',
        }),
      );

      if (!result.Contents) return [];

      return result.Contents.map((item) => item.Key!).filter((key) =>
        key.endsWith('.png'),
      );
    } catch (error) {
      console.error('Failed to list frames:', error);
      throw new InternalServerErrorException('Failed to list frames');
    }
  }
}
