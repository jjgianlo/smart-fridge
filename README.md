# Smart Fridge - Mitarbeiterbereich

Ein modernes System zur Verwaltung eines Smart Fridge Systems mit React Frontend und FastAPI Backend.

## Installation

### Backend

1. Python 3.8 oder höher installieren
2. Repository klonen
3. Virtuelle Umgebung erstellen und aktivieren:
```bash
python -m venv venv
source venv/bin/activate  # Für Linux/Mac
venv\Scripts\activate     # Für Windows
```

4. Backend-Abhängigkeiten installieren:
```bash
pip install -r backend/requirements.txt
```

### Frontend

1. Node.js und npm installieren
2. Frontend-Abhängigkeiten installieren:
```bash
npm install
```

## Benötigte Bibliotheken

### Backend
Die wichtigsten Backend-Bibliotheken sind:
- fastapi
- uvicorn
- python-dotenv
- supabase
- jinja2
- python-multipart


## Verwendung

### Backend starten

Über die main.py:
```bash
cd backend
python -m main
```

Der Backend-Server startet standardmäßig auf `http://localhost:5000`

### Frontend starten
Das Frontend kann im Entwicklungsmodus gestartet werden:
```bash
npm run dev
```

Der Frontend-Entwicklungsserver startet standardmäßig auf `http://localhost:8080`

## Features
- Benutzer-Login-System 
- Kühlschrank-Verwaltung (Erstellen, Anzeigen, Aktualisieren, Löschen)
- Produktverwaltung mit Kategorisierung
- Lagerbestandsverwaltung in Kühlschränken
- Einkaufslisten-Generierung als PDF
- Dashboard mit Übersicht über Kühlschränke und Produkte
- Moderne, responsive Benutzeroberfläche mit CORS-Unterstützung

## API-Endpunkte

Die API bietet folgende Hauptendpunkte:
- `/fridge` - Kühlschrank-Verwaltung
- `/product` - Produktverwaltung
- `/user` - Benutzerverwaltung
- `/in_fridge` - Kühlschrankinhalte-Verwaltung
- `/shopping_list` - Einkaufslisten-Verwaltung