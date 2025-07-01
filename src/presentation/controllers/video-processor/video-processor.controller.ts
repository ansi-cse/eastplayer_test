import { Controller, Post, Body } from '@nestjs/common';
import {
  ExposureAnalysisResult,
  FrameProcessingService,
} from '../../../application/use-cases/frame-processing/frame-processing.usecase';
import { SuccessResponseDto } from '../../../shared/utils/api-response';

@Controller('frames')
export class VideoProcessorController {
  constructor(private readonly frameService: FrameProcessingService) {}

  @Post('analyze')
  async analyzeFrame(@Body() body: { videoId: string; logoId: string }) {
    const { videoId, logoId } = body;
    const { exposure } = await this.frameService.execute(videoId, logoId, 10);
    return new SuccessResponseDto<ExposureAnalysisResult>(
      0,
      200,
      'Success',
      exposure,
    );
  }
}
