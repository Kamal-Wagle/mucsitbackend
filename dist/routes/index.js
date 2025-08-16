"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const notes_1 = __importDefault(require("./notes"));
const assignments_1 = __importDefault(require("./assignments"));
const resources_1 = __importDefault(require("./resources"));
const admin_1 = __importDefault(require("./admin"));
const drive_1 = __importDefault(require("./drive"));
const router = (0, express_1.Router)();
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'University API is running successfully',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
router.use('/auth', auth_1.default);
router.use('/notes', notes_1.default);
router.use('/assignments', assignments_1.default);
router.use('/resources', resources_1.default);
router.use('/admin', admin_1.default);
router.use('/drive', drive_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map