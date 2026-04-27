import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";

const GOOD_OPTIONS = [
  "Übersicht",
  "Suche",
  "KI-Erkennung",
  "QR-Scanner",
  "Etiketten",
  "Bedienung",
];

const PROBLEM_OPTIONS = [
  "Zu kompliziert",
  "Zu viele Klicks",
  "KI falsch",
  "Suche unklar",
  "Design unklar",
  "Funktion fehlt",
];

const NEXT_OPTIONS = [
  "Box-Erkennung",
  "Bessere KI",
  "Bessere Etiketten",
  "Bessere Suche",
  "Backup/Export",
];

export default function FeedbackScreen({ onBack }) {
  const [rating, setRating] = useState(0);
  const [good, setGood] = useState([]);
  const [problems, setProblems] = useState([]);
  const [nextFeature, setNextFeature] = useState("");
  const [comment, setComment] = useState("");

  function toggleValue(value, list, setList) {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  }

 async function handleSubmitFeedback() {
  try {
    const feedback = {
      rating,
      good,
      problems,
      nextFeature,
      comment,
    };

    const response = await fetch(
      "https://werkfuchs-api.vercel.app/api/send-feedback",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(feedback),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Fehler beim Senden");
    }

    Alert.alert("Danke 🦊", "Feedback wurde gesendet!");

    // Reset
    setRating(0);
    setGood([]);
    setProblems([]);
    setNextFeature("");
    setComment("");

  } catch (error) {
    console.log("Feedback Fehler:", error);

    Alert.alert(
      "Fehler",
      error?.message || "Feedback konnte nicht gesendet werden"
    );
  }
}

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Text style={styles.backButtonText}>← Zurück</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Feedback</Text>

      <Text style={styles.subtitle}>
        Hilf dem Fuchs besser zu werden. Kurz klicken reicht. 🦊
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Wie findest du die App aktuell?</Text>

        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={styles.star}>{star <= rating ? "★" : "☆"}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Was funktioniert gut?</Text>

        <View style={styles.chipWrap}>
          {GOOD_OPTIONS.map((item) => {
            const active = good.includes(item);

            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleValue(item, good, setGood)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  👍 {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Was stört oder fehlt?</Text>

        <View style={styles.chipWrap}>
          {PROBLEM_OPTIONS.map((item) => {
            const active = problems.includes(item);

            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, active && styles.problemChipActive]}
                onPress={() => toggleValue(item, problems, setProblems)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  ⚠️ {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Was soll als Nächstes kommen?</Text>

        <View style={styles.chipWrap}>
          {NEXT_OPTIONS.map((item) => {
            const active = nextFeature === item;

            return (
              <TouchableOpacity
                key={item}
                style={[styles.chip, active && styles.nextChipActive]}
                onPress={() => setNextFeature(item)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  🚀 {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Kommentar</Text>

        <TextInput
          style={styles.commentInput}
          placeholder="Was sollen wir verbessern?"
          value={comment}
          onChangeText={setComment}
          multiline
        />
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmitFeedback}
      >
        <Text style={styles.submitButtonText}>Feedback speichern</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F4F6",
    padding: 20,
    paddingTop: 50,
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

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1F2A37",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 22,
    lineHeight: 21,
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
    fontSize: 16,
    fontWeight: "800",
    color: "#1F2A37",
    marginBottom: 12,
  },

  starRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },

  star: {
    fontSize: 38,
    color: "#FF6B00",
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

  problemChipActive: {
    backgroundColor: "#DC2626",
    borderColor: "#DC2626",
  },

  nextChipActive: {
    backgroundColor: "#1B2A3A",
    borderColor: "#1B2A3A",
  },

  chipText: {
    color: "#374151",
    fontWeight: "700",
    fontSize: 13,
  },

  chipTextActive: {
    color: "#FFFFFF",
  },

  commentInput: {
    minHeight: 90,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    padding: 12,
    fontSize: 15,
    color: "#1F2A37",
    textAlignVertical: "top",
  },

  submitButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 30,
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});