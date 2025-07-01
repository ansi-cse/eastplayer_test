import { Injectable } from '@nestjs/common';
import { Position } from 'src/domain/enum/logo-position.enum';
import {
  LogoDetectionResult,
  LogoDetector,
} from '../../../domain/interfaces/logo-detector.interface';

@Injectable()
export class MockOpenAIService implements LogoDetector {
  /**
   * Simulates analyzing a frame for a logo by returning a random boolean.
   * In a real implementation, this might call an ML model or external API.
   */
  async analyzeFrame(
    frameUrl: string,
    logoUrl: string,
  ): Promise<LogoDetectionResult> {
    const detected = Math.random() < 0.5;

    if (!detected) {
      return { detected: false };
    }

    const positions: LogoDetectionResult['position'][] = [
      Position.TopLeft,
      Position.TopRight,
      Position.BottomLeft,
      Position.BottomRight,
    ];

    const randomPosition =
      positions[Math.floor(Math.random() * positions.length)];

    return {
      detected: true,
      position: randomPosition,
    };
  }
}
