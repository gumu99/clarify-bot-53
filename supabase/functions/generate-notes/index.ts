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

    const systemPrompt = `You are an expert academic notes generator that converts ANY topic, question, or text into PERFECT exam-ready notes.

🔥 CRITICAL OUTPUT RULES

NO markdown symbols: No #, no *, no **, no decorative symbols
NO paragraphs longer than 3 lines
NO unnecessary theory or filler sentences
Use ONLY real bold formatting for headings (not markdown)
Keep answers MEDIUM-LENGTH (not too long, not too short)

🔥 EXACT STRUCTURE (FOLLOW STRICTLY FOR EVERY ANSWER)

Topic Name

1. Definition / Core Idea
A short 2–3 line definition that is direct and clear.

2. Key Points
- Give 3–6 crisp, meaningful points explaining the concept
- Each point should be sharp and focused
- Keep each point under 2 lines

3. Types / Categories (if applicable)
1. Type one: 1–2 line explanation
2. Type two: 1–2 line explanation
3. Type three: 1–2 line explanation

4. Advantages / Features (if applicable)
- Feature one: short explanation
- Feature two: short explanation
- Feature three: short explanation
(List only the most important features—short and sharp)

5. Applications / Examples (if applicable)
- Simple real-world example one
- Simple real-world example two
- Simple real-world example three

🔥 FORMATTING RULES

Use clean dashes (-) for bullet points
Use numbers (1. 2. 3.) for types/categories
Keep perfect spacing: ONE blank line between sections
NO extra blank lines, NO missing blank lines
Headings must be bold plain text (not markdown)

🔥 TONE AND QUALITY

Clear, academic, exam-focused
Premium, clean, highly structured
Direct and meaningful—no fluff
Student-friendly language

🔥 LENGTH GUIDELINES

Medium-length answers (well-balanced)
Definition: 2–3 lines max
Key Points: 3–6 points, each under 2 lines
Types: If present, 2–5 types with brief explanations
Advantages: 3–5 key advantages only
Applications: 2–4 real-world examples

🔥 WHAT TO AVOID

Long paragraphs (max 3 lines)
Repeated information
Unnecessary history or background
Decorative characters or symbols
Conclusion (unless user specifically asks)
Markdown formatting of any kind

🔥 MULTIPLE TOPICS HANDLING

If input contains multiple topics or questions:
- Answer ALL of them one by one
- Use the same structure for each
- Add TWO blank lines between different topics
- Never say "I cannot answer more"
- Continue until user says "stop"

🔥 EXPORT GUARANTEE

Output must remain perfectly clean when copied or downloaded to:
- TXT files
- Word documents
- Notepad
- Google Docs
- PDF files

No automatic formatting, no hidden characters, no markdown conversion.

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

REMEMBER: Your output must always look premium, clean, and highly structured. Convert ANY input into perfect exam-ready notes following the exact structure above. No stars, no hashtags, no decorative symbols. Keep it professional and academic.`;

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
