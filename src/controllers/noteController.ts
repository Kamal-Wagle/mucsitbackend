import { Request, Response } from 'express';
import { Note } from '../models/Note';
import { AuthRequest } from '../types';
import { createApiResponse, createPaginatedResponse, handleAsync } from '../utils/response';

export const createNote = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const userFullName = req.user?.fullName;
    
    const noteData = {
      ...req.body,
      author: userId,
      authorName: userFullName
    };

    const note = new Note(noteData);
    await note.save();

    res.status(201).json(createApiResponse(true, 'Note created successfully', note));
  } catch (error: any) {
    console.error('Note creation error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to create note', null, error.message));
  }
});

export const getNotes = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      department,
      subject,
      course,
      author,
      isPublic
    } = req.query as any;

    const query: any = {};

    // Build query filters
    if (search) {
      query.$text = { $search: search };
    }

    if (department) query.department = department;
    if (subject) query.subject = subject;
    if (course) query.course = course;
    if (author) query.author = author;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    // If user is not authenticated or not admin, only show public notes
    if (!req.user || req.user.role !== 'admin') {
      query.isPublic = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notes, total] = await Promise.all([
      Note.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('author', 'firstName lastName fullName')
        .select('-content'), // Exclude content for list view
      Note.countDocuments(query)
    ]);

    res.json(createPaginatedResponse(true, 'Notes retrieved successfully', notes, parseInt(page), parseInt(limit), total));
  } catch (error: any) {
    console.error('Notes retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve notes', null, error.message));
  }
});

export const getNoteById = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params?.id;
    const note = await Note.findById(noteId).populate('author', 'firstName lastName fullName');

    if (!note) {
      res.status(404).json(createApiResponse(false, 'Note not found'));
      return;
    }

    // Check if note is public or user has access
    if (!note.isPublic) {
      if (!req.user || (req.user._id.toString() !== note.author.toString() && req.user.role !== 'admin')) {
        res.status(403).json(createApiResponse(false, 'Access denied'));
        return;
      }
    }

    // Increment views count
    await Note.findByIdAndUpdate(noteId, { $inc: { views: 1 } });

    res.json(createApiResponse(true, 'Note retrieved successfully', note));
  } catch (error: any) {
    console.error('Note retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve note', null, error.message));
  }
});

export const updateNote = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params?.id;
    const userId = req.user?._id;

    const note = await Note.findById(noteId);

    if (!note) {
      res.status(404).json(createApiResponse(false, 'Note not found'));
      return;
    }

    // Check ownership or admin access
    if (note.author.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      res.status(403).json(createApiResponse(false, 'Access denied. You can only update your own notes'));
      return;
    }

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('author', 'firstName lastName fullName');

    res.json(createApiResponse(true, 'Note updated successfully', updatedNote));
  } catch (error: any) {
    console.error('Note update error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to update note', null, error.message));
  }
});

export const deleteNote = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params?.id;
    const userId = req.user?._id;

    const note = await Note.findById(noteId);

    if (!note) {
      res.status(404).json(createApiResponse(false, 'Note not found'));
      return;
    }

    // Check ownership or admin access
    if (note.author.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      res.status(403).json(createApiResponse(false, 'Access denied. You can only delete your own notes'));
      return;
    }

    await Note.findByIdAndDelete(noteId);

    res.json(createApiResponse(true, 'Note deleted successfully'));
  } catch (error: any) {
    console.error('Note deletion error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to delete note', null, error.message));
  }
});

export const getMyNotes = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      subject,
      course
    } = req.query as any;

    const query: any = { author: userId };

    if (search) {
      query.$text = { $search: search };
    }

    if (subject) query.subject = subject;
    if (course) query.course = course;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [notes, total] = await Promise.all([
      Note.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-content'), // Exclude content for list view
      Note.countDocuments(query)
    ]);

    res.json(createPaginatedResponse(true, 'Your notes retrieved successfully', notes, parseInt(page), parseInt(limit), total));
  } catch (error: any) {
    console.error('My notes retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve your notes', null, error.message));
  }
});

export const downloadNote = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const noteId = req.params?.id;
    const note = await Note.findById(noteId);

    if (!note) {
      res.status(404).json(createApiResponse(false, 'Note not found'));
      return;
    }

    // Check if note is public or user has access
    if (!note.isPublic) {
      if (!req.user || (req.user._id.toString() !== note.author.toString() && req.user.role !== 'admin')) {
        res.status(403).json(createApiResponse(false, 'Access denied'));
        return;
      }
    }

    // Increment downloads count
    await Note.findByIdAndUpdate(noteId, { $inc: { downloads: 1 } });

    // Set appropriate headers for download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${note.title}.txt"`);
    
    res.send(note.content);
  } catch (error: any) {
    console.error('Note download error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to download note', null, error.message));
  }
});