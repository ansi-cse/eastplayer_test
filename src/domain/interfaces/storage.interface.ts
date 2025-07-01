import { Readable } from 'stream';

export const IStorageService = Symbol('IStorageService');

export interface IStorageService {
  uploadStream(
    bucket: string,
    filename: string,
    stream: Readable,
  ): Promise<string>;
  readStream(bucket: string, key: string): Promise<Readable>;
  getSignedUrl(
    bucket: string,
    key: string,
    expiresInSeconds: number,
  ): Promise<string>;
  getAllFrames(bucket: string, videoIdPrefix: string): Promise<string[]>;
}
