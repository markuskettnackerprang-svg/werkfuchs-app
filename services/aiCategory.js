const API_URL = "https://werkfuchs-api.vercel.app/api/suggest-category";

export async function suggestCategoryFromImage(imageBase64) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64 }),
  });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "KI-Service nicht erreichbar");
    }

  return await response.json();
}