import mongoose, { Schema } from 'mongoose';
import { INote, IAttachment } from '../types';

const attachmentSchema = new Schema<IAttachment>({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const noteSchema = new Schema<INote>({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    maxlength: [50000, 'Content cannot exceed 50,000 characters']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  course: {
    type: String,
    required: [true, 'Course is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  authorName: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  attachments: [attachmentSchema],
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
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ author: 1 });
noteSchema.index({ subject: 1 });
noteSchema.index({ course: 1 });
noteSchema.index({ department: 1 });
noteSchema.index({ isPublic: 1 });
noteSchema.index({ createdAt: -1 });

// // Virtual for excerpt
// noteSchema.virtual('excerpt').get(function() {
//   return this.content.length > 200 ? this.content.substring(0, 200) + '...' : this.content;
// });

export const Note = mongoose.model<INote>('Note', noteSchema);