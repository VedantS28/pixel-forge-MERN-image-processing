const express = require('express');
const cors = require('cors');
const path = require('path');
const { cleanupOldSessions } = require('./config/tempStorage');
const imageRoutes = require('./routes/imageRoutes');

const app = express();

// Init Middleware
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-session-id']
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Define Routes
app.use('/api/images', imageRoutes);

// Periodic cleanup of old temporary files (every 5 minutes)
// Sessions inactive for more than 10 minutes will be cleaned up
setInterval(() => {
    console.log('[CLEANUP] Running periodic cleanup check...');
    cleanupOldSessions(600000); // 10 minutes in milliseconds (600000ms = 10min)
}, 5 * 60 * 1000); // Run every 5 minutes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[SERVER] Server started on port ${PORT}`);
    console.log(`[CLEANUP] Auto-cleanup configured: Sessions older than 10 minutes will be cleaned every 5 minutes`);
});