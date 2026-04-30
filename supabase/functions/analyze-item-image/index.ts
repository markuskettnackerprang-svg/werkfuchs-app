Deno.serve(async (req: Request) => {
  try {
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY fehlt" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json().catch(() => ({}));
    const imageUri = body?.image_uri || body?.imageUri || "";

    if (!imageUri) {
      return new Response(
        JSON.stringify({ error: "image_uri fehlt" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Analysiere dieses Werkstattbild. Antworte ausschließlich als gültiges JSON. Kein Text davor oder danach. Format:\n\n{\n  \"name\": \"...\",\n  \"shortLabel\": \"...\",\n  \"category\": \"...\",\n  \"location\": \"...\"\n}\n\nKeine Erklärung. Nur JSON.",
              },
              {
                type: "input_image",
                image_url: imageUri,
              },
            ],
          },
        ],
      }),
    });

    const result = await openAiResponse.json();

    if (!openAiResponse.ok) {
      console.log("OpenAI Fehler:", result);
      return new Response(
        JSON.stringify({
          error: "OpenAI Fehler",
          details: result,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const text =
      result.output?.[0]?.content?.[0]?.text ||
      result.output_text ||
      "";

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch (_error) {
      parsed = {
        name: "Unbekannter Artikel",
        shortLabel: "Artikel",
        category: "Sonstiges",
        location: "",
        raw: text,
      };
    }

    return new Response(
      JSON.stringify({
        name: parsed.name || "Unbekannter Artikel",
        shortLabel: parsed.shortLabel || parsed.name || "Artikel",
        category: parsed.category || "Sonstiges",
        location: parsed.location || "",
        message: "KI-Analyse abgeschlossen.",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log("Function Fehler:", error);

    return new Response(
      JSON.stringify({
        error: "Function Fehler",
        message: error?.message || "Unbekannter Fehler",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});