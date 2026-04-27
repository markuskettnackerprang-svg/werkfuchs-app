import React, { useEffect, useRef, useState } from "react";
import { suggestCategoryFromImage } from "../services/aiCategory";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ItemQrCode from "../components/ItemQrCode";
import inventoryData from "../data/inventoryData";
import { theme } from "../utils/theme";

function getCategoryColor(category) {

  const map = {

    Schrauben: "#D97706",
    Dübel: "#2563EB",
    Elektrik: "#DC2626",
    Werkzeug: "#374151",
    Maschine: "#059669",
    Nägel: "#92400E",
    Beschläge: "#6B7280",
    Sortimentskasten: "#7C3AED",
    Unterlegscheiben: "#047857",
    Holzdübel: "#B45309",
    "Große Box": "#4B5563",

  };

  return map[category] || "#9CA3AF";

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

  };

  return map[category] || "📁";

}
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
const FAVORITE_CATEGORIES = [
  "Schrauben",
  "Dübel",
  "Bohrer",
  "Werkzeug",
  "Maschine",
];
const CATEGORY_COLORS = {
  Schrauben: "#D97706",
  Dübel: "#2563EB",
  Bohrer: "#7C3AED",
  Werkzeug: "#1F2A37",
  Maschine: "#059669",
  Elektrik: "#DC2626",
  Unterlegscheiben: "#0F766E",
  Nägel: "#92400E",
  Holzdübel: "#A16207",
  Beschläge: "#6B7280",
  "Große Box": "#374151",
  Sortimentskasten: "#9333EA",
};
const STORAGE_KEY = "werkfuchs_inventory_v1";

function getCategoryPrefix(category) {
  const clean = (category || "").trim();
  return CATEGORY_PREFIXES[clean] || "X";
}

function getNextCode(items, category) {
  const prefix = getCategoryPrefix(category);

  const numbers = items
    .filter((item) => (item.code || "").startsWith(prefix + "-"))
    .map((item) => {
      const parts = (item.code || "").split("-");
      return parseInt(parts[1], 10);
    })
    .filter((n) => !isNaN(n));

  const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;

  return `${prefix}-${String(nextNumber).padStart(2, "0")}`;
}
function suggestCategoryFromText({ name = "", shortLabel = "", location = "" }) {
  const text = `${name} ${shortLabel} ${location}`.toLowerCase();

  const keywordMap = [
    {
      category: "Elektrik",
      keywords: [
        "wago",
        "kabel",
        "leitung",
        "steckdose",
        "schalter",
        "strom",
        "elektrik",
        "sicherung",
        "verbinder",
        "klemme",
        "klemmen",
        "tester",
        "abisolier",
        "spannung",
      ],
    },
    {
      category: "Schrauben",
      keywords: [
        "schraube",
        "schrauben",
        "spax",
        "torx",
        "kreuzschlitz",
        "senkkopf",
        "holzschraube",
        "blechschraube",
        "gewinde",
      ],
    },
    {
      category: "Bohrer",
      keywords: [
        "bohrer",
        "hss",
        "steinbohrer",
        "holzbohrer",
        "metallbohrer",
        "forstner",
      ],
    },
    {
      category: "Dübel",
      keywords: [
        "dübel",
        "duobel",
        "spreizdübel",
        "nylondübel",
      ],
    },
    {
      category: "Holzdübel",
      keywords: [
        "holzdübel",
        "holz dübel",
        "runddübel",
      ],
    },
    {
      category: "Unterlegscheiben",
      keywords: [
        "unterlegscheibe",
        "unterlegscheiben",
        "scheibe",
        "scheiben",
      ],
    },
    {
      category: "Nägel",
      keywords: [
        "nagel",
        "nägel",
        "drahtstift",
      ],
    },
    {
      category: "Beschläge",
      keywords: [
        "beschlag",
        "beschläge",
        "scharnier",
        "winkel",
        "winkelverbinder",
        "lochplatte",
        "lasche",
        "verbinderplatte",
        "flachverbinder",
      ],
    },
    {
      category: "Werkzeug",
      keywords: [
        "zange",
        "hammer",
        "schraubendreher",
        "maulschlüssel",
        "knarre",
        "werkzeug",
        "messer",
      ],
    },
    {
      category: "Maschine",
      keywords: [
        "maschine",
        "akkuschrauber",
        "bohrmaschine",
        "stichsäge",
        "schleifer",
        "fräse",
      ],
    },
    {
      category: "Sortimentskasten",
      keywords: [
        "sortimentskasten",
        "sortiment",
        "kasten",
        "box",
      ],
    },
  ];

  for (const entry of keywordMap) {
    if (entry.keywords.some((keyword) => text.includes(keyword))) {
      return entry.category;
    }
  }

  return "";
}

