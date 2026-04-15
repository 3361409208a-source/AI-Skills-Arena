import React from 'react';
import { useAppContext } from '../store';
import { Button } from '@/components/ui/button';

export function LeaderboardView({ taskId, onBack }: { taskId: string, onBack: () => void }) {
  const { tasks, submissions } = useAppContext();
  const task = tasks.find(t => t.id === taskId);
  
  const taskSubmissions = submissions
    .filter(s => s.taskId === taskId)
    .sort((a, b) => b.averageScore - a.averageScore);

  if (!task) return <div>Task not found</div>;

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="theme-label">LEADERBOARD</span>
          <h1 className="theme-heading mt-2">RANKINGS</h1>
        </div>
        <Button variant="outline" className="border-2 border-border font-bold uppercase text-xs rounded-none" onClick={onBack}>
          返回任务大厅
        </Button>
      </div>

      <div className="theme-card p-8 mb-8">
        <span className="theme-label">当前任务</span>
        <h2 className="text-3xl font-black mt-2">{task.title}</h2>
      </div>

      <div className="flex flex-col gap-4">
        {taskSubmissions.map((sub, index) => (
          <div key={sub.id} className="theme-card flex items-center p-6 gap-6">
            <div className="w-16 text-center">
              <span className="text-4xl font-black italic opacity-20">{String(index + 1).padStart(2, '0')}</span>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold">{sub.studentName}</h3>
              <p className="text-sm font-bold opacity-50 uppercase tracking-widest mt-1">
                {sub.scores.length} REVIEWS
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-5xl font-black text-primary font-mono">
                {sub.averageScore > 0 ? sub.averageScore.toFixed(1) : '-'}
              </div>
              <div className="theme-label mt-1">
                FINAL SCORE
              </div>
            </div>
          </div>
        ))}
        {taskSubmissions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground font-bold">
            暂无排名数据
          </div>
        )}
      </div>
    </div>
  );
}
