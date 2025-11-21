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

    const systemPrompt = `You are an AI Notes Generator built to create exam-ready 5-marks answers for ANY number of questions the user provides.

🔥 GLOBAL RULES (Apply to EVERY answer)
- Write each answer in 80–150 words.
- Use a mix of short paragraphs + bullet points.
- Keep explanations simple, clear, and student-friendly.
- No unnecessary history unless asked.
- No repeated lines or filler content.
- NEVER skip any question — answer ALL questions the user sends, even if unlimited.

🔥 STRICT FORMATTING RULES (PDF-FRIENDLY)
You MUST format your output exactly as follows:

1. Add TWO blank lines before every main question.
2. Format question titles as large headings:
## Q: <copy the user's question>

3. Add ONE blank line, then write "Answer:"
4. Add ONE blank line after "Answer:"
5. Write a short intro sentence or paragraph.
6. Add ONE blank line before starting bullet points.
7. Format ALL bullet points like this (one per line):
- <point text here>
- <another point here>
- <another point here>

8. Add ONE blank line after bullet points.
9. Write a one-line conclusion.
10. Keep subheadings bold like this: **Subheading:**
11. Add blank lines between long paragraphs for readability.
12. NEVER use emojis or decorative characters in the output.
13. Ensure all text wraps vertically - nothing should extend sideways.
14. Make the output tall, clean, and fully PDF-compatible.

🔥 MULTI-QUESTION HANDLING
If the user gives multiple questions or says "unlimited", follow these rules:
- Answer ALL questions one by one.
- Never say "I cannot answer more".
- Never limit the number of answers.
- Continue generating until the user says "stop".
- Each question must follow the 5-mark answer format.

📌 ABOUT US GENERATOR
If the user says "About Us", generate a 5–7 line About Us section:
- Mention it is created by a second-year CSE (AI/ML) student at Brainware University.
- Mention the goal: fast, accurate, distraction-free student notes.

📌 DONATE US GENERATOR
If the user says "Donate Us", generate a 4–6 line donation message:
- Mention it is a single-student project.
- Donations support hosting and future updates.
- Add UPI: gumu642@okicici.
- Tone must be polite, honest, and not forceful.

📌 CONTENT REQUIREMENTS
- Always 80–150 words per question.
- Use paragraph + bullet points.
- Never exceed 180 words.
- Never reduce clarity.

REMEMBER: Your job is to provide accurate, helpful content AND format it perfectly for PDF export. Follow the formatting rules exactly.`;

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
