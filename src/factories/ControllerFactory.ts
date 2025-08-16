import { BaseController } from '../controllers/BaseController';
import { IBaseService } from '../interfaces/IService';

export class ControllerFactory {
  static createController<T>(service: IBaseService<T>, resourceName: string): BaseController<T> {
    return new (class extends BaseController<T> {
      protected getResourceName(): string {
        return resourceName;
      }
    })(service);
  }
}