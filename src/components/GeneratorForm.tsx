import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import ChatInput from './ChatInput';
import OutputDisplay from './OutputDisplay';
import { GenerationMode } from './ModePopup';

const GeneratorForm: React.FC = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [mode, setMode] = useState<GenerationMode>('normal');

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    setOutput('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt: input, mode }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate notes');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedContent += content;
              setOutput(accumulatedContent);
            }
          } catch {
            // Ignore parse errors for incomplete chunks
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const lines = buffer.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              accumulatedContent += content;
              setOutput(accumulatedContent);
            }
          } catch {
            // Ignore
          }
        }
      }

      toast.success('Notes generated successfully!');
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to generate notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (isExtracting) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setIsExtracting(true);
    toast.info(`Extracting text from ${file.name}...`);

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const { data, error } = await supabase.functions.invoke('extract-text-from-image', {
        body: {
          image: base64,
          mimeType: file.type,
          fileName: file.name,
        },
      });

      if (error) throw error;

      if (data?.text) {
        setInput((prev) => (prev ? `${prev}\n\n${data.text}` : data.text));
        toast.success('Text extracted successfully!');
      } else {
        toast.error('No text could be extracted from the file');
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      toast.error('Failed to extract text from file');
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <OutputDisplay output={output} isLoading={isLoading} />
      <ChatInput
        input={input}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onFileUpload={handleFileUpload}
        mode={mode}
        onModeChange={setMode}
        isLoading={isLoading}
        isExtracting={isExtracting}
      />
    </div>
  );
};

export default GeneratorForm;
