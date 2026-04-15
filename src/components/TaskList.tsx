import React, { useState } from 'react';
import { useAppContext } from '../store';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Code, Users, Trophy, ArrowLeft, Maximize2, X } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function TaskList({ onSelectTask }: { onSelectTask: (taskId: string, view: 'submit' | 'grade' | 'leaderboard') => void }) {
  const { tasks, submissions, currentUser, gradeSubmission } = useAppContext();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showGrading, setShowGrading] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowGrading(true);
  };

  const handleBack = () => {
    setSelectedTaskId(null);
    setShowGrading(false);
    setScores({});
  };

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

  if (selectedTaskId && showGrading) {
    const task = tasks.find(t => t.id === selectedTaskId);
    const taskSubmissions = submissions.filter(s => s.taskId === selectedTaskId);
    const sortedSubmissions = [...taskSubmissions].sort((a, b) => b.averageScore - a.averageScore);

    return (
      <div className="flex-1 flex overflow-hidden">
        <section className="w-[320px] border-r-2 border-border p-10 flex flex-col gap-8 shrink-0 overflow-y-auto">
          <Button variant="outline" className="border-2 border-border font-bold uppercase text-xs rounded-none" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回任务广场
          </Button>
          <div>
            <span className="theme-label">当前任务</span>
            <h2 className="text-[28px] font-extrabold leading-[1.1] mt-2">{task?.title}</h2>
            <p className="text-sm mt-3 opacity-70">{task?.description}</p>
          </div>
          <div>
            <span className="theme-label">🏆 实时排名</span>
            <div className="mt-4 flex flex-col">
              {sortedSubmissions.slice(0, 10).map((sub, idx) => (
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
                
                {task?.type === 'image' ? (
                  <div className="aspect-video bg-muted border border-border flex items-center justify-center font-bold text-muted-foreground relative overflow-hidden">
                    <div className="absolute z-10 p-2.5 bg-black/50 text-white text-[10px] top-0 left-0 right-0 line-clamp-2">
                      PROMPT: {sub.content}
                    </div>
                    <img src={sub.resultUrl} alt="Result" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 border border-border bg-[#F9F9F9] p-0 overflow-hidden relative min-h-[250px] flex flex-col group">
                      <div className="absolute top-0 left-0 bg-primary text-white text-[10px] px-2 py-0.5 z-10">效果预览</div>
                      <button 
                        className="absolute top-2 right-2 p-2 bg-black/50 text-white opacity-0 group-hover:opacity-100 z-20 hover:bg-black/70"
                        onClick={() => setPreviewHtml(sub.content)}
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <iframe 
                        srcDoc={sub.content} 
                        title="Result Preview" 
                        className="w-full h-full border-0 bg-white"
                        sandbox="allow-scripts"
                      />
                    </div>
<details className="mt-2">
                      <summary className="text-xs font-bold cursor-pointer hover:underline">查看代码</summary>
                      <div className="mt-2 p-3 bg-muted border border-border max-h-[150px] overflow-y-auto">
                        <pre className="font-mono text-xs whitespace-pre-wrap">{sub.content}</pre>
                      </div>
                    </details>
                  </>
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

  return (
    <div className="p-10 flex-1 overflow-y-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <span className="theme-label">任务大厅 (Total: {tasks.length})</span>
          <h1 className="theme-heading mt-2">TASKS</h1>
        </div>
        {currentUser.role === 'admin' && (
          <Button className="theme-button" onClick={() => onSelectTask('new', 'submit')}>发布新任务</Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tasks.map(task => {
          const taskSubmissions = submissions.filter(s => s.taskId === task.id);
          const sortedSubmissions = [...taskSubmissions].sort((a, b) => b.averageScore - a.averageScore);
          
          return (
            <div key={task.id} className="theme-card flex flex-col p-6 gap-4">
              <div className="flex justify-between items-start">
                <span className="theme-label">
                  {task.type === 'image' ? 'IMAGE GEN' : 'HTML/CSS'}
                </span>
                <span className="theme-label text-right">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <h3 className="text-2xl font-black leading-tight mb-2 line-clamp-2">{task.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-3">{task.description}</p>
              </div>
              <div className="mt-auto pt-4 flex gap-2 border-t-2 border-border">
                {currentUser.role === 'student' && (
                  <Button className="theme-button flex-1" onClick={() => onSelectTask(task.id, 'submit')}>
                    去答题
                  </Button>
                )}
                <Button variant="outline" className="border-2 border-border font-bold text-xs uppercase rounded-none flex-1" onClick={() => handleTaskClick(task.id)}>
                  <Users className="w-4 h-4 mr-2" />
                  互评
                </Button>
              </div>
              {sortedSubmissions.length > 0 && (
                <div className="pt-4 border-t-2 border-border">
                  <div className="text-xs font-bold mb-2 opacity-60">🏆 TOP 3</div>
                  {sortedSubmissions.slice(0, 3).map((sub, idx) => (
                    <div key={sub.id} className="flex justify-between text-sm py-1">
                      <span><span className="font-bold mr-2">{idx + 1}.</span>{sub.studentName}</span>
                      <span className="font-mono font-bold text-primary">{sub.averageScore.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog open={!!previewHtml} onOpenChange={(open) => !open && setPreviewHtml(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 border-0">
          <div className="flex justify-between items-center p-2 bg-muted border-b">
            <span className="font-bold text-sm">完整预览</span>
            <button onClick={() => setPreviewHtml(null)} className="p-1 hover:bg-muted-foreground/20 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
          <iframe 
            srcDoc={previewHtml || ''} 
            title="Preview" 
            className="w-[90vw] h-[80vh] border-0 bg-white"
            sandbox="allow-scripts"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}