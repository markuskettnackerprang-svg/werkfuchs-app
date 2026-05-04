import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../services/supabaseClient";

export default function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    async function loadSavedEmail() {
      try {
        const savedEmail = await AsyncStorage.getItem("savedEmail");
        if (savedEmail) {
          setEmail(savedEmail);
        }
      } catch (error) {
        console.log("Gespeicherte E-Mail konnte nicht geladen werden:", error);
      }
    }

    loadSavedEmail();
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Fehlt noch", "Bitte E-Mail und Passwort eingeben.");
      return;
    }

    const cleanEmail = email.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      Alert.alert("Login fehlgeschlagen", error.message);
      return;
    }

    await AsyncStorage.setItem("savedEmail", cleanEmail);
    onLogin?.(data.session);
  }

  async function handleSignup() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Fehlt noch", "Bitte E-Mail und Passwort eingeben.");
      return;
    }

    const cleanEmail = email.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
    });

    if (error) {
      Alert.alert("Registrierung fehlgeschlagen", error.message);
      return;
    }

    await AsyncStorage.setItem("savedEmail", cleanEmail);

    Alert.alert("Registriert", "Bitte prüfe ggf. deine E-Mails.");
    onLogin?.(data.session);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WerkFuchs Login</Text>

      <TextInput
        style={styles.input}
        placeholder="E-Mail"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Passwort"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleSignup}>
        <Text style={styles.buttonText}>Account erstellen</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
    color: "#1F2A37",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    color: "#000",
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: "#FF6B00",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: "#1B2A3A",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});