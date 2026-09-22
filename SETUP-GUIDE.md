# KIPS TRADING DESK (KTD) — Complete Setup Guide for Beginners
### A "do exactly what it says" walkthrough. No coding knowledge needed. Total time: ~60–90 minutes.

---

## PART A — Install 3 free tools on your HP laptop

### A1. Install Node.js (this makes the app run)
1. Open your browser, go to **https://nodejs.org**
2. Click the big green **"LTS"** Download button.
3. Open the downloaded file. Click **Next → Next → Next → Install → Finish** (do NOT change any options).
4. To check it worked: press the **Windows key**, type `cmd`, press Enter.
5. In the black window that opens, type: `node -v` and press Enter.
   - You should see a version number like `v20.x.x`. ✅ Done.

### A2. Install VS Code (this is where your code lives)
1. Go to **https://code.visualstudio.com**
2. Click **Download for Windows**.
3. Open the downloaded file. Click **Next** through everything (tick all the checkboxes on the "Select Additional Tasks" screen — they are helpful) → **Install → Finish**.
4. Open VS Code once so it's ready later.

### A3. Create a free GitHub account (this stores your code online for Vercel)
1. Go to **https://github.com** → click **Sign up** → use your email, pick a username and password → verify → free plan → **Continue**.
2. Done. (You don't need to know anything else about Git.)

---

## PART B — Create your 3 free cloud accounts

### B1. Firebase (the database — stores your 100 players)
1. Go to **https://console.firebase.google.com** and sign in with your Google/Gmail account.
2. Click **"Add project"** → type `ktd-trading-desk` → Continue → **Disable** Google Analytics (not needed) → **Create project** → **Continue**.
3. On the left menu, click **Build → Firestore Database** → click **"Create database"**.
4. Choose **"Start in production mode"** → **Next**.
5. Location: pick `asia-south1` (Mumbai — closest to India) → **Enable**. Wait ~1 minute.
6. Now click the **"Rules"** tab, delete everything in the box, and paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if true;
    }
  }
}
```
   Click **"Publish"**. (This is a friends-only game, so open rules are fine.)

7. Now get your config keys: click the **⚙️ Settings icon** (top-left, "Project settings") → scroll down to **"Your apps"** → click the **</> Web icon**.
8. App nickname: type `KTD Web` → **Register app** (don't tick Firebase Hosting).
9. You will see a block of code like this:
```
const firebaseConfig = {
  apiKey: "AIza........",
  authDomain: "ktd-trading-desk.firebaseapp.com",
  ...
};
```
**Copy this whole block into a Notepad file and save it** — you will paste it into the code in Step C4.

### B2. Alpaca (free stock prices for NYSE, NASDAQ, Cboe)
1. Go to **https://app.alpaca.markets/signup** → sign up with your email (takes 2 minutes; it's a PAPER trading account = fake money, no real funds ever needed).
2. Verify your email if asked.
3. Once logged in, on the left menu click **"API Keys"** (Paper Trading).
4. Click **"Generate New Key"** → copy the **API Key ID** and **Secret Key** into your Notepad file.
   ⚠️ Free tier = 15-min delayed prices. That's fine for your game. Also, the free stock data feed is "IEX" — the app is already set for it.

### B3. Vercel (this hosts your app and gives you the WhatsApp link)
1. Go to **https://vercel.com** → click **Sign Up** → choose **"Continue with GitHub"** (the account you made in A3) → authorize.
2. Done. Do nothing else yet.

---

## PART C — Put the code on your laptop and add your keys

### C1. Unzip the project
1. Find the downloaded `ktd-app.zip` file (in Downloads).
2. Right-click it → **Extract All…** → **Extract**. You now have a folder called `ktd-app`.

### C2. Open it in VS Code
1. Open VS Code → click **File → Open Folder…** → select the `ktd-app` folder → **Select Folder** → click **"Yes, I trust the authors"**.

### C3. Install the app's parts (one time only)
1. In VS Code, press **Ctrl + `** (the backtick key, top-left of keyboard, below Esc). A terminal panel opens at the bottom.
2. Type exactly this and press Enter:
```
npm install
```
3. Wait 1–3 minutes while it downloads. When you see the blinking cursor again, it's done.

### C4. Paste your Firebase keys
1. In VS Code's left file list, open **src → firebase.js**.
2. Find the section at the top that says `const firebaseConfig = {` with "PASTE_YOUR_…" placeholders.
3. Replace those placeholder values with the values you saved in Notepad from B1. (Keep the quote marks " " around each value.)
4. Press **Ctrl + S** to save.

### C5. Paste your Alpaca keys
1. Open **src → lib → market.js**.
2. At the top, replace `PASTE_YOUR_ALPACA_KEY` and `PASTE_YOUR_ALPACA_SECRET` with your keys from B2 (keep the quote marks).
3. Press **Ctrl + S**.

