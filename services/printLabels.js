import * as Print from "expo-print";

export async function printLabels(html) {
  if (!html) {
    throw new Error("Kein HTML zum Drucken vorhanden.");
  }

  await Print.printAsync({
    html,
  });
}

export async function exportLabelsPdf(html) {
  if (!html) {
    throw new Error("Kein HTML für PDF vorhanden.");
  }

  const result = await Print.printToFileAsync({
    html,
  });

  return result.uri;
}