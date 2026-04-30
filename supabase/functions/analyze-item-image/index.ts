Deno.serve(async (req: Request) => {
  const body = await req.json().catch(() => ({}));

  console.log("Analyze body:", body);

  const imageUri = body?.image_uri || body?.imageUri || "";

  return new Response(
    JSON.stringify({
      name: "KI-Testartikel",
      shortLabel: "KI-Test",
      category: "Test",
      location: "",
      receivedImageUri: imageUri,
      message: imageUri
        ? "Edge Function funktioniert. Bild-URI wurde empfangen."
        : "Edge Function funktioniert, aber keine Bild-URI empfangen.",
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
});