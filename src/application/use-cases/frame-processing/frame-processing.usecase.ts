import { Injectable, Inject } from '@nestjs/common';
import {
  LogoDetectionResult,
  LogoDetector,
} from '../../../domain/interfaces/logo-detector.interface';
import { IStorageService } from '../../../domain/interfaces/storage.interface';
import {
  FRAME_BUCKET,
  IMAGE_BUCKET,
} from '../../../infra/constants/bucket.constant';

export type ExposureAnalysisResult = {
  totalFrames: number;
  logoDetectedFrames: number;
  exposureRatio: number;
  totalDurationSeconds: number;
  exposureDurationSeconds: number;
  positions: {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  };
};

@Injectable()
export class FrameProcessingService {
  constructor(
    @Inject(LogoDetector) private readonly logoDetector: LogoDetector,
    @Inject(IStorageService)
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    videoId: string,
    logoId: string,
    frameInterval: number,
  ): Promise<{
    results: LogoDetectionResult[];
    exposure: ExposureAnalysisResult;
  }> {
    const results: LogoDetectionResult[] = [];
    const logoUrl = await this.storageService.getSignedUrl(
      IMAGE_BUCKET,
      logoId,
      60,
    );
    const frameUrls = await this.storageService.getAllFrames(
      FRAME_BUCKET,
      videoId,
    );
    for (const url of frameUrls) {
      const result = await this.logoDetector.analyzeFrame(url, logoUrl);
      results.push(result);
    }

    const exposure = await this.analyzeExposure(results, frameInterval);

    return { results, exposure };
  }

  async analyzeExposure(
    frames: LogoDetectionResult[],
    frameInterval: number,
  ): Promise<ExposureAnalysisResult> {
    const totalFrames = frames.length;
    const detectedFrames = frames.filter((f) => f.detected);
    const logoDetectedFrames = detectedFrames.length;
    const exposureRatio = logoDetectedFrames / totalFrames;
    const exposureDurationSeconds = logoDetectedFrames * frameInterval;
    const totalDurationSeconds = totalFrames * frameInterval;

    const positionsCount = {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    };

    for (const f of detectedFrames) {
      if (f.position) {
        positionsCount[f.position]++;
      }
    }

    return {
      totalFrames,
      logoDetectedFrames,
      exposureRatio,
      totalDurationSeconds,
      exposureDurationSeconds,
      positions: positionsCount,
    };
  }
}
