import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { image, mimeType, fileName } = await req.json();
    console.log('Extracting text from:', fileName, 'Type:', mimeType);

    if (!image) {
      throw new Error('No image data provided');
    }

    const isImage = mimeType.startsWith('image/');
    const isPDF = mimeType === 'application/pdf';

    if (!isImage && !isPDF) {
      throw new Error('Unsupported file type. Please upload an image or PDF.');
    }

    const imageUrl = `data:${mimeType};base64,${image}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an OCR and text extraction expert. Extract ALL text from the provided ${isPDF ? 'PDF' : 'image'} exactly as it appears.

Rules:
1. Extract every word, number, and symbol visible
2. Maintain the original structure and formatting where possible
3. If there are tables, preserve the tabular format
4. If there are lists, preserve the list format
5. If text is handwritten, do your best to transcribe it accurately
6. Do NOT add any commentary or explanations
7. Do NOT summarize - extract everything
8. If you cannot read something, indicate it with [unclear]

Return ONLY the extracted text, nothing else.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              },
              {
                type: 'text',
                text: 'Extract all text from this image/document. Return only the extracted text.'
              }
            ]
          }
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: 'Invalid API key. Please check your OpenAI API key.' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';

    console.log('Text extracted successfully, length:', extractedText.length);

    return new Response(JSON.stringify({ text: extractedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in extract-text-from-image function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
