import mongoose, { Schema } from 'mongoose';

export interface IDriveFile extends mongoose.Document {
  _id: string;
  driveFileId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  driveUrl: string;
  webViewLink: string;
  webContentLink: string;
  uploadedBy: any; // Using any to match mongoose ObjectId
  uploaderName: string;
  department: string;
  course?: string;
  subject?: string;
  category: string;
  tags: string[];
  isPublic: boolean;
  downloads: number;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const driveFileSchema = new Schema<IDriveFile>({
  driveFileId: {
    type: String,
    required: [true, 'Google Drive file ID is required'],
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [200, 'File name cannot exceed 200 characters']
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  mimeType: {
    type: String,
    required: [true, 'MIME type is required']
  },
  size: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  driveUrl: {
    type: String,
    required: true
  },
  webViewLink: {
    type: String,
    required: true
  },
  webContentLink: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader is required']
  },
  uploaderName: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  course: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['notes', 'assignments', 'resources', 'presentations', 'documents', 'media', 'other']
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  downloads: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
driveFileSchema.index({ name: 'text', tags: 'text' });
driveFileSchema.index({ uploadedBy: 1 });
driveFileSchema.index({ department: 1 });
driveFileSchema.index({ course: 1 });
driveFileSchema.index({ subject: 1 });
driveFileSchema.index({ category: 1 });
driveFileSchema.index({ isPublic: 1 });
driveFileSchema.index({ createdAt: -1 });
driveFileSchema.index({ downloads: -1 });
driveFileSchema.index({ views: -1 });

// Virtual for file extension
driveFileSchema.virtual('extension').get(function(this: any) {
  const parts = this.name.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
});

// Virtual for file type category
driveFileSchema.virtual('fileType').get(function(this: any) {
  const mimeType = this.mimeType.toLowerCase();
  
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
  if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
  
  return 'other';
});

export const DriveFile = mongoose.model<IDriveFile>('DriveFile', driveFileSchema);