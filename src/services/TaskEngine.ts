import * as fs from 'fs';
import * as path from 'path';
import { ITask, TaskPriority, TaskStatus } from '../models/Task';

export class TaskEngine {
    private static readonly STORAGE_PATH = path.join(process.cwd(), 'data', 'tasks.json');

    constructor() {
        this.ensureStorageExists();
    }

    private ensureStorageExists(): void {
        const dir = path.dirname(TaskEngine.STORAGE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        if (!fs.existsSync(TaskEngine.STORAGE_PATH)) {
            fs.writeFileSync(TaskEngine.STORAGE_PATH, JSON.stringify([]));
        }
    }

    private getAllTasks(): ITask[] {
        const data = fs.readFileSync(TaskEngine.STORAGE_PATH, 'utf-8');
        return JSON.parse(data);
    }

    private saveAllTasks(tasks: ITask[]): void {
        fs.writeFileSync(TaskEngine.STORAGE_PATH, JSON.stringify(tasks, null, 2));
    }

    public createTask(data: { 
        title: string, 
        description: string, 
        priority: TaskPriority, 
        creatorId: string,
        attachments?: string[] 
    }): ITask {
        const tasks = this.getAllTasks();
        
        // Генерация ID: TZ-001, TZ-002...
        const lastId = tasks.length > 0 
            ? parseInt(tasks[tasks.length - 1].id.split('-')[1]) 
            : 0;
        const newId = `TZ-${(lastId + 1).toString().padStart(3, '0')}`;

        const newTask: ITask = {
            id: newId,
            ...data,
            status: TaskStatus.TODO,
            attachments: data.attachments || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        tasks.push(newTask);
        this.saveAllTasks(tasks);
        return newTask;
    }

    public getTaskById(id: string): ITask | undefined {
        return this.getAllTasks().find(t => t.id === id);
    }

    public updateTaskStatus(id: string, status: TaskStatus): ITask | null {
        const tasks = this.getAllTasks();
        const taskIndex = tasks.findIndex(t => t.id === id);

        if (taskIndex === -1) return null;

        tasks[taskIndex].status = status;
        tasks[taskIndex].updatedAt = new Date();

        this.saveAllTasks(tasks);
        return tasks[taskIndex];
    }

    public assignTask(id: string, userId: string): ITask | null {
        const tasks = this.getAllTasks();
        const taskIndex = tasks.findIndex(t => t.id === id);

        if (taskIndex === -1) return null;

        tasks[taskIndex].assigneeId = userId;
        tasks[taskIndex].updatedAt = new Date();

        this.saveAllTasks(tasks);
        return tasks[taskIndex];
    }
}
