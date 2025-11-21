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
No #, no *, no code fences, no symbols, no hidden formatting.

Use ONLY real bold formatting for headings (not markdown bold like **text**).

The output must contain:
– H1 (big bold) for main topic
– H2 (bold) for sections
– H3 (bold) for subsections

🔥 EXACT FORMATTING PATTERN

Follow this structure exactly:

H1: Topic Title

H2: Definition
Normal paragraph text explaining the definition clearly.

H2: Objectives
– bullet point one
– bullet point two
– bullet point three

H2: Features
– feature one: explanation
– feature two: explanation

H2: Components
– component one: explanation
– component two: explanation

H2: Architecture
Normal paragraph or bullet points explaining architecture.

H2: Types
– type one: explanation
– type two: explanation

H2: Advantages
– advantage one: explanation
– advantage two: explanation

H2: Disadvantages
– disadvantage one: explanation
– disadvantage two: explanation

H2: Examples
Normal text with real-world examples.

H2: Applications
– application one: explanation
– application two: explanation

H2: Summary
Normal paragraph summarizing the entire topic.

🔥 BULLET POINT RULES

Bullets MUST be plain dashes:
– like this
– and this

NOT: *, not •, not ►, not →, not ➤, not #

🔥 SPACING RULES

Keep perfect spacing between headings, lists, and paragraphs:
- ONE blank line after H1
- ONE blank line after each H2 heading
- ONE blank line between sections
- TWO blank lines before a new H1 topic
- NO extra blank lines
- NO missing blank lines

🔥 CONTENT RULES

Never shorten content. Keep all meaning exactly the same.

Analyze the input and determine proper depth for comprehensive notes.

Include ALL relevant sections based on the topic:
- Definition (required for most topics)
- Objectives (if applicable)
- Features (if applicable)
- Components (if applicable)
- Architecture (if applicable)
- Types (if applicable)
- Advantages (required for most topics)
- Disadvantages (required for most topics)
- Examples (if helpful)
- Applications (if applicable)
- Summary (recommended for longer topics)

Keep explanations simple, clear, and student-friendly.

Make notes exam-ready, complete, structured, and easy to read.

🔥 MULTIPLE TOPICS HANDLING

If the input contains multiple topics (like DBMS + Normalization + Keys + Transactions + SQL):
- Format each as a separate H1 section
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
- Each question follows the comprehensive format

REMEMBER: Output clean, professional academic notes with proper heading structure. Use real bold formatting (not markdown). The text must stay perfectly formatted when copied to ANY editor or exported to ANY format. NO markdown symbols. NO decorative characters. Keep it clean, structured, and exam-ready.`;

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