function addCategoryPrefixToName(name, category) {
  const cleanName = String(name || "").trim();
  const cleanCategory = String(category || "").trim();

  if (!cleanName || !cleanCategory) return cleanName;

  if (hasCategoryPrefix(cleanName, cleanCategory)) {
    return cleanName;
  }

  return `${cleanCategory} ${cleanName}`;
}
function hasCategoryPrefix(name, category) {
  const n = String(name || "").trim().toLowerCase();
  const c = String(category || "").trim().toLowerCase();

  return n.startsWith(c + " ");
}

function looksLikeSizeOnlyName(name) {
  const n = String(name || "").trim();

  return /^[0-9]+\s*[x×]\s*[0-9]+/.test(n);
}

function findSimilarNameCandidates(items, savedItem) {
  const category = String(savedItem.category || "").trim();
  const name = String(savedItem.name || "").trim();

  if (!category || !name) return [];

  if (!hasCategoryPrefix(name, category)) {
    return [];
  }

  return items.filter((item) => {
    if (item.id === savedItem.id) return false;
    if (item.category !== category) return false;
    if (hasCategoryPrefix(item.name, category)) return false;

    return looksLikeSizeOnlyName(item.name);
  });
}
export default function InventoryScreen({
  scannedCode = "",
  onScannedCodeHandled,
  onGoHome,
  onOpenLabelPreview,
  onOpenScanner,
  startMode = "browse",
  userConfig,
}) {

    const [showEditForm, setShowEditForm] = useState(startMode === "create");
    const isCreateMode = startMode === "create" || showEditForm;
    
function findSimilarNameCandidates(items, savedItem) {
  const category = String(savedItem.category || "").trim();
  const name = String(savedItem.name || "").trim();

  if (!category || !name) return [];

  if (!hasCategoryPrefix(name, category)) {
    return [];
  }

  return items.filter((item) => {
    if (item.id === savedItem.id) return false;
    if (item.category !== category) return false;
    if (hasCategoryPrefix(item.name, category)) return false;

    return looksLikeSizeOnlyName(item.name);
  });
}
  const [searchText, setSearchText] = useState("");
  const [items, setItems] = useState([]);
  const [hasLoadedItems, setHasLoadedItems] = useState(false);
  const listRef = useRef(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showCategories, setShowCategories] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [shortLabel, setShortLabel] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [categoryTouched, setCategoryTouched] = useState(false);
  const [tempImageUri, setTempImageUri] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageBase64, setImageBase64] = useState("");
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiSuggestionText, setAiSuggestionText] = useState("");
  const [aiSuggestedCategory, setAiSuggestedCategory] = useState("");

  const [editingId, setEditingId] = useState(null);
  const userCategories = userConfig?.categories || CATEGORY_SUGGESTIONS;

useEffect(() => {
  async function loadItems() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);

      if (stored) {
        setItems(JSON.parse(stored));
      } else {
        setItems(inventoryData);
      }
    } catch (e) {
      console.log("Laden fehlgeschlagen:", e);
      setItems(inventoryData);
    } finally {
      setHasLoadedItems(true);
    }
  }

  loadItems();
}, []);

