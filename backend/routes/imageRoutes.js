const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');
const multer = require('multer');

// Use memory storage so the file buffer is available to imageController
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', upload.single('file'), imageController.uploadImage);
router.post('/:id/transform', imageController.transformImage);

module.exports = router;