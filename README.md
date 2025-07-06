# Clipper Collection Tracker

Ein kleines Web-Tool zum Verwalten und Visualisieren deiner Clipper-Feuerzeugsammlungen.

---

## ✨ Features

- **User-Management**  
  - Registrierung & Login mit Sessions (SQLite + `connect-sqlite3`)  
  - Rollen: **User** vs. **Admin**  
- **Collections CRUD** (Admins)  
  - Anlegen, Bearbeiten, Löschen von Kollektionen  
  - Angabe von Name, Beschreibung, Bild-URL und Größe  
- **Bild-Upload & -Zuschneiden**  
  - Upload per Formular (`/api/upload-image`) via `multer`  
  - Automatisches Zuschneiden in gleiche Teile (`sharp`)  
- **Ownership Tracking**  
  - Pro Nutzer/Kollektion einzelne Positionen („Slots“) als **besitzt** markieren  
- **Session-API**  
  - `/api/session` liefert Username & Rolle des aktuell eingeloggten Users  
- **Frontend-UI**  
  - **Dark/Light-Mode** mit sanftem Übergang  
  - **Enlarge-Modal** für große Vorschaubilder  
  - **Custom-Size-Toggle** im Formular  
  - **Image Preview** beim Datei-Upload  
- **Stateless REST-API**  
  - Endpoints unter `/api` für Auth, Collections, Ownership, Upload, Session, User-Profil  
- **Mobile-Optimierung**  

---

## 🛠 Tech Stack

- **Backend**  
  - Node.js & Express  
  - SQLite (`sqlite3`)  
  - Sessions: `express-session` + `connect-sqlite3`  
  - Auth: `bcrypt`  
  - File Upload: `multer`  
  - Image Processing: `sharp`  
  - UUIDs: `uuid`  
- **Frontend**  
  - HTML, CSS, Vanilla JavaScript  
- **Dev Tools**  
  - Code Style: Prettier (`.prettierrc`)  
  - Linting & Formatting via IDE/CI  

---

## 🚀 Installation & Start

```bash
git clone https://github.com/FloOM2504/clipper-project.git
cd clipper-project
npm install
```

**Server starten**  
```bash
node server/index.js
```

Die App läuft dann unter:  
[http://localhost:3000](http://localhost:3000)

> **Hinweis:** Beim ersten Start wird automatisch eine SQLite-Datenbank angelegt und ein Admin-User erstellt:  
> `Benutzername: admin`  
> `Passwort: admin`

---

## 📂 Projektstruktur

```
.
├── clipper-importer/          # (Optional) CLI-Skripte zum Import externer Daten
├── public/                    # Statische Assets & Client-Code
│   ├── css/
│   │   ├── styles.css         # Haupt-Styles
│   │   ├── styles_.css        # Alternative Styles (z.B. Dark Mode Overrides)
│   │   └── theme-transition.css  # Übergangs-Animationen für Theme-Toggle
│   ├── js/
│   │   ├── auth.js            # Login/Register-Logik & Session Checks
│   │   ├── collections.js     # API-Calls: Collections GET/POST/PUT/DELETE
│   │   ├── ownership.js       # API-Calls: Ownership PUT/GET
│   │   ├── main.js            # Initialisierung & allgemeine Helpers
│   │   └── ui.js              # UI-Interaktionen (Theme, Modals, Previews)
│   ├── index.html             # Haupt-UI: Übersichtsseite
│   └── profile.html           # User-Profilseite
├── public/uploads/            # Automatisch generierte Bild-Slices
├── server/                    # Express-API & Datenbank-Setup
│   ├── auth.js                # `/api/register`, `/api/login`, `/api/logout`
│   ├── collections.js         # `/api/collections` CRUD + Image-Slicing
│   ├── db.js                  # SQLite-Init & Admin-Seed
│   ├── index.js               # Express-Setup, Session-Middleware, Routen-Mounts
│   ├── middleware.js          # `requireLogin`, `requireAdmin`
│   ├── ownership.js           # `/api/ownership`
│   └── upload.js              # `/api/upload-image`
├── .gitignore
├── .prettierrc
└── README.md                  # <-- Du bist hier
```

---

## 🔒 Authentifizierung & Rollen

- **User**  
  - Kann eigene Kollektionen ansehen und Slots markieren  
- **Admin**  
  - Kann alle Kollektionen anlegen, bearbeiten & löschen  
  - Bilder hochladen & automatisch zuschneiden  

---

## 📸 Bild-Verarbeitung

1. Upload per `/api/upload-image` oder Angabe einer externen `image_url`  
2. Download und Zuschneiden in **N** gleiche Teile (Anzahl = `size`)  
3. Speicherung der Teile unter `public/uploads/collection_<id>_<slot>.jpg`  

---

## 📌 API Endpoints (Auszug)

| Methode | Route                        | Beschreibung                              |
|:--------|:-----------------------------|:------------------------------------------|
| POST    | `/api/register`              | Neuer User registrieren                   |
| POST    | `/api/login`                 | Einloggen                                 |
| GET     | `/api/logout`                | Ausloggen                                 |
| GET     | `/api/session`               | Status: eingeloggter User & Rolle         |
| GET     | `/api/collections`           | Alle Collections + Ownerships des Users   |
| POST    | `/api/collections`           | Neue Collection (Admin)                   |
| PUT     | `/api/collections/:id`       | Collection bearbeiten (Admin)             |
| DELETE  | `/api/collections/:id`       | Collection löschen (Admin)                |
| PUT     | `/api/ownership`             | Slot-Marke setzen/entfernen               |
| GET     | `/api/ownership/:collection_id` | Markierungen eines Users                 |
| POST    | `/api/upload-image`          | Bild hochladen (Admin)                    |
| GET     | `/api/user/:username`        | Collections + Ownerships eines Benutzers  |

---

## 🤝 Contributing

1. Fork das Repo  
2. Branch erstellen (`git checkout -b feature/meine-idee`)  
3. Änderungen commiten & pushen  
4. Pull Request erstellen

---

## 📄 Lizenz

MIT License – gerne forken, verbessern und mit anderen Clipper-Fans teilen!
