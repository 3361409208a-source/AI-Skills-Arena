const SILICON_FLOW_API = 'https://api.siliconflow.cn/v1';

interface GenerateImageResponse {
  images: { url: string }[];
}

export async function generateImage(
  prompt: string,
  apiKey: string,
  options: {
    model?: string;
    imageSize?: '1024x1024' | '512x512' | '1024x1024';
  } = {}
): Promise<string> {
  const { 
    model = 'Qwen/Qwen-Image',
    imageSize = '1024x1024'
  } = options;

  const response = await fetch(`${SILICON_FLOW_API}/images/generations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      prompt,
      image_size: imageSize,
      num_inference_steps: 20,
      guidance_scale: 7.5,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI生成失败: ${error}`);
  }

  const data: GenerateImageResponse = await response.json();
  return data.images[0]?.url || '';
}

export interface ChatResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type StreamHandler = (content: string, done: boolean) => void;

export async function chatCompletion(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  apiKey: string,
  options: {
    model?: string;
    temperature?: number;
  } = {},
  onChunk?: StreamHandler
): Promise<ChatResponse> {
  const {
    model = 'Qwen/Qwen3-32B',
    temperature = 0.7,
  } = options;

  if (onChunk) {
    const response = await fetch(`${SILICON_FLOW_API}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI对话失败: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let content = '';
    let usage: ChatResponse['usage'];

    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;

      const chunks = decoder.decode(value).split('\n');
      for (const chunk of chunks) {
        if (!chunk.startsWith('data: ')) continue;
        const data = chunk.slice(5);
        if (data === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            content += delta;
            onChunk(content, false);
          }
          if (parsed.usage) {
            usage = {
              promptTokens: parsed.usage.prompt_tokens || 0,
              completionTokens: parsed.usage.completion_tokens || 0,
              totalTokens: parsed.usage.total_tokens || 0,
            };
          }
        } catch (e) {}
      }
    }

    onChunk(content, true);
    return { content, usage };
  }

  const response = await fetch(`${SILICON_FLOW_API}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI对话失败: ${error}`);
  }

  const data = await response.json();
  const usage = data.usage || {};

  return {
    content: data.choices[0]?.message?.content || '',
    usage: {
      promptTokens: usage.prompt_tokens || 0,
      completionTokens: usage.completion_tokens || 0,
      totalTokens: usage.total_tokens || 0,
    },
  };
}