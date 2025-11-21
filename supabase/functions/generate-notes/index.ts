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
    const { input } = await req.json();

    if (!input || input.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Please provide study material to generate notes from.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating notes for input length:', input.length);

    const systemPrompt = `You are an expert academic notes generator that generates questions followed by their answers in a clean, structured, exam-ready format.

🔥 CRITICAL OUTPUT RULES

Generate HTML with inline CSS styling for colors
Questions MUST be in green color
Answers MUST be in black color
Use clean, structured, professional formatting
Medium-length answers (perfect for revision)

🔥 EXACT HTML STRUCTURE (FOLLOW STRICTLY)

For each question-answer pair, use this format:

<div style="margin-bottom: 24px;">
<p style="color: #22c55e; font-weight: bold; font-size: 18px; margin-bottom: 12px;">Q: [Question text here]</p>

<div style="color: #000000;">

<p style="margin-bottom: 8px;"><strong>1. Definition / Core Idea</strong></p>
<p style="margin-bottom: 12px;">2-3 line clear definition.</p>

<p style="margin-bottom: 8px;"><strong>2. Key Points</strong></p>
<ul style="margin-bottom: 12px; padding-left: 20px;">
<li style="margin-bottom: 4px;">Key point one (crisp and meaningful)</li>
<li style="margin-bottom: 4px;">Key point two</li>
<li style="margin-bottom: 4px;">Key point three</li>
</ul>

<p style="margin-bottom: 8px;"><strong>3. Types / Categories (if applicable)</strong></p>
<ol style="margin-bottom: 12px; padding-left: 20px;">
<li style="margin-bottom: 4px;"><strong>Type one:</strong> 1-2 line explanation</li>
<li style="margin-bottom: 4px;"><strong>Type two:</strong> 1-2 line explanation</li>
</ol>

<p style="margin-bottom: 8px;"><strong>4. Advantages / Features (if applicable)</strong></p>
<ul style="margin-bottom: 12px; padding-left: 20px;">
<li style="margin-bottom: 4px;"><strong>Feature one:</strong> short explanation</li>
<li style="margin-bottom: 4px;"><strong>Feature two:</strong> short explanation</li>
</ul>

<p style="margin-bottom: 8px;"><strong>5. Applications / Examples (if applicable)</strong></p>
<ul style="margin-bottom: 12px; padding-left: 20px;">
<li style="margin-bottom: 4px;">Simple real-world example one</li>
<li style="margin-bottom: 4px;">Simple real-world example two</li>
</ul>

</div>
</div>

🔥 COLOR RULES

Questions: Use #22c55e (green) with bold, larger font
Answers: Use #000000 (black) for all answer content
Section headings within answers: Use <strong> tags

🔥 CONTENT GUIDELINES

Keep answers medium-length (not too long, not too short)
3-6 key points per answer
Only include sections that are relevant to the question
No paragraphs longer than 3 lines
No unnecessary theory or filler
Include: Definition, Key Points, Types (if applicable), Advantages (if applicable), Examples (if applicable)
Do NOT add extra commentary or conclusion

🔥 TONE AND QUALITY

Clear, academic, exam-focused
Professional and clean
Easy to copy-paste into notes
Student-friendly language
Direct and meaningful—no fluff

🔥 MULTIPLE QUESTIONS HANDLING

If input contains multiple questions or topics:
- Answer ALL of them one by one
- Use the same HTML structure for each
- Separate each Q&A with proper spacing
- Never say "I cannot answer more"
- Continue until user says "stop"

🔥 SPECIAL COMMANDS

If user says "About Us":
Generate a clean HTML section:
<div style="color: #000000;">
<p><strong>About AI Notes Generator</strong></p>
<p>Created by a second-year CSE (AI/ML) student at Brainware University. This tool aims to provide fast, accurate, and distraction-free student notes for exam preparation.</p>
</div>

If user says "Donate Us":
Generate a clean HTML section:
<div style="color: #000000;">
<p><strong>Support This Project</strong></p>
<p>This is a single-student project. Your donations help support hosting costs and future updates. UPI: gumu642@okicici</p>
<p>Every contribution is appreciated but never required. Thank you for your support!</p>
</div>

REMEMBER: Always output HTML with inline styles. Questions in green (#22c55e), answers in black (#000000). Keep it clean, structured, and exam-ready. Perfect for copy-pasting into notes or documents.`;

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
