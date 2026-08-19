import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: any;
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'object' && exceptionResponse !== null && 'message' in exceptionResponse
          ? (exceptionResponse as any).message
          : exceptionResponse;
    } else {
      message = 'An unexpected error occurred. Please try again later.';
    }

    const apiMessage = Array.isArray(message) ? message[0] : message;

    if (!(exception instanceof HttpException) || status >= 500) {
      // eslint-disable-next-line no-console
      console.error(exception);
    }

    response.status(status).json({
      success: false,
      message: apiMessage,
      data: null,
      error: {
        statusCode: status,
        type: exception.name || 'Error',
        details: Array.isArray(message) ? message : message,
        path: request.url,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