useEffect(() => {
  if (!hasLoadedItems) return;

  async function saveItems() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
      );
    } catch (e) {
      console.log("Speichern fehlgeschlagen:", e);
    }
  }

  saveItems();
}, [items, hasLoadedItems]);

  const previewCode = (code || "").trim() || getNextCode(items, category);
  const availableCategories = [
  ...new Set([
    ...userCategories,
    ...items.map((item) => item.category).filter(Boolean),
  ]),
]
   .sort((a, b) => a.localeCompare(b, "de"));

 const filteredItems = items.filter((item) => {
  const q = searchText.toLowerCase().trim();

  const matchesText =
    !q ||
    (item.name || "").toLowerCase().includes(q) ||
    (item.code || "").toLowerCase().includes(q) ||
    (item.category || "").toLowerCase().includes(q) ||
    (item.shortLabel || "").toLowerCase().includes(q) ||
    (item.location || "").toLowerCase().includes(q);

  const matchesCategory =
    !selectedCategory || item.category === selectedCategory;

  return matchesText && matchesCategory;
});
useEffect(() => {
  if (!scannedCode) return;

  setSearchText(scannedCode);
  setSelectedCategory("");

  if (onScannedCodeHandled) {
    onScannedCodeHandled();
  }
}, [scannedCode, onScannedCodeHandled]);

function applyAutoCategory(nextName, nextShortLabel, nextLocation) {
  if (categoryTouched) return;

  const suggestion = suggestCategoryFromText({
    name: nextName,
    shortLabel: nextShortLabel,
    location: nextLocation,
  });

  if (suggestion) {
    setCategory(suggestion);
  }
}

async function handleTakePhoto() {
  try {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Kamera gesperrt", "Bitte Kamera erlauben.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];

    if (!asset?.uri) {
      Alert.alert("Fehler", "Kein Bild empfangen.");
      return;
    }

    setTempImageUri(asset.uri);
    setImageBase64(asset.base64 || "");
    setAiSuggestionText("");
    setAiSuggestedCategory("");
    setShowImagePreview(true);
  } catch (error) {
    Alert.alert("Fehler", "Foto konnte nicht aufgenommen werden.");
    console.log("handleTakePhoto error:", error);
  }
}

function resetForm() {
  setCode("");
  setName("");
  setShortLabel("");
  setCategory("");
  setLocation("");
  setImageUri("");
  setTempImageUri(null);
  setShowImagePreview(false);
  setCategoryTouched(false);
  setEditingId(null);
  setAiSuggestedCategory("");
  setShowEditForm(startMode === "create");
}

function handleUsePreviewImage() {
  if (!tempImageUri) return;

  setImageUri(tempImageUri);
  setTempImageUri(null);
  setShowImagePreview(false);
}

