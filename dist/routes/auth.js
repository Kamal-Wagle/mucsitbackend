"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const validation_2 = require("../middleware/validation");
const security_1 = require("../middleware/security");
const router = (0, express_1.Router)();
router.post('/register', security_1.authRateLimit, (0, validation_1.validateRequest)(validation_2.registerSchema), authController_1.register);
router.post('/login', security_1.authRateLimit, (0, validation_1.validateRequest)(validation_2.loginSchema), authController_1.login);
router.use(auth_1.authenticate);
router.get('/profile', authController_1.getProfile);
router.put('/profile', authController_1.updateProfile);
router.post('/change-password', authController_1.changePassword);
router.post('/logout', authController_1.logout);
exports.default = router;
//# sourceMappingURL=auth.js.map