"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriveFile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const driveFileSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
driveFileSchema.virtual('extension').get(function () {
    const parts = this.name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
});
driveFileSchema.virtual('fileType').get(function () {
    const mimeType = this.mimeType.toLowerCase();
    if (mimeType.startsWith('image/'))
        return 'image';
    if (mimeType.startsWith('video/'))
        return 'video';
    if (mimeType.startsWith('audio/'))
        return 'audio';
    if (mimeType.includes('pdf'))
        return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document'))
        return 'document';
    if (mimeType.includes('sheet') || mimeType.includes('excel'))
        return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
        return 'presentation';
    return 'other';
});
exports.DriveFile = mongoose_1.default.model('DriveFile', driveFileSchema);
//# sourceMappingURL=DriveFile.js.map