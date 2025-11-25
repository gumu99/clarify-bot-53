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

    if (mode === 'mcqs') {
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

🔥 IMPORTANT TOPICS ONLY MODE

Read the given text/topic and extract ONLY the most important points.

Rules:
• No introductions, no summaries, no extra writing
• Write in clean bullet points
• Keep it concise, easy to study, and exam-oriented
• Do NOT add anything outside the given content

🔥 EXACT HTML STRUCTURE (FOLLOW STRICTLY)

<div style="margin-bottom: 24px;">
<p style="color: #22c55e; font-weight: bold; font-size: 18px; margin-bottom: 12px;">IMPORTANT TOPICS:</p>

<div style="color: #ec4899;">
<ul style="padding-left: 20px;">
<li style="margin-bottom: 8px;">[Point 1]</li>
<li style="margin-bottom: 8px;">[Point 2]</li>
<li style="margin-bottom: 8px;">[Point 3]</li>
<li style="margin-bottom: 8px;">[Point 4]</li>
</ul>
</div>
</div>

🔥 COLOR RULES

Heading: Use #22c55e (green) with bold, larger font
Points: Use #ec4899 (pink)

🔥 OUTPUT REQUIREMENTS

• Extract 5-15 important points based on content
• Each point should be concise (1-2 lines max)
• Use bullet points only
• No paragraphs or long explanations
• Professional, clean formatting
• Easy to copy-paste

REMEMBER: Only important topics in bullet points. No extra content.`;

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
