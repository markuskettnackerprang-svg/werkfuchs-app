import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";

import { supabase } from "../services/supabaseClient";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { decode } from "base64-arraybuffer";

const WORKSHOP_ID = "werkfuchs-privat";

const CATEGORY_PREFIXES = {
  Dübel: "D",
  Schrauben: "S",
  Werkzeug: "W",
  Maschine: "M",
  Elektrik: "E",
  Sortimentskasten: "SK",
  "Große Box": "B",
  Beschläge: "BE",
  Bohrer: "BO",
  Nägel: "N",
  Unterlegscheiben: "U",
  Holzdübel: "HD",
};

const CATEGORY_SUGGESTIONS = [
  "Dübel",
  "Schrauben",
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
];

function getCategoryPrefix(category) {
  return CATEGORY_PREFIXES[(category || "").trim()] || "X";
}

function getNextCode(items, category) {
  const prefix = getCategoryPrefix(category);

  const numbers = items
    .filter((item) => (item.code || "").startsWith(prefix + "-"))
    .map((item) => parseInt((item.code || "").split("-")[1], 10))
    .filter((n) => !isNaN(n));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  return `${prefix}-${String(nextNumber).padStart(2, "0")}`;
}

function getCategoryIcon(category) {
  const map = {
    Schrauben: "🔩",
    Dübel: "🧱",
    Elektrik: "⚡",
    Werkzeug: "🧰",
    Maschine: "⚙️",
    Nägel: "📌",
    Beschläge: "⚙️",
    Sortimentskasten: "🗂️",
    Unterlegscheiben: "⭕",
    Holzdübel: "🪵",
    "Große Box": "📦",
    Bohrer: "🪛",
  };

  return map[category] || "📁";
}

