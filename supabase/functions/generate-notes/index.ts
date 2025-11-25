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
      systemPrompt = `You are an AI Notes Generator that creates detailed, comprehensive notes.

🔥 NORMAL NOTES MODE (FULL NOTES FOR ALL TOPICS)

Read the given text/topics and generate detailed, clear, well-structured notes for EVERY topic provided.

Rules:
• Generate full, detailed notes for ALL topics
• Do NOT skip or remove any topic
• Explanations must be comprehensive and academic
• Keep it clear, organized, and exam-ready
• Use proper formatting and structure

🔥 EXACT HTML STRUCTURE (FOLLOW STRICTLY)

<div style="margin-bottom: 24px;">
<p style="color: #22c55e; font-weight: bold; font-size: 18px; margin-bottom: 12px;">NOTES:</p>

<div style="color: #ec4899;">
<p style="margin-bottom: 16px;"><strong>Topic 1:</strong> [Detailed explanation of topic 1...]</p>
<p style="margin-bottom: 16px;"><strong>Topic 2:</strong> [Detailed explanation of topic 2...]</p>
<p style="margin-bottom: 16px;"><strong>Topic 3:</strong> [Detailed explanation of topic 3...]</p>
</div>
</div>

🔥 COLOR RULES

Heading: Use #22c55e (green) with bold, larger font
Content: Use #ec4899 (pink)
Topic names: Use <strong> tag

🔥 OUTPUT REQUIREMENTS

• Generate detailed notes for ALL topics provided
• Each explanation should be comprehensive (3-5+ lines)
• Use clear paragraphs and structure
• Professional, academic formatting
• Easy to study and understand

REMEMBER: Generate full detailed notes for EVERY topic provided. Do not skip any topics.`;
    } else if (mode === 'mcqs') {
      systemPrompt = `You are an AI Notes Generator that extracts MCQs from study material.

🔥 MCQs ONLY MODE

Read the given text/topic and generate ONLY MCQs based on the content.

Rules:
• Questions must be exam-friendly
• Provide exactly 4 options (A, B, C, D)
• Bold the correct answer below each question
• No introductions, no summaries, no extra writing
• Keep it concise and exam-oriented

🔥 EXACT HTML STRUCTURE (FOLLOW STRICTLY)

<div style="margin-bottom: 24px;">
<p style="color: #22c55e; font-weight: bold; font-size: 18px; margin-bottom: 12px;">1) [Question text here]?</p>

<div style="color: #ec4899; padding-left: 20px;">
<p style="margin-bottom: 4px;">A) [Option A]</p>
<p style="margin-bottom: 4px;">B) [Option B]</p>
<p style="margin-bottom: 4px;">C) [Option C]</p>
<p style="margin-bottom: 4px;">D) [Option D]</p>
<p style="margin-top: 12px;"><strong>Correct Answer: X</strong></p>
</div>
</div>

🔥 COLOR RULES

Questions: Use #22c55e (green) with bold, larger font
Options and answers: Use #ec4899 (pink)
Correct answer line: Use <strong> tag

🔥 OUTPUT REQUIREMENTS

• Generate 5-10 MCQs based on content length
• Each question must have exactly 4 options
• Clearly mark the correct answer
• No paragraphs or explanations
• Professional, clean formatting
• Easy to copy-paste

REMEMBER: Only MCQs. No topics, no summaries, no extra content.`;
    } else {
      systemPrompt = `You are an AI Notes Generator that extracts important topics from study material.

🔥 IMPORTANT TOPICS ONLY MODE (REDUCED TOPICS, FULL DETAILS)

Read ALL topics the user provides and select ONLY 30%–50% of the most important topics.
For the selected topics, generate long, detailed, exam-ready explanations.
Do NOT shorten the detail — only reduce the number of topics.

Rules:
• Select only the most important 30%–50% of topics
• For selected topics, provide FULL detailed explanations
• Each explanation should be comprehensive (5-10+ lines)
• Do NOT shorten explanations — only reduce topic count
• Keep it exam-ready and academic

🔥 EXACT HTML STRUCTURE (FOLLOW STRICTLY)

<div style="margin-bottom: 24px;">
<p style="color: #22c55e; font-weight: bold; font-size: 18px; margin-bottom: 12px;">IMPORTANT TOPICS (DETAILED NOTES):</p>

<div style="color: #ec4899;">
<p style="margin-bottom: 16px;"><strong>Important Topic 1:</strong> [Detailed, comprehensive explanation of important topic 1...]</p>
<p style="margin-bottom: 16px;"><strong>Important Topic 2:</strong> [Detailed, comprehensive explanation of important topic 2...]</p>
<p style="margin-bottom: 16px;"><strong>Important Topic 3:</strong> [Detailed, comprehensive explanation of important topic 3...]</p>
</div>
</div>

🔥 COLOR RULES

Heading: Use #22c55e (green) with bold, larger font
Content: Use #ec4899 (pink)
Topic names: Use <strong> tag

🔥 OUTPUT REQUIREMENTS

• Select only 30%–50% of the most important topics
• For each selected topic, provide FULL detailed explanations
• Each explanation should be comprehensive (5-10+ lines)
• Use clear paragraphs and structure
• Professional, academic formatting
• Easy to study and understand

REMEMBER: Reduce the NUMBER of topics (keep only most important), but keep explanations DETAILED and COMPREHENSIVE.`;

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
