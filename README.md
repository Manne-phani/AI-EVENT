# Cakes & Crunches - AI Event Catering Menu Pairing Suggester

A premium, full-stack responsive web application designed for **Cakes and Crunches** bakery to help customers choose a complete, complementary dessert menu for their events. The application increases order values by recommending pastries, snacks, and beverage pairings that chemically balance and visually elevate their main centerpiece cake.

---

## 🌟 Key Features

1. **OTP Authentication**: Mobile number login with a 4-digit mock SMS verification code (bypass code `1234` or read generated code directly on-screen).
2. **Bakery Theme Homepage**: Premium visual layout using warm bakery tones (cream, beige, pink, chocolate), subtle card hover elevations, and testimonials.
3. **Template Presets**: Quick one-click buttons (Birthday, Wedding, Corporate, Festival, Kids Party) to instantly auto-fill catering specifications.
4. **Interactive Pairing Form**: Multi-section form collecting event details, centerpiece cake types, dietary restrictions, budget, and custom preferences with full validation.
5. **AI Menu Pairing Engine**: Connects to the **Google Gemini API** (using `@google/generative-ai`) to retrieve structured JSON menu recommendations. Works offline/locally with a highly tailored **Chef Mock generator** if the API key is absent.
6. **Premium Output Dashboard**: Suggests Pastries, Desserts, Snacks, and Beverages in styled grid cards. Includes actions to:
   - Copy plain text to clipboard.
   - Download as Plain text (`.txt`).
   - Download as high-fidelity print document (`.pdf`) using `jsPDF`.
   - Share mock menu URL.
   - Regenerate response.
7. **Star & Sentiment Feedback**: Star rating (1-5), Thumbs Up/Down satisfaction metrics, and comments saved to the database.
8. **Admin Dashboard**: Visual analytics containing total counts, average ratings, top event types, popular cake choices, user activity, and an interactive SVG area chart mapping daily traffic trends.

---

## 📂 Project Structure

```
c:\Users\manne\OneDrive\Internship\
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # SQLite database initialization & tables creation
│   │   ├── controllers/
│   │   │   ├── adminController.js     # Analytics computations for charts
│   │   │   ├── authController.js      # Mock OTP generation, verification, and JWT
│   │   │   ├── feedbackController.js  # Thumbs up/down, ratings, and comments saving
│   │   │   ├── pairingController.js   # API generation, history management, and deletions
│   │   │   └── templateController.js  # Presets retrieval and custom presets creation
│   │   ├── middleware/
│   │   │   └── auth.js                # JWT token validation middleware
│   │   ├── routes/
│   │   │   └── index.js               # Route mappings
│   │   ├── services/
│   │   │   └── geminiService.js       # Google Gemini SDK caller with mock fallback
│   │   └── server.js                  # Main server entrypoint
│   ├── database.sqlite                # Local serverless database file
│   ├── .env                           # Server environment configurations
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FeedbackSection.jsx    # Star rating & thumbs rating form
│   │   │   ├── Navbar.jsx             # Responsive top header navigation
│   │   │   ├── PairingForm.jsx        # Specifications form with quick presets
│   │   │   ├── PairingResult.jsx      # Outputs display with PDF/TXT exports
│   │   │   └── SkeletonLoader.jsx     # Shimmer skeleton screen during AI loading
│   │   ├── context/
│   │   │   └── AuthContext.jsx        # Auth state provider & authenticated fetch utility
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx     # Statistics analytics and SVG area charts
│   │   │   ├── HistoryPage.jsx        # Searchable and deletable past records list
│   │   │   ├── HomePage.jsx           # Landing page with galleries & CTAs
│   │   │   └── LoginPage.jsx          # Mobile phone & OTP verification page
│   │   ├── App.jsx                    # Router, view controls, and auth guards
│   │   ├── index.css                  # Google Fonts imports, Tailwind layers, backgrounds
│   │   └── main.jsx                   # DOM mounting script
│   ├── index.html                     # SEO metadata, title tags, semantic markers
│   ├── tailwind.config.js             # Customized bakery theme branding palette
│   ├── postcss.config.js
│   ├── vite.config.js                 # Local dev server running on port 3000
│   └── package.json
└── README.md                          # Documentation
```

---

## 🗄️ Database Schema (SQLite)

The database utilizes SQLite, offering a lightweight, zero-configuration local server. 

### 1. `users` Table
Stores registered users identified by unique mobile phone numbers:
- `id` (TEXT, PK): Unique UUID
- `mobile_number` (TEXT, Unique): User's phone number
- `created_at` (DATETIME): Auto timestamp

### 2. `otps` Table
Manages temporary single-use login codes:
- `id` (TEXT, PK): Unique UUID
- `mobile_number` (TEXT): Number OTP was sent to
- `code` (TEXT): 4-digit code (e.g. `4892`)
- `expires_at` (DATETIME): Expiration date (5 minutes limit)
- `used` (INTEGER): `0` for fresh, `1` for redeemed

