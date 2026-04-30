/// <reference types="https://deno.land/x/deno/cli/types/dts/lib.deno.d.ts" />

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Nur POST erlaubt" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const body = await req.json().catch(() => null);

  if (!body?.image_uri) {
    return new Response(
      JSON.stringify({ error: "image_uri fehlt" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  return new Response(
    JSON.stringify({
      name: "KI-Testartikel",
      shortLabel: "KI-Test",
      category: "Test",
      location: "",
      message: "Edge Function funktioniert. Echte KI kommt später.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});