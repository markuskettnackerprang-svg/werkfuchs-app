import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { createWorkshopInvite } from "../services/invites";

export default function WorkshopSettingsScreen({ userConfig, onBack }) {
  const workshopId =
    userConfig?.workshopId ||
    userConfig?.workshop_id ||
    "ec503812-2e95-4cf5-846e-24e037793ad9";

  console.log("WORKSHOP SETTINGS userConfig:", userConfig);
  console.log("WORKSHOP SETTINGS workshopId:", workshopId);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) {
      Alert.alert("Fehler", "Bitte E-Mail eingeben.");
      return;
    }
    if (!workshopId) {
      Alert.alert("Fehler", "Keine Workshop-ID gefunden. Bitte Onboarding/Workshop neu laden.");
      return;
    }
    try {
      setLoading(true);

      console.log("INVITE DEBUG:", {
        workshopId,
        email,
        role,
      });
      const invite = await createWorkshopInvite({
        workshopId,
        email,
        role,
        });

        const inviteLink = `werkfuchs://invite?token=${invite.token}`;

        setEmail("");

        Alert.alert(
        "Einladung erstellt",
        `Link:\n${inviteLink}`
        );

    } catch (error) {
      console.error(error);
      Alert.alert("Fehler", error.message || "Einladung fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          console.log("Zurück gedrückt");
          onBack?.();
        }}
      >
        <Text style={styles.backButtonText}>← Zurück</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Werkstatt-Einstellungen</Text>

      <Text style={styles.sectionTitle}>User einladen</Text>

      <TextInput
        style={styles.input}
        placeholder="E-Mail-Adresse"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.roleRow}>
        <Button
          title="Member"
          onPress={() => setRole("member")}
          color={role === "member" ? "#007AFF" : "#999"}
        />

        <Button
          title="Owner"
          onPress={() => setRole("owner")}
          color={role === "owner" ? "#007AFF" : "#999"}
        />
      </View>

      <Button
        title={loading ? "Lädt..." : "Einladung erstellen"}
        onPress={handleInvite}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
    marginVertical: 12,
  },

  backButton: {
  alignSelf: "flex-start",
  paddingVertical: 10,
  paddingHorizontal: 4,
  marginBottom: 8,
  zIndex: 10,
},

backButtonText: {
  fontSize: 16,
  fontWeight: "700",
  color: "#1B2A3A",
},
});