async function handleRetakeImage() {
  setTempImageUri(null);
  setShowImagePreview(false);
  await handlePickImage();
}
async function handleAnalyzePreviewImage() {
  try {
    if (!imageBase64) {
      Alert.alert("Fehler", "Kein Bild für die Analyse vorhanden.");
      return;
    }

    setIsAnalyzingImage(true);
    setAiSuggestionText("");
    setAiSuggestedCategory("");

    const result = await suggestCategoryFromImage(imageBase64);
    //Alert.alert("KI Ergebnis", JSON.stringify(result, null, 2));

    if (result.category) {
      if (!categoryTouched) {
        setCategory(result.category);
      }

      setAiSuggestionText(
        `🦊 KI-Vorschlag: ${result.category} (${result.confidence})`
      );

      Alert.alert(
        "Kategorie erkannt",
        result.reason
          ? `${result.category}\n\nBegründung: ${result.reason}`
          : result.category
      );
      return;
    }

    if (result.suggestedCategory) {
      setAiSuggestedCategory(result.suggestedCategory);
      setAiSuggestionText(
        `🦊 Neue Kategorie vorgeschlagen: ${result.suggestedCategory} (${result.confidence})`
      );

      Alert.alert(
        "Neue Kategorie vorgeschlagen",
        result.reason
          ? `${result.suggestedCategory}\n\nBegründung: ${result.reason}`
          : result.suggestedCategory
      );
      return;
    }

    Alert.alert("KI", "Es konnte keine Kategorie vorgeschlagen werden.");
} catch (error) {
  console.log("handleAnalyzePreviewImage error:", error);

  Alert.alert(
    "KI-Fehler Debug",
    error?.message
      ? error.message
      : JSON.stringify(error, null, 2)
  );
} finally {
  setIsAnalyzingImage(false);
}
}
  function handleSave() {
    const finalName = (name || "").trim();
    const finalCategory = (category || "").trim();
    const finalCode = (code || "").trim();
    const finalShortLabel = (shortLabel || "").trim();
    const finalLocation = (location || "").trim();

    if (finalName.length === 0) {
      Alert.alert("Fehlt noch", "Bitte Name eingeben.");
      return;
    }

    if (finalCategory.length === 0) {
      Alert.alert("Fast geschafft", "Kategorie fehlt noch.");
      return;
    }

    const newOrUpdatedItem = {
      id: editingId || Date.now().toString(),
      code: finalCode || getNextCode(items, finalCategory),
      name: finalName,
      shortLabel: finalShortLabel,
      category: finalCategory,
      location: finalLocation,
      imageUri: imageUri,
    };

    const similarNameCandidates = findSimilarNameCandidates(items, newOrUpdatedItem);
    const similarIds = similarNameCandidates.map((item) => item.id);

if (editingId) {
  setItems((prev) =>
    prev.map((item) => (item.id === editingId ? newOrUpdatedItem : item))
  );
} else {
  setItems((prev) => [newOrUpdatedItem, ...prev]);
}

if (similarNameCandidates.length > 0) {
  Alert.alert(
    "Ähnliche Einträge gefunden",
    `${newOrUpdatedItem.category} bei ${similarNameCandidates.length} ähnlichen Einträgen ergänzen?`,
    [
      {
        text: "Nein",
        style: "cancel",
      },
      {
        text: "Ja",
        onPress: () => {
          setItems((prev) =>
            prev.map((item) =>
              similarIds.includes(item.id)
                ? {
                    ...item,
                    name: addCategoryPrefixToName(
                      item.name,
                      newOrUpdatedItem.category
                    ),
                  }
                : item
            )
          );
        },
      },
    ]
  );
} else {
  Alert.alert(
    editingId ? "Gespeichert" : "Artikel angelegt",
    editingId ? "Änderung übernommen 👍" : "Der Fuchs dankt Dir 🔧"
  );
}

    resetForm();
    setSearchText("");
  }

async function handlePickImage() {
  try {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Galerie gesperrt",
        "Bitte Zugriff auf Fotos erlauben."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];

    if (!asset?.uri) {
      Alert.alert("Fehler", "Kein Bild empfangen.");
      return;
    }

    setTempImageUri(asset.uri);
    setImageBase64(asset.base64 || "");
    setAiSuggestionText("");
    setAiSuggestedCategory("");
    setShowImagePreview(true);
  } catch (error) {
    Alert.alert("Fehler", "Bild konnte nicht geladen werden.");
    console.log("handlePickImage error:", error);
  }
}

function handleEdit(item) {
  setShowEditForm(true);
  listRef.current?.scrollToOffset({ offset: 0, animated: true });

  setEditingId(item.id);
  setCode(item.code || "");
  setName(item.name || "");
  setShortLabel(item.shortLabel || "");
  setCategory(item.category || "");
  setLocation(item.location || "");
  setImageUri(item.imageUri || "");
  setCategoryTouched(true);
}

  function handleDelete(id) {
    setItems((prev) => prev.filter((item) => item.id !== id));

    if (editingId === id) {
      resetForm();
    }
  }
