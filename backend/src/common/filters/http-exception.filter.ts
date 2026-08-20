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
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[];
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        message = (exceptionResponse as { message: string | string[] }).message;
      } else {
        message = JSON.stringify(exceptionResponse);
      }
    } else {
      message = 'An unexpected error occurred. Please try again later.';
    }

    const apiMessage = Array.isArray(message) ? message[0] : message;
    const exceptionName = exception instanceof Error ? exception.name : 'Error';

    if (!(exception instanceof HttpException) || status >= 500) {
      console.error(exception);
    }

    response.status(status).json({
      success: false,
      message: apiMessage,
      data: null,
      error: {
        statusCode: status,
        type: exceptionName,
        details: message,
        path: request.url,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
