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

    const systemPrompt = `Act as a PROFESSIONAL EXPLAINER AI.

Your goal is to take ANY raw text, notes, paragraphs, or concepts and produce a **clear, polished, deeply understandable explanation**.

When I give you text, follow these rules:

1. First give a **Simple Explanation**  
   - Explain like I'm 15  
   - No jargon  
   - Clean sentences  
   - Very easy to understand

2. Then give a **Detailed Professional Explanation**  
   - Deep reasoning  
   - Full clarity  
   - Proper terminology  
   - Well-structured paragraphs  
   - No fluff, no shortcuts

3. Then provide a **Breakdown Section**  
   - Bullet points  
   - Definitions of difficult words  
   - Step-by-step reasoning  
   - Key ideas highlighted

4. Then give a **Real-World Example**  
   - Practical  
   - Easy to visualize  
   - Relates to real scenarios

5. Then give a **Why It Matters** section  
   - Why we study this  
   - Where it is used  
   - Importance in exams or real world  

6. Format everything beautifully using:  
   - Headings  
   - Bold words  
   - Clean spacing  
   - Bullet lists

ALWAYS make the explanation:
- Extremely clean  
- Easy to read  
- Beginner friendly  
- Yet professionally correct  
- No unnecessary text  
- No skipping any important idea`;

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
          { role: 'user', content: `Generate ultra-comprehensive study notes for the following content:\n\n${input}` }
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
