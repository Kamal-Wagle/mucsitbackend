interface IJob {
    name: string;
    schedule: string;
    handler: () => Promise<void>;
    enabled: boolean;
}
export declare class JobScheduler {
    private jobs;
    private intervals;
    registerJob(job: IJob): void;
    startJob(name: string): void;
    stopJob(name: string): void;
    stopAllJobs(): void;
    private parseSchedule;
}
export declare const jobScheduler: JobScheduler;
export {};
//# sourceMappingURL=JobScheduler.d.ts.map