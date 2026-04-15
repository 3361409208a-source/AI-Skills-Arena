import React, { useState } from 'react';
import { useAppContext } from '../store';
import { generateImage, chatCompletion } from '../lib/ai';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TypingDots } from './Loading';

const API_KEY = 'sk-jgsuebgufkbpsmcsofdckpnzubycmqjxeugysosocimukxiz';

export function SubmitAnswer({ taskId, onBack }: { taskId: string, onBack: () => void }) {
  const { tasks, currentUser, addSubmission } = useAppContext();
  const task = tasks.find(t => t.id === taskId);
  
  const [prompt, setPrompt] = useState('');
  const [htmlCode, setHtmlCode] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!task) return <div>Task not found</div>;

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const url = await generateImage(prompt, API_KEY, {
        model: 'Qwen/Qwen-Image',
        imageSize: '1024x1024',
      });
      setResultUrl(url);
    } catch (error) {
      console.error('生成失败:', error);
      alert(error instanceof Error ? error.message : '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateHtml = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setHtmlCode('');
    try {
      await chatCompletion(
        [
          { role: 'system', content: '你是一个专业的前端工程师。请根据用户描述的页面需求，生成完整的HTML页面代码。使用Tailwind CSS CDN来美化。只输出HTML代码，不要任何解释和markdown格式。' },
          { role: 'user', content: prompt }
        ],
        API_KEY,
        {},
        (chunk, done) => {
          setHtmlCode(chunk);
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
    if (!prompt) return;
    
    if (task.type === 'image') {
      if (!resultUrl) {
        alert('请先生成图片');
        return;
      }
      addSubmission({
        taskId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        content: prompt,
        resultUrl,
      });
    } else {
      if (!htmlCode) {
        alert('请先生成HTML');
        return;
      }
      addSubmission({
        taskId,
        studentId: currentUser.id,
        studentName: currentUser.name,
        content: htmlCode,
      });
    }
    onBack();
  };

  return (
    <div className="flex-1 flex flex-col p-10 overflow-y-auto max-w-4xl mx-auto w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="theme-label">SUBMIT WORK</span>
          <h1 className="theme-heading mt-2">SUBMISSION</h1>
        </div>
        <Button variant="outline" className="border-2 border-border font-bold uppercase text-xs rounded-none" onClick={onBack}>
          返回任务大厅
        </Button>
      </div>

      <div className="theme-card p-8 mb-8">
        <span className="theme-label">当前任务</span>
        <h2 className="text-3xl font-black mt-2">{task.title}</h2>
        <p className="mt-4 opacity-80">{task.description}</p>
      </div>

      <div className="theme-card p-8">
        <h3 className="text-2xl font-black mb-6">你的答案</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          {task.type === 'image' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="prompt" className="font-bold">输入描述提示词</Label>
                <Textarea 
                  id="prompt" 
                  placeholder="描述你想要生成的图片..." 
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  required
                  className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
                />
                <Button 
                  type="button"
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="mt-2"
                >
                  {isGenerating ? '生成中...' : '✨ AI 生成图片'}
                </Button>
              </div>
              {resultUrl && (
                <div className="mt-4 border-2 border-border p-2 bg-muted">
                  <img src={resultUrl} alt="Preview" className="w-full h-auto max-h-[400px] object-contain" />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="prompt" className="font-bold">输入页面描述</Label>
                <Textarea 
                  id="prompt" 
                  placeholder="描述你想要什么页面，比如：一个个人名片页面，包含头像、姓名、简介和社交链接..." 
                  rows={4}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  required
                  className="border-2 border-border rounded-none focus-visible:ring-0 focus-visible:border-primary"
                />
                <Button 
                  type="button"
                  onClick={handleGenerateHtml}
                  disabled={isGenerating || !prompt.trim()}
                  className="mt-2"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2">
                      <TypingDots /> 生成中
                    </span>
                  ) : '✨ AI 生成 HTML'}
                </Button>
              </div>
              {htmlCode && (
                <div className="mt-4 border-2 border-border p-2 bg-muted">
                  <div className="text-xs font-bold mb-2">预览</div>
                  <iframe 
                    srcDoc={htmlCode} 
                    title="Preview" 
                    className="w-full h-[400px] border-0 bg-white"
                    sandbox="allow-scripts"
                  />
                </div>
              )}
            </>
          )}

          <Button 
            type="submit" 
            className="theme-button w-full py-6 text-lg mt-4"
            disabled={task.type === 'image' ? !resultUrl : !htmlCode}
          >
            提交答案
          </Button>
        </form>
      </div>
    </div>
  );
}