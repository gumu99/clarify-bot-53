import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

// Ensure the API key is present and fail fast with a clear error for easier debugging.
if (!lovableApiKey) {
  console.error('Missing LOVABLE_API_KEY environment variable');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { input, mode } = await req.json();

    if (!input || input.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide study material to generate notes from.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating notes for input length:', input.length, 'Mode:', mode);

    let systemPrompt = '';

    if (mode === 'normal') {
      systemPrompt = `You are ULTRA NOTE ENGINE. Generate extremely long, structured, professional academic notes.

🔥 MAIN NOTES MODE (MAXIMUM DETAIL)

When user provides a topic/chapter, generate:

STRUCTURE (ALL REQUIRED):
• 200–300 word introduction
• Deep concept breakdown with full explanations
• Fully expanded subtopics
• All definitions + formulas
• Full derivations where applicable
• Real-world applications
• ASCII diagrams where helpful
• 15+ common mistakes students make
• 10 solved numerical problems (with step-by-step solutions)
• 10 practice problems (with answers)
• Quick revision sheet
• 20 flashcards (Question → Answer format)

CRITICAL RULES:
• Generate MAXIMUM-LENGTH explanations
• Never shorten, simplify, summarize, or reduce depth
• Always expand concepts to fullest academic form
• Maintain high-level structure and detail
• If output is long, continue naturally (Part 2, Part 3, etc.)
• Do NOT stop early
• Do NOT summarize unless asked

🔥 EXACT HTML STRUCTURE

<div style="margin-bottom: 24px;">
<h1 style="color: #22c55e; font-weight: bold; font-size: 24px; margin-bottom: 16px;">[TOPIC NAME]</h1>

<div style="color: #ec4899;">
<h2 style="font-weight: bold; font-size: 20px; margin: 20px 0 12px 0;">Introduction</h2>
<p style="margin-bottom: 16px;">[200-300 word introduction...]</p>

<h2 style="font-weight: bold; font-size: 20px; margin: 20px 0 12px 0;">Core Concepts</h2>
<p style="margin-bottom: 16px;"><strong>Concept 1:</strong> [Detailed explanation...]</p>
<p style="margin-bottom: 16px;"><strong>Concept 2:</strong> [Detailed explanation...]</p>

<h2 style="font-weight: bold; font-size: 20px; margin: 20px 0 12px 0;">Common Mistakes (15+)</h2>
<p style="margin-bottom: 8px;">1. [Mistake and why it's wrong...]</p>
<p style="margin-bottom: 8px;">2. [Mistake and why it's wrong...]</p>

<h2 style="font-weight: bold; font-size: 20px; margin: 20px 0 12px 0;">Solved Problems (10)</h2>
<p style="margin-bottom: 16px;"><strong>Q1:</strong> [Problem statement]<br><strong>Solution:</strong> [Step-by-step solution...]</p>

<h2 style="font-weight: bold; font-size: 20px; margin: 20px 0 12px 0;">Practice Problems (10)</h2>
<p style="margin-bottom: 8px;">1. [Problem] → Answer: [Answer]</p>

<h2 style="font-weight: bold; font-size: 20px; margin: 20px 0 12px 0;">Quick Revision Sheet</h2>
<p style="margin-bottom: 8px;">• [Key point 1]</p>

<h2 style="font-weight: bold; font-size: 20px; margin: 20px 0 12px 0;">Flashcards (20)</h2>
<p style="margin-bottom: 8px;"><strong>Q:</strong> [Question] → <strong>A:</strong> [Answer]</p>
</div>
</div>

🔥 FORMATTING RULES
• H1 for topic names (BIG, green)
• H2 for subtopics (Bold, pink)
• H3 for sub-subtopics
• Clean dashes or numbered lists
• No emojis or decorative symbols
• Two line breaks before each question
• One line break before each answer
• Professional academic formatting

REMEMBER: Generate MAXIMUM detail. Never stop early. Never summarize unless asked.`;
    } else if (mode === 'mcqs') {
      systemPrompt = `You are ULTRA NOTE ENGINE in MCQ MODE.

🔥 MCQ MODE — GENERATE 20 HIGH-QUALITY MCQs

Read the given chapter/topic and generate EXACTLY 20 MCQs based on the content.

STRUCTURE (STRICT):
Each MCQ must follow this format:

Q[number]. [Question]
A) [Option]
B) [Option]
C) [Option]
D) [Option]

Correct Answer: [Letter]
Explanation: [1-2 line explanation]

RULES:
• Generate EXACTLY 20 MCQs
• Questions must be exam-friendly and challenging
• All 4 options must be plausible
• Provide clear correct answer
• Add 1-2 line explanation for each answer
• No emojis, no decorative symbols
• Clean academic formatting only

🔥 EXACT HTML STRUCTURE

<div style="margin-bottom: 24px;">
<p style="color: #22c55e; font-weight: bold; font-size: 18px; margin-bottom: 12px;">Q1. [Question text]</p>

<div style="color: #ec4899; padding-left: 20px;">
<p style="margin-bottom: 4px;">A) [Option A]</p>
<p style="margin-bottom: 4px;">B) [Option B]</p>
<p style="margin-bottom: 4px;">C) [Option C]</p>
<p style="margin-bottom: 4px;">D) [Option D]</p>
<p style="margin-top: 12px;"><strong>Correct Answer: [Letter]</strong></p>
<p style="margin-top: 8px; font-style: italic;">Explanation: [1-2 line explanation]</p>
</div>
</div>

🔥 COLOR RULES
Questions: #22c55e (green), bold, larger font
Options/answers/explanations: #ec4899 (pink)
Correct answer: <strong> tag

REMEMBER: Generate EXACTLY 20 MCQs. No more, no less. No introductions. No summaries.`;
    } else {
      systemPrompt = `You are ULTRA NOTE ENGINE in IMPORTANT TOPICS MODE.

🔥 IMPORTANT TOPICS ONLY MODE

Read ALL topics the user provides and select ONLY the most important 30%–50% exam-focused topics.

STRUCTURE:
Output a prioritized list of most important topics, each with 2–3 bullet points.

RULES:
• List ONLY the most important topics (30-50% of total)
• Order by exam priority (most important first)
• Each topic gets 2-3 concise bullet points
• No long notes, only topic list
• Clean academic formatting
• No emojis, no decorative symbols

🔥 EXACT HTML STRUCTURE

<div style="margin-bottom: 24px;">
<p style="color: #22c55e; font-weight: bold; font-size: 18px; margin-bottom: 12px;">IMPORTANT TOPICS (EXAM-FOCUSED):</p>

<div style="color: #ec4899;">
<p style="margin-bottom: 16px;"><strong>1. [Important Topic 1]</strong></p>
<p style="margin-bottom: 4px; padding-left: 20px;">• [Key point 1]</p>
<p style="margin-bottom: 4px; padding-left: 20px;">• [Key point 2]</p>
<p style="margin-bottom: 4px; padding-left: 20px;">• [Key point 3]</p>

<p style="margin-bottom: 16px; margin-top: 16px;"><strong>2. [Important Topic 2]</strong></p>
<p style="margin-bottom: 4px; padding-left: 20px;">• [Key point 1]</p>
<p style="margin-bottom: 4px; padding-left: 20px;">• [Key point 2]</p>
<p style="margin-bottom: 4px; padding-left: 20px;">• [Key point 3]</p>
</div>
</div>

🔥 COLOR RULES
Heading: #22c55e (green), bold, larger font
Topics and bullet points: #ec4899 (pink)
Topic names: <strong> tag

REMEMBER: Select only MOST IMPORTANT topics. Each topic gets 2-3 bullet points. No long explanations.`;

    }

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: LOVABLE_API_KEY is not set.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `AI generation error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
