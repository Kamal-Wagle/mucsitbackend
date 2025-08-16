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
exports.Assignment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
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
const assignmentSchema = new mongoose_1.Schema({
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
        type: mongoose_1.Schema.Types.ObjectId,
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
            validator: function (value) {
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
assignmentSchema.index({ title: 'text', description: 'text' });
assignmentSchema.index({ instructor: 1 });
assignmentSchema.index({ subject: 1 });
assignmentSchema.index({ course: 1 });
assignmentSchema.index({ department: 1 });
assignmentSchema.index({ dueDate: 1 });
assignmentSchema.index({ isActive: 1 });
assignmentSchema.index({ createdAt: -1 });
assignmentSchema.virtual('timeRemaining').get(function () {
    const now = new Date();
    const timeDiff = this.dueDate.getTime() - now.getTime();
    if (timeDiff <= 0) {
        return 'Expired';
    }
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} remaining`;
    }
    else {
        return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }
});
assignmentSchema.virtual('status').get(function () {
    const now = new Date();
    if (!this.isActive)
        return 'Inactive';
    if (this.dueDate < now)
        return 'Expired';
    return 'Active';
});
exports.Assignment = mongoose_1.default.model('Assignment', assignmentSchema);
//# sourceMappingURL=Assignment.js.map