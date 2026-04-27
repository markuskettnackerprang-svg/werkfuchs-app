const inventoryData = [
{ id: "1", code: "W-30-01", name: "Dübel 8x65 mm lang", shortLabel: "Dübel 8x65", category: "Dübel", location: "Materialwand" },
{ id: "2", code: "W-30-02", name: "Dübel 8 mm", shortLabel: "Dübel 8", category: "Dübel", location: "Materialwand" },
{ id: "3", code: "W-30-03", name: "Dübel 10 mm", shortLabel: "Dübel 10", category: "Dübel", location: "Materialwand" },
{ id: "4", code: "W-30-04", name: "Dübel < 10 mm", shortLabel: "Dübel <10", category: "Dübel", location: "Materialwand" },
{ id: "5", code: "W-30-05", name: "Hohlraumdübel 6/9 mm", shortLabel: "Hohlraumdübel", category: "Dübel", location: "Materialwand" },

{ id: "6", code: "W-40-01", name: "Bohrer >= 4 mm", shortLabel: "Bohrer >=4", category: "Bohrer", location: "Materialwand" },
{ id: "7", code: "W-40-02", name: "Bohrer 5 mm", shortLabel: "Bohrer 5", category: "Bohrer", location: "Materialwand" },
{ id: "8", code: "W-40-03", name: "Bohrer 6 mm", shortLabel: "Bohrer 6", category: "Bohrer", location: "Materialwand" },
{ id: "9", code: "W-40-04", name: "Bohrer 8 mm", shortLabel: "Bohrer 8", category: "Bohrer", location: "Materialwand" },
{ id: "10", code: "W-40-05", name: "Bohrer 12 mm", shortLabel: "Bohrer 12", category: "Bohrer", location: "Materialwand" },
{ id: "11", code: "W-40-06", name: "Bohrer 10 mm", shortLabel: "Bohrer 10", category: "Bohrer", location: "Materialwand" },

{ id: "12", code: "W-10-01", name: "Schrauben 4x69 mm", shortLabel: "4x69", category: "Schrauben", location: "Materialwand" },
{ id: "13", code: "W-10-02", name: "Schrauben 4x60 mm", shortLabel: "4x60", category: "Schrauben", location: "Materialwand" },
{ id: "14", code: "W-10-03", name: "Schrauben 4x50 mm", shortLabel: "4x50", category: "Schrauben", location: "Materialwand" },
{ id: "15", code: "W-10-04", name: "Schrauben 4x40 mm", shortLabel: "4x40", category: "Schrauben", location: "Materialwand" },
{ id: "16", code: "W-10-05", name: "Schrauben 4x35 mm", shortLabel: "4x35", category: "Schrauben", location: "Materialwand" },
{ id: "17", code: "W-10-06", name: "Schrauben 4x20 mm", shortLabel: "4x20", category: "Schrauben", location: "Materialwand" },

{ id: "18", code: "W-60-01", name: "Unterlegscheiben 24 mm", shortLabel: "24 mm", category: "Unterlegscheiben", location: "Materialwand" },
{ id: "19", code: "W-60-02", name: "Unterlegscheiben 10 mm", shortLabel: "10 mm", category: "Unterlegscheiben", location: "Materialwand" },
{ id: "20", code: "W-60-03", name: "Unterlegscheiben Gummi / gemischt", shortLabel: "Gummi", category: "Unterlegscheiben", location: "Materialwand" },

{ id: "21", code: "W-50-01", name: "Nägel 220 mm", shortLabel: "220 mm", category: "Nägel", location: "Materialwand" },
{ id: "22", code: "W-50-02", name: "Rundkopfstifte 20 mm", shortLabel: "20 mm", category: "Nägel", location: "Materialwand" },
{ id: "23", code: "W-50-03", name: "Nägel 55 mm", shortLabel: "55 mm", category: "Nägel", location: "Materialwand" },

{ id: "24", code: "W-35-01", name: "Holzdübel 12 mm", shortLabel: "12 mm", category: "Holzdübel", location: "Materialwand" },
{ id: "25", code: "W-35-02", name: "Holzdübel 10 mm", shortLabel: "10 mm", category: "Holzdübel", location: "Materialwand" },
{ id: "26", code: "W-35-03", name: "Holzdübel 8 mm", shortLabel: "8 mm", category: "Holzdübel", location: "Materialwand" },
{ id: "27", code: "W-35-04", name: "Holzdübel 6x30 mm", shortLabel: "6x30", category: "Holzdübel", location: "Materialwand" },
{ id: "28", code: "W-35-05", name: "Holzdübel Verarbeitung", shortLabel: "Verarbeitung", category: "Holzdübel", location: "Materialwand" },

{ id: "29", code: "T-41", name: "Forstnerbohrer / Kegelsenker / Keramikbohrer", shortLabel: "Forstner", category: "Werkzeug", location: "Materialwand" },
{ id: "30", code: "T-42", name: "Kompressor / Pumpe / Ventile", shortLabel: "Kompressor", category: "Werkzeug", location: "Materialwand" },
{ id: "31", code: "T-43", name: "Stifte / Minen", shortLabel: "Stifte", category: "Werkzeug", location: "Materialwand" },

{ id: "32", code: "E-21", name: "Steckdosen / Schalter", shortLabel: "Steckdosen", category: "Elektrik", location: "Elektrikbereich" },
{ id: "33", code: "E-22", name: "Abisolierzange / Stromtester / Kabel", shortLabel: "Tester", category: "Elektrik", location: "Elektrikbereich" },
{ id: "34", code: "E-23", name: "WAGO-Klemmen / Kabel-Verbinder", shortLabel: "WAGO", category: "Elektrik", location: "Elektrikbereich" },

{ id: "35", code: "S-11", name: "Schrauben außen Sortiment", shortLabel: "Außen", category: "Sortimentskasten", location: "Werkzeug / Schrauben" },
{ id: "36", code: "S-22", name: "Kabel Zubehör", shortLabel: "Kabel", category: "Sortimentskasten", location: "Elektrik" },
{ id: "37", code: "S-23", name: "WAGO Sortiment", shortLabel: "WAGO", category: "Sortimentskasten", location: "Elektrik" },

{ id: "38", code: "B-24", name: "Abzweigdosen / Hutschienengehäuse", shortLabel: "Abzweigdosen", category: "Große Box", location: "Regal" },
{ id: "39", code: "B-82", name: "Winkelverbinder / Schwerlastverbinder", shortLabel: "Winkel", category: "Große Box", location: "Beschläge" },
{ id: "40", code: "B-92", name: "Schraubhaken / Hakensortiment", shortLabel: "Haken", category: "Große Box", location: "Regal" },
{ id: "41", code: "B-93", name: "Steckschlüssel", shortLabel: "Steckschlüssel", category: "Große Box", location: "Regal" },

{ id: "42", code: "B-120", name: "Handkreissäge Makita klein", shortLabel: "Handkreissäge", category: "Große Box", location: "Regal" },
{ id: "43", code: "B-140", name: "Heißschneider Styropor", shortLabel: "Heißschneider", category: "Große Box", location: "Regal" },

{ id: "44", code: "B-201", name: "Mess- und Markierwerkzeuge", shortLabel: "Messwerkzeug", category: "Große Box", location: "Regal" },
{ id: "45", code: "B-202", name: "Stechbeitel / Feilen", shortLabel: "Stechbeitel", category: "Große Box", location: "Regal" },
{ id: "46", code: "B-203", name: "Schleifwerkzeug", shortLabel: "Schleifer", category: "Große Box", location: "Regal" },
{ id: "47", code: "B-204", name: "Zangen / Schlüssel", shortLabel: "Zangen", category: "Große Box", location: "Regal" },

{ id: "48", code: "B-205", name: "Schrauben außen groß", shortLabel: "Schrauben groß", category: "Große Box", location: "Regal" },

{ id: "49", code: "B-301", name: "Metallbeschläge gemischt", shortLabel: "Beschläge", category: "Beschläge", location: "Regal" },
{ id: "50", code: "B-302", name: "Scharniere", shortLabel: "Scharniere", category: "Beschläge", location: "Regal" },

{ id: "51", code: "M-101", name: "Makita Fräse", shortLabel: "Fräse", category: "Maschine", location: "Maschinenregal" },
{ id: "52", code: "M-102", name: "Makita Akkuschrauber Set", shortLabel: "Akkuschrauber", category: "Maschine", location: "Maschinenregal" },
{ id: "53", code: "M-103", name: "Makita Stichsäge", shortLabel: "Stichsäge", category: "Maschine", location: "Maschinenregal" },
{ id: "54", code: "M-104", name: "Bosch Bohrhammer", shortLabel: "Bohrhammer", category: "Maschine", location: "Maschinenregal" },
{ id: "55", code: "M-105", name: "Bosch Schleifer", shortLabel: "Schleifer", category: "Maschine", location: "Maschinenregal" },
{ id: "56", code: "M-106", name: "Schleifer Kiste", shortLabel: "Schleifer Box", category: "Maschine", location: "Maschinenregal" },
{ id: "57", code: "M-107", name: "Bosch Schlagbohrmaschine", shortLabel: "Schlagbohrer", category: "Maschine", location: "Maschinenregal" },

{ id: "58", code: "T-44", name: "Lochsägen / Bohrkronen", shortLabel: "Lochsägen", category: "Werkzeug", location: "Werkzeugbereich" },
{ id: "59", code: "T-45", name: "Nüsse", shortLabel: "Nüsse", category: "Werkzeug", location: "Werkzeugbereich" },
{ id: "60", code: "T-46", name: "Überlange Bohrer", shortLabel: "lange Bohrer", category: "Werkzeug", location: "Werkzeugbereich" },
{ id: "61", code: "T-47", name: "Steckschlüssel + Bitset", shortLabel: "Bitset", category: "Werkzeug", location: "Werkzeugbereich" }
];
export default inventoryData;