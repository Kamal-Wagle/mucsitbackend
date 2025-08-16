"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveIntegrationPlugin = void 0;
const EventEmitter_1 = require("../events/EventEmitter");
const googleDrive_1 = require("../config/googleDrive");
class DriveIntegrationPlugin {
    constructor() {
        this.name = 'DriveIntegrationPlugin';
        this.version = '1.0.0';
    }
    async initialize() {
        console.log('🔌 Initializing Google Drive Integration Plugin...');
        const isConnected = await googleDrive_1.googleDriveConfig.testConnection();
        if (!isConnected) {
            console.warn('⚠️ Google Drive connection failed - plugin will run in limited mode');
        }
        this.setupEventListeners();
        console.log('✅ Google Drive Integration Plugin initialized successfully');
    }
    async destroy() {
        EventEmitter_1.eventEmitter.removeAllListeners('note:created');
        EventEmitter_1.eventEmitter.removeAllListeners('assignment:created');
        EventEmitter_1.eventEmitter.removeAllListeners('resource:created');
        console.log('🔌 Google Drive Integration Plugin destroyed');
    }
    setupEventListeners() {
        EventEmitter_1.eventEmitter.onNoteCreated(async (data) => {
            try {
                if (data.note && data.note.content) {
                    const fileName = `${data.note.title}_${Date.now()}.txt`;
                    const fileBuffer = Buffer.from(data.note.content, 'utf-8');
                    const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
                    await drive.files.create({
                        requestBody: {
                            name: fileName,
                            description: `Auto-backup of note: ${data.note.title}`
                        },
                        media: {
                            mimeType: 'text/plain',
                            body: fileBuffer
                        }
                    });
                    console.log(`📄 Auto-backed up note: ${data.note.title}`);
                }
            }
            catch (error) {
                console.error('Failed to auto-backup note:', error);
            }
        });
        EventEmitter_1.eventEmitter.onAssignmentCreated(async (data) => {
            try {
                if (data.assignment) {
                    const content = `Assignment: ${data.assignment.title}\n\nDescription:\n${data.assignment.description}\n\nDue Date: ${data.assignment.dueDate}\nMax Marks: ${data.assignment.maxMarks}`;
                    const fileName = `Assignment_${data.assignment.title}_${Date.now()}.txt`;
                    const fileBuffer = Buffer.from(content, 'utf-8');
                    const drive = googleDrive_1.googleDriveConfig.getDriveInstance();
                    await drive.files.create({
                        requestBody: {
                            name: fileName,
                            description: `Auto-backup of assignment: ${data.assignment.title}`
                        },
                        media: {
                            mimeType: 'text/plain',
                            body: fileBuffer
                        }
                    });
                    console.log(`📋 Auto-backed up assignment: ${data.assignment.title}`);
                }
            }
            catch (error) {
                console.error('Failed to auto-backup assignment:', error);
            }
        });
    }
}
exports.DriveIntegrationPlugin = DriveIntegrationPlugin;
//# sourceMappingURL=DriveIntegrationPlugin.js.map