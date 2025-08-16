"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assignmentController_1 = require("../controllers/assignmentController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
router.get('/', (0, validation_1.validateQuery)(validation_2.paginationSchema), assignmentController_1.getAssignments);
router.get('/my/assignments', (0, auth_1.authorize)(types_1.UserRole.INSTRUCTOR, types_1.UserRole.ADMIN), (0, validation_1.validateQuery)(validation_2.paginationSchema), assignmentController_1.getMyAssignments);
router.post('/', (0, auth_1.authorize)(types_1.UserRole.INSTRUCTOR, types_1.UserRole.ADMIN), (0, validation_1.validateRequest)(validation_2.createAssignmentSchema), assignmentController_1.createAssignment);
router.get('/:id', assignmentController_1.getAssignmentById);
router.put('/:id', (0, validation_1.validateRequest)(validation_2.updateAssignmentSchema), assignmentController_1.updateAssignment);
router.delete('/:id', assignmentController_1.deleteAssignment);
exports.default = router;
//# sourceMappingURL=assignments.js.map