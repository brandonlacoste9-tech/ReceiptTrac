# ReceiptTrac Mobile App Prototype

**Objective:** Build a companion React Native (Expo) app for ReceiptTrac to enable on-the-go scanning and fast uncategorized expense tracking.

## Tech Stack
- **Framework:** React Native with Expo (Managed Workflow)
- **Camera:** `expo-camera` for capturing receipts.
- **Networking:** Axios / Fetch to connect to the local Python Flask backend over WiFi (`http://<local-ip>:5000/api/...`).
- **UI:** React Native Paper or completely custom styles to match the Quebec Web App aesthetic (vibrant blues `#1a5490`, clean white cards).
- **Storage:** `AsyncStorage` for saving the local API IP address or JWT tokens (if authentication is added later).

## Core Screens
### 1. Dashboard (Home)
- **Top:** Quick summary of "Monthly Spent" and "Potential Deductions".
- **Middle:** A large floating action button (FAB) that says "📷 Scan Receipt".
- **Bottom:** A list of the last 5 scanned receipts.

### 2. Camera Scanner
- A full-screen camera view using `expo-camera`.
- Overlays a bounding box guide to help users frame the receipt.
- Button to take the photo or pick from the gallery.
- On capture, compressed to JPEG and POSTed to `/api/mobile/scan` (needs to be created on the backend).

### 3. Verify Screen
- Displays the cropped image next to the extracted AI data.
- Editable dropdown for Category and Region.
- A "Save" button that commits it directly to the SQLite backend database.

## API Changes Required in Flask (`app.py`)
To properly support the mobile app, we need to add headless API routes:
1. `POST /api/mobile/scan`: Accepts a multipart form data image, runs the same `ocr_service`, and returns the exact JSON fields without rendering HTML.
2. `POST /api/mobile/save`: Accepts a JSON payload of the receipt details and calls `storage.save_receipt()`.
3. `GET /api/mobile/recent`: Returns the last 10 receipts as JSON.

## Development Steps
1. Initialize the app: `npx create-expo-app receipt-trac-mobile`
2. Install dependencies: `npm i expo-camera @react-navigation/native`
3. Build the camera view and connect the submit button to the Flask API endpoint.
4. Test locally using the Expo Go app on iOS/Android pointing to the Flask server IP.