function handleResetAll() {
  Alert.alert(
    "⚠️ Komplett zurücksetzen",
    "ALLE Daten werden gelöscht.\n\nOnboarding + Inventar.\n\nDas kann nicht rückgängig gemacht werden.",
    [
      {
        text: "Abbrechen",
        style: "cancel",
      },
      {
        text: "Weiter",
        style: "destructive",
        onPress: confirmReset,
      },
    ]
  );
}

function confirmReset() {
  Alert.alert(
    "Sicher?",
    "Wirklich alles löschen?",
    [
      {
        text: "Nein",
        style: "cancel",
      },
      {
        text: "JA, LÖSCHEN",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("werkfuchs_inventory_v1");
            await AsyncStorage.removeItem("userConfig");

            setItems([]);

            Alert.alert(
              "Erledigt",
              "App startet neu"
            );

            // einfacher Restart
            setTimeout(() => {
              setItems([]);
            }, 300);

          } catch (e) {
            Alert.alert("Fehler", "Reset fehlgeschlagen");
          }
        },
      },
    ]
  );
}

const renderItem = ({ item }) => (
  <View style={styles.card}>

    <View style={styles.cardTopRow}>

      {/* LINKE SPALTE */}
      <View style={styles.cardInfo}>

        <Text style={styles.codeText}>
          {item.code}
        </Text>

        <Text style={styles.nameText}>
          {item.shortLabel || item.name}
        </Text>

        {!!item.location && (
          <Text style={styles.locationText}>
            📍 {item.location}
          </Text>
        )}

        {!!item.category && (
          <View
            style={[
              styles.categoryBadge,
              {
                borderColor: getCategoryColor(item.category),
                backgroundColor:
                  getCategoryColor(item.category) + "20",
              },
            ]}
          >
            <Text
              style={[
                styles.categoryBadgeText,
                {
                  color: getCategoryColor(item.category),
                },
              ]}
            >
              {getCategoryIcon(item.category)} {item.category}
            </Text>
          </View>
        )}

      </View>


      {/* RECHTE SPALTE */}
      <View style={styles.cardRightColumn}>

        {!!item.code && (
          <View style={styles.qrWrap}>
            <ItemQrCode value={item.code} size={56} />
          </View>
        )}

        <View style={styles.itemImageWrap}>

          {item.imageUri ? (

            <Image
              source={{ uri: item.imageUri }}
              style={styles.itemImage}
            />

          ) : (

            <View style={styles.itemImagePlaceholder}>
              <Text style={styles.itemImagePlaceholderText}>
                Kein Foto
              </Text>
            </View>

          )}

        </View>

      </View>

    </View>


    {/* BUTTONS */}
    <View style={styles.cardActions}>

      <TouchableOpacity
        style={[
          styles.actionButtonWide,
          styles.editButtonLight
        ]}
        onPress={() => handleEdit(item)}
      >
        <Text style={styles.editButtonLightText}>
          ✏️ Anpassen
        </Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[
          styles.actionButtonWide,
          styles.deleteButtonStrong
        ]}
        onPress={() => handleDelete(item.id)}
      >
        <Text style={styles.actionButtonText}>
          🗑 Entfernen
        </Text>
      </TouchableOpacity>

    </View>

  </View>
);

