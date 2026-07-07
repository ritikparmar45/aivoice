# AccentFlow - AI-Powered English Pronunciation Assessment

AccentFlow is a production-quality, responsive web application that provides real-time, constructive feedback on English pronunciation. Users can upload speech recordings (between 30 to 45 seconds), and the platform analyzes phonics, syllable stress, and speech patterns to deliver a detailed assessment scorecard.

Designed under **SOLID principles**, a decoupled **MVC architecture**, and strict **DPDP data privacy compliance**.

---

## 🚀 Key Features

- **DPDP Compliant Zero-Storage Policy**: No persistent databases. Uploaded audio files are processed entirely in temporary memory and permanently deleted immediately after grading.
- **Client-Side Duration Verification**: Employs browser-native HTML5 Audio metadata checks to intercept and reject files outside the 30–45 seconds limit before using network bandwidth.
- **Interactive Speech Transcript**: Color-coded word highlights indicating phonetic errors. Clicking on highlighted words directly scrolls and focuses the detailed criticism card.
- **Granular Phonics Assessment**: Grading metrics include:
  - Overall accuracy score (0-100 gauge).
  - Confidence indicators.
  - Mistake severity indicators (Low, Medium, High).
  - Explanations of phonetic issues and actionable tips for improvement.

---

## 🛠️ Tech Stack

### Frontend
- **React 19** & **Vite**
- **TailwindCSS v4** (Utility styling, ambient blur layers, and responsive CSS variables)
- **React Router** & **Axios** (API requests & progress bars)
- **React Hook Form** (Unified DPDP consent and form bindings)
- **React Hot Toast** (Modular alerts)
- **Lucide React** (Vector icons)

### Backend
- **Node.js** & **Express**
- **Multer** (Temporary file upload management)
- **music-metadata** (Audio duration double-verification checks)
- **@google/genai** (Official client for Gemini 2.5 Flash)
- **Axios** (Communicates with transcription APIs)
- **fs-extra** (File deletion/storage maintenance)

---

## 📁 Repository Directory Structure

```
aivoice/
├── backend/                  # Express MVC Service
│   ├── config/               # Environment validators
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Upload parsers, consent & duration checks
│   ├── routes/               # API endpoints
│   ├── services/             # AI API Clients (Groq Whisper & Gemini 2.5 Flash)
│   ├── utils/                # Custom AppError classes
│   └── uploads/              # Local temporary upload directory (ignored by git)
└── frontend/                 # React 19 Client
    ├── src/
    │   ├── components/       # Layout wrappers, headers, dropzones, report cards
    │   ├── context/          # React State Providers (Axios connections & upload states)
    │   ├── pages/            # View togglers (Dashboard)
    │   └── index.css         # Tailwind v4 directives and theme variables
```

---

## ⚙️ Local Development Quickstart

### Step 1: Configuration

1. Locate the backend environment config file: `backend/.env`
2. Populate the required API keys:
   ```env
   PORT=5000
   NODE_ENV=development
   ALLOWED_ORIGIN=http://localhost:5173
   MAX_FILE_SIZE_MB=10

   # API Access Keys
   GEMINI_API_KEY=your_gemini_api_key
   GROQ_API_KEY=your_groq_whisper_api_key
   ```

### Step 2: Launch the Servers

In your project root, open two separate terminal instances:

#### Terminal 1: Run the Backend Service
```bash
cd backend
npm run dev
```
The server will bind and start listening on `http://localhost:5000`.

#### Terminal 2: Run the Frontend Client
```bash
cd frontend
npm run dev
```
Open your browser to `http://localhost:5173` to test the application.

---

## 🔒 Privacy & Compliance (DPDP Act)

To meet the requirements of the Digital Personal Data Protection (DPDP) standards:
1. **Explicit Consent Check**: Files cannot be selected or dropped unless the user explicitly checks the consent agreement.
2. **Instant Purges**: Files are immediately unlinked from the server's local file system in a `finally` code block. This means even if the transcription or analysis fails midway, the audio is permanently purged from memory immediately.
