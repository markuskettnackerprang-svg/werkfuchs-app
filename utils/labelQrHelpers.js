import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

export async function getAssetAsBase64DataUri(moduleRef, mimeType = "image/png") {
  const asset = Asset.fromModule(moduleRef);
  await asset.downloadAsync();

  const uri = asset.localUri || asset.uri;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return `data:${mimeType};base64,${base64}`;
}