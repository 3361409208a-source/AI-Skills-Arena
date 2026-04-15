import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export function GradingView({ taskId, onBack }: { taskId: string, onBack: () => void }) {
  const { tasks, submissions, currentUser, gradeSubmission } = useAppContext();
  const task = tasks.find(t => t.id === taskId);
  const taskSubmissions = submissions.filter(s => s.taskId === taskId);
  
  const [scores, setScores] = useState<Record<string, number>>({});

  if (!task) return <div>Task not found</div>;

  const handleGrade = (subId: string) => {
    const score = scores[subId];
    if (score !== undefined) {
      gradeSubmission(subId, score);
      setScores(prev => {
        const next = { ...prev };
        delete next[subId];
        return next;
      });
    }
  };

  const sortedSubmissions = [...taskSubmissions].sort((a, b) => b.averageScore - a.averageScore);

  return (
    <div className="flex-1 flex overflow-hidden">
      <section className="w-[320px] border-r-2 border-border p-10 flex flex-col gap-8 shrink-0 overflow-y-auto">
        <div>
          <span className="theme-label">当前任务</span>
          <h2 className="text-[28px] font-extrabold leading-[1.1] mt-2">{task.title}</h2>
          <p className="text-sm mt-3 opacity-70">{task.description}</p>
        </div>

        <div>
          <span className="theme-label">实时排名</span>
          <div className="mt-4 flex flex-col">
            {sortedSubmissions.slice(0, 5).map((sub, idx) => (
              <div key={sub.id} className="grid grid-cols-[40px_1fr_60px] items-center py-3 border-b border-black/10">
                <span className="text-2xl font-black italic">{String(idx + 1).padStart(2, '0')}</span>
                <span className="font-semibold truncate pr-2">{sub.studentName}</span>
                <span className="font-mono font-bold text-primary text-right">{sub.averageScore > 0 ? sub.averageScore.toFixed(1) : '-'}</span>
              </div>
            ))}
            {sortedSubmissions.length === 0 && (
              <div className="text-sm opacity-50 py-2">暂无排名</div>
            )}
          </div>
        </div>
      </section>

      <section className="flex-1 p-10 bg-white overflow-y-auto flex flex-col">
        <div className="mb-[30px]">
          <span className="theme-label">正在评审提交项 (Total: {taskSubmissions.length})</span>
          <h1 className="theme-heading">SUBMISSIONS</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 flex-1 content-start">
          {taskSubmissions.map(sub => (
            <div key={sub.id} className="theme-card flex flex-col p-5 gap-4">
              <div className="flex justify-between">
                <span className="theme-label">STUDENT ID: #{sub.studentId.replace(/\D/g, '').slice(-4) || '0000'}</span>
                <span className="theme-label text-primary">SCORE: {sub.averageScore > 0 ? sub.averageScore.toFixed(1) : 'N/A'}</span>
              </div>
              
              {task.type === 'image' ? (
                <div className="aspect-video bg-muted border border-border flex items-center justify-center font-bold text-muted-foreground relative overflow-hidden">
                  <div className="absolute z-10 p-2.5 bg-black/50 text-white text-[10px] top-0 left-0 right-0 line-clamp-2">
                    PROMPT: {sub.content}
                  </div>
                  <img src={sub.resultUrl} alt="Result" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex-1 border border-dashed border-border bg-[#F9F9F9] p-3 font-mono text-xs overflow-hidden relative min-h-[200px] flex flex-col">
                  <div className="absolute top-0 right-0 bg-border text-white text-[10px] px-2 py-0.5 z-10">HTML/CSS</div>
                  <div className="text-slate-600 leading-[1.4] overflow-y-auto flex-1 mb-2 whitespace-pre-wrap">
                    {sub.content}
                  </div>
                  <div className="h-[150px] border-t border-border pt-2 mt-auto">
                    <iframe 
                      srcDoc={sub.content} 
                      title="Result Preview" 
                      className="w-full h-full border-0 bg-white"
                      sandbox="allow-scripts"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-2">
                {sub.studentId === currentUser.id ? (
                  <div className="text-xs font-bold opacity-50 text-center py-2">这是你自己的作品，无法评分</div>
                ) : (
                  <>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold w-16">打分: {scores[sub.id] || 50}</span>
                      <Slider 
                        value={[scores[sub.id] || 50]} 
                        max={100} 
                        step={1} 
                        onValueChange={(val) => setScores({ ...scores, [sub.id]: val[0] })}
                        className="flex-1"
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-bold cursor-pointer hover:underline">查看详情</span>
                      <button className="theme-button px-4 py-2" onClick={() => handleGrade(sub.id)}>评分 +1</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {taskSubmissions.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground font-bold">
              暂无提交的作品
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
