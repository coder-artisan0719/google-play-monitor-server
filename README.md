# 🧩 PlayStore Monitoring Server (Backend)

An automated backend service that **monitors Google Play Store app listings** by periodically capturing screenshots, storing metadata in a PostgreSQL database, and streaming real-time updates to connected clients using **Server-Sent Events (SSE)** — with zero manual refresh or polling.

---

## 🚀 Features

- ✅ **Automated Play Store Screenshot Capture** (via Playwright)
- ✅ **Real-time Updates** using Server-Sent Events (SSE)
- ✅ **Prisma + PostgreSQL** for structured data storage
- ✅ **Express.js API** serving JSON and static image assets
- ✅ **Scheduled Cron Jobs** for periodic screenshot capture
- ✅ **CORS-enabled API** for secure frontend communication
- ✅ **Fully implemented in TypeScript**

---

## 🧱 Tech Stack

| Layer | Technology |
| :---- | :---------- |
| Runtime | Node.js (≥18) |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Scheduler | node-cron |
| Screenshot Engine | Playwright (Chromium) |
| Realtime Transport | Server-Sent Events (SSE) |
| Language | TypeScript |

---

## 📂 Project Structure

```
google-play-monitor-server/
├── .env
├── package.json
├── prisma/
│ ├── schema.prisma # Database schema definition
│ ├── migrations/ # Prisma migration history
│ └── migration_lock.toml
├── public/
│ └── screenshots/ # Saved screenshots by appId
├── src/
│ ├── index.ts # Server entrypoint + cron job
│ ├── lib/
│ │ └── prisma.ts # Prisma client instance
│ ├── routes/
│ │ ├── app.ts # Fetch registered apps
│ │ ├── screenshot.ts # Capture new screenshot
│ │ ├── screenshots.ts # Get screenshots by appId
│ │ └── events.ts # SSE live updates
│ └── services/
│ └── playwright.ts # Playwright capture logic
└── tsconfig.json
```

---

## ⚙️ Setup Instructions

### 1️⃣ Prerequisites

Ensure the following are installed on your machine:

- Node.js ≥ 18  
- npm ≥ 9  
- PostgreSQL (local or cloud)  
- Playwright dependencies

Install missing Playwright system dependencies (Linux only):

```bash
npx playwright install-deps
```

### 2️⃣ Install Dependencies

```
npm install
```
### 3️⃣ Environment Variables
Create a .env file in the root directory with the following content:

```
DATABASE_URL="postgresql://user:password@localhost:5432/playstore_monitor"
PORT=4000
```

### 4️⃣ Initialize Database
Run Prisma migrations:
```
npx prisma migrate dev
```
### 5️⃣ Run the Server
Development mode (with hot reload):
```
npm run dev
```
Production build:
```
npm run build
npm start
```

---
## 🧠 System Overview
### 🕒 Automated Screenshot Capture
- A cron job runs every 12 hours (0 */12 * * *).
- It fetches all registered apps from the database.
- For each app:
    - Launches Playwright (Chromium).
    - Captures a full-page screenshot.
    - Saves the file under `/public/screenshots/<appId>/`.
    - Stores metadata (`appId`, `imageUrl`, `capturedAt`) in the database.
    - Broadcasts the update via SSE to all connected clients.
### 🧩 Data Model (Prisma Schema)
```
model App {
  appId        String       @id
  appName      String
  playStoreUrl String
  screenshots  Screenshot[]
}

model Screenshot {
  id          Int      @id @default(autoincrement())
  appId       String
  imageUrl    String
  fileName    String
  capturedAt  DateTime
  app         App      @relation(fields: [appId], references: [appId])
}
```
### 🟢 Live Updates (SSE)
When a new screenshot is captured, the backend broadcasts the event to all subscribed clients through `/api/events`.

Example SSE payload:
```
{
  "appId": "com.activision.callofduty.shooter",
  "appName": "Call of Duty Mobile",
  "imageUrl": "/public/screenshots/com.activision.callofduty.shooter/12345.png",
  "capturedAt": "2025-10-29T12:50:32.345Z"
}
```
### 📡 API Reference
```
| Action                 | Endpoint                  | Method      | Description                                          |
| :--------------------- | :------------------------ | :---------- | :--------------------------------------------------- |
| Add new app            | `/api/screenshot`         | `POST`      | Capture and save screenshot for given Play Store app |
| Get all apps           | `/api/apps`               | `GET`       | Retrieve list of monitored apps                      |
| Get screenshots by app | `/api/screenshots/:appId` | `GET`       | Fetch all screenshots for a specific app             |
| Real-time updates      | `/api/events`             | `GET (SSE)` | Receive live screenshot updates                      |
```
### ▶️ Example: Add a New App
Request
```
POST /api/screenshot
Content-Type: application/json

{
  "url": "https://play.google.com/store/apps/details?id=com.activision.callofduty.shooter",
  "appName": "Call of Duty Mobile"
}
```
Response
```
{
  "appName": "Call of Duty Mobile",
  "appId": "com.activision.callofduty.shooter",
  "url": "https://play.google.com/store/apps/details?id=com.activision.callofduty.shooter",
  "imagePath": "/public/screenshots/com.activision.callofduty.shooter/cod_1735603.png",
  "timestamp": "2025-10-30T14:50:32.345Z"
}
```
### 🧠 Key Logic Summary
```
| Task                   | File                         | Description                      |
| :--------------------- | :--------------------------- | :------------------------------- |
| Express App Setup      | `src/index.ts`               | Bootstraps app, routes, cron job |
| Capture App Screenshot | `src/routes/screenshot.ts`   | Handles POST `/api/screenshot`   |
| Fetch All Screenshots  | `src/routes/screenshots.ts`  | GET `/api/screenshots/:appId`    |
| Real-time Updates      | `src/routes/events.ts`       | SSE setup and broadcast logic    |
| Screenshot Logic       | `src/services/playwright.ts` | Headless Chromium capture        |
| Database Connection    | `src/lib/prisma.ts`          | Prisma client initialization     |
```
### 🧰 Developer Notes
- Screenshots are stored locally under `public/screenshots/<appId>/`.
- The API serves them statically via `/public/...` paths.
- SSE is used for simplicity — no WebSocket server needed.
- The frontend can subscribe to `/api/events` to receive updates.
### 🧭 Future Enhancements
- 🕓 Per-app “last updated” indicator
- 📊 Diff-viewer for screenshot comparison
- 🗑 Automated cleanup of old screenshots
- 🔐 Authentication & user management
- ⚙️ Configurable cron frequency via `.env`