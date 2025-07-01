import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import minioConfig from './minio.config';
import redisConfig from './redis.config';
import videoConfig from './video.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [minioConfig, redisConfig, videoConfig],
    }),
  ],
})
export class AppConfigModule {}
