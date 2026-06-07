// NexoTrade AI — Supabase Edge Function
// Llama a OpenAI de forma segura (la API key nunca sale al navegador)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { message, systemPrompt } = await req.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt || "Eres la IA de NexoTrade, asistente financiero. Responde en español, de forma concisa y educativa sobre acciones, crypto y mercados. Máximo 3 párrafos. Añade siempre un disclaimer de que no es consejo financiero." },
          { role: "user",   content: message },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI error:", data);
      return new Response(
        JSON.stringify({ reply: "Error de conexión con la IA. Inténtalo de nuevo." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reply = data.choices?.[0]?.message?.content || "Lo siento, no pude responder en este momento.";

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ reply: "Error interno. Inténtalo de nuevo." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
