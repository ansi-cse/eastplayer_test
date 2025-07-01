import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppConfigModule } from './shared/config/config.module';
import { UploadModule } from './presentation/controllers/upload/upload.module';
import { VideoProcessorModule } from './presentation/controllers/video-processor/video-processor.module';
import { BullConfigModule } from './infra/config/bull-config.module';

@Module({
  imports: [
    AppConfigModule,
    BullConfigModule,
    UploadModule,
    VideoProcessorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