### 3. `generations` Table
Tracks pairing suggestions requested by users:
- `id` (TEXT, PK): Unique UUID
- `user_id` (TEXT, FK): References `users(id)`
- `timestamp` (DATETIME): Creation date
- `event_type` (TEXT): Dropdown category choice
- `guest_count` (INTEGER): Number of attendees
- `main_cake_type` (TEXT): Cake choice
- `preferences` (TEXT): Custom flavor requests
- `dietary_restrictions` (TEXT): JSON array text (e.g. `["Eggless","Gluten-Free"]`)
- `budget_range` (TEXT): `Budget-friendly`, `Premium`, or `Luxury`
- `special_instructions` (TEXT): Special notes
- `ai_response` (TEXT): JSON string payload returned by the AI or fallback engine

### 4. `feedbacks` Table
Stores satisfaction metrics for generations:
- `id` (TEXT, PK): Unique UUID
- `generation_id` (TEXT, FK, Unique): References `generations(id)`
- `rating` (INTEGER): 1 to 5 stars
- `sentiment` (TEXT): `'like'` or `'dislike'`
- `comment` (TEXT): Optional feedback
- `timestamp` (DATETIME): Creation date

### 5. `templates` Table
Stores presets and templates:
- `id` (TEXT, PK): Unique UUID
- `name` (TEXT): Template label (e.g. "Grand Wedding")
- `event_type`, `guest_count`, `main_cake_type`, `preferences`, `dietary_restrictions`, `budget_range`, `special_instructions`
- `is_preset` (INTEGER): `1` for default built-in presets, `0` for user-created custom templates

---

## 🛠️ Local Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- npm (Node Package Manager)

### Step 1: Clone or Open Workspace
Ensure you are running commands inside the root workspace folder:
```bash
cd c:\Users\manne\OneDrive\Internship
```

### Step 2: Configure Environment Variables
Inside the `backend/` folder, a `.env` file is already created. You can optionally add your Gemini API key:
```env
PORT=5000
JWT_SECRET=cakes_and_crunches_secret_key_12345
GEMINI_API_KEY=YOUR_ACTUAL_GEMINI_KEY_HERE    # Leave empty to use premium Mock Fallback Mode
NODE_ENV=development
```

### Step 3: Run the Backend Server
Open a terminal and navigate to the backend folder to start the server:
```bash
cd backend
npm run start
```
*The server will run on **http://localhost:5000**, initialize the SQLite database `database.sqlite`, and seed the 5 template presets.*

### Step 4: Run the Frontend Application
Open another terminal and start the Vite development server:
```bash
cd frontend
npm run dev
```
*The React application will compile and start on **http://localhost:3000**.*

---

## 🧪 Verification & Testing Flow

1. **Open Application**: Navigate to `http://localhost:3000` in your browser.
2. **Access Forms**: Click the CTA "Design Your Dessert Table" or navigate to **Pairing Tool**. It will redirect you to the **Login Page**.
3. **Verification Login**:
   - Enter your phone number (e.g., `+91 98765 43210`).
   - Click **Send Code**. Look at your backend server console logs for the printed code:
     `[SMS MOCK] Verification Code: 4839`
     *(Alternatively, you can always enter `1234` as a bypass code).*
   - Enter the code and click **Verify & Login**.
4. **Form Autofill**: Click any preset button at the top (e.g. *Grand Wedding*). The form fields will instantly autofill.
5. **AI Menu Pairing**:
   - Make any custom modifications (e.g., change centerpiece cake to *Red Velvet*, check *Vegan* & *Gluten-Free*).
   - Click **Suggest Pairing Menu**.
   - You will see the **Chef AI Skeleton loader** shimmer while computing.
   - The results screen will render beautifully.
6. **Action items**:
   - Click **Copy** to duplicate text menus.
   - Click **TXT** or **PDF** to download locally. Open the PDF to verify the clean print invoice styling.
   - Select 👍 or 👎, choose **5 stars**, write a short comment, and click **Submit Feedback**.
7. **History Review**: Navigate to **History**. Search for your event name. Click the view eye icon to reload the suggestions dashboard.
8. **Dashboard Analytics**: Click **Admin Dashboard** to verify that your feedback has updated total stats, average stars, and is reflected on the SVG traffic chart.

---

## 🚀 Deployment Guide

### Frontend Deployment (Vercel)
1. Install Vercel CLI or link Vercel to your Git repository containing the `frontend` subfolder.
2. **Build Settings**:
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**:
   - Add `VITE_API_URL` pointing to your deployed backend URL (e.g., `https://cakes-crunches-api.onrender.com/api`).

### Backend Deployment (Render or Railway)
1. Deploy the `backend` subfolder as a Node Web Service.
2. **Build & Start Settings**:
   - Build Command: `npm install`
   - Start Command: `node src/server.js`
3. **Database Persistence (Render/Railway disks)**:
   - Since SQLite writes to a local file, configure a **Persistent Disk Mount** at `/opt/database` and configure the database path to write inside the mount, OR deploy a quick PostgreSQL database on Render/Railway, install `pg` driver, and update `backend/src/config/db.js` connection pool using your connection environment variables.
4. **Environment Variables**:
   - Add `PORT` (e.g. `5000` or let environment bind it).
   - Add `JWT_SECRET`.
   - Add `GEMINI_API_KEY`.
