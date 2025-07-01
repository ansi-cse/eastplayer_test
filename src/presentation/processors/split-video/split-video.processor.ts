// src/queue/brand-analysis.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SplitVideoUseCase } from '../../../application/use-cases/split-video/split-video.usecase';
import { QUEUE_JOB, QUEUE_NAME } from '../../../infra/constants/queue.constant';

@Processor(QUEUE_NAME.SPLIT_VIDEO)
export class SplitVideoProcessor {
  constructor(private readonly videoService: SplitVideoUseCase) {}

  @Process(QUEUE_JOB.SPLIT_VIDEO)
  async handle(job: Job) {
    const { key, frameInterval } = job.data;

    await this.videoService.execute(key, frameInterval);
  }
}
