import { Request, Response } from 'express';
import { AuthRequest, QueryOptions } from '../types';
import { createApiResponse, createPaginatedResponse, handleAsync } from '../utils/response';
import { IBaseService } from '../interfaces/IService';

export abstract class BaseController<T> {
  protected service: IBaseService<T>;

  constructor(service: IBaseService<T>) {
    this.service = service;
  }

  create = handleAsync(async (req: AuthRequest, res: Response) => {
    const data = this.prepareCreateData(req);
    const item = await this.service.create(data);
    
    return res.status(201).json(createApiResponse(true, `${this.getResourceName()} created successfully`, item));
  });

  getAll = handleAsync(async (req: Request, res: Response) => {
    const options = this.buildQueryOptions(req);
    const { data, total } = await this.service.findAll(options);
    
    return res.json(createPaginatedResponse(
      true, 
      `${this.getResourceName()}s retrieved successfully`, 
      data, 
      options.page || 1, 
      options.limit || 10, 
      total
    ));
  });

  getById = handleAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const item = await this.service.findById(id);
    
    if (!item) {
      return res.status(404).json(createApiResponse(false, `${this.getResourceName()} not found`));
    }
    
    return res.json(createApiResponse(true, `${this.getResourceName()} retrieved successfully`, item));
  });

  update = handleAsync(async (req: AuthRequest, res: Response) => {
    const id = req.params.id;
    const data = this.prepareUpdateData(req);
    
    const item = await this.service.update(id, data);
    
    if (!item) {
      return res.status(404).json(createApiResponse(false, `${this.getResourceName()} not found`));
    }
    
    return res.json(createApiResponse(true, `${this.getResourceName()} updated successfully`, item));
  });

  delete = handleAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const deleted = await this.service.delete(id);
    
    if (!deleted) {
      return res.status(404).json(createApiResponse(false, `${this.getResourceName()} not found`));
    }
    
    return res.json(createApiResponse(true, `${this.getResourceName()} deleted successfully`));
  });

  protected buildQueryOptions(req: Request): QueryOptions {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      search,
      ...filters
    } = req.query as any;

    return {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      search,
      filter: this.buildFilters(filters)
    };
  }

  protected buildFilters(queryParams: any): Record<string, any> {
    const filters: Record<string, any> = {};
    
    // Common filters
    if (queryParams.department) filters.department = queryParams.department;
    if (queryParams.subject) filters.subject = queryParams.subject;
    if (queryParams.course) filters.course = queryParams.course;
    if (queryParams.isPublic !== undefined) filters.isPublic = queryParams.isPublic === 'true';
    
    return filters;
  }

  protected prepareCreateData(req: AuthRequest): Partial<T> {
    return req.body;
  }

  protected prepareUpdateData(req: AuthRequest): Partial<T> {
    return req.body;
  }

  protected abstract getResourceName(): string;
}