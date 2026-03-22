# FinFlow - Financial Management App

## 🚀 Backend Deployment (Render)
I have included a `render.yaml` file in the `backend/` directory to make your deployment to **Render.com** as easy as possible. 

### Steps to Deploy:
1. Push your `backend` folder to a GitHub repository.
2. In Render, create a new **Blueprints** instance and connect your repo.
3. Configure the following environment variables in the Render Dashboard:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `GOOGLE_API_KEY`: Your Gemini API key for receipt scanning.
   - `JWT_SECRET`: A secure random string for authentication.

## 📱 Mobile App Install
The app is currently building and installing natively on your phone via USB. This creates a standalone version separate from the Expo Go app.

## Architecture Overview

### Backend (Node.js/Express)
- **Pattern**: Controller-Service-Repository.
- **Security**: 
  - JWT Access/Refresh tokens.
  - AES-256 Encryption for sensitive data (Amount/Notes) using `crypto-js`.
  - Rate limiting and Helmet for header security.
  - Bcrypt for password hashing.
- **Database**: MongoDB Atlas (Schema includes User, Transaction, Category).

### Mobile (React Native + Expo)
- **State Management**: Zustand.
- **Offline Persistence**: SQLite (sync logic using `isSynced` flag).
- **Security**: 
  - `react-native-keychain` for access tokens.
  - `react-native-sensitive-info` for refresh tokens.
  - `expo-local-authentication` for fingerprint/FaceID.
- **OCR**: Integrated `ocrService` for receipt scanning (Simulation of field extraction).
- **Data Viz**: Victory Native for charts.
- **Privacy Mode**: Global state toggle to blur/unblur financial data.

## Folder Structure

### Backend
- `src/controllers`: Request handling.
- `src/services`: Business logic.
- `src/repositories`: Data access + Encryption.
- `src/middleware`: Auth and security checks.
- `src/utils`: JWT and Encryption helpers.

### Mobile
- `src/navigation`: Auth and App stacks.
- `src/screens`: UI screens (Dashboard, Scanning, etc.).
- `src/store`: Global state (Auth, Transactions).
- `src/database`: SQLite local storage logic.

## How to Run

1. **Backend**:
   - `cd backend`
   - `npm install`
   - Setup `.env` (MONGO_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, ENCRYPTION_SECRET)
   - `npm run dev`

2. **Mobile**:
   - `cd mobile`
   - `npm install`
   - `npx expo start`

## Design Decisions
- **Encryption**: Sensitive fields are encrypted at the repository level to ensure data is never "at rest" in plain text in MongoDB.
- **Biometric Gateway**: A dedicated screen that blocks access to private data until successfully authenticated via system biometrics.
- **Offline-First**: Transactions are saved to SQLite immediately and synced asynchronously to ensure a smooth user experience in low-connectivity areas.
