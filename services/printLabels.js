import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

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

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(result.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Etiketten-PDF speichern oder teilen",
    });
  }

  return result.uri;
}