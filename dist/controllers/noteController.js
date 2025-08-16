"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadNote = exports.getMyNotes = exports.deleteNote = exports.updateNote = exports.getNoteById = exports.getNotes = exports.createNote = void 0;
const Note_1 = require("../models/Note");
const response_1 = require("../utils/response");
exports.createNote = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const userId = req.user?._id;
        const userFullName = req.user?.fullName;
        const noteData = {
            ...req.body,
            author: userId,
            authorName: userFullName
        };
        const note = new Note_1.Note(noteData);
        await note.save();
        res.status(201).json((0, response_1.createApiResponse)(true, 'Note created successfully', note));
    }
    catch (error) {
        console.error('Note creation error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to create note', null, error.message));
    }
});
exports.getNotes = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', search, department, subject, course, author, isPublic } = req.query;
        const query = {};
        if (search) {
            query.$text = { $search: search };
        }
        if (department)
            query.department = department;
        if (subject)
            query.subject = subject;
        if (course)
            query.course = course;
        if (author)
            query.author = author;
        if (isPublic !== undefined)
            query.isPublic = isPublic === 'true';
        if (!req.user || req.user.role !== 'admin') {
            query.isPublic = true;
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [notes, total] = await Promise.all([
            Note_1.Note.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('author', 'firstName lastName fullName')
                .select('-content'),
            Note_1.Note.countDocuments(query)
        ]);
        res.json((0, response_1.createPaginatedResponse)(true, 'Notes retrieved successfully', notes, parseInt(page), parseInt(limit), total));
    }
    catch (error) {
        console.error('Notes retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve notes', null, error.message));
    }
});
exports.getNoteById = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const noteId = req.params?.id;
        const note = await Note_1.Note.findById(noteId).populate('author', 'firstName lastName fullName');
        if (!note) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'Note not found'));
            return;
        }
        if (!note.isPublic) {
            if (!req.user || (req.user._id.toString() !== note.author.toString() && req.user.role !== 'admin')) {
                res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied'));
                return;
            }
        }
        await Note_1.Note.findByIdAndUpdate(noteId, { $inc: { views: 1 } });
        res.json((0, response_1.createApiResponse)(true, 'Note retrieved successfully', note));
    }
    catch (error) {
        console.error('Note retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve note', null, error.message));
    }
});
exports.updateNote = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const noteId = req.params?.id;
        const userId = req.user?._id;
        const note = await Note_1.Note.findById(noteId);
        if (!note) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'Note not found'));
            return;
        }
        if (note.author.toString() !== userId?.toString() && req.user?.role !== 'admin') {
            res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied. You can only update your own notes'));
            return;
        }
        const updatedNote = await Note_1.Note.findByIdAndUpdate(noteId, { ...req.body }, { new: true, runValidators: true }).populate('author', 'firstName lastName fullName');
        res.json((0, response_1.createApiResponse)(true, 'Note updated successfully', updatedNote));
    }
    catch (error) {
        console.error('Note update error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to update note', null, error.message));
    }
});
exports.deleteNote = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const noteId = req.params?.id;
        const userId = req.user?._id;
        const note = await Note_1.Note.findById(noteId);
        if (!note) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'Note not found'));
            return;
        }
        if (note.author.toString() !== userId?.toString() && req.user?.role !== 'admin') {
            res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied. You can only delete your own notes'));
            return;
        }
        await Note_1.Note.findByIdAndDelete(noteId);
        res.json((0, response_1.createApiResponse)(true, 'Note deleted successfully'));
    }
    catch (error) {
        console.error('Note deletion error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to delete note', null, error.message));
    }
});
exports.getMyNotes = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10, sort = '-createdAt', search, subject, course } = req.query;
        const query = { author: userId };
        if (search) {
            query.$text = { $search: search };
        }
        if (subject)
            query.subject = subject;
        if (course)
            query.course = course;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [notes, total] = await Promise.all([
            Note_1.Note.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .select('-content'),
            Note_1.Note.countDocuments(query)
        ]);
        res.json((0, response_1.createPaginatedResponse)(true, 'Your notes retrieved successfully', notes, parseInt(page), parseInt(limit), total));
    }
    catch (error) {
        console.error('My notes retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve your notes', null, error.message));
    }
});
exports.downloadNote = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const noteId = req.params?.id;
        const note = await Note_1.Note.findById(noteId);
        if (!note) {
            res.status(404).json((0, response_1.createApiResponse)(false, 'Note not found'));
            return;
        }
        if (!note.isPublic) {
            if (!req.user || (req.user._id.toString() !== note.author.toString() && req.user.role !== 'admin')) {
                res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied'));
                return;
            }
        }
        await Note_1.Note.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } });
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename="${note.title}.txt"`);
        res.send(note.content);
    }
    catch (error) {
        console.error('Note download error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to download note', null, error.message));
    }
});
//# sourceMappingURL=noteController.js.map