const renderHeader = () => (
  <>
    <TouchableOpacity style={styles.backButton} onPress={onGoHome}>
      <Text style={styles.backButtonText}>← Zurück</Text>
    </TouchableOpacity>

    <Text style={styles.screenTitle}>
      {isCreateMode ? "Neuer Fund" : "Inventar"}
    </Text>

    {!isCreateMode && (
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetAll}
      >
        <Text style={styles.resetButtonText}>
          🧨 Komplett zurücksetzen
        </Text>
      </TouchableOpacity>
    )}

    <Text style={styles.subtitleSmall}>
      Der schlaue Fuchs behält den Überblick. 🦊
    </Text>

    {isCreateMode && (
      <>
        <Text style={styles.sectionTitle}>
          {editingId ? "Fund bearbeiten" : "Neuer Fund"}
        </Text>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Code"
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

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              applyAutoCategory(text, shortLabel, location);
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Kurzbezeichnung"
            value={shortLabel}
            onChangeText={(text) => {
              setShortLabel(text);
              applyAutoCategory(name, text, location);
            }}
          />

          <TextInput
            style={styles.input}
            placeholder="Kategorie"
            value={category}
            onChangeText={(text) => {
              setCategoryTouched(true);
              setCategory(text);
            }}
          />

          <View style={styles.suggestionWrap}>
            {userCategories.filter((item) =>
              item.toLowerCase().includes((category || "").toLowerCase())
            ).map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.suggestionChip,
                  category === item && styles.suggestionChipActive,
                ]}
                onPress={() => {
                  setCategoryTouched(true);
                  setCategory(item);
                }}
              >
                <Text
                  style={[
                    styles.suggestionChipText,
                    category === item && styles.suggestionChipTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Standort"
            value={location}
            onChangeText={(text) => {
              setLocation(text);
              applyAutoCategory(name, shortLabel, text);
            }}
          />

            <TouchableOpacity
              style={styles.photoButton}
              onPress={handleTakePhoto}
            >
              <Text style={styles.photoButtonText}>
                📸 Fund aufnehmen
              </Text>
            </TouchableOpacity>

          <TouchableOpacity
            style={styles.photoButton}
            onPress={handlePickImage}
          >
            <Text style={styles.photoButtonText}>
              🖼️ Aus Galerie wählen
            </Text>
          </TouchableOpacity>
          
    {showImagePreview && tempImageUri ? (
      <View style={styles.previewOverlay}>
        <Text style={styles.previewTitle}>🦊 Fund prüfen</Text>

        <Image
          source={{ uri: tempImageUri }}
          style={styles.previewImage}
        />
        <TouchableOpacity
          style={styles.aiAnalyzeButton}
          onPress={handleAnalyzePreviewImage}
          disabled={isAnalyzingImage}
        >
          <Text style={styles.aiAnalyzeButtonText}>
            {isAnalyzingImage ? "🦊 Analysiere..." : "🦊 Kategorie per KI erkennen"}
          </Text>
        </TouchableOpacity>

        {!!aiSuggestionText && (
          <Text style={styles.aiSuggestionText}>{aiSuggestionText}</Text>
        )}
{!!aiSuggestedCategory && (
  <TouchableOpacity
    style={styles.aiUseSuggestedCategoryButton}
    onPress={() => {
      setCategoryTouched(true);
      setCategory(aiSuggestedCategory);
      setAiSuggestedCategory("");
    }}
  >
    <Text style={styles.aiUseSuggestedCategoryButtonText}>
      🦊 Neue Kategorie übernehmen: {aiSuggestedCategory}
    </Text>
  </TouchableOpacity>
)}

    )}
        <View style={styles.previewButtons}>
          <TouchableOpacity
            style={styles.previewCancel}
            onPress={handleRetakeImage}
          >
            <Text style={styles.previewCancelText}>🔄 Neu fotografieren</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.previewConfirm}
            onPress={handleUsePreviewImage}
          >
        <Text style={styles.previewConfirmText}>✅ Verwenden</Text>
      </TouchableOpacity>
    </View>
  </View>
) : null}

          <View style={styles.formButtons}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>
                {editingId ? "Änderungen speichern" : "Artikel anlegen"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={resetForm}>
              <Text style={styles.cancelButtonText}>Zurücksetzen</Text>
            </TouchableOpacity>
          </View>
        </View>
      </>
    )}
{!isCreateMode && (
  <View style={styles.topActionRow}>
    <TouchableOpacity
      style={styles.printButtonHalf}
      onPress={onOpenLabelPreview}
    >
      <Text style={styles.printButtonText}>🖨 Etiketten</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.scanButtonHalf}
      onPress={onOpenScanner}
    >
      <Text style={styles.scanButtonText}>📷 Scanner</Text>
    </TouchableOpacity>
  </View>
)}
    {!isCreateMode && (
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInputLarge}
          placeholder="Fund suchen..."
          value={searchText}
          onChangeText={setSearchText}
        />

      {!!searchText && (
        <TouchableOpacity
          style={styles.searchClearButton}
          onPress={() => setSearchText("")}
        >
      <Text style={styles.searchClearText}>×</Text>
    </TouchableOpacity>
  )}
</View>
    )}
{!isCreateMode && (
  <>
    <TouchableOpacity
      style={styles.categoryToggle}
      onPress={() => setShowCategories((prev) => !prev)}
    >
      <Text style={styles.categoryHeadline}>
        Kategorien {showCategories ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showCategories && (
      <View style={styles.filterWrap}>
        <TouchableOpacity
          style={[
            styles.categoryFilterChip,
            {
              borderColor: !selectedCategory ? "#1B2A3A" : "#9ca3af",
              backgroundColor: !selectedCategory ? "#1B2A3A" : "#FFFFFF",
            },
          ]}
          onPress={() => setSelectedCategory("")}
        >
          <Text
            style={[
              styles.categoryFilterText,
              { color: !selectedCategory ? "#FFFFFF" : "#374151" },
            ]}
          >
            📚 Alle
          </Text>
        </TouchableOpacity>

        {availableCategories.map((cat) => {
          const isActive = selectedCategory === cat;
          const chipColor = getCategoryColor(cat);

          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryFilterChip,
                {
                  borderColor: chipColor,
                  backgroundColor: isActive ? chipColor : "#FFFFFF",
                },
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  { color: isActive ? "#FFFFFF" : chipColor },
                ]}
              >
                {getCategoryIcon(cat)} {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    )}
  </>
)}

{!isCreateMode && (
  <Text style={styles.resultsText}>
    {filteredItems.length} Funde
  </Text>
)}
  </>
);

{!isCreateMode && (
  <TouchableOpacity
    style={styles.resetButton}
    onPress={handleResetAll}
  >
    <Text style={styles.resetButtonText}>
      🧨 Alles zurücksetzen (Test)
    </Text>
  </TouchableOpacity>
)}

return (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <FlatList
        ref={listRef}
        data={isCreateMode ? [] : filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader()}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 16,
    paddingTop: 50,
  },

  listContent: {
    paddingBottom: 30,
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
    fontWeight: "700",
  },

  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    color: "#1F2A37",
    marginBottom: 4,
  },

  subtitleSmall: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },

   topActionRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },

  printButtonHalf: {
    flex: 1,
    backgroundColor: "#FF6B00",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  scanButtonHalf: {
    flex: 1,
    backgroundColor: "#1B2A3A",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  printButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  scanButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1F2A37",
  },

  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
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
    color: "#1F2A37",
  },

  codePreview: {
    marginTop: 2,
    marginBottom: 12,
    fontSize: 13,
    color: "#6B7280",
    fontStyle: "italic",
  },

  suggestionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: -2,
    marginBottom: 12,
  },

  suggestionChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignSelf: "flex-start",
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

  photoButton: {
    backgroundColor: "#1B2A3A",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  photoButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 15,
  },

  formButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },

  saveButton: {
    flex: 1,
    backgroundColor: "#FF6B00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  cancelButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  cancelButtonText: {
    color: "#1F2A37",
    fontWeight: "700",
    fontSize: 15,
  },

  searchInputLarge: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 18,
    marginBottom: 18,
    color: "#1F2A37",
  },

  categoryHeadline: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2A37",
  },

  filterWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },

  categoryFilterChip: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },

  categoryFilterText: {
    fontSize: 13,
    fontWeight: "700",
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

  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },

  cardInfo: {
    flex: 1,
    paddingRight: 8,
    justifyContent: "space-between",
  },

  codeText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FF6B00",
    letterSpacing: 0.5,
    marginBottom: 6,
  },

  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  locationText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 10,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#EFF6FF",
  },

  categoryBadgeText: {
  fontWeight: "700",
  fontSize: 13,
  },

  qrWrap: {
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.85,
  },

  itemImageWrap: {
    width: 96,
    height: 96,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  itemImage: {
    width: "100%",
    height: "100%",
  },

  itemImagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 6,
  },

  itemImagePlaceholderText: {
    color: "#9CA3AF",
    fontSize: 11,
    textAlign: "center",
    fontWeight: "600",
  },

  cardActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },

  actionButtonWide: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  editButtonLight: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  editButtonLightText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 16,
  },

  deleteButtonStrong: {
    backgroundColor: "#DC2626",
  },

  actionButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  cardRightColumn: {
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  previewOverlay: {
  marginTop: 12,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  padding: 12,
  borderWidth: 1,
  borderColor: "#D0D5DD",
},

previewTitle: {
  fontSize: 16,
  fontWeight: "700",
  marginBottom: 10,
  textAlign: "center",
  color: "#1F2A37",
},

previewImage: {
  width: "100%",
  height: 200,
  borderRadius: 10,
  marginBottom: 12,
},

previewButtons: {
  flexDirection: "row",
  gap: 10,
},

previewCancel: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#D0D5DD",
  borderRadius: 10,
  paddingVertical: 12,
  alignItems: "center",
},

