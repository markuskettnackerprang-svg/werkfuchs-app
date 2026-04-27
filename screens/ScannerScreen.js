import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

export default function ScannerScreen({ onBack, onScanResult }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (Platform.OS === "web") {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>QR-Scanner</Text>
        <Text style={styles.info}>
          Der Scanner läuft bitte auf Android oder iPhone testen, nicht im Web-Preview.
        </Text>

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Kameraberechtigung wird geprüft...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Kamera benötigt</Text>
        <Text style={styles.info}>
          Für den QR-Code-Scanner braucht WerkFuchs Pro Zugriff auf die Kamera.
        </Text>

        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Berechtigung erlauben</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Zurück</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function handleBarcodeScanned({ data, type }) {
    if (scanned) return;

    setScanned(true);

    if (onScanResult) {
      onScanResult({ data, type });
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <Text style={styles.overlayText}>QR-Code ins Kamerafeld halten</Text>

        {scanned && (
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
            <Text style={styles.buttonText}>Erneut scannen</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={onBack}>
          <Text style={styles.secondaryButtonText}>Zurück</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
  },
  overlayText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },
  center: {
    flex: 1,
    backgroundColor: "#E6E6E6",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1F2A37",
  },
  info: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 18,
    color: "#4B5563",
  },
  button: {
    backgroundColor: "#FF6B00",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },
  secondaryButtonText: {
    color: "#1F2A37",
    fontWeight: "700",
    fontSize: 16,
  },
});