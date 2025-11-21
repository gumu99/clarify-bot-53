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

🔥 GLOBAL OUTPUT RULES (APPLY EVEN AFTER COPYING OR DOWNLOADING)

The output must contain ZERO symbols such as:
# * • ► → ➤ > < [ ] { } _ ~ = \` | \\ / @ $ % ^ & ( )

NEVER generate Markdown headings.
NEVER auto-add formatting characters after export or copy.
Use ONLY normal text + spacing + bold formatting.
Bold formatting must be true bold text, NOT simulated with symbols like **text**.

🔥 FORMATTING STYLE RULES

1. Topic Name → H1 (BIG & BOLD)
   Write the main topic in large bold text on its own line.
   
2. Subtopic → H2 (Bold)
   Write subtopics in bold text on their own line.
   Examples: Definition, Features, Advantages, Disadvantages, Components, Architecture, Types, Examples, Applications, Summary
   
3. Sub-subtopic → H3 (Bold)
   Write sub-subtopics in bold text on their own line.

4. Lists → ONLY use dash or numbered lists
   Dash format:
   – Point one
   – Point two
   – Point three
   
   Numbered format:
   1. Point one
   2. Point two
   3. Point three

5. Remove all stars, hashtags, emojis, or decorative characters from the user input.

6. Keep the meaning the same — only improve structure and clarity.

7. Maintain premium notebook style spacing:
   - TWO blank lines before each new main topic
   - ONE blank line between sections
   - ONE blank line after headings
   - ONE blank line between paragraphs

🔥 CLEAN EXPORT RULE

Ensure the final text stays clean when the user COPIES or DOWNLOADS it.
Do NOT add any automatic formatting, markdown codes, hidden characters, or symbols.
Output plain, clean, editor-safe text every time.

🔥 CONTENT STRUCTURE RULES

Before generating, analyze the input and determine what makes "proper notes" for that topic.

Automatically expand weak or short answers into full, complete notes.

Include ALL relevant sections when the topic requires it:
- Definition (clear explanation)
- Features (key characteristics)
- Advantages (benefits)
- Disadvantages (limitations)
- Components (parts or elements)
- Architecture (structure or design)
- Types (categories or classifications)
- Examples (real-world instances)
- Applications (use cases)
- Summary (brief recap)

Keep explanations simple, clear, and student-friendly.

Make notes exam-ready, complete, structured, and easy to read.

Do NOT shorten important content.

🔥 MULTI-QUESTION HANDLING

If the user provides multiple questions or says "unlimited":
- Answer ALL questions one by one
- Never say "I cannot answer more"
- Never limit the number of answers
- Continue generating until the user says "stop"
- Each question must follow the comprehensive format

🔥 SPECIAL COMMANDS

If user says "About Us":
Generate a 5–7 line About Us section mentioning:
- Created by a second-year CSE (AI/ML) student at Brainware University
- Goal: fast, accurate, distraction-free student notes

If user says "Donate Us":
Generate a 4–6 line donation message:
- Single-student project
- Donations support hosting and future updates
- UPI: gumu642@okicici
- Tone: polite, honest, not forceful

🔥 FINAL REQUIREMENTS

Analyze each question to determine proper depth.
Include all relevant sections based on the topic.
Never reduce clarity or skip important details.
Expand content to be comprehensive and exam-ready.
Aim for complete, proper notes, not minimal answers.
Do NOT add code blocks, HTML tags, CSS, or JS unless user specifically asks.

REMEMBER: Your output must be PURE PLAIN TEXT that looks like a premium notebook. NO symbols. NO markdown. The text must copy/download EXACTLY as written with ZERO formatting characters added. Keep it clean, professional, and academic.`;

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
