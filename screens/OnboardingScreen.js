import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

const PROFILES = [
  {
    id: "heimwerker",
    title: "Heimwerken / Werkstatt",
    icon: "🛠️",
    description: "Schrauben, Dübel, Werkzeuge, Boxen",
    categories: [
      "Schrauben",
      "Dübel",
      "Bohrer",
      "Werkzeug",
      "Maschine",
      "Elektrik",
      "Unterlegscheiben",
      "Nägel",
      "Holzdübel",
      "Beschläge",
      "Große Box",
      "Sortimentskasten",
    ],
  },
  {
    id: "metall",
    title: "Metall / Maschinenbau",
    icon: "🔩",
    description: "Muttern, Profile, Messmittel, Maschinen",
    categories: [
      "Schrauben",
      "Muttern",
      "Unterlegscheiben",
      "Gewindestangen",
      "Metallprofile",
      "Werkzeug",
      "Maschine",
      "Messmittel",
      "Kleinteilebox",
    ],
  },
  {
    id: "betrieb",
    title: "Betrieb / Lager",
    icon: "📦",
    description: "Material, Verbrauchsmittel, Lagerboxen",
    categories: [
      "Verbrauchsmaterial",
      "Werkzeug",
      "Reinigungsmittel",
      "Dokumente",
      "Ersatzteile",
      "Lagerbox",
      "Große Box",
    ],
  },
  {
    id: "bestattung",
    title: "Bestattung / Betriebsmittel",
    icon: "🕯️",
    description: "Dekoration, Kerzen, Textilien, Zubehör",
    categories: [
      "Dekoration",
      "Kerzen",
      "Urnenzubehör",
      "Textilien",
      "Reinigungsmittel",
      "Werkzeug",
      "Formulare",
      "Lagerbox",
    ],
  },
];

export default function OnboardingScreen({ onComplete }) {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategory, setCustomCategory] = useState("");

  function handleSelectProfile(profile) {
    setSelectedProfile(profile);
    setSelectedCategories(profile.categories);
  }

  function toggleCategory(category) {
    if (selectedCategories.includes(category)) {
      setSelectedCategories((prev) => prev.filter((item) => item !== category));
    } else {
      setSelectedCategories((prev) => [...prev, category]);
    }
  }

  function handleAddCustomCategory() {
  const clean = customCategory.trim();

  if (!clean) return;

  if (!selectedCategories.includes(clean)) {
    setSelectedCategories((prev) => [...prev, clean]);
  }

  setCustomCategory("");
}

  function handleFinish() {
    onComplete({
      profileType: selectedProfile.id,
      profileTitle: selectedProfile.title,
      categories: selectedCategories,
    });
  }

  if (!selectedProfile) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>🦊</Text>

        <Text style={styles.title}>WerkFuchs einrichten</Text>

        <Text style={styles.subtitle}>
          Wofür möchtest du WerkFuchs hauptsächlich nutzen?
        </Text>

        {PROFILES.map((profile) => (
          <TouchableOpacity
            key={profile.id}
            style={styles.profileCard}
            onPress={() => handleSelectProfile(profile)}
            activeOpacity={0.85}
          >
            <Text style={styles.profileIcon}>{profile.icon}</Text>

            <View style={styles.profileTextWrap}>
              <Text style={styles.profileTitle}>{profile.title}</Text>
              <Text style={styles.profileDescription}>
                {profile.description}
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <ScrollView
      contentContainerStyle={styles.containerWithFooter}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setSelectedProfile(null)}
      >
        <Text style={styles.backButtonText}>← Zurück</Text>
      </TouchableOpacity>

      <Text style={styles.logo}>{selectedProfile.icon}</Text>

      <Text style={styles.title}>Kategorien anpassen</Text>

      <Text style={styles.subtitle}>
        Wähle aus, was du nutzen möchtest. Du kannst eigene Kategorien ergänzen.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>{selectedProfile.title}</Text>

        <View style={styles.chipWrap}>
          {selectedProfile.categories.map((category) => {
            const active = selectedCategories.includes(category);

            return (
              <TouchableOpacity
                key={category}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleCategory(category)}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {active ? "✓ " : "+ "}
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Eigene Kategorie hinzufügen</Text>

        <View style={styles.addRow}>
          <TextInput
            style={styles.input}
            placeholder="z.B. Lacke, Profile, Zubehör..."
            value={customCategory}
            onChangeText={setCustomCategory}
            returnKeyType="done"
            onSubmitEditing={handleAddCustomCategory}
            blurOnSubmit={false}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCustomCategory}
          >
            <Text style={styles.addButtonText}>＋</Text>
          </TouchableOpacity>
        </View>

        {selectedCategories.length > 0 && (
          <>
            <Text style={styles.sectionSubTitle}>Aktive Kategorien</Text>

            <View style={styles.chipWrap}>
              {selectedCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.chip, styles.selectedChip]}
                  onPress={() => toggleCategory(category)}
                >
                  <Text style={styles.selectedChipText}>✓ {category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </ScrollView>

    {/* 🔥 FIXED FOOTER */}
    <View style={styles.footer}>
      <TouchableOpacity
        style={[
          styles.finishButton,
          selectedCategories.length === 0 && !customCategory.trim() && styles.finishButtonDisabled,
        ]}
        disabled={selectedCategories.length === 0 && !customCategory.trim()}
        onPress={() => {
          if (customCategory.trim()) {
            handleAddCustomCategory();
            return;
          }

          handleFinish();
        }}
      >
        <Text style={styles.finishButtonText}>
          {customCategory.trim()
            ? "Kategorie hinzufügen"
            : "Auswahl übernehmen"}
      </Text>
    </TouchableOpacity>

      <Text style={styles.note}>
        Kategorien können später noch geändert werden.
      </Text>
    </View>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
    paddingTop: 50,
  },

  logo: {
  fontSize: 36,
  textAlign: "center",
  marginBottom: 4,
},

title: {
  fontSize: 24,
  fontWeight: "800",
  color: "#1F2A37",
  textAlign: "center",
  marginBottom: 6,
},

subtitle: {
  fontSize: 14,
  color: "#6B7280",
  textAlign: "center",
  lineHeight: 20,
  marginBottom: 16,
},

  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  profileIcon: {
    fontSize: 34,
    marginRight: 14,
  },

  profileTextWrap: {
    flex: 1,
  },

  profileTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2A37",
    marginBottom: 4,
  },

  profileDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },

  arrow: {
    fontSize: 32,
    color: "#9CA3AF",
    marginLeft: 8,
  },

  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  backButtonText: {
    color: "#1F2A37",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1F2A37",
    marginBottom: 12,
  },

  sectionSubTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
    marginTop: 16,
    marginBottom: 10,
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  chip: {
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#FFFFFF",
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  chipActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },

  chipText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 13,
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  selectedChip: {
    backgroundColor: "#1B2A3A",
    borderColor: "#1B2A3A",
  },

  selectedChipText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },

  addRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1F2A37",
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "800",
  },

  finishButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 4,
  },

  finishButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },

  finishButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  note: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 13,
    marginTop: 14,
    marginBottom: 20,
  },

  containerWithFooter: {
  flexGrow: 1,
  backgroundColor: "#F3F4F6",
  padding: 20,
  paddingTop: 30,
  paddingBottom: 20,
},

  footer: {
  backgroundColor: "#F3F4F6",
  paddingHorizontal: 20,
  paddingTop: 10,
  paddingBottom: 24,
  borderTopWidth: 1,
  borderTopColor: "#E5E7EB",
},

});