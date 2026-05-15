# Shen Lumabi — Portfolio (Combined)

One project. One server. Everything together.

```
portfolio/
├── server.js          ← Express: API + serves the React site
├── models/
│   └── Contact.js     ← MongoDB schema
├── .env               ← Your secrets (MongoDB URI, passwords)
├── package.json
├── dist/              ← Built React app (auto-generated, don't edit)
└── client/            ← React + Vite source code
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── About.jsx
        │   ├── Projects.jsx
        │   ├── Certifications.jsx
        │   ├── Contact.jsx
        │   ├── AdminLogin.jsx       ← hidden /admin page
        │   └── AdminDashboard.jsx  ← hidden /admin/dashboard
        ├── components/
        └── context/
```

---

## ⚡ Quick Start (3 steps)

### Step 1 — Install everything
```bash
npm run install-all
```

### Step 2 — Set up your .env
Edit `.env` at the root:
```env
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/portfolio
JWT_SECRET=any_long_random_string_here
ADMIN_PASSWORD=your_secret_admin_password
PORT=5000
```
> Get a free MongoDB cluster at https://www.mongodb.com/atlas

### Step 3 — Run in development
```bash
npm run dev
```
- React site  → http://localhost:5173
- Express API → http://localhost:5000
- API calls are automatically proxied from Vite → Express

---

## 🏗 Production (single server)

```bash
# 1. Build the React app
npm run build

# 2. Start Express (serves both API + React)
npm start
```
Now everything runs on **http://localhost:5000** — one URL, one process.

---

## 🔐 Admin Inbox

Go to: **`/admin`** (not linked anywhere on the public site)

- Enter your `ADMIN_PASSWORD` from `.env`
- See all contact form submissions
- Mark as read, delete, or reply via email
- Session lasts 8 hours, then you log in again

---

## 📸 Adding Your Photo

1. Copy your photo into `client/public/` — e.g. `photo.jpg`
2. In `client/src/pages/Home.jsx`, find the `photo-placeholder` div and replace it:
```jsx
<img src="/photo.jpg" alt="Shen Lumabi" />
```
3. Do the same in `client/src/pages/About.jsx` inside `.about-avatar`

---

## 🏆 Adding Certifications

Edit `client/src/pages/Certifications.jsx` — add to the `certs` array:
```js
{
  id: 7,
  icon: '🏆',
  issuer: 'AWS',
  name: 'Cloud Practitioner',
  date: '2025',
  credId: 'AWS-CP-XXXX',
  verifyUrl: 'https://aws.amazon.com/verify',
  image: '/certs/aws.png',  // put image in client/public/certs/
}
```

---

## 🌐 Deploying to Railway / Render (free)

1. Push your project to GitHub
2. Create a new Web Service on Railway or Render
3. Set these environment variables in their dashboard:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_PASSWORD`
   - `PORT=5000`
4. Set the **build command**: `npm run build`
5. Set the **start command**: `npm start`

That's it — one deployment, everything works.
