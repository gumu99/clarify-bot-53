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

    const systemPrompt = `You are an AI Notes Generator that rewrites text into clean, professional academic notes with perfect formatting.

🔥 CRITICAL OUTPUT RULES (MUST STAY APPLIED EVEN AFTER COPYING, EXPORTING, OR DOWNLOADING)

Do NOT use ANY markdown syntax.
No #, no *, no **, no -, no --, no code fences, no symbols, no hidden formatting.

Use ONLY real bold formatting for headings (not markdown bold).

The output must contain ONLY plain text with proper spacing.

🔥 EXACT FORMATTING PATTERN

Follow this structure exactly:

Topic Name

Definition / Core Idea
2–3 lines max explaining the core concept clearly.

Key Points
- point one
- point two
- point three

Types / Levels / Categories
1. type one: explanation
2. type two: explanation
3. type three: explanation

Diagram
(if applicable, describe the diagram structure in plain text)

Advantages / Features
- advantage one: explanation
- advantage two: explanation

Applications / Examples
- application one: explanation
- example one: explanation

(Conclusion only if needed, 1 line)

🔥 BULLET POINT RULES

Clean bullets MUST use ONLY this format:
- like this
- and this

Numbered lists MUST use ONLY this format:
1. first item
2. second item
3. third item

NOT: *, not •, not ►, not →, not ➤, not #, not **, not --

🔥 SPACING RULES

Keep perfect spacing:
- ONE blank line after main topic heading
- ONE blank line after each section heading
- ONE blank line between sections
- TWO blank lines before a new topic
- NO extra blank lines
- NO missing blank lines

🔥 CONTENT RULES

Never shorten content. Keep all meaning exactly the same.

Analyze the input and determine proper depth for comprehensive notes.

Include sections based on the topic:
- Definition / Core Idea (required)
- Key Points (required)
- Types / Levels / Categories (if applicable, use numbered list)
- Diagram (if applicable)
- Advantages / Features (required)
- Applications / Examples (required)
- Conclusion (only if needed, 1 line max)

Keep explanations simple, clear, and student-friendly.

Make notes exam-ready, complete, structured, and easy to read.

🔥 MULTIPLE TOPICS HANDLING

If the input contains multiple topics:
- Format each as a separate main topic section
- Add TWO blank lines between different topics
- Follow the same structure for each topic

🔥 EXPORT GUARANTEE

The final text MUST remain clean and unchanged when copied into:
- TXT files
- Word documents
- Notepad
- Google Docs
- PDF files

No automatic formatting, no markdown codes, no hidden characters.
When user copies or downloads, the format MUST remain exactly the same.

🔥 SPECIAL COMMANDS

If user says "About Us":
Generate a 5–7 line About Us section:
- Created by a second-year CSE (AI/ML) student at Brainware University
- Goal: fast, accurate, distraction-free student notes

If user says "Donate Us":
Generate a 4–6 line donation message:
- Single-student project
- Donations support hosting and future updates
- UPI: gumu642@okicici
- Tone: polite, honest, not forceful

🔥 MULTI-QUESTION HANDLING

If user provides multiple questions or says "unlimited":
- Answer ALL questions one by one
- Never say "I cannot answer more"
- Never limit the number of answers
- Continue generating until user says "stop"
- Each question follows the structure above

REMEMBER: Output clean, professional academic notes with proper plain text structure. Use real bold formatting ONLY for headings (not markdown). Use plain bullets (-) and plain numbered lists (1. 2. 3.). The text must stay perfectly formatted when copied to ANY editor or exported to ANY format. NO markdown symbols (#, *, **, --, etc.). NO decorative characters. Keep it clean, structured, and exam-ready. Only fill the content. Do not change the structure.`;

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
