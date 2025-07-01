import { Position } from '../enum/logo-position.enum';

export type LogoDetectionResult = {
  detected: boolean;
  position?: Position;
};

export const LogoDetector = Symbol('LogoDetector');

export interface LogoDetector {
  analyzeFrame(frameUrl: string, logoUrl: string): Promise<LogoDetectionResult>;
}
