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
exports.Resource = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
const attachmentSchema = new mongoose_1.Schema({
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
const resourceSchema = new mongoose_1.Schema({
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
        enum: Object.values(types_1.ResourceType),
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
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (value) {
                return this.type === types_1.ResourceType.LINK ? !!this.externalUrl : !!value;
            },
            message: 'File URL is required for non-link resources'
        }
    },
    externalUrl: {
        type: String,
        validate: {
            validator: function (value) {
                if (this.type === types_1.ResourceType.LINK && value) {
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
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ author: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ subject: 1 });
resourceSchema.index({ course: 1 });
resourceSchema.index({ department: 1 });
resourceSchema.index({ isPublic: 1 });
resourceSchema.index({ createdAt: -1 });
resourceSchema.virtual('resourceUrl').get(function () {
    return this.type === types_1.ResourceType.LINK ? this.externalUrl : this.fileUrl;
});
exports.Resource = mongoose_1.default.model('Resource', resourceSchema);
//# sourceMappingURL=Resource.js.map