previewCancelText: {
  fontWeight: "600",
  color: "#1F2A37",
},

previewConfirm: {
  flex: 1,
  backgroundColor: "#FF6B00",
  borderRadius: 10,
  paddingVertical: 12,
  alignItems: "center",
},

previewConfirmText: {
  color: "#FFFFFF",
  fontWeight: "700",
},

aiUseSuggestedCategoryButton: {
  backgroundColor: "#1F2A37",
  borderRadius: 10,
  paddingVertical: 12,
  alignItems: "center",
  marginBottom: 12,
},

aiUseSuggestedCategoryButtonText: {
  color: "#FFFFFF",
  fontWeight: "700",
  textAlign: "center",
  paddingHorizontal: 10,
},

aiAnalyzeButton: {
  backgroundColor: "#FF6B00",
  borderRadius: 10,
  paddingVertical: 12,
  alignItems: "center",
  marginBottom: 10,
},

aiAnalyzeButtonText: {
  color: "#FFFFFF",
  fontWeight: "700",
  textAlign: "center",
},

aiSuggestionText: {
  color: "#1F2A37",
  fontSize: 14,
  fontWeight: "600",
  marginBottom: 10,
  textAlign: "center",
},

searchBox: {
  position: "relative",
  marginBottom: 18,
},

searchClearButton: {
  position: "absolute",
  right: 14,
  top: 13,
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: "#E5E7EB",
  alignItems: "center",
  justifyContent: "center",
},

searchClearText: {
  fontSize: 20,
  color: "#6B7280",
  fontWeight: "700",
  lineHeight: 22,
},

categoryToggle: {
  marginBottom: 12,
},

resetButton: {
  backgroundColor: "#FEE2E2",
  borderRadius: 14,
  paddingVertical: 10,
  paddingHorizontal: 14,
  alignSelf: "center",
  marginTop: 10,
  marginBottom: 10,
},

resetButtonText: {
  color: "#DC2626",
  fontWeight: "800",
  fontSize: 13,
},
});