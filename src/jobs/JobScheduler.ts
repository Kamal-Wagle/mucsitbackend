interface IJob {
  name: string;
  schedule: string; // cron expression
  handler: () => Promise<void>;
  enabled: boolean;
}

export class JobScheduler {
  private jobs: Map<string, IJob> = new Map();
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  registerJob(job: IJob): void {
    if (this.jobs.has(job.name)) {
      throw new Error(`Job ${job.name} is already registered`);
    }

    this.jobs.set(job.name, job);
    
    if (job.enabled) {
      this.startJob(job.name);
    }

    console.log(`📋 Job ${job.name} registered successfully`);
  }

  startJob(name: string): void {
    const job = this.jobs.get(name);
    if (!job) {
      throw new Error(`Job ${name} not found`);
    }

    if (this.intervals.has(name)) {
      this.stopJob(name);
    }

    // Simple interval-based scheduling (in production, use a proper cron library)
    const interval = this.parseSchedule(job.schedule);
    const intervalId = setInterval(async () => {
      try {
        console.log(`🔄 Running job: ${name}`);
        await job.handler();
        console.log(`✅ Job completed: ${name}`);
      } catch (error) {
        console.error(`❌ Job failed: ${name}`, error);
      }
    }, interval);

    this.intervals.set(name, intervalId);
    console.log(`▶️ Job started: ${name}`);
  }

  stopJob(name: string): void {
    const intervalId = this.intervals.get(name);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(name);
      console.log(`⏹️ Job stopped: ${name}`);
    }
  }

  stopAllJobs(): void {
    for (const name of this.intervals.keys()) {
      this.stopJob(name);
    }
  }

  private parseSchedule(schedule: string): number {
    // Simple schedule parser - in production, use a proper cron parser
    switch (schedule) {
      case '*/5 * * * *': return 5 * 60 * 1000; // Every 5 minutes
      case '0 * * * *': return 60 * 60 * 1000; // Every hour
      case '0 0 * * *': return 24 * 60 * 60 * 1000; // Every day
      default: return 60 * 60 * 1000; // Default to 1 hour
    }
  }
}

export const jobScheduler = new JobScheduler();

// Register default jobs
jobScheduler.registerJob({
  name: 'cleanup-expired-assignments',
  schedule: '0 0 * * *', // Daily at midnight
  handler: async () => {
    const { assignmentService } = await import('../services');
    const count = await assignmentService.deactivateExpired();
    console.log(`Deactivated ${count} expired assignments`);
  },
  enabled: true
});