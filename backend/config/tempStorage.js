const fs = require('fs').promises;
const path = require('path');

// Store active sessions and their files
// Structure: { sessionId: { files: [filePaths], lastActivity: timestamp } }
const activeSessions = new Map();

// Register a file for cleanup
const registerFile = (sessionId, filePath) => {
    console.log(`[TEMP-STORAGE] Registering file for SessionID: ${sessionId}, Path: ${filePath}`);

    if (!activeSessions.has(sessionId)) {
        activeSessions.set(sessionId, {
            files: [],
            lastActivity: Date.now()
        });
        console.log(`[TEMP-STORAGE] New session created: ${sessionId}`);
    }

    const session = activeSessions.get(sessionId);
    session.files.push(filePath);
    session.lastActivity = Date.now();

    console.log(`[TEMP-STORAGE] File registered - Total files in session: ${session.files.length}`);
};

// Clean up files for a specific session
const cleanupSession = async (sessionId) => {
    console.log(`[TEMP-STORAGE] Cleaning up SessionID: ${sessionId}`);

    const session = activeSessions.get(sessionId);
    if (session) {
        console.log(`[TEMP-STORAGE] Found ${session.files.length} file(s) to delete`);

        for (const filePath of session.files) {
            try {
                await fs.unlink(filePath);
                console.log(`[TEMP-STORAGE] Deleted: ${filePath}`);
            } catch (err) {
                console.error(`[TEMP-STORAGE] Failed to delete ${filePath}:`, err.message);
            }
        }
        activeSessions.delete(sessionId);
        console.log(`[TEMP-STORAGE] Session ${sessionId} cleaned up successfully`);
    } else {
        console.log(`[TEMP-STORAGE] Session ${sessionId} not found (already cleaned or never existed)`);
    }
};

// Cleanup old sessions (sessions inactive for more than maxAge milliseconds)
const cleanupOldSessions = async (maxAge = 3600000) => { // 1 hour default
    const now = Date.now();
    const sessionsToCleanup = [];

    console.log(`[TEMP-STORAGE] Checking for sessions older than ${maxAge / 1000 / 60} minutes...`);
    console.log(`[TEMP-STORAGE] Total active sessions: ${activeSessions.size}`);

    for (const [sessionId, session] of activeSessions.entries()) {
        const inactiveTime = now - session.lastActivity;
        const inactiveMinutes = Math.floor(inactiveTime / 1000 / 60);

        if (inactiveTime > maxAge) {
            console.log(`[TEMP-STORAGE] Session ${sessionId} inactive for ${inactiveMinutes} minutes - Marking for cleanup`);
            sessionsToCleanup.push(sessionId);
        }
    }

    for (const sessionId of sessionsToCleanup) {
        await cleanupSession(sessionId);
    }

    if (sessionsToCleanup.length > 0) {
        console.log(`[TEMP-STORAGE] Cleaned up ${sessionsToCleanup.length} old session(s)`);
    } else {
        console.log(`[TEMP-STORAGE] No old sessions to clean up`);
    }
};

// cleanupOrphanedFiles: delete files in uploads/ older than maxAge (ms)
const cleanupOrphanedFiles = async (maxAge = 60 * 60 * 1000) => { // default 1 hour
    const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
    try {
        console.log(`[TEMP-STORAGE] Scanning ${UPLOADS_DIR} for orphaned files older than ${maxAge / 1000 / 60} minutes`);
        const files = await fs.readdir(UPLOADS_DIR);
        const now = Date.now();
        let removed = 0;

        for (const file of files) {
            try {
                const filePath = path.join(UPLOADS_DIR, file);
                const stat = await fs.stat(filePath);
                const age = now - stat.mtimeMs;
                if (age > maxAge) {
                    await fs.unlink(filePath);
                    removed++;
                    console.log(`[TEMP-STORAGE] Orphan removed: ${filePath}`);
                }
            } catch (innerErr) {
                console.error(`[TEMP-STORAGE] Failed checking/removing ${file}:`, innerErr.message);
            }
        }
        console.log(`[TEMP-STORAGE] Orphan cleanup completed. Removed ${removed} file(s).`);
    } catch (err) {
        console.error('[TEMP-STORAGE] Orphan cleanup failed:', err.message);
    }
};

// Get session info (for debugging)
const getSessionInfo = (sessionId) => {
    return activeSessions.get(sessionId);
};

// Get all active sessions count
const getActiveSessionsCount = () => {
    return activeSessions.size;
};

module.exports = {
    registerFile,
    cleanupSession,
    cleanupOldSessions,
    cleanupOrphanedFiles,
    getSessionInfo,
    getActiveSessionsCount,
    activeSessions
};
