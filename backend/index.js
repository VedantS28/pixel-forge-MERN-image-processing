const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const imageRoutes = require('./routes/imageRoutes');

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  }));app.use(express.json());

// Define Routes
app.use('/api/images', imageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));