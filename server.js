const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'https://your-app-name.vercel.app', optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(sanitize());
app.use(xss());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api', limiter);

// MongoDB Connection Function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw new Error('Database connection failed');
  }
};

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  lang: { type: String, enum: ['en', 'fr', 'ar'], default: 'en' },
  consent: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    fr: { type: String, required: true },
    ar: { type: String, required: true }
  },
  excerpt: {
    en: { type: String, required: true },
    fr: { type: String, required: true },
    ar: { type: String, required: true }
  },
  content: {
    en: { type: String, required: true },
    fr: { type: String, required: true },
    ar: { type: String, required: true }
  },
  slug: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});
const Blog = mongoose.model('Blog', blogSchema);

// Middleware to connect to MongoDB for each request
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  next();
});

// Contact Form Submission
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message, lang, consent } = req.body;
    if (!name || !email || !message || !consent) {
      return res.status(400).json({ error: 'All fields and consent are required' });
    }
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    const contact = new Contact({ name, email, message, lang, consent });
    await contact.save();
    res.status(200).json({ message: 'Message saved successfully' });
  } catch (error) {
    console.error('Error saving contact:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Get Blog Posts
app.get('/api/blog', async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const posts = await Blog.find().select(`title.${lang} excerpt.${lang} slug`);
    if (!posts.length) {
      return res.status(404).json({ error: 'No blog posts found' });
    }
    res.status(200).json(posts.map(post => ({
      title: post.title[lang],
      excerpt: post.excerpt[lang],
      slug: post.slug
    })));
  } catch (error) {
    console.error('Error fetching blog posts:', error.message);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Export the app for Vercel
module.exports = app;