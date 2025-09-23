const EventEmitter = require('events');

class TaskScheduler extends EventEmitter {
    constructor(options = {}) {
        super();
        this.tasks = new Map();
        this.runningTasks = new Map();
        this.completedTasks = new Map();
        this.failedTasks = new Map();
        this.maxConcurrentTasks = options.maxConcurrentTasks || 5;
        this.defaultRetryAttempts = options.defaultRetryAttempts || 3;
        this.defaultRetryDelay = options.defaultRetryDelay || 1000;
        this.taskQueue = [];
        this.isProcessing = false;
        this.stats = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            startTime: null
        };
    }

    scheduleTask(id, taskFn, options = {}) {
        if (this.tasks.has(id)) {
            throw new Error(`Task with ID '${id}' already exists`);
        }

        const task = {
            id,
            taskFn,
            priority: options.priority || 0,
            retryAttempts: options.retryAttempts ?? this.defaultRetryAttempts,
            retryDelay: options.retryDelay || this.defaultRetryDelay,
            timeout: options.timeout,
            dependencies: options.dependencies || [],
            scheduledAt: new Date(),
            attempts: 0,
            status: 'pending',
            metadata: options.metadata || {}
        };

        this.tasks.set(id, task);
        this.taskQueue.push(task);
        this.stats.totalTasks++;

        this.emit('task:scheduled', { taskId: id, task });

        if (!this.isProcessing) {
            this.processQueue();
        }

        return task;
    }

    async processQueue() {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.stats.startTime = this.stats.startTime || new Date();

        while (this.taskQueue.length > 0 && this.runningTasks.size < this.maxConcurrentTasks) {
            const task = this.getNextExecutableTask();
            
            if (!task) {
                break;
            }

            this.executeTask(task);
        }

        if (this.runningTasks.size === 0 && this.taskQueue.length === 0) {
            this.isProcessing = false;
            this.emit('queue:completed', this.getStats());
        }
    }

    getNextExecutableTask() {
        this.taskQueue.sort((a, b) => b.priority - a.priority);

        for (let i = 0; i < this.taskQueue.length; i++) {
            const task = this.taskQueue[i];
            
            if (this.areDependenciesMet(task)) {
                return this.taskQueue.splice(i, 1)[0];
            }
        }

        return null;
    }

    areDependenciesMet(task) {
        for (const depId of task.dependencies) {
            if (!this.completedTasks.has(depId)) {
                return false;
            }
        }
        return true;
    }

    async executeTask(task) {
        task.status = 'running';
        task.startedAt = new Date();
        task.attempts++;

        this.runningTasks.set(task.id, task);
        this.emit('task:started', { taskId: task.id, task });

        try {
            let result;
            
            if (task.timeout) {
                result = await this.executeWithTimeout(task);
            } else {
                result = await task.taskFn();
            }

            task.status = 'completed';
            task.completedAt = new Date();
            task.result = result;

            this.runningTasks.delete(task.id);
            this.completedTasks.set(task.id, task);
            this.stats.completedTasks++;

            this.emit('task:completed', { taskId: task.id, task, result });

        } catch (error) {
            await this.handleTaskError(task, error);
        }

        this.processQueue();
    }

    async executeWithTimeout(task) {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Task '${task.id}' timed out after ${task.timeout}ms`));
            }, task.timeout);

            task.taskFn()
                .then(result => {
                    clearTimeout(timeoutId);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    async handleTaskError(task, error) {
        task.lastError = error;
        task.errorAt = new Date();

        this.emit('task:error', { taskId: task.id, task, error, attempt: task.attempts });

        if (task.attempts < task.retryAttempts) {
            task.status = 'retrying';
            
            setTimeout(() => {
                this.taskQueue.unshift(task);
                this.processQueue();
            }, task.retryDelay * task.attempts);

            this.emit('task:retry', { taskId: task.id, task, attempt: task.attempts });
        } else {
            task.status = 'failed';
            task.failedAt = new Date();

            this.runningTasks.delete(task.id);
            this.failedTasks.set(task.id, task);
            this.stats.failedTasks++;

            this.emit('task:failed', { taskId: task.id, task, error });
        }
    }

    cancelTask(taskId) {
        const task = this.tasks.get(taskId);
        
        if (!task) {
            throw new Error(`Task with ID '${taskId}' not found`);
        }

        if (task.status === 'pending') {
            const index = this.taskQueue.findIndex(t => t.id === taskId);
            if (index > -1) {
                this.taskQueue.splice(index, 1);
            }
        }

        if (task.status === 'running') {
            this.runningTasks.delete(taskId);
        }

        task.status = 'cancelled';
        task.cancelledAt = new Date();

        this.emit('task:cancelled', { taskId, task });

        return task;
    }

    pauseScheduler() {
        this.isProcessing = false;
        this.emit('scheduler:paused');
    }

    resumeScheduler() {
        if (!this.isProcessing) {
            this.processQueue();
        }
        this.emit('scheduler:resumed');
    }

    getTask(taskId) {
        return this.tasks.get(taskId);
    }

    getTaskStatus(taskId) {
        const task = this.tasks.get(taskId);
        return task ? task.status : null;
    }

    getRunningTasks() {
        return Array.from(this.runningTasks.values());
    }

    getCompletedTasks() {
        return Array.from(this.completedTasks.values());
    }

    getFailedTasks() {
        return Array.from(this.failedTasks.values());
    }

    getPendingTasks() {
        return this.taskQueue.slice();
    }

    getStats() {
        const now = new Date();
        const duration = this.stats.startTime ? now - this.stats.startTime : 0;

        return {
            totalTasks: this.stats.totalTasks,
            completedTasks: this.stats.completedTasks,
            failedTasks: this.stats.failedTasks,
            runningTasks: this.runningTasks.size,
            pendingTasks: this.taskQueue.length,
            duration,
            successRate: this.stats.totalTasks > 0 ? (this.stats.completedTasks / this.stats.totalTasks) * 100 : 0
        };
    }

    clear() {
        this.tasks.clear();
        this.runningTasks.clear();
        this.completedTasks.clear();
        this.failedTasks.clear();
        this.taskQueue = [];
        this.isProcessing = false;
        this.stats = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            startTime: null
        };
        this.emit('scheduler:cleared');
    }
}

class CronScheduler extends EventEmitter {
    constructor() {
        super();
        this.jobs = new Map();
        this.isRunning = false;
        this.intervalId = null;
        this.checkInterval = 1000;
    }

    addJob(id, cronExpression, taskFn, options = {}) {
        if (this.jobs.has(id)) {
            throw new Error(`Job with ID '${id}' already exists`);
        }

        const job = {
            id,
            cronExpression,
            taskFn,
            enabled: options.enabled !== false,
            lastRun: null,
            nextRun: this.getNextRunTime(cronExpression),
            runCount: 0,
            errorCount: 0,
            metadata: options.metadata || {},
            createdAt: new Date()
        };

        this.jobs.set(id, job);
        this.emit('job:added', { jobId: id, job });

        if (!this.isRunning) {
            this.start();
        }

        return job;
    }

    removeJob(id) {
        const job = this.jobs.get(id);
        if (job) {
            this.jobs.delete(id);
            this.emit('job:removed', { jobId: id, job });
            
            if (this.jobs.size === 0) {
                this.stop();
            }
        }
        return job;
    }

    enableJob(id) {
        const job = this.jobs.get(id);
        if (job) {
            job.enabled = true;
            job.nextRun = this.getNextRunTime(job.cronExpression);
            this.emit('job:enabled', { jobId: id, job });
        }
        return job;
    }

    disableJob(id) {
        const job = this.jobs.get(id);
        if (job) {
            job.enabled = false;
            job.nextRun = null;
            this.emit('job:disabled', { jobId: id, job });
        }
        return job;
    }

    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.intervalId = setInterval(() => {
            this.checkAndRunJobs();
        }, this.checkInterval);

        this.emit('scheduler:started');
    }

    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }

        this.emit('scheduler:stopped');
    }

    checkAndRunJobs() {
        const now = new Date();

        for (const job of this.jobs.values()) {
            if (job.enabled && job.nextRun && now >= job.nextRun) {
                this.runJob(job);
                job.nextRun = this.getNextRunTime(job.cronExpression);
            }
        }
    }

    async runJob(job) {
        job.lastRun = new Date();
        job.runCount++;

        this.emit('job:started', { jobId: job.id, job });

        try {
            const result = await job.taskFn();
            this.emit('job:completed', { jobId: job.id, job, result });
        } catch (error) {
            job.errorCount++;
            this.emit('job:error', { jobId: job.id, job, error });
        }
    }

    getNextRunTime(cronExpression) {
        const now = new Date();
        const nextMinute = new Date(now.getTime() + 60000);
        nextMinute.setSeconds(0, 0);
        
        return nextMinute;
    }

    getJob(id) {
        return this.jobs.get(id);
    }

    getAllJobs() {
        return Array.from(this.jobs.values());
    }

    getJobStats(id) {
        const job = this.jobs.get(id);
        if (!job) return null;

        return {
            id: job.id,
            enabled: job.enabled,
            runCount: job.runCount,
            errorCount: job.errorCount,
            successRate: job.runCount > 0 ? ((job.runCount - job.errorCount) / job.runCount) * 100 : 0,
            lastRun: job.lastRun,
            nextRun: job.nextRun,
            createdAt: job.createdAt
        };
    }
}

class WorkerPool extends EventEmitter {
    constructor(workerScript, poolSize = 4) {
        super();
        this.workerScript = workerScript;
        this.poolSize = poolSize;
        this.workers = [];
        this.availableWorkers = [];
        this.taskQueue = [];
        this.activeTasks = new Map();
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        for (let i = 0; i < this.poolSize; i++) {
            const worker = this.createWorker(i);
            this.workers.push(worker);
            this.availableWorkers.push(worker);
        }

        this.isInitialized = true;
        this.emit('pool:initialized', { poolSize: this.poolSize });
    }

    createWorker(id) {
        const { Worker } = require('worker_threads');
        
        const worker = new Worker(this.workerScript);
        worker.workerId = id;
        worker.isBusy = false;

        worker.on('message', (result) => {
            this.handleWorkerMessage(worker, result);
        });

        worker.on('error', (error) => {
            this.handleWorkerError(worker, error);
        });

        worker.on('exit', (code) => {
            this.handleWorkerExit(worker, code);
        });

        return worker;
    }

    async execute(taskData, options = {}) {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve, reject) => {
            const task = {
                id: options.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                data: taskData,
                resolve,
                reject,
                timeout: options.timeout,
                priority: options.priority || 0,
                createdAt: new Date()
            };

            this.taskQueue.push(task);
            this.taskQueue.sort((a, b) => b.priority - a.priority);

            this.processQueue();
        });
    }

    processQueue() {
        while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
            const task = this.taskQueue.shift();
            const worker = this.availableWorkers.shift();

            this.assignTaskToWorker(worker, task);
        }
    }

    assignTaskToWorker(worker, task) {
        worker.isBusy = true;
        task.worker = worker;
        task.startedAt = new Date();

        this.activeTasks.set(task.id, task);

        if (task.timeout) {
            task.timeoutId = setTimeout(() => {
                this.handleTaskTimeout(task);
            }, task.timeout);
        }

        worker.postMessage({
            type: 'execute',
            taskId: task.id,
            data: task.data
        });

        this.emit('task:started', { taskId: task.id, workerId: worker.workerId });
    }

    handleWorkerMessage(worker, message) {
        const { type, taskId, result, error } = message;

        if (type === 'result') {
            const task = this.activeTasks.get(taskId);
            if (task) {
                this.completeTask(task, result);
            }
        } else if (type === 'error') {
            const task = this.activeTasks.get(taskId);
            if (task) {
                this.failTask(task, new Error(error));
            }
        }
    }

    handleWorkerError(worker, error) {
        const activeTasks = Array.from(this.activeTasks.values())
            .filter(task => task.worker === worker);

        activeTasks.forEach(task => {
            this.failTask(task, error);
        });

        this.replaceWorker(worker);
    }

    handleWorkerExit(worker, code) {
        if (code !== 0) {
            const activeTasks = Array.from(this.activeTasks.values())
                .filter(task => task.worker === worker);

            activeTasks.forEach(task => {
                this.failTask(task, new Error(`Worker exited with code ${code}`));
            });

            this.replaceWorker(worker);
        }
    }

    handleTaskTimeout(task) {
        this.failTask(task, new Error(`Task ${task.id} timed out`));
    }

    completeTask(task, result) {
        if (task.timeoutId) {
            clearTimeout(task.timeoutId);
        }

        task.completedAt = new Date();
        task.duration = task.completedAt - task.startedAt;

        this.activeTasks.delete(task.id);
        task.worker.isBusy = false;
        this.availableWorkers.push(task.worker);

        task.resolve(result);
        this.emit('task:completed', { 
            taskId: task.id, 
            workerId: task.worker.workerId, 
            duration: task.duration 
        });

        this.processQueue();
    }

    failTask(task, error) {
        if (task.timeoutId) {
            clearTimeout(task.timeoutId);
        }

        task.failedAt = new Date();
        task.error = error;

        this.activeTasks.delete(task.id);
        
        if (task.worker) {
            task.worker.isBusy = false;
            this.availableWorkers.push(task.worker);
        }

        task.reject(error);
        this.emit('task:failed', { 
            taskId: task.id, 
            workerId: task.worker?.workerId, 
            error: error.message 
        });

        this.processQueue();
    }

    replaceWorker(deadWorker) {
        const index = this.workers.indexOf(deadWorker);
        if (index > -1) {
            this.workers[index] = this.createWorker(deadWorker.workerId);
            
            const availableIndex = this.availableWorkers.indexOf(deadWorker);
            if (availableIndex > -1) {
                this.availableWorkers[availableIndex] = this.workers[index];
            }
        }

        deadWorker.terminate();
        this.emit('worker:replaced', { workerId: deadWorker.workerId });
    }

    getStats() {
        return {
            poolSize: this.poolSize,
            availableWorkers: this.availableWorkers.length,
            busyWorkers: this.poolSize - this.availableWorkers.length,
            queuedTasks: this.taskQueue.length,
            activeTasks: this.activeTasks.size
        };
    }

    async terminate() {
        for (const worker of this.workers) {
            await worker.terminate();
        }

        this.workers = [];
        this.availableWorkers = [];
        this.taskQueue = [];
        this.activeTasks.clear();
        this.isInitialized = false;

        this.emit('pool:terminated');
    }
}

const createBatchProcessor = (processorFn, batchSize = 10, delay = 100) => {
    let batch = [];
    let timeoutId = null;

    const processBatch = async () => {
        if (batch.length === 0) return;

        const currentBatch = batch.splice(0, batchSize);
        try {
            await processorFn(currentBatch);
        } catch (error) {
            console.error('Batch processing error:', error);
        }

        if (batch.length > 0) {
            timeoutId = setTimeout(processBatch, delay);
        }
    };

    return {
        add: (item) => {
            batch.push(item);
            
            if (batch.length >= batchSize) {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                processBatch();
            } else if (batch.length === 1) {
                timeoutId = setTimeout(processBatch, delay);
            }
        },
        flush: () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            return processBatch();
        },
        size: () => batch.length
    };
};

module.exports = {
    TaskScheduler,
    CronScheduler,
    WorkerPool,
    createBatchProcessor
};