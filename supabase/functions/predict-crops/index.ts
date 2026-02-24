import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { weather, soil, location } = await req.json();
    
    console.log('[CROP-PREDICT] Received request for location:', location);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `You are an expert agricultural advisor specializing in Indian farming. Based on the following environmental data for ${location}, India, provide detailed crop recommendations.

Weather Data:
- Average Temperature: ${weather.avgTemperature}°C
- Average Humidity: ${weather.avgHumidity}%
- Previous Year Rainfall: ${weather.prevYearRainfall}mm
- Average Annual Rainfall: ${weather.avgAnnualRainfall}mm

Soil Data:
- pH Level: ${soil.ph}
- Nitrogen: ${soil.nitrogen} mg/kg
- Phosphorus: ${soil.phosphorus} mg/kg
- Potassium: ${soil.potassium} mg/kg
- Soil Type: ${soil.soilType}

Provide recommendations for 5-6 most suitable crops. Format each crop EXACTLY like this:

---CROP START---
**Crop Name:** [English Name] ([Hindi Name])
**Suitability:** [Score out of 10]/10
**Probability:** [Percentage]%
**Season:** [Kharif/Rabi/Zaid]
**Duration:** [time period]
**Yield:** [amount] per hectare
**Market Price:** ₹[min]-[max] per quintal
**Water Need:** [Low/Medium/High] - [specific requirements]
**NPK Ratio:** [N:P:K ratio and details]
**Key Benefits:** [2-3 key advantages for this location]
**Cultivation Tips:** [specific advice for this soil and climate]
**Pests/Diseases:** [common issues and organic solutions]
---CROP END---

After all crops, add:

---ADDITIONAL INFO---
**Crop Rotation:** [detailed rotation suggestions]
**Soil Management:** [improvement recommendations]
**Water Strategy:** [management strategies]
**Government Schemes:** [PM-KISAN, PMFBY, etc. with brief details]
**Income Potential:** [estimated seasonal income analysis]
---END INFO---`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert Indian agricultural advisor with deep knowledge of crop cultivation, soil science, and farming practices across different regions of India. Provide practical, actionable advice tailored to Indian farmers.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CROP-PREDICT] AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again in a moment.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI service quota exceeded. Please contact support.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const recommendations = data.choices[0].message.content;

    console.log('[CROP-PREDICT] Successfully generated recommendations');

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[CROP-PREDICT] Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate crop predictions' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
