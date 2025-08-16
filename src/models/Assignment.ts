import mongoose, { Schema } from 'mongoose';
import { IAssignment, IAttachment } from '../types';

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

const assignmentSchema = new Schema<IAssignment>({
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required'],
    maxlength: [10000, 'Description cannot exceed 10,000 characters']
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
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Instructor is required']
  },
  instructorName: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: [1, 'Maximum marks must be at least 1']
  },
  attachments: [attachmentSchema],
  instructions: [{
    type: String,
    trim: true
  }],
  submissionFormat: [{
    type: String,
    trim: true,
    enum: ['pdf', 'doc', 'docx', 'txt', 'zip', 'ppt', 'pptx']
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
assignmentSchema.index({ title: 'text', description: 'text' });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ subject: 1 });
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ department: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isActive: 1 });
assignmentSchema.index({ createdAt: -1 });

// Virtual for time remaining
assignmentSchema.virtual('timeRemaining').get(function(this: any) {
  const now = new Date();
  const timeDiff = this.dueDate.getTime() - now.getTime();
  
  if (timeDiff <= 0) {
    return 'Expired';
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} remaining`;
  } else {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  }
});

// Virtual for status
assignmentSchema.virtual('status').get(function(this: any) {
  const now = new Date();
  if (!this.isActive) return 'Inactive';
  if (this.dueDate < now) return 'Expired';
  return 'Active';
});

export const Assignment = mongoose.model<IAssignment>('Assignment', assignmentSchema);