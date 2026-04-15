import React from 'react';
import { useAppContext } from '../store';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, Image, Code, Award, Clock } from 'lucide-react';

export function StatsView({ onBack }: { onBack: () => void }) {
  const { tasks, submissions, currentUser } = useAppContext();

  const totalTasks = tasks.length;
  const totalSubmissions = submissions.length;
  const imageTasks = tasks.filter(t => t.type === 'image').length;
  const htmlTasks = tasks.filter(t => t.type === 'html').length;
  const avgScore = submissions.length > 0 
    ? submissions.reduce((a, b) => a + b.averageScore, 0) / submissions.length 
    : 0;
  const topSubmitter = [...submissions]
    .sort((a, b) => b.averageScore - a.averageScore)[0];
  const recentSubmissions = [...submissions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const allScores = submissions.flatMap(s => s.scores);
  const scoreDistribution = {
    '90-100': allScores.filter(s => s >= 90).length,
    '80-89': allScores.filter(s => s >= 80 && s < 90).length,
    '70-79': allScores.filter(s => s >= 70 && s < 80).length,
    '60-69': allScores.filter(s => s >= 60 && s < 70).length,
    '<60': allScores.filter(s => s < 60).length,
  };

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="theme-label">STATISTICS</span>
          <h1 className="theme-heading mt-2">数据统计</h1>
        </div>
        <Button variant="outline" className="border-2 border-border font-bold uppercase text-xs rounded-none" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回任务广场
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div className="theme-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="theme-label">总任务数</span>
          </div>
          <div className="text-4xl font-black">{totalTasks}</div>
        </div>
        <div className="theme-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Image className="w-5 h-5 text-primary" />
            <span className="theme-label">图片任务</span>
          </div>
          <div className="text-4xl font-black">{imageTasks}</div>
        </div>
        <div className="theme-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Code className="w-5 h-5 text-primary" />
            <span className="theme-label">HTML任务</span>
          </div>
          <div className="text-4xl font-black">{htmlTasks}</div>
        </div>
        <div className="theme-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="theme-label">总提交</span>
          </div>
          <div className="text-4xl font-black">{totalSubmissions}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="theme-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <span className="theme-label">平均分</span>
          </div>
          <div className="text-5xl font-black text-primary">{avgScore.toFixed(1)}</div>
          <div className="text-sm opacity-60 mt-2">/ 100</div>
        </div>
        <div className="theme-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <span className="theme-label">最高分</span>
          </div>
          <div className="text-5xl font-black text-primary">
            {topSubmitter ? topSubmitter.averageScore.toFixed(1) : '-'}
          </div>
          <div className="text-sm opacity-60 mt-2">{topSubmitter?.studentName || ''}</div>
        </div>
        <div className="theme-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <span className="theme-label">评分次数</span>
          </div>
          <div className="text-5xl font-black">{allScores.length}</div>
          <div className="text-sm opacity-60 mt-2">次互评</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="theme-card p-6">
          <span className="theme-label">分数分布</span>
          <div className="mt-4 space-y-3">
            {Object.entries(scoreDistribution).map(([range, count]) => {
              const percent = allScores.length > 0 ? (count / allScores.length * 100) : 0;
              return (
                <div key={range} className="flex items-center gap-4">
                  <span className="w-16 text-sm font-bold">{range}</span>
                  <div className="flex-1 h-6 bg-muted border border-border overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-mono">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="theme-card p-6">
          <span className="theme-label">最近提交</span>
          <div className="mt-4 space-y-3">
            {recentSubmissions.map(sub => {
              const task = tasks.find(t => t.id === sub.taskId);
              return (
                <div key={sub.id} className="flex justify-between items-center py-2 border-b border-border">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate">{sub.studentName}</div>
                    <div className="text-xs opacity-60 truncate">{task?.title}</div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-mono font-bold text-primary">{sub.averageScore.toFixed(1)}</div>
                    <div className="text-xs opacity-60">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(sub.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
            {recentSubmissions.length === 0 && (
              <div className="text-center py-8 opacity-50">暂无提交记录</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}