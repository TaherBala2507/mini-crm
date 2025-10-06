interface SuccessResponse {
  success: true;
  message?: string;
  data?: any;
  meta?: any;
}

interface ErrorResponse {
  success: false;
  message: string;
  code?: string;
  details?: any;
  stack?: string;
}

export class ApiResponse {
  static success(data?: any, message?: string, meta?: any): SuccessResponse {
    return {
      success: true,
      ...(message && { message }),
      ...(data !== undefined && { data }),
      ...(meta && { meta }),
    };
  }

  static error(
    message: string,
    code?: string,
    details?: any,
    stack?: string
  ): ErrorResponse {
    return {
      success: false,
      message,
      ...(code && { code }),
      ...(details && { details }),
      ...(stack && process.env.NODE_ENV === 'development' && { stack }),
    };
  }

  static paginated(
    data: any[],
    page: number,
    pageSize: number,
    total: number,
    totalPages: number,
    message?: string
  ): SuccessResponse {
    const meta = {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return this.success(data, message, meta);
  }
}