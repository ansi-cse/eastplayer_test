import { Module } from '@nestjs/common';
import { MockOpenAIService } from './mock-openai.service';
import { LogoDetector } from 'src/domain/interfaces/logo-detector.interface';

@Module({
  providers: [{ provide: LogoDetector, useClass: MockOpenAIService }],
  exports: [LogoDetector],
})
export class MockOpenAIModule {}
