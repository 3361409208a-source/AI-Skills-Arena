/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useAppContext } from './store';
import { TaskList } from './components/TaskList';
import { CreateTask } from './components/CreateTask';
import { SubmitAnswer } from './components/SubmitAnswer';
import { LeaderboardView } from './components/LeaderboardView';
import { StatsView } from './components/StatsView';
import { Button } from '@/components/ui/button';
import { Users, UserCog } from 'lucide-react';

function MainApp() {
  const { currentUser, setCurrentUser } = useAppContext();
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'submit' | 'leaderboard' | 'stats'>('list');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleSelectTask = (taskId: string, view: 'submit' | 'grade' | 'leaderboard') => {
    if (taskId === 'new') {
      setCurrentView('create');
    } else {
      setSelectedTaskId(taskId);
      setCurrentView(view);
    }
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedTaskId(null);
  };

  const toggleRole = () => {
    if (currentUser.role === 'admin') {
      setCurrentUser({ id: 'u4', name: 'Demo Student', role: 'student' });
    } else {
      setCurrentUser({ id: 'admin1', name: 'Teacher', role: 'admin' });
    }
    handleBack();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="h-[80px] border-b-2 border-border flex items-center justify-between px-10 shrink-0 bg-background">
        <div className="text-2xl font-black uppercase tracking-tighter cursor-pointer" onClick={handleBack}>
          AI.SKILLS.ADMIN
        </div>
        <nav className="hidden md:flex gap-6 font-bold text-sm">
          <span className="cursor-pointer hover:underline" onClick={handleBack}>任务广场</span>
          <span className="cursor-pointer hover:underline" onClick={() => { setCurrentView('stats'); setSelectedTaskId(null); }}>数据统计</span>
        </nav>
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold uppercase bg-foreground text-background px-3 py-1 rounded">
            {currentUser.role === 'admin' ? 'ADMIN MODE' : 'STUDENT MODE'}
          </div>
          <Button variant="outline" className="border-2 border-border font-bold uppercase text-xs rounded-none" onClick={toggleRole}>
            切换身份
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        {currentView === 'list' && <TaskList onSelectTask={handleSelectTask} />}
        {currentView === 'create' && <CreateTask onBack={handleBack} />}
        {currentView === 'submit' && selectedTaskId && <SubmitAnswer taskId={selectedTaskId} onBack={handleBack} />}
        {currentView === 'leaderboard' && selectedTaskId && <LeaderboardView taskId={selectedTaskId} onBack={handleBack} />}
        {currentView === 'stats' && <StatsView onBack={handleBack} />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

