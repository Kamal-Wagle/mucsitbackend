import { eventEmitter } from '../events/EventEmitter';
import { driveFileService } from '../services/DriveFileService';
import { googleDriveService } from '../services/GoogleDriveService';
import { googleDriveConfig } from '../config/googleDrive';

interface IPlugin {
  name: string;
  version: string;
  initialize(): Promise<void>;
  destroy(): Promise<void>;
}

export class DriveIntegrationPlugin implements IPlugin {
  name = 'DriveIntegrationPlugin';
  version = '1.0.0';

  async initialize(): Promise<void> {
    console.log('🔌 Initializing Google Drive Integration Plugin...');

    // Test Google Drive connection
    const isConnected = await googleDriveConfig.testConnection();
    if (!isConnected) {
      console.warn('⚠️ Google Drive connection failed - plugin will run in limited mode');
    }

    // Set up event listeners
    this.setupEventListeners();

    console.log('✅ Google Drive Integration Plugin initialized successfully');
  }

  async destroy(): Promise<void> {
    // Remove event listeners
    eventEmitter.removeAllListeners('note:created');
    eventEmitter.removeAllListeners('assignment:created');
    eventEmitter.removeAllListeners('resource:created');
    
    console.log('🔌 Google Drive Integration Plugin destroyed');
  }

  private setupEventListeners(): void {
    // Auto-backup important content to Drive
    eventEmitter.onNoteCreated(async (data) => {
      try {
        if (data.note && data.note.content) {
          const fileName = `${data.note.title}_${Date.now()}.txt`;
          const fileBuffer = Buffer.from(data.note.content, 'utf-8');
          
          const drive = googleDriveConfig.getDriveInstance();
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
      } catch (error) {
        console.error('Failed to auto-backup note:', error);
      }
    });

    eventEmitter.onAssignmentCreated(async (data) => {
      try {
        if (data.assignment) {
          const content = `Assignment: ${data.assignment.title}\n\nDescription:\n${data.assignment.description}\n\nDue Date: ${data.assignment.dueDate}\nMax Marks: ${data.assignment.maxMarks}`;
          const fileName = `Assignment_${data.assignment.title}_${Date.now()}.txt`;
          const fileBuffer = Buffer.from(content, 'utf-8');
          
          const drive = googleDriveConfig.getDriveInstance();
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
      } catch (error) {
        console.error('Failed to auto-backup assignment:', error);
      }
    });
  }
}