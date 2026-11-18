# 🎬 PrimePlay — Prime Video Clone

A full-stack OTT streaming platform built with **React + Vite**, **Node.js/Express**, and **MongoDB Atlas**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React |
| Backend | Node.js, Express.js, JWT Auth, bcryptjs |
| Database | MongoDB Atlas (Mongoose) |
| Deployment | Render (Frontend Static Site + Backend Web Service) |
| Movie Data | TMDB API (optional) + Local fallback dataset |

---

## 📁 Project Structure

```
PRIME VIDEO CLONE/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── components/        # Navbar, HeroBanner, Carousel, MovieCard, etc.
│   │   ├── context/           # AuthContext (auth + watchlist + history state)
│   │   ├── data/              # Local movie fallback dataset
│   │   ├── pages/             # HomePage, MoviesPage, TVShowsPage, etc.
│   │   └── services/          # API service layer (axios)
│   ├── .env                   # VITE_API_URL
│   └── vercel.json            # SPA routing fallback
│
├── backend/                   # Express REST API
│   ├── config/                # MongoDB connection
│   ├── controllers/           # Route logic
│   ├── middleware/            # JWT auth, error handler
│   ├── models/                # User, Movie, Watchlist, WatchHistory
│   ├── routes/                # Express routers
│   ├── utils/                 # seed.js (seed local movies)
│   ├── server.js              # App entry point
│   └── .env                   # Backend environment variables
│
├── render.yaml                # Render deploy config
├── .gitignore
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or local MongoDB)
- TMDB API key (optional — local fallback works without it)

---

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/primeplay.git
cd "PRIME VIDEO CLONE"
```

---

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file (copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/primeplay
JWT_SECRET=your_super_secret_key_here
TMDB_API_KEY=your_tmdb_api_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Seed the database with sample movies:

```bash
npm run seed
```

Start the backend server:

```bash
npm run dev
```

Backend will run at: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

---

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create your `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend will run at: `http://localhost:5173`

---

## 🌐 Deploying on Render

Both **backend** and **frontend** are deployed on Render.

---

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit — PrimePlay"
git remote add origin https://github.com/YOUR_USERNAME/primeplay.git
git push -u origin main
```

> ⚠️ Make sure `.gitignore` excludes `.env` files before pushing!

---

### Step 2 — Deploy Backend (Web Service)

1. Go to [https://render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `primeplay-backend` |
| **Root Directory** | `backend` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |

4. Add **Environment Variables**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `MONGODB_URI` | your MongoDB Atlas connection string |
| `JWT_SECRET` | a strong random secret key |
| `TMDB_API_KEY` | your TMDB API key (optional) |
| `CLIENT_URL` | your frontend Render URL (add after frontend deploy) |

5. Click **Create Web Service**
6. Copy the backend URL (e.g., `https://primeplay-backend.onrender.com`)

---

### Step 3 — Deploy Frontend (Static Site)

1. Go to Render → **New +** → **Static Site**
2. Connect the same GitHub repository
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `primeplay-frontend` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

4. Add **Environment Variable**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://primeplay-backend.onrender.com/api` |

5. Add **Redirect/Rewrite Rule** for SPA routing:

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | Rewrite |

6. Click **Create Static Site**
7. Copy the frontend URL (e.g., `https://primeplay-frontend.onrender.com`)

---

### Step 4 — Update Backend CORS

Go back to your **backend** web service on Render → **Environment** → update:

```
CLIENT_URL=https://primeplay-frontend.onrender.com
```

Then click **Save Changes** (auto-redeploys).

---

### Step 5 — Seed the Database

After deploying backend, open Render → your backend service → **Shell** tab:

```bash
node utils/seed.js
```

This seeds 20 sample movies into your MongoDB Atlas database.

---

## 🔑 Getting a TMDB API Key (Optional but Recommended)

1. Go to [https://www.themoviedb.org](https://www.themoviedb.org)
2. Create a free account
3. Go to **Settings → API → Create API Key**
4. Add the key as `TMDB_API_KEY` in your backend environment variables
5. The app will automatically use live TMDB data instead of the local fallback

---

## 🔐 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (protected) |

### Movies
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/movies` | Get movies (category, sort, page) |
| GET | `/api/movies/trending` | Trending movies/shows |
| GET | `/api/movies/search?q=` | Search movies |
| GET | `/api/movies/:id` | Movie details |
| GET | `/api/movies/:id/similar` | Similar movies |
| GET | `/api/movies/genre/:genre` | Movies by genre |

### TV Shows
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shows` | Get TV shows |
| GET | `/api/shows/:id` | Show details |

### Watchlist (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist` | Get user's watchlist |
| POST | `/api/watchlist` | Add to watchlist |
| DELETE | `/api/watchlist/:movieId` | Remove from watchlist |
| GET | `/api/watchlist/check/:movieId` | Check if in watchlist |

### Watch History (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get watch history |
| POST | `/api/history` | Update history |
| DELETE | `/api/history/:movieId` | Remove entry |
| DELETE | `/api/history` | Clear all history |

### User Profile (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/profile` | Get profile |
| PUT | `/api/users/profile` | Update profile |
| PUT | `/api/users/password` | Change password |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

---

## ✨ Features

- 🎬 **Cinematic homepage** with auto-rotating hero banners
- 🔍 **Search** with real-time results
- 🎭 **Genre filtering** and sorting
- 🔐 **JWT authentication** (register, login, logout)
- 📋 **Personal watchlist** (add/remove movies)
- ⏱️ **Watch history** with playback progress
- ▶️ **Full-screen video player** (play, pause, seek, volume, speed, fullscreen)
- 📱 **Fully responsive** (mobile, tablet, desktop)
- 🌐 **TMDB API integration** with local fallback dataset
- 🌙 **Dark navy theme** inspired by Prime Video

---

## 🛡️ Security Features

- Passwords hashed with **bcryptjs (12 salt rounds)**
- **JWT tokens** (30-day expiry) stored in localStorage
- Protected API routes via middleware
- **Rate limiting** on auth endpoints (20 req / 15 min)
- CORS restricted to known origins
- No sensitive data in API error responses

---

## 📝 Notes

- Video playback uses a **public-domain sample video** (Big Buck Bunny) for demonstration
- Movie posters and metadata are fetched from **TMDB** (when API key provided)
- The app works fully **without a TMDB key** using the built-in 20-movie fallback dataset
- This project is built for **educational/portfolio purposes**
