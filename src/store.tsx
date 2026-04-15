import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Submission } from './types';

const STORAGE_KEY = 'ai-skills-arena-data';

interface AppState {
  tasks: Task[];
  submissions: Submission[];
  currentUser: { id: string; name: string; role: 'admin' | 'student' };
}

interface AppContextType extends AppState {
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  addSubmission: (submission: Omit<Submission, 'id' | 'createdAt' | 'scores' | 'averageScore'>) => void;
  gradeSubmission: (submissionId: string, score: number) => void;
  setCurrentUser: (user: AppState['currentUser']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadFromStorage(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('加载数据失败:', e);
  }
  return {
    tasks: [],
    submissions: [],
    currentUser: { id: 'u4', name: 'Demo User', role: 'student' },
  };
}

function saveToStorage(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('保存数据失败:', e);
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [currentUser, setCurrentUser] = useState<AppState['currentUser']>({
    id: 'u4',
    name: 'Demo User',
    role: 'student',
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const data = loadFromStorage();
    setTasks(data.tasks);
    setSubmissions(data.submissions);
    setCurrentUser(data.currentUser);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveToStorage({ tasks, submissions, currentUser });
    }
  }, [tasks, submissions, currentUser, loaded]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `t${Date.now()}`,
      createdAt: Date.now(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const addSubmission = (subData: Omit<Submission, 'id' | 'createdAt' | 'scores' | 'averageScore'>) => {
    const newSub: Submission = {
      ...subData,
      id: `s${Date.now()}`,
      scores: [],
      averageScore: 0,
      createdAt: Date.now(),
    };
    setSubmissions(prev => [newSub, ...prev]);
  };

  const gradeSubmission = (submissionId: string, score: number) => {
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === submissionId) {
        const newScores = [...sub.scores, score];
        const newAvg = newScores.reduce((a, b) => a + b, 0) / newScores.length;
        return { ...sub, scores: newScores, averageScore: newAvg };
      }
      return sub;
    }));
  };

  return (
    <AppContext.Provider value={{ tasks, submissions, currentUser, addTask, addSubmission, gradeSubmission, setCurrentUser }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}