import React, { useEffect, useRef } from "react";
import { View } from "react-native";
import QRCode from "react-native-qrcode-svg";

export default function HiddenQrExporter({ value, onReady }) {
  const qrRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (qrRef.current) {
        qrRef.current.toDataURL((data) => {
          onReady && onReady(`data:image/png;base64,${data}`);
        });
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [value, onReady]);

  return (
    <View style={{ position: "absolute", left: -9999, top: -9999 }}>
      <QRCode
        value={value || "leer"}
        size={180}
        getRef={(c) => {
          qrRef.current = c;
        }}
      />
    </View>
  );
}