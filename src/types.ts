export type TaskType = 'image' | 'html';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  createdAt: number;
}

export interface Submission {
  id: string;
  taskId: string;
  studentId: string;
  studentName: string;
  content: string;
  resultUrl?: string;
  scores: number[];
  averageScore: number;
  createdAt: number;
}