export enum TaskPriority {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH'
}

export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE',
    ARCHIVED = 'ARCHIVED'
}

export interface ITask {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    creatorId: string;
    assigneeId?: string;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
}
