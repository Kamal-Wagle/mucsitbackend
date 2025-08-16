import { ApiResponse } from '../types';

export const createApiResponse = <T = any>(
  success: boolean,
  message: string,
  data?: T,
  error?: any
): ApiResponse<T> => {
  const response: ApiResponse<T> = {
    success,
    message
  };

  if (data !== undefined) {
    response.data = data;
  }

  if (error !== undefined) {
    response.error = error;
  }

  return response;
};

export const createPaginatedResponse = <T = any>(
  success: boolean,
  message: string,
  data: T[],
  page: number,
  limit: number,
  total: number
): ApiResponse<T[]> => {
  return {
    success,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

export const handleAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};