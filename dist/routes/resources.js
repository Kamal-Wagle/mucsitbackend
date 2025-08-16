"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const resourceController_1 = require("../controllers/resourceController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const types_1 = require("../types");
const router = (0, express_1.Router)();
router.get('/', auth_1.optionalAuth, (0, validation_1.validateQuery)(validation_2.paginationSchema), resourceController_1.getResources);
router.get('/:id', auth_1.optionalAuth, resourceController_1.getResourceById);
router.get('/:id/download', auth_1.optionalAuth, resourceController_1.downloadResource);
router.use(auth_1.authenticate);
router.post('/', (0, auth_1.authorize)(types_1.UserRole.INSTRUCTOR, types_1.UserRole.ADMIN), (0, validation_1.validateRequest)(validation_2.createResourceSchema), resourceController_1.createResource);
router.get('/my/resources', (0, validation_1.validateQuery)(validation_2.paginationSchema), resourceController_1.getMyResources);
router.put('/:id', (0, validation_1.validateRequest)(validation_2.updateResourceSchema), resourceController_1.updateResource);
router.delete('/:id', resourceController_1.deleteResource);
exports.default = router;
//# sourceMappingURL=resources.js.map