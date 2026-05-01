import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { buildLabelsHtml } from "../utils/buildLabelsHtml";
import { printLabels, exportLabelsPdf } from "../services/printLabels";
import ItemQrCode from "../components/ItemQrCode";
import HiddenQrExporter from "../components/HiddenQrExporter";

export default function LabelPreviewScreen({ items = [], onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [qrMap, setQrMap] = useState({});
  const [pendingCode, setPendingCode] = useState(null);
  const [layoutKey, setLayoutKey] = useState("labels_24");
  const [showQrPreview, setShowQrPreview] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const codes = useMemo(() => {
    return [...new Set(items.map((item) => item.code).filter(Boolean))];
  }, [items]);

  const categories = useMemo(() => {
    return [...new Set(items.map((item) => item.category).filter(Boolean))];
  }, [items]);

  const categoryFilteredItems = useMemo(() => {
    let result = items;

    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    return result;
  }, [items, selectedCategory]);

  const printItems = useMemo(() => {
    if (selectedIds.length === 0) {
      return categoryFilteredItems;
    }

    return categoryFilteredItems.filter((item) =>
      selectedIds.includes(item.id)
    );
  }, [categoryFilteredItems, selectedIds]);

  const html = useMemo(() => {
    return buildLabelsHtml(printItems, { qrMap, layoutKey });
  }, [printItems, qrMap, layoutKey]);

  useEffect(() => {
    const nextCode = codes.find((code) => !qrMap[code]);
    setPendingCode(nextCode || null);
  }, [codes, qrMap]);

  useEffect(() => {
    setSelectedIds([]);
  }, [selectedCategory]);

  async function handlePrint() {
    try {
      setIsLoading(true);
      await printLabels(html);
    } catch (error) {
      Alert.alert("Fehler", "Drucken konnte nicht gestartet werden.");
      console.log("print error", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleExportPdf() {
    try {
      setIsLoading(true);
      const uri = await exportLabelsPdf(html);
      Alert.alert("PDF erstellt", uri);
    } catch (error) {
      Alert.alert("Fehler", "PDF konnte nicht erstellt werden.");
      console.log("pdf error", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {pendingCode ? (
        <HiddenQrExporter
          value={pendingCode}
          onReady={(dataUri) => {
            setQrMap((prev) => ({
              ...prev,
              [pendingCode]: dataUri,
            }));
          }}
        />
      ) : null}

      <TouchableOpacity style={styles.backButtonTop} onPress={onBack}>
        <Text style={styles.backButtonTopText}>← Zurück</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Etikettenvorschau</Text>

      <View style={styles.topButtonRow}>
        <TouchableOpacity style={styles.buttonPrimary} onPress={handlePrint}>
          <Text style={styles.buttonTextPrimary}>
            {isLoading ? "Bitte warten..." : "Drucken"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.buttonPdf} onPress={handleExportPdf}>
          <Text style={styles.buttonTextPrimary}>
            {isLoading ? "Bitte warten..." : "PDF"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.layoutSelector}>
        <TouchableOpacity
          style={[
            styles.layoutButton,
            layoutKey === "labels_12" && styles.layoutButtonActive,
          ]}
          onPress={() => setLayoutKey("labels_12")}
        >
          <Text
            style={[
              styles.layoutButtonText,
              layoutKey === "labels_12" && styles.layoutButtonTextActive,
            ]}
          >
            2×6 · 12
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.layoutButton,
            layoutKey === "labels_24" && styles.layoutButtonActive,
          ]}
          onPress={() => setLayoutKey("labels_24")}
        >
          <Text
            style={[
              styles.layoutButtonText,
              layoutKey === "labels_24" && styles.layoutButtonTextActive,
            ]}
          >
            3×8 · 24
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.layoutButton,
            layoutKey === "labels_40" && styles.layoutButtonActive,
          ]}
          onPress={() => setLayoutKey("labels_40")}
        >
          <Text
            style={[
              styles.layoutButtonText,
              layoutKey === "labels_40" && styles.layoutButtonTextActive,
            ]}
          >
            4×10 · 40
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.categoryRow}>
        <TouchableOpacity
          style={[
            styles.categoryChip,
            !selectedCategory && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory("")}
        >
          <Text
            style={[
              styles.categoryChipText,
              !selectedCategory && styles.categoryChipTextActive,
            ]}
          >
            Alle
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryChip,
              selectedCategory === cat && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedCategory === cat && styles.categoryChipTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.selectionInfo}>
        {selectedIds.length === 0
          ? `${categoryFilteredItems.length} Etiketten`
          : `${selectedIds.length} ausgewählt`}
      </Text>

      <TouchableOpacity
        style={styles.toggleQrButton}
        onPress={() => setShowQrPreview((prev) => !prev)}
      >
        <Text style={styles.toggleQrButtonText}>
          {showQrPreview ? "Zur Etikettenvorschau" : "Zur QR-Auswahl"}
        </Text>
      </TouchableOpacity>

            {showQrPreview ? (
        <View style={styles.qrPreviewArea}>
          <Text style={styles.qrPreviewTitle}>QR-Vorschau</Text>

          <ScrollView
            style={styles.qrScrollView}
            contentContainerStyle={styles.qrScrollContent}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            <View style={styles.qrGrid}>
              {categoryFilteredItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.qrCard,
                    selectedIds.includes(item.id) && styles.qrCardActive,
                  ]}
                  onPress={() => {
                    setSelectedIds((prev) => {
                      if (prev.includes(item.id)) {
                        return prev.filter((id) => id !== item.id);
                      }
                      return [...prev, item.id];
                    });
                  }}
                >
                  <View style={styles.checkbox}>
                    <Text style={styles.checkboxText}>
                      {selectedIds.includes(item.id) ? "✓" : ""}
                    </Text>
                  </View>

                  <ItemQrCode value={item.code} size={96} />

                  <Text style={styles.qrCodeText}>{item.code}</Text>
                  <Text style={styles.qrNameText}>
                    {item.shortLabel || item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      ) : (
        Platform.OS === "web" && (
          <View style={styles.previewWrapper}>
            <iframe
              title="Etikettenvorschau"
              srcDoc={html}
              style={styles.iframe}
            />
          </View>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E6E6E6",
    padding: 16,
  },

  backButtonTop: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
  },

  backButtonTopText: {
    color: "#1F2A37",
    fontSize: 16,
    fontWeight: "700",
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
    color: "#1F2A37",
  },

  topButtonRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  buttonPrimary: {
    flex: 1,
    backgroundColor: "#FF6B00",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPdf: {
    flex: 1,
    backgroundColor: "#1F2A37",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonTextPrimary: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },

  layoutSelector: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  layoutButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  layoutButtonActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },

  layoutButtonText: {
    color: "#1F2A37",
    fontWeight: "700",
    fontSize: 15,
  },

  layoutButtonTextActive: {
    color: "#FFFFFF",
  },

  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },

  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    backgroundColor: "#FFFFFF",
  },

  categoryChipActive: {
    backgroundColor: "#FF6B00",
    borderColor: "#FF6B00",
  },

  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2A37",
  },

  categoryChipTextActive: {
    color: "#FFFFFF",
  },

  selectionInfo: {
    fontSize: 13,
    marginBottom: 10,
    color: "#6B7280",
  },

  toggleQrButton: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  toggleQrButtonText: {
    color: "#1F2A37",
    fontSize: 14,
    fontWeight: "600",
  },

  previewWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    marginBottom: 16,
    flex: 1,
    minHeight: 400,
    overflow: "hidden",
  },

  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
    backgroundColor: "#FFFFFF",
  },

// webview: {
//   flex: 1,
//   backgroundColor: "#E5E7EB",
// },

  qrPreviewArea: {
    marginBottom: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 12,
    maxHeight: 520,
  },

  qrPreviewTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#1F2A37",
  },

  qrScrollView: {
    maxHeight: 430,
  },

  qrScrollContent: {
    paddingBottom: 8,
  },

  qrGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  qrCard: {
    width: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    position: "relative",
  },

  qrCardActive: {
    borderColor: "#FF6B00",
    borderWidth: 2,
    backgroundColor: "#FFF7ED",
  },

  checkbox: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#FF6B00",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },

  checkboxText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 18,
  },

  qrCodeText: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2A37",
    textAlign: "center",
  },

  qrNameText: {
    marginTop: 6,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
  },
});