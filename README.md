# 🔥 Clipper Collection Tracker

Ein kleines Web-Tool zum Verwalten und Visualisieren deiner Clipper-Feuerzeugsammlungen.  
Mit Nutzerverwaltung, Bild-Upload, Ownership-Tracking und Dark-/Light-Mode.

## ✨ Features

- Nutzer-Registrierung & Login mit Sessions (SQLite-basiert)
- Admins können neue Kollektionen erstellen, Bilder hochladen & automatisch zuschneiden lassen
- Einzelne Clipper-Positionen können als „besitzt“ markiert werden
- Live-Filter nach Name & Größe
- Dark-/Light-Mode mit sanftem Übergang
- Mobile-optimiertes UI

## 📦 Tech Stack

- **Frontend:** HTML, CSS, Vanilla JS
- **Backend:** Node.js + Express
- **Datenbank:** SQLite
- **Uploads:** multer + sharp (automatisches Zuschneiden)

## 🚀 Installation

```bash
git clone https://github.com/dein-user/clipper-tracker.git
cd clipper-tracker
npm install
```

> Du brauchst Node.js (v16+ empfohlen) und `npm`.

## 🧪 Starten

```bash
node server.js
```

Web-App erreichbar unter: [http://localhost:3000](http://localhost:3000)

Der erste Start erstellt automatisch eine SQLite-Datenbank mit einem Admin-Benutzer:

```
Benutzername: admin
Passwort: admin
```

## 📁 Ordnerstruktur

```
.
├── server.js               # Hauptserver
├── sessions.sqlite         # Session-DB (im .gitignore)
├── public/
│   ├── index.html          # Frontend-UI
│   ├── styles.apple.css    # UI-Styling
│   ├── theme-transition.css
│   ├── uploads/            # Clipper-Bildteile (automatisch)
│   └── clipper_logo.png    # Logo
├── .prettierrc             # Formatierung
├── package.json
└── .gitignore
```

## 🔒 Authentifizierung & Rollen

- **User:** kann eigene Sammlung verwalten
- **Admin:** kann Collections hinzufügen, bearbeiten und löschen

## 📸 Clipper-Bilder

- Hochgeladene Bilder werden automatisch in einzelne Teile aufgeteilt
- Alternativ kann eine Bild-URL angegeben werden

## ✅ ToDo / Ideen

- Suchindex speichern (lokal)
- Clipper-Details / Notizen je Slot
- Import/Export-Funktion
- PWA-Support für Offline-Nutzung

## 🧠 Lizenz

MIT License – gerne forken, verbessern, mit Clipper-Fans teilen!