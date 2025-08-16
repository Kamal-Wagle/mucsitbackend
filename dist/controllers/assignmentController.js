"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyAssignments = exports.deleteAssignment = exports.updateAssignment = exports.getAssignmentById = exports.getAssignments = exports.createAssignment = void 0;
const Assignment_1 = require("../models/Assignment");
const response_1 = require("../utils/response");
exports.createAssignment = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const userId = req.user?._id;
        const userFullName = req.user?.fullName;
        const assignmentData = {
            ...req.body,
            instructor: userId,
            instructorName: userFullName
        };
        const assignment = new Assignment_1.Assignment(assignmentData);
        await assignment.save();
        res.status(201).json((0, response_1.createApiResponse)(true, 'Assignment created successfully', assignment));
    }
    catch (error) {
        console.error('Assignment creation error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to create assignment', null, error.message));
    }
});
exports.getAssignments = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = '-createdAt', search, department, subject, course, instructor, isActive } = req.query;
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
        if (instructor)
            query.instructor = instructor;
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [assignments, total] = await Promise.all([
            Assignment_1.Assignment.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .populate('instructor', 'firstName lastName fullName'),
            Assignment_1.Assignment.countDocuments(query)
        ]);
        res.json((0, response_1.createPaginatedResponse)(true, 'Assignments retrieved successfully', assignments, parseInt(page), parseInt(limit), total));
    }
    catch (error) {
        console.error('Assignments retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve assignments', null, error.message));
    }
});
exports.getAssignmentById = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const assignment = await Assignment_1.Assignment.findById(assignmentId).populate('instructor', 'firstName lastName fullName');
        if (!assignment) {
            return res.status(404).json((0, response_1.createApiResponse)(false, 'Assignment not found'));
        }
        return res.json((0, response_1.createApiResponse)(true, 'Assignment retrieved successfully', assignment));
    }
    catch (error) {
        console.error('Assignment retrieval error:', error);
        return res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve assignment', null, error.message));
    }
});
exports.updateAssignment = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.user?._id;
        const assignment = await Assignment_1.Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json((0, response_1.createApiResponse)(false, 'Assignment not found'));
        }
        if (assignment.instructor.toString() !== userId?.toString() && req.user?.role !== 'admin') {
            return res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied. You can only update your own assignments'));
        }
        const updatedAssignment = await Assignment_1.Assignment.findByIdAndUpdate(assignmentId, { ...req.body }, { new: true, runValidators: true }).populate('instructor', 'firstName lastName fullName');
        return res.json((0, response_1.createApiResponse)(true, 'Assignment updated successfully', updatedAssignment));
    }
    catch (error) {
        console.error('Assignment update error:', error);
        return res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to update assignment', null, error.message));
    }
});
exports.deleteAssignment = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const assignmentId = req.params.id;
        const userId = req.user?._id;
        const assignment = await Assignment_1.Assignment.findById(assignmentId);
        if (!assignment) {
            return res.status(404).json((0, response_1.createApiResponse)(false, 'Assignment not found'));
        }
        if (assignment.instructor.toString() !== userId?.toString() && req.user?.role !== 'admin') {
            return res.status(403).json((0, response_1.createApiResponse)(false, 'Access denied. You can only delete your own assignments'));
        }
        await Assignment_1.Assignment.findByIdAndDelete(assignmentId);
        return res.json((0, response_1.createApiResponse)(true, 'Assignment deleted successfully'));
    }
    catch (error) {
        console.error('Assignment deletion error:', error);
        return res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to delete assignment', null, error.message));
    }
});
exports.getMyAssignments = (0, response_1.handleAsync)(async (req, res) => {
    try {
        const userId = req.user?._id;
        const { page = 1, limit = 10, sort = '-createdAt', search, subject, course, isActive } = req.query;
        const query = { instructor: userId };
        if (search) {
            query.$text = { $search: search };
        }
        if (subject)
            query.subject = subject;
        if (course)
            query.course = course;
        if (isActive !== undefined)
            query.isActive = isActive === 'true';
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [assignments, total] = await Promise.all([
            Assignment_1.Assignment.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit)),
            Assignment_1.Assignment.countDocuments(query)
        ]);
        res.json((0, response_1.createPaginatedResponse)(true, 'Your assignments retrieved successfully', assignments, parseInt(page), parseInt(limit), total));
    }
    catch (error) {
        console.error('My assignments retrieval error:', error);
        res.status(500).json((0, response_1.createApiResponse)(false, 'Failed to retrieve your assignments', null, error.message));
    }
});
//# sourceMappingURL=assignmentController.js.map