### C6. Test the app on your laptop
1. In the terminal (Ctrl + `), type:
```
npm run dev
```
2. You will see a line like `Local: http://localhost:5173/`. Hold **Ctrl** and click that link.
3. Your KTD app opens in the browser! Register a test user, buy a stock, check the leaderboard. It uses your REAL Firebase database already.
4. To stop the test later: click in the terminal and press **Ctrl + C**.

---

## PART D — Put the app on the internet (Vercel)

### D1. Upload your code to GitHub
1. Go to **https://github.com** → click **"+"** (top right) → **"New repository"**.
2. Repository name: `ktd-app` → keep it **Public** → tick **"Add a README file"** → **Create repository**.
3. On the repo page, click **"uploading an existing file"** link (or the **Add file → Upload files** button).
4. Open your `ktd-app` folder on your laptop in File Explorer, **select ALL files and folders inside it** (including the hidden ones — in File Explorer's View menu tick "Hidden items"), and **drag them all** into the GitHub page.
5. Wait for the upload bar to finish → click **"Commit changes"**.

### D2. Connect Vercel (gets you your live link)
1. Go to **https://vercel.com** → **Add New… → Project**.
2. Click **"Import"** next to your `ktd-app` repository → click **"Deploy"** (don't change any settings — Vercel auto-detects Vite).
3. Wait ~1 minute. You get: 🎉 **"Congratulations!"** with a link like `https://ktd-app-xyz.vercel.app`
4. **That link is your app!** Send it via WhatsApp to your 100 colleagues.

> If you change any code later: re-upload files to GitHub (same drag & drop) → Vercel **automatically** redeploys in ~1 minute. Nothing else to do.

---

## PART E — Install on phones (share with colleagues)

**Android:** open the link in **Chrome** → tap the **⋮ menu** → **"Add to Home screen"** → Install. It appears as an app called **KTD** with the candlestick icon.

**iPhone (iOS):** open the link in **Safari** → tap the **Share button** (square with arrow) → scroll down → **"Add to Home Screen"** → Add.

Both work offline for the shell, and look like a real native app — full-screen, no browser bar.

---

## PART F — How the app works (for you as admin)

| Feature | Where | How |
|---|---|---|
| **Master PIN override** | Lock screen | Type `0000` on anyone's lock screen to enter their profile (admin power). |
| **Global reset (new tournament)** | ⚙️ Admin button (top right) → enter `0000` | Sets ALL players back to $50,000, clears holdings & history. |
| **Export standings to WhatsApp** | ⚙️ Admin → enter `0000` → "Copy Standings" | Formatted ranking copied — just paste in your WhatsApp group. |
| **Delete a player** | Their profile avatar → "Delete Account & Data" | Needs their PIN or `0000`. Removes them from leaderboard too. |
| **100-player cap** | Automatic | 101st person to register gets "Trading desk is full". |
| **Leaderboard ranking** | Right side (bottom on phone) | Ranked by **ROI %** of invested stocks — NOT wallet balance. Players who haven't traded sit at the bottom as "NO TRADES". |
| **Market hours** | Top-right indicator | Shows MARKET OPEN/CLOSED in US time (9:30am–4pm ET, Mon–Fri). Trades still execute in the simulator when closed, with a warning. |
| **Trade rules** | Automatic | Long-only: can't short, can't use margin, can't spend more cash than you have, whole shares only. |
| **Live prices** | Automatic | Cached 10 seconds to respect Alpaca free limits; your portfolio ROI recalculates and syncs every 30 seconds. |

---

## Troubleshooting (things that can go wrong)

| Problem | Fix |
|---|---|
| `node is not recognized` in cmd | Restart your laptop after installing Node, then retry. |
| `npm install` shows errors | Check internet. Make sure you opened the **ktd-app** folder (not its parent) in VS Code. |
| App loads but no prices / search fails | Your Alpaca keys in `src/lib/market.js` are wrong or have extra spaces. Re-copy them carefully. |
| Registration shows "Registration failed" | Your Firebase config in `src/firebase.js` is wrong, OR Firestore database wasn't created (B1 step 3–5). |
| Prices frozen | Alpaca free tier sleeps after inactivity or hits rate limits — it recovers within a minute. |
| Vercel deploy fails | Make sure you uploaded ALL files including `package.json` and the hidden `.gitignore` (tick "Hidden items" in File Explorer). |
| App says "Trading desk is full" | 100 players reached. Use Master Reset to clear everyone, or delete inactive users via their profiles. |

---
*Built with React + Vite + Tailwind, Firebase Firestore, Alpaca API, hosted on Vercel.*
