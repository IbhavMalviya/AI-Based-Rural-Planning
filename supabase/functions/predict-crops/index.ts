import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

Provide recommendations in the following structured format for 5-6 most suitable crops for this region:

For each crop, include:
1. Crop Name (in English and Hindi)
2. Suitability Score (1-10)
3. Best Planting Season (Kharif/Rabi/Zaid)
4. Growing Duration (in days/months)
5. Expected Yield per hectare
6. Market Demand & Price Range
7. Water Requirements
8. Fertilizer Recommendations (NPK ratios)
9. Common Pests/Diseases and Management
10. Specific cultivation tips for this soil and climate

Also provide:
- Crop rotation suggestions
- Soil improvement recommendations
- Water management strategies
- Government schemes applicable (PM-KISAN, etc.)
- Expected income per hectare per season`;

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
