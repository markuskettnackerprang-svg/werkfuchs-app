import React from "react";
import QRCode from "react-native-qrcode-svg";

export default function ItemQrCode({ value, size = 100 }) {
  return (
    <QRCode
      value={value || "leer"}
      size={size}
      logo={require("../assets/logo.png")}
      logoSize={22}
      logoBackgroundColor="transparent"
      ecl="H"
    />
  );
}