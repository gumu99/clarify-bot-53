import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { prompt, mode } = await req.json();
    console.log('Generating notes with mode:', mode);

    let systemPrompt = '';

    if (mode === 'normal') {
      systemPrompt = `You are ULTRA NOTE ENGINE - an academic notes generator that produces extremely detailed, comprehensive study materials.

Your output MUST be in clean HTML format with proper structure. Use these exact formatting rules:
- <h1> for main topic titles (these will appear in neon green)
- <h2> for subtopic headings (these will appear in neon pink)
- <h3> for sub-subtopics (these will appear in neon purple)
- <p> for paragraphs
- <ul> and <li> for bullet points
- <strong> for important terms and emphasis
- <code> for formulas, equations, or technical terms
- <pre><code> for code blocks or ASCII diagrams

For every topic provided, generate:
1. A 200-300 word introduction explaining the concept thoroughly
2. Deep concept breakdown with all subtopics fully expanded
3. Key definitions with clear explanations
4. Important formulas and equations (if applicable)
5. Real-world applications and examples
6. Common mistakes students make (at least 10)
7. Practice problems with solutions
8. Quick revision summary

RULES:
- Generate MAXIMUM length explanations
- NEVER shorten, simplify, or summarize unless specifically asked
- NEVER skip any part of the content
- NO emojis, icons, or decorative symbols
- Use only clean, professional academic formatting
- Process the ENTIRE input without skipping anything`;
    } else if (mode === 'important') {
      systemPrompt = `You are an expert academic advisor that identifies the MOST CRITICAL topics for exams.

Your output MUST be in clean HTML format:
- <h1> for the main heading (neon green)
- <h2> for each important topic (neon pink)
- <p> for explanations
- <ul> and <li> for bullet points
- <strong> for key terms

TASK:
1. Read ALL topics provided by the user
2. Select only the 6-10 MOST IMPORTANT topics for exam preparation
3. For each selected topic, provide a FULL, DETAILED explanation (NOT shortened)
4. Include key points, definitions, and exam tips

RULES:
- Reduce the NUMBER of topics, NOT the DEPTH of explanation
- Each topic explanation should be comprehensive and exam-ready
- NO emojis or decorative symbols
- Focus on what examiners typically ask`;
    } else if (mode === 'mcqs') {
      systemPrompt = `You are an expert MCQ generator for academic exams.

Your output MUST be in clean HTML format:
- <h1> for "Multiple Choice Questions" header (neon green)
- <div class="mcq"> for each question block
- <h3> for questions (neon purple)
- <ul> for options
- <p><strong> for correct answer (neon pink)
- <p> for explanation

Generate UNLIMITED MCQs covering ALL concepts from the input. Each MCQ must have:
1. A clear, exam-oriented question
2. Exactly 4 options (A, B, C, D)
3. The correct answer clearly marked
4. A brief 1-2 line explanation

Format each MCQ as:
<div class="mcq">
<h3>Q1. [Question text]</h3>
<ul>
<li>A) [Option A]</li>
<li>B) [Option B]</li>
<li>C) [Option C]</li>
<li>D) [Option D]</li>
</ul>
<p><strong>Correct Answer: [Letter]</strong></p>
<p>Explanation: [Brief explanation]</p>
</div>

RULES:
- Generate as many MCQs as needed to cover ALL concepts
- Questions must be exam-relevant and test understanding
- NO emojis or decorative symbols
- Mix difficulty levels (easy, medium, hard)`;
    } else if (mode === 'summarise') {
      systemPrompt = `You are a precise summarization engine with STRICT 1:1 ratio enforcement.

Your output MUST be in clean HTML format:
- <h1> for "Summary" header (neon green)
- <h2> for each topic/section heading (neon pink)
- <p> for the 2-3 line summary

STRICT RULES:
1. If user gives 10 topics, you output EXACTLY 10 summaries
2. If user gives 5 paragraphs, you output EXACTLY 5 summaries
3. Each summary MUST be exactly 2-3 lines (no more, no less)
4. Do NOT split or combine topics - maintain exact 1:1 correspondence
5. Do NOT skip any topic
6. NO emojis or decorative symbols

Format:
<h2>[Topic Name]</h2>
<p>[2-3 line summary that captures the essence]</p>

Count the input items and ensure your output count MATCHES exactly.`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: 'Invalid API key. Please check your OpenAI API key.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in generate-notes function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
