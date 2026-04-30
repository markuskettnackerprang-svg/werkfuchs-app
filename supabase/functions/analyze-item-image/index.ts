Deno.serve(async (req: Request) => {
  const apiKey = Deno.env.get("OPENAI_API_KEY");

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error: "OPENAI_API_KEY fehlt oder falsch benannt",
      }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({
      message: "Key vorhanden – bereit für KI",
    }),
    { status: 200 }
  );
});