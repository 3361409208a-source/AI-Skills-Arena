import React, { useState } from 'react';
import { useAppContext } from '../store';
import { chatCompletion } from '../lib/ai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TaskType } from '../types';
import { TypingDots } from './Loading';

const API_KEY = 'sk-jgsuebgufkbpsmcsofdckpnzubycmqjxeugysosocimukxiz';

export function CreateTask({ onBack }: { onBack: () => void }) {
  const { addTask } = useAppContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TaskType>('image');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTask = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setTitle('');
    setDescription('');
    try {
      const typeText = type === 'image' ? 'AI生图任务' : 'HTML页面生成任务';
      const systemPrompt = `你是一个任务设计专家。请根据下面的话题，设计一个${typeText}。
要求：
1. 标题简洁明了，不超过30字
2. 描述详细说明任务要求，100字左右
3. 输出格式为JSON：{"title":"标题","description":"描述"}
只输出JSON，不要其他内容。`;

      await chatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: aiPrompt }
        ],
        API_KEY,
        { model: 'Qwen/Qwen3-32B' },
        (chunk, done) => {
          if (done) {
            const jsonMatch = chunk.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const taskData = JSON.parse(jsonMatch[0]);
                setTitle(taskData.title || '');
                setDescription(taskData.description || '');
              } catch (e) {}
            }
          }
        }
      );
    } catch (error) {
      console.error('生成失败:', error);
      alert(error instanceof Error ? error.message : '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    addTask({ title, description, type });
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="theme-label">NEW TASK</span>
          <h1 className="theme-heading mt-2">CREATE</h1>
        </div>
        <Button variant="outline" className="border-2 border-border font-bold uppercase text-xs rounded-none" onClick={onBack}>
          返回任务大厅
        </Button>
      </div>

      <div className="theme-card p-8 mb-8">
        <h3 className="text-2xl font-black mb-6">AI 生成任务</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="font-bold">任务类型</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as TaskType)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 border-2 border-border rounded-none h-12 p-0 bg-muted">
                <TabsTrigger value="image" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase h-full">AI 生图</TabsTrigger>
                <TabsTrigger value="html" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold uppercase h-full">HTML 代码生成</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="space-y-2">
            <Label htmlFor="aiPrompt" className="font-bold">输入任务主题</Label>
            <Textarea 
              id="aiPrompt" 
              placeholder="输入你想让学生完成的任务主题，比如：赛博朋克城市夜景、个人名片页面..." 
              rows={3}
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
            />
            <Button 
              type="button"
              onClick={handleGenerateTask}
              disabled={isGenerating || !aiPrompt.trim()}
              className="mt-2"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <TypingDots /> 生成中
                </span>
              ) : '✨ AI 生成任务'}
            </Button>
          </div>
        </div>
      </div>

      <div className="theme-card p-8">
        <h3 className="text-2xl font-black mb-6">任务详情</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-bold">任务标题</Label>
            <Input 
              id="title" 
              placeholder="例如：生成一张赛博朋克风格的城市夜景" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="font-bold">任务描述</Label>
            <Textarea 
              id="description" 
              placeholder="详细描述任务要求..." 
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
            />
          </div>

          <Button type="submit" className="theme-button w-full py-6 text-lg mt-4">发布任务</Button>
        </form>
      </div>
    </div>
  );
}