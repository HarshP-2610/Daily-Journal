import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import dns from 'dns';
import User from './models/User.js';
import Entry from './models/Entry.js';

dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    "https://daily-learning-journal-beryl.vercel.app",
    "http://localhost:5000",
    "http://localhost:5173"
  ],
  credentials: true
}));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    const adminEmail = 'Admin@journal.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const admin = new User({
        name: 'Admin',
        email: adminEmail,
        password: 'Admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('Default admin user created.');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    // In a real app, hash the password! Here we keep it plain for simplicity as requested.
    const user = new User({ name, email, password, role: 'user' });
    await user.save();
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Users Route (for admin)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Entries Routes
app.get('/api/entries', async (req, res) => {
  try {
    const entries = await Entry.find().sort({ createdAt: -1 });
    res.json(entries.map(e => ({ ...e.toObject(), id: e._id })));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/entries', async (req, res) => {
  try {
    const entry = new Entry(req.body);
    await entry.save();
    res.status(201).json({ ...entry.toObject(), id: entry._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/entries/:id', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ ...entry.toObject(), id: entry._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/entries/:id', async (req, res) => {
  try {
    await Entry.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
