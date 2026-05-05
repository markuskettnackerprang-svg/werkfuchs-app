import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";

import { theme } from "../utils/theme";
import { acceptWorkshopInvite } from "../services/inviteAcceptance";

export default function HomeScreen({ onNavigate, onOpenWorkshopSettings }) {
  const [inviteCode, setInviteCode] = useState("");
  const [acceptingInvite, setAcceptingInvite] = useState(false);

  async function handleAcceptInvite() {
    const token = inviteCode.trim();

    if (!token) {
      Alert.alert("Fehler", "Bitte Einladungscode eingeben.");
      return;
    }

    try {
      setAcceptingInvite(true);
      await acceptWorkshopInvite(token);
      setInviteCode("");
      Alert.alert("Erfolg", "Du bist dem Workshop beigetreten 🎉");
    } catch (error) {
      console.error(error);
      Alert.alert("Fehler", error.message || "Einladung konnte nicht angenommen werden.");
    } finally {
      setAcceptingInvite(false);
    }
  }
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.header}>
        <Text style={styles.title}>Werkfuchs OTA Test</Text>

        <TouchableOpacity onPress={() => onOpenWorkshopSettings?.()}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.versionTag}>Testversion</Text>
      <Text style={styles.subtitle}>
        Werkstatt, Boxen und Material clever verwalten. 🦊
      </Text>

      <View style={styles.quickActionRow}>
        <TouchableOpacity
          style={[styles.quickButton, styles.quickAddButton]}
          onPress={() => onNavigate("inventoryCreate")}
          activeOpacity={0.85}
        >
          <Text style={styles.quickIcon}>＋</Text>
          <Text style={styles.quickTitle}>Neuer Fund</Text>
          <Text style={styles.quickSubline}>Foto & KI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickButton, styles.scanQuickButton]}
          onPress={() => onNavigate("scanner")}
          activeOpacity={0.85}
        >
          <Text style={styles.qrIcon}>▦</Text>
          <Text style={styles.quickTitle}>QR-Code</Text>
          <Text style={styles.quickSubline}>scannen</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.inventoryButton}
        onPress={() => onNavigate("inventory")}
        activeOpacity={0.85}
      >
        <Text style={styles.inventoryIcon}>📦</Text>
        <View style={styles.inventoryTextWrap}>
          <Text style={styles.inventoryTitle}>Inventar öffnen</Text>
          <Text style={styles.inventorySubline}>
            Suchen, filtern, bearbeiten, Etiketten drucken
          </Text>
        </View>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>

      <View style={styles.inviteBox}>
        <Text style={styles.inviteTitle}>Einladung annehmen</Text>

        <TextInput
          style={styles.inviteInput}
          placeholder="Einladungscode einfügen"
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleAcceptInvite}
          disabled={acceptingInvite}
        >
          <Text style={styles.inviteButtonText}>
            {acceptingInvite ? "Wird angenommen..." : "Einladung annehmen"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.feedbackButton}
        onPress={() => onNavigate("feedback")}
      >
        <Text style={styles.feedbackButtonText}>
          🦊 Feedback geben
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9EDF1",
    alignItems: "center",
    paddingTop: 18,
    paddingHorizontal: 20,
  },

  logo: {
    width: "100%",
    height: 260,
    marginBottom: -8,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2A37",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 26,
    lineHeight: 21,
  },

  quickActionRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 18,
    marginBottom: 22,
    width: "100%",
  },

  quickButton: {
    flex: 1,
    height: 132,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
  },

  quickAddButton: {
    backgroundColor: "#FF6B00",
  },

  scanQuickButton: {
    backgroundColor: "#1B2A3A",
  },

  quickIcon: {
    fontSize: 38,
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 8,
  },

  qrIcon: {
    fontSize: 42,
    color: "#FFFFFF",
    fontWeight: "800",
    marginBottom: 8,
  },

  quickTitle: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  quickSubline: {
    marginTop: 3,
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.85,
    fontWeight: "600",
  },

  inventoryButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  inventoryIcon: {
    fontSize: 34,
    marginRight: 14,
  },

  inventoryTextWrap: {
    flex: 1,
  },

  inventoryTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F2A37",
    marginBottom: 3,
  },

  inventorySubline: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },

  arrow: {
    fontSize: 34,
    color: "#9CA3AF",
    marginLeft: 8,
  },

  versionTag: {
    fontSize: 12,
    color: "#FF6B00",
    backgroundColor: "#FFF3E8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 10,
    fontWeight: "700",
    },

  feedbackButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },

  feedbackButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  settingsIcon: {
    fontSize: 24,
  },
  inviteBox: {
  width: "100%",
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: 16,
  marginTop: 16,
  borderWidth: 1,
  borderColor: "#D0D5DD",
},

inviteTitle: {
  fontSize: 16,
  fontWeight: "800",
  color: "#1F2A37",
  marginBottom: 10,
},

inviteInput: {
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
  color: "#1F2A37",
},

inviteButton: {
  backgroundColor: "#1B2A3A",
  paddingVertical: 12,
  borderRadius: 12,
  alignItems: "center",
},

inviteButtonText: {
  color: "#FFFFFF",
  fontWeight: "800",
},
});