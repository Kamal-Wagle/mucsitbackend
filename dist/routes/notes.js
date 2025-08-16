"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noteController_1 = require("../controllers/noteController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, (0, validation_1.validateQuery)(validation_2.paginationSchema), noteController_1.getNotes);
router.get('/:id', auth_1.optionalAuth, noteController_1.getNoteById);
router.get('/:id/download', auth_1.optionalAuth, noteController_1.downloadNote);
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.authorize)(types_1.UserRole.INSTRUCTOR, types_1.UserRole.ADMIN), (0, validation_1.validateRequest)(validation_2.createNoteSchema), noteController_1.createNote);
router.get('/my/notes', (0, validation_1.validateQuery)(validation_2.paginationSchema), noteController_1.getMyNotes);
router.put('/:id', (0, validation_1.validateRequest)(validation_2.updateNoteSchema), noteController_1.updateNote);
router.delete('/:id', noteController_1.deleteNote);
exports.default = router;
//# sourceMappingURL=notes.js.map