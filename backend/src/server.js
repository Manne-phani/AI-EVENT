require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./config/db');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for simplicity in local dev, configure specifically in prod
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Simple Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets if any
app.use('/static', express.static(path.join(__dirname, '../public')));

// Mount API routes
app.use('/api', routes);

// Serve frontend static assets in production/combined mode
const frontendBuildPath = path.join(__dirname, '../../frontend/dist');
const fs = require('fs');
app.use(express.static(frontendBuildPath));

// Fallback all other routes to React's index.html (SPA routing support)
app.get('*', (req, res) => {
  const indexPath = path.join(frontendBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Cakes & Crunches Backend running. Frontend assets not built yet - please run "npm run build" in the frontend folder.');
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start DB and Server
const startServer = async () => {
  try {
    console.log('Initializing SQLite database tables...');
    await initDb();
    
    app.listen(PORT, () => {
      console.log(`Cakes & Crunches Backend Server running on port ${PORT}`);
      console.log(`API base path: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
