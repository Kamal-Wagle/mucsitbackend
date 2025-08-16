import mongoose, { Schema } from 'mongoose';
import { IResource, ResourceType, IAttachment } from '../types';

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

const resourceSchema = new Schema<IResource>({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Resource description is required'],
    maxlength: [5000, 'Description cannot exceed 5,000 characters']
  },
  type: {
    type: String,
    enum: Object.values(ResourceType),
    required: [true, 'Resource type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
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
  fileUrl: {
    type: String,
    validate: {
      validator: function(this: IResource, value: string) {
        return this.type === ResourceType.LINK ? !!this.externalUrl : !!value;
      },
      message: 'File URL is required for non-link resources'
    }
  },
  externalUrl: {
    type: String,
    validate: {
      validator: function(this: IResource, value: string) {
        if (this.type === ResourceType.LINK && value) {
          const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
          return urlRegex.test(value);
        }
        return true;
      },
      message: 'Please enter a valid URL'
    }
  },
  attachments: [attachmentSchema],
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
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ author: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ subject: 1 });
resourceSchema.index({ course: 1 });
resourceSchema.index({ department: 1 });
resourceSchema.index({ isPublic: 1 });
resourceSchema.index({ createdAt: -1 });

// Virtual for resource URL
resourceSchema.virtual('resourceUrl').get(function(this: any) {
  return this.type === ResourceType.LINK ? this.externalUrl : this.fileUrl;
});

export const Resource = mongoose.model<IResource>('Resource', resourceSchema);