import { BaseController } from '../controllers/BaseController';
import { IBaseService } from '../interfaces/IService';
export declare class ControllerFactory {
    static createController<T>(service: IBaseService<T>, resourceName: string): BaseController<T>;
}
//# sourceMappingURL=ControllerFactory.d.ts.map