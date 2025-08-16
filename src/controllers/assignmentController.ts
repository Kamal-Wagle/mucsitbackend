import { Request, Response } from 'express';
import { Assignment } from '../models/Assignment';
import { AuthRequest } from '../types';
import { createApiResponse, createPaginatedResponse, handleAsync } from '../utils/response';

export const createAssignment = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const userFullName = req.user?.fullName;
    
    const assignmentData = {
      ...req.body,
      instructor: userId,
      instructorName: userFullName
    };

    const assignment = new Assignment(assignmentData);
    await assignment.save();

    res.status(201).json(createApiResponse(true, 'Assignment created successfully', assignment));
  } catch (error: any) {
    console.error('Assignment creation error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to create assignment', null, error.message));
  }
});

export const getAssignments = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      department,
      subject,
      course,
      instructor,
      isActive
    } = req.query as any;

    const query: any = {};

    // Build query filters
    if (search) {
      query.$text = { $search: search };
    }

    if (department) query.department = department;
    if (subject) query.subject = subject;
    if (course) query.course = course;
    if (instructor) query.instructor = instructor;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('instructor', 'firstName lastName fullName'),
      Assignment.countDocuments(query)
    ]);

    res.json(createPaginatedResponse(true, 'Assignments retrieved successfully', assignments, parseInt(page), parseInt(limit), total));
  } catch (error: any) {
    console.error('Assignments retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve assignments', null, error.message));
  }
});

export const getAssignmentById = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.id;

    const assignment = await Assignment.findById(assignmentId).populate('instructor', 'firstName lastName fullName');

    if (!assignment) {
      return res.status(404).json(createApiResponse(false, 'Assignment not found'));
    }

    return res.json(createApiResponse(true, 'Assignment retrieved successfully', assignment));
  } catch (error: any) {
    console.error('Assignment retrieval error:', error);
    return res.status(500).json(createApiResponse(false, 'Failed to retrieve assignment', null, error.message));
  }
});

export const updateAssignment = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user?._id;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json(createApiResponse(false, 'Assignment not found'));
    }

    // Check ownership or admin access
    if (assignment.instructor.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      return res.status(403).json(createApiResponse(false, 'Access denied. You can only update your own assignments'));
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      assignmentId,
      { ...req.body },
      { new: true, runValidators: true }
    ).populate('instructor', 'firstName lastName fullName');

    return res.json(createApiResponse(true, 'Assignment updated successfully', updatedAssignment));
  } catch (error: any) {
    console.error('Assignment update error:', error);
    return res.status(500).json(createApiResponse(false, 'Failed to update assignment', null, error.message));
  }
});

export const deleteAssignment = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const assignmentId = req.params.id;
    const userId = req.user?._id;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json(createApiResponse(false, 'Assignment not found'));
    }

    // Check ownership or admin access
    if (assignment.instructor.toString() !== userId?.toString() && req.user?.role !== 'admin') {
      return res.status(403).json(createApiResponse(false, 'Access denied. You can only delete your own assignments'));
    }

    await Assignment.findByIdAndDelete(assignmentId);

    return res.json(createApiResponse(true, 'Assignment deleted successfully'));
  } catch (error: any) {
    console.error('Assignment deletion error:', error);
    return res.status(500).json(createApiResponse(false, 'Failed to delete assignment', null, error.message));
  }
});

export const getMyAssignments = handleAsync(async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      subject,
      course,
      isActive
    } = req.query as any;

    const query: any = { instructor: userId };

    if (search) {
      query.$text = { $search: search };
    }

    if (subject) query.subject = subject;
    if (course) query.course = course;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [assignments, total] = await Promise.all([
      Assignment.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Assignment.countDocuments(query)
    ]);

    res.json(createPaginatedResponse(true, 'Your assignments retrieved successfully', assignments, parseInt(page), parseInt(limit), total));
  } catch (error: any) {
    console.error('My assignments retrieval error:', error);
    res.status(500).json(createApiResponse(false, 'Failed to retrieve your assignments', null, error.message));
  }
});