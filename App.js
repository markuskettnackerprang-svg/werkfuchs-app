import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./screens/HomeScreen";
import InventoryScreen from "./screens/InventoryScreen";
import LabelPreviewScreen from "./screens/LabelPreviewScreen";
import ScannerScreen from "./screens/ScannerScreen";
import OnboardingScreen from "./screens/OnboardingScreen";

import inventoryData from "./data/inventoryData";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [scannedCode, setScannedCode] = useState("");

  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userConfig, setUserConfig] = useState(null);

  useEffect(() => {
    async function loadConfig() {
      
      try {
        const saved = await AsyncStorage.getItem("userConfig");

        if (saved) {
          setUserConfig(JSON.parse(saved));
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.log("Onboarding laden fehlgeschlagen:", error);
        setShowOnboarding(true);
      } finally {
        setIsReady(true);
      }
    }

    loadConfig();
  }, []);

  async function handleOnboardingComplete(config) {
    try {
      await AsyncStorage.setItem("userConfig", JSON.stringify(config));
      setUserConfig(config);
      setShowOnboarding(false);
      setCurrentScreen("home");
    } catch (error) {
      console.log("Onboarding speichern fehlgeschlagen:", error);
    }
  }

  if (!isReady) {
    return null;
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (currentScreen === "labels") {
    return (
      <LabelPreviewScreen
        items={inventoryData}
        onBack={() => setCurrentScreen("inventory")}
      />
    );
  }

  if (currentScreen === "scanner") {
    return (
      <ScannerScreen
        onBack={() => setCurrentScreen("home")}
        onScanResult={(result) => {
          const code = String(result?.data || "").trim();
          console.log("QR gescannt:", code);

          setScannedCode(code);
          setCurrentScreen("inventory");
        }}
      />
    );
  }

  if (currentScreen === "inventory") {
    return (
      <InventoryScreen
        scannedCode={scannedCode}
        onScannedCodeHandled={() => setScannedCode("")}
        onGoHome={() => setCurrentScreen("home")}
        onOpenLabelPreview={() => setCurrentScreen("labels")}
        onOpenScanner={() => setCurrentScreen("scanner")}
        startMode="browse"
        userConfig={userConfig}
      />
    );
  }

  if (currentScreen === "inventoryCreate") {
    return (
      <InventoryScreen
        onGoHome={() => setCurrentScreen("home")}
        onOpenLabelPreview={() => setCurrentScreen("labels")}
        onOpenScanner={() => setCurrentScreen("scanner")}
        startMode="create"
        userConfig={userConfig}
      />
    );
  }

  return <HomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />;
}