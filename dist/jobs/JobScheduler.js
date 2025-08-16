"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobScheduler = exports.JobScheduler = void 0;
class JobScheduler {
    constructor() {
        this.jobs = new Map();
        this.intervals = new Map();
    }
    registerJob(job) {
        if (this.jobs.has(job.name)) {
            throw new Error(`Job ${job.name} is already registered`);
        }
        this.jobs.set(job.name, job);
        if (job.enabled) {
            this.startJob(job.name);
        }
        console.log(`📋 Job ${job.name} registered successfully`);
    }
    startJob(name) {
        const job = this.jobs.get(name);
        if (!job) {
            throw new Error(`Job ${name} not found`);
        }
        if (this.intervals.has(name)) {
            this.stopJob(name);
        }
        const interval = this.parseSchedule(job.schedule);
        const intervalId = setInterval(async () => {
            try {
                console.log(`🔄 Running job: ${name}`);
                await job.handler();
                console.log(`✅ Job completed: ${name}`);
            }
            catch (error) {
                console.error(`❌ Job failed: ${name}`, error);
            }
        }, interval);
        this.intervals.set(name, intervalId);
        console.log(`▶️ Job started: ${name}`);
    }
    stopJob(name) {
        const intervalId = this.intervals.get(name);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(name);
            console.log(`⏹️ Job stopped: ${name}`);
        }
    }
    stopAllJobs() {
        for (const name of this.intervals.keys()) {
            this.stopJob(name);
        }
    }
    parseSchedule(schedule) {
        switch (schedule) {
            case '*/5 * * * *': return 5 * 60 * 1000;
            case '0 * * * *': return 60 * 60 * 1000;
            case '0 0 * * *': return 24 * 60 * 60 * 1000;
            default: return 60 * 60 * 1000;
        }
    }
}
exports.JobScheduler = JobScheduler;
exports.jobScheduler = new JobScheduler();
exports.jobScheduler.registerJob({
    name: 'cleanup-expired-assignments',
    schedule: '0 0 * * *',
    handler: async () => {
        const { assignmentService } = await Promise.resolve().then(() => __importStar(require('../services')));
        const count = await assignmentService.deactivateExpired();
        console.log(`Deactivated ${count} expired assignments`);
    },
    enabled: true
});
//# sourceMappingURL=JobScheduler.js.map