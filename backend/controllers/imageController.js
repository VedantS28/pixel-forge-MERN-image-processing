const Image = require('../models/image');
const { processImage } = require('../utils/imageProcessor');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; 


const storage = multer.memoryStorage();
const upload = multer({ storage });

const UPLOAD_DIR = 'uploads';

(async () => {
    try {
        await fs.mkdir(UPLOAD_DIR, { recursive: true });
    } catch (error) {
        console.error('Error creating upload directory:', error);
    }
})();

exports.uploadImage = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (!file.buffer || file.buffer.length === 0) {
            return res.status(400).json({ message: 'File buffer is empty' });
        }
        const fileName = `${Date.now()}_${path.basename(file.originalname)}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        await fs.writeFile(filePath, file.buffer);
        const fileUrl = `http://localhost:3000/${filePath}`; // Adjust URL as needed
        const newImage = new Image({
            url: fileUrl,
        });
        await newImage.save();

        res.status(201).json(newImage);
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.transformImage = async (req, res) => {
    try {
        const image = await Image.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Fetch the image from the local filesystem
        const filePath = image.url.replace('http://localhost:3000/', ''); // Adjust URL replacement as needed
        const fileBuffer = await fs.readFile(filePath);

        // Process the image using the file buffer and transformations object
        const transformedImage = await processImage(fileBuffer, req.body.transformations);

        res.set('Content-Type', 'image/jpeg');
        res.send(transformedImage);
    } catch (err) {
        console.error('Transform error:', err);
        res.status(500).json({ message: err.message });
    }
};