export default function InventoryScreen({
  onGoHome,
  onOpenLabelPreview,
  onOpenScanner,
  startMode = "browse",
  userConfig,
}) {
  const [mode, setMode] = useState(startMode === "create" ? "form" : "list");
  const [items, setItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [shortLabel, setShortLabel] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [imageUri, setImageUri] = useState("");
  
  const userCategories = userConfig?.categories || CATEGORY_SUGGESTIONS;

  useEffect(() => {
    loadItems();
  }, []);

  async function handlePickImageFromGallery() {
  try {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Galerie gesperrt",
        "Bitte erlaube den Zugriff auf deine Fotos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (result.canceled) return;

    const selectedUri = result.assets?.[0]?.uri;

    if (!selectedUri) {
      Alert.alert("Fehler", "Kein Bild ausgewählt.");
      return;
    }

    setImageUri(selectedUri);
  } catch (error) {
    console.log("Galerie Fehler:", error);
    Alert.alert("Fehler", "Galerie konnte nicht geöffnet werden.");
  }
}
  async function handleTakePhoto() {
  try {
    const permissionResult =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        "Kamera gesperrt",
        "Bitte erlaube den Kamerazugriff in der App."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (result.canceled) return;

    const selectedUri = result.assets?.[0]?.uri;

    if (!selectedUri) {
      Alert.alert("Fehler", "Kein Foto erhalten.");
      return;
    }

    setImageUri(selectedUri);
  } catch (error) {
    console.log("Kamera Fehler:", error);
    Alert.alert("Fehler", "Kamera konnte nicht geöffnet werden.");
  }
}
  async function uploadImageIfNeeded(uri) {
    if (!uri) return "";

    // Schon eine echte Web-URL? Dann nichts hochladen.
    if (uri.startsWith("http")) {
      return uri;
    }

    const fileExt = uri.split(".").pop() || "jpg";
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${WORKSHOP_ID}/${fileName}`;

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: "base64",
    });

    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage
      .from("item-images")
      .upload(filePath, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from("item-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
  
  async function loadItems() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("workshop_id", WORKSHOP_ID)
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Supabase Laden Fehler:", error);
        Alert.alert("Fehler", error.message || "Inventar konnte nicht geladen werden.");
        return;
      }

      setItems(
        (data || []).map((item) => ({
          ...item,
          imageUri: item.image_uri,
        }))
      );
    } catch (e) {
      console.log("Laden fehlgeschlagen:", e);
      Alert.alert("Fehler", "Inventar konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setCode("");
    setName("");
    setShortLabel("");
    setCategory("");
    setLocation("");
    setImageUri("");
  }

  function openCreateForm() {
    resetForm();
    setMode("form");
  }

  function openEditForm(item) {
    setEditingId(item.id);
    setCode(item.code || "");
    setName(item.name || "");
    setShortLabel(item.shortLabel || "");
    setCategory(item.category || "");
    setLocation(item.location || "");
    setImageUri(item.image_uri || "");
    setMode("form");
  }

  async function handleSave() {
    const finalName = name.trim();
    const finalCategory = category.trim();

    if (!finalName) {
      Alert.alert("Fehlt noch", "Bitte Name eingeben.");
      return;
    }

    if (!finalCategory) {
      Alert.alert("Fast geschafft", "Kategorie fehlt noch.");
      return;
    }
    
    let uploadedImageUri = imageUri;

  try {
    uploadedImageUri = await uploadImageIfNeeded(imageUri);
  } catch (error) {
    console.log("Bild-Upload Fehler:", error);
    Alert.alert(
      "Bild-Upload fehlgeschlagen",
      error.message || "Das Bild konnte nicht hochgeladen werden."
    );
    return;
  }
    const itemToSave = {
      id: editingId || Date.now().toString(),
      workshop_id: WORKSHOP_ID,
      code: code.trim() || getNextCode(items, finalCategory),
      name: finalName,
      shortLabel: shortLabel.trim(),
      category: finalCategory,
      location: location.trim(),
      image_uri: uploadedImageUri,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("items")
      .upsert(itemToSave)
      .select()
      .single();

    if (error) {
      console.log("Supabase Speichern Fehler:", error);
      Alert.alert("Supabase-Fehler", error.message || "Speichern fehlgeschlagen.");
      return;
    }

    const savedItem = {
      ...data,
      imageUri: data.image_uri,
    };

    if (editingId) {
      setItems((prev) =>
        prev.map((item) => (item.id === editingId ? savedItem : item))
      );
    } else {
      setItems((prev) => [savedItem, ...prev]);
    }

    resetForm();
    setMode("list");

    Alert.alert("Gespeichert", "Der Artikel wurde in der Cloud gespeichert.");
  }

  async function handleDelete(id) {
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id)
      .eq("workshop_id", WORKSHOP_ID);

    if (error) {
      console.log("Supabase Löschen Fehler:", error);
      Alert.alert("Fehler", error.message || "Löschen fehlgeschlagen.");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  const filteredItems = items.filter((item) => {
    const q = searchText.toLowerCase().trim();

    if (!q) return true;

    return (
      (item.name || "").toLowerCase().includes(q) ||
      (item.shortLabel || "").toLowerCase().includes(q) ||
      (item.code || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q) ||
      (item.location || "").toLowerCase().includes(q)
    );
  });

  if (mode === "form") {
    const previewCode = code.trim() || getNextCode(items, category);

    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              resetForm();
              setMode("list");
            }}
          >
            <Text style={styles.backButtonText}>← Zurück</Text>
          </TouchableOpacity>

            <Text style={styles.title}>
              {editingId ? "Fund bearbeiten" : "Neuer Fund"}
            </Text>

          <View style={styles.formCard}>
            <Text style={styles.label}>Code</Text>
            <TextInput
              style={styles.input}
              placeholder="z. B. S-01 oder leer lassen"
              value={code}
              onChangeText={setCode}
          />

            {!!category.trim() && (
              <Text style={styles.codePreview}>
                {(code || "").trim()
                  ? `Manueller Code: ${previewCode}`
                  : `Nächster Code: ${previewCode}`}
              </Text>
            )}

            <Text style={styles.label}>Bezeichnung</Text>
            <TextInput
              style={styles.input}
              placeholder="z. B. Spax Schrauben 4x40"
              value={name}
              onChangeText={setName}
            />
                
            <TouchableOpacity
              onPress={handlePickImageFromGallery}
              style={{ marginTop: 8 }}
            >
              <Text>📷 Bild aus Galerie auswählen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleTakePhoto}
              style={{ marginTop: 8 }}
            >
              <Text>📸 Foto aufnehmen</Text>
            </TouchableOpacity>

            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 120, height: 120, marginTop: 10 }}
              />
            ) : null}
              
            <Text style={styles.label}>Kurzbezeichnung</Text>
            <TextInput
              style={styles.input}
              placeholder="z. B. Schrauben"
              value={shortLabel}
              onChangeText={setShortLabel}
            />

            <Text style={styles.label}>Kategorie</Text>
            <TextInput
              style={styles.input}
              placeholder="z. B. Schrauben, Werkzeug, Dübel"
              value={category}
              onChangeText={setCategory}
            />

            <View style={styles.suggestionWrap}>
              {userCategories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.suggestionChip,
                    category === cat && styles.suggestionChipActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.suggestionChipText,
                      category === cat && styles.suggestionChipTextActive,
                    ]}
                  >
                    {getCategoryIcon(cat)} {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Lagerort</Text>
            <TextInput
              style={styles.input}
              placeholder="z. B. Box 1 oder Regal A"
              value={location}
              onChangeText={setLocation}
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingId ? "Änderungen speichern" : "Artikel anlegen"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <TouchableOpacity style={styles.backButton} onPress={onGoHome}>
              <Text style={styles.backButtonText}>← Zurück</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Inventar</Text>
            <Text style={styles.subtitle}>Der schlaue Fuchs behält den Überblick. 🦊</Text>

            <TouchableOpacity style={styles.primaryButton} onPress={openCreateForm}>
              <Text style={styles.primaryButtonText}>＋ Neuer Fund</Text>
            </TouchableOpacity>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={onOpenLabelPreview}>
                <Text style={styles.secondaryButtonText}>🖨 Etiketten</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryButton} onPress={onOpenScanner}>
                <Text style={styles.secondaryButtonText}>📷 Scanner</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Fund suchen..."
              value={searchText}
              onChangeText={setSearchText}
            />

            <Text style={styles.resultsText}>
              {loading ? "Lade Inventar..." : `${filteredItems.length} Funde`}
            </Text>
          </>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.codeText}>{item.code}</Text>
            <Text style={styles.nameText}>{item.shortLabel || item.name}</Text>
          
            <Text>
              Bild: {item.image_uri ? "vorhanden" : "noch keines"}
            </Text>

            {item.image_uri && (
              <Image
                source={{ uri: item.image_uri }}
                style={{ width: 100, height: 100, marginTop: 8 }}
              />
            )}

            {!!item.category && (
              <Text style={styles.metaText}>
                {getCategoryIcon(item.category)} {item.category}
              </Text>
             )}

            {!!item.location && (
              <Text style={styles.metaText}>📍 {item.location}</Text>
            )}

            <View style={styles.cardActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditForm(item)}
              >
                <Text style={styles.editButtonText}>✏️ Anpassen</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Text style={styles.deleteButtonText}>🗑 Entfernen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },

  content: {
    padding: 16,
    paddingTop: 50,
    paddingBottom: 40,
  },

  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  backButtonText: {
    color: "#1F2A37",
    fontSize: 18,
    fontWeight: "690",
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#1F2A37",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 18,
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 16,
    color: "#000000",
  },

  codePreview: {
    marginBottom: 12,
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
  },

  suggestionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  suggestionChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },

  suggestionChipActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },

  suggestionChipText: {
    color: "#1F2A37",
    fontSize: 13,
    fontWeight: "600",
  },

  suggestionChipTextActive: {
    color: "#FFFFFF",
  },

  saveButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  primaryButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  secondaryButton: {
    flex: 1,
    backgroundColor: "#1B2A3A",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    marginBottom: 14,
    color: "#1F2A37",
  },

  resultsText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  codeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF6B00",
    marginBottom: 6,
  },

  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  metaText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },

  cardActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  editButton: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  editButtonText: {
    color: "#374151",
    fontWeight: "700",
  },

  deleteButton: {
    flex: 1,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "690",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 6,
    color: "#1F2A37",
    backgroundColor: "transparent",
  },
});
