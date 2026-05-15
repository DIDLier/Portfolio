const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const jwt      = require('jsonwebtoken');
const path     = require('path');
const Contact  = require('./models/Contact');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve React build (production) ─────────────────────────
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// ── MongoDB ─────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  family: 4
})
  .then(() => console.log('✅  MongoDB connected'))
  .catch(err => console.error('❌  MongoDB error:', err.message));

// ── Auth middleware ─────────────────────────────────────────
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.admin = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ══════════════════════════════════════════════════════════
//  PUBLIC ROUTES
// ══════════════════════════════════════════════════════════

// POST /api/contact  — submit contact form
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ error: 'Name, email and message are required.' });
  try {
    const doc = await Contact.create({ name, email, subject, message });
    res.status(201).json({ success: true, id: doc._id });
  } catch {
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════
//  ADMIN ROUTES  (hidden — only you know /admin exists)
// ══════════════════════════════════════════════════════════

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password)                          return res.status(400).json({ error: 'Password required.' });
  if (password !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: 'Incorrect password.' });
  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token });
});

// GET  /api/admin/contacts
app.get('/api/admin/contacts', auth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET  /api/admin/stats
app.get('/api/admin/stats', auth, async (req, res) => {
  try {
    const total  = await Contact.countDocuments();
    const unread = await Contact.countDocuments({ read: false });
    const today  = await Contact.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });
    res.json({ total, unread, today });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// PATCH /api/admin/contacts/:id/read
app.patch('/api/admin/contacts/:id/read', auth, async (req, res) => {
  try {
    const doc = await Contact.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!doc) return res.status(404).json({ error: 'Not found.' });
    res.json(doc);
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/admin/contacts/:id
app.delete('/api/admin/contacts/:id', auth, async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── Catch-all: serve React for any non-API route ────────────
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Start ───────────────────────────────────────────────────
app.listen(PORT, () =>
  console.log(`🚀  Server running → http://localhost:${PORT}`)
);
