"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControllerFactory = void 0;
const BaseController_1 = require("../controllers/BaseController");
class ControllerFactory {
    static createController(service, resourceName) {
        return new (class extends BaseController_1.BaseController {
            getResourceName() {
                return resourceName;
            }
        })(service);
    }
}
exports.ControllerFactory = ControllerFactory;
//# sourceMappingURL=ControllerFactory.js.map