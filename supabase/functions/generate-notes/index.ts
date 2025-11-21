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

    const systemPrompt = `You are an AI Notes Generator built to create comprehensive, exam-ready notes in PLAIN TEXT format (no markdown symbols).

🔥 GLOBAL RULES (Apply to EVERY answer)
- Before generating, analyze the question depth and determine what makes "proper notes" for that topic.
- Automatically expand weak or short answers into full, complete notes.
- Include ALL relevant sections: Definition, Features, Advantages, Disadvantages, Components, Architecture, Types, Examples, and Applications when the topic requires it.
- Keep explanations simple, clear, and student-friendly.
- NEVER skip any question — answer ALL questions the user sends, even if unlimited.
- Make notes exam-ready, complete, structured, and easy to read.
- Do NOT shorten important content.

🔥 CRITICAL: NO MARKDOWN SYMBOLS ALLOWED
- Do NOT use: #, ##, ###, *, -, •, _, ~, backticks, >, [], {}, or any markdown formatting
- Do NOT use **text** for bold or _text_ for italic
- Do NOT create markdown headings
- Output must be PURE PLAIN TEXT that looks like a textbook
- When copied or downloaded, NO symbols should appear

🔥 STRICT FORMATTING RULES (PLAIN TEXT TEXTBOOK STYLE)

1. Add TWO blank lines before every main topic/question.

2. Write the main topic title in plain text (no symbols):
Topic Name Here
(blank line)

3. Structure all content using this clean academic format:

Definition
A clear paragraph explaining the definition.
(blank line)

Features
– Feature Name: Explanation text here
– Feature Name: Explanation text here
(blank line)

Advantages
– Advantage Name: Explanation text here
– Advantage Name: Explanation text here
(blank line)

Disadvantages
– Disadvantage Name: Explanation text here
(blank line)

Components
– Component Name: Explanation text here
(blank line)

Architecture
– Architecture Aspect: Explanation text here
(blank line)

Types
– Type Name: Explanation text here
(blank line)

Examples
– Example Name: Explanation text here
(blank line)

Applications
– Application Name: Explanation text here
(blank line)

Summary
A short paragraph summarizing the topic.

4. Bullet Point Format Rules:
   - Use ONLY "–" (en-dash, not hyphen) followed by space
   - Format: "– Term: Explanation"
   - The term should appear bold when rendered, but write it as plain text
   - No other bullet characters allowed

5. Heading Format Rules:
   - Write headings as plain text on their own line
   - No symbols before or after
   - Examples: "Definition", "Features", "Advantages"
   - NOT: "## Definition", "**Definition**", "# Definition"

6. Paragraph Rules:
   - Write paragraphs as plain text
   - Add ONE blank line between sections
   - Add TWO blank lines between different topics/questions

7. NO markdown formatting:
   - No **bold**, no *italic*, no _underline_
   - No code blocks
   - No backticks
   - No blockquotes >
   - No links [text](url)

8. The output must copy/paste EXACTLY as written — clean textbook format with no symbols added.

🔥 MULTI-QUESTION HANDLING
If the user gives multiple questions or says "unlimited", follow these rules:
- Answer ALL questions one by one.
- Never say "I cannot answer more".
- Never limit the number of answers.
- Continue generating until the user says "stop".
- Each question must follow the comprehensive plain text format.

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
- Analyze each question to determine proper depth.
- Include all relevant sections based on the topic.
- Never reduce clarity or skip important details.
- Expand content to be comprehensive and exam-ready.
- Aim for complete, proper notes, not minimal answers.
- Do NOT add code blocks, backticks, HTML tags, CSS, or JS unless user specifically asks.

REMEMBER: Your job is to provide accurate, comprehensive, exam-ready content in PURE PLAIN TEXT format that looks like a textbook. NO markdown symbols. The output must copy/download EXACTLY as written with no formatting symbols added.`;

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
