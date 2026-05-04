import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./services/supabaseClient";

import HomeScreen from "./screens/HomeScreen";
import AuthScreen from "./screens/AuthScreen";
import InventoryScreen from "./screens/InventoryScreen";
import WorkshopSettingsScreen from "./screens/WorkshopSettingsScreen";
import LabelPreviewScreen from "./screens/LabelPreviewScreen";
import ScannerScreen from "./screens/ScannerScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import FeedbackScreen from "./screens/FeedbackScreen";

export default function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [session, setSession] = useState(null);
  const [scannedCode, setScannedCode] = useState("");

  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [userConfig, setUserConfig] = useState(null);
  const [labelItems, setLabelItems] = useState([]);

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

        const { data } = await supabase.auth.getSession();
        setSession(data.session);
      } catch (error) {
        console.log("App Start Fehler:", error);
        setShowOnboarding(true);
      } finally {
        setIsReady(true);
      }
    }

    loadConfig();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
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

  if (!session) {
    return <AuthScreen onLogin={setSession} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (currentScreen === "labels") {
    return (
      <LabelPreviewScreen
        items={labelItems}
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
        onItemsLoaded={setLabelItems}
        startMode="browse"
        userConfig={userConfig}
        session={session}
      />
    );
  }

  if (currentScreen === "inventoryCreate") {
    return (
      <InventoryScreen
        onGoHome={() => setCurrentScreen("home")}
        onOpenLabelPreview={() => setCurrentScreen("labels")}
        onOpenScanner={() => setCurrentScreen("scanner")}
        onItemsLoaded={setLabelItems}
        startMode="create"
        userConfig={userConfig}
        session={session}
      />
    );
  }

  if (currentScreen === "feedback") {
    return <FeedbackScreen onBack={() => setCurrentScreen("home")} />;
  }

  if (currentScreen === "workshopSettings") {
    return (
      <WorkshopSettingsScreen
        onBack={() => setCurrentScreen("home")}
        userConfig={userConfig}
        session={session}
      />
    );
  }

return (
  <HomeScreen
    onNavigate={(screen) => setCurrentScreen(screen)}
    onOpenWorkshopSettings={() => setCurrentScreen("workshopSettings")}
  />
);
}