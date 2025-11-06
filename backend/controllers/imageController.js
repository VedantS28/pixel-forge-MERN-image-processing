const { processImage } = require('../utils/imageProcessor');
const { registerFile, cleanupSession } = require('../config/tempStorage');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; 


const storage = multer.memoryStorage();
const upload = multer({ storage });

const UPLOAD_DIR = 'uploads';

// Store uploaded files metadata in memory
// Structure: { filename: { sessionId, filePath, uploadedAt } }
const uploadedFiles = new Map();

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
            console.log('[UPLOAD] No file uploaded');
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (!file.buffer || file.buffer.length === 0) {
            console.log('[UPLOAD] File buffer is empty');
            return res.status(400).json({ message: 'File buffer is empty' });
        }

        // Get sessionId from request body or headers
        const sessionId = req.body.sessionId || req.headers['x-session-id'];
        if (!sessionId) {
            console.log('[UPLOAD] Session ID is missing');
            return res.status(400).json({ message: 'Session ID is required' });
        }

        console.log(`[UPLOAD] Receiving upload request - SessionID: ${sessionId}, OriginalName: ${file.originalname}, Size: ${file.buffer.length} bytes`);

        const fileName = `${Date.now()}_${path.basename(file.originalname)}`;
        const filePath = path.join(UPLOAD_DIR, fileName);
        
    // Write file to disk
    await fs.writeFile(filePath, file.buffer);
    console.log(`[UPLOAD] File saved to disk: ${filePath}`);

    // Register file for cleanup with session
    registerFile(sessionId, filePath);
    console.log(`[UPLOAD] File registered for cleanup with session: ${sessionId}`);
        
        // Store metadata in memory
        uploadedFiles.set(fileName, {
            sessionId,
            filePath,
            uploadedAt: Date.now()
        });

        // Construct the base URL dynamically
        // In production (Render), use the deployed URL
        // In development, use localhost
        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
        const fileUrl = `${baseUrl}/${filePath.replace(/\\/g, '/')}`;

        console.log(`[UPLOAD] Upload successful - Filename: ${fileName}, URL: ${fileUrl}`);
        res.status(201).json({
            message: 'Image uploaded successfully',
            imageUrl: fileUrl,
            filename: fileName,
            sessionId
        });
    } catch (err) {
        console.error('[UPLOAD] ❌ Upload error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.transformImage = async (req, res) => {
    try {
        const { filename } = req.params;
    console.log(`[TRANSFORM] Transform request received for: ${filename}`);
        
        // Get file metadata from memory
        const fileMetadata = uploadedFiles.get(filename);
        if (!fileMetadata) {
            console.log(`[TRANSFORM] File not found: ${filename}`);
            return res.status(404).json({ message: 'Image not found' });
        }

        console.log(`[TRANSFORM] File found - SessionID: ${fileMetadata.sessionId}, Path: ${fileMetadata.filePath}`);

        // Read the image file
        const fileBuffer = await fs.readFile(fileMetadata.filePath);
    console.log(`[TRANSFORM] File read from disk - Size: ${fileBuffer.length} bytes`);

        // Convert transformation parameters to integers where necessary
        const transformations = { ...req.body.transformations };
        if (transformations.width) {
            transformations.width = parseInt(transformations.width, 10);
        }
        if (transformations.height) {
            transformations.height = parseInt(transformations.height, 10);
        }
        
    console.log(`[TRANSFORM] Applying transformations:`, JSON.stringify(transformations, null, 2));
        
        // Process the image using the file buffer and transformations object
        const transformedImage = await processImage(fileBuffer, transformations);

    console.log(`[TRANSFORM] Transformation successful - Output size: ${transformedImage.length} bytes`);
        res.set('Content-Type', 'image/jpeg');
        res.send(transformedImage);
    } catch (err) {
        console.error('[TRANSFORM] ❌ Transform error:', err);
        res.status(500).json({ message: err.message });
    }
};

// Cleanup session endpoint
exports.cleanupSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
    console.log(`[CLEANUP] Manual cleanup request received for SessionID: ${sessionId}`);
        
        if (!sessionId) {
            console.log('[CLEANUP] Session ID is missing');
            return res.status(400).json({ message: 'Session ID is required' });
        }

        // Count files to be removed
        let fileCount = 0;

        // Remove files from memory map
        for (const [filename, metadata] of uploadedFiles.entries()) {
            if (metadata.sessionId === sessionId) {
                console.log(`[CLEANUP] Removing from memory: ${filename}`);
                uploadedFiles.delete(filename);
                fileCount++;
            }
        }

        console.log(`[CLEANUP] Removed ${fileCount} file(s) from memory for SessionID: ${sessionId}`);

        // Clean up files from disk
        await cleanupSession(sessionId);

        console.log(`[CLEANUP] Session cleanup completed for SessionID: ${sessionId}`);
        res.json({ message: 'Session cleaned up successfully' });
    } catch (err) {
        console.error('[CLEANUP] ❌ Cleanup error:', err);
        res.status(500).json({ message: err.message });